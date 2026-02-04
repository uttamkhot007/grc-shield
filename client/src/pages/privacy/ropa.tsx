import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTenant } from "@/contexts/tenant-context";
import { FeatureGate } from "@/components/FeatureGate";
import { LICENSE_MODULES } from "@/contexts/LicenseContext";
import type { RopaEntry, Tenant } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  FileText,
  Building2,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Globe,
  Database,
  Lock,
  Calendar,
  Download,
  Filter,
  Eye,
  RefreshCw,
} from "lucide-react";

const lawfulBasisOptions = [
  { value: "consent", label: "Consent", description: "Data subject has given consent" },
  { value: "contract", label: "Contract", description: "Necessary for contract performance" },
  { value: "legal_obligation", label: "Legal Obligation", description: "Required by law" },
  { value: "vital_interests", label: "Vital Interests", description: "Protect vital interests" },
  { value: "public_task", label: "Public Task", description: "Public interest or official authority" },
  { value: "legitimate_interests", label: "Legitimate Interests", description: "Controller's legitimate interests" },
];

const riskLevelColors = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-green-500/20 text-green-400 border-green-500/30",
};

const statusColors = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  inactive: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  draft: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export default function RopaRegistry() {
  const { toast } = useToast();
  const { currentTenantId } = useTenant();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLawfulBasis, setFilterLawfulBasis] = useState<string>("all");
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<RopaEntry | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: ropaEntries = [], isLoading } = useQuery<RopaEntry[]>({
    queryKey: ["/api/ropa", currentTenantId],
    queryFn: async () => {
      const url = currentTenantId ? `/api/ropa?tenantId=${currentTenantId}` : "/api/ropa";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch ROPA entries");
      return res.json();
    },
  });

  const { data: tenants = [] } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      return apiRequest("POST", "/api/ropa", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ropa"] });
      setIsCreateDialogOpen(false);
      toast({ title: "ROPA entry created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create ROPA entry", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      return apiRequest("PATCH", `/api/ropa/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ropa"] });
      setIsEditDialogOpen(false);
      setSelectedEntry(null);
      toast({ title: "ROPA entry updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update ROPA entry", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/ropa/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ropa"] });
      toast({ title: "ROPA entry deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete ROPA entry", variant: "destructive" });
    },
  });

  const filteredEntries = ropaEntries.filter((entry) => {
    const matchesSearch =
      entry.processingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.processingPurpose.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLawfulBasis = filterLawfulBasis === "all" || entry.lawfulBasis === filterLawfulBasis;
    const matchesRiskLevel = filterRiskLevel === "all" || entry.riskLevel === filterRiskLevel;
    return matchesSearch && matchesLawfulBasis && matchesRiskLevel;
  });

  const getTenantName = (tenantId: string | null) => {
    if (!tenantId) return "Unknown";
    const tenant = tenants.find((t) => t.id === tenantId);
    return tenant?.name || "Unknown";
  };

  const stats = {
    total: ropaEntries.length,
    active: ropaEntries.filter((e) => e.status === "active").length,
    highRisk: ropaEntries.filter((e) => e.riskLevel === "high" || e.riskLevel === "critical").length,
    pendingReview: ropaEntries.filter((e) => {
      if (!e.nextReviewDate) return false;
      return new Date(e.nextReviewDate) <= new Date();
    }).length,
  };

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      tenantId: currentTenantId || (formData.get("tenantId") as string),
      processingName: formData.get("processingName") as string,
      processingPurpose: formData.get("processingPurpose") as string,
      lawfulBasis: formData.get("lawfulBasis") as string,
      dataCategories: (formData.get("dataCategories") as string)?.split(",").map((s) => s.trim()).filter(Boolean),
      dataSubjects: (formData.get("dataSubjects") as string)?.split(",").map((s) => s.trim()).filter(Boolean),
      recipients: (formData.get("recipients") as string)?.split(",").map((s) => s.trim()).filter(Boolean),
      retentionPeriod: formData.get("retentionPeriod") as string,
      securityMeasures: formData.get("securityMeasures") as string,
      dataController: formData.get("dataController") as string,
      dataControllerContact: formData.get("dataControllerContact") as string,
      dpoContact: formData.get("dpoContact") as string,
      riskLevel: formData.get("riskLevel") as string || "low",
      status: "active",
    };
    createMutation.mutate(data);
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEntry) return;
    const formData = new FormData(e.currentTarget);
    const data = {
      processingName: formData.get("processingName") as string,
      processingPurpose: formData.get("processingPurpose") as string,
      lawfulBasis: formData.get("lawfulBasis") as string,
      dataCategories: (formData.get("dataCategories") as string)?.split(",").map((s) => s.trim()).filter(Boolean),
      dataSubjects: (formData.get("dataSubjects") as string)?.split(",").map((s) => s.trim()).filter(Boolean),
      recipients: (formData.get("recipients") as string)?.split(",").map((s) => s.trim()).filter(Boolean),
      retentionPeriod: formData.get("retentionPeriod") as string,
      securityMeasures: formData.get("securityMeasures") as string,
      dataController: formData.get("dataController") as string,
      dataControllerContact: formData.get("dataControllerContact") as string,
      dpoContact: formData.get("dpoContact") as string,
      riskLevel: formData.get("riskLevel") as string,
      status: formData.get("status") as string,
    };
    updateMutation.mutate({ id: selectedEntry.id, data });
  };

  const openDetailSheet = (entry: RopaEntry) => {
    setSelectedEntry(entry);
    setIsDetailSheetOpen(true);
  };

  const openEditDialog = (entry: RopaEntry) => {
    setSelectedEntry(entry);
    setIsEditDialogOpen(true);
  };

  return (
    <FeatureGate module={LICENSE_MODULES.PRIVACY_ROPA}>
      <div className="flex-1 overflow-auto p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">ROPA Registry</h1>
          <p className="text-muted-foreground mt-1">
            Record of Processing Activities (GDPR Article 30)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" data-testid="button-export-ropa">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-create-ropa">
                <Plus className="h-4 w-4" />
                Add Processing Activity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Processing Activity</DialogTitle>
                <DialogDescription>
                  Document a new data processing activity as required by GDPR Article 30.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {!currentTenantId && (
                    <div className="col-span-2">
                      <Label htmlFor="tenantId">Organization</Label>
                      <Select name="tenantId" required>
                        <SelectTrigger data-testid="select-tenant">
                          <SelectValue placeholder="Select organization" />
                        </SelectTrigger>
                        <SelectContent>
                          {tenants.map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id}>
                              {tenant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="col-span-2">
                    <Label htmlFor="processingName">Processing Activity Name *</Label>
                    <Input
                      id="processingName"
                      name="processingName"
                      placeholder="e.g., Customer Data Processing"
                      required
                      data-testid="input-processing-name"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="processingPurpose">Purpose of Processing *</Label>
                    <Textarea
                      id="processingPurpose"
                      name="processingPurpose"
                      placeholder="Describe why this data is processed"
                      required
                      data-testid="input-processing-purpose"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lawfulBasis">Lawful Basis *</Label>
                    <Select name="lawfulBasis" required>
                      <SelectTrigger data-testid="select-lawful-basis">
                        <SelectValue placeholder="Select lawful basis" />
                      </SelectTrigger>
                      <SelectContent>
                        {lawfulBasisOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="riskLevel">Risk Level</Label>
                    <Select name="riskLevel" defaultValue="low">
                      <SelectTrigger data-testid="select-risk-level">
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="dataCategories">Data Categories (comma-separated)</Label>
                    <Input
                      id="dataCategories"
                      name="dataCategories"
                      placeholder="e.g., Name, Email, Phone, Address"
                      data-testid="input-data-categories"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="dataSubjects">Data Subjects (comma-separated)</Label>
                    <Input
                      id="dataSubjects"
                      name="dataSubjects"
                      placeholder="e.g., Customers, Employees, Vendors"
                      data-testid="input-data-subjects"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="recipients">Recipients (comma-separated)</Label>
                    <Input
                      id="recipients"
                      name="recipients"
                      placeholder="e.g., Marketing Team, HR, External Processor"
                      data-testid="input-recipients"
                    />
                  </div>
                  <div>
                    <Label htmlFor="retentionPeriod">Retention Period</Label>
                    <Input
                      id="retentionPeriod"
                      name="retentionPeriod"
                      placeholder="e.g., 7 years"
                      data-testid="input-retention-period"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dataController">Data Controller</Label>
                    <Input
                      id="dataController"
                      name="dataController"
                      placeholder="Organization name"
                      data-testid="input-data-controller"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dataControllerContact">Controller Contact</Label>
                    <Input
                      id="dataControllerContact"
                      name="dataControllerContact"
                      placeholder="contact@example.com"
                      data-testid="input-controller-contact"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dpoContact">DPO Contact</Label>
                    <Input
                      id="dpoContact"
                      name="dpoContact"
                      placeholder="dpo@example.com"
                      data-testid="input-dpo-contact"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="securityMeasures">Security Measures</Label>
                    <Textarea
                      id="securityMeasures"
                      name="securityMeasures"
                      placeholder="Describe technical and organizational security measures"
                      data-testid="input-security-measures"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-ropa">
                    {createMutation.isPending ? "Creating..." : "Create Entry"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-3d stat-gradient-blue">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Activities</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Database className="h-8 w-8 text-blue-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-3d stat-gradient-green">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-3d stat-gradient-amber">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold">{stats.highRisk}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-3d stat-gradient-purple">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pendingReview}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-400/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-3d">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg">Processing Activities</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                  data-testid="input-search-ropa"
                />
              </div>
              <Select value={filterLawfulBasis} onValueChange={setFilterLawfulBasis}>
                <SelectTrigger className="w-40" data-testid="filter-lawful-basis">
                  <SelectValue placeholder="Lawful Basis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bases</SelectItem>
                  {lawfulBasisOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterRiskLevel} onValueChange={setFilterRiskLevel}>
                <SelectTrigger className="w-32" data-testid="filter-risk-level">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risks</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No processing activities found</p>
              <p className="text-sm">Add your first ROPA entry to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Processing Activity</TableHead>
                  {!currentTenantId && <TableHead>Organization</TableHead>}
                  <TableHead>Lawful Basis</TableHead>
                  <TableHead>Data Subjects</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className="cursor-pointer hover-elevate"
                    onClick={() => openDetailSheet(entry)}
                    data-testid={`ropa-row-${entry.id}`}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{entry.processingName}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {entry.processingPurpose}
                        </p>
                      </div>
                    </TableCell>
                    {!currentTenantId && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{getTenantName(entry.tenantId)}</span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {entry.lawfulBasis?.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {entry.dataSubjects?.slice(0, 2).map((subject, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                        {(entry.dataSubjects?.length || 0) > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(entry.dataSubjects?.length || 0) - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={riskLevelColors[entry.riskLevel as keyof typeof riskLevelColors] || riskLevelColors.low}>
                        {entry.riskLevel || "low"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[entry.status as keyof typeof statusColors] || statusColors.active}>
                        {entry.status || "active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" data-testid={`ropa-actions-${entry.id}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openDetailSheet(entry); }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(entry); }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(entry.id); }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedEntry && (
            <>
              <SheetHeader>
                <SheetTitle className="text-xl">{selectedEntry.processingName}</SheetTitle>
                <SheetDescription>
                  Processing Activity Details
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <Tabs defaultValue="overview">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="data">Data Details</TabsTrigger>
                    <TabsTrigger value="compliance">Compliance</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4 mt-4">
                    <div className="flex gap-2">
                      <Badge className={riskLevelColors[selectedEntry.riskLevel as keyof typeof riskLevelColors] || riskLevelColors.low}>
                        {selectedEntry.riskLevel || "Low"} Risk
                      </Badge>
                      <Badge className={statusColors[selectedEntry.status as keyof typeof statusColors] || statusColors.active}>
                        {selectedEntry.status || "Active"}
                      </Badge>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">Purpose of Processing</Label>
                      <p className="mt-1">{selectedEntry.processingPurpose}</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Lawful Basis</Label>
                        <p className="mt-1 capitalize">{selectedEntry.lawfulBasis?.replace("_", " ")}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Retention Period</Label>
                        <p className="mt-1">{selectedEntry.retentionPeriod || "Not specified"}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">Security Measures</Label>
                      <p className="mt-1">{selectedEntry.securityMeasures || "Not specified"}</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="data" className="space-y-4 mt-4">
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">Data Categories</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedEntry.dataCategories?.map((cat, i) => (
                          <Badge key={i} variant="secondary">{cat}</Badge>
                        )) || <p className="text-muted-foreground">No categories specified</p>}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">Data Subjects</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedEntry.dataSubjects?.map((subject, i) => (
                          <Badge key={i} variant="outline">{subject}</Badge>
                        )) || <p className="text-muted-foreground">No subjects specified</p>}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">Recipients</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedEntry.recipients?.map((recipient, i) => (
                          <Badge key={i} variant="secondary">{recipient}</Badge>
                        )) || <p className="text-muted-foreground">No recipients specified</p>}
                      </div>
                    </div>
                    
                    {selectedEntry.thirdCountryTransfers && selectedEntry.thirdCountryTransfers.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Third Country Transfers
                          </Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedEntry.thirdCountryTransfers.map((country, i) => (
                              <Badge key={i} variant="outline">{country}</Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="compliance" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Data Controller</Label>
                        <p className="mt-1">{selectedEntry.dataController || "Not specified"}</p>
                        {selectedEntry.dataControllerContact && (
                          <p className="text-sm text-muted-foreground">{selectedEntry.dataControllerContact}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Data Processor</Label>
                        <p className="mt-1">{selectedEntry.dataProcessor || "Not specified"}</p>
                        {selectedEntry.dataProcessorContact && (
                          <p className="text-sm text-muted-foreground">{selectedEntry.dataProcessorContact}</p>
                        )}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">DPO Contact</Label>
                      <p className="mt-1">{selectedEntry.dpoContact || "Not specified"}</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Last Review</Label>
                        <p className="mt-1">
                          {selectedEntry.lastReviewDate 
                            ? new Date(selectedEntry.lastReviewDate).toLocaleDateString()
                            : "Not reviewed"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Next Review</Label>
                        <p className="mt-1">
                          {selectedEntry.nextReviewDate 
                            ? new Date(selectedEntry.nextReviewDate).toLocaleDateString()
                            : "Not scheduled"}
                        </p>
                      </div>
                    </div>
                    
                    {selectedEntry.safeguards && (
                      <>
                        <Separator />
                        <div>
                          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Safeguards</Label>
                          <p className="mt-1">{selectedEntry.safeguards}</p>
                        </div>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
                
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => openEditDialog(selectedEntry)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Processing Activity</DialogTitle>
            <DialogDescription>
              Update the details of this processing activity.
            </DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="edit-processingName">Processing Activity Name *</Label>
                  <Input
                    id="edit-processingName"
                    name="processingName"
                    defaultValue={selectedEntry.processingName}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-processingPurpose">Purpose of Processing *</Label>
                  <Textarea
                    id="edit-processingPurpose"
                    name="processingPurpose"
                    defaultValue={selectedEntry.processingPurpose}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-lawfulBasis">Lawful Basis *</Label>
                  <Select name="lawfulBasis" defaultValue={selectedEntry.lawfulBasis}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {lawfulBasisOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-riskLevel">Risk Level</Label>
                  <Select name="riskLevel" defaultValue={selectedEntry.riskLevel || "low"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select name="status" defaultValue={selectedEntry.status || "active"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-retentionPeriod">Retention Period</Label>
                  <Input
                    id="edit-retentionPeriod"
                    name="retentionPeriod"
                    defaultValue={selectedEntry.retentionPeriod || ""}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-dataCategories">Data Categories (comma-separated)</Label>
                  <Input
                    id="edit-dataCategories"
                    name="dataCategories"
                    defaultValue={selectedEntry.dataCategories?.join(", ") || ""}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-dataSubjects">Data Subjects (comma-separated)</Label>
                  <Input
                    id="edit-dataSubjects"
                    name="dataSubjects"
                    defaultValue={selectedEntry.dataSubjects?.join(", ") || ""}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-recipients">Recipients (comma-separated)</Label>
                  <Input
                    id="edit-recipients"
                    name="recipients"
                    defaultValue={selectedEntry.recipients?.join(", ") || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-dataController">Data Controller</Label>
                  <Input
                    id="edit-dataController"
                    name="dataController"
                    defaultValue={selectedEntry.dataController || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-dataControllerContact">Controller Contact</Label>
                  <Input
                    id="edit-dataControllerContact"
                    name="dataControllerContact"
                    defaultValue={selectedEntry.dataControllerContact || ""}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-dpoContact">DPO Contact</Label>
                  <Input
                    id="edit-dpoContact"
                    name="dpoContact"
                    defaultValue={selectedEntry.dpoContact || ""}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-securityMeasures">Security Measures</Label>
                  <Textarea
                    id="edit-securityMeasures"
                    name="securityMeasures"
                    defaultValue={selectedEntry.securityMeasures || ""}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </FeatureGate>
  );
}
