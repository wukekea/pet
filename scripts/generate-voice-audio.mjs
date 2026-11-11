#!/usr/bin/env node
/**
 * 台词音频批量生成 / 覆盖率校验脚本
 *
 * 用法：
 *   node scripts/generate-voice-audio.mjs            # 生成缺失或需要更新的音频
 *   node scripts/generate-voice-audio.mjs --check    # 只做覆盖率校验（不生成）
 *   node scripts/generate-voice-audio.mjs --check --warn-only  # 校验且始终退出码 0（供 prebuild）
 *   node scripts/generate-voice-audio.mjs --dry-run  # 打印将要生成的内容，不调用 TTS
 *
 * 设计要点：
 * - 台词 id 由本目录下的 voice-ledger.json 台账统一分配：文本 → id 的映射，
 *   新增文本分配新 id，文本修改视为新台词分配新 id，旧 id 保留不回收。
 *   id 形如 `<分组前缀>_<序号>`，不依赖数组下标，也不依赖文本 hash。
 * - 已存在且台词生成文本未变化的条目直接跳过（幂等 / 断点续跑）。
 * - 单条失败重试 3 次；失败项汇总；有失败时以非零退出码结束。
 * - 生成同时产出静态清单 src/data/audioManifest.json 供运行时 O(1) 判断。
 * - 覆盖率为缺失项给警告，`--warn-only` 下从不阻塞构建。
 *
 * 依赖：系统已安装 edge-tts（Python 包），脚本本身不引入新的 npm 依赖。
 */
import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const VOICE = "zh-CN-XiaoyiNeural";
const ENGINE = "edge-tts";
const AUDIO_REL_DIR = `audio/${ENGINE}@${VOICE}`;
const AUDIO_DIR = join(ROOT, "public", AUDIO_REL_DIR);
const LEDGER_PATH = join(ROOT, "scripts", "voice-ledger.json");
const MANIFEST_PATH = join(ROOT, "src", "data", "audioManifest.json");
const DATA_MODULE = join(ROOT, "src", "data", "dialogues.ts");

/** 台词分组登记表：决定 id 的分组前缀，也决定扫描范围（顺序稳定） */
const GROUPS = [
  { key: "dialogueMessages", prefix: "state" },
  { key: "weatherDialogues", prefix: "weather" },
  { key: "moodDialogues", prefix: "mood" },
  { key: "dreamTalkMessages", prefix: "dream" },
  { key: "workBusyMessages", prefix: "work_busy" },
  { key: "eatingBusyMessages", prefix: "eat_busy" },
  { key: "bathingBusyMessages", prefix: "bath_busy" },
  { key: "workScheduleEnterMessages", prefix: "work_enter" },
  { key: "workScheduleTooTiredMessages", prefix: "work_tired" },
  { key: "workScheduleExitMessages", prefix: "work_exit" },
  { key: "wishUponStarMessages", prefix: "wish" },
  { key: "greetingMessages", prefix: "greet" },
  { key: "wakeUpGreetingMessages", prefix: "wakeup" },
  { key: "interactionBlockedMessages", prefix: "blocked" },
  { key: "testVoiceMessage", prefix: "test" },
];

/** 生成用文本覆写：键为气泡原文，值为交给 TTS 的替代文本（FR-006） */
const TTS_OVERRIDES = {
  "Zzz...": "嘘嘘嘘",
  "好困...Zzz...": "好困，嘘嘘嘘",
  "Zzz...嗯...": "嘘嘘嘘，嗯",
  "Zzz...别吵...": "嘘嘘嘘，别吵",
  "Zzz...好困...": "嘘嘘嘘，好困",
  "Zzz...再睡会儿...": "嘘嘘嘘，再睡会儿",
  "Zzz...唔...": "嘘嘘嘘，唔",
  "Bug在哪里？": "八哥在哪里？",
  "Git提交一下~": "提交一下代码~",
  "Stack Overflow救我！": "斯塔克欧沃弗洛救我！",
  "Debug到怀疑人生~": "调试到怀疑人生~",
  "NullPointerException！": "空指针异常！",
  "代码review一下~": "代码评审一下~",
  "API对接中...": "接口对接中...",
  "工作ing~": "工作中~",
  "工作专注度100%~": "工作专注度百分之一百~",
};

const RETRY_TIMES = 3;
const CONCURRENCY = 8;

/** 是否含可朗读内容：至少一个字母或数字 */
function hasReadableContent(text) {
  return /[\p{L}\p{N}]/u.test(text);
}

