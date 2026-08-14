# Hermes 执行指令

将下面内容复制给 Hermes：

```text
请在 E:\Stylebase 修正底部 Codex 队列的视觉实现。

先完整阅读并严格执行：
E:\Stylebase\docs\redesign\queue-bar-v3\hermes-correction-plan.md

参考设计：
E:\Stylebase\docs\redesign\playful-handdrawn\final-design.png
E:\Stylebase\docs\redesign\playful-handdrawn\side-by-side-comparison.png

四张角色资产已经确认且具有透明通道，禁止重新生成、重新抠图、修改或覆盖：
E:\Stylebase\public\assets\illustrations\queue-roles-v1\queue-role-analyzing.png
E:\Stylebase\public\assets\illustrations\queue-roles-v1\queue-role-waiting.png
E:\Stylebase\public\assets\illustrations\queue-roles-v1\queue-role-complete.png
E:\Stylebase\public\assets\illustrations\queue-roles-v1\queue-role-error.png

当前问题不是素材没有抠图，而是 CSS 的 `.queue-job img` 给角色应用了缩略图的边框、背景、尺寸和 object-fit: cover。必须把缩略图和角色改成独立 class，并删除通用 `.queue-job img` 规则。

这次不要只完成素材接入。必须一次完成：
1. 修正 renderQueue 的缩略图、信息区和角色结构。
2. 角色使用透明背景、object-fit: contain，桌面约 64px。
3. 队列改成上方摘要条、下方任务卡片轨道。
4. 重做标题、状态、百分比和错误摘要的字体层级。
5. 重做进度条，并修正 complete/waiting/analyzing/error 的空进度逻辑。
6. 加入蓝、黄、绿、红四状态样式和克制 CSS 动效。
7. 完成 1536、1180、920、640、390px 响应式。
8. 运行 npm run check、npm test、npm run validate。
9. 使用真实浏览器输出收起、展开、四状态和移动端截图。
10. 进行代码审查并修复高优先级问题。

只修改底部队列。不要修改顶部、左侧、中央素材区、右侧检查器、后端和数据库。

保护当前工作区：不要执行 git clean、git reset 或覆盖性 checkout；不要修改或提交 nav-tool-caddy.png、纸纹实验、inspector-paper、output/imagegen 中间件和临时启动文件。

最终向我展示完整底栏效果和前后对比，不要只汇报代码或角色路径已经替换。
```

