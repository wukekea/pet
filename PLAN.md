# 宠物作息时间表功能实现计划

## Context

用户希望为桌面宠物实现作息时间表功能，让宠物能够根据配置的时间段自动切换闲暇和睡觉状态。这样可以更真实地模拟宠物的日常作息，同时允许用户自定义作息安排。

## 实现方案

### 一、新增状态定义

需要新增 3 个状态到 `PetState` 类型：

| 状态 | 用途 | 持续时间 |
|-----|------|---------|
| `yawn` | 打哈欠 | 2000ms |
| `sleepy` | 睡眼朦胧 | 3000ms |
| `stretch` | 伸懒腰 | 2500ms |

### 二、修改文件清单

#### 新增文件

| 文件路径 | 用途 |
|---------|------|
| `src/components/DesktopPet/composables/useSchedule.ts` | 作息时间表核心逻辑 |
| `src/components/DesktopPet/composables/useScheduleStorage.ts` | 作息配置存储管理（保存到 data/schedule.json） |

#### 修改文件

| 文件路径 | 修改内容 |
|---------|---------|
| `src/components/DesktopPet/types.ts` | 新增 ScheduleState、TimeSlot、ScheduleConfig 类型，新增 yawn、sleepy、stretch 状态 |
| `src/components/DesktopPet/constants.ts` | 新增 YAWN_DURATION、SLEEPY_DURATION、STRETCH_DURATION、DREAM_TALK_INTERVAL，更新 NON_MOVING_STATES |
| `src/components/DesktopPet/composables/sharedState.ts` | 新增作息状态变量 |
| `src/components/DesktopPet/composables/usePetState.ts` | 修改状态切换逻辑，集成作息控制，添加梦话定时器 |
| `src/components/DesktopPet/composables/useDialogue.ts` | 新增 getTimeGreetingForSleep() 函数，新增 getDreamTalk() 函数 |
| `src/components/DesktopPet/dialogues.ts` | 添加新状态对话消息，添加梦话列表 |
| `src/components/DesktopPet/animations.ts` | 添加新状态动画映射和持续时间 |
| `src/components/DesktopPet/index.vue` | 初始化作息系统，添加新状态 UI 效果 |
| `src/components/DesktopPet/styles.css` | 添加新状态样式 |

### 三、数据结构设计

```typescript
// 作息状态类型
export type ScheduleState = "free" | "sleep";

// 时间段配置
export interface TimeSlot {
  startHour: number;    // 开始小时（0-23）
  startMinute: number;  // 开始分钟（0-59）
  endHour: number;      // 结束小时（0-23）
  endMinute: number;    // 结束分钟（0-59）
  state: ScheduleState; // 状态：free（闲暇）或 sleep（睡觉）
}

// 作息配置
export interface ScheduleConfig {
  enabled: boolean;        // 是否启用作息功能
  slots: TimeSlot[];       // 时间段配置列表
}

// 默认作息配置
export const DEFAULT_SCHEDULE_CONFIG: ScheduleConfig = {
  enabled: false,  // 默认关闭，用户自行启用
  slots: [
    { startHour: 22, startMinute: 0, endHour: 7, endMinute: 0, state: "sleep" },  // 22:00-07:00 睡觉
    { startHour: 7, startMinute: 0, endHour: 22, endMinute: 0, state: "free" },   // 07:00-22:00 闲暇
  ],
};
```

### 四、核心逻辑设计

#### 4.1 作息流程

**进入睡眠作息：**
1. 触发 `yawn`（打哈欠）状态，持续 2000ms
2. 打哈欠结束后自动切换到 `sleeping` 状态
3. 计算作息结束时间，设置定时器在作息结束时唤醒
4. 睡眠过程中，以较低频率冒出梦话（仅显示梦话对话）

**睡眠期间交互：**
1. 用户点击/拖拽后，触发 `sleepy`（睡眼朦胧）状态，持续 3000ms
2. `sleepy` 状态结束后，检查是否仍在睡眠作息：
   - 如果是，返回 `sleeping` 状态
   - 如果否，返回 `idle` 状态

