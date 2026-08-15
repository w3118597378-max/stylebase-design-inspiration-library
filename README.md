# Stylebase ｜ 设计灵感数据库

<img align="right" height="96px" src="public/assets/illustrations/648d8aed-99e7-4b23-bb2c-62364faeee0a.png" alt="Stylebase 吉祥物:戴着蓝色帽子的星星" />

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D24-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey.svg)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)

把散落的网页、UI、产品与品牌设计截图,整理成可搜索、可分析、可转成实现提示词的本地数据库。图片与数据只留在自己电脑,只有你主动按下「送交 Codex」时,选中的图片才会交给已登录的 Codex CLI 分析。

![Stylebase 主界面](docs/screenshots/stylebase-hero.png)

## 特色

- **本地优先,数据自己管** — 图片与 SQLite 只存在本机,不调用 AI 就完全离线;不对局域网或互联网公开。
- **零依赖,clone 即用** — 没有第三方 npm 依赖,不需要 `npm install`,启动即用。
- **AI 分析,一张图变实现提示** — 选图按「送交 Codex」,得到 Visual DNA、色板、构图与字体描述、实现建议与 Prompt Kit。
- **手绘风工作台** — 素材网格、分析队列、检查器,从收藏、分析到落地一条线。
- **完整整理工具** — 全文搜索、领域与风格筛选、星级评分、收藏与回收站。

## 快速开始

需求:Windows 10／11、Node.js 24 或更新版本。零第三方依赖,不需要 `npm install`。

```powershell
npm.cmd start
```

打开 <http://127.0.0.1:4177>,把图片拖进窗口,或放到 `library/inbox` 文件夹后按「重新扫描」。

要用 AI 分析时,先安装并登录 Codex CLI:

```powershell
npm.cmd install -g @openai/codex
codex login
```

## 使用流程

```text
图片导入
  → 本地扫描与 SHA-256 去重
  → SQLite 索引
  → 浏览／搜索／人工补充来源
  → 主动按「送交 Codex」
  → 单工分析队列
  → JSON Schema 验证
  → Visual DNA／色板／Prompt Kit 回写
```

1. 把图片放进 `library/inbox`(可建立子文件夹),或直接拖进窗口／粘贴剪贴板。
2. 在 Stylebase 按「重新扫描」。
3. 选中图片后按「送交 Codex」;同一时间只执行一个分析任务。
4. 完成后检查并修正 AI 分类、描述与提示词。
5. 补上来源、作者与授权备注,避免把灵感误认成可直接复制的资产。

## 数据与隐私

```text
stylebase-design-inspiration-library/
├─ library/inbox/       原始图片;Git 默认忽略
├─ data/catalog.sqlite  本地 SQLite;Git 默认忽略
├─ public/              HTML、CSS、浏览器代码
├─ src/                 数据库、扫描与 Codex Agent 接口
├─ tests/               自动化测试
└─ docs/                架构、隐私与疑难排解
```

- 导入、扫描、搜索不会调用 AI;只有按「送交 Codex」才会把该张图片传给 Codex 服务。
- Stylebase 不保存 API Key,沿用本机 Codex CLI 的登录状态。
- Agent 任务采用一次性 session、只读 sandbox 与严格 JSON Schema。
- `data/`、`.env`、SQLite 文件与 `library/inbox` 图片都不会提交到 Git。
- 请勿分析机密、个人资料或没有权利上传的图片。

更多说明请读[数据、隐私与图片权利](docs/privacy-and-content-rights.md)。

## 备份

先停止 Stylebase,再备份 `library/`(原始图片)与 `data/`(SQLite 索引与分析结果);还原时把两个文件夹放回同一位置即可。原始图片是主要数据来源,缺少数据库时可重新扫描,但已有的分析与人工字段需从备份还原。

## 开发与验证

```powershell
npm.cmd run check        # 语法检查
npm.cmd test             # 单元测试
npm.cmd run validate     # 完整验证:check + test + smoke + release 检查
```

`validate:release` 会检查必要文件、Markdown 内部链接、版本与授权,并阻止 `.env`、SQLite、图片素材或常见 Token 格式被包进公开版本。

## 已知边界

- 目前以 Windows 10／11、Node.js 24 为主要验证环境。
- 支持 JPG、JPEG、PNG、WebP、GIF,不处理视频与 PDF。
- AI 分析是可编辑的设计观察,不代表事实、权利状态或专业判断。
- `node:sqlite` 在当前 Node 版本可能显示 ExperimentalWarning;项目测试会验证所需功能。

## 授权

代码与文档采用 [MIT License](LICENSE)。

你导入的图片不会因为放进 Stylebase 就自动采用 MIT。图片仍受原作者、来源平台与个别授权条款约束;公开分享前请自行确认权利。

## 文档

- [系统架构与 Agent Workflow](docs/architecture.md)
- [数据、隐私与图片权利](docs/privacy-and-content-rights.md)
- [疑难排解](docs/troubleshooting.md)
- [自动验证与人工验收](docs/verification.md)

## 致谢

本项目衍生自 [Winston-10xAI-Toolspack](https://github.com/Winston774/Winston-10xAI-Toolspack/tree/main/weeks/2026/2026-w31-stylebase-design-inspiration-library/completed/stylebase-design-inspiration-library) 中的 Stylebase 设计灵感数据库示例项目(2026-W31 SKOOL 开源项目, [MIT License](LICENSE))。在此基础上进行 UI 重塑(手绘风改版、中英双语界面、检查器／队列／顶栏重设计)与功能扩展(拖拽导入、星级评分、回收站)。

## 版本

- `v1.2.0`／2026-08:中英双语界面、手绘风改版、软删除与回收站。

完整记录见 [CHANGELOG.md](CHANGELOG.md)。
