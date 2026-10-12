# 代码优化重构计划

> 创建日期：2026-10-12
> 来源：对全项目的代码质量分析（特效组件、面板组件、整体架构三个维度）
> 状态标记：`[ ]` 未开始 / `[~]` 进行中 / `[x]` 已完成 / `[-]` 放弃

## 背景

对渲染层约 4.3 万行代码（集中在 `src/components/DesktopPet/`）的全面分析发现：

- 项目已有不少良好的抽象（`useModal.ts`、`utils/storage.ts` 工厂、`effectsMap.ts`、
  preload 白名单 API、`buyToInventory` 泛型封装、`edgeTTS-ipc.js` 模块化 IPC），
  **但这些模式都只覆盖了一半场景，另一半各自手写**。
- 估算约 **4300-5300 行** 模式化重复代码可消除（面板层 ~1800 行 + 特效层 ~2500-3500 行）。
- 架构层面存在全局单例状态、状态机无统一入口、循环依赖等结构性债务。
- 发现一处疑似功能性 bug（设置面板 API 配置死路径）。

## 优先级总览

| 优先级 | 类别           | 条目数 | 说明             |
| ------ | -------------- | ------ | ---------------- |
| P0     | 功能性 bug     | 1 项   | 用户可感知，先修 |
| P1     | 架构性债务     | 3 项   | 影响后续所有开发 |
| P2     | 重复代码抽取   | 2 大块 | 面板层 + 特效层  |
| P3     | 文件位置与收尾 | 6 项   | 低风险整理       |

---

## P0 — 功能性 Bug

### 1. [x] 修复设置面板 API 配置死路径

**改动记录（已完成，采用"接通"方案，天气/定位重启生效）**：

- `qweatherStorage.ts`：新增 `saveApiKey` / `saveApiHost` / `saveAmapKey` 写入函数；
  `loadAmapKey` 从"仅环境变量"改为"localStorage > 环境变量"；host 保存时自动
  去除协议前缀归一化
- `settings.ts`：`PetSettings` 移除 `apiConfig` 字段（不再持久化到 pet-settings，
  消除双源真相）；新增独立的 `ApiConfig` 接口 + `loadApiConfig()` / `saveApiConfig()`
  ——读取时从 qweatherStorage/llmConfig 汇总，保存时写回各真实存储；旧版本存在
  pet-settings 里的死 apiConfig 在加载时剔除；顺带清理了 5 处调试 console.log
- `settings/index.vue`：API 页改为独立的 `apiConfig` ref + 显式"保存 API 配置"
  按钮（不再依赖 settings 的深度 watch 自动保存）；AI 请求格式选项从
  openai/anthropic/gemini/custom 收敛为实际支持的 openai/weibo
- `ChatPanel/index.vue`：确认齿轮面板与设置面板读写同一份 `llmConfig`（AI 配置
  立即生效，因 llmService 每次请求都读 `llmConfig.value`）
- 天气/高德配置**重启应用后生效**（天气服务在启动时读一次 key），UI 已提示

**问题**：`settings/index.vue:1212-1226` 让用户填写和风天气 key/host（存入
`pet-settings` 的 `apiConfig`），但天气服务实际读取的是
`composables/qweatherStorage.ts:10-11` 的 `qweather-api-key` / `qweather-api-host`
两个独立 key。**用户在设置面板填的天气配置根本不生效。**

AI 配置更乱，存在三套互不同步的配置：

| 配置                           | 位置                                                    | 字段                                                                    |
| ------------------------------ | ------------------------------------------------------- | ----------------------------------------------------------------------- |
| settings API 页 `apiConfig.ai` | `settings/index.vue:1290-1334`                          | `url` / `format`（openai/anthropic/gemini/custom）                      |
| 聊天实际用的 `llmConfig`       | `sharedState.ts:151-169`，localStorage key `llm-config` | `baseURL` / `requestFormat`（openai/weibo）                             |
| ChatPanel 自带面板             | `ChatPanel/index.vue:44-57`                             | 第三套独立表单，直接 `localStorage.setItem("llm-config", ...)` 绕过封装 |

**方案**（二选一）：

- [ ] 将 settings 的 API 页改为直接读写 `qweatherStorage` / `llmConfig`，统一字段命名
- [ ] 或删除 settings 的 API 页，由 ChatPanel / 天气模块各自承担配置入口

