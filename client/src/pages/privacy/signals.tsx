import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity, Search, AlertTriangle, CheckCircle2, Clock, Eye, Bell,
  Database, Users, Shield, RefreshCw, Filter, TrendingUp, Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTenant } from "@/contexts/tenant-context";
import type { PrivacySignal } from "@shared/schema";

const signalTypeLabels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  new_data_store: { label: "New Data Store", icon: Database, color: "bg-chart-1/10 text-chart-1" },
  policy_drift: { label: "Policy Drift", icon: AlertTriangle, color: "bg-orange-500/10 text-orange-500" },
  over_retention: { label: "Over Retention", icon: Clock, color: "bg-destructive/10 text-destructive" },
  consent_gap: { label: "Consent Gap", icon: Users, color: "bg-chart-3/10 text-chart-3" },
  vendor_risk: { label: "Vendor Risk", icon: Shield, color: "bg-primary/10 text-primary" },
};

const severityColors: Record<string, string> = {
  low: "bg-chart-2/10 text-chart-2",
  medium: "bg-chart-1/10 text-chart-1",
  high: "bg-orange-500/10 text-orange-500",
  critical: "bg-destructive/10 text-destructive"
};

function SignalCard({ signal, onAcknowledge, onResolve }: { 
  signal: PrivacySignal; 
  onAcknowledge: () => void; 
  onResolve: () => void;
}) {
  const typeConfig = signalTypeLabels[signal.signalType] || signalTypeLabels.policy_drift;
  const Icon = typeConfig.icon;
  const isActive = signal.status === "active";

  return (
    <Card className={`card-3d hover-elevate ${isActive ? "border-l-4 border-l-destructive" : ""}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${typeConfig.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">{signal.title}</h3>
              <p className="text-xs text-muted-foreground">{typeConfig.label}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={severityColors[signal.severity || "medium"]}>
              {signal.severity}
            </Badge>
            <Badge variant={isActive ? "destructive" : "secondary"} className="text-xs">
              {signal.status}
            </Badge>
          </div>
        </div>

        {signal.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{signal.description}</p>
        )}

        <div className="grid grid-cols-2 gap-2 mb-3">
          {signal.affectedEntity && (
            <div className="p-2 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Affected</p>
              <p className="text-sm font-medium truncate">{signal.affectedEntity}</p>
            </div>
          )}
          {signal.detectedAt && (
            <div className="p-2 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Detected</p>
              <p className="text-sm font-medium">{new Date(signal.detectedAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {signal.driftPercentage && (
          <div className="mb-3 p-2 bg-muted/50 rounded-lg">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Drift</span>
              <span className={`font-medium ${signal.driftPercentage > 20 ? "text-destructive" : "text-chart-1"}`}>
                {signal.driftPercentage}%
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${signal.driftPercentage > 20 ? "bg-destructive" : "bg-chart-1"}`}
                style={{ width: `${Math.min(signal.driftPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {signal.recommendedAction && (
          <div className="text-sm text-muted-foreground mb-3 p-2 bg-primary/5 rounded-lg border border-primary/10">
            <span className="font-medium text-primary">Recommended: </span>
            {signal.recommendedAction}
          </div>
        )}

        {isActive && (
          <div className="flex gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" className="flex-1" onClick={onAcknowledge} data-testid={`acknowledge-signal-${signal.id}`}>
              <Eye className="h-4 w-4 mr-1" /> Acknowledge
            </Button>
            <Button size="sm" className="flex-1" onClick={onResolve} data-testid={`resolve-signal-${signal.id}`}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Resolve
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PrivacySignalsPage() {
  const { toast } = useToast();
  const { currentTenantId } = useTenant();
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: signals = [], isLoading } = useQuery<PrivacySignal[]>({
    queryKey: ["/api/privacy-signals", currentTenantId],
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PATCH", `/api/privacy-signals/${id}`, { 
        status: "pending", 
        acknowledgedAt: new Date().toISOString() 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/privacy-signals"] });
      toast({ title: "Signal acknowledged" });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PATCH", `/api/privacy-signals/${id}`, { 
        status: "completed", 
        resolvedAt: new Date().toISOString() 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/privacy-signals"] });
      toast({ title: "Signal resolved" });
    },
  });

  const filteredSignals = useMemo(() => {
    return signals.filter(s => {
      const matchesSearch = !searchQuery || 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.affectedEntity?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = severityFilter === "all" || s.severity === severityFilter;
      const matchesType = typeFilter === "all" || s.signalType === typeFilter;
      return matchesSearch && matchesSeverity && matchesType;
    });
  }, [signals, searchQuery, severityFilter, typeFilter]);

  const stats = useMemo(() => {
    return {
      total: signals.length,
      active: signals.filter(s => s.status === "active").length,
      critical: signals.filter(s => s.severity === "critical" && s.status === "active").length,
      pending: signals.filter(s => s.status === "pending").length,
      resolved: signals.filter(s => s.status === "completed").length,
    };
  }, [signals]);

  const byType = useMemo(() => {
    const counts: Record<string, number> = {};
    signals.filter(s => s.status === "active").forEach(s => {
      counts[s.signalType] = (counts[s.signalType] || 0) + 1;
    });
    return counts;
  }, [signals]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Continuous Privacy Compliance</h1>
          <p className="text-muted-foreground">Real-time privacy signals and drift detection</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-refresh-signals">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button className="btn-gradient" data-testid="button-run-scan">
            <Sparkles className="h-4 w-4 mr-2" /> Run Scan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
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
              <div className="p-2.5 rounded-lg bg-chart-1/10">
                <Bell className="h-5 w-5 text-chart-1" />
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
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.critical}</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-chart-3/10">
                <Clock className="h-5 w-5 text-chart-3" />
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
                <p className="text-2xl font-bold">{stats.resolved}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="signals" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="signals" data-testid="tab-signals">All Signals</TabsTrigger>
          <TabsTrigger value="by-type" data-testid="tab-by-type">By Type</TabsTrigger>
          <TabsTrigger value="trends" data-testid="tab-trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="signals" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search signals..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-signal"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40" data-testid="select-severity-filter">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48" data-testid="select-type-filter">
                <SelectValue placeholder="Signal Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="new_data_store">New Data Store</SelectItem>
                <SelectItem value="policy_drift">Policy Drift</SelectItem>
                <SelectItem value="over_retention">Over Retention</SelectItem>
                <SelectItem value="consent_gap">Consent Gap</SelectItem>
                <SelectItem value="vendor_risk">Vendor Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <Card key={i} className="card-3d animate-pulse">
                  <CardContent className="p-5 h-52" />
                </Card>
              ))}
            </div>
          ) : filteredSignals.length === 0 ? (
            <Card className="card-3d">
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-chart-2 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Signals</h3>
                <p className="text-muted-foreground">Your privacy posture is healthy</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSignals.map(signal => (
                <SignalCard
                  key={signal.id}
                  signal={signal}
                  onAcknowledge={() => acknowledgeMutation.mutate(signal.id)}
                  onResolve={() => resolveMutation.mutate(signal.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="by-type" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(signalTypeLabels).map(([type, config]) => {
              const Icon = config.icon;
              const count = byType[type] || 0;
              return (
                <Card key={type} className="card-3d hover-elevate cursor-pointer" onClick={() => setTypeFilter(type)}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${config.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-sm text-muted-foreground">{config.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Signal Trends
              </CardTitle>
              <CardDescription>Privacy signal trends over time</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Signal trend visualization will appear here once data is collected</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
