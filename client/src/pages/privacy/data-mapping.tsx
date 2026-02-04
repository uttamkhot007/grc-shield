import { useState } from "react";
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

interface DataFlow {
  id: string;
  source: string;
  sourceType: string;
  destination: string;
  destinationType: string;
  dataTypes: string[];
  purpose: string;
  transferMechanism: string;
  crossBorder: boolean;
}

const mockDataFlows: DataFlow[] = [
  { id: "1", source: "Website Forms", sourceType: "web", destination: "CRM Database", destinationType: "database", dataTypes: ["Personal Data", "Contact Info"], purpose: "Lead Management", transferMechanism: "API", crossBorder: false },
  { id: "2", source: "CRM Database", sourceType: "database", destination: "Marketing Platform", destinationType: "cloud", dataTypes: ["Contact Info", "Marketing Preferences"], purpose: "Email Campaigns", transferMechanism: "ETL", crossBorder: true },
  { id: "3", source: "HR System", sourceType: "server", destination: "Payroll Provider", destinationType: "third_party", dataTypes: ["Employee Data", "Financial Data"], purpose: "Salary Processing", transferMechanism: "SFTP", crossBorder: false },
  { id: "4", source: "Mobile App", sourceType: "web", destination: "Analytics Platform", destinationType: "cloud", dataTypes: ["Behavioral Data", "Device Info"], purpose: "Usage Analytics", transferMechanism: "SDK", crossBorder: true },
  { id: "5", source: "Customer Portal", sourceType: "web", destination: "Support System", destinationType: "server", dataTypes: ["Personal Data", "Support Tickets"], purpose: "Customer Support", transferMechanism: "API", crossBorder: false },
];

const typeIcons: Record<string, any> = {
  web: Globe,
  database: Database,
  server: Server,
  cloud: Cloud,
  third_party: Building2,
  mobile: Laptop,
};

export default function DataMappingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [crossBorderFilter, setCrossBorderFilter] = useState("all");
  const [dataFlows] = useState<DataFlow[]>(mockDataFlows);

  const filteredFlows = dataFlows.filter((flow) => {
    const matchesSearch = flow.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flow.destination.toLowerCase().includes(searchQuery.toLowerCase());
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
                    <p className="text-2xl font-bold">{dataFlows.filter(f => f.destinationType === "third_party").length}</p>
                    <p className="text-xs text-muted-foreground">Third Party</p>
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
              <div className="space-y-4">
                {filteredFlows.map((flow) => {
                  const SourceIcon = typeIcons[flow.sourceType] || Database;
                  const DestIcon = typeIcons[flow.destinationType] || Database;
                  return (
                    <Card key={flow.id} className="hover-elevate" data-testid={`flow-${flow.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="p-3 rounded-lg bg-muted">
                              <SourceIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{flow.source}</p>
                              <p className="text-xs text-muted-foreground capitalize">{flow.sourceType.replace("_", " ")}</p>
                            </div>
                          </div>

                          <div className="flex flex-col items-center gap-1 px-4">
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{flow.transferMechanism}</span>
                          </div>

                          <div className="flex items-center gap-3 flex-1">
                            <div className="p-3 rounded-lg bg-muted">
                              <DestIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{flow.destination}</p>
                              <p className="text-xs text-muted-foreground capitalize">{flow.destinationType.replace("_", " ")}</p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-1 flex-wrap justify-end">
                              {flow.dataTypes.map((type) => (
                                <Badge key={type} variant="outline" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={flow.crossBorder ? "bg-chart-3/20 text-chart-3 border-0" : "bg-chart-2/20 text-chart-2 border-0"}>
                                {flow.crossBorder ? "Cross-Border" : "Domestic"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Purpose:</span> {flow.purpose}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
