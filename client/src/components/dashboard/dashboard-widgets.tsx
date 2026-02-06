import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Shield,
  FileText,
  Bell,
  Building2,
  ClipboardCheck,
  CheckSquare,
  Layers,
  Activity,
  Lock,
  TrendingUp,
  Users,
  BarChart3,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardWidget } from "./widget-types";
import { useTenant } from "@/contexts/tenant-context";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface WidgetProps {
  widget: DashboardWidget;
  onRemove: (id: string) => void;
  isDragging?: boolean;
}

const widgetSizeClasses = {
  width: {
    sm: "col-span-1",
    md: "col-span-2",
    lg: "col-span-3",
    xl: "col-span-4",
  },
  height: {
    sm: "min-h-[120px]",
    md: "min-h-[250px]",
    lg: "min-h-[400px]",
  },
};

function WidgetWrapper({ widget, onRemove, isDragging, children }: WidgetProps & { children: React.ReactNode }) {
  return (
    <Card
      className={`relative group glass-card border-white/10 cursor-grab active:cursor-grabbing ${widgetSizeClasses.width[widget.width]} ${widgetSizeClasses.height[widget.height]} ${isDragging ? "opacity-50 ring-2 ring-primary" : ""}`}
      data-testid={`widget-${widget.id}`}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(widget.id);
          }}
          data-testid={`widget-remove-${widget.id}`}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      {children}
    </Card>
  );
}

interface DashboardStats {
  totalRisks?: number;
  totalPolicies?: number;
  totalControls?: number;
  complianceScore?: number;
}

export function QuickStatsWidget(props: WidgetProps) {
  const { currentTenantId } = useTenant();
  const { data } = useQuery({
    queryKey: ["/api/dashboard/stats", currentTenantId || "all"],
  });
  const stats = data as DashboardStats | undefined;

  const statItems = [
    { label: "Total Risks", value: stats?.totalRisks || 0, icon: AlertTriangle, color: "text-amber-500", trend: "+3" },
    { label: "Policies", value: stats?.totalPolicies || 0, icon: FileText, color: "text-blue-500", trend: "+2" },
    { label: "Controls", value: stats?.totalControls || 0, icon: CheckSquare, color: "text-emerald-500", trend: "+8" },
    { label: "Compliance", value: `${stats?.complianceScore || 0}%`, icon: Shield, color: "text-purple-500", trend: "+5%" },
  ];

  return (
    <WidgetWrapper {...props}>
      <CardContent className="p-4">
        <div className="grid grid-cols-4 gap-4 h-full">
          {statItems.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5">
              <stat.icon className={`h-6 w-6 ${stat.color} mb-2`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              <div className="text-xs text-emerald-500 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                {stat.trend}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </WidgetWrapper>
  );
}

export function RiskSummaryWidget(props: WidgetProps) {
  const { currentTenantId } = useTenant();
  const { data: risks } = useQuery({
    queryKey: ["/api/risks", currentTenantId],
    enabled: !!currentTenantId,
  });

  const riskLevels = [
    { name: "Critical", count: (risks as any[])?.filter((r: any) => r.level === "critical").length || 0, color: "#ef4444" },
    { name: "High", count: (risks as any[])?.filter((r: any) => r.level === "high").length || 0, color: "#f97316" },
    { name: "Medium", count: (risks as any[])?.filter((r: any) => r.level === "medium").length || 0, color: "#eab308" },
    { name: "Low", count: (risks as any[])?.filter((r: any) => r.level === "low").length || 0, color: "#22c55e" },
  ];

  return (
    <WidgetWrapper {...props}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Risk Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskLevels}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                dataKey="count"
                paddingAngle={2}
              >
                {riskLevels.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {riskLevels.map((level) => (
            <div key={level.name} className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: level.color }} />
              <span>{level.name}</span>
              <Badge variant="secondary" className="ml-auto text-xs">{level.count}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </WidgetWrapper>
  );
}

export function ComplianceScoreWidget(props: WidgetProps) {
  const { currentTenantId } = useTenant();
  const { data } = useQuery({
    queryKey: ["/api/dashboard/stats", currentTenantId || "all"],
  });
  const stats = data as DashboardStats | undefined;

  const score = stats?.complianceScore || 78;
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-500";
    if (s >= 60) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <WidgetWrapper {...props}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-500" />
          Compliance Score
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex flex-col items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-white/10"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(score / 100) * 352} 352`}
              className={getScoreColor(score)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}%</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-2">Overall Compliance</div>
        <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
          <TrendingUp className="h-3 w-3" />
          <span>+3% from last month</span>
        </div>
      </CardContent>
    </WidgetWrapper>
  );
}

export function AlertsFeedWidget(props: WidgetProps) {
  const { currentTenantId } = useTenant();
  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts", currentTenantId],
    enabled: !!currentTenantId,
  });

  const recentAlerts = ((alerts as any[]) || []).slice(0, 5);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      default: return "bg-blue-500";
    }
  };

  return (
    <WidgetWrapper {...props}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bell className="h-4 w-4 text-purple-500" />
          Recent Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {recentAlerts.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-4">No recent alerts</div>
          ) : (
            recentAlerts.map((alert: any) => (
              <div key={alert.id} className="flex items-start gap-2 p-2 rounded bg-white/5">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${getSeverityColor(alert.severity)}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{alert.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{alert.message}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </WidgetWrapper>
  );
}

export function PolicyStatusWidget(props: WidgetProps) {
  const { currentTenantId } = useTenant();
  const { data: policies } = useQuery({
    queryKey: ["/api/policies", currentTenantId],
    enabled: !!currentTenantId,
  });

  const statusCounts = {
    approved: (policies as any[])?.filter((p: any) => p.status === "approved").length || 0,
    pending: (policies as any[])?.filter((p: any) => p.status === "pending_approval").length || 0,
    draft: (policies as any[])?.filter((p: any) => p.status === "draft").length || 0,
    expired: (policies as any[])?.filter((p: any) => p.status === "expired").length || 0,
  };

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <WidgetWrapper {...props}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-500" />
          Policy Status
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="capitalize">{status.replace("_", " ")}</span>
              <span>{count}</span>
            </div>
            <Progress value={(count / total) * 100} className="h-2" />
          </div>
        ))}
      </CardContent>
    </WidgetWrapper>
  );
}

