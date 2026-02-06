import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/contexts/tenant-context";
import type { BreachIncident } from "@shared/schema";
import {
  Plus,
  Search,
  AlertTriangle,
  Shield,
  CheckCircle2,
  Clock,
  Eye,
  Edit,
  MoreHorizontal,
  Users,
  FileWarning,
  Bell,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const severityStyles: Record<string, { bg: string; text: string }> = {
  critical: { bg: "bg-destructive", text: "text-white" },
  high: { bg: "bg-chart-3", text: "text-white" },
  medium: { bg: "bg-chart-1", text: "text-white" },
  low: { bg: "bg-chart-2", text: "text-white" },
};

const statusStyles: Record<string, { bg: string; text: string }> = {
  detected: { bg: "bg-chart-1/20", text: "text-chart-1" },
  investigating: { bg: "bg-chart-3/20", text: "text-chart-3" },
  contained: { bg: "bg-amber-500/20", text: "text-amber-400" },
  eradicated: { bg: "bg-chart-4/20", text: "text-chart-4" },
  recovered: { bg: "bg-chart-2/20", text: "text-chart-2" },
  closed: { bg: "bg-muted", text: "text-muted-foreground" },
};

export default function BreachManagementPage() {
  const { toast } = useToast();
  const { currentTenant } = useTenant();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const { data: breaches = [], isLoading } = useQuery<BreachIncident[]>({
    queryKey: ["/api/breach-incidents", currentTenant?.id],
    queryFn: async () => {
      const response = await fetch(`/api/breach-incidents?tenantId=${currentTenant?.id}`);
      if (!response.ok) throw new Error("Failed to fetch breach incidents");
      return response.json();
    },
    enabled: !!currentTenant?.id,
  });

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const filteredBreaches = breaches.filter((breach) => {
    const matchesSearch = (breach.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || breach.status === statusFilter;
    const matchesSeverity = severityFilter === "all" || breach.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const activeBreaches = breaches.filter(b => b.status !== "closed" && b.status !== "recovered").length;
  const criticalBreaches = breaches.filter(b => b.severity === "critical" || b.severity === "high").length;
  const totalAffected = breaches.reduce((acc, b) => acc + (b.affectedDataSubjects || 0), 0);
  const notificationRequired = breaches.filter(b => (b.regulatoryNotificationRequired || b.dataSubjectNotificationRequired) && b.status !== "closed").length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="mesh-gradient min-h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Breach Management</h1>
              <p className="text-muted-foreground mt-1">
                Track and manage data breaches and security incidents
              </p>
            </div>
            <Button data-testid="button-report-breach">
              <Plus className="h-4 w-4 mr-2" />
              Report Breach
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="stat-gradient-amber">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-3/20">
                    <AlertTriangle className="h-5 w-5 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activeBreaches}</p>
                    <p className="text-xs text-muted-foreground">Active Breaches</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-red">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/20">
                    <FileWarning className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{criticalBreaches}</p>
                    <p className="text-xs text-muted-foreground">High/Critical</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-blue">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-1/20">
                    <Users className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalAffected.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Records Affected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-purple">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-4/20">
                    <Bell className="h-5 w-5 text-chart-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{notificationRequired}</p>
                    <p className="text-xs text-muted-foreground">Pending Notification</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="card-3d">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-base">Data Breaches</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search breaches..."
                      className="pl-9 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="input-search-breaches"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-36" data-testid="select-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="detected">Detected</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="contained">Contained</SelectItem>
                      <SelectItem value="eradicated">Eradicated</SelectItem>
                      <SelectItem value="recovered">Recovered</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-32" data-testid="select-severity">
                      <SelectValue placeholder="Severity" />
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
                    <TableHead>Breach</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Discovered</TableHead>
                    <TableHead>Affected Records</TableHead>
                    <TableHead>Notification</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBreaches.map((breach) => {
                    const severityStyle = severityStyles[breach.severity || 'medium'] || severityStyles.medium;
                    const statusStyle = statusStyles[breach.status || 'detected'] || statusStyles.detected;
                    return (
                      <TableRow key={breach.id} data-testid={`row-breach-${breach.id}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{breach.title}</p>
                            <p className="text-xs text-muted-foreground">{breach.incidentNumber}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${severityStyle.bg} ${severityStyle.text} border-0 capitalize`}>
                            {breach.severity || 'medium'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusStyle.bg} ${statusStyle.text} border-0 capitalize`}>
                            {(breach.status || 'detected').replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(breach.discoveredAt)}</TableCell>
                        <TableCell>{(breach.affectedDataSubjects || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          {breach.regulatoryNotificationRequired || breach.dataSubjectNotificationRequired ? (
                            <Badge className="bg-chart-3/20 text-chart-3 border-0">Required</Badge>
                          ) : (
                            <Badge variant="outline">Not Required</Badge>
                          )}
                        </TableCell>
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