/** 读取台账（不存在则新建空台账） */
function readLedger() {
  if (!existsSync(LEDGER_PATH)) {
    return { version: 1, engine: ENGINE, voice: VOICE, entries: {} };
  }
  return JSON.parse(readFileSync(LEDGER_PATH, "utf8"));
}

/** 写出台账（key 排序，保证 diff 稳定） */
function writeLedger(ledger) {
  const entries = Object.fromEntries(
    Object.keys(ledger.entries)
      .sort()
      .map((k) => [k, ledger.entries[k]]),
  );
  const out = { ...ledger, entries };
  writeFileSync(LEDGER_PATH, JSON.stringify(out, null, 2) + "\n", "utf8");
}

/** 收集全部台词：{ text, group, prefix }，同一文本只保留首次所属分组 */
async function collectLines() {
  const data = await import(pathToFileURL(DATA_MODULE).href);
  const lines = [];
  const seen = new Set();
  for (const group of GROUPS) {
    const value = data[group.key];
    if (value == null) continue;
    const push = (text, subKey) => {
      if (typeof text !== "string" || seen.has(text)) return;
      seen.add(text);
      lines.push({
        text,
        group: subKey ? `${group.key}.${subKey}` : group.key,
        prefix: subKey ? `${group.prefix}_${subKey}` : group.prefix,
      });
    };
    if (typeof value === "string") {
      push(value, null);
    } else if (Array.isArray(value)) {
      for (const text of value) push(text, null);
    } else {
      for (const [subKey, texts] of Object.entries(value)) {
        if (Array.isArray(texts)) for (const text of texts) push(text, subKey);
        else push(texts, subKey);
      }
    }
  }
  return lines;
}