export function VendorRiskWidget(props: WidgetProps) {
  const { currentTenantId } = useTenant();
  const { data: vendors } = useQuery({
    queryKey: ["/api/vendors", currentTenantId],
    enabled: !!currentTenantId,
  });

  const riskCounts = {
    critical: (vendors as any[])?.filter((v: any) => v.riskLevel === "critical").length || 0,
    high: (vendors as any[])?.filter((v: any) => v.riskLevel === "high").length || 0,
    medium: (vendors as any[])?.filter((v: any) => v.riskLevel === "medium").length || 0,
    low: (vendors as any[])?.filter((v: any) => v.riskLevel === "low").length || 0,
  };

  return (
    <WidgetWrapper {...props}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Building2 className="h-4 w-4 text-cyan-500" />
          Vendor Risk
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(riskCounts).map(([level, count]) => {
            const colors: Record<string, string> = {
              critical: "bg-red-500/20 text-red-500 border-red-500/50",
              high: "bg-orange-500/20 text-orange-500 border-orange-500/50",
              medium: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
              low: "bg-green-500/20 text-green-500 border-green-500/50",
            };
            return (
              <div key={level} className={`p-3 rounded-lg border ${colors[level]} text-center`}>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs capitalize">{level}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </WidgetWrapper>
  );
}

export function ControlsStatusWidget(props: WidgetProps) {
  const { currentTenantId } = useTenant();
  const { data: controls } = useQuery({
    queryKey: ["/api/controls", currentTenantId],
    enabled: !!currentTenantId,
  });

  const implemented = (controls as any[])?.filter((c: any) => c.status === "implemented").length || 0;
  const total = (controls as any[])?.length || 1;
  const percentage = Math.round((implemented / total) * 100);

  return (
    <WidgetWrapper {...props}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-emerald-500" />
          Controls Status
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-center">
          <div className="text-4xl font-bold text-emerald-500">{implemented}</div>
          <div className="text-sm text-muted-foreground">of {total} implemented</div>
          <Progress value={percentage} className="mt-4 h-3" />
          <div className="mt-2 text-sm text-muted-foreground">{percentage}% complete</div>
        </div>
      </CardContent>
    </WidgetWrapper>
  );
}

export function RecentActivityWidget(props: WidgetProps) {
  const { currentTenantId } = useTenant();
  const { data: logs } = useQuery({
    queryKey: ["/api/activity-logs", currentTenantId],
    enabled: !!currentTenantId,
  });

  const recentLogs = ((logs as any[]) || []).slice(0, 6);

  return (
    <WidgetWrapper {...props}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4 text-pink-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {recentLogs.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-4">No recent activity</div>
          ) : (
            recentLogs.map((log: any, idx: number) => (
              <div key={log.id || idx} className="flex items-center gap-2 text-sm p-2 rounded bg-white/5">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{log.action || "Activity"}</div>
                  <div className="text-xs text-muted-foreground">{log.entityType || "System"}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </WidgetWrapper>
  );
}

export function SecurityPostureWidget(props: WidgetProps) {
  const score = 72;

  return (
    <WidgetWrapper {...props}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Lock className="h-4 w-4 text-cyan-500" />
          Security Posture
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-center">
        <div className="text-4xl font-bold text-cyan-500">{score}</div>
        <div className="text-sm text-muted-foreground">Security Score</div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span>Vulnerabilities</span>
            <Badge variant="destructive">12</Badge>
          </div>
          <div className="flex justify-between text-xs">
            <span>Findings</span>
            <Badge variant="secondary">28</Badge>
          </div>
          <div className="flex justify-between text-xs">
            <span>Remediated</span>
            <Badge className="bg-emerald-500">45</Badge>
          </div>
        </div>
      </CardContent>
    </WidgetWrapper>
  );
}

export function FrameworkComplianceWidget(props: WidgetProps) {
  const frameworks = [
    { name: "ISO 27001", compliance: 85 },
    { name: "SOC 2", compliance: 72 },
    { name: "GDPR", compliance: 91 },
    { name: "HIPAA", compliance: 68 },
    { name: "PCI DSS", compliance: 79 },
  ];

  return (
    <WidgetWrapper {...props}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Layers className="h-4 w-4 text-indigo-500" />
          Framework Compliance
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={frameworks} layout="vertical" margin={{ left: 60 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="compliance" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </WidgetWrapper>
  );
}

export function AuditFindingsWidget(props: WidgetProps) {
  const { currentTenantId } = useTenant();
  const { data: audits } = useQuery({
    queryKey: ["/api/audits", currentTenantId],
    enabled: !!currentTenantId,
  });

  const openCount = (audits as any[])?.filter((a: any) => a.status === "in_progress").length || 0;
  const closedCount = (audits as any[])?.filter((a: any) => a.status === "completed").length || 0;

  return (
    <WidgetWrapper {...props}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-amber-500" />
          Audit Findings
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="text-3xl font-bold text-amber-500">{openCount}</div>
            <div className="text-xs text-muted-foreground">Open</div>
          </div>
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <div className="text-3xl font-bold text-emerald-500">{closedCount}</div>
            <div className="text-xs text-muted-foreground">Closed</div>
          </div>
        </div>
      </CardContent>
    </WidgetWrapper>
  );
}

export function RiskHeatmapWidget(props: WidgetProps) {
  return (
    <WidgetWrapper {...props}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-red-500" />
          Risk Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-5 gap-1">
          {Array.from({ length: 25 }).map((_, idx) => {
            const row = Math.floor(idx / 5);
            const col = idx % 5;
            const intensity = (row + col) / 8;
            const bgColor = intensity > 0.7 ? "bg-red-500" : intensity > 0.5 ? "bg-orange-500" : intensity > 0.3 ? "bg-yellow-500" : "bg-green-500";
            const riskCount = Math.floor(Math.random() * 5);
            return (
              <div
                key={idx}
                className={`aspect-square rounded flex items-center justify-center text-xs font-medium ${bgColor} ${riskCount > 0 ? "opacity-100" : "opacity-30"}`}
              >
                {riskCount > 0 ? riskCount : ""}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Impact →</span>
          <span>Likelihood ↑</span>
        </div>
      </CardContent>
    </WidgetWrapper>
  );
}

export const widgetComponents: Record<string, React.FC<WidgetProps>> = {
  "quick-stats": QuickStatsWidget,
  "risk-summary": RiskSummaryWidget,
  "compliance-score": ComplianceScoreWidget,
  "alerts-feed": AlertsFeedWidget,
  "policy-status": PolicyStatusWidget,
  "vendor-risk": VendorRiskWidget,
  "controls-status": ControlsStatusWidget,
  "recent-activity": RecentActivityWidget,
  "security-posture": SecurityPostureWidget,
  "framework-compliance": FrameworkComplianceWidget,
  "audit-findings": AuditFindingsWidget,
  "risk-heatmap": RiskHeatmapWidget,
};
