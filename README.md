# Stylebase ｜ 設計靈感資料庫

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D24-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey.svg)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)

把散落的網頁、UI、產品與品牌設計截圖,整理成可搜尋、可分析、可轉成實作提示詞的本地資料庫。圖片與資料只留在自己電腦,只有你主動按下「送交 Codex」時,選取的圖片才會交給已登入的 Codex CLI 分析。

![Stylebase 主介面](docs/screenshots/stylebase-hero.png)

## 特色

- **本地優先,資料自己管** — 圖片與 SQLite 只存在本機,不呼叫 AI 就完全離線;不對區域網路或網際網路公開。
- **零依賴,clone 即用** — 沒有第三方 npm 依賴,不需要 `npm install`,啟動即用。
- **AI 分析,一張圖變實作提示** — 選圖按「送交 Codex」,得到 Visual DNA、色票、構圖與字體描述、實作建議與 Prompt Kit。
- **手繪風工作台** — 素材網格、分析佇列、檢查器,從收藏、分析到落地一條線。
- **完整整理工具** — 全文搜尋、領域與風格篩選、星級評分、收藏與資源回收筒。

## 快速開始

需求:Windows 10／11、Node.js 24 或更新版本。零第三方依賴,不需要 `npm install`。

```powershell
npm.cmd start
```

開啟 <http://127.0.0.1:4177>,把圖片拖進視窗,或貼到 `library/inbox` 資料夾後按「重新掃描」。

要用 AI 分析時,先安裝並登入 Codex CLI:

```powershell
npm.cmd install -g @openai/codex
codex login
```

## 使用流程

```text
圖片匯入
  → 本地掃描與 SHA-256 去重
  → SQLite 索引
  → 瀏覽／搜尋／人工補充來源
  → 主動按「送交 Codex」
  → 單工分析佇列
  → JSON Schema 驗證
  → Visual DNA／色票／Prompt Kit 回寫
```

1. 把圖片放進 `library/inbox`(可建立子資料夾),或直接拖進視窗／貼上剪貼簿。
2. 在 Stylebase 按「重新掃描」。
3. 選取圖片後按「送交 Codex」;同一時間只執行一個分析工作。
4. 完成後檢查並修正 AI 分類、描述與提示詞。
5. 補上來源、作者與授權備註,避免把靈感誤認成可直接複製的資產。

## 資料與隱私

```text
stylebase-design-inspiration-library/
├─ library/inbox/       原始圖片;Git 預設忽略
├─ data/catalog.sqlite  本地 SQLite;Git 預設忽略
├─ public/              HTML、CSS、瀏覽器程式
├─ src/                 資料庫、掃描與 Codex Agent 介面
├─ tests/               自動測試
└─ docs/                架構、隱私與疑難排解
```

- 匯入、掃描、搜尋不會呼叫 AI;只有按「送交 Codex」才會把該張圖片傳至 Codex 服務。
- Stylebase 不保存 API Key,沿用本機 Codex CLI 的登入狀態。
- Agent 工作採一次性 session、唯讀 sandbox 與嚴格 JSON Schema。
- `data/`、`.env`、SQLite 檔與 `library/inbox` 圖片都不會提交到 Git。
- 請勿分析機密、個資或沒有權利上傳的圖片。

更多說明請讀[資料、隱私與圖片權利](docs/privacy-and-content-rights.md)。

## 備份

先停止 Stylebase,再備份 `library/`(原始圖片)與 `data/`(SQLite 索引與分析結果);還原時把兩個資料夾放回同一位置即可。原始圖片是主要資料來源,缺少資料庫時可重新掃描,但既有分析與人工欄位需從備份還原。

## 開發與驗證

```powershell
npm.cmd run check        # 語法檢查
npm.cmd test             # 單元測試
npm.cmd run validate     # 完整驗證:check + test + smoke + release 檢查
```

`validate:release` 會檢查必要文件、Markdown 內部連結、版本與授權,並阻止 `.env`、SQLite、圖片素材或常見 Token 格式被包進公開版本。

## 已知邊界

- 目前以 Windows 10／11、Node.js 24 為主要驗證環境。
- 支援 JPG、JPEG、PNG、WebP、GIF,不處理影片與 PDF。
- AI 分析是可編輯的設計觀察,不代表事實、權利狀態或專業判斷。
- `node:sqlite` 在目前 Node 版本可能顯示 ExperimentalWarning;專案測試會驗證所需功能。

## 授權

程式碼與文件採 [MIT License](LICENSE)。

你匯入的圖片不會因為放進 Stylebase 就自動改採 MIT。圖片仍受原作者、來源平台與個別授權條款約束;公開分享前請自行確認權利。

## 文件

- [系統架構與 Agent Workflow](docs/architecture.md)
- [資料、隱私與圖片權利](docs/privacy-and-content-rights.md)
- [疑難排解](docs/troubleshooting.md)
- [自動驗證與人工驗收](docs/verification.md)

## 版本

- `v1.2.0`／2026-08:中英雙語介面、手繪風改版、軟刪除與回收站。

完整紀錄見 [CHANGELOG.md](CHANGELOG.md)。
