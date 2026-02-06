import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Shield, FileText, Users, AlertTriangle, Globe, Brain, TrendingUp,
  Clock, CheckCircle2, XCircle, Eye, BarChart3, Sparkles, Activity,
  Lock, Database, ArrowRight, RefreshCw
} from "lucide-react";
import { useTenant } from "@/contexts/tenant-context";
import type { RopaEntry, DsrRequest, Dpia, BreachIncident, ConsentRecord, DataMapping } from "@shared/schema";

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendDirection,
  color = "primary"
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  icon: React.ElementType;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  color?: "primary" | "destructive" | "chart-1" | "chart-2" | "chart-3";
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    destructive: "bg-destructive/10 text-destructive",
    "chart-1": "bg-chart-1/10 text-chart-1",
    "chart-2": "bg-chart-2/10 text-chart-2",
    "chart-3": "bg-chart-3/10 text-chart-3",
  };

  return (
    <Card className="card-3d">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={`p-2.5 rounded-xl ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <Badge variant="outline" className={`text-xs ${trendDirection === "up" ? "text-chart-2" : trendDirection === "down" ? "text-destructive" : ""}`}>
              {trend}
            </Badge>
          )}
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-sm font-medium text-foreground mt-1">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function RiskIndicator({ level, label }: { level: "low" | "medium" | "high" | "critical"; label: string }) {
  const colors = {
    low: "bg-chart-2 text-chart-2",
    medium: "bg-chart-1 text-chart-1", 
    high: "bg-orange-500 text-orange-500",
    critical: "bg-destructive text-destructive"
  };
  const widths = { low: 25, medium: 50, high: 75, critical: 100 };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-medium capitalize ${colors[level].split(" ")[1]}`}>{level}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${colors[level].split(" ")[0]}`}
          style={{ width: `${widths[level]}%` }}
        />
      </div>
    </div>
  );
}

export default function PrivacyDashboard() {
  const { currentTenantId } = useTenant();

  const { data: ropaEntries = [] } = useQuery<RopaEntry[]>({
    queryKey: ["/api/ropa", currentTenantId],
  });

  const { data: dsrRequests = [] } = useQuery<DsrRequest[]>({
    queryKey: ["/api/dsr", currentTenantId],
  });

  const { data: dpias = [] } = useQuery<Dpia[]>({
    queryKey: ["/api/dpias", currentTenantId],
  });

  const { data: breaches = [] } = useQuery<BreachIncident[]>({
    queryKey: ["/api/breaches", currentTenantId],
  });

  const { data: consents = [] } = useQuery<ConsentRecord[]>({
    queryKey: ["/api/consents", currentTenantId],
  });

  const { data: dataMappings = [] } = useQuery<DataMapping[]>({
    queryKey: ["/api/data-mappings", currentTenantId],
  });

  const metrics = useMemo(() => {
    const openDsrs = dsrRequests.filter(d => !["completed", "rejected", "cancelled"].includes(d.status || ""));
    const overdueDsrs = openDsrs.filter(d => {
      if (!d.dueDate) return false;
      return new Date(d.dueDate) < new Date();
    });
    const activeDpias = dpias.filter(d => d.status !== "approved");
    const highRiskDpias = dpias.filter(d => (d as any).overallRiskLevel === "high" || (d as any).overallRiskLevel === "critical");
    const activeBreaches = breaches.filter(b => !["closed", "recovered"].includes(b.status || ""));
    const crossBorderFlows = dataMappings.filter(dm => dm.crossBorder);
    const activeConsents = consents.filter(c => c.status === "granted");
    const withdrawnConsents = consents.filter(c => c.status === "withdrawn");

    const dsrSlaCompliance = dsrRequests.length > 0 
      ? Math.round((dsrRequests.filter(d => d.status === "completed" && !overdueDsrs.includes(d)).length / dsrRequests.length) * 100)
      : 100;

    return {
      totalRopa: ropaEntries.length,
      openDsrs: openDsrs.length,
      overdueDsrs: overdueDsrs.length,
      dsrSlaCompliance,
      activeDpias: activeDpias.length,
      highRiskDpias: highRiskDpias.length,
      activeBreaches: activeBreaches.length,
      crossBorderFlows: crossBorderFlows.length,
      totalDataMappings: dataMappings.length,
      activeConsents: activeConsents.length,
      withdrawnConsents: withdrawnConsents.length,
      consentRate: consents.length > 0 ? Math.round((activeConsents.length / consents.length) * 100) : 0,
    };
  }, [ropaEntries, dsrRequests, dpias, breaches, dataMappings, consents]);

  const privacyScore = useMemo(() => {
    let score = 100;
    if (metrics.overdueDsrs > 0) score -= 20;
    if (metrics.activeBreaches > 0) score -= 25;
    if (metrics.highRiskDpias > 0) score -= 15;
    if (metrics.dsrSlaCompliance < 90) score -= 10;
    if (metrics.totalRopa < 5) score -= 10;
    return Math.max(0, score);
  }, [metrics]);

  const topRisks = useMemo(() => {
    const risks = [];
    if (metrics.overdueDsrs > 0) {
      risks.push({ title: "Overdue DSR Requests", description: `${metrics.overdueDsrs} requests past deadline`, severity: "critical" as const, action: "Review DSRs" });
    }
    if (metrics.activeBreaches > 0) {
      risks.push({ title: "Active Breach Incidents", description: `${metrics.activeBreaches} unresolved breaches`, severity: "critical" as const, action: "Investigate" });
    }
    if (metrics.highRiskDpias > 0) {
      risks.push({ title: "High-Risk Processing", description: `${metrics.highRiskDpias} DPIAs flagged high risk`, severity: "high" as const, action: "Review DPIAs" });
    }
    if (metrics.crossBorderFlows > 3) {
      risks.push({ title: "Cross-Border Exposure", description: `${metrics.crossBorderFlows} transfers to third countries`, severity: "medium" as const, action: "Review transfers" });
    }
    return risks.slice(0, 5);
  }, [metrics]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Privacy Command Center</h1>
          <p className="text-muted-foreground">Real-time privacy posture and compliance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-refresh-privacy">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button className="btn-gradient" data-testid="button-ai-analysis">
            <Sparkles className="h-4 w-4 mr-2" /> AI Analysis
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card className="card-3d col-span-1 lg:col-span-1 bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="p-6 flex flex-col items-center justify-center h-full">
            <div className="relative mb-4">
              <svg className="w-32 h-32 -rotate-90">
                <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                <circle 
                  cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="8" 
                  className={privacyScore >= 80 ? "text-chart-2" : privacyScore >= 60 ? "text-chart-1" : "text-destructive"}
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - privacyScore / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-bold">{privacyScore}</p>
                  <p className="text-xs text-muted-foreground">Privacy Score</p>
                </div>
              </div>
            </div>
            <p className={`text-sm font-medium ${privacyScore >= 80 ? "text-chart-2" : privacyScore >= 60 ? "text-chart-1" : "text-destructive"}`}>
              {privacyScore >= 80 ? "Strong Posture" : privacyScore >= 60 ? "Needs Attention" : "At Risk"}
            </p>
          </CardContent>
        </Card>

        <div className="col-span-1 lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard 
            title="RoPA Records" 
            value={metrics.totalRopa} 
            subtitle="Processing activities"
            icon={FileText} 
            color="primary"
          />
          <MetricCard 
            title="Open DSRs" 
            value={metrics.openDsrs} 
            subtitle={metrics.overdueDsrs > 0 ? `${metrics.overdueDsrs} overdue` : "All on track"}
            icon={Users} 
            color={metrics.overdueDsrs > 0 ? "destructive" : "chart-2"}
          />
          <MetricCard 
            title="Active Breaches" 
            value={metrics.activeBreaches} 
            subtitle="Requiring action"
            icon={AlertTriangle} 
            color={metrics.activeBreaches > 0 ? "destructive" : "chart-2"}
          />
          <MetricCard 
            title="Cross-Border" 
            value={metrics.crossBorderFlows} 
            subtitle="Data transfers"
            icon={Globe} 
            color="chart-1"
          />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="risks" data-testid="tab-risks">Top Risks</TabsTrigger>
          <TabsTrigger value="compliance" data-testid="tab-compliance">Compliance</TabsTrigger>
          <TabsTrigger value="ai-insights" data-testid="tab-ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="card-3d">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" /> DSR Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">SLA Compliance</span>
                  <span className="text-2xl font-bold">{metrics.dsrSlaCompliance}%</span>
                </div>
                <Progress value={metrics.dsrSlaCompliance} className="h-2" />
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold">{dsrRequests.filter(d => d.requestType === "access").length}</p>
                    <p className="text-xs text-muted-foreground">Access</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold">{dsrRequests.filter(d => d.requestType === "erasure").length}</p>
                    <p className="text-xs text-muted-foreground">Erasure</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold">{dsrRequests.filter(d => d.requestType === "portability").length}</p>
                    <p className="text-xs text-muted-foreground">Portability</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-3d">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" /> DPIA Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-chart-2" /> Approved
                  </span>
                  <span className="font-medium">{dpias.filter(d => d.status === "approved").length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-chart-1" /> In Review
                  </span>
                  <span className="font-medium">{dpias.filter(d => d.status === "in_review").length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" /> Requires Mitigation
                  </span>
                  <span className="font-medium">{dpias.filter(d => d.status === "requires_mitigation").length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground" /> Draft
                  </span>
                  <span className="font-medium">{dpias.filter(d => d.status === "draft").length}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-3d">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Consent Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Consent Rate</span>
                  <span className="text-2xl font-bold">{metrics.consentRate}%</span>
                </div>
                <Progress value={metrics.consentRate} className="h-2" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-chart-2/10 rounded-lg text-center">
                    <p className="text-lg font-bold text-chart-2">{metrics.activeConsents}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div className="p-2 bg-destructive/10 rounded-lg text-center">
                    <p className="text-lg font-bold text-destructive">{metrics.withdrawnConsents}</p>
                    <p className="text-xs text-muted-foreground">Withdrawn</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="card-3d">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-4 w-4" /> Data Flow Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Database className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Internal Flows</p>
                        <p className="text-xs text-muted-foreground">Within organization</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold">{dataMappings.filter(dm => !dm.crossBorder).length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-chart-1/10 rounded-lg">
                        <Globe className="h-4 w-4 text-chart-1" />
                      </div>
                      <div>
                        <p className="font-medium">Cross-Border</p>
                        <p className="text-xs text-muted-foreground">International transfers</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold">{metrics.crossBorderFlows}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-chart-3/10 rounded-lg">
                        <Users className="h-4 w-4 text-chart-3" />
                      </div>
                      <div>
                        <p className="font-medium">Third-Party</p>
                        <p className="text-xs text-muted-foreground">External processors</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold">{dataMappings.filter(dm => dm.destinationType === "third_party").length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-3d">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Privacy Risk Indicators
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RiskIndicator 
                  level={metrics.activeBreaches > 0 ? "critical" : "low"} 
                  label="Breach Risk" 
                />
                <RiskIndicator 
                  level={metrics.overdueDsrs > 2 ? "high" : metrics.overdueDsrs > 0 ? "medium" : "low"} 
                  label="DSR Compliance" 
                />
                <RiskIndicator 
                  level={metrics.crossBorderFlows > 5 ? "high" : metrics.crossBorderFlows > 2 ? "medium" : "low"} 
                  label="Transfer Exposure" 
                />
                <RiskIndicator 
                  level={metrics.highRiskDpias > 0 ? "high" : "low"} 
                  label="Processing Risk" 
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card className="card-3d">
            <CardHeader>
              <CardTitle>Top Privacy Risks</CardTitle>
              <CardDescription>Critical items requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              {topRisks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-chart-2 mx-auto mb-3" />
                  <p className="text-lg font-medium">No Critical Risks</p>
                  <p className="text-sm text-muted-foreground">Your privacy posture is healthy</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topRisks.map((risk, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border-l-4 border-l-destructive">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${risk.severity === "critical" ? "bg-destructive/10" : risk.severity === "high" ? "bg-orange-500/10" : "bg-chart-1/10"}`}>
                          <AlertTriangle className={`h-5 w-5 ${risk.severity === "critical" ? "text-destructive" : risk.severity === "high" ? "text-orange-500" : "text-chart-1"}`} />
                        </div>
                        <div>
                          <p className="font-medium">{risk.title}</p>
                          <p className="text-sm text-muted-foreground">{risk.description}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        {risk.action} <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "GDPR", score: 87, articles: "Art. 5, 6, 7, 12-22, 30, 32-35" },
              { name: "DPDP Act", score: 72, articles: "Sec. 4-11" },
              { name: "CCPA/CPRA", score: 91, articles: "1798.100-199" },
              { name: "PDPL", score: 68, articles: "Art. 5-23" },
            ].map((reg) => (
              <Card key={reg.name} className="card-3d">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium">{reg.name}</p>
                    <Badge variant={reg.score >= 80 ? "default" : reg.score >= 60 ? "secondary" : "destructive"}>
                      {reg.score}%
                    </Badge>
                  </div>
                  <Progress value={reg.score} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">{reg.articles}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-4">
          <Card className="card-3d bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" /> AI Privacy Intelligence
              </CardTitle>
              <CardDescription>Predictive insights and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-chart-1" />
                    <p className="font-medium">DSR Trend Prediction</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on historical patterns, expect a 15% increase in access requests next quarter. Consider automating identity verification.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <p className="font-medium">Risk Data Combinations</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Detected potential re-identification risk in marketing analytics dataset. Recommend additional anonymization.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-chart-3" />
                    <p className="font-medium">Retention Optimization</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    3 datasets exceed their stated retention periods. Data minimization opportunity identified.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-chart-2" />
                    <p className="font-medium">Consent Health</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Consent collection rate improved 8% this month. Marketing purpose has highest opt-in rate at 67%.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
