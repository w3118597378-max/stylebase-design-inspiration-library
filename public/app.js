import { beginPendingButtons } from "./button-state.js";
import {
  renderSwatchColor,
  safeHexColor as safeColor,
} from "./palette-swatch.js";
import {
  queueKindForStatus,
  queueProgress,
  queueRoleForStatus,
} from "./queue-role.js";

const state = {
  loading: true,
  error: null,
  assets: [],
  resultTotal: 0,
  libraryTotal: 0,
  stats: {},
  jobs: [],
  settings: {},
  provider: null,
  collections: [],
  paths: {},
  view: "library",
  activeCollectionId: null,
  selectedId: null,
  selectedIds: new Set(),
  lastAnchorId: null,
  query: "",
  discipline: "",
  status: "",
  sort: "newest",
  queueExpanded: false,
  searchTimer: null,
  pollTimer: null,
  syntheticAssets: [],
  inspectorReturnFocus: null,
  inspectorReturnAssetId: null,
  metadataEditing: false,
};

const elements = {
  app: document.querySelector("#app"),
  workspace: document.querySelector("#workspace"),
  gallery: document.querySelector("#gallery"),
  collectionOverview: document.querySelector("#collection-overview"),
  collectionTable: document.querySelector("#collection-table"),
  loadingState: document.querySelector("#loading-state"),
  errorState: document.querySelector("#error-state"),
  errorMessage: document.querySelector("#error-message"),
  setupNotice: document.querySelector("#setup-notice"),
  inspector: document.querySelector("#inspector"),
  inspectorEmpty: document.querySelector("#inspector-empty"),
  inspectorContent: document.querySelector("#inspector-content"),
  resultSummary: document.querySelector("#result-summary"),
  viewTitle: document.querySelector("#view-title"),
  viewKicker: document.querySelector("#view-kicker"),
  searchForm: document.querySelector("#search-form"),
  searchInput: document.querySelector("#search-input"),
  disciplineFilter: document.querySelector("#discipline-filter"),
  statusFilter: document.querySelector("#status-filter"),
  ratingFilter: document.querySelector("#rating-filter"),
  sortSelect: document.querySelector("#sort-select"),
  clearFiltersButton: document.querySelector("#clear-filters-button"),
  importButton: document.querySelector("#import-button"),
  fileInput: document.querySelector("#file-input"),
  scanButton: document.querySelector("#scan-button"),
  recognizeButton: document.querySelector("#recognize-button"),
  retryLoadButton: document.querySelector("#retry-load-button"),
  primaryNav: document.querySelector("#primary-nav"),
  collectionNav: document.querySelector("#collection-nav"),
  countTrash: document.querySelector("#count-trash"),
  batchTrashButton: document.querySelector("#batch-trash-button"),
  batchRestoreButton: document.querySelector("#batch-restore-button"),
  batchPurgeButton: document.querySelector("#batch-purge-button"),
  newCollectionButton: document.querySelector("#new-collection-button"),
  collectionDialog: document.querySelector("#collection-dialog"),
  collectionForm: document.querySelector("#collection-form"),
  collectionName: document.querySelector("#collection-name"),
  settingsDialog: document.querySelector("#settings-dialog"),
  settingsForm: document.querySelector("#settings-form"),
  settingInboxPath: document.querySelector("#setting-inbox-path"),
  settingCodexModel: document.querySelector("#setting-codex-model"),
  codexReadiness: document.querySelector("#codex-readiness"),
  codexExecutionMode: document.querySelector("#codex-execution-mode"),
  codexPromptVersion: document.querySelector("#codex-prompt-version"),
  providerLedger: document.querySelector("#provider-ledger"),
  settingsStatusDot: document.querySelector("#settings-status-dot"),
  railStatus: document.querySelector("#rail-status"),
  countLibrary: document.querySelector("#count-library"),
  countInbox: document.querySelector("#count-inbox"),
  countCollections: document.querySelector("#count-collections"),
  countQueue: document.querySelector("#count-queue"),
  batchBar: document.querySelector("#batch-bar"),
  batchCount: document.querySelector("#batch-count"),
  batchAnalyzeButton: document.querySelector("#batch-analyze-button"),
  clearSelectionButton: document.querySelector("#clear-selection-button"),
  queueBar: document.querySelector("#queue-bar"),
  queueToggle: document.querySelector("#queue-toggle"),
  queueTrack: document.querySelector("#queue-track"),
  queueActiveCount: document.querySelector("#queue-active-count"),
  queueSummaryText: document.querySelector("#queue-summary-text"),
  retryNeedsSetupButton: document.querySelector("#retry-needs-setup-button"),
  liveRegion: document.querySelector("#live-region"),
};

const STATUS_LABELS = {
  discovered: "已侦测",
  imported: "已汇入",
  hashing: "建立索引",
  queued: "等待 Codex",
  pending: "等待 Codex",
  running: "Codex 辨识中",
  processing: "Codex 辨识中",
  analyzing: "Codex 辨识中",
  ready: "分析完成",
  complete: "分析完成",
  completed: "分析完成",
  needs_review: "待确认",
  needs_setup: "Codex 未就绪",
  failed: "分析失败",
  missing: "原档遗失",
  stale_analysis: "需更新",
  duplicate: "重复影像",
  synthetic: "合成示意",
};

const DNA_LABELS = {
  discipline: "领域",
  category: "类型",
  artifact: "产物",
  surface: "介面",
  style: "风格",
  lineage: "设计谱系",
  composition: "构图",
  layout: "版面",
  grid: "网格",
  density: "密度",
  hierarchy: "层级",
  typography: "字体",
  color: "色彩",
  imagery: "影像",
  material: "材质",
  mood: "情绪",
  era: "年代",
  interaction: "互动",
};

function dnaLabel(key) {
  const localized = I18N.t(`facet.${key}`);
  if (localized !== `facet.${key}`) return localized;
  return DNA_LABELS[key] || key;
}

// Convert legacy analysis records saved before the UI switched to Simplified Chinese.
const TRADITIONAL_ANALYSIS_CHARS =
  "張時雜誌為頁圖網畫攤開視覺圍極細導頭資訊輪圓點與訂閱體國際義獨氣質帶數藍綴簡編輯設計採樣機構層積兩標題內個橫頂間寫紅螢塊並線側組愛號價狀態現連結無識錄襯實驗滿寬闊負紙淨虛響應優約欄絕對尋購區將擊齊籤鍵盤夠熱換準議幾護藝術師純臨漸擬疊邊暈膠鈕過陰電稱讀額場務報觀見糲軸條顯懸節單複輕規較緊湊確認淺動調飽強則書緣壓縮別攝僅沒從霧環雙車輸啟測讓統這瀏覽戲劇語搶擴銳鄰觸級會裝飾賴壞緻檢礙屬徑顏製來綠復腦業繪彙據夾擋團隊討論頻預輛黃樹鐘選擇維屜潤轉軟項協產傳懷舊學處隱譜後織閉穩擁擠溫潑鋸齒階變塗顆斷經閾終員檔捲滾載鮮達紋鋪犧順難惡誤風記遊傾錨類簽嚴亂碼創歷賽幟聯離營勢註雖輔纖潔佔長筆發腳詳靜關係貼針刪補險競爭當須試";
const SIMPLIFIED_ANALYSIS_CHARS =
  "张时杂志为页图网画摊开视觉围极细导头资讯轮圆点与订阅体国际义独气质带数蓝缀简编辑设计采样机构层积两标题内个横顶间写红萤块并线侧组爱号价状态现连结无识录衬实验满宽阔负纸净虚响应优约栏绝对寻购区将击齐签键盘够热换准议几护艺术师纯临渐拟叠边晕胶钮过阴电称读额场务报观见粝轴条显悬节单复轻规较紧凑确认浅动调饱强则书缘压缩别摄仅没从雾环双车输启测让统这浏览戏剧语抢扩锐邻触级会装饰赖坏致检碍属径颜制来绿复脑业绘汇据夹挡团队讨论频预辆黄树钟选择维屉润转软项协产传怀旧学处隐谱后织闭稳拥挤温泼锯齿阶变涂颗断经阈终员档卷滚载鲜达纹铺牺顺难恶误风记游倾锚类签严乱码创历赛帜联离营势注虽辅纤洁占长笔发脚详静关系贴针删补险竞争当须试";
const analysisCharacterMap = new Map(
  [...TRADITIONAL_ANALYSIS_CHARS].map((character, index) => [
    character,
    [...SIMPLIFIED_ANALYSIS_CHARS][index] || character,
  ]),
);

function toSimplifiedChinese(value) {
  return [...String(value ?? "")]
    .map((character) => analysisCharacterMap.get(character) || character)
    .join("");
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeMediaUrl(value) {
  const url = String(value ?? "").trim();
  if (
    url.startsWith("/") ||
    url.startsWith("data:image/") ||
    url.startsWith("blob:") ||
    url.startsWith("http://127.0.0.1") ||
    url.startsWith("http://localhost")
  ) {
    return url;
  }
  return "";
}

function parseMaybeJson(value) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("["))) {
    return value;
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function asObject(value) {
  const parsed = parseMaybeJson(value);
  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? parsed
    : {};
}

function asArray(value) {
  const parsed = parseMaybeJson(value);
  if (Array.isArray(parsed)) return parsed;
  if (parsed === undefined || parsed === null || parsed === "") return [];
  return [parsed];
}

function listFrom(payload, keys = []) {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
}

function finiteNumber(...values) {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return null;
}

function stripExtension(name) {
  return String(name || "").replace(/\.[^.]+$/, "");
}

function fileNameFromPath(value) {
  const parts = String(value || "").split(/[\\/]/);
  return parts.at(-1) || "";
}

function normalizeAsset(raw) {
  const asset = asObject(raw);
  const relativePath =
    asset.relativePath || asset.relative_path || asset.path || asset.filePath || "";
  const fileName =
    asset.fileName ||
    asset.filename ||
    asset.originalName ||
    fileNameFromPath(relativePath) ||
    `asset-${asset.id || ""}`;
  const width = finiteNumber(asset.width, asset.pixelWidth, asset.dimensions?.width);
  const height = finiteNumber(
    asset.height,
    asset.pixelHeight,
    asset.dimensions?.height,
  );
  const status =
    asset.analysisStatus ||
    asset.analysis_state ||
    asset.status ||
    asset.jobStatus ||
    (asset.analysis || asset.latestAnalysis ? "ready" : "discovered");

  return {
    ...asset,
    id: String(asset.id ?? asset.assetId ?? relativePath ?? ""),
    title: String(asset.title || stripExtension(fileName) || I18N.t("common.unnamedImage")),
    fileName,
    relativePath,
    mediaUrl: safeMediaUrl(asset.mediaUrl || asset.url || asset.thumbnailUrl),
    width,
    height,
    mimeType: asset.mimeType || asset.type || "",
    fileSize: finiteNumber(asset.fileSize, asset.size, asset.bytes),
    status: String(status || "discovered"),
    createdAt:
      asset.createdAt ||
      asset.created_at ||
      asset.importedAt ||
      asset.addedAt ||
      "",
    sourceUrl: asset.sourceUrl || asset.source_url || "",
    rightsNote: asset.rightsNote || asset.rights_note || "",
    notes: asset.notes || "",
    favorite: Boolean(asset.favorite),
    rating: finiteNumber(asset.rating, 0),
    deletedAt: asset.deletedAt || asset.deleted_at || "",
    collectionIds: asArray(
      asset.collectionIds || asset.collection_ids || asset.collections,
    ).map((item) => String(item?.id ?? item)),
    hash: asset.sha256 || asset.hash || "",
    synthetic: Boolean(asset.synthetic),
  };
}

function normalizeCollection(raw) {
  const collection = asObject(raw);
  return {
    ...collection,
    id: String(collection.id ?? collection.collectionId ?? ""),
    name: String(collection.name || collection.title || I18N.t("common.unnamedCollection")),
    itemCount:
      finiteNumber(
        collection.itemCount,
        collection.item_count,
        collection.count,
        collection.total,
      ) ?? asArray(collection.items).length,
  };
}

function normalizeJob(raw) {
  const job = asObject(raw);
  return {
    ...job,
    id: String(job.id ?? job.jobId ?? ""),
    assetId: String(job.assetId ?? job.asset_id ?? ""),
    status: String(job.state || job.status || "queued"),
    stage: String(job.stage || job.step || ""),
    progress: finiteNumber(job.progress, job.percent, job.percentage),
    error: String(
      job.error || job.errorMessage || job.lastError || job.last_error || job.message || "",
    ),
    createdAt: job.createdAt || job.created_at || "",
  };
}

function analysisRecord(asset) {
  const latest = asObject(
    asset.currentAnalysis ||
      asset.current_analysis ||
      asset.latestAnalysis ||
      asset.latest_analysis ||
      asset.analysisRecord,
  );
  let analysis =
    asset.analysis ??
    asset.analysisData ??
    asset.analysis_data ??
    latest.analysis ??
    latest.data ??
    {};
  analysis = parseMaybeJson(analysis);
  if (asObject(analysis).analysis) analysis = asObject(analysis).analysis;
  return {
    record: latest,
    data: asObject(analysis),
  };
}

function normalizePalette(value) {
  return asArray(value)
    .map((item) => {
      if (typeof item === "string") {
        return { hex: safeColor(item), name: "" };
      }
      const object = asObject(item);
      return {
        hex: safeColor(object.hex || object.value || object.color),
        name: toSimplifiedChinese(object.name || object.role || ""),
      };
    })
    .slice(0, 8);
}

function readableValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => readableValue(item)).filter(Boolean).join("、");
  }
  if (value && typeof value === "object") {
    return Object.values(value)
      .map((item) => readableValue(item))
      .filter(Boolean)
      .join("、");
  }
  if (typeof value === "boolean") return value ? I18N.t("common.yes") : I18N.t("common.no");
  return toSimplifiedChinese(String(value ?? "").trim());
}

