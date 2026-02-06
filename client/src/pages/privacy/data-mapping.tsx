import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/contexts/tenant-context";
import type { DataFlowMapping } from "@shared/schema";
import {
  Plus,
  Search,
  ArrowRight,
  Database,
  Server,
  Globe,
  Users,
  Building2,
  Cloud,
  Laptop,
  Shield,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const typeIcons: Record<string, any> = {
  web: Globe,
  database: Database,
  server: Server,
  cloud: Cloud,
  third_party: Building2,
  mobile: Laptop,
};

export default function DataMappingPage() {
  const { currentTenant } = useTenant();
  const [searchQuery, setSearchQuery] = useState("");
  const [crossBorderFilter, setCrossBorderFilter] = useState("all");

  const { data: dataFlows = [], isLoading } = useQuery<DataFlowMapping[]>({
    queryKey: ["/api/data-flow-mappings", currentTenant?.id],
    queryFn: async () => {
      const response = await fetch(`/api/data-flow-mappings?tenantId=${currentTenant?.id}`);
      if (!response.ok) throw new Error("Failed to fetch data flow mappings");
      return response.json();
    },
    enabled: !!currentTenant?.id,
  });

  const filteredFlows = dataFlows.filter((flow) => {
    const matchesSearch = (flow.sourceSystem || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (flow.destinationSystem || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCrossBorder = crossBorderFilter === "all" || 
      (crossBorderFilter === "cross_border" && flow.crossBorder) ||
      (crossBorderFilter === "domestic" && !flow.crossBorder);
    return matchesSearch && matchesCrossBorder;
  });

  const crossBorderCount = dataFlows.filter(f => f.crossBorder).length;
  const domesticCount = dataFlows.filter(f => !f.crossBorder).length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="mesh-gradient min-h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Data Mapping</h1>
              <p className="text-muted-foreground mt-1">
                Visualize and document data flows across your organization
              </p>
            </div>
            <Button data-testid="button-add-flow">
              <Plus className="h-4 w-4 mr-2" />
              Add Data Flow
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="stat-gradient-blue">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-1/20">
                    <Database className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{dataFlows.length}</p>
                    <p className="text-xs text-muted-foreground">Total Data Flows</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-amber">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-3/20">
                    <Globe className="h-5 w-5 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{crossBorderCount}</p>
                    <p className="text-xs text-muted-foreground">Cross-Border</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-green">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-2/20">
                    <Shield className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{domesticCount}</p>
                    <p className="text-xs text-muted-foreground">Domestic</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-purple">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-4/20">
                    <Building2 className="h-5 w-5 text-chart-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{dataFlows.filter(f => f.sensitivity === "high" || f.sensitivity === "critical").length}</p>
                    <p className="text-xs text-muted-foreground">High Sensitivity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="card-3d">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-base">Data Flow Mapping</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search flows..."
                      className="pl-9 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="input-search-flows"
                    />
                  </div>
                  <Select value={crossBorderFilter} onValueChange={setCrossBorderFilter}>
                    <SelectTrigger className="w-36" data-testid="select-transfer-type">
                      <SelectValue placeholder="Transfer Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Transfers</SelectItem>
                      <SelectItem value="cross_border">Cross-Border</SelectItem>
                      <SelectItem value="domestic">Domestic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredFlows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No data flows found. Add your first data flow mapping.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFlows.map((flow) => {
                    return (
                      <Card key={flow.id} className="hover-elevate" data-testid={`flow-${flow.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="p-3 rounded-lg bg-muted">
                                <Database className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{flow.sourceSystem}</p>
                                <p className="text-xs text-muted-foreground">Source System</p>
                              </div>
                            </div>

                            <div className="flex flex-col items-center gap-1 px-4">
                              <ArrowRight className="h-5 w-5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{flow.transferMethod || 'API'}</span>
                            </div>

                            <div className="flex items-center gap-3 flex-1">
                              <div className="p-3 rounded-lg bg-muted">
                                <Server className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{flow.destinationSystem}</p>
                                <p className="text-xs text-muted-foreground">Destination System</p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <div className="flex gap-1 flex-wrap justify-end">
                                {(flow.dataTypes || []).map((type) => (
                                  <Badge key={type} variant="outline" className="text-xs">
                                    {type}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={flow.crossBorder ? "bg-chart-3/20 text-chart-3 border-0" : "bg-chart-2/20 text-chart-2 border-0"}>
                                  {flow.crossBorder ? "Cross-Border" : "Domestic"}
                                </Badge>
                                {flow.sensitivity && (
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {flow.sensitivity}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          {flow.description && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-sm text-muted-foreground">{flow.description}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
