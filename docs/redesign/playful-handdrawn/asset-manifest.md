# 素材清单

建议资产目录：`public/assets/illustrations/` 与 `public/assets/textures/`。

## 必需插画

| 文件 | 用途 | 建议格式 | 约束 |
|---|---|---|---|
| `stylebase-logo.svg` | 顶部 Logo＋独眼星星角色 | SVG | 文字轮廓化或使用可授权字体；需保留纯文字可访问名称 |
| `nav-tool-caddy.svg` | 左栏顶部铅笔、马克笔和尺子工具筒 | SVG | 装饰性，不抢导航标签 |
| `nav-library.svg` | 素材库档案盒 | SVG | 当前态位于黄色缝线贴纸中 |
| `nav-inbox.svg` | 待整理文件托盘 | SVG | 能容纳独立数量徽标 |
| `nav-collections.svg` | 收藏集爱心手账 | SVG | 不使用通用填充心形替代 |
| `nav-queue.svg` | Codex 队列传送带机器人 | SVG | 小尺寸下仍能辨识 |
| `nav-settings.svg` | 设置工具筒与齿轮 | SVG | 保持与其他导航图标相同线重 |
| `mascot-idle.svg` | 空检查器或提示状态 | SVG | 只出现于空白区域 |
| `mascot-waiting.svg` | 队列等待 | SVG | 配合文字和进度条 |
| `mascot-analyzing.svg` | 分析进行中 | SVG | 可有轻量循环动作 |
| `mascot-complete.svg` | 分析完成 | SVG | 绿色完成图形仍需保留 |
| `mascot-error.svg` | 分析错误 | SVG | 红色以外还需具备错误形状 |
| `empty-library.svg` | 素材库空状态 | SVG | 附带导入/扫描动作入口但不把按钮画进图片 |

## 必需纹理

| 文件 | 用途 | 建议格式 | 预算 |
|---|---|---|---|
| `paper-grain.webp` | 页面与笔记本的轻微纸张颗粒 | WebP | 尽量小于 60KB，可平铺，不得影响文字对比度 |

## 可由 CSS / 内联 SVG 完成

- 蓝色蜡笔双圈选中框。
- 墨线边框与轻微不规则角。
- 黄色缝线当前导航贴纸。
- 活页孔、纸夹、星星、箭头、勾选、下划线。
- 色票的颜料笔触遮罩。
- 便签、焦点框和加载铅笔线。

## 字体策略

- 控件、元数据和长文：当前系统中文无衬线字体栈。
- Logo 和短批注：优先制作 SVG 字标。
- 如果引入下载字体，先核实网页嵌入授权；未确认授权前不得提交字体文件。

## 素材制作要求

- SVG 必须压缩并清除编辑器元数据。
- 装饰图片使用空 `alt` 或 `aria-hidden="true"`。
- 角色和导航插画必须共享相同的轮廓粗细、眼睛比例、颜色和颗粒语言。
- 不要用 emoji 代替正式插画资产。
- 首屏新增资产总体建议控制在约 350KB 内。