function normalizedAnalysis(asset) {
  const { record, data } = analysisRecord(asset);
  const coreVisualDna = asObject(
    data.visualDna ||
      data.visualDNA ||
      data.visual_dna ||
      data.classification ||
      data.styleProfile,
  );
  const visualDna = {
    discipline: data.designDomains || data.design_domains,
    artifact: data.artifactTypes || data.artifact_types,
    ...coreVisualDna,
    typography: data.typography,
    color: data.color
      ? [
          data.color.mode,
          data.color.temperature,
          data.color.saturation,
          data.color.contrast,
        ]
      : undefined,
    imagery: data.imagery,
    material: data.materials,
    interaction: data.interactionSignals || data.interaction_signals,
  };
  const prompts = asObject(
    data.promptKit || data.prompt_kit || data.prompts || data.prompt,
  );
  const description = readableValue(
    data.detailedDescription ||
      data.detailed_description ||
      data.description ||
      data.summary ||
      data.visualDescription ||
      data.visual_description ||
      data.caption,
  );
  const palette = normalizePalette(
    data.palette ||
      data.colors ||
      data.colorPalette ||
      data.color_palette ||
      data.color?.palette ||
      visualDna.palette,
  );
  const whyItWorks = asArray(
    data.whyItWorks ||
      data.why_it_works ||
      data.strengths ||
      data.designRationale,
  )
    .map(readableValue)
    .filter(Boolean);
  const recipe = asArray(
    data.implementationRecipe ||
      data.implementation_recipe ||
      data.recipe ||
      data.buildNotes,
  )
    .map(readableValue)
    .filter(Boolean);

  const visualPrompt = readableValue(
    prompts.imageGeneration ||
      prompts.image_generation ||
      prompts.visual ||
      prompts.visualPrompt ||
      prompts.visual_prompt ||
      prompts.image ||
      prompts.imagePrompt ||
      data.visualPrompt ||
      data.imagePrompt,
  );
  const implementationPrompt = readableValue(
    prompts.uiImplementation ||
      prompts.ui_implementation ||
      prompts.implementation ||
      prompts.implementationPrompt ||
      prompts.implementation_prompt ||
      prompts.ui ||
      data.implementationPrompt ||
      data.uiPrompt,
  );
  const designTokenPrompt = readableValue(
    prompts.designTokens ||
      prompts.design_tokens ||
      prompts.tokens ||
      data.designTokenPrompt,
  );
  const negativePrompt = readableValue(
    prompts.negative ||
      prompts.negativePrompt ||
      prompts.negative_prompt ||
      data.negativePrompt,
  );

  return {
    data,
    visualDna,
    description,
    palette,
    whyItWorks,
    recipe,
    prompts: {
      visual: visualPrompt,
      implementation: implementationPrompt,
      tokens: designTokenPrompt,
      negative: negativePrompt,
    },
    provider:
      record.provider ||
      asset.analysisProvider ||
      asset.analysis_provider ||
      data.provider ||
      "",
    model:
      record.model || asset.analysisModel || asset.analysis_model || data.model || "",
    promptVersion:
      record.promptVersion ||
      record.prompt_version ||
      data.promptVersion ||
      state.settings.promptVersion ||
      "",
    analyzedAt:
      record.createdAt ||
      record.created_at ||
      asset.analyzedAt ||
      asset.analyzed_at ||
      "",
    confidence: finiteNumber(
      data.confidence,
      record.confidence,
      asset.analysisConfidence,
    ),
  };
}

function collectionSuggestionNames(asset) {
  const analysis = normalizedAnalysis(asset);
  if (!analysis.description && !Object.keys(analysis.data).length) return [];

  const visual = analysis.visualDna || {};
  const source = [
    analysis.description,
    readableValue(analysis.data.designDomains),
    readableValue(analysis.data.artifactTypes),
    readableValue(analysis.data.tags),
    readableValue(visual.style),
    readableValue(visual.composition),
    readableValue(visual.grid),
    readableValue(visual.typography),
    readableValue(visual.color),
    readableValue(visual.imagery),
  ]
    .join(" ")
    .toLowerCase();

  const suggestions = [];
  const add = (name) => {
    if (!suggestions.includes(name)) suggestions.push(name);
  };

  if (/网页|网站|落地页|界面|ui|仪表板|dashboard|聊天|桌面/.test(source)) {
    add(I18N.t("source.web"));
  }
  if (/产品|包装|电商|商品|工业/.test(source)) {
    add(I18N.t("source.product"));
  }
  if (/品牌|标志|识别|logo/.test(source)) {
    add(I18N.t("source.brand"));
  }
  if (
    /构图|网格|版面|布局|留白|层级/.test(source) ||
    visual.composition ||
    visual.grid
  ) {
    add(I18N.t("source.layout"));
  }
  if (
    /字体|排版|色彩|颜色|色票|typography/.test(source) ||
    analysis.data.typography ||
    analysis.data.color
  ) {
    add(I18N.t("source.color"));
  }

  return suggestions.slice(0, 3);
}

function stateLabel(value) {
  const localized = I18N.t(`status.${value}`);
  if (localized !== `status.${value}`) return localized;
  return STATUS_LABELS[value] || value || I18N.t("common.uncategorized");
}

function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number)
    ? new Intl.NumberFormat(I18N.lang === "en" ? "en-US" : "zh-Hans-CN").format(number)
    : "—";
}

function formatBytes(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return "—";
  if (number < 1024) return `${number} B`;
  if (number < 1024 ** 2) return `${(number / 1024).toFixed(1)} KB`;
  return `${(number / 1024 ** 2).toFixed(1)} MB`;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(I18N.lang === "en" ? "en-US" : "zh-Hans-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusIsActive(status) {
  return ["queued", "pending", "running", "processing", "analyzing"].includes(
    status,
  );
}

function statusNeedsAttention(status) {
  return ["needs_review", "failed", "missing", "needs_setup"].includes(status);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 204) return null;

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.error ||
      payload?.message ||
      I18N.t("misc.serverResponse", { status: response.status });
    const error = new Error(String(message));
    error.status = response.status;
    error.details = payload?.details || payload?.error?.details || null;
    throw error;
  }

  return payload;
}

