import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Shield,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Filter,
  Download,
  RefreshCw,
  ChevronRight,
  User,
  Users,
  Building2,
  Briefcase,
  Target,
  Eye,
  Settings,
  LayoutDashboard,
  FileText,
  Activity,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { useTenant } from "@/contexts/tenant-context";
import type { Framework, Control, Policy, Risk } from "@shared/schema";

const getBarColor = (score: number) => {
  if (score >= 90) return "hsl(142, 71%, 45%)";
  if (score >= 70) return "hsl(217, 91%, 60%)";
  if (score >= 50) return "hsl(38, 92%, 50%)";
  return "hsl(0, 84%, 60%)";
};

const roleViews = {
  super_admin: {
    label: "Executive View",
    icon: Building2,
    description: "Organization-wide compliance overview",
    metrics: ["Overall Compliance", "Framework Coverage", "Control Maturity", "Risk Exposure"],
  },
  tenant_admin: {
    label: "Manager View",
    icon: Users,
    description: "Department compliance metrics",
    metrics: ["Team Compliance", "Assigned Controls", "Pending Reviews", "Action Items"],
  },
  auditor: {
    label: "Auditor View",
    icon: Eye,
    description: "Audit-focused compliance assessment",
    metrics: ["Audit Readiness", "Evidence Status", "Findings", "Remediation Progress"],
  },
  end_user: {
    label: "My Compliance",
    icon: User,
    description: "Personal compliance tasks and training",
    metrics: ["My Tasks", "Training Status", "Policies Read", "Certifications"],
  },
};

interface DashboardMetrics {
  frameworks: Framework[];
  controls: Control[];
  policies: Policy[];
  risks: Risk[];
  isLoading: boolean;
}

