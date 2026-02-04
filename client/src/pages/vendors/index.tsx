import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Building2,
  Shield,
  Eye,
  Edit,
  Trash2,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ClipboardList,
  FileText,
  Calendar,
  Mail,
  User,
  X,
  Brain,
  RefreshCw,
  ChevronRight,
  Globe,
  Clock,
  Send,
  ExternalLink,
  Copy,
  Link,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useTenant } from "@/contexts/tenant-context";
import type { Vendor, VendorAssessment, QuestionnaireTemplate } from "@shared/schema";

const ASSESSMENT_TYPES = [
  { id: 'security', name: 'Security Assessment', icon: Shield },
  { id: 'privacy', name: 'Privacy Assessment', icon: Eye },
  { id: 'compliance', name: 'Compliance Assessment', icon: FileCheck },
  { id: 'due_diligence', name: 'Due Diligence', icon: ClipboardList },
];

const VENDOR_CATEGORIES = [
  'Cloud Service Provider',
  'SaaS Application',
  'IT Services',
  'Data Processing',
  'Financial Services',
  'HR & Payroll',
  'Marketing & Analytics',
  'Legal Services',
  'Consulting',
  'Hardware & Equipment',
  'Telecommunications',
  'Facilities & Security',
  'Other',
];

const riskLevelStyles = {
  critical: { bg: "bg-red-600/20", text: "text-red-400", border: "border-red-500/30" },
  high: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
  medium: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
  low: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
};

const statusStyles = {
  active: { bg: "bg-green-500/20", text: "text-green-400" },
  inactive: { bg: "bg-slate-500/20", text: "text-slate-400" },
  under_review: { bg: "bg-orange-500/20", text: "text-orange-400" },
  pending: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
};

const assessmentStatusStyles: Record<string, { bg: string; text: string }> = {
  draft: { bg: "bg-slate-500/20", text: "text-slate-400" },
  sent: { bg: "bg-blue-500/20", text: "text-blue-400" },
  in_progress: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  submitted: { bg: "bg-purple-500/20", text: "text-purple-400" },
  reviewed: { bg: "bg-orange-500/20", text: "text-orange-400" },
  completed: { bg: "bg-green-500/20", text: "text-green-400" },
};