function studySvg(index, title, palette) {
  const [paper, ink, accent, muted] = palette;
  const variants = [
    `<rect x="44" y="44" width="712" height="512" fill="${paper}"/><rect x="380" y="88" width="328" height="292" fill="${muted}"/><path d="M390 380h318v124H390z" fill="${ink}"/><path d="M88 110h224v18H88zm0 36h166v8H88zm0 244h230v114H88z" fill="${accent}"/>`,
    `<rect width="800" height="600" fill="${ink}"/><text x="54" y="170" font-size="116" font-weight="800" fill="${paper}" font-family="Arial">FORM</text><text x="54" y="276" font-size="116" font-weight="800" fill="${paper}" font-family="Arial">FOLLOWS</text><path d="M54 330h690v5H54z" fill="${accent}"/><text x="56" y="380" font-size="22" fill="${muted}" font-family="Arial">${escapeHTML(title)}</text>`,
    `<rect width="800" height="600" fill="${paper}"/><circle cx="400" cy="285" r="172" fill="${muted}"/><rect x="334" y="118" width="132" height="316" fill="${accent}"/><rect x="352" y="150" width="96" height="244" fill="${ink}"/><path d="M84 520h632" stroke="${ink}" stroke-width="3"/>`,
    `<rect width="800" height="600" fill="${accent}"/><rect x="48" y="46" width="286" height="508" fill="${paper}"/><rect x="370" y="46" width="382" height="242" fill="${ink}"/><rect x="370" y="320" width="178" height="234" fill="${muted}"/><rect x="580" y="320" width="172" height="234" fill="${paper}"/>`,
    `<rect width="800" height="600" fill="${paper}"/><rect x="52" y="54" width="164" height="492" fill="${ink}"/><rect x="246" y="54" width="502" height="88" fill="${muted}"/><path d="M246 178h502v368H246z" fill="${accent}"/><path d="M284 488V302m84 186V260m84 228V352m84 136V214m84 274V332m84 156V278" stroke="${paper}" stroke-width="20"/>`,
    `<rect width="800" height="600" fill="${muted}"/><rect x="62" y="58" width="676" height="484" fill="${paper}"/><rect x="106" y="110" width="262" height="354" fill="${accent}"/><circle cx="520" cy="284" r="122" fill="${ink}"/><path d="M432 458h180" stroke="${ink}" stroke-width="10"/>`,
    `<rect width="800" height="600" fill="${ink}"/><rect x="48" y="52" width="704" height="496" fill="${paper}"/><path d="M48 194h704M288 52v496M520 194v354" stroke="${muted}" stroke-width="3"/><circle cx="640" cy="120" r="34" fill="${accent}"/><rect x="324" y="238" width="152" height="208" fill="${ink}"/>`,
    `<rect width="800" height="600" fill="${paper}"/><path d="M70 74h660v452H70z" fill="${muted}"/><path d="M70 74h396v452H70z" fill="${ink}"/><text x="108" y="244" font-size="86" font-weight="700" fill="${paper}" font-family="Arial">A—Z</text><rect x="506" y="118" width="174" height="174" fill="${accent}"/><path d="M506 326h174v12H506zm0 34h116v8H506z" fill="${ink}"/>`,
  ];
  const markup = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="${escapeHTML(title)}">
      ${variants[index % variants.length]}
      <text x="54" y="574" font-size="14" fill="${index === 1 ? paper : ink}" font-family="Arial">SYNTHETIC STUDY ${String(index + 1).padStart(2, "0")} · STYLEBASE</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markup)}`;
}

function createSyntheticStudies() {
  const definitions = [
    {
      title: I18N.t("seed.s1.title"),
      discipline: "web",
      palette: ["#f1f0ea", "#161817", "#135dff", "#b8b9b4"],
      description: I18N.t("seed.s1.desc"),
      style: I18N.t("seed.s1.style"),
      composition: I18N.t("seed.s1.composition"),
    },
    {
      title: I18N.t("seed.s2.title"),
      discipline: "brand",
      palette: ["#f4f0e8", "#111111", "#dc3328", "#858681"],
      description: I18N.t("seed.s2.desc"),
      style: I18N.t("seed.s2.style"),
      composition: I18N.t("seed.s2.composition"),
    },
    {
      title: I18N.t("seed.s3.title"),
      discipline: "brand",
      palette: ["#eee9df", "#1e211f", "#8d6f47", "#c7c1b7"],
      description: I18N.t("seed.s3.desc"),
      style: I18N.t("seed.s3.style"),
      composition: I18N.t("seed.s3.composition"),
    },
    {
      title: I18N.t("seed.s4.title"),
      discipline: "concept",
      palette: ["#fff5e9", "#171717", "#ef4d23", "#684cff"],
      description: I18N.t("seed.s4.desc"),
      style: I18N.t("seed.s4.style"),
      composition: I18N.t("seed.s4.composition"),
    },
    {
      title: I18N.t("seed.s5.title"),
      discipline: "ui",
      palette: ["#f5f6f2", "#171918", "#135dff", "#9ca7b8"],
      description: I18N.t("seed.s5.desc"),
      style: I18N.t("seed.s5.style"),
      composition: I18N.t("seed.s5.composition"),
    },
    {
      title: I18N.t("seed.s6.title"),
      discipline: "product",
      palette: ["#eee6d8", "#201f1b", "#a66d35", "#b9b1a4"],
      description: I18N.t("seed.s6.desc"),
      style: I18N.t("seed.s6.style"),
      composition: I18N.t("seed.s6.composition"),
    },
    {
      title: I18N.t("seed.s7.title"),
      discipline: "web",
      palette: ["#f4f1e9", "#171918", "#6b735f", "#a8a69e"],
      description: I18N.t("seed.s7.desc"),
      style: I18N.t("seed.s7.style"),
      composition: I18N.t("seed.s7.composition"),
    },
    {
      title: I18N.t("seed.s8.title"),
      discipline: "brand",
      palette: ["#f7f4ec", "#111111", "#135dff", "#b9b8b0"],
      description: I18N.t("seed.s8.desc"),
      style: I18N.t("seed.s8.style"),
      composition: I18N.t("seed.s8.composition"),
    },
  ];

  return definitions.map((item, index) => ({
    id: `synthetic-${index + 1}`,
    title: item.title,
    fileName: `synthetic-study-${index + 1}.svg`,
    mediaUrl: studySvg(index, item.title, item.palette),
    width: 800,
    height: 600,
    mimeType: "image/svg+xml",
    status: "synthetic",
    discipline: item.discipline,
    synthetic: true,
    analysis: {
      description: item.description,
      visualDna: {
        discipline: item.discipline,
        style: item.style,
        composition: item.composition,
        density: index % 2 === 0 ? I18N.t("seed.v1") : I18N.t("seed.v2"),
        typography: I18N.t("seed.typography"),
      },
      palette: item.palette,
      whyItWorks: [
        I18N.t("seed.principle1"),
        I18N.t("seed.principle2"),
        I18N.t("seed.principle3"),
      ],
      implementationRecipe: [
        I18N.t("seed.do1"),
        I18N.t("seed.do2"),
        I18N.t("seed.do3"),
      ],
      promptKit: {
        visual: I18N.t("seed.visual", { title: item.title, style: item.style, composition: item.composition }),
        implementation: I18N.t("seed.implementation", { title: item.title, composition: item.composition }),
        negative: I18N.t("seed.negative"),
      },
    },
  }));
}

function providerObject() {
  if (Array.isArray(state.provider)) {
    return (
      state.provider.find((item) =>
        /codex/i.test(String(item?.id || item?.name || item?.provider || "")),
      ) || state.provider[0] || null
    );
  }
  return state.provider && typeof state.provider === "object"
    ? state.provider
    : null;
}

function codexReadiness() {
  const provider = providerObject();
  if (!provider) return null;
  if (typeof provider.ready === "boolean") return provider.ready;
  if (typeof provider.available === "boolean") return provider.available;
  if (typeof provider.configured === "boolean") return provider.configured;
  const status = String(provider.status || provider.state || "").toLowerCase();
  if (["ready", "available", "connected", "ok"].includes(status)) return true;
  if (
    ["needs_setup", "unavailable", "missing", "error", "auth_required"].includes(
      status,
    )
  ) {
    return false;
  }
  return null;
}

async function loadBootstrap({ preserveSelection = true } = {}) {
  state.loading = true;
  state.error = null;
  renderLoading();

  try {
    const bootstrap = await api("/api/bootstrap");
    const rawAssets = listFrom(bootstrap?.assets, ["items", "assets", "data"]);
    const rawJobs = listFrom(bootstrap?.jobs, ["items", "jobs", "data"]);

    state.assets = rawAssets.map(normalizeAsset);
    state.resultTotal =
      finiteNumber(bootstrap?.assets?.total, bootstrap?.assets?.count) ??
      state.assets.length;
    state.libraryTotal =
      finiteNumber(
        bootstrap?.stats?.assets,
        bootstrap?.stats?.assetCount,
        bootstrap?.assets?.total,
      ) ?? state.assets.length;
    state.stats = asObject(bootstrap?.stats);
    state.jobs = rawJobs.map(normalizeJob);
    state.settings = asObject(bootstrap?.settings);
    state.provider = bootstrap?.provider ?? bootstrap?.providers ?? null;
    state.collections = listFrom(bootstrap?.collections, [
      "items",
      "collections",
      "data",
    ]).map(normalizeCollection);
    state.paths = asObject(bootstrap?.paths);
    state.loading = false;
    elements.railStatus.textContent = I18N.t("nav.connected");

    if (
      preserveSelection &&
      state.selectedId &&
      !state.assets.some((asset) => asset.id === state.selectedId)
    ) {
      closeInspector();
    }

    renderAll();
  } catch (error) {
    state.loading = false;
    state.error = error;
    elements.railStatus.textContent = I18N.t("nav.disconnected");
    renderLoading();
  }
}

function renderLoading() {
  elements.loadingState.hidden = !state.loading;
  elements.errorState.hidden = !state.error;
  elements.gallery.hidden = state.loading || Boolean(state.error);
  elements.collectionOverview.hidden = true;

  if (state.error) {
    elements.errorMessage.textContent =
      state.error.message || I18N.t("misc.dbErrorHint");
    elements.resultSummary.textContent = I18N.t("misc.dbUnreachable");
  }
}

function activeJobs() {
  return state.jobs.filter((job) => statusIsActive(job.status));
}

function inboxAssets() {
  return state.assets.filter(
    (asset) =>
      statusNeedsAttention(asset.status) ||
      ["discovered", "imported", "queued", "pending"].includes(asset.status),
  );
}

const DISCIPLINE_ALIASES = {
  web: [
    "web",
    "website",
    "landing page",
    "ecommerce",
    "网页",
    "网站",
    "着陆页",
    "电商",
  ],
  ui: [
    "ui",
    "ux",
    "interface",
    "app",
    "dashboard",
    "介面",
    "仪表板",
    "应用程式",
  ],
  product: ["product", "industrial", "packaging", "产品", "工业设计", "包装", "物件"],
  brand: [
    "brand",
    "branding",
    "identity",
    "logo",
    "品牌",
    "识别",
    "标志",
    "视觉识别",
  ],
  concept: [
    "concept",
    "editorial",
    "campaign",
    "poster",
    "art direction",
    "概念",
    "编辑",
    "活动视觉",
    "海报",
    "艺术指导",
  ],
};

function disciplineTextMatches(text, term) {
  if (/^[a-z0-9]+$/i.test(term)) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, "i").test(
      text,
    );
  }
  return text.includes(term);
}

function assetDisciplines(asset) {
  const analysis = normalizedAnalysis(asset);
  const source = [
    asset.discipline,
    analysis.visualDna.discipline,
    analysis.data.designDomains,
    analysis.data.design_domains,
    analysis.data.discipline,
    analysis.data.category,
  ]
    .map(readableValue)
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return Object.entries(DISCIPLINE_ALIASES)
    .filter(([, terms]) =>
      terms.some((term) => disciplineTextMatches(source, term)),
    )
    .map(([discipline]) => discipline);
}

function filteredAssets() {
  let assets = [...state.assets];
  if (state.view === "inbox") assets = inboxAssets();
  if (state.discipline) {
    assets = assets.filter((asset) =>
      assetDisciplines(asset).includes(state.discipline),
    );
  }
  if (state.status) {
    assets = assets.filter((asset) => asset.status === state.status);
  }
  if (state.rating) {
    assets = assets.filter((asset) => asset.rating >= state.rating);
  }

  if (state.sort === "title") {
    assets.sort((a, b) => a.title.localeCompare(b.title, I18N.lang === "en" ? "en" : "zh-Hans"));
  } else if (state.sort === "status") {
    assets.sort((a, b) => a.status.localeCompare(b.status));
  } else if (state.sort === "rating") {
    assets.sort(
      (a, b) => b.rating - a.rating || b.updatedAt.localeCompare(a.updatedAt),
    );
  } else {
    assets.sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }
  return assets;
}

function activeCollection() {
  return (
    state.collections.find(
      (collection) => collection.id === state.activeCollectionId,
    ) || null
  );
}

function renderAll() {
  renderLoading();
  renderViewHeading();
  renderCounts();
  renderProviderState();
  renderCollectionNav();
  renderGallery();
  renderInspector();
  renderBatchBar();
  renderQueue();
  renderSettings();
  updateNavState();
}

function renderViewHeading() {
  if (state.view === "collections") {
    elements.viewKicker.textContent = I18N.t("view.kickerCollections");
    elements.viewTitle.textContent = I18N.t("view.collections");
    elements.resultSummary.textContent = I18N.t("view.countCollections", {
      n: formatNumber(state.collections.length),
    });
    return;
  }

  const collection = activeCollection();
  if (collection) {
    elements.viewKicker.textContent = I18N.t("view.kickerCollection");
    elements.viewTitle.textContent = collection.name;
  } else if (state.view === "inbox") {
    elements.viewKicker.textContent = I18N.t("view.kickerInbox");
    elements.viewTitle.textContent = I18N.t("view.inbox");
  } else if (state.view === "trash") {
    elements.viewKicker.textContent = I18N.t("view.kickerTrash");
    elements.viewTitle.textContent = I18N.t("view.trash");
  } else {
    elements.viewKicker.textContent = I18N.t("view.kickerLibrary");
    elements.viewTitle.textContent = I18N.t("view.library");
  }
}

function renderCounts() {
  const jobsActive = activeJobs().length;
  const inboxCount =
    finiteNumber(
      state.stats.inbox,
      state.stats.needsReview,
      state.stats.needs_review,
    ) ?? inboxAssets().length;

  elements.countLibrary.textContent = formatNumber(state.libraryTotal);
  elements.countInbox.textContent = formatNumber(inboxCount);
  elements.countCollections.textContent = formatNumber(state.collections.length);
  elements.countQueue.textContent = formatNumber(jobsActive);
  elements.countTrash.textContent = formatNumber(
    finiteNumber(state.stats.trashedAssets, state.stats.trashed_assets) ?? 0,
  );
}

function renderProviderState() {
  const ready = codexReadiness();
  elements.setupNotice.hidden = ready !== false;
  elements.settingsStatusDot.classList.toggle("is-ready", ready === true);
  elements.settingsStatusDot.classList.toggle("needs-setup", ready === false);
  elements.settingsStatusDot.setAttribute(
    "aria-label",
    ready === true
      ? I18N.t("common.codexReady")
      : ready === false
        ? I18N.t("common.codexNotReady")
        : I18N.t("common.codexUnknown"),
  );
}

function updateNavState() {
  elements.primaryNav.querySelectorAll("[data-view]").forEach((button) => {
    const active = button.dataset.view === state.view && !state.activeCollectionId;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  const active = elements.primaryNav.querySelector("[aria-current='page']");
  active?.scrollIntoView({ block: "nearest", inline: "center" });
}

function renderCollectionNav() {
  if (!state.collections.length) {
    elements.collectionNav.innerHTML =
      '<p class="rail-footnote">' + I18N.t("inspector.noCollections") + '</p>';
    return;
  }

  elements.collectionNav.innerHTML = state.collections
    .slice(0, 12)
    .map(
      (collection) => `
        <button
          class="collection-link ${collection.id === state.activeCollectionId ? "is-active" : ""}"
          type="button"
          data-collection-id="${escapeHTML(collection.id)}"
        >
          <span>${escapeHTML(collection.name)}</span>
          <small>${formatNumber(collection.itemCount)}</small>
        </button>`,
    )
    .join("");
}

function renderCollectionOverview() {
  elements.gallery.hidden = true;
  elements.collectionOverview.hidden = false;

  if (!state.collections.length) {
    elements.collectionTable.innerHTML = `
      <div class="empty-library-panel">
        <img class="empty-library-illustration" src="/assets/illustrations/empty-library.png" alt="" aria-hidden="true" />
        <div>
          <h2>${I18N.t("inspector.noCollections")}</h2>
           <p>${I18N.t("collection.emptyDesc")}</p>
          <button class="button button--primary" type="button" data-action="new-collection">${I18N.t("common.newCollection")}</button>
        </div>
      </div>`;
    return;
  }

  elements.collectionTable.innerHTML = state.collections
    .map(
      (collection) => `
        <div class="collection-row">
          <strong>${escapeHTML(collection.name)}</strong>
          <output>${I18N.t("view.countItems", { n: formatNumber(collection.itemCount) })}</output>
          <button class="button button--quiet" type="button" data-collection-id="${escapeHTML(collection.id)}">
            ${I18N.t("collection.openIndex")}
          </button>
        </div>`,
    )
    .join("");
}

function renderGallery() {
  if (state.loading || state.error) return;
  if (state.view === "collections") {
    renderCollectionOverview();
    return;
  }

  elements.collectionOverview.hidden = true;
  elements.gallery.hidden = false;
  const assets = filteredAssets();
  const apiLibraryEmpty = state.libraryTotal === 0;
  const useSynthetic =
    apiLibraryEmpty &&
    state.view === "library" &&
    !state.activeCollectionId &&
    !state.query &&
    !state.discipline &&
    !state.status;
  const renderedAssets = useSynthetic ? state.syntheticAssets : assets;

  const contextLabel = state.activeCollectionId
    ? activeCollection()?.name || I18N.t("view.collection")
    : state.view === "inbox"
      ? I18N.t("view.inbox")
      : state.view === "trash"
        ? I18N.t("view.trash")
        : I18N.t("view.library");
  elements.resultSummary.textContent = useSynthetic
    ? I18N.t("gallery.contextEmpty", { n: state.syntheticAssets.length })
    : I18N.t("gallery.contextCount", {
        label: contextLabel,
        n: formatNumber(assets.length),
      });

  if (!renderedAssets.length) {
    const trashEmpty = state.view === "trash";
    elements.gallery.innerHTML = `
      <div class="empty-library-panel">
        <img class="empty-library-illustration" src="/assets/illustrations/empty-library.png" alt="" aria-hidden="true" />
        <div>
          <h2>${trashEmpty ? I18N.t("gallery.emptyTrash") : apiLibraryEmpty ? I18N.t("gallery.emptyLibrary") : I18N.t("gallery.emptyTitle")}</h2>
          <p>${
            trashEmpty
              ? I18N.t("gallery.emptyTrashDesc")
              : apiLibraryEmpty
                ? I18N.t("gallery.emptyLibraryDesc")
                : I18N.t("gallery.emptyNoMatchDesc")
          }</p>
          ${
            trashEmpty
              ? ""
              : apiLibraryEmpty
                ? `<button class="button button--primary" type="button" data-action="import">${I18N.t("gallery.importFirst")}</button>`
                : `<button class="button button--quiet" type="button" data-action="clear-filters">${I18N.t("common.clearFilters")}</button>`
          }
        </div>
      </div>`;
    return;
  }

  const syntheticIntro = useSynthetic
    ? `
      <div class="synthetic-intro">
        <p><strong>${I18N.t("gallery.syntheticIntro")}</strong>${I18N.t("gallery.syntheticDesc")}</p>
        <button class="button button--primary" type="button" data-action="import">${I18N.t("gallery.importReal")}</button>
      </div>`
    : "";

  elements.gallery.innerHTML =
    syntheticIntro +
    renderedAssets
      .map((asset, index) => renderAssetCard(asset, index, renderedAssets.length))
      .join("");
}

function renderAssetCard(asset, index, total) {
  const current = asset.id === state.selectedId;
  const batchSelected = state.selectedIds.has(asset.id);
  const isTrash = state.view === "trash";
  const dimensions =
    asset.width && asset.height ? `${asset.width} × ${asset.height}` : I18N.t("gallery.dimensionsUnknown");
  const imageUrl = safeMediaUrl(asset.mediaUrl);
  const stateBadge = asset.synthetic
    ? `<span class="synthetic-flag">${I18N.t("gallery.syntheticFlag")}</span>`
    : `<span class="asset-state" data-state="${escapeHTML(asset.status)}">${escapeHTML(
        stateLabel(asset.status),
      )}</span>`;
  const selectionButton = asset.synthetic
    ? ""
    : `
      <button
        class="asset-select-toggle"
        type="button"
        data-batch-id="${escapeHTML(asset.id)}"
        aria-label="${batchSelected ? I18N.t("gallery.removeFromBatch") : I18N.t("gallery.addToBatch")}：${escapeHTML(asset.title)}"
        aria-pressed="${batchSelected}"
      >
        <svg class="icon" aria-hidden="true"><use href="#icon-check"></use></svg>
      </button>`;
  const trashButton = isTrash
    ? ""
    : `
      <button
        class="asset-trash-toggle"
        type="button"
        data-trash-id="${escapeHTML(asset.id)}"
        aria-label="${I18N.t("gallery.moveToTrash")}：${escapeHTML(asset.title)}"
      >
        <svg class="icon" aria-hidden="true"><use href="#icon-trash"></use></svg>
      </button>`;
  const trashActions = isTrash
    ? `
      <div class="asset-trash-actions">
        <button
          class="button button--quiet"
          type="button"
          data-restore-id="${escapeHTML(asset.id)}"
        >
          <svg class="icon" aria-hidden="true"><use href="#icon-restore"></use></svg>
          <span>${I18N.t("common.restore")}</span>
        </button>
        <button
          class="button button--danger"
          type="button"
          data-purge-id="${escapeHTML(asset.id)}"
        >
          <svg class="icon" aria-hidden="true"><use href="#icon-trash"></use></svg>
          <span>${I18N.t("common.deleteForever")}</span>
        </button>
      </div>`
    : "";

  return `
    <figure
      class="asset-card ${current ? "is-selected is-loupe" : ""} ${batchSelected ? "is-batch-selected" : ""} ${isTrash ? "is-trashed" : ""}"
      data-asset-id="${escapeHTML(asset.id)}"
      data-registration="${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}"
    >
      ${stateBadge}
      ${selectionButton}
      ${trashButton}
      ${
        isTrash
          ? `<div class="asset-open asset-open--static" aria-hidden="true">
              ${
                imageUrl
                  ? `<img src="${escapeHTML(imageUrl)}" alt="" ${
                      index < 5 ? 'fetchpriority="high"' : 'loading="lazy"'
                    } decoding="async" />`
                  : `<span class="queue-placeholder-thumb" aria-hidden="true"></span>`
              }
            </div>`
          : `<button
        class="asset-open"
        type="button"
        data-open-asset="${escapeHTML(asset.id)}"
        aria-label="${I18N.t("gallery.view")} ${escapeHTML(asset.title)}"
        aria-pressed="${current}"
      >
        ${
          imageUrl
            ? `<img src="${escapeHTML(imageUrl)}" alt="${escapeHTML(asset.title)}" ${
                index < 5 ? 'fetchpriority="high"' : 'loading="lazy"'
              } decoding="async" />`
            : `<span class="queue-placeholder-thumb" aria-hidden="true"></span>`
        }
      </button>`
      }
      <figcaption class="asset-caption">
        <strong>${escapeHTML(asset.title)}</strong>
        <span>${escapeHTML(dimensions)}</span>
      </figcaption>
      ${
        asset.synthetic || isTrash
          ? ""
          : `<div class="star-rating" role="group" aria-label="${I18N.t("gallery.rating", { rating: asset.rating })}">
              ${[1, 2, 3, 4, 5]
                .map(
                  (star) => `
                <button
                  type="button"
                  class="star ${asset.rating >= star ? "is-filled" : ""}"
                  data-star="${star}"
                  data-asset-id="${escapeHTML(asset.id)}"
                  aria-label="${I18N.t("gallery.setStar", { star })}"
                  aria-pressed="${asset.rating >= star}"
                >
                  <svg class="icon" aria-hidden="true"><use href="#icon-star"></use></svg>
                </button>`,
                )
                .join("")}
            </div>`
      }
      ${trashActions}
      <span class="proof-mark proof-mark--tl" aria-hidden="true"></span>
      <span class="proof-mark proof-mark--tr" aria-hidden="true"></span>
      <span class="proof-mark proof-mark--br" aria-hidden="true"></span>
      <span class="proof-mark proof-mark--bl" aria-hidden="true"></span>
    </figure>`;
}

function assetById(id) {
  return (
    state.assets.find((asset) => asset.id === id) ||
    state.syntheticAssets.find((asset) => asset.id === id) ||
    null
  );
}

function visualDnaRows(visualDna, data) {
  const source =
    Object.keys(visualDna).length > 0
      ? visualDna
      : {
          discipline: data.discipline,
          style: data.style,
          composition: data.composition,
          typography: data.typography,
          mood: data.mood,
        };
  const entries = Object.entries(source)
    .map(([key, value]) => [key, readableValue(value)])
    .filter(([, value]) => value)
    .slice(0, 12);

  if (!entries.length) return "";
  return `
    <dl class="dna-list">
      ${entries
        .map(
          ([key, value]) => `
            <div>
              <dt>${escapeHTML(dnaLabel(key))}</dt>
              <dd>${escapeHTML(value)}</dd>
            </div>`,
        )
        .join("")}
    </dl>`;
}

function renderPalette(palette) {
  if (!palette.length) return `<p class="analysis-empty">${I18N.t("inspector.noPalette")}</p>`;
  return `
    <div class="palette">
      ${palette
        .map(
          (swatch) => `
            <button class="swatch" type="button" data-copy-swatch="${escapeHTML(swatch.hex)}" aria-label="${I18N.t("gallery.copySwatch", { hex: escapeHTML(swatch.hex) })}" title="${I18N.t("gallery.copySwatch", { hex: escapeHTML(swatch.hex) })}">
              ${renderSwatchColor(swatch.hex)}
              <code>${escapeHTML(swatch.hex)}</code>
            </button>`,
        )
        .join("")}
    </div>`;
}

function renderList(items, className, fallback) {
  if (!items.length) return `<p class="analysis-empty">${escapeHTML(fallback)}</p>`;
  return `<ol class="${className}">${items
    .map((item) => `<li>${escapeHTML(item)}</li>`)
    .join("")}</ol>`;
}

function renderPromptBlock(label, key, value) {
  if (!value) {
    return `
      <div class="prompt-block">
        <div class="prompt-label"><span>${escapeHTML(label)}</span></div>
        <p class="analysis-empty">${I18N.t("inspector.noPrompt")}</p>
      </div>`;
  }
  return `
    <div class="prompt-block">
      <div class="prompt-label">
        <span>${escapeHTML(label)}</span>
        <span class="prompt-actions"><button class="prompt-toggle" type="button" data-toggle-prompt="${escapeHTML(key)}" aria-expanded="false">${I18N.t("common.expand")}</button><button class="prompt-copy" type="button" data-copy-prompt="${escapeHTML(key)}">
          <svg class="icon" aria-hidden="true"><use href="#icon-copy"></use></svg>
          ${I18N.t("common.copy")}
        </button></span>
      </div>
      <pre class="prompt-text">${escapeHTML(value)}</pre>
    </div>`;
}

function collectionContainsAsset(collection, asset) {
  if (asset.collectionIds.includes(collection.id)) return true;
  const ids = asArray(collection.assetIds || collection.asset_ids).map(String);
  if (ids.includes(asset.id)) return true;
  return asArray(collection.items).some(
    (item) => String(item?.assetId ?? item?.id ?? item) === asset.id,
  );
}

function renderSmartCollectionSuggestions(asset) {
  const suggestions = collectionSuggestionNames(asset);
  if (!suggestions.length) return "";

  return `
    <div class="smart-collection-suggestions">
      <div class="smart-collection-heading">
        <strong>${I18N.t("inspector.smartTitle")}</strong>
        <small>${I18N.t("inspector.smartSource")}</small>
      </div>
      <div class="smart-collection-list">
        ${suggestions
          .map((name) => {
            const collection = state.collections.find(
              (item) => item.name.trim().toLowerCase() === name.toLowerCase(),
            );
            const joined = collection && collectionContainsAsset(collection, asset);
            return `
              <button
                class="smart-collection-chip"
                type="button"
                ${joined ? "disabled" : ""}
                data-smart-collection="${escapeHTML(name)}"
                data-smart-asset-id="${escapeHTML(asset.id)}"
              >${joined ? I18N.t("common.added") : collection ? I18N.t("common.add") : I18N.t("inspector.smartJoin")} · ${escapeHTML(name)}</button>`;
          })
          .join("")}
      </div>
      <small class="smart-collection-hint">${I18N.t("inspector.smartHint")}</small>
    </div>`;
}

function renderCollectionControls(asset) {
  const smartSuggestions = renderSmartCollectionSuggestions(asset);
  if (!state.collections.length) {
    return `
      ${smartSuggestions}
      <div class="collection-control">
        <p>${I18N.t("inspector.noCollections")}</p>
        <button class="text-button" type="button" data-action="new-collection">${I18N.t("common.newCollection")}</button>
      </div>`;
  }

  const memberships = state.collections.filter((collection) =>
    collectionContainsAsset(collection, asset),
  );
  return `
    ${smartSuggestions}
    <div class="collection-control">
      <label class="sr-only" for="inspector-collection-select">${I18N.t("inspector.collectionSelectAria")}</label>
      <select id="inspector-collection-select">
        <option value="">${I18N.t("inspector.selectCollection")}</option>
        ${state.collections
          .map(
            (collection) =>
              `<option value="${escapeHTML(collection.id)}">${escapeHTML(
                collection.name,
              )}</option>`,
          )
          .join("")}
      </select>
      <button class="button button--quiet" type="button" data-add-to-collection="${escapeHTML(
        asset.id,
      )}\">${I18N.t("common.add")}</button>
    </div>
    ${
      memberships.length
        ? `<div class="metadata-actions">${memberships
            .map(
              (collection) => `
                <button
                  class="text-button"
                  type="button"
                  data-remove-collection="${escapeHTML(collection.id)}"
                  data-asset-id="${escapeHTML(asset.id)}"
                >${I18N.t("inspector.removeFromCollection", { name: escapeHTML(collection.name) })}</button>`,
            )
            .join("")}</div>`
        : ""
    }`;
}

function renderInspector() {
  const asset = assetById(state.selectedId);
  if (!asset) {
    elements.inspectorEmpty.hidden = false;
    elements.inspectorContent.hidden = true;
    elements.inspectorContent.innerHTML = "";
    document.body.classList.remove("is-inspector-open");
    elements.inspector.removeAttribute("role");
    elements.inspector.removeAttribute("aria-modal");
    elements.inspector.setAttribute("aria-label", I18N.t("inspector.aria"));
    updateAnalyzeControls();
    return;
  }

  const analysis = normalizedAnalysis(asset);
  const hasAnalysis =
    Boolean(analysis.description) ||
    Object.keys(analysis.visualDna).length > 0 ||
    analysis.palette.length > 0;
  const imageUrl = safeMediaUrl(asset.mediaUrl);
  const dimensions =
    asset.width && asset.height ? `${asset.width} × ${asset.height}` : "—";
  const confidence =
    analysis.confidence === null
      ? "—"
      : `${Math.round(
          analysis.confidence <= 1
            ? analysis.confidence * 100
            : analysis.confidence,
        )}%`;
  const inQueue =
    statusIsActive(asset.status) ||
    state.jobs.some(
      (job) => job.assetId === asset.id && statusIsActive(job.status),
    );

  elements.inspectorEmpty.hidden = true;
  elements.inspectorContent.hidden = false;
  document.body.classList.add("is-inspector-open");
  if (isMobileInspector()) {
    elements.inspector.setAttribute("role", "dialog");
    elements.inspector.setAttribute("aria-modal", "true");
    elements.inspector.setAttribute(
      "aria-label",
      I18N.t("inspector.ariaTitle", { title: asset.title }),
    );
  } else {
    elements.inspector.removeAttribute("role");
    elements.inspector.removeAttribute("aria-modal");
    elements.inspector.setAttribute("aria-label", I18N.t("inspector.aria"));
  }

  elements.inspectorContent.innerHTML = `
    <div class="inspector-head">
    <div class="inspector-top">
      <div class="inspector-title">
        <p>${escapeHTML(stateLabel(asset.status))}</p>
        <h2>${escapeHTML(asset.title)}</h2>
        <div class="inspector-rating" role="group" aria-label="${I18N.t("gallery.rating", { rating: asset.rating })}">
          ${[1, 2, 3, 4, 5]
            .map(
              (star) => `
            <button
              type="button"
              class="star ${asset.rating >= star ? "is-filled" : ""}"
              data-star="${star}"
              data-asset-id="${escapeHTML(asset.id)}"
              aria-label="${I18N.t("gallery.setStar", { star })}"
              aria-pressed="${asset.rating >= star}"
            >
              <svg class="icon" aria-hidden="true"><use href="#icon-star"></use></svg>
            </button>`,
            )
            .join("")}
          <span class="inspector-rating-value">${asset.rating}/5</span>
        </div>
      </div>
      <button class="icon-button" type="button" data-close-inspector aria-label="${I18N.t("common.closeInspector")}">
        <span class="inspector-back-label">${I18N.t("common.backToLibrary")}</span>
        <svg class="icon" aria-hidden="true"><use href="#icon-close"></use></svg>
      </button>
    </div>

    <nav class="inspector-nav" aria-label="${I18N.t("inspector.navAria")}">
      <button type="button" data-inspector-jump="overview">${I18N.t("inspector.jumpOverview")}</button>
      <button type="button" data-inspector-jump="visual">${I18N.t("inspector.jumpVisual")}</button>
      <button type="button" data-inspector-jump="implementation">${I18N.t("inspector.jumpImplementation")}</button>
      <button type="button" data-inspector-jump="management">${I18N.t("inspector.jumpManagement")}</button>
    </nav>
    </div>

    ${
      asset.synthetic
        ? `<p class="synthetic-disclosure">${I18N.t("inspector.syntheticDisclosure")}</p>`
        : ""
    }

    <section class="inspector-section inspector-overview" id="inspector-overview">
    <div class="inspector-section-heading"><h3>${I18N.t("inspector.jumpOverview")} <span class="section-tag section-tag--preview">${I18N.t("inspector.previewTag")}</span></h3><span class="section-index">O01</span></div>
    <figure class="inspector-preview">
      ${
        imageUrl
          ? `<img src="${escapeHTML(imageUrl)}" alt="${escapeHTML(asset.title)}" />`
          : '<span class="queue-placeholder-thumb" aria-hidden="true"></span>'
      }
      <figcaption>
        <span>${escapeHTML(asset.fileName)}</span>
        <span>${escapeHTML(dimensions)} · ${escapeHTML(
          asset.mimeType || I18N.t("inspector.formatUnknown"),
        )}</span>
      </figcaption>
    </figure>

    ${
      !asset.synthetic
        ? `
      <div class="inspector-actions">
        <button
          class="button button--primary"
          type="button"
          data-analyze-id="${escapeHTML(asset.id)}"
          ${inQueue ? "disabled" : ""}
        >${inQueue ? I18N.t("inspector.inQueue") : I18N.t("inspector.submitCodex")}</button>
        <span>${escapeHTML(analysis.provider || "codex")} · ${I18N.t("inspector.confidence")} ${escapeHTML(
          confidence,
        )}</span>
        <small class="codex-disclosure">
           ${I18N.t("inspector.submitHint")}
        </small>
      </div>`
        : ""
    }

    <p class="analysis-summary">${escapeHTML(analysis.description || I18N.t("inspector.noSummary"))}</p>
    <div class="inspector-mobile-actions" aria-label="${I18N.t("inspector.mainActions")}">
      <button class="button button--primary" type="button" data-copy-prompt="visual" ${analysis.prompts.visual ? "" : "disabled"}>${I18N.t("inspector.copyPrompt")}</button>
      ${asset.synthetic ? "" : `<button class="button button--quiet" type="button" data-open-metadata>${I18N.t("inspector.editMetadata")}</button>`}
    </div>
    </section>

    <section class="inspector-section" id="inspector-visual">
      <div class="inspector-section-heading">
        <h3>${I18N.t("inspector.jumpVisual")} <span class="section-tag section-tag--visual">${I18N.t("inspector.visualTag")}</span></h3>
        <span class="section-index">A01</span>
      </div>
      ${
        hasAnalysis
          ? `
            ${visualDnaRows(analysis.visualDna, analysis.data)}
          `
          : `
            <div class="analysis-empty">
              <strong>${I18N.t("inspector.noDna")}</strong>
               ${I18N.t("inspector.noDnaHint")}
            </div>`
      }
    </section>

    <section class="inspector-section inspector-section--sub">
      <div class="inspector-section-heading">
        <h3>${I18N.t("inspector.paletteTitle")}</h3>
        <span class="section-index">A02</span>
      </div>
      ${renderPalette(analysis.palette)}
    </section>

    <section class="inspector-section inspector-section--sub">
      <div class="inspector-section-heading">
        <h3>${I18N.t("inspector.whyWorks")}</h3>
        <span class="section-index">A03</span>
      </div>
      ${renderList(analysis.whyItWorks, "evidence-list", I18N.t("inspector.noEvidence"))}
    </section>

    <section class="inspector-section" id="inspector-implementation">
      <div class="inspector-section-heading">
        <h3>${I18N.t("inspector.jumpImplementation")} <span class="section-tag section-tag--codex">${I18N.t("inspector.codexTag")}</span></h3>
        <span class="section-index">A04</span>
      </div>
      ${renderList(analysis.recipe, "recipe-list", I18N.t("inspector.noRecipe"))}
    </section>

    <section class="inspector-section inspector-section--sub">
      <div class="inspector-section-heading">
        <h3>Prompt Kit</h3>
        <span class="section-index">A05</span>
      </div>
      ${renderPromptBlock(I18N.t("inspector.promptVisual"), "visual", analysis.prompts.visual)}
      ${renderPromptBlock(
        I18N.t("inspector.promptUIBrief"),
        "implementation",
        analysis.prompts.implementation,
      )}
      ${renderPromptBlock(
        I18N.t("inspector.promptToken"),
        "tokens",
        analysis.prompts.tokens,
      )}
      ${renderPromptBlock(
        I18N.t("inspector.promptNegative"),
        "negative",
        analysis.prompts.negative,
      )}
    </section>

      <section class="inspector-section" id="inspector-management">
        <div class="inspector-section-heading">
        <h3>${I18N.t("inspector.jumpManagement")} <span class="section-tag section-tag--source">${I18N.t("inspector.sourceTag")}</span></h3>
        <span class="section-index">A06</span>
      </div>
      <details class="technical-evidence"><summary>${I18N.t("inspector.expandEvidence")}</summary><dl class="provenance-list">
        <div><dt>${I18N.t("inspector.relPath")}</dt><dd>${escapeHTML(asset.relativePath || "—")}</dd></div>
        <div><dt>${I18N.t("inspector.fileSize")}</dt><dd>${escapeHTML(formatBytes(asset.fileSize))}</dd></div>
        <div><dt>${I18N.t("inspector.hash")}</dt><dd>${escapeHTML(asset.hash || "—")}</dd></div>
        <div><dt>${I18N.t("inspector.model")}</dt><dd>${escapeHTML(analysis.model || "—")}</dd></div>
        <div><dt>${I18N.t("inspector.promptVersion")}</dt><dd>${escapeHTML(analysis.promptVersion || "—")}</dd></div>
        <div><dt>${I18N.t("inspector.analyzedAt")}</dt><dd>${escapeHTML(formatDate(analysis.analyzedAt))}</dd></div>
      </dl></details>
    </section>

    ${
      asset.synthetic
        ? ""
        : `
      <section class="inspector-section inspector-section--sub">
        <div class="inspector-section-heading">
          <h3>${I18N.t("view.collections")}</h3>
          <span class="section-index">A07</span>
        </div>
        ${renderCollectionControls(asset)}
      </section>

      <details class="inspector-section metadata-disclosure" ${state.metadataEditing ? "open" : ""}>
          <summary><span>${I18N.t("inspector.editMetaSummary")}</span><span>${I18N.t("inspector.expandMetaSummary")}</span></summary>
        <form class="metadata-form" data-metadata-form="${escapeHTML(asset.id)}">
          <label class="field">
            <span>${I18N.t("inspector.title")}</span>
            <input name="title" maxlength="180" value="${escapeHTML(asset.title)}" />
          </label>
          <label class="field">
            <span>${I18N.t("inspector.sourceUrl")}</span>
            <input name="sourceUrl" type="url" value="${escapeHTML(asset.sourceUrl)}" placeholder="https://" />
          </label>
          <label class="field">
            <span>${I18N.t("inspector.rightsNote")}</span>
            <textarea name="rightsNote" placeholder="${I18N.t("inspector.rightsPlaceholder")}">${escapeHTML(
              asset.rightsNote,
            )}</textarea>
          </label>
          <label class="field">
            <span>${I18N.t("inspector.notes")}</span>
            <textarea name="notes" placeholder="${I18N.t("inspector.notesPlaceholder")}">${escapeHTML(
              asset.notes,
            )}</textarea>
          </label>
          <div class="metadata-actions">
            <button class="button button--primary" type="submit">${I18N.t("inspector.saveMetadata")}</button>
          </div>
        </form>
      </details>`
    }`;

  updateAnalyzeControls();
  requestAnimationFrame(updateInspectorNav);
}

function updateInspectorNav() {
  const buttons = [...elements.inspector.querySelectorAll("[data-inspector-jump]")];
  if (!buttons.length) return;
  const scrollTop = elements.inspector.scrollTop + 132;
  let current = "overview";
  for (const button of buttons) {
    const section = document.querySelector(`#inspector-${button.dataset.inspectorJump}`);
    if (section && section.offsetTop <= scrollTop) current = button.dataset.inspectorJump;
  }
  buttons.forEach((button) => {
    const active = button.dataset.inspectorJump === current;
    button.classList.toggle("is-current", active);
    if (active) button.setAttribute("aria-current", "location");
    else button.removeAttribute("aria-current");
  });
}

