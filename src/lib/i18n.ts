/**
 * Lightweight bilingual dictionary (Arabic / English) for all UI chrome and
 * labels. Financial source data (sheet names, company names) stays in
 * Arabic since that's how the underlying workbook is authored — this
 * dictionary covers navigation, headers, buttons, KPI/metric labels, table
 * headers, and messaging so the platform is fully usable, and correctly
 * mirrored (RTL/LTR), in either language.
 */
import { useLocaleStore } from "@/store/localeStore";

export const dict = {
  appName: { ar: "أصل البرجر", en: "Asl Burger" },
  appTagline: { ar: "FP&A Platform", en: "FP&A Platform" },
  headerSubtitle: {
    ar: "منصة التخطيط والتحليل المالي المؤسسي — شركة أصل البرجر",
    en: "Enterprise Financial Planning & Analysis Platform — Asl Burger",
  },
  navOverview: { ar: "لوحة العرض التنفيذي", en: "Executive Overview" },
  navStatements: { ar: "القوائم المالية", en: "Financial Statements" },
  navScenarios: { ar: "السيناريوهات والتقييم", en: "Scenarios & Valuation" },
  navBenchmarks: { ar: "معايير الصناعة", en: "Industry Benchmarks" },
  dataSource: { ar: "مصدر البيانات", en: "Data source" },
  sampleAudited: { ar: "عينة مدققة", en: "Audited sample" },
  openNav: { ar: "فتح القائمة", en: "Open menu" },
  closeNav: { ar: "إغلاق القائمة", en: "Close menu" },
  langToggle: { ar: "English", en: "العربية" },

  uploadButton: { ar: "رفع ملف الإكسل", en: "Upload Excel file" },
  dataSourceTitle: { ar: "مصدر البيانات", en: "Data Source" },
  dataSourceDesc: {
    ar: "الملف المرفوع هو مصدر الحقيقة الوحيد للمنصة — كل المؤشرات والرسومات والتقييم تُعاد حسابها تلقائيًا فور الرفع.",
    en: "The uploaded workbook is the platform's single source of truth — every KPI, chart, and valuation recalculates automatically the moment you upload.",
  },
  noFile: { ar: "لا يوجد ملف", en: "No file" },
  sampleDatasetDesc: { ar: "عينة افتراضية مبنية على البيانات المدققة", en: "Default sample built on audited figures" },
  userUploadedDesc: { ar: "ملف مرفوع من المستخدم", en: "File uploaded by user" },
  sampleBadge: { ar: "عينة", en: "Sample" },
  liveBadge: { ar: "مباشر", en: "Live" },
  resetToSample: { ar: "الرجوع للعينة الافتراضية", en: "Reset to sample data" },
  chooseFile: { ar: "اختيار ملف .xlsx", en: "Choose .xlsx file" },
  parsing: { ar: "جارٍ القراءة...", en: "Reading file..." },
  exportButton: { ar: "تصدير", en: "Export" },
  exportCsv: { ar: "تصدير CSV", en: "Export CSV" },
  exportXlsx: { ar: "تصدير Excel", en: "Export Excel" },

  errFileTooLarge: {
    ar: "حجم الملف كبير جدًا (الحد الأقصى 15 ميجابايت).",
    en: "File is too large (15 MB maximum).",
  },
  errFileType: {
    ar: "صيغة الملف غير مدعومة. الرجاء رفع ملف .xlsx أو .xls فقط.",
    en: "Unsupported file type. Please upload a .xlsx or .xls file only.",
  },
  errFileEmpty: { ar: "الملف فارغ أو تالف.", en: "The file is empty or corrupted." },
  errGeneric: { ar: "تعذرت قراءة ملف الإكسل.", en: "Could not read the Excel file." },

  // Executive Overview
  currentRatioExceeds: {
    ar: "نسبة التداول المتوقعة",
    en: "Projected current ratio",
  },
  aboveIndustryBand: { ar: "أعلى من نطاق الصناعة", en: "is above the industry band",
  },
  boardNote: {
    ar: "هذا يعكس تراكم نقدية فائضة عن حاجة التشغيل. خيارات مطروحة على مستوى مجلس الإدارة: رفع نسبة التوزيع، تسريع خطة التوسع، توزيعات استثنائية، أو تكوين احتياطي استراتيجي.",
    en: "This reflects cash accumulating beyond operating needs. Board-level options include: raising the payout ratio, accelerating expansion, special dividends, or building a strategic reserve.",
  },
  kpiLastActualRevenue: { ar: "إيرادات آخر سنة فعلية", en: "Latest actual revenue" },
  kpiLastActualNetIncome: { ar: "صافي الربح آخر سنة فعلية", en: "Latest actual net income" },
  kpiRevenue2030: { ar: "الإيرادات المتوقعة 2030", en: "Projected 2030 revenue" },
  kpiCash2030: { ar: "النقدية آخر المدة 2030", en: "2030 ending cash" },
  chartRevenueNetIncomeTitle: {
    ar: "الإيرادات وصافي الربح — فعلي ومتوقع (2018–2030)",
    en: "Revenue & Net Income — Actual vs. Forecast (2018–2030)",
  },
  legendRevenueActual: { ar: "الإيرادات (فعلي)", en: "Revenue (actual)" },
  legendRevenueForecast: { ar: "الإيرادات (متوقع)", en: "Revenue (forecast)" },
  legendNetIncomeActual: { ar: "صافي الربح (فعلي)", en: "Net income (actual)" },
  legendNetIncomeForecast: { ar: "صافي الربح (متوقع)", en: "Net income (forecast)" },
  chartRevenueNetIncomeDesc: {
    ar: "خط متصل يمثل الفعلي، والفاصل يمثل السيناريو الأساسي المتوقع",
    en: "Solid line = actual, dashed line = base-case forecast",
  },
  benchmarkSummaryTitle: { ar: "موجز المقارنة مع الصناعة", en: "Industry Comparison Summary" },
  benchmarkSummaryDesc: { ar: "متوسط الموديل 2026–2030 مقابل متوسط الصناعة", en: "2026-2030 model average vs. industry average" },
  metricGrossMargin: { ar: "هامش إجمالي الربح", en: "Gross margin" },
  metricEbitdaMargin: { ar: "هامش EBITDA", en: "EBITDA margin" },
  metricNetMargin: { ar: "هامش صافي الربح", en: "Net margin" },
  metricCurrentRatio: { ar: "نسبة التداول", en: "Current ratio" },
  metricQuickRatio: { ar: "نسبة السيولة السريعة", en: "Quick ratio" },
  metricRoe: { ar: "العائد على حقوق الملكية", en: "Return on equity" },
  metricPayout: { ar: "نسبة توزيع الأرباح", en: "Dividend payout" },
  vsLabel: { ar: "مقابل", en: "vs." },
  marginsEvolutionTitle: { ar: "تطور الهوامش خلال فترة التوقع", en: "Margin Evolution Over the Forecast Period" },

  // Financial Statements
  statementsTitle: { ar: "القوائم المالية", en: "Financial Statements" },
  statementsDesc: {
    ar: "مبنية مباشرة من ملف الإكسل — أي تحديث في الملف ينعكس هنا تلقائيًا",
    en: "Built directly from the Excel workbook — any change to the file is reflected here automatically",
  },
  tabIncome: { ar: "قائمة الدخل", en: "Income Statement" },
  tabBalance: { ar: "المركز المالي", en: "Balance Sheet" },
  tabCashflow: { ar: "التدفقات النقدية", en: "Cash Flow" },
  tabScenario: { ar: "حسب السيناريو المختار", en: "Selected Scenario" },
  lineRevenue: { ar: "الإيرادات", en: "Revenue" },
  lineGrossProfit: { ar: "مجمل الربح", en: "Gross profit" },
  lineOperatingIncome: { ar: "الربح التشغيلي", en: "Operating income" },
  lineEbitda: { ar: "EBITDA", en: "EBITDA" },
  lineNetIncome: { ar: "صافي ربح السنة", en: "Net income" },
  lineCash: { ar: "النقدية وما في حكمها", en: "Cash & equivalents" },
  lineTotalAssets: { ar: "إجمالي الموجودات", en: "Total assets" },
  lineTotalLiabilities: { ar: "إجمالي المطلوبات", en: "Total liabilities" },
  lineTotalEquity: { ar: "إجمالي حقوق الملكية", en: "Total equity" },
  lineCapex: { ar: "المصروفات الرأسمالية (Capex)", en: "Capital expenditure (Capex)" },
  lineEndingCash: { ar: "رصيد النقدية آخر المدة", en: "Ending cash balance" },
  lineCurrentRatioScenario: { ar: "نسبة التداول", en: "Current ratio" },
  lineRevenueScenario: { ar: "الإيرادات (سيناريو حالي)", en: "Revenue (selected scenario)" },
  lineDividends: { ar: "التوزيعات", en: "Dividends" },
  colMetric: { ar: "البند", en: "Line item" },

  // Scenario Planning
  scenarioTitle: { ar: "اختيار السيناريو", en: "Scenario Selection" },
  scenarioDesc: {
    ar: "السيناريو الأساسي مبني على افتراضات ملف الإكسل تمامًا؛ حرّك المؤشرات لاختبار حساسية النموذج",
    en: "The base case matches the Excel workbook's assumptions exactly; move the sliders to stress-test the model",
  },
  resetOverrides: { ar: "إعادة تعيين", en: "Reset" },
  sliderSameStore: { ar: "نمو مبيعات الفروع القائمة", en: "Same-store sales growth" },
  sliderCogsShock: { ar: "صدمة تكلفة البضاعة المباعة", en: "COGS shock" },
  sliderWacc: { ar: "علاوة مخاطر WACC", en: "WACC risk premium" },
  kpiRevenue2030Short: { ar: "الإيرادات 2030", en: "2030 Revenue" },
  kpiNetIncome2030: { ar: "صافي الربح 2030", en: "2030 Net Income" },
  kpiCash2030Short: { ar: "النقدية آخر المدة 2030", en: "2030 Ending Cash" },
  kpiCurrentRatio2030: { ar: "نسبة التداول 2030", en: "2030 Current Ratio" },
  scenarioVsBaseTitle: { ar: "الإيرادات المتوقعة حسب السيناريو مقابل الأساسي", en: "Projected Revenue: Selected Scenario vs. Base Case" },
  legendCurrentScenario: { ar: "السيناريو الحالي", en: "Selected scenario" },
  legendBaseReference: { ar: "الأساسي (مرجعي)", en: "Base case (reference)" },
  dcfTitle: { ar: "تقييم DCF", en: "DCF Valuation" },
  dcfDesc: {
    ar: "القيمة المؤسسية بناءً على التدفقات النقدية الحرة للسيناريو الحالي",
    en: "Enterprise value based on the selected scenario's free cash flows",
  },
  dcfEv: { ar: "القيمة المؤسسية (EV)", en: "Enterprise Value (EV)" },
  dcfWacc: { ar: "معدل الخصم WACC", en: "Discount rate (WACC)" },
  dcfFcf2030: { ar: "التدفق النقدي الحر 2030", en: "2030 Free Cash Flow" },
  scenarioBase: { ar: "الأساسي", en: "Base" },
  scenarioOptimistic: { ar: "المتفائل", en: "Optimistic" },
  scenarioPessimistic: { ar: "المتحفظ", en: "Pessimistic" },

  // Benchmarking
  benchmarkTitle: { ar: "معايير الصناعة — المقارنة التنافسية", en: "Industry Benchmarks — Competitive Comparison" },
  benchmarkDesc: {
    ar: "برجريزر أولاً حسب الترتيب المطلوب، وعمود أصل البرجر مظلل للمقارنة المباشرة",
    en: "Burgerizzr listed first as specified; the Asl Burger column is highlighted for direct comparison",
  },
  benchmarkSource: { ar: "مصدر: Argaam · Investing.com · تقارير الشركات", en: "Source: Argaam · Investing.com · Company reports" },
  colIndicator: { ar: "المؤشر", en: "Indicator" },
  benchCompanyBurgerizzr: { ar: "برجريزر", en: "Burgerizzr" },
  benchCompanyHerfy: { ar: "هرفي", en: "Herfy" },
  benchCompanyAmericana: { ar: "أمريكانا", en: "Americana" },
  benchCompanyIndustry: { ar: "متوسط الصناعة", en: "Industry average" },
  benchCompanyAslBurger: { ar: "أصل البرجر", en: "Asl Burger" },

  // Errors / states
  loadingApp: { ar: "جارٍ تحميل المنصة...", en: "Loading platform..." },
  errorTitle: { ar: "حدث خطأ غير متوقع", en: "Something went wrong" },
  errorDesc: {
    ar: "واجهت المنصة خطأ أثناء العرض. يمكنك إعادة المحاولة أو الرجوع للعينة الافتراضية.",
    en: "The platform hit an error while rendering. You can retry or reset to the default sample.",
  },
  errorRetry: { ar: "إعادة المحاولة", en: "Try again" },
  notFoundTitle: { ar: "الصفحة غير موجودة", en: "Page not found" },
  notFoundDesc: { ar: "الصفحة التي تبحث عنها غير متاحة.", en: "The page you're looking for isn't available." },
  backHome: { ar: "العودة للرئيسية", en: "Back to home" },

  // Navigation — new modules
  navBoard: { ar: "تقرير مجلس الإدارة", en: "Board Report" },
  navInvestor: { ar: "عرض المستثمرين", en: "Investor View" },

  // Executive Home — premium sections
  ceoSummaryTitle: { ar: "ملخص الرئيس التنفيذي (CEO)", en: "CEO Summary" },
  cfoSummaryTitle: { ar: "ملخص المدير المالي (CFO)", en: "CFO Summary" },
  aiExecSummaryTitle: { ar: "الملخص التنفيذي الذكي", en: "AI Executive Summary" },
  aiExecSummaryBadge: { ar: "مُولَّد آليًا من الموديل المالي", en: "Generated from the live financial model" },
  todayInsightsTitle: { ar: "أبرز الرؤى اليوم", en: "Today's Key Insights" },
  topRisksTitle: { ar: "أهم المخاطر", en: "Top Risks" },
  topOpportunitiesTitle: { ar: "أهم الفرص", en: "Top Opportunities" },
  healthScoreTitle: { ar: "مؤشر الصحة المالية", en: "Financial Health Score" },
  healthScoreOutOf: { ar: "من 100", en: "out of 100" },
  noRisksFound: { ar: "لا توجد مخاطر جوهرية حاليًا.", en: "No material risks detected right now." },
  noOpportunitiesFound: { ar: "لا توجد فرص إضافية بارزة حاليًا.", en: "No standout opportunities right now." },

  // Smart Alerts
  smartAlertsTitle: { ar: "التنبيهات الذكية", en: "Smart Alerts" },
  smartAlertsNone: { ar: "لا توجد تنبيهات — جميع المؤشرات ضمن النطاق الطبيعي.", en: "No alerts — everything is within normal range." },
  severityCritical: { ar: "حرج", en: "Critical" },
  severityWarning: { ar: "تحذير", en: "Warning" },
  severityInfo: { ar: "معلومة", en: "Info" },
  severityGood: { ar: "إيجابي", en: "Good" },

  // KPI intelligence
  kpiIntelTitle: { ar: "ذكاء مؤشرات الأداء", en: "KPI Intelligence" },
  kpiTrend: { ar: "الاتجاه", en: "Trend" },
  kpiTarget: { ar: "الهدف", en: "Target" },
  kpiVariance: { ar: "الفارق", en: "Variance" },
  kpiStatus: { ar: "الحالة", en: "Status" },
  statusGood: { ar: "جيد", en: "Good" },
  statusWarning: { ar: "تحذير", en: "Warning" },
  statusCritical: { ar: "حرج", en: "Critical" },
  clickToDrilldown: { ar: "اضغط لعرض التفاصيل في القوائم المالية", en: "Click to drill into the financial statements" },

  kpiNameGrossMargin: { ar: "هامش الربح الإجمالي", en: "Gross Margin" },
  kpiNameEbitdaMargin: { ar: "هامش EBITDA", en: "EBITDA Margin" },
  kpiNameNetMargin: { ar: "هامش صافي الربح", en: "Net Margin" },
  kpiNameCurrentRatio: { ar: "نسبة التداول", en: "Current Ratio" },
  kpiNameRevenueCagr: { ar: "نمو الإيرادات المركب", en: "Revenue CAGR" },
  kpiNameDcfEv: { ar: "القيمة المؤسسية (DCF)", en: "Enterprise Value (DCF)" },

  // Board Dashboard
  boardTitle: { ar: "تقرير مجلس الإدارة", en: "Board Dashboard" },
  boardDesc: { ar: "ملخص جاهز للطباعة لاجتماع مجلس الإدارة", en: "Print-ready summary for the board meeting" },
  boardPreparedFor: { ar: "أُعد لاجتماع مجلس الإدارة", en: "Prepared for the Board of Directors" },
  boardGeneratedOn: { ar: "تاريخ الإعداد", en: "Generated on" },
  boardKeyMetrics: { ar: "أبرز المؤشرات المالية", en: "Key Financial Metrics" },
  boardFooterNote: {
    ar: "هذا التقرير مبني على الموديل المالي المدقق ويُحدَّث تلقائيًا عند تغيير البيانات أو السيناريو.",
    en: "This report is built on the audited financial model and updates automatically with any data or scenario change.",
  },

  // Investor Dashboard
  investorTitle: { ar: "عرض المستثمرين", en: "Investor Dashboard" },
  investorDesc: { ar: "نظرة مبسطة على قصة النمو والتقييم", en: "A simplified view of the growth story and valuation" },
  investorGrowthStory: { ar: "قصة النمو", en: "Growth Story" },
  investorRevenueChartTitle: { ar: "الإيرادات — فعلي ومتوقع", en: "Revenue — Actual & Forecast" },
  investorValuationSummary: { ar: "ملخص التقييم", en: "Valuation Summary" },
  investorDisclaimer: {
    ar: "لأغراض العرض فقط — مبني على نموذج داخلي وليس نصيحة استثمارية.",
    en: "For presentation purposes only — based on an internal model, not investment advice.",
  },

  // Export
  exportPdf: { ar: "تصدير PDF", en: "Export PDF" },
} as const;

export type DictKey = keyof typeof dict;

export function translate(locale: "ar" | "en", key: DictKey): string {
  return dict[key][locale];
}

/** Client-side hook: returns a `t()` function bound to the current locale, plus the locale/dir. */
export function useT() {
  const locale = useLocaleStore((s) => s.locale);
  const t = (key: DictKey) => translate(locale, key);
  return { t, locale, dir: locale === "ar" ? "rtl" : "ltr" } as const;
}
