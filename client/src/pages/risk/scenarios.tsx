import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Shield,
  Target,
  Zap,
  Clock,
  DollarSign,
  Activity,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Server,
  Database,
  Users,
  Building2,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTenant } from "@/contexts/tenant-context";
import type { RiskScenario } from "@shared/schema";

const scenarioTypes = [
  { value: "ransomware", label: "Ransomware Attack", icon: Zap },
  { value: "data_breach", label: "Data Breach", icon: Database },
  { value: "system_failure", label: "System Failure", icon: Server },
  { value: "natural_disaster", label: "Natural Disaster", icon: AlertTriangle },
  { value: "vendor_failure", label: "Vendor Failure", icon: Building2 },
  { value: "insider_threat", label: "Insider Threat", icon: Users },
];

const velocityOptions = [
  { value: "rapid", label: "Rapid (Hours)", color: "bg-destructive" },
  { value: "moderate", label: "Moderate (Days)", color: "bg-chart-3" },
  { value: "slow", label: "Slow (Weeks+)", color: "bg-chart-2" },
];

const riskLevelStyles = {
  critical: { bg: "bg-destructive", text: "text-white", border: "border-destructive" },
  high: { bg: "bg-chart-3", text: "text-white", border: "border-chart-3" },
  medium: { bg: "bg-chart-1", text: "text-white", border: "border-chart-1" },
  low: { bg: "bg-chart-2", text: "text-white", border: "border-chart-2" },
};

function getRiskLevel(likelihood: number, impact: number): string {
  const score = likelihood * impact;
  if (score >= 16) return "critical";
  if (score >= 9) return "high";
  if (score >= 4) return "medium";
  return "low";
}

const scenarioFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  scenarioType: z.string().min(1, "Scenario type is required"),
  trigger: z.string().optional(),
  threatActor: z.string().optional(),
  attackVector: z.string().optional(),
  likelihood: z.number().min(1).max(5),
  impact: z.number().min(1).max(5),
  velocity: z.string().optional(),
  financialImpactMin: z.number().optional(),
  financialImpactMax: z.number().optional(),
  estimatedDowntimeHours: z.number().optional(),
  rtoHours: z.number().optional(),
  rpoHours: z.number().optional(),
  recoveryStrategy: z.string().optional(),
});

type ScenarioFormValues = z.infer<typeof scenarioFormSchema>;