function currentAnalyzeIds() {
  const batch = [...state.selectedIds].filter((id) => !assetById(id)?.synthetic);
  if (batch.length) return batch;
  const current = assetById(state.selectedId);
  return current && !current.synthetic ? [current.id] : [];
}

function updateAnalyzeControls() {
  const ids = currentAnalyzeIds();
  elements.recognizeButton.disabled = ids.length === 0;
  elements.recognizeButton.title =
    ids.length > 0
      ? I18N.t("action.submitN", { n: ids.length })
      : I18N.t("action.submitHint2");
}

function renderBatchBar() {
  const count = state.selectedIds.size;
  const isTrash = state.view === "trash";
  elements.batchBar.hidden = count === 0;
  elements.batchCount.textContent = I18N.t("action.batchCount", { n: formatNumber(count) });
  elements.batchAnalyzeButton.disabled = count === 0;
  elements.batchTrashButton.hidden = isTrash;
  elements.batchRestoreButton.hidden = !isTrash;
  elements.batchPurgeButton.hidden = !isTrash;
  updateAnalyzeControls();
}

function jobAsset(job) {
  return assetById(job.assetId);
}

function renderQueue() {
  const jobs = [...state.jobs].sort((a, b) => {
    const rank = (job) =>
      statusIsActive(job.status) ? 0 : statusNeedsAttention(job.status) ? 1 : 2;
    return rank(a) - rank(b);
  });
  const active = activeJobs();
  const needsSetup = jobs.some((job) => job.status === "needs_setup");

  elements.queueActiveCount.textContent = String(active.length).padStart(2, "0");
  elements.queueSummaryText.textContent = active.length
    ? I18N.t("queue.activeSummary", { n: active.length })
    : jobs.length
      ? I18N.t("queue.recentSummary", { n: jobs.length })
      : I18N.t("queue.empty");
  elements.retryNeedsSetupButton.hidden = !needsSetup;
  elements.queueToggle.setAttribute("aria-expanded", String(state.queueExpanded));
  elements.app.classList.toggle("is-queue-expanded", state.queueExpanded);

  if (!jobs.length) {
    elements.queueTrack.innerHTML =
      `<p class="queue-empty">${I18N.t("queue.emptyDesc")}</p>`;
    renderCounts();
    return;
  }

  const previousKinds = state.queueKinds || {};
  const nextKinds = {};

  elements.queueTrack.innerHTML = [
    `<figure class="queue-fancy" aria-hidden="true">
      <img class="queue-fancy-img" src="/assets/illustrations/d38e6aaf-9fb2-4a87-9b16-63a0cdffa51a.png" alt="" />
    </figure>`,
    ...jobs.map((job) => {
      const asset = jobAsset(job);
      const kind = queueKindForStatus(job.status);
      const progress = queueProgress(job.status, job.progress);
      const stage = job.stage || stateLabel(job.status);
      const imageUrl = safeMediaUrl(asset?.mediaUrl);
      const role = queueRoleForStatus(job.status);
      const entering = previousKinds[job.id] !== kind;
      nextKinds[job.id] = kind;
      const progressClass = progress.indeterminate ? "is-indeterminate" : "";
      const progressAria = progress.indeterminate
        ? `role="progressbar" aria-label="${escapeHTML(stage)}" aria-valuemin="0" aria-valuemax="100"`
        : `role="progressbar" aria-label="${escapeHTML(stage)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress.value}"`;
      return `
        <article
          class="queue-job${entering ? " is-kind-enter" : ""}"
          data-status="${escapeHTML(job.status)}"
          data-queue-kind="${kind}"
        >
          ${
            imageUrl
              ? `<img class="queue-thumbnail" src="${escapeHTML(imageUrl)}" alt="" loading="lazy" />`
              : '<span class="queue-placeholder-thumb" aria-hidden="true"></span>'
          }
          <div class="queue-job-info">
            <strong class="queue-job-title">${escapeHTML(
              asset?.title || I18N.t("queue.jobFallback", { id: job.assetId || "—" }),
            )}</strong>
            <div class="queue-status-row">
              <span class="queue-stage">${escapeHTML(stage)}</span>
              <span class="queue-percent">${
                progress.indeterminate ? "" : `${progress.value}%`
              }</span>
            </div>
          </div>
          <div class="job-progress ${progressClass}" ${progressAria}>
            <span data-progress="${progress.value === null ? "" : progress.value}"></span>
          </div>
          ${
            job.error
              ? `<p class="job-error">${escapeHTML(job.error)}</p>`
              : ""
          }
          <img class="queue-role" src="${role}" alt="" aria-hidden="true" />
        </article>`;
    }),
  ].join("");
  state.queueKinds = nextKinds;

  // CSP style-src 'self' blocks inline style attributes, so the fill width is
  // applied through the CSSOM, which is not subject to style-src.
  elements.queueTrack.querySelectorAll(".job-progress > span").forEach((span) => {
    if (span.dataset.progress === "") return;
    span.style.setProperty("--progress", `${span.dataset.progress}%`);
  });

  renderCounts();
}

