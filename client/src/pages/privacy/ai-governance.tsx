import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Brain, Plus, Search, Shield, AlertTriangle, CheckCircle2, Clock,
  Eye, Edit, Sparkles, Database, Lock, Users, Cpu, Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTenant } from "@/contexts/tenant-context";
import type { AiPrivacyRecord } from "@shared/schema";

const aiPrivacyFormSchema = z.object({
  modelName: z.string().min(1, "Model name is required"),
  modelDescription: z.string().optional(),
  modelType: z.string().optional(),
  vendor: z.string().optional(),
  deploymentType: z.string().optional(),
  containsPersonalData: z.boolean().default(false),
  containsSensitiveData: z.boolean().default(false),
  purposeOfProcessing: z.string().optional(),
  legalBasis: z.string().optional(),
  dpiaRequired: z.boolean().default(false),
  reidentificationRisk: z.string().default("low"),
  modelMemorizationRisk: z.string().default("low"),
  biasRisk: z.string().default("low"),
  dataLeakageRisk: z.string().default("low"),
  promptPrivacyControls: z.boolean().default(false),
  outputFiltering: z.boolean().default(false),
  humanOversight: z.boolean().default(false),
  aiActCategory: z.string().optional(),
});

type AiPrivacyFormValues = z.infer<typeof aiPrivacyFormSchema>;

function RiskBadge({ level }: { level: string }) {
  const colors = {
    low: "bg-chart-2/10 text-chart-2",
    medium: "bg-chart-1/10 text-chart-1",
    high: "bg-orange-500/10 text-orange-500",
    critical: "bg-destructive/10 text-destructive"
  };
  return <Badge className={colors[level as keyof typeof colors] || colors.low}>{level}</Badge>;
}

