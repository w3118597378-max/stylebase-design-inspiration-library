# i18n 中英切換（i18n-toggle）實作計劃

## 範圍

**In scope**
- 頂欄右側新增語言切換按鈕（EN / 中）
- 全站 UI 文案雙語化：`public/index.html` 靜態文案（aria-label、placeholder、按鈕文字、導航、空態）+ `public/app.js` 動態模板與提示文案（素材卡、檢查器、過濾器、隊列、toast、錯誤提示）
- 語言持久化（localStorage）+ `<html lang>` 同步 + Intl 格式化（數字/日期/排序）跟隨語言
- 切換即時重渲染當前視圖

**Out of scope（明確不做）**
- 不翻譯使用者資料：素材標題、來源 URL、備註、收藏集名稱（這些是資料不是 UI）
- 不引入任何 i18n 函式庫（維持零依賴、零構建資產）
- 不改 server.mjs（無後端語言邏輯，CSP 不動）
- 不做內容本地化存檔（資料庫欄位不變，無 Schema 遷移）
- 不做「英文機翻直出」的粗糙版本（見待確認點）

## 現狀勘察（代碼事實）

- 無任何 i18n / locale 機制：`public/index.html` 與 `public/app.js` 全為硬編碼中文
- 語言硬編碼點：
  - `index.html:9` `<html lang="zh-Hans">`
  - `app.js:578` `Intl.NumberFormat("zh-Hans-CN")`（檔案大小格式化）
  - `app.js:594` `Intl.DateTimeFormat("zh-Hans-CN")`（時間格式化）
  - `app.js:975` `localeCompare(b.title, "zh-Hans")`（標題排序）
- 文案規模（grep 實測）：
  - `public/index.html`：110 行含中文 / 471 行
  - `public/app.js`：297 行含中文 / 3031 行
- 頂欄結構：`header.topbar`（index.html:104）→ `.topbar-actions`（index.html:132，grid 右側列，含 import/scan/recognize 三按鈕），按鈕體系 `.button--quiet`（44px 圖標方塊，V3 頂欄定稿）與 `.button--primary`
- 渲染模式：`app.js` 以模板字符串注入（`renderGallery` / `renderCollectionOverview` / `queueTrack.innerHTML` 等），無框架
- 隊列狀態文案：`public/queue-role.js` 純函數（進度語義，有測試保護，別改其邏輯，只翻譯其輸出的狀態文字）

## 功能設計

### 1. i18n 機制（零依賴）

新增 `public/i18n.js`（IIFE，掛 `window.I18N`）：

```
I18N = {
  lang: 'zh' | 'en',            // 取自 localStorage('stylebase-lang')，預設 zh
  dict: { zh: {…}, en: {…} },   // key → 文案
  t(key, vars?),                // 翻譯函數，支援 {var} 佔位符
  setLang(lang),                // 寫 localStorage + <html lang> + 重渲染
}
```

- `index.html` 在 `<head>` 引 i18n.js（在 app.js 之前），`<html lang>` 開頭由 i18n.js 依 localStorage 覆寫（避免 FOUC：i18n.js 同步讀 localStorage，渲染前已定語）
- 語言預設：`zh`（現狀即繁中 UI；注意現有文案是繁體中文）

### 2. 文案提取策略

- 唯一 key 化：從 407 行中文提取 ~200-250 個唯一 UI 文案鍵（同一文案多處共用一鍵，如「匯入影像」「掃描資料夾」「送交 Codex」）
- 模板字符串改 `T.importLabel` 或 `t('key')` 形式
- 動態文案（帶變數）用佔位符：`t('jobComplete', {n: 3})`
- 隊列狀態文字（等待/分析中/完成/錯誤）翻譯，但 `queue-role.js` 的進度計算邏輯一字不動，只在消費端翻譯

### 3. 切換按鈕（頂欄右側）

- 位置：`.topbar-actions` 最右側（recognize-button 之後），`aria-label` 隨語言
- 形態：`button--quiet` 44px 圖標方塊體系，顯示目標語言：當前中文顯示「EN」，當前英文顯示「中」
- 交互：點擊 → `I18N.setLang()` → 即時重渲染當前視圖（renderAll），不刷新頁面
- 鍵盤/輔助：有 aria-label，focus-visible 走既有按鈕體系

### 4. Intl 跟隨語言

`formatBytes`（app.js:578）、`formatTime`（app.js:594）、標題排序（app.js:975）改讀 `I18N.lang === 'zh' ? 'zh-Hans-CN' : 'en-US'`。

## Schema 遷移

無。純前端改動，資料庫零變更。

## 檔案改動清單

