import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ClipboardCheck,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
  Play,
  Pause,
  FileText,
  Shield,
  Building2,
  Users,
  Scale,
  RefreshCcw,
  Award,
  ChevronRight,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { fetchAudits } from "@/lib/api";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTenant } from "@/contexts/tenant-context";
import type { Audit, Framework } from "@shared/schema";
import { Link, useLocation } from "wouter";

const auditTypeConfig = {
  internal: { 
    label: "Internal Audit", 
    icon: Building2, 
    color: "bg-chart-1/20 text-chart-1",
    description: "Self-assessment by internal audit team",
    phases: ["planning", "preparation", "fieldwork", "reporting", "follow_up"]
  },
  external: { 
    label: "External Audit", 
    icon: Users, 
    color: "bg-chart-2/20 text-chart-2",
    description: "Third-party independent assessment",
    phases: ["planning", "preparation", "fieldwork", "reporting", "follow_up", "closure"]
  },
  regulatory: { 
    label: "Regulatory Audit", 
    icon: Scale, 
    color: "bg-chart-4/20 text-chart-4",
    description: "Government or regulatory body inspection",
    phases: ["planning", "preparation", "fieldwork", "reporting", "closure"]
  },
  surveillance: { 
    label: "Surveillance Audit", 
    icon: Eye, 
    color: "bg-chart-3/20 text-chart-3",
    description: "Periodic check of ongoing compliance",
    phases: ["planning", "fieldwork", "reporting"]
  },
  certification: { 
    label: "Certification Audit", 
    icon: Award, 
    color: "bg-primary/20 text-primary",
    description: "Full assessment for certification",
    phases: ["planning", "preparation", "fieldwork", "reporting", "follow_up", "closure"]
  },
  follow_up: { 
    label: "Follow-up Audit", 
    icon: RefreshCcw, 
    color: "bg-muted text-muted-foreground",
    description: "Verify corrective actions from previous audit",
    phases: ["planning", "fieldwork", "reporting"]
  },
};

const phaseConfig = {
  planning: { label: "Planning", description: "Define scope, objectives, and schedule" },
  preparation: { label: "Preparation", description: "Gather documentation and prepare checklists" },
  fieldwork: { label: "Fieldwork", description: "Execute audit procedures and collect evidence" },
  reporting: { label: "Reporting", description: "Document findings and recommendations" },
  follow_up: { label: "Follow-up", description: "Track corrective actions and remediation" },
  closure: { label: "Closure", description: "Final sign-off and archive audit records" },
};

const statusStyles = {
  scheduled: { bg: "bg-chart-1/20", text: "text-chart-1", icon: Calendar },
  planning: { bg: "bg-chart-1/20", text: "text-chart-1", icon: Calendar },
  in_progress: { bg: "bg-chart-3/20", text: "text-chart-3", icon: Clock },
  pending_review: { bg: "bg-chart-4/20", text: "text-chart-4", icon: FileText },
  completed: { bg: "bg-chart-2/20", text: "text-chart-2", icon: CheckCircle2 },
  cancelled: { bg: "bg-muted", text: "text-muted-foreground", icon: XCircle },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-2 w-24" />
        </div>
      ))}
    </div>
  );
}

function PhaseProgress({ currentPhase, auditType }: { currentPhase: string; auditType: string }) {
  const config = auditTypeConfig[auditType as keyof typeof auditTypeConfig] || auditTypeConfig.internal;
  const phases = config.phases;
  const currentIndex = phases.indexOf(currentPhase);

  return (
    <div className="flex items-center gap-1">
      {phases.map((phase, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <div
            key={phase}
            className={`h-2 flex-1 rounded-full transition-all ${
              isCompleted
                ? "bg-chart-2"
                : isCurrent
                ? "bg-chart-3"
                : "bg-muted"
            }`}
            title={phaseConfig[phase as keyof typeof phaseConfig]?.label || phase}
          />
        );
      })}
    </div>
  );
}

const createAuditSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  auditType: z.string().min(1, "Please select an audit type"),
  frameworkId: z.string().optional(),
  scheduledDate: z.string().optional(),
});

type CreateAuditFormValues = z.infer<typeof createAuditSchema>;

interface TenantFramework {
  id: string;
  tenantId: string;
  frameworkId: string;
  applicabilityType: string;
  status: string;
  framework?: Framework;
}

