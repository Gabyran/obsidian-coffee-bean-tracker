# Coffee Bean Tracker

一个用于 Obsidian 的咖啡豆库存管理插件。

当前功能包括：

- 看板视图
- 多维表格视图
- 一键扣减库存
- 消费记录
- 评分系统

## 开发

安装依赖：

```bash
npm install
```

启动开发构建：

```bash
npm run dev
```

执行生产构建：

```bash
npm run build
```

## 主要文件

- `src/`：TypeScript 源码
- `main.js`：插件构建产物
- `manifest.json`：Obsidian 插件清单
- `styles.css`：样式文件

## 说明

仓库默认忽略：

- `node_modules/`
- `data.json`

其中 `data.json` 属于本地使用数据，不建议提交到版本库。
