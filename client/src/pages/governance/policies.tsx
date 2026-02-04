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
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Edit,
  Eye,
  Trash2,
  Download,
  Calendar,
  Send,
  ThumbsUp,
  ThumbsDown,
  X,
  FileDown,
  Building2,
  User,
  History,
  AlertTriangle,
  Sparkles,
  Loader2,
  Wand2,
  ClipboardCheck,
  ListChecks,
  FileSearch,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  fetchPolicies, 
  createPolicy, 
  updatePolicy, 
  deletePolicy,
  submitPolicyForApproval,
  approvePolicy,
  rejectPolicy,
  fetchTenants,
} from "@/lib/api";
import { useTenant } from "@/contexts/tenant-context";
import type { Policy, Tenant, User as UserType } from "@shared/schema";
import { ApprovalWorkflowDialog } from "@/components/ApprovalWorkflowDialog";

const statusStyles = {
  approved: { bg: "bg-chart-2/20", text: "text-chart-2", icon: CheckCircle2 },
  pending: { bg: "bg-chart-3/20", text: "text-chart-3", icon: Clock },
  draft: { bg: "bg-muted", text: "text-muted-foreground", icon: FileText },
  rejected: { bg: "bg-destructive/20", text: "text-destructive", icon: XCircle },
};

const policyFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.string().min(1, "Category is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  version: z.string().min(1, "Version is required"),
  effectiveDate: z.string().optional(),
  reviewDate: z.string().optional(),
});

type PolicyFormValues = z.infer<typeof policyFormSchema>;

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
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

const categoryOptions = [
  "Information Security",
  "Access Control",
  "Data Protection",
  "Privacy",
  "Incident Management",
  "Business Continuity",
  "Risk Management",
  "Compliance",
  "Human Resources",
  "Physical Security",
  "Network Security",
  "Third Party Management",
  "Asset Management",
  "Change Management",
];

