import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTenant } from "@/contexts/tenant-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  FileText,
  Bell,
  Search,
  Check,
  ChevronRight,
  Download,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle2,
  Filter,
  X,
  Menu,
  Home,
  Settings,
  Smartphone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Policy, Alert } from "@shared/schema";

const severityColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/20 text-green-400 border-green-500/30",
};

const severityIcons: Record<string, typeof AlertTriangle> = {
  critical: AlertTriangle,
  high: AlertTriangle,
  medium: Info,
  low: Info,
};

export default function MobilePortal() {
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const { toast } = useToast();
  const { currentTenant } = useTenant();

  const { data: policies = [], isLoading: loadingPolicies } = useQuery<Policy[]>({
    queryKey: [`/api/policies?tenantId=${currentTenant?.id}`],
    enabled: !!currentTenant?.id,
  });

  const { data: alerts = [], isLoading: loadingAlerts } = useQuery<Alert[]>({
    queryKey: [`/api/alerts?tenantId=${currentTenant?.id}`],
    enabled: !!currentTenant?.id,
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return apiRequest("PATCH", `/api/alerts/${alertId}/acknowledge`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/alerts?tenantId=${currentTenant?.id}`] });
      toast({
        title: "Alert Acknowledged",
        description: "The alert has been marked as read.",
      });
      setSelectedAlert(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to acknowledge alert.",
        variant: "destructive",
      });
    },
  });

  const unreadAlerts = alerts.filter(a => !a.isRead);
  const categories = Array.from(new Set(policies.map(p => p.category).filter(Boolean))) as string[];

  const filteredPolicies = policies.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDownloadPolicy = (policy: Policy) => {
    const content = `# ${policy.title}\n\n${policy.description || ""}\n\n${policy.content || ""}`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${policy.title.replace(/\s+/g, "_")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Download Started",
      description: "Policy document is being downloaded.",
    });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">GRC Mobile</span>
          </div>
          <div className="flex items-center gap-2">
            {unreadAlerts.length > 0 && (
              <Badge variant="destructive" className="rounded-full px-2 py-0.5 text-xs">
                {unreadAlerts.length}
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={() => setActiveTab("settings")}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {currentTenant && (
          <p className="text-xs text-muted-foreground mt-1">{currentTenant.name}</p>
        )}
      </header>

      <main className="flex-1 overflow-hidden">
        {activeTab === "home" && (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Card
                  className="cursor-pointer hover-elevate"
                  onClick={() => setActiveTab("policies")}
                  data-testid="card-policies-quick"
                >
                  <CardContent className="p-4 flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-medium text-sm">Policies</span>
                    <Badge variant="secondary" className="text-xs">
                      {policies.length}
                    </Badge>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover-elevate"
                  onClick={() => setActiveTab("alerts")}
                  data-testid="card-alerts-quick"
                >
                  <CardContent className="p-4 flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center relative">
                      <Bell className="h-6 w-6 text-orange-400" />
                      {unreadAlerts.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                          {unreadAlerts.length}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-sm">Alerts</span>
                    <Badge variant="secondary" className="text-xs">
                      {alerts.length}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4 text-orange-400" />
                    Recent Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {loadingAlerts ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : unreadAlerts.length === 0 ? (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      No unread alerts
                    </p>
                  ) : (
                    unreadAlerts.slice(0, 3).map((alert) => {
                      const SeverityIcon = severityIcons[alert.severity || "medium"];
                      return (
                        <div
                          key={alert.id}
                          className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 cursor-pointer hover-elevate"
                          onClick={() => {
                            setSelectedAlert(alert);
                            setActiveTab("alerts");
                          }}
                          data-testid={`alert-item-${alert.id}`}
                        >
                          <SeverityIcon className={`h-4 w-4 ${alert.severity === "critical" || alert.severity === "high" ? "text-orange-400" : "text-yellow-400"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{alert.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(alert.createdAt!).toLocaleDateString()}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Recent Policies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {loadingPolicies ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : policies.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No policies available</p>
                  ) : (
                    policies.slice(0, 3).map((policy) => (
                      <div
                        key={policy.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 cursor-pointer hover-elevate"
                        onClick={() => {
                          setSelectedPolicy(policy);
                          setActiveTab("policies");
                        }}
                        data-testid={`policy-item-${policy.id}`}
                      >
                        <FileText className="h-4 w-4 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{policy.title}</p>
                          <p className="text-xs text-muted-foreground">{policy.category}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        )}

        {activeTab === "policies" && (
          <div className="flex flex-col h-full">
            <div className="p-4 space-y-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search policies..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-policies"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger data-testid="select-category-filter">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat || "uncategorized"}>
                      {cat || "Uncategorized"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {loadingPolicies ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Loading policies...</p>
                ) : filteredPolicies.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No policies found</p>
                ) : (
                  filteredPolicies.map((policy) => (
                    <Card
                      key={policy.id}
                      className="cursor-pointer hover-elevate"
                      onClick={() => setSelectedPolicy(policy)}
                      data-testid={`policy-card-${policy.id}`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{policy.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {policy.description || "No description"}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {policy.category || "General"}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className={`text-xs ${
                                  policy.status === "active"
                                    ? "bg-green-500/20 text-green-400"
                                    : policy.status === "draft"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-muted"
                                }`}
                              >
                                {policy.status}
                              </Badge>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border">
              <Tabs defaultValue="unread" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="unread" data-testid="tab-unread-alerts">
                    Unread ({unreadAlerts.length})
                  </TabsTrigger>
                  <TabsTrigger value="all" data-testid="tab-all-alerts">
                    All ({alerts.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {loadingAlerts ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Loading alerts...</p>
                ) : alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No alerts</p>
                  </div>
                ) : (
                  alerts.map((alert) => {
                    const SeverityIcon = severityIcons[alert.severity || "medium"];
                    return (
                      <Card
                        key={alert.id}
                        className={`cursor-pointer hover-elevate ${!alert.isRead ? "border-l-4 border-l-orange-500" : ""}`}
                        onClick={() => setSelectedAlert(alert)}
                        data-testid={`alert-card-${alert.id}`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${severityColors[alert.severity || "medium"]}`}>
                              <SeverityIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm truncate">{alert.title}</p>
                                {!alert.isRead && (
                                  <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {alert.message || "No details"}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={`text-xs ${severityColors[alert.severity || "medium"]}`}>
                                  {alert.severity || "Medium"}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(alert.createdAt!).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {activeTab === "settings" && (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Mobile App Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Push Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive alerts on your device</p>
                    </div>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Offline Mode</p>
                      <p className="text-xs text-muted-foreground">Access policies offline</p>
                    </div>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    GRC Shield Mobile App v1.0.0
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Access your organization's policies and compliance alerts on the go.
                  </p>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        )}
      </main>

      <nav className="sticky bottom-0 z-50 bg-card border-t border-border">
        <div className="flex items-center justify-around py-2">
          <Button
            variant={activeTab === "home" ? "secondary" : "ghost"}
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => setActiveTab("home")}
            data-testid="nav-home"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant={activeTab === "policies" ? "secondary" : "ghost"}
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => setActiveTab("policies")}
            data-testid="nav-policies"
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs">Policies</span>
          </Button>
          <Button
            variant={activeTab === "alerts" ? "secondary" : "ghost"}
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2 relative"
            onClick={() => setActiveTab("alerts")}
            data-testid="nav-alerts"
          >
            <Bell className="h-5 w-5" />
            {unreadAlerts.length > 0 && (
              <span className="absolute top-1 right-1/4 h-2 w-2 rounded-full bg-red-500" />
            )}
            <span className="text-xs">Alerts</span>
          </Button>
          <Button
            variant={activeTab === "settings" ? "secondary" : "ghost"}
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => setActiveTab("settings")}
            data-testid="nav-settings"
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>
      </nav>

      <Sheet open={!!selectedPolicy} onOpenChange={() => setSelectedPolicy(null)}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
          {selectedPolicy && (
            <>
              <SheetHeader className="text-left">
                <SheetTitle className="text-lg pr-8">{selectedPolicy.title}</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-full mt-4 pb-20">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{selectedPolicy.category || "General"}</Badge>
                    <Badge
                      className={`${
                        selectedPolicy.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {selectedPolicy.status}
                    </Badge>
                    {selectedPolicy.version && (
                      <Badge variant="secondary">v{selectedPolicy.version}</Badge>
                    )}
                  </div>

                  {selectedPolicy.description && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">{selectedPolicy.description}</p>
                    </div>
                  )}

                  {selectedPolicy.effectiveDate && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Effective Date</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedPolicy.effectiveDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {selectedPolicy.content && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Content</h4>
                      <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-muted-foreground whitespace-pre-wrap">
                        {selectedPolicy.content.substring(0, 2000)}
                        {selectedPolicy.content.length > 2000 && "..."}
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={() => handleDownloadPolicy(selectedPolicy)}
                    data-testid="button-download-policy"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Policy
                  </Button>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <SheetContent side="bottom" className="h-[70vh] rounded-t-xl">
          {selectedAlert && (
            <>
              <SheetHeader className="text-left">
                <SheetTitle className="text-lg pr-8">{selectedAlert.title}</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-full mt-4 pb-20">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={severityColors[selectedAlert.severity || "medium"]}>
                      {selectedAlert.severity || "Medium"} Severity
                    </Badge>
                    {!selectedAlert.isRead && (
                      <Badge variant="secondary">Unread</Badge>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Type</h4>
                    <p className="text-sm text-muted-foreground">{selectedAlert.type}</p>
                  </div>

                  {selectedAlert.message && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Details</h4>
                      <p className="text-sm text-muted-foreground">{selectedAlert.message}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium mb-1">Received</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedAlert.createdAt!).toLocaleString()}
                    </p>
                  </div>

                  {!selectedAlert.isRead && (
                    <Button
                      className="w-full"
                      onClick={() => acknowledgeAlertMutation.mutate(selectedAlert.id)}
                      disabled={acknowledgeAlertMutation.isPending}
                      data-testid="button-acknowledge-alert"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {acknowledgeAlertMutation.isPending ? "Acknowledging..." : "Acknowledge Alert"}
                    </Button>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