**验收**：用户在任一入口填写天气 key 后天气功能生效；AI 配置只有一处真相来源。

---

## P1 — 架构性债务

### 2. [x] DebugPanel 加生产环境守卫

**改动记录（已完成）**：

- `App.vue`：改为 `import.meta.env.DEV` + `defineAsyncComponent` 动态导入，
  生产构建中 DebugPanel 及其独有依赖被完整 tree-shake
- `DesktopPet/index.vue`：移除"调试面板打开时随机选食物"的 watch 及相关
  import（isDebugPanelOpen / randomPick / watch）
- 该 watch 迁移至 `DebugPanel/index.vue` 内部，调试行为不变
- DebugPanel 拖拽复用 `useDraggable()` 一项**未做**（P3-14 统一处理）

**问题**：

- `App.vue` 无条件渲染 `<DebugPanel />`，2184 行调试代码打进生产包
- **生产环境按 Ctrl+D（`DebugPanel/index.vue:342-348`）或调 `window.toggleDebugPanel`
  就能打开调试面板，直接改存档**（`saveAttributeData` 绕过业务规则写存档，
  `DebugPanel/index.vue:47`）
- `DesktopPet/index.vue:117-121` 存在专门服务调试面板的生产逻辑（"调试面板打开时
  eating 状态随机选食物"）
- DebugPanel 自带一套拖拽实现（`DebugPanel/index.vue:315-339`），与
  `petController.ts:628-754` 的拖拽重复且无边界 clamp

**方案**：

- [ ] `App.vue` 改为 `import.meta.env.DEV` 条件渲染（用动态 import 以便 tree-shake）
- [ ] 移除 `index.vue:117-121` 中服务调试面板的逻辑，改为 DebugPanel 内部 watch
- [ ] DebugPanel 拖拽改用抽出的 `useDraggable()`（见 P3-14）

### 3. [ ] 收敛状态机统一入口（可分小步）

**问题**：

- `petController.ts:268-482` 的 `changeState()` 之外存在 **11 处直接
  `petState.value = ...` 赋值**（`launchController.ts:100,174,247,265` 4 处、
  `petController.ts` 自身 7 处），全部绕过 `recordState` 统计、台词等副作用
- 打断规则散落：`constants.ts:24-146` 五张平行数组（STATE_DURATIONS / STATE_NAMES /
  WORK_STATES / UNINTERRUPTIBLE_STATES / NON_MOVING_STATES）+ 各处硬编码字符串比较
  （如 `index.vue:149-151` 又重复判断 sleeping/sleepy）
- `llmService.ts:37-41` 重新定义了一份 `WORK_STATES`，未 import `constants.ts:130`
  的同名常量——数值双源必然漂移
- `petController.ts:216-237` 用 `document.querySelector(".pet-body")` + `getAnimations()`
  反查 CSS 动画进度决定状态切换——状态机反向耦合视图

**方案**：

- [ ] 消灭 11 处直接赋值，全部走 `changeState`（或给 changeState 增加"强制"参数）
- [ ] `llmService.ts` 改用 `constants.ts` 的 WORK_STATES
- [ ] 五张平行数组收敛为按状态定义的单一配置对象
- [ ] 中期：拆 `petController.ts`（944 行上帝模块）为 stateMachine / drag /
      passthrough / animation 四块
- [ ] （可选）动画结束回调改由组件 emit，替代 DOM 反查

### 4. [ ] 消除循环依赖与弹窗双源真相

**问题**：

- `attributes.ts:62` ↔ `petController.ts:63-73` 互相 import。项目曾用
  `registerAttributeCallbacks` 回调注入解环，但 `isWorkState` 一行又把环建回来
- `useModal.ts:38-61` 每个弹窗同时维护本地 `visible` ref 和 sharedState 的
  `isXxxOpen` ref，`open()` 要写两处——双源真相，极易失同步
- `sharedState.ts` 第 1 行注释"共享状态 - 避免循环依赖"——该文件本身是为解环被迫
  拆出的，40+ 个 `export const ref` 被任意文件直接读写，数据流不可追踪

**方案**：

- [ ] `isWorkState` 移入 constants.ts 或 sharedState.ts 断环
- [ ] `useModal.ts` 去掉本地 ref，只保留 sharedState 一份真相
- [ ] （大动作，可后置）评估引入 Pinia 替代模块级单例；或至少约定新代码不直接
      import sharedState 的 ref，统一走接口函数

---

