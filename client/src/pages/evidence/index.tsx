import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  FileBox,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Eye,
  Download,
  Upload,
  FileText,
  Image,
  File,
  MoreHorizontal,
  Shield,
  AlertTriangle,
  ClipboardCheck,
  ExternalLink,
  RefreshCcw,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useTenant } from "@/contexts/tenant-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface EvidenceItem {
  id: string;
  tenantId: string;
  controlId?: string;
  frameworkId?: string;
  auditId?: string;
  taskId?: string;
  title: string;
  description?: string;
  evidenceType?: string;
  sourceType?: string;
  sourceSystem?: string;
  fileUrl?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  reviewStatus: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
  submittedBy?: string;
  submittedAt?: string;
  createdAt: string;
}

interface EvidenceRequest {
  id: string;
  tenantId: string;
  evidenceItemId?: string;
  title: string;
  description?: string;
  requestType?: string;
  requestedBy?: string;
  status: string;
  response?: string;
  createdAt: string;
}

const reviewStatusConfig: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: "Pending Review", icon: Clock, color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  accepted: { label: "Accepted", icon: CheckCircle, color: "bg-green-500/20 text-green-400 border-green-500/30" },
  rejected: { label: "Rejected", icon: XCircle, color: "bg-red-500/20 text-red-400 border-red-500/30" },
  needs_clarification: { label: "Needs Clarification", icon: MessageSquare, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
};

const evidenceTypeConfig: Record<string, { label: string; icon: any }> = {
  document: { label: "Document", icon: FileText },
  screenshot: { label: "Screenshot", icon: Image },
  log: { label: "Log File", icon: File },
  config: { label: "Configuration", icon: File },
  report: { label: "Report", icon: FileText },
};

function EvidenceSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function EvidenceRepositoryPage() {
  const { currentTenantId } = useTenant();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [requestDetails, setRequestDetails] = useState({ title: "", description: "", requestType: "clarification" });

  const { data: evidenceItems = [], isLoading: evidenceLoading } = useQuery<EvidenceItem[]>({
    queryKey: ["/api/evidence", currentTenantId],
    queryFn: async () => {
      const res = await fetch(`/api/evidence?tenantId=${currentTenantId}`);
      if (!res.ok) throw new Error("Failed to fetch evidence");
      return res.json();
    },
    enabled: !!currentTenantId,
  });

  const { data: evidenceRequests = [] } = useQuery<EvidenceRequest[]>({
    queryKey: ["/api/evidence-requests", currentTenantId],
    queryFn: async () => {
      const res = await fetch(`/api/evidence-requests?tenantId=${currentTenantId}`);
      if (!res.ok) throw new Error("Failed to fetch requests");
      return res.json();
    },
    enabled: !!currentTenantId,
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, reviewStatus, reviewComment }: { id: string; reviewStatus: string; reviewComment?: string }) => {
      return apiRequest("POST", `/api/evidence/${id}/review`, {
        reviewStatus,
        reviewedBy: user?.id || "auditor",
        reviewComment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evidence", currentTenantId] });
      setIsReviewDialogOpen(false);
      setSelectedEvidence(null);
      setReviewComment("");
      toast({ title: "Evidence reviewed successfully" });
    },
    onError: () => {
      toast({ title: "Failed to review evidence", variant: "destructive" });
    },
  });

  const requestMutation = useMutation({
    mutationFn: async (data: { evidenceItemId: string; title: string; description: string; requestType: string }) => {
      return apiRequest("POST", "/api/evidence-requests", {
        ...data,
        tenantId: currentTenantId,
        requestedBy: user?.id || "auditor",
        status: "pending",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evidence-requests", currentTenantId] });
      queryClient.invalidateQueries({ queryKey: ["/api/evidence", currentTenantId] });
      setIsRequestDialogOpen(false);
      setSelectedEvidence(null);
      setRequestDetails({ title: "", description: "", requestType: "clarification" });
      toast({ title: "Request sent successfully" });
    },
    onError: () => {
      toast({ title: "Failed to send request", variant: "destructive" });
    },
  });

  const filteredEvidence = evidenceItems.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.reviewStatus === statusFilter;
    const matchesType = typeFilter === "all" || item.evidenceType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: evidenceItems.length,
    pending: evidenceItems.filter(e => e.reviewStatus === "pending").length,
    accepted: evidenceItems.filter(e => e.reviewStatus === "accepted").length,
    rejected: evidenceItems.filter(e => e.reviewStatus === "rejected").length,
    needsClarification: evidenceItems.filter(e => e.reviewStatus === "needs_clarification").length,
  };

  const handleReview = (evidence: EvidenceItem, status: string) => {
    if (status === "needs_clarification") {
      setSelectedEvidence(evidence);
      setIsRequestDialogOpen(true);
    } else {
      setSelectedEvidence(evidence);
      setIsReviewDialogOpen(true);
    }
  };

  const submitReview = (status: string) => {
    if (!selectedEvidence) return;
    reviewMutation.mutate({
      id: selectedEvidence.id,
      reviewStatus: status,
      reviewComment: reviewComment || undefined,
    });
  };

  const submitRequest = () => {
    if (!selectedEvidence) return;
    requestMutation.mutate({
      evidenceItemId: selectedEvidence.id,
      title: requestDetails.title || `Clarification needed for ${selectedEvidence.title}`,
      description: requestDetails.description,
      requestType: requestDetails.requestType,
    });
    reviewMutation.mutate({
      id: selectedEvidence.id,
      reviewStatus: "needs_clarification",
      reviewComment: requestDetails.description,
    });
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return File;
    if (mimeType.startsWith("image/")) return Image;
    if (mimeType.includes("pdf") || mimeType.includes("document")) return FileText;
    return File;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="mesh-gradient min-h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold" data-testid="page-title">Evidence Repository</h1>
              <p className="text-muted-foreground mt-1">
                Central repository for all audit evidence with review workflow
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/evidence", currentTenantId] })} data-testid="button-refresh">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="card-3d">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-1/20">
                    <FileBox className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total Evidence</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-3d">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <Clock className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                    <p className="text-xs text-muted-foreground">Pending Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-3d">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.accepted}</p>
                    <p className="text-xs text-muted-foreground">Accepted</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-3d">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.rejected}</p>
                    <p className="text-xs text-muted-foreground">Rejected</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-3d">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <MessageSquare className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.needsClarification}</p>
                    <p className="text-xs text-muted-foreground">Needs Clarification</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="card-3d">
            <CardHeader>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Evidence Items</CardTitle>
                  <CardDescription>Review, accept, reject, or request more details for submitted evidence</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search evidence..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                      data-testid="input-search-evidence"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40" data-testid="select-status-filter">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="needs_clarification">Needs Clarification</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-40" data-testid="select-type-filter">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="screenshot">Screenshot</SelectItem>
                      <SelectItem value="log">Log File</SelectItem>
                      <SelectItem value="config">Configuration</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {evidenceLoading ? (
                <EvidenceSkeleton />
              ) : filteredEvidence.length === 0 ? (
                <div className="text-center py-12">
                  <FileBox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No evidence found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Evidence will appear here when uploaded during audits"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Evidence</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvidence.map((evidence) => {
                      const statusConfig = reviewStatusConfig[evidence.reviewStatus] || reviewStatusConfig.pending;
                      const StatusIcon = statusConfig.icon;
                      const FileIcon = getFileIcon(evidence.mimeType);

                      return (
                        <TableRow key={evidence.id} data-testid={`row-evidence-${evidence.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-muted">
                                <FileIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{evidence.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {evidence.description || formatFileSize(evidence.fileSize)}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {evidence.evidenceType || "document"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {evidence.sourceType === "manual" ? "Manual Upload" : evidence.sourceSystem || "Unknown"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(evidence.submittedAt || evidence.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statusConfig.color} text-xs`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" data-testid={`button-actions-${evidence.id}`}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {evidence.filePath && (
                                  <DropdownMenuItem asChild>
                                    <a href={`/objects/${evidence.filePath}`} target="_blank" rel="noopener noreferrer">
                                      <Eye className="h-4 w-4 mr-2" />
                                      View File
                                    </a>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleReview(evidence, "accepted")}
                                  className="text-green-400"
                                  data-testid={`button-accept-${evidence.id}`}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Accept
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleReview(evidence, "rejected")}
                                  className="text-red-400"
                                  data-testid={`button-reject-${evidence.id}`}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleReview(evidence, "needs_clarification")}
                                  className="text-blue-400"
                                  data-testid={`button-request-details-${evidence.id}`}
                                >
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Request Details
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

          {evidenceRequests.length > 0 && (
            <Card className="card-3d">
              <CardHeader>
                <CardTitle>Evidence Requests</CardTitle>
                <CardDescription>Outstanding requests for additional information or clarification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {evidenceRequests.filter(r => r.status === "pending").map((request) => (
                    <div key={request.id} className="flex items-start gap-4 p-4 border rounded-lg" data-testid={`request-${request.id}`}>
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <MessageSquare className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{request.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{request.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Requested: {formatDate(request.createdAt)}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        Pending Response
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Evidence</DialogTitle>
            <DialogDescription>
              Add an optional comment for this review decision.
            </DialogDescription>
          </DialogHeader>
          {selectedEvidence && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium">{selectedEvidence.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{selectedEvidence.description}</p>
              </div>
              <div className="space-y-2">
                <Label>Review Comment (Optional)</Label>
                <Textarea
                  placeholder="Add any comments about this evidence..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  data-testid="input-review-comment"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => submitReview("rejected")}
              disabled={reviewMutation.isPending}
              data-testid="button-confirm-reject"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => submitReview("accepted")}
              disabled={reviewMutation.isPending}
              data-testid="button-confirm-accept"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Additional Details</DialogTitle>
            <DialogDescription>
              Specify what additional information or clarification is needed.
            </DialogDescription>
          </DialogHeader>
          {selectedEvidence && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium">{selectedEvidence.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{selectedEvidence.description}</p>
              </div>
              <div className="space-y-2">
                <Label>Request Type</Label>
                <Select 
                  value={requestDetails.requestType} 
                  onValueChange={(v) => setRequestDetails({ ...requestDetails, requestType: v })}
                >
                  <SelectTrigger data-testid="select-request-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clarification">Clarification Needed</SelectItem>
                    <SelectItem value="additional">Additional Evidence Required</SelectItem>
                    <SelectItem value="replacement">Replacement Requested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Details</Label>
                <Textarea
                  placeholder="Describe what additional information is needed..."
                  value={requestDetails.description}
                  onChange={(e) => setRequestDetails({ ...requestDetails, description: e.target.value })}
                  rows={4}
                  data-testid="input-request-details"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitRequest}
              disabled={requestMutation.isPending || !requestDetails.description}
              data-testid="button-send-request"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
