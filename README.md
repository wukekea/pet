# 桌面宠物

一个可爱的桌面宠物应用，使用 Electron + Vue 3 构建的跨平台桌面应用。

## 功能特性

- 🐱 **多形态宠物** - 支持云朵、猫咪等多种宠物形态，可自由切换
- 🎭 **丰富表情** - 26+ 种状态动画（空闲、行走、跳跃、睡觉、开心、哭泣、生气、吃东西、洗澡等）
- 🖱️ **多种互动** - 单击反应、双击特技、拖拽移动
- 👣 **脚印轨迹** - 移动时留下渐隐的脚印效果
- 💬 **对话气泡** - 宠物会显示可爱的对话气泡
- 🍎 **食物系统** - 支持多种食物（苹果、鱼、蛋糕、棒棒糖）
- 🌙 **作息系统** - 可设置宠物的睡眠时间段
- 📊 **数据统计** - 记录陪伴时长、互动次数等
- 🔔 **系统托盘** - 托盘图标控制宠物显示/隐藏
- 🪟 **鼠标穿透** - 宠物区域可交互，其他区域鼠标穿透
- 🌓 **主题适配** - 自动检测系统深色/浅色主题
- 💾 **状态保存** - 自动保存宠物可见性状态
- 🌤️ **真实天气** - 接入和风天气 API，根据实时天气显示对应天气背景

## 技术栈

- **前端框架**: Vue 3
- **桌面框架**: Electron
- **构建工具**: Vite
- **类型检查**: TypeScript

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 启动 Web 开发服务器
npm run dev

# 启动 Electron 开发模式
npm run electron:dev
```

### 构建打包

```bash
# 构建 Web 版本
npm run build

# 构建 Electron 应用
npm run electron:build

