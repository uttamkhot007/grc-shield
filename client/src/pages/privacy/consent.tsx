import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/contexts/tenant-context";
import type { ConsentRecord } from "@shared/schema";
import {
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  FileText,
  Settings,
  Eye,
  Edit,
  MoreHorizontal,
  Loader2,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const purposeLabels: Record<string, string> = {
  marketing: "Marketing Communications",
  analytics: "Analytics & Tracking",
  third_party_sharing: "Third-Party Sharing",
  service_notifications: "Service Notifications",
  profiling: "Profiling",
  research: "Research",
};

const statusStyles: Record<string, { bg: string; text: string; icon: any }> = {
  pending: { bg: "bg-chart-1/20", text: "text-chart-1", icon: Clock },
  granted: { bg: "bg-chart-2/20", text: "text-chart-2", icon: CheckCircle2 },
  withdrawn: { bg: "bg-destructive/20", text: "text-destructive", icon: XCircle },
  expired: { bg: "bg-muted", text: "text-muted-foreground", icon: Clock },
};

export default function ConsentManagementPage() {
  const { toast } = useToast();
  const { currentTenant } = useTenant();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("records");

  const { data: consents = [], isLoading } = useQuery<ConsentRecord[]>({
    queryKey: ["/api/consent-records", currentTenant?.id],
    queryFn: async () => {
      const response = await fetch(`/api/consent-records?tenantId=${currentTenant?.id}`);
      if (!response.ok) throw new Error("Failed to fetch consent records");
      return response.json();
    },
    enabled: !!currentTenant?.id,
  });

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const filteredConsents = consents.filter((consent) => {
    const matchesSearch = (consent.dataSubjectEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (consent.purpose || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || consent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const grantedConsents = consents.filter(c => c.status === "granted").length;
  const withdrawnConsents = consents.filter(c => c.status === "withdrawn").length;
  const expiredConsents = consents.filter(c => c.status === "expired").length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="mesh-gradient min-h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Consent Management</h1>
              <p className="text-muted-foreground mt-1">
                Track and manage user consent preferences across all data processing activities
              </p>
            </div>
            <Button data-testid="button-add-purpose">
              <Plus className="h-4 w-4 mr-2" />
              Add Purpose
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="stat-gradient-blue">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-1/20">
                    <Users className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{consents.length}</p>
                    <p className="text-xs text-muted-foreground">Total Records</p>
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
                    <p className="text-2xl font-bold">{grantedConsents}</p>
                    <p className="text-xs text-muted-foreground">Granted Consents</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-red">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/20">
                    <XCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{withdrawnConsents}</p>
                    <p className="text-xs text-muted-foreground">Withdrawn</p>
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
                    <p className="text-2xl font-bold">{expiredConsents}</p>
                    <p className="text-xs text-muted-foreground">Expired</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="records" data-testid="tab-records">Consent Records</TabsTrigger>
              <TabsTrigger value="purposes" data-testid="tab-purposes">Processing Purposes</TabsTrigger>
            </TabsList>

            <TabsContent value="records" className="mt-6">
              <Card className="card-3d">
                <CardHeader className="pb-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <CardTitle className="text-base">Consent Records</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by email or purpose..."
                          className="pl-9 w-64"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          data-testid="input-search-consents"
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-32" data-testid="select-status">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="granted">Granted</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="withdrawn">Withdrawn</SelectItem>
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
                        <TableHead>User</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Collected</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredConsents.map((consent) => {
                        const style = statusStyles[consent.status || 'pending'] || statusStyles.pending;
                        const StatusIcon = style.icon;
                        return (
                          <TableRow key={consent.id} data-testid={`row-consent-${consent.id}`}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{consent.dataSubjectEmail || '-'}</p>
                                <p className="text-xs text-muted-foreground">{consent.dataSubjectName || consent.dataSubjectId}</p>
                              </div>
                            </TableCell>
                            <TableCell>{purposeLabels[consent.purpose] || consent.purpose}</TableCell>
                            <TableCell>
                              <Badge className={`${style.bg} ${style.text} border-0 capitalize`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {(consent.status || 'pending').replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(consent.grantedAt)}</TableCell>
                            <TableCell>{formatDate(consent.expiresAt)}</TableCell>
                            <TableCell>{consent.source || '-'}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" /> View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
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
            </TabsContent>

            <TabsContent value="purposes" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(purposeLabels).map(([key, label]) => {
                  const purposeConsents = consents.filter(c => c.purpose === key);
                  const grantedCount = purposeConsents.filter(c => c.status === "granted").length;
                  const totalCount = purposeConsents.length;
                  const consentRate = totalCount > 0 ? Math.round((grantedCount / totalCount) * 100) : 0;
                  return (
                    <Card key={key} className="card-3d" data-testid={`purpose-${key}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{label}</CardTitle>
                            <CardDescription className="mt-1">Consent records for {label.toLowerCase()}</CardDescription>
                          </div>
                          <Badge variant="outline">Consent</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Consent Rate</span>
                            <span className="font-semibold">{consentRate}%</span>
                          </div>
                          <Progress value={consentRate} className="h-2" />
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="text-center p-2 bg-muted/50 rounded-lg">
                              <p className="text-lg font-bold">{totalCount.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Total</p>
                            </div>
                            <div className="text-center p-2 bg-muted/50 rounded-lg">
                              <p className="text-lg font-bold">{grantedCount.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Granted</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
