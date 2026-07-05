import { themeQuartz } from "ag-grid-community";

/** Dark "Bloomberg meets Apple" AG Grid theme built via the v33+ Theming API
 * (CSS-in-JS) — no ag-grid.css / ag-theme-*.css imports required. */
export const fpaGridTheme = themeQuartz.withParams({
  backgroundColor: "#12151c",
  foregroundColor: "#e4e6ea",
  browserColorScheme: "dark",
  accentColor: "#fbb617",
  borderColor: "rgba(255,255,255,0.08)",
  headerBackgroundColor: "#171b24",
  headerTextColor: "#9aa1ae",
  headerFontWeight: 600,
  oddRowBackgroundColor: "#14171f",
  rowHoverColor: "rgba(79,143,247,0.08)",
  selectedRowBackgroundColor: "rgba(79,143,247,0.16)",
  chromeBackgroundColor: "#12151c",
  fontFamily: "inherit",
  fontSize: 13,
  spacing: 6,
  wrapperBorderRadius: 12,
});
