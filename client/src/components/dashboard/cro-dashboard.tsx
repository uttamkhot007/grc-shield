import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Gauge,
  BarChart3,
  PieChartIcon,
  Activity,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Line,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

interface CRODashboardProps {
  stats: any;
  tenantName?: string;
}

export function CRODashboard({ stats, tenantName }: CRODashboardProps) {
  const dashboardRef = useRef<HTMLDivElement>(null);

  const riskAppetite = 65;
  const currentRiskLevel = 58;
  const mitigationRate = 82;
  const riskReductionValue = 2.4;

  const riskTrendData = [
    { month: "Jul", inherent: 78, residual: 45, target: 40 },
    { month: "Aug", inherent: 75, residual: 43, target: 40 },
    { month: "Sep", inherent: 72, residual: 42, target: 40 },
    { month: "Oct", inherent: 70, residual: 40, target: 40 },
    { month: "Nov", inherent: 68, residual: 38, target: 40 },
    { month: "Dec", inherent: 65, residual: 35, target: 40 },
  ];

  const riskCategoryData = [
    { category: "Strategic", value: 72, fullMark: 100 },
    { category: "Operational", value: 65, fullMark: 100 },
    { category: "Financial", value: 48, fullMark: 100 },
    { category: "Compliance", value: 82, fullMark: 100 },
    { category: "Technology", value: 55, fullMark: 100 },
    { category: "Reputational", value: 40, fullMark: 100 },
  ];

  const riskHeatmapData = [
    { likelihood: 5, impact: 5, count: 2, level: "critical" },
    { likelihood: 4, impact: 5, count: 3, level: "critical" },
    { likelihood: 5, impact: 4, count: 1, level: "critical" },
    { likelihood: 4, impact: 4, count: 5, level: "high" },
    { likelihood: 3, impact: 4, count: 4, level: "high" },
    { likelihood: 4, impact: 3, count: 6, level: "high" },
    { likelihood: 3, impact: 3, count: 8, level: "medium" },
    { likelihood: 2, impact: 3, count: 7, level: "medium" },
    { likelihood: 3, impact: 2, count: 5, level: "medium" },
    { likelihood: 2, impact: 2, count: 12, level: "low" },
    { likelihood: 1, impact: 2, count: 9, level: "low" },
    { likelihood: 2, impact: 1, count: 15, level: "low" },
  ];

  const mitigationActions = [
    { id: 1, title: "Vendor Security Assessment", status: "completed", dueDate: "Dec 15", owner: "Security Team" },
    { id: 2, title: "Business Continuity Test", status: "in_progress", dueDate: "Dec 20", owner: "Operations" },
    { id: 3, title: "Data Encryption Upgrade", status: "in_progress", dueDate: "Jan 5", owner: "IT Security" },
    { id: 4, title: "Third-Party Audit Prep", status: "pending", dueDate: "Jan 15", owner: "Compliance" },
    { id: 5, title: "Incident Response Drill", status: "pending", dueDate: "Jan 20", owner: "SOC Team" },
  ];

  const topRisks = [
    { id: 1, name: "Supply Chain Disruption", score: 20, category: "Operational", trend: "stable" },
    { id: 2, name: "Ransomware Attack", score: 18, category: "Technology", trend: "increasing" },
    { id: 3, name: "Regulatory Non-Compliance", score: 16, category: "Compliance", trend: "decreasing" },
    { id: 4, name: "Key Person Dependency", score: 15, category: "Strategic", trend: "stable" },
    { id: 5, name: "Market Volatility", score: 14, category: "Financial", trend: "increasing" },
  ];

  return (
    <div ref={dashboardRef} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-3d bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Risk Appetite</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    {riskAppetite}
                  </h3>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
                <Progress value={riskAppetite} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-1">Board-approved threshold</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/20">
                <Target className="h-6 w-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Current Risk Level</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    {currentRiskLevel}
                  </h3>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    Within Appetite
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{riskAppetite - currentRiskLevel} points buffer</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <Gauge className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Mitigation Rate</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {mitigationRate}%
                  </h3>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +5%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Actions completed on time</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Activity className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Risk Reduction Value</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    ${riskReductionValue}M
                  </h3>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +$400K
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Estimated exposure reduced</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/20">
                <BarChart3 className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 card-3d">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-400" />
              Risk Level Trend vs Target
            </CardTitle>
            <Badge variant="outline" className="border-chart-1/50 text-chart-1">
              6 Month View
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={riskTrendData}>
                  <defs>
                    <linearGradient id="colorInherent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResidual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" domain={[0, 100]} />
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
                    dataKey="inherent"
                    name="Inherent Risk"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorInherent)"
                  />
                  <Area
                    type="monotone"
                    dataKey="residual"
                    name="Residual Risk"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorResidual)"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="Target"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-blue-400" />
              Risk by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={riskCategoryData}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="category" stroke="#666" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#666" />
                  <Radar
                    name="Risk Score"
                    dataKey="value"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.3}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a2e",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="card-3d">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Top 5 Risks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topRisks.map((risk, index) => (
              <div
                key={risk.id}
                className={cn(
                  "p-2 rounded-lg border flex items-center justify-between gap-2",
                  risk.score >= 18 && "bg-red-500/10 border-red-500/20",
                  risk.score >= 14 && risk.score < 18 && "bg-amber-500/10 border-amber-500/20",
                  risk.score < 14 && "bg-yellow-500/10 border-yellow-500/20"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">#{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium">{risk.name}</p>
                    <p className="text-xs text-muted-foreground">{risk.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      risk.score >= 18 && "bg-red-500/20 text-red-400",
                      risk.score >= 14 && risk.score < 18 && "bg-amber-500/20 text-amber-400",
                      risk.score < 14 && "bg-yellow-500/20 text-yellow-400"
                    )}
                  >
                    {risk.score}
                  </Badge>
                  {risk.trend === "increasing" && <TrendingUp className="h-4 w-4 text-red-400" />}
                  {risk.trend === "decreasing" && <TrendingDown className="h-4 w-4 text-emerald-400" />}
                  {risk.trend === "stable" && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-3d lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              Mitigation Actions Tracker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mitigationActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    {action.status === "completed" && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    )}
                    {action.status === "in_progress" && (
                      <Clock className="h-5 w-5 text-amber-400" />
                    )}
                    {action.status === "pending" && (
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.owner}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{action.dueDate}</span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs capitalize",
                        action.status === "completed" && "bg-emerald-500/20 text-emerald-400",
                        action.status === "in_progress" && "bg-amber-500/20 text-amber-400",
                        action.status === "pending" && "bg-muted text-muted-foreground"
                      )}
                    >
                      {action.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
