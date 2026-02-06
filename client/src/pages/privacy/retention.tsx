import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/contexts/tenant-context";
import type { RetentionPolicy } from "@shared/schema";
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
  Loader2,
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

const statusStyles: Record<string, { bg: string; text: string }> = {
  active: { bg: "bg-chart-2/20", text: "text-chart-2" },
  inactive: { bg: "bg-muted", text: "text-muted-foreground" },
  draft: { bg: "bg-chart-1/20", text: "text-chart-1" },
  pending: { bg: "bg-chart-3/20", text: "text-chart-3" },
};

export default function RetentionPoliciesPage() {
  const { toast } = useToast();
  const { currentTenant } = useTenant();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: policies = [], isLoading } = useQuery<RetentionPolicy[]>({
    queryKey: ["/api/retention-policies", currentTenant?.id],
    queryFn: async () => {
      const response = await fetch(`/api/retention-policies?tenantId=${currentTenant?.id}`);
      if (!response.ok) throw new Error("Failed to fetch retention policies");
      return response.json();
    },
    enabled: !!currentTenant?.id,
  });

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const formatRetentionPeriod = (days: number | null) => {
    if (!days) return '-';
    if (days < 365) return `${days} days`;
    return `${Math.round(days / 365)} years`;
  };

  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch = (policy.dataCategory || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (policy.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || policy.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRecords = policies.reduce((acc, p) => acc + (p.recordsProcessed || 0), 0);
  const archivedRecords = policies.reduce((acc, p) => acc + (p.recordsArchived || 0), 0);
  const pendingPolicies = policies.filter(p => p.status === "pending").length;

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
                    <p className="text-2xl font-bold">{(archivedRecords / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-muted-foreground">Archived</p>
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
                    <p className="text-2xl font-bold">{policies.filter(p => p.status === "active").length}</p>
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
                    <p className="text-2xl font-bold">{pendingPolicies}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
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
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
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
                    <TableHead>Processed</TableHead>
                    <TableHead>Deleted</TableHead>
                    <TableHead>Next Execution</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : filteredPolicies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No retention policies found. Create your first data retention policy.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPolicies.map((policy) => {
                      const statusStyle = statusStyles[policy.status || 'active'] || statusStyles.active;
                      const recordsProcessed = policy.recordsProcessed || 0;
                      const recordsDeleted = policy.recordsDeleted || 0;
                      return (
                        <TableRow key={policy.id} data-testid={`row-policy-${policy.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Archive className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{policy.name}</p>
                                <p className="text-xs text-muted-foreground">{policy.dataCategory}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{formatRetentionPeriod(policy.retentionPeriodDays)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {policy.legalBasis || 'Not specified'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statusStyle.bg} ${statusStyle.text} border-0 capitalize`}>
                              {(policy.status || 'active').replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>{recordsProcessed.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={recordsDeleted > 0 ? "text-chart-3 font-medium" : ""}>
                                {recordsDeleted.toLocaleString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(policy.nextExecutionAt)}</TableCell>
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
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
