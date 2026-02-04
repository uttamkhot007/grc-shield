import { useState } from "react";
import {
  Plus,
  Search,
  Calendar,
  Database,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Edit,
  MoreHorizontal,
  Trash2,
  Archive,
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

interface RetentionPolicy {
  id: string;
  dataCategory: string;
  retentionPeriod: string;
  legalBasis: string;
  status: string;
  nextReview: string;
  recordCount: number;
  expiringRecords: number;
  owner: string;
}

const mockPolicies: RetentionPolicy[] = [
  { id: "RET-001", dataCategory: "Customer Records", retentionPeriod: "7 years", legalBasis: "Legal Requirement", status: "active", nextReview: "2026-06-15", recordCount: 125000, expiringRecords: 3500, owner: "Data Governance" },
  { id: "RET-002", dataCategory: "Employee Data", retentionPeriod: "Employment + 7 years", legalBasis: "Legal Requirement", status: "active", nextReview: "2026-03-20", recordCount: 5000, expiringRecords: 120, owner: "HR" },
  { id: "RET-003", dataCategory: "Marketing Consents", retentionPeriod: "3 years", legalBasis: "Consent", status: "active", nextReview: "2026-05-01", recordCount: 85000, expiringRecords: 12000, owner: "Marketing" },
  { id: "RET-004", dataCategory: "Financial Transactions", retentionPeriod: "10 years", legalBasis: "Legal Requirement", status: "active", nextReview: "2026-12-31", recordCount: 500000, expiringRecords: 8000, owner: "Finance" },
  { id: "RET-005", dataCategory: "Website Analytics", retentionPeriod: "2 years", legalBasis: "Legitimate Interest", status: "review_needed", nextReview: "2026-02-01", recordCount: 2000000, expiringRecords: 250000, owner: "Digital" },
  { id: "RET-006", dataCategory: "Support Tickets", retentionPeriod: "5 years", legalBasis: "Contract", status: "active", nextReview: "2026-08-15", recordCount: 75000, expiringRecords: 5000, owner: "Support" },
];

const statusStyles: Record<string, { bg: string; text: string }> = {
  active: { bg: "bg-chart-2/20", text: "text-chart-2" },
  review_needed: { bg: "bg-chart-3/20", text: "text-chart-3" },
  expired: { bg: "bg-destructive/20", text: "text-destructive" },
  draft: { bg: "bg-muted", text: "text-muted-foreground" },
};

export default function RetentionPoliciesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredPolicies = mockPolicies.filter((policy) => {
    const matchesSearch = policy.dataCategory.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || policy.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRecords = mockPolicies.reduce((acc, p) => acc + p.recordCount, 0);
  const expiringRecords = mockPolicies.reduce((acc, p) => acc + p.expiringRecords, 0);
  const reviewNeeded = mockPolicies.filter(p => p.status === "review_needed").length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="mesh-gradient min-h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Retention Policies</h1>
              <p className="text-muted-foreground mt-1">
                Manage data retention schedules and ensure timely data disposal
              </p>
            </div>
            <Button data-testid="button-add-policy">
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="stat-gradient-blue">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-1/20">
                    <Database className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{(totalRecords / 1000000).toFixed(1)}M</p>
                    <p className="text-xs text-muted-foreground">Total Records</p>
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
                    <p className="text-2xl font-bold">{(expiringRecords / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-muted-foreground">Expiring Soon</p>
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
                    <p className="text-2xl font-bold">{mockPolicies.length}</p>
                    <p className="text-xs text-muted-foreground">Active Policies</p>
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
                    <p className="text-2xl font-bold">{reviewNeeded}</p>
                    <p className="text-xs text-muted-foreground">Review Needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="card-3d">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-base">Retention Schedules</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search policies..."
                      className="pl-9 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="input-search-retention"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-36" data-testid="select-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="review_needed">Review Needed</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Data Category</TableHead>
                    <TableHead>Retention Period</TableHead>
                    <TableHead>Legal Basis</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Expiring</TableHead>
                    <TableHead>Next Review</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPolicies.map((policy) => {
                    const statusStyle = statusStyles[policy.status] || statusStyles.active;
                    const expiringPercent = (policy.expiringRecords / policy.recordCount) * 100;
                    return (
                      <TableRow key={policy.id} data-testid={`row-policy-${policy.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Archive className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{policy.dataCategory}</p>
                              <p className="text-xs text-muted-foreground">{policy.owner}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{policy.retentionPeriod}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {policy.legalBasis}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusStyle.bg} ${statusStyle.text} border-0 capitalize`}>
                            {policy.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{policy.recordCount.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={expiringPercent > 10 ? "text-chart-3 font-medium" : ""}>
                              {policy.expiringRecords.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({expiringPercent.toFixed(1)}%)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{policy.nextReview}</TableCell>
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
                                <Edit className="h-4 w-4 mr-2" /> Edit Policy
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast({ title: "Disposal review coming soon" })}>
                                <Trash2 className="h-4 w-4 mr-2" /> Run Disposal
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
