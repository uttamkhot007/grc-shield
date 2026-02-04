import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Lock,
  Eye,
  FileSearch,
  Database,
  Globe,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Map,
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
} from "recharts";
import { cn } from "@/lib/utils";

interface CDPODashboardProps {
  stats: any;
  tenantName?: string;
}

export function CDPODashboard({ stats, tenantName }: CDPODashboardProps) {
  const dashboardRef = useRef<HTMLDivElement>(null);

  const privacyCompliance = 88;
  const dsarResolutionRate = 95;
  const dataInventoryCoverage = 82;
  const consentRate = 94;

  const dsarTrendData = [
    { month: "Jul", received: 45, completed: 42, pending: 3 },
    { month: "Aug", received: 52, completed: 50, pending: 2 },
    { month: "Sep", received: 48, completed: 45, pending: 3 },
    { month: "Oct", received: 55, completed: 53, pending: 2 },
    { month: "Nov", received: 61, completed: 58, pending: 3 },
    { month: "Dec", received: 58, completed: 55, pending: 3 },
  ];

  const dsarByType = [
    { name: "Access", value: 145, color: "#3b82f6" },
    { name: "Deletion", value: 78, color: "#ef4444" },
    { name: "Portability", value: 45, color: "#10b981" },
    { name: "Rectification", value: 32, color: "#f59e0b" },
    { name: "Objection", value: 18, color: "#8b5cf6" },
  ];

  const frameworkCompliance = [
    { name: "GDPR", score: 92, color: "#3b82f6" },
    { name: "CCPA", score: 88, color: "#10b981" },
    { name: "PDPL (Saudi)", score: 85, color: "#f59e0b" },
    { name: "DPDP (India)", score: 78, color: "#8b5cf6" },
    { name: "UK GDPR", score: 90, color: "#ec4899" },
  ];

  const dataCategories = [
    { category: "Personal Data", count: 245, risk: "medium" },
    { category: "Sensitive Data", count: 78, risk: "high" },
    { category: "Financial Data", count: 156, risk: "high" },
    { category: "Health Data", count: 45, risk: "critical" },
    { category: "Behavioral Data", count: 189, risk: "medium" },
  ];

  const pendingDsars = [
    { id: "DSAR-2024-0458", type: "Access", requestor: "j***@email.com", daysRemaining: 12, status: "in_progress" },
    { id: "DSAR-2024-0459", type: "Deletion", requestor: "m***@company.org", daysRemaining: 8, status: "in_progress" },
    { id: "DSAR-2024-0460", type: "Portability", requestor: "s***@domain.net", daysRemaining: 25, status: "pending" },
  ];

  const recentBreaches = [
    { id: 1, type: "Suspected", description: "Unusual data access pattern detected", date: "Dec 14", status: "investigating" },
    { id: 2, type: "Minor", description: "Email sent to wrong recipient", date: "Dec 10", status: "closed" },
  ];

  return (
    <div ref={dashboardRef} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-3d bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Privacy Compliance</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {privacyCompliance}%
                  </h3>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +3%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Across all frameworks</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Lock className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">DSAR Resolution</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    {dsarResolutionRate}%
                  </h3>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    On Time
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">318 resolved this year</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <FileSearch className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Data Inventory</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {dataInventoryCoverage}%
                  </h3>
                  <Badge className="bg-amber-500/20 text-amber-400 border-0">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">713 data assets mapped</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Database className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Consent Rate</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    {consentRate}%
                  </h3>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Valid consents captured</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/20">
                <ShieldCheck className="h-6 w-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 card-3d">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileSearch className="h-5 w-5 text-purple-400" />
              DSAR Request Trend
            </CardTitle>
            <Badge variant="outline" className="border-chart-1/50 text-chart-1">
              Last 6 Months
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dsarTrendData}>
                  <defs>
                    <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
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
                    dataKey="received"
                    name="Received"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorReceived)"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    name="Completed"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCompleted)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-400" />
              DSAR by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dsarByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dsarByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a2e",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="card-3d">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-400" />
              Framework Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {frameworkCompliance.map((fw) => (
              <div key={fw.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{fw.name}</span>
                  <span className="font-medium">{fw.score}%</span>
                </div>
                <Progress value={fw.score} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-3d">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" />
              Pending DSARs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingDsars.map((dsar) => (
              <div
                key={dsar.id}
                className={cn(
                  "p-2 rounded-lg border",
                  dsar.daysRemaining <= 10 && "bg-amber-500/10 border-amber-500/20",
                  dsar.daysRemaining > 10 && "bg-muted/30 border-muted"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{dsar.id}</span>
                      <Badge variant="secondary" className="text-xs">
                        {dsar.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{dsar.requestor}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      dsar.daysRemaining <= 10 && "bg-amber-500/20 text-amber-400",
                      dsar.daysRemaining > 10 && "bg-emerald-500/20 text-emerald-400"
                    )}
                  >
                    {dsar.daysRemaining}d left
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-3d">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Breach Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentBreaches.map((breach) => (
              <div
                key={breach.id}
                className={cn(
                  "p-2 rounded-lg border",
                  breach.status === "investigating" && "bg-amber-500/10 border-amber-500/20",
                  breach.status === "closed" && "bg-muted/30 border-muted"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          breach.type === "Suspected" && "bg-amber-500/20 text-amber-400",
                          breach.type === "Minor" && "bg-blue-500/20 text-blue-400"
                        )}
                      >
                        {breach.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{breach.date}</span>
                    </div>
                    <p className="text-sm mt-1">{breach.description}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs capitalize",
                      breach.status === "investigating" && "bg-amber-500/20 text-amber-400",
                      breach.status === "closed" && "bg-emerald-500/20 text-emerald-400"
                    )}
                  >
                    {breach.status}
                  </Badge>
                </div>
              </div>
            ))}
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm">No major breaches in 180 days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="card-3d">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-400" />
              Data Categories Inventory
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dataCategories.map((cat) => (
              <div
                key={cat.category}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-2">
                  <Map className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{cat.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{cat.count} assets</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs capitalize",
                      cat.risk === "critical" && "bg-red-500/20 text-red-400",
                      cat.risk === "high" && "bg-orange-500/20 text-orange-400",
                      cat.risk === "medium" && "bg-amber-500/20 text-amber-400",
                      cat.risk === "low" && "bg-emerald-500/20 text-emerald-400"
                    )}
                  >
                    {cat.risk}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-3d">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Privacy Impact Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-2xl font-bold text-emerald-400">12</div>
                <div className="text-sm text-muted-foreground">Completed PIAs</div>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="text-2xl font-bold text-amber-400">3</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-400">2</div>
                <div className="text-sm text-muted-foreground">Pending Review</div>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="text-2xl font-bold text-purple-400">5</div>
                <div className="text-sm text-muted-foreground">Scheduled</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
