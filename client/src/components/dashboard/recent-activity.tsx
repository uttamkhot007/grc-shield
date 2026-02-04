import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/contexts/tenant-context";
import {
  FileCheck,
  AlertTriangle,
  Shield,
  FileText,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
  Edit,
  Eye,
} from "lucide-react";
import type { ActivityLog } from "@shared/schema";

const actionIcons: Record<string, any> = {
  approved: CheckCircle,
  created: Plus,
  updated: Edit,
  deleted: Trash2,
  completed: Shield,
  identified: AlertTriangle,
  uploaded: FileText,
  scheduled: Clock,
  reviewed: FileCheck,
  viewed: Eye,
};

const actionColors: Record<string, string> = {
  approved: "text-chart-2",
  created: "text-chart-1",
  updated: "text-chart-4",
  deleted: "text-destructive",
  completed: "text-chart-1",
  identified: "text-chart-3",
  uploaded: "text-chart-4",
  scheduled: "text-muted-foreground",
  reviewed: "text-chart-5",
  viewed: "text-muted-foreground",
};

function formatTimeAgo(date: Date | string | null): string {
  if (!date) return "Just now";
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

function getUserInitials(userId: string | null): string {
  if (!userId) return "SY";
  return userId.substring(0, 2).toUpperCase();
}

export function RecentActivity() {
  const { currentTenantId } = useTenant();

  const { data: activities = [], isLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity-logs", currentTenantId || "all"],
    queryFn: async () => {
      const url = currentTenantId 
        ? `/api/activity-logs?tenantId=${currentTenantId}&limit=10`
        : `/api/activity-logs?limit=10`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch activity logs");
      return res.json();
    },
  });

  const hasActivities = activities.length > 0;

  return (
    <Card className="card-3d" data-testid="recent-activity">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[320px]">
          <div className="space-y-1 p-4 pt-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                Loading activity...
              </div>
            ) : !hasActivities ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-center">
                <Clock className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
                <p className="text-xs">Activity will appear here as you use the platform</p>
              </div>
            ) : (
              activities.map((activity) => {
                const Icon = actionIcons[activity.action] || FileText;
                const iconColor = actionColors[activity.action] || "text-muted-foreground";

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover-elevate cursor-pointer"
                    data-testid={`activity-item-${activity.id}`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-xs bg-muted">
                        {getUserInitials(activity.userId)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.action}</span>
                        <span className="text-muted-foreground"> {activity.targetType}: </span>
                        <span className="font-medium">{activity.targetName || activity.targetId}</span>
                      </p>
                      {activity.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {activity.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Icon className={`h-3 w-3 ${iconColor}`} />
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(activity.createdAt)}
                        </span>
                      </div>
                    </div>
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