function renderSettings() {
  const provider = providerObject() || {};
  const ready = codexReadiness();
  elements.settingInboxPath.textContent =
    state.paths.inbox || state.paths.inboxDirectory || I18N.t("queue.managedBy");
  elements.settingCodexModel.value = state.settings.codexModel || "";
  elements.codexReadiness.textContent =
    ready === true
      ? `${I18N.t("common.ready")}${provider.version ? ` · ${provider.version}` : ""}`
      : ready === false
        ? I18N.t("common.notReady")
        : I18N.t("common.statusUnknown");
  elements.codexReadiness.classList.toggle("is-ready", ready === true);
  elements.codexReadiness.classList.toggle("needs-setup", ready === false);
  elements.codexExecutionMode.textContent =
    provider.execution ||
    provider.executionMode ||
    (state.settings.executionMode === "codex-agent"
      ? I18N.t("common.localCodexAgent")
      : state.settings.executionMode) ||
    I18N.t("common.localCodexAgent");
  elements.codexPromptVersion.textContent =
    state.settings.promptVersion || provider.promptVersion || "—";
}

async function refreshAssets({ selectId = null } = {}) {
  const params = new URLSearchParams({
    limit: "200",
    sort: state.sort,
  });
  if (state.query) params.set("query", state.query);
  if (state.status) params.set("status", state.status);
  if (state.rating) params.set("rating", String(state.rating));
  if (state.view === "trash") params.set("trashed", "1");
  if (state.activeCollectionId) {
    params.set("collectionId", state.activeCollectionId);
  }

  const result = await api(`/api/assets?${params.toString()}`);
  state.assets = listFrom(result, ["items", "assets", "data"]).map(normalizeAsset);
  const selectionStillExists =
    !state.selectedId || Boolean(assetById(state.selectedId));
  if (!selectionStillExists) state.selectedId = null;
  state.resultTotal =
    finiteNumber(result?.total, result?.count) ?? state.assets.length;
  if (!state.query && !state.status && !state.activeCollectionId) {
    state.libraryTotal = state.resultTotal;
  }
  renderAll();
  if (selectId) await selectAsset(selectId, { scroll: true });
}

