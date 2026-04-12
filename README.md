# 数字笔记

一个基于思维导图布局的知识笔记管理系统，采用圆润柔和的设计风格。

## 功能特性

- 🧠 **思维导图布局** - 使用节点式管理知识，直观展示知识点之间的关联
- 📝 **Markdown 编辑** - 支持标准 Markdown 语法，实时预览渲染
- 🌓 **主题切换** - 支持日间/夜间模式，保护视力
- 🌍 **多语言** - 内置中英文支持
- 💾 **本地存储** - 数据保存在 LocalStorage 中，随时可用
- 🎨 **圆润设计** - 柔和的圆角和阴影效果，视觉体验舒适

## 技术栈

- **前端框架**: Vue 3
- **思维导图**: AntV X6
- **Markdown 渲染**: marked + DOMPurify
- **状态管理**: Pinia
- **样式方案**: Tailwind CSS
- **国际化**: Vue I18n
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

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看项目

### 代码检查

```bash
npm run lint
```

## 构建部署

### 生产构建

```bash
npm run build
```

构建完成后，产物将输出到 `dist` 目录。

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
note/
├── src/
│   ├── components/      # Vue 组件
│   │   ├── MindMap/      # 思维导图组件（基于 AntV X6）
│   │   ├── Editor/       # Markdown 编辑器组件
│   │   ├── Toolbar/      # 工具栏组件
│   │   ├── ThemeSwitch/  # 日夜模式切换组件
│   │   └── NotePreview/  # 笔记预览组件
│   ├── stores/           # Pinia 状态管理
│   │   ├── notes.ts      # 笔记数据 store
│   │   └── app.ts        # 应用配置 store（语言、主题）
│   ├── utils/            # 工具函数
│   │   ├── storage.ts    # 存储抽象层
│   │   └── i18n.ts       # 国际化配置
│   ├── locales/          # 语言文件
│   │   ├── zh-CN.json    # 中文语言包
│   │   └── en-US.json    # 英文语言包
│   ├── types/            # TypeScript 类型定义
│   ├── App.vue           # 根组件
│   └── main.ts           # 入口文件
├── public/               # 静态资源
├── CLAUDE.md             # Claude Code 项目说明
└── README.md             # 项目文档
```

## 使用说明

1. **创建节点** - 点击工具栏的添加按钮创建新笔记节点
2. **编辑内容** - 双击节点打开 Markdown 编辑器
3. **建立关联** - 通过节点之间的连线建立知识关联
4. **切换主题** - 点击右上角主题切换按钮切换日间/夜间模式
5. **切换语言** - 点击语言切换按钮切换中/英文

## 许可证

MIT
