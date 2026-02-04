import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Shield,
  BookOpen,
  FileText,
  Bell,
  Lightbulb,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Monitor,
  Smartphone,
  Lock,
  Play,
  Download,
  ExternalLink,
  Languages,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TrainingModule, Policy, Alert, UserTraining } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const languages = [
  { code: "en", name: "English" },
  { code: "ar", name: "العربية" },
  { code: "hi", name: "हिन्दी" },
  { code: "zh", name: "中文" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "pt", name: "Português" },
];

const iconMap: Record<string, typeof Shield> = {
  Shield,
  Lock,
  Monitor,
  AlertTriangle,
};

const deviceStatus = {
  laptop: { name: "MacBook Pro", status: "compliant", lastCheck: "2 hours ago", issues: 0 },
  mobile: { name: "iPhone 15", status: "warning", lastCheck: "1 day ago", issues: 1 },
};

export default function EndUserPortal() {
  const [language, setLanguage] = useState("en");
  const tenantId = "demo-tenant";
  const userId = "demo-user";

  const { data: trainingModules = [], isLoading: loadingTraining } = useQuery<TrainingModule[]>({
    queryKey: ["/api/training-modules", { tenantId }],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/training-modules?tenantId=${tenantId}`);
      return res.json();
    },
  });

  const { data: userTrainings = [], isLoading: loadingUserTrainings } = useQuery<UserTraining[]>({
    queryKey: ["/api/user-training", { userId }],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/user-training?userId=${userId}`);
      return res.json();
    },
  });

  const { data: policies = [], isLoading: loadingPolicies } = useQuery<Policy[]>({
    queryKey: ["/api/policies", { tenantId }],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/policies?tenantId=${tenantId}`);
      return res.json();
    },
  });

  const { data: alerts = [], isLoading: loadingAlerts } = useQuery<Alert[]>({
    queryKey: ["/api/alerts", { tenantId, userId }],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/alerts?tenantId=${tenantId}&userId=${userId}`);
      return res.json();
    },
  });

  const { data: cyberTips = [], isLoading: loadingTips } = useQuery<Array<{ id: number; title: string; tip: string; icon: string }>>({
    queryKey: ["/api/cyber-tips", { language }],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/cyber-tips?language=${language}`);
      return res.json();
    },
  });

  const getTrainingProgress = (moduleId: string) => {
    return userTrainings.find((ut) => ut.moduleId === moduleId);
  };

  const completedTrainings = userTrainings.filter((ut) => ut.status === "completed").length;
  const requiredTrainings = trainingModules.filter((t) => t.isRequired).length;
  const acknowledgedPolicies = policies.length > 0 ? Math.floor(policies.length * 0.6) : 0;

  return (
    <div className="flex-1 overflow-auto">
      <div className="mesh-gradient min-h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-portal-title">Security & Compliance Portal</h1>
              <p className="text-muted-foreground mt-1">
                Stay secure, complete training, and access important policies
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[160px]" data-testid="select-language">
                  <Languages className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code} data-testid={`option-lang-${lang.code}`}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Your Compliance Score</p>
                <p className="text-2xl font-bold text-chart-2" data-testid="text-compliance-score">87%</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="stat-gradient-green">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-2/20">
                    <BookOpen className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="text-training-count">
                      {loadingTraining ? "-" : `${completedTrainings}/${trainingModules.length}`}
                    </p>
                    <p className="text-xs text-muted-foreground">Trainings Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-blue">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-1/20">
                    <FileText className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="text-policy-count">
                      {loadingPolicies ? "-" : `${acknowledgedPolicies}/${policies.length}`}
                    </p>
                    <p className="text-xs text-muted-foreground">Policies Acknowledged</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={deviceStatus.laptop.status === "compliant" ? "stat-gradient-green" : "stat-gradient-amber"}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${deviceStatus.laptop.status === "compliant" ? "bg-chart-2/20" : "bg-chart-3/20"}`}>
                    <Monitor className={`h-5 w-5 ${deviceStatus.laptop.status === "compliant" ? "text-chart-2" : "text-chart-3"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{deviceStatus.laptop.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{deviceStatus.laptop.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={deviceStatus.mobile.status === "compliant" ? "stat-gradient-green" : "stat-gradient-amber"}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${deviceStatus.mobile.status === "compliant" ? "bg-chart-2/20" : "bg-chart-3/20"}`}>
                    <Smartphone className={`h-5 w-5 ${deviceStatus.mobile.status === "compliant" ? "text-chart-2" : "text-chart-3"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{deviceStatus.mobile.name}</p>
                    <p className="text-xs text-muted-foreground">{deviceStatus.mobile.issues} issue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="training">
                <TabsList>
                  <TabsTrigger value="training" data-testid="tab-training">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Training
                  </TabsTrigger>
                  <TabsTrigger value="policies" data-testid="tab-policies">
                    <FileText className="h-4 w-4 mr-2" />
                    Policies
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="training" className="mt-4">
                  <Card className="card-3d">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-4">
                        <CardTitle className="text-base font-semibold">
                          Security Training
                        </CardTitle>
                        <Badge variant="secondary">
                          {requiredTrainings - completedTrainings} required pending
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {loadingTraining ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
                          ))}
                        </div>
                      ) : trainingModules.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No training modules available</p>
                      ) : (
                        trainingModules.map((module) => {
                          const userProgress = getTrainingProgress(module.id);
                          const status = userProgress?.status || "pending";
                          const progress = userProgress?.progress || 0;
                          const score = userProgress?.score;
                          
                          return (
                            <div
                              key={module.id}
                              className="flex items-center gap-4 p-4 rounded-lg border border-border hover-elevate cursor-pointer"
                              data-testid={`training-${module.id}`}
                            >
                              <div className={`p-2 rounded-lg ${
                                status === "completed" ? "bg-chart-2/20" :
                                status === "in_progress" ? "bg-chart-3/20" : "bg-muted"
                              }`}>
                                {status === "completed" ? (
                                  <CheckCircle2 className="h-5 w-5 text-chart-2" />
                                ) : status === "in_progress" ? (
                                  <Clock className="h-5 w-5 text-chart-3" />
                                ) : (
                                  <Play className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium truncate">{module.title}</p>
                                  {module.isRequired && (
                                    <Badge variant="destructive" className="text-[10px]">Required</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                  <span className="text-xs text-muted-foreground">{module.duration} min</span>
                                  {status === "completed" && score && (
                                    <span className="text-xs text-chart-2">Score: {score}%</span>
                                  )}
                                  {status === "in_progress" && (
                                    <div className="flex items-center gap-2">
                                      <Progress value={progress} className="w-20 h-1.5" />
                                      <span className="text-xs text-muted-foreground">{progress}%</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant={status === "completed" ? "ghost" : "secondary"}
                                size="sm"
                                data-testid={`button-training-action-${module.id}`}
                              >
                                {status === "completed" ? "Review" : status === "in_progress" ? "Continue" : "Start"}
                              </Button>
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="policies" className="mt-4">
                  <Card className="card-3d">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold">
                        Company Policies
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {loadingPolicies ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
                          ))}
                        </div>
                      ) : policies.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No policies available</p>
                      ) : (
                        policies.map((policy) => (
                          <div
                            key={policy.id}
                            className="flex items-center gap-4 p-4 rounded-lg border border-border hover-elevate cursor-pointer"
                            data-testid={`policy-${policy.id}`}
                          >
                            <div className="p-2 rounded-lg bg-muted">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium truncate">{policy.title}</p>
                              </div>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                <span className="text-xs text-muted-foreground">v{policy.version || "1.0"}</span>
                                <span className="text-xs text-muted-foreground">
                                  Status: {policy.status || "active"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-download-${policy.id}`}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-view-${policy.id}`}>
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card className="card-3d">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base font-semibold">Notifications</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[280px]">
                    <div className="space-y-1 p-4 pt-0">
                      {loadingAlerts ? (
                        <div className="space-y-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                          ))}
                        </div>
                      ) : alerts.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8 text-sm">No notifications</p>
                      ) : (
                        alerts.slice(0, 5).map((alert) => (
                          <div
                            key={alert.id}
                            className="p-3 rounded-lg hover-elevate cursor-pointer"
                            data-testid={`notification-${alert.id}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-1.5 rounded-full ${
                                alert.severity === "critical" || alert.severity === "high" ? "bg-chart-5/20" : "bg-chart-1/20"
                              }`}>
                                <AlertTriangle className={`h-3 w-3 ${
                                  alert.severity === "critical" || alert.severity === "high" ? "text-chart-5" : "text-chart-1"
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{alert.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{alert.message}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="card-3d overflow-hidden">
                <CardHeader className="pb-2 bg-gradient-to-r from-chart-1/10 to-chart-4/10">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-chart-3" />
                    <CardTitle className="text-base font-semibold">Cyber Tips</CardTitle>
                    <Badge variant="secondary" className="ml-auto text-[10px]">
                      {languages.find(l => l.code === language)?.name}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loadingTips ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    cyberTips.map((tip) => {
                      const IconComponent = iconMap[tip.icon] || Shield;
                      return (
                        <div
                          key={tip.id}
                          className="p-3 rounded-lg bg-muted/50 hover-elevate cursor-pointer"
                          data-testid={`cyber-tip-${tip.id}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 rounded-lg bg-chart-1/20">
                              <IconComponent className="h-3.5 w-3.5 text-chart-1" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{tip.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{tip.tip}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