async function refreshJobs() {
  try {
    const result = await api("/api/jobs?limit=80");
    const previousStatuses = new Map(
      state.jobs.map((job) => [job.id, job.status]),
    );
    const nextJobs = listFrom(result, ["items", "jobs", "data"]).map(
      normalizeJob,
    );
    const reachedTerminalState = nextJobs.some((job) => {
      const previousStatus = previousStatuses.get(job.id);
      return previousStatus !== job.status && !statusIsActive(job.status);
    });
    state.jobs = nextJobs;
    if (reachedTerminalState) {
      await refreshAssets({ selectId: state.selectedId });
      return;
    }
    renderQueue();
    renderInspector();
  } catch (error) {
    console.warn("Unable to refresh jobs", error);
  }
}

async function refreshCollections() {
  const result = await api("/api/collections");
  state.collections = listFrom(result, ["items", "collections", "data"]).map(
    normalizeCollection,
  );
  renderCollectionNav();
  renderCollectionOverview();
  renderCounts();
  renderInspector();
}

async function refreshProvider() {
  try {
    state.provider = await api("/api/providers");
    renderProviderState();
    renderSettings();
  } catch (error) {
    state.provider = { ready: false, message: error.message };
    renderProviderState();
    renderSettings();
  }
}

async function selectAsset(id, { scroll = false } = {}) {
  if (state.selectedId !== id) state.metadataEditing = false;
  const initial = assetById(id);
  if (!initial) return;
  const shouldMoveFocus = state.selectedId !== id && isMobileInspector();
  if (shouldMoveFocus) {
    state.inspectorReturnFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    state.inspectorReturnAssetId = id;
  }
  state.selectedId = id;
  state.lastAnchorId = id;
  renderGallery();
  renderInspector();
  renderBatchBar();

  if (!initial.synthetic) {
    try {
      const detail = normalizeAsset(
        await api(`/api/assets/${encodeURIComponent(id)}`),
      );
      const index = state.assets.findIndex((asset) => asset.id === id);
      if (index >= 0) state.assets[index] = detail;
      renderInspector();
    } catch (error) {
      notify(I18N.t("toast.metaReadFailed", { msg: error.message }), "error");
    }
  }

  if (scroll) {
    requestAnimationFrame(() => {
      const card = elements.gallery.querySelector(
        `[data-asset-id="${CSS.escape(id)}"]`,
      );
      card?.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  }

  if (shouldMoveFocus) {
    requestAnimationFrame(() => {
      elements.inspector
        .querySelector("[data-close-inspector]")
        ?.focus({ preventScroll: true });
    });
  }
}

function closeInspector() {
  const returnFocus = state.inspectorReturnFocus;
  const returnAssetId = state.inspectorReturnAssetId || state.selectedId;
  state.inspectorReturnFocus = null;
  state.inspectorReturnAssetId = null;
  state.selectedId = null;
  renderGallery();
  renderInspector();
  renderBatchBar();
  if (returnFocus || returnAssetId) {
    requestAnimationFrame(() => {
      if (returnFocus instanceof HTMLElement && returnFocus.isConnected) {
        returnFocus.focus({ preventScroll: true });
        return;
      }
      const assetButton = returnAssetId
        ? elements.gallery.querySelector(
            `[data-open-asset="${CSS.escape(returnAssetId)}"]`,
          )
        : null;
      if (assetButton instanceof HTMLElement) {
        assetButton.focus({ preventScroll: true });
      } else {
        elements.workspace.focus({ preventScroll: true });
      }
    });
  }
}

function isMobileInspector() {
  return window.matchMedia("(max-width: 920px)").matches;
}

function trapMobileInspectorFocus(event) {
  if (
    event.key !== "Tab" ||
    !state.selectedId ||
    !isMobileInspector() ||
    !document.body.classList.contains("is-inspector-open")
  ) {
    return false;
  }

  const focusable = [
    ...elements.inspector.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((element) => element.getClientRects().length > 0);
  if (!focusable.length) return false;

  const first = focusable[0];
  const last = focusable.at(-1);
  if (!elements.inspector.contains(document.activeElement)) {
    event.preventDefault();
    first.focus();
    return true;
  }
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
    return true;
  }
  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
    return true;
  }
  return false;
}

function toggleBatch(id) {
  const asset = assetById(id);
  if (!asset || asset.synthetic) return;
  if (state.selectedIds.has(id)) state.selectedIds.delete(id);
  else state.selectedIds.add(id);
  state.lastAnchorId = id;
  renderGallery();
  renderBatchBar();
}

function selectBatchRange(targetId) {
  const assets = filteredAssets().filter((asset) => !asset.synthetic);
  const start = assets.findIndex((asset) => asset.id === state.lastAnchorId);
  const end = assets.findIndex((asset) => asset.id === targetId);
  if (start < 0 || end < 0) {
    toggleBatch(targetId);
    return;
  }
  const [from, to] = start < end ? [start, end] : [end, start];
  for (const asset of assets.slice(from, to + 1)) {
    state.selectedIds.add(asset.id);
  }
  state.lastAnchorId = targetId;
  renderGallery();
  renderBatchBar();
}

async function analyzeAssets(ids) {
  const uniqueIds = [...new Set(ids)].filter((id) => !assetById(id)?.synthetic);
  if (!uniqueIds.length) return;

  const buttons = [
    elements.recognizeButton,
    elements.batchAnalyzeButton,
    ...document.querySelectorAll("[data-analyze-id]"),
  ];
  const restoreButtons = beginPendingButtons(buttons);

  try {
    let queued = 0;
    const errors = [];
    for (const id of uniqueIds) {
      try {
        await api(`/api/assets/${encodeURIComponent(id)}/analyze`, {
          method: "POST",
          body: JSON.stringify({}),
        });
        queued += 1;
      } catch (error) {
        errors.push(`${assetById(id)?.title || id}：${error.message}`);
      }
    }

    state.queueExpanded = true;
    await Promise.allSettled([refreshJobs(), refreshAssets()]);
    if (queued) {
      notify(I18N.t("toast.submitted", { n: queued }));
    }
    if (errors.length) {
      notify(I18N.t("toast.submitErrors", { n: errors.length, first: errors[0] }), "error");
    }
  } finally {
    restoreButtons();
    renderInspector();
    renderBatchBar();
  }
}

function readFileDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.addEventListener("error", () =>
      reject(reader.error || new Error(I18N.t("toast.readFileFailed"))),
    );
    reader.readAsDataURL(file);
  });
}

