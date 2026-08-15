/* Stylebase i18n — 零依赖中英切换
 * 挂在 window.I18N: t() / setLang() / toggle() / applyStatic()
 * 静态文案走 data-i18n / data-i18n-aria / data-i18n-ph / data-i18n-title 属性
 * 动态文案(app.js 模板)走 I18N.t("key", { var: value })
 */
(function () {
  "use strict";

  const STORAGE_KEY = "stylebase-lang";

  const zh = {
    // ── 通用 ──
    common: {
      docTitle: "Stylebase — 视觉参考资料库",
      docDescription: "Stylebase 是本地优先的视觉参考资料库，协助设计师整理、分析与重用网页、UI、产品与品牌设计影像。",
      yes: "是",
      no: "否",
      uncategorized: "未分类",
      unnamedImage: "未命名影像",
      unnamedCollection: "未命名收藏集",
      expand: "展开全文",
      collapse: "收起",
      copy: "复制",
      add: "加入",
      added: "已加入",
      remove: "移除",
      restore: "恢复",
      deleteForever: "彻底删除",
      moveToTrash: "移入回收筒",
      saving: "储存中…",
      close: "关闭",
      closeInspector: "关闭详细检视",
      backToLibrary: "返回素材库",
      cancel: "取消",
      reload: "重新载入",
      openSettings: "开启设定",
      newCollection: "新增收藏集",
      createCollection: "建立收藏集",
      saveSettings: "储存设定",
      clearFilters: "清除条件",
      clearSelection: "取消选取",
      collectionName: "收藏集名称",
      settings: "设定",
      loading: "读取中…",
      checking: "检查中",
      localAgent: "本地 Agent",
      localCodexAgent: "本地 Codex Agent",
      ready: "已就绪",
      notReady: "未就绪 · 请确认 Codex CLI 已安装并登入",
      statusUnknown: "状态未知",
      codexReady: "Codex Agent 已就绪",
      codexNotReady: "Codex Agent 尚未就绪",
      codexUnknown: "Codex Agent 状态未知",
    },

    // ── 素材状态（STATUS_LABELS）──
    status: {
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
    },

    // ── 分析面向（FACET_LABELS）──
    facet: {
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
    },

    // ── 导航与视图 ──
    nav: {
      database: "资料库",
      databaseIndex: "资料库索引",
      connecting: "连线中",
      connected: "本地连线",
      disconnected: "连线失败",
      library: "素材库",
      inbox: "待整理",
      collections: "收藏集",
      trash: "资源回收筒",
      queue: "Codex 队列",
      settings: "设定",
      settingsStatus: "设定状态",
      collectionIndex: "收藏索引",
      topbarActions: "汇入与扫描",
      import: "汇入影像",
      importAria: "汇入影像",
      scan: "扫描资料夹",
      scanAria: "扫描图片资料夹",
      recognize: "送交 Codex",
      recognizeAria: "将选取影像送交 Codex 辨识",
    },
    view: {
      library: "素材库",
      inbox: "待整理",
      trash: "资源回收筒",
      collections: "收藏集",
      collection: "收藏集",
      kickerLibrary: "视觉索引",
      kickerCollections: "策展索引",
      kickerInbox: "待确认与待分析",
      kickerTrash: "已移出素材库",
      kickerCurated: "人工策展与条件式视图",
      kickerCurate: "策展",
      kickerSetup: "本地分析环境",
      kickerCollection: "收藏集",
      countItems: "{n} 张",
      countCollections: "{n} 个收藏集",
    },
    collection: {
      emptyDesc: "将研究中的方向整理成收藏集，之后可从影像检视器加入素材。",
      openIndex: "开启索引",
    },

    // ── 搜寻与筛选 ──
    search: {
      label: "搜寻视觉参考",
      placeholder: "搜寻风格、版面、色彩、文字或来源…",
      slashKbd: "快捷键斜线",
      skipLink: "跳到视觉索引",
    },
    filter: {
      aria: "筛选与排序",
      discipline: "领域",
      allDisciplines: "全部领域",
      web: "网页",
      product: "产品",
      brand: "品牌",
      concept: "概念",
      status: "状态",
      allStatuses: "全部状态",
      complete: "分析完成",
      needsReview: "待确认",
      queued: "等待分析",
      processing: "分析中",
      needsSetup: "Codex 未就绪",
      failed: "失败",
      stale: "需更新",
      missing: "原档遗失",
      rating: "星级",
      allRatings: "全部星级",
      ratingAbove: "{n}★ 以上",
      sort: "排序",
      newest: "最新加入",
      byRating: "星级",
      byTitle: "名称",
      byStatus: "分析状态",
      batchHint: "以 Ctrl / Cmd 或每张影像右上角的选取框加入批次",
      batchPrivacy: "送交时才会将选取影像传送至 Codex 服务；汇入本身不会上传。",
    },

    // ── 素材库 ──
    gallery: {
      aria: "视觉参考影像",
      dimensionsUnknown: "尺寸未记录",
      syntheticFlag: "合成示意",
      addToBatch: "加入批次",
      removeFromBatch: "从批次移除",
      moveToTrash: "移入回收筒",
      view: "检视",
      rating: "评分 {rating}/5",
      setStar: "设为 {star} 星",
      emptyTitle: "没有符合条件的影像",
      emptyLibrary: "素材库目前为空",
      emptyTrash: "回收筒是空的",
      emptyTrashDesc: "删除的素材会先移到这里，恢复或彻底删除前都还找得回来。",
      emptyLibraryDesc: "汇入影像，或把图片放入监看资料夹后执行扫描。",
      emptyNoMatchDesc: "调整搜寻字词或清除筛选条件；资料不会因为没有结果而被移除。",
      importFirst: "汇入第一张影像",
      syntheticIntro: "合成介面研究",
      syntheticDesc: "这些 inline SVG 只在 API 素材库为空时出现，不会写入资料库或送交 Codex。",
      importReal: "汇入真实影像",
      contextEmpty: "资料库目前为空 · 显示 {n} 张合成介面研究",
      contextCount: "{label} · {n} 张影像",
      altFallback: "影像",
      copySwatch: "复制色票 {hex}",
      unreadable: "（无法读取）",
    },

    // ── 检查器 ──
    inspector: {
      aria: "影像详细检视",
      ariaTitle: "影像详细检视：{title}",
      emptyTitle: "选一张影像，开始校样。",
      emptyDesc: "你的工作台，等一张好图。",
      emptyKbdSwitch: "切换影像",
      emptyKbdClose: "关闭",
      navAria: "检查器章节",
      jumpOverview: "概览",
      jumpVisual: "视觉分析",
      jumpImplementation: "实作输出",
      jumpManagement: "资料管理",
      previewTag: "预览",
      visualTag: "视觉 DNA",
      codexTag: "用于 Codex",
      sourceTag: "来源与资料",
      formatUnknown: "格式未记录",
      inQueue: "已在 Codex 队列",
      submitCodex: "送交 Codex",
      confidence: "信心度",
      submitHint: "按下后会将此影像传送至 Codex 服务分析；单纯汇入不会上传。",
      noSummary: "尚未建立分析摘要；送交 Codex 后会在这里显示。",
      copyPrompt: "复制 Prompt",
      editMetadata: "编辑 metadata",
      noPalette: "尚未撷取色票。",
      noPrompt: "尚未产生这组提示词。",
      smartTitle: "智能分类建议",
      smartSource: "根据 Codex 分析",
      smartHint: "点击建议即可创建或加入对应收藏集。",
      smartJoin: "创建并加入",
      noCollections: "尚未建立收藏集。",
      openIndex: "开启索引",
      selectCollection: "选择收藏集…",
      collectionSelectAria: "选择收藏集",
      removeFromCollection: "移出 {name}",
      noEvidence: "尚未产生设计判读。",
      noDna: "尚未建立 Visual DNA",
      noDnaHint: "选取「送交 Codex」后，这里会显示可编辑的视觉分类与描述。",
      paletteTitle: "色票",
      whyWorks: "为何有效",
      noRecipe: "尚未产生实作步骤。",
      promptVisual: "视觉提示词",
      promptUIBrief: "UI 实作 brief",
      promptToken: "Design token 提示词",
      promptNegative: "负面条件",
      mainActions: "主要操作",
      syntheticDisclosure: "合成介面研究：只在 API 素材库为空时显示，不会储存、编辑或送交 Codex。",
      title: "标题",
      sourceUrl: "来源 URL",
      rightsNote: "权利备注",
      rightsPlaceholder: "授权、作者、用途限制…",
      notes: "人工笔记",
      notesPlaceholder: "可重用的版面或实作观察…",
      saveMetadata: "储存 metadata",
      editMetaSummary: "编辑 metadata",
      expandMetaSummary: "展开编辑",
      relPath: "相对路径",
      fileSize: "档案大小",
      hash: "杂凑",
      model: "Codex 模型",
      promptVersion: "Prompt 版",
      analyzedAt: "分析时间",
      expandEvidence: "展开技术证据",
    },

    // ── 队列 ──
    queue: {
      aria: "分析队列",
      title: "Codex 分析队列",
      empty: "尚无工作",
      emptyDesc: "选取影像并按「送交 Codex」，工作会出现在这里。",
      activeSummary: "{n} 项执行或等待中 · 同时工作数 1",
      recentSummary: "最近 {n} 项工作",
      retrySetup: "完成设定后重试",
      jobFallback: "影像 {id}",
      managedBy: "由本地服务管理",
    },

    // ── 批次与动作 ──
    action: {
      batchAria: "批次操作",
      batchCount: "已选 {n} 张",
      submitN: "将 {n} 张影像送交 Codex",
      submitHint2: "请先选取一张真实影像",
      submitAria: "将批次选取影像送交 Codex 辨识",
      importProgress: "汇入 {done} / {total}",
      scanning: "扫描中…",
    },

    // ── 通知 ──
    toast: {
      metaReadFailed: "无法读取完整 metadata：{msg}",
      submitted: "{n} 张影像已送交 Codex，队列同时工作数为 1。",
      submitErrors: "有 {n} 张未能排入队列：{first}",
      readFileFailed: "无法读取档案",
      noFiles: "没有可汇入的影像档案。",
      importDone: "{n} 张影像已汇入并选取；确认后按「送交 Codex」开始辨识。",
      importErrors: "有 {n} 张未汇入：{first}",
      scanDone: "扫描完成：{files} 个档案，新增 {added} 张，重复 {dupes} 张。",
      scanFailed: "扫描失败：{msg}",
      metaSaved: "Metadata 已储存。",
      metaSaveFailed: "Metadata 储存失败：{msg}",
      createCollectionFailed: "无法创建分类收藏集。",
      autoCategorized: "已自动归类到「{name}」。",
      selectCollectionFirst: "请先选择收藏集。",
      addedToCollection: "影像已加入收藏集。",
      removedFromCollection: "影像已移出收藏集。",
      clearFiltersFailed: "无法清除条件：{msg}",
      promptCopied: "提示词已复制到剪贴簿。",
      promptCopyFailed: "无法复制提示词：{msg}",
      searchFailed: "搜寻失败：{msg}",
      filterFailed: "筛选失败：{msg}",
      sortFailed: "排序失败：{msg}",
      collectionCreated: "已建立收藏集「{name}」。",
      collectionCreateFailed: "无法建立收藏集：{msg}",
      settingsSaved: "Codex 设定已储存。",
      settingsSaveFailed: "设定储存失败：{msg}",
      retried: "已将 {n} 项工作重新排入 Codex 队列。",
      retryFailed: "无法重试工作：{msg}",
      movedToTrash: "已移入回收筒。",
      moveToTrashFailed: "无法移入回收筒：{msg}",
      restored: "已恢复。",
      restoreFailed: "无法恢复：{msg}",
      confirmDeleteOne: "彻底删除后无法恢复，确定删除这张素材？",
      deleted: "已彻底删除。",
      deleteFailed: "无法删除：{msg}",
      movedBatch: "已将 {n} 张移入回收筒。",
      moveBatchFailed: "批次移入失败：{msg}",
      restoredBatch: "已恢复 {n} 张。",
      restoreBatchFailed: "批次恢复失败：{msg}",
      confirmDeleteBatch: "彻底删除 {n} 张素材？此操作无法恢复。",
      deletedBatch: "已彻底删除 {n} 张。",
      deleteBatchFailed: "批次删除失败：{msg}",
      ratingFailed: "评分失败：{msg}",
      autoClassifyFailed: "无法自动归类：{msg}",
      swatchCopied: "已复制色值 {hex}。",
      swatchCopyFailed: "无法复制色值：{msg}",
      collectionAddFailed: "无法加入收藏集：{msg}",
      collectionRemoveFailed: "无法移出收藏集：{msg}",
    },

    // ── 设定 ──
    setup: {
      title: "Codex CLI / Agent 尚未就绪",
      desc: "你仍可在本机汇入、整理与浏览；汇入不会上传，只有按「送交 Codex」才会传送影像。",
      watchFolder: "监看资料夹",
      watchHint: "将影像放入这个资料夹，再按「启动辨识」。",
      model: "Codex 模型",
      modelPlaceholder: "留空以使用已登入的预设模型",
      modelHint: "只接受 Codex CLI / Agent 可识别的模型名称。",
      execMode: "执行模式",
      concurrency: "同时工作数",
      promptVersion: "Prompt 版本",
    },

    // ── 其他状态文案 ──
    misc: {
      homeAria: "Stylebase 视觉索引首页",
      serverResponse: "本地服务回传 {status}",
      dbUnreachable: "本地资料库无法连线",
      dbErrorHint: "请确认本地服务仍在执行，再重新载入。",
      loadingDb: "正在读取本地资料库…",
      calibrating: "正在校准视觉索引与分析队列…",
      dbErrorTitle: "无法读取本地资料库",
    },

    // ── 来源分类标签 ──
    source: {
      web: "网页与界面",
      product: "产品与包装",
      brand: "品牌视觉",
      layout: "布局与构图",
      color: "色彩与字体",
    },

    // ── 合成介面研究（API 素材库为空时的演示素材）──
    seed: {
      v1: "克制／低至中密度",
      v2: "聚焦／中密度",
      typography: "清楚字级阶层、用途导向",
      principle1: "主视觉与文字层级只有一个明确焦点",
      principle2: "色彩角色固定，不以装饰取代内容",
      principle3: "构图可直接转译成响应式网格",
      do1: "先定义主内容与索引区的比例",
      do2: "以单一讯号色标记状态与主要操作",
      do3: "在小萤幕保持原本阅读顺序，再折叠次要资讯",
      visual: "{title}，{style}，{composition}，中性色基底，单一讯号色，真实内容主导，无玻璃特效、无霓虹、无通用仪表板卡片。",
      implementation: "以语意化 HTML、CSS Grid 与可存取控制元件实作「{title}」方向；保留{composition}，图片优先，状态以单一校准色表达。",
      negative: "渐层光球、玻璃拟态、霓虹描边、卡片套卡片、巨大标题、无意义 AI 分数",
      s1: {
        title: "校准建筑／首页",
        desc: "以宽幅建筑影像、低密度导览与克制字级建立安静但明确的首页层级。",
        style: "极简、建筑、编辑",
        composition: "非对称分割、影像主导、宽留白",
      },
      s2: {
        title: "模组字体／海报",
        desc: "巨幅无衬线字体与校样红线构成单一视觉承诺，适合作为品牌宣言。",
        style: "字体主导、现代主义",
        composition: "满版字级、严格基线、单点讯号色",
      },
      s3: {
        title: "静物材质／品牌",
        desc: "中性棚拍、触感材质与少量标签，让产品本身成为品牌识别的证据。",
        style: "静物摄影、自然材质",
        composition: "中心聚焦、低对比背景、尺度留白",
      },
      s4: {
        title: "流动状态／概念",
        desc: "高饱和场域与分栏节奏用来表达运动、音乐或文化活动的动态性。",
        style: "文化海报、动态模糊",
        composition: "互补色冲突、分割栏位、大字短句",
      },
      s5: {
        title: "资料层级／UI",
        desc: "窄索引配合宽资料区，使用明确基线与单一蓝色表示可操作状态。",
        style: "工具介面、资讯设计",
        composition: "侧栏索引、水平读序、数据层级",
      },
      s6: {
        title: "包装比例／产品",
        desc: "以几何容器、低彩度纸材与比例对照建立可靠的产品叙事。",
        style: "包装、材质研究",
        composition: "中心物件、比例对照、低密度注记",
      },
      s7: {
        title: "深色架构／网页",
        desc: "深色框架与亮色内容页形成场域切换，焦点留给案例本身而非介面装饰。",
        style: "作品集、深色框架",
        composition: "框中框、案例聚焦、低彩度",
      },
      s8: {
        title: "介面图谱／品牌",
        desc: "将识别元素依比例、字级与应用场景编成一张可实作的品牌图谱。",
        style: "品牌规范、系统化",
        composition: "模组网格、比例标记、可追溯编号",
      },
    },
  };

  const en = {
    common: {
      docTitle: "Stylebase — Visual Reference Library",
      docDescription: "Stylebase is a local-first visual reference library that helps designers organize, analyze, and reuse web, UI, product, and brand imagery.",
      yes: "Yes",
      no: "No",
      uncategorized: "Uncategorized",
      unnamedImage: "Untitled image",
      unnamedCollection: "Untitled collection",
      expand: "Expand",
      collapse: "Collapse",
      copy: "Copy",
      add: "Add",
      added: "Added",
      remove: "Remove",
      restore: "Restore",
      deleteForever: "Delete forever",
      moveToTrash: "Move to trash",
      saving: "Saving…",
      close: "Close",
      closeInspector: "Close inspector",
      backToLibrary: "Back to library",
      cancel: "Cancel",
      reload: "Reload",
      openSettings: "Open settings",
      newCollection: "New collection",
      createCollection: "Create collection",
      saveSettings: "Save settings",
      clearFilters: "Clear filters",
      clearSelection: "Clear selection",
      collectionName: "Collection name",
      settings: "Settings",
      loading: "Loading…",
      checking: "Checking",
      localAgent: "Local agent",
      localCodexAgent: "Local Codex agent",
      ready: "Ready",
      notReady: "Not ready · make sure the Codex CLI is installed and signed in",
      statusUnknown: "Status unknown",
      codexReady: "Codex agent ready",
      codexNotReady: "Codex agent not ready",
      codexUnknown: "Codex agent status unknown",
    },
    status: {
      discovered: "Detected",
      imported: "Imported",
      hashing: "Indexing",
      queued: "Waiting for Codex",
      pending: "Waiting for Codex",
      running: "Analyzing with Codex",
      processing: "Analyzing with Codex",
      analyzing: "Analyzing with Codex",
      ready: "Analysis complete",
      complete: "Analysis complete",
      completed: "Analysis complete",
      needs_review: "Needs review",
      needs_setup: "Codex not ready",
      failed: "Analysis failed",
      missing: "File missing",
      stale_analysis: "Needs update",
      duplicate: "Duplicate",
      synthetic: "Synthetic",
    },
    facet: {
      discipline: "Discipline",
      category: "Category",
      artifact: "Artifact",
      surface: "Surface",
      style: "Style",
      lineage: "Design lineage",
      composition: "Composition",
      layout: "Layout",
      grid: "Grid",
      density: "Density",
      hierarchy: "Hierarchy",
      typography: "Typography",
      color: "Color",
      imagery: "Imagery",
      material: "Material",
      mood: "Mood",
      era: "Era",
      interaction: "Interaction",
    },
    nav: {
      database: "Database",
      databaseIndex: "Database index",
      connecting: "Connecting…",
      connected: "Local connection",
      disconnected: "Connection failed",
      library: "Library",
      inbox: "Inbox",
      collections: "Collections",
      trash: "Trash",
      queue: "Codex queue",
      settings: "Settings",
      settingsStatus: "Settings status",
      collectionIndex: "Collection index",
      topbarActions: "Import & scan",
      import: "Import image",
      importAria: "Import image",
      scan: "Scan folder",
      scanAria: "Scan image folder",
      recognize: "Send to Codex",
      recognizeAria: "Send selected image to Codex",
    },
    view: {
      library: "Library",
      inbox: "Inbox",
      trash: "Trash",
      collections: "Collections",
      collection: "Collection",
      kickerLibrary: "Visual index",
      kickerCollections: "Curated index",
      kickerInbox: "Needs review & analysis",
      kickerTrash: "Removed from library",
      kickerCurated: "Curated & conditional views",
      kickerCurate: "Curated",
      kickerSetup: "Local analysis environment",
      kickerCollection: "Collection",
      countItems: "{n} items",
      countCollections: "{n} collections",
    },
    collection: {
      emptyDesc: "Organize ongoing research into collections, then add assets from the inspector.",
      openIndex: "Open index",
    },
    search: {
      label: "Search visual references",
      placeholder: "Search style, layout, color, text or source…",
      slashKbd: "Slash shortcut",
      skipLink: "Skip to visual index",
    },
    filter: {
      aria: "Filter & sort",
      discipline: "Discipline",
      allDisciplines: "All disciplines",
      web: "Web",
      product: "Product",
      brand: "Brand",
      concept: "Concept",
      status: "Status",
      allStatuses: "All statuses",
      complete: "Analysis complete",
      needsReview: "Needs review",
      queued: "Queued",
      processing: "Processing",
      needsSetup: "Codex not ready",
      failed: "Failed",
      stale: "Needs update",
      missing: "File missing",
      rating: "Rating",
      allRatings: "All ratings",
      ratingAbove: "{n}★ or more",
      sort: "Sort",
      newest: "Newest",
      byRating: "Rating",
      byTitle: "Title",
      byStatus: "Status",
      batchHint: "Use Ctrl / Cmd, or the checkmark on each image, to batch-select",
      batchPrivacy: "Selected images are only sent to Codex when you submit; importing itself never uploads.",
    },
    gallery: {
      aria: "Visual reference images",
      dimensionsUnknown: "Dimensions unknown",
      syntheticFlag: "Synthetic",
      addToBatch: "Add to batch",
      removeFromBatch: "Remove from batch",
      moveToTrash: "Move to trash",
      view: "View",
      rating: "Rating {rating}/5",
      setStar: "Rate {star} star(s)",
      emptyTitle: "No matching images",
      emptyLibrary: "The library is empty",
      emptyTrash: "Trash is empty",
      emptyTrashDesc: "Deleted assets land here first, recoverable until restored or permanently removed.",
      emptyLibraryDesc: "Import images, or drop files into the watch folder and run a scan.",
      emptyNoMatchDesc: "Adjust your search or clear filters; nothing is removed just because a query found no results.",
      importFirst: "Import your first image",
      syntheticIntro: "Synthetic interface study",
      syntheticDesc: "These inline SVGs appear only when the API library is empty; they are never stored or sent to Codex.",
      importReal: "Import real images",
      contextEmpty: "Library is empty · showing {n} synthetic studies",
      contextCount: "{label} · {n} images",
      altFallback: "image",
      copySwatch: "Copy swatch {hex}",
      unreadable: " (unreadable)",
    },
    inspector: {
      aria: "Image inspector",
      ariaTitle: "Image inspector: {title}",
      emptyTitle: "Pick an image to start proofing.",
      emptyDesc: "Your workbench, waiting for a good one.",
      emptyKbdSwitch: "switch image",
      emptyKbdClose: "close",
      navAria: "Inspector sections",
      jumpOverview: "Overview",
      jumpVisual: "Visual analysis",
      jumpImplementation: "Implementation",
      jumpManagement: "Data & sources",
      previewTag: "Preview",
      visualTag: "Visual DNA",
      codexTag: "For Codex",
      sourceTag: "Source & data",
      formatUnknown: "Format unknown",
      inQueue: "In Codex queue",
      submitCodex: "Send to Codex",
      confidence: "confidence",
      submitHint: "Sends this image to Codex for analysis; plain import never uploads.",
      noSummary: "No analysis summary yet; it will appear here after sending to Codex.",
      copyPrompt: "Copy prompt",
      editMetadata: "Edit metadata",
      noPalette: "No swatches extracted yet.",
      noPrompt: "No prompt generated yet.",
      smartTitle: "Smart collection suggestions",
      smartSource: "Based on Codex analysis",
      smartHint: "Click a suggestion to create or join that collection.",
      smartJoin: "Create & add",
      noCollections: "No collections yet.",
      openIndex: "Open index",
      selectCollection: "Select a collection…",
      collectionSelectAria: "Select collection",
      removeFromCollection: "Remove from {name}",
      noEvidence: "No design rationale yet.",
      noDna: "No Visual DNA yet",
      noDnaHint: "After sending to Codex, editable visual categories and descriptions appear here.",
      paletteTitle: "Swatches",
      whyWorks: "Why it works",
      noRecipe: "No implementation steps yet.",
      promptVisual: "Visual prompt",
      promptUIBrief: "UI implementation brief",
      promptToken: "Design token prompt",
      promptNegative: "Negative conditions",
      mainActions: "Primary actions",
      syntheticDisclosure: "Synthetic interface study: shown only when the API library is empty; never stored, edited, or sent to Codex.",
      title: "Title",
      sourceUrl: "Source URL",
      rightsNote: "Rights note",
      rightsPlaceholder: "License, author, usage limits…",
      notes: "Notes",
      notesPlaceholder: "Reusable layout or implementation notes…",
      saveMetadata: "Save metadata",
      editMetaSummary: "Edit metadata",
      expandMetaSummary: "Expand editor",
      relPath: "Relative path",
      fileSize: "File size",
      hash: "Hash",
      model: "Codex model",
      promptVersion: "Prompt version",
      analyzedAt: "Analyzed at",
      expandEvidence: "Expand technical evidence",
    },
    queue: {
      aria: "Analysis queue",
      title: "Codex analysis queue",
      empty: "No jobs yet",
      emptyDesc: "Select an image and press “Send to Codex”; jobs appear here.",
      activeSummary: "{n} running or waiting · concurrency 1",
      recentSummary: "Last {n} jobs",
      retrySetup: "Retry after setup",
      jobFallback: "Image {id}",
      managedBy: "Managed by local service",
    },
    action: {
      batchAria: "Batch actions",
      batchCount: "{n} selected",
      submitN: "Send {n} images to Codex",
      submitHint2: "Select a real image first",
      submitAria: "Send selected images to Codex",
      importProgress: "Import {done} / {total}",
      scanning: "Scanning…",
    },
    toast: {
      metaReadFailed: "Could not read full metadata: {msg}",
      submitted: "{n} images sent to Codex, concurrency 1.",
      submitErrors: "{n} could not be queued: {first}",
      readFileFailed: "Could not read file",
      noFiles: "No image files to import.",
      importDone: "{n} images imported and selected; press “Send to Codex” to analyze.",
      importErrors: "{n} could not be imported: {first}",
      scanDone: "Scan complete: {files} files, {added} added, {dupes} duplicates.",
      scanFailed: "Scan failed: {msg}",
      metaSaved: "Metadata saved.",
      metaSaveFailed: "Could not save metadata: {msg}",
      createCollectionFailed: "Could not create collection.",
      autoCategorized: "Auto-filed into “{name}”.",
      selectCollectionFirst: "Select a collection first.",
      addedToCollection: "Image added to collection.",
      removedFromCollection: "Image removed from collection.",
      clearFiltersFailed: "Could not clear filters: {msg}",
      promptCopied: "Prompt copied to clipboard.",
      promptCopyFailed: "Could not copy prompt: {msg}",
      searchFailed: "Search failed: {msg}",
      filterFailed: "Filter failed: {msg}",
      sortFailed: "Sort failed: {msg}",
      collectionCreated: "Collection “{name}” created.",
      collectionCreateFailed: "Could not create collection: {msg}",
      settingsSaved: "Codex settings saved.",
      settingsSaveFailed: "Could not save settings: {msg}",
      retried: "{n} jobs re-queued to Codex.",
      retryFailed: "Could not retry jobs: {msg}",
      movedToTrash: "Moved to trash.",
      moveToTrashFailed: "Could not move to trash: {msg}",
      restored: "Restored.",
      restoreFailed: "Could not restore: {msg}",
      confirmDeleteOne: "This cannot be undone. Permanently delete this asset?",
      deleted: "Permanently deleted.",
      deleteFailed: "Could not delete: {msg}",
      movedBatch: "{n} images moved to trash.",
      moveBatchFailed: "Batch move failed: {msg}",
      restoredBatch: "{n} images restored.",
      restoreBatchFailed: "Batch restore failed: {msg}",
      confirmDeleteBatch: "Permanently delete {n} assets? This cannot be undone.",
      deletedBatch: "{n} assets permanently deleted.",
      deleteBatchFailed: "Batch delete failed: {msg}",
      ratingFailed: "Rating failed: {msg}",
      autoClassifyFailed: "Could not auto-classify: {msg}",
      swatchCopied: "Color copied: {hex}.",
      swatchCopyFailed: "Could not copy color: {msg}",
      collectionAddFailed: "Could not add to collection: {msg}",
      collectionRemoveFailed: "Could not remove from collection: {msg}",
    },
    setup: {
      title: "Codex CLI / agent is not ready",
      desc: "You can still import, organize, and browse locally; import never uploads, only “Send to Codex” transmits images.",
      watchFolder: "Watch folder",
      watchHint: "Drop images into this folder, then run recognition.",
      model: "Codex model",
      modelPlaceholder: "Leave blank to use the signed-in default model",
      modelHint: "Only accepts model names the Codex CLI / agent recognizes.",
      execMode: "Execution mode",
      concurrency: "Concurrency",
      promptVersion: "Prompt version",
    },
    misc: {
      homeAria: "Stylebase visual index home",
      serverResponse: "Local service responded {status}",
      dbUnreachable: "Cannot reach local database",
      dbErrorHint: "Make sure the local server is running, then reload.",
      loadingDb: "Reading local database…",
      calibrating: "Calibrating visual index and analysis queue…",
      dbErrorTitle: "Cannot read local database",
    },
    source: {
      web: "Web & UI",
      product: "Product & packaging",
      brand: "Brand identity",
      layout: "Layout & composition",
      color: "Color & typography",
    },
    seed: {
      v1: "Restrained / low-to-mid density",
      v2: "Focused / mid density",
      typography: "Clear type hierarchy, purpose-driven",
      principle1: "One clear focal point between hero and type",
      principle2: "Color roles stay fixed; decoration never substitutes for content",
      principle3: "Composition translates directly into a responsive grid",
      do1: "Define the ratio between content and index area first",
      do2: "Mark states and primary actions with a single signal color",
      do3: "Keep the reading order on small screens, then fold secondary info",
      visual: "{title}, {style}, {composition}, neutral base, single signal color, real content first, no glassmorphism, no neon, no generic dashboard cards.",
      implementation: "Implement “{title}” with semantic HTML, CSS Grid, and accessible controls; keep {composition}, image-first, states in one calibrated color.",
      negative: "Gradient orbs, glassmorphism, neon outlines, cards inside cards, giant headings, meaningless AI scores",
      s1: {
        title: "Editorial Architecture / Homepage",
        desc: "Wide architectural imagery, low-density navigation, and restrained type establish a quiet but definite homepage hierarchy.",
        style: "Minimal, architectural, editorial",
        composition: "Asymmetric split, image-led, generous whitespace",
      },
      s2: {
        title: "Modular Type / Poster",
        desc: "Oversized sans-serif type and proofing redlines make a single visual promise; works as a brand manifesto.",
        style: "Type-led, modernist",
        composition: "Full-bleed type scale, strict baseline, single accent",
      },
      s3: {
        title: "Still Life / Brand",
        desc: "Neutral studio shots, tactile materials, and sparse labeling let the product itself evidence the brand.",
        style: "Still-life photography, natural materials",
        composition: "Centered focus, low-contrast backdrop, scaled whitespace",
      },
      s4: {
        title: "Motion State / Concept",
        desc: "Saturated fields and split-column rhythm express the energy of sports, music, or cultural events.",
        style: "Cultural poster, motion blur",
        composition: "Complementary contrast, split columns, big type in short lines",
      },
      s5: {
        title: "Data Hierarchy / UI",
        desc: "A narrow index beside a wide data area, with clear baselines and a single blue for actionable states.",
        style: "Tool UI, information design",
        composition: "Sidebar index, horizontal reading order, data hierarchy",
      },
      s6: {
        title: "Package Ratio / Product",
        desc: "Geometric containers, low-chroma paper stock, and proportion studies build a dependable product narrative.",
        style: "Packaging, material study",
        composition: "Central object, proportion studies, sparse annotation",
      },
      s7: {
        title: "Dark Frame / Web",
        desc: "A dark frame around bright content pages creates a field switch; focus stays on the work, not chrome.",
        style: "Portfolio, dark frame",
        composition: "Frame-in-frame, case focus, low chroma",
      },
      s8: {
        title: "Interface Atlas / Brand",
        desc: "Identity elements organized by proportion, type scale, and application into a workable brand atlas.",
        style: "Brand guidelines, systematic",
        composition: "Modular grid, proportion marks, traceable numbering",
      },
    },
  };

  const dicts = { zh, en };
  const langAttr = { zh: "zh-Hans", en: "en" };

  let lang = "zh";
  try {
    lang = window.localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "zh";
  } catch (err) {
    /* 隐私模式等场景，保留预设 */
  }

  function resolve(dict, key) {
    let text = dict[key];
    if (text === undefined && key.includes(".")) {
      let obj = dict;
      for (const part of key.split(".")) {
        if (obj === null || typeof obj !== "object") {
          obj = undefined;
          break;
        }
        obj = obj[part];
      }
      text = typeof obj === "string" ? obj : undefined;
    }
    return text;
  }

  function lookup(key) {
    let text = resolve(dicts[lang], key);
    if (text === undefined) text = resolve(dicts.zh, key);
    return text === undefined ? key : text;
  }

  function t(key, vars) {
    let text = lookup(key);
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        text = text.replaceAll(`{${name}}`, String(value));
      }
    }
    return text;
  }

  function applyStatic(root) {
    const scope = root || document;
    scope.querySelectorAll("[data-i18n]").forEach((el) => {
      const vars = el.dataset.i18nVar ? { n: el.dataset.i18nVar } : undefined;
      el.textContent = t(el.dataset.i18n, vars);
    });
    scope.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", t(el.dataset.i18nAria));
    });
    scope.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      el.placeholder = t(el.dataset.i18nPh);
    });
    scope.querySelectorAll("[data-i18n-title]").forEach((el) => {
      el.title = t(el.dataset.i18nTitle);
    });
    scope.querySelectorAll("[data-i18n-content]").forEach((el) => {
      el.setAttribute("content", t(el.dataset.i18nContent));
    });
  }

  function updateToggleButton() {
    const btn = document.getElementById("lang-toggle");
    if (!btn) return;
    btn.textContent = lang === "zh" ? "EN" : "中";
    btn.setAttribute("aria-label", lang === "zh" ? "Switch to English" : "切换到中文");
  }

  function setLang(next, options) {
    lang = next === "en" ? "en" : "zh";
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (err) {
      /* ignore */
    }
    document.documentElement.lang = langAttr[lang];
    document.documentElement.setAttribute("data-lang", lang);
    applyStatic(document);
    updateToggleButton();
    document.dispatchEvent(
      new CustomEvent("stylebase:langchange", { detail: { lang } }),
    );
    if (options && options.rerender && window.renderAll) {
      window.renderAll();
    }
  }

  function toggle() {
    setLang(lang === "zh" ? "en" : "zh", { rerender: true });
  }

  // 初始化：DOM 尚未完整时只设 <html>，静态文案等 DOMContentLoaded 再套
  document.documentElement.lang = langAttr[lang];
  document.documentElement.setAttribute("data-lang", lang);
  window.addEventListener("DOMContentLoaded", () => {
    applyStatic(document);
    updateToggleButton();
    const toggleButton = document.getElementById("lang-toggle");
    if (toggleButton) toggleButton.addEventListener("click", toggle);
  });

  window.I18N = {
    t,
    setLang,
    toggle,
    applyStatic,
    get lang() {
      return lang;
    },
  };
})();