export default function VendorsPage() {
  const { currentTenant, currentTenantId } = useTenant();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  
  const [vendorForm, setVendorForm] = useState({
    name: '',
    category: '',
    contactName: '',
    contactEmail: '',
    riskLevel: 'medium' as 'critical' | 'high' | 'medium' | 'low',
    status: 'active' as 'active' | 'inactive' | 'under_review' | 'pending',
    complianceCertifications: [] as string[],
  });

  const [assessmentForm, setAssessmentForm] = useState({
    assessmentType: 'security',
    questionnaireTemplate: 'SIG-LITE',
    dueDate: '',
  });

  const selectedTenant = currentTenantId || null;

  const { data: vendors = [], isLoading } = useQuery<Vendor[]>({
    queryKey: ['/api/vendors', selectedTenant],
    queryFn: async () => {
      const res = await fetch(`/api/vendors?tenantId=${selectedTenant}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedTenant,
  });

  const { data: assessments = [] } = useQuery<VendorAssessment[]>({
    queryKey: ['/api/vendor-assessments', selectedTenant],
    queryFn: async () => {
      const res = await fetch(`/api/vendor-assessments?tenantId=${selectedTenant}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedTenant,
  });

  const { data: vendorAssessments = [] } = useQuery<VendorAssessment[]>({
    queryKey: ['/api/vendors', selectedVendor?.id, 'assessments'],
    queryFn: async () => {
      const res = await fetch(`/api/vendors/${selectedVendor?.id}/assessments`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedVendor?.id,
  });

  const { data: questionnaireTemplates = [] } = useQuery<QuestionnaireTemplate[]>({
    queryKey: ['/api/questionnaire-templates'],
  });

  const createVendorMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/vendors', { ...data, tenantId: selectedTenant });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Vendor Created", description: "New vendor has been added" });
      queryClient.invalidateQueries({ queryKey: ['/api/vendors', selectedTenant] });
      setVendorDialogOpen(false);
      resetVendorForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const updateVendorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest('PATCH', `/api/vendors/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Vendor Updated", description: "Vendor has been updated" });
      queryClient.invalidateQueries({ queryKey: ['/api/vendors', selectedTenant] });
      setVendorDialogOpen(false);
      setEditingVendor(null);
      resetVendorForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const deleteVendorMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/vendors/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Vendor Deleted", description: "Vendor has been removed" });
      queryClient.invalidateQueries({ queryKey: ['/api/vendors', selectedTenant] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const enrichVendorMutation = useMutation({
    mutationFn: async (data: { name: string; category: string; website?: string }) => {
      const res = await apiRequest('POST', '/api/vendors/enrich', data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.enrichment) {
        const enrichment = data.enrichment;
        setVendorForm(prev => ({
          ...prev,
          riskLevel: enrichment.riskLevel || prev.riskLevel,
          category: enrichment.category || prev.category,
          complianceCertifications: enrichment.complianceCertifications || prev.complianceCertifications,
        }));
        toast({ 
          title: "AI Enrichment Complete", 
          description: enrichment.summary || "Vendor data has been enriched with AI insights"
        });
      }
    },
    onError: (error: any) => {
      toast({ title: "Enrichment Failed", description: error.message, variant: "destructive" });
    }
  });

  const createAssessmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/vendor-assessments', {
        ...data,
        tenantId: selectedTenant,
        vendorId: selectedVendor?.id,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Assessment Created", description: "Assessment request has been created" });
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-assessments', selectedTenant] });
      queryClient.invalidateQueries({ queryKey: ['/api/vendors', selectedVendor?.id, 'assessments'] });
      setAssessmentDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const aiAnalyzeMutation = useMutation({
    mutationFn: async (assessmentId: string) => {
      const res = await apiRequest('POST', `/api/vendor-assessments/${assessmentId}/ai-analyze`, {});
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "AI Analysis Complete", description: "Assessment has been analyzed" });
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-assessments', selectedTenant] });
    }
  });

  const aiEnrichMutation = useMutation({
    mutationFn: async (vendorId: string) => {
      const res = await apiRequest('POST', `/api/ai/vendor-enrich`, { vendorId });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "AI Enrichment Complete", description: "Vendor data has been enriched with AI insights" });
      queryClient.invalidateQueries({ queryKey: ['/api/vendors', selectedTenant] });
    }
  });

  const [portalLinkData, setPortalLinkData] = useState<{ url: string; assessmentId: string } | null>(null);

  const generatePortalLinkMutation = useMutation({
    mutationFn: async (assessmentId: string) => {
      const res = await apiRequest('POST', `/api/vendor-assessments/${assessmentId}/generate-token`);
      return res.json();
    },
    onSuccess: (data, assessmentId) => {
      setPortalLinkData({ url: data.portalUrl, assessmentId });
      toast({ 
        title: "Portal Link Generated",
        description: "Copy the link and share it with the vendor"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/vendors', selectedVendor?.id, 'assessments'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Portal link copied to clipboard" });
  };

  const resetVendorForm = () => {
    setVendorForm({
      name: '',
      category: '',
      contactName: '',
      contactEmail: '',
      riskLevel: 'medium',
      status: 'active',
      complianceCertifications: [],
    });
  };

  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setVendorForm({
      name: vendor.name,
      category: vendor.category || '',
      contactName: vendor.contactName || '',
      contactEmail: vendor.contactEmail || '',
      riskLevel: (vendor.riskLevel || 'medium') as any,
      status: (vendor.status || 'active') as any,
      complianceCertifications: vendor.complianceCertifications || [],
    });
    setVendorDialogOpen(true);
  };

  const handleSubmitVendor = () => {
    if (editingVendor) {
      updateVendorMutation.mutate({ id: editingVendor.id, data: vendorForm });
    } else {
      createVendorMutation.mutate(vendorForm);
    }
  };

  const filteredVendors = vendors.filter((vendor) =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const criticalVendors = vendors.filter((v) => v.riskLevel === "critical").length;
  const highRiskVendors = vendors.filter((v) => v.riskLevel === "high").length;
  const activeVendors = vendors.filter((v) => v.status === "active").length;
  const pendingAssessments = assessments.filter((a) => a.status === "sent" || a.status === "in_progress").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Vendor Risk Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage third-party vendors, assessments, and compliance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              data-testid="button-import-vendors"
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Import
            </Button>
            <Button 
              data-testid="button-add-vendor"
              onClick={() => {
                setEditingVendor(null);
                resetVendorForm();
                setVendorDialogOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Vendor
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Building2 className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{isLoading ? "-" : vendors.length}</p>
                  <p className="text-xs text-muted-foreground">Total Vendors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{isLoading ? "-" : activeVendors}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{isLoading ? "-" : highRiskVendors}</p>
                  <p className="text-xs text-muted-foreground">High Risk</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{isLoading ? "-" : criticalVendors}</p>
                  <p className="text-xs text-muted-foreground">Critical</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <ClipboardList className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{pendingAssessments}</p>
                  <p className="text-xs text-muted-foreground">Pending Assessments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-white">All Vendors</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vendors..."
                    className="pl-9 w-64 bg-slate-800 border-slate-600"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search-vendors"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-400">Vendor</TableHead>
                    <TableHead className="text-slate-400">Category</TableHead>
                    <TableHead className="text-slate-400">Risk Level</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Assessments</TableHead>
                    <TableHead className="text-slate-400">Contact</TableHead>
                    <TableHead className="text-slate-400">Certifications</TableHead>
                    <TableHead className="text-slate-400">AI</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.map((vendor) => {
                    const riskStyle = riskLevelStyles[vendor.riskLevel as keyof typeof riskLevelStyles] || riskLevelStyles.medium;
                    const statusStyle = statusStyles[vendor.status as keyof typeof statusStyles] || statusStyles.active;
                    return (
                      <TableRow
                        key={vendor.id}
                        className="border-slate-700 cursor-pointer hover:bg-slate-800/50"
                        onClick={() => {
                          setSelectedVendor(vendor);
                          setDetailsDialogOpen(true);
                        }}
                        data-testid={`row-vendor-${vendor.id}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 rounded-lg">
                              <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-sm text-white">
                                {vendor.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-white">{vendor.name}</p>
                              <p className="text-xs text-muted-foreground">{vendor.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal text-slate-300 border-slate-600">
                            {vendor.category || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${riskStyle.bg} ${riskStyle.text} ${riskStyle.border} capitalize`}>
                            {vendor.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusStyle.bg} ${statusStyle.text} capitalize`}>
                            {(vendor.status || "active").replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const vendorAssessments = assessments?.filter((a: any) => a.vendorId === vendor.id) || [];
                            const pendingCount = vendorAssessments.filter((a: any) => a.status === 'pending' || a.status === 'in_progress').length;
                            const completedCount = vendorAssessments.filter((a: any) => a.status === 'submitted' || a.status === 'completed').length;
                            if (vendorAssessments.length === 0) {
                              return <span className="text-muted-foreground text-sm">-</span>;
                            }
                            return (
                              <div className="flex items-center gap-2">
                                {pendingCount > 0 && (
                                  <Badge variant="outline" className="text-xs text-amber-400 border-amber-500/30 bg-amber-500/10">
                                    {pendingCount} pending
                                  </Badge>
                                )}
                                {completedCount > 0 && (
                                  <Badge variant="outline" className="text-xs text-green-400 border-green-500/30 bg-green-500/10">
                                    {completedCount} done
                                  </Badge>
                                )}
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm text-white">{vendor.contactName || '-'}</p>
                            <p className="text-xs text-muted-foreground">{vendor.contactEmail || '-'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {vendor.complianceCertifications?.slice(0, 2).map((cert, i) => (
                              <Badge key={i} variant="outline" className="text-xs text-slate-300 border-slate-600">
                                {cert}
                              </Badge>
                            ))}
                            {(vendor.complianceCertifications?.length || 0) > 2 && (
                              <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
                                +{vendor.complianceCertifications!.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {vendor.aiEnrichedData ? (
                            <Sparkles className="h-4 w-4 text-purple-400" />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setSelectedVendor(vendor);
                                setDetailsDialogOpen(true);
                              }}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleEditVendor(vendor);
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setSelectedVendor(vendor);
                                setAssessmentDialogOpen(true);
                              }}>
                                <FileCheck className="h-4 w-4 mr-2" />
                                Request Assessment
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                const vendorAssessmentsList = assessments?.filter((a: any) => a.vendorId === vendor.id) || [];
                                if (vendorAssessmentsList.length > 0) {
                                  const latestAssessment = vendorAssessmentsList[0];
                                  generatePortalLinkMutation.mutate(latestAssessment.id);
                                } else {
                                  setSelectedVendor(vendor);
                                  setAssessmentDialogOpen(true);
                                }
                              }}>
                                <Send className="h-4 w-4 mr-2" />
                                Send Portal Link
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                aiEnrichMutation.mutate(vendor.id);
                              }}>
                                <Sparkles className="h-4 w-4 mr-2" />
                                AI Enrich Data
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-slate-700" />
                              <DropdownMenuItem 
                                className="text-red-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteVendorMutation.mutate(vendor.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredVendors.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                        <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No vendors found</p>
                        <Button 
                          variant="ghost" 
                          className="mt-2 text-purple-400"
                          onClick={() => setVendorDialogOpen(true)}
                        >
                          Add your first vendor
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={vendorDialogOpen} onOpenChange={setVendorDialogOpen}>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
              </DialogTitle>
              <DialogDescription>
                {editingVendor ? 'Update vendor information' : 'Add a new third-party vendor to your registry'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {!editingVendor && (
                <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                          <Sparkles className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">AI Enrichment</p>
                          <p className="text-xs text-muted-foreground">Auto-populate vendor data using AI</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => enrichVendorMutation.mutate({ 
                          name: vendorForm.name, 
                          category: vendorForm.category 
                        })}
                        disabled={!vendorForm.name || enrichVendorMutation.isPending}
                        className="gap-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                        data-testid="button-enrich-vendor"
                      >
                        {enrichVendorMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Brain className="h-4 w-4" />
                        )}
                        {enrichVendorMutation.isPending ? 'Enriching...' : 'Enrich with AI'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Vendor Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter vendor name"
                    className="bg-slate-800 border-slate-600"
                    value={vendorForm.name}
                    onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                    data-testid="input-vendor-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-white">Category</Label>
                  <Select 
                    value={vendorForm.category} 
                    onValueChange={(v) => setVendorForm({ ...vendorForm, category: v })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600" data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {VENDOR_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName" className="text-white">Contact Name</Label>
                  <Input
                    id="contactName"
                    placeholder="Primary contact"
                    className="bg-slate-800 border-slate-600"
                    value={vendorForm.contactName}
                    onChange={(e) => setVendorForm({ ...vendorForm, contactName: e.target.value })}
                    data-testid="input-contact-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="text-white">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="contact@vendor.com"
                    className="bg-slate-800 border-slate-600"
                    value={vendorForm.contactEmail}
                    onChange={(e) => setVendorForm({ ...vendorForm, contactEmail: e.target.value })}
                    data-testid="input-contact-email"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Risk Level</Label>
                  <Select 
                    value={vendorForm.riskLevel} 
                    onValueChange={(v) => setVendorForm({ ...vendorForm, riskLevel: v as any })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600" data-testid="select-risk-level">
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
                <div className="space-y-2">
                  <Label className="text-white">Status</Label>
                  <Select 
                    value={vendorForm.status} 
                    onValueChange={(v) => setVendorForm({ ...vendorForm, status: v as any })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600" data-testid="select-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setVendorDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitVendor}
                disabled={!vendorForm.name || createVendorMutation.isPending || updateVendorMutation.isPending}
                data-testid="button-save-vendor"
              >
                {(createVendorMutation.isPending || updateVendorMutation.isPending) && (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingVendor ? 'Update Vendor' : 'Create Vendor'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={assessmentDialogOpen} onOpenChange={setAssessmentDialogOpen}>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Request Vendor Assessment</DialogTitle>
              <DialogDescription>
                Send a security assessment questionnaire to {selectedVendor?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-white">Assessment Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ASSESSMENT_TYPES.map((type) => (
                    <Card
                      key={type.id}
                      className={`cursor-pointer transition-all ${
                        assessmentForm.assessmentType === type.id
                          ? 'bg-purple-500/20 border-purple-500'
                          : 'bg-slate-800 border-slate-600 hover:border-slate-500'
                      }`}
                      onClick={() => setAssessmentForm({ ...assessmentForm, assessmentType: type.id })}
                    >
                      <CardContent className="p-3 flex items-center gap-2">
                        <type.icon className={`h-4 w-4 ${
                          assessmentForm.assessmentType === type.id ? 'text-purple-400' : 'text-slate-400'
                        }`} />
                        <span className="text-sm text-white">{type.name}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Questionnaire Template</Label>
                <Select 
                  value={assessmentForm.questionnaireTemplate} 
                  onValueChange={(v) => setAssessmentForm({ ...assessmentForm, questionnaireTemplate: v })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600" data-testid="select-template">
                    <SelectValue placeholder="Select questionnaire template" />
                  </SelectTrigger>
                  <SelectContent>
                    {questionnaireTemplates.filter(t => t.isActive && (t.category === 'vendor_risk' || t.category === 'security')).map((template) => (
                      <SelectItem key={template.id} value={template.shortName}>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-muted-foreground">{template.totalQuestions} questions - {template.estimatedTime}min</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-white">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  className="bg-slate-800 border-slate-600"
                  value={assessmentForm.dueDate}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, dueDate: e.target.value })}
                  data-testid="input-due-date"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssessmentDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => createAssessmentMutation.mutate(assessmentForm)}
                disabled={createAssessmentMutation.isPending}
                className="gap-2"
                data-testid="button-send-assessment"
              >
                {createAssessmentMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Assessment Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-lg text-white">
                    {selectedVendor?.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-white text-xl">{selectedVendor?.name}</DialogTitle>
                  <DialogDescription className="flex items-center gap-2">
                    {selectedVendor?.category && (
                      <Badge variant="outline" className="text-slate-300 border-slate-600">
                        {selectedVendor.category}
                      </Badge>
                    )}
                    {selectedVendor?.riskLevel && (
                      <Badge className={`${riskLevelStyles[selectedVendor.riskLevel as keyof typeof riskLevelStyles]?.bg} ${riskLevelStyles[selectedVendor.riskLevel as keyof typeof riskLevelStyles]?.text} capitalize`}>
                        {selectedVendor.riskLevel} Risk
                      </Badge>
                    )}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="bg-slate-800">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="assessments">Assessments</TabsTrigger>
                <TabsTrigger value="contracts">Contracts</TabsTrigger>
                <TabsTrigger value="ai">AI Insights</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-white">{selectedVendor?.contactName || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-white">{selectedVendor?.contactEmail || 'Not specified'}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">Compliance Certifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedVendor?.complianceCertifications?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedVendor.complianceCertifications.map((cert, i) => (
                            <Badge key={i} variant="outline" className="text-green-400 border-green-500/30">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No certifications recorded</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="assessments" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-medium">Assessment History</h3>
                  <Button 
                    size="sm" 
                    onClick={() => setAssessmentDialogOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    New Assessment
                  </Button>
                </div>
                {vendorAssessments.length === 0 ? (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="py-8 text-center">
                      <ClipboardList className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                      <p className="text-muted-foreground">No assessments yet</p>
                      <Button 
                        variant="ghost" 
                        className="mt-2 text-purple-400"
                        onClick={() => setAssessmentDialogOpen(true)}
                      >
                        Request first assessment
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {vendorAssessments.map((assessment) => (
                      <Card key={assessment.id} className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                assessment.assessmentType === 'security' ? 'bg-blue-500/20' :
                                assessment.assessmentType === 'privacy' ? 'bg-purple-500/20' :
                                'bg-green-500/20'
                              }`}>
                                {assessment.assessmentType === 'security' ? <Shield className="h-4 w-4 text-blue-400" /> :
                                 assessment.assessmentType === 'privacy' ? <Eye className="h-4 w-4 text-purple-400" /> :
                                 <FileCheck className="h-4 w-4 text-green-400" />}
                              </div>
                              <div>
                                <p className="font-medium text-white capitalize">{assessment.assessmentType} Assessment</p>
                                <p className="text-xs text-muted-foreground">
                                  {assessment.questionnaireTemplate?.toUpperCase()} - Created {new Date(assessment.createdAt!).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {assessment.overallScore !== null && (
                                <Badge className="bg-blue-500/20 text-blue-400">
                                  Score: {assessment.overallScore}
                                </Badge>
                              )}
                              <Badge className={`${assessmentStatusStyles[assessment.status || 'draft']?.bg} ${assessmentStatusStyles[assessment.status || 'draft']?.text} capitalize`}>
                                {assessment.status}
                              </Badge>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="gap-1 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                                onClick={() => generatePortalLinkMutation.mutate(assessment.id)}
                                disabled={generatePortalLinkMutation.isPending}
                                data-testid={`button-send-portal-${assessment.id}`}
                              >
                                <ExternalLink className="h-3 w-3" />
                                Send to Vendor
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => aiAnalyzeMutation.mutate(assessment.id)}
                                disabled={aiAnalyzeMutation.isPending}
                              >
                                <Brain className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {assessment.aiAnalysis && (
                            <div className="mt-3 p-3 bg-slate-900/50 rounded-lg">
                              <p className="text-sm text-slate-300 whitespace-pre-wrap">{assessment.aiAnalysis.substring(0, 300)}...</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="contracts" className="mt-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="py-8 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                    <p className="text-muted-foreground">No contracts recorded</p>
                    <Button variant="ghost" className="mt-2 text-purple-400">
                      Add contract
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="ai" className="mt-4">
                {selectedVendor?.aiEnrichedData ? (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-400" />
                        AI-Enriched Vendor Data
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm text-slate-300 whitespace-pre-wrap">
                        {JSON.stringify(selectedVendor.aiEnrichedData, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="py-8 text-center">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                      <p className="text-muted-foreground">No AI insights available</p>
                      <Button 
                        variant="ghost" 
                        className="mt-2 text-purple-400"
                        onClick={() => aiEnrichMutation.mutate(selectedVendor!.id)}
                        disabled={aiEnrichMutation.isPending}
                      >
                        {aiEnrichMutation.isPending ? 'Enriching...' : 'Generate AI insights'}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        <Dialog open={!!portalLinkData} onOpenChange={() => setPortalLinkData(null)}>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Link className="h-5 w-5 text-blue-400" />
                Vendor Portal Link Generated
              </DialogTitle>
              <DialogDescription>
                Share this link with the vendor so they can complete the assessment questionnaire.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <Input
                  value={portalLinkData?.url || ''}
                  readOnly
                  className="bg-slate-800 border-slate-600 text-white"
                  data-testid="input-portal-link"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(portalLinkData?.url || '')}
                  className="shrink-0"
                  data-testid="button-copy-portal-link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20">
                      <Clock className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">Link valid for 30 days</p>
                      <p className="text-xs text-muted-foreground">
                        The vendor can access the assessment form until the link expires.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ExternalLink className="h-4 w-4" />
                <span>Vendor can save progress and submit when ready</span>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setPortalLinkData(null)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  copyToClipboard(portalLinkData?.url || '');
                  setPortalLinkData(null);
                }}
                className="gap-2"
                data-testid="button-copy-close"
              >
                <Copy className="h-4 w-4" />
                Copy & Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
