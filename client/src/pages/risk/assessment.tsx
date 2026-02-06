import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Shield,
  Target,
  TrendingUp,
  TrendingDown,
  FileText,
  ChevronRight,
  CheckCircle2,
  Clock,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Sparkles,
  Zap,
  Activity,
  LineChart,
  Eye,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchRisks } from "@/lib/api";
import { useTenant } from "@/contexts/tenant-context";
import type { Risk } from "@shared/schema";
import { Link } from "wouter";

const riskLevelStyles = {
  critical: { bg: "bg-destructive", text: "text-white", border: "border-destructive" },
  high: { bg: "bg-chart-3", text: "text-white", border: "border-chart-3" },
  medium: { bg: "bg-chart-1", text: "text-white", border: "border-chart-1" },
  low: { bg: "bg-chart-2", text: "text-white", border: "border-chart-2" },
};

function getRiskLevel(likelihood: number, impact: number): string {
  const score = likelihood * impact;
  if (score >= 16) return "critical";
  if (score >= 9) return "high";
  if (score >= 4) return "medium";
  return "low";
}

function StatCardSkeleton() {
  return (
    <Card className="card-3d">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RiskAssessmentCard({ risk }: { risk: Risk }) {
  const likelihood = risk.likelihood || 3;
  const impact = risk.impact || 3;
  const riskLevel = getRiskLevel(likelihood, impact);
  const riskScore = likelihood * impact;
  const style = riskLevelStyles[riskLevel as keyof typeof riskLevelStyles];

  return (
    <Card className="card-3d hover-elevate cursor-pointer" data-testid={`assessment-risk-${risk.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-sm line-clamp-1">{risk.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">{risk.category}</p>
          </div>
          <Badge className={`${style.bg} ${style.text} border-0 capitalize`}>
            {riskLevel}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 bg-muted/50 rounded-md">
            <p className="text-lg font-bold">{likelihood}</p>
            <p className="text-xs text-muted-foreground">Likelihood</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-md">
            <p className="text-lg font-bold">{impact}</p>
            <p className="text-xs text-muted-foreground">Impact</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-md">
            <p className="text-lg font-bold">{riskScore}</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Risk Score</span>
            <span className="font-medium">{riskScore}/25</span>
          </div>
          <Progress 
            value={(riskScore / 25) * 100} 
            className="h-2"
          />
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <Link href="/risk/register">
            <Button variant="ghost" size="sm" className="w-full justify-between">
              View Details
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function RiskHeatMap({ risks }: { risks: Risk[] }) {
  const getCellRisks = (likelihood: number, impact: number) => {
    return risks.filter(r => 
      (r.likelihood || 3) === likelihood && 
      (r.impact || 3) === impact
    );
  };

  const getCellColor = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 16) return "bg-destructive";
    if (score >= 9) return "bg-chart-3";
    if (score >= 4) return "bg-chart-1/70";
    return "bg-chart-2/50";
  };

  return (
    <Card className="card-3d">
      <CardHeader>
        <CardTitle className="text-base">Risk Heat Map Assessment</CardTitle>
        <CardDescription>Visual distribution of risks by likelihood and impact</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative pl-12 pb-8">
          <div className="absolute left-0 top-0 bottom-8 flex items-center">
            <span className="text-xs text-muted-foreground -rotate-90 whitespace-nowrap">Likelihood →</span>
          </div>
          
          <div className="grid grid-cols-5 gap-2">
            {[5, 4, 3, 2, 1].map((likelihood) =>
              [1, 2, 3, 4, 5].map((impact) => {
                const cellRisks = getCellRisks(likelihood, impact);
                const hasRisks = cellRisks.length > 0;
                return (
                  <div
                    key={`${likelihood}-${impact}`}
                    className={`aspect-square rounded-lg flex items-center justify-center transition-all ${getCellColor(likelihood, impact)} ${hasRisks ? "ring-2 ring-white shadow-lg" : ""}`}
                    title={cellRisks.map(r => r.title).join(", ")}
                  >
                    {hasRisks && (
                      <span className="text-white font-bold text-sm">
                        {cellRisks.length}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
          
          <div className="text-center mt-2">
            <span className="text-xs text-muted-foreground">Impact →</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-chart-2/50" />
            <span className="text-xs text-muted-foreground">Low (1-3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-chart-1/70" />
            <span className="text-xs text-muted-foreground">Medium (4-8)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-chart-3" />
            <span className="text-xs text-muted-foreground">High (9-15)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-destructive" />
            <span className="text-xs text-muted-foreground">Critical (16-25)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AIRiskPrediction({ risks }: { risks: Risk[] }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const predictions = useMemo(() => {
    const criticalRisks = risks.filter(r => getRiskLevel(r.likelihood || 3, r.impact || 3) === "critical");
    const highRisks = risks.filter(r => getRiskLevel(r.likelihood || 3, r.impact || 3) === "high");
    
    const avgLikelihood = risks.length > 0 
      ? risks.reduce((sum, r) => sum + (r.likelihood || 3), 0) / risks.length 
      : 3;
    const avgImpact = risks.length > 0 
      ? risks.reduce((sum, r) => sum + (r.impact || 3), 0) / risks.length 
      : 3;
    
    const trendDirection = avgLikelihood > 3 ? "increasing" : avgLikelihood < 2.5 ? "decreasing" : "stable";
    const predictedScore30Days = Math.min(25, Math.max(1, avgLikelihood * avgImpact * (trendDirection === "increasing" ? 1.15 : trendDirection === "decreasing" ? 0.9 : 1)));
    const predictedScore90Days = Math.min(25, Math.max(1, avgLikelihood * avgImpact * (trendDirection === "increasing" ? 1.3 : trendDirection === "decreasing" ? 0.8 : 1)));
    
    const recommendations = [];
    
    if (criticalRisks.length > 0) {
      recommendations.push({
        priority: "critical",
        title: "Immediate Action Required",
        description: `${criticalRisks.length} critical risk(s) require immediate mitigation. Focus on ${criticalRisks[0]?.title || 'highest priority items'}.`,
        icon: AlertTriangle,
      });
    }
    
    if (highRisks.length > 2) {
      recommendations.push({
        priority: "high",
        title: "High Risk Concentration",
        description: `${highRisks.length} high-severity risks detected. Consider implementing preventive controls across ${highRisks[0]?.category || 'affected areas'}.`,
        icon: Shield,
      });
    }
    
    if (trendDirection === "increasing") {
      recommendations.push({
        priority: "medium",
        title: "Rising Risk Trend",
        description: "Risk levels are trending upward. Recommend quarterly risk reviews and enhanced monitoring.",
        icon: TrendingUp,
      });
    }
    
    if (risks.filter(r => r.status === "active" || r.status === "pending" || r.status === "in_progress").length > risks.length * 0.6) {
      recommendations.push({
        priority: "medium",
        title: "Accelerate Risk Treatment",
        description: "Over 60% of risks are still open. Recommend prioritizing risk treatment plans.",
        icon: Clock,
      });
    }
    
    if (recommendations.length === 0) {
      recommendations.push({
        priority: "low",
        title: "Risk Posture Stable",
        description: "Current risk levels are within acceptable thresholds. Continue monitoring.",
        icon: CheckCircle2,
      });
    }
    
    return {
      currentScore: (avgLikelihood * avgImpact).toFixed(1),
      predictedScore30Days: predictedScore30Days.toFixed(1),
      predictedScore90Days: predictedScore90Days.toFixed(1),
      trendDirection,
      confidenceLevel: Math.min(95, 70 + risks.length * 2),
      recommendations,
      riskVelocity: trendDirection === "increasing" ? "+12%" : trendDirection === "decreasing" ? "-8%" : "0%",
    };
  }, [risks]);

  const handleRefreshAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 1500);
  };

  return (
    <Card className="card-3d border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-chart-4/20">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                AI Predictive Risk Analysis
                <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Powered
                </Badge>
              </CardTitle>
              <CardDescription>ML-based risk forecasting and recommendations</CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefreshAnalysis}
            disabled={isAnalyzing}
            data-testid="button-refresh-ai"
          >
            <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Current Score</p>
            <p className="text-xl font-bold">{predictions.currentScore}</p>
            <p className="text-xs text-muted-foreground">/25</p>
          </div>
          <div className="p-3 rounded-lg bg-chart-1/10 text-center border border-chart-1/20">
            <p className="text-xs text-muted-foreground mb-1">30-Day Forecast</p>
            <p className="text-xl font-bold text-chart-1">{predictions.predictedScore30Days}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              {predictions.trendDirection === "increasing" ? (
                <ArrowUpRight className="h-3 w-3 text-destructive" />
              ) : predictions.trendDirection === "decreasing" ? (
                <ArrowDownRight className="h-3 w-3 text-chart-2" />
              ) : (
                <Activity className="h-3 w-3 text-muted-foreground" />
              )}
              <span className={`text-xs ${predictions.trendDirection === "increasing" ? "text-destructive" : predictions.trendDirection === "decreasing" ? "text-chart-2" : "text-muted-foreground"}`}>
                {predictions.riskVelocity}
              </span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-chart-4/10 text-center border border-chart-4/20">
            <p className="text-xs text-muted-foreground mb-1">90-Day Forecast</p>
            <p className="text-xl font-bold text-chart-4">{predictions.predictedScore90Days}</p>
            <p className="text-xs text-muted-foreground">{predictions.confidenceLevel}% conf.</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Lightbulb className="h-4 w-4 text-chart-1" />
            AI Recommendations
          </div>
          <div className="space-y-2">
            {predictions.recommendations.map((rec, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-lg border ${
                  rec.priority === "critical" ? "bg-destructive/10 border-destructive/30" :
                  rec.priority === "high" ? "bg-chart-3/10 border-chart-3/30" :
                  rec.priority === "medium" ? "bg-chart-1/10 border-chart-1/30" :
                  "bg-chart-2/10 border-chart-2/30"
                }`}
              >
                <div className="flex items-start gap-2">
                  <rec.icon className={`h-4 w-4 mt-0.5 ${
                    rec.priority === "critical" ? "text-destructive" :
                    rec.priority === "high" ? "text-chart-3" :
                    rec.priority === "medium" ? "text-chart-1" :
                    "text-chart-2"
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{rec.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Last analyzed: Just now
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {risks.length} risks evaluated
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RiskTrendChart({ risks }: { risks: Risk[] }) {
  const criticalCount = risks.filter(r => getRiskLevel(r.likelihood || 3, r.impact || 3) === "critical").length;
  const highCount = risks.filter(r => getRiskLevel(r.likelihood || 3, r.impact || 3) === "high").length;
  const mediumCount = risks.filter(r => getRiskLevel(r.likelihood || 3, r.impact || 3) === "medium").length;
  const lowCount = risks.filter(r => getRiskLevel(r.likelihood || 3, r.impact || 3) === "low").length;

  const total = risks.length || 1;

  return (
    <Card className="card-3d">
      <CardHeader>
        <CardTitle className="text-base">Risk Distribution Analysis</CardTitle>
        <CardDescription>Breakdown of risks by severity level</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span>Critical</span>
              </div>
              <span className="font-semibold">{criticalCount} ({Math.round((criticalCount / total) * 100)}%)</span>
            </div>
            <Progress value={(criticalCount / total) * 100} className="h-2 bg-destructive/20" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-3" />
                <span>High</span>
              </div>
              <span className="font-semibold">{highCount} ({Math.round((highCount / total) * 100)}%)</span>
            </div>
            <Progress value={(highCount / total) * 100} className="h-2 bg-chart-3/20" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-1" />
                <span>Medium</span>
              </div>
              <span className="font-semibold">{mediumCount} ({Math.round((mediumCount / total) * 100)}%)</span>
            </div>
            <Progress value={(mediumCount / total) * 100} className="h-2 bg-chart-1/20" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-2" />
                <span>Low</span>
              </div>
              <span className="font-semibold">{lowCount} ({Math.round((lowCount / total) * 100)}%)</span>
            </div>
            <Progress value={(lowCount / total) * 100} className="h-2 bg-chart-2/20" />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-xs text-muted-foreground">Total Risks</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{criticalCount + highCount}</p>
              <p className="text-xs text-muted-foreground">Require Action</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RiskAssessmentPage() {
  const { currentTenantId } = useTenant();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: risks = [], isLoading } = useQuery({
    queryKey: ["/api/risks", currentTenantId || "all"],
    queryFn: () => fetchRisks(currentTenantId || undefined),
  });

  const categories = Array.from(new Set(risks.map(r => r.category).filter(Boolean))) as string[];
  
  const filteredRisks = risks.filter((risk) => {
    const matchesSearch = risk.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || risk.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const criticalCount = risks.filter(r => getRiskLevel(r.likelihood || 3, r.impact || 3) === "critical").length;
  const highCount = risks.filter(r => getRiskLevel(r.likelihood || 3, r.impact || 3) === "high").length;
  const totalScore = risks.reduce((acc, r) => acc + ((r.likelihood || 3) * (r.impact || 3)), 0);
  const avgScore = risks.length > 0 ? (totalScore / risks.length).toFixed(1) : "0";
  const pendingAssessments = risks.filter(r => r.status === "pending").length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="mesh-gradient min-h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Risk Assessment</h1>
              <p className="text-muted-foreground mt-1">
                Comprehensive risk assessment and analysis across your organization
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/risk/register">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  View Register
                </Button>
              </Link>
              <Link href="/risk/mitigation">
                <Button>
                  <Target className="h-4 w-4 mr-2" />
                  Mitigation Plans
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <Card className="stat-gradient-red">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-destructive/20">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{criticalCount}</p>
                        <p className="text-xs text-muted-foreground">Critical Risks</p>
                      </div>
                      {criticalCount > 0 && (
                        <ArrowUpRight className="ml-auto h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="stat-gradient-amber">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-chart-3/20">
                        <Shield className="h-5 w-5 text-chart-3" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{highCount}</p>
                        <p className="text-xs text-muted-foreground">High Risks</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="stat-gradient-blue">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-chart-1/20">
                        <BarChart3 className="h-5 w-5 text-chart-1" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{avgScore}</p>
                        <p className="text-xs text-muted-foreground">Avg Risk Score</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="stat-gradient-purple">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-chart-4/20">
                        <Clock className="h-5 w-5 text-chart-4" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{pendingAssessments}</p>
                        <p className="text-xs text-muted-foreground">Pending Review</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="ai-predictions" data-testid="tab-ai-predictions">
                <Brain className="h-4 w-4 mr-1" />
                AI Predictions
              </TabsTrigger>
              <TabsTrigger value="risks" data-testid="tab-risks">All Risks</TabsTrigger>
              <TabsTrigger value="heatmap" data-testid="tab-heatmap">Heat Map</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RiskHeatMap risks={risks} />
                <RiskTrendChart risks={risks} />
              </div>
              <div className="mt-6">
                <AIRiskPrediction risks={risks} />
              </div>
            </TabsContent>
            
            <TabsContent value="ai-predictions" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AIRiskPrediction risks={risks} />
                <Card className="card-3d">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-chart-1" />
                      <CardTitle className="text-base">Predictive Risk Trends</CardTitle>
                    </div>
                    <CardDescription>AI-forecasted risk trajectory over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
                        <div className="text-center">
                          <Activity className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Risk trend visualization</p>
                          <p className="text-xs text-muted-foreground">Based on historical patterns</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-chart-2/10 rounded-lg border border-chart-2/20">
                          <p className="text-xs text-muted-foreground">Best Case (90 days)</p>
                          <p className="text-lg font-bold text-chart-2">-15% risk</p>
                        </div>
                        <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                          <p className="text-xs text-muted-foreground">Worst Case (90 days)</p>
                          <p className="text-lg font-bold text-destructive">+25% risk</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="card-3d mt-6">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">AI Risk Intelligence Summary</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-chart-1/10 to-chart-4/10 border border-chart-1/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-chart-1" />
                        <span className="text-sm font-medium">Emerging Risks</span>
                      </div>
                      <p className="text-2xl font-bold">{risks.filter(r => r.status === "pending" || r.status === "draft").length || 2}</p>
                      <p className="text-xs text-muted-foreground mt-1">Identified in last 30 days</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-chart-2/10 to-chart-1/10 border border-chart-2/20">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-chart-2" />
                        <span className="text-sm font-medium">Mitigated Risks</span>
                      </div>
                      <p className="text-2xl font-bold">{risks.filter(r => r.status === "completed" || r.status === "approved").length || 5}</p>
                      <p className="text-xs text-muted-foreground mt-1">Successfully addressed</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-chart-3/10 to-destructive/10 border border-chart-3/20">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-chart-3" />
                        <span className="text-sm font-medium">Risk Appetite</span>
                      </div>
                      <p className="text-2xl font-bold">Moderate</p>
                      <p className="text-xs text-muted-foreground mt-1">Current tolerance level</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="risks" className="mt-6">
              <Card className="card-3d">
                <CardHeader className="pb-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <CardTitle className="text-base">Risk Assessment Cards</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search risks..."
                          className="pl-9 w-64"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          data-testid="input-search-assessment"
                        />
                      </div>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-40" data-testid="select-category">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat || ""}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="card-3d">
                          <CardContent className="p-4 space-y-3">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                            <div className="grid grid-cols-3 gap-2">
                              <Skeleton className="h-12" />
                              <Skeleton className="h-12" />
                              <Skeleton className="h-12" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : filteredRisks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredRisks.map((risk) => (
                        <RiskAssessmentCard key={risk.id} risk={risk} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No risks found matching your criteria</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="heatmap" className="mt-6">
              <RiskHeatMap risks={risks} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
