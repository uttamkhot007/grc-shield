import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTenant } from "@/contexts/tenant-context";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, ShieldAlert, Bug, AlertTriangle, RefreshCw, Search, Filter,
  ExternalLink, ChevronRight, Clock, CheckCircle2, XCircle, Target,
  TrendingUp, BarChart3, FileWarning, Globe, Mail, Zap
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const SEVERITY_COLORS = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
  info: '#6b7280'
};

export default function VulnerabilityManagementPage() {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedVuln, setSelectedVuln] = useState<any>(null);

  const selectedTenant = currentTenant?.id || null;

  const { data: securityFindings = [], isLoading: findingsLoading } = useQuery<any[]>({
    queryKey: ['/api/security/findings', selectedTenant],
    queryFn: async () => {
      const res = await fetch(`/api/security/findings?tenantId=${selectedTenant}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedTenant,
  });

  const { data: webAppVulns = [] } = useQuery<any[]>({
    queryKey: ['/api/security/all-webapp-vulnerabilities', selectedTenant],
    queryFn: async () => {
      const res = await fetch(`/api/security/webapp-scans?tenantId=${selectedTenant}`);
      if (!res.ok) return [];
      const scans = await res.json();
      const allVulns: any[] = [];
      for (const scan of scans) {
        if (scan.vulnerabilitiesCount) {
          const vulnRes = await fetch(`/api/security/webapp-scans/${scan.id}/vulnerabilities`);
          if (vulnRes.ok) {
            const vulns = await vulnRes.json();
            allVulns.push(...vulns.map((v: any) => ({ ...v, source: 'webapp_scan', scanName: scan.scanName })));
          }
        }
      }
      return allVulns;
    },
    enabled: !!selectedTenant,
  });

  const { data: emailVulns = [] } = useQuery<any[]>({
    queryKey: ['/api/security/email-vulnerabilities', selectedTenant],
    queryFn: async () => {
      const res = await fetch(`/api/security/email-assessments?tenantId=${selectedTenant}`);
      if (!res.ok) return [];
      const assessments = await res.json();
      const vulns: any[] = [];
      for (const a of assessments) {
        if (a.spfStatus === 'fail') {
          vulns.push({
            id: `${a.id}-spf`,
            source: 'email_security',
            severity: 'high',
            title: 'SPF Record Missing or Invalid',
            description: `Domain ${a.domain} has no valid SPF record, allowing email spoofing.`,
            domain: a.domain,
            owaspCategory: 'A05:2021-Security Misconfiguration'
          });
        }
        if (a.dkimStatus === 'fail') {
          vulns.push({
            id: `${a.id}-dkim`,
            source: 'email_security',
            severity: 'high',
            title: 'DKIM Not Configured',
            description: `Domain ${a.domain} lacks DKIM signing, compromising email integrity.`,
            domain: a.domain
          });
        }
        if (a.dmarcStatus === 'fail') {
          vulns.push({
            id: `${a.id}-dmarc`,
            source: 'email_security',
            severity: 'critical',
            title: 'DMARC Policy Not Configured',
            description: `Domain ${a.domain} has no DMARC policy, leaving it vulnerable to phishing.`,
            domain: a.domain
          });
        }
      }
      return vulns;
    },
    enabled: !!selectedTenant,
  });

  const allVulnerabilities = [
    ...securityFindings.map((f: any) => ({ ...f, source: 'security_scan' })),
    ...webAppVulns,
    ...emailVulns
  ];

  const filteredVulnerabilities = allVulnerabilities.filter((v: any) => {
    const matchesSearch = !searchQuery || 
      v.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || v.severity === severityFilter;
    const matchesSource = sourceFilter === 'all' || v.source === sourceFilter;
    return matchesSearch && matchesSeverity && matchesSource;
  });

  const severityCounts = {
    critical: allVulnerabilities.filter((v: any) => v.severity === 'critical').length,
    high: allVulnerabilities.filter((v: any) => v.severity === 'high').length,
    medium: allVulnerabilities.filter((v: any) => v.severity === 'medium').length,
    low: allVulnerabilities.filter((v: any) => v.severity === 'low').length,
    info: allVulnerabilities.filter((v: any) => v.severity === 'info').length,
  };

  const pieData = Object.entries(severityCounts)
    .filter(([_, count]) => count > 0)
    .map(([severity, count]) => ({
      name: severity.charAt(0).toUpperCase() + severity.slice(1),
      value: count,
      fill: SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS]
    }));

  const sourceCounts = [
    { name: 'Security Scans', count: allVulnerabilities.filter(v => v.source === 'security_scan').length },
    { name: 'Web App Scans', count: allVulnerabilities.filter(v => v.source === 'webapp_scan').length },
    { name: 'Email Security', count: allVulnerabilities.filter(v => v.source === 'email_security').length },
  ];

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

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'security_scan': return <Shield className="h-4 w-4" />;
      case 'webapp_scan': return <Globe className="h-4 w-4" />;
      case 'email_security': return <Mail className="h-4 w-4" />;
      default: return <Bug className="h-4 w-4" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'security_scan': return 'Security Scan';
      case 'webapp_scan': return 'Web App Scan';
      case 'email_security': return 'Email Security';
      default: return source;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Vulnerability Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Unified view of all security vulnerabilities across scanning engines
            </p>
          </div>
          <Button 
            data-testid="button-refresh"
            variant="outline" 
            className="gap-2"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/security/findings', selectedTenant] });
              queryClient.invalidateQueries({ queryKey: ['/api/security/all-webapp-vulnerabilities', selectedTenant] });
              queryClient.invalidateQueries({ queryKey: ['/api/security/email-vulnerabilities', selectedTenant] });
              toast({ title: "Refreshed", description: "Vulnerability data refreshed" });
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-white">{allVulnerabilities.length}</div>
              <div className="text-sm text-muted-foreground">Total Vulnerabilities</div>
            </CardContent>
          </Card>
          <Card className="bg-red-950/30 border-red-900/50">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-red-400">{severityCounts.critical}</div>
              <div className="text-sm text-red-400/70">Critical</div>
            </CardContent>
          </Card>
          <Card className="bg-orange-950/30 border-orange-900/50">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-orange-400">{severityCounts.high}</div>
              <div className="text-sm text-orange-400/70">High</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-950/30 border-yellow-900/50">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-yellow-400">{severityCounts.medium}</div>
              <div className="text-sm text-yellow-400/70">Medium</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-950/30 border-blue-900/50">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{severityCounts.low + severityCounts.info}</div>
              <div className="text-sm text-blue-400/70">Low/Info</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">By Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 col-span-2">
            <CardHeader>
              <CardTitle className="text-white text-lg">By Source</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourceCounts} layout="vertical">
                    <XAxis type="number" stroke="#64748b" />
                    <YAxis type="category" dataKey="name" stroke="#64748b" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">All Vulnerabilities</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    data-testid="input-search"
                    placeholder="Search vulnerabilities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-64 bg-slate-800 border-slate-600"
                  />
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-32 bg-slate-800 border-slate-600" data-testid="select-severity">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-40 bg-slate-800 border-slate-600" data-testid="select-source">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="security_scan">Security Scans</SelectItem>
                    <SelectItem value="webapp_scan">Web App Scans</SelectItem>
                    <SelectItem value="email_security">Email Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {findingsLoading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="h-8 w-8 animate-spin text-orange-400" />
              </div>
            ) : filteredVulnerabilities.length === 0 ? (
              <div className="text-center py-16">
                <ShieldAlert className="h-16 w-16 mx-auto text-slate-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Vulnerabilities Found</h3>
                <p className="text-muted-foreground">Run security scans to detect vulnerabilities</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-400">Severity</TableHead>
                    <TableHead className="text-slate-400">Title</TableHead>
                    <TableHead className="text-slate-400">Source</TableHead>
                    <TableHead className="text-slate-400">Category</TableHead>
                    <TableHead className="text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVulnerabilities.slice(0, 50).map((vuln: any, index) => (
                    <TableRow 
                      key={vuln.id || index} 
                      className="border-slate-700 hover:bg-slate-800/50 cursor-pointer"
                      onClick={() => setSelectedVuln(vuln)}
                      data-testid={`row-vuln-${index}`}
                    >
                      <TableCell>{getSeverityBadge(vuln.severity)}</TableCell>
                      <TableCell className="text-white font-medium max-w-md truncate">
                        {vuln.title}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {getSourceIcon(vuln.source)}
                          <span>{getSourceLabel(vuln.source)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {vuln.owaspCategory || vuln.cweId || '-'}
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVuln(vuln);
                          }}
                        >
                          View <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selectedVuln} onOpenChange={() => setSelectedVuln(null)}>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getSeverityBadge(selectedVuln?.severity)}
                <span className="text-white">{selectedVuln?.title}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                <p className="text-white">{selectedVuln?.description}</p>
              </div>
              
              {selectedVuln?.owaspCategory && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">OWASP Category</h4>
                  <Badge variant="outline" className="text-orange-400 border-orange-400/30">
                    {selectedVuln.owaspCategory}
                  </Badge>
                </div>
              )}
              
              {selectedVuln?.cweId && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">CWE ID</h4>
                  <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                    {selectedVuln.cweId}
                  </Badge>
                </div>
              )}
              
              {selectedVuln?.cvssScore && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">CVSS Score</h4>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                      {selectedVuln.cvssScore}
                    </Badge>
                    {selectedVuln.cvssVector && (
                      <span className="text-xs text-muted-foreground font-mono">{selectedVuln.cvssVector}</span>
                    )}
                  </div>
                </div>
              )}
              
              {selectedVuln?.affectedUrl && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Affected URL</h4>
                  <code className="text-sm text-blue-400">{selectedVuln.affectedUrl}</code>
                </div>
              )}
              
              {selectedVuln?.remediation && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Remediation</h4>
                  <p className="text-green-400">{selectedVuln.remediation}</p>
                </div>
              )}
              
              {selectedVuln?.references && selectedVuln.references.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">References</h4>
                  <div className="space-y-1">
                    {selectedVuln.references.map((ref: string, i: number) => (
                      <a 
                        key={i} 
                        href={ref} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline text-sm flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {ref}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 pt-4 border-t border-slate-700">
                <Badge variant="outline" className="text-slate-400">
                  {getSourceLabel(selectedVuln?.source)}
                </Badge>
                {selectedVuln?.scanName && (
                  <Badge variant="outline" className="text-slate-400">
                    {selectedVuln.scanName}
                  </Badge>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