export default function PoliciesPage() {
  const { currentTenantId } = useTenant();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAiEnrichDialogOpen, setIsAiEnrichDialogOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [aiEnrichmentResult, setAiEnrichmentResult] = useState<string>("");
  const [aiEnrichmentType, setAiEnrichmentType] = useState<string>("enhance");

  const { data: policies = [], isLoading } = useQuery({
    queryKey: ["/api/policies", currentTenantId || "all"],
    queryFn: () => fetchPolicies(currentTenantId || undefined),
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ["/api/tenants"],
    queryFn: fetchTenants,
  });

  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find((t: Tenant) => t.id === tenantId);
    return tenant?.name || "Unknown";
  };

  const getUserName = (userId: string | null) => {
    if (!userId) return "Not set";
    const user = users.find((u) => u.id === userId);
    if (user) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username;
    }
    return "Unknown";
  };

  const createForm = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      title: "",
      category: "",
      content: "",
      version: "1.0",
      effectiveDate: "",
      reviewDate: "",
    },
  });

  const editForm = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      title: "",
      category: "",
      content: "",
      version: "1.0",
      effectiveDate: "",
      reviewDate: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createPolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      toast({ title: "Policy created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create policy", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Policy> }) => updatePolicy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
      setIsEditDialogOpen(false);
      setSelectedPolicy(null);
      toast({ title: "Policy updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update policy", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
      setIsDeleteDialogOpen(false);
      setSelectedPolicy(null);
      toast({ title: "Policy deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete policy", variant: "destructive" });
    },
  });

  const submitForApprovalMutation = useMutation({
    mutationFn: submitPolicyForApproval,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
      toast({ title: "Policy submitted for approval" });
    },
    onError: () => {
      toast({ title: "Failed to submit for approval", variant: "destructive" });
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, approverId }: { id: string; approverId: string }) => approvePolicy(id, approverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
      toast({ title: "Policy approved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to approve policy", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectPolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
      toast({ title: "Policy rejected" });
    },
    onError: () => {
      toast({ title: "Failed to reject policy", variant: "destructive" });
    },
  });

  const aiEnrichMutation = useMutation({
    mutationFn: async ({ id, enrichmentType }: { id: string; enrichmentType: string }) => {
      const response = await fetch(`/api/policies/${id}/ai-enrich`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrichmentType }),
      });
      if (!response.ok) throw new Error("Failed to enrich policy");
      return response.json();
    },
    onSuccess: (data) => {
      setAiEnrichmentResult(data.enrichedContent);
      toast({ title: "AI enrichment complete" });
    },
    onError: () => {
      toast({ title: "Failed to enrich policy with AI", variant: "destructive" });
    },
  });

  const openAiEnrichDialog = (policy: Policy) => {
    setSelectedPolicy(policy);
    setAiEnrichmentResult("");
    setAiEnrichmentType("enhance");
    setIsAiEnrichDialogOpen(true);
  };

  const runAiEnrichment = () => {
    if (!selectedPolicy) return;
    aiEnrichMutation.mutate({ id: selectedPolicy.id, enrichmentType: aiEnrichmentType });
  };

  const applyAiContent = () => {
    if (!selectedPolicy || !aiEnrichmentResult) return;
    updateMutation.mutate({
      id: selectedPolicy.id,
      data: { content: aiEnrichmentResult },
    });
    setIsAiEnrichDialogOpen(false);
    setAiEnrichmentResult("");
  };

  const handleCreate = (data: PolicyFormValues) => {
    const tenantId = currentTenantId || tenants[0]?.id;
    if (!tenantId) {
      toast({ title: "No tenant selected", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      ...data,
      tenantId,
      status: "draft",
      ownerId: null,
      approvedBy: null,
      approvedAt: null,
      effectiveDate: data.effectiveDate || null,
      reviewDate: data.reviewDate || null,
    } as any);
  };

  const handleEdit = (data: PolicyFormValues) => {
    if (!selectedPolicy) return;
    updateMutation.mutate({
      id: selectedPolicy.id,
      data: {
        ...data,
        effectiveDate: data.effectiveDate || null,
        reviewDate: data.reviewDate || null,
      } as any,
    });
  };

  const openEditDialog = (policy: Policy) => {
    setSelectedPolicy(policy);
    editForm.reset({
      title: policy.title,
      category: policy.category || "",
      content: policy.content || "",
      version: policy.version || "1.0",
      effectiveDate: policy.effectiveDate ? new Date(policy.effectiveDate).toISOString().split("T")[0] : "",
      reviewDate: policy.reviewDate ? new Date(policy.reviewDate).toISOString().split("T")[0] : "",
    });
    setIsEditDialogOpen(true);
  };

  const openDetailSheet = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsDetailSheetOpen(true);
  };

  const openDeleteDialog = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsDeleteDialogOpen(true);
  };

  const exportToPdf = async (policy: Policy) => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(33, 37, 41);
    doc.text(policy.title, 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(108, 117, 125);
    doc.text(`Category: ${policy.category || "N/A"}`, 20, 45);
    doc.text(`Version: ${policy.version || "1.0"}`, 20, 55);
    doc.text(`Status: ${(policy.status || "draft").toUpperCase()}`, 20, 65);
    doc.text(`Effective Date: ${policy.effectiveDate ? new Date(policy.effectiveDate).toLocaleDateString() : "N/A"}`, 20, 75);
    doc.text(`Review Date: ${policy.reviewDate ? new Date(policy.reviewDate).toLocaleDateString() : "N/A"}`, 20, 85);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 95, 190, 95);
    
    doc.setFontSize(11);
    doc.setTextColor(33, 37, 41);
    const splitContent = doc.splitTextToSize(policy.content || "", 170);
    doc.text(splitContent, 20, 110);
    
    doc.setFontSize(8);
    doc.setTextColor(108, 117, 125);
    doc.text(`Generated on ${new Date().toLocaleString()} | GRC Shield Platform`, 20, 280);
    
    doc.save(`${policy.title.replace(/\s+/g, "_")}_policy.pdf`);
    toast({ title: "PDF exported successfully" });
  };

  const exportToWord = async (policy: Policy) => {
    const { Document, Paragraph, TextRun, Packer, HeadingLevel } = await import("docx");
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: policy.title,
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Category: ", bold: true }),
              new TextRun(policy.category || "N/A"),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Version: ", bold: true }),
              new TextRun(policy.version || "1.0"),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Status: ", bold: true }),
              new TextRun((policy.status || "draft").toUpperCase()),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Effective Date: ", bold: true }),
              new TextRun(policy.effectiveDate ? new Date(policy.effectiveDate).toLocaleDateString() : "N/A"),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Review Date: ", bold: true }),
              new TextRun(policy.reviewDate ? new Date(policy.reviewDate).toLocaleDateString() : "N/A"),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            text: "Policy Content",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: policy.content || "",
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: `Generated on ${new Date().toLocaleString()} | GRC Shield Platform`, italics: true, size: 18 }),
            ],
          }),
        ],
      }],
    });
    
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${policy.title.replace(/\s+/g, "_")}_policy.docx`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Word document exported successfully" });
  };

  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch = policy.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || policy.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const approvedCount = policies.filter((p) => p.status === "approved").length;
  const pendingCount = policies.filter((p) => p.status === "pending").length;
  const draftCount = policies.filter((p) => p.status === "draft").length;
  const reviewDueCount = policies.filter((p) => {
    if (!p.reviewDate) return false;
    const reviewDate = new Date(p.reviewDate);
    const now = new Date();
    const daysUntilReview = Math.ceil((reviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilReview <= 30 && daysUntilReview > 0;
  }).length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="mesh-gradient min-h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Policy Management</h1>
              <p className="text-muted-foreground mt-1">
                Create, manage, and track organizational policies with approval workflows
              </p>
            </div>
            <Button data-testid="button-create-policy" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="stat-gradient-green">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-2/20">
                    <CheckCircle2 className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{isLoading ? "-" : approvedCount}</p>
                    <p className="text-xs text-muted-foreground">Approved</p>
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
                    <p className="text-2xl font-bold">{isLoading ? "-" : pendingCount}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-blue">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-1/20">
                    <FileText className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{isLoading ? "-" : draftCount}</p>
                    <p className="text-xs text-muted-foreground">Drafts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-purple">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-4/20">
                    <Calendar className="h-5 w-5 text-chart-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{isLoading ? "-" : reviewDueCount}</p>
                    <p className="text-xs text-muted-foreground">Due for Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="card-3d">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-base font-semibold">All Policies</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search policies..."
                      className="pl-9 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="input-search-policies"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32" data-testid="select-status-filter">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <TableSkeleton />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Policy</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Version</TableHead>
                      {!currentTenantId && <TableHead>Organization</TableHead>}
                      <TableHead>Effective Date</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPolicies.map((policy) => {
                      const status = statusStyles[policy.status as keyof typeof statusStyles] || statusStyles.draft;
                      const StatusIcon = status.icon;
                      return (
                        <TableRow
                          key={policy.id}
                          className="cursor-pointer"
                          data-testid={`row-policy-${policy.id}`}
                          onClick={() => openDetailSheet(policy)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-muted">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">{policy.title}</p>
                                <p className="text-xs text-muted-foreground">{policy.id.slice(0, 8)}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {policy.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${status.bg} ${status.text} border-0`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {policy.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            v{policy.version}
                          </TableCell>
                          {!currentTenantId && (
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{getTenantName(policy.tenantId || "")}</span>
                              </div>
                            </TableCell>
                          )}
                          <TableCell className="text-muted-foreground">
                            {policy.effectiveDate ? new Date(policy.effectiveDate).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openDetailSheet(policy); }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(policy); }}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openAiEnrichDialog(policy); }}>
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  AI Enrich Content
                                </DropdownMenuItem>
                                {policy.status === "draft" && (
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedPolicy(policy); setIsApprovalDialogOpen(true); }}>
                                    <Send className="h-4 w-4 mr-2" />
                                    Submit for Approval
                                  </DropdownMenuItem>
                                )}
                                {policy.status === "pending" && (
                                  <>
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); approveMutation.mutate({ id: policy.id, approverId: "demo-user" }); }}>
                                      <ThumbsUp className="h-4 w-4 mr-2" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); rejectMutation.mutate(policy.id); }}>
                                      <ThumbsDown className="h-4 w-4 mr-2" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); exportToPdf(policy); }}>
                                  <FileDown className="h-4 w-4 mr-2" />
                                  Export as PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); exportToWord(policy); }}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Export as Word
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive" 
                                  onClick={(e) => { e.stopPropagation(); openDeleteDialog(policy); }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredPolicies.length === 0 && !isLoading && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No policies found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Policy</DialogTitle>
            <DialogDescription>
              Create a new policy document. It will be saved as a draft until submitted for approval.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Information Security Policy" {...field} data-testid="input-policy-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-policy-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryOptions.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version</FormLabel>
                      <FormControl>
                        <Input placeholder="1.0" {...field} data-testid="input-policy-version" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="effectiveDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-effective-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="reviewDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-review-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={createForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter the full policy content here..." 
                        className="min-h-[200px]" 
                        {...field} 
                        data-testid="textarea-policy-content"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-policy">
                  {createMutation.isPending ? "Creating..." : "Create Policy"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Policy</DialogTitle>
            <DialogDescription>
              Update the policy details. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Title</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-policy-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryOptions.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="effectiveDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="reviewDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Content</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[200px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedPolicy && (
            <>
              <SheetHeader>
                <div className="flex items-start justify-between pr-8">
                  <div>
                    <SheetTitle className="text-xl">{selectedPolicy.title}</SheetTitle>
                    <SheetDescription className="mt-1">
                      {selectedPolicy.category} • Version {selectedPolicy.version}
                    </SheetDescription>
                  </div>
                  <Badge className={`${statusStyles[selectedPolicy.status as keyof typeof statusStyles]?.bg} ${statusStyles[selectedPolicy.status as keyof typeof statusStyles]?.text} border-0`}>
                    {selectedPolicy.status}
                  </Badge>
                </div>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="mt-4 space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Policy Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {!currentTenantId && (
                          <>
                            <div className="flex items-center gap-3">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Organization</p>
                                <p className="text-sm font-medium">{getTenantName(selectedPolicy.tenantId || "")}</p>
                              </div>
                            </div>
                            <Separator />
                          </>
                        )}
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Effective Date</p>
                            <p className="text-sm font-medium">
                              {selectedPolicy.effectiveDate ? new Date(selectedPolicy.effectiveDate).toLocaleDateString() : "Not set"}
                            </p>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Review Date</p>
                            <p className="text-sm font-medium">
                              {selectedPolicy.reviewDate ? new Date(selectedPolicy.reviewDate).toLocaleDateString() : "Not set"}
                            </p>
                          </div>
                        </div>
                        {selectedPolicy.approvedBy && (
                          <>
                            <Separator />
                            <div className="flex items-center gap-3">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Approved By</p>
                                <p className="text-sm font-medium">{getUserName(selectedPolicy.approvedBy)}</p>
                              </div>
                            </div>
                          </>
                        )}
                        {selectedPolicy.approvedAt && (
                          <>
                            <Separator />
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="h-4 w-4 text-chart-2" />
                              <div>
                                <p className="text-xs text-muted-foreground">Approved At</p>
                                <p className="text-sm font-medium">{new Date(selectedPolicy.approvedAt).toLocaleString()}</p>
                              </div>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                    
                    <div className="flex flex-wrap gap-2">
                      {selectedPolicy.status === "draft" && (
                        <Button 
                          onClick={() => setIsApprovalDialogOpen(true)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Submit for Approval
                        </Button>
                      )}
                      {selectedPolicy.status === "pending" && (
                        <>
                          <Button 
                            variant="default"
                            onClick={() => approveMutation.mutate({ id: selectedPolicy.id, approverId: "demo-user" })}
                            disabled={approveMutation.isPending}
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => rejectMutation.mutate(selectedPolicy.id)}
                            disabled={rejectMutation.isPending}
                          >
                            <ThumbsDown className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button variant="outline" onClick={() => exportToPdf(selectedPolicy)}>
                        <FileDown className="h-4 w-4 mr-2" />
                        Export PDF
                      </Button>
                      <Button variant="outline" onClick={() => exportToWord(selectedPolicy)}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Word
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="content" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <p className="whitespace-pre-wrap">{selectedPolicy.content}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="history" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-muted">
                              <History className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Policy Created</p>
                              <p className="text-xs text-muted-foreground">
                                {selectedPolicy.createdAt ? new Date(selectedPolicy.createdAt).toLocaleString() : "Unknown"}
                              </p>
                            </div>
                          </div>
                          {selectedPolicy.updatedAt && selectedPolicy.updatedAt !== selectedPolicy.createdAt && (
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-full bg-muted">
                                <Edit className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Last Updated</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(selectedPolicy.updatedAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          )}
                          {selectedPolicy.approvedAt && (
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-full bg-chart-2/20">
                                <CheckCircle2 className="h-4 w-4 text-chart-2" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Approved</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(selectedPolicy.approvedAt).toLocaleString()} by {selectedPolicy.approvedBy}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Policy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedPolicy?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedPolicy && deleteMutation.mutate(selectedPolicy.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AI Content Enrichment Dialog */}
      <Dialog open={isAiEnrichDialogOpen} onOpenChange={setIsAiEnrichDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Content Enrichment
            </DialogTitle>
            <DialogDescription>
              Use AI to enhance, analyze, or generate content for "{selectedPolicy?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant={aiEnrichmentType === "enhance" ? "default" : "outline"}
                size="sm"
                onClick={() => setAiEnrichmentType("enhance")}
                className="flex flex-col items-center gap-1 h-auto py-3"
                data-testid="button-ai-enhance"
              >
                <Wand2 className="h-5 w-5" />
                <span className="text-xs">Enhance</span>
              </Button>
              <Button
                variant={aiEnrichmentType === "summarize" ? "default" : "outline"}
                size="sm"
                onClick={() => setAiEnrichmentType("summarize")}
                className="flex flex-col items-center gap-1 h-auto py-3"
                data-testid="button-ai-summarize"
              >
                <FileSearch className="h-5 w-5" />
                <span className="text-xs">Summarize</span>
              </Button>
              <Button
                variant={aiEnrichmentType === "compliance-check" ? "default" : "outline"}
                size="sm"
                onClick={() => setAiEnrichmentType("compliance-check")}
                className="flex flex-col items-center gap-1 h-auto py-3"
                data-testid="button-ai-compliance"
              >
                <ClipboardCheck className="h-5 w-5" />
                <span className="text-xs">Compliance</span>
              </Button>
              <Button
                variant={aiEnrichmentType === "controls" ? "default" : "outline"}
                size="sm"
                onClick={() => setAiEnrichmentType("controls")}
                className="flex flex-col items-center gap-1 h-auto py-3"
                data-testid="button-ai-controls"
              >
                <ListChecks className="h-5 w-5" />
                <span className="text-xs">Controls</span>
              </Button>
            </div>

            <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
              {aiEnrichmentType === "enhance" && "Expand and improve the policy with best practices, detailed procedures, and compliance requirements."}
              {aiEnrichmentType === "summarize" && "Generate a concise executive summary of the policy content."}
              {aiEnrichmentType === "compliance-check" && "Analyze the policy for gaps and provide recommendations based on ISO 27001, SOC 2, GDPR, and NIST."}
              {aiEnrichmentType === "controls" && "Suggest specific security controls that should be implemented to support this policy."}
            </div>

            <Button
              onClick={runAiEnrichment}
              disabled={aiEnrichMutation.isPending}
              className="w-full"
              data-testid="button-run-ai-enrichment"
            >
              {aiEnrichMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Run AI Analysis
                </>
              )}
            </Button>

            {aiEnrichmentResult && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-chart-2" />
                    AI Generated Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/30 p-4 rounded-lg max-h-80 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap font-sans">{aiEnrichmentResult}</pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAiEnrichDialogOpen(false)}>
              Close
            </Button>
            {aiEnrichmentResult && aiEnrichmentType === "enhance" && (
              <Button onClick={applyAiContent} disabled={updateMutation.isPending} data-testid="button-apply-ai-content">
                {updateMutation.isPending ? "Applying..." : "Apply to Policy"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Workflow Dialog */}
      {selectedPolicy && (
        <ApprovalWorkflowDialog
          isOpen={isApprovalDialogOpen}
          onClose={() => setIsApprovalDialogOpen(false)}
          entityType="policy"
          entityId={selectedPolicy.id}
          entityTitle={selectedPolicy.title}
          entityVersion={selectedPolicy.version || "1.0"}
          entityStatus={selectedPolicy.status || "draft"}
        />
      )}
    </div>
  );
}
