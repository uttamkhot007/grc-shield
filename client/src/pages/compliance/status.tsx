import { useState } from "react";
import {
  Shield,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Filter,
  Download,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const complianceData = [
  { framework: "ISO 27001", score: 86, target: 95, controls: 114, implemented: 98 },
  { framework: "SOC 2", score: 72, target: 90, controls: 81, implemented: 58 },
  { framework: "GDPR", score: 94, target: 100, controls: 50, implemented: 47 },
  { framework: "PCI DSS", score: 65, target: 85, controls: 300, implemented: 195 },
  { framework: "NIST CSF", score: 84, target: 90, controls: 106, implemented: 89 },
];

const controlsByCategory = [
  { category: "Access Control", total: 45, implemented: 38, inProgress: 5, notStarted: 2 },
  { category: "Data Protection", total: 32, implemented: 28, inProgress: 3, notStarted: 1 },
  { category: "Network Security", total: 28, implemented: 22, inProgress: 4, notStarted: 2 },
  { category: "Incident Response", total: 18, implemented: 15, inProgress: 2, notStarted: 1 },
  { category: "Business Continuity", total: 15, implemented: 12, inProgress: 2, notStarted: 1 },
  { category: "Risk Management", total: 22, implemented: 18, inProgress: 3, notStarted: 1 },
];

const getBarColor = (score: number) => {
  if (score >= 90) return "hsl(142, 71%, 45%)";
  if (score >= 70) return "hsl(217, 91%, 60%)";
  if (score >= 50) return "hsl(38, 92%, 50%)";
  return "hsl(0, 84%, 60%)";
};

export default function ComplianceStatusPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const overallScore = Math.round(
    complianceData.reduce((acc, item) => acc + item.score, 0) / complianceData.length
  );

  const totalControls = controlsByCategory.reduce((acc, cat) => acc + cat.total, 0);
  const implementedControls = controlsByCategory.reduce((acc, cat) => acc + cat.implemented, 0);
  const inProgressControls = controlsByCategory.reduce((acc, cat) => acc + cat.inProgress, 0);

  return (
    <div className="flex-1 overflow-auto">
      <div className="mesh-gradient min-h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Compliance Status</h1>
              <p className="text-muted-foreground mt-1">
                Monitor compliance across all active frameworks
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" data-testid="button-refresh">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" data-testid="button-export">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="stat-gradient-blue col-span-1 md:col-span-2 lg:col-span-1">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Overall Compliance</p>
                    <p className="text-3xl font-bold">{overallScore}%</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-chart-2" />
                      <span className="text-xs text-chart-2">+4.2% this month</span>
                    </div>
                  </div>
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="hsl(var(--muted))"
                        strokeWidth="6"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="hsl(217, 91%, 60%)"
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={`${(overallScore / 100) * 176} 176`}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-green">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-chart-2/20">
                    <CheckCircle2 className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{implementedControls}</p>
                    <p className="text-sm text-muted-foreground">Implemented</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-amber">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-chart-3/20">
                    <Clock className="h-5 w-5 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{inProgressControls}</p>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-purple">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-chart-4/20">
                    <Shield className="h-5 w-5 text-chart-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalControls}</p>
                    <p className="text-sm text-muted-foreground">Total Controls</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview" data-testid="tab-overview">
                Overview
              </TabsTrigger>
              <TabsTrigger value="frameworks" data-testid="tab-frameworks">
                By Framework
              </TabsTrigger>
              <TabsTrigger value="controls" data-testid="tab-controls">
                By Control Category
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="card-3d">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">
                      Framework Compliance Scores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={complianceData}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={true}
                            vertical={false}
                            className="stroke-border/50"
                          />
                          <XAxis
                            type="number"
                            domain={[0, 100]}
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                          />
                          <YAxis
                            type="category"
                            dataKey="framework"
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                            width={75}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                            {complianceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-3d">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">
                      Control Implementation by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {controlsByCategory.map((category) => {
                      const percentage = Math.round(
                        (category.implemented / category.total) * 100
                      );
                      return (
                        <div key={category.category} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{category.category}</span>
                            <span className="text-muted-foreground">
                              {category.implemented}/{category.total}
                            </span>
                          </div>
                          <div className="flex gap-1 h-2">
                            <div
                              className="bg-chart-2 rounded-l"
                              style={{
                                width: `${(category.implemented / category.total) * 100}%`,
                              }}
                            />
                            <div
                              className="bg-chart-3"
                              style={{
                                width: `${(category.inProgress / category.total) * 100}%`,
                              }}
                            />
                            <div
                              className="bg-muted rounded-r"
                              style={{
                                width: `${(category.notStarted / category.total) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex items-center justify-center gap-6 pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-chart-2" />
                        <span className="text-xs text-muted-foreground">Implemented</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-chart-3" />
                        <span className="text-xs text-muted-foreground">In Progress</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-muted" />
                        <span className="text-xs text-muted-foreground">Not Started</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="frameworks" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {complianceData.map((framework) => (
                  <Card
                    key={framework.framework}
                    className="card-3d cursor-pointer hover-elevate"
                    data-testid={`card-compliance-${framework.framework.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{framework.framework}</h3>
                        <Badge
                          className={`${
                            framework.score >= 80
                              ? "bg-chart-2/20 text-chart-2"
                              : framework.score >= 60
                              ? "bg-chart-3/20 text-chart-3"
                              : "bg-destructive/20 text-destructive"
                          } border-0`}
                        >
                          {framework.score}%
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <Progress value={framework.score} className="h-2" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {framework.implemented} / {framework.controls} controls
                          </span>
                          <span className="text-muted-foreground">
                            Target: {framework.target}%
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full mt-4 justify-between"
                        size="sm"
                      >
                        View Details
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="controls" className="mt-6">
              <Card className="card-3d">
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {controlsByCategory.map((category) => (
                      <div
                        key={category.category}
                        className="p-4 hover-elevate cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-muted">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{category.category}</p>
                            <p className="text-sm text-muted-foreground">
                              {category.total} controls
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-chart-2" />
                              <span className="text-sm">{category.implemented}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-chart-3" />
                              <span className="text-sm">{category.inProgress}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{category.notStarted}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
