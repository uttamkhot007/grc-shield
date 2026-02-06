import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Bell, Check, CheckCheck, AlertTriangle, ShieldAlert, Info, XCircle, 
  ChevronRight, Clock, Filter, Search, Trash2, RefreshCw 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTenant } from "@/contexts/tenant-context";
import { useLanguage } from "@/contexts/language-context";
import type { Alert } from "@shared/schema";
import { formatDistanceToNow, format } from "date-fns";

const ALERT_TYPES = {
  risk_critical: { label: "Critical Risk", icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10" },
  risk_high: { label: "High Risk", icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10" },
  compliance_breach: { label: "Compliance Breach", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
  compliance_due: { label: "Compliance Due", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  policy_approval: { label: "Policy Approval", icon: Check, color: "text-blue-500", bg: "bg-blue-500/10" },
  audit_finding: { label: "Audit Finding", icon: AlertTriangle, color: "text-purple-500", bg: "bg-purple-500/10" },
  vendor_risk: { label: "Vendor Risk", icon: ShieldAlert, color: "text-orange-500", bg: "bg-orange-500/10" },
  security_alert: { label: "Security Alert", icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10" },
  system: { label: "System", icon: Info, color: "text-muted-foreground", bg: "bg-muted/50" },
};

const SEVERITY_COLORS = {
  critical: { badge: "bg-red-500/20 text-red-400 border-red-500/30", dot: "bg-red-500" },
  high: { badge: "bg-orange-500/20 text-orange-400 border-orange-500/30", dot: "bg-orange-500" },
  medium: { badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", dot: "bg-yellow-500" },
  low: { badge: "bg-green-500/20 text-green-400 border-green-500/30", dot: "bg-green-500" },
};

export default function AlertsPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { currentTenant } = useTenant();
  const { t } = useLanguage();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);

  const { data: alerts = [], isLoading, refetch } = useQuery<Alert[]>({
    queryKey: ["/api/alerts", currentTenant?.id],
    enabled: !!currentTenant?.id,
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return apiRequest("PATCH", `/api/alerts/${alertId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts", currentTenant?.id] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadAlerts = alerts.filter((a) => !a.isRead);
      await Promise.all(unreadAlerts.map((a) => apiRequest("PATCH", `/api/alerts/${a.id}/read`)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts", currentTenant?.id] });
      toast({ title: "All alerts marked as read" });
    },
  });

  const markSelectedAsReadMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(selectedAlerts.map((id) => apiRequest("PATCH", `/api/alerts/${id}/read`)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts", currentTenant?.id] });
      setSelectedAlerts([]);
      toast({ title: `${selectedAlerts.length} alerts marked as read` });
    },
  });

  const filteredAlerts = alerts.filter((alert) => {
    if (filterSeverity !== "all" && alert.severity !== filterSeverity) return false;
    if (filterType !== "all" && alert.type !== filterType) return false;
    if (filterStatus === "unread" && alert.isRead) return false;
    if (filterStatus === "read" && !alert.isRead) return false;
    if (searchQuery && !alert.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !alert.message?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const unreadAlerts = alerts.filter((a) => !a.isRead);
  const criticalAlerts = alerts.filter((a) => a.severity === "critical");
  const highAlerts = alerts.filter((a) => a.severity === "high");

  const getAlertTypeInfo = (type: string) => {
    return ALERT_TYPES[type as keyof typeof ALERT_TYPES] || ALERT_TYPES.system;
  };

  const getSeverityInfo = (severity: string) => {
    return SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.medium;
  };

  const handleAlertClick = (alert: Alert) => {
    if (!alert.isRead) {
      markAsReadMutation.mutate(alert.id);
    }
    setSelectedAlert(alert);
  };

  const toggleAlertSelection = (alertId: string) => {
    setSelectedAlerts((prev) =>
      prev.includes(alertId)
        ? prev.filter((id) => id !== alertId)
        : [...prev, alertId]
    );
  };

  const selectAllFiltered = () => {
    const unreadFiltered = filteredAlerts.filter((a) => !a.isRead);
    setSelectedAlerts(unreadFiltered.map((a) => a.id));
  };

  const AlertCard = ({ alert }: { alert: Alert }) => {
    const typeInfo = getAlertTypeInfo(alert.type);
    const severityInfo = getSeverityInfo(alert.severity || "medium");
    const Icon = typeInfo.icon;
    const isSelected = selectedAlerts.includes(alert.id);

    return (
      <Card 
        className={`cursor-pointer transition-all hover-elevate ${
          !alert.isRead ? "border-primary/30 bg-primary/5" : ""
        } ${isSelected ? "ring-2 ring-primary" : ""}`}
        onClick={() => handleAlertClick(alert)}
        data-testid={`alert-card-${alert.id}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleAlertSelection(alert.id)}
              onClick={(e) => e.stopPropagation()}
              data-testid={`checkbox-alert-${alert.id}`}
            />
            <div className={`p-2 rounded-lg ${typeInfo.bg} flex-shrink-0`}>
              <Icon className={`h-5 w-5 ${typeInfo.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {!alert.isRead && <div className={`w-2 h-2 rounded-full ${severityInfo.dot} flex-shrink-0`} />}
                <h4 className="font-medium truncate">{alert.title}</h4>
              </div>
              {alert.message && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{alert.message}</p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={severityInfo.badge}>
                  {alert.severity || "medium"}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {typeInfo.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(alert.createdAt!), { addSuffix: true })}
                </span>
              </div>
            </div>
            {alert.actionUrl && (
              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="mesh-gradient min-h-full">
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-alerts-title">Alert Center</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and manage real-time GRC alerts and notifications
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
              data-testid="button-refresh-alerts"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={unreadAlerts.length === 0}
              data-testid="button-mark-all-read"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="stat-gradient-default">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Bell className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{alerts.length}</p>
                  <p className="text-xs text-muted-foreground">Total Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-gradient-amber">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{unreadAlerts.length}</p>
                  <p className="text-xs text-muted-foreground">Unread</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-gradient-red">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{criticalAlerts.length}</p>
                  <p className="text-xs text-muted-foreground">Critical</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-gradient-amber">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{highAlerts.length}</p>
                  <p className="text-xs text-muted-foreground">High Priority</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-3d">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>All Alerts</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search alerts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-[200px]"
                    data-testid="input-search-alerts"
                  />
                </div>
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="w-[130px]" data-testid="select-filter-severity">
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
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[150px]" data-testid="select-filter-type">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="risk_critical">Critical Risk</SelectItem>
                    <SelectItem value="risk_high">High Risk</SelectItem>
                    <SelectItem value="compliance_breach">Compliance Breach</SelectItem>
                    <SelectItem value="compliance_due">Compliance Due</SelectItem>
                    <SelectItem value="policy_approval">Policy Approval</SelectItem>
                    <SelectItem value="audit_finding">Audit Finding</SelectItem>
                    <SelectItem value="vendor_risk">Vendor Risk</SelectItem>
                    <SelectItem value="security_alert">Security Alert</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[120px]" data-testid="select-filter-status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {selectedAlerts.length > 0 && (
              <div className="flex items-center gap-2 pt-2">
                <Badge variant="secondary">{selectedAlerts.length} selected</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markSelectedAsReadMutation.mutate()}
                  data-testid="button-mark-selected-read"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark Selected Read
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAlerts([])}
                  data-testid="button-clear-selection"
                >
                  Clear Selection
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAllFiltered}
                  data-testid="button-select-all"
                >
                  Select All Unread
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No alerts match your filters</p>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setFilterSeverity("all");
                    setFilterType("all");
                    setFilterStatus("all");
                    setSearchQuery("");
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {selectedAlert && (
                <div className={`p-2 rounded-lg ${getAlertTypeInfo(selectedAlert.type).bg}`}>
                  {(() => {
                    const Icon = getAlertTypeInfo(selectedAlert.type).icon;
                    return <Icon className={`h-5 w-5 ${getAlertTypeInfo(selectedAlert.type).color}`} />;
                  })()}
                </div>
              )}
              <div>
                <DialogTitle>{selectedAlert?.title}</DialogTitle>
                <DialogDescription>
                  {selectedAlert && format(new Date(selectedAlert.createdAt!), "PPpp")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={getSeverityInfo(selectedAlert.severity || "medium").badge}>
                  {selectedAlert.severity || "medium"}
                </Badge>
                <Badge variant="outline">
                  {getAlertTypeInfo(selectedAlert.type).label}
                </Badge>
                {selectedAlert.isRead ? (
                  <Badge variant="secondary">Read</Badge>
                ) : (
                  <Badge variant="default">Unread</Badge>
                )}
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">Message</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedAlert.message || "No additional details available."}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            {selectedAlert?.actionUrl && (
              <Button
                onClick={() => {
                  setSelectedAlert(null);
                  navigate(selectedAlert.actionUrl!);
                }}
                data-testid="button-go-to-details"
              >
                Go to Details
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            <Button variant="outline" onClick={() => setSelectedAlert(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
