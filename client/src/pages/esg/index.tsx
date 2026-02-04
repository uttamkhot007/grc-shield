import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Leaf, Users, Building, TrendingUp, TrendingDown, Target,
  BarChart3, Plus, Calendar, CheckCircle2, AlertTriangle, 
  Droplet, Zap, Recycle, Heart, GraduationCap, Scale, FolderOpen
} from "lucide-react";
import type { EsgMetric, EsgInitiative } from "@shared/schema";

export default function ESGPage() {
  const { data: metrics = [], isLoading: metricsLoading } = useQuery<EsgMetric[]>({
    queryKey: ["/api/esg/metrics"],
  });

  const { data: initiatives = [], isLoading: initiativesLoading } = useQuery<EsgInitiative[]>({
    queryKey: ["/api/esg/initiatives"],
  });

  const getTrendIcon = (trend: string | null) => {
    switch (trend) {
      case "improving": return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "declining": return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <BarChart3 className="w-4 h-4 text-amber-500" />;
    }
  };

  const getMetricIcon = (name: string) => {
    if (name.includes("Carbon") || name.includes("Emission")) return Leaf;
    if (name.includes("Energy")) return Zap;
    if (name.includes("Water")) return Droplet;
    if (name.includes("Waste") || name.includes("Recycl")) return Recycle;
    if (name.includes("Diversity") || name.includes("Employee")) return Users;
    if (name.includes("Training")) return GraduationCap;
    if (name.includes("Safety")) return AlertTriangle;
    if (name.includes("Board") || name.includes("Governance")) return Building;
    if (name.includes("Ethics") || name.includes("Compliance")) return Scale;
    return CheckCircle2;
  };

  const MetricCard = ({ metric }: { metric: EsgMetric }) => {
    const Icon = getMetricIcon(metric.name);
    return (
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-primary" />
              <span className="font-medium">{metric.name}</span>
            </div>
            {getTrendIcon(metric.trend)}
          </div>
          <div className="flex items-end justify-between mb-2">
            <span className="text-2xl font-bold">{Number(metric.currentValue || 0).toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">{metric.unit}</span>
          </div>
          <Progress value={metric.targetValue ? (Number(metric.currentValue || 0) / Number(metric.targetValue)) * 100 : 0} className="h-2 mb-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Target: {metric.targetValue ? Number(metric.targetValue).toLocaleString() : 'N/A'}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ title, description, icon: Icon }: { title: string; description: string; icon: any }) => (
    <Card className="glass-card">
      <CardContent className="p-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          <Icon className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
        <Button data-testid="button-get-started">
          <Plus className="w-4 h-4 mr-2" />
          Get Started
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            ESG Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Environmental, Social & Governance performance tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export-report">
            <BarChart3 className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button data-testid="button-add-metric">
            <Plus className="w-4 h-4 mr-2" />
            Add Metric
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/20">
              <Leaf className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">--</p>
              <p className="text-sm text-muted-foreground">Environmental Score</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">--</p>
              <p className="text-sm text-muted-foreground">Social Score</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Building className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">--</p>
              <p className="text-sm text-muted-foreground">Governance Score</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-500/20">
              <Target className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.length}</p>
              <p className="text-sm text-muted-foreground">Total Metrics</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="glass-card">
          <TabsTrigger value="all" data-testid="tab-all">
            <BarChart3 className="w-4 h-4 mr-2" />
            All Metrics
          </TabsTrigger>
          <TabsTrigger value="initiatives" data-testid="tab-initiatives">
            <Target className="w-4 h-4 mr-2" />
            Initiatives
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {metricsLoading ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading metrics...
              </CardContent>
            </Card>
          ) : metrics.length === 0 ? (
            <EmptyState 
              title="No ESG Metrics Yet"
              description="Track your environmental impact (carbon, energy, water), social responsibility (diversity, training, safety), and governance metrics (board independence, ethics, compliance)."
              icon={BarChart3}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metrics.map((metric) => (
                <MetricCard key={metric.id} metric={metric} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="initiatives" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">ESG Initiatives</h2>
            <Button data-testid="button-add-initiative">
              <Plus className="w-4 h-4 mr-2" />
              New Initiative
            </Button>
          </div>
          {initiativesLoading ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading initiatives...
              </CardContent>
            </Card>
          ) : initiatives.length === 0 ? (
            <EmptyState 
              title="No ESG Initiatives Yet"
              description="Create initiatives like Net Zero programs, diversity initiatives, or sustainability projects to drive your ESG goals."
              icon={Target}
            />
          ) : (
            <div className="grid gap-4">
              {initiatives.map((initiative) => (
                <Card key={initiative.id} className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-primary" />
                        <div>
                          <h3 className="font-semibold">{initiative.title}</h3>
                          <p className="text-sm text-muted-foreground">{initiative.description || "ESG Initiative"}</p>
                        </div>
                      </div>
                      <Badge variant={initiative.status === "completed" ? "default" : "secondary"}>
                        {initiative.status?.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{initiative.progress || 0}%</span>
                      </div>
                      <Progress value={initiative.progress || 0} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