async function importFiles(files) {
  const validFiles = [...files].filter((file) => file.type.startsWith("image/"));
  if (!validFiles.length) {
    notify(I18N.t("toast.noFiles"), "error");
    return;
  }

  elements.importButton.disabled = true;
  const original = elements.importButton.innerHTML;
  elements.importButton.textContent = I18N.t("action.importProgress", { done: 0, total: validFiles.length });
  let imported = 0;
  let lastAssetId = null;
  const errors = [];

  for (const file of validFiles) {
    try {
      const data = await readFileDataUrl(file);
      const payload = await api("/api/import", {
        method: "POST",
        body: JSON.stringify({
          name: stripExtension(file.name),
          type: file.type,
          data,
          sourceUrl: "",
          rightsNote: "",
        }),
      });
      imported += 1;
      lastAssetId = String(payload?.asset?.id || lastAssetId || "");
      elements.importButton.textContent = I18N.t("action.importProgress", { done: imported, total: validFiles.length });
    } catch (error) {
      errors.push(`${file.name}：${error.message}`);
    }
  }

  elements.importButton.disabled = false;
  elements.importButton.innerHTML = original;
  elements.fileInput.value = "";
  await loadBootstrap({ preserveSelection: false });
  if (lastAssetId) await selectAsset(lastAssetId, { scroll: true });

  if (imported) {
    notify(I18N.t("toast.importDone", { n: imported }));
  }
  if (errors.length) {
    notify(I18N.t("toast.importErrors", { n: errors.length, first: errors[0] }), "error");
  }
}

async function scanFolder() {
  const original = elements.scanButton.innerHTML;
  elements.scanButton.disabled = true;
  elements.scanButton.textContent = I18N.t("action.scanning");
  try {
    const result = await api("/api/scan", {
      method: "POST",
      body: JSON.stringify({}),
    });
    await loadBootstrap();
    notify(
      I18N.t("toast.scanDone", {
        files: formatNumber(result?.scanned ?? 0),
        added: formatNumber(result?.imported ?? 0),
        dupes: formatNumber(result?.duplicates ?? 0),
      }),
    );
  } catch (error) {
    notify(I18N.t("toast.scanFailed", { msg: error.message }), "error");
  } finally {
    elements.scanButton.disabled = false;
    elements.scanButton.innerHTML = original;
  }
}

