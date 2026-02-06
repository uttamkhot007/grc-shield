import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Radar, Search, Database, AlertTriangle, CheckCircle2, Eye,
  Play, RefreshCw, Filter, Lock, Users, FileText, Sparkles, Server
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTenant } from "@/contexts/tenant-context";
import type { DataDiscoveryResult } from "@shared/schema";

const classificationColors: Record<string, string> = {
  public: "bg-chart-2/10 text-chart-2",
  internal: "bg-chart-1/10 text-chart-1",
  confidential: "bg-orange-500/10 text-orange-500",
  restricted: "bg-destructive/10 text-destructive"
};

const piiTypeIcons: Record<string, React.ElementType> = {
  email: FileText,
  phone: FileText,
  ssn: Lock,
  name: Users,
  address: FileText,
  financial: Lock,
  health: Lock,
};

function DiscoveryResultCard({ result }: { result: DataDiscoveryResult }) {
  return (
    <Card className={`card-3d hover-elevate ${result.piiDetected ? "border-l-4 border-l-orange-500" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm">{result.tableName || result.sourceName}</h4>
              <p className="text-xs text-muted-foreground">{result.sourceType}</p>
            </div>
          </div>
          <Badge className={classificationColors[result.classificationLabel || "internal"]}>
            {result.classificationLabel}
          </Badge>
        </div>

        {result.columnName && (
          <div className="text-sm mb-2">
            <span className="text-muted-foreground">Column: </span>
            <span className="font-mono bg-muted px-1 rounded">{result.columnName}</span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-muted-foreground">Confidence:</span>
          <Progress value={result.confidence || 0} className="flex-1 h-1.5" />
          <span className="text-xs font-medium">{result.confidence}%</span>
        </div>

        {result.piiDetected && result.piiTypes && result.piiTypes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {result.piiTypes.map((pii, idx) => (
              <Badge key={idx} variant="outline" className="text-xs text-orange-500 border-orange-500/30">
                <Lock className="h-3 w-3 mr-1" /> {pii}
              </Badge>
            ))}
          </div>
        )}

        {result.recordCount && (
          <div className="text-xs text-muted-foreground mt-2">
            {result.recordCount.toLocaleString()} records
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DataDiscoveryPage() {
  const { toast } = useToast();
  const { currentTenantId } = useTenant();
  const [searchQuery, setSearchQuery] = useState("");
  const [classificationFilter, setClassificationFilter] = useState<string>("all");
  const [piiFilter, setPiiFilter] = useState<string>("all");

  const { data: results = [], isLoading } = useQuery<DataDiscoveryResult[]>({
    queryKey: ["/api/data-discovery", currentTenantId],
  });

  const runScanMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/data-discovery/scan", { tenantId: currentTenantId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-discovery"] });
      toast({ title: "Scan initiated", description: "Data discovery scan is running" });
    },
    onError: (error: any) => {
      toast({ title: "Scan failed", description: error.message, variant: "destructive" });
    },
  });

  const filteredResults = useMemo(() => {
    return results.filter(r => {
      const matchesSearch = !searchQuery || 
        r.sourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tableName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.columnName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClassification = classificationFilter === "all" || r.classificationLabel === classificationFilter;
      const matchesPii = piiFilter === "all" || 
        (piiFilter === "pii" && r.piiDetected) || 
        (piiFilter === "no_pii" && !r.piiDetected);
      return matchesSearch && matchesClassification && matchesPii;
    });
  }, [results, searchQuery, classificationFilter, piiFilter]);

  const stats = useMemo(() => {
    const byClassification: Record<string, number> = {};
    results.forEach(r => {
      const cls = r.classificationLabel || "internal";
      byClassification[cls] = (byClassification[cls] || 0) + 1;
    });
    const uniqueSources = new Set(results.map(r => r.sourceName));
    const piiCount = results.filter(r => r.piiDetected).length;
    const staleCount = results.filter(r => r.isStale).length;

    return {
      total: results.length,
      sources: uniqueSources.size,
      piiDetected: piiCount,
      stale: staleCount,
      byClassification,
      avgConfidence: results.length > 0 
        ? Math.round(results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length)
        : 0,
    };
  }, [results]);

  const lastScan = results.length > 0 
    ? new Date(Math.max(...results.map(r => new Date(r.scanDate).getTime())))
    : null;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Data Discovery Engine</h1>
          <p className="text-muted-foreground">Automated PII detection and classification</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-refresh-discovery">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button 
            className="btn-gradient" 
            onClick={() => runScanMutation.mutate()}
            disabled={runScanMutation.isPending}
            data-testid="button-run-discovery"
          >
            <Play className="h-4 w-4 mr-2" /> 
            {runScanMutation.isPending ? "Scanning..." : "Run Discovery"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Data Elements</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-chart-1/10">
                <Server className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.sources}</p>
                <p className="text-xs text-muted-foreground">Data Sources</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-orange-500/10">
                <Lock className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.piiDetected}</p>
                <p className="text-xs text-muted-foreground">PII Detected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.byClassification["restricted"] || 0}</p>
                <p className="text-xs text-muted-foreground">Restricted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-chart-2/10">
                <Radar className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgConfidence}%</p>
                <p className="text-xs text-muted-foreground">Avg Confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-chart-3/10">
                <RefreshCw className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-sm font-bold">{lastScan ? lastScan.toLocaleDateString() : "Never"}</p>
                <p className="text-xs text-muted-foreground">Last Scan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="results" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="results" data-testid="tab-results">Discovery Results</TabsTrigger>
          <TabsTrigger value="sources" data-testid="tab-sources">Data Sources</TabsTrigger>
          <TabsTrigger value="classification" data-testid="tab-classification">Classification</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search data elements..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-discovery"
              />
            </div>
            <Select value={classificationFilter} onValueChange={setClassificationFilter}>
              <SelectTrigger className="w-40" data-testid="select-classification-filter">
                <SelectValue placeholder="Classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classifications</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="confidential">Confidential</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
              </SelectContent>
            </Select>
            <Select value={piiFilter} onValueChange={setPiiFilter}>
              <SelectTrigger className="w-40" data-testid="select-pii-filter">
                <SelectValue placeholder="PII Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="pii">PII Only</SelectItem>
                <SelectItem value="no_pii">Non-PII</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <Card key={i} className="card-3d animate-pulse">
                  <CardContent className="p-4 h-40" />
                </Card>
              ))}
            </div>
          ) : filteredResults.length === 0 ? (
            <Card className="card-3d">
              <CardContent className="py-12 text-center">
                <Radar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Discovery Results</h3>
                <p className="text-muted-foreground mb-4">Run a discovery scan to find data elements</p>
                <Button className="btn-gradient" onClick={() => runScanMutation.mutate()}>
                  <Play className="h-4 w-4 mr-2" /> Run Discovery
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResults.map(result => (
                <DiscoveryResultCard key={result.id} result={result} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card className="card-3d">
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
              <CardDescription>Connected data sources for discovery</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.sources === 0 ? (
                <div className="text-center py-8">
                  <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No data sources configured</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Elements</TableHead>
                      <TableHead>PII Found</TableHead>
                      <TableHead>Last Scan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from(new Set(results.map(r => r.sourceName))).map(source => {
                      const sourceResults = results.filter(r => r.sourceName === source);
                      const piiCount = sourceResults.filter(r => r.piiDetected).length;
                      return (
                        <TableRow key={source}>
                          <TableCell className="font-medium">{source}</TableCell>
                          <TableCell>{sourceResults[0]?.sourceType || "Unknown"}</TableCell>
                          <TableCell>{sourceResults.length}</TableCell>
                          <TableCell>
                            <Badge variant={piiCount > 0 ? "destructive" : "secondary"}>
                              {piiCount}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(sourceResults[0]?.scanDate).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classification" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(classificationColors).map(([level, color]) => (
              <Card 
                key={level} 
                className="card-3d hover-elevate cursor-pointer"
                onClick={() => setClassificationFilter(level)}
              >
                <CardContent className="p-5">
                  <div className={`p-3 rounded-xl ${color} w-fit mb-3`}>
                    {level === "restricted" ? <Lock className="h-6 w-6" /> : 
                     level === "confidential" ? <AlertTriangle className="h-6 w-6" /> :
                     level === "internal" ? <Eye className="h-6 w-6" /> :
                     <CheckCircle2 className="h-6 w-6" />}
                  </div>
                  <p className="text-2xl font-bold">{stats.byClassification[level] || 0}</p>
                  <p className="text-sm text-muted-foreground capitalize">{level}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
