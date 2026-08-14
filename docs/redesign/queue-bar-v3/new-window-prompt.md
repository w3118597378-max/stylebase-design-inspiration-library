# 新窗口执行指令

在新 Codex 窗口打开 `E:\Stylebase`，复制下面内容：

```text
请在 E:\Stylebase 项目中执行底部 Codex 队列 V3 美化。

先完整阅读：
1. E:\Stylebase\docs\redesign\queue-bar-v3\implementation-plan.md
2. E:\Stylebase\DESIGN.md
3. E:\Stylebase\docs\redesign\playful-handdrawn\final-design.png
4. E:\Stylebase\docs\redesign\playful-handdrawn\side-by-side-comparison.png
5. E:\Stylebase\docs\redesign\playful-handdrawn\desktop-current.png

本轮已经确认并锁定四张角色资产：
- E:\Stylebase\public\assets\illustrations\queue-roles-v1\queue-role-analyzing.png
- E:\Stylebase\public\assets\illustrations\queue-roles-v1\queue-role-waiting.png
- E:\Stylebase\public\assets\illustrations\queue-roles-v1\queue-role-complete.png
- E:\Stylebase\public\assets\illustrations\queue-roles-v1\queue-role-error.png

禁止重新生成、修改或覆盖这些资产。

任务边界：
- 只修改底部 Codex 队列。
- 不改顶部导航、左侧导航、中央素材区、右侧检查器和后端功能。
- 保留队列轮询、排序、进度、错误、重试和展开收起行为。
- 保留原生 JavaScript，不迁移 React/Vue，不引入大型组件或动画库。

当前工作区存在其他任务留下的未跟踪图片、HTML、output 和临时文件：
- 不要删除。
- 不要修改。
- 不要提交。
- 不要执行 git clean、reset 或覆盖性 checkout。

执行顺序：
1. 检查 git status，保护现有修改。
2. 创建或切换到 codex/queue-bar-v3 分支。
3. 运行 npm run validate，并捕获 1536、1180、920、640、390px 当前队列截图。
4. 现在只执行“阶段 1：角色接入与状态映射”。
5. 提取状态到角色资产的纯函数并补充测试。
6. 将四张确认资产接入对应状态，但暂时不要重构队列布局和样式。
7. 运行测试，展示等待、分析、完成、错误四种状态的真实截图。
8. 完成后暂停等待我确认，不要直接进入阶段 2。

后续只有在我确认后，才依次执行：
- 阶段 2：摘要条与卡片结构。
- 阶段 3：四状态视觉系统。
- 阶段 4：响应式和展开状态。
- 阶段 5：完整验证和代码审查。

建议使用：
- impeccable：对照最初设计精修视觉层级。
- Playwright：真实状态与多断点截图。
- make-interfaces-feel-better：卡片密度、间距和交互细节。
- 代码审查：JavaScript/CSS 修改后的功能、可访问性和维护性。

现在只执行安全基线和阶段 1，不要扩大范围。
```

