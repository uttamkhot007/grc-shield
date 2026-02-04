import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/contexts/tenant-context";
import type { Risk } from "@shared/schema";

const getCellColor = (likelihood: number, impact: number) => {
  const score = likelihood * impact;
  if (score >= 16) return "bg-destructive/80";
  if (score >= 9) return "bg-chart-3/80";
  if (score >= 4) return "bg-chart-3/40";
  return "bg-chart-2/40";
};

export function RiskMatrix() {
  const { currentTenantId } = useTenant();

  const { data: risks = [] } = useQuery<Risk[]>({
    queryKey: ["/api/risks", currentTenantId || "all"],
  });

  // Build risk data from actual database risks
  const riskData = risks.map(risk => ({
    id: risk.id,
    likelihood: risk.likelihood || 1,
    impact: risk.impact || 1,
    label: risk.title,
    count: 1,
  }));

  return (
    <Card className="card-3d" data-testid="chart-risk-matrix">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Risk Heat Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
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
              <React.Fragment key={`row-${likelihood}`}>
                <div className="text-xs text-muted-foreground font-medium flex items-center justify-end pr-2">
                  {likelihood}
                </div>
                {[1, 2, 3, 4, 5].map((impact) => {
                  const risks = riskData.filter(
                    (r) => r.likelihood === likelihood && r.impact === impact
                  );
                  return (
                    <div
                      key={`${likelihood}-${impact}`}
                      className={cn(
                        "aspect-square rounded-md flex items-center justify-center text-xs font-bold transition-all cursor-pointer hover:scale-105",
                        getCellColor(likelihood, impact),
                        risks.length > 0 ? "text-white" : "text-transparent"
                      )}
                      title={risks.map((r) => r.label).join(", ")}
                    >
                      {risks.reduce((acc, r) => acc + r.count, 0) || ""}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-muted-foreground font-medium whitespace-nowrap">
            Likelihood
          </div>

          <div className="text-center text-xs text-muted-foreground font-medium mt-2">
            Impact
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-chart-2/40" />
            <span className="text-xs text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-chart-3/40" />
            <span className="text-xs text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-chart-3/80" />
            <span className="text-xs text-muted-foreground">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-destructive/80" />
            <span className="text-xs text-muted-foreground">Critical</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
