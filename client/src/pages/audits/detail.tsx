import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Calendar,
  FileText,
  Shield,
  ChevronRight,
  ChevronDown,
  Plus,
  Save,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ClipboardCheck,
  Building2,
  Users,
  Scale,
  RefreshCcw,
  Award,
  Loader2,
  AlertCircle,
  Sparkles,
  Upload,
  Paperclip,
  Target,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTenant } from "@/contexts/tenant-context";
import { useUpload } from "@/hooks/use-upload";
import type { Audit, Framework, Control } from "@shared/schema";

const auditTypeConfig = {
  internal: { 
    label: "Internal Audit", 
    icon: Building2, 
    color: "bg-chart-1/20 text-chart-1",
    phases: ["planning", "preparation", "fieldwork", "reporting", "follow_up"]
  },
  external: { 
    label: "External Audit", 
    icon: Users, 
    color: "bg-chart-2/20 text-chart-2",
    phases: ["planning", "preparation", "fieldwork", "reporting", "follow_up", "closure"]
  },
  regulatory: { 
    label: "Regulatory Audit", 
    icon: Scale, 
    color: "bg-chart-4/20 text-chart-4",
    phases: ["planning", "preparation", "fieldwork", "reporting", "closure"]
  },
  surveillance: { 
    label: "Surveillance Audit", 
    icon: RefreshCcw, 
    color: "bg-chart-3/20 text-chart-3",
    phases: ["planning", "fieldwork", "reporting"]
  },
  certification: { 
    label: "Certification Audit", 
    icon: Award, 
    color: "bg-primary/20 text-primary",
    phases: ["planning", "preparation", "fieldwork", "reporting", "follow_up", "closure"]
  },
  follow_up: { 
    label: "Follow-up Audit", 
    icon: RefreshCcw, 
    color: "bg-muted text-muted-foreground",
    phases: ["planning", "fieldwork", "reporting"]
  },
};

interface TaskConfig {
  id: string;
  title: string;
  description: string;
  requiresEvidence: boolean;
  aiPrompt: string;
}

