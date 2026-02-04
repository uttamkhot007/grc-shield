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
  Shield, ShieldCheck, ShieldX, Flame, Wifi, Server, Lock, Cloud,
  Code, Brain, RefreshCw, Plus, CheckCircle2, XCircle, AlertCircle,
  ChevronRight, FileCheck, Target, TrendingUp, BarChart3, ClipboardList,
  Mail, Globe, Eye, ExternalLink
} from "lucide-react";
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

const ASSESSMENT_TYPES = [
  { value: "firewall", label: "Firewall Configuration", icon: Flame, description: "Assess firewall rules, policies, and network perimeter security" },
  { value: "endpoint", label: "Endpoint Security", icon: Server, description: "Evaluate endpoint protection, EDR, and device hardening" },
  { value: "network", label: "Network Security", icon: Wifi, description: "Review network segmentation, NAC, and wireless security" },
  { value: "access_control", label: "Access Control", icon: Lock, description: "Assess IAM, MFA, privileged access, and authentication" },
  { value: "encryption", label: "Encryption", icon: Shield, description: "Evaluate data encryption at rest and in transit" },
  { value: "cloud", label: "Cloud Security", icon: Cloud, description: "Assess cloud security posture, CSPM, and configurations" },
  { value: "application", label: "Application Security", icon: Code, description: "Review secure SDLC, SAST/DAST, and AppSec controls" },
];