async function saveMetadata(form) {
  state.metadataEditing = true;
  const id = form.dataset.metadataForm;
  const submit = form.querySelector('[type="submit"]');
  const original = submit.textContent;
  submit.disabled = true;
  submit.textContent = I18N.t("common.saving");
  const data = new FormData(form);
  try {
    const updated = normalizeAsset(
      await api(`/api/assets/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: String(data.get("title") || "").trim(),
          sourceUrl: String(data.get("sourceUrl") || "").trim(),
          rightsNote: String(data.get("rightsNote") || "").trim(),
          notes: String(data.get("notes") || "").trim(),
        }),
      }),
    );
    const index = state.assets.findIndex((asset) => asset.id === id);
    if (index >= 0) state.assets[index] = updated;
    renderGallery();
    renderInspector();
    notify(I18N.t("toast.metaSaved"));
  } catch (error) {
    notify(I18N.t("toast.metaSaveFailed", { msg: error.message }), "error");
    submit.disabled = false;
    submit.textContent = original;
  }
}

async function createCollection(name) {
  const result = await api("/api/collections", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  const created = normalizeCollection(result);
  state.collections.push(created);
  await refreshCollections();
  return (
    state.collections.find(
      (collection) => collection.name.trim().toLowerCase() === name.trim().toLowerCase(),
    ) || created
  );
}

async function addToSuggestedCollection(assetId, name) {
  let collection = state.collections.find(
    (item) => item.name.trim().toLowerCase() === name.trim().toLowerCase(),
  );
  if (!collection) collection = await createCollection(name);
  if (!collection?.id) throw new Error(I18N.t("toast.createCollectionFailed"));
  await addToCollection(assetId, collection.id);
  if (state.selectedId === String(assetId)) await selectAsset(String(assetId));
  notify(I18N.t("toast.autoCategorized", { name }));
}

async function addToCollection(assetId, collectionId) {
  if (!collectionId) {
    notify(I18N.t("toast.selectCollectionFirst"), "error");
    return;
  }
  await api(`/api/collections/${encodeURIComponent(collectionId)}/items`, {
    method: "POST",
    body: JSON.stringify({ assetId }),
  });
  const asset = assetById(assetId);
  if (asset && !asset.collectionIds.includes(collectionId)) {
    asset.collectionIds.push(collectionId);
  }
  await refreshCollections();
  notify(I18N.t("toast.addedToCollection"));
}

async function removeFromCollection(assetId, collectionId) {
  await api(
    `/api/collections/${encodeURIComponent(collectionId)}/items/${encodeURIComponent(
      assetId,
    )}`,
    { method: "DELETE" },
  );
  const asset = assetById(assetId);
  if (asset) {
    asset.collectionIds = asset.collectionIds.filter((id) => id !== collectionId);
  }
  await refreshCollections();
  notify(I18N.t("toast.removedFromCollection"));
}

async function openCollection(id) {
  state.view = "library";
  state.activeCollectionId = id;
  state.selectedId = null;
  await refreshAssets();
  elements.workspace.scrollTo({ top: 0, behavior: "smooth" });
}

function clearFilters() {
  state.query = "";
  state.discipline = "";
  state.status = "";
  state.rating = 0;
  state.sort = "newest";
  elements.searchInput.value = "";
  elements.disciplineFilter.value = "";
  elements.statusFilter.value = "";
  elements.ratingFilter.value = "";
  elements.sortSelect.value = "newest";
  refreshAssets().catch((error) =>
    notify(I18N.t("toast.clearFiltersFailed", { msg: error.message }), "error"),
  );
}

function showDialog(dialog) {
  if (!dialog.open) dialog.showModal();
}

function closeDialog(dialog) {
  if (dialog?.open) dialog.close();
}

async function openSettings() {
  renderSettings();
  showDialog(elements.settingsDialog);
  await refreshProvider();
}

async function copyPrompt(key) {
  const asset = assetById(state.selectedId);
  if (!asset) return;
  const prompt = normalizedAnalysis(asset).prompts[key];
  if (!prompt) return;
  try {
    await navigator.clipboard.writeText(prompt);
    notify(I18N.t("toast.promptCopied"));
  } catch (error) {
    notify(I18N.t("toast.promptCopyFailed", { msg: error.message }), "error");
  }
}

let liveRegionTimer = null;
function notify(message, type = "info") {
  window.clearTimeout(liveRegionTimer);
  elements.liveRegion.textContent = String(message);
  elements.liveRegion.classList.toggle("is-error", type === "error");
  elements.liveRegion.classList.add("is-visible");
  liveRegionTimer = window.setTimeout(() => {
    elements.liveRegion.classList.remove("is-visible");
  }, type === "error" ? 7000 : 4200);
}

function moveSelection(direction) {
  if (!state.selectedId) return;
  const assets =
    state.libraryTotal === 0 ? state.syntheticAssets : filteredAssets();
  const currentIndex = assets.findIndex((asset) => asset.id === state.selectedId);
  if (currentIndex < 0) return;
  const nextIndex = Math.max(
    0,
    Math.min(assets.length - 1, currentIndex + direction),
  );
  if (nextIndex !== currentIndex) {
    selectAsset(assets[nextIndex].id, { scroll: true });
  }
}

function isTypingTarget(target) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target?.isContentEditable
  );
}

function hasDraggedFiles(event) {
  return [...(event.dataTransfer?.types || [])].includes("Files");
}

let dragDepth = 0;

window.addEventListener("dragenter", (event) => {
  if (!hasDraggedFiles(event)) return;
  dragDepth += 1;
  document.body.classList.add("is-dragging");
});

window.addEventListener("dragleave", (event) => {
  if (!hasDraggedFiles(event)) return;
  dragDepth = Math.max(0, dragDepth - 1);
  if (dragDepth === 0) document.body.classList.remove("is-dragging");
});

window.addEventListener("dragover", (event) => {
  if (!hasDraggedFiles(event)) return;
  event.preventDefault();
});

window.addEventListener("drop", (event) => {
  if (!hasDraggedFiles(event)) return;
  event.preventDefault();
  dragDepth = 0;
  document.body.classList.remove("is-dragging");
  const files = [...(event.dataTransfer?.files || [])];
  if (files.length) importFiles(files);
});

function pasteImageFileName(file, stamp, index) {
  if (file.name) return file;
  const extension =
    file.type === "image/jpeg"
      ? ".jpg"
      : file.type === "image/webp"
        ? ".webp"
        : file.type === "image/gif"
          ? ".gif"
          : ".png";
  const suffix = index > 0 ? `-${index + 1}` : "";
  return new File([file], `paste-${stamp}${suffix}${extension}`, {
    type: file.type,
  });
}

document.addEventListener("paste", (event) => {
  if (isTypingTarget(event.target)) return;
  const items = [...(event.clipboardData?.items || [])];
  const images = items
    .filter((item) => item.type.startsWith("image/"))
    .map((item) => item.getAsFile())
    .filter(Boolean);
  if (!images.length) return;
  event.preventDefault();
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate(),
  )}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  importFiles(images.map((file, index) => pasteImageFileName(file, stamp, index)));
});

elements.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  window.clearTimeout(state.searchTimer);
  state.query = elements.searchInput.value.trim();
  refreshAssets().catch((error) =>
    notify(I18N.t("toast.searchFailed", { msg: error.message }), "error"),
  );
});

elements.searchInput.addEventListener("input", () => {
  window.clearTimeout(state.searchTimer);
  state.searchTimer = window.setTimeout(() => {
    state.query = elements.searchInput.value.trim();
    refreshAssets().catch((error) =>
      notify(I18N.t("toast.searchFailed", { msg: error.message }), "error"),
    );
  }, 280);
});

elements.disciplineFilter.addEventListener("change", () => {
  state.discipline = elements.disciplineFilter.value;
  renderGallery();
});

elements.statusFilter.addEventListener("change", () => {
  state.status = elements.statusFilter.value;
  refreshAssets().catch((error) =>
    notify(I18N.t("toast.filterFailed", { msg: error.message }), "error"),
  );
});

elements.ratingFilter.addEventListener("change", () => {
  state.rating = finiteNumber(elements.ratingFilter.value, 0);
  refreshAssets().catch((error) =>
    notify(I18N.t("toast.filterFailed", { msg: error.message }), "error"),
  );
});

elements.sortSelect.addEventListener("change", () => {
  state.sort = elements.sortSelect.value;
  refreshAssets().catch((error) =>
    notify(I18N.t("toast.sortFailed", { msg: error.message }), "error"),
  );
});

elements.clearFiltersButton.addEventListener("click", clearFilters);
elements.importButton.addEventListener("click", () => elements.fileInput.click());
elements.fileInput.addEventListener("change", () => {
  if (elements.fileInput.files?.length) importFiles(elements.fileInput.files);
});
elements.scanButton.addEventListener("click", scanFolder);
elements.recognizeButton.addEventListener("click", () =>
  analyzeAssets(currentAnalyzeIds()),
);
elements.batchAnalyzeButton.addEventListener("click", () =>
  analyzeAssets([...state.selectedIds]),
);
elements.batchTrashButton.addEventListener("click", () =>
  batchTrashAssets([...state.selectedIds]),
);
elements.batchRestoreButton.addEventListener("click", () =>
  batchRestoreAssets([...state.selectedIds]),
);
elements.batchPurgeButton.addEventListener("click", () =>
  batchPurgeAssets([...state.selectedIds]),
);
elements.clearSelectionButton.addEventListener("click", () => {
  state.selectedIds.clear();
  renderGallery();
  renderBatchBar();
});
elements.retryLoadButton.addEventListener("click", () =>
  loadBootstrap({ preserveSelection: false }),
);
elements.queueToggle.addEventListener("click", () => {
  state.queueExpanded = !state.queueExpanded;
  renderQueue();
});
elements.newCollectionButton.addEventListener("click", () => {
  elements.collectionForm.reset();
  showDialog(elements.collectionDialog);
  requestAnimationFrame(() => elements.collectionName.focus());
});

elements.collectionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = elements.collectionName.value.trim();
  if (!name) return;
  const submit = elements.collectionForm.querySelector('[type="submit"]');
  submit.disabled = true;
  try {
    await createCollection(name);
    closeDialog(elements.collectionDialog);
    elements.collectionForm.reset();
    notify(I18N.t("toast.collectionCreated", { name }));
  } catch (error) {
    notify(I18N.t("toast.collectionCreateFailed", { msg: error.message }), "error");
  } finally {
    submit.disabled = false;
  }
});

elements.settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = elements.settingsForm.querySelector('[type="submit"]');
  submit.disabled = true;
  const original = submit.textContent;
  submit.textContent = I18N.t("common.saving");
  try {
    state.settings = asObject(
      await api("/api/settings", {
        method: "PATCH",
        body: JSON.stringify({
          codexModel: elements.settingCodexModel.value.trim(),
        }),
      }),
    );
    await refreshProvider();
    closeDialog(elements.settingsDialog);
    notify(I18N.t("toast.settingsSaved"));
  } catch (error) {
    notify(I18N.t("toast.settingsSaveFailed", { msg: error.message }), "error");
  } finally {
    submit.disabled = false;
    submit.textContent = original;
  }
});

elements.retryNeedsSetupButton.addEventListener("click", async () => {
  const button = elements.retryNeedsSetupButton;
  button.disabled = true;
  try {
    const result = await api("/api/jobs/retry-needs-setup", {
      method: "POST",
      body: JSON.stringify({}),
    });
    await Promise.allSettled([refreshProvider(), refreshJobs()]);
    notify(I18N.t("toast.retried", { n: formatNumber(result?.retried ?? 0) }));
  } catch (error) {
    notify(I18N.t("toast.retryFailed", { msg: error.message }), "error");
  } finally {
    button.disabled = false;
  }
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-metadata-form]");
  if (!form) return;
  event.preventDefault();
  saveMetadata(form);
});
elements.inspector.addEventListener("scroll", updateInspectorNav, { passive: true });
document.addEventListener(
  "toggle",
  (event) => {
    if (event.target instanceof HTMLDetailsElement && event.target.matches(".metadata-disclosure")) {
      state.metadataEditing = event.target.open;
    }
  },
  true,
);

async function trashAsset(assetId) {
  try {
    await api(`/api/assets/${assetId}`, { method: "DELETE" });
    state.selectedIds.delete(assetId);
    if (state.selectedId === assetId) state.selectedId = null;
    adjustTrashCount(1);
    await refreshAssets();
    notify(I18N.t("toast.movedToTrash"));
  } catch (error) {
    notify(I18N.t("toast.moveToTrashFailed", { msg: error.message }), "error");
  }
}

async function restoreTrashedAsset(assetId) {
  try {
    await api(`/api/assets/${assetId}/restore`, { method: "POST" });
    state.selectedIds.delete(assetId);
    adjustTrashCount(-1);
    await refreshAssets();
    notify(I18N.t("toast.restored"));
  } catch (error) {
    notify(I18N.t("toast.restoreFailed", { msg: error.message }), "error");
  }
}

async function purgeTrashedAsset(assetId) {
  if (!window.confirm(I18N.t("toast.confirmDeleteOne"))) return;
  try {
    await api(`/api/assets/${assetId}?permanent=1`, { method: "DELETE" });
    state.selectedIds.delete(assetId);
    adjustTrashCount(-1);
    await refreshAssets();
    notify(I18N.t("toast.deleted"));
  } catch (error) {
    notify(I18N.t("toast.deleteFailed", { msg: error.message }), "error");
  }
}

async function batchTrashAssets(ids) {
  if (!ids.length) return;
  try {
    for (const id of ids) {
      await api(`/api/assets/${id}`, { method: "DELETE" });
    }
    state.selectedIds.clear();
    adjustTrashCount(ids.length);
    await refreshAssets();
    notify(I18N.t("toast.movedBatch", { n: ids.length }));
  } catch (error) {
    notify(I18N.t("toast.moveBatchFailed", { msg: error.message }), "error");
  }
}

async function batchRestoreAssets(ids) {
  if (!ids.length) return;
  try {
    for (const id of ids) {
      await api(`/api/assets/${id}/restore`, { method: "POST" });
    }
    state.selectedIds.clear();
    adjustTrashCount(-ids.length);
    await refreshAssets();
    notify(I18N.t("toast.restoredBatch", { n: ids.length }));
  } catch (error) {
    notify(I18N.t("toast.restoreBatchFailed", { msg: error.message }), "error");
  }
}

async function batchPurgeAssets(ids) {
  if (!ids.length) return;
  if (!window.confirm(I18N.t("toast.confirmDeleteBatch", { n: ids.length }))) return;
  try {
    for (const id of ids) {
      await api(`/api/assets/${id}?permanent=1`, { method: "DELETE" });
    }
    state.selectedIds.clear();
    adjustTrashCount(-ids.length);
    await refreshAssets();
    notify(I18N.t("toast.deletedBatch", { n: ids.length }));
  } catch (error) {
    notify(I18N.t("toast.deleteBatchFailed", { msg: error.message }), "error");
  }
}

function adjustTrashCount(delta) {
  const current =
    finiteNumber(state.stats.trashedAssets, state.stats.trashed_assets) ?? 0;
  state.stats.trashedAssets = Math.max(0, current + delta);
}

document.addEventListener("click", async (event) => {
  const starButton = event.target.closest("[data-star]");
  if (starButton) {
    event.preventDefault();
    event.stopPropagation();
    const assetId = starButton.dataset.assetId;
    const starValue = Number(starButton.dataset.star);
    const asset = state.assets.find((item) => item.id === assetId);
    const next = asset?.rating === starValue ? 0 : starValue;
    try {
      await api(`/api/assets/${assetId}`, {
        method: "PATCH",
        body: JSON.stringify({ rating: next }),
      });
      if (asset) asset.rating = next;
      renderGallery();
      renderInspector();
    } catch (error) {
      notify(I18N.t("toast.ratingFailed", { msg: error.message }), "error");
    }
    return;
  }
  const target = event.target;
  const trashButton = target.closest("[data-trash-id]");
  if (trashButton) {
    event.preventDefault();
    event.stopPropagation();
    await trashAsset(trashButton.dataset.trashId);
    return;
  }
  const restoreButton = target.closest("[data-restore-id]");
  if (restoreButton) {
    event.preventDefault();
    event.stopPropagation();
    await restoreTrashedAsset(restoreButton.dataset.restoreId);
    return;
  }
  const purgeButton = target.closest("[data-purge-id]");
  if (purgeButton) {
    event.preventDefault();
    event.stopPropagation();
    await purgeTrashedAsset(purgeButton.dataset.purgeId);
    return;
  }
  const openAssetButton = target.closest("[data-open-asset]");
  if (openAssetButton) {
    const id = openAssetButton.dataset.openAsset;
    if (event.shiftKey) selectBatchRange(id);
    else if (event.ctrlKey || event.metaKey) toggleBatch(id);
    await selectAsset(id);
    return;
  }

  const batchButton = target.closest("[data-batch-id]");
  if (batchButton) {
    toggleBatch(batchButton.dataset.batchId);
    return;
  }

  const collectionButton = target.closest("[data-collection-id]");
  if (collectionButton) {
    await openCollection(collectionButton.dataset.collectionId);
    return;
  }

  const actionTarget = target.closest("[data-action]");
  if (actionTarget) {
    const action = actionTarget.dataset.action;
    if (action === "queue") {
      state.queueExpanded = true;
      renderQueue();
      elements.queueBar.scrollIntoView({ block: "end" });
    } else if (action === "settings") {
      await openSettings();
    } else if (action === "new-collection") {
      elements.collectionForm.reset();
      showDialog(elements.collectionDialog);
      requestAnimationFrame(() => elements.collectionName.focus());
    } else if (action === "import") {
      elements.fileInput.click();
    } else if (action === "clear-filters") {
      clearFilters();
    }
    return;
  }

  const viewButton = target.closest("[data-view]");
  if (viewButton) {
    state.view = viewButton.dataset.view;
    state.activeCollectionId = null;
    state.selectedId = null;
    if (state.view === "collections") renderAll();
    else {
      await refreshAssets();
      closeInspector();
    }
    elements.workspace.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (target.closest("[data-close-inspector]")) {
    closeInspector();
    return;
  }

  const analyzeButton = target.closest("[data-analyze-id]");
  if (analyzeButton) {
    await analyzeAssets([analyzeButton.dataset.analyzeId]);
    return;
  }

  const smartCollectionButton = target.closest("[data-smart-collection]");
  if (smartCollectionButton) {
    try {
      await addToSuggestedCollection(
        smartCollectionButton.dataset.smartAssetId,
        smartCollectionButton.dataset.smartCollection,
      );
    } catch (error) {
      notify(I18N.t("toast.autoClassifyFailed", { msg: error.message }), "error");
    }
    return;
  }

  const copyButton = target.closest("[data-copy-prompt]");
  if (copyButton) {
    await copyPrompt(copyButton.dataset.copyPrompt);
    return;
  }

  const swatchButton = target.closest("[data-copy-swatch]");
  if (swatchButton) {
    try {
      await navigator.clipboard.writeText(swatchButton.dataset.copySwatch);
      notify(I18N.t("toast.swatchCopied", { hex: swatchButton.dataset.copySwatch }));
    } catch (error) {
      notify(I18N.t("toast.swatchCopyFailed", { msg: error.message }), "error");
    }
    return;
  }

  const promptToggle = target.closest("[data-toggle-prompt]");
  if (promptToggle) {
    const block = promptToggle.closest(".prompt-block");
    const expanded = block.classList.toggle("is-expanded");
    promptToggle.setAttribute("aria-expanded", String(expanded));
    promptToggle.textContent = expanded ? I18N.t("common.collapse") : I18N.t("common.expand");
    return;
  }

  const sectionJump = target.closest("[data-inspector-jump]");
  if (sectionJump) {
    const section = document.querySelector(`#inspector-${sectionJump.dataset.inspectorJump}`);
    section?.scrollIntoView({ block: "start", behavior: "smooth" });
    requestAnimationFrame(updateInspectorNav);
    return;
  }

  const metadataButton = target.closest("[data-open-metadata]");
  if (metadataButton) {
    state.metadataEditing = true;
    renderInspector();
    requestAnimationFrame(() => document.querySelector(".metadata-disclosure")?.scrollIntoView({ block: "start", behavior: "smooth" }));
    return;
  }

  const addCollectionButton = target.closest("[data-add-to-collection]");
  if (addCollectionButton) {
    const select = document.querySelector("#inspector-collection-select");
    try {
      await addToCollection(
        addCollectionButton.dataset.addToCollection,
        select?.value || "",
      );
    } catch (error) {
      notify(I18N.t("toast.collectionAddFailed", { msg: error.message }), "error");
    }
    return;
  }

  const removeCollectionButton = target.closest("[data-remove-collection]");
  if (removeCollectionButton) {
    try {
      await removeFromCollection(
        removeCollectionButton.dataset.assetId,
        removeCollectionButton.dataset.removeCollection,
      );
    } catch (error) {
      notify(I18N.t("toast.collectionRemoveFailed", { msg: error.message }), "error");
    }
    return;
  }

  const closeDialogButton = target.closest("[data-close-dialog]");
  if (closeDialogButton) {
    closeDialog(closeDialogButton.closest("dialog"));
  }
});

document.addEventListener(
  "error",
  (event) => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement)) return;
    image.alt = `${image.alt || I18N.t("gallery.altFallback")}${I18N.t("gallery.unreadable")}`;
    image.hidden = true;
    const placeholder = document.createElement("span");
    placeholder.className = "queue-placeholder-thumb";
    placeholder.setAttribute("aria-hidden", "true");
    image.after(placeholder);
  },
  true,
);

document.addEventListener("keydown", (event) => {
  if (trapMobileInspectorFocus(event)) return;
  if (event.key === "/" && !isTypingTarget(event.target)) {
    event.preventDefault();
    elements.searchInput.focus();
    return;
  }
  if (event.key === "Escape" && state.selectedId) {
    closeInspector();
    return;
  }
  if (isTypingTarget(event.target) || document.querySelector("dialog[open]")) {
    return;
  }
  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    event.preventDefault();
    moveSelection(-1);
  } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    event.preventDefault();
    moveSelection(1);
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    window.clearInterval(state.pollTimer);
    state.pollTimer = null;
  } else if (!state.pollTimer) {
    refreshJobs();
    state.pollTimer = window.setInterval(refreshJobs, 5500);
  }
});

document.addEventListener("stylebase:langchange", () => {
  state.syntheticAssets = createSyntheticStudies().map(normalizeAsset);
});

state.syntheticAssets = createSyntheticStudies().map(normalizeAsset);
window.renderAll = renderAll;
loadBootstrap({ preserveSelection: false });
state.pollTimer = window.setInterval(refreshJobs, 5500);
