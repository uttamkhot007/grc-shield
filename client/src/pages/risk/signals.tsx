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
  Activity,
  Radio,
  Bell,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  Eye,
  Edit,
  CheckCircle2,
  XCircle,
  Zap,
  Target,
  RefreshCw,
  Filter,
  Signal,
  AlertCircle,
  Wifi,
  WifiOff,
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
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTenant } from "@/contexts/tenant-context";
import type { RiskSignal, Risk } from "@shared/schema";

const signalTypes = [
  { value: "kri_breach", label: "KRI Breach", icon: AlertTriangle, color: "text-destructive" },
  { value: "control_failure", label: "Control Failure", icon: Shield, color: "text-chart-3" },
  { value: "incident_detected", label: "Incident Detected", icon: Zap, color: "text-destructive" },
  { value: "compliance_gap", label: "Compliance Gap", icon: Target, color: "text-chart-1" },
  { value: "vendor_alert", label: "Vendor Alert", icon: Bell, color: "text-chart-3" },
  { value: "threat_intelligence", label: "Threat Intelligence", icon: Radio, color: "text-primary" },
  { value: "audit_finding", label: "Audit Finding", icon: Eye, color: "text-chart-1" },
  { value: "regulatory_change", label: "Regulatory Change", icon: Activity, color: "text-chart-2" },
];

const severityStyles = {
  critical: { bg: "bg-destructive", text: "text-white", light: "bg-destructive/10", border: "border-destructive/30" },
  high: { bg: "bg-chart-3", text: "text-white", light: "bg-chart-3/10", border: "border-chart-3/30" },
  medium: { bg: "bg-chart-1", text: "text-white", light: "bg-chart-1/10", border: "border-chart-1/30" },
  low: { bg: "bg-chart-2", text: "text-white", light: "bg-chart-2/10", border: "border-chart-2/30" },
};