function PersonalizedDashboardCard({ 
  role, 
  currentRole, 
  metrics 
}: { 
  role: string; 
  currentRole: string;
  metrics: DashboardMetrics;
}) {
  const roleConfig = roleViews[role as keyof typeof roleViews] || roleViews.end_user;
  const isActive = role === currentRole;
  const Icon = roleConfig.icon;
  
  const roleMetrics = useMemo(() => {
    const { frameworks, controls, policies, risks, isLoading } = metrics;
    
    if (isLoading) {
      return [
        { label: "Loading...", value: "-", trend: "", positive: true },
        { label: "Loading...", value: "-", trend: "", positive: true },
        { label: "Loading...", value: "-", trend: "", positive: true },
        { label: "Loading...", value: "-", trend: "", positive: true },
      ];
    }
    
    const implementedControls = controls.filter(c => c.implementationStatus === "implemented").length;
    const controlCoverage = controls.length > 0 ? Math.round((implementedControls / controls.length) * 100) : 0;
    const openRisks = risks.filter(r => r.status === "open" || r.status === "identified").length;
    const approvedPolicies = policies.filter(p => p.status === "approved").length;
    const pendingPolicies = policies.filter(p => p.status === "pending").length;
    
    if (role === "super_admin") {
      return [
        { label: "Overall Compliance", value: `${controlCoverage}%`, trend: "", positive: controlCoverage >= 70 },
        { label: "Active Frameworks", value: String(frameworks.length), trend: "", positive: true },
        { label: "Control Coverage", value: `${controlCoverage}%`, trend: "", positive: controlCoverage >= 80 },
        { label: "Open Risks", value: String(openRisks), trend: "", positive: openRisks < 10 },
      ];
    }
    if (role === "tenant_admin") {
      return [
        { label: "Team Compliance", value: `${controlCoverage}%`, trend: "", positive: controlCoverage >= 70 },
        { label: "Assigned Controls", value: String(controls.length), trend: "", positive: true },
        { label: "Pending Reviews", value: String(pendingPolicies), trend: "", positive: pendingPolicies < 5 },
        { label: "Open Risks", value: String(openRisks), trend: "", positive: openRisks < 10 },
      ];
    }
    if (role === "auditor") {
      const readinessScore = Math.round(((approvedPolicies + implementedControls) / Math.max(policies.length + controls.length, 1)) * 100);
      return [
        { label: "Audit Readiness", value: `${readinessScore}%`, trend: "", positive: readinessScore >= 70 },
        { label: "Evidence Count", value: String(implementedControls), trend: "", positive: true },
        { label: "Open Findings", value: String(openRisks), trend: "", positive: openRisks < 10 },
        { label: "Policy Coverage", value: `${policies.length > 0 ? Math.round((approvedPolicies / policies.length) * 100) : 0}%`, trend: "", positive: true },
      ];
    }
    return [
      { label: "My Tasks", value: String(pendingPolicies), trend: "", positive: pendingPolicies < 5 },
      { label: "Policies Approved", value: `${approvedPolicies}/${policies.length}`, trend: "", positive: true },
      { label: "Controls Assigned", value: String(controls.length), trend: "", positive: true },
      { label: "Open Items", value: String(openRisks + pendingPolicies), trend: "", positive: (openRisks + pendingPolicies) < 10 },
    ];
  }, [role, metrics]);
  
  return (
    <Card className={`card-3d ${isActive ? "ring-2 ring-primary/50" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isActive ? "bg-primary/20" : "bg-muted"}`}>
              <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {roleConfig.label}
                {isActive && (
                  <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30">
                    Active
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs">{roleConfig.description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {roleMetrics.map((metric, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <div className="flex items-baseline gap-1">
                <p className="text-lg font-bold">{metric.value}</p>
                {metric.trend && (
                  <span className={`text-xs ${metric.positive ? "text-chart-2" : "text-destructive"}`}>
                    {metric.trend}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MyComplianceTasks({ policies, controls, isLoading }: { policies: Policy[]; controls: Control[]; isLoading: boolean }) {
  const tasks = useMemo(() => {
    if (isLoading) return [];
    
    const allTasks: Array<{ id: string; title: string; type: string; dueDate: string; priority: string; status: string }> = [];
    
    policies.filter(p => p.status === "pending" || p.status === "draft").forEach(policy => {
      allTasks.push({
        id: `policy-${policy.id}`,
        title: `Review: ${policy.title}`,
        type: "policy",
        dueDate: policy.reviewDate ? new Date(policy.reviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Not set",
        priority: policy.status === "draft" ? "low" : "medium",
        status: policy.status,
      });
    });
    
    controls.filter(c => c.implementationStatus === "in_progress" || c.implementationStatus === "planned").forEach(control => {
      allTasks.push({
        id: `control-${control.id}`,
        title: `Implement: ${control.name}`,
        type: "evidence",
        dueDate: "Not set",
        priority: control.implementationStatus === "in_progress" ? "high" : "medium",
        status: control.implementationStatus || "planned",
      });
    });
    
    return allTasks.slice(0, 6);
  }, [policies, controls, isLoading]);
  
  return (
    <Card className="card-3d">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">My Compliance Tasks</CardTitle>
          </div>
          <Badge variant="outline">{tasks.filter(t => t.progress < 100).length} pending</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-sm font-medium">{task.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs capitalize">{task.type}</Badge>
                  <span className="text-xs text-muted-foreground">Due: {task.dueDate}</span>
                </div>
              </div>
              <Badge className={`text-xs ${
                task.priority === "high" ? "bg-destructive/20 text-destructive border-0" :
                task.priority === "medium" ? "bg-chart-3/20 text-chart-3 border-0" :
                "bg-chart-2/20 text-chart-2 border-0"
              }`}>
                {task.priority}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-xs capitalize ${
                task.status === "pending" || task.status === "in_progress" ? "bg-chart-3/10 border-chart-3/30" :
                task.status === "draft" || task.status === "planned" ? "bg-muted border-muted-foreground/30" :
                "bg-chart-2/10 border-chart-2/30"
              }`}>
                {task.status.replace("_", " ")}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function ComplianceStatusPage() {
  const { user } = useAuth();
  const { currentTenantId } = useTenant();
  const [activeTab, setActiveTab] = useState("my-dashboard");
  const [selectedView, setSelectedView] = useState<string>(user?.role || "end_user");
  
  const currentUserRole = user?.role || "end_user";

  const { data: frameworks = [], isLoading: frameworksLoading } = useQuery<Framework[]>({
    queryKey: ["/api/frameworks"],
  });

  const { data: controls = [], isLoading: controlsLoading } = useQuery<Control[]>({
    queryKey: ["/api/controls"],
  });

  const { data: policies = [], isLoading: policiesLoading } = useQuery<Policy[]>({
    queryKey: ["/api/policies", currentTenantId],
  });

  const { data: risks = [], isLoading: risksLoading } = useQuery<Risk[]>({
    queryKey: ["/api/risks", currentTenantId],
  });

  const isLoading = frameworksLoading || controlsLoading || policiesLoading || risksLoading;

  const complianceData = useMemo(() => {
    if (isLoading || frameworks.length === 0) return [];
    
    return frameworks.slice(0, 5).map(fw => {
      const fwControls = controls.filter(c => c.frameworkId === fw.id);
      const implementedCount = fwControls.filter(c => c.implementationStatus === "implemented").length;
      const score = fwControls.length > 0 ? Math.round((implementedCount / fwControls.length) * 100) : 0;
      return {
        framework: fw.name,
        score,
        controls: fwControls.length,
        implemented: implementedCount,
      };
    });
  }, [frameworks, controls, isLoading]);

  const controlsByCategory = useMemo(() => {
    if (isLoading) return [];
    
    const categoryMap = new Map<string, { total: number; implemented: number; inProgress: number; notStarted: number }>();
    
    controls.forEach(control => {
      const category = control.category || "Uncategorized";
      const existing = categoryMap.get(category) || { total: 0, implemented: 0, inProgress: 0, notStarted: 0 };
      existing.total++;
      if (control.implementationStatus === "implemented") existing.implemented++;
      else if (control.implementationStatus === "in_progress") existing.inProgress++;
      else existing.notStarted++;
      categoryMap.set(category, existing);
    });
    
    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      ...data,
    })).slice(0, 6);
  }, [controls, isLoading]);

  const dashboardMetrics: DashboardMetrics = {
    frameworks,
    controls,
    policies,
    risks,
    isLoading,
  };

  const overallScore = complianceData.length > 0
    ? Math.round(complianceData.reduce((acc, item) => acc + item.score, 0) / complianceData.length)
    : 0;

  const totalControls = controlsByCategory.reduce((acc, cat) => acc + cat.total, 0);
  const implementedControls = controlsByCategory.reduce((acc, cat) => acc + cat.implemented, 0);
  const inProgressControls = controlsByCategory.reduce((acc, cat) => acc + cat.inProgress, 0);

  return (
    <div className="flex-1 overflow-auto">
      <div className="mesh-gradient min-h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Compliance Status</h1>
              <p className="text-muted-foreground mt-1">
                Monitor compliance across all active frameworks
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" data-testid="button-refresh">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" data-testid="button-export">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="stat-gradient-blue col-span-1 md:col-span-2 lg:col-span-1">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Overall Compliance</p>
                    <p className="text-3xl font-bold">{isLoading ? "-" : overallScore}%</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-chart-2" />
                      <span className="text-xs text-chart-2">{controls.length} controls tracked</span>
                    </div>
                  </div>
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="hsl(var(--muted))"
                        strokeWidth="6"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="hsl(217, 91%, 60%)"
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={`${(overallScore / 100) * 176} 176`}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-green">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-chart-2/20">
                    <CheckCircle2 className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{implementedControls}</p>
                    <p className="text-sm text-muted-foreground">Implemented</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-amber">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-chart-3/20">
                    <Clock className="h-5 w-5 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{inProgressControls}</p>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-purple">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-chart-4/20">
                    <Shield className="h-5 w-5 text-chart-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalControls}</p>
                    <p className="text-sm text-muted-foreground">Total Controls</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="my-dashboard" data-testid="tab-my-dashboard">
                <LayoutDashboard className="h-4 w-4 mr-1" />
                My Dashboard
              </TabsTrigger>
              <TabsTrigger value="overview" data-testid="tab-overview">
                Overview
              </TabsTrigger>
              <TabsTrigger value="frameworks" data-testid="tab-frameworks">
                By Framework
              </TabsTrigger>
              <TabsTrigger value="controls" data-testid="tab-controls">
                By Control Category
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-dashboard" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {user?.firstName?.slice(0, 1).toUpperCase() || ""}{user?.lastName?.slice(0, 1).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-semibold">Welcome, {user?.firstName || "User"}</h2>
                      <p className="text-sm text-muted-foreground">Your personalized compliance dashboard</p>
                    </div>
                  </div>
                  <Select value={selectedView} onValueChange={setSelectedView}>
                    <SelectTrigger className="w-48" data-testid="select-dashboard-view">
                      <SelectValue placeholder="Select view" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleViews).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className="h-4 w-4" />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.keys(roleViews).map(role => (
                    <PersonalizedDashboardCard 
                      key={role} 
                      role={role} 
                      currentRole={selectedView}
                      metrics={dashboardMetrics}
                    />
                  ))}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <MyComplianceTasks policies={policies} controls={controls} isLoading={isLoading} />
                  
                  <Card className="card-3d">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-chart-1" />
                        <CardTitle className="text-base">Recent Activity</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {isLoading ? (
                        <div className="space-y-2">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                          ))}
                        </div>
                      ) : (
                        [...policies.slice(0, 2).map(p => ({
                          action: p.status === "approved" ? "Policy approved" : p.status === "pending" ? "Policy pending review" : "Policy drafted",
                          item: p.title,
                          time: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "Recently",
                          icon: p.status === "approved" ? CheckCircle2 : FileText,
                          color: p.status === "approved" ? "text-chart-2" : "text-chart-1",
                        })),
                        ...controls.filter(c => c.implementationStatus === "implemented").slice(0, 2).map(c => ({
                          action: "Control implemented",
                          item: c.name,
                          time: "Recently",
                          icon: Shield,
                          color: "text-primary",
                        }))].slice(0, 4).map((activity, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                            <div className={`p-2 rounded-lg bg-muted ${activity.color}`}>
                              <activity.icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{activity.action}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{activity.item}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{activity.time}</span>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="card-3d">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">
                      Framework Compliance Scores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={complianceData}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={true}
                            vertical={false}
                            className="stroke-border/50"
                          />
                          <XAxis
                            type="number"
                            domain={[0, 100]}
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                          />
                          <YAxis
                            type="category"
                            dataKey="framework"
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                            width={75}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                            {complianceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-3d">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">
                      Control Implementation by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {controlsByCategory.map((category) => {
                      const percentage = Math.round(
                        (category.implemented / category.total) * 100
                      );
                      return (
                        <div key={category.category} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{category.category}</span>
                            <span className="text-muted-foreground">
                              {category.implemented}/{category.total}
                            </span>
                          </div>
                          <div className="flex gap-1 h-2">
                            <div
                              className="bg-chart-2 rounded-l"
                              style={{
                                width: `${(category.implemented / category.total) * 100}%`,
                              }}
                            />
                            <div
                              className="bg-chart-3"
                              style={{
                                width: `${(category.inProgress / category.total) * 100}%`,
                              }}
                            />
                            <div
                              className="bg-muted rounded-r"
                              style={{
                                width: `${(category.notStarted / category.total) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex items-center justify-center gap-6 pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-chart-2" />
                        <span className="text-xs text-muted-foreground">Implemented</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-chart-3" />
                        <span className="text-xs text-muted-foreground">In Progress</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-muted" />
                        <span className="text-xs text-muted-foreground">Not Started</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="frameworks" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {complianceData.map((framework) => (
                  <Card
                    key={framework.framework}
                    className="card-3d cursor-pointer hover-elevate"
                    data-testid={`card-compliance-${framework.framework.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{framework.framework}</h3>
                        <Badge
                          className={`${
                            framework.score >= 80
                              ? "bg-chart-2/20 text-chart-2"
                              : framework.score >= 60
                              ? "bg-chart-3/20 text-chart-3"
                              : "bg-destructive/20 text-destructive"
                          } border-0`}
                        >
                          {framework.score}%
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <Progress value={framework.score} className="h-2" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {framework.implemented} / {framework.controls} controls
                          </span>
                          <span className="text-muted-foreground">
                            Target: {framework.target}%
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full mt-4 justify-between"
                        size="sm"
                      >
                        View Details
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="controls" className="mt-6">
              <Card className="card-3d">
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {controlsByCategory.map((category) => (
                      <div
                        key={category.category}
                        className="p-4 hover-elevate cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-muted">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{category.category}</p>
                            <p className="text-sm text-muted-foreground">
                              {category.total} controls
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-chart-2" />
                              <span className="text-sm">{category.implemented}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-chart-3" />
                              <span className="text-sm">{category.inProgress}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{category.notStarted}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
