import { useState } from "react";
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

interface ConsentRecord {
  id: string;
  userId: string;
  email: string;
  purpose: string;
  status: string;
  collectedAt: string;
  expiresAt: string;
  source: string;
}

interface ConsentPurpose {
  id: string;
  name: string;
  description: string;
  legalBasis: string;
  consentRate: number;
  totalConsents: number;
  activeConsents: number;
}

const mockConsents: ConsentRecord[] = [
  { id: "1", userId: "USR001", email: "john.doe@example.com", purpose: "Marketing Communications", status: "active", collectedAt: "2025-12-15", expiresAt: "2026-12-15", source: "Website" },
  { id: "2", userId: "USR002", email: "jane.smith@example.com", purpose: "Analytics & Tracking", status: "active", collectedAt: "2025-11-20", expiresAt: "2026-11-20", source: "Mobile App" },
  { id: "3", userId: "USR003", email: "bob.wilson@example.com", purpose: "Marketing Communications", status: "withdrawn", collectedAt: "2025-10-05", expiresAt: "2026-10-05", source: "Website" },
  { id: "4", userId: "USR004", email: "alice.johnson@example.com", purpose: "Third-Party Sharing", status: "active", collectedAt: "2025-12-01", expiresAt: "2026-12-01", source: "Portal" },
  { id: "5", userId: "USR005", email: "charlie.brown@example.com", purpose: "Service Notifications", status: "expired", collectedAt: "2024-12-20", expiresAt: "2025-12-20", source: "Website" },
];

const mockPurposes: ConsentPurpose[] = [
  { id: "1", name: "Marketing Communications", description: "Email, SMS, and push notifications for marketing", legalBasis: "Consent", consentRate: 68, totalConsents: 15420, activeConsents: 10486 },
  { id: "2", name: "Analytics & Tracking", description: "Website and app usage analytics", legalBasis: "Legitimate Interest", consentRate: 82, totalConsents: 18500, activeConsents: 15170 },
  { id: "3", name: "Third-Party Sharing", description: "Sharing data with partner organizations", legalBasis: "Consent", consentRate: 34, totalConsents: 15420, activeConsents: 5243 },
  { id: "4", name: "Service Notifications", description: "Essential service-related communications", legalBasis: "Contract", consentRate: 95, totalConsents: 18500, activeConsents: 17575 },
];

const statusStyles: Record<string, { bg: string; text: string; icon: any }> = {
  active: { bg: "bg-chart-2/20", text: "text-chart-2", icon: CheckCircle2 },
  withdrawn: { bg: "bg-destructive/20", text: "text-destructive", icon: XCircle },
  expired: { bg: "bg-muted", text: "text-muted-foreground", icon: Clock },
};

export default function ConsentManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("records");

  const filteredConsents = mockConsents.filter((consent) => {
    const matchesSearch = consent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consent.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || consent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeConsents = mockConsents.filter(c => c.status === "active").length;
  const withdrawnConsents = mockConsents.filter(c => c.status === "withdrawn").length;
  const expiredConsents = mockConsents.filter(c => c.status === "expired").length;

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
                    <p className="text-2xl font-bold">{mockConsents.length}</p>
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
                    <p className="text-2xl font-bold">{activeConsents}</p>
                    <p className="text-xs text-muted-foreground">Active Consents</p>
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
                          <SelectItem value="active">Active</SelectItem>
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
                        const style = statusStyles[consent.status] || statusStyles.active;
                        const StatusIcon = style.icon;
                        return (
                          <TableRow key={consent.id} data-testid={`row-consent-${consent.id}`}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{consent.email}</p>
                                <p className="text-xs text-muted-foreground">{consent.userId}</p>
                              </div>
                            </TableCell>
                            <TableCell>{consent.purpose}</TableCell>
                            <TableCell>
                              <Badge className={`${style.bg} ${style.text} border-0 capitalize`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {consent.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{consent.collectedAt}</TableCell>
                            <TableCell>{consent.expiresAt}</TableCell>
                            <TableCell>{consent.source}</TableCell>
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
                {mockPurposes.map((purpose) => (
                  <Card key={purpose.id} className="card-3d" data-testid={`purpose-${purpose.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{purpose.name}</CardTitle>
                          <CardDescription className="mt-1">{purpose.description}</CardDescription>
                        </div>
                        <Badge variant="outline">{purpose.legalBasis}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Consent Rate</span>
                          <span className="font-semibold">{purpose.consentRate}%</span>
                        </div>
                        <Progress value={purpose.consentRate} className="h-2" />
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="text-center p-2 bg-muted/50 rounded-lg">
                            <p className="text-lg font-bold">{purpose.totalConsents.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Total</p>
                          </div>
                          <div className="text-center p-2 bg-muted/50 rounded-lg">
                            <p className="text-lg font-bold">{purpose.activeConsents.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Active</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
