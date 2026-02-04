import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  Search,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardSkeleton } from "@/components/loading-skeleton";
import { fetchFrameworks, fetchDashboardStats } from "@/lib/api";
import { useTenant } from "@/contexts/tenant-context";
import { useToast } from "@/hooks/use-toast";
import {
  DashboardSelector,
  DashboardType,
  dashboardConfigs,
} from "@/components/dashboard/dashboard-selector";
import { ExecutiveDashboard } from "@/components/dashboard/executive-dashboard";
import { CISODashboard } from "@/components/dashboard/ciso-dashboard";
import { CRODashboard } from "@/components/dashboard/cro-dashboard";
import { CDPODashboard } from "@/components/dashboard/cdpo-dashboard";
import { CHRODashboard } from "@/components/dashboard/chro-dashboard";
import { exportWidget, ExportFormat } from "@/lib/dashboard-export";

export default function Dashboard() {
  const { currentTenantId, currentTenant } = useTenant();
  const { toast } = useToast();
  const [currentDashboard, setCurrentDashboard] = useState<DashboardType>("executive");
  const [isExporting, setIsExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const { data: frameworks, isLoading: frameworksLoading } = useQuery({
    queryKey: ["/api/frameworks"],
    queryFn: fetchFrameworks,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats", currentTenantId || "all"],
    queryFn: () => fetchDashboardStats(currentTenantId || undefined),
  });

  const isLoading = frameworksLoading || statsLoading;

  const handleExport = async (format: ExportFormat) => {
    if (!dashboardRef.current) return;
    
    setIsExporting(true);
    try {
      const config = dashboardConfigs.find((d) => d.id === currentDashboard);
      await exportWidget(dashboardRef.current, format, {
        title: config?.title || "Dashboard",
        subtitle: currentTenant?.name || "All Organizations",
      });
      toast({
        title: "Export Complete",
        description: `Dashboard exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export dashboard. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="mesh-gradient min-h-full">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  const currentConfig = dashboardConfigs.find((d) => d.id === currentDashboard);

  const renderDashboard = () => {
    switch (currentDashboard) {
      case "executive":
        return <ExecutiveDashboard stats={stats} tenantName={currentTenant?.name} />;
      case "ciso":
        return <CISODashboard stats={stats} tenantName={currentTenant?.name} />;
      case "cro":
        return <CRODashboard stats={stats} tenantName={currentTenant?.name} />;
      case "cdpo":
        return <CDPODashboard stats={stats} tenantName={currentTenant?.name} />;
      case "chro":
        return <CHRODashboard stats={stats} tenantName={currentTenant?.name} />;
      default:
        return <ExecutiveDashboard stats={stats} tenantName={currentTenant?.name} />;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="mesh-gradient min-h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text">
                {currentConfig?.title || "GRC Command Center"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {currentTenant
                  ? `${currentConfig?.description} for ${currentTenant.name}`
                  : currentConfig?.description || "Monitor governance, risk, and compliance posture"
                }
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <DashboardSelector
                currentDashboard={currentDashboard}
                onDashboardChange={setCurrentDashboard}
                onExport={handleExport}
                isExporting={isExporting}
              />
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-9 w-48 bg-card/50 backdrop-blur-sm border-white/10"
                    data-testid="input-global-search"
                  />
                </div>
                <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                </Button>
                <Button variant="ghost" size="icon" data-testid="button-settings">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          <div ref={dashboardRef}>
            {renderDashboard()}
          </div>
        </div>
      </div>
    </div>
  );
}
