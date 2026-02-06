import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Filter,
  Info,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTenant } from "@/contexts/tenant-context";
import type { Risk, Control, ComplianceItem } from "@shared/schema";

interface DynamicRiskHeatmapProps {
  showFilters?: boolean;
  showLegend?: boolean;
  showStats?: boolean;
  compact?: boolean;
}

const RISK_CATEGORIES = [
  "All Categories",
  "Operational",
  "Strategic",
  "Financial",
  "Compliance",
  "Technology",
  "Security",
  "Privacy",
  "Reputational",
];

const getCellColorClass = (likelihood: number, impact: number): string => {
  const score = likelihood * impact;
  if (score >= 20) return "bg-red-600 dark:bg-red-700";
  if (score >= 15) return "bg-red-500 dark:bg-red-600";
  if (score >= 10) return "bg-orange-500 dark:bg-orange-600";
  if (score >= 6) return "bg-yellow-500 dark:bg-yellow-600";
  if (score >= 3) return "bg-lime-500 dark:bg-lime-600";
  return "bg-green-500 dark:bg-green-600";
};

const getRiskLevelLabel = (score: number): string => {
  if (score >= 20) return "Critical";
  if (score >= 15) return "High";
  if (score >= 10) return "Medium-High";
  if (score >= 6) return "Medium";
  if (score >= 3) return "Low-Medium";
  return "Low";
};

const getRiskLevelBadge = (level: string) => {
  const styles: Record<string, string> = {
    critical: "bg-red-600 text-white",
    high: "bg-red-500 text-white",
    medium: "bg-yellow-500 text-white",
    low: "bg-green-500 text-white",
  };
  return styles[level] || styles.medium;
};