| 檔案 | 改動 |
|---|---|
| `public/i18n.js` | **新增**：I18N 核心（dict/zh + dict/en + t + setLang） |
| `public/index.html` | 引 i18n.js；110 行靜態中文 → 模板或 `data-i18n`；新增切換按鈕 |
| `public/app.js` | 297 行中文 → `t()` 引用；renderAll 改可重入；Intl 三處跟隨語言 |
| `public/styles.css` | 切換按鈕樣式（若需，預計極少，複用 button--quiet 體系） |
| `docs/redesign/i18n-toggle/` | 本計劃 + 驗收截圖 |

## 執行難度：M

理由：機制本身簡單（S），但文案面廣（407 行、~250 鍵、跨 index.html/app.js/queue-role 消費端），回歸風險中等；無新表、無新 API、無架構級改動。分三個里程碑執行，每步可驗收：

1. **M1 基礎 + 頂欄**：i18n.js + 切換按鈕 + 頂欄/導航/靜態文案 → 用戶先驗收按鈕與頂欄切換
2. **M2 工作區**：素材卡/檢查器/過濾器/空態/收藏集/隊列
3. **M3 全量收尾**：toast/錯誤提示/殘留文案掃描 + 全量驗證

## 驗收標準

**自動化（三件套）**
- [x] `npm run check` 過（含新增 public/i18n.js 語法檢查）
- [x] `npm test` 38/38 過
- [x] `npm run smoke` 過
- [x] `npm run validate:release`：290 項中 3 項失敗為**既有基線問題**（.worktrees/ui 舊文件截圖連結層級寫錯，git stash 對照驗證與本次改動無關）

**手動清單（2026-08-16 Playwright 實測通過）**
- [x] 按鈕在頂欄右側，中文態顯示「EN」、英文態顯示「中」
- [x] 點 EN → 全站 UI 變英文（頂欄/導航/篩選/空態/合成素材/檢查器/隊列/toast），素材標題等使用者資料保持原樣
- [x] 點 中 → 全站復原繁體中文（含檢查器開啟狀態下即時切換）
- [x] 切換後刷新頁面，語言保持（localStorage `stylebase-lang`）
- [x] `<html lang>` 同步（zh-Hans / en）
- [x] 標題與 meta description 雙語
- [x] 合成素材（8 組演示）隨語言切換重建（事件 `stylebase:langchange`）

**截圖**：`docs/redesign/i18n-toggle/i18n-zh.png`（中文全頁）、`i18n-en-inspector.png`（英文+檢查器）

**實作中修正的坑（供後續參考）**
- `t()` 查找需支援 `group.key` 點路徑（所有鍵均為分組形式）
- i18n 切換後必須重渲染：app.js 的 `renderAll` 在 module 作用域，須 `window.renderAll = renderAll` 暴露
- 自訂事件 `stylebase:langchange` 的 dispatch（document）與監聽（document）必須同目標，CustomEvent 預設不冒泡
- zh/en 兩側詞典要同步補鍵（首輪只補了 zh 側 nav 組導致英文態回落中文）
- **頂欄按鈕文字被 `font-size:0` 吃掉（2026-08-16 用户反馈「按钮没显示字体」）**：頂欄 V3 把 `.topbar .button--quiet` 收成 44px 圖標方塊（`font-size:0`），語言按鈕復用該類後「EN/中」文字不可見（功能正常但視覺為空按鈕）。修：`.topbar .lang-toggle` 覆蓋 `font-size:13px; font-weight:700; width:auto; padding:0 12px`。凡頂欄新增帶文字按鈕都必須覆蓋 font-size，不能只複用 button--quiet。

## 風險表

| 風險 | 影響 | 緩解 |
|---|---|---|
| 407 行文案有遺漏 → 中英混雜 | 高 | 驗收時逐視圖截圖檢查 + grep 殘留中文掃描（排除素材資料行） |
| 模板字符串改動破壞渲染 | 高 | 依賴 npm test 25/25 保護 + 每里程碑 Playwright 實測 |
| 英譯品質參差（機翻味） | 中 | 全部人工逐條校對，非機翻直出（見待確認點） |
| queue-role.js 誤動 | 中 | 只翻譯消費端，邏輯文件零改動（有測試保護） |

## 分支紀律

- 新分支 `codex/i18n-toggle`，從當前 HEAD（f611f09）建
- 只 add 本任務文件（i18n.js / index.html / app.js / styles.css / docs），不用 add -A
- 完成驗證後 `git merge codex/i18n-toggle --ff-only` 回 master，`E:/Stylebase` 為主目錄

## 里程碑

- M1：i18n.js + 按鈕 + 頂欄/導航/靜態文案 ✅ 用戶驗收
- M2：工作區全視圖（素材卡/檢查器/過濾器/空態/隊列）
- M3：toast/錯誤提示/殘留掃描 + 三件套全過 + 截圖存檔 → 合併 master