export default function AuditsPage() {
  const { currentTenantId } = useTenant();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isStartAuditDialogOpen, setIsStartAuditDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [startAuditFrameworkId, setStartAuditFrameworkId] = useState<string>("");
  const [startAuditType, setStartAuditType] = useState<string>("internal");

  const { data: audits = [], isLoading } = useQuery({
    queryKey: ["/api/audits", currentTenantId || "all"],
    queryFn: () => fetchAudits(currentTenantId || undefined),
  });

  const { data: frameworks = [] } = useQuery<Framework[]>({
    queryKey: ["/api/frameworks"],
  });

  // Fetch active tenant frameworks from Governance
  const { data: tenantFrameworks = [] } = useQuery<TenantFramework[]>({
    queryKey: ["/api/tenant-frameworks", currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return [];
      const res = await fetch(`/api/tenant-frameworks?tenantId=${currentTenantId}`);
      return res.json();
    },
    enabled: !!currentTenantId,
  });

  // Get active frameworks with full details
  const activeFrameworks = tenantFrameworks
    .filter(tf => tf.status === "active")
    .map(tf => frameworks.find(f => f.id === tf.frameworkId))
    .filter((f): f is Framework => !!f);

  const form = useForm<CreateAuditFormValues>({
    resolver: zodResolver(createAuditSchema),
    defaultValues: {
      title: "",
      description: "",
      auditType: "",
      frameworkId: "",
      scheduledDate: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateAuditFormValues) => {
      const auditData = {
        ...data,
        tenantId: currentTenantId,
        status: "scheduled",
        currentPhase: "planning",
        phaseProgress: Object.fromEntries(
          (auditTypeConfig[data.auditType as keyof typeof auditTypeConfig]?.phases || []).map(
            (phase) => [phase, { status: "pending", completedAt: null }]
          )
        ),
      };
      return apiRequest("POST", "/api/audits", auditData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
      setIsCreateDialogOpen(false);
      setSelectedType(null);
      form.reset();
      toast({ title: "Audit created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create audit", variant: "destructive" });
    },
  });

  // Start audit mutation - creates and immediately starts an audit
  const startAuditMutation = useMutation({
    mutationFn: async () => {
      if (!currentTenantId) {
        throw new Error("No tenant selected");
      }
      if (!startAuditFrameworkId) {
        throw new Error("No framework selected");
      }
      const selectedFramework = frameworks.find(f => f.id === startAuditFrameworkId);
      if (!selectedFramework) {
        throw new Error("Invalid framework selected");
      }
      const auditData = {
        title: `${selectedFramework.name} Audit - ${new Date().toLocaleDateString()}`,
        description: `Audit of ${selectedFramework.name} controls and compliance`,
        auditType: startAuditType,
        frameworkId: startAuditFrameworkId,
        tenantId: currentTenantId,
        status: "in_progress",
        currentPhase: "planning",
        startDate: new Date().toISOString(),
        phaseProgress: Object.fromEntries(
          (auditTypeConfig[startAuditType as keyof typeof auditTypeConfig]?.phases || []).map(
            (phase, index) => [phase, { status: index === 0 ? "in_progress" : "pending", completedAt: null }]
          )
        ),
      };
      return apiRequest("POST", "/api/audits", auditData);
    },
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
      setIsStartAuditDialogOpen(false);
      setStartAuditFrameworkId("");
      setStartAuditType("internal");
      toast({ title: "Audit started successfully", description: "The audit workflow is now in progress." });
      // Navigate to the audit detail page
      const audit = await response.json();
      if (audit?.id) {
        setLocation(`/tenant/${currentTenantId}/audits/${audit.id}`);
      }
    },
    onError: () => {
      toast({ title: "Failed to start audit", variant: "destructive" });
    },
  });

  const handleCreate = (data: CreateAuditFormValues) => {
    createMutation.mutate(data);
  };

  const filteredAudits = audits.filter((audit) =>
    audit.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scheduledCount = audits.filter((a) => a.status === "scheduled").length;
  const inProgressCount = audits.filter((a) => a.status === "in_progress").length;
  const completedCount = audits.filter((a) => a.status === "completed").length;
  const totalFindings = audits.reduce((acc, a) => {
    const findings = a.findings as unknown[];
    return acc + (Array.isArray(findings) ? findings.length : 0);
  }, 0);

  return (
    <div className="flex-1 overflow-auto">
      <div className="mesh-gradient min-h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Audit Management</h1>
              <p className="text-muted-foreground mt-1">
                Plan, execute, and track internal and external audits with multiphase workflows
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/audits/checklists">
                <Button variant="outline">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Checklists
                </Button>
              </Link>
              <Button variant="outline" data-testid="button-create-audit" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Audit
              </Button>
              <Button data-testid="button-start-audit" onClick={() => setIsStartAuditDialogOpen(true)}>
                <Play className="h-4 w-4 mr-2" />
                Start Audit
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="stat-gradient-blue">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-1/20">
                    <Calendar className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{isLoading ? "-" : scheduledCount}</p>
                    <p className="text-xs text-muted-foreground">Scheduled</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-amber">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-3/20">
                    <Clock className="h-5 w-5 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{isLoading ? "-" : inProgressCount}</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-green">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-2/20">
                    <CheckCircle2 className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{isLoading ? "-" : completedCount}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-red">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/20">
                    <Shield className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{isLoading ? "-" : totalFindings}</p>
                    <p className="text-xs text-muted-foreground">Open Findings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="text-base">Audit Type Workflows</CardTitle>
              <CardDescription>Select audit type to see configured workflow phases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(auditTypeConfig).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <div
                      key={type}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-primary ${
                        selectedType === type ? "border-primary bg-primary/5" : "border-border"
                      }`}
                      onClick={() => setSelectedType(selectedType === type ? null : type)}
                      data-testid={`audit-type-card-${type}`}
                    >
                      <div className={`p-2 rounded-lg w-fit mb-2 ${config.color.split(" ")[0]}`}>
                        <Icon className={`h-5 w-5 ${config.color.split(" ")[1]}`} />
                      </div>
                      <h4 className="font-semibold text-sm">{config.label}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{config.phases.length} phases</p>
                    </div>
                  );
                })}
              </div>
              {selectedType && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-3">
                    {auditTypeConfig[selectedType as keyof typeof auditTypeConfig].label} Workflow
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    {auditTypeConfig[selectedType as keyof typeof auditTypeConfig].phases.map((phase, index) => (
                      <div key={phase} className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-background rounded-lg border border-border">
                          <span className="text-xs font-medium">
                            {phaseConfig[phase as keyof typeof phaseConfig]?.label || phase}
                          </span>
                        </div>
                        {index < auditTypeConfig[selectedType as keyof typeof auditTypeConfig].phases.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {auditTypeConfig[selectedType as keyof typeof auditTypeConfig].description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-3d">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-base font-semibold">All Audits</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search audits..."
                      className="pl-9 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="input-search-audits"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <TableSkeleton />
              ) : filteredAudits.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No audits found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery ? "Try adjusting your search" : "Schedule your first audit to get started"}
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Audit
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Audit</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Findings</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAudits.map((audit) => {
                      const status = statusStyles[audit.status as keyof typeof statusStyles] || statusStyles.scheduled;
                      const StatusIcon = status.icon;
                      const auditType = (audit as any).auditType || "internal";
                      const currentPhase = (audit as any).currentPhase || "planning";
                      const typeConfig = auditTypeConfig[auditType as keyof typeof auditTypeConfig] || auditTypeConfig.internal;
                      const TypeIcon = typeConfig.icon;

                      return (
                        <TableRow
                          key={audit.id}
                          className="cursor-pointer"
                          onClick={() => setLocation(`/tenant/${currentTenantId}/audits/${audit.id}`)}
                          data-testid={`row-audit-${audit.id}`}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-muted">
                                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">{audit.title}</p>
                                <p className="text-xs text-muted-foreground">{audit.id.slice(0, 8)}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`p-1 rounded ${typeConfig.color.split(" ")[0]}`}>
                                <TypeIcon className={`h-3 w-3 ${typeConfig.color.split(" ")[1]}`} />
                              </div>
                              <span className="text-xs font-medium capitalize">
                                {auditType.replace("_", " ")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs capitalize">
                              {phaseConfig[currentPhase as keyof typeof phaseConfig]?.label || currentPhase}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="w-24">
                              <PhaseProgress currentPhase={currentPhase} auditType={auditType} />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${status.bg} ${status.text} border-0 capitalize`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {(audit.status || "scheduled").replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {audit.scheduledDate
                                ? new Date(audit.scheduledDate).toLocaleDateString()
                                : "Not set"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {Array.isArray(audit.findings) ? audit.findings.length : 0}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setLocation(`/tenant/${currentTenantId}/audits/${audit.id}`)} data-testid={`menu-view-${audit.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setLocation(`/tenant/${currentTenantId}/audits/${audit.id}`)} data-testid={`menu-edit-${audit.id}`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Audit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setLocation(`/tenant/${currentTenantId}/audits/${audit.id}`)} data-testid={`menu-start-${audit.id}`}>
                                  <Play className="h-4 w-4 mr-2" />
                                  Continue Audit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" data-testid={`menu-cancel-${audit.id}`}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel Audit
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Audit</DialogTitle>
                <DialogDescription>
                  Select the audit type to configure the appropriate workflow phases
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="auditType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Audit Type</FormLabel>
                        <FormDescription>
                          Choose the type of audit - this determines the workflow phases
                        </FormDescription>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                          {Object.entries(auditTypeConfig).map(([type, config]) => {
                            const Icon = config.icon;
                            const isSelected = field.value === type;
                            return (
                              <div
                                key={type}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                  isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                }`}
                                onClick={() => field.onChange(type)}
                                data-testid={`select-audit-type-${type}`}
                              >
                                <div className={`p-2 rounded-lg w-fit mb-2 ${config.color.split(" ")[0]}`}>
                                  <Icon className={`h-5 w-5 ${config.color.split(" ")[1]}`} />
                                </div>
                                <h4 className="font-semibold text-sm">{config.label}</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {config.phases.length} phases
                                </p>
                              </div>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("auditType") && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Workflow Phases</h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        {auditTypeConfig[form.watch("auditType") as keyof typeof auditTypeConfig]?.phases.map(
                          (phase, index, arr) => (
                            <div key={phase} className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {phaseConfig[phase as keyof typeof phaseConfig]?.label || phase}
                              </Badge>
                              {index < arr.length - 1 && (
                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Audit Title</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Q1 2026 ISO 27001 Surveillance Audit"
                            data-testid="input-audit-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder="Describe the scope and objectives of this audit..."
                            data-testid="input-audit-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="frameworkId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Framework (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-audit-framework">
                                <SelectValue placeholder="Select framework" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {frameworks.map((framework) => (
                                <SelectItem key={framework.id} value={framework.id}>
                                  {framework.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="scheduledDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scheduled Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              data-testid="input-audit-scheduled-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Creating..." : "Schedule Audit"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Start Audit Dialog */}
          <Dialog open={isStartAuditDialogOpen} onOpenChange={setIsStartAuditDialogOpen}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Start New Audit
                </DialogTitle>
                <DialogDescription>
                  Select a framework from your active Governance frameworks and start an audit immediately
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Audit Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(auditTypeConfig).slice(0, 6).map(([type, config]) => {
                      const Icon = config.icon;
                      const isSelected = startAuditType === type;
                      return (
                        <div
                          key={type}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setStartAuditType(type)}
                          data-testid={`start-audit-type-${type}`}
                        >
                          <div className={`p-2 rounded-lg w-fit mb-2 ${config.color.split(" ")[0]}`}>
                            <Icon className={`h-4 w-4 ${config.color.split(" ")[1]}`} />
                          </div>
                          <h4 className="font-medium text-sm">{config.label}</h4>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Select Framework from Active Governance Frameworks</label>
                  {activeFrameworks.length === 0 ? (
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        No active frameworks found. Please add frameworks in Governance first.
                      </p>
                    </div>
                  ) : (
                    <Select value={startAuditFrameworkId} onValueChange={setStartAuditFrameworkId}>
                      <SelectTrigger data-testid="select-start-audit-framework">
                        <SelectValue placeholder="Select a framework to audit" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeFrameworks.map((framework) => (
                          <SelectItem key={framework.id} value={framework.id}>
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-primary" />
                              <span>{framework.name}</span>
                              <Badge variant="outline" className="text-xs ml-2">
                                {framework.category}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {startAuditType && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Audit Workflow Phases</h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      {auditTypeConfig[startAuditType as keyof typeof auditTypeConfig]?.phases.map(
                        (phase, index, arr) => (
                          <div key={phase} className="flex items-center gap-2">
                            <Badge variant={index === 0 ? "default" : "outline"} className="text-xs">
                              {phaseConfig[phase as keyof typeof phaseConfig]?.label || phase}
                            </Badge>
                            {index < arr.length - 1 && (
                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsStartAuditDialogOpen(false);
                    setStartAuditFrameworkId("");
                    setStartAuditType("internal");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => startAuditMutation.mutate()}
                  disabled={!startAuditFrameworkId || startAuditMutation.isPending}
                  data-testid="button-confirm-start-audit"
                >
                  {startAuditMutation.isPending ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Audit Now
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