/** 分配 id：台账已有则复用，否则按分组前缀续号 */
function ensureId(ledger, line) {
  const existing = ledger.entries[line.text];
  if (existing) return existing;
  let max = 0;
  const pattern = new RegExp(`^${line.prefix}_(\\d+)$`);
  for (const entry of Object.values(ledger.entries)) {
    const m = pattern.exec(entry.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  const entry = {
    id: `${line.prefix}_${String(max + 1).padStart(3, "0")}`,
    group: line.group,
  };
  ledger.entries[line.text] = entry;
  return entry;
}

/** 生成用文本（含覆写） */
function ttsTextFor(text) {
  return TTS_OVERRIDES[text] ?? text;
}

/**
 * 从 MP3 首帧推导码率，按「音频数据字节数 × 8 / 码率」估算时长（毫秒）。
 * 解析失败时返回 0，运行时将退回音频元数据时长或 3 秒下限。
 */
function estimateDurationMs(file) {
  const buf = readFileSync(file);
  const bitrateTable = [
    [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448],
    [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384],
    [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
  ];
  for (let i = 0; i + 4 < buf.length; i++) {
    if (buf[i] !== 0xff || (buf[i + 1] & 0xe0) !== 0xe0) continue;
    const versionBits = (buf[i + 1] >> 3) & 0x03;
    const layerBits = (buf[i + 1] >> 1) & 0x03;
    if (layerBits !== 0x01 || versionBits === 0x01) continue;
    const bitrateIndex = (buf[i + 2] >> 4) & 0x0f;
    if (bitrateIndex === 0 || bitrateIndex === 0x0f) continue;
    const table = versionBits === 0x03 ? bitrateTable[0] : bitrateTable[1];
    const kbps = table[bitrateIndex];
    if (!kbps) continue;
    const bytes = statSync(file).size;
    return Math.round((bytes * 8 * 1000) / (kbps * 1000));
  }
  return 0;
}

/** 调用 edge-tts 生成一条音频，返回 Promise<void>，失败抛出 */
function synthesize(ttsText, outputFile) {
  return new Promise((resolve, reject) => {
    const args = [
      "--voice",
      VOICE,
      "--text",
      ttsText,
      "--write-media",
      outputFile,
    ];
    const child = spawn("edge-tts", args, {
      stdio: ["ignore", "ignore", "pipe"],
    });
    let stderr = "";
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (
        code === 0 &&
        existsSync(outputFile) &&
        statSync(outputFile).size > 0
      ) {
        resolve();
      } else {
        reject(
          new Error(`edge-tts 退出码 ${code}: ${stderr.trim().slice(-300)}`),
        );
      }
    });
  });
}

/** 带重试的生成 */
async function synthesizeWithRetry(ttsText, outputFile) {
  let lastError;
  for (let attempt = 1; attempt <= RETRY_TIMES; attempt++) {
    try {
      await synthesize(ttsText, outputFile);
      return attempt;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

function parseArgs(argv) {
  return {
    check: argv.includes("--check"),
    warnOnly: argv.includes("--warn-only"),
    dryRun: argv.includes("--dry-run"),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const ledger = readLedger();
  const lines = await collectLines();
  mkdirSync(AUDIO_DIR, { recursive: true });

  const toGenerate = [];
  const missing = [];
  const exempt = [];
  const upToDate = [];

  for (const line of lines) {
    if (!hasReadableContent(line.text)) {
      exempt.push(line);
      continue;
    }
    const entry = ensureId(ledger, line);
    const file = join(AUDIO_DIR, `${entry.id}.mp3`);
    const ttsText = ttsTextFor(line.text);
    const entryTtsChanged = entry.ttsText !== ttsText;
    entry.ttsText = ttsText;
    entry.group = line.group;
    const fileExists = existsSync(file) && statSync(file).size > 0;
    if (!fileExists || entryTtsChanged) {
      toGenerate.push({ ...line, entry, file, ttsText });
      missing.push(line);
    } else {
      upToDate.push(line);
    }
  }

  const failures = [];
  if (!args.check && !args.dryRun) {
    let done = 0;
    let cursor = 0;
    // 并发池：edge-tts 单次往返网络耗时较长，串行生成全量过慢
    const worker = async () => {
      while (cursor < toGenerate.length) {
        const item = toGenerate[cursor++];
        try {
          await synthesizeWithRetry(item.ttsText, item.file);
          item.entry.durationMs = estimateDurationMs(item.file);
          done++;
          process.stdout.write(
            `\r已生成 ${done}/${toGenerate.length}  ${item.entry.id}   `,
          );
        } catch (error) {
          failures.push({
            id: item.entry.id,
            text: item.text,
            error: String(error.message ?? error),
          });
        }
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, toGenerate.length) }, worker),
    );
    if (toGenerate.length > 0) process.stdout.write("\n");
    writeLedger(ledger);
  } else if (args.dryRun) {
    for (const item of toGenerate) {
      console.log(
        `[dry-run] ${item.entry.id}  ${JSON.stringify(item.text)} → ${JSON.stringify(item.ttsText)}`,
      );
    }
    writeLedger(ledger);
  }

  // 清单：只有真正存在音频文件的条目才进入运行时清单
  const manifestLines = {};
  for (const line of lines) {
    if (!hasReadableContent(line.text)) continue;
    const entry = ledger.entries[line.text];
    const file = join(AUDIO_DIR, `${entry.id}.mp3`);
    if (!existsSync(file) || statSync(file).size === 0) continue;
    manifestLines[line.text] = {
      id: entry.id,
      durationMs: entry.durationMs ?? estimateDurationMs(file),
    };
  }
  const manifest = {
    engine: ENGINE,
    voice: VOICE,
    dir: AUDIO_REL_DIR,
    lines: manifestLines,
  };
  if (!args.check && !args.dryRun) {
    writeFileSync(
      MANIFEST_PATH,
      JSON.stringify(manifest, null, 2) + "\n",
      "utf8",
    );
  }

  // 覆盖率报告
  const total = lines.length;
  const covered = Object.keys(manifestLines).length;
  const missingCount = missing.filter(
    (line) => !manifestLines[line.text],
  ).length;
  console.log("");
  console.log(`台词总数: ${total}`);
  console.log(`已生成音频: ${covered}`);
  console.log(`缺失: ${missingCount}`);
  console.log(
    `已豁免(无可朗读内容): ${exempt.length}${exempt.length ? " → " + exempt.map((l) => l.text).join("、") : ""}`,
  );
  const coverage =
    total === 0 ? 100 : ((covered + exempt.length) / total) * 100;
  console.log(`覆盖率(含豁免): ${coverage.toFixed(2)}%`);

  if (failures.length > 0) {
    console.error("\n以下条目生成失败:");
    for (const f of failures)
      console.error(`  ${f.id}  ${JSON.stringify(f.text)}  ${f.error}`);
    process.exitCode = 1;
  }
  if (missingCount > 0 && !args.check) {
    console.warn(
      `\n⚠ 仍有 ${missingCount} 条台词缺少音频，请重新运行生成脚本。`,
    );
    if (!args.warnOnly) process.exitCode = 1;
  } else if (missingCount > 0 && args.check) {
    console.warn(
      `\n⚠ 覆盖率不足：${missingCount} 条台词缺少音频（不阻塞构建）。`,
    );
    if (!args.warnOnly) process.exitCode = 0;
  }
  if (args.check) {
    console.log(
      `\n覆盖率校验完成：台账 ${Object.keys(ledger.entries).length} 条，清单 ${relative(ROOT, MANIFEST_PATH)}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