export default function SecurityAssessmentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  const selectedTenant = currentTenant?.id || null;
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);

  const assessmentsUrl = selectedTenant 
    ? `/api/security/assessments?tenantId=${selectedTenant}`
    : '/api/security/assessments';
    
  const { data: assessments = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/security/assessments', selectedTenant],
    queryFn: async () => {
      const res = await fetch(assessmentsUrl);
      if (!res.ok) throw new Error('Failed to fetch assessments');
      return res.json();
    },
    enabled: !!selectedTenant,
  });

  const controlItemsUrl = selectedAssessment?.id 
    ? `/api/security/control-items?assessmentId=${selectedAssessment.id}`
    : '/api/security/control-items';
    
  const { data: controlItems = [] } = useQuery<any[]>({
    queryKey: ['/api/security/control-items', selectedAssessment?.id],
    queryFn: async () => {
      const res = await fetch(controlItemsUrl);
      if (!res.ok) throw new Error('Failed to fetch control items');
      return res.json();
    },
    enabled: !!selectedAssessment,
  });

  const createAssessmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('/api/security/assessments', 'POST', {
        ...data,
        tenantId: selectedTenant,
        status: 'draft',
        assessmentDate: new Date().toISOString()
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Assessment Created", description: "Security assessment has been created" });
      setCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/security/assessments', selectedTenant] });
    },
    onError: (error: any) => {
      toast({ title: "Creation Failed", description: error.message, variant: "destructive" });
    }
  });

  const generateChecklistMutation = useMutation({
    mutationFn: async (assessmentId: string) => {
      const res = await apiRequest(`/api/security/assessments/${assessmentId}/generate-checklist`, 'POST', {});
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Checklist Generated", description: "Control checklist has been generated" });
      queryClient.invalidateQueries({ queryKey: ['/api/security/control-items', selectedAssessment?.id] });
    },
    onError: (error: any) => {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    }
  });

  const analyzeAssessmentMutation = useMutation({
    mutationFn: async (assessmentId: string) => {
      const res = await apiRequest(`/api/security/assessments/${assessmentId}/analyze`, 'POST', {});
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Analysis Complete", description: "AI has analyzed the security assessment" });
      queryClient.invalidateQueries({ queryKey: ['/api/security/assessments', selectedTenant] });
    },
    onError: (error: any) => {
      toast({ title: "Analysis Failed", description: error.message, variant: "destructive" });
    }
  });

  const updateControlItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest(`/api/security/control-items/${id}`, 'PATCH', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/control-items', selectedAssessment?.id] });
    }
  });

  const assessmentsByType = ASSESSMENT_TYPES.map(type => ({
    ...type,
    count: assessments.filter((a: any) => a.assessmentType === type.value).length,
    avgScore: assessments
      .filter((a: any) => a.assessmentType === type.value && a.overallScore)
      .reduce((acc: number, a: any, _, arr) => acc + (a.overallScore / arr.length), 0) || 0
  }));

  const radarData = assessmentsByType.map(t => ({
    type: t.label.split(' ')[0],
    score: t.avgScore,
    target: 85
  }));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500" data-testid="badge-status-completed">Completed</Badge>;
      case 'in_progress': return <Badge className="bg-blue-500" data-testid="badge-status-progress">In Progress</Badge>;
      case 'approved': return <Badge className="bg-purple-500" data-testid="badge-status-approved">Approved</Badge>;
      default: return <Badge variant="secondary" data-testid="badge-status-draft">Draft</Badge>;
    }
  };

  const getControlStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'fail': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'partial': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'na': return <Shield className="h-5 w-5 text-gray-400" />;
      default: return <ClipboardList className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    const found = ASSESSMENT_TYPES.find(t => t.value === type);
    if (found) {
      const Icon = found.icon;
      return <Icon className="h-5 w-5" />;
    }
    return <Shield className="h-5 w-5" />;
  };

  const scanningModules = [
    { 
      title: "Email Security", 
      description: "DMARC/DKIM/SPF analysis and email authentication assessment", 
      icon: Mail, 
      url: "/security/email",
      status: "beta" as const,
      features: ["DMARC Analysis", "DKIM Validation", "SPF Check", "MX Records"]
    },
    { 
      title: "Web App Scanner", 
      description: "Comprehensive web application vulnerability scanning", 
      icon: Globe, 
      url: "/security/webapp-scanner",
      status: "beta" as const,
      features: ["OWASP Top 10", "SSL/TLS Analysis", "Security Headers", "Tech Fingerprinting"]
    },
    { 
      title: "Dark Web Monitor", 
      description: "Monitor for credential leaks and brand mentions on the dark web", 
      icon: Eye, 
      url: "/security/darkweb",
      status: "beta" as const,
      features: ["Breach Detection", "Credential Leaks", "Brand Mentions", "Typosquat Domains"]
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent" data-testid="text-page-title">
            Security Assessments
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive security assessments including control evaluations and scanning tools
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-assessment">
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Security Assessment</DialogTitle>
              <DialogDescription>
                Select the type of security control assessment to perform
              </DialogDescription>
            </DialogHeader>
            <CreateAssessmentForm 
              onSubmit={(data) => createAssessmentMutation.mutate(data)}
              isPending={createAssessmentMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card" data-testid="card-total-assessments">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assessments</p>
                <p className="text-3xl font-bold">{assessments.length}</p>
              </div>
              <FileCheck className="h-10 w-10 text-primary/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card" data-testid="card-completed">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-green-500">
                  {assessments.filter((a: any) => a.status === 'completed').length}
                </p>
              </div>
              <ShieldCheck className="h-10 w-10 text-green-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card" data-testid="card-in-progress">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold text-blue-500">
                  {assessments.filter((a: any) => a.status === 'in_progress').length}
                </p>
              </div>
              <RefreshCw className="h-10 w-10 text-blue-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card" data-testid="card-avg-score">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-3xl font-bold">
                  {assessments.length > 0 
                    ? Math.round(assessments.reduce((acc: number, a: any) => acc + (a.overallScore || 0), 0) / assessments.length)
                    : 0}%
                </p>
              </div>
              <Target className="h-10 w-10 text-purple-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-dashed border-orange-500/30" data-testid="card-scanning-tools">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-orange-300">
              <Shield className="h-5 w-5" />
              Security Scanning Tools
              <Badge variant="outline" className="ml-2 text-orange-400 border-orange-400">BETA</Badge>
            </CardTitle>
          </div>
          <CardDescription>
            Automated security scanning and monitoring capabilities (futuristic features)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scanningModules.map((module) => (
              <Card 
                key={module.title} 
                className="glass-card hover:border-orange-500/50 transition-all cursor-pointer group"
                onClick={() => window.location.href = module.url}
                data-testid={`card-module-${module.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                      <module.icon className="h-5 w-5 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm">{module.title}</h3>
                        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{module.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {module.features.slice(0, 3).map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="glass-card" data-testid="tabs-assessments">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="assessments" data-testid="tab-assessments">Control Assessments</TabsTrigger>
          <TabsTrigger value="checklist" data-testid="tab-checklist" disabled={!selectedAssessment}>Checklist</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Assessment Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assessmentsByType.map((type) => (
                    <div key={type.value} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{type.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{type.count} assessments</Badge>
                          <span className="text-sm font-medium">{Math.round(type.avgScore)}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                          style={{ width: `${type.avgScore}%` }}
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
                  <Target className="h-5 w-5" />
                  Security Posture Radar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="type" stroke="rgba(255,255,255,0.5)" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.3)" />
                      <Radar
                        name="Current"
                        dataKey="score"
                        stroke="#f97316"
                        fill="#f97316"
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
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Assessment Types</CardTitle>
              <CardDescription>Select an assessment type to begin evaluating security controls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {ASSESSMENT_TYPES.map((type) => (
                  <div
                    key={type.value}
                    className="p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => {
                      setCreateDialogOpen(true);
                    }}
                    data-testid={`card-type-${type.value}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-orange-500/10">
                        <type.icon className="h-5 w-5 text-orange-500" />
                      </div>
                      <h4 className="font-medium">{type.label}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>All Security Assessments</CardTitle>
              <CardDescription>View and manage security control assessments</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : assessments.length === 0 ? (
                <div className="text-center py-12">
                  <ShieldX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Assessments</h3>
                  <p className="text-muted-foreground mb-4">Create your first security control assessment</p>
                  <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-first-assessment">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assessment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {assessments.map((assessment: any) => (
                    <div 
                      key={assessment.id} 
                      className={`flex items-center justify-between p-4 border rounded-lg hover:bg-white/5 transition-colors cursor-pointer ${
                        selectedAssessment?.id === assessment.id ? 'border-orange-500 bg-orange-500/5' : 'border-white/10'
                      }`}
                      onClick={() => setSelectedAssessment(assessment)}
                      data-testid={`card-assessment-${assessment.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                          {getTypeIcon(assessment.assessmentType)}
                        </div>
                        <div>
                          <h4 className="font-medium">{assessment.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">
                              {ASSESSMENT_TYPES.find(t => t.value === assessment.assessmentType)?.label || assessment.assessmentType}
                            </Badge>
                            <span>{new Date(assessment.assessmentDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {assessment.overallScore && (
                          <div className="text-right">
                            <div className="text-2xl font-bold">{assessment.overallScore}%</div>
                            <div className="text-xs text-muted-foreground">Score</div>
                          </div>
                        )}
                        {getStatusBadge(assessment.status)}
                        <div className="flex gap-2">
                          {assessment.status === 'draft' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                generateChecklistMutation.mutate(assessment.id);
                              }}
                              disabled={generateChecklistMutation.isPending}
                              data-testid={`button-generate-checklist-${assessment.id}`}
                            >
                              <ClipboardList className="h-4 w-4 mr-1" />
                              Generate Checklist
                            </Button>
                          )}
                          {assessment.status !== 'completed' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                analyzeAssessmentMutation.mutate(assessment.id);
                              }}
                              disabled={analyzeAssessmentMutation.isPending}
                              data-testid={`button-analyze-${assessment.id}`}
                            >
                              <Brain className="h-4 w-4 mr-1" />
                              Analyze
                            </Button>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4">
          {selectedAssessment && (
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedAssessment.name} - Control Checklist</CardTitle>
                    <CardDescription>
                      Evaluate each control and mark its status
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>{controlItems.filter((i: any) => i.status === 'pass').length} Pass</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>{controlItems.filter((i: any) => i.status === 'fail').length} Fail</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span>{controlItems.filter((i: any) => i.status === 'partial').length} Partial</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {controlItems.length === 0 ? (
                  <div className="text-center py-8">
                    <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No Checklist Items</h3>
                    <p className="text-muted-foreground mb-4">Generate a control checklist to start the assessment</p>
                    <Button 
                      onClick={() => generateChecklistMutation.mutate(selectedAssessment.id)}
                      disabled={generateChecklistMutation.isPending}
                      data-testid="button-generate-checklist-empty"
                    >
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Generate Checklist
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {controlItems.map((item: any) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between p-4 border border-white/10 rounded-lg"
                        data-testid={`control-item-${item.id}`}
                      >
                        <div className="flex items-center gap-4">
                          {getControlStatusIcon(item.status)}
                          <div>
                            <h4 className="font-medium">{item.controlName}</h4>
                            {item.gap && (
                              <p className="text-sm text-red-400">{item.gap}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select 
                            value={item.status}
                            onValueChange={(value) => updateControlItemMutation.mutate({ 
                              id: item.id, 
                              data: { status: value }
                            })}
                          >
                            <SelectTrigger className="w-32" data-testid={`select-status-${item.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="pass">Pass</SelectItem>
                              <SelectItem value="fail">Fail</SelectItem>
                              <SelectItem value="partial">Partial</SelectItem>
                              <SelectItem value="na">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CreateAssessmentForm({ onSubmit, isPending }: { onSubmit: (data: any) => void; isPending: boolean }) {
  const [formData, setFormData] = useState({
    name: '',
    assessmentType: '',
    description: '',
    scope: '',
    assessorName: '',
    targetScore: 85
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="assessmentType">Assessment Type</Label>
        <Select 
          value={formData.assessmentType} 
          onValueChange={(v) => setFormData({ ...formData, assessmentType: v })}
        >
          <SelectTrigger data-testid="select-assessment-type">
            <SelectValue placeholder="Select assessment type" />
          </SelectTrigger>
          <SelectContent>
            {ASSESSMENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <type.icon className="h-4 w-4" />
                  {type.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Assessment Name</Label>
        <Input 
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Q1 2024 Firewall Assessment"
          required
          data-testid="input-assessment-name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the purpose and goals of this assessment"
          data-testid="textarea-description"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="scope">Scope</Label>
        <Textarea 
          id="scope"
          value={formData.scope}
          onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
          placeholder="Define the systems, networks, or assets in scope"
          data-testid="textarea-scope"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="assessorName">Assessor Name</Label>
          <Input 
            id="assessorName"
            value={formData.assessorName}
            onChange={(e) => setFormData({ ...formData, assessorName: e.target.value })}
            placeholder="John Smith"
            data-testid="input-assessor"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="targetScore">Target Score (%)</Label>
          <Input 
            id="targetScore"
            type="number"
            min={0}
            max={100}
            value={formData.targetScore}
            onChange={(e) => setFormData({ ...formData, targetScore: parseInt(e.target.value) })}
            data-testid="input-target-score"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isPending || !formData.assessmentType || !formData.name} data-testid="button-submit-assessment">
          {isPending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Assessment
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
