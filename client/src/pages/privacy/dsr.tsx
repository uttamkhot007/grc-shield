import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/contexts/tenant-context";
import type { DsrRequest } from "@shared/schema";
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  Edit,
  MoreHorizontal,
  User,
  Mail,
  Calendar,
  Download,
  Trash2,
  Loader2,
  FileX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const statusStyles: Record<string, { bg: string; text: string; icon: any }> = {
  submitted: { bg: "bg-chart-1/20", text: "text-chart-1", icon: Clock },
  verified: { bg: "bg-chart-4/20", text: "text-chart-4", icon: CheckCircle2 },
  in_progress: { bg: "bg-chart-3/20", text: "text-chart-3", icon: AlertCircle },
  pending_approval: { bg: "bg-amber-500/20", text: "text-amber-400", icon: Clock },
  completed: { bg: "bg-chart-2/20", text: "text-chart-2", icon: CheckCircle2 },
  rejected: { bg: "bg-destructive/20", text: "text-destructive", icon: XCircle },
  cancelled: { bg: "bg-muted", text: "text-muted-foreground", icon: XCircle },
};

const requestTypeLabels: Record<string, string> = {
  access: "Access Request",
  deletion: "Deletion Request",
  portability: "Data Portability",
  rectification: "Rectification",
  objection: "Objection",
  restriction: "Processing Restriction",
};

const requestTypeIcons: Record<string, any> = {
  access: Eye,
  deletion: Trash2,
  portability: Download,
  rectification: Edit,
  objection: XCircle,
  restriction: AlertCircle,
};

export default function DSRPortalPage() {
  const { toast } = useToast();
  const { currentTenant } = useTenant();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: requests = [], isLoading } = useQuery<DsrRequest[]>({
    queryKey: ['/api/dsr-requests', currentTenant?.id],
    queryFn: async () => {
      const res = await fetch(`/api/dsr-requests?tenantId=${currentTenant?.id || ''}`);
      if (!res.ok) throw new Error('Failed to fetch DSR requests');
      return res.json();
    },
    enabled: !!currentTenant?.id,
  });

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = (request.dataSubjectEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.dataSubjectName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesType = typeFilter === "all" || request.requestType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const submittedCount = requests.filter(r => r.status === "submitted").length;
  const inProgressCount = requests.filter(r => r.status === "in_progress").length;
  const completedCount = requests.filter(r => r.status === "completed").length;

  const getDaysRemaining = (dueDate: Date | null) => {
    if (!dueDate) return 30;
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="mesh-gradient min-h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold">DSR Portal</h1>
              <p className="text-muted-foreground mt-1">
                Manage Data Subject Access Requests and privacy rights
              </p>
            </div>
            <Button data-testid="button-new-request">
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="stat-gradient-blue">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-1/20">
                    <Mail className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{requests.length}</p>
                    <p className="text-xs text-muted-foreground">Total Requests</p>
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
                    <p className="text-2xl font-bold">{submittedCount + inProgressCount}</p>
                    <p className="text-xs text-muted-foreground">Open Requests</p>
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
                    <p className="text-2xl font-bold">{completedCount}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
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
                    <p className="text-2xl font-bold">30</p>
                    <p className="text-xs text-muted-foreground">Days SLA</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="card-3d">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-base">Data Subject Requests</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search requests..."
                      className="pl-9 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="input-search-dsr"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32" data-testid="select-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-40" data-testid="select-type">
                      <SelectValue placeholder="Request Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="access">Access</SelectItem>
                      <SelectItem value="deletion">Deletion</SelectItem>
                      <SelectItem value="portability">Portability</SelectItem>
                      <SelectItem value="rectification">Rectification</SelectItem>
                      <SelectItem value="objection">Objection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Request ID</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => {
                    const style = statusStyles[request.status || 'submitted'] || statusStyles.submitted;
                    const StatusIcon = style.icon;
                    const TypeIcon = requestTypeIcons[request.requestType] || Eye;
                    const daysRemaining = getDaysRemaining(request.dueDate);
                    const isOverdue = daysRemaining < 0;
                    const isUrgent = daysRemaining >= 0 && daysRemaining <= 7;
                    return (
                      <TableRow key={request.id} data-testid={`row-dsr-${request.id}`}>
                        <TableCell>
                          <span className="font-mono font-medium">{request.id}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{request.dataSubjectName}</p>
                              <p className="text-xs text-muted-foreground">{request.dataSubjectEmail}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {requestTypeLabels[request.requestType]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${style.bg} ${style.text} border-0 capitalize`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {(request.status || 'submitted').replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className={isOverdue ? "text-destructive font-medium" : isUrgent ? "text-chart-3 font-medium" : ""}>
                              {formatDate(request.dueDate)}
                            </span>
                            {request.status !== "completed" && request.status !== "rejected" && (
                              <span className={`text-xs ${isOverdue ? "text-destructive" : isUrgent ? "text-chart-3" : "text-muted-foreground"}`}>
                                {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{request.assigneeId || 'Unassigned'}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toast({ title: "View details coming soon" })}>
                                <Eye className="h-4 w-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast({ title: "Edit coming soon" })}>
                                <Edit className="h-4 w-4 mr-2" /> Update Status
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
