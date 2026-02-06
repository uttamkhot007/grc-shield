import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield, FileText, Layers, Target, Brain, Sparkles, ChevronRight,
  CheckCircle2, AlertTriangle, Clock, TrendingUp, TrendingDown,
  Network, Users, Database, Lock, Globe, Building2, Zap,
  Activity, BarChart3, FileCheck, BookOpen, GitBranch, Settings,
  AlertCircle, ArrowRight, Eye, RefreshCw, Lightbulb, Scale,
  ClipboardCheck, Workflow, UserCheck, PieChart, Calendar, Gauge,
  ArrowUpRight, ArrowDownRight, Download
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, PieChart as RechartsPie, Pie, Cell, AreaChart as RechartsArea, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, Line
} from 'recharts';
import { useTenant } from "@/contexts/tenant-context";
import type { Policy, Framework, Control, Process, Procedure } from "@shared/schema";

export default function GovernanceDashboard() {
  const { currentTenantId } = useTenant();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: policies = [] } = useQuery<Policy[]>({
    queryKey: ["/api/policies", currentTenantId || "all"],
  });

  const { data: frameworks = [] } = useQuery<Framework[]>({
    queryKey: ["/api/frameworks"],
  });

  const { data: controls = [] } = useQuery<Control[]>({
    queryKey: ["/api/controls"],
  });

  const { data: processes = [] } = useQuery<Process[]>({
    queryKey: ["/api/processes", currentTenantId],
  });

  const { data: procedures = [] } = useQuery<Procedure[]>({
    queryKey: ["/api/procedures", currentTenantId],
  });

  const approvedPolicies = policies.filter(p => p.status === "approved").length;
  const draftPolicies = policies.filter(p => p.status === "draft").length;
  const pendingPolicies = policies.filter(p => p.status === "pending").length;
  const aiEnrichedControls = controls.filter(c => c.aiEnriched).length;
  const enrichmentProgress = controls.length > 0 ? (aiEnrichedControls / controls.length) * 100 : 0;

  const governanceHealthScore = 78;
  const policyCompliance = 85;
  const controlEffectiveness = 72;
  const decisionLatency = 2.3;

  const CHART_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  const approvalTrendData = [
    { month: 'Jul', approved: 12, pending: 8, rejected: 2 },
    { month: 'Aug', approved: 18, pending: 5, rejected: 1 },
    { month: 'Sep', approved: 15, pending: 10, rejected: 3 },
    { month: 'Oct', approved: 22, pending: 7, rejected: 2 },
    { month: 'Nov', approved: 28, pending: 12, rejected: 4 },
    { month: 'Dec', approved: 35, pending: 8, rejected: 1 },
  ];

  const complianceByFramework = [
    { name: 'ISO 27001', value: 92, color: '#8b5cf6' },
    { name: 'SOC 2', value: 88, color: '#06b6d4' },
    { name: 'GDPR', value: 95, color: '#10b981' },
    { name: 'HIPAA', value: 78, color: '#f59e0b' },
    { name: 'PCI DSS', value: 85, color: '#ef4444' },
  ];

  const radarData = [
    { subject: 'Policies', A: 92, fullMark: 100 },
    { subject: 'Processes', A: 85, fullMark: 100 },
    { subject: 'Procedures', A: 88, fullMark: 100 },
    { subject: 'Controls', A: 90, fullMark: 100 },
    { subject: 'Frameworks', A: 95, fullMark: 100 },
    { subject: 'Compliance', A: 87, fullMark: 100 },
  ];

  const kpiMetrics = [
    { label: 'Policy Coverage', value: 94, target: 95, unit: '%', trend: 2.3, icon: FileText },
    { label: 'Approval Cycle', value: 4.2, target: 5, unit: 'days', trend: -12, icon: Clock },
    { label: 'Framework Align', value: 92, target: 90, unit: '%', trend: 5.1, icon: Shield },
    { label: 'Audit Ready', value: 88, target: 85, unit: '%', trend: 8.4, icon: CheckCircle2 },
  ];

  const governanceModules = [
    {
      title: "Policy Authority",
      description: "Lifecycle management for policies, processes & procedures",
      icon: FileText,
      color: "from-blue-500 to-blue-600",
      stats: `${policies.length} Policies`,
      link: "/governance/policies",
      badge: `${approvedPolicies} Active`,
    },
    {
      title: "Framework Library",
      description: "Regulatory frameworks with cross-mapping",
      icon: Layers,
      color: "from-purple-500 to-purple-600",
      stats: `${frameworks.length} Frameworks`,
      link: "/governance/frameworks",
      badge: "109 Available",
    },
    {
      title: "Control Catalog",
      description: "Enhanced controls with implementation guidance",
      icon: Shield,
      color: "from-green-500 to-green-600",
      stats: `${controls.length} Controls`,
      link: "/governance/controls",
      badge: `${Math.round(enrichmentProgress)}% Done`,
    },
    {
      title: "Governance Ontology",
      description: "Visual governance graph & relationship mapping",
      icon: Network,
      color: "from-cyan-500 to-cyan-600",
      stats: "Graph View",
      link: "/governance/ontology",
      badge: "NEW",
    },
    {
      title: "Technology Governance",
      description: "Technology inventory, lifecycle & risk classification",
      icon: Brain,
      color: "from-pink-500 to-pink-600",
      stats: "Tech Registry",
      link: "/governance/ai-governance",
      badge: "EU Tech Act",
    },
    {
      title: "Decision Authority",
      description: "Decision registers, RACI & delegation matrix",
      icon: Scale,
      color: "from-amber-500 to-amber-600",
      stats: "Authority Model",
      link: "/governance/decisions",
      badge: "NEW",
    },
    {
      title: "Data Governance",
      description: "Data classification, ownership & retention rules",
      icon: Database,
      color: "from-indigo-500 to-indigo-600",
      stats: "Data Policies",
      link: "/governance/data",
      badge: "NEW",
    },
    {
      title: "Change Impact",
      description: "Auto impact analysis for policy & regulation changes",
      icon: GitBranch,
      color: "from-orange-500 to-orange-600",
      stats: "Impact Engine",
      link: "/governance/change-impact",
      badge: "Smart",
    },
  ];

  const recentActivities = [
    { type: "policy", action: "Policy approved", item: "Data Protection Policy v2.1", time: "2 hours ago", status: "success" },
    { type: "control", action: "Enrichment completed", item: "AC-1 Access Control Policy", time: "4 hours ago", status: "success" },
    { type: "framework", action: "Framework assigned", item: "ISO 27001:2022", time: "1 day ago", status: "info" },
    { type: "decision", action: "Decision pending", item: "Customer Data Usage Review", time: "2 days ago", status: "warning" },
    { type: "alert", action: "Policy drift detected", item: "Password Policy vs AD Config", time: "3 days ago", status: "error" },
  ];

  const aiInsights = [
    { severity: "high", insight: "3 policies require review - due dates passed", action: "Review Policies" },
    { severity: "medium", insight: "15 controls mapped to multiple frameworks need validation", action: "Validate Mappings" },
    { severity: "low", insight: "Enrichment can improve 234 more controls", action: "Start Enrichment" },
    { severity: "info", insight: "New EU Tech Act requirements detected", action: "View Changes" },
  ];

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Governance Command Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Decision intelligence, accountability & guardrails across the enterprise
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-governance-reports">
            <BarChart3 className="w-4 h-4 mr-2" />
            Board Report
          </Button>
          <Button variant="outline" data-testid="button-governance-settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button data-testid="button-policy-wizard" className="bg-gradient-to-r from-purple-500 to-pink-500">
            <Sparkles className="w-4 h-4 mr-2" />
            Smart Policy Wizard
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="glass-card hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-500/20">
                <Activity className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{governanceHealthScore}%</p>
                <p className="text-sm text-muted-foreground">Health Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/20">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{policies.length}</p>
                <p className="text-sm text-muted-foreground">Policies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/20">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{controls.length}</p>
                <p className="text-sm text-muted-foreground">Controls</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/20">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingPolicies}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-500/20">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(enrichmentProgress)}%</p>
                <p className="text-sm text-muted-foreground">Enhanced</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-red-500/20">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Violations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-background/50 border border-border/50">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Activity className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="modules" data-testid="tab-modules">
            <Layers className="w-4 h-4 mr-2" />
            Modules
          </TabsTrigger>
          <TabsTrigger value="insights" data-testid="tab-insights">
            <Sparkles className="w-4 h-4 mr-2" />
            Smart Insights
          </TabsTrigger>
          <TabsTrigger value="metrics" data-testid="tab-metrics">
            <Gauge className="w-4 h-4 mr-2" />
            Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Governance Health
                </CardTitle>
                <CardDescription>Overall enterprise governance posture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" className="fill-none stroke-muted stroke-[8]" />
                      <circle cx="64" cy="64" r="56" className="fill-none stroke-primary stroke-[8]" 
                        strokeDasharray={`${governanceHealthScore * 3.52} 352`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold">{governanceHealthScore}%</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Policy Compliance</span>
                        <span className="font-medium">{policyCompliance}%</span>
                      </div>
                      <Progress value={policyCompliance} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Control Effectiveness</span>
                        <span className="font-medium">{controlEffectiveness}%</span>
                      </div>
                      <Progress value={controlEffectiveness} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Enrichment</span>
                        <span className="font-medium">{Math.round(enrichmentProgress)}%</span>
                      </div>
                      <Progress value={enrichmentProgress} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Decision Latency</span>
                        <span className="font-medium">{decisionLatency} days avg</span>
                      </div>
                      <Progress value={100 - (decisionLatency * 10)} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base">Smart Governance Assistant</CardTitle>
                  <Badge variant="secondary" className="bg-primary/20 border-0">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiInsights.slice(0, 3).map((insight, i) => (
                  <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/50">
                    <div className="flex items-start gap-2">
                      <div className={`p-1.5 rounded ${
                        insight.severity === "high" ? "bg-red-500/20 text-red-400" :
                        insight.severity === "medium" ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400" :
                        insight.severity === "low" ? "bg-blue-500/20 text-blue-400" :
                        "bg-green-500/20 text-green-400"
                      }`}>
                        <Lightbulb className="h-3 w-3" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{insight.insight}</p>
                        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs mt-1">
                          {insight.action} <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[280px]">
                  <div className="space-y-3">
                    {recentActivities.map((activity, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover-elevate">
                        <div className={`p-2 rounded-lg ${
                          activity.status === "success" ? "bg-green-500/20 text-green-400" :
                          activity.status === "warning" ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400" :
                          activity.status === "error" ? "bg-red-500/20 text-red-400" :
                          "bg-blue-500/20 text-blue-400"
                        }`}>
                          {activity.type === "policy" ? <FileText className="w-4 h-4" /> :
                           activity.type === "control" ? <Shield className="w-4 h-4" /> :
                           activity.type === "framework" ? <Layers className="w-4 h-4" /> :
                           activity.type === "decision" ? <Scale className="w-4 h-4" /> :
                           <AlertTriangle className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{activity.action}</p>
                          <p className="text-xs text-muted-foreground truncate">{activity.item}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-muted-foreground" />
                  Governance Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium">Approved</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-400">{approvedPolicies}</p>
                      <p className="text-xs text-muted-foreground">Active policies</p>
                    </div>
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm font-medium">Pending</span>
                      </div>
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingPolicies}</p>
                      <p className="text-xs text-muted-foreground">Awaiting approval</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-500/10 border border-gray-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">Draft</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-400">{draftPolicies}</p>
                      <p className="text-xs text-muted-foreground">In development</p>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Workflow className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium">Processes</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{processes.length}</p>
                      <p className="text-xs text-muted-foreground">Documented</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6" data-testid="content-analytics">
          <div className="grid grid-cols-4 gap-4">
            {kpiMetrics.map((metric, idx) => (
              <Card key={idx} className="glass-card relative overflow-hidden group" data-testid={`card-kpi-${idx}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                      <metric.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${metric.trend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-400'}`}>
                      {metric.trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {Math.abs(metric.trend)}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">{metric.value}</span>
                      <span className="text-sm text-muted-foreground">{metric.unit}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={(metric.value / metric.target) * 100} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground">Target: {metric.target}{metric.unit}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6">
            <Card className="glass-card col-span-2" data-testid="card-approval-trends">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Approval Trends
                </CardTitle>
                <CardDescription>Monthly approval workflow performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={approvalTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="approved" fill="#10b981" name="Approved" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="approved" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card" data-testid="card-governance-maturity">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  Governance Maturity
                </CardTitle>
                <CardDescription>Comprehensive capability assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9ca3af' }} />
                    <Radar
                      name="Maturity"
                      dataKey="A"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <Card className="glass-card" data-testid="card-framework-compliance">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Framework Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPie>
                    <Pie
                      data={complianceByFramework}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {complianceByFramework.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      formatter={(value: number) => [`${value}%`, 'Compliance']}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {complianceByFramework.map((item, idx) => (
                    <Badge key={idx} variant="outline" style={{ borderColor: item.color, color: item.color }}>
                      {item.name}: {item.value}%
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card" data-testid="card-risk-distribution">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/50">Critical</Badge>
                    <span className="text-lg font-bold">3</span>
                  </div>
                  <Progress value={6} className="h-2 [&>div]:bg-rose-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">High</Badge>
                    <span className="text-lg font-bold">8</span>
                  </div>
                  <Progress value={16} className="h-2 [&>div]:bg-orange-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/50">Medium</Badge>
                    <span className="text-lg font-bold">15</span>
                  </div>
                  <Progress value={30} className="h-2 [&>div]:bg-amber-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/50">Low</Badge>
                    <span className="text-lg font-bold">22</span>
                  </div>
                  <Progress value={44} className="h-2 [&>div]:bg-emerald-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card" data-testid="card-top-approvers">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  Top Approvers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Sarah Chen', role: 'CISO', approved: 45, rating: 98 },
                    { name: 'John Smith', role: 'Director IT', approved: 38, rating: 95 },
                    { name: 'Emily Davis', role: 'Compliance Lead', approved: 32, rating: 92 },
                    { name: 'Michael Lee', role: 'Risk Manager', approved: 28, rating: 90 },
                  ].map((approver, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-muted">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                        {approver.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{approver.name}</p>
                        <p className="text-xs text-muted-foreground">{approver.role}</p>
                      </div>
                      <Badge className={approver.rating >= 95 ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'}>
                        {approver.rating}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {governanceModules.map((module, i) => (
              <Link key={i} href={module.link}>
                <Card className="glass-card hover-elevate cursor-pointer h-full group" data-testid={`module-${module.title.toLowerCase().replace(/\s/g, '-')}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${module.color}`}>
                        <module.icon className="w-6 h-6 text-white" />
                      </div>
                      {module.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {module.badge}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {module.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-primary">{module.stats}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common governance tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-3">
                <Link href="/governance/policies">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-create-policy">
                    <FileText className="w-4 h-4 mr-2" />
                    Create Policy
                  </Button>
                </Link>
                <Link href="/governance/frameworks">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-assign-framework">
                    <Layers className="w-4 h-4 mr-2" />
                    Assign Framework
                  </Button>
                </Link>
                <Link href="/governance/controls">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-enrich-controls">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Enrich Controls
                  </Button>
                </Link>
                <Link href="/governance/ai-governance">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-register-ai">
                    <Brain className="w-4 h-4 mr-2" />
                    Register Tech System
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Smart Insights
                </CardTitle>
                <CardDescription>Automated governance recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiInsights.map((insight, i) => (
                  <div key={i} className={`p-4 rounded-lg border ${
                    insight.severity === "high" ? "bg-red-500/5 border-red-500/20" :
                    insight.severity === "medium" ? "bg-amber-500/5 border-amber-500/20" :
                    insight.severity === "low" ? "bg-blue-500/5 border-blue-500/20" :
                    "bg-green-500/5 border-green-500/20"
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <AlertCircle className={`w-5 h-5 mt-0.5 ${
                          insight.severity === "high" ? "text-red-400" :
                          insight.severity === "medium" ? "text-amber-600 dark:text-amber-400" :
                          insight.severity === "low" ? "text-blue-400" :
                          "text-green-400"
                        }`} />
                        <div>
                          <p className="font-medium">{insight.insight}</p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {insight.severity.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" data-testid={`button-insight-action-${i}`}>
                        {insight.action}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-muted-foreground" />
                  Continuous Governance
                </CardTitle>
                <CardDescription>Real-time policy vs reality monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="font-medium">Policy Drift Detected</span>
                    <Badge variant="destructive" className="text-xs">3 Violations</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Policies exist but are violated in actual system configurations
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 rounded bg-background/50">
                      <span>Password Policy vs AD Config</span>
                      <Badge variant="outline" className="text-red-400 border-red-400/30">Violation</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-background/50">
                      <span>MFA Policy vs AWS IAM</span>
                      <Badge variant="outline" className="text-red-400 border-red-400/30">Violation</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-background/50">
                      <span>Data Retention vs S3 Lifecycle</span>
                      <Badge variant="outline" className="text-red-400 border-red-400/30">Violation</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="font-medium">Governance Signals</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    124 controls continuously validated against live systems
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Policy Coverage</span>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold">94%</p>
                <Progress value={94} className="h-1 mt-2" />
                <p className="text-xs text-muted-foreground mt-1">+5% from last quarter</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Control Effectiveness</span>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold">72%</p>
                <Progress value={72} className="h-1 mt-2" />
                <p className="text-xs text-muted-foreground mt-1">+8% from last quarter</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Decision Latency</span>
                  <TrendingDown className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold">2.3 days</p>
                <Progress value={77} className="h-1 mt-2" />
                <p className="text-xs text-muted-foreground mt-1">-0.8 days from last month</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Governance Debt</span>
                  <TrendingDown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-2xl font-bold">23</p>
                <Progress value={23} className="h-1 mt-2" />
                <p className="text-xs text-muted-foreground mt-1">Items requiring attention</p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
                Governance KPIs
              </CardTitle>
              <CardDescription>Board-ready governance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Policy Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Policies</span>
                      <span className="font-medium">{policies.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Active Policies</span>
                      <span className="font-medium">{approvedPolicies}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg Review Time</span>
                      <span className="font-medium">4.2 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Overdue Reviews</span>
                      <span className="font-medium text-red-400">7</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Control Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Controls</span>
                      <span className="font-medium">{controls.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Enhanced</span>
                      <span className="font-medium">{aiEnrichedControls}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Framework Mapped</span>
                      <span className="font-medium">{controls.filter(c => c.frameworkId).length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Automated</span>
                      <span className="font-medium">{controls.filter(c => c.automationLevel === "full").length}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Technology Governance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Tech Systems</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">High Risk Tech</span>
                      <span className="font-medium text-red-400">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Pending Review</span>
                      <span className="font-medium text-amber-600 dark:text-amber-400">5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Compliant</span>
                      <span className="font-medium text-green-400">4</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
