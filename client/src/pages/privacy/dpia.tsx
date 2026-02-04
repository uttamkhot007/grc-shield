import { useState } from "react";
import {
  Plus,
  Search,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Eye,
  Edit,
  MoreHorizontal,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

interface DPIA {
  id: string;
  name: string;
  project: string;
  riskLevel: string;
  status: string;
  owner: string;
  createdAt: string;
  completedAt?: string;
  description?: string;
  residualRisk: number;
}

const mockDPIAs: DPIA[] = [
  { id: "DPIA-001", name: "Customer Analytics Platform", project: "Marketing Transformation", riskLevel: "high", status: "in_progress", owner: "Privacy Team", createdAt: "2026-01-10", description: "Assessment for new customer behavior analytics", residualRisk: 65 },
  { id: "DPIA-002", name: "Employee Monitoring System", project: "Remote Work Initiative", riskLevel: "critical", status: "pending_review", owner: "HR & Privacy", createdAt: "2026-01-05", description: "Assessment for productivity monitoring tools", residualRisk: 80 },
  { id: "DPIA-003", name: "Biometric Access Control", project: "Security Enhancement", riskLevel: "high", status: "approved", owner: "Security Team", createdAt: "2025-12-15", completedAt: "2026-01-20", description: "Fingerprint and facial recognition for facility access", residualRisk: 35 },
  { id: "DPIA-004", name: "Mobile App v3.0", project: "Digital Experience", riskLevel: "medium", status: "approved", owner: "Product Team", createdAt: "2025-11-20", completedAt: "2025-12-30", description: "New features collecting location and device data", residualRisk: 25 },
  { id: "DPIA-005", name: "AI Chatbot Implementation", project: "Customer Service AI", riskLevel: "high", status: "draft", owner: "AI Team", createdAt: "2026-01-25", description: "Conversational AI processing customer queries", residualRisk: 70 },
];

const statusStyles: Record<string, { bg: string; text: string }> = {
  draft: { bg: "bg-muted", text: "text-muted-foreground" },
  in_progress: { bg: "bg-chart-1/20", text: "text-chart-1" },
  pending_review: { bg: "bg-chart-3/20", text: "text-chart-3" },
  approved: { bg: "bg-chart-2/20", text: "text-chart-2" },
  rejected: { bg: "bg-destructive/20", text: "text-destructive" },
};

const riskLevelStyles: Record<string, { bg: string; text: string }> = {
  critical: { bg: "bg-destructive", text: "text-white" },
  high: { bg: "bg-chart-3", text: "text-white" },
  medium: { bg: "bg-chart-1", text: "text-white" },
  low: { bg: "bg-chart-2", text: "text-white" },
};

export default function DPIAPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  const filteredDPIAs = mockDPIAs.filter((dpia) => {
    const matchesSearch = dpia.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dpia.project.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || dpia.status === statusFilter;
    const matchesRisk = riskFilter === "all" || dpia.riskLevel === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const draftCount = mockDPIAs.filter(d => d.status === "draft").length;
  const inProgressCount = mockDPIAs.filter(d => d.status === "in_progress" || d.status === "pending_review").length;
  const approvedCount = mockDPIAs.filter(d => d.status === "approved").length;
  const highRiskCount = mockDPIAs.filter(d => d.riskLevel === "high" || d.riskLevel === "critical").length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="mesh-gradient min-h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold">DPIA Management</h1>
              <p className="text-muted-foreground mt-1">
                Data Protection Impact Assessments for high-risk processing activities
              </p>
            </div>
            <Button data-testid="button-new-dpia">
              <Plus className="h-4 w-4 mr-2" />
              New DPIA
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="stat-gradient-blue">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-1/20">
                    <FileText className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mockDPIAs.length}</p>
                    <p className="text-xs text-muted-foreground">Total DPIAs</p>
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
                    <p className="text-2xl font-bold">{inProgressCount}</p>
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
                    <p className="text-2xl font-bold">{approvedCount}</p>
                    <p className="text-xs text-muted-foreground">Approved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-red">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/20">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{highRiskCount}</p>
                    <p className="text-xs text-muted-foreground">High Risk</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="card-3d">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-base">Impact Assessments</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search DPIAs..."
                      className="pl-9 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="input-search-dpia"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-36" data-testid="select-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="pending_review">Pending Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger className="w-32" data-testid="select-risk">
                      <SelectValue placeholder="Risk Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>DPIA</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Residual Risk</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDPIAs.map((dpia) => {
                    const statusStyle = statusStyles[dpia.status] || statusStyles.draft;
                    const riskStyle = riskLevelStyles[dpia.riskLevel] || riskLevelStyles.medium;
                    return (
                      <TableRow key={dpia.id} data-testid={`row-dpia-${dpia.id}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{dpia.name}</p>
                            <p className="text-xs text-muted-foreground">{dpia.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>{dpia.project}</TableCell>
                        <TableCell>
                          <Badge className={`${riskStyle.bg} ${riskStyle.text} border-0 capitalize`}>
                            {dpia.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusStyle.bg} ${statusStyle.text} border-0 capitalize`}>
                            {dpia.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 w-32">
                            <Progress value={100 - dpia.residualRisk} className="h-2" />
                            <span className="text-xs font-medium">{dpia.residualRisk}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{dpia.owner}</TableCell>
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
                                <Edit className="h-4 w-4 mr-2" /> Edit
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
