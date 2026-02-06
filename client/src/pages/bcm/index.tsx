import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearch, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, FileText, Clock, CheckCircle2, AlertTriangle, 
  Calendar, Play, Plus, Settings, BarChart3, Users,
  Building, Server, Database, Globe, RefreshCw, FolderOpen,
  Brain, Sparkles, Lightbulb, TrendingUp, Target, BookOpen,
  AlertCircle, Zap, Layers, Network, MapPin, UserCheck,
  ShieldCheck, Cloud, Lock, FileCheck, ClipboardCheck,
  Activity, PieChart, LineChart, ArrowRight, ExternalLink,
  ChevronRight, Search, Filter, Download, Upload, Eye,
  Workflow, GitBranch, AlertOctagon, Timer, Package,
  Building2, Link2, Cpu, HardDrive, Radio, Wifi, Wand2,
  ArrowLeft, Check, Info, HelpCircle, Rocket, CircleDot
} from "lucide-react";
import { useTenant } from "@/contexts/tenant-context";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { 
  BcmService, BcmIncident, BcmLocation, BcmRecoveryTeam,
  BcpPlan, BcpTest, BcpPlanCatalogItem, BcpTestTemplate
} from "@shared/schema";

export default function BCMPage() {
  const { currentTenantId } = useTenant();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const tabFromUrl = searchParams.get("tab") || "dashboard";
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [showIncidentDialog, setShowIncidentDialog] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  
  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    const newUrl = value === "dashboard" ? "/bcm" : `/bcm?tab=${value}`;
    setLocation(newUrl);
  }, [setLocation]);

  const { data: bcmServices = [], isLoading: servicesLoading } = useQuery<BcmService[]>({
    queryKey: ["/api/bcm/services", currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return [];
      const res = await fetch(`/api/bcm/services?tenantId=${currentTenantId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!currentTenantId,
  });

  const { data: bcmIncidents = [] } = useQuery<BcmIncident[]>({
    queryKey: ["/api/bcm/incidents", currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return [];
      const res = await fetch(`/api/bcm/incidents?tenantId=${currentTenantId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!currentTenantId,
  });

  const { data: bcmLocations = [] } = useQuery<BcmLocation[]>({
    queryKey: ["/api/bcm/locations", currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return [];
      const res = await fetch(`/api/bcm/locations?tenantId=${currentTenantId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!currentTenantId,
  });

  const { data: bcmTeams = [] } = useQuery<BcmRecoveryTeam[]>({
    queryKey: ["/api/bcm/teams", currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return [];
      const res = await fetch(`/api/bcm/teams?tenantId=${currentTenantId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!currentTenantId,
  });

  const { data: bcpPlans = [] } = useQuery<BcpPlan[]>({
    queryKey: ["/api/bcp/plans", currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return [];
      const res = await fetch(`/api/bcp/plans?tenantId=${currentTenantId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!currentTenantId,
  });

  const { data: bcpTests = [] } = useQuery<BcpTest[]>({
    queryKey: ["/api/bcp/tests", currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return [];
      const res = await fetch(`/api/bcp/tests?tenantId=${currentTenantId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!currentTenantId,
  });

  const { data: planCatalog = [] } = useQuery<BcpPlanCatalogItem[]>({
    queryKey: ["/api/bcp/plan-catalog"],
  });

  const { data: testTemplates = [] } = useQuery<BcpTestTemplate[]>({
    queryKey: ["/api/bcp/test-templates"],
  });

  const tier0Count = bcmServices.filter(s => s.serviceTier === "tier_0").length;
  const tier1Count = bcmServices.filter(s => s.serviceTier === "tier_1").length;
  const activeIncidents = bcmIncidents.filter(i => i.status === "open" || i.status === "activated").length;
  const completedTests = bcpTests.filter(t => t.status === "completed").length;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "tier_0": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "tier_1": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "tier_2": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "tier_3": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/20 text-red-400";
      case "major": return "bg-orange-500/20 text-orange-400";
      case "minor": return "bg-amber-500/20 text-amber-400";
      case "informational": return "bg-blue-500/20 text-blue-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": case "approved": case "completed": return "bg-green-500/20 text-green-400";
      case "draft": case "pending": return "bg-amber-500/20 text-amber-400";
      case "open": case "activated": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const formatMinutes = (minutes: number | null | undefined) => {
    if (!minutes) return "N/A";
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
    return `${Math.round(minutes / 1440)}d`;
  };

  const DashboardMetricCard = ({ title, value, icon: Icon, color, trend, subtitle }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string;
    trend?: string;
    subtitle?: string;
  }) => (
    <Card className="glass-card hover-elevate" data-testid={`metric-${title.toLowerCase().replace(/\s/g, '-')}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-muted-foreground">{title}</p>
              {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {trend && (
            <Badge variant="secondary" className="text-xs">
              {trend}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ title, description, icon: Icon, action }: { 
    title: string; 
    description: string; 
    icon: any;
    action?: () => void;
  }) => (
    <Card className="glass-card">
      <CardContent className="p-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          <Icon className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
        {action && (
          <Button onClick={action} data-testid="button-empty-state-action">
            <Plus className="w-4 h-4 mr-2" />
            Get Started
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const ServiceTierBadge = ({ tier }: { tier: string }) => (
    <Badge variant="outline" className={`text-xs font-medium ${getTierColor(tier)}`}>
      {tier.replace("_", " ").toUpperCase()}
    </Badge>
  );

  return (
    <div className="min-h-screen p-6 space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">

        <TabsContent value="dashboard" className="space-y-6">
          {/* Dashboard Header - Only visible on dashboard tab */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                Business Continuity Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Enterprise BCM with BIA, dependency mapping, DR strategies, and AI-powered insights
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" data-testid="button-bcm-reports">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" data-testid="button-bcm-settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button data-testid="button-add-service" onClick={() => setShowServiceDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>
          </div>

          {/* Metric Cards - Only visible on dashboard tab */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <DashboardMetricCard 
              title="Services" 
              value={bcmServices.length} 
              icon={Layers} 
              color="bg-blue-500/20 text-blue-400"
              subtitle="Total tracked"
            />
            <DashboardMetricCard 
              title="Tier 0/1" 
              value={tier0Count + tier1Count} 
              icon={AlertTriangle} 
              color="bg-red-500/20 text-red-400"
              subtitle="Critical services"
            />
            <DashboardMetricCard 
              title="BC Plans" 
              value={bcpPlans.length} 
              icon={FileText} 
              color="bg-purple-500/20 text-purple-400"
            />
            <DashboardMetricCard 
              title="DR Tests" 
              value={completedTests} 
              icon={Play} 
              color="bg-green-500/20 text-green-400"
              subtitle="Completed"
            />
            <DashboardMetricCard 
              title="Locations" 
              value={bcmLocations.length} 
              icon={MapPin} 
              color="bg-cyan-500/20 text-cyan-400"
            />
            <DashboardMetricCard 
              title="Teams" 
              value={bcmTeams.length} 
              icon={Users} 
              color="bg-amber-500/20 text-amber-400"
            />
            <DashboardMetricCard 
              title="Incidents" 
              value={activeIncidents} 
              icon={AlertOctagon} 
              color={activeIncidents > 0 ? "bg-red-500/20 text-red-400" : "bg-gray-500/20 text-gray-400"}
              subtitle="Active"
            />
            <DashboardMetricCard 
              title="Templates" 
              value={planCatalog.length + testTemplates.length} 
              icon={FolderOpen} 
              color="bg-indigo-500/20 text-indigo-400"
            />
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  BCM Health Score
                </CardTitle>
                <CardDescription>Overall business continuity readiness</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" className="fill-none stroke-muted stroke-[8]" />
                      <circle cx="64" cy="64" r="56" className="fill-none stroke-primary stroke-[8]" 
                        strokeDasharray={`${78 * 3.52} 352`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold">78%</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>BIA Completion</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Plan Coverage</span>
                        <span className="font-medium">72%</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Test Pass Rate</span>
                        <span className="font-medium">68%</span>
                      </div>
                      <Progress value={68} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Vendor Resilience</span>
                        <span className="font-medium">82%</span>
                      </div>
                      <Progress value={82} className="h-2" />
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
                  <CardTitle className="text-base">AI Insights</CardTitle>
                  <Badge variant="secondary" className="bg-primary/20 border-0">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 rounded bg-amber-500/20 text-amber-400">
                      <Lightbulb className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Unrealistic RTO Detected</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        "Payment Processing" has 15min RTO but no hot standby configured
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 rounded bg-blue-500/20 text-blue-400">
                      <TrendingUp className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Single Point of Failure</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        3 Tier-1 services depend on single vendor "CloudProvider X"
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 rounded bg-purple-500/20 text-purple-400">
                      <Target className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Test Overdue</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        DR test for "Core Banking" is 45 days overdue
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  Service Tier Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 text-sm font-medium">Tier 0</div>
                    <div className="flex-1">
                      <Progress value={tier0Count > 0 ? (tier0Count / bcmServices.length) * 100 : 0} className="h-3 bg-red-500/20" />
                    </div>
                    <div className="w-8 text-right text-sm">{tier0Count}</div>
                    <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">Mission Critical</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 text-sm font-medium">Tier 1</div>
                    <div className="flex-1">
                      <Progress value={tier1Count > 0 ? (tier1Count / bcmServices.length) * 100 : 0} className="h-3 bg-orange-500/20" />
                    </div>
                    <div className="w-8 text-right text-sm">{tier1Count}</div>
                    <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30">Business Critical</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 text-sm font-medium">Tier 2</div>
                    <div className="flex-1">
                      <Progress value={bcmServices.filter(s => s.serviceTier === "tier_2").length > 0 ? (bcmServices.filter(s => s.serviceTier === "tier_2").length / bcmServices.length) * 100 : 0} className="h-3 bg-amber-500/20" />
                    </div>
                    <div className="w-8 text-right text-sm">{bcmServices.filter(s => s.serviceTier === "tier_2").length}</div>
                    <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">Important</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 text-sm font-medium">Tier 3</div>
                    <div className="flex-1">
                      <Progress value={bcmServices.filter(s => s.serviceTier === "tier_3").length > 0 ? (bcmServices.filter(s => s.serviceTier === "tier_3").length / bcmServices.length) * 100 : 0} className="h-3 bg-green-500/20" />
                    </div>
                    <div className="w-8 text-right text-sm">{bcmServices.filter(s => s.serviceTier === "tier_3").length}</div>
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">Standard</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-red-400" />
                  Active Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeIncidents === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No active BCM incidents</p>
                    <p className="text-xs text-muted-foreground mt-1">All systems operating normally</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bcmIncidents.filter(i => i.status === "open" || i.status === "activated").slice(0, 3).map((incident) => (
                      <div key={incident.id} className="p-3 rounded-lg bg-background/50 border border-border/50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded ${getSeverityColor(incident.severity || 'minor')}`}>
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{incident.title}</p>
                              <p className="text-xs text-muted-foreground">{incident.incidentNumber}</p>
                            </div>
                          </div>
                          <Badge className={getSeverityColor(incident.severity || 'minor')}>
                            {incident.severity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  RTO/RPO Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <p className="text-xs text-muted-foreground">Avg RTO</p>
                      <p className="text-xl font-bold text-purple-400">4.2h</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="text-xs text-muted-foreground">Avg RPO</p>
                      <p className="text-xl font-bold text-blue-400">1.5h</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Meeting RTO targets</span>
                      <span className="text-green-400">85%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Meeting RPO targets</span>
                      <span className="text-green-400">92%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  Location Resilience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bcmLocations.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No locations configured</p>
                  ) : (
                    bcmLocations.slice(0, 3).map((location) => (
                      <div key={location.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{location.name}</span>
                        </div>
                        <Badge variant="outline" className={getStatusColor(location.status || 'active')}>
                          {location.locationType}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  Recovery Teams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bcmTeams.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No teams configured</p>
                  ) : (
                    bcmTeams.slice(0, 3).map((team) => (
                      <div key={team.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{team.name}</span>
                        </div>
                        <Badge variant="outline">{team.teamType}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bia" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Business Impact Analysis</h2>
              <p className="text-sm text-muted-foreground">
                Automated BIA with dynamic questionnaires and AI-calculated RTO/RPO/MTPD
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" data-testid="button-import-bia">
                <Upload className="w-4 h-4 mr-2" />
                Import from CMDB
              </Button>
              <Button data-testid="button-start-bia">
                <Plus className="w-4 h-4 mr-2" />
                Start BIA Assessment
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{bcmServices.length}</p>
                    <p className="text-sm text-muted-foreground">Total Services</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-green-500/20 text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{bcmServices.filter(s => s.biaStatus === "completed").length}</p>
                    <p className="text-sm text-muted-foreground">BIA Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{bcmServices.filter(s => s.biaStatus === "in_progress").length}</p>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-red-500/20 text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{bcmServices.filter(s => s.biaStatus === "needs_review").length}</p>
                    <p className="text-sm text-muted-foreground">Needs Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>BIA Questionnaire Templates</CardTitle>
              <CardDescription>Role-based questionnaires for Business, IT, and Operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-background/50 border border-border/50 hover-elevate cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Business BIA</h4>
                      <p className="text-xs text-muted-foreground">For business units</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Financial impact, customer impact, regulatory requirements
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">25 questions</Badge>
                    <Button size="sm" variant="outline" data-testid="button-start-business-bia">Start</Button>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-background/50 border border-border/50 hover-elevate cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">IT BIA</h4>
                      <p className="text-xs text-muted-foreground">For IT teams</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    System dependencies, data requirements, technical RTO/RPO
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">35 questions</Badge>
                    <Button size="sm" variant="outline" data-testid="button-start-it-bia">Start</Button>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-background/50 border border-border/50 hover-elevate cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
                      <Workflow className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Operations BIA</h4>
                      <p className="text-xs text-muted-foreground">For operations</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Process dependencies, staffing needs, alternate procedures
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">30 questions</Badge>
                    <Button size="sm" variant="outline" data-testid="button-start-ops-bia">Start</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Service BIA Status</CardTitle>
                  <CardDescription>Impact analysis status for all business services</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Search services..." className="w-64" data-testid="input-search-services" />
                  <Button variant="outline" size="icon" data-testid="button-filter-services">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {bcmServices.length === 0 ? (
                <EmptyState
                  title="No Services Configured"
                  description="Add business services to start the Business Impact Analysis process"
                  icon={Layers}
                  action={() => setShowServiceDialog(true)}
                />
              ) : (
                <ScrollArea className="h-[400px]">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-background/95 backdrop-blur">
                      <tr className="border-b">
                        <th className="text-left p-3 text-sm font-medium">Service</th>
                        <th className="text-left p-3 text-sm font-medium">Tier</th>
                        <th className="text-left p-3 text-sm font-medium">RTO</th>
                        <th className="text-left p-3 text-sm font-medium">RPO</th>
                        <th className="text-left p-3 text-sm font-medium">MTPD</th>
                        <th className="text-left p-3 text-sm font-medium">BIA Status</th>
                        <th className="text-left p-3 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bcmServices.map((service) => (
                        <tr key={service.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{service.name}</p>
                              <p className="text-xs text-muted-foreground">{service.code}</p>
                            </div>
                          </td>
                          <td className="p-3">
                            <ServiceTierBadge tier={service.serviceTier || "tier_2"} />
                          </td>
                          <td className="p-3 text-sm">{formatMinutes(service.rto)}</td>
                          <td className="p-3 text-sm">{formatMinutes(service.rpo)}</td>
                          <td className="p-3 text-sm">{service.mtpd ? `${service.mtpd}h` : "N/A"}</td>
                          <td className="p-3">
                            <Badge className={getStatusColor(service.biaStatus || 'pending')}>
                              {service.biaStatus || 'pending'}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Button size="sm" variant="ghost" data-testid={`button-view-bia-service-${service.id}`}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Business Services</h2>
              <p className="text-sm text-muted-foreground">
                Manage all business services with tier classification and recovery objectives
              </p>
            </div>
            <Button onClick={() => setShowServiceDialog(true)} data-testid="button-add-service-tab">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </div>

          {bcmServices.length === 0 ? (
            <EmptyState
              title="No Business Services"
              description="Start by adding your critical business services to begin BCM planning"
              icon={Layers}
              action={() => setShowServiceDialog(true)}
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bcmServices.map((service) => (
                <Card key={service.id} className="glass-card hover-elevate cursor-pointer" data-testid={`service-card-${service.code}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <ServiceTierBadge tier={service.serviceTier || "tier_2"} />
                      <Badge className={getStatusColor(service.status || 'active')}>
                        {service.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-2">{service.name}</CardTitle>
                    <CardDescription>{service.code}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {service.description || "No description provided"}
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <p className="text-xs text-muted-foreground">RTO</p>
                        <p className="font-semibold text-purple-400">{formatMinutes(service.rto)}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <p className="text-xs text-muted-foreground">RPO</p>
                        <p className="font-semibold text-blue-400">{formatMinutes(service.rpo)}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-amber-500/10">
                        <p className="text-xs text-muted-foreground">MTPD</p>
                        <p className="font-semibold text-amber-400">{service.mtpd ? `${service.mtpd}h` : "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Building2 className="w-3 h-3" />
                        <span>{service.department || "Unassigned"}</span>
                      </div>
                      <Button size="sm" variant="ghost" data-testid={`button-expand-service-${service.id}`}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Service & Dependency Intelligence</h2>
              <p className="text-sm text-muted-foreground">
                End-to-end dependency mapping with critical path identification
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" data-testid="button-sync-cmdb">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync from CMDB
              </Button>
              <Button variant="outline" data-testid="button-impact-simulation">
                <Zap className="w-4 h-4 mr-2" />
                Impact Simulation
              </Button>
            </div>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5 text-purple-400" />
                Dependency Graph
              </CardTitle>
              <CardDescription>Visual representation of service dependencies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-lg border border-dashed border-border">
                <div className="text-center">
                  <Network className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">Interactive Dependency Graph</p>
                  <p className="text-sm text-muted-foreground max-w-md mt-2">
                    Visualize Business Service → Application → Infrastructure → Cloud → Vendor → Location dependencies
                  </p>
                  <Button className="mt-4" variant="outline" data-testid="button-view-full-graph">
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Graph
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Single Points of Failure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center gap-3">
                      <Server className="w-5 h-5 text-red-400" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Primary Database Cluster</p>
                        <p className="text-xs text-muted-foreground">12 services depend on this</p>
                      </div>
                      <Badge variant="outline" className="bg-red-500/20 text-red-400">Critical</Badge>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <div className="flex items-center gap-3">
                      <Cloud className="w-5 h-5 text-orange-400" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">AWS us-east-1 Region</p>
                        <p className="text-xs text-muted-foreground">8 services in single region</p>
                      </div>
                      <Badge variant="outline" className="bg-orange-500/20 text-orange-400">High</Badge>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-amber-400" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Payment Gateway Vendor</p>
                        <p className="text-xs text-muted-foreground">No alternate vendor configured</p>
                      </div>
                      <Badge variant="outline" className="bg-amber-500/20 text-amber-400">Medium</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-400" />
                  Critical Path Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                    <p className="text-sm font-medium mb-2">Payment Processing Critical Path</p>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline">Web App</Badge>
                      <ArrowRight className="w-3 h-3" />
                      <Badge variant="outline">API Gateway</Badge>
                      <ArrowRight className="w-3 h-3" />
                      <Badge variant="outline">Payment Service</Badge>
                      <ArrowRight className="w-3 h-3" />
                      <Badge variant="outline">Database</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Estimated recovery: 45 minutes</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                    <p className="text-sm font-medium mb-2">Customer Portal Critical Path</p>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline">CDN</Badge>
                      <ArrowRight className="w-3 h-3" />
                      <Badge variant="outline">Load Balancer</Badge>
                      <ArrowRight className="w-3 h-3" />
                      <Badge variant="outline">Portal App</Badge>
                      <ArrowRight className="w-3 h-3" />
                      <Badge variant="outline">Auth Service</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Estimated recovery: 30 minutes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">BC & DR Strategy Engine</h2>
              <p className="text-sm text-muted-foreground">
                Define recovery strategies with RTO/RPO validation and gap detection
              </p>
            </div>
            <Button data-testid="button-add-strategy">
              <Plus className="w-4 h-4 mr-2" />
              Define Strategy
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>BC Strategies</CardTitle>
                <CardDescription>Business continuity approaches per service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Active/Active</span>
                    <Badge variant="secondary">5 services</Badge>
                  </div>
                  <Progress value={100} className="h-1.5 bg-green-500/20" />
                  <p className="text-xs text-muted-foreground mt-1">Full redundancy, instant failover</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Active/Passive</span>
                    <Badge variant="secondary">8 services</Badge>
                  </div>
                  <Progress value={70} className="h-1.5 bg-blue-500/20" />
                  <p className="text-xs text-muted-foreground mt-1">Standby system, minutes to failover</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Manual Workaround</span>
                    <Badge variant="secondary">12 services</Badge>
                  </div>
                  <Progress value={40} className="h-1.5 bg-amber-500/20" />
                  <p className="text-xs text-muted-foreground mt-1">Documented manual procedures</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>DR Strategies</CardTitle>
                <CardDescription>Disaster recovery approaches</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Hot Standby</span>
                    <Badge variant="secondary">3 services</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">RTO: {"<"}15min | Cost: $$$</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Warm Standby</span>
                    <Badge variant="secondary">7 services</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">RTO: 1-4h | Cost: $$</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Pilot Light</span>
                    <Badge variant="secondary">5 services</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">RTO: 4-8h | Cost: $</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Backup & Restore</span>
                    <Badge variant="secondary">10 services</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">RTO: 24h+ | Cost: Minimal</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-amber-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Strategy Gap Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="font-medium text-red-400">Under-Protected</span>
                  </div>
                  <p className="text-sm mb-2">3 Tier-1 services with backup-only DR strategy</p>
                  <p className="text-xs text-muted-foreground">Recommended: Upgrade to warm/hot standby</p>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span className="font-medium text-amber-400">Over-Engineered</span>
                  </div>
                  <p className="text-sm mb-2">2 Tier-3 services with hot standby DR</p>
                  <p className="text-xs text-muted-foreground">Potential cost savings: $15,000/month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Dynamic BC & DR Plans</h2>
              <p className="text-sm text-muted-foreground">
                Modular plans with auto-versioning and live updates
              </p>
            </div>
            <Button data-testid="button-create-plan">
              <Plus className="w-4 h-4 mr-2" />
              Create Plan
            </Button>
          </div>

          <div className="grid lg:grid-cols-4 gap-4">
            {planCatalog.slice(0, 4).map((template) => (
              <Card key={template.id} className="glass-card hover-elevate cursor-pointer">
                <CardContent className="p-4">
                  <div className="p-2 rounded-lg bg-primary/20 w-fit mb-3">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-medium mb-1">{template.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{template.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{template.category}</Badge>
                    {template.aiEnriched && (
                      <Badge variant="secondary" className="text-xs bg-primary/20">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Active Plans</CardTitle>
            </CardHeader>
            <CardContent>
              {bcpPlans.length === 0 ? (
                <EmptyState
                  title="No Plans Created"
                  description="Create BC/DR plans from templates to get started"
                  icon={FileText}
                />
              ) : (
                <div className="space-y-3">
                  {bcpPlans.map((plan) => (
                    <div key={plan.id} className="p-4 rounded-lg bg-background/50 border border-border/50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                          <FileText className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium">{plan.name}</p>
                          <p className="text-xs text-muted-foreground">Version {plan.version} | Owner: {plan.owner || "Unassigned"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(plan.status || 'draft')}>{plan.status}</Badge>
                        <Button size="sm" variant="outline" data-testid={`button-view-plan-${plan.id}`}>View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activation" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">BCM Activation & Command Center</h2>
              <p className="text-sm text-muted-foreground">
                Incident-triggered activation with decision trees and escalation
              </p>
            </div>
            <Button variant="destructive" onClick={() => setShowIncidentDialog(true)} data-testid="button-declare-incident">
              <AlertOctagon className="w-4 h-4 mr-2" />
              Declare Incident
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-red-400 animate-pulse" />
                  Command Center Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeIncidents === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <p className="text-xl font-medium text-green-400">All Clear</p>
                    <p className="text-sm text-muted-foreground mt-2">No active BCM incidents</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bcmIncidents.filter(i => i.status !== "closed").map((incident) => (
                      <div key={incident.id} className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                              {incident.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">{incident.incidentNumber}</p>
                          </div>
                          <Badge className={getSeverityColor(incident.severity || 'minor')}>
                            {incident.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{incident.description}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="destructive" data-testid={`button-activate-dr-${incident.id}`}>Activate DR</Button>
                          <Button size="sm" variant="outline" data-testid={`button-workaround-${incident.id}`}>Manual Workaround</Button>
                          <Button size="sm" variant="outline" data-testid={`button-escalate-${incident.id}`}>Escalate</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Escalation Matrix</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="font-medium text-sm text-red-400">Level 1 - Critical</p>
                  <p className="text-xs text-muted-foreground">CEO, CTO, CISO, Crisis Commander</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <p className="font-medium text-sm text-orange-400">Level 2 - Major</p>
                  <p className="text-xs text-muted-foreground">VP Operations, IT Director, BCM Lead</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="font-medium text-sm text-amber-400">Level 3 - Minor</p>
                  <p className="text-xs text-muted-foreground">Team Leads, On-call Engineers</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Testing, Exercises & Evidence</h2>
              <p className="text-sm text-muted-foreground">
                Test calendar with pre-built scenarios and RTO vs achieved comparison
              </p>
            </div>
            <Button data-testid="button-schedule-test">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Test
            </Button>
          </div>

          <div className="grid lg:grid-cols-4 gap-4">
            {testTemplates.slice(0, 4).map((template) => (
              <Card key={template.id} className="glass-card hover-elevate cursor-pointer">
                <CardContent className="p-4">
                  <div className="p-2 rounded-lg bg-amber-500/20 w-fit mb-3">
                    <Play className="w-5 h-5 text-amber-400" />
                  </div>
                  <h4 className="font-medium mb-1">{template.name}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">{template.testType}</Badge>
                    <Badge variant="outline" className="text-xs">{template.difficulty}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{template.duration}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Test Results & Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              {bcpTests.length === 0 ? (
                <EmptyState
                  title="No Tests Conducted"
                  description="Schedule and execute BC/DR tests to validate your recovery capabilities"
                  icon={ClipboardCheck}
                />
              ) : (
                <div className="space-y-3">
                  {bcpTests.map((test) => (
                    <div key={test.id} className="p-4 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${test.status === 'completed' ? 'bg-green-500/20' : 'bg-amber-500/20'}`}>
                            <Play className={`w-5 h-5 ${test.status === 'completed' ? 'text-green-400' : 'text-amber-400'}`} />
                          </div>
                          <div>
                            <p className="font-medium">{test.testType} Test</p>
                            <p className="text-xs text-muted-foreground">
                              Scheduled: {test.scheduledDate ? new Date(test.scheduledDate).toLocaleDateString() : 'TBD'}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(test.status || 'pending')}>{test.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Third-Party & Supply Chain Resilience</h2>
              <p className="text-sm text-muted-foreground">
                Vendor continuity mapping with SLA mismatch detection
              </p>
            </div>
            <Button data-testid="button-add-vendor-resilience">
              <Plus className="w-4 h-4 mr-2" />
              Add Vendor
            </Button>
          </div>

          <div className="grid lg:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-sm text-muted-foreground">Critical Vendors</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-green-500/20 text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">8</p>
                    <p className="text-sm text-muted-foreground">BCM Validated</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-sm text-muted-foreground">SLA Mismatches</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-red-500/20 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">1</p>
                    <p className="text-sm text-muted-foreground">High Risk</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vendor Resilience Overview</CardTitle>
                <div className="flex gap-2">
                  <Input placeholder="Search vendors..." className="w-64" data-testid="input-search-vendors" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "AWS Cloud Services", tier: "Critical", bcmScore: 95, slaMismatch: false, services: ["Core Infrastructure", "Backup Storage"] },
                  { name: "Stripe Payment Gateway", tier: "Critical", bcmScore: 88, slaMismatch: false, services: ["Payment Processing"] },
                  { name: "Salesforce CRM", tier: "High", bcmScore: 72, slaMismatch: true, services: ["Customer Data", "Sales Operations"] },
                  { name: "Twilio Communications", tier: "Medium", bcmScore: 65, slaMismatch: true, services: ["SMS Notifications", "Voice Calls"] },
                  { name: "DataDog Monitoring", tier: "High", bcmScore: 82, slaMismatch: false, services: ["Infrastructure Monitoring"] },
                ].map((vendor, i) => (
                  <div key={i} className="p-4 rounded-lg bg-background/50 border border-border/50 hover:border-purple-500/30 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{vendor.name}</p>
                          <p className="text-xs text-muted-foreground">{vendor.services.join(", ")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className={
                          vendor.tier === "Critical" ? "text-red-400 border-red-400/30" :
                          vendor.tier === "High" ? "text-amber-400 border-amber-400/30" :
                          "text-blue-400 border-blue-400/30"
                        }>{vendor.tier}</Badge>
                        <div className="text-right">
                          <p className={`font-medium ${vendor.bcmScore >= 80 ? "text-green-400" : vendor.bcmScore >= 60 ? "text-amber-400" : "text-red-400"}`}>
                            {vendor.bcmScore}%
                          </p>
                          <p className="text-xs text-muted-foreground">BCM Score</p>
                        </div>
                        {vendor.slaMismatch && (
                          <Badge className="bg-amber-500/20 text-amber-400">SLA Mismatch</Badge>
                        )}
                        <Button size="icon" variant="ghost" data-testid={`button-view-vendor-${i}`}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cyber" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Cloud & Cyber Resilience</h2>
              <p className="text-sm text-muted-foreground">
                Ransomware recovery plans, clean-room procedures, and immutable backup validation
              </p>
            </div>
            <Button data-testid="button-add-cyber-plan">
              <Plus className="w-4 h-4 mr-2" />
              Create Cyber Recovery Plan
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-red-400" />
                  Ransomware Readiness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="40" className="fill-none stroke-muted stroke-[6]" />
                      <circle cx="48" cy="48" r="40" className="fill-none stroke-red-500 stroke-[6]"
                        strokeDasharray={`${65 * 2.51} 251`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">65%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Recovery readiness score</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-green-400" />
                  Immutable Backups
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Air-gapped copies</span>
                  <Badge className="bg-green-500/20 text-green-400">Verified</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last validation</span>
                  <span className="text-sm text-muted-foreground">2 days ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Recovery point</span>
                  <span className="text-sm text-muted-foreground">4 hours ago</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-blue-400" />
                  Clean Room Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Environment Ready</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last tested</span>
                    <span>15 days ago</span>
                  </div>
                  <Button className="w-full" variant="outline" size="sm" data-testid="button-test-clean-room">
                    Test Clean Room
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="people" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">People, Skills & Location Resilience</h2>
              <p className="text-sm text-muted-foreground">
                Role-based recovery teams with skills mapping and remote-work readiness
              </p>
            </div>
            <Button data-testid="button-add-team">
              <Plus className="w-4 h-4 mr-2" />
              Add Recovery Team
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recovery Teams</CardTitle>
              </CardHeader>
              <CardContent>
                {bcmTeams.length === 0 ? (
                  <EmptyState
                    title="No Recovery Teams"
                    description="Define recovery teams with roles and responsibilities"
                    icon={Users}
                  />
                ) : (
                  <div className="space-y-3">
                    {bcmTeams.map((team) => (
                      <div key={team.id} className="p-3 rounded-lg bg-background/50 border border-border/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{team.name}</p>
                              <p className="text-xs text-muted-foreground">{team.teamType}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{team.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Skills Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Crisis Management</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>IT Recovery</span>
                      <span>90%</span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Business Operations</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Communications</span>
                      <span>70%</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Continuous Compliance</h2>
              <p className="text-sm text-muted-foreground">
                ISO 22301, DORA, NIS2 mapping with auto-linked evidence
              </p>
            </div>
            <Button data-testid="button-generate-audit-pack">
              <Download className="w-4 h-4 mr-2" />
              Generate Audit Pack
            </Button>
          </div>

          <div className="grid lg:grid-cols-4 gap-4">
            <Card className="glass-card hover-elevate cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="font-medium">ISO 22301</span>
                </div>
                <Progress value={78} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">78% compliant</p>
              </CardContent>
            </Card>
            <Card className="glass-card hover-elevate cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Shield className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="font-medium">DORA</span>
                </div>
                <Progress value={65} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">65% compliant</p>
              </CardContent>
            </Card>
            <Card className="glass-card hover-elevate cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Globe className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="font-medium">NIS2</span>
                </div>
                <Progress value={82} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">82% compliant</p>
              </CardContent>
            </Card>
            <Card className="glass-card hover-elevate cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <Building className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="font-medium">SAMA / ECC</span>
                </div>
                <Progress value={70} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">70% compliant</p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Evidence Library</CardTitle>
              <CardDescription>Auto-linked BCM artifacts for audit readiness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center gap-3 mb-3">
                    <FileCheck className="w-5 h-5 text-blue-400" />
                    <span className="font-medium">BIA Documents</span>
                  </div>
                  <p className="text-2xl font-bold">{bcmServices.length}</p>
                  <p className="text-xs text-muted-foreground">Completed assessments</p>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <span className="font-medium">BC/DR Plans</span>
                  </div>
                  <p className="text-2xl font-bold">{bcpPlans.length}</p>
                  <p className="text-xs text-muted-foreground">Active plans</p>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center gap-3 mb-3">
                    <ClipboardCheck className="w-5 h-5 text-green-400" />
                    <span className="font-medium">Test Reports</span>
                  </div>
                  <p className="text-2xl font-bold">{completedTests}</p>
                  <p className="text-xs text-muted-foreground">Completed tests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BCM Wizard with AI Enrichment */}
        <TabsContent value="wizard" className="space-y-6">
          <Card className="glass-card border-purple-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <Wand2 className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      BCM Setup Wizard
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">AI-Powered</Badge>
                    </CardTitle>
                    <CardDescription>
                      Guided setup for your Business Continuity Management program with AI recommendations
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Wizard Progress Steps */}
              <div className="flex items-center justify-between mb-8 px-4">
                {[
                  { step: 1, label: "Organization Profile", icon: Building2 },
                  { step: 2, label: "Critical Services", icon: Layers },
                  { step: 3, label: "Dependencies", icon: Network },
                  { step: 4, label: "Impact Analysis", icon: BarChart3 },
                  { step: 5, label: "Recovery Strategy", icon: Target },
                  { step: 6, label: "Plans & Teams", icon: Users },
                ].map(({ step, label, icon: StepIcon }, index, arr) => (
                  <div key={step} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <Button
                        size="icon"
                        variant={wizardStep === step ? "default" : wizardStep > step ? "outline" : "ghost"}
                        onClick={() => setWizardStep(step)}
                        className={`rounded-full transition-all duration-300 ${
                          wizardStep === step
                            ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 border-0"
                            : wizardStep > step
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : ""
                        }`}
                        data-testid={`wizard-step-${step}`}
                      >
                        {wizardStep > step ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <StepIcon className="w-5 h-5" />
                        )}
                      </Button>
                      <span className={`text-xs mt-2 font-medium ${
                        wizardStep === step ? "text-purple-400" : "text-muted-foreground"
                      }`}>
                        {label}
                      </span>
                    </div>
                    {index < arr.length - 1 && (
                      <div className={`w-16 h-0.5 mx-2 ${
                        wizardStep > step ? "bg-green-500/50" : "bg-border"
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Wizard Step Content */}
              <div className="min-h-[400px] p-6 rounded-xl bg-background/50 border border-border/50">
                {wizardStep === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-purple-500/10">
                        <Building2 className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">Organization Profile</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Let's start by understanding your organization structure
                        </p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-purple-400 font-medium">AI will analyze</span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="org-name">Organization Name</Label>
                        <Input id="org-name" placeholder="Enter organization name" data-testid="input-wizard-org-name" />
                      </div>
                      <div>
                        <Label htmlFor="org-industry">Industry Sector</Label>
                        <Select>
                          <SelectTrigger data-testid="select-wizard-industry">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="financial">Financial Services</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="government">Government</SelectItem>
                            <SelectItem value="energy">Energy & Utilities</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="org-size">Organization Size</Label>
                        <Select>
                          <SelectTrigger data-testid="select-wizard-size">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small (1-100 employees)</SelectItem>
                            <SelectItem value="medium">Medium (101-1000 employees)</SelectItem>
                            <SelectItem value="large">Large (1001-10000 employees)</SelectItem>
                            <SelectItem value="enterprise">Enterprise (10000+ employees)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="org-region">Primary Region</Label>
                        <Select>
                          <SelectTrigger data-testid="select-wizard-region">
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="north-america">North America</SelectItem>
                            <SelectItem value="europe">Europe</SelectItem>
                            <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
                            <SelectItem value="middle-east">Middle East</SelectItem>
                            <SelectItem value="africa">Africa</SelectItem>
                            <SelectItem value="latin-america">Latin America</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Card className="bg-purple-500/5 border-purple-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Brain className="w-5 h-5 text-purple-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-purple-400">AI Recommendation</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Based on your industry and size, AI will suggest appropriate RTOs, RPOs, and recovery strategies 
                              aligned with regulatory requirements and industry best practices.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-blue-500/10">
                        <Layers className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">Critical Business Services</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Identify your most critical business services and processes
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {["Payment Processing", "Customer Portal", "Core Banking", "Data Analytics"].map((service, i) => (
                        <Card key={i} className="bg-background/50 border-border/50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                  <Server className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                  <p className="font-medium">{service}</p>
                                  <p className="text-xs text-muted-foreground">Sample service - click to configure</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-amber-400 border-amber-400/30">Tier 1</Badge>
                                <Button size="sm" variant="ghost" data-testid={`button-configure-wizard-service-${i}`}>
                                  <Settings className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      <Button variant="outline" className="border-dashed" data-testid="button-add-service-wizard">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Business Service
                      </Button>
                    </div>

                    <Card className="bg-blue-500/5 border-blue-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="w-5 h-5 text-blue-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-400">AI Insight</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              AI has identified 4 potential critical services based on your industry. 
                              These are commonly impacted during disruptions and require robust continuity plans.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-green-500/10">
                        <Network className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">Dependency Mapping</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Map dependencies between services, applications, and infrastructure
                        </p>
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                      <Card className="bg-background/50 border-border/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Database className="w-4 h-4 text-purple-400" />
                            Internal Dependencies
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {["Primary Database Cluster", "Authentication Service", "API Gateway", "Message Queue"].map((dep, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                              <span className="text-sm">{dep}</span>
                              <Badge variant="outline" className="text-xs">Active</Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card className="bg-background/50 border-border/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-400" />
                            External Dependencies
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {["Cloud Provider (AWS)", "Payment Gateway", "CDN Provider", "Email Service"].map((dep, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                              <span className="text-sm">{dep}</span>
                              <Badge variant="outline" className="text-xs">Active</Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-green-500/5 border-green-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Brain className="w-5 h-5 text-green-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-green-400">AI Dependency Analysis</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              AI has detected 3 critical path dependencies that could cause cascading failures. 
                              Consider adding redundancy for the Authentication Service.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {wizardStep === 4 && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-amber-500/10">
                        <BarChart3 className="w-6 h-6 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">Business Impact Analysis</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Assess the impact of service disruptions on business operations
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <Card className="bg-background/50 border-border/50">
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-amber-400">4h</div>
                          <p className="text-xs text-muted-foreground mt-1">Avg RTO Target</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-background/50 border-border/50">
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-blue-400">1h</div>
                          <p className="text-xs text-muted-foreground mt-1">Avg RPO Target</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-background/50 border-border/50">
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-purple-400">24h</div>
                          <p className="text-xs text-muted-foreground mt-1">MTPD</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-3">
                      {[
                        { service: "Payment Processing", rto: "2h", rpo: "15min", impact: "Critical", score: 95 },
                        { service: "Customer Portal", rto: "4h", rpo: "1h", impact: "High", score: 80 },
                        { service: "Core Banking", rto: "1h", rpo: "0", impact: "Critical", score: 98 },
                      ].map((item, i) => (
                        <Card key={i} className="bg-background/50 border-border/50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-10 rounded-full ${
                                  item.impact === "Critical" ? "bg-red-500" : "bg-amber-500"
                                }`} />
                                <div>
                                  <p className="font-medium">{item.service}</p>
                                  <p className="text-xs text-muted-foreground">
                                    RTO: {item.rto} | RPO: {item.rpo}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge className={item.impact === "Critical" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}>
                                  {item.impact}
                                </Badge>
                                <div className="text-right">
                                  <p className="text-sm font-medium">{item.score}%</p>
                                  <p className="text-xs text-muted-foreground">Impact Score</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card className="bg-amber-500/5 border-amber-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-amber-400">AI Risk Assessment</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Payment Processing has an aggressive 2h RTO. Based on your infrastructure, 
                              AI recommends considering a 3h target to ensure realistic recovery capabilities.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {wizardStep === 5 && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-indigo-500/10">
                        <Target className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">Recovery Strategy</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Define your BC/DR strategies for each critical service
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { name: "Active-Active", desc: "Zero downtime, highest cost", icon: Zap, recommended: true },
                        { name: "Active-Passive", desc: "Fast failover, moderate cost", icon: RefreshCw, recommended: false },
                        { name: "Warm Standby", desc: "Hours recovery, lower cost", icon: Timer, recommended: false },
                        { name: "Cold Standby", desc: "Days recovery, lowest cost", icon: Cloud, recommended: false },
                      ].map((strategy, i) => (
                        <Card 
                          key={i} 
                          className={`bg-background/50 cursor-pointer transition-all hover:border-purple-500/50 ${
                            strategy.recommended ? "border-purple-500/30 ring-1 ring-purple-500/20" : "border-border/50"
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                  strategy.recommended ? "bg-purple-500/10" : "bg-muted/50"
                                }`}>
                                  <strategy.icon className={`w-5 h-5 ${
                                    strategy.recommended ? "text-purple-400" : "text-muted-foreground"
                                  }`} />
                                </div>
                                <div>
                                  <p className="font-medium">{strategy.name}</p>
                                  <p className="text-xs text-muted-foreground">{strategy.desc}</p>
                                </div>
                              </div>
                              {strategy.recommended && (
                                <Badge className="bg-purple-500/20 text-purple-400">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  AI Pick
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card className="bg-indigo-500/5 border-indigo-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Brain className="w-5 h-5 text-indigo-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-indigo-400">AI Strategy Recommendation</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Based on your RTO requirements and budget considerations, AI recommends Active-Active 
                              for Payment Processing and Active-Passive for other Tier 1 services.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {wizardStep === 6 && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-teal-500/10">
                        <Users className="w-6 h-6 text-teal-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">Plans & Recovery Teams</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Set up recovery teams and generate your BC/DR plans
                        </p>
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                      <Card className="bg-background/50 border-border/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Users className="w-4 h-4 text-teal-400" />
                            Recovery Teams
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {[
                            { name: "Crisis Management Team", members: 5 },
                            { name: "IT Recovery Team", members: 8 },
                            { name: "Business Recovery Team", members: 6 },
                            { name: "Communications Team", members: 3 },
                          ].map((team, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                              <span className="text-sm">{team.name}</span>
                              <Badge variant="outline" className="text-xs">{team.members} members</Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card className="bg-background/50 border-border/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-400" />
                            Generated Plans
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {[
                            { name: "Business Continuity Plan", status: "Draft" },
                            { name: "Disaster Recovery Plan", status: "Draft" },
                            { name: "Crisis Communication Plan", status: "Draft" },
                            { name: "IT Recovery Runbook", status: "Draft" },
                          ].map((plan, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                              <span className="text-sm">{plan.name}</span>
                              <Badge variant="outline" className="text-xs text-amber-400 border-amber-400/30">{plan.status}</Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                              <Rocket className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-lg">Ready to Launch Your BCM Program!</p>
                              <p className="text-sm text-muted-foreground">
                                AI has prepared all your plans and configurations. Click to finalize and activate.
                              </p>
                            </div>
                          </div>
                          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white" data-testid="button-finalize-wizard">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Finalize Setup
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              {/* Wizard Navigation */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/50">
                <Button 
                  variant="outline" 
                  onClick={() => setWizardStep(Math.max(1, wizardStep - 1))}
                  disabled={wizardStep === 1}
                  data-testid="button-wizard-prev"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5, 6].map((step) => (
                    <button
                      key={step}
                      onClick={() => setWizardStep(step)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        wizardStep === step 
                          ? "w-6 bg-gradient-to-r from-purple-500 to-pink-500" 
                          : wizardStep > step 
                          ? "bg-green-500" 
                          : "bg-muted"
                      }`}
                      data-testid={`wizard-dot-${step}`}
                    />
                  ))}
                </div>
                <Button 
                  onClick={() => setWizardStep(Math.min(6, wizardStep + 1))}
                  disabled={wizardStep === 6}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  data-testid="button-wizard-next"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sample Documents & Templates */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-purple-400" />
                  Sample BCM Documents
                </CardTitle>
                <CardDescription>Pre-built templates to accelerate your BCM program</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Business Continuity Policy Template", type: "Policy", icon: FileText },
                  { name: "BIA Questionnaire", type: "Form", icon: ClipboardCheck },
                  { name: "DR Test Scenario Template", type: "Template", icon: Target },
                  { name: "Crisis Communication Checklist", type: "Checklist", icon: CheckCircle2 },
                  { name: "Vendor Risk Assessment Form", type: "Form", icon: Package },
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50 hover:border-purple-500/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <doc.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{doc.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                      <Download className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-blue-400" />
                  Sample Workflows
                </CardTitle>
                <CardDescription>Industry-standard BCM workflow templates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Incident Response Workflow", steps: 8, status: "Active" },
                  { name: "Crisis Escalation Procedure", steps: 5, status: "Active" },
                  { name: "DR Activation Checklist", steps: 12, status: "Active" },
                  { name: "Recovery Team Notification", steps: 6, status: "Active" },
                  { name: "Post-Incident Review", steps: 7, status: "Active" },
                ].map((workflow, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50 hover:border-blue-500/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <GitBranch className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="text-sm font-medium">{workflow.name}</span>
                        <p className="text-xs text-muted-foreground">{workflow.steps} steps</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 text-xs">{workflow.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Business Service</DialogTitle>
            <DialogDescription>
              Register a new business service for BCM planning
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service-code">Service Code</Label>
                <Input id="service-code" placeholder="SVC-001" data-testid="input-service-code" />
              </div>
              <div>
                <Label htmlFor="service-name">Service Name</Label>
                <Input id="service-name" placeholder="Payment Processing" data-testid="input-service-name" />
              </div>
            </div>
            <div>
              <Label htmlFor="service-description">Description</Label>
              <Textarea id="service-description" placeholder="Describe the business service..." data-testid="input-service-description" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="service-tier">Service Tier</Label>
                <Select>
                  <SelectTrigger data-testid="select-service-tier">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tier_0">Tier 0 - Mission Critical</SelectItem>
                    <SelectItem value="tier_1">Tier 1 - Business Critical</SelectItem>
                    <SelectItem value="tier_2">Tier 2 - Important</SelectItem>
                    <SelectItem value="tier_3">Tier 3 - Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rto">RTO (minutes)</Label>
                <Input id="rto" type="number" placeholder="60" data-testid="input-rto" />
              </div>
              <div>
                <Label htmlFor="rpo">RPO (minutes)</Label>
                <Input id="rpo" type="number" placeholder="30" data-testid="input-rpo" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Input id="department" placeholder="Finance" data-testid="input-department" />
              </div>
              <div>
                <Label htmlFor="owner">Service Owner</Label>
                <Input id="owner" placeholder="John Smith" data-testid="input-owner" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowServiceDialog(false)} data-testid="button-cancel-service">Cancel</Button>
            <Button data-testid="button-save-service">Save Service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showIncidentDialog} onOpenChange={setShowIncidentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertOctagon className="w-5 h-5" />
              Declare BCM Incident
            </DialogTitle>
            <DialogDescription>
              Initiate BCM activation workflow for a business disruption
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="incident-title">Incident Title</Label>
                <Input id="incident-title" placeholder="Data Center Outage" data-testid="input-incident-title" />
              </div>
              <div>
                <Label htmlFor="incident-severity">Severity</Label>
                <Select>
                  <SelectTrigger data-testid="select-incident-severity">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="informational">Informational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="incident-description">Description</Label>
              <Textarea id="incident-description" placeholder="Describe the incident and its impact..." data-testid="input-incident-description" />
            </div>
            <div>
              <Label htmlFor="incident-category">Category</Label>
              <Select>
                <SelectTrigger data-testid="select-incident-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="cyber">Cyber Attack</SelectItem>
                  <SelectItem value="natural_disaster">Natural Disaster</SelectItem>
                  <SelectItem value="vendor">Vendor Failure</SelectItem>
                  <SelectItem value="pandemic">Pandemic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIncidentDialog(false)} data-testid="button-cancel-incident">Cancel</Button>
            <Button variant="destructive" data-testid="button-declare-incident-confirm">
              <AlertOctagon className="w-4 h-4 mr-2" />
              Declare Incident
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
