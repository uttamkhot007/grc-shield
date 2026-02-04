import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/contexts/tenant-context";
import type { Framework } from "@shared/schema";

interface TenantFramework {
  id: string;
  tenantId: string;
  frameworkId: string;
  status: string;
  complianceScore: number | null;
  applicabilityType: string;
  assignedAt: string;
  frameworkName: string;
  frameworkShortName: string;
  frameworkDescription: string;
  frameworkCategory: string;
  frameworkRegion: string;
  controlCount: number | null;
}

const statusStyles: Record<string, string> = {
  "on-track": "bg-chart-1/20 text-chart-1 border-chart-1/30",
  "at-risk": "bg-chart-3/20 text-chart-3 border-chart-3/30",
  "compliant": "bg-chart-2/20 text-chart-2 border-chart-2/30",
  "in-progress": "bg-chart-4/20 text-chart-4 border-chart-4/30",
};

const progressStyles: Record<string, string> = {
  "on-track": "bg-chart-1",
  "at-risk": "bg-chart-3",
  "compliant": "bg-chart-2",
  "in-progress": "bg-chart-4",
};

function getStatusFromScore(score: number): string {
  if (score >= 90) return "compliant";
  if (score >= 75) return "on-track";
  if (score >= 60) return "at-risk";
  return "in-progress";
}

interface FrameworkProgressProps {
  frameworks?: Framework[];
}

export function FrameworkProgress({ frameworks: globalFrameworks }: FrameworkProgressProps) {
  const { currentTenantId } = useTenant();

  const { data: tenantFrameworks = [], isLoading } = useQuery<TenantFramework[]>({
    queryKey: ["/api/tenant-frameworks", currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return [];
      const res = await fetch(`/api/tenant-frameworks?tenantId=${currentTenantId}`);
      if (!res.ok) throw new Error("Failed to fetch tenant frameworks");
      return res.json();
    },
    enabled: !!currentTenantId,
  });

  const displayFrameworks = currentTenantId && tenantFrameworks.length > 0
    ? tenantFrameworks.slice(0, 4).map((tf) => {
        const progress = tf.complianceScore ?? 0;
        const status = getStatusFromScore(progress);
        const controlCount = tf.controlCount ?? 0;
        return {
          name: tf.frameworkShortName || tf.frameworkName,
          progress,
          status,
          icon: Shield,
          controls: { 
            completed: Math.round(controlCount * (progress / 100)), 
            total: controlCount 
          },
          applicabilityType: tf.applicabilityType,
        };
      })
    : globalFrameworks && globalFrameworks.length > 0
      ? globalFrameworks.slice(0, 4).map((f) => {
          const progress = 0;
          const status = "in-progress";
          return {
            name: f.shortName,
            progress,
            status,
            icon: Shield,
            controls: { completed: 0, total: f.controlCount || 0 },
            applicabilityType: "global",
          };
        })
      : [];

  const hasFrameworks = displayFrameworks.length > 0;

  return (
    <Card className="card-3d" data-testid="chart-framework-progress">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Framework Compliance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !hasFrameworks ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-center">
            <Shield className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No frameworks assigned</p>
            <p className="text-xs">Select a tenant to view framework compliance</p>
          </div>
        ) : (
          displayFrameworks.map((framework) => (
            <div key={framework.name} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-md bg-muted">
                    <framework.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium truncate">
                    {framework.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {framework.controls.completed}/{framework.controls.total}
                  </span>
                  <Badge
                    variant="outline"
                    className={statusStyles[framework.status] || statusStyles["in-progress"]}
                  >
                    {framework.progress}%
                  </Badge>
                </div>
              </div>
              <div className="relative">
                <Progress
                  value={framework.progress}
                  className="h-2"
                />
                <div
                  className={`absolute inset-0 h-2 rounded-full ${progressStyles[framework.status] || progressStyles["in-progress"]}`}
                  style={{ width: `${framework.progress}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