# 预览 Electron 构建
npm run electron:preview
```

### 代码检查

```bash
npm run lint
```

## 天气系统配置

宠物支持接入和风天气 API，根据实时天气自动显示对应的天气背景效果。

### 获取 API Key

1. 访问 [和风天气开发平台](https://dev.qweather.com/) 注册账号
2. 进入控制台创建应用，选择「Web API」
3. 复制生成的 API Key

### 配置方式

在项目根目录创建 `.env.local` 文件：

```bash
VITE_QWEATHER_API_KEY=你的API密钥
VITE_QWEATHER_API_HOST=你的API域名
VITE_AMAP_KEY=你的高德地图Key
```

配置说明：

- `VITE_QWEATHER_API_KEY`：在和风天气控制台获取的 API Key
- `VITE_QWEATHER_API_HOST`：API 请求域名
  - 免费版：`devapi.qweather.com`
  - 付费版：在你的和风天气控制台查看（如 `nj6cdptmha.re.qweatherapi.com`）
- `VITE_AMAP_KEY`：高德地图 API Key（用于 IP 定位）
  - 访问 [高德开放平台](https://lbs.amap.com/) 注册并创建应用获取

配置完成后启动应用，天气服务将自动运行：

- 通过浏览器定位获取当前位置（需要授权）
- 每 10 分钟更新一次天气
- API 调用失败时保持现有天气不变

### 支持的天气类型

| 实时天气         | 宠物背景效果 |
| ---------------- | ------------ |
| 晴、少云         | 晴天光效     |
| 多云、阴         | 云朵漂浮     |
| 小雨、阵雨       | 小雨动画     |
| 中雨、大雨、暴雨 | 暴雨动画     |
| 雷阵雨           | 雷暴闪电     |
| 小雪、阵雪       | 小雪飘落     |
| 中雪、大雪、暴雪 | 大雪纷飞     |
| 雾、霾、沙尘     | 默认背景     |

## 项目结构

```
pet/
├── electron/
│   ├── main.js           # Electron 主进程
│   ├── preload.cjs       # 预加载脚本
│   └── icon.png          # 应用图标
├── src/
│   ├── components/
│   │   ├── DebugPanel/
│   │   │   └── index.vue # 调试面板组件
│   │   └── DesktopPet/
│   │       ├── composables/    # 组合式函数
│   │       │   ├── dialogue.ts       # 对话系统
│   │       │   ├── footprints.ts     # 脚印效果
│   │       │   ├── passthrough.ts    # 鼠标穿透
│   │       │   ├── petController.ts  # 宠物控制
│   │       │   ├── qweatherService.ts # 天气服务
│   │       │   ├── scheduleManager.ts # 作息管理
│   │       │   ├── sharedState.ts    # 共享状态
│   │       │   ├── stats.ts          # 数据统计
│   │       │   └── theme.ts          # 主题适配
│   │       ├── constants.ts     # 常量定义
│   │       ├── types.ts         # 类型定义
│   │       ├── index.vue        # 桌面宠物组件
│   │       └── WeatherBackground.vue # 天气背景
│   ├── config/
│   │   └── weatherCodeMapping.ts # 天气代码映射
│   ├── types/
│   │   └── qweather.d.ts       # 天气 API 类型
│   ├── App.vue           # 根组件
│   └── main.ts           # 入口文件
├── public/               # 静态资源
├── CLAUDE.md             # Claude Code 项目说明
└── README.md             # 项目文档
```

## 宠物状态说明

| 状态         | 说明     | 触发方式       |
| ------------ | -------- | -------------- |
| idle         | 空闲待机 | 默认状态       |
| walking      | 行走移动 | 随机移动或拖拽 |
| jumping      | 跳跃     | 随机触发       |
| sleeping     | 睡觉     | 随机/作息触发  |
| happy        | 开心     | 点击宠物       |
| crying       | 大哭     | 随机触发       |
| angry        | 生气     | 随机触发       |
| fallen       | 摔倒     | 点击宠物       |
| scared       | 惊吓     | 点击宠物       |
| thinking     | 思考     | 随机触发       |
| smug         | 得意     | 点击宠物       |
| shy          | 害羞     | 点击宠物       |
| confused     | 疑惑     | 随机触发       |
| hello        | 打招呼   | 启动时         |
| sneeze       | 打喷嚏   | 随机触发       |
| yawn         | 打哈欠   | 睡前触发       |
| sleepy       | 睡眼朦胧 | 睡眠中被点击   |
| sleepwalking | 睡眠行走 | 睡眠中拖拽     |
| stretch      | 伸懒腰   | 醒来时         |
| scratch      | 挠头     | 随机触发       |
| celebrate    | 庆祝     | 点击宠物       |
| peek         | 偷看     | 随机触发       |
| grin         | 坏笑     | 随机触发       |
| dancing      | 跳舞     | 双击宠物       |
| rolling      | 翻滚     | 双击宠物       |
| eating       | 吃东西   | 随机触发       |
| bathing      | 洗澡     | 随机触发       |

## 宠物形态

| 形态 | 说明     | 特点                 |
| ---- | -------- | -------------------- |
| 云朵 | 默认形态 | 柔软的云朵造型       |
| 猫咪 | 可爱猫咪 | 小猫造型，带耳朵胡须 |
| 熊猫 | 胖墩熊猫 | 圆润黑白配色，带眼圈 |

支持的每种形态都会根据主题自动适配深色/浅色模式的颜色。

## 交互方式

| 操作     | 效果                                               |
| -------- | -------------------------------------------------- |
| 单击宠物 | 触发随机反应（开心、惊吓、摔倒、得意、害羞、庆祝） |
| 双击宠物 | 触发特殊动作（跳舞、翻滚）                         |
| 拖拽宠物 | 将宠物移动到屏幕任意位置                           |
| 右键宠物 | 打开菜单（作息设置、数据统计）                     |
| 托盘图标 | 点击显示/隐藏宠物                                  |

## 右键菜单

右键点击宠物可打开功能菜单：

- **作息设置** - 设置宠物的睡眠时间段
- **数据统计** - 查看与宠物的互动记录和陪伴数据

## 开发调试

项目包含调试面板，可以手动控制宠物状态、切换形态、选择食物等。

## 许可证

MIT