const phaseConfig: Record<string, { label: string; icon: any; description: string; tasks: TaskConfig[] }> = {
  planning: { 
    label: "Planning", 
    icon: Calendar, 
    description: "Define audit scope, objectives, and timeline",
    tasks: [
      { id: "define_scope", title: "Define Audit Scope", description: "Specify what areas, systems, and processes will be audited", requiresEvidence: false, aiPrompt: "Suggest a comprehensive audit scope for a {framework} compliance audit covering key areas and boundaries." },
      { id: "define_objectives", title: "Define Audit Objectives", description: "State the goals and expected outcomes of the audit", requiresEvidence: false, aiPrompt: "Suggest clear audit objectives for a {framework} compliance audit that are measurable and achievable." },
      { id: "identify_stakeholders", title: "Identify Key Stakeholders", description: "List all parties involved in the audit process", requiresEvidence: false, aiPrompt: "List recommended stakeholders to involve in a {framework} compliance audit including roles and responsibilities." },
      { id: "prepare_plan", title: "Prepare Audit Plan", description: "Create a detailed timeline and resource allocation", requiresEvidence: true, aiPrompt: "Create a sample audit plan structure for a {framework} compliance audit with timeline milestones." },
      { id: "schedule_kickoff", title: "Schedule Kickoff Meeting", description: "Set date and agenda for the audit kickoff", requiresEvidence: false, aiPrompt: "Suggest a kickoff meeting agenda for a {framework} compliance audit including key discussion points." }
    ]
  },
  preparation: { 
    label: "Preparation", 
    icon: FileText, 
    description: "Gather documents and prepare assessment materials",
    tasks: [
      { id: "request_docs", title: "Request Documentation", description: "Identify and request all required documents from stakeholders", requiresEvidence: true, aiPrompt: "List essential documents to request for a {framework} compliance audit." },
      { id: "review_previous", title: "Review Previous Audits", description: "Analyze findings and recommendations from prior audits", requiresEvidence: true, aiPrompt: "Suggest key areas to review from previous audit reports for {framework} compliance." },
      { id: "prepare_checklists", title: "Prepare Checklists", description: "Create audit checklists based on framework requirements", requiresEvidence: true, aiPrompt: "Generate a sample audit checklist for {framework} covering key control categories." },
      { id: "brief_team", title: "Brief Audit Team", description: "Ensure all team members understand their roles and responsibilities", requiresEvidence: false, aiPrompt: "Outline key points to cover in an audit team briefing for {framework} compliance audit." }
    ]
  },
  fieldwork: { 
    label: "Fieldwork", 
    icon: ClipboardCheck, 
    description: "Execute audit procedures and gather evidence",
    tasks: [
      { id: "conduct_interviews", title: "Conduct Interviews", description: "Interview key personnel about processes and controls", requiresEvidence: true, aiPrompt: "Suggest interview questions for key personnel in a {framework} compliance audit." },
      { id: "test_controls", title: "Test Controls", description: "Evaluate the effectiveness of implemented controls", requiresEvidence: true, aiPrompt: "Describe control testing procedures for {framework} compliance verification." },
      { id: "review_evidence", title: "Review Evidence", description: "Analyze collected documentation and artifacts", requiresEvidence: true, aiPrompt: "List types of evidence to collect and review for {framework} compliance audit." },
      { id: "document_observations", title: "Document Observations", description: "Record all findings and observations during fieldwork", requiresEvidence: true, aiPrompt: "Provide a template for documenting audit observations for {framework} compliance." }
    ]
  },
  reporting: { 
    label: "Reporting", 
    icon: FileText, 
    description: "Document findings and prepare audit report",
    tasks: [
      { id: "compile_findings", title: "Compile Findings", description: "Organize and categorize all audit findings", requiresEvidence: true, aiPrompt: "Suggest a structure for organizing audit findings for a {framework} compliance report." },
      { id: "draft_report", title: "Draft Audit Report", description: "Write the comprehensive audit report", requiresEvidence: true, aiPrompt: "Outline the sections to include in a {framework} compliance audit report." },
      { id: "review_management", title: "Review with Management", description: "Present findings to management for feedback", requiresEvidence: false, aiPrompt: "Suggest key points to discuss when presenting audit findings to management." },
      { id: "finalize_recommendations", title: "Finalize Recommendations", description: "Develop actionable recommendations for each finding", requiresEvidence: true, aiPrompt: "Provide examples of effective recommendations for common {framework} compliance gaps." }
    ]
  },
  follow_up: { 
    label: "Follow-up", 
    icon: RefreshCcw, 
    description: "Track corrective actions and verify remediation",
    tasks: [
      { id: "track_actions", title: "Track Action Items", description: "Monitor progress on remediation activities", requiresEvidence: true, aiPrompt: "Suggest an action item tracking template for {framework} compliance remediation." },
      { id: "verify_remediation", title: "Verify Remediation", description: "Confirm that corrective actions have been implemented", requiresEvidence: true, aiPrompt: "Describe verification procedures for confirming {framework} compliance remediation." },
      { id: "update_status", title: "Update Status", description: "Update the status of all findings and action items", requiresEvidence: false, aiPrompt: "Suggest status categories and update criteria for audit finding tracking." },
      { id: "document_closure", title: "Document Closure", description: "Record evidence of successful remediation", requiresEvidence: true, aiPrompt: "List documentation needed to close out audit findings for {framework}." }
    ]
  },
  closure: { 
    label: "Closure", 
    icon: CheckCircle2, 
    description: "Complete audit and archive documentation",
    tasks: [
      { id: "obtain_signoffs", title: "Obtain Sign-offs", description: "Get formal approval from all required parties", requiresEvidence: true, aiPrompt: "List required sign-offs and approvals for closing a {framework} compliance audit." },
      { id: "archive_docs", title: "Archive Documentation", description: "Store all audit documents securely", requiresEvidence: false, aiPrompt: "Describe best practices for archiving {framework} compliance audit documentation." },
      { id: "update_records", title: "Update Audit Records", description: "Update the audit log and compliance records", requiresEvidence: false, aiPrompt: "List records to update after completing a {framework} compliance audit." },
      { id: "schedule_next", title: "Schedule Next Audit", description: "Plan for the next audit cycle", requiresEvidence: false, aiPrompt: "Suggest factors to consider when scheduling the next {framework} compliance audit." }
    ]
  },
};

