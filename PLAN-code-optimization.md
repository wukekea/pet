# 代码优化计划（2026-10 代码审查）

## 背景

项目经过多轮需求迭代与重构（useModal 单源化、changeState 统一入口、STORAGE_KEYS 集中登记、BaseModal/usePanelTheme/useToast 抽取等），基础架构已较为健康。本文档记录 2026-10 全量代码审查的发现与优化计划，作为后续重构的执行依据。

审查范围：src/ 全部 + electron/ 全部（167 个文件，约 34700 行），`vue-tsc` 类型检查通过（exit 0）。

## 总体优先级

1. **P0 — Bug 修复**：用户可感知的功能性问题，尽快修
2. **P1 — 死代码清理**：零风险，立减约 700 行 + 减小安装包
3. **P2 — effects/ 特效收敛**：投入产出比最高的重构，约可删 3000+ 行
4. **P3 — 存储层统一与语音设置单源化**
5. **P4 — 结构性重构**：shapes 骨架化、attributes 面板拆分、安全加固（锦上添花）

---

## P0：Bug 修复 ✅ 已完成（2026-10-14）

修复前逐项验证了每个 bug 的真实性（确认全部成立），修复后 `vue-tsc` 与 electron 文件 `node --check` 均通过。各条目下方为修复说明。

### P0-1 中文输入法回车误发送

- 位置：`src/components/DesktopPet/ChatPanel/index.vue:432`
- 问题：`@keydown.enter.prevent="handleSend"` 未检查 `e.isComposing`。中文输入法选词时按回车确认候选词，会把未完成的拼音串直接当消息发送。
- 修复 ✅：新增 `onEnterKey` 判断 `e.isComposing`，合成中不触发发送。

### P0-2 Edge TTS 无法停止播放

- 位置：`electron/edgeTTS.js:241, 285-291`
- 问题：`stop()` 只 kill 了 edge-tts 合成进程，`playAudio()` 里 spawn 的播放器进程（afplay/ffplay）是局部变量，从未被跟踪和 kill。切换语音时新旧音频重叠播放。
- 修复 ✅：`playAudio` 将播放器进程保存到 `this.playerProcess`，`stop()` 一并 kill；close 回调对 `code === null`（被 kill）不视为错误。

### P0-3 Whisper 录音失败导致 IPC 永久挂起

- 位置：`electron/whisperRecognizer.js:134-141`
- 问题：`startRecording` 用 100ms 定时器 + `!process.killed` 判定成功，未验证 sox 真正开始录音。若 sox 提前退出，`stopRecording()` 里注册的 `close` 监听永不回调，渲染进程 `await` 永久 pending。
- 修复 ✅：改为监听进程 `close` 事件判定启动成败（100ms 内退出即失败，且清理临时文件）；`stopRecording` 捕获局部进程引用，close 监听不再依赖 `this.recordingProcess` 在监听期间不被置空；抽取 `cleanupAudioFile` 统一清理。

### P0-4 voiceEnabled 设置加载不对称

- 位置：`src/components/DesktopPet/composables/settings.ts:138-143`
- 问题：`loadSettings` 中只处理"设置开但系统关"的分支，"设置关但系统开"时不处理，加载后状态不一致（`updateSetting` 是对称的）。
- 修复 ✅：补齐对称分支（`toggleSpeech()` 双向对齐，与 `updateSetting` 逻辑一致）。

### P0-5 startScheduleMonitor 重复调用导致 interval 泄漏

- 位置：`src/components/DesktopPet/composables/scheduleManager.ts:42, 287`
- 问题：`updateScheduleConfig` 在已启用时直接再调 `startScheduleMonitor()`，后者无"已在运行"守卫、也不先清旧 timer——每次保存作息配置就多挂一个每分钟 interval。
- 修复 ✅：`startScheduleMonitor` 开头检测到已运行时先调 `stopScheduleMonitor` 清理旧 interval。

### P0-6 宠物尺寸设置与逻辑层脱节

- 位置：`settings.ts:107`（`petSizePixels` 仅影响 CSS `--pet-size`）
- 问题：碰撞/边界/追逐/脚印全部用固定 `PET_SIZE = 80`（`petController.ts:110-114, 135, 501-502`；`footprints.ts:68-69`）。用户调整宠物大小后，鼠标命中区域、活动边界、脚印落点全部错位。
- 修复 ✅：逻辑层统一改读响应式 `petSizePixels`（命中检测/随机位置/chase/拖拽边界/resize 边界/脚印落点），`PET_SIZE` 常量已删除（settings.ts 的 `petSizePixels` 成为唯一尺寸真相）。

