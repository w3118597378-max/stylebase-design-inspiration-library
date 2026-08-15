# Wave 1: 收集與整理基礎 (Collect & Organize Basics)

> 分支: `codex/wave1-collect` · 狀態: 方案已批准, 尚未寫碼
> 範圍: 拖拽匯入 / 剪貼簿貼上匯入 / 星級評分 / 軟刪除與資源回收筒

---

## 1. 背景與目標

Stylebase 目前的分析側(Codex 視覺分析 + Visual DNA + Prompt Kit)已領先同類,
但「收集效率」與「整理深度」落後社區標竿(Eagle / Mymind):

- 收集只能「點按鈕 → 選檔案」, 沒有拖拽、沒有 Ctrl+V 貼上截圖(設計師最常用路徑)。
- 整理只有 favorite 二元收藏, 沒有星級, 素材一旦進庫就無法刪除(無任何刪除路徑)。

第一波補齊這四塊, 全部是社區使用頻率最高的功能, 且技術面可控。

## 2. 範圍

### 2.1 包含 (In Scope)

| # | 功能 | 本質 | 難度 |
|---|------|------|------|
| F1 | 拖拽匯入(圖片拖進視窗即匯入) | 純前端, 複用 `importFiles()` | S |
| F2 | 剪貼簿貼上匯入(Ctrl+V 貼截圖) | 純前端, 複用 `importFiles()` | S |
| F3 | 星級評分(0–5 星, 卡片互動 + 篩選) | 1 新列 + PATCH 白名單 + 卡片 UI | S |
| F4 | 軟刪除 + 資源回收筒(恢復 / 徹底刪除) | 1 新列 + 全查詢過濾 + 3 API + 回收筒視圖 | M |

總工作量估計: **1.5 ~ 2.5 個工作日**。

### 2.2 不包含 (Out of Scope, 明確不做)

- 不做 UI 改版 / 新視覺資產: 嚴格複用現有手繪風元件與 DESIGN.md token,
  星級用 SVG stroke 手繪星(加 `icon-star` symbol), 不新增 PNG 角色資產。
- 不做拖拽排序、拖拽到收藏集、多選拖拽。
- 不處理剪貼簿中的文字 / URL(僅圖片 item)。
- 不做批次刪除 / 批次恢復的獨立 API(前端迴圈呼叫單一 API, 個人工具量級足夠)。
- 不做永久刪除的二次確認以外的任何鑑權 / 稽核(維持本機單人假設)。
- 不碰 Codex 佇列、分析流程、CSP 設定。
- 不遷移到 multipart 上傳: 拖拽/貼上仍走現有 base64 `/api/import`(30MB 上限, 截圖場景遠低於此)。

## 3. 現狀勘察(已確認的程式碼事實)

- `assets` 表( `src/db.mjs:426` ): 已有 `favorite`、`file_status`('available'), **無 `rating`、無 `deleted_at`**。
- 素材刪除**完全不存在**: server.mjs 無任何 DELETE 路由; `src/db.mjs:1657` 的 `deleted` 是刪 `collection_items`。
- `PATCH /api/assets/:id`( `server.mjs:369` )白名單: `title, notes, sourceUrl, rightsNote, favorite`。
- `/api/import`( `server.mjs:271` )為 base64 JSON 上傳, `MAX_UPLOAD_BYTES = 30MB`( `src/library.mjs:21` )。
- `public/app.js:2100 importFiles(files)` 已是通用多檔匯入函式 → 拖拽/貼上可直接複用。
- `file_status` 語義 = 磁碟檔案是否存在(掃描維護), 與「使用者刪除」無關 → 軟刪除**必須用獨立 `deleted_at` 列**, 不污染 `file_status`。
- FTS 觸發器 `assets_delete_search`( `src/db.mjs:535` )只處理硬刪除; 軟刪除的記錄仍在 FTS 中 → 查詢層統一過濾。
- 測試: `node:test`, library.test 用臨時目錄 + stub catalog; **db.mjs 的 catalog 目前無直接測試**, 需新建真 SQLite 測試。
- `PRAGMA user_version = 1`( `src/db.mjs:541` ) → 遷移機制已存在, 升到 2。

