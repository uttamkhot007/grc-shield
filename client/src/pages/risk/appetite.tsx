import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Search,
  AlertTriangle,
  Shield,
  Target,
  Settings,
  CheckCircle2,
  XCircle,
  Bell,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  BarChart3,
  Gauge,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  FormDescription,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTenant } from "@/contexts/tenant-context";
import type { RiskAppetite, RiskAppetiteBreach, Risk } from "@shared/schema";

const categories = [
  { value: "strategic", label: "Strategic Risk", icon: Target },
  { value: "operational", label: "Operational Risk", icon: Settings },
  { value: "financial", label: "Financial Risk", icon: DollarSign },
  { value: "compliance", label: "Compliance Risk", icon: Shield },
  { value: "cyber", label: "Cyber Risk", icon: AlertTriangle },
  { value: "privacy", label: "Privacy Risk", icon: Eye },
];

const appetiteFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  category: z.string().min(1, "Category is required"),
  acceptableRiskScore: z.number().min(1).max(25),
  tolerableRiskScore: z.number().min(1).max(25),
  unacceptableThreshold: z.number().min(1).max(25),
  maxFinancialExposure: z.number().optional(),
  maxDowntimeHours: z.number().optional(),
  minComplianceScore: z.number().min(0).max(100).optional(),
  maxOpenFindings: z.number().optional(),
  autoEscalateOnBreach: z.boolean(),
});

type AppetiteFormValues = z.infer<typeof appetiteFormSchema>;

function AppetiteCard({ appetite, risks, onEdit }: { appetite: RiskAppetite; risks: Risk[]; onEdit: () => void }) {
  const categoryConfig = categories.find(c => c.value === appetite.category);
  const CategoryIcon = categoryConfig?.icon || Target;

  const categoryRisks = risks.filter(r => {
    const riskCategory = r.category?.toLowerCase() || "";
    return riskCategory.includes(appetite.category) || appetite.category.includes(riskCategory);
  });

  const currentHighestScore = categoryRisks.reduce((max, r) => Math.max(max, r.riskScore || 0), 0);
  const isBreached = currentHighestScore > (appetite.unacceptableThreshold || 16);
  const isInTolerance = currentHighestScore <= (appetite.tolerableRiskScore || 12);
  const isAcceptable = currentHighestScore <= (appetite.acceptableRiskScore || 6);

  let status = "acceptable";
  let statusColor = "bg-chart-2";
  if (isBreached) {
    status = "breached";
    statusColor = "bg-destructive";
  } else if (!isAcceptable && isInTolerance) {
    status = "tolerable";
    statusColor = "bg-chart-3";
  } else if (!isAcceptable) {
    status = "elevated";
    statusColor = "bg-chart-1";
  }

  return (
    <Card className="card-3d hover-elevate" data-testid={`appetite-card-${appetite.id}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${isBreached ? "bg-destructive/10" : "bg-primary/10"}`}>
              <CategoryIcon className={`h-5 w-5 ${isBreached ? "text-destructive" : "text-primary"}`} />
            </div>
            <div>
              <h3 className="font-semibold">{appetite.name}</h3>
              <p className="text-xs text-muted-foreground capitalize">{appetite.category} Risk</p>
            </div>
          </div>
          <Badge className={`${statusColor} text-white border-0 capitalize`}>
            {status}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Current Risk Level</span>
              <span className="font-medium">{currentHighestScore} / 25</span>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-chart-2 rounded-full"
                style={{ width: `${(appetite.acceptableRiskScore || 6) / 25 * 100}%` }}
              />
              <div 
                className="absolute top-0 h-full bg-chart-3"
                style={{ 
                  left: `${(appetite.acceptableRiskScore || 6) / 25 * 100}%`,
                  width: `${((appetite.tolerableRiskScore || 12) - (appetite.acceptableRiskScore || 6)) / 25 * 100}%` 
                }}
              />
              <div 
                className="absolute top-0 h-full bg-destructive"
                style={{ 
                  left: `${(appetite.tolerableRiskScore || 12) / 25 * 100}%`,
                  width: `${(25 - (appetite.tolerableRiskScore || 12)) / 25 * 100}%` 
                }}
              />
              <div 
                className="absolute top-0 h-full w-1 bg-foreground rounded-full"
                style={{ left: `${Math.min(currentHighestScore / 25 * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Acceptable ≤{appetite.acceptableRiskScore || 6}</span>
              <span>Tolerable ≤{appetite.tolerableRiskScore || 12}</span>
              <span>Unacceptable &gt;{appetite.unacceptableThreshold || 16}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {appetite.maxFinancialExposure && (
            <div className="p-2 bg-muted/50 rounded-lg text-center">
              <DollarSign className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Max Exposure</p>
              <p className="text-sm font-medium">${(appetite.maxFinancialExposure / 1000000).toFixed(1)}M</p>
            </div>
          )}
          {appetite.maxDowntimeHours && (
            <div className="p-2 bg-muted/50 rounded-lg text-center">
              <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Max Downtime</p>
              <p className="text-sm font-medium">{appetite.maxDowntimeHours}h</p>
            </div>
          )}
          {appetite.minComplianceScore && (
            <div className="p-2 bg-muted/50 rounded-lg text-center">
              <Gauge className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Min Compliance</p>
              <p className="text-sm font-medium">{appetite.minComplianceScore}%</p>
            </div>
          )}
          {appetite.maxOpenFindings && (
            <div className="p-2 bg-muted/50 rounded-lg text-center">
              <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Max Findings</p>
              <p className="text-sm font-medium">{appetite.maxOpenFindings}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            {appetite.autoEscalateOnBreach ? (
              <Badge variant="outline" className="text-xs">
                <Bell className="h-3 w-3 mr-1" /> Auto-Escalate
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                Manual Review
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onEdit} data-testid={`edit-appetite-${appetite.id}`}>
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BreachesPanel({ breaches }: { breaches: RiskAppetiteBreach[] }) {
  if (breaches.length === 0) {
    return (
      <Card className="card-3d">
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-chart-2" />
          <h3 className="text-lg font-semibold mb-2">No Active Breaches</h3>
          <p className="text-muted-foreground">All risk appetite thresholds are within tolerance</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {breaches.map(breach => (
        <Card key={breach.id} className="card-3d border-destructive/50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h4 className="font-semibold">{breach.breachDescription}</h4>
                  <p className="text-sm text-muted-foreground capitalize">{breach.breachType?.replace("_", " ")}</p>
                </div>
              </div>
              <Badge variant="destructive" className="capitalize">
                {breach.severity}
              </Badge>
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Threshold: {breach.thresholdValue}</span>
              <span className="text-destructive font-medium">Actual: {breach.actualValue}</span>
              <span className="text-muted-foreground">
                Detected: {breach.detectedAt ? new Date(breach.detectedAt).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function RiskAppetitePage() {
  const { toast } = useToast();
  const { currentTenantId } = useTenant();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAppetite, setSelectedAppetite] = useState<RiskAppetite | null>(null);
  const [activeTab, setActiveTab] = useState("appetites");

  const { data: appetites = [], isLoading: appetitesLoading } = useQuery<RiskAppetite[]>({
    queryKey: ["/api/risk-appetite", currentTenantId],
  });

  const { data: breaches = [], isLoading: breachesLoading } = useQuery<RiskAppetiteBreach[]>({
    queryKey: ["/api/risk-appetite-breaches", currentTenantId],
  });

  const { data: risks = [] } = useQuery<Risk[]>({
    queryKey: ["/api/risks", currentTenantId],
  });

  const createMutation = useMutation({
    mutationFn: async (data: AppetiteFormValues) => {
      return apiRequest("POST", "/api/risk-appetite", {
        ...data,
        tenantId: currentTenantId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risk-appetite"] });
      setIsCreateOpen(false);
      toast({ title: "Risk appetite created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create risk appetite", description: error.message, variant: "destructive" });
    },
  });

  const form = useForm<AppetiteFormValues>({
    resolver: zodResolver(appetiteFormSchema),
    defaultValues: {
      name: "",
      category: "",
      acceptableRiskScore: 6,
      tolerableRiskScore: 12,
      unacceptableThreshold: 16,
      autoEscalateOnBreach: true,
    },
  });

  const isLoading = appetitesLoading || breachesLoading;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-72" />)}
        </div>
      </div>
    );
  }

  const activeBreaches = breaches.filter(b => b.status === "active");

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Risk Appetite & Tolerance</h1>
          <p className="text-muted-foreground">Define quantitative thresholds and automated breach detection</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="btn-gradient" data-testid="button-create-appetite">
          <Plus className="h-4 w-4 mr-2" /> Define Appetite
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{appetites.length}</p>
                <p className="text-xs text-muted-foreground">Appetites Defined</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeBreaches.length}</p>
                <p className="text-xs text-muted-foreground">Active Breaches</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-chart-2/10">
                <CheckCircle2 className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{appetites.filter(a => a.isActive).length}</p>
                <p className="text-xs text-muted-foreground">Active Policies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-chart-3/10">
                <Bell className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">{appetites.filter(a => a.autoEscalateOnBreach).length}</p>
                <p className="text-xs text-muted-foreground">Auto-Escalation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="appetites" data-testid="tab-appetites">
            Risk Appetites ({appetites.length})
          </TabsTrigger>
          <TabsTrigger value="breaches" data-testid="tab-breaches">
            Breaches ({activeBreaches.length})
            {activeBreaches.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeBreaches.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appetites" className="mt-4">
          {appetites.length === 0 ? (
            <Card className="card-3d">
              <CardContent className="p-12 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Risk Appetites Defined</h3>
                <p className="text-muted-foreground mb-4">
                  Define your organization's risk appetite to enable automated breach detection
                </p>
                <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first-appetite">
                  <Plus className="h-4 w-4 mr-2" /> Define Risk Appetite
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appetites.map(appetite => (
                <AppetiteCard
                  key={appetite.id}
                  appetite={appetite}
                  risks={risks}
                  onEdit={() => { setSelectedAppetite(appetite); setIsCreateOpen(true); }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="breaches" className="mt-4">
          <BreachesPanel breaches={activeBreaches} />
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAppetite ? "Edit" : "Define"} Risk Appetite</DialogTitle>
            <DialogDescription>
              Set quantitative thresholds for acceptable, tolerable, and unacceptable risk levels
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appetite Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Cyber Risk Tolerance" {...field} data-testid="input-appetite-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-appetite-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="acceptableRiskScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acceptable (≤)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={25} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormDescription className="text-xs">Low risk, no action needed</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tolerableRiskScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tolerable (≤)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={25} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormDescription className="text-xs">Needs monitoring</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unacceptableThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unacceptable (&gt;)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={25} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormDescription className="text-xs">Requires escalation</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxFinancialExposure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Financial Exposure ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5000000" {...field} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxDowntimeHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Downtime (Hours)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="24" {...field} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minComplianceScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Compliance Score (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={100} placeholder="80" {...field} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxOpenFindings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Open Findings</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5" {...field} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="autoEscalateOnBreach"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <FormLabel>Auto-Escalate on Breach</FormLabel>
                      <FormDescription>Automatically notify stakeholders when thresholds are exceeded</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-appetite">
                  {createMutation.isPending ? "Creating..." : "Create Appetite"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