### P0-7 拖拽恢复打工状态时收入结算偏差（中优先级，并入 P0）

- 位置：`petController.ts:745-747`
- 问题：`handleDragEnd` 用 `STATE_DURATIONS[stateBeforeDrag]` 原始时长调 `adjustWorkStartTime`，未算装饰的时长缩减倍率（`changeState` 里是 `effectiveDuration`）。拖拽后 `workStartTime` 被回拨得偏早，每分钟结算可能提前多发工资。
- 修复 ✅：恢复时应用 `getWorkDurationMultiplier()` 计算实际总时长，与 `changeState` 进入打工时的 `effectiveDuration` 保持一致。

### P0-8 其余中低优先级 Bug（一并列入）✅ 全部修复

| #   | 位置                              | 问题                                                                                                                                                      | 修复结果                                                                                                                                                                                                                        |
| --- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| a   | `electron/updater-ipc.js:358`     | 静默更新 `update-available` 事件无任何监听者，结果被丢弃；`main.js:115-119` 传窗口值拷贝而非 `getWindow()` 回调，窗口销毁后抛 "Object has been destroyed" | ✅ `checkForUpdateSilent` 改为 `getWindow()` 回调模式，main.js 传 `() => mainWindow`；静默检查内部去重（复用 `compareVersions`/`getPlatformAssetUrl`）。事件监听者接入属于 P4-6 范畴（需设计提示 UI），本次先保证发送侧不再崩溃 |
| b   | `electron/updater-ipc.js:261`     | Windows 安装目录 `dirname(dirname(execPath))` 多包一层，NSIS 布局下 dirname 一次即安装目录                                                                | ✅ 修正为 dirname 一次，附注释说明与 macOS 的区别                                                                                                                                                                               |
| c   | `ChatPanel/index.vue:168-174`     | 关闭聊天面板不停录音，麦克风持续占用；`onUnmounted` 永不触发（组件常驻）                                                                                  | ✅ `watch(isChatPanelOpen)` 关闭分支调 `cleanupNativeRecorder()`                                                                                                                                                                |
| d   | `electron/updater-ipc.js:144-170` | 下载写流无背压（不等 drain）、错误不中断循环、`error` 监听在 `end()` 后才注册                                                                             | ✅ 循环中处理 write 返回值等待 drain；`error` 监听在写入前注册，race finish/error，出错中断并抛出                                                                                                                               |
| e   | `attributeStorage.ts:117`         | 默认值浅拷贝，`foodInventory` 等嵌套对象与模块级常量共享引用                                                                                              | ✅ `loadAttributeData`/`resetAttributeData` 均改用 `structuredClone`                                                                                                                                                            |
| f   | `ChatPanel/index.vue:94-95`       | 错误路径 pop 后 push 回同一内容，无效操作且有竞争风险；LLM 错误提示无自动清除（语音错误有）                                                               | ✅ 删除无效 pop/push，保留用户消息；补 5s 自动清除                                                                                                                                                                              |
| g   | `settings/ApiPanel.vue:207`       | 保存按钮 `background: borderColor` 用错变量，按钮近乎透明                                                                                                 | ✅ 删除内联 style，shared.css 中补主色背景 `#f5a623` 与 hover 色                                                                                                                                                                |
| h   | `schedule/index.vue:129-143`      | 时间槽无校验：可保存 start==end 空槽与重叠槽，无提示                                                                                                      | ✅ 保存前校验 start==end 空槽并 Toast 提示（重叠槽暂不拦截，提示即可）                                                                                                                                                          |
| i   | `attributes.ts:668, 712`          | 最后一分钟收入与完工奖先后写 `coinGainAmount` 互相覆盖                                                                                                    | ✅ 引入 `pendingCoinGain` 累加器，完工时合并展示；`resetWorkState` 一并清零                                                                                                                                                     |
| j   | `QuickActionPanel.vue:60`         | `isMouseOnPanel` 依赖 `mousePosition`，但 petController 只在 chase 状态更新它，读到旧坐标                                                                 | ✅ petController 的 `handleMouseMove` 改为始终更新 `mousePosition`（穿透窗口有 `forward: true`，事件不丢，无性能顾虑），并加注释说明                                                                                            |
| k   | `electron/main.js`                | 无 `app.requestSingleInstanceLock()`，双开时两只宠物写同一存档互相覆盖                                                                                    | ✅ 加单实例锁 + `second-instance` 聚焦已有窗口                                                                                                                                                                                  |

