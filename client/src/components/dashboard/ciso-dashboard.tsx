import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Key,
  Bug,
  Radar,
  Server,
  Cloud,
  AlertTriangle,
  Eye,
  Activity,
  Zap,
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
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { cn } from "@/lib/utils";

interface CISODashboardProps {
  stats: any;
  tenantName?: string;
}

export function CISODashboard({ stats, tenantName }: CISODashboardProps) {
  const dashboardRef = useRef<HTMLDivElement>(null);

  const securityPosture = 87;
  const threatLevel = "Moderate";
  const vulnerabilities = 23;
  const patchCompliance = 94;

  const threatTrendData = [
    { month: "Jul", blocked: 1245, detected: 89, incidents: 3 },
    { month: "Aug", blocked: 1389, detected: 76, incidents: 2 },
    { month: "Sep", blocked: 1567, detected: 92, incidents: 4 },
    { month: "Oct", blocked: 1234, detected: 68, incidents: 1 },
    { month: "Nov", blocked: 1456, detected: 71, incidents: 2 },
    { month: "Dec", blocked: 1678, detected: 65, incidents: 1 },
  ];

  const controlsByDomain = [
    { name: "Access Control", implemented: 45, total: 48, color: "#3b82f6" },
    { name: "Cryptography", implemented: 18, total: 20, color: "#10b981" },
    { name: "Network Security", implemented: 32, total: 35, color: "#f59e0b" },
    { name: "Incident Response", implemented: 22, total: 25, color: "#8b5cf6" },
    { name: "Asset Management", implemented: 28, total: 30, color: "#ec4899" },
  ];

  const vulnerabilityData = [
    { severity: "Critical", count: 2, color: "#ef4444" },
    { severity: "High", count: 8, color: "#f97316" },
    { severity: "Medium", count: 13, color: "#eab308" },
    { severity: "Low", count: 45, color: "#22c55e" },
  ];

  const assetRiskData = [
    { x: 85, y: 92, z: 200, name: "Cloud Infrastructure", risk: "Low" },
    { x: 65, y: 78, z: 300, name: "On-Prem Servers", risk: "Medium" },
    { x: 45, y: 55, z: 150, name: "Third-Party Apps", risk: "High" },
    { x: 90, y: 88, z: 250, name: "Network Devices", risk: "Low" },
    { x: 70, y: 65, z: 180, name: "Endpoints", risk: "Medium" },
  ];

  const recentAlerts = [
    { type: "critical", message: "Unusual login pattern detected", time: "2 min ago" },
    { type: "high", message: "Failed authentication attempts spike", time: "15 min ago" },
    { type: "medium", message: "New vulnerability in Apache Log4j", time: "1 hour ago" },
    { type: "low", message: "Certificate expiring in 30 days", time: "3 hours ago" },
  ];

  return (
    <div ref={dashboardRef} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-3d bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Security Posture</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    {securityPosture}%
                  </h3>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2.1%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Strong defense posture</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Threat Level</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    {threatLevel}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">1,678 threats blocked today</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/20">
                <Radar className="h-6 w-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Open Vulnerabilities</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                    {vulnerabilities}
                  </h3>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -5
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">2 critical, 8 high severity</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/20">
                <Bug className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Patch Compliance</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {patchCompliance}%
                  </h3>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +3%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">All critical patches applied</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Zap className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 card-3d">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              Threat Intelligence Trend
            </CardTitle>
            <Badge variant="outline" className="border-chart-1/50 text-chart-1">
              Real-time
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={threatTrendData}>
                  <defs>
                    <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDetected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
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
                    dataKey="blocked"
                    name="Threats Blocked"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorBlocked)"
                  />
                  <Area
                    type="monotone"
                    dataKey="detected"
                    name="Detected"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorDetected)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Bug className="h-5 w-5 text-red-400" />
              Vulnerability Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vulnerabilityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {vulnerabilityData.map((entry, index) => (
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
              <Shield className="h-5 w-5 text-blue-400" />
              Security Controls by Domain
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {controlsByDomain.map((domain) => (
              <div key={domain.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{domain.name}</span>
                  <span className="font-medium">
                    {domain.implemented}/{domain.total}
                  </span>
                </div>
                <Progress
                  value={(domain.implemented / domain.total) * 100}
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-3d">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
              Security Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentAlerts.map((alert, index) => (
              <div
                key={index}
                className={cn(
                  "p-2 rounded-lg border",
                  alert.type === "critical" && "bg-red-500/10 border-red-500/20",
                  alert.type === "high" && "bg-orange-500/10 border-orange-500/20",
                  alert.type === "medium" && "bg-amber-500/10 border-amber-500/20",
                  alert.type === "low" && "bg-blue-500/10 border-blue-500/20"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs capitalize",
                      alert.type === "critical" && "bg-red-500/20 text-red-400",
                      alert.type === "high" && "bg-orange-500/20 text-orange-400",
                      alert.type === "medium" && "bg-amber-500/20 text-amber-400",
                      alert.type === "low" && "bg-blue-500/20 text-blue-400"
                    )}
                  >
                    {alert.type}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-3d">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Server className="h-5 w-5 text-purple-400" />
              Asset Security Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-emerald-400" />
                <span className="text-sm">Cloud Infrastructure</span>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-xs">Secure</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-amber-400" />
                <span className="text-sm">On-Prem Servers</span>
              </div>
              <Badge className="bg-amber-500/20 text-amber-400 border-0 text-xs">Review</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-emerald-400" />
                <span className="text-sm">Identity Systems</span>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-xs">Secure</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-red-500/10">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-red-400" />
                <span className="text-sm">Third-Party Apps</span>
              </div>
              <Badge className="bg-red-500/20 text-red-400 border-0 text-xs">At Risk</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
