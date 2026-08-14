# Hermes：底部 Codex 队列纠偏实施计划

## 1. 任务结论

当前实现只完成了“状态映射到四张角色图片”，没有完成底部队列的组件重构，因此和批准设计稿差距明显。

四张角色资产本身已经正确抠图，均为 512×512 透明 PNG，四角 alpha 为 0。不要重新抠图、重新生成或覆盖资产。

目前角色看起来像矩形图片的直接原因是 CSS 选择器冲突：

- `.queue-mascot` 设置角色为 42×42px。
- 后面的 `.queue-job img` 对卡片内所有 `<img>` 应用 52×70px、边框、背景和 `object-fit: cover`。
- 角色也是 `<img>`，因此 `.queue-job img` 覆盖并污染了角色样式。

本轮需要完成结构、字体、进度条、状态视觉和响应式的一次完整闭环，不再只做单独素材接入。

## 2. 锁定资产

直接使用：

- `public/assets/illustrations/queue-roles-v1/queue-role-analyzing.png`
- `public/assets/illustrations/queue-roles-v1/queue-role-waiting.png`
- `public/assets/illustrations/queue-roles-v1/queue-role-complete.png`
- `public/assets/illustrations/queue-roles-v1/queue-role-error.png`

禁止：

- 重新调用图像生成。
- 修改、裁切或覆盖以上文件。
- 使用 `output/imagegen/queue-roles-v1` 中的 source/alpha 中间文件。
- 给角色图片增加白底、黑底、边框、卡片背景或 `object-fit: cover`。

## 3. 工作区保护

当前分支应为 `codex/queue-bar-v3`。开始前：

1. 运行 `git branch --show-current` 和 `git status --short`。
2. 不执行 `git clean`、`git reset`、`git checkout --` 或任何覆盖其他任务文件的操作。
3. `public/assets/illustrations/nav-tool-caddy.png` 的修改不属于本任务，不要修改或提交。
4. `docs/redesign/inspector-paper-v3/`、纸纹实验文件、`tmp-start-server.*` 和无关 `output/` 内容不属于本任务。
5. 本轮只允许修改或新增：
   - `public/app.js`
   - `public/styles.css`
   - `public/queue-role.js`
   - `tests/queue-role.test.mjs`
   - 必要的新队列测试文件
   - `docs/redesign/queue-bar-v3/` 下的验证截图或说明

## 4. 当前已完成内容

不要重复实现：

- `public/app.js` 已导入 `queueRoleForStatus()`。
- `renderQueue()` 已调用状态映射获取角色路径。
- `public/queue-role.js` 已包含四状态到角色文件的映射。
- `tests/queue-role.test.mjs` 已验证基础映射。

从“结构和样式纠偏”继续。

## 5. HTML/渲染结构修改

修改 `public/app.js` 的 `renderQueue()`。

### 5.1 禁止通用 img 结构

当前缩略图和角色没有明确分工。将输出结构调整为：

```html
<article class="queue-job" data-status="..." data-queue-kind="...">
  <img class="queue-thumbnail" ... />

  <div class="queue-job-info">
    <strong class="queue-job-title">...</strong>
    <div class="queue-status-row">
      <span class="queue-stage">...</span>
      <span class="queue-percent">...</span>
    </div>
    <div class="job-progress" ...>
      <span></span>
    </div>
    <p class="job-error">...</p>
  </div>

  <img class="queue-role" src="..." alt="" aria-hidden="true" />
</article>
```

无缩略图时使用 `.queue-placeholder-thumb`，尺寸与 `.queue-thumbnail` 一致。

### 5.2 角色 class

废弃 `.queue-mascot`，统一改为 `.queue-role`。所有响应式选择器也要同步更新，不能遗留旧 class。

### 5.3 队列视觉状态分类

角色路径和视觉类别不能分别写两套容易漂移的判断。建议让 `public/queue-role.js` 输出配置：

```js
{
  kind: "waiting" | "analyzing" | "complete" | "error",
  asset: "/assets/...png"
}
```

或者保留 `queueRoleForStatus()`，再增加经过同一规范化逻辑的 `queueKindForStatus()`。必须增加测试，确保路径与 kind 一致。

### 5.4 进度值规则

解决以下视觉错误：

- 完成状态没有 progress 时不能显示 28%。应显示 100%。
- 等待状态没有 progress 时应显示 0%，不能播放分析扫描动画。
- 只有分析/运行状态且 progress 为空时使用 indeterminate 动画。
- 错误状态保留最后已知进度；完全没有进度时显示 0%。

建议计算：

```text
complete + null → 100
waiting + null → 0
analyzing + null → indeterminate
error + null → 0
有数值 → clamp 到 0–100
```

进度容器增加合适的 `role="progressbar"`、`aria-valuemin`、`aria-valuemax`；确定进度时提供 `aria-valuenow`，不确定进度时使用状态文本作为标签。

## 6. CSS 纠偏

修改 `public/styles.css`。

### 6.1 必须移除的规则

不得继续存在会影响角色的：

```css
.queue-job img { ... }
```

将缩略图规则限定为：

```css
.queue-thumbnail,
.queue-placeholder-thumb { ... }
```

### 6.2 角色样式

桌面基础样式：

```css
.queue-role {
  align-self: end;
  width: 64px;
  height: 64px;
  border: 0;
  background: transparent;
  object-fit: contain;
  object-position: center bottom;
  filter: none;
}
```

角色允许向卡片顶部越界 3–5px，但 `.queue-track` 不得裁掉角色。

### 6.3 队列栏两行结构

把 `.queue-bar` 从“左侧摘要 + 右侧轨道”改为：

```text
第一行：queue-summary + queue-actions
第二行：queue-track 横跨全宽
```

可继续使用现有 DOM，通过 CSS Grid areas 实现：

