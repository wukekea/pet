# 桌面宠物

一个可爱的桌面宠物应用，使用 Electron + Vue 3 构建的跨平台桌面应用。

## 功能特性

- 🐱 **可爱宠物** - 小云朵形象的桌面宠物
- 🎭 **丰富表情** - 20+ 种状态动画（空闲、行走、跳跃、睡觉、开心、哭泣、生气等）
- 🖱️ **拖拽移动** - 支持拖拽宠物到屏幕任意位置
- 👣 **脚印轨迹** - 移动时留下渐隐的脚印效果
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
│   └── preload.cjs       # 预加载脚本
├── src/
│   ├── components/
│   │   └── DesktopPet/
│   │       └── index.vue # 桌面宠物组件
│   ├── App.vue           # 根组件
│   ├── main.ts           # 入口文件
│   └── style.css         # 全局样式
├── public/               # 静态资源
├── CLAUDE.md             # Claude Code 项目说明
└── README.md             # 项目文档
```

## 宠物状态说明

| 状态      | 说明     | 触发方式       |
| --------- | -------- | -------------- |
| idle      | 空闲待机 | 默认状态       |
| walking   | 行走移动 | 随机移动或拖拽 |
| jumping   | 跳跃     | 随机触发       |
| sleeping  | 睡觉     | 随机触发       |
| happy     | 开心     | 点击宠物       |
| crying    | 大哭     | 随机触发       |
| angry     | 生气     | 随机触发       |
| fallen    | 摔倒     | 点击宠物       |
| scared    | 惊吓     | 点击宠物       |
| thinking  | 思考     | 随机触发       |
| smug      | 得意     | 点击宠物       |
| shy       | 害羞     | 点击宠物       |
| confused  | 疑惑     | 随机触发       |
| hello     | 打招呼   | 随机触发       |
| sneeze    | 打喷嚏   | 随机触发       |
| yawn      | 打哈欠   | 随机触发       |
| scratch   | 挠头     | 随机触发       |
| celebrate | 庆祝     | 点击宠物       |
| peek      | 偷看     | 随机触发       |

## 交互方式

- **单击宠物**: 触发随机反应（开心、惊吓、摔倒、得意、害羞、庆祝）
- **拖拽宠物**: 将宠物移动到屏幕任意位置
- **托盘图标**: 点击显示/隐藏宠物，右键显示菜单

## 许可证

MIT