---

## P1：死代码清理（零风险）✅ 已完成（2026-10-14）

以下全部清理完毕（净删 653 行，`vue-tsc` 通过；注：`npm run lint` 因项目缺少 eslint 配置文件本身不可用，与本次清理无关）：

| 位置                                         | 说明                                                                                                            |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `composables/speechRecognition.ts`（144 行） | 全项目 0 import，与 nativeSpeechRecognition 导出同名 `isRecording`，误引入会状态串台                            |
| `composables/mediaRecorder.ts`（175 行）     | 0 import                                                                                                        |
| `electron/speechRecognition.js`              | `setupSpeechRecognitionIPC` 未被 main.js 调用，与 whisperRecognizer 大段重复                                    |
| `launchController.ts` `cancelCharging`       | 0 调用，已删除                                                                                                  |
| `stats.ts` `recordDoubleClick`               | 0 调用，连带删除 `types.ts`/`statsStorage.ts` 中的 `doubleClick` 字段与 `constants.ts` 中仅它使用的健康阈值常量 |
| `attributes.ts` `getHealthStatus`            | 0 调用，已删除                                                                                                  |
| `settings.ts` `syncSpeechSettings`           | 0 调用，连带清理未使用导入（speechEngine/speechRate/speechPitch/speechVolume）                                  |
| `DesktopPet/index.vue` 重复 import           | 与 101 行重复的 `import "./shapes/base.css"` 已删除                                                             |
| `petController.ts` `handlePetDoubleClick`    | 空函数已删除，index.vue 的双击处理直接内联面板逻辑                                                              |
| `electron/main.js`                           | `execFileSync, spawn, fs` 未使用导入已删除                                                                      |
| `package.json` 依赖                          | `@anthropic-ai/sdk`、`edge-tts`、`node-record-lpcm16` 已移除（共卸载 8 个包）                                   |
| `effects/ParticleField.vue`                  | 0 使用（P2 中要么用起来要么删掉，暂留）                                                                         |

console.log 调试残留已清理：`ChatPanel/index.vue`（4 处）、`nativeSpeechRecognition.ts`（2 处）、`qweatherStorage.ts`（3 处）、`llmService.ts:309`（完整 LLM 响应打进生产日志）。保留的都是 `console.error`（失败场景有必要留）。

---

## P2：effects/ 特效收敛（收益最大）

现状：约 8200 行、29 个特效组件，新旧两种风格并存。

### P2-1 激活已有抽象基础设施 ✅ 已完成（2026-10-14）

- `effects/shared.css` 已定义参数化 keyframes（`fx-twinkle`/`fx-float-up`/`fx-pop` 等）和 `.effect-layer`/`.effect-badge` 工具类，但全目录只有 1 个文件引用。
- 执行结果：29 个组件根容器收敛——19 个到 `effect-layer`（覆盖型层）、10 个到 `effect-badge`（角标型）；SwingEffect/WorkProgressBar（`pointer-events: auto` 可交互）与 ParticleField 判定不适用，保持原状。
- keyframes 替换 6 处（ConfusedEffects 的 star-twinkle、ShyEffects 的 twinkle-shine、SmugEffects 的 sparkle-shine、ThinkingEffects 的 sparkle-twinkle → `fx-twinkle`；BrickCarryingEffects 的 note-float → `fx-note-float`、sparkle-pop → `fx-pop`）。ConfusedEffects 通过 `--fx-show-opacity: 0.7; --fx-show-scale: 1` 保持原视觉。
- 判定不等价而保留（严格执行"不确定一律保留"）：HappyEffects/DizzyEffects 的 star-twinkle（drop-shadow 滤镜动画）、EatingEffects 的 heart-float-up（含旋转与起点偏移）、HappyEffects 的 float-up（非线性两段位移）、ShyEffects 的 heart-float（起点偏移）、SleepBubble 的 float-up（往返浮动）、ScaredEffects 的 sweat-drip、EmbarrassedEffects 的汗滴系列、CoinGainEffects 的 sparkle-pop（4 段带旋转）。
- 净删 107 行，`vue-tsc` 通过。

### P2-2 粒子类组件收敛为配置驱动

