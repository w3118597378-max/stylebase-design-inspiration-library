# 新窗口执行指令

在新的 Codex 窗口中打开 `E:\Stylebase`，然后复制：

```text
请在 E:\Stylebase 项目中执行顶部导航栏 V3 精改。

先完整阅读：
1. E:\Stylebase\docs\redesign\topbar-v3\implementation-plan.md
2. E:\Stylebase\DESIGN.md
3. E:\Stylebase\docs\redesign\playful-handdrawn\final-design.png
4. E:\Stylebase\docs\redesign\playful-handdrawn\side-by-side-comparison.png
5. E:\Stylebase\docs\redesign\playful-handdrawn\desktop-current.png

任务边界：
- 只精改顶部导航栏的品牌区、搜索框、汇入/扫描操作组和送交 Codex 按钮。
- 不改左侧导航、中央素材区、右侧检查器、底部队列和后端功能。
- 恢复最初设计中的“手绘桌面窗口工具栏”，不要重新发明另一套风格。
- 保留搜索、汇入、扫描、送交 Codex 的全部现有功能、ID 和事件行为。
- 不整站迁移 React/Vue，不引入大型组件库。

当前工作区可能存在与右侧检查器实验相关的未跟踪图片、HTML、output 和临时文件。这些内容属于其他任务：
- 不要删除。
- 不要修改。
- 不要加入本轮提交。
- 不要为了清理工作区执行 reset、checkout 或 clean。

执行步骤：
1. 检查 git status，保护现有修改。
2. 创建或切换到 codex/topbar-v3 分支。
3. 运行 npm run validate，并用 Playwright 捕获 1536、1180、920、640、390px 当前截图。
4. 只执行计划中的“阶段 1：品牌区”：解除品牌区和 184px 左侧栏宽度的绑定，重建窗口灯、吉祥物和 STYLEBASE 黑色铭牌。
5. 不要同时修改搜索框和操作按钮。
6. 完成阶段 1 后运行测试、输出五档截图和原稿对比，然后暂停等待我确认。
7. 我确认后，再依次执行阶段 2、3、4、5；每一阶段都先截图确认，不要一次性全部改完。

需要使用：
- impeccable：对照初始设计诊断视觉偏差。
- Playwright：真实浏览器和多断点截图。
- make-interfaces-feel-better：精修间距、状态和触感。
- 代码审查：HTML/CSS/JS 修改后的功能和可访问性检查。

现在只执行安全基线和阶段 1。不要扩大范围。
```

