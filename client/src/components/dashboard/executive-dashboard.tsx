import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  FileCheck,
  Target,
  Globe,
  Building2,
  DollarSign,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Download,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { cn } from "@/lib/utils";
import { exportWidget } from "@/lib/dashboard-export";

interface ExecutiveDashboardProps {
  stats: any;
  tenantName?: string;
}

export function ExecutiveDashboard({ stats, tenantName }: ExecutiveDashboardProps) {
  const dashboardRef = useRef<HTMLDivElement>(null);

  const overallScore = stats?.complianceScore ?? 85;
  const riskScore = 100 - (stats?.criticalRisks ?? 0) * 10 - (stats?.highRisks ?? 0) * 5;
  const auditScore = 90;
  const privacyScore = 88;

  const trendData = [
    { month: "Jul", compliance: 78, risk: 72, audit: 80 },
    { month: "Aug", compliance: 80, risk: 75, audit: 82 },
    { month: "Sep", compliance: 82, risk: 78, audit: 85 },
    { month: "Oct", compliance: 84, risk: 80, audit: 87 },
    { month: "Nov", compliance: 85, risk: 82, audit: 88 },
    { month: "Dec", compliance: 87, risk: 85, audit: 90 },
  ];

  const regionData = [
    { name: "Middle East", value: 92, color: "#3b82f6" },
    { name: "Europe", value: 88, color: "#10b981" },
    { name: "Americas", value: 85, color: "#f59e0b" },
    { name: "Asia Pacific", value: 90, color: "#8b5cf6" },
  ];

  const frameworkStatus = [
    { name: "ISO 27001", status: "compliant", progress: 95 },
    { name: "SOC 2 Type II", status: "in_progress", progress: 78 },
    { name: "GDPR", status: "compliant", progress: 92 },
    { name: "PCI DSS", status: "in_progress", progress: 65 },
    { name: "HIPAA", status: "review", progress: 88 },
  ];

  const kpiData = [
    { name: "GRC Score", value: overallScore, fill: "#3b82f6" },
    { name: "Risk Score", value: riskScore > 0 ? riskScore : 70, fill: "#10b981" },
    { name: "Audit Score", value: auditScore, fill: "#f59e0b" },
    { name: "Privacy Score", value: privacyScore, fill: "#8b5cf6" },
  ];

  const handleExport = async (format: "pdf" | "jpeg" | "word") => {
    if (dashboardRef.current) {
      await exportWidget(dashboardRef.current, format, {
        title: "Executive Summary Dashboard",
        subtitle: tenantName || "All Organizations",
      });
    }
  };

  return (
    <div ref={dashboardRef} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-3d bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Overall GRC Score</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {overallScore}%
                  </h3>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +4.2%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Excellent standing</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Shield className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Risk Exposure</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    ${(stats?.activeRisks ?? 5) * 125}K
                  </h3>
                  <Badge className="bg-amber-500/20 text-amber-400 border-0">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -12%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Potential impact reduced</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/20">
                <DollarSign className="h-6 w-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Controls Active</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    {stats?.controlsImplemented ?? 156}
                  </h3>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    94%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Of 166 total controls</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <FileCheck className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Board Readiness</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Ready
                  </h3>
                  <Badge className="bg-purple-500/20 text-purple-400 border-0">
                    <Target className="h-3 w-3 mr-1" />
                    Q4
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Next report in 14 days</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Calendar className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 card-3d">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-lg font-semibold">GRC Performance Trend</CardTitle>
            <Badge variant="outline" className="border-chart-1/50 text-chart-1">
              Last 6 Months
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAudit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" domain={[60, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a2e",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="compliance"
                    name="Compliance"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCompliance)"
                  />
                  <Area
                    type="monotone"
                    dataKey="risk"
                    name="Risk Mgmt"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRisk)"
                  />
                  <Area
                    type="monotone"
                    dataKey="audit"
                    name="Audit"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAudit)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">GRC Scorecard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="30%"
                  outerRadius="90%"
                  data={kpiData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    background={{ fill: "#1a1a2e" }}
                    dataKey="value"
                    cornerRadius={10}
                  />
                  <Legend
                    iconSize={10}
                    layout="vertical"
                    verticalAlign="bottom"
                    wrapperStyle={{ paddingTop: "20px" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a2e",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value}%`, "Score"]}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-3d">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-400" />
              Regional Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {regionData.map((region) => (
              <div key={region.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{region.name}</span>
                  <span className="font-medium">{region.value}%</span>
                </div>
                <Progress value={region.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-3d">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-emerald-400" />
              Framework Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {frameworkStatus.map((fw) => (
              <div
                key={fw.name}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
              >
                <span className="text-sm font-medium">{fw.name}</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    fw.status === "compliant" && "bg-emerald-500/20 text-emerald-400",
                    fw.status === "in_progress" && "bg-amber-500/20 text-amber-400",
                    fw.status === "review" && "bg-blue-500/20 text-blue-400"
                  )}
                >
                  {fw.status === "compliant" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                  {fw.status === "in_progress" && <Clock className="h-3 w-3 mr-1" />}
                  {fw.progress}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-3d">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Top Risks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Third-Party Data Breach</span>
                <Badge className="bg-red-500/20 text-red-400 border-0 text-xs">Critical</Badge>
              </div>
              <p className="text-xs text-muted-foreground">3 vendors pending assessment</p>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Regulatory Change Impact</span>
                <Badge className="bg-amber-500/20 text-amber-400 border-0 text-xs">High</Badge>
              </div>
              <p className="text-xs text-muted-foreground">NIS2 deadline approaching</p>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Cloud Security Gap</span>
                <Badge className="bg-amber-500/20 text-amber-400 border-0 text-xs">High</Badge>
              </div>
              <p className="text-xs text-muted-foreground">AWS controls 78% implemented</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start text-sm">
              <ArrowUpRight className="h-4 w-4 mr-2" />
              View Board Report
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-sm">
              <Download className="h-4 w-4 mr-2" />
              Export Compliance Pack
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-sm">
              <Users className="h-4 w-4 mr-2" />
              Schedule Risk Review
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-sm">
              <Calendar className="h-4 w-4 mr-2" />
              Upcoming Audits (3)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
