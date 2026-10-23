#!/usr/bin/env node
/**
 * 天气×昼夜性能矩阵采集脚本（配合 src/devOnly/perfSweep.ts 使用）
 *
 * 原理：
 * 1. 页面侧 perfSweep.ts 暴露 window.__perfSweep 命令接口（切换天气/昼夜）
 * 2. 本脚本通过 Vite dev server 的模块 URL 触发页面命令？——否。
 *    页面 JS 无法从 dev server 端直接驱动，改用最简单可靠的方式：
 *    本脚本把「场景指令清单」写进 Vite 可访问的 URL，页面侧轮询？
 *    ——都太绕。
 *
 * 实际采用的通道（简单直接）：
 * - 本脚本轮询 GET vite 模块 URL `/src/devOnly/perfSweepCommand.json`？
 *   dev server 只服务磁盘文件——可以！把命令写进一个 JSON 文件，
 *   Vite 会原样返回；页面侧 fetch 该 URL 并带 ?t= 时间戳防缓存。
 * - 页面侧每 1s fetch 命令文件，发现新命令（递增 seq）就执行，
 *   执行完把结果写回 window；本脚本无法读 window……
 *
 * ——最终通道（无浏览器调试协议依赖的双向管道）：
 * - 下行（脚本→页面）：写 JSON 文件到 src/devOnly/sweepCommand.json，
 *   页面轮询 fetch（Vite dev server 直出磁盘文件内容）
 * - 上行（页面→脚本）：页面 fetch 打到本脚本起的 HTTP 服务器
 *   （localhost:39871），POST 结果；脚本收到即采样 ps 并记录
 *
 * 用法：node scripts/perf-sweep.mjs [--settle 6000]
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

// ========== 配置 ==========
const PORT = Number(process.env.PET_PORT || 5173);
const REPORT_PORT = 39871;
const COMMAND_FILE = path.resolve("src/devOnly/sweepCommand.json");
const SETTLE = Number(
  process.argv.find((a) => a.startsWith("--settle"))?.split("=")[1] || 6000,
);

// 场景矩阵：天气 × 昼夜（正午/深夜两个代表点）+ 全天候单测
const WEATHERS = [
  "default",
  "sunny",
  "cloudy",
  "lightRain",
  "heavyRain",
  "thunderstorm",
  "lightSnow",
  "heavySnow",
];
const SCENARIOS = [];
for (const w of WEATHERS) {
  SCENARIOS.push({ weather: w, offsetHours: 0, label: `${w}@当前时刻` });
}
// 关键组合：夜晚的星空/月光 + 雨雪
SCENARIOS.push({ weather: "default", offsetHours: 12, label: "default@深夜" });
SCENARIOS.push({ weather: "cloudy", offsetHours: 12, label: "cloudy@深夜" });
SCENARIOS.push({
  weather: "lightRain",
  offsetHours: 12,
  label: "lightRain@深夜",
});
SCENARIOS.push({
  weather: "heavySnow",
  offsetHours: 12,
  label: "heavySnow@深夜",
});

// ========== 采集 ==========
const results = [];
let scenarioSeq = 0;
let settleMs = SETTLE;

// 上行服务器：页面报告"场景已就绪"，脚本立即采样 CPU
// 注：页面跨源 POST 会先发 OPTIONS 预检，必须显式应答 204，
// 否则预检失败、正式 POST 永远不会发出（首版踩坑点）
const reportServer = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }
  if (req.method === "POST" && req.url === "/scenario-ready") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        const { label } = JSON.parse(body);
        // 等 2s 让 CPU 均值稳定，再采样 3 次取中位
        setTimeout(async () => {
          const samples = [];
          for (let i = 0; i < 3; i++) {
            samples.push(sampleCpu());
            await sleep(2000);
          }
          const med = median(samples);
          results.push({ label, ...med });
          console.log(
            `  [完成] ${label}: 渲染 ${med.renderer.toFixed(1)}% / GPU ${med.gpu.toFixed(1)}%`,
          );
          nextScenario();
        }, 2000);
        res.writeHead(204, { "Access-Control-Allow-Origin": "*" }).end();
      } catch {
        res.writeHead(400).end();
      }
    });
  } else if (req.method === "POST" && req.url === "/done") {
    finish();
    res.writeHead(204, { "Access-Control-Allow-Origin": "*" }).end();
  } else {
    res.writeHead(404).end();
  }
});

function sampleCpu() {
  const out = execSync(
    `ps aux | grep "Electron Helper (Renderer)\\|Electron Helper (GPU)" | grep pet | grep -v grep`,
    { encoding: "utf8" },
  );
  let renderer = 0,
    gpu = 0;
  for (const line of out.trim().split("\n")) {
    const cpu = parseFloat(line.split(/\s+/)[2]);
    if (line.includes("(Renderer)")) renderer = cpu;
    else if (line.includes("(GPU)")) gpu = cpu;
  }
  return { renderer, gpu };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const median = (arr) => {
  const s = [...arr].sort((a, b) => a.renderer - b.renderer);
  return s[Math.floor(s.length / 2)];
};

function nextScenario() {
  scenarioSeq++;
  if (scenarioSeq >= SCENARIOS.length) {
    // 全部完成：写终止命令
    writeCommand({ seq: scenarioSeq, action: "stop" });
    return;
  }
  writeCommand({
    ...SCENARIOS[scenarioSeq],
    seq: scenarioSeq,
    settleMs,
    action: "run",
  });
}

function writeCommand(cmd) {
  fs.writeFileSync(COMMAND_FILE, JSON.stringify(cmd, null, 2));
}

function finish() {
  console.log("\n========== 性能采集结果 ==========");
  console.log("场景                 | 渲染进程 | GPU 进程 | 合计");
  console.log("---------------------|----------|----------|------");
  for (const r of results) {
    const label = r.label.padEnd(20).slice(0, 20);
    console.log(
      `${label} | ${String(r.renderer.toFixed(1)).padStart(6)}%  | ${String(r.gpu.toFixed(1)).padStart(6)}%  | ${(r.renderer + r.gpu).toFixed(1)}%`,
    );
  }
  process.exit(0);
}

// ========== 启动 ==========
async function main() {
  // 健康检查：dev server 必须在线
  try {
    const res = await fetch(`http://localhost:${PORT}/`);
    if (!res.ok) throw new Error(String(res.status));
  } catch (e) {
    console.error(
      `dev server 未就绪 (http://localhost:${PORT}/)：${e.message}`,
    );
    console.error("请先启动 PET_PORT=3000 npm run electron:dev");
    process.exit(1);
  }

  await new Promise((r) => reportServer.listen(REPORT_PORT, r));
  console.log(
    `采集开始：${SCENARIOS.length} 个场景，每场景稳定 ${SETTLE}ms + 采样 6s`,
  );
  console.log(
    `（页面侧需加载 src/devOnly/perfSweep.ts——dev 模式 App.vue 自动导入）\n`,
  );

  // 第一个场景
  writeCommand({ ...SCENARIOS[0], seq: 0, settleMs, action: "run" });
}

main();
