import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTenant } from "@/contexts/tenant-context";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, Shield, CheckCircle, XCircle, AlertTriangle, RefreshCw, 
  Plus, Trash2, Brain, Clock, Globe, Lock, FileText, ChevronRight
} from "lucide-react";

export default function EmailSecurityPage() {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const [domain, setDomain] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);

  const selectedTenant = currentTenant?.id || null;

  const { data: assessments = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/security/email-assessments', selectedTenant],
    queryFn: async () => {
      const res = await fetch(`/api/security/email-assessments?tenantId=${selectedTenant}`);
      if (!res.ok) throw new Error('Failed to fetch assessments');
      return res.json();
    },
    enabled: !!selectedTenant,
  });

  const createAssessmentMutation = useMutation({
    mutationFn: async (data: { domain: string }) => {
      const res = await apiRequest('POST', '/api/security/email-assessments', {
        tenantId: selectedTenant,
        domain: data.domain,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Scan Complete", description: "Email security assessment completed" });
      setCreateDialogOpen(false);
      setDomain("");
      queryClient.invalidateQueries({ queryKey: ['/api/security/email-assessments', selectedTenant] });
    },
    onError: (error: any) => {
      toast({ title: "Scan Failed", description: error.message, variant: "destructive" });
    }
  });

  const rescanMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/security/email-assessments/${id}/rescan`, {});
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Rescan Complete", description: "Email security assessment updated" });
      queryClient.invalidateQueries({ queryKey: ['/api/security/email-assessments', selectedTenant] });
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/security/email-assessments/${id}/analyze`, {});
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Analysis Complete", description: "AI has analyzed the email security" });
      setSelectedAssessment(data);
      queryClient.invalidateQueries({ queryKey: ['/api/security/email-assessments', selectedTenant] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/security/email-assessments/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Assessment removed" });
      queryClient.invalidateQueries({ queryKey: ['/api/security/email-assessments', selectedTenant] });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass': return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Configured</Badge>;
      case 'fail': return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Missing</Badge>;
      default: return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Unknown</Badge>;
    }
  };

  const getPolicyBadge = (policy: string) => {
    switch (policy) {
      case 'reject': return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Reject</Badge>;
      case 'quarantine': return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Quarantine</Badge>;
      default: return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">None</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Email Security Assessment
            </h1>
            <p className="text-muted-foreground mt-1">
              Analyze DMARC, DKIM, SPF, and email authentication for your domains
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-scan-domain" className="gap-2">
                <Plus className="h-4 w-4" />
                Scan Domain
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle>Scan Email Security</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm text-muted-foreground">Domain to Scan</label>
                  <Input
                    data-testid="input-domain"
                    placeholder="example.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="mt-1 bg-slate-800 border-slate-600"
                  />
                </div>
                <Button
                  data-testid="button-run-scan"
                  className="w-full"
                  onClick={() => createAssessmentMutation.mutate({ domain })}
                  disabled={!domain || createAssessmentMutation.isPending}
                >
                  {createAssessmentMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Scanning...
                    </>
                  ) : (
                    'Run Security Scan'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        ) : assessments.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="py-16 text-center">
              <Mail className="h-16 w-16 mx-auto text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Email Security Assessments</h3>
              <p className="text-muted-foreground mb-4">Scan your first domain to check DMARC, DKIM, and SPF configuration</p>
              <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Scan Domain
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {assessments.map((assessment) => (
              <Card 
                key={assessment.id} 
                className="bg-slate-900/50 border-slate-700 hover:border-blue-500/50 transition-all cursor-pointer"
                onClick={() => setSelectedAssessment(assessment)}
                data-testid={`card-assessment-${assessment.id}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Globe className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-white">{assessment.domain}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          Last scanned: {assessment.lastScannedAt ? new Date(assessment.lastScannedAt).toLocaleString() : 'Never'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(assessment.overallScore || 0)}`}>
                          {assessment.overallScore || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(assessment.spfStatus)}
                        <span className="font-semibold text-white">SPF</span>
                      </div>
                      {getStatusBadge(assessment.spfStatus)}
                      <p className="text-xs text-muted-foreground mt-2 truncate">
                        {assessment.spfRecord || 'No record found'}
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(assessment.dkimStatus)}
                        <span className="font-semibold text-white">DKIM</span>
                      </div>
                      {getStatusBadge(assessment.dkimStatus)}
                      <p className="text-xs text-muted-foreground mt-2">
                        {assessment.dkimStatus === 'pass' ? 'Key configured' : 'No selector found'}
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(assessment.dmarcStatus)}
                        <span className="font-semibold text-white">DMARC</span>
                      </div>
                      {getStatusBadge(assessment.dmarcStatus)}
                      <div className="mt-2">
                        {getPolicyBadge(assessment.dmarcPolicy)}
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-5 w-5 text-blue-400" />
                        <span className="font-semibold text-white">MX Records</span>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {(assessment.mxRecords as any[])?.length || 0} records
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rescanMutation.mutate(assessment.id)}
                      disabled={rescanMutation.isPending}
                      data-testid={`button-rescan-${assessment.id}`}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${rescanMutation.isPending ? 'animate-spin' : ''}`} />
                      Rescan
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => analyzeMutation.mutate(assessment.id)}
                      disabled={analyzeMutation.isPending}
                      data-testid={`button-analyze-${assessment.id}`}
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      AI Analysis
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => deleteMutation.mutate(assessment.id)}
                      data-testid={`button-delete-${assessment.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedAssessment && (
          <Dialog open={!!selectedAssessment} onOpenChange={() => setSelectedAssessment(null)}>
            <DialogContent className="bg-slate-900 border-slate-700 max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-400" />
                  {selectedAssessment.domain} - Email Security Details
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(selectedAssessment.spfStatus)}
                        <span className="font-semibold">SPF</span>
                      </div>
                      <code className="text-xs text-muted-foreground block bg-slate-900 p-2 rounded mt-2 break-all">
                        {selectedAssessment.spfRecord || 'No record'}
                      </code>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(selectedAssessment.dkimStatus)}
                        <span className="font-semibold">DKIM</span>
                      </div>
                      <code className="text-xs text-muted-foreground block bg-slate-900 p-2 rounded mt-2 break-all">
                        {selectedAssessment.dkimRecord ? 'Configured' : 'No selector found'}
                      </code>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(selectedAssessment.dmarcStatus)}
                        <span className="font-semibold">DMARC</span>
                      </div>
                      <code className="text-xs text-muted-foreground block bg-slate-900 p-2 rounded mt-2 break-all">
                        {selectedAssessment.dmarcRecord || 'No record'}
                      </code>
                    </CardContent>
                  </Card>
                </div>

                {selectedAssessment.recommendations && (selectedAssessment.recommendations as string[]).length > 0 && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {(selectedAssessment.recommendations as string[]).map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <ChevronRight className="h-4 w-4 mt-0.5 text-yellow-400" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {selectedAssessment.aiAnalysis && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-400" />
                        AI Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-slate-900 p-4 rounded-lg">
                          {typeof selectedAssessment.aiAnalysis === 'string' 
                            ? selectedAssessment.aiAnalysis 
                            : JSON.stringify(selectedAssessment.aiAnalysis, null, 2)}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedAssessment.mxRecords && (selectedAssessment.mxRecords as any[]).length > 0 && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Mail className="h-5 w-5 text-blue-400" />
                        MX Records
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {(selectedAssessment.mxRecords as any[]).map((mx, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-slate-900 rounded">
                            <span className="font-mono text-sm">{mx.exchange}</span>
                            <Badge variant="outline">Priority: {mx.priority}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
