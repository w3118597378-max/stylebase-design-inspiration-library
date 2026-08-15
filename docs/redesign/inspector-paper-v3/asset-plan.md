# 阶段 1：素材清单

本清单是阶段 2 的生产计划；本阶段未将任一素材写入 `public/assets/`。

| 素材 | 生产方式 | 预定路径 | 预算 | 用途 |
| --- | --- | --- | ---: | --- |
| 暖白纸纹 | 自制、低对比 SVG 噪声导出 WebP | `public/assets/inspector/paper-grain-warm.webp` | ≤ 35KB | 纸页背景，3%–6% 强度 |
| 活页环 | 自制 SVG | `public/assets/inspector/binder-rings.svg` | ≤ 12KB | 取代 182B 占位 PNG；桌面固定装订 |
| 纸边 | 自制 SVG mask | `public/assets/inspector/paper-edge-mask.svg` | ≤ 6KB | 轻微不规则边缘；不裁切文字或焦点 |
| 纸夹／胶带 | 自制 SVG | `public/assets/inspector/paper-clip.svg` | ≤ 5KB | 每个检查器仅用于预览证据卡 |
| 圈注与箭头 | 自制 SVG sprite | `public/assets/inspector/doodles.svg` | ≤ 10KB | 当前章节与关键结论的轻量标注 |
| 分析印章 | 自制 SVG sprite | `public/assets/inspector/analysis-stamps.svg` | ≤ 8KB | 状态／置信度，文字仍为主信号 |
| 四个分页耳 | CSS 形状 | 无 | 0KB | 章节导航；色彩加文字，不只靠色彩 |

总目标：≤ 76KB，明显低于计划的 250KB 总上限。外部字体、图片和插画均不需要。

## 素材使用规则

- 预览图片继续使用用户已导入的真实素材；不加滤镜，不以装饰遮挡重要图像。
- 每个页面仅允许一个预览夹／胶带和不超过两处铅笔标注。
- 纸纹不能覆盖文字和可点击目标的高对比边界；在 200% 缩放下仍可辨识。
- 所有 SVG 在浅、深工作台背景上独立预览，且以 `aria-hidden` 装饰方式接入。
