import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTenant } from "@/contexts/tenant-context";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, Shield, AlertTriangle, RefreshCw, Plus, Trash2, 
  Clock, Globe, Lock, UserCheck, Mail, Building, ChevronRight
} from "lucide-react";

export default function DarkWebMonitorPage() {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const [monitorType, setMonitorType] = useState("domain");
  const [monitorValue, setMonitorValue] = useState("");
  const [monitorName, setMonitorName] = useState("");
  const [scanFrequency, setScanFrequency] = useState("daily");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState<any>(null);

  const selectedTenant = currentTenant?.id || null;

  const { data: monitors = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/security/darkweb-monitors', selectedTenant],
    queryFn: async () => {
      const res = await fetch(`/api/security/darkweb-monitors?tenantId=${selectedTenant}`);
      if (!res.ok) throw new Error('Failed to fetch monitors');
      return res.json();
    },
    enabled: !!selectedTenant,
  });

  const { data: alerts = [] } = useQuery<any[]>({
    queryKey: ['/api/security/darkweb-alerts', selectedTenant],
    queryFn: async () => {
      const res = await fetch(`/api/security/darkweb-alerts?tenantId=${selectedTenant}`);
      if (!res.ok) throw new Error('Failed to fetch alerts');
      return res.json();
    },
    enabled: !!selectedTenant,
  });

  const { data: monitorAlerts = [] } = useQuery<any[]>({
    queryKey: ['/api/security/darkweb-monitors/alerts', selectedMonitor?.id],
    queryFn: async () => {
      const res = await fetch(`/api/security/darkweb-monitors/${selectedMonitor.id}/alerts`);
      if (!res.ok) throw new Error('Failed to fetch alerts');
      return res.json();
    },
    enabled: !!selectedMonitor,
  });

  const createMonitorMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/security/darkweb-monitors', {
        tenantId: selectedTenant,
        ...data,
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Monitor Created", 
        description: `Found ${data.alertsFound} exposure(s) in initial scan` 
      });
      setCreateDialogOpen(false);
      setMonitorValue("");
      setMonitorName("");
      queryClient.invalidateQueries({ queryKey: ['/api/security/darkweb-monitors', selectedTenant] });
      queryClient.invalidateQueries({ queryKey: ['/api/security/darkweb-alerts', selectedTenant] });
    },
    onError: (error: any) => {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    }
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const res = await apiRequest('POST', `/api/security/darkweb-alerts/${alertId}/acknowledge`, {});
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Acknowledged", description: "Alert has been acknowledged" });
      queryClient.invalidateQueries({ queryKey: ['/api/security/darkweb-alerts', selectedTenant] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/security/darkweb-monitors/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Monitor removed" });
      queryClient.invalidateQueries({ queryKey: ['/api/security/darkweb-monitors', selectedTenant] });
    }
  });

  const rescanMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/security/darkweb-monitors/${id}/rescan`, {});
      return res.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Rescan Complete", 
        description: `Found ${data.newAlerts || 0} new exposure(s)` 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/security/darkweb-monitors', selectedTenant] });
      queryClient.invalidateQueries({ queryKey: ['/api/security/darkweb-alerts', selectedTenant] });
    },
    onError: (error: any) => {
      toast({ title: "Rescan Failed", description: error.message, variant: "destructive" });
    }
  });

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-600/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return <Badge className={colors[severity] || colors.medium}>{severity?.toUpperCase()}</Badge>;
  };

  const getMonitorTypeIcon = (type: string) => {
    switch (type) {
      case 'domain': return <Globe className="h-5 w-5" />;
      case 'email': return <Mail className="h-5 w-5" />;
      case 'credential': return <Lock className="h-5 w-5" />;
      case 'brand': return <Building className="h-5 w-5" />;
      case 'executive': return <UserCheck className="h-5 w-5" />;
      default: return <Eye className="h-5 w-5" />;
    }
  };

  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status === 'open');
  const highAlerts = alerts.filter(a => a.severity === 'high' && a.status === 'open');
  const openAlerts = alerts.filter(a => a.status === 'open');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Dark Web Monitoring
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor for leaked credentials, data breaches, and brand mentions on the dark web
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-monitor" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Monitor
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle>Create Dark Web Monitor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm text-muted-foreground">Monitor Type</label>
                  <Select value={monitorType} onValueChange={setMonitorType}>
                    <SelectTrigger className="mt-1 bg-slate-800 border-slate-600" data-testid="select-monitor-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="domain">Domain Monitoring</SelectItem>
                      <SelectItem value="email">Email Address Monitoring</SelectItem>
                      <SelectItem value="credential">Credential Monitoring</SelectItem>
                      <SelectItem value="brand">Brand Monitoring</SelectItem>
                      <SelectItem value="executive">Executive Monitoring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    {monitorType === 'domain' ? 'Domain' : 
                     monitorType === 'email' ? 'Email Address' : 
                     monitorType === 'brand' ? 'Brand Name' : 
                     monitorType === 'executive' ? 'Executive Name' : 'Value'}
                  </label>
                  <Input
                    data-testid="input-monitor-value"
                    placeholder={monitorType === 'domain' ? 'example.com' : 
                                monitorType === 'email' ? 'user@example.com' : 
                                'Enter value to monitor'}
                    value={monitorValue}
                    onChange={(e) => setMonitorValue(e.target.value)}
                    className="mt-1 bg-slate-800 border-slate-600"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Monitor Name (optional)</label>
                  <Input
                    data-testid="input-monitor-name"
                    placeholder="My Monitor"
                    value={monitorName}
                    onChange={(e) => setMonitorName(e.target.value)}
                    className="mt-1 bg-slate-800 border-slate-600"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Scan Frequency</label>
                  <Select value={scanFrequency} onValueChange={setScanFrequency}>
                    <SelectTrigger className="mt-1 bg-slate-800 border-slate-600" data-testid="select-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  data-testid="button-create-monitor"
                  className="w-full"
                  onClick={() => createMonitorMutation.mutate({ monitorType, monitorValue, monitorName, scanFrequency })}
                  disabled={!monitorValue || createMonitorMutation.isPending}
                >
                  {createMonitorMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Scanning...
                    </>
                  ) : (
                    'Create Monitor'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-white">{monitors.filter(m => m.isActive).length}</div>
              <div className="text-sm text-muted-foreground">Active Monitors</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-red-400">{criticalAlerts.length}</div>
              <div className="text-sm text-muted-foreground">Critical Alerts</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-orange-400">{highAlerts.length}</div>
              <div className="text-sm text-muted-foreground">High Alerts</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-yellow-400">{openAlerts.length}</div>
              <div className="text-sm text-muted-foreground">Open Alerts</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="monitors" className="space-y-4">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="monitors">Monitors</TabsTrigger>
            <TabsTrigger value="alerts">Alerts ({openAlerts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="monitors">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="h-8 w-8 animate-spin text-red-400" />
              </div>
            ) : monitors.length === 0 ? (
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="py-16 text-center">
                  <Eye className="h-16 w-16 mx-auto text-slate-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Dark Web Monitors</h3>
                  <p className="text-muted-foreground mb-4">Start monitoring for leaked credentials and data breaches</p>
                  <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Monitor
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {monitors.map((monitor) => (
                  <Card 
                    key={monitor.id} 
                    className="bg-slate-900/50 border-slate-700 hover:border-red-500/50 transition-all cursor-pointer"
                    onClick={() => setSelectedMonitor(monitor)}
                    data-testid={`card-monitor-${monitor.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                            {getMonitorTypeIcon(monitor.monitorType)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">
                              {monitor.monitorName || monitor.monitorValue}
                            </h3>
                            <p className="text-sm text-muted-foreground">{monitor.monitorValue}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {monitor.monitorType}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {monitor.scanFrequency}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-400">{monitor.alertsCount || 0}</div>
                          <div className="text-xs text-muted-foreground">Alerts</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Last scan: {monitor.lastScanAt ? new Date(monitor.lastScanAt).toLocaleDateString() : 'Never'}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300"
                          onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(monitor.id); }}
                          data-testid={`button-delete-${monitor.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="alerts">
            {alerts.length === 0 ? (
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="py-16 text-center">
                  <Shield className="h-16 w-16 mx-auto text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Alerts Found</h3>
                  <p className="text-muted-foreground">No dark web exposures detected for your monitored assets</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Card 
                    key={alert.id} 
                    className="bg-slate-900/50 border-slate-700"
                    data-testid={`card-alert-${alert.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className={`h-5 w-5 mt-1 ${
                            alert.severity === 'critical' ? 'text-red-400' : 
                            alert.severity === 'high' ? 'text-orange-400' : 'text-yellow-400'
                          }`} />
                          <div>
                            <h4 className="font-semibold text-white">{alert.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                            {alert.sourceName && (
                              <p className="text-xs text-blue-400 mt-2">
                                Source: {alert.sourceName} ({alert.sourceType})
                              </p>
                            )}
                            {alert.affectedAccounts && (
                              <p className="text-xs text-red-400 mt-1">
                                {alert.affectedAccounts} accounts potentially affected
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getSeverityBadge(alert.severity)}
                          <Badge variant={alert.status === 'open' ? 'destructive' : 'outline'}>
                            {alert.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {alert.status === 'open' && (
                        <div className="mt-4 flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeMutation.mutate(alert.id)}
                            data-testid={`button-acknowledge-${alert.id}`}
                          >
                            Acknowledge
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {selectedMonitor && (
          <Dialog open={!!selectedMonitor} onOpenChange={() => setSelectedMonitor(null)}>
            <DialogContent className="bg-slate-900 border-slate-700 max-w-3xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getMonitorTypeIcon(selectedMonitor.monitorType)}
                  {selectedMonitor.monitorName || selectedMonitor.monitorValue}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold text-white">{selectedMonitor.alertsCount || 0}</div>
                      <div className="text-sm text-muted-foreground">Total Alerts</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-4 text-center">
                      <div className="text-sm font-semibold text-white capitalize">{selectedMonitor.scanFrequency}</div>
                      <div className="text-sm text-muted-foreground">Scan Frequency</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-4 text-center">
                      <Badge className={selectedMonitor.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {selectedMonitor.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg">Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {monitorAlerts.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No alerts for this monitor</p>
                    ) : (
                      <div className="space-y-3">
                        {monitorAlerts.map((alert) => (
                          <div key={alert.id} className="flex items-center justify-between p-3 bg-slate-900 rounded">
                            <div className="flex items-center gap-3">
                              <AlertTriangle className={`h-4 w-4 ${
                                alert.severity === 'critical' ? 'text-red-400' : 
                                alert.severity === 'high' ? 'text-orange-400' : 'text-yellow-400'
                              }`} />
                              <span className="text-sm">{alert.title}</span>
                            </div>
                            {getSeverityBadge(alert.severity)}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