**作息结束唤醒：**
1. 触发 `stretch`（伸懒腰）状态，持续 2500ms
2. 根据当前时间显示问候语：
   - 5:00-11:00：早安
   - 11:00-13:00：午安
   - 13:00-18:00：午安
   - 18:00-5:00：晚安
3. 伸懒腰结束后进入 `idle` 状态

#### 4.2 闲暇状态行为

当处于闲暇作息时，宠物正常触发各种动作，但**排除**以下状态：
- `yawn`（打哈欠）
- `sleepy`（睡眼朦胧）
- `stretch`（伸懒腰）
- `sleeping`（睡眠）

#### 4.3 状态切换关键点

在 `usePetState.ts` 的 `changeState` 函数中：

1. **idle 状态随机切换**：根据 `isInSleepSchedule` 过滤可用状态
2. **sleeping 状态处理**：作息模式下持续时间由作息结束时间决定
3. **所有响应状态**：结束后根据作息状态决定返回 `sleeping` 还是 `idle`

### 五、关键函数设计

#### useSchedule.ts

```typescript
// 检查当前时间所属的作息状态
export function getCurrentScheduleState(): ScheduleState

// 计算当前作息结束时间（毫秒）
export function getScheduleEndTime(): number | null

// 更新作息状态
export function updateScheduleState()

// 进入睡眠作息
export function enterSleepSchedule()

// 退出睡眠作息
export function exitSleepSchedule()

// 启动作息监控
export function startScheduleMonitor()

// 停止作息监控
export function stopScheduleMonitor()
```

#### useScheduleStorage.ts

```typescript
// 保存作息配置到 data/schedule.json
export function saveScheduleConfig(config: ScheduleConfig)

// 从 data/schedule.json 加载作息配置
export function loadScheduleConfig(): ScheduleConfig

// 重置作息配置（删除 data/schedule.json）
export function resetScheduleConfig(): ScheduleConfig
```

**存储位置**：所有配置数据保存到本地 `data/` 目录下的 JSON 文件中：
- `data/schedule.json` - 作息配置

#### useDialogue.ts

```typescript
// 根据时间获取睡眠唤醒问候语（早安/午安/晚安）
export function getTimeGreetingForSleep(): string

// 随机获取梦话（仅在睡眠期间使用）
export function getDreamTalk(): string
```

### 六、UI 效果设计

#### yawn（打哈欠）
- 嘴巴张大呈圆形
- 眼睛半闭（scaleY(0.3)）
- 身体轻微向后仰
- 右手捂住嘴巴，左手自然下垂

#### sleepy（睡眼朦胧）
- 眼睛眯成一条缝（scaleY(0.2)）
- 嘴巴微张
- 身体轻微摇晃
- 显示"💤"效果

#### stretch（伸懒腰）
- 双手向上伸展
- 身体拉长（scaleY(1.1)）
- 嘴巴张开
- 持续 2500ms

### 七、验证方式

1. 启用作息功能后，在配置的睡眠时间点观察：
   - 宠物是否触发打哈欠
   - 打哈欠后是否进入睡眠状态

2. 睡眠期间点击宠物：
   - 是否触发睡眼朦胧状态
   - 状态结束后是否回到睡眠

3. 作息时间结束时：
   - 是否触发伸懒腰
   - 是否显示正确的问候语

4. 闲暇期间：
   - 是否不会触发打哈欠、睡眼朦胧、伸懒腰、睡眠状态
   - 其他状态是否正常触发

### Critical Files

- `src/components/DesktopPet/composables/usePetState.ts` - 核心状态切换逻辑
- `src/components/DesktopPet/composables/useSchedule.ts` - 作息调度核心
- `src/components/DesktopPet/types.ts` - 类型定义
- `src/components/DesktopPet/index.vue` - 组件集成
- `src/components/DesktopPet/styles.css` - 新状态样式