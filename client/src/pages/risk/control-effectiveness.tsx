import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Search,
  Shield,
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Settings,
  Clock,
  FileCheck,
  Activity,
  Gauge,
  ChevronRight,
  Edit,
  Eye,
  RefreshCw,
  Sparkles,
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
  FormDescription,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTenant } from "@/contexts/tenant-context";
import type { Control, ControlEffectiveness } from "@shared/schema";

const effectivenessFormSchema = z.object({
  controlId: z.string().min(1, "Control is required"),
  designEffectiveness: z.number().min(0).max(100),
  operatingEffectiveness: z.number().min(0).max(100),
  testFrequency: z.string().optional(),
  designAssessmentNotes: z.string().optional(),
  operatingAssessmentNotes: z.string().optional(),
});

type EffectivenessFormValues = z.infer<typeof effectivenessFormSchema>;

function EffectivenessGauge({ score, label, size = "md" }: { score: number; label: string; size?: "sm" | "md" | "lg" }) {
  const color = score >= 80 ? "text-chart-2" : score >= 60 ? "text-chart-1" : score >= 40 ? "text-chart-3" : "text-destructive";
  const bgColor = score >= 80 ? "stroke-chart-2" : score >= 60 ? "stroke-chart-1" : score >= 40 ? "stroke-chart-3" : "stroke-destructive";
  const sizes = { sm: 60, md: 80, lg: 100 };
  const strokeWidths = { sm: 6, md: 8, lg: 10 };
  const s = sizes[size];
  const sw = strokeWidths[size];
  const r = (s - sw) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: s, height: s }}>
        <svg className="transform -rotate-90" width={s} height={s}>
          <circle
            cx={s / 2}
            cy={s / 2}
            r={r}
            stroke="hsl(var(--muted))"
            strokeWidth={sw}
            fill="none"
          />
          <circle
            cx={s / 2}
            cy={s / 2}
            r={r}
            className={bgColor}
            strokeWidth={sw}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${color} ${size === "lg" ? "text-2xl" : size === "md" ? "text-xl" : "text-sm"}`}>{score}%</span>
        </div>
      </div>
      <p className={`text-muted-foreground mt-1 ${size === "sm" ? "text-xs" : "text-sm"}`}>{label}</p>
    </div>
  );
}

function ControlEffectivenessCard({ 
  control, 
  effectiveness,
  onEdit 
}: { 
  control: Control; 
  effectiveness?: ControlEffectiveness;
  onEdit: () => void;
}) {
  const designScore = effectiveness?.designEffectiveness || 0;
  const operatingScore = effectiveness?.operatingEffectiveness || 0;
  const overallScore = effectiveness?.overallEffectiveness || Math.round((designScore * 0.4 + operatingScore * 0.6));
  
  const status = overallScore >= 80 ? "effective" : overallScore >= 60 ? "partially_effective" : overallScore >= 40 ? "needs_improvement" : "ineffective";
  const statusColors = {
    effective: "bg-chart-2 text-white",
    partially_effective: "bg-chart-1 text-white",
    needs_improvement: "bg-chart-3 text-white",
    ineffective: "bg-destructive text-white",
  };

  return (
    <Card className="card-3d hover-elevate" data-testid={`effectiveness-card-${control.id}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold line-clamp-1">{control.title}</h3>
              <p className="text-xs text-muted-foreground">{control.controlId || control.category}</p>
            </div>
          </div>
          <Badge className={`${statusColors[status]} border-0 capitalize text-xs`}>
            {status.replace("_", " ")}
          </Badge>
        </div>

        <div className="flex justify-around mb-4">
          <EffectivenessGauge score={designScore} label="Design" size="sm" />
          <EffectivenessGauge score={operatingScore} label="Operating" size="sm" />
          <EffectivenessGauge score={overallScore} label="Overall" size="sm" />
        </div>

        {effectiveness?.lastTestDate && (
          <div className="flex items-center justify-between text-sm mb-3 p-2 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Last Tested
            </span>
            <span className="font-medium">{new Date(effectiveness.lastTestDate).toLocaleDateString()}</span>
          </div>
        )}

        {effectiveness?.designAssessmentNotes && (
          <div className="mb-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Assessment Notes</p>
            <p className="text-sm line-clamp-2">{effectiveness.designAssessmentNotes}</p>
          </div>
        )}

        <div className="flex gap-2 pt-3 border-t border-border">
          <Button variant="outline" size="sm" className="flex-1" onClick={onEdit} data-testid={`edit-effectiveness-${control.id}`}>
            <Edit className="h-4 w-4 mr-1" /> Update
          </Button>
          <Button variant="ghost" size="sm" data-testid={`view-effectiveness-${control.id}`}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EffectivenessSummary({ controls, effectivenessData }: { controls: Control[]; effectivenessData: ControlEffectiveness[] }) {
  const stats = useMemo(() => {
    const effectivenessMap = new Map(effectivenessData.map(e => [e.controlId, e]));
    let totalDesign = 0;
    let totalOperating = 0;
    let assessedCount = 0;
    let effectiveCount = 0;
    
    controls.forEach(control => {
      const eff = effectivenessMap.get(control.id);
      if (eff) {
        totalDesign += eff.designEffectiveness || 0;
        totalOperating += eff.operatingEffectiveness || 0;
        assessedCount++;
        if ((eff.overallEffectiveness || 0) >= 80) effectiveCount++;
      }
    });
    
    return {
      total: controls.length,
      assessed: assessedCount,
      avgDesign: assessedCount > 0 ? Math.round(totalDesign / assessedCount) : 0,
      avgOperating: assessedCount > 0 ? Math.round(totalOperating / assessedCount) : 0,
      effectiveRate: assessedCount > 0 ? Math.round((effectiveCount / assessedCount) * 100) : 0,
    };
  }, [controls, effectivenessData]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <Card className="card-3d">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Controls</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="card-3d">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-chart-2/10">
              <FileCheck className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.assessed}</p>
              <p className="text-xs text-muted-foreground">Assessed</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="card-3d">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-chart-1/10">
              <Settings className="h-5 w-5 text-chart-1" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgDesign}%</p>
              <p className="text-xs text-muted-foreground">Avg Design</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="card-3d">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-chart-3/10">
              <Activity className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgOperating}%</p>
              <p className="text-xs text-muted-foreground">Avg Operating</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="card-3d">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-chart-2/10">
              <Gauge className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.effectiveRate}%</p>
              <p className="text-xs text-muted-foreground">Effective Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ControlEffectivenessPage() {
  const { toast } = useToast();
  const { currentTenantId } = useTenant();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);

  const { data: controls = [], isLoading: controlsLoading } = useQuery<Control[]>({
    queryKey: ["/api/controls"],
  });

  const { data: effectivenessData = [], isLoading: effectivenessLoading } = useQuery<ControlEffectiveness[]>({
    queryKey: ["/api/control-effectiveness", currentTenantId],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: EffectivenessFormValues) => {
      return apiRequest("POST", "/api/control-effectiveness", {
        ...data,
        tenantId: currentTenantId,
        overallScore: Math.round((data.designEffectivenessScore * 0.4) + (data.operatingEffectivenessScore * 0.6)),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/control-effectiveness"] });
      setIsEditOpen(false);
      toast({ title: "Control effectiveness updated" });
    },
    onError: (error: any) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  const form = useForm<EffectivenessFormValues>({
    resolver: zodResolver(effectivenessFormSchema),
    defaultValues: {
      controlId: "",
      designEffectiveness: 70,
      operatingEffectiveness: 70,
      testFrequency: "quarterly",
      designAssessmentNotes: "",
      operatingAssessmentNotes: "",
    },
  });

  const effectivenessMap = useMemo(() => {
    return new Map(effectivenessData.map(e => [e.controlId, e]));
  }, [effectivenessData]);

  const filteredControls = useMemo(() => {
    return controls.filter(c => {
      const matchesSearch = !searchQuery || 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.controlId?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (statusFilter === "all") return matchesSearch;
      
      const eff = effectivenessMap.get(c.id);
      const score = eff?.overallEffectiveness || 0;
      
      if (statusFilter === "effective") return matchesSearch && score >= 80;
      if (statusFilter === "needs_improvement") return matchesSearch && score >= 40 && score < 80;
      if (statusFilter === "ineffective") return matchesSearch && score < 40;
      if (statusFilter === "not_assessed") return matchesSearch && !eff;
      
      return matchesSearch;
    });
  }, [controls, searchQuery, statusFilter, effectivenessMap]);

  const isLoading = controlsLoading || effectivenessLoading;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  const handleEdit = (control: Control) => {
    setSelectedControl(control);
    const existing = effectivenessMap.get(control.id);
    form.reset({
      controlId: control.id,
      designEffectiveness: existing?.designEffectiveness || 70,
      operatingEffectiveness: existing?.operatingEffectiveness || 70,
      testFrequency: existing?.testFrequency || "quarterly",
      designAssessmentNotes: existing?.designAssessmentNotes || "",
      operatingAssessmentNotes: existing?.operatingAssessmentNotes || "",
    });
    setIsEditOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Control Effectiveness Engine</h1>
          <p className="text-muted-foreground">Track design vs operating effectiveness with automated scoring</p>
        </div>
        <Button className="btn-gradient" data-testid="button-bulk-assess">
          <Sparkles className="h-4 w-4 mr-2" /> AI Bulk Assessment
        </Button>
      </div>

      <EffectivenessSummary controls={controls} effectivenessData={effectivenessData} />

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search controls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-controls"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="select-status-filter">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="effective">Effective</SelectItem>
            <SelectItem value="needs_improvement">Needs Improvement</SelectItem>
            <SelectItem value="ineffective">Ineffective</SelectItem>
            <SelectItem value="not_assessed">Not Assessed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredControls.length === 0 ? (
        <Card className="card-3d">
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Controls Found</h3>
            <p className="text-muted-foreground">Adjust your search or filter criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredControls.slice(0, 12).map(control => (
            <ControlEffectivenessCard
              key={control.id}
              control={control}
              effectiveness={effectivenessMap.get(control.id)}
              onEdit={() => handleEdit(control)}
            />
          ))}
        </div>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Control Effectiveness</DialogTitle>
            <DialogDescription>
              {selectedControl?.title}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="designEffectiveness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Design Effectiveness (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={100} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormDescription>How well the control is designed</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="operatingEffectiveness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operating Effectiveness (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={100} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormDescription>How well the control operates</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="testFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Testing Frequency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="continuous">Continuous</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="semi_annual">Semi-Annual</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="designAssessmentNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assessment Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the test results..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={updateMutation.isPending} data-testid="button-submit-effectiveness">
                  {updateMutation.isPending ? "Updating..." : "Update Effectiveness"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
