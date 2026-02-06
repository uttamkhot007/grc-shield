import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Bell, Check, CheckCheck, AlertTriangle, ShieldAlert, Info, XCircle, ChevronRight, Eye, Trash2, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTenant } from "@/contexts/tenant-context";
import type { Alert } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface AlertCenterProps {
  showBell?: boolean;
  enableRealTimePolling?: boolean;
  pollingInterval?: number;
}

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

export function AlertCenter({ 
  showBell = true, 
  enableRealTimePolling = true, 
  pollingInterval = 30000 
}: AlertCenterProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { currentTenant } = useTenant();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [previousAlertCount, setPreviousAlertCount] = useState(0);

  const { data: alerts = [], isLoading, refetch } = useQuery<Alert[]>({
    queryKey: ["/api/alerts", currentTenant?.id],
    enabled: !!currentTenant?.id,
    refetchInterval: enableRealTimePolling ? pollingInterval : false,
    refetchIntervalInBackground: true,
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

  const unreadAlerts = alerts.filter((a) => !a.isRead);
  const criticalUnread = unreadAlerts.filter((a) => a.severity === "critical");
  const highUnread = unreadAlerts.filter((a) => a.severity === "high");

  useEffect(() => {
    if (criticalUnread.length > 0 && criticalUnread.length > previousAlertCount) {
      const newCritical = criticalUnread[0];
      toast({
        title: "Critical Alert",
        description: newCritical.title,
        variant: "destructive",
        duration: 10000,
      });
    }
    setPreviousAlertCount(criticalUnread.length);
  }, [criticalUnread.length, previousAlertCount, toast]);

  const filteredAlerts = alerts.filter((alert) => {
    if (filterSeverity !== "all" && alert.severity !== filterSeverity) return false;
    if (filterType !== "all" && alert.type !== filterType) return false;
    return true;
  });

  const handleAlertClick = useCallback((alert: Alert) => {
    if (!alert.isRead) {
      markAsReadMutation.mutate(alert.id);
    }
    if (alert.actionUrl) {
      setIsOpen(false);
      navigate(alert.actionUrl);
    } else {
      setSelectedAlert(alert);
    }
  }, [markAsReadMutation, navigate]);

  const getAlertTypeInfo = (type: string) => {
    return ALERT_TYPES[type as keyof typeof ALERT_TYPES] || ALERT_TYPES.system;
  };

  const getSeverityInfo = (severity: string) => {
    return SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.medium;
  };

  const AlertItem = ({ alert, compact = false }: { alert: Alert; compact?: boolean }) => {
    const typeInfo = getAlertTypeInfo(alert.type);
    const severityInfo = getSeverityInfo(alert.severity || "medium");
    const Icon = typeInfo.icon;

    return (
      <div
        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all hover-elevate ${
          !alert.isRead ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"
        }`}
        onClick={() => handleAlertClick(alert)}
        data-testid={`alert-item-${alert.id}`}
      >
        <div className={`p-2 rounded-lg ${typeInfo.bg}`}>
          <Icon className={`h-4 w-4 ${typeInfo.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {!alert.isRead && <div className={`w-2 h-2 rounded-full ${severityInfo.dot}`} />}
            <span className="font-medium text-sm truncate">{alert.title}</span>
          </div>
          {!compact && alert.message && (
            <p className="text-xs text-muted-foreground line-clamp-2">{alert.message}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className={`text-xs ${severityInfo.badge}`}>
              {alert.severity || "medium"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(alert.createdAt!), { addSuffix: true })}
            </span>
          </div>
        </div>
        {alert.actionUrl && (
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
      </div>
    );
  };

  if (!showBell) {
    return (
      <Card className="card-3d">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Alert Center</CardTitle>
              <CardDescription>
                {unreadAlerts.length} unread alerts
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-[120px]" data-testid="select-severity-filter">
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={unreadAlerts.length === 0}
                data-testid="button-mark-all-read"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark All Read
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {filteredAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No alerts to display</p>
                </div>
              ) : (
                filteredAlerts.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            data-testid="button-alert-center"
          >
            <Bell className="h-5 w-5" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
                {unreadAlerts.length > 99 ? "99+" : unreadAlerts.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="end">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Notifications</h4>
                <p className="text-xs text-muted-foreground">
                  {unreadAlerts.length} unread
                  {criticalUnread.length > 0 && (
                    <span className="text-red-400 ml-1">
                      ({criticalUnread.length} critical)
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => refetch()}
                      disabled={isLoading}
                      data-testid="button-refresh-alerts"
                    >
                      <Clock className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh alerts</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => markAllAsReadMutation.mutate()}
                      disabled={unreadAlerts.length === 0}
                      data-testid="button-mark-all-read-popover"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Mark all as read</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                data-testid="tab-all-alerts"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                data-testid="tab-unread-alerts"
              >
                Unread ({unreadAlerts.length})
              </TabsTrigger>
              <TabsTrigger
                value="critical"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                data-testid="tab-critical-alerts"
              >
                Critical ({criticalUnread.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <ScrollArea className="h-[300px]">
                <div className="p-2 space-y-1">
                  {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">No alerts</p>
                    </div>
                  ) : (
                    alerts.slice(0, 20).map((alert) => (
                      <AlertItem key={alert.id} alert={alert} compact />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="unread" className="mt-0">
              <ScrollArea className="h-[300px]">
                <div className="p-2 space-y-1">
                  {unreadAlerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Check className="h-8 w-8 text-green-500/50 mb-2" />
                      <p className="text-sm text-muted-foreground">All caught up!</p>
                    </div>
                  ) : (
                    unreadAlerts.map((alert) => (
                      <AlertItem key={alert.id} alert={alert} compact />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="critical" className="mt-0">
              <ScrollArea className="h-[300px]">
                <div className="p-2 space-y-1">
                  {criticalUnread.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <ShieldAlert className="h-8 w-8 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">No critical alerts</p>
                    </div>
                  ) : (
                    criticalUnread.map((alert) => (
                      <AlertItem key={alert.id} alert={alert} compact />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <Separator />
          <div className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-center text-sm"
              onClick={() => {
                setIsOpen(false);
                navigate("/alerts");
              }}
              data-testid="button-view-all-alerts"
            >
              View All Alerts
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent>
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
                  {selectedAlert && formatDistanceToNow(new Date(selectedAlert.createdAt!), { addSuffix: true })}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getSeverityInfo(selectedAlert.severity || "medium").badge}>
                  {selectedAlert.severity || "medium"}
                </Badge>
                <Badge variant="outline">
                  {getAlertTypeInfo(selectedAlert.type).label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{selectedAlert.message}</p>
            </div>
          )}
          <DialogFooter>
            {selectedAlert?.actionUrl && (
              <Button
                onClick={() => {
                  setSelectedAlert(null);
                  navigate(selectedAlert.actionUrl!);
                }}
                data-testid="button-go-to-alert"
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
    </>
  );
}

export function AlertBanner() {
  const { currentTenant } = useTenant();
  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ["/api/alerts", currentTenant?.id],
    enabled: !!currentTenant?.id,
  });

  const criticalUnread = alerts.filter((a) => !a.isRead && a.severity === "critical");

  if (criticalUnread.length === 0) return null;

  return (
    <div className="bg-destructive/10 border-b border-destructive/30 px-4 py-2">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-destructive" />
          <span className="text-sm font-medium text-destructive">
            {criticalUnread.length} critical alert{criticalUnread.length !== 1 ? "s" : ""} require immediate attention
          </span>
        </div>
        <Button variant="outline" size="sm" className="border-destructive/50 text-destructive hover:bg-destructive/10">
          View Alerts
        </Button>
      </div>
    </div>
  );
}

export default AlertCenter;
