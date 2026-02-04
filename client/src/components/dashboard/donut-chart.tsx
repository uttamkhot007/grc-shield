import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/contexts/tenant-context";
import type { Risk, Control } from "@shared/schema";

interface DonutChartProps {
  title: string;
  variant: "controls" | "risks";
}

function getRiskLevel(likelihood: number, impact: number): string {
  const score = likelihood * impact;
  if (score >= 16) return "critical";
  if (score >= 9) return "high";
  if (score >= 4) return "medium";
  return "low";
}

export function DonutChart({ title, variant }: DonutChartProps) {
  const { currentTenantId } = useTenant();

  const { data: risks = [] } = useQuery<Risk[]>({
    queryKey: ["/api/risks", currentTenantId || "all"],
    enabled: variant === "risks",
  });

  const { data: controls = [] } = useQuery<Control[]>({
    queryKey: ["/api/controls"],
    enabled: variant === "controls",
  });

  const riskDistributionData = [
    { name: "Critical", value: risks.filter(r => getRiskLevel(r.likelihood || 3, r.impact || 3) === "critical").length, color: "hsl(0, 84%, 60%)" },
    { name: "High", value: risks.filter(r => getRiskLevel(r.likelihood || 3, r.impact || 3) === "high").length, color: "hsl(38, 92%, 50%)" },
    { name: "Medium", value: risks.filter(r => getRiskLevel(r.likelihood || 3, r.impact || 3) === "medium").length, color: "hsl(217, 91%, 60%)" },
    { name: "Low", value: risks.filter(r => getRiskLevel(r.likelihood || 3, r.impact || 3) === "low").length, color: "hsl(142, 71%, 45%)" },
  ];

  // Controls don't have status field in DB - categorize by automation level instead
  const controlStatusData = [
    { name: "Automated", value: controls.filter(c => c.automationLevel === "fully_automated").length, color: "hsl(142, 71%, 45%)" },
    { name: "Partial", value: controls.filter(c => c.automationLevel === "partially_automated").length, color: "hsl(217, 91%, 60%)" },
    { name: "Manual", value: controls.filter(c => c.automationLevel === "manual" || !c.automationLevel).length, color: "hsl(38, 92%, 50%)" },
  ];

  const data = variant === "controls" ? controlStatusData : riskDistributionData;
  const total = variant === "controls" ? controls.length : data.reduce((acc, item) => acc + item.value, 0);
  const centerText = total.toString();
  const centerLabel = variant === "controls" ? "Controls" : "Risks";

  return (
    <Card className="card-3d" data-testid={`chart-donut-${variant}`}>
      <CardHeader className="pb-0">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                formatter={(value: number) => [value, ""]}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-2xl font-bold">{centerText}</div>
              <div className="text-xs text-muted-foreground">{centerLabel}</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground truncate">
                {item.name}
              </span>
              <span className="text-xs font-medium ml-auto">
                {total === 0 ? "0" : Math.round((item.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
