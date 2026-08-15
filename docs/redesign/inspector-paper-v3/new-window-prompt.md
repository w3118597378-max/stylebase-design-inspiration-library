# 新窗口执行指令

把下面整段复制到新的 Codex 窗口：

```text
请在 E:\Stylebase 项目中执行右侧分析检查器 V3 纸张化美化。

先完整阅读：
1. E:\Stylebase\AGENTS.md（如果存在）
2. E:\Stylebase\docs\redesign\inspector-paper-v3\implementation-plan.md
3. E:\Stylebase\DESIGN.md
4. E:\Stylebase\docs\redesign\playful-handdrawn\README.md
5. E:\Stylebase\docs\redesign\playful-handdrawn\inspiration-sources.md
6. E:\Stylebase\docs\redesign\playful-handdrawn\functional-regression-checklist.md

这是分阶段任务，不要一次性重写页面，也不要擅自扩大到整站。

设计目标：
- 只优化右侧分析检查器和其章节导航。
- 做成“视觉研究活页夹”：暖白纸张、硬纸板衬底、真实活页环、右缘彩色分页索引、轻量纸纹和手绘圈注。
- 手绘、插画、涂鸦、俏皮，但仍然简洁、清楚、适合长内容阅读。
- 不改变分析、复制、收藏、metadata、关闭、移动端返回等现有功能。

技术边界：
- 允许选择更合适的技术栈或组件，但必须先做收益与回归风险判断。
- 默认保留现有原生 JS 和后端，只把检查器隔离成模块。
- 不要为了视觉效果整站迁移 React/Vue。
- Lit 只能在计划规定的决策门通过后局部引入。
- 优先使用 CSS、静态 SVG 和小型 WebP；Rough.js 只考虑用于生成静态 SVG。

执行顺序：
1. 先运行 git status，保护现有用户修改。
2. 如果当前不在专用分支，创建 codex/inspector-paper-v3；不要 reset、checkout 或覆盖已有改动。
3. 运行 npm run validate，建立功能基线。
4. 启动项目，使用 Playwright 捕获一个具有完整分析内容的右栏选中态，同时保留桌面和移动端截图。
5. 先完成计划中的“阶段 1：高保真设计稿”，将设计稿和标注保存到 E:\Stylebase\docs\redesign\inspector-paper-v3\。
6. 展示设计稿、素材清单、技术路线和前后对比，等待我确认。
7. 在我明确确认设计稿之前，不要修改页面实现代码。
8. 确认后，严格按照 implementation-plan.md 的阶段 2 到阶段 7 逐步执行；每个阶段完成后截图、运行相应测试并汇报，再进入下一阶段。

素材要求：
- 先检查 E:\Stylebase\library\ 和项目现有灵感库。
- 使用混合实现：代码负责布局、文字、状态、分页标签和响应式；生成素材负责纸纹、铅笔笔触、胶带、纸边和装饰质感。
- 先生成少量候选素材并单独预览，经确认后再接入页面；不要把整张检查器或带文字的导航生成成背景图片。
- 若使用网络素材，只能使用授权明确的 MIT、OFL、CC0 或兼容素材，并写入 asset-licenses.md。
- 不要嵌入授权不明的字体或图片。

建议使用的能力：
- impeccable：设计诊断、视觉方向与最终打磨。
- imagegen：生成纸张纹理或必要的透明装饰素材。
- frontend-design / make-interfaces-feel-better：检查层级、间距、交互细节。
- Playwright：真实内容状态的桌面与移动端视觉验收。
- 代码审查：任何 JavaScript/CSS 修改完成后检查功能、可访问性和维护性。

现在只执行阶段 0 和阶段 1：建立基线并输出右侧检查器高保真设计稿。不要开始页面代码改造。
```
