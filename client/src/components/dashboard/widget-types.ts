export type WidgetType =
  | "risk-summary"
  | "compliance-score"
  | "policy-status"
  | "alerts-feed"
  | "risk-heatmap"
  | "vendor-risk"
  | "audit-findings"
  | "controls-status"
  | "framework-compliance"
  | "recent-activity"
  | "quick-stats"
  | "security-posture";

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  width: "sm" | "md" | "lg" | "xl";
  height: "sm" | "md" | "lg";
  order: number;
}

export interface WidgetConfig {
  type: WidgetType;
  name: string;
  description: string;
  defaultWidth: DashboardWidget["width"];
  defaultHeight: DashboardWidget["height"];
  icon: string;
}

export const widgetConfigs: WidgetConfig[] = [
  {
    type: "quick-stats",
    name: "Quick Stats",
    description: "Key metrics overview cards",
    defaultWidth: "xl",
    defaultHeight: "sm",
    icon: "BarChart3",
  },
  {
    type: "risk-summary",
    name: "Risk Summary",
    description: "Overview of risk levels and distribution",
    defaultWidth: "md",
    defaultHeight: "md",
    icon: "AlertTriangle",
  },
  {
    type: "compliance-score",
    name: "Compliance Score",
    description: "Overall compliance posture gauge",
    defaultWidth: "sm",
    defaultHeight: "md",
    icon: "Shield",
  },
  {
    type: "policy-status",
    name: "Policy Status",
    description: "Policy lifecycle breakdown",
    defaultWidth: "md",
    defaultHeight: "md",
    icon: "FileText",
  },
  {
    type: "alerts-feed",
    name: "Alerts Feed",
    description: "Recent critical alerts and notifications",
    defaultWidth: "md",
    defaultHeight: "lg",
    icon: "Bell",
  },
  {
    type: "risk-heatmap",
    name: "Risk Heatmap",
    description: "Interactive 5x5 risk matrix",
    defaultWidth: "md",
    defaultHeight: "lg",
    icon: "Grid3X3",
  },
  {
    type: "vendor-risk",
    name: "Vendor Risk",
    description: "Third-party risk overview",
    defaultWidth: "sm",
    defaultHeight: "md",
    icon: "Building2",
  },
  {
    type: "audit-findings",
    name: "Audit Findings",
    description: "Open audit issues and remediation",
    defaultWidth: "md",
    defaultHeight: "md",
    icon: "ClipboardCheck",
  },
  {
    type: "controls-status",
    name: "Controls Status",
    description: "Control implementation progress",
    defaultWidth: "md",
    defaultHeight: "md",
    icon: "CheckSquare",
  },
  {
    type: "framework-compliance",
    name: "Framework Compliance",
    description: "Compliance by framework breakdown",
    defaultWidth: "lg",
    defaultHeight: "md",
    icon: "Layers",
  },
  {
    type: "recent-activity",
    name: "Recent Activity",
    description: "Latest actions and changes",
    defaultWidth: "md",
    defaultHeight: "lg",
    icon: "Activity",
  },
  {
    type: "security-posture",
    name: "Security Posture",
    description: "Security score and vulnerabilities",
    defaultWidth: "sm",
    defaultHeight: "md",
    icon: "Lock",
  },
];

export const defaultDashboardLayout: DashboardWidget[] = [
  { id: "widget-1", type: "quick-stats", title: "Quick Stats", width: "xl", height: "sm", order: 0 },
  { id: "widget-2", type: "risk-summary", title: "Risk Summary", width: "md", height: "md", order: 1 },
  { id: "widget-3", type: "compliance-score", title: "Compliance Score", width: "sm", height: "md", order: 2 },
  { id: "widget-4", type: "alerts-feed", title: "Recent Alerts", width: "md", height: "md", order: 3 },
  { id: "widget-5", type: "policy-status", title: "Policy Status", width: "md", height: "md", order: 4 },
];