```css
.queue-bar {
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-rows: 34px minmax(0, 1fr);
}

.queue-summary { grid-area: 1 / 1; }
.queue-actions { grid-area: 1 / 2; }
.queue-track { grid-area: 2 / 1 / 3 / -1; }
```

收起高度调整为约 136px。展开状态继续使用现有 `.is-queue-expanded` 机制。

摘要条要求：

- 去掉右侧粗竖线。
- 使用横向 flex 排布。
- 队列名、黄色数字徽章、状态摘要、展开图标形成一行。
- `#queue-toggle` 仍是完整可点击 button。
- `.queue-actions` 只在存在重试操作时占位。

### 6.4 卡片结构

桌面：

```css
.queue-job {
  flex: 0 0 238px;
  min-width: 238px;
  height: 90px;
  grid-template-columns: 56px minmax(0, 1fr) 64px;
  gap: 8px;
  padding: 8px;
  overflow: visible;
}
```

卡片使用：

- 2px 石墨边框。
- 克制的不对称圆角。
- 2px 手绘式硬阴影。
- 不旋转卡片。
- Hover 只上移 1px。

### 6.5 字体排版

```text
queue-job-title：12–13px / 700 / 1.25 / 最多两行
queue-stage：10–11px / 650 / 状态色
queue-percent：10–11px / 750 / tabular-nums
job-error：10px / 600 / 最多两行
日期：收起状态隐藏，展开状态才显示
```

不要使用新的手写字体。手绘感由角色、边框和状态细节承担，任务信息保持易读。

### 6.6 进度条

- 位于信息区底部，不允许被角色遮挡。
- 高度 6px。
- 外框约 1.5px 石墨色。
- 底槽使用低对比纸灰色。
- 填充色使用 `--queue-accent`。
- 分析中：钴蓝。
- 等待中：黄色，但 0% 时只显示黄色起点/状态点，不伪造进度。
- 完成：绿色 100%。
- 错误：红色，显示最后进度或 0%。

### 6.7 四状态变量

使用 `data-queue-kind` 设置变量，避免重复长状态选择器：

```css
.queue-job[data-queue-kind="analyzing"] { --queue-accent: var(--blue); }
.queue-job[data-queue-kind="waiting"] { --queue-accent: var(--yellow); }
.queue-job[data-queue-kind="complete"] { --queue-accent: var(--green); }
.queue-job[data-queue-kind="error"] { --queue-accent: var(--red); }
```

状态差异：

- analyzing：蓝色顶线和 indeterminate 扫描。
- waiting：黄色虚线小标签，静态进度。
- complete：绿色完成印章，满进度。
- error：红色边角和可读错误摘要。

## 7. 角色动效

只用 CSS，不引入 GSAP、Lottie、Rive 或其他运行时。

- analyzing：活动任务可做 1–2% 的缓慢呼吸。
- waiting：只在进入等待状态时轻摆一次，不持续摆动。
- complete：状态刚完成时弹跳一次。
- error：警示角色进入时轻微闪动一次。

不得让所有历史完成卡片持续动画。`prefers-reduced-motion: reduce` 下关闭角色动画和扫描位移。

## 8. 响应式

### ≥ 1180px

- 卡片 238px。
- 角色 64px。
- 缩略图 56×70px。

### 920–1179px

- 卡片 210–220px。
- 角色 54–58px。
- 标题仍允许两行。

### 640–919px

- 卡片 190–200px。
- 角色 50px。
- 摘要条隐藏详细说明，保留队列名、数字和展开按钮。

### < 640px

- 卡片 176–184px。
- 角色 46–48px。
- 缩略图约 42×56px。
- 横向 `scroll-snap`。
- 不允许角色、标题和进度条重叠。

必须删除或改写现有把角色缩到 34px 的移动端规则。

## 9. 实施顺序

本次作为一次完整视觉纠偏执行，不在“只换 class”后暂停：

1. 建立现有功能和截图基线。
2. 修正 renderQueue 结构与 class。
3. 修正角色透明渲染和尺寸。
4. 完成摘要条两行布局。
5. 完成卡片网格和字体层级。
6. 修正确定/不确定进度逻辑。
7. 完成四状态视觉。
8. 完成响应式和减少动态效果。
9. 运行测试、真实浏览器验证和代码审查。

中途可以自行迭代，但最终必须一次交付完整底栏，而不是只汇报“角色已经接入”。

## 10. 测试要求

至少覆盖：

- 四种状态映射到正确 asset 和 kind。
- 大小写和空白状态规范化。
- complete + null progress → 100。
- waiting + null progress → 0 且不 indeterminate。
- analyzing + null progress → indeterminate。
- error + null progress → 0。
- 0、0.5、1、50、100、超界进度的归一化。

执行：

```text
npm run check
npm test
npm run validate
```

## 11. 视觉验收

必须提交以下真实浏览器截图：

- 1536px 桌面收起状态，能看到四种角色。
- 1536px 桌面展开状态。
- 920px。
- 640px。
- 390px。
- 与 `docs/redesign/playful-handdrawn/final-design.png` 的底部区域并排对比。

截图必须证明：

- 角色没有矩形底色、边框和裁切。
- 角色约 64px，是卡片视觉组成部分。
- 标题、状态、百分比和进度条排列清楚。
- 四状态可一眼识别。
- 展开、收起、横向滚动和错误重试正常。

## 12. 提交范围

最终只提交：

- 四张已确认角色资产。
- 队列相关 JS/CSS。
- 队列测试。
- 本计划和必要验证资料。

不要提交：

- `output/imagegen/queue-roles-v1/` 中间文件。
- `nav-tool-caddy.png` 的无关修改。
- inspector-paper、纸纹实验、临时启动脚本或其他任务文件。

