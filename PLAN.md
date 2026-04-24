# 宠物成长系统实现计划

## 背景

为桌面宠物增加成长系统，包括属性管理（饱腹/清洁/体力/健康）、等级系统和经济系统，让宠物拥有持续的养成玩法。

## 数值设计

### 属性初始值（1级）

| 属性   | 初始值 | 上限公式              | 每级增加 |
| ------ | ------ | --------------------- | -------- |
| 饱腹值 | 100    | 100 + (level-1)×5     | +5       |
| 清洁值 | 100    | 同上                  | +5       |
| 体力值 | 100    | 同上                  | +5       |
| 健康值 | 100    | 固定100，不随等级增加 | 无       |
| 金币   | 50     | -                     | -        |
| 等级   | 1      | 上限40级              | -        |
| 经验   | 0      | level×100             | -        |

### 衰减/恢复速率

| 属性            | 速率                   | 说明               |
| --------------- | ---------------------- | ------------------ |
| 饱腹值          | -1 / 5分钟             | 100→0 约8.3小时    |
| 清洁值          | -1 / 8分钟             | 100→0 约13.3小时   |
| 体力值(打工)    | -1 / 1分钟             | 搬砖30分钟需30体力 |
| 体力值(平时)    | +1 / 30秒              | 满需约50分钟       |
| 体力值(睡眠)    | +1 / 10秒              | 满需约17分钟       |
| 健康值(饱腹<30) | -1 / 3分钟             | 饥饿状态           |
| 健康值(清洁<30) | -1 / 5分钟             | 变脏状态           |
| 健康值(两者<30) | 叠加衰减，约-1/1.9分钟 | 饥饿+变脏          |
| 健康值(两者≥30) | +1 / 3分钟             | 正常恢复           |

### 经济数值

| 项目         | 价格              | 效果      |
| ------------ | ----------------- | --------- |
| 苹果         | 5金币             | +25饱腹   |
| 小鱼         | 8金币             | +35饱腹   |
| 蛋糕         | 12金币            | +50饱腹   |
| 棒棒糖       | 3金币             | +15饱腹   |
| 洗澡         | 10金币            | +50清洁   |
| 搬砖(收入)   | +30金币 / +30经验 | 30分钟    |
| 发传单(收入) | +25金币 / +25经验 | 30分钟    |
| 写代码(收入) | +50金币 / +50经验 | 45分钟    |
| 互动经验     | +1/次             | 点击/双击 |
| 陪伴经验     | +1/2分钟          |           |

### 自动行为阈值

- 饱腹 < 30 → 饥饿状态，健康值开始下降；自动购买最便宜的可负担食物（优先能让饱腹达到50的）
- 清洁 < 30 → 变脏状态，健康值开始下降；自动洗澡（需10金币）
- 饱腹 ≥ 30 且 清洁 ≥ 30 → 健康值开始恢复
- 体力 = 0 → 强制睡觉
- 开始打工前检查体力：体力需 >= 打工所需体力（搬砖30、发传单30、写代码45），不足则无法开始
- 健康 = 0 → 无法开始打工
- 健康 ≥ 70 → idle时倾向开心表情
- 健康 < 30 → idle时频繁打喷嚏

### 自动行为优先级

- **不中断**：打工和睡眠期间不触发自动吃饭/洗澡，等状态结束后再执行
- 自动吃饭/洗澡仅在 idle、walking、情绪状态等非关键状态时触发

## 实现步骤

### 步骤1：types.ts - 新增类型定义

文件：`src/components/DesktopPet/types.ts`

新增 `AttributeData` 接口：

```typescript
export interface AttributeData {
  satiety: number;
  cleanliness: number;
  stamina: number;
  health: number;
  money: number;
  level: number;
  experience: number;
  lastUpdateTimestamp: number;
}
```

### 步骤2：constants.ts - 新增属性常量

文件：`src/components/DesktopPet/constants.ts`

新增衰减速率常量、阈值常量、经济常量（具体值见上方数值设计）。

### 步骤3：attributeStorage.ts - 持久化层

新建：`src/components/DesktopPet/composables/attributeStorage.ts`

- 定义 `DEFAULT_ATTRIBUTE_DATA`
- `saveAttributeData` / `loadAttributeData` / `resetAttributeData`
- `getAttributeCap(level)` = 100 + (level-1) × 5（饱腹/清洁/体力），健康值固定上限100
- `getExpRequiredForLevel(level)` = level × 100（等级上限40）
- 食物配置 `FOOD_CONFIGS`、洗澡配置 `BATH_COST`/`BATH_CLEANLINESS_RESTORE`、打工收入 `WORK_INCOME`、打工经验 `WORK_EXPERIENCE`

### 步骤4：sharedState.ts - 新增UI状态

文件：`src/components/DesktopPet/composables/sharedState.ts`

- 新增 `isAttributeModalOpen = ref(false)`
- 更新 `isAnyUiOpen` computed 加入 `isAttributeModalOpen`

### 步骤5：attributes.ts - 核心属性逻辑

新建：`src/components/DesktopPet/composables/attributes.ts`

核心设计：

