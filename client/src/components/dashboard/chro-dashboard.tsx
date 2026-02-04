import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  Award,
  FileCheck,
  UserCheck,
  BarChart3,
  Calendar,
  Target,
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

interface CHRODashboardProps {
  stats: any;
  tenantName?: string;
}

export function CHRODashboard({ stats, tenantName }: CHRODashboardProps) {
  const dashboardRef = useRef<HTMLDivElement>(null);

  const trainingCompletion = 87;
  const policyAcknowledgment = 94;
  const securityAwareness = 82;
  const complianceTraining = 91;

  const trainingTrendData = [
    { month: "Jul", completed: 78, enrolled: 100, target: 85 },
    { month: "Aug", completed: 82, enrolled: 100, target: 85 },
    { month: "Sep", completed: 79, enrolled: 100, target: 85 },
    { month: "Oct", completed: 85, enrolled: 100, target: 85 },
    { month: "Nov", completed: 84, enrolled: 100, target: 85 },
    { month: "Dec", completed: 87, enrolled: 100, target: 85 },
  ];

  const trainingByCategory = [
    { name: "Security", value: 35, color: "#3b82f6" },
    { name: "Privacy", value: 25, color: "#8b5cf6" },
    { name: "Compliance", value: 20, color: "#10b981" },
    { name: "Ethics", value: 12, color: "#f59e0b" },
    { name: "Safety", value: 8, color: "#ec4899" },
  ];

  const departmentCompliance = [
    { name: "Engineering", rate: 92, total: 156 },
    { name: "Sales", rate: 88, total: 89 },
    { name: "Marketing", rate: 85, total: 45 },
    { name: "Finance", rate: 96, total: 32 },
    { name: "HR", rate: 100, total: 18 },
    { name: "Operations", rate: 78, total: 67 },
  ];

  const upcomingTrainings = [
    { id: 1, title: "Annual Security Awareness", dueDate: "Jan 15", mandatory: true, enrolled: 342 },
    { id: 2, title: "GDPR Refresher", dueDate: "Jan 20", mandatory: true, enrolled: 256 },
    { id: 3, title: "Anti-Phishing Campaign", dueDate: "Feb 1", mandatory: false, enrolled: 189 },
    { id: 4, title: "Code of Conduct Review", dueDate: "Feb 15", mandatory: true, enrolled: 412 },
  ];

  const pendingAcknowledgments = [
    { policy: "Information Security Policy", pending: 23, total: 412, deadline: "Dec 31" },
    { policy: "Acceptable Use Policy", pending: 15, total: 412, deadline: "Jan 5" },
    { policy: "Remote Work Policy", pending: 8, total: 412, deadline: "Jan 10" },
  ];

  const certifications = [
    { name: "ISO 27001 Awareness", holders: 245, expiring: 12 },
    { name: "Privacy Fundamentals", holders: 189, expiring: 8 },
    { name: "Incident Response", holders: 45, expiring: 3 },
    { name: "Risk Management", holders: 67, expiring: 5 },
  ];

  return (
    <div ref={dashboardRef} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-3d bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-500/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Training Completion</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                    {trainingCompletion}%
                  </h3>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +5%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Above 85% target</p>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/20">
                <GraduationCap className="h-6 w-6 text-rose-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Policy Acknowledgment</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    {policyAcknowledgment}%
                  </h3>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Good
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">46 pending acknowledgments</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <FileCheck className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Security Awareness</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {securityAwareness}%
                  </h3>
                  <Badge className="bg-amber-500/20 text-amber-400 border-0">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +3%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Phishing test pass rate</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20">
                <UserCheck className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Compliance Training</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                    {complianceTraining}%
                  </h3>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Excellent
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Regulatory training complete</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/20">
                <BookOpen className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 card-3d">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-rose-400" />
              Training Completion Trend
            </CardTitle>
            <Badge variant="outline" className="border-chart-1/50 text-chart-1">
              Last 6 Months
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trainingTrendData}>
                  <defs>
                    <linearGradient id="colorTrainingCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
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
                    dataKey="completed"
                    name="Completed %"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTrainingCompleted)"
                  />
                  <Area
                    type="monotone"
                    dataKey="target"
                    name="Target"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-400" />
              Training by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trainingByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {trainingByCategory.map((entry, index) => (
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
              <Users className="h-5 w-5 text-blue-400" />
              Department Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {departmentCompliance.map((dept) => (
              <div key={dept.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{dept.name}</span>
                  <span className="font-medium">{dept.rate}%</span>
                </div>
                <Progress
                  value={dept.rate}
                  className={cn(
                    "h-2",
                    dept.rate >= 90 && "[&>div]:bg-emerald-500",
                    dept.rate >= 80 && dept.rate < 90 && "[&>div]:bg-amber-500",
                    dept.rate < 80 && "[&>div]:bg-red-500"
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-3d">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-400" />
              Upcoming Training
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingTrainings.map((training) => (
              <div
                key={training.id}
                className="p-2 rounded-lg bg-muted/30 border border-muted"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{training.title}</span>
                      {training.mandatory && (
                        <Badge className="bg-red-500/20 text-red-400 border-0 text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {training.enrolled} enrolled
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {training.dueDate}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-3d">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-emerald-400" />
              Pending Acknowledgments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingAcknowledgments.map((item) => (
              <div
                key={item.policy}
                className={cn(
                  "p-2 rounded-lg border",
                  item.pending > 20 && "bg-amber-500/10 border-amber-500/20",
                  item.pending <= 20 && "bg-muted/30 border-muted"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{item.policy}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.pending} of {item.total} pending
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      item.pending > 20 && "bg-amber-500/20 text-amber-400",
                      item.pending <= 20 && "bg-emerald-500/20 text-emerald-400"
                    )}
                  >
                    Due {item.deadline}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="card-3d">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-400" />
              Certifications Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {certifications.map((cert) => (
              <div
                key={cert.name}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-sm font-medium">{cert.name}</p>
                    <p className="text-xs text-muted-foreground">{cert.holders} certified employees</p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    cert.expiring > 10 && "bg-amber-500/20 text-amber-400",
                    cert.expiring <= 10 && "bg-muted text-muted-foreground"
                  )}
                >
                  {cert.expiring} expiring
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-3d">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              Training KPIs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-2xl font-bold text-emerald-400">98%</div>
                <div className="text-sm text-muted-foreground">On-time Completion</div>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-400">4.6/5</div>
                <div className="text-sm text-muted-foreground">Avg. Training Rating</div>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="text-2xl font-bold text-purple-400">1,245</div>
                <div className="text-sm text-muted-foreground">Courses Completed</div>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="text-2xl font-bold text-amber-400">412</div>
                <div className="text-sm text-muted-foreground">Total Employees</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