export function DynamicRiskHeatmap({
  showFilters = true,
  showLegend = true,
  showStats = true,
  compact = false,
}: DynamicRiskHeatmapProps) {
  const { currentTenantId } = useTenant();
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCell, setSelectedCell] = useState<{ likelihood: number; impact: number } | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const { data: risks = [], isLoading: risksLoading } = useQuery<Risk[]>({
    queryKey: ["/api/risks", currentTenantId || "all"],
  });

  const { data: controls = [] } = useQuery<Control[]>({
    queryKey: ["/api/controls"],
  });

  const { data: complianceReqs = [] } = useQuery<ComplianceItem[]>({
    queryKey: ["/api/compliance-requirements", currentTenantId || "all"],
  });

  const filteredRisks = useMemo(() => {
    return risks.filter((risk) => {
      if (categoryFilter !== "All Categories" && risk.category !== categoryFilter) {
        return false;
      }
      if (statusFilter !== "all" && risk.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [risks, categoryFilter, statusFilter]);

  const riskMatrix = useMemo(() => {
    const matrix: Record<string, Risk[]> = {};
    for (let l = 1; l <= 5; l++) {
      for (let i = 1; i <= 5; i++) {
        matrix[`${l}-${i}`] = [];
      }
    }
    filteredRisks.forEach((risk) => {
      const key = `${risk.likelihood || 1}-${risk.impact || 1}`;
      if (matrix[key]) {
        matrix[key].push(risk);
      }
    });
    return matrix;
  }, [filteredRisks]);

  const stats = useMemo(() => {
    const total = filteredRisks.length;
    const critical = filteredRisks.filter((r) => (r.likelihood || 1) * (r.impact || 1) >= 20).length;
    const high = filteredRisks.filter((r) => {
      const score = (r.likelihood || 1) * (r.impact || 1);
      return score >= 15 && score < 20;
    }).length;
    const medium = filteredRisks.filter((r) => {
      const score = (r.likelihood || 1) * (r.impact || 1);
      return score >= 6 && score < 15;
    }).length;
    const low = filteredRisks.filter((r) => (r.likelihood || 1) * (r.impact || 1) < 6).length;

    const avgScore = total > 0
      ? filteredRisks.reduce((acc, r) => acc + (r.likelihood || 1) * (r.impact || 1), 0) / total
      : 0;

    const mitigated = filteredRisks.filter((r) => r.mitigationPlan && r.mitigationPlan.length > 50).length;
    const mitigationRate = total > 0 ? (mitigated / total) * 100 : 0;

    return { total, critical, high, medium, low, avgScore, mitigationRate };
  }, [filteredRisks]);

  const complianceStatus = useMemo(() => {
    const compliant = complianceReqs.filter((r) => r.status === "completed" || r.status === "approved").length;
    const total = complianceReqs.length;
    return total > 0 ? (compliant / total) * 100 : 100;
  }, [complianceReqs]);

  const selectedCellRisks = useMemo(() => {
    if (!selectedCell) return [];
    return riskMatrix[`${selectedCell.likelihood}-${selectedCell.impact}`] || [];
  }, [selectedCell, riskMatrix]);

  const handleCellClick = (likelihood: number, impact: number) => {
    const risks = riskMatrix[`${likelihood}-${impact}`];
    if (risks.length > 0) {
      setSelectedCell({ likelihood, impact });
      setIsDetailDialogOpen(true);
    }
  };

  if (risksLoading) {
    return (
      <Card className="card-3d" data-testid="chart-dynamic-risk-heatmap">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 30 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="card-3d" data-testid="chart-dynamic-risk-heatmap">
        <CardHeader className={cn("pb-2", compact && "py-3")}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={cn("font-semibold", compact ? "text-base" : "text-lg")}>
                Dynamic Risk Heatmap
              </CardTitle>
              {!compact && (
                <CardDescription>
                  Interactive risk visualization with compliance overlay
                </CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  complianceStatus >= 80 ? "border-green-500 text-green-600" :
                  complianceStatus >= 60 ? "border-yellow-500 text-yellow-600" :
                  "border-red-500 text-red-600"
                )}
              >
                <ShieldCheck className="w-3 h-3 mr-1" />
                {complianceStatus.toFixed(0)}% Compliant
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className={cn(compact && "pt-0")}>
          {showFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40" data-testid="select-risk-category">
                  <Filter className="w-3 h-3 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RISK_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32" data-testid="select-risk-status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Mitigated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {showStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Total Risks</span>
                </div>
                <div className="text-xl font-bold mt-1">{stats.total}</div>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-muted-foreground">Critical/High</span>
                </div>
                <div className="text-xl font-bold mt-1 text-red-600">
                  {stats.critical + stats.high}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Avg Score</span>
                </div>
                <div className="text-xl font-bold mt-1">{stats.avgScore.toFixed(1)}</div>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Mitigation</span>
                </div>
                <div className="text-xl font-bold mt-1 text-green-600">
                  {stats.mitigationRate.toFixed(0)}%
                </div>
              </div>
            </div>
          )}

          <div className="relative pl-8">
            <div className="grid grid-cols-6 gap-1">
              <div className="col-span-1" />
              {[1, 2, 3, 4, 5].map((impact) => (
                <div
                  key={impact}
                  className="text-center text-xs text-muted-foreground font-medium py-1"
                >
                  {impact}
                </div>
              ))}

              {[5, 4, 3, 2, 1].map((likelihood) => (
                <>
                  <div
                    key={`label-${likelihood}`}
                    className="text-xs text-muted-foreground font-medium flex items-center justify-end pr-2"
                  >
                    {likelihood}
                  </div>
                  {[1, 2, 3, 4, 5].map((impact) => {
                    const cellRisks = riskMatrix[`${likelihood}-${impact}`] || [];
                    const score = likelihood * impact;

                    return (
                      <Tooltip key={`${likelihood}-${impact}`}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "aspect-square rounded-md flex items-center justify-center text-xs font-bold transition-all cursor-pointer",
                              getCellColorClass(likelihood, impact),
                              cellRisks.length > 0
                                ? "text-white ring-2 ring-white/30 shadow-lg hover:scale-110"
                                : "text-white/40 hover:scale-105"
                            )}
                            onClick={() => handleCellClick(likelihood, impact)}
                            data-testid={`cell-risk-${likelihood}-${impact}`}
                          >
                            {cellRisks.length > 0 ? cellRisks.length : ""}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="space-y-1">
                            <div className="font-semibold">
                              {getRiskLevelLabel(score)} Risk Zone
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Score: {score} (L:{likelihood} × I:{impact})
                            </div>
                            {cellRisks.length > 0 && (
                              <div className="text-xs">
                                {cellRisks.length} risk{cellRisks.length !== 1 ? "s" : ""} in this zone
                                <ul className="mt-1 space-y-0.5">
                                  {cellRisks.slice(0, 3).map((r) => (
                                    <li key={r.id} className="truncate">• {r.title}</li>
                                  ))}
                                  {cellRisks.length > 3 && (
                                    <li className="text-muted-foreground">
                                      +{cellRisks.length - 3} more...
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </>
              ))}
            </div>

            <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-muted-foreground font-medium whitespace-nowrap origin-center">
              Likelihood →
            </div>

            <div className="text-center text-xs text-muted-foreground font-medium mt-2">
              Impact →
            </div>
          </div>

          {showLegend && (
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span className="text-xs text-muted-foreground">Low (1-2)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-lime-500" />
                <span className="text-xs text-muted-foreground">Low-Med (3-5)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-yellow-500" />
                <span className="text-xs text-muted-foreground">Medium (6-9)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-orange-500" />
                <span className="text-xs text-muted-foreground">Med-High (10-14)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-xs text-muted-foreground">High (15-19)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-600" />
                <span className="text-xs text-muted-foreground">Critical (20+)</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Risks in Zone (L:{selectedCell?.likelihood} × I:{selectedCell?.impact})
            </DialogTitle>
            <DialogDescription>
              {selectedCellRisks.length} risk{selectedCellRisks.length !== 1 ? "s" : ""} with score{" "}
              {selectedCell ? selectedCell.likelihood * selectedCell.impact : 0}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Risk</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedCellRisks.map((risk) => (
                  <TableRow key={risk.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{risk.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {risk.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{risk.category || "General"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          risk.status === "active" && "bg-blue-500",
                          risk.status === "pending" && "bg-yellow-500",
                          risk.status === "completed" && "bg-green-500"
                        )}
                      >
                        {risk.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskLevelBadge(risk.riskLevel || "medium")}>
                        {(risk.likelihood || 1) * (risk.impact || 1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

export function ComplianceStatusHeatmap() {
  const { currentTenantId } = useTenant();

  const { data: frameworks = [] } = useQuery<{ id: string; name: string; category: string }[]>({
    queryKey: ["/api/frameworks"],
  });

  const { data: complianceReqs = [] } = useQuery<ComplianceItem[]>({
    queryKey: ["/api/compliance-requirements", currentTenantId || "all"],
  });

  const frameworkCompliance = useMemo(() => {
    const compliance: Record<string, { total: number; compliant: number; name: string }> = {};
    
    complianceReqs.forEach((req) => {
      const fwId = req.frameworkId || "unknown";
      if (!compliance[fwId]) {
        const framework = frameworks.find((f) => f.id === req.frameworkId);
        compliance[fwId] = {
          total: 0,
          compliant: 0,
          name: framework?.name || "Unknown",
        };
      }
      compliance[fwId].total++;
      if (req.status === "completed" || req.status === "approved") {
        compliance[fwId].compliant++;
      }
    });

    return Object.entries(compliance)
      .map(([id, data]) => ({
        id,
        name: data.name,
        percentage: data.total > 0 ? (data.compliant / data.total) * 100 : 0,
        compliant: data.compliant,
        total: data.total,
      }))
      .sort((a, b) => a.percentage - b.percentage);
  }, [complianceReqs, frameworks]);

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 70) return "bg-lime-500";
    if (percentage >= 50) return "bg-yellow-500";
    if (percentage >= 30) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Card className="card-3d" data-testid="chart-compliance-heatmap">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Compliance Status by Framework</CardTitle>
        <CardDescription>At-a-glance compliance across all frameworks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {frameworkCompliance.slice(0, 8).map((fw) => (
            <div key={fw.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate max-w-[200px]">{fw.name}</span>
                <span className="text-muted-foreground">
                  {fw.compliant}/{fw.total} ({fw.percentage.toFixed(0)}%)
                </span>
              </div>
              <Progress
                value={fw.percentage}
                className={cn("h-2", getComplianceColor(fw.percentage))}
              />
            </div>
          ))}
          {frameworkCompliance.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No compliance data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