## 4. 功能設計

### F1 拖拽匯入

- 互動: 拖圖片進視窗 → 素材區出現高亮遮罩(手繪風虛線框, 遵循 DESIGN.md) → 放開即匯入。
- 實作:
  - `window` 級 `dragover`/`dragleave`/`drop` 監聽; 僅當 `e.dataTransfer.types` 含 `Files` 時啟用高亮。
  - `drop` → `importFiles(e.dataTransfer.files)`(既有進度 / 錯誤提示 / 自動選中邏輯全複用)。
  - 非圖片檔案: `importFiles` 已過濾並提示。
- 邊界: 拖拽到「輸入框 / 表單」上不攔截(避免影響文字選取); 只擋視窗其餘區域。

### F2 剪貼簿貼上匯入

- 互動: 複製截圖後在頁面任意處 Ctrl+V → 直接匯入。
- 實作:
  - `document` 級 `paste` 監聽; 掃 `e.clipboardData.items` 找 `type.startsWith("image/")` 的項 → `getAsFile()` → 收集後呼叫 `importFiles`。
  - 檔名生成: `paste-YYYYMMDD-HHMMSS.png`(依 MIME 決定副檔名), 無原始檔名。
- 邊界(關鍵): 若 focus 在輸入框(`search-input`、`notes` 等可編輯元素), **跳過圖片匯入**, 保留原生文字貼上。避免「想貼文字結果匯入一張圖」的破壞性干擾。
- 剪貼簿無圖片 → 靜默忽略, 不彈錯誤。

### F3 星級評分

- 資料: `rating INTEGER NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5)`。
- API: `PATCH /api/assets/:id` 白名單加 `rating`(0–5 整數, 其餘值 400)。
- UI:
  - 素材卡( hover 時)與 Inspector 顯示 5 顆星, 點第 N 顆 = 設 N 分, 點當前分數 = 歸零。
  - 星級為手繪風 SVG stroke 星( `#icon-star` ), 已選 = 填充 sunflower, 未選 = ink outline; 狀態不只靠顏色(文字顯示 `N/5`)。
  - 篩選列加 `rating` 下拉: 全部 / 1★+ / 2★+ / 3★+ / 4★+ / 5★(≥N 語義)。
  - 排序選項加「星級」(rating DESC → updated_at DESC)。
- 零遷移風險: 與 favorite 完全同模式, 照抄即可。

### F4 軟刪除 + 資源回收筒

- 資料: `deleted_at TEXT`(NULL = 存在, 非 NULL = 已刪)。
- API:
  - `DELETE /api/assets/:id` → 軟刪除(設 `deleted_at`), 200 回傳 asset; 已刪則 409。
  - `POST /api/assets/:id/restore` → 清空 `deleted_at`; 不存在則 404。
  - `DELETE /api/assets/:id?permanent=1` → 徹底刪除: 刪資料列(CASCADE 清 analyses/jobs/collection_items, FTS 觸發器清理)→ **server 層**刪磁碟檔案(ENOENT 容錯, 檔案已被手動移走不報錯)。
- 查詢層(最關鍵, 改動面最大):
  - `listAssets`: 新增 `trashed` filter; 預設 `deleted_at IS NULL`, `trashed=1` 只回已刪。
  - `getStats` / `getFacets` / collection 相關資產計數: 一律排除 `deleted_at IS NOT NULL`。
  - 回收筒計數 `trashedAssets` 進 bootstrap stats(導航顯示)。
- UI:
  - 左側導航新增「資源回收筒」入口(含計數), 點入顯示已刪素材(帶恢復 / 徹底刪除按鈕)。
  - 主視圖素材卡: Inspector 或卡片操作區加「移入回收筒」; 批次選擇後 batch bar 加「移入回收筒」。
  - 回收筒內: 單張 / 批次「恢復」與「徹底刪除」; 徹底刪除前 `confirm()` 二次確認(與現有刪除確認風格一致)。
- 同檔重匯入語義(設計決策): **匯入**同 sha256 且已軟刪的檔案 → 復活該記錄(清 `deleted_at`), 符合「我想重新收這張」直覺; **掃描** `performScan` **不復活**(inbox 掃描不應改動使用者刪除意圖)。此規則寫進測試。

