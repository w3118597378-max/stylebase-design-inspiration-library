# Inspector Light Table v4 — 改版记录

日期：2026-08-14
分支：`codex/inspector-lightbox`

## 方向

「看片台·放大镜」(Light table + loupe)，构图 A「正片主导」已由用户批准（2026-08-14）。

检查器从「活页夹 + 蓝色条状导航」重构为设计师的看片台：
- 深炭台沿 + 暖白发光玻璃台面（inset 阴影实现台沿，不随滚动移动）
- 预览图像正片一样透光，是绝对主角（微弱暖光晕）
- 四章节 = 台沿四色工具：黄标签(概览) / 紫卡(视觉分析) / 蓝尺(实作输出) / 绿档案夹(资料管理)
- 当前章节被铅笔圈放大镜圈住（放大镜随导航滚动跟随）
- 空状态：角色站在台面上，放大镜在角落待命

## 实现边界（功能零改动）

- 未动 `server.mjs`、`src/`、DOM ID、data-* 钩子、键盘交互、移动端行为、API
- 全部为 CSS 层实现：`public/styles.css` tokens + inspector 区块
- `public/index.html`：仅更新方向契约注释
- `DESIGN.md`：Components/Layout 描述同步为 light table
- CSP 约束遵守：无内联 style，动态样式走 CSSOM/class 切换

## 关键坑（记录给后续）

1. **`overflow-x: auto` 会裁掉按钮外溢的伪元素**：放大镜最初定位在按钮外(-9px)被 nav 的滚动容器裁掉；改为按钮内侧右下角印章式定位(right:3px bottom:3px)后可见。
2. **sticky 顶栏 + 工具条盖住章节**：`scrollIntoView({block:"start"})` 会把章节滚到容器顶部，被 sticky 的 top(54px)+nav(~62px)遮住；加 `scroll-margin-top: 116px` 修复，零 JS 改动。
3. **hover 规则覆盖工具底色**：`button:hover` 的蓝色 soft 会盖掉黄/紫/蓝/绿；用 `:not(.is-current)` 排除当前项。
4. **`background: inherit` 会继承父级**：修复当前项 hover 时用了 inherit，实际会继承 nav 的渐变而非工具色，改回只改 border-color。
5. **--sunflower 变量未定义**（历史遗留无效变量），顺手修为 --yellow。
6. **prompt-toggle/prompt-copy/swatch 与 nav 按钮共享基础样式**：重构时先拆散导致它们丢了边框/背景，需单独恢复共享基础块（保持 1px 边框原样，nav 按钮用 2px）。

## 验收

- `npm run check` ✅
- `npm test` 25/25 ✅
- `npm run validate`：smoke ✅ + release 306 项/182 文件 ✅
- impeccable detect.mjs：无 error，2 warning 均为既有代码（queue 动画 easing、Cascadia font）
- 截图验证：桌面 1440（空状态 + 有内容 + 章节跳转）、移动端 390 全屏层 ✅
- 交互回归：素材选中、章节跳转、放大镜跟随、复制 prompt 均正常 ✅

## 截图

- 空状态：`output/playwright/inspector-lightbox-empty.png`
- 选中(概览)：`output/playwright/inspector-lightbox-selected2.png`
- 章节跳转(视觉)：`output/playwright/inspector-lightbox-visual2.png`
- 有分析素材(视觉)：`output/playwright/inspector-lightbox-barclay-visual.png`
- 移动端：`output/playwright/inspector-lightbox-mobile.png`
- 构图对比：`comp-vs-implement.png`（本目录）
