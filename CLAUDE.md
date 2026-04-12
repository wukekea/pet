# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 语言要求

**所有文档和代码注释必须使用中文编写，除非是专有名词（如 API、JSON、npm 等）。**

## 项目概述

数字笔记网页应用 - 一个基于思维导图布局的知识笔记管理系统。

## 技术栈

- **前端框架**: Vue 3
- **思维导图**: AntV X6
- **Markdown 渲染**:
- **数据存储**: LocalStorage（后续扩展为后端数据库）
- **构建工具**: Vite
- **国际化**: Vue I18n
- **状态管理**: Pinia
- **样式方案**: Tailwind CSS

## 常用命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 代码检查
npm run lint
```

## 项目架构

```
note/
├── src/
│   ├── components/      # Vue 组件
│   │   ├── MindMap/      # 思维导图组件（基于 AntV X6）
│   │   ├── Editor/       # Markdown 编辑器组件
│   │   ├── Toolbar/      # 工具栏组件
│   │   └── ThemeSwitch/  # 日夜模式切换组件
│   ├── stores/           # Pinia 状态管理
│   │   ├── notes.ts      # 笔记数据 store
│   │   └── app.ts        # 应用配置 store（语言、主题）
│   ├── utils/            # 工具函数
│   │   ├── storage.ts    # 存储抽象层（支持切换 LocalStorage/后端）
│   │   └── i18n.ts       # 国际化配置
│   ├── locales/          # 语言文件
│   │   ├── zh-CN.json    # 中文语言包
│   │   └── en-US.json    # 英文语言包
│   ├── types/            # TypeScript 类型定义
│   ├── App.vue           # 根组件
│   └── main.ts           # 入口文件
├── public/               # 静态资源
└── index.html            # HTML 入口
```

## 界面设计规范

### 整体风格

- 风格定位：圆润柔和
- 圆角：使用较大的圆角值（rounded-lg 或 rounded-xl）
- 阴影：柔和的阴影效果，营造层次感

### 颜色方案

#### 日间模式（默认）

- 主色调：蓝色系
- 背景色：白色/浅灰色
- 文字色：深灰色
- 强调色：蓝色（用于按钮、高亮等）

#### 夜间模式

- 背景色：深灰/近黑色
- 文字色：浅灰色/白色
- 强调色：浅蓝色

### CSS 变量定义

```css
/* 日间模式 */
--bg-primary: #ffffff;
--bg-secondary: #f3f4f6;
--text-primary: #1f2937;
--text-secondary: #6b7280;
--accent-color: #3b82f6;

/* 夜间模式 */
--bg-primary: #1f2937;
--bg-secondary: #111827;
--text-primary: #f9fafb;
--text-secondary: #d1d5db;
--accent-color: #60a5fa;
```

### 间距规范

- 组件内边距：p-4 到 p-6
- 组件间距：m-4 或 gap-4
- 容器边距：px-6 py-4

### 字体规范

- 字体族：使用系统默认字体栈
- 标题：text-lg 到 text-2xl，font-semibold
- 正文：text-base，font-normal

## 核心功能模块

### 1. 国际化（i18n）

- 默认语言：中文
- 支持通过按钮切换中/英文
- 使用 Vue I18n 实现

### 2. 主题切换

- 默认模式：日间模式
- 支持通过按钮切换日间/夜间模式
- 使用 CSS 变量实现主题切换

### 3. 思维导图展示

- 使用 AntV X6 实现节点式布局
- 支持节点的增删改查
- 节点之间建立父子关系，形成知识树

### 4. Markdown 编辑

- 双击节点打开编辑器
- 支持标准 Markdown 语法
- 实时预览

### 5. 数据持久化

- 当前使用 LocalStorage 存储笔记数据
- 设计存储抽象层，便于后续切换到后端数据库
- 数据结构：
  ```typescript
  interface NoteNode {
    id: string;
    title: string;
    content: string; // Markdown 内容
    children: string[]; // 子节点 ID 列表
    parentId?: string; // 父节点 ID
    createdAt: number;
    updatedAt: number;
  }
  ```

## 开发注意事项

1. 所有用户界面文本默认中文，通过 i18n 配置多语言支持
2. 节点 ID 使用 UUID 生成
3. 数据变更时自动保存
4. 思维导图支持拖拽和缩放操作
5. 存储层设计为可插拔，便于后续迁移到后端数据库
6. 主题切换使用 CSS 变量，确保样式一致
7. 使用 Tailwind CSS 编写样式，遵循上述设计规范
8. 组件圆角统一使用 rounded-lg 或 rounded-xl
9. 阴影效果使用 shadow-md 或 shadow-lg，保持柔和

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

### 说明

`/frontend-design` skill 专门用于确保前端界面设计质量，会生成：

- 符合设计规范的样式
- 优秀的用户体验
- 响应式设计
- 统一的视觉风格