const statusStyles = {
  scheduled: { bg: "bg-chart-1/20", text: "text-chart-1", icon: Calendar },
  in_progress: { bg: "bg-chart-3/20", text: "text-chart-3", icon: Clock },
  pending_review: { bg: "bg-chart-4/20", text: "text-chart-4", icon: FileText },
  completed: { bg: "bg-chart-2/20", text: "text-chart-2", icon: CheckCircle2 },
  cancelled: { bg: "bg-muted", text: "text-muted-foreground", icon: XCircle },
};

interface Finding {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved" | "closed";
  phase: string;
  createdAt: string;
}

interface TaskResponse {
  taskId: string;
  response: string;
  completed: boolean;
  evidence: { name: string; path: string }[];
  completedAt?: string;
}

interface AuditWorkflowData {
  taskResponses: Record<string, TaskResponse>;
  scope?: {
    boundaries: string;
    systems: string;
    exclusions: string;
    timeframe: string;
  };
}

export default function AuditDetailPage() {
  // Try tenant-scoped route first, fall back to simple route for compatibility
  const [matchTenant, tenantParams] = useRoute("/tenant/:tenantId/audits/:id");
  const [matchSimple, simpleParams] = useRoute("/audits/:id");
  const auditId = tenantParams?.id || simpleParams?.id;
  const { toast } = useToast();
  const { currentTenantId } = useTenant();
  
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [isAddFindingOpen, setIsAddFindingOpen] = useState(false);
  const [isScopeDialogOpen, setIsScopeDialogOpen] = useState(false);
  const [newFinding, setNewFinding] = useState({
    title: "",
    description: "",
    severity: "medium" as "critical" | "high" | "medium" | "low",
  });
  const [workflowData, setWorkflowData] = useState<AuditWorkflowData>({ taskResponses: {} });
  const [dataInitialized, setDataInitialized] = useState(false);
  const [loadingAiSuggestion, setLoadingAiSuggestion] = useState<string | null>(null);
  const [scopeData, setScopeData] = useState({
    boundaries: "",
    systems: "",
    exclusions: "",
    timeframe: "",
  });

  const { uploadFile, isUploading } = useUpload({
    onSuccess: (response) => {
      toast({ title: "Evidence uploaded successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to upload evidence", variant: "destructive" });
    },
  });

  const { data: audit, isLoading: auditLoading } = useQuery<Audit>({
    queryKey: ["/api/audits", auditId],
    queryFn: async () => {
      const res = await fetch(`/api/audits/${auditId}`);
      if (!res.ok) throw new Error("Failed to fetch audit");
      return res.json();
    },
    enabled: !!auditId,
  });

  const { data: framework } = useQuery<Framework>({
    queryKey: ["/api/frameworks", audit?.frameworkId],
    queryFn: async () => {
      const res = await fetch(`/api/frameworks/${audit?.frameworkId}`);
      if (!res.ok) throw new Error("Failed to fetch framework");
      return res.json();
    },
    enabled: !!audit?.frameworkId,
  });

  const { data: controls = [] } = useQuery<Control[]>({
    queryKey: ["/api/controls", audit?.frameworkId],
    queryFn: async () => {
      const res = await fetch(`/api/controls?frameworkId=${audit?.frameworkId}`);
      if (!res.ok) throw new Error("Failed to fetch controls");
      return res.json();
    },
    enabled: !!audit?.frameworkId,
  });

  const updateAuditMutation = useMutation({
    mutationFn: async (data: Partial<Audit>) => {
      return apiRequest("PATCH", `/api/audits/${auditId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits", auditId] });
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
      toast({ title: "Audit updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update audit", variant: "destructive" });
    },
  });

  // Initialize workflow data from saved audit data
  useEffect(() => {
    if (audit && !dataInitialized) {
      const savedRecommendations = (audit.recommendations as any) || {};
      if (savedRecommendations.workflowData) {
        setWorkflowData(savedRecommendations.workflowData);
      }
      if (savedRecommendations.scope) {
        setScopeData(savedRecommendations.scope);
      }
      setDataInitialized(true);
      
      // Auto-expand current phase
      const currentPhase = (audit as any).currentPhase || "planning";
      setExpandedPhase(currentPhase);
    }
  }, [audit, dataInitialized]);

  const saveWorkflowData = (newWorkflowData: AuditWorkflowData) => {
    if (!audit) return;
    
    const recommendations = ((audit.recommendations as any) || {});
    updateAuditMutation.mutate({
      recommendations: { ...recommendations, workflowData: newWorkflowData },
    } as any);
  };

  const handleTaskResponseChange = (taskId: string, response: string) => {
    const newTaskResponses = {
      ...workflowData.taskResponses,
      [taskId]: {
        ...(workflowData.taskResponses[taskId] || { taskId, response: "", completed: false, evidence: [] }),
        response,
      },
    };
    setWorkflowData({ ...workflowData, taskResponses: newTaskResponses });
  };

  const handleTaskComplete = (taskId: string, completed: boolean) => {
    const newTaskResponses = {
      ...workflowData.taskResponses,
      [taskId]: {
        ...(workflowData.taskResponses[taskId] || { taskId, response: "", completed: false, evidence: [] }),
        completed,
        completedAt: completed ? new Date().toISOString() : undefined,
      },
    };
    const newWorkflowData = { ...workflowData, taskResponses: newTaskResponses };
    setWorkflowData(newWorkflowData);
    saveWorkflowData(newWorkflowData);
  };

  const handleSaveTaskResponse = (taskId: string) => {
    saveWorkflowData(workflowData);
  };

  const handleEvidenceUpload = async (taskId: string, file: File) => {
    const response = await uploadFile(file);
    if (response) {
      const currentTask = workflowData.taskResponses[taskId] || { taskId, response: "", completed: false, evidence: [] };
      const newEvidence = [...(currentTask.evidence || []), { name: file.name, path: response.objectPath }];
      const newTaskResponses = {
        ...workflowData.taskResponses,
        [taskId]: { ...currentTask, evidence: newEvidence },
      };
      const newWorkflowData = { ...workflowData, taskResponses: newTaskResponses };
      setWorkflowData(newWorkflowData);
      saveWorkflowData(newWorkflowData);
      
      // Store evidence in the Evidence Repository
      try {
        await apiRequest("POST", "/api/evidence", {
          tenantId: currentTenantId,
          auditId: auditId,
          taskId: taskId,
          frameworkId: audit?.frameworkId,
          title: file.name,
          description: `Evidence uploaded for audit task: ${taskId}`,
          evidenceType: file.type.startsWith("image/") ? "screenshot" : "document",
          sourceType: "manual",
          filePath: response.objectPath,
          fileSize: file.size,
          mimeType: file.type,
          reviewStatus: "pending",
        });
        toast({ title: "Evidence added to repository" });
      } catch (error) {
        console.error("Failed to store evidence in repository:", error);
      }
    }
  };

  const handleGetAiSuggestion = async (taskId: string, prompt: string) => {
    setLoadingAiSuggestion(taskId);
    try {
      const frameworkName = framework?.name || "compliance";
      const fullPrompt = prompt.replace("{framework}", frameworkName);
      
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fullPrompt,
          type: "audit_suggestion",
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const suggestion = data.content || data.suggestion || "";
        handleTaskResponseChange(taskId, suggestion);
        toast({ title: "AI suggestion generated" });
      } else {
        toast({ title: "Failed to get AI suggestion", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Failed to get AI suggestion", variant: "destructive" });
    } finally {
      setLoadingAiSuggestion(null);
    }
  };

  const handleCompletePhase = (phase: string) => {
    if (!audit) return;
    
    const auditType = (audit as any).auditType || "internal";
    const phases = auditTypeConfig[auditType as keyof typeof auditTypeConfig]?.phases || [];
    const currentIndex = phases.indexOf(phase);
    const nextPhase = currentIndex < phases.length - 1 ? phases[currentIndex + 1] : null;
    
    const phaseProgress = ((audit as any).phaseProgress || {}) as Record<string, any>;
    const updatedProgress = {
      ...phaseProgress,
      [phase]: { status: "completed", completedAt: new Date().toISOString() },
      ...(nextPhase ? { [nextPhase]: { status: "in_progress", completedAt: null } } : {}),
    };

    const isLastPhase = currentIndex === phases.length - 1;
    
    updateAuditMutation.mutate({
      currentPhase: nextPhase || phase,
      phaseProgress: updatedProgress,
      status: isLastPhase ? "completed" : "in_progress",
      ...(isLastPhase ? { endDate: new Date().toISOString() } : {}),
    } as any);

    if (nextPhase) {
      setExpandedPhase(nextPhase);
    }
  };

  const handleAddFinding = () => {
    if (!audit || !newFinding.title) return;
    
    const findings = ((audit.findings as Finding[]) || []);
    const finding: Finding = {
      id: crypto.randomUUID(),
      title: newFinding.title,
      description: newFinding.description,
      severity: newFinding.severity,
      status: "open",
      phase: (audit as any).currentPhase || "planning",
      createdAt: new Date().toISOString(),
    };
    
    updateAuditMutation.mutate({
      findings: [...findings, finding],
    } as any);
    
    setIsAddFindingOpen(false);
    setNewFinding({ title: "", description: "", severity: "medium" });
  };

  const handleUpdateFindingStatus = (findingId: string, status: Finding["status"]) => {
    if (!audit) return;
    
    const findings = ((audit.findings as Finding[]) || []).map((f: Finding) =>
      f.id === findingId ? { ...f, status } : f
    );
    
    updateAuditMutation.mutate({ findings } as any);
  };

  const handleSaveScope = () => {
    if (!audit) return;
    
    const recommendations = ((audit.recommendations as any) || {});
    updateAuditMutation.mutate({
      recommendations: { ...recommendations, scope: scopeData },
    } as any);
    setIsScopeDialogOpen(false);
  };

  if (auditLoading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="mesh-gradient min-h-full p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="glass-card max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold">Audit not found</h2>
            <p className="text-muted-foreground mt-2">The audit you're looking for doesn't exist.</p>
            <Link href="/audits">
              <Button className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Audits
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const auditType = (audit as any).auditType || "internal";
  const currentPhase = (audit as any).currentPhase || "planning";
  const phaseProgress = ((audit as any).phaseProgress || {}) as Record<string, any>;
  const typeConfig = auditTypeConfig[auditType as keyof typeof auditTypeConfig] || auditTypeConfig.internal;
  const TypeIcon = typeConfig.icon;
  const status = statusStyles[audit.status as keyof typeof statusStyles] || statusStyles.scheduled;
  const StatusIcon = status.icon;
  const phases = typeConfig.phases;
  const findings = (audit.findings as Finding[]) || [];

  const currentPhaseIndex = phases.indexOf(currentPhase);
  const progressPercent = ((currentPhaseIndex + 1) / phases.length) * 100;

  const severityCounts = {
    critical: findings.filter(f => f.severity === "critical").length,
    high: findings.filter(f => f.severity === "high").length,
    medium: findings.filter(f => f.severity === "medium").length,
    low: findings.filter(f => f.severity === "low").length,
  };

  const getPhaseTasksCompletion = (phase: string) => {
    const phaseTasks = phaseConfig[phase]?.tasks || [];
    const completedTasks = phaseTasks.filter(t => workflowData.taskResponses[t.id]?.completed).length;
    return { completed: completedTasks, total: phaseTasks.length };
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="mesh-gradient min-h-full">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Link href="/audits">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold" data-testid="text-audit-title">{audit.title}</h1>
                  <Badge className={`${status.bg} ${status.text} border-0 capitalize`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {audit.status?.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">{audit.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                onClick={() => setIsScopeDialogOpen(true)}
                data-testid="button-define-scope"
              >
                <Target className="h-4 w-4 mr-2" />
                Define Scope
              </Button>
              {audit.status !== "completed" && audit.status !== "cancelled" && (
                <Button 
                  data-testid="button-complete-phase"
                  onClick={() => handleCompletePhase(currentPhase)}
                  disabled={updateAuditMutation.isPending}
                >
                  {updateAuditMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Complete {phaseConfig[currentPhase]?.label || currentPhase}
                </Button>
              )}
            </div>
          </div>

          {/* Progress Overview */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${typeConfig.color.split(" ")[0]}`}>
                    <TypeIcon className={`h-5 w-5 ${typeConfig.color.split(" ")[1]}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{typeConfig.label}</CardTitle>
                    <CardDescription>
                      {framework?.name || "Loading framework..."} • Started {audit.startDate ? new Date(audit.startDate).toLocaleDateString() : "Not started"}
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{Math.round(progressPercent)}%</div>
                  <div className="text-sm text-muted-foreground">Complete</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={progressPercent} className="h-2 mb-4" />
              <div className="flex flex-wrap gap-2">
                {phases.map((phase) => {
                  const pConfig = phaseConfig[phase];
                  const PhaseIcon = pConfig?.icon || Calendar;
                  const isComplete = phaseProgress[phase]?.status === "completed";
                  const isCurrent = phase === currentPhase;
                  const taskCompletion = getPhaseTasksCompletion(phase);
                  
                  return (
                    <Badge 
                      key={phase}
                      variant="outline"
                      className={`cursor-pointer ${
                        isComplete ? "bg-chart-2/20 text-chart-2 border-chart-2/30" :
                        isCurrent ? "bg-chart-3/20 text-chart-3 border-chart-3/30" :
                        "bg-muted"
                      }`}
                      onClick={() => setExpandedPhase(expandedPhase === phase ? null : phase)}
                      data-testid={`badge-phase-${phase}`}
                    >
                      <PhaseIcon className="h-3 w-3 mr-1" />
                      {pConfig?.label || phase}
                      <span className="ml-1 text-xs opacity-70">({taskCompletion.completed}/{taskCompletion.total})</span>
                      {isComplete && <CheckCircle2 className="h-3 w-3 ml-1" />}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Phase Details */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5" />
                    Audit Workflow
                  </CardTitle>
                  <CardDescription>
                    Complete each task to progress through the audit phases
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {phases.map((phase) => {
                    const pConfig = phaseConfig[phase];
                    const PhaseIcon = pConfig?.icon || Calendar;
                    const isComplete = phaseProgress[phase]?.status === "completed";
                    const isCurrent = phase === currentPhase;
                    const isExpanded = expandedPhase === phase;
                    const taskCompletion = getPhaseTasksCompletion(phase);
                    
                    return (
                      <Collapsible 
                        key={phase} 
                        open={isExpanded}
                        onOpenChange={() => setExpandedPhase(isExpanded ? null : phase)}
                      >
                        <CollapsibleTrigger asChild>
                          <div 
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                              isCurrent ? "border-primary bg-primary/5" :
                              isComplete ? "border-chart-2/30 bg-chart-2/5" :
                              "border-border hover:border-primary/30"
                            }`}
                            data-testid={`collapsible-phase-${phase}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                  isComplete ? "bg-chart-2/20" :
                                  isCurrent ? "bg-primary/20" :
                                  "bg-muted"
                                }`}>
                                  {isComplete ? (
                                    <CheckCircle2 className="h-4 w-4 text-chart-2" />
                                  ) : (
                                    <PhaseIcon className={`h-4 w-4 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold">{pConfig?.label || phase}</h4>
                                    <span className="text-xs text-muted-foreground">
                                      {taskCompletion.completed}/{taskCompletion.total} tasks
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {pConfig?.description || `Phase`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isCurrent && (
                                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                    Current
                                  </Badge>
                                )}
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-2 space-y-3">
                            {pConfig?.tasks.map((task) => {
                              const taskData = workflowData.taskResponses[task.id] || { taskId: task.id, response: "", completed: false, evidence: [] };
                              const isTaskExpanded = expandedTask === task.id;
                              
                              return (
                                <div 
                                  key={task.id}
                                  className={`p-4 rounded-lg border bg-card/50 ${taskData.completed ? "border-chart-2/30" : "border-border"}`}
                                >
                                  <div 
                                    className="flex items-start justify-between cursor-pointer"
                                    onClick={() => setExpandedTask(isTaskExpanded ? null : task.id)}
                                  >
                                    <div className="flex items-start gap-3">
                                      <Checkbox
                                        checked={taskData.completed}
                                        onCheckedChange={(checked) => handleTaskComplete(task.id, checked as boolean)}
                                        onClick={(e) => e.stopPropagation()}
                                        data-testid={`checkbox-task-${task.id}`}
                                      />
                                      <div>
                                        <h5 className={`font-medium ${taskData.completed ? "line-through text-muted-foreground" : ""}`}>
                                          {task.title}
                                        </h5>
                                        <p className="text-sm text-muted-foreground mt-0.5">
                                          {task.description}
                                        </p>
                                        {taskData.evidence && taskData.evidence.length > 0 && (
                                          <div className="flex items-center gap-1 mt-1">
                                            <Paperclip className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">
                                              {taskData.evidence.length} evidence file(s)
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {task.requiresEvidence && (
                                        <Badge variant="outline" className="text-xs">
                                          <Upload className="h-3 w-3 mr-1" />
                                          Evidence
                                        </Badge>
                                      )}
                                      {isTaskExpanded ? (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </div>
                                  </div>
                                  
                                  {isTaskExpanded && (
                                    <div className="mt-4 space-y-4 border-t pt-4">
                                      <div>
                                        <div className="flex items-center justify-between mb-2">
                                          <Label>Your Response</Label>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleGetAiSuggestion(task.id, task.aiPrompt)}
                                            disabled={loadingAiSuggestion === task.id}
                                            data-testid={`button-ai-suggest-${task.id}`}
                                          >
                                            {loadingAiSuggestion === task.id ? (
                                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                            ) : (
                                              <Sparkles className="h-3 w-3 mr-1" />
                                            )}
                                            AI Suggest
                                          </Button>
                                        </div>
                                        <Textarea
                                          className="min-h-[120px]"
                                          placeholder={`Enter your response for: ${task.title}...`}
                                          value={taskData.response}
                                          onChange={(e) => handleTaskResponseChange(task.id, e.target.value)}
                                          data-testid={`textarea-task-${task.id}`}
                                        />
                                      </div>
                                      
                                      {task.requiresEvidence && (
                                        <div>
                                          <Label className="mb-2 block">Evidence Attachments</Label>
                                          <div className="flex flex-wrap gap-2 mb-2">
                                            {(taskData.evidence || []).map((evidence, idx) => (
                                              <Badge key={idx} variant="outline" className="gap-1">
                                                <Paperclip className="h-3 w-3" />
                                                {evidence.name}
                                              </Badge>
                                            ))}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Input
                                              type="file"
                                              className="flex-1"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleEvidenceUpload(task.id, file);
                                              }}
                                              disabled={isUploading}
                                              data-testid={`input-evidence-${task.id}`}
                                            />
                                            {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                                          </div>
                                        </div>
                                      )}
                                      
                                      <div className="flex items-center justify-end gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleSaveTaskResponse(task.id)}
                                          disabled={updateAuditMutation.isPending}
                                          data-testid={`button-save-task-${task.id}`}
                                        >
                                          <Save className="h-3 w-3 mr-1" />
                                          Save
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant={taskData.completed ? "outline" : "default"}
                                          onClick={() => handleTaskComplete(task.id, !taskData.completed)}
                                          disabled={updateAuditMutation.isPending}
                                          data-testid={`button-complete-task-${task.id}`}
                                        >
                                          {taskData.completed ? (
                                            <>
                                              <X className="h-3 w-3 mr-1" />
                                              Mark Incomplete
                                            </>
                                          ) : (
                                            <>
                                              <CheckCircle2 className="h-3 w-3 mr-1" />
                                              Mark Complete
                                            </>
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Controls Checklist */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Controls Assessment
                  </CardTitle>
                  <CardDescription>
                    {controls.length} controls from {framework?.name || "framework"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {controls.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No controls found for this framework</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {controls.slice(0, 10).map((control) => (
                        <div 
                          key={control.id}
                          className="p-3 rounded-lg border bg-card/50 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-xs">
                              {control.controlId}
                            </Badge>
                            <span className="text-sm font-medium">{control.title}</span>
                          </div>
                          <Badge variant="outline" className="text-xs bg-muted">
                            Pending
                          </Badge>
                        </div>
                      ))}
                      {controls.length > 10 && (
                        <p className="text-sm text-center text-muted-foreground pt-2">
                          +{controls.length - 10} more controls
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Findings Sidebar */}
            <div className="space-y-4">
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Findings
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsAddFindingOpen(true)}
                      data-testid="button-add-finding"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <CardDescription>{findings.length} findings recorded</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Severity Summary */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="text-center p-2 rounded-lg bg-destructive/10">
                      <div className="text-lg font-bold text-destructive">{severityCounts.critical}</div>
                      <div className="text-xs text-muted-foreground">Critical</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-chart-4/10">
                      <div className="text-lg font-bold text-chart-4">{severityCounts.high}</div>
                      <div className="text-xs text-muted-foreground">High</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-chart-3/10">
                      <div className="text-lg font-bold text-chart-3">{severityCounts.medium}</div>
                      <div className="text-xs text-muted-foreground">Medium</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-chart-2/10">
                      <div className="text-lg font-bold text-chart-2">{severityCounts.low}</div>
                      <div className="text-xs text-muted-foreground">Low</div>
                    </div>
                  </div>

                  {/* Findings List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {findings.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <CheckCircle className="h-6 w-6 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No findings yet</p>
                      </div>
                    ) : (
                      findings.map((finding) => (
                        <div key={finding.id} className="p-3 rounded-lg border bg-card/50">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-sm truncate">{finding.title}</h5>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                {finding.description}
                              </p>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-xs flex-shrink-0 ${
                                finding.severity === "critical" ? "bg-destructive/10 text-destructive" :
                                finding.severity === "high" ? "bg-chart-4/10 text-chart-4" :
                                finding.severity === "medium" ? "bg-chart-3/10 text-chart-3" :
                                "bg-chart-2/10 text-chart-2"
                              }`}
                            >
                              {finding.severity}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Select
                              value={finding.status}
                              onValueChange={(value) => handleUpdateFindingStatus(finding.id, value as Finding["status"])}
                            >
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Scope Summary */}
              {scopeData.boundaries && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Audit Scope
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {scopeData.boundaries && (
                      <div>
                        <span className="text-muted-foreground">Boundaries:</span>
                        <p className="mt-0.5">{scopeData.boundaries}</p>
                      </div>
                    )}
                    {scopeData.systems && (
                      <div>
                        <span className="text-muted-foreground">Systems:</span>
                        <p className="mt-0.5">{scopeData.systems}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-sm">Audit Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Framework</span>
                    <span className="font-medium">{framework?.name || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Controls</span>
                    <span className="font-medium">{controls.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current Phase</span>
                    <Badge variant="outline" className="text-xs">
                      {phaseConfig[currentPhase]?.label || currentPhase}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Open Findings</span>
                    <span className="font-medium">{findings.filter(f => f.status === "open").length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Add Finding Dialog */}
      <Dialog open={isAddFindingOpen} onOpenChange={setIsAddFindingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Finding</DialogTitle>
            <DialogDescription>
              Document a finding discovered during the audit
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={newFinding.title}
                onChange={(e) => setNewFinding({ ...newFinding, title: e.target.value })}
                placeholder="Brief description of the finding"
                data-testid="input-finding-title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newFinding.description}
                onChange={(e) => setNewFinding({ ...newFinding, description: e.target.value })}
                placeholder="Detailed description of the finding..."
                data-testid="input-finding-description"
              />
            </div>
            <div>
              <Label>Severity</Label>
              <Select
                value={newFinding.severity}
                onValueChange={(value) => setNewFinding({ ...newFinding, severity: value as typeof newFinding.severity })}
              >
                <SelectTrigger data-testid="select-finding-severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFindingOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddFinding}
              disabled={!newFinding.title || updateAuditMutation.isPending}
              data-testid="button-submit-finding"
            >
              {updateAuditMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Finding
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Define Scope Dialog */}
      <Dialog open={isScopeDialogOpen} onOpenChange={setIsScopeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Define Audit Scope</DialogTitle>
            <DialogDescription>
              Define the boundaries and scope of this audit
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Audit Boundaries</Label>
              <Textarea
                value={scopeData.boundaries}
                onChange={(e) => setScopeData({ ...scopeData, boundaries: e.target.value })}
                placeholder="Define what is included within the scope of this audit..."
                className="min-h-[80px]"
                data-testid="input-scope-boundaries"
              />
            </div>
            <div>
              <Label>Systems & Processes</Label>
              <Textarea
                value={scopeData.systems}
                onChange={(e) => setScopeData({ ...scopeData, systems: e.target.value })}
                placeholder="List the systems, applications, and processes to be audited..."
                className="min-h-[80px]"
                data-testid="input-scope-systems"
              />
            </div>
            <div>
              <Label>Exclusions</Label>
              <Textarea
                value={scopeData.exclusions}
                onChange={(e) => setScopeData({ ...scopeData, exclusions: e.target.value })}
                placeholder="List any exclusions or out-of-scope items..."
                className="min-h-[60px]"
                data-testid="input-scope-exclusions"
              />
            </div>
            <div>
              <Label>Audit Timeframe</Label>
              <Input
                value={scopeData.timeframe}
                onChange={(e) => setScopeData({ ...scopeData, timeframe: e.target.value })}
                placeholder="e.g., January 2024 - December 2024"
                data-testid="input-scope-timeframe"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScopeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveScope}
              disabled={updateAuditMutation.isPending}
              data-testid="button-save-scope"
            >
              {updateAuditMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Scope
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