- **响应式状态**：`attributeData = ref<AttributeData>(loadAttributeData())`
- **回调注册机制**（避免与 petController 循环依赖）：
  - `registerAttributeCallbacks({ requestStateChange, requestStopWork })`
  - attributes.ts 通过回调请求 petController 改变状态，不直接导入
- **1秒 tick 计时器**：累加计数器，到达阈值时执行属性变更
  - 饱腹/清洁衰减、体力恢复/消耗、健康恢复/衰减
  - 检查自动行为（autoEat/autoBath/forceSleep）
- **自动行为**：
  - `checkAutoEat()`：选最便宜的可负担食物，优先让饱腹达到50；打工/睡眠期间不触发
  - `checkAutoBath()`：清洁<30且有钱时自动洗澡；打工/睡眠期间不触发
  - `checkForceSleep()`：体力<=0时强制睡觉（仅非打工状态下触发，因为打工前已预检体力）
- **手动操作**：
  - `feedPet(foodType)`：扣钱、加饱腹、设 currentFood、触发 eating
  - `bathePet()`：扣钱、加清洁、触发 bathing
  - `startWork(workState)`：检查体力>=所需体力（搬砖30、发传单30、写代码45）且健康>0，否则拒绝
- **工作完成**：`onWorkComplete(workState)` 加金币加经验
- **等级系统**：`addExperience(amount)` 检查升级，升级时播放 celebrate
- **可见性暂停**：`document.visibilitychange` 切后台时冻结属性
- **防抖保存**：每60秒或变化时保存到 localStorage

### 步骤6：petController.ts - 集成属性系统

文件：`src/components/DesktopPet/composables/petController.ts`

修改点：

1. **import** attributes 相关函数
2. **initPet()**：调用 `initAttributes()` + `registerAttributeCallbacks`
3. **cleanupPet()**：调用 `cleanupAttributes()`
4. **handlePetClick reactions**：移除三个工作状态，只保留 `["happy", "scared", "fallen", "smug", "shy", "celebrate"]`
5. **handlePetClick/DoubleClick**：调用 `addInteractionExperience()`（拖拽不加经验）
6. **idle freeStates**：移除三个工作状态
7. **idle 决策增加健康影响**：health>=70 时倾向 happy/celebrate/hello/dancing；health<30 时倾向 sneeze；health=0 时也无法触发打工
8. **打工完成回调**：default case 中打工结束时调用 `onWorkComplete(petState.value)`
9. **调试面板**：调试面板触发的 eating/bathing/工作状态应绕过金币/体力检查，保持调试功能不受限

### 步骤7：contextMenu/index.vue - 新增菜单项

文件：`src/components/DesktopPet/contextMenu/index.vue`

- 新增 emit `openAttributes`
- 新增"宠物属性"菜单项（爱心图标，粉色渐变）

### 步骤8：index.vue - 集成属性面板

文件：`src/components/DesktopPet/index.vue`

- 导入 `isAttributeModalOpen` 和 `AttributeModal`
- 新增 `attributeModalVisible` 状态
- 新增 open/close 方法
- 更新 `closeContextMenu` 穿透判断
- ContextMenu 增加 `@open-attributes` 事件
- 模板添加 `<AttributeModal>` 组件
- **移除** eating 状态的随机食物 watch（食物由 feedPet() 设置）

### 步骤9：attributes/index.vue - 属性面板UI

新建：`src/components/DesktopPet/attributes/index.vue`

使用 `/frontend-design` skill 开发。复用 stats 面板的 Teleport+Transition+Overlay 模式。

面板内容：

- 等级+经验进度条+属性上限
- 4个属性条（饱腹/清洁/体力/健康）带数值和图标
- 金币显示
- 喂食区：4种食物按钮（显示价格+恢复量，钱不够时禁用）
- 洗澡按钮（显示价格，钱不够时禁用）
- 打工区：3种工作按钮（显示收入，体力不足时禁用）

### 步骤10：dialogues.ts - 新增属性相关对话

文件：`src/components/DesktopPet/dialogues.ts`

新增对话：

- 饱腹低时的提醒
- 清洁低时的提醒
- 体力低时的提醒
- 升级时的庆祝
- 自动吃饭/洗澡时的对话
- 金币不足时的对话

## 循环依赖处理

`attributes.ts` 需要触发状态变更（eating/bathing/sleeping/stopWork），但 `petController.ts` 也需要调用 attributes 的函数。通过回调注册机制解耦：

```
petController (initPet) → registerAttributeCallbacks({ requestStateChange, requestStopWork })
attributes.ts → 通过回调请求状态变更，不直接导入 petController
```

## 验证方式

1. 启动应用后右键点击宠物，确认"宠物属性"菜单项出现
2. 打开属性面板，确认4个属性条和金币正确显示
3. 等待一段时间，确认饱腹/清洁值缓慢下降
4. 手动喂食/洗澡，确认属性增加和金币扣除
5. 开始打工，确认体力下降，完成后金币和经验增加
6. 将饱腹值降到30以下，确认自动吃饭
7. 将体力降到0，确认强制睡觉
8. 关闭应用重新打开，确认属性正确恢复（离线不变化）
