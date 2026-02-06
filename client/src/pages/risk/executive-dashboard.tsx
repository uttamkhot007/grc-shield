import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Shield,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart,
  Zap,
  Clock,
  DollarSign,
  Users,
  Building2,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Layers,
  CheckCircle2,
  XCircle,
  Gauge,
  Brain,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenant } from "@/contexts/tenant-context";
import type { Risk, RiskScenario, RiskAggregation, Control } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const riskLevelStyles = {
  critical: { bg: "bg-destructive", text: "text-white", border: "border-destructive", light: "bg-destructive/10" },
  high: { bg: "bg-chart-3", text: "text-white", border: "border-chart-3", light: "bg-chart-3/10" },
  medium: { bg: "bg-chart-1", text: "text-white", border: "border-chart-1", light: "bg-chart-1/10" },
  low: { bg: "bg-chart-2", text: "text-white", border: "border-chart-2", light: "bg-chart-2/10" },
};

function getRiskLevel(score: number): string {
  if (score >= 16) return "critical";
  if (score >= 9) return "high";
  if (score >= 4) return "medium";
  return "low";
}

function ExecutiveMetricCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendLabel, 
  icon: Icon, 
  iconBg 
}: { 
  title: string; 
  value: string | number; 
  subtitle: string; 
  trend?: "up" | "down" | "stable"; 
  trendLabel?: string;
  icon: any;
  iconBg: string;
}) {
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const trendColor = trend === "up" ? "text-destructive" : trend === "down" ? "text-chart-2" : "text-muted-foreground";

  return (
    <Card className="card-3d">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-xl ${iconBg}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {trend && trendLabel && (
          <div className={`flex items-center gap-1 mt-3 ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{trendLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TopRisksTable({ risks }: { risks: Risk[] }) {
  const topRisks = useMemo(() => {
    return [...risks]
      .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
      .slice(0, 5);
  }, [risks]);

  return (
    <Card className="card-3d">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Top Enterprise Risks
        </CardTitle>
        <CardDescription>Highest scored risks requiring executive attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topRisks.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No risks identified</p>
          ) : (
            topRisks.map((risk, index) => {
              const riskLevel = getRiskLevel(risk.riskScore || 0);
              const style = riskLevelStyles[riskLevel as keyof typeof riskLevelStyles];
              return (
                <div key={risk.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${style.bg} ${style.text}`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{risk.title}</p>
                    <p className="text-xs text-muted-foreground">{risk.category}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={`${style.bg} ${style.text} border-0`}>
                      Score: {risk.riskScore || 0}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <Link href="/risk/register">
          <Button variant="ghost" className="w-full mt-4" data-testid="link-view-all-risks">
            View All Risks <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function RiskDistributionChart({ risks }: { risks: Risk[] }) {
  const distribution = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    risks.forEach(risk => {
      const level = getRiskLevel(risk.riskScore || 0);
      counts[level as keyof typeof counts]++;
    });
    return counts;
  }, [risks]);

  const total = risks.length || 1;

  return (
    <Card className="card-3d">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          Risk Distribution
        </CardTitle>
        <CardDescription>Current risk landscape by severity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(distribution).map(([level, count]) => {
            const style = riskLevelStyles[level as keyof typeof riskLevelStyles];
            const percent = Math.round((count / total) * 100);
            return (
              <div key={level}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${style.bg}`} />
                    <span className="text-sm font-medium capitalize">{level}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{count} ({percent}%)</span>
                </div>
                <Progress value={percent} className={`h-2`} />
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Risk Velocity Index</span>
            <Badge variant="outline" className="capitalize">Moderate</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Based on recent risk trend changes</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ControlConfidenceIndex({ controls }: { controls: Control[] }) {
  const metrics = useMemo(() => {
    const implemented = controls.filter(c => c.implementationStatus === "implemented").length;
    const total = controls.length || 1;
    const implementationRate = Math.round((implemented / total) * 100);
    
    const effective = controls.filter(c => 
      c.implementationStatus === "implemented" && 
      (c.testingStatus === "passed" || c.testingStatus === "in_progress")
    ).length;
    const effectivenessRate = implemented > 0 ? Math.round((effective / implemented) * 100) : 0;
    
    const confidenceScore = Math.round((implementationRate * 0.6) + (effectivenessRate * 0.4));
    
    return {
      total,
      implemented,
      implementationRate,
      effectivenessRate,
      confidenceScore,
    };
  }, [controls]);

  return (
    <Card className="card-3d">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-chart-2" />
          Control Confidence Index
        </CardTitle>
        <CardDescription>Combined implementation and effectiveness score</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke={metrics.confidenceScore >= 80 ? "hsl(142, 76%, 36%)" : metrics.confidenceScore >= 60 ? "hsl(43, 96%, 56%)" : "hsl(0, 84%, 60%)"}
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(metrics.confidenceScore / 100) * 352} 352`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{metrics.confidenceScore}</span>
              <span className="text-xs text-muted-foreground">out of 100</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-chart-2" />
              <span className="text-sm">Implementation Rate</span>
            </div>
            <span className="font-medium">{metrics.implementationRate}%</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm">Effectiveness Rate</span>
            </div>
            <span className="font-medium">{metrics.effectivenessRate}%</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Total Controls</span>
            </div>
            <span className="font-medium">{metrics.total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AIPredictiveInsights({ risks, scenarios }: { risks: Risk[]; scenarios: RiskScenario[] }) {
  const insights = useMemo(() => {
    const criticalRisks = risks.filter(r => (r.riskScore || 0) >= 16);
    const overdueRisks = risks.filter(r => r.reviewDate && new Date(r.reviewDate) < new Date());
    const highVelocityScenarios = scenarios.filter(s => s.velocity === "rapid");
    
    return {
      predictions: [
        criticalRisks.length > 3 ? "Elevated systemic risk detected across multiple domains" : null,
        overdueRisks.length > 0 ? `${overdueRisks.length} risks require immediate review` : null,
        highVelocityScenarios.length > 0 ? "Rapid-velocity scenarios may impact response capacity" : null,
      ].filter(Boolean),
      recommendations: [
        criticalRisks.length > 0 ? "Prioritize mitigation for critical risks in IT & Cyber domain" : null,
        "Consider quarterly board risk review based on current landscape",
        "Strengthen control monitoring for high-impact scenarios",
      ].filter(Boolean),
    };
  }, [risks, scenarios]);

  return (
    <Card className="card-3d">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI-Powered Risk Intelligence
        </CardTitle>
        <CardDescription>Predictive analytics and recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-chart-3" />
              Predictive Insights
            </h4>
            <div className="space-y-2">
              {insights.predictions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No critical predictions at this time</p>
              ) : (
                insights.predictions.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-chart-3/10">
                    <AlertTriangle className="h-4 w-4 text-chart-3 mt-0.5" />
                    <p className="text-sm">{insight}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-chart-2" />
              Recommendations
            </h4>
            <div className="space-y-2">
              {insights.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-chart-2/10">
                  <CheckCircle2 className="h-4 w-4 text-chart-2 mt-0.5" />
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RiskTrendSummary({ risks }: { risks: Risk[] }) {
  const summary = useMemo(() => {
    const activeRisks = risks.filter(r => r.status === "active").length;
    const mitigatedRisks = risks.filter(r => r.status === "completed").length;
    const avgScore = risks.length > 0 
      ? Math.round(risks.reduce((sum, r) => sum + (r.riskScore || 0), 0) / risks.length) 
      : 0;
    
    return { activeRisks, mitigatedRisks, avgScore };
  }, [risks]);

  return (
    <Card className="card-3d col-span-2">
      <CardHeader>
        <CardTitle>Executive Risk Summary</CardTitle>
        <CardDescription>Plain English overview for board reporting</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground">
            The organization currently tracks <strong>{risks.length} identified risks</strong> with 
            an average risk score of <strong>{summary.avgScore}/25</strong>. 
            There are <strong>{summary.activeRisks} active risks</strong> requiring ongoing monitoring 
            and <strong>{summary.mitigatedRisks} risks</strong> have been successfully mitigated.
          </p>
          
          <div className="grid grid-cols-3 gap-4 mt-4 not-prose">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold">{risks.filter(r => (r.riskScore || 0) >= 16).length}</p>
              <p className="text-xs text-muted-foreground">Critical Risks</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold">{risks.filter(r => (r.riskScore || 0) >= 9 && (r.riskScore || 0) < 16).length}</p>
              <p className="text-xs text-muted-foreground">High Risks</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold">{risks.filter(r => (r.riskScore || 0) < 9).length}</p>
              <p className="text-xs text-muted-foreground">Moderate/Low</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ExecutiveRiskDashboard() {
  const { currentTenantId } = useTenant();

  const { data: risks = [], isLoading: risksLoading } = useQuery<Risk[]>({
    queryKey: ["/api/risks", currentTenantId],
  });

  const { data: scenarios = [], isLoading: scenariosLoading } = useQuery<RiskScenario[]>({
    queryKey: ["/api/risk-scenarios", currentTenantId],
  });

  const { data: controls = [], isLoading: controlsLoading } = useQuery<Control[]>({
    queryKey: ["/api/controls"],
  });

  const isLoading = risksLoading || scenariosLoading || controlsLoading;

  const metrics = useMemo(() => {
    const criticalCount = risks.filter(r => (r.riskScore || 0) >= 16).length;
    const highCount = risks.filter(r => (r.riskScore || 0) >= 9 && (r.riskScore || 0) < 16).length;
    const avgScore = risks.length > 0 
      ? Math.round(risks.reduce((sum, r) => sum + (r.riskScore || 0), 0) / risks.length) 
      : 0;
    const totalExposure = scenarios.reduce((sum, s) => sum + (s.financialImpactMax || 0), 0);
    
    return { criticalCount, highCount, avgScore, totalExposure, totalRisks: risks.length };
  }, [risks, scenarios]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-96" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold gradient-text">Executive Risk Dashboard</h1>
        <p className="text-muted-foreground">Board-level risk oversight with trend analysis and AI intelligence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <ExecutiveMetricCard
          title="Total Risks"
          value={metrics.totalRisks}
          subtitle="Across all categories"
          icon={Layers}
          iconBg="bg-primary/10 text-primary"
        />
        <ExecutiveMetricCard
          title="Critical Risks"
          value={metrics.criticalCount}
          subtitle="Requiring immediate attention"
          trend={metrics.criticalCount > 3 ? "up" : "stable"}
          trendLabel={metrics.criticalCount > 3 ? "Above threshold" : "Within tolerance"}
          icon={AlertTriangle}
          iconBg="bg-destructive/10 text-destructive"
        />
        <ExecutiveMetricCard
          title="Avg Risk Score"
          value={metrics.avgScore}
          subtitle="Out of 25 maximum"
          trend={metrics.avgScore > 12 ? "up" : metrics.avgScore < 8 ? "down" : "stable"}
          trendLabel={metrics.avgScore > 12 ? "Elevated" : metrics.avgScore < 8 ? "Improving" : "Stable"}
          icon={BarChart3}
          iconBg="bg-chart-3/10 text-chart-3"
        />
        <ExecutiveMetricCard
          title="Total Exposure"
          value={`$${(metrics.totalExposure / 1000000).toFixed(1)}M`}
          subtitle="Maximum financial impact"
          icon={DollarSign}
          iconBg="bg-chart-1/10 text-chart-1"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <TopRisksTable risks={risks} />
        <RiskDistributionChart risks={risks} />
        <ControlConfidenceIndex controls={controls} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RiskTrendSummary risks={risks} />
        <AIPredictiveInsights risks={risks} scenarios={scenarios} />
      </div>
    </div>
  );
}
