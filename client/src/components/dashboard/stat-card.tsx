import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "blue" | "green" | "amber" | "red" | "purple";
  className?: string;
}

const variantStyles = {
  blue: "stat-gradient-blue",
  green: "stat-gradient-green",
  amber: "stat-gradient-amber",
  red: "stat-gradient-red",
  purple: "stat-gradient-purple",
};

const iconBgStyles = {
  blue: "bg-chart-1/20 text-chart-1",
  green: "bg-chart-2/20 text-chart-2",
  amber: "bg-chart-3/20 text-chart-3",
  red: "bg-destructive/20 text-destructive",
  purple: "bg-chart-4/20 text-chart-4",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "blue",
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "card-3d overflow-hidden",
        variantStyles[variant],
        className
      )}
      data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
              {trend && (
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.isPositive ? "text-chart-2" : "text-destructive"
                  )}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              "p-3 rounded-xl",
              iconBgStyles[variant]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
