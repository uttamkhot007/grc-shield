import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/contexts/tenant-context";
import { Loader2, TrendingUp, Info } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Control, TenantFramework, Audit } from "@shared/schema";

interface ComplianceTrendData {
  month: string;
  compliance: number;
  target: number;
}

export function ComplianceChart() {
  const { currentTenant, currentTenantId } = useTenant();

  const { data: controls = [], isLoading: loadingControls } = useQuery<Control[]>({
    queryKey: ["/api/controls"],
  });

  const { data: tenantFrameworks = [], isLoading: loadingFrameworks } = useQuery<TenantFramework[]>({
    queryKey: [`/api/tenant-frameworks?tenantId=${currentTenant?.id}`],
    enabled: !!currentTenant?.id,
  });

  // Check for actual compliance activity (audits)
  const { data: audits = [], isLoading: loadingAudits } = useQuery<Audit[]>({
    queryKey: ["/api/audits", currentTenantId || "all"],
    enabled: !!currentTenantId,
  });

  const isLoading = loadingControls || loadingFrameworks || loadingAudits;

  // Check if there's actual compliance activity
  const hasComplianceActivity = audits.some(
    audit => audit.status === "in_progress" || audit.status === "completed"
  );

  const calculateComplianceData = (): ComplianceTrendData[] => {
    if (!currentTenant || tenantFrameworks.length === 0) {
      return [];
    }

    // Only show data if there's actual compliance activity
    if (!hasComplianceActivity) {
      return [];
    }

    const activeFrameworkIds = new Set(
      tenantFrameworks
        .filter(tf => tf.status === "active" || tf.status === "in_progress")
        .map(tf => tf.frameworkId)
    );

    const relevantControls = controls.filter(c => activeFrameworkIds.has(c.frameworkId));
    const totalControls = relevantControls.length;

    if (totalControls === 0) {
      return [];
    }

    // Calculate based on completed audits
    const completedAudits = audits.filter(a => a.status === "completed");
    const inProgressAudits = audits.filter(a => a.status === "in_progress");
    
    // Base score on actual audit completion
    const auditProgress = completedAudits.length > 0 
      ? 50 + (completedAudits.length * 10) // Start at 50% with completed audits
      : inProgressAudits.length > 0 
        ? 25 + (inProgressAudits.length * 5) // Lower for in-progress only
        : 0;
    
    const currentScore = Math.min(auditProgress, 100);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    
    const trendData: ComplianceTrendData[] = [];
    
    for (let i = 0; i <= currentMonth; i++) {
      const progressFactor = (i + 1) / (currentMonth + 1);
      const baseScore = Math.max(10, currentScore * 0.3);
      const monthScore = Math.round(baseScore + (currentScore - baseScore) * progressFactor);
      
      let target = 85;
      if (i >= 6) target = 90;
      if (i >= 9) target = 95;
      
      trendData.push({
        month: months[i],
        compliance: Math.min(monthScore, 100),
        target,
      });
    }

    return trendData;
  };

  const complianceData = calculateComplianceData();
  const hasData = complianceData.length > 0;
  const latestScore = hasData ? complianceData[complianceData.length - 1].compliance : 0;

  if (isLoading) {
    return (
      <Card className="card-3d" data-testid="chart-compliance-trend">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Compliance Score Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[280px] w-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentTenant) {
    return (
      <Card className="card-3d" data-testid="chart-compliance-trend">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Compliance Score Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[280px] w-full flex flex-col items-center justify-center text-muted-foreground">
            <Info className="h-8 w-8 mb-2" />
            <p className="text-sm">Select a tenant to view compliance data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card className="card-3d" data-testid="chart-compliance-trend">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Compliance Score Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[280px] w-full flex flex-col items-center justify-center text-muted-foreground">
            <TrendingUp className="h-8 w-8 mb-2" />
            <p className="text-sm text-center">No compliance activity yet</p>
            <p className="text-xs text-center mt-1">Start audits to track compliance progress</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-3d" data-testid="chart-compliance-trend">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Compliance Score Trend
          </CardTitle>
          <span className="text-sm font-medium text-primary">
            Current: {latestScore}%
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={complianceData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number, name: string) => [`${value}%`, name]}
              />
              <Area
                type="monotone"
                dataKey="target"
                stroke="hsl(142, 71%, 45%)"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#colorTarget)"
                name="Target"
              />
              <Area
                type="monotone"
                dataKey="compliance"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={2}
                fill="url(#colorCompliance)"
                name="Compliance Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-1" />
            <span className="text-xs text-muted-foreground">Compliance Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-2 opacity-50" />
            <span className="text-xs text-muted-foreground">Target</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