## P2 — 重复代码抽取：面板层（约 1800 行）

### 5. [ ] 抽取 BaseModal.vue 通用弹窗骨架（~600 行）

**问题**：6 个弹窗（attributes / stats / shop / warehouse / schedule / settings）
的以下部分逐字重复，只是类名前缀不同：

- overlay 容器：`position:fixed; inset:0; z-index; display:flex` 逐字相同
  （如 settings 的 `.settings-overlay`、shop 的 `.shop-modal-overlay`）
- 标题栏：`modal-header > header-title > title-icon(emoji) + title-text` +
  `modal-close` 按钮（✕ hover 旋转变红），如 `shop/index.vue:255-263` 与
  `warehouse/index.vue:261-269` 完全同构
- "装饰星星"：`.modal-decor / .decor-star / .star-1~3 / @keyframes twinkle` 在
  5 个文件各复制一份（attributes:651-696、stats:365-410、shop:431-476、
  warehouse:430-472、schedule:434-479）；加上 settings 的 `decor-item` 变体、
  ChatPanel 的 `deco-stars`、contextMenu 的 `menu-decor-stars`，同一创意 8 种写法
- 遮罩点击关闭 + `@click.stop` 模板样板

**方案**：抽 `components/ui/BaseModal.vue`（Teleport + Transition + overlay +
header props + 关闭按钮 + 装饰星插槽），6 个弹窗改为传 `title` / `icon` props。
顺带统一 overlay 的 z-index（当前 10000/10001/9998/9999 散落 40+ 处，见 P3-16）。

### 6. [ ] 抽取 usePanelTheme() 主题 composable（~450 行）

**问题**：每个面板组件都有一大坨 `computed cssVars`，本质是 `isDark ? A : B`
换色相，8 处各写一份：

- settings:118-169（`themeColors`）、attributes:286-332、stats:20-91、
  shop:143-230、warehouse:145-232、schedule:19-97、ChatPanel:206-244、
  contextMenu:71-100（dialogue:36-61 是内联变体）
- 其中 shop 与 warehouse 的变量约 80% 同名同值（`--overlay-bg/--modal-bg/
--card-bg/--money-color/--toast-*` 等），对比 shop:144-229 与 warehouse:146-231

**方案**：抽 `usePanelTheme(accentColor?)` composable 或全局 CSS 变量 + 根节点
主题 class，允许各面板只声明差异色。

### 7. [ ] 合并 shop / warehouse 克隆代码（~500 行）

**问题**：shop 与 warehouse 是克隆关系最严重的一对：

- `currentItems` computed 几乎相同（shop:53-83 vs warehouse:53-79，仓库版仅多
  `count` 字段和 filter）
- `handleBuy`（shop:118-140）与 `handleItemClick`（warehouse:109-142）都是按
  category 的 if/else 分发
- Tab 切换栏模板逐元素相同（shop:275-324 vs warehouse:281-318，含相同的
  `tab-indicator food/bath/deco-indicator` 结构）
- `DecoIcon` 条件渲染相同；整个 `<style scoped>` 约 500 行基本是复制后微调

**方案**：抽 `ItemGridPanel` + `TabBar` 组件，shop/warehouse 只保留各自的业务
分发逻辑。

### 8. [ ] 消除规则文案与数值的双源（防止漂移）

**问题**：

- `attributes/index.vue:70-118` 的属性规则文案（"每 5 分钟 -1"、"低于 30 时健康
  下降"）与 `constants.ts` 的 `SATIETY_DECAY_INTERVAL / HUNGRY_THRESHOLD` 是两套来源
- `attributes/index.vue:126-147` 的打工规则文案（"每分钟获得 1 金币"、"完工奖
  +20 金币"）与 `attributeStorage.ts:177-188` 的 `WORK_INCOME_PER_MINUTE /