- "配置数组 + v-for + `--fx-delay` 变量"模式已在 12 个组件中同构（Shy/Celebrate/Dizzy/Angry/Flyer/Smug/Scared/Confused/Thinking/Celebrate 等）。
- 行动：基于（或扩展）`ParticleField.vue` 做通用 `EffectParticles` 组件，九个粒子类组件缩为"一份配置数组 + 若干独有道具"，每个文件预计从 250-350 行缩到 60-120 行。
- 预计目录总量减 40-50%（约 3000+ 行）。

### P2-3 极简徽章组件合并 ✅ 已完成（2026-10-14）

- 9 个结构一致的极简组件（Hello/Grin/Peek/Sneeze/Scratch/Sleepy/Yawn/Stretch/Sleepwalking，各 33-50 行）合并为 `BadgeEffect.vue`（props: content/subText/position/fontSize/color/animation）+ 内置 `fx-badge-*` 动画库（wave/float/float-scale/bounce/puff/sparkle）。
- `effectsMap.ts` 拆为 BADGE_EFFECTS（h() 内联配置）与 COMPLEX_EFFECTS 两张表；徽章类返回渲染函数，`<component :is>` 兼容函数组件。
- 净删 286 行（9 组件 ~370 行 → BadgeEffect ~140 行 + 配置）。`vue-tsc` 通过。

### P2-4 其他

- `ProgrammerEffects.vue`（1058 行）✅ 已完成（2026-10-14）：手写两遍的 18 行代码模板（每行 8-10 个手工着色 span，~300 行）改为 `CODE_LINES` token 配置数组 + `scrollLines`（内容渲染两遍实现无缝滚动），v-for 生成。净删 2 行但消除了"改一行代码要同步两处"的维护负担；`code-scroll-up` 动画的 -50% 位移依赖内容恰好两遍，行为不变。`vue-tsc` 通过。
- 补齐 icons/ 抽取：EmbarrassedEffects 的汗滴（与 icons/SweatDropSvg 重叠）、ThinkingEffects 的三尺寸气泡（只差半径，参数化）、AngryEffects 的火焰/锯齿。（待做，可与 P2-2 一起）

### 建议执行顺序

P2-1（纯删除）→ P2-3（低风险）→ P2-4 → P2-2（最大重构放最后）。

---

## P3：存储层统一与语音设置单源化

### P3-1 localStorage 收敛到 createLocalStorage

统一工具 `utils/storage.ts` 的 `createLocalStorage` 只被 3/7 个存储模块使用，以下模块手写读写与迁移逻辑，需收敛：

- `attributeStorage.ts:67-110`（45 行手写字段兼容 if 链，正是 validate 参数要解决的问题）
- `qweatherStorage.ts`（全文手写）
- `petShapeStorage.ts`（手写，已有 `in PET_SHAPES` 校验逻辑可平移）
- `settings.ts:124-159`（手写，仅剔除旧 `apiConfig` 字段）
- `sharedState.ts:156-169`（llmConfig 手写加载）
- `ChatPanel/index.vue:21-34`（chatHistory 写在组件内，无验证）

### P3-2 语音设置单一数据源

现状三处存储/三重同步：`speech.ts` 存 `pet-speech-settings`，`settings.ts` 又存 `voiceEnabled`，`settings/index.vue:29-33` 的 watch 与 `settings.ts:226` 的 `syncSpeechSettings`（死代码，P1 已删）重复同一同步逻辑。

行动：语音开关以 `speech.ts` 为唯一真相，`pet-settings.voiceEnabled` 仅作 UI 映射或彻底移除。

### P3-3 settings.ts 修整

- `initSettings` 的 deep watch 自动保存与 `updateSetting` 手动 `saveSettings()` 双重保存，去掉手动调用。
- `saveSettings` 里 `JSON.parse(JSON.stringify(...))` 无意义往返拷贝，删除。
- `loadSettings` 中调用 `toggleSpeech()` 的副作用与加载未分离（配合 P0-4 一起理顺）。

### P3-4 主题双格式迁移代码收敛

`theme.ts:61-88` 手写解析 `pet-settings` JSON 提取 theme，与 `settings.ts` 加载逻辑平行；主题真相分散在 `pet-theme-mode`（旧）与 `pet-settings.theme`（新）。行动：theme.ts 从 settings 模块读取，删除 30 行兼容代码（旧 key 迁移保留一次性判断）。

---

## P4：结构性重构（可分批做）

### P4-1 shapes/ 模板骨架化

