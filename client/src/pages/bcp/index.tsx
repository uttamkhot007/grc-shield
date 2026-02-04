import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { 
  Shield, FileText, Clock, CheckCircle2, AlertTriangle, 
  Calendar, Play, Plus, Settings, BarChart3, Users,
  Building, Server, Database, Globe, RefreshCw, FolderOpen,
  Brain, Sparkles, Lightbulb, TrendingUp, Target, BookOpen,
  AlertCircle, Zap, Layers, Info
} from "lucide-react";
import { useTenant } from "@/contexts/tenant-context";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { 
  BcpPlan, BcpTest, BcpPlanCatalogItem, BcpTestTemplate,
  AiTip, PlanSection, TestParticipant, TestScenario, TestSituation, EvaluationCriterion
} from "@shared/schema";

export default function BCPPage() {
  const { currentTenantId } = useTenant();
  const { toast } = useToast();
  const [selectedPlanTemplate, setSelectedPlanTemplate] = useState<BcpPlanCatalogItem | null>(null);
  const [selectedTestTemplate, setSelectedTestTemplate] = useState<BcpTestTemplate | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<BcpPlan | null>(null);
  const [planName, setPlanName] = useState("");
  const [planOwner, setPlanOwner] = useState("");
  const [testDate, setTestDate] = useState("");
  const [isEnriching, setIsEnriching] = useState(false);
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [sectionContent, setSectionContent] = useState("");

  const { data: bcpPlans = [], isLoading: plansLoading } = useQuery<BcpPlan[]>({
    queryKey: ["/api/bcp/plans", currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return [];
      const res = await fetch(`/api/bcp/plans?tenantId=${currentTenantId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch plans");
      return res.json();
    },
    enabled: !!currentTenantId,
  });

  const { data: bcpTests = [], isLoading: testsLoading } = useQuery<BcpTest[]>({
    queryKey: ["/api/bcp/tests", currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return [];
      const res = await fetch(`/api/bcp/tests?tenantId=${currentTenantId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tests");
      return res.json();
    },
    enabled: !!currentTenantId,
  });

  const { data: planCatalog = [], isLoading: catalogLoading } = useQuery<BcpPlanCatalogItem[]>({
    queryKey: ["/api/bcp/plan-catalog"],
  });

  const { data: testTemplates = [], isLoading: templatesLoading } = useQuery<BcpTestTemplate[]>({
    queryKey: ["/api/bcp/test-templates"],
  });

  const createPlanMutation = useMutation({
    mutationFn: async (data: { templateId: string; name: string; owner: string }) => {
      if (!currentTenantId) throw new Error("No tenant selected");
      const response = await apiRequest("POST", "/api/bcp/plans", {
        tenantId: currentTenantId,
        templateId: data.templateId,
        name: data.name,
        owner: data.owner,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bcp/plans", currentTenantId] });
      toast({ title: "Plan Created", description: "Your BCP plan has been created successfully." });
      setSelectedPlanTemplate(null);
      setPlanName("");
      setPlanOwner("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create plan. Please try again.", variant: "destructive" });
    },
  });

  const scheduleTestMutation = useMutation({
    mutationFn: async (data: { templateId: string; scheduledDate: string }) => {
      if (!currentTenantId) throw new Error("No tenant selected");
      const response = await apiRequest("POST", "/api/bcp/tests", {
        tenantId: currentTenantId,
        templateId: data.templateId,
        scheduledDate: data.scheduledDate,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bcp/tests", currentTenantId] });
      toast({ title: "Test Scheduled", description: "Your BCP test has been scheduled successfully." });
      setSelectedTestTemplate(null);
      setTestDate("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to schedule test. Please try again.", variant: "destructive" });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async (data: { planId: string; sections: PlanSection[] }) => {
      const response = await apiRequest("PATCH", `/api/bcp/plans/${data.planId}`, {
        sections: data.sections,
      });
      return response.json();
    },
    onSuccess: (updatedPlan) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bcp/plans", currentTenantId] });
      setSelectedPlan(updatedPlan);
      toast({ title: "Plan Updated", description: "Your BCP plan has been updated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update plan. Please try again.", variant: "destructive" });
    },
  });

  const aiEnrichPlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      setIsEnriching(true);
      const response = await apiRequest("POST", `/api/bcp/plans/${planId}/ai-enrich`, {});
      return response.json();
    },
    onSuccess: (enrichedPlan) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bcp/plans", currentTenantId] });
      setSelectedPlan(enrichedPlan);
      setIsEnriching(false);
      toast({ title: "AI Enrichment Complete", description: "Your plan has been enhanced with AI-generated content." });
    },
    onError: () => {
      setIsEnriching(false);
      toast({ title: "Enrichment Failed", description: "Failed to enrich plan with AI. Please try again.", variant: "destructive" });
    },
  });

  const handleSaveSection = (sectionIndex: number) => {
    if (!selectedPlan) return;
    const sections = (selectedPlan.sections as PlanSection[]) || [];
    const updatedSections = sections.map((section, idx) => 
      idx === sectionIndex ? { ...section, content: sectionContent } : section
    );
    updatePlanMutation.mutate({ planId: selectedPlan.id, sections: updatedSections });
    setEditingSection(null);
    setSectionContent("");
  };

  const handleCreatePlan = () => {
    if (!selectedPlanTemplate) return;
    createPlanMutation.mutate({
      templateId: selectedPlanTemplate.id,
      name: planName || selectedPlanTemplate.name,
      owner: planOwner || "Unassigned",
    });
  };

  const handleScheduleTest = () => {
    if (!selectedTestTemplate) return;
    scheduleTestMutation.mutate({
      templateId: selectedTestTemplate.id,
      scheduledDate: testDate || new Date().toISOString(),
    });
  };

  const getCriticalityColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-red-500/20 text-red-400";
      case "high": return "bg-orange-500/20 text-orange-400";
      case "medium": return "bg-amber-500/20 text-amber-400";
      case "low": return "bg-green-500/20 text-green-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "advanced": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "intermediate": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "beginner": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getTestTypeIcon = (type: string) => {
    switch (type) {
      case "tabletop": return BookOpen;
      case "walkthrough": return Layers;
      case "simulation": return Zap;
      case "full_interruption": return AlertCircle;
      default: return Play;
    }
  };

  const getPlanTypeIcon = (type: string) => {
    switch (type) {
      case "disaster_recovery": return Server;
      case "pandemic": return Users;
      case "cyber": return Shield;
      case "crisis": return AlertTriangle;
      case "continuity": return RefreshCw;
      default: return FileText;
    }
  };

  const approvedCount = bcpPlans.filter(p => p.status === "approved").length;
  const completedTestsCount = bcpTests.filter(t => t.status === "completed").length;

  const EmptyState = ({ title, description, icon: Icon }: { title: string; description: string; icon: any }) => (
    <Card className="glass-card">
      <CardContent className="p-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          <Icon className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
        <Button data-testid="button-get-started">
          <Plus className="w-4 h-4 mr-2" />
          Get Started
        </Button>
      </CardContent>
    </Card>
  );

  const AiTipsPanel = ({ tips }: { tips: AiTip[] }) => (
    <Card className="glass-card border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10" data-testid="ai-tips-panel">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <CardTitle className="text-base font-semibold">AI Tips & Insights</CardTitle>
          <Badge variant="secondary" className="bg-primary/20 border-0">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {tips?.map((tip, index) => {
          const Icon = tip.type === 'tip' ? Lightbulb : tip.type === 'insight' ? TrendingUp : Target;
          const colors = tip.type === 'tip' 
            ? "bg-amber-500/20 text-amber-400" 
            : tip.type === 'insight' 
              ? "bg-blue-500/20 text-blue-400" 
              : "bg-purple-500/20 text-purple-400";
          return (
            <div key={index} className="p-3 rounded-lg bg-background/50 border border-border/50">
              <div className="flex items-start gap-2">
                <div className={`p-1.5 rounded ${colors}`}>
                  <Icon className="h-3 w-3" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{tip.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{tip.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Business Continuity
          </h1>
          <p className="text-muted-foreground mt-1">
            BCP/DR planning, testing and business impact analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-schedule-test">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Test
          </Button>
          <Button data-testid="button-new-plan">
            <Plus className="w-4 h-4 mr-2" />
            New Plan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{bcpPlans.length}</p>
              <p className="text-sm text-muted-foreground">BCP Plans</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/20">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{approvedCount}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <FolderOpen className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{planCatalog.length}</p>
              <p className="text-sm text-muted-foreground">Plan Templates</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-500/20">
              <Play className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedTestsCount}</p>
              <p className="text-sm text-muted-foreground">Tests Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-cyan-500/20">
              <Layers className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{testTemplates.length}</p>
              <p className="text-sm text-muted-foreground">Test Workflows</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList className="glass-card">
          <TabsTrigger value="catalog" data-testid="tab-catalog">
            <FolderOpen className="w-4 h-4 mr-2" />
            Plan Catalog ({planCatalog.length})
          </TabsTrigger>
          <TabsTrigger value="test-workflows" data-testid="tab-test-workflows">
            <Layers className="w-4 h-4 mr-2" />
            Test Workflows ({testTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="plans" data-testid="tab-plans">
            <FileText className="w-4 h-4 mr-2" />
            My Plans ({bcpPlans.length})
          </TabsTrigger>
          <TabsTrigger value="bia" data-testid="tab-bia">
            <BarChart3 className="w-4 h-4 mr-2" />
            Business Impact Analysis
          </TabsTrigger>
          <TabsTrigger value="tests" data-testid="tab-tests">
            <Play className="w-4 h-4 mr-2" />
            My Tests ({bcpTests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">BC/DR Plan Templates</h2>
              <p className="text-sm text-muted-foreground">Select a template to create your business continuity or disaster recovery plan</p>
            </div>
          </div>
          
          {catalogLoading ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading plan templates...
              </CardContent>
            </Card>
          ) : planCatalog.length === 0 ? (
            <EmptyState 
              title="No Plan Templates Available"
              description="Plan templates will be available soon to help you create comprehensive BC/DR plans."
              icon={FolderOpen}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {planCatalog.map((template) => {
                const Icon = getPlanTypeIcon(template.planType || '');
                const aiTips = (template.aiTips as AiTip[]) || [];
                return (
                  <Card 
                    key={template.id} 
                    className="glass-card hover-elevate cursor-pointer transition-all"
                    onClick={() => setSelectedPlanTemplate(template)}
                    data-testid={`plan-template-${template.code}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="p-2 rounded-lg bg-primary/20">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        {template.aiEnriched && (
                          <Badge variant="secondary" className="bg-primary/20 border-0">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI-Enriched
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base mt-2">{template.name}</CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">{template.category}</Badge>
                        {template.rtoGuidance && (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            RTO Guidance
                          </Badge>
                        )}
                      </div>
                      {aiTips.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Brain className="h-3 w-3 text-primary" />
                          <span>{aiTips.length} AI tips available</span>
                        </div>
                      )}
                      <Button className="w-full" size="sm" data-testid={`button-use-template-${template.code}`}>
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="test-workflows" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">BC/DR Test Workflows</h2>
              <p className="text-sm text-muted-foreground">Choose a test type and scenario to validate your business continuity plans</p>
            </div>
          </div>
          
          {templatesLoading ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading test templates...
              </CardContent>
            </Card>
          ) : testTemplates.length === 0 ? (
            <EmptyState 
              title="No Test Workflows Available"
              description="Test workflow templates will be available soon to help you validate your BC/DR plans."
              icon={Layers}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {testTemplates.map((template) => {
                const Icon = getTestTypeIcon(template.testType);
                const scenarios = (template.scenarios as TestScenario[]) || [];
                const situations = (template.situations as TestSituation[]) || [];
                const aiTips = (template.aiTips as AiTip[]) || [];
                return (
                  <Card 
                    key={template.id} 
                    className="glass-card hover-elevate cursor-pointer transition-all"
                    onClick={() => setSelectedTestTemplate(template)}
                    data-testid={`test-template-${template.code}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-amber-500/20">
                            <Icon className="w-5 h-5 text-amber-400" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={`text-xs ${getDifficultyColor(template.difficulty || '')}`}>
                                {template.difficulty}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {template.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {scenarios.length} scenarios
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {situations.length} situations
                        </span>
                        {aiTips.length > 0 && (
                          <span className="flex items-center gap-1 text-primary">
                            <Brain className="h-3 w-3" />
                            AI tips
                          </span>
                        )}
                      </div>
                      <Button className="w-full" size="sm" data-testid={`button-start-test-${template.code}`}>
                        <Play className="w-4 h-4 mr-2" />
                        Start Test
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          {plansLoading ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading BCP plans...
              </CardContent>
            </Card>
          ) : bcpPlans.length === 0 ? (
            <EmptyState 
              title="No BCP Plans Yet"
              description="Create your first Business Continuity Plan to ensure your organization can maintain operations during disruptions. Start by selecting a template from the Plan Catalog."
              icon={FileText}
            />
          ) : (
            <div className="grid gap-4">
              {bcpPlans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className="glass-card cursor-pointer hover-elevate transition-all"
                  onClick={() => setSelectedPlan(plan)}
                  data-testid={`card-plan-${plan.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-primary/20">
                          <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{plan.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Version {plan.version} • Owner: {plan.owner}
                          </p>
                          {plan.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{plan.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground text-right">
                          <p>Last Review: {plan.lastReviewDate ? new Date(plan.lastReviewDate).toLocaleDateString() : 'N/A'}</p>
                          <p>Next Review: {plan.nextReviewDate ? new Date(plan.nextReviewDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <Badge variant={plan.status === "approved" ? "default" : "secondary"}>
                          {plan.status}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlan(plan);
                          }}
                          data-testid={`button-view-plan-${plan.id}`}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bia" className="space-y-4">
          <EmptyState 
            title="No Business Impact Analysis Yet"
            description="Conduct a Business Impact Analysis to identify critical processes, their recovery objectives, and maximum tolerable downtime."
            icon={BarChart3}
          />
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">BCP Testing Schedule</h2>
            <Button data-testid="button-schedule-new-test">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Test
            </Button>
          </div>
          {testsLoading ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading tests...
              </CardContent>
            </Card>
          ) : bcpTests.length === 0 ? (
            <EmptyState 
              title="No Tests Scheduled"
              description="Schedule tabletop exercises, walkthroughs, simulations, or full tests to validate your BCP plans. Choose from Test Workflows to get started."
              icon={Play}
            />
          ) : (
            <div className="grid gap-4">
              {bcpTests.map((test) => (
                <Card key={test.id} className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${test.status === "completed" ? "bg-green-500/20" : "bg-amber-500/20"}`}>
                          {test.status === "completed" ? (
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                          ) : (
                            <Calendar className="w-6 h-6 text-amber-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{test.testType}</h3>
                          <p className="text-sm text-muted-foreground">
                            Date: {test.scheduledDate ? new Date(test.scheduledDate).toLocaleDateString() : 'TBD'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={test.status === "completed" ? "default" : "secondary"}>
                          {test.status}
                        </Badge>
                        {test.status === "pending" && (
                          <Button size="sm">
                            <Play className="w-4 h-4 mr-2" />
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Plan Template Detail Dialog */}
      <Dialog open={!!selectedPlanTemplate} onOpenChange={() => setSelectedPlanTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedPlanTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    {(() => {
                      const Icon = getPlanTypeIcon(selectedPlanTemplate.planType || '');
                      return <Icon className="w-5 h-5 text-primary" />;
                    })()}
                  </div>
                  <div>
                    <DialogTitle>{selectedPlanTemplate.name}</DialogTitle>
                    <DialogDescription>{selectedPlanTemplate.category}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-6 pr-4">
                  <div>
                    <p className="text-muted-foreground">{selectedPlanTemplate.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/30 border">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        RTO Guidance
                      </h4>
                      <p className="text-sm text-muted-foreground">{selectedPlanTemplate.rtoGuidance || 'Not specified'}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        RPO Guidance
                      </h4>
                      <p className="text-sm text-muted-foreground">{selectedPlanTemplate.rpoGuidance || 'Not specified'}</p>
                    </div>
                  </div>

                  {selectedPlanTemplate.sections && (selectedPlanTemplate.sections as PlanSection[]).length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Plan Sections</h4>
                      <div className="grid gap-2">
                        {(selectedPlanTemplate.sections as PlanSection[]).map((section, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-muted/20 border flex items-start gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-medium">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-medium text-sm">{section.name}</p>
                              <p className="text-xs text-muted-foreground">{section.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPlanTemplate.checklistItems && (selectedPlanTemplate.checklistItems as string[]).length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Key Checklist Items</h4>
                      <div className="grid gap-1">
                        {(selectedPlanTemplate.checklistItems as string[]).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPlanTemplate.aiTips && (selectedPlanTemplate.aiTips as AiTip[]).length > 0 && (
                    <AiTipsPanel tips={selectedPlanTemplate.aiTips as AiTip[]} />
                  )}

                  {selectedPlanTemplate.applicableIndustries && (
                    <div>
                      <h4 className="font-semibold mb-2">Applicable Industries</h4>
                      <div className="flex flex-wrap gap-2">
                        {(selectedPlanTemplate.applicableIndustries as string[]).map((industry: string, idx: number) => (
                          <Badge key={idx} variant="outline">{industry}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4 mt-4 space-y-4">
                    <h4 className="font-semibold">Create Your Plan</h4>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="planName">Plan Name</Label>
                        <Input 
                          id="planName"
                          placeholder={selectedPlanTemplate.name}
                          value={planName}
                          onChange={(e) => setPlanName(e.target.value)}
                          data-testid="input-plan-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="planOwner">Plan Owner</Label>
                        <Input 
                          id="planOwner"
                          placeholder="Enter plan owner name"
                          value={planOwner}
                          onChange={(e) => setPlanOwner(e.target.value)}
                          data-testid="input-plan-owner"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setSelectedPlanTemplate(null)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreatePlan}
                      disabled={createPlanMutation.isPending}
                      data-testid="button-create-from-template"
                    >
                      {createPlanMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Create Plan from Template
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Test Template Detail Dialog */}
      <Dialog open={!!selectedTestTemplate} onOpenChange={() => setSelectedTestTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedTestTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    {(() => {
                      const Icon = getTestTypeIcon(selectedTestTemplate.testType);
                      return <Icon className="w-5 h-5 text-amber-400" />;
                    })()}
                  </div>
                  <div>
                    <DialogTitle>{selectedTestTemplate.name}</DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={getDifficultyColor(selectedTestTemplate.difficulty || '')}>
                        {selectedTestTemplate.difficulty}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {selectedTestTemplate.duration}
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-6 pr-4">
                  <div>
                    <p className="text-muted-foreground">{selectedTestTemplate.description}</p>
                  </div>

                  {selectedTestTemplate.participantsRequired && (selectedTestTemplate.participantsRequired as TestParticipant[]).length > 0 && (
                    <div data-testid="section-required-participants">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Required Participants
                      </h4>
                      <div className="grid gap-2">
                        {(selectedTestTemplate.participantsRequired as TestParticipant[]).map((participant, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-muted/20 border flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{participant.role}</p>
                              <p className="text-xs text-muted-foreground">{participant.description}</p>
                            </div>
                            <Badge variant={participant.required ? "default" : "secondary"}>
                              {participant.required ? "Required" : "Optional"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTestTemplate.scenarios && (selectedTestTemplate.scenarios as TestScenario[]).length > 0 && (
                    <div data-testid="section-test-scenarios">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Test Scenarios
                      </h4>
                      <div className="grid gap-3">
                        {(selectedTestTemplate.scenarios as TestScenario[]).map((scenario, idx) => (
                          <Card key={idx} className="p-4">
                            <h5 className="font-medium">{scenario.name}</h5>
                            <p className="text-sm text-muted-foreground mt-1">{scenario.description}</p>
                            {scenario.injects && scenario.injects.length > 0 && (
                              <div className="mt-3 space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Scenario Injects:</p>
                                {scenario.injects.slice(0, 3).map((inject, i) => (
                                  <div key={i} className="flex items-center gap-2 text-xs">
                                    <Badge variant="outline" className="text-[10px] px-1">{inject.time}</Badge>
                                    <span className="text-muted-foreground">{inject.event}</span>
                                  </div>
                                ))}
                                {scenario.injects.length > 3 && (
                                  <p className="text-xs text-muted-foreground">+{scenario.injects.length - 3} more injects</p>
                                )}
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTestTemplate.situations && (selectedTestTemplate.situations as TestSituation[]).length > 0 && (
                    <div data-testid="section-test-situations">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Test Situations
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(selectedTestTemplate.situations as TestSituation[]).map((situation, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-muted/30 border">
                            <p className="text-sm font-medium">{situation.type?.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-muted-foreground">{situation.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTestTemplate.objectives && (selectedTestTemplate.objectives as string[]).length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Test Objectives</h4>
                      <div className="grid gap-1">
                        {(selectedTestTemplate.objectives as string[]).map((obj, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span>{obj}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTestTemplate.aiTips && (selectedTestTemplate.aiTips as AiTip[]).length > 0 && (
                    <AiTipsPanel tips={selectedTestTemplate.aiTips as AiTip[]} />
                  )}

                  <div className="border-t pt-4 mt-4 space-y-4">
                    <h4 className="font-semibold">Schedule Your Test</h4>
                    <div className="space-y-2">
                      <Label htmlFor="testDate">Scheduled Date</Label>
                      <Input 
                        id="testDate"
                        type="datetime-local"
                        value={testDate}
                        onChange={(e) => setTestDate(e.target.value)}
                        data-testid="input-test-date"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setSelectedTestTemplate(null)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleScheduleTest}
                      disabled={scheduleTestMutation.isPending}
                      data-testid="button-schedule-from-template"
                    >
                      {scheduleTestMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Calendar className="w-4 h-4 mr-2" />
                      )}
                      Schedule This Test
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Plan Detail Dialog */}
      <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          {selectedPlan && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      {selectedPlan.name}
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedPlan.description || "Business Continuity Plan"}
                    </DialogDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedPlan.status === "approved" ? "default" : "secondary"}>
                      {selectedPlan.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => aiEnrichPlanMutation.mutate(selectedPlan.id)}
                      disabled={isEnriching}
                      data-testid="button-ai-enrich-plan"
                    >
                      {isEnriching ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      AI Enrich
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] pr-4">
                <div className="space-y-6 py-4">
                  {/* Plan Metadata */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-muted/30 border">
                      <p className="text-xs text-muted-foreground">Version</p>
                      <p className="font-medium">{selectedPlan.version || "1.0"}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border">
                      <p className="text-xs text-muted-foreground">Owner</p>
                      <p className="font-medium">{selectedPlan.owner || "Unassigned"}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border">
                      <p className="text-xs text-muted-foreground">Last Review</p>
                      <p className="font-medium">
                        {selectedPlan.lastReviewDate 
                          ? new Date(selectedPlan.lastReviewDate).toLocaleDateString() 
                          : "Not reviewed"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border">
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {selectedPlan.createdAt 
                          ? new Date(selectedPlan.createdAt).toLocaleDateString() 
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Plan Sections */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Plan Sections
                      </h4>
                    </div>
                    
                    {selectedPlan.sections && (selectedPlan.sections as PlanSection[]).length > 0 ? (
                      <div className="space-y-3">
                        {(selectedPlan.sections as PlanSection[]).map((section, idx) => (
                          <Card key={idx} className="border bg-card/50">
                            <CardHeader className="p-4 pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-medium">
                                    {idx + 1}
                                  </span>
                                  {section.name}
                                </CardTitle>
                                {editingSection === idx ? (
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => {
                                        setEditingSection(null);
                                        setSectionContent("");
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button 
                                      size="sm"
                                      onClick={() => handleSaveSection(idx)}
                                      disabled={updatePlanMutation.isPending}
                                    >
                                      {updatePlanMutation.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                                      Save
                                    </Button>
                                  </div>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingSection(idx);
                                      setSectionContent(section.content || "");
                                    }}
                                    data-testid={`button-edit-section-${idx}`}
                                  >
                                    <Settings className="w-3 h-3 mr-1" />
                                    Edit
                                  </Button>
                                )}
                              </div>
                              {section.description && (
                                <CardDescription className="ml-8">{section.description}</CardDescription>
                              )}
                            </CardHeader>
                            <CardContent className="p-4 pt-2 ml-8">
                              {editingSection === idx ? (
                                <textarea
                                  className="w-full min-h-[150px] p-3 rounded-lg border bg-background text-sm resize-y"
                                  value={sectionContent}
                                  onChange={(e) => setSectionContent(e.target.value)}
                                  placeholder={`Enter content for ${section.name}...`}
                                  data-testid={`textarea-section-${idx}`}
                                />
                              ) : (
                                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {section.content || (
                                    <p className="italic text-muted-foreground/50">
                                      No content yet. Click Edit to add content or use AI Enrich to auto-generate.
                                    </p>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="border bg-muted/20">
                        <CardContent className="p-6 text-center">
                          <FileText className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                          <p className="text-muted-foreground">No sections defined yet.</p>
                          <p className="text-sm text-muted-foreground/70 mt-1">
                            Click "AI Enrich" to automatically generate plan content.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* AI Tips if available */}
                  {selectedPlan.aiTips && (
                    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Brain className="w-4 h-4 text-purple-400" />
                          AI Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {((selectedPlan.aiTips as AiTip[]) || []).map((tip, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-background/50 border">
                              <p className="text-sm font-medium">{tip.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{tip.content}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
              <DialogFooter className="flex-row justify-between sm:justify-between">
                <Button variant="outline" onClick={() => setSelectedPlan(null)}>
                  Close
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => aiEnrichPlanMutation.mutate(selectedPlan.id)}
                    disabled={isEnriching}
                  >
                    {isEnriching ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4 mr-2" />
                    )}
                    Generate AI Content
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