WORK_COMPLETION_BONUS` 数值表重复——**改数值平衡时 tooltip 文案必然漂移**

**方案**：规则文案改为模板字符串从常量生成。

### 9. [ ] 抽取通用 UI 小组件（~250 行）

- [ ] `MoneyBadge.vue`：金币余额展示 `money-section > money-badge > money-icon(💰) +
money-amount` 在 attributes:449-454、shop:267-272、warehouse:273-278 三份相同
- [ ] `AttributeBar.vue`：属性条渲染与 `Math.min(100, value/cap*100)` 百分比换算
      在 attributes:62-119、QuickActionPanel:35-54、stats:129-132 三处各写一遍
- [ ] `ConfirmDialog.vue`：stats:290-334 + 755-956 自带约 200 行的私有"重置确认"
      二级弹窗，其他删除类操作将来会再抄一遍

---

## P2 — 重复代码抽取：特效层（约 2500-3500 行）

> 特效组件（effects/，32 个文件 8679 行）几乎不含 JS 逻辑，重复全部发生在模板
> 和 CSS 层面。这些组件零 props/emits、由 `effectsMap.ts` 统一挂载，重构不影响
> 调用方。

### 10. [x] 抽取 ParticleField 通用粒子组件（~1500-2000 行，收益最大）

**问题**："N 连拷"模式——同一 SVG 整块复制只改 delay/位置/颜色：

- `BrickCarryingEffects.vue`：同一砖头 SVG 复制 **13 份**（:10-110 三份、
  :224-254 五份、:258-288 五份）
- `ProgrammerEffects.vue:338-429`：两个完全相同的 Bug SVG；:915-988 有 72 行
  手写 delay 表（可用 `calc((n-1) * 0.3s)` 或 `--i` 变量替代）
- `FlyerDistributingEffects.vue:8-73`：三份传单 SVG 只有填充色不同；:108-131
  三份相同五角星 path
- `CoinGainEffects.vue:126-164`：三份完全一样的小金币 SVG
- `ScaredEffects:8-19/46-55`、`DizzyEffects:8-31`、`ShyEffects:23-31`、
  `SmugEffects:33-41` 均为同构问题

**方案**：抽 `<ParticleField :items="[...]">` + 插槽组件，用 `v-for` +
`:style` 注入 `--delay/--x/--y`。`LaunchEffects.vue:33-43` 已在用这个手法渲染
星尘，可直接推广。

### 11. [x] 扩充 icons/ 通用 SVG 库（~600-800 行）

**问题**：`effects/icons/` 已抽出 4 个通用 SVG（Heart/Star/Sparkle/Question），
但以下高频图形仍各处手绘：

- 水滴 path 在 3 个文件重复：BrickCarrying:115-137、Embarrassed:10-45,49-79、
  Scared:28-43
- 螺旋圈：Confused 与 Dizzy 各一份
- 音符、五角星 path、砖头、传单、Bug 等均无通用组件

**方案**：补 SweatDropSvg / SpiralSvg / NoteSvg / StarPathSvg / BrickSvg /
FlyerSvg / BugSvg。

### 12. [~] 建共享 keyframes.css（~400-600 行）

**问题**：换名字的同一段动画跨文件重复：

- 四份逐帧数值几乎相同的"星星闪烁"：Confused:296-311（star-twinkle）、
  Shy:307-322（twinkle-shine）、Smug:150-165（sparkle-shine）、
  Thinking:334-349（sparkle-twinkle）
- 同名同内容：`note-float`（Smug:251-263 / BrickCarrying:589-604）、
  `sparkle-pop`（CoinGain:393-410 / BrickCarrying:554-562）
- 同义重复："螺旋圈旋转"（Confused:152-202 vs Dizzy:165-200）、"汗滴下落"
  （4 处）、"上浮渐隐"（5 处）
- 26/32 个文件逐字重复根容器四行样板（`position:absolute; inset; 
pointer-events:none; overflow:visible`）

**方案**：建 `effects/keyframes.css` 收敛为一份，用 CSS 变量参数化时长/幅度
（范本：`CelebrateEffects.vue:89-198` 用 `--x/--y` 让一份 keyframes 服务 6 条彩带）；
根容器抽 `effect-layer` 工具类。

### 12a. [x] EatingEffects 纯化

`EatingEffects.vue:2` 是唯一直接读 `sharedState.currentFood` 的状态特效，
破坏"纯展示"约定——改为 props 传入（需同步调整 effectsMap 渲染通道）。

---

## P3 — 文件位置与收尾

### 13. [ ] 拆分 settings/index.vue（2951 行 → 约 400 行）

里面塞了五类东西：

- [ ] **自动更新模块**（script:60-380 约 320 行 + 模板:1394-1521）：checkUpdate /
      download / install / 进度监听 / 错误友好化，与"设置"无关，迁
      `composables/useAutoUpdate.ts` + `settings/UpdateSection.vue`
- [ ] **6 个分类页拆子组件**：`settings/panels/BehaviorPanel.vue` /
      `AppearancePanel.vue` / `VoicePanel.vue` / `InteractionPanel.vue` /
      `ApiPanel.vue` / `AboutPanel.vue`，父组件只留 category tabs 和容器
- [ ] **语音输入依赖检测 UI**（:1035-1171）随之迁入 InteractionPanel

### 14. [ ] 抽取 useDraggable() 拖拽 composable

两套独立实现：`ChatPanel/index.vue:159-195`（手写 mousemove/mouseup 监听）与
`petController.ts:649-706`（多了边界 clamp 和状态切换）。抽公共实现，DebugPanel
的第三套拖拽（见 P1-2）也复用之。

### 15. [ ] 数据/配置文件归位

- [ ] `dialogues.ts`（1636 行纯台词数据）迁到 `src/data/dialogues.ts` 或拆
      JSON——它不是组件，且与 `composables/dialogue.ts` 仅差一个字母极易混淆
- [ ] `attributeStorage.ts`（410 行）中的游戏配置表（FOOD_CONFIGS /
      BATH_CONFIGS / DECORATION_CONFIGS / WORK_INCOME）迁到 `src/data/`，
      存储层只留存取逻辑
- [ ] weatherCodeMapping.ts 所在的 config/ 目录与 data/ 目录考虑合并统一

### 16. [ ] localStorage 统一收敛

**问题**：key 散落 9 个文件，一半绕过 `utils/storage.ts` 已有的
`createLocalStorage` 工厂；`llm-config` 在 sharedState.ts:157（读）和
ChatPanel:55（写）两处出现；`theme.ts:60` 反向读取属于 settings 模块的
`pet-settings` key；`settings.ts:102-103,168-171` 残留调试 console.log。

- [ ] 建 `constants/storageKeys.ts` 集中定义所有 key
- [ ] attributeStorage / petShapeStorage / qweatherStorage / settings / theme /
      sharedState(llm) 六处改用工厂
- [ ] 清理 console.log 残留

### 17. [ ] electron/main.js 拆分（549 行，6 类职责混装）

- [ ] 更新模块（:259-408 约 150 行 + 三平台安装脚本 :411-524）拆
      `updater-ipc.js`——照已有的 `edgeTTS-ipc.js` / `whisperIPC.js` 模式即可
- [ ] （安全加固）`fetch-llm`（:182-195）接受渲染进程任意 URL，加域名白名单
- [ ] （安全加固）安装脚本 :460-469 用字符串插值拼 bash（含 `rm -rf`），改用
      参数传递或转义

### 18. [ ] z-index 层级集中管理

40+ 处 z-index 散落各组件（10000/10001/9998/9999/9999/5/10/20 混用），建
`z-index.css` 或常量文件定义层级（特效层 / 宠物本体 / 快捷面板 / 右键菜单 /
弹窗 / 调试面板）。

---

## 实施顺序建议

按"先修 bug、先小后大、纯搬家先于动架构"原则：

1. **P0-1**：修 API 配置死路径（用户可感知的 bug，改动小）
2. **P1-2**：DebugPanel 加 DEV 守卫（几行改动，安全 + 生产包瘦身）
3. **P2-5 + P2-6**：BaseModal + usePanelTheme（一次性消灭面板层最大宗样板）
4. **P2-7 + P2-9**：shop/warehouse 合并 + 通用小组件
5. **P3-13**：settings 拆分（纯搬家无风险，2951 → 400）
6. **P2-10 ~ 12**：特效层抽取（量大但机械，不影响调用方）
7. **P1-3 + P1-4**：状态机收敛 + 循环依赖（动架构，小步验证）
8. **P3-14 ~ 18**：拖拽 / 文件归位 / localStorage / main.js / z-index 收尾

每步完成后跑 `npm run lint` + `npm run build`（含 vue-tsc 类型检查）验证，
并可用 `/simplify` 审查（遵循 CLAUDE.md 要求）。

## 备注

- 本文档的行号基于 2026-10-12 的 master（c3773ba），后续代码变动后行号会漂移，
  定位时以描述的特征（类名/函数名）为准。
- 分析过程中确认做得好、不需要动的部分：preload.cjs 白名单 API、
  edgeTTS/whisper IPC 模块化、`buyToInventory`/`useFromInventory` 泛型封装、
  `useToast` 复用、shapes/foods/effects 目录按域组织、金币扣费逻辑无重复实现。