const signalFormSchema = z.object({
  signalType: z.string().min(1, "Signal type is required"),
  severity: z.string().min(1, "Severity is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  sourceSystem: z.string().optional(),
  riskId: z.number().optional(),
  thresholdValue: z.number().optional(),
  actualValue: z.number().optional(),
  isActive: z.boolean(),
  requiresAction: z.boolean(),
});

type SignalFormValues = z.infer<typeof signalFormSchema>;

function SignalCard({ signal, onView, onAcknowledge }: { signal: RiskSignal; onView: () => void; onAcknowledge: () => void }) {
  const typeConfig = signalTypes.find(t => t.value === signal.signalType);
  const TypeIcon = typeConfig?.icon || AlertTriangle;
  const severity = signal.severity as keyof typeof severityStyles || "medium";
  const style = severityStyles[severity];
  const isActive = signal.status === "active";

  return (
    <Card className={`card-3d hover-elevate ${isActive ? style.border : "border-muted"}`} data-testid={`signal-card-${signal.id}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${isActive ? style.light : "bg-muted"}`}>
              <TypeIcon className={`h-5 w-5 ${isActive ? typeConfig?.color || "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold line-clamp-1">{signal.title}</h3>
                {isActive && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground capitalize">{signal.signalType?.replace("_", " ")}</p>
            </div>
          </div>
          <Badge className={`${style.bg} ${style.text} border-0 capitalize`}>
            {severity}
          </Badge>
        </div>

        {signal.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{signal.description}</p>
        )}

        <div className="grid grid-cols-2 gap-2 mb-3">
          {signal.signalSource && (
            <div className="p-2 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Source</p>
              <p className="text-sm font-medium truncate">{signal.signalSource}</p>
            </div>
          )}
          {signal.detectedAt && (
            <div className="p-2 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Detected</p>
              <p className="text-sm font-medium">{new Date(signal.detectedAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {signal.riskScoreImpact && (
          <div className="flex items-center gap-4 text-sm mb-3 p-2 bg-muted/50 rounded-lg">
            <div>
              <span className="text-muted-foreground">Risk Score Impact: </span>
              <span className="font-medium">{signal.riskScoreImpact}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Confidence: </span>
              <span className="font-medium">{signal.confidence}%</span>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-3 border-t border-border">
          <Button variant="outline" size="sm" className="flex-1" onClick={onView} data-testid={`view-signal-${signal.id}`}>
            <Eye className="h-4 w-4 mr-1" /> Details
          </Button>
          {isActive && (
            <Button variant="outline" size="sm" className="flex-1" onClick={onAcknowledge} data-testid={`ack-signal-${signal.id}`}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Acknowledge
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SignalStats({ signals }: { signals: RiskSignal[] }) {
  const stats = useMemo(() => {
    const active = signals.filter(s => s.status === "active").length;
    const critical = signals.filter(s => s.severity === "critical" && s.status === "active").length;
    const pending = signals.filter(s => s.status === "pending").length;
    const completed = signals.filter(s => s.status === "completed").length;
    
    return { total: signals.length, active, critical, pending, completed };
  }, [signals]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <Card className="card-3d">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Signal className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Signals</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="card-3d">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-chart-3/10">
              <Wifi className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="card-3d">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.critical}</p>
              <p className="text-xs text-muted-foreground">Critical Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="card-3d">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-chart-1/10">
              <Bell className="h-5 w-5 text-chart-1" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
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
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RiskSignalsPage() {
  const { toast } = useToast();
  const { currentTenantId } = useTenant();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<RiskSignal | null>(null);

  const { data: signals = [], isLoading: signalsLoading } = useQuery<RiskSignal[]>({
    queryKey: ["/api/risk-signals", currentTenantId],
  });

  const { data: risks = [] } = useQuery<Risk[]>({
    queryKey: ["/api/risks", currentTenantId],
  });

  const createMutation = useMutation({
    mutationFn: async (data: SignalFormValues) => {
      return apiRequest("POST", "/api/risk-signals", {
        ...data,
        tenantId: currentTenantId,
        status: "active",
        detectedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risk-signals"] });
      setIsCreateOpen(false);
      toast({ title: "Risk signal created" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create signal", description: error.message, variant: "destructive" });
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (signalId: number) => {
      return apiRequest("PATCH", `/api/risk-signals/${signalId}`, {
        status: "acknowledged",
        acknowledgedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risk-signals"] });
      toast({ title: "Signal acknowledged" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to acknowledge", description: error.message, variant: "destructive" });
    },
  });

  const form = useForm<SignalFormValues>({
    resolver: zodResolver(signalFormSchema),
    defaultValues: {
      signalType: "",
      severity: "medium",
      title: "",
      description: "",
      sourceSystem: "",
      isActive: true,
      requiresAction: true,
    },
  });

  const filteredSignals = useMemo(() => {
    return signals.filter(s => {
      const matchesSearch = !searchQuery || 
        s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      const matchesSeverity = severityFilter === "all" || s.severity === severityFilter;
      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [signals, searchQuery, statusFilter, severityFilter]);

  if (signalsLoading) {
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
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Risk Signals</h1>
          <p className="text-muted-foreground">Continuous risk monitoring with real-time signal detection</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="btn-gradient" data-testid="button-create-signal">
          <Plus className="h-4 w-4 mr-2" /> New Signal
        </Button>
      </div>

      <SignalStats signals={signals} />

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search signals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-signals"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" data-testid="select-status-filter">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-40" data-testid="select-severity-filter">
            <SelectValue placeholder="All Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredSignals.length === 0 ? (
        <Card className="card-3d">
          <CardContent className="p-12 text-center">
            <Signal className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Signals Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all" || severityFilter !== "all"
                ? "No signals match your filters"
                : "Create a signal or connect monitoring sources to get started"}
            </p>
            <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first-signal">
              <Plus className="h-4 w-4 mr-2" /> Create Signal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSignals.map(signal => (
            <SignalCard
              key={signal.id}
              signal={signal}
              onView={() => setSelectedSignal(signal)}
              onAcknowledge={() => acknowledgeMutation.mutate(signal.id)}
            />
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Risk Signal</DialogTitle>
            <DialogDescription>
              Add a new risk signal for monitoring and tracking
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Signal Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., KRI Threshold Exceeded - Credit Risk" {...field} data-testid="input-signal-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="signalType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Signal Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-signal-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {signalTypes.map(type => (
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
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-severity">
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the signal details..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sourceSystem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source System</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., SIEM, GRC Tool, Manual Entry" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="thresholdValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Threshold Value</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 100" {...field} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="actualValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Actual Value</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 120" {...field} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="riskId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associated Risk</FormLabel>
                    <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Link to risk (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {risks.slice(0, 20).map(risk => (
                          <SelectItem key={risk.id} value={risk.id.toString()}>{risk.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Active Signal</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requiresAction"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Requires Action</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-signal">
                  {createMutation.isPending ? "Creating..." : "Create Signal"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
