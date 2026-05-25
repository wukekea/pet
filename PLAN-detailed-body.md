# 精美外形功能实施计划

## 背景

当前宠物的形态是"大脸盘+四肢"的简约风格（pet-body 是一个圆形 div，既当脸又当身体），这限制了宠物的动作表现力。用户希望在设置中增加"外形风格"选项，支持在简约外形和精美外形（有头+躯干+四肢）之间切换，默认简约。

## 核心设计决策

### 架构：每个形态内条件渲染（v-if/v-show）

不创建独立的 XxxDetailedShape.vue 组件，而是在现有 8 个形态组件内部通过 `bodyStyle` prop 区分渲染。理由：
- 8 个形态共享同一套 DOM 骨架和装饰品插槽，拆分组件会导致 16 个文件维护
- DecoBow/DecoMagicWand 嵌入在特定 DOM 节点中，拆分后每次改装饰品逻辑需改 16 处

### CSS 策略：`.pet-body-detailed` 选择器

在 `pet-body` 上动态添加 class `pet-body-detailed`，所有精美样式以此选择器开头，与简约模式完全隔离。

### 过渡方案：v-show + CSS transition

pet-head 和 pet-torso 用 v-show + opacity/scale 过渡，不用 v-if 的瞬间显隐。pet-body 的 width/height/border-radius 已有 `transition: all 0.3s ease`，切换时自动过渡。

### 身体比例：大头小身（Q 版卡通风）

头和身体差不多大，可爱感最强，和现有简约风格差异适中。

## 精美外形结构

```
    ○○
   / ◡ \     ← 头部 45×40
  (      )
   \    /     ← 躯干 35×45
    |  |
   ╭╮ ╭╮     ← 腿

整体高宽比约 2:1
头:躯干 ≈ 1:1
```

```
pet-body（50×100px 卵形，上宽下窄）
  ├── pet-body-gradient
  ├── pet-head（45×40px，body 顶部，含耳朵+五官）
  │   ├── pet-ear × 2
  │   └── pet-face（inset:0 覆盖 head）
  ├── pet-torso（35×45px，head 下方，body 渐变）
  ├── pet-arm × 2（从 torso 两侧中部延伸）
  ├── pet-leg × 2（从 body 底部延伸）
  └── DecorationsLayer
```

| 部位 | 简约 | 精美 |
|------|------|------|
| pet-body | 70×70 圆形 | 50×100 卵形 |
| pet-head | 无 | 45×40 圆形 |
| pet-torso | 无 | 35×45 椭圆 |
| pet-arm | 12×20 | 10×22 |
| pet-leg | 14×12 | 12×16 |

## 实施步骤

### 阶段 1：基础设施

1. **`types.ts`** — 添加 `BodyStyle` 类型
2. **`composables/settings.ts`** — PetSettings 接口添加 `bodyStyle: 'simple' | 'detailed'`，默认值 `'simple'`
3. **`settings/index.vue`** — 外观分类下添加"外形风格"切换按钮（简约/精美）
4. **`index.vue`** — 传递 `bodyStyle` prop 到形态组件；根据 bodyStyle 调整 pet-container 高度
5. **`shapes/base.css`** — 添加 `.pet-body-detailed` 基础区块（body 形状、head/torso 定位、四肢偏移、方向系统覆盖）

### 阶段 2：Cloud 形态精美化原型

1. **`CloudShape.vue`** — 添加 `bodyStyle` prop，增加 pet-head 和 pet-torso DOM 结构
2. **`cloud/styles.css`** — 添加 `.pet-shape-cloud .pet-body-detailed` 覆盖
3. 测试 cloud 形态所有 36 种状态动画

### 阶段 3：动画适配

1. **`base.css`** — 为精美模式添加手臂/腿的 keyframes 覆盖（B 类动画）
2. 逐一测试 36 种状态在精美模式下的表现
3. 重点测试方向系统（front/left/right/back）在精美模式下的四肢层次

### 阶段 4：其余 7 种形态适配

1. 逐个修改 XxxShape.vue — 添加 bodyStyle prop 和 DOM 结构
2. 逐个修改 xxx/styles.css — 添加精美模式覆盖（各形态躯干差异）
3. 每种形态测试核心动画

形态躯干差异：
- cloud：云朵圆润，底部波浪
- cat：纤细，可加条纹
- panda：圆胖，白色肚皮
- rabbit：修长椭圆
- chick：圆润短宽
- dog：匀称标准
- penguin：梨形白肚皮
- frog：扁宽浅绿肚皮

### 阶段 5：装饰品和效果适配

1. **`decoration-overrides.css`** — 精美模式下装饰品位置调整
2. 效果组件（SleepBubble、CoinGainEffects 等）位置适配
3. 围巾在精美模式下移到 head/torso 连接处（脖子位置）

### 阶段 6：过渡优化与收尾

1. 切换过渡平滑性优化
2. pet-container 高度过渡不跳跃
3. 整体回归测试

## 关键文件

| 文件 | 修改内容 |
|------|---------|
| `composables/settings.ts` | 添加 bodyStyle 字段 |
| `settings/index.vue` | 添加外形风格切换 UI |
| `types.ts` | 添加 BodyStyle 类型 |
| `index.vue` | 传递 bodyStyle prop，调整容器高度 |
| `shapes/base.css` | 精美模式基础样式+动画覆盖 |
| `shapes/cloud/CloudShape.vue` | 第一个精美化原型 |
| `shapes/cloud/styles.css` | cloud 精美模式覆盖 |
| 其余 7 个 XxxShape.vue | 添加精美 DOM 结构 |
| 其余 7 个 styles.css | 形态精美覆盖 |
| `shapes/decoration-overrides.css` | 精美模式装饰品位置 |

## 动画适配策略

### A 类 — 完全复用（约 20 种状态）

这些动画主要作用于 `.pet-body` 的整体 transform，不涉及具体部位定位，精美模式下自动工作：
idle、walking、jumping、sleeping、happy（body 部分）、crying（body 部分）、angry（body 部分）、fallen、scared、thinking、smug、shy、confused、hello、celebrate、peek、dancing、rolling、sleepy、stretch、sleepwalking、embarrassed、farming

### B 类 — 需微调偏移量（手臂/腿部分动画）

手臂动画的关键帧值需要适配精美模式下手臂的起始位置。做法是在 base.css 的精美区块中用 `.pet-body-detailed .pet-happy .arm-left` 重新声明关键帧值。

### C 类 — 形态+状态双重覆盖（各 styles.css 中已存在）

`.pet-shape-cat.pet-happy .eye` 这类选择器，精美模式下同样适用，因为 `.pet-face` 内部结构未变，无需修改。

## CSS 优先级注意

`.pet-body-detailed .eye` 与 `.pet-shape-cat .eye` 优先级相同，需确保导入顺序正确（base.css 在 shape styles.css 之前导入），这样形态覆盖能覆盖精美基础覆盖。

## 验证方式

1. 设置中切换简约/精美，观察过渡动画是否平滑
2. 精美模式下测试所有 36 种状态动画
3. 精美模式下测试 4 个方向（front/left/right/back）
4. 精美模式下测试 8 个装饰品在各形态上的位置
5. 精美模式下测试拖拽、脚印、秋千等交互功能
6. 切换回简约模式，确认所有功能正常不受影响
