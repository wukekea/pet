import { setWeather } from "@/components/DesktopPet/composables/weatherState";
import { setTimeOffset } from "@/components/DesktopPet/composables/dayNightState";
import type { WeatherType } from "@/components/DesktopPet/types";

/**
 * 性能采集控制器（仅 dev 环境加载，见 App.vue 的条件导入）
 *
 * 与 scripts/perf-sweep.mjs 组成双向管道：
 * - 下行（脚本→页面）：脚本把场景命令写入 src/devOnly/sweepCommand.json，
 *   Vite dev server 直出磁盘文件；本模块每秒 fetch 该 URL（?t= 防缓存）
 *   发现新 seq 即执行（切天气/昼夜偏移）
 * - 上行（页面→脚本）：场景稳定后 POST 到脚本的 HTTP 服务器
 *   （localhost:39871 /scenario-ready），脚本收到即采样 ps CPU
 *
 * 防重入：轮询守卫挂 window——HMR 热更新会重新执行本模块，模块级
 * 变量在新实例里是新值，会注册出多条并存循环（同一命令被执行/
 * 上报多次，打乱脚本的场景计数）。热更新实例直接抛错终止自身。
 *
 * 用完即走：本模块只在 dev 构建存在，生产不打包。
 */

interface SweepCommand {
  seq: number;
  action: "run" | "stop";
  weather?: WeatherType;
  offsetHours?: number;
  label?: string;
  settleMs?: number;
}

const COMMAND_URL = "/src/devOnly/sweepCommand.json";
const REPORT_URL = "http://localhost:39871";

// 防重入与实例接管：轮询世代号挂 window。HMR 热更新会重新执行本模块，
// 旧实例的 pollLoop 还在跑（throw 无法停掉已经启动的循环）——新实例
// 递增世代号，旧循环发现世代落后即自行退出，全局任何时刻只有一条循环
const w = window as unknown as { __perfSweepGeneration?: number };
const generation = (w.__perfSweepGeneration ?? 0) + 1;
w.__perfSweepGeneration = generation;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function pollLoop() {
  let lastSeq = -1;
  let lastAction = "";
  // 心跳探针：从 vite 服务器可直接 fetch 本模块的编译产物（?probe= 参数
  // 会改变 URL 让 Vite 重新转译，转译时读取的模块源码里含此调用）——
  // 不行，那只能看到静态代码。改为：循环启动即上报脚本端口（脚本未启动
  // 时静默失败），便于从外部观测循环是否存活
  await fetch(`${REPORT_URL}/loop-alive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ generation, at: Date.now() }),
  }).catch(() => {});
  // eslint-disable-next-line no-constant-condition
  while (w.__perfSweepGeneration === generation) {
    try {
      const res = await fetch(`${COMMAND_URL}?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const cmd: SweepCommand = await res.json();
        if (cmd.seq !== lastSeq || cmd.action !== lastAction) {
          lastSeq = cmd.seq;
          lastAction = cmd.action;
          await handleCommand(cmd);
        }
      }
    } catch {
      // 采集脚本未启动 / 命令文件不存在：静默跳过，下轮再试
    }
    await sleep(1000);
  }
  console.info(`[perf-sweep] 世代 ${generation} 循环已被接管，退出`);
}

async function handleCommand(cmd: SweepCommand) {
  if (cmd.action === "run" && cmd.weather !== undefined) {
    console.info(
      `[perf-sweep] 场景 ${cmd.label}（${cmd.weather}, offset ${cmd.offsetHours}h）`,
    );
    setWeather(cmd.weather);
    setTimeOffset(cmd.offsetHours ?? 0);
    // 稳定期：动画与粒子进入稳态（切换过渡 <3s，留足余量）
    await sleep(cmd.settleMs ?? 6000);
    // 上报前再查世代：稳定期内可能已被 HMR 新实例接管，被接管的
    // 旧循环不得上报（否则脚本收到多次同一场景，计数错乱）
    if (w.__perfSweepGeneration !== generation) {
      console.info(`[perf-sweep] 世代 ${generation} 已被接管，放弃上报`);
      return;
    }
    // 通知脚本：本场景已就绪，可以采样
    await fetch(`${REPORT_URL}/scenario-ready`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: cmd.label }),
    }).catch(() => {
      // 脚本已退出：忽略
    });
  } else if (cmd.action === "stop") {
    console.info("[perf-sweep] 全部场景完成");
    await fetch(`${REPORT_URL}/done`, { method: "POST" }).catch(() => {});
  }
}

// dev 下立即开始轮询（命令文件不存在时 fetch 404 静默忽略）
pollLoop();

export {};
