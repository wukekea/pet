# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 语言要求

**所有文档和代码注释必须使用中文编写，除非是专有名词（如 API、JSON、npm 等）。**

## 项目概述

桌面宠物应用 - 一个使用 Electron + Vue 3 构建的跨平台桌面宠物应用。

## 技术栈

- **前端框架**: Vue 3
- **桌面框架**: Electron
- **构建工具**: Vite
- **类型检查**: TypeScript

## 常用命令

```bash
# 安装依赖
npm install

# 启动 Web 开发服务器
npm run dev

# 启动 Electron 开发模式
npm run electron:dev

# 构建生产版本
npm run build

# 构建 Electron 应用
npm run electron:build

# 代码检查
npm run lint
```

## 项目架构

```
pet/
├── electron/
│   ├── main.js           # Electron 主进程
│   │                     # - 创建透明窗口
│   │                     # - 系统托盘管理
│   │                     # - 鼠标穿透控制
│   └── preload.cjs       # 预加载脚本
│                         # - 暴露 Electron API 给渲染进程
├── src/
│   ├── components/
│   │   └── DesktopPet/
│   │       └── index.vue # 桌面宠物组件
│   │                     # - 宠物状态管理
│   │                     # - 动画效果
│   │                     # - 拖拽交互
│   │                     # - 脚印轨迹
│   ├── App.vue           # 根组件
│   ├── main.ts           # 入口文件
│   └── style.css         # 全局样式
├── public/               # 静态资源
└── index.html            # HTML 入口
```

## 核心功能模块

### 1. Electron 主进程 (electron/main.js)

- 创建全屏透明窗口
- 窗口始终置顶
- 鼠标穿透控制（宠物区域可交互）
- 系统托盘图标和菜单
- IPC 通信处理

### 2. 桌面宠物组件 (src/components/DesktopPet/index.vue)

#### 宠物状态

支持 20+ 种状态动画：
- 基础状态：idle、walking、jumping、sleeping
- 情绪状态：happy、crying、angry、scared
- 特殊状态：fallen、thinking、smug、shy、confused、hello、sneeze、yawn、scratch、celebrate、peek、chase、hide

#### 交互功能

- **拖拽移动**: 鼠标拖拽宠物到屏幕任意位置
- **点击反应**: 单击宠物触发随机反应
- **脚印轨迹**: 移动时留下渐隐的脚印效果
- **主题适配**: 自动检测并适配系统深色/浅色主题

#### 动画系统

- CSS 动画实现各种状态效果
- requestAnimationFrame 驱动位置更新
- 状态机管理状态切换

### 3. 预加载脚本 (electron/preload.cjs)

通过 contextBridge 暴露安全的 API：
- `setIgnoreMouseEvents(ignore)`: 设置鼠标穿透
- `getScreenSize()`: 获取屏幕尺寸

## 开发注意事项

1. Electron 窗口设置为透明、无边框、始终置顶
2. 默认鼠标穿透，仅在宠物区域禁用穿透
3. 宠物状态使用 localStorage 持久化
4. 动画使用 CSS 实现，性能优化
5. 所有用户界面文本使用中文

## 代码质量

- 每次编辑代码后自动运行格式化、代码检查和类型检查
- 开发完成后使用 `/simplify` 审查代码质量

## 前端组件开发规范

**【重要】所有前端组件开发必须使用 `/frontend-design` skill**

### 触发条件

以下情况必须使用 `/frontend-design` skill：

1. **新建或修改任何 Vue 组件**（.vue 文件）
2. **涉及 UI 界面调整** - 布局、样式、交互
3. **创建新的页面或视图**
4. **修改组件的模板或样式部分**

### 使用方式

```bash
/frontend-design
```

然后在描述中说明需要开发或修改的组件功能。

### 禁止行为

- ❌ 直接使用 Edit/Write 工具修改 Vue 组件的 template 或 style
- ❌ 不使用 frontend-design skill 就创建或修改 UI 组件
