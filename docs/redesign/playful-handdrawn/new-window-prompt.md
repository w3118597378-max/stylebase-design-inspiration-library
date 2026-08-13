# 新窗口启动指令

将下面内容完整复制到新的 Codex 窗口：

---

请按照 `docs/redesign/playful-handdrawn/` 中的交接包实施 Stylebase 页面改造。

开始前必须依次阅读：

1. `docs/redesign/playful-handdrawn/README.md`
2. `docs/redesign/playful-handdrawn/implementation-plan.md`
3. `docs/redesign/playful-handdrawn/asset-manifest.md`
4. `docs/redesign/playful-handdrawn/functional-regression-checklist.md`
5. `docs/redesign/playful-handdrawn/inspiration-sources.md`
6. `docs/redesign/playful-handdrawn/final-design.png`
7. `PRODUCT.md`

使用 `$impeccable` 完成改造。最终视觉必须以 `final-design.png` 为基准：A 方案主体布局，结合 B 方案左侧工具筒与黄色贴纸导航。

重要边界：

- 不改变 API、数据库、Codex 分析、搜索、筛选、排序、导入、扫描、收藏和 metadata 保存逻辑。
- 保留现有 DOM ID、事件绑定、键盘操作与移动端检查器行为。
- `public/app.js` 只允许为视觉增加类名或装饰节点，不能重写业务逻辑。
- 插画主要用于导航、状态和空白区域，不能遮挡素材图片与信息。
- 先盘点当前工作树，保留用户已有改动。
- 分批实施，每批后做功能检查；完成后运行 `npm run validate`、桌面/移动截图检查、Impeccable detector 和代码审查。
- 不要发布、部署或提交 Git，除非我另行要求。

请直接开始实施，不要重新询问已经在交接包中确认的设计方向。

---
