import { useState } from "react";
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

interface DSRRequest {
  id: string;
  requesterId: string;
  requesterEmail: string;
  requesterName: string;
  requestType: string;
  status: string;
  submittedAt: string;
  dueDate: string;
  assignee: string;
  description?: string;
}

const mockRequests: DSRRequest[] = [
  { id: "DSR-001", requesterId: "USR001", requesterEmail: "john.doe@example.com", requesterName: "John Doe", requestType: "access", status: "in_progress", submittedAt: "2026-01-15", dueDate: "2026-02-14", assignee: "Privacy Team", description: "Request for all personal data" },
  { id: "DSR-002", requesterId: "USR002", requesterEmail: "jane.smith@example.com", requesterName: "Jane Smith", requestType: "deletion", status: "pending", submittedAt: "2026-01-20", dueDate: "2026-02-19", assignee: "Privacy Team", description: "Right to be forgotten request" },
  { id: "DSR-003", requesterId: "USR003", requesterEmail: "bob.wilson@example.com", requesterName: "Bob Wilson", requestType: "portability", status: "completed", submittedAt: "2026-01-05", dueDate: "2026-02-04", assignee: "Data Team", description: "Export all data in machine-readable format" },
  { id: "DSR-004", requesterId: "USR004", requesterEmail: "alice.johnson@example.com", requesterName: "Alice Johnson", requestType: "rectification", status: "in_progress", submittedAt: "2026-01-18", dueDate: "2026-02-17", assignee: "Privacy Team", description: "Correct incorrect address information" },
  { id: "DSR-005", requesterId: "USR005", requesterEmail: "charlie.brown@example.com", requesterName: "Charlie Brown", requestType: "objection", status: "rejected", submittedAt: "2026-01-10", dueDate: "2026-02-09", assignee: "Legal Team", description: "Objection to marketing processing" },
];

const statusStyles: Record<string, { bg: string; text: string; icon: any }> = {
  pending: { bg: "bg-chart-1/20", text: "text-chart-1", icon: Clock },
  in_progress: { bg: "bg-chart-3/20", text: "text-chart-3", icon: AlertCircle },
  completed: { bg: "bg-chart-2/20", text: "text-chart-2", icon: CheckCircle2 },
  rejected: { bg: "bg-destructive/20", text: "text-destructive", icon: XCircle },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredRequests = mockRequests.filter((request) => {
    const matchesSearch = request.requesterEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesType = typeFilter === "all" || request.requestType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingCount = mockRequests.filter(r => r.status === "pending").length;
  const inProgressCount = mockRequests.filter(r => r.status === "in_progress").length;
  const completedCount = mockRequests.filter(r => r.status === "completed").length;

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
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
                    <p className="text-2xl font-bold">{mockRequests.length}</p>
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
                    <p className="text-2xl font-bold">{pendingCount + inProgressCount}</p>
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
                    const style = statusStyles[request.status] || statusStyles.pending;
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
                              <p className="font-medium">{request.requesterName}</p>
                              <p className="text-xs text-muted-foreground">{request.requesterEmail}</p>
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
                            {request.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className={isOverdue ? "text-destructive font-medium" : isUrgent ? "text-chart-3 font-medium" : ""}>
                              {request.dueDate}
                            </span>
                            {request.status !== "completed" && request.status !== "rejected" && (
                              <span className={`text-xs ${isOverdue ? "text-destructive" : isUrgent ? "text-chart-3" : "text-muted-foreground"}`}>
                                {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{request.assignee}</TableCell>
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
