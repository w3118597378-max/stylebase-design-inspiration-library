# 阶段 0：功能与视觉基线

日期：2026-08-14  
分支：`codex/inspector-paper-v3`

## 保护结果

- 原分支为 `polish/analysis-inspector`；工作区仅有未追踪的 `docs/redesign/inspector-paper-v3/`，未修改、未暂存、未提交。
- 已从当前 HEAD 新建 `codex/inspector-paper-v3`，以保留用户工作区内容。
- `npm run validate` 通过：语法检查、9 项测试、HTTP 冒烟检查与 204 项发布校验均通过。

## 真实检查器取样

- 服务：`http://127.0.0.1:4177`
- 数据：24 条素材、24 条完成分析；选择了 `Barclay website in 1997`（830 × 600 PNG）。
- 内容：96% 信心度、完整分析摘要、视觉 DNA、色票、为何有效、Recipe、四组 Prompt、来源／收藏／metadata／技术证据。
- 真实内容截图（不使用空状态替代）：
  - [1440px 桌面](../../../output/playwright/inspector-baseline-desktop-1440.png)
  - [1180px 窄桌面](../../../output/playwright/inspector-baseline-narrow-1180.png)
  - [390px 移动端](../../../output/playwright/inspector-baseline-mobile-390.png)

## 观察到的现状

1. 当前已有活页环边缘，但 `public/assets/illustrations/binder-rings.png` 仅 182 字节，属于占位素材；它没有形成可靠的装订结构。
2. 四个章节使用同一排紧凑按钮；有跳转功能，但不具备章节索引的空间层级。
3. 预览、DNA、色票、Recipe 与资料管理大多采用相同的白纸、细线、等距分隔，长内容的扫描节奏偏平。
4. 390px 已保持全屏层和底部主操作，功能方向正确；设计稿只改变其视觉拓扑，不改变关闭、返回、复制、metadata 或滚动逻辑。

## 不在本阶段做的事

- 不改 `public/`、`src/`、API、数据库、DOM ID、事件或现有功能。
- 不引入 React、Vue、Lit 或任何运行时依赖。
- 不生成或引用外部素材；阶段 2 前不写入生产素材目录。
