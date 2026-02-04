import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useTenant } from "@/contexts/tenant-context";
import { 
  Shield, ShieldAlert, ShieldCheck, ShieldX, Upload, Brain, 
  TrendingUp, TrendingDown, Minus, AlertTriangle, Target,
  FileSearch, BarChart3, Activity, RefreshCw, Clock, CheckCircle2,
  XCircle, AlertCircle, ChevronRight, Zap
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Legend
} from "recharts";

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899'];

export default function SecurityModule() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  const selectedTenant = currentTenant?.id || null;
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [scanAnalysisId, setScanAnalysisId] = useState<string | null>(null);

  const { data: scans = [], isLoading: scansLoading } = useQuery<any[]>({
    queryKey: ['/api/security/scans', selectedTenant],
  });

  const { data: findings = [], isLoading: findingsLoading } = useQuery<any[]>({
    queryKey: ['/api/security/findings', selectedTenant],
  });

  const { data: scorecards = [], isLoading: scorecardsLoading } = useQuery<any[]>({
    queryKey: ['/api/security/scorecards', selectedTenant],
  });

  const { data: postureHistory = [] } = useQuery<any[]>({
    queryKey: ['/api/security/history', selectedTenant],
  });

  const analyzeScanMutation = useMutation({
    mutationFn: async (scanId: string) => {
      const res = await apiRequest(`/api/security/scans/${scanId}/analyze`, 'POST', {});
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Analysis Complete", description: "AI has analyzed the security scan" });
      queryClient.invalidateQueries({ queryKey: ['/api/security/scans'] });
    },
    onError: (error: any) => {
      toast({ title: "Analysis Failed", description: error.message, variant: "destructive" });
    }
  });

  const generateScorecardMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('/api/security/generate-scorecard', 'POST', {
        tenantId: selectedTenant,
        period: new Date().toISOString().split('T')[0].substring(0, 7)
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Scorecard Generated", description: "Security scorecard has been created" });
      queryClient.invalidateQueries({ queryKey: ['/api/security/scorecards'] });
    },
    onError: (error: any) => {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    }
  });

  const findingsBySeverity = {
    critical: findings.filter((f: any) => f.severity === 'critical').length,
    high: findings.filter((f: any) => f.severity === 'high').length,
    medium: findings.filter((f: any) => f.severity === 'medium').length,
    low: findings.filter((f: any) => f.severity === 'low').length,
    info: findings.filter((f: any) => f.severity === 'info').length,
  };

  const findingsByStatus = {
    open: findings.filter((f: any) => f.status === 'open').length,
    in_progress: findings.filter((f: any) => f.status === 'in_progress').length,
    remediated: findings.filter((f: any) => f.status === 'remediated').length,
    accepted: findings.filter((f: any) => f.status === 'accepted').length,
  };

  const latestScorecard = scorecards[0];

  const pieData = [
    { name: 'Critical', value: findingsBySeverity.critical, color: '#ef4444' },
    { name: 'High', value: findingsBySeverity.high, color: '#f97316' },
    { name: 'Medium', value: findingsBySeverity.medium, color: '#f59e0b' },
    { name: 'Low', value: findingsBySeverity.low, color: '#10b981' },
    { name: 'Info', value: findingsBySeverity.info, color: '#6b7280' },
  ].filter(d => d.value > 0);

  const statusData = [
    { name: 'Open', value: findingsByStatus.open },
    { name: 'In Progress', value: findingsByStatus.in_progress },
    { name: 'Remediated', value: findingsByStatus.remediated },
    { name: 'Accepted', value: findingsByStatus.accepted },
  ];

  const radarData = latestScorecard?.dimensions ? Object.entries(latestScorecard.dimensions).map(([key, val]: [string, any]) => ({
    dimension: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    score: val.score || 0,
    target: 85
  })) : [];

  const sampleHistoryData = [
    { month: 'Jan', current: 65, target: 85 },
    { month: 'Feb', current: 68, target: 85 },
    { month: 'Mar', current: 72, target: 85 },
    { month: 'Apr', current: 70, target: 85 },
    { month: 'May', current: 75, target: 85 },
    { month: 'Jun', current: 78, target: 85 },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive" data-testid="badge-severity-critical">Critical</Badge>;
      case 'high': return <Badge className="bg-orange-500" data-testid="badge-severity-high">High</Badge>;
      case 'medium': return <Badge className="bg-yellow-500 text-black" data-testid="badge-severity-medium">Medium</Badge>;
      case 'low': return <Badge className="bg-green-500" data-testid="badge-severity-low">Low</Badge>;
      default: return <Badge variant="secondary" data-testid="badge-severity-info">Info</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge variant="destructive" data-testid="badge-status-open">Open</Badge>;
      case 'in_progress': return <Badge className="bg-blue-500" data-testid="badge-status-progress">In Progress</Badge>;
      case 'remediated': return <Badge className="bg-green-500" data-testid="badge-status-remediated">Remediated</Badge>;
      case 'accepted': return <Badge variant="secondary" data-testid="badge-status-accepted">Accepted</Badge>;
      default: return <Badge variant="outline" data-testid="badge-status-unknown">{status}</Badge>;
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-500';
      case 'B': return 'text-blue-500';
      case 'C': return 'text-yellow-500';
      case 'D': return 'text-orange-500';
      case 'F': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent" data-testid="text-page-title">
            Security Module
          </h1>
          <p className="text-muted-foreground mt-1">
            Vulnerability management, security posture, and compliance monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => generateScorecardMutation.mutate()}
            disabled={generateScorecardMutation.isPending}
            data-testid="button-generate-scorecard"
          >
            <Brain className="h-4 w-4 mr-2" />
            Generate AI Scorecard
          </Button>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-upload-scan">
                <Upload className="h-4 w-4 mr-2" />
                Upload Scan Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Security Scan Report</DialogTitle>
                <DialogDescription>
                  Import reports from Qualys, Nessus, OWASP ZAP, Burp Suite, or other security tools
                </DialogDescription>
              </DialogHeader>
              <UploadScanForm onSuccess={() => {
                setUploadDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ['/api/security/scans'] });
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="glass-card" data-testid="card-critical-findings">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-3xl font-bold text-red-500">{findingsBySeverity.critical}</p>
              </div>
              <ShieldX className="h-10 w-10 text-red-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card" data-testid="card-high-findings">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High</p>
                <p className="text-3xl font-bold text-orange-500">{findingsBySeverity.high}</p>
              </div>
              <ShieldAlert className="h-10 w-10 text-orange-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card" data-testid="card-medium-findings">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Medium</p>
                <p className="text-3xl font-bold text-yellow-500">{findingsBySeverity.medium}</p>
              </div>
              <Shield className="h-10 w-10 text-yellow-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card" data-testid="card-low-findings">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low</p>
                <p className="text-3xl font-bold text-green-500">{findingsBySeverity.low}</p>
              </div>
              <ShieldCheck className="h-10 w-10 text-green-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card" data-testid="card-total-scans">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Scans</p>
                <p className="text-3xl font-bold">{scans.length}</p>
              </div>
              <FileSearch className="h-10 w-10 text-primary/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="glass-card" data-testid="tabs-security">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="scans" data-testid="tab-scans">Scan Reports</TabsTrigger>
          <TabsTrigger value="findings" data-testid="tab-findings">Findings</TabsTrigger>
          <TabsTrigger value="scorecard" data-testid="tab-scorecard">Scorecard</TabsTrigger>
          <TabsTrigger value="trends" data-testid="tab-trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Findings by Severity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No findings data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Remediation Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                      <YAxis stroke="rgba(255,255,255,0.5)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.8)', 
                          border: '1px solid rgba(255,255,255,0.1)' 
                        }} 
                      />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {latestScorecard && (
              <Card className="glass-card lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Security Posture Radar
                  </CardTitle>
                  <CardDescription>Current vs Target security posture across dimensions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="dimension" stroke="rgba(255,255,255,0.5)" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.3)" />
                        <Radar
                          name="Current"
                          dataKey="score"
                          stroke="#8b5cf6"
                          fill="#8b5cf6"
                          fillOpacity={0.3}
                        />
                        <Radar
                          name="Target"
                          dataKey="target"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.1}
                        />
                        <Legend />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: '1px solid rgba(255,255,255,0.1)' 
                          }} 
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="scans" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Security Scan Reports</CardTitle>
              <CardDescription>Uploaded vulnerability scans from security tools</CardDescription>
            </CardHeader>
            <CardContent>
              {scansLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : scans.length === 0 ? (
                <div className="text-center py-12">
                  <FileSearch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Scan Reports</h3>
                  <p className="text-muted-foreground mb-4">Upload your first security scan report to get started</p>
                  <Button onClick={() => setUploadDialogOpen(true)} data-testid="button-upload-first-scan">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Scan Report
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {scans.map((scan: any) => (
                    <div 
                      key={scan.id} 
                      className="flex items-center justify-between p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                      data-testid={`card-scan-${scan.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${scan.status === 'analyzed' ? 'bg-green-500/10' : 'bg-blue-500/10'}`}>
                          <FileSearch className={`h-5 w-5 ${scan.status === 'analyzed' ? 'text-green-500' : 'text-blue-500'}`} />
                        </div>
                        <div>
                          <h4 className="font-medium">{scan.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{scan.scanType}</Badge>
                            <span>{scan.toolName}</span>
                            <span>{new Date(scan.scanDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={scan.status === 'analyzed' ? 'default' : 'secondary'}>
                          {scan.status}
                        </Badge>
                        {scan.status !== 'analyzed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => analyzeScanMutation.mutate(scan.id)}
                            disabled={analyzeScanMutation.isPending}
                            data-testid={`button-analyze-scan-${scan.id}`}
                          >
                            <Brain className="h-4 w-4 mr-1" />
                            Analyze
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" data-testid={`button-view-scan-${scan.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="findings" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Security Findings</CardTitle>
              <CardDescription>Vulnerabilities and security issues identified across all scans</CardDescription>
            </CardHeader>
            <CardContent>
              {findingsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : findings.length === 0 ? (
                <div className="text-center py-12">
                  <ShieldCheck className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium">No Findings</h3>
                  <p className="text-muted-foreground">No security findings have been recorded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {findings.slice(0, 20).map((finding: any) => (
                    <div 
                      key={finding.id} 
                      className="flex items-start justify-between p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                      data-testid={`card-finding-${finding.id}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${getSeverityColor(finding.severity)}/10`}>
                          <AlertTriangle className={`h-5 w-5 ${getSeverityColor(finding.severity).replace('bg-', 'text-')}`} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium">{finding.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">{finding.description}</p>
                          <div className="flex items-center gap-2 text-sm">
                            {finding.cveId && <Badge variant="outline">{finding.cveId}</Badge>}
                            {finding.cvssScore && <Badge variant="outline">CVSS: {finding.cvssScore}</Badge>}
                            {finding.affectedAsset && <span className="text-muted-foreground">{finding.affectedAsset}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(finding.severity)}
                        {getStatusBadge(finding.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scorecard" className="space-y-4">
          {latestScorecard ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="glass-card lg:col-span-1">
                <CardHeader>
                  <CardTitle>Overall Grade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className={`text-8xl font-bold ${getGradeColor(latestScorecard.overallGrade)}`}>
                      {latestScorecard.overallGrade}
                    </div>
                    <div className="text-2xl font-medium mt-2">
                      {latestScorecard.overallScore}%
                    </div>
                    <p className="text-muted-foreground mt-2">
                      Generated on {new Date(latestScorecard.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card lg:col-span-2">
                <CardHeader>
                  <CardTitle>Security Dimensions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {latestScorecard.dimensions && Object.entries(latestScorecard.dimensions).map(([key, val]: [string, any]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{val.score}%</span>
                            {val.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                            {val.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                            {val.trend === 'stable' && <Minus className="h-4 w-4 text-gray-500" />}
                          </div>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${val.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {latestScorecard.highlights?.map((h: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    Concerns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {latestScorecard.concerns?.map((c: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {latestScorecard.recommendations?.map((r: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <ChevronRight className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="glass-card">
              <CardContent className="py-12">
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Scorecard Available</h3>
                  <p className="text-muted-foreground mb-4">Generate an AI-powered security scorecard to see your security posture</p>
                  <Button 
                    onClick={() => generateScorecardMutation.mutate()}
                    disabled={generateScorecardMutation.isPending}
                    data-testid="button-generate-scorecard-empty"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Scorecard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Security Posture Trend</CardTitle>
              <CardDescription>Current vs Target security posture over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sampleHistoryData}>
                    <defs>
                      <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                    <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.5)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.1)' 
                      }} 
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="current" 
                      stroke="#8b5cf6" 
                      fillOpacity={1} 
                      fill="url(#colorCurrent)" 
                      name="Current Score"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#10b981" 
                      strokeDasharray="5 5" 
                      name="Target Score"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UploadScanForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    scanType: 'vulnerability',
    toolName: '',
    targetSystem: '',
    rawData: ''
  });

  const createScanMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('/api/security/scans', 'POST', {
        ...data,
        status: 'pending',
        scanDate: new Date().toISOString()
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Scan Uploaded", description: "Security scan report has been uploaded" });
      onSuccess();
    },
    onError: (error: any) => {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let parsedData = {};
    try {
      if (formData.rawData) {
        parsedData = JSON.parse(formData.rawData);
      }
    } catch {
      toast({ title: "Invalid JSON", description: "The scan data must be valid JSON", variant: "destructive" });
      return;
    }
    createScanMutation.mutate({
      ...formData,
      rawData: parsedData
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Scan Name</Label>
        <Input 
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Q1 2024 Vulnerability Scan"
          required
          data-testid="input-scan-name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="scanType">Scan Type</Label>
        <Select 
          value={formData.scanType} 
          onValueChange={(v) => setFormData({ ...formData, scanType: v })}
        >
          <SelectTrigger data-testid="select-scan-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vulnerability">Vulnerability Scan</SelectItem>
            <SelectItem value="web_application">Web Application Scan</SelectItem>
            <SelectItem value="network">Network Scan</SelectItem>
            <SelectItem value="container">Container Scan</SelectItem>
            <SelectItem value="cloud">Cloud Security Scan</SelectItem>
            <SelectItem value="code">Code/SAST Scan</SelectItem>
            <SelectItem value="penetration">Penetration Test</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="toolName">Security Tool</Label>
        <Select 
          value={formData.toolName} 
          onValueChange={(v) => setFormData({ ...formData, toolName: v })}
        >
          <SelectTrigger data-testid="select-tool-name">
            <SelectValue placeholder="Select tool" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Qualys">Qualys</SelectItem>
            <SelectItem value="Nessus">Nessus</SelectItem>
            <SelectItem value="OWASP ZAP">OWASP ZAP</SelectItem>
            <SelectItem value="Burp Suite">Burp Suite</SelectItem>
            <SelectItem value="Acunetix">Acunetix</SelectItem>
            <SelectItem value="Rapid7">Rapid7</SelectItem>
            <SelectItem value="CrowdStrike">CrowdStrike</SelectItem>
            <SelectItem value="Tenable">Tenable</SelectItem>
            <SelectItem value="Snyk">Snyk</SelectItem>
            <SelectItem value="SonarQube">SonarQube</SelectItem>
            <SelectItem value="Checkmarx">Checkmarx</SelectItem>
            <SelectItem value="Veracode">Veracode</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="targetSystem">Target System</Label>
        <Input 
          id="targetSystem"
          value={formData.targetSystem}
          onChange={(e) => setFormData({ ...formData, targetSystem: e.target.value })}
          placeholder="Production Web Application"
          data-testid="input-target-system"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="rawData">Scan Data (JSON)</Label>
        <Textarea 
          id="rawData"
          value={formData.rawData}
          onChange={(e) => setFormData({ ...formData, rawData: e.target.value })}
          placeholder='{"findings": [...], "summary": {...}}'
          rows={6}
          data-testid="textarea-scan-data"
        />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={createScanMutation.isPending} data-testid="button-submit-scan">
          {createScanMutation.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Scan
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
