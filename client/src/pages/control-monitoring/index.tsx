import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Activity, AlertTriangle, CheckCircle2, XCircle, Clock, 
  RefreshCw, Bell, Settings, TrendingUp, Shield, Search,
  BarChart3, Zap, Filter, FolderOpen
} from "lucide-react";
import type { ControlMonitor, ControlAlert } from "@shared/schema";

export default function ControlMonitoringPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: monitors = [], isLoading: monitorsLoading } = useQuery<ControlMonitor[]>({
    queryKey: ["/api/control-monitoring/monitors"],
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery<ControlAlert[]>({
    queryKey: ["/api/control-monitoring/alerts"],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "at_risk": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "failing": return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "bg-green-500/20 text-green-400";
      case "at_risk": return "bg-amber-500/20 text-amber-400";
      case "failing": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const healthyCount = monitors.filter(m => m.status === "healthy").length;
  const atRiskCount = monitors.filter(m => m.status === "at_risk").length;
  const failingCount = monitors.filter(m => m.status === "failing").length;
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledgedAt);

  const EmptyState = ({ title, description, icon: Icon }: { title: string; description: string; icon: any }) => (
    <Card className="glass-card">
      <CardContent className="p-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          <Icon className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
        <Button data-testid="button-get-started">
          <Zap className="w-4 h-4 mr-2" />
          Add Monitor
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Continuous Control Monitoring
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time control health monitoring with automated alerts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-refresh-all">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh All
          </Button>
          <Button data-testid="button-add-monitor">
            <Zap className="w-4 h-4 mr-2" />
            Add Monitor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{monitors.length}</p>
              <p className="text-sm text-muted-foreground">Total Monitors</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/20">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{healthyCount}</p>
              <p className="text-sm text-muted-foreground">Healthy</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-500/20">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{atRiskCount}</p>
              <p className="text-sm text-muted-foreground">At Risk</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-red-500/20">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{failingCount}</p>
              <p className="text-sm text-muted-foreground">Failing</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{monitors.length > 0 ? "--" : "0"}%</p>
              <p className="text-sm text-muted-foreground">Avg Success</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monitors" className="space-y-4">
        <TabsList className="glass-card">
          <TabsTrigger value="monitors" data-testid="tab-monitors">
            <Shield className="w-4 h-4 mr-2" />
            Control Monitors
          </TabsTrigger>
          <TabsTrigger value="alerts" data-testid="tab-alerts">
            <Bell className="w-4 h-4 mr-2" />
            Alerts ({unacknowledgedAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitors" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search monitors..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-monitors"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {monitorsLoading ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading monitors...
              </CardContent>
            </Card>
          ) : monitors.length === 0 ? (
            <EmptyState 
              title="No Control Monitors Yet"
              description="Set up continuous monitoring for your security controls. Track MFA enforcement, encryption, vulnerability scanning, and more in real-time."
              icon={Activity}
            />
          ) : (
            <div className="grid gap-4">
              {monitors.map((monitor) => (
                <Card key={monitor.id} className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(monitor.status || "unknown")}
                        <div>
                          <h3 className="font-semibold">{monitor.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Control: {monitor.controlId} • Last checked: {monitor.lastChecked ? new Date(monitor.lastChecked).toLocaleString() : 'Never'} • {monitor.frequency}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Success Rate</span>
                            <span>{monitor.successRate || 0}%</span>
                          </div>
                          <Progress value={Number(monitor.successRate) || 0} className="h-2" />
                        </div>
                        <Badge className={getStatusColor(monitor.status || "unknown")}>
                          {(monitor.status || "unknown").replace("_", " ")}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {alertsLoading ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading alerts...
              </CardContent>
            </Card>
          ) : alerts.length === 0 ? (
            <EmptyState 
              title="No Alerts"
              description="When control monitors detect issues, alerts will appear here for you to acknowledge and resolve."
              icon={Bell}
            />
          ) : (
            <div className="grid gap-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className={`glass-card ${!alert.acknowledgedAt ? 'border-red-500/50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <AlertTriangle className={`w-5 h-5 ${
                          alert.severity === 'critical' ? 'text-red-500' :
                          alert.severity === 'high' ? 'text-orange-500' : 'text-amber-500'
                        }`} />
                        <div>
                          <h3 className="font-semibold">{alert.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Monitor: {alert.monitorId} • {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {alert.severity}
                        </Badge>
                        {!alert.acknowledgedAt && (
                          <Button size="sm" data-testid={`button-acknowledge-${alert.id}`}>
                            Acknowledge
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

        <TabsContent value="analytics">
          <EmptyState 
            title="No Analytics Data Yet"
            description="Once you have control monitors running, you'll see historical trends and analytics here."
            icon={BarChart3}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