function ScenarioCard({ scenario, onView, onEdit }: { scenario: RiskScenario; onView: () => void; onEdit: () => void }) {
  const likelihood = scenario.likelihood || 3;
  const impact = scenario.impact || 3;
  const riskLevel = getRiskLevel(likelihood, impact);
  const riskScore = likelihood * impact;
  const style = riskLevelStyles[riskLevel as keyof typeof riskLevelStyles];
  
  const typeConfig = scenarioTypes.find(t => t.value === scenario.scenarioType);
  const TypeIcon = typeConfig?.icon || AlertTriangle;

  return (
    <Card className="card-3d hover-elevate cursor-pointer" data-testid={`scenario-card-${scenario.id}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <TypeIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{scenario.name}</h3>
              <p className="text-xs text-muted-foreground capitalize">{scenario.scenarioType?.replace("_", " ")}</p>
            </div>
          </div>
          <Badge className={`${style.bg} ${style.text} border-0 capitalize`}>
            {riskLevel}
          </Badge>
        </div>

        {scenario.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{scenario.description}</p>
        )}

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold">{likelihood}</p>
            <p className="text-xs text-muted-foreground">Likelihood</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold">{impact}</p>
            <p className="text-xs text-muted-foreground">Impact</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold">{riskScore}</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {scenario.estimatedDowntimeHours && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Estimated Downtime
              </span>
              <span className="font-medium">{scenario.estimatedDowntimeHours}h</span>
            </div>
          )}
          {scenario.financialImpactMax && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" /> Max Financial Impact
              </span>
              <span className="font-medium">${(scenario.financialImpactMax / 1000000).toFixed(1)}M</span>
            </div>
          )}
          {scenario.velocity && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" /> Velocity
              </span>
              <Badge variant="outline" className="capitalize">{scenario.velocity}</Badge>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-3 border-t border-border">
          <Button variant="outline" size="sm" className="flex-1" onClick={onView} data-testid={`view-scenario-${scenario.id}`}>
            <Eye className="h-4 w-4 mr-1.5" /> View
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={onEdit} data-testid={`edit-scenario-${scenario.id}`}>
            <Edit className="h-4 w-4 mr-1.5" /> Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ScenarioStats({ scenarios }: { scenarios: RiskScenario[] }) {
  const stats = useMemo(() => {
    const byType: Record<string, number> = {};
    let totalRiskScore = 0;
    let criticalCount = 0;
    let highCount = 0;
    
    scenarios.forEach(s => {
      const type = s.scenarioType || "other";
      byType[type] = (byType[type] || 0) + 1;
      
      const score = (s.likelihood || 3) * (s.impact || 3);
      totalRiskScore += score;
      
      if (score >= 16) criticalCount++;
      else if (score >= 9) highCount++;
    });
    
    return {
      total: scenarios.length,
      avgScore: scenarios.length > 0 ? Math.round(totalRiskScore / scenarios.length) : 0,
      critical: criticalCount,
      high: highCount,
      byType,
    };
  }, [scenarios]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="card-3d">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Scenarios</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="card-3d">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.critical}</p>
              <p className="text-xs text-muted-foreground">Critical Scenarios</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="card-3d">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-chart-3/10">
              <Target className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.high}</p>
              <p className="text-xs text-muted-foreground">High Risk Scenarios</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="card-3d">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-chart-2/10">
              <BarChart3 className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgScore}</p>
              <p className="text-xs text-muted-foreground">Avg Risk Score</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RiskScenariosPage() {
  const { toast } = useToast();
  const { currentTenantId } = useTenant();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<RiskScenario | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const { data: scenarios = [], isLoading } = useQuery<RiskScenario[]>({
    queryKey: ["/api/risk-scenarios", currentTenantId],
  });

  const createMutation = useMutation({
    mutationFn: async (data: ScenarioFormValues) => {
      const inherentScore = data.likelihood * data.impact;
      return apiRequest("POST", "/api/risk-scenarios", {
        ...data,
        tenantId: currentTenantId,
        inherentRiskScore: inherentScore,
        residualRiskScore: Math.round(inherentScore * 0.6),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risk-scenarios"] });
      setIsCreateOpen(false);
      toast({ title: "Scenario created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create scenario", description: error.message, variant: "destructive" });
    },
  });

  const form = useForm<ScenarioFormValues>({
    resolver: zodResolver(scenarioFormSchema),
    defaultValues: {
      name: "",
      description: "",
      scenarioType: "",
      trigger: "",
      threatActor: "",
      attackVector: "",
      likelihood: 3,
      impact: 3,
      velocity: "moderate",
      recoveryStrategy: "",
    },
  });

  const filteredScenarios = useMemo(() => {
    return scenarios.filter(s => {
      const matchesSearch = !searchQuery || 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === "all" || s.scenarioType === selectedType;
      return matchesSearch && matchesType;
    });
  }, [scenarios, searchQuery, selectedType]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Risk Scenarios</h1>
          <p className="text-muted-foreground">Model and analyze risk scenarios with impact paths and recovery assumptions</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="btn-gradient" data-testid="button-create-scenario">
          <Plus className="h-4 w-4 mr-2" /> New Scenario
        </Button>
      </div>

      <ScenarioStats scenarios={scenarios} />

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scenarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-scenarios"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48" data-testid="select-scenario-type">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {scenarioTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredScenarios.length === 0 ? (
        <Card className="card-3d">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Scenarios Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedType !== "all" 
                ? "No scenarios match your search criteria" 
                : "Create your first risk scenario to get started"}
            </p>
            <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first-scenario">
              <Plus className="h-4 w-4 mr-2" /> Create Scenario
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScenarios.map(scenario => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onView={() => { setSelectedScenario(scenario); setIsViewOpen(true); }}
              onEdit={() => { setSelectedScenario(scenario); setIsCreateOpen(true); }}
            />
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedScenario ? "Edit" : "Create"} Risk Scenario</DialogTitle>
            <DialogDescription>
              Model a risk scenario with trigger, impact path, and recovery assumptions
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scenario Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Ransomware on SAP ECC" {...field} data-testid="input-scenario-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scenarioType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scenario Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-scenario-type-form">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {scenarioTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the scenario in detail..." {...field} data-testid="input-scenario-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="trigger"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trigger Event</FormLabel>
                      <FormControl>
                        <Input placeholder="What initiates this scenario?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="threatActor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Threat Actor</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select actor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="external">External Attacker</SelectItem>
                          <SelectItem value="internal">Insider Threat</SelectItem>
                          <SelectItem value="natural">Natural Event</SelectItem>
                          <SelectItem value="accidental">Accidental</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="likelihood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Likelihood (1-5)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={5} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="impact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Impact (1-5)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={5} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="velocity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Velocity</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select velocity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {velocityOptions.map(v => (
                            <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="financialImpactMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Financial Impact ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100000" {...field} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="financialImpactMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Financial Impact ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5000000" {...field} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="estimatedDowntimeHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Downtime (Hours)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="72" {...field} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rtoHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RTO (Hours)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="24" {...field} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rpoHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RPO (Hours)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="4" {...field} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="recoveryStrategy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recovery Strategy</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the recovery approach..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-scenario">
                  {createMutation.isPending ? "Creating..." : "Create Scenario"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedScenario?.name}</DialogTitle>
            <DialogDescription className="capitalize">{selectedScenario?.scenarioType?.replace("_", " ")}</DialogDescription>
          </DialogHeader>
          {selectedScenario && (
            <div className="space-y-4">
              <p className="text-muted-foreground">{selectedScenario.description}</p>
              
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{selectedScenario.likelihood || 3}</p>
                    <p className="text-xs text-muted-foreground">Likelihood</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{selectedScenario.impact || 3}</p>
                    <p className="text-xs text-muted-foreground">Impact</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{(selectedScenario.likelihood || 3) * (selectedScenario.impact || 3)}</p>
                    <p className="text-xs text-muted-foreground">Risk Score</p>
                  </CardContent>
                </Card>
              </div>

              {selectedScenario.trigger && (
                <div>
                  <h4 className="font-semibold mb-1">Trigger</h4>
                  <p className="text-sm text-muted-foreground">{selectedScenario.trigger}</p>
                </div>
              )}

              {selectedScenario.recoveryStrategy && (
                <div>
                  <h4 className="font-semibold mb-1">Recovery Strategy</h4>
                  <p className="text-sm text-muted-foreground">{selectedScenario.recoveryStrategy}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                {selectedScenario.estimatedDowntimeHours && (
                  <div>
                    <p className="text-sm text-muted-foreground">Downtime</p>
                    <p className="font-semibold">{selectedScenario.estimatedDowntimeHours} hours</p>
                  </div>
                )}
                {selectedScenario.rtoHours && (
                  <div>
                    <p className="text-sm text-muted-foreground">RTO</p>
                    <p className="font-semibold">{selectedScenario.rtoHours} hours</p>
                  </div>
                )}
                {selectedScenario.rpoHours && (
                  <div>
                    <p className="text-sm text-muted-foreground">RPO</p>
                    <p className="font-semibold">{selectedScenario.rpoHours} hours</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
