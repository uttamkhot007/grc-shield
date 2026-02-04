import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/contexts/tenant-context";
import {
  Calendar,
  Clock,
  AlertCircle,
  FileCheck,
  Shield,
  FileText,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Deadline {
  id: string;
  title: string;
  type: string;
  date: string;
  daysLeft: number;
  priority: string;
}

const typeIcons: Record<string, any> = {
  audit: FileCheck,
  policy: FileText,
  vendor: Shield,
  compliance: Shield,
  risk: AlertCircle,
};

const priorityStyles: Record<string, string> = {
  critical: "bg-destructive/20 text-destructive border-destructive/30",
  high: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  medium: "bg-chart-1/20 text-chart-1 border-chart-1/30",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function UpcomingDeadlines() {
  const { currentTenantId } = useTenant();

  const { data: deadlines = [], isLoading } = useQuery<Deadline[]>({
    queryKey: ["/api/dashboard/deadlines", currentTenantId || "all"],
    queryFn: async () => {
      const url = currentTenantId 
        ? `/api/dashboard/deadlines?tenantId=${currentTenantId}`
        : `/api/dashboard/deadlines`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch deadlines");
      return res.json();
    },
  });

  const hasDeadlines = deadlines.length > 0;

  return (
    <Card className="card-3d" data-testid="upcoming-deadlines">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">
            Upcoming Deadlines
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          <div className="space-y-1 p-4 pt-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !hasDeadlines ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-center">
                <Calendar className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No upcoming deadlines</p>
                <p className="text-xs">Schedule audits or set policy review dates</p>
              </div>
            ) : (
              deadlines.map((deadline) => {
                const Icon = typeIcons[deadline.type] || FileCheck;
                return (
                  <div
                    key={deadline.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover-elevate cursor-pointer"
                    data-testid={`deadline-item-${deadline.id}`}
                  >
                    <div className="p-2 rounded-lg bg-muted flex-shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {deadline.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(deadline.date)}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs flex-shrink-0",
                        priorityStyles[deadline.priority] || priorityStyles.medium
                      )}
                    >
                      {deadline.daysLeft}d
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