## 5. Schema 遷移

- `user_version` 1 → 2, 在 `initCatalog` 內執行:
  1. `PRAGMA table_info(assets)` 檢查列是否存在(冪等防重跑)。
  2. `ALTER TABLE assets ADD COLUMN rating INTEGER NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5)`。
  3. `ALTER TABLE assets ADD COLUMN deleted_at TEXT`。
  4. `CREATE INDEX IF NOT EXISTS assets_deleted_idx ON assets(deleted_at)`(回收筒查詢用)。
  5. `PRAGMA user_version = 2`。
- `CREATE TABLE IF NOT EXISTS assets` 的建表分支同步加兩列(新庫一次到位)。
- 存量庫遷移前提示備份(見風險 R2)。

## 6. 檔案改動清單

| 檔案 | 改動 |
|------|------|
| `src/db.mjs` | 遷移 v2; `listAssets` trashed 過濾; `getStats`/`getFacets`/collection 排除已刪; `deleteAsset`/`restoreAsset`/`purgeAsset`; `updateAsset` 支援 rating; import 復活規則 |
| `server.mjs` | PATCH 白名單 + rating; DELETE(soft/permanent); POST restore; GET assets 收 `trashed` 參數; bootstrap stats 加 trashedAssets |
| `public/app.js` | 拖拽監聽 + 高亮; paste 監聽 + 焦點守衛; 卡片/Inspector 星級互動; 回收筒視圖(導航/列表/批次); 刪除入口 |
| `public/index.html` | `#icon-star` symbol; rating 篩選下拉; 回收筒導航項 |
| `public/styles.css` | 星級、拖拽高亮遮罩、回收筒視圖樣式(僅 CSS class, 無內聯 style, 符合 CSP) |
| `tests/asset-trash.test.mjs` | 新增(見 §8) |
| `package.json` | test script 加新測試檔 |
| `scripts/smoke-test.mjs` | API 冒煙用例(新端點 + rating PATCH) |
| `docs/redesign/wave1-collect/implementation-plan.md` | 本方案 |
| `CHANGELOG.md` | 合併 master 時更新 |

## 7. 執行難度評估

| 功能 | 難度 | 理由 |
|------|------|------|
| F1 拖拽 | **S** | 純前端 ~40 行, `importFiles` 全複用, 零後端 |
| F2 貼上 | **S** | 純前端 ~25 行, 唯一注意點是焦點守衛 |
| F3 星級 | **S** | 1 列 + PATCH 白名單 + 卡片互動, 完全複製 favorite 模式 |
| F4 回收筒 | **M** | 列 + **全查詢路徑過濾**(listAssets/stats/facets/collections)+ 3 API + 新視圖 + 磁碟檔案刪除; 是本波唯一有「遺漏過濾」風險的項 |

合計: 小～中, 1.5~2.5 天。F4 佔 60% 工作量。

## 8. 驗收標準

### 8.1 自動化(必須全過)

1. `npm run check` — 無語法錯誤。
2. `npm test` — 既有 25 項 + 新增 `tests/asset-trash.test.mjs`(真 SQLite + 臨時目錄):
   - 新庫 schema 含 `rating`(預設 0)與 `deleted_at`(預設 NULL)。
   - `updateAsset` rating: 0–5 合法; 6 / 負數 / 小數 → 拒絕。
   - 軟刪除後 `listAssets` 預設不含; `trashed=1` 只回已刪。
   - restore 後回到主列表。
   - 徹底刪除後: 行消失、analyses/jobs/collection_items 級聯清、FTS 查不到。
   - `getStats` / `getFacets` / 收藏集資產視圖排除已刪。
   - 同 sha256 匯入已刪記錄 → 復活; 掃描 → 不復活。
3. `npm run smoke` — 新 API 冒煙通過(soft delete → restore → purge 全流程)。
4. `npm run validate` — 含 290 項 release 檢查全過。**實作前先跑一次拿基線**, 確認 290 項對新 DOM 是否有 ID 斷言, 避免臨時才知道。

