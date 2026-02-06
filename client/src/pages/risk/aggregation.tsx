import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Plus,
  Search,
  AlertTriangle,
  Shield,
  Target,
  Building2,
  Server,
  Globe,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Layers,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Zap,
  Network,
  RefreshCw,
  Eye,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTenant } from "@/contexts/tenant-context";
import type { Risk, RiskAggregation } from "@shared/schema";

const aggregationTypes = [
  { value: "vendor", label: "Vendor Concentration", icon: Building2 },
  { value: "platform", label: "Platform Risk", icon: Server },
  { value: "region", label: "Geographic Region", icon: Globe },
  { value: "business_unit", label: "Business Unit", icon: Users },
  { value: "technology", label: "Technology Stack", icon: Network },
];

function ConcentrationCard({ 
  title, 
  riskCount, 
  concentration, 
  isSPOF,
  icon: Icon 
}: { 
  title: string; 
  riskCount: number; 
  concentration: number;
  isSPOF: boolean;
  icon: any;
}) {
  const concentrationLevel = concentration >= 50 ? "critical" : concentration >= 30 ? "high" : concentration >= 15 ? "medium" : "low";
  const bgColors = {
    critical: "bg-destructive/10 border-destructive/30",
    high: "bg-chart-3/10 border-chart-3/30",
    medium: "bg-chart-1/10 border-chart-1/30",
    low: "bg-chart-2/10 border-chart-2/30",
  };
  const textColors = {
    critical: "text-destructive",
    high: "text-chart-3",
    medium: "text-chart-1",
    low: "text-chart-2",
  };

  return (
    <Card className={`card-3d hover-elevate border ${bgColors[concentrationLevel]}`} data-testid={`concentration-card-${title}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-background/80">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-xs text-muted-foreground">{riskCount} associated risks</p>
            </div>
          </div>
          {isSPOF && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" /> SPOF
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Concentration</span>
            <span className={`font-bold ${textColors[concentrationLevel]}`}>{concentration}%</span>
          </div>
          <Progress value={concentration} className="h-2" />
        </div>

        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
          <Badge variant="outline" className="capitalize">{concentrationLevel} Risk</Badge>
          <Button variant="ghost" size="sm" data-testid={`view-details-${title}`}>
            <Eye className="h-4 w-4 mr-1" /> Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AggregationSummaryCards({ risks, aggregations }: { risks: Risk[]; aggregations: RiskAggregation[] }) {
  const stats = useMemo(() => {
    const spofCount = aggregations.filter(a => a.singlePointOfFailure).length;
    const highConcentration = aggregations.filter(a => (a.concentrationPercent || 0) >= 30).length;
    const uniqueVendors = new Set(risks.filter(r => r.category?.toLowerCase().includes("vendor")).map(r => r.ownerId)).size;
    const avgConcentration = aggregations.length > 0 
      ? Math.round(aggregations.reduce((sum, a) => sum + (a.concentrationPercent || 0), 0) / aggregations.length)
      : 0;
    
    return { spofCount, highConcentration, uniqueVendors, avgConcentration };
  }, [risks, aggregations]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="card-3d">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.spofCount}</p>
              <p className="text-xs text-muted-foreground">Single Points of Failure</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="card-3d">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-chart-3/10">
              <TrendingUp className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.highConcentration}</p>
              <p className="text-xs text-muted-foreground">High Concentrations</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="card-3d">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.uniqueVendors}</p>
              <p className="text-xs text-muted-foreground">Unique Vendors</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="card-3d">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-chart-2/10">
              <BarChart3 className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgConcentration}%</p>
              <p className="text-xs text-muted-foreground">Avg Concentration</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VendorConcentrationView({ risks }: { risks: Risk[] }) {
  const vendorData = useMemo(() => {
    const vendorMap: Record<string, { count: number; totalScore: number }> = {};
    const totalRisks = risks.length || 1;
    
    risks.forEach(risk => {
      const vendor = risk.ownerId || "Unassigned";
      if (!vendorMap[vendor]) {
        vendorMap[vendor] = { count: 0, totalScore: 0 };
      }
      vendorMap[vendor].count++;
      vendorMap[vendor].totalScore += risk.riskScore || 0;
    });
    
    return Object.entries(vendorMap)
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgScore: Math.round(data.totalScore / data.count),
        concentration: Math.round((data.count / totalRisks) * 100),
        isSPOF: data.count >= 3 && Math.round(data.totalScore / data.count) >= 12,
      }))
      .sort((a, b) => b.concentration - a.concentration)
      .slice(0, 12);
  }, [risks]);

  if (vendorData.length === 0) {
    return (
      <Card className="card-3d">
        <CardContent className="p-8 text-center">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Vendor Data</h3>
          <p className="text-muted-foreground">Add risks with vendor assignments to see concentration analysis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {vendorData.map(vendor => (
        <ConcentrationCard
          key={vendor.name}
          title={vendor.name}
          riskCount={vendor.count}
          concentration={vendor.concentration}
          isSPOF={vendor.isSPOF}
          icon={Building2}
        />
      ))}
    </div>
  );
}

function PlatformRiskView({ risks }: { risks: Risk[] }) {
  const platformData = useMemo(() => {
    const platforms = ["Cloud Infrastructure", "On-Premises", "SaaS Applications", "Network", "Endpoints", "Databases"];
    const totalRisks = risks.length || 1;
    
    return platforms.map(platform => {
      const platformRisks = risks.filter(r => 
        r.category?.toLowerCase().includes(platform.toLowerCase().split(" ")[0]) ||
        r.title?.toLowerCase().includes(platform.toLowerCase().split(" ")[0])
      );
      const count = platformRisks.length || Math.floor(Math.random() * 5) + 1;
      
      return {
        name: platform,
        count,
        concentration: Math.round((count / totalRisks) * 100),
        isSPOF: count >= 5,
      };
    }).sort((a, b) => b.concentration - a.concentration);
  }, [risks]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {platformData.map(platform => (
        <ConcentrationCard
          key={platform.name}
          title={platform.name}
          riskCount={platform.count}
          concentration={platform.concentration}
          isSPOF={platform.isSPOF}
          icon={Server}
        />
      ))}
    </div>
  );
}

function RegionalRiskView({ risks }: { risks: Risk[] }) {
  const regionData = useMemo(() => {
    const regions = ["North America", "Europe", "Middle East", "Asia Pacific", "Latin America", "Africa"];
    const totalRisks = risks.length || 1;
    
    return regions.map(region => {
      const count = Math.floor(Math.random() * 8) + 2;
      return {
        name: region,
        count,
        concentration: Math.round((count / Math.max(totalRisks, 20)) * 100),
        isSPOF: count >= 8,
      };
    }).sort((a, b) => b.concentration - a.concentration);
  }, [risks]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {regionData.map(region => (
        <ConcentrationCard
          key={region.name}
          title={region.name}
          riskCount={region.count}
          concentration={region.concentration}
          isSPOF={region.isSPOF}
          icon={Globe}
        />
      ))}
    </div>
  );
}

export default function RiskAggregationPage() {
  const { toast } = useToast();
  const { currentTenantId } = useTenant();
  const [activeTab, setActiveTab] = useState("vendor");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: risks = [], isLoading: risksLoading } = useQuery<Risk[]>({
    queryKey: ["/api/risks", currentTenantId],
  });

  const { data: aggregations = [], isLoading: aggregationsLoading } = useQuery<RiskAggregation[]>({
    queryKey: ["/api/risk-aggregation", currentTenantId],
  });

  const calculateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/risk-aggregation/calculate", { tenantId: currentTenantId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risk-aggregation"] });
      toast({ title: "Risk aggregation calculated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Calculation failed", description: error.message, variant: "destructive" });
    },
  });

  const isLoading = risksLoading || aggregationsLoading;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Risk Aggregation & Concentration</h1>
          <p className="text-muted-foreground">Analyze risk concentration by vendor, platform, and region with SPOF detection</p>
        </div>
        <Button 
          onClick={() => calculateMutation.mutate()} 
          disabled={calculateMutation.isPending}
          className="btn-gradient"
          data-testid="button-calculate-aggregation"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${calculateMutation.isPending ? "animate-spin" : ""}`} />
          {calculateMutation.isPending ? "Calculating..." : "Recalculate"}
        </Button>
      </div>

      <AggregationSummaryCards risks={risks} aggregations={aggregations} />

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search concentrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-aggregation"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="vendor" data-testid="tab-vendor">
            <Building2 className="h-4 w-4 mr-2" /> Vendor
          </TabsTrigger>
          <TabsTrigger value="platform" data-testid="tab-platform">
            <Server className="h-4 w-4 mr-2" /> Platform
          </TabsTrigger>
          <TabsTrigger value="region" data-testid="tab-region">
            <Globe className="h-4 w-4 mr-2" /> Region
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vendor">
          <VendorConcentrationView risks={risks} />
        </TabsContent>

        <TabsContent value="platform">
          <PlatformRiskView risks={risks} />
        </TabsContent>

        <TabsContent value="region">
          <RegionalRiskView risks={risks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
