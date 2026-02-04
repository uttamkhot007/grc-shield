import { useQuery } from "@tanstack/react-query";
import {
  Brain,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Target,
  Shield,
  FileText,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Zap,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAiInsights } from "@/lib/api";
import { FeatureGate } from "@/components/FeatureGate";
import { LICENSE_MODULES } from "@/contexts/LicenseContext";
import type { AiInsight } from "@shared/schema";

const DEMO_TENANT_ID = "demo-tenant";

const categoryIcons = {
  compliance: Shield,
  risk: AlertTriangle,
  policy: FileText,
  vendor: Building2,
  audit: Target,
  security: Shield,
};

const priorityStyles = {
  critical: { bg: "bg-destructive/20", text: "text-destructive", border: "border-destructive/30" },
  high: { bg: "bg-chart-3/20", text: "text-chart-3", border: "border-chart-3/30" },
  medium: { bg: "bg-chart-1/20", text: "text-chart-1", border: "border-chart-1/30" },
  low: { bg: "bg-chart-2/20", text: "text-chart-2", border: "border-chart-2/30" },
};

const statusStyles = {
  new: { bg: "bg-chart-4/20", text: "text-chart-4" },
  acknowledged: { bg: "bg-chart-1/20", text: "text-chart-1" },
  in_progress: { bg: "bg-chart-3/20", text: "text-chart-3" },
  resolved: { bg: "bg-chart-2/20", text: "text-chart-2" },
  dismissed: { bg: "bg-muted", text: "text-muted-foreground" },
};

function InsightsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-0">
            <div className="flex">
              <Skeleton className="w-1 h-40" />
              <div className="flex-1 p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AiInsightsPage() {
  const { data: insights = [], isLoading } = useQuery({
    queryKey: ["/api/ai-insights", DEMO_TENANT_ID],
    queryFn: () => fetchAiInsights(DEMO_TENANT_ID),
  });

  const criticalCount = insights.filter((i) => i.priority === "critical").length;
  const highCount = insights.filter((i) => i.priority === "high").length;
  const newCount = insights.filter((i) => i.status === "new").length;
  const resolvedCount = insights.filter((i) => i.status === "resolved").length;

  const aiStats = [
    { label: "Total Insights", value: isLoading ? "-" : insights.length.toString(), change: "AI-generated", icon: Brain },
    { label: "Critical Issues", value: isLoading ? "-" : criticalCount.toString(), change: "Needs attention", icon: Shield },
    { label: "New Insights", value: isLoading ? "-" : newCount.toString(), change: "Pending review", icon: Zap },
    { label: "Resolved", value: isLoading ? "-" : resolvedCount.toString(), change: "Actions taken", icon: Target },
  ];

  const filterByCategory = (category: string) => {
    if (category === "all") return insights;
    return insights.filter((i) => i.category.toLowerCase() === category);
  };

  return (
    <FeatureGate module={LICENSE_MODULES.AI_INSIGHTS}>
      <div className="flex-1 overflow-auto">
        <div className="mesh-gradient min-h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-chart-4 to-chart-5 glow">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">AI Intelligence Center</h1>
                  <p className="text-muted-foreground">
                    AI-powered insights, predictions, and recommendations
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-chart-4/20 to-chart-5/20 text-chart-4 border-chart-4/30">
                <Sparkles className="h-3 w-3 mr-1" />
                Powered by Advanced ML
              </Badge>
              <Button variant="outline" data-testid="button-refresh-insights">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Analysis
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiStats.map((stat) => (
              <Card key={stat.label} className="card-3d bg-gradient-to-br from-card to-card/50">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-chart-4 mt-1">{stat.change}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gradient-to-br from-chart-4/20 to-chart-5/20">
                      <stat.icon className="h-5 w-5 text-chart-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all" data-testid="tab-all-insights">All Insights</TabsTrigger>
              <TabsTrigger value="compliance" data-testid="tab-compliance">Compliance</TabsTrigger>
              <TabsTrigger value="risk" data-testid="tab-risk">Risk</TabsTrigger>
              <TabsTrigger value="policy" data-testid="tab-policy">Policy</TabsTrigger>
              <TabsTrigger value="vendor" data-testid="tab-vendor">Vendor</TabsTrigger>
            </TabsList>

            {["all", "compliance", "risk", "policy", "vendor"].map((tabValue) => (
              <TabsContent key={tabValue} value={tabValue} className="mt-6">
                {isLoading ? (
                  <InsightsSkeleton />
                ) : (
                  <div className="space-y-4">
                    {filterByCategory(tabValue).map((insight) => {
                      const CategoryIcon = categoryIcons[insight.category.toLowerCase() as keyof typeof categoryIcons] || Lightbulb;
                      const priorityStyle = priorityStyles[insight.priority as keyof typeof priorityStyles] || priorityStyles.medium;
                      const statusStyle = statusStyles[insight.status as keyof typeof statusStyles] || statusStyles.new;

                      return (
                        <Card
                          key={insight.id}
                          className="card-3d overflow-hidden"
                          data-testid={`insight-${insight.id}`}
                        >
                          <CardContent className="p-0">
                            <div className="flex">
                              <div className={`w-1 bg-gradient-to-b ${priorityStyle.border.replace('border-', 'from-')} to-transparent`} />
                              <div className="flex-1 p-5 space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${priorityStyle.bg}`}>
                                      <CategoryIcon className={`h-4 w-4 ${priorityStyle.text}`} />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-semibold">{insight.title}</h3>
                                        <Badge className={`${priorityStyle.bg} ${priorityStyle.text} border-0 capitalize`}>
                                          {insight.priority}
                                        </Badge>
                                        <Badge className={`${statusStyle.bg} ${statusStyle.text} border-0 capitalize`}>
                                          {(insight.status || "pending").replace("_", " ")}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <Badge variant="outline" className="text-xs capitalize">
                                          {insight.category}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                          {insight.createdAt ? new Date(insight.createdAt).toLocaleDateString() : "Recent"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-right">
                                      <div className="flex items-center gap-1 text-sm">
                                        <Sparkles className="h-3 w-3 text-chart-4" />
                                        <span className="font-medium">{insight.confidence}%</span>
                                      </div>
                                      <p className="text-xs text-muted-foreground">confidence</p>
                                    </div>
                                  </div>
                                </div>

                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {insight.description || insight.insight}
                                </p>

                                {insight.recommendation && (
                                  <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                                    <div className="flex items-start gap-2">
                                      <Lightbulb className="h-4 w-4 text-chart-3 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <p className="text-sm font-medium mb-1">AI Recommendation</p>
                                        <p className="text-sm text-muted-foreground">
                                          {insight.recommendation}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Was this helpful?</span>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <ThumbsUp className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <ThumbsDown className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <Button variant="secondary" size="sm">
                                    Take Action
                                    <ArrowRight className="h-3 w-3 ml-1" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    {filterByCategory(tabValue).length === 0 && (
                      <div className="text-center py-12">
                        <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Insights Found</h3>
                        <p className="text-muted-foreground mb-4">
                          {tabValue === "all" 
                            ? "Click 'Refresh Analysis' to generate new AI insights" 
                            : `No ${tabValue} insights available`}
                        </p>
                        <Button>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Insights
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
      </div>
    </FeatureGate>
  );
}
