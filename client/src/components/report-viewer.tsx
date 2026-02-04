import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Shield,
  TrendingUp,
  AlertCircle,
  Target,
  BarChart3,
  FileBarChart,
} from "lucide-react";
import type { GeneratedReport } from "@shared/schema";

interface ReportData {
  executiveSummary: string;
  keyFindings: Array<{
    title: string;
    description: string;
    severity: "critical" | "high" | "medium" | "low";
    category: string;
  }>;
  statistics: {
    complianceScore: number;
    controlsImplemented: number;
    totalControls: number;
    risksIdentified: number;
    criticalRisks: number;
    highRisks: number;
    mediumRisks: number;
    lowRisks: number;
    policiesActive: number;
    policiesPendingReview: number;
    auditsCompleted: number;
    auditsPending: number;
  };
  recommendations: Array<{
    priority: "immediate" | "short-term" | "long-term";
    title: string;
    description: string;
    expectedImpact: string;
  }>;
  detailedAnalysis: {
    complianceStatus: string;
    riskLandscape: string;
    controlEffectiveness: string;
    auditFindings: string;
  };
  chartData: {
    complianceTrend: Array<{ month: string; score: number }>;
    riskDistribution: Array<{ category: string; count: number }>;
    controlStatus: Array<{ status: string; count: number }>;
  };
  generatedAt: string;
  reportPeriod: string;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const severityColors = {
  critical: "bg-red-500/10 text-red-500 border-red-500/30",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  low: "bg-green-500/10 text-green-500 border-green-500/30",
};

const priorityColors = {
  immediate: "bg-red-500/10 text-red-500 border-red-500/30",
  "short-term": "bg-amber-500/10 text-amber-500 border-amber-500/30",
  "long-term": "bg-blue-500/10 text-blue-500 border-blue-500/30",
};

interface ReportViewerProps {
  report: GeneratedReport;
  onClose: () => void;
  onExportPdf?: () => void;
}

export function ReportViewer({ report, onClose, onExportPdf }: ReportViewerProps) {
  const data = report.data as ReportData | null;

  if (!data || !data.statistics) {
    return (
      <div className="p-6 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="font-medium">Report data not available</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {report.status === "in_progress" 
            ? "Report is being generated. Please refresh in a moment."
            : "Unable to load report content."}
        </p>
      </div>
    );
  }

  const { statistics, chartData, keyFindings, recommendations, detailedAnalysis, executiveSummary } = data;

  return (
    <div className="space-y-8 p-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">{report.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generated on {new Date(data.generatedAt).toLocaleString()} | Period: {data.reportPeriod}
          </p>
        </div>
        <div className="flex gap-2">
          {onExportPdf && (
            <Button onClick={onExportPdf} variant="outline" data-testid="button-export-pdf">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} data-testid="button-close-report">
            Close
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Compliance Score</p>
                <p className="text-2xl font-bold text-primary">{statistics.complianceScore}%</p>
              </div>
              <div className={`p-3 rounded-full ${statistics.complianceScore >= 80 ? "bg-green-500/10" : "bg-amber-500/10"}`}>
                <Shield className={`h-5 w-5 ${statistics.complianceScore >= 80 ? "text-green-500" : "text-amber-500"}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Risks</p>
                <p className="text-2xl font-bold">{statistics.risksIdentified}</p>
                <p className="text-xs text-red-500">{statistics.criticalRisks} critical</p>
              </div>
              <div className="p-3 rounded-full bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Controls Implemented</p>
                <p className="text-2xl font-bold">{statistics.controlsImplemented}/{statistics.totalControls}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Audits Completed</p>
                <p className="text-2xl font-bold">{statistics.auditsCompleted}</p>
                <p className="text-xs text-amber-500">{statistics.auditsPending} pending</p>
              </div>
              <div className="p-3 rounded-full bg-purple-500/10">
                <FileBarChart className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {executiveSummary.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed mb-4">{paragraph}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Compliance Trend
            </CardTitle>
            <CardDescription>Monthly compliance score progression</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.complianceTrend}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #333" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Risk Distribution
            </CardTitle>
            <CardDescription>Risks by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                    label={({ category, count }) => `${category}: ${count}`}
                    labelLine={false}
                  >
                    {chartData.riskDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #333" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Control Implementation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.controlStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" stroke="#888" fontSize={12} />
                <YAxis dataKey="status" type="category" stroke="#888" fontSize={12} width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #333" }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  {chartData.controlStatus.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.status === "Implemented" ? "#10b981" :
                        entry.status === "In Progress" ? "#3b82f6" :
                        entry.status === "Planned" ? "#f59e0b" : "#ef4444"
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Key Findings
          </CardTitle>
          <CardDescription>Critical observations requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {keyFindings.map((finding, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={severityColors[finding.severity]}>
                        {finding.severity}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {finding.category}
                      </Badge>
                    </div>
                    <h4 className="font-medium">{finding.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{finding.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Recommendations
          </CardTitle>
          <CardDescription>Prioritized action items for improvement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {rec.priority === "immediate" && <AlertTriangle className="h-5 w-5 text-red-500" />}
                    {rec.priority === "short-term" && <Clock className="h-5 w-5 text-amber-500" />}
                    {rec.priority === "long-term" && <Target className="h-5 w-5 text-blue-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={priorityColors[rec.priority]}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <h4 className="font-medium">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                    <p className="text-xs text-primary mt-2 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Expected Impact: {rec.expectedImpact}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-primary" />
              Compliance Status
            </h4>
            <p className="text-sm text-muted-foreground">{detailedAnalysis.complianceStatus}</p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              Risk Landscape
            </h4>
            <p className="text-sm text-muted-foreground">{detailedAnalysis.riskLandscape}</p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              Control Effectiveness
            </h4>
            <p className="text-sm text-muted-foreground">{detailedAnalysis.controlEffectiveness}</p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <FileBarChart className="h-4 w-4 text-primary" />
              Audit Findings
            </h4>
            <p className="text-sm text-muted-foreground">{detailedAnalysis.auditFindings}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
