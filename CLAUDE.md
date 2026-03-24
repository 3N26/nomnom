# CLAUDE.md

## 项目概述

NomNom 是一个 Chrome 浏览器扩展（Manifest V3），用于收集和批量打开网页链接。

## 技术栈

- **语言**: TypeScript
- **构建**: Vite + @crxjs/vite-plugin
- **测试**: Vitest
- **规范**: ESLint + Prettier
- **API**: Chrome Tabs, Tab Groups, History, Storage, Context Menus

## 项目结构

```
src/
├── shared/                    # 共享模块
│   ├── types/                 # 类型定义
│   │   ├── config.ts          # 配置类型
│   │   ├── messages.ts        # 消息类型
│   │   ├── storage.ts         # 存储类型
│   │   └── hotkey.ts          # 快捷键类型
│   ├── utils/
│   │   └── hotkey.ts          # 快捷键解析/匹配
│   └── services/
│       ├── config.service.ts  # 配置读写
│       └── message.service.ts # 消息发送/监听
├── background/                # 后台 Service Worker
│   ├── services/
│   │   ├── context-menu.ts    # 右键菜单
│   │   ├── tab-group.ts       # 标签组管理
│   │   ├── tab-pool.ts        # 批量打开
│   │   └── history.ts         # 历史过滤
│   └── handlers/
│       ├── message.ts         # 消息处理
│       └── menu-click.ts      # 菜单点击
├── content/                   # 内容脚本
│   └── services/
│       ├── link-collector.ts  # 链接收集
│       └── hotkey-listener.ts # 快捷键监听
└── popup/                     # 弹窗 UI
    ├── components/
    │   └── hotkey-input.ts    # 快捷键录制
    ├── styles/
    │   └── popup.css
    ├── index.html
    └── index.ts
```

## 核心概念

- **Tab Pool**: 每次批量打开的标签数量，避免一次打开过多
- **Link Group**: 从页面收集的相关链接集合
- **TabGroupState**: 标签组进度状态（urls, visited, total）

## 消息通道

```typescript
// Background 通道
BackgroundChannel.LOG           // 日志
BackgroundChannel.GO_FORWARD    // 下一个链接
BackgroundChannel.UPDATE_LINKS  // 更新链接列表
BackgroundChannel.START_VISIT   // 开始访问
BackgroundChannel.CONFIG_UPDATE // 配置更新

// Content 通道
ContentChannel.COLLECT_LINKS          // 收集链接
ContentChannel.COLLECT_UNVISITED_LINKS // 收集未访问链接
```

## 开发命令

```bash
npm run dev        # 开发模式（监听）
npm run build      # 生产构建
npm run typecheck  # 类型检查
npm run lint       # 代码检查
npm run test       # 运行测试
```

## 调试

1. 构建: `npm run build`
2. 打开 `chrome://extensions/`
3. 启用开发者模式
4. 加载 `dist` 目录
5. 后台脚本：点击 "Service Worker" 查看日志
6. 内容脚本：在页面 DevTools Console 查看日志

## 路径别名

```typescript
@shared/*     -> src/shared/*
@background/* -> src/background/*
@content/*    -> src/content/*
@popup/*      -> src/popup/*
```