- 8 个 Shape.vue 模板 85-95% 逐字相同（props、眨眼块、四态嘴巴、眼泪、腮红、手臂、腿、装饰层全部一致，只差 0-3 个物种特征块）。
- 行动：抽 `PetBodySkeleton.vue` + 特征配置（`features: { whiskers?, nose?, tongue?, eyePatches? }` 或具名 slot），8 个 Shape.vue 各剩 ~20 行配置，模板层 ~720 行减到 ~200 行。
- CSS 慎动：base.css 分层本身是好的，物种 CSS 属美术资产，仅统一"背面隐藏特征"的 `.pet-back` 规则进 base.css、用镜像变量消掉 left/right 对称块。

### P4-2 attributes/index.vue 拆分（1383 行）

已天然分为五个区块，拆为子组件：等级/经验区（模板 306-331）、属性条+规则提示（334-375）、我的形态（386-415）、装饰+效果汇总（418-472）、打工区（475-545）。同时消除模板里 15+ 处 `item!.type` 非空断言（通过类型收窄）。

### P4-3 弹窗面板样板收敛

- `schedule/index.vue:29-97`、`stats/index.vue`、`ChatPanel/index.vue:176-214`、`settings/index.vue:43-112` 各自手写主题三元列表，未用已有 `usePanelTheme`（部分变量完全同值）。
- `shop/index.vue:75-107` 与 `warehouse/index.vue:73-101` 的 food/bath 物品映射（含 `+${restore}饱腹` 文案拼接）大段重复，抽 `buildFoodItem/buildBathItem` 公共工厂；两者 `usePanelTheme` 调用参数逐字相同，提为 `useShopTheme()`。
- `formatPercent` 在 BehaviorPanel/VoicePanel/AppearancePanel 三处重复，收敛。
- 设置面板 6 个 Panel 的 `textColor/textMuted/borderColor` props 钻透与 CSS 变量双机制并存，统一为 CSS 变量或 provide/inject。

### P4-4 LLM 配置单入口

`ChatPanel` 齿轮设置与 `settings/ApiPanel` 编辑同一份配置，分别走 `saveConfig()` 与 `saveApiConfig()` 两条持久化路径。行动：统一走 `saveApiConfig`，ChatPanel 面板仅作快捷编辑入口。

### P4-5 DebugPanel 拆分（2170 行，DEV-only 不删）

- 按 Tab 拆 `DebugStateTab/DebugItemTab/DebugEnvTab` + 面板壳（拖拽/快捷键/穿透/Transition），index.vue 剩 ~100 行组装。
- 1502 行 CSS 中 50+ 处 `.dark-mode` 双写，统一 `--dbg-*` 变量表；合并三套相似卡片按钮实现。预计 style 降到 ~700-800 行。
- `DebugPanel/index.vue:308-312` 的 `watch(petState)` 随机选食物属职责泄漏，移回 DesktopPet 侧或由调用方传食物。

### P4-6 安全加固

- `main.js:143-179` 天气/定位 IPC 的 `apiHost` 直接拼 URL，缺 `fetch-llm` 那样的 SSRF 白名单校验（三组 IPC 策略不一致）；`isAllowedLLMUrl` 本身补拦 `169.254.*` 与 `0.0.0.0`。
- 所有主进程 fetch（GitHub API、天气、LLM）加超时（AbortController），避免 IPC 永久 pending。
- 三把 apiKey（LLM/和风/高德）明文存 localStorage：可接受权衡，可选迁移到 Electron `safeStorage`。

### P4-7 updater-ipc 去重

- `compareVersions`（48-59 vs 324-334）、`getPlatformAssetUrl`（21-45 vs 338-357）、GitHub release fetch（74-89 vs 309-320）三处重复，静默检查复用 setupUpdaterIPC 内函数。

---

## 明确不动的部分

- **foods/ 目录**：FoodItem.vue 的"分发器 + 播放器"架构是对的（8 个 Food 组件是被它动态渲染的纯 CSS 画笔，不存在"该用没用"），仅可抽 `.food-shine` 公共 class（收益 ~100 行，低优先级）。
- **DebugPanel 不删除**：DEV-only + 已数据驱动，生产构建被 tree-shake，不构成包体积问题。
- **物种 CSS 全量配置化**：投入产出比低，不推荐。

## 执行建议

P0 按表中顺序逐项修复（每项独立可验证）；P1 一次性提交；P2 按 P2-1 → P2-3 → P2-4 → P2-2 分四批；P3/P4 可穿插在功能迭代间隙分批完成。每批完成后运行 `npm run lint` + `vue-tsc --noEmit` + 手动冒烟（拖拽/打工/发射/秋千/聊天语音链路）。