function ApprovalBadge({ status }: { status: string }) {
  const variants = {
    pending: { color: "bg-chart-1/10 text-chart-1", icon: Clock },
    approved: { color: "bg-chart-2/10 text-chart-2", icon: CheckCircle2 },
    rejected: { color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
    review: { color: "bg-primary/10 text-primary", icon: Eye }
  };
  const config = variants[status as keyof typeof variants] || variants.pending;
  const Icon = config.icon;
  
  return (
    <Badge className={config.color}>
      <Icon className="h-3 w-3 mr-1" /> {status}
    </Badge>
  );
}

function AiPrivacyCard({ record, onView, onEdit }: { record: AiPrivacyRecord; onView: () => void; onEdit: () => void }) {
  const riskScore = useMemo(() => {
    const riskMap = { low: 1, medium: 2, high: 3, critical: 4 };
    const risks = [
      riskMap[record.reidentificationRisk as keyof typeof riskMap] || 1,
      riskMap[record.modelMemorizationRisk as keyof typeof riskMap] || 1,
      riskMap[record.biasRisk as keyof typeof riskMap] || 1,
      riskMap[record.dataLeakageRisk as keyof typeof riskMap] || 1
    ];
    return Math.round((risks.reduce((a, b) => a + b, 0) / risks.length) * 25);
  }, [record]);

  const aiActColors = {
    minimal: "text-chart-2",
    limited: "text-chart-1",
    high: "text-orange-500",
    unacceptable: "text-destructive"
  };

  return (
    <Card className="card-3d hover-elevate">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{record.modelName}</h3>
              <p className="text-xs text-muted-foreground">{record.vendor || "Internal"} • {record.modelType || "Unknown"}</p>
            </div>
          </div>
          <ApprovalBadge status={record.approvalStatus || "pending"} />
        </div>

        {record.modelDescription && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{record.modelDescription}</p>
        )}

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Risk Score</p>
            <div className="flex items-center gap-2">
              <Progress value={riskScore} className="h-1.5 flex-1" />
              <span className="text-sm font-medium">{riskScore}%</span>
            </div>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">AI Act Category</p>
            <p className={`text-sm font-medium capitalize ${aiActColors[record.aiActCategory as keyof typeof aiActColors] || ""}`}>
              {record.aiActCategory || "Not classified"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {record.containsPersonalData && (
            <Badge variant="outline" className="text-xs"><Users className="h-3 w-3 mr-1" /> Personal Data</Badge>
          )}
          {record.containsSensitiveData && (
            <Badge variant="outline" className="text-xs text-orange-500 border-orange-500/30"><Lock className="h-3 w-3 mr-1" /> Sensitive</Badge>
          )}
          {record.dpiaRequired && (
            <Badge variant="outline" className="text-xs"><Shield className="h-3 w-3 mr-1" /> DPIA Required</Badge>
          )}
          {record.humanOversight && (
            <Badge variant="outline" className="text-xs text-chart-2 border-chart-2/30"><Eye className="h-3 w-3 mr-1" /> Human Oversight</Badge>
          )}
        </div>

        <div className="flex gap-2 pt-3 border-t border-border">
          <Button variant="outline" size="sm" className="flex-1" onClick={onView} data-testid={`view-ai-model-${record.id}`}>
            <Eye className="h-4 w-4 mr-1" /> Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={onEdit} data-testid={`edit-ai-model-${record.id}`}>
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AiPrivacyGovernancePage() {
  const { toast } = useToast();
  const { currentTenantId } = useTenant();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AiPrivacyRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: aiRecords = [], isLoading } = useQuery<AiPrivacyRecord[]>({
    queryKey: ["/api/ai-privacy", currentTenantId],
  });

  const createMutation = useMutation({
    mutationFn: async (data: AiPrivacyFormValues) => {
      return apiRequest("POST", "/api/ai-privacy", { ...data, tenantId: currentTenantId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-privacy"] });
      setIsCreateOpen(false);
      toast({ title: "AI model record created" });
    },
    onError: (error: any) => {
      toast({ title: "Creation failed", description: error.message, variant: "destructive" });
    },
  });

  const form = useForm<AiPrivacyFormValues>({
    resolver: zodResolver(aiPrivacyFormSchema),
    defaultValues: {
      modelName: "",
      modelDescription: "",
      modelType: "",
      vendor: "",
      deploymentType: "",
      containsPersonalData: false,
      containsSensitiveData: false,
      purposeOfProcessing: "",
      legalBasis: "",
      dpiaRequired: false,
      reidentificationRisk: "low",
      modelMemorizationRisk: "low",
      biasRisk: "low",
      dataLeakageRisk: "low",
      promptPrivacyControls: false,
      outputFiltering: false,
      humanOversight: false,
      aiActCategory: "",
    },
  });

  const filteredRecords = useMemo(() => {
    return aiRecords.filter(r => {
      const matchesSearch = !searchQuery || 
        r.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.vendor?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || r.approvalStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [aiRecords, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: aiRecords.length,
      pending: aiRecords.filter(r => r.approvalStatus === "pending").length,
      approved: aiRecords.filter(r => r.approvalStatus === "approved").length,
      highRisk: aiRecords.filter(r => r.aiActCategory === "high" || r.aiActCategory === "unacceptable").length,
      withPersonalData: aiRecords.filter(r => r.containsPersonalData).length,
    };
  }, [aiRecords]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">AI & Privacy Governance</h1>
          <p className="text-muted-foreground">Manage AI model privacy risks and compliance</p>
        </div>
        <div className="flex gap-2">
          <Button className="btn-gradient" onClick={() => setIsCreateOpen(true)} data-testid="button-add-ai-model">
            <Plus className="h-4 w-4 mr-2" /> Register AI Model
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">AI Models</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-chart-1/10">
                <Clock className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-chart-2/10">
                <CheckCircle2 className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
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
                <p className="text-2xl font-bold">{stats.highRisk}</p>
                <p className="text-xs text-muted-foreground">High Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-chart-3/10">
                <Users className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.withPersonalData}</p>
                <p className="text-xs text-muted-foreground">Personal Data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search AI models..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-ai"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="select-status-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="review">Under Review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <Card key={i} className="card-3d animate-pulse">
              <CardContent className="p-5 h-64" />
            </Card>
          ))}
        </div>
      ) : filteredRecords.length === 0 ? (
        <Card className="card-3d">
          <CardContent className="py-12 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No AI Models Registered</h3>
            <p className="text-muted-foreground mb-4">Register AI models to track privacy risks and compliance</p>
            <Button className="btn-gradient" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Register First Model
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.map(record => (
            <AiPrivacyCard
              key={record.id}
              record={record}
              onView={() => setSelectedRecord(record)}
              onEdit={() => {
                form.reset(record as any);
                setIsCreateOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register AI Model</DialogTitle>
            <DialogDescription>Document AI model privacy risks and compliance requirements</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="privacy">Privacy Risks</TabsTrigger>
                  <TabsTrigger value="controls">Controls</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="modelName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model Name</FormLabel>
                        <FormControl><Input placeholder="e.g., GPT-4 Assistant" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="vendor" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendor</FormLabel>
                        <FormControl><Input placeholder="e.g., OpenAI, Internal" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="modelDescription" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea placeholder="Describe the model and its use..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="modelType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="llm">Large Language Model</SelectItem>
                            <SelectItem value="classification">Classification</SelectItem>
                            <SelectItem value="regression">Regression</SelectItem>
                            <SelectItem value="generative">Generative</SelectItem>
                            <SelectItem value="recommendation">Recommendation</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="deploymentType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deployment</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select deployment" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="internal">Internal / On-Premise</SelectItem>
                            <SelectItem value="saas">SaaS / Cloud</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="aiActCategory" render={({ field }) => (
                    <FormItem>
                      <FormLabel>EU AI Act Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="minimal">Minimal Risk</SelectItem>
                          <SelectItem value="limited">Limited Risk</SelectItem>
                          <SelectItem value="high">High Risk</SelectItem>
                          <SelectItem value="unacceptable">Unacceptable Risk</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </TabsContent>

                <TabsContent value="privacy" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="containsPersonalData" render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <FormLabel>Contains Personal Data</FormLabel>
                          <FormDescription>Model processes personal data</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="containsSensitiveData" render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <FormLabel>Contains Sensitive Data</FormLabel>
                          <FormDescription>Special category data</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="reidentificationRisk" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Re-identification Risk</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="modelMemorizationRisk" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model Memorization Risk</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="biasRisk" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bias Amplification Risk</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="dataLeakageRisk" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Leakage Risk</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="dpiaRequired" render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <FormLabel>DPIA Required</FormLabel>
                        <FormDescription>Data Protection Impact Assessment needed</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                </TabsContent>

                <TabsContent value="controls" className="space-y-4 pt-4">
                  <FormField control={form.control} name="promptPrivacyControls" render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <FormLabel>Prompt Privacy Controls</FormLabel>
                        <FormDescription>PII filtering in prompts</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="outputFiltering" render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <FormLabel>Output Filtering</FormLabel>
                        <FormDescription>PII redaction in outputs</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="humanOversight" render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <FormLabel>Human Oversight</FormLabel>
                        <FormDescription>Human review of decisions</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="legalBasis" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Basis</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select legal basis" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="consent">Consent</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="legal_obligation">Legal Obligation</SelectItem>
                          <SelectItem value="vital_interests">Vital Interests</SelectItem>
                          <SelectItem value="public_task">Public Task</SelectItem>
                          <SelectItem value="legitimate_interests">Legitimate Interests</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-ai-model">
                  {createMutation.isPending ? "Creating..." : "Register Model"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