### 8.2 手動驗收(沙箱, 瀏覽器逐項)

| # | 步驟 | 預期 |
|---|------|------|
| 1 | 拖 3 張圖進視窗 | 全部匯入, 進度「匯入 N/3」, 完成後自動選中最後一張 |
| 2 | 拖拽過程 | 素材區出現手繪風虛線高亮, 放開消失 |
| 3 | 複製截圖 → Ctrl+V | 圖片匯入, 檔名 `paste-*.png` |
| 4 | 焦點在搜尋框 → Ctrl+V | 貼上文字, **不**匯入圖片 |
| 5 | 點素材卡第 3 顆星 | 設 3 分, 顯示 3/5; 刷新後保留 |
| 6 | 篩選 3★+ | 只顯示 ≥3 分素材; 排序「星級」生效 |
| 7 | 刪除素材 | 卡片消失, 回收筒計數 +1, 統計/搜尋/收藏集同步排除 |
| 8 | 回收筒: 恢復 | 回到主視圖, 計數 -1 |
| 9 | 回收筒: 徹底刪除 | confirm 後記錄消失, 磁碟檔案被刪 |
| 10 | 拖入非圖片 / >30MB 檔案 | 忽略或優雅報錯, 不崩潰 |
| 11 | 把已刪圖片重新拖入 | 復活該記錄(非重複匯入) |

### 8.3 截圖驗證

- 沙箱( `$LOCALAPPDATA/Temp/stylebase-shot` )截 2 張交付圖, 存 `docs/redesign/wave1-collect/`:
  1. 星級互動後的素材卡(含 rating 篩選列)。
  2. 資源回收筒視圖(含批次操作列)。
- 視覺斷言: 星級與回收筒 UI 符合手繪風(DESIGN.md: ink 輪廓、無玻璃/漸層/圓角 SaaS 卡片), 無內聯 style CSP 報錯。

## 9. 風險與對策

| # | 風險 | 級別 | 對策 |
|---|------|------|------|
| R1 | 查詢過濾遺漏(某條路徑仍回傳已刪素材) | 高 | §8.1 每個查詢路徑一條測試; 手動驗收 #7 全覆蓋 |
| R2 | 存量庫遷移失敗或破壞資料 | 中 | user_version 1→2 + `table_info` 冪等檢查; 遷移前提示備份(拷貝 .db); 沙箱用真實庫快照演練一次 |
| R3 | 同檔重匯入語義分歧 | 中 | 已定規則(匯入復活 / 掃描不復活), 寫進測試固化 |
| R4 | purge 時磁碟檔案已不存在 | 低 | `fs.unlink` ENOENT 容錯 |
| R5 | 290 項 release 檢查對新 UI 有 DOM 斷言 | 中 | 實作前先跑 validate 拿基線, 及早發現 |
| R6 | 拖拽/貼上與既有鍵盤操作衝突 | 低 | paste 只處理圖片 item; drag 只攔 `Files` 類型; 輸入框焦點守衛 |

## 10. 分支與合併紀律

- 從當前 HEAD 建 `codex/wave1-collect`(工作區 clean, 直接建)。
- 單分支完成全部四功能(共享一次 schema 遷移, 不拆兩次)。
- 合併: 只 add 本任務檔案(顯式路徑), `merge --no-ff` 進 master, `npm run validate` 全過後收工。
- 不執行 git clean / reset / 覆蓋性 checkout。

## 11. 實作順序(里程碑)

1. **M1 schema + db 層**(遷移、過濾、delete/restore/purge)+ 全部 db 測試綠。
2. **M2 server API**(PATCH rating、DELETE、restore、trashed 參數)+ smoke 用例綠。
3. **M3 前端收集**(拖拽 + 貼上)+ 手動驗收 #1–4。
4. **M4 前端星級**(卡片 + Inspector + 篩選 + 排序)+ 手動驗收 #5–6。
5. **M5 前端回收筒**(導航 + 視圖 + 批次)+ 手動驗收 #7–11。
6. **M6 全量驗證 + 截圖**(check / test / smoke / validate + 2 張截圖 + CHANGELOG)。
