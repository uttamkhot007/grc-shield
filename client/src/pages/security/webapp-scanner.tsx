import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTenant } from "@/contexts/tenant-context";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Globe, Shield, Search, AlertTriangle, RefreshCw, Plus, Trash2, 
  Brain, Clock, Lock, Bug, ChevronRight, ExternalLink
} from "lucide-react";

export default function WebAppScannerPage() {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const [targetUrl, setTargetUrl] = useState("");
  const [scanName, setScanName] = useState("");
  const [scanType, setScanType] = useState("quick");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedScan, setSelectedScan] = useState<any>(null);

  const selectedTenant = currentTenant?.id || null;

  const { data: scans = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/security/webapp-scans', selectedTenant],
    queryFn: async () => {
      const res = await fetch(`/api/security/webapp-scans?tenantId=${selectedTenant}`);
      if (!res.ok) throw new Error('Failed to fetch scans');
      return res.json();
    },
    enabled: !!selectedTenant,
  });

  const { data: vulnerabilities = [] } = useQuery<any[]>({
    queryKey: ['/api/security/webapp-scans/vulnerabilities', selectedScan?.id],
    queryFn: async () => {
      const res = await fetch(`/api/security/webapp-scans/${selectedScan.id}/vulnerabilities`);
      if (!res.ok) throw new Error('Failed to fetch vulnerabilities');
      return res.json();
    },
    enabled: !!selectedScan,
  });

  const createScanMutation = useMutation({
    mutationFn: async (data: { targetUrl: string; scanName: string; scanType: string }) => {
      const res = await apiRequest('POST', '/api/security/webapp-scans', {
        tenantId: selectedTenant,
        ...data,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Scan Complete", description: "Web application scan completed" });
      setCreateDialogOpen(false);
      setTargetUrl("");
      setScanName("");
      queryClient.invalidateQueries({ queryKey: ['/api/security/webapp-scans', selectedTenant] });
    },
    onError: (error: any) => {
      toast({ title: "Scan Failed", description: error.message, variant: "destructive" });
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/security/webapp-scans/${id}/analyze`, {});
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Analysis Complete", description: "AI has analyzed the scan results" });
      setSelectedScan(data);
      queryClient.invalidateQueries({ queryKey: ['/api/security/webapp-scans', selectedTenant] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/security/webapp-scans/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Scan removed" });
      queryClient.invalidateQueries({ queryKey: ['/api/security/webapp-scans', selectedTenant] });
    }
  });

  const rescanMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/security/webapp-scans/${id}/rescan`, {});
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Rescan Complete", description: "Web application has been rescanned" });
      queryClient.invalidateQueries({ queryKey: ['/api/security/webapp-scans', selectedTenant] });
    },
    onError: (error: any) => {
      toast({ title: "Rescan Failed", description: error.message, variant: "destructive" });
    }
  });

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-600/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      info: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    };
    return <Badge className={colors[severity] || colors.info}>{severity?.toUpperCase()}</Badge>;
  };

  const getRiskBadge = (riskLevel: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-600/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return <Badge className={colors[riskLevel] || colors.low}>{riskLevel?.toUpperCase()} RISK</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Web Application Scanner
            </h1>
            <p className="text-muted-foreground mt-1">
              Scan web applications for vulnerabilities, security headers, and OWASP Top 10 issues
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-scan" className="gap-2">
                <Plus className="h-4 w-4" />
                New Scan
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle>Web Application Security Scan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm text-muted-foreground">Target URL</label>
                  <Input
                    data-testid="input-target-url"
                    placeholder="https://example.com"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="mt-1 bg-slate-800 border-slate-600"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Scan Name (optional)</label>
                  <Input
                    data-testid="input-scan-name"
                    placeholder="My Web App Scan"
                    value={scanName}
                    onChange={(e) => setScanName(e.target.value)}
                    className="mt-1 bg-slate-800 border-slate-600"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Scan Type</label>
                  <Select value={scanType} onValueChange={setScanType}>
                    <SelectTrigger className="mt-1 bg-slate-800 border-slate-600" data-testid="select-scan-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quick">Quick Scan (Headers & SSL)</SelectItem>
                      <SelectItem value="full">Full Scan (Comprehensive)</SelectItem>
                      <SelectItem value="api">API Security Scan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  data-testid="button-start-scan"
                  className="w-full"
                  onClick={() => createScanMutation.mutate({ targetUrl, scanName, scanType })}
                  disabled={!targetUrl || createScanMutation.isPending}
                >
                  {createScanMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Scanning...
                    </>
                  ) : (
                    'Start Scan'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : scans.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="py-16 text-center">
              <Search className="h-16 w-16 mx-auto text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Web Application Scans</h3>
              <p className="text-muted-foreground mb-4">Scan your first web application for security vulnerabilities</p>
              <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Scan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {scans.map((scan) => (
              <Card 
                key={scan.id} 
                className="bg-slate-900/50 border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer"
                onClick={() => setSelectedScan(scan)}
                data-testid={`card-scan-${scan.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <Globe className="h-6 w-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white flex items-center gap-2">
                          {scan.scanName || scan.targetUrl}
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </h3>
                        <p className="text-sm text-muted-foreground">{scan.targetUrl}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {scan.completedAt ? new Date(scan.completedAt).toLocaleString() : 'In Progress'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      {scan.vulnerabilitiesCount && (
                        <div className="flex gap-3 text-sm">
                          {(scan.vulnerabilitiesCount as any).critical > 0 && (
                            <span className="text-red-400">{(scan.vulnerabilitiesCount as any).critical} Critical</span>
                          )}
                          {(scan.vulnerabilitiesCount as any).high > 0 && (
                            <span className="text-orange-400">{(scan.vulnerabilitiesCount as any).high} High</span>
                          )}
                          {(scan.vulnerabilitiesCount as any).medium > 0 && (
                            <span className="text-yellow-400">{(scan.vulnerabilitiesCount as any).medium} Medium</span>
                          )}
                          {(scan.vulnerabilitiesCount as any).low > 0 && (
                            <span className="text-blue-400">{(scan.vulnerabilitiesCount as any).low} Low</span>
                          )}
                        </div>
                      )}
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${scan.overallScore >= 80 ? 'text-green-400' : scan.overallScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {scan.overallScore || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                      {getRiskBadge(scan.riskLevel)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => analyzeMutation.mutate(scan.id)}
                      disabled={analyzeMutation.isPending}
                      data-testid={`button-analyze-${scan.id}`}
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      AI Analysis
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-purple-400 hover:text-purple-300"
                      onClick={() => rescanMutation.mutate(scan.id)}
                      disabled={rescanMutation.isPending}
                      data-testid={`button-rescan-${scan.id}`}
                    >
                      <RefreshCw className={`h-4 w-4 ${rescanMutation.isPending ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => deleteMutation.mutate(scan.id)}
                      data-testid={`button-delete-${scan.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedScan && (
          <Dialog open={!!selectedScan} onOpenChange={() => setSelectedScan(null)}>
            <DialogContent className="bg-slate-900 border-slate-700 max-w-5xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-400" />
                  {selectedScan.scanName || selectedScan.targetUrl}
                </DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="bg-slate-800">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                  <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="pt-4 text-center">
                        <div className={`text-3xl font-bold ${selectedScan.overallScore >= 80 ? 'text-green-400' : selectedScan.overallScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {selectedScan.overallScore || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Security Score</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="pt-4 text-center">
                        <div className="text-3xl font-bold text-red-400">
                          {(selectedScan.vulnerabilitiesCount as any)?.critical || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Critical Issues</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="pt-4 text-center">
                        <div className="text-3xl font-bold text-orange-400">
                          {(selectedScan.vulnerabilitiesCount as any)?.high || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">High Issues</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="pt-4 text-center">
                        <div className="text-3xl font-bold text-yellow-400">
                          {(selectedScan.vulnerabilitiesCount as any)?.medium || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Medium Issues</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {selectedScan.sslInfo && (
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Lock className="h-5 w-5 text-green-400" />
                          SSL/TLS Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <Badge className={(selectedScan.sslInfo as any).enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                            {(selectedScan.sslInfo as any).enabled ? 'HTTPS Enabled' : 'No HTTPS'}
                          </Badge>
                          <span className="text-muted-foreground">{(selectedScan.sslInfo as any).protocol}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedScan.owaspFindings && (
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Shield className="h-5 w-5 text-purple-400" />
                          OWASP Top 10 Assessment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(selectedScan.owaspFindings as Record<string, number>).map(([category, count]) => (
                            <div key={category} className="flex items-center justify-between p-2 bg-slate-900 rounded">
                              <span className="text-sm">{category}</span>
                              <Badge variant={count > 0 ? "destructive" : "outline"}>
                                {count} {count === 1 ? 'issue' : 'issues'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="vulnerabilities" className="space-y-4">
                  {vulnerabilities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No vulnerabilities found
                    </div>
                  ) : (
                    vulnerabilities.map((vuln) => (
                      <Card key={vuln.id} className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <Bug className="h-5 w-5 mt-1 text-red-400" />
                              <div>
                                <h4 className="font-semibold text-white">{vuln.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{vuln.description}</p>
                                {vuln.affectedUrl && (
                                  <p className="text-xs text-blue-400 mt-2">Affected: {vuln.affectedUrl}</p>
                                )}
                                {vuln.remediation && (
                                  <div className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded">
                                    <p className="text-xs text-green-400">{vuln.remediation}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {getSeverityBadge(vuln.severity)}
                              {vuln.cweId && <Badge variant="outline">{vuln.cweId}</Badge>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="headers">
                  {selectedScan.headerAnalysis && (
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          {Object.entries(selectedScan.headerAnalysis as Record<string, string | null>).map(([header, value]) => (
                            <div key={header} className="flex items-center justify-between p-3 bg-slate-900 rounded">
                              <span className="font-mono text-sm">{header}</span>
                              {value ? (
                                <Badge className="bg-green-500/20 text-green-400">Configured</Badge>
                              ) : (
                                <Badge className="bg-red-500/20 text-red-400">Missing</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="analysis">
                  {selectedScan.aiAnalysis ? (
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="pt-4">
                        <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-slate-900 p-4 rounded-lg">
                          {typeof selectedScan.aiAnalysis === 'string' 
                            ? selectedScan.aiAnalysis 
                            : JSON.stringify(selectedScan.aiAnalysis, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="text-center py-8">
                      <Brain className="h-12 w-12 mx-auto text-slate-600 mb-4" />
                      <p className="text-muted-foreground mb-4">No AI analysis yet</p>
                      <Button onClick={() => analyzeMutation.mutate(selectedScan.id)}>
                        Generate AI Analysis
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
