import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import jsPDF from "jspdf";
import {
  FileText,
  Download,
  Filter,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileBarChart,
  Shield,
  AlertTriangle,
  ClipboardCheck,
  Lock,
  Briefcase,
  Globe,
  Users,
  Building2,
  Loader2,
  FileDown,
  Calendar,
  Play,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTenant } from "@/contexts/tenant-context";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ReportViewer } from "@/components/report-viewer";
import type { ReportTemplate, GeneratedReport } from "@shared/schema";

const categoryIcons: Record<string, React.ElementType> = {
  compliance: Shield,
  risk: AlertTriangle,
  audit: ClipboardCheck,
  privacy: Lock,
  executive: Briefcase,
  regulatory: Globe,
  operational: FileBarChart,
};

const categoryColors: Record<string, string> = {
  compliance: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  risk: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  audit: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  privacy: "bg-green-500/10 text-green-500 border-green-500/20",
  executive: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  regulatory: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  operational: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500",
  in_progress: "bg-blue-500/10 text-blue-500",
  completed: "bg-green-500/10 text-green-500",
  draft: "bg-gray-500/10 text-gray-500",
};

export default function ReportsPage() {
  const { currentTenantId, currentTenant } = useTenant();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [viewingReport, setViewingReport] = useState<GeneratedReport | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { data: templates = [], isLoading: templatesLoading } = useQuery<ReportTemplate[]>({
    queryKey: ["/api/report-templates"],
  });

  const { data: generatedReports = [], isLoading: reportsLoading, refetch: refetchReports } = useQuery<GeneratedReport[]>({
    queryKey: ["/api/generated-reports", currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return [];
      const res = await fetch(`/api/generated-reports?tenantId=${currentTenantId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch reports");
      return res.json();
    },
    enabled: !!currentTenantId,
    refetchInterval: (query) => {
      const data = query.state.data as GeneratedReport[] | undefined;
      const hasInProgress = data?.some(r => r.status === "in_progress" || r.status === "pending");
      return hasInProgress ? 3000 : false;
    },
  });

  const handleViewReport = (report: GeneratedReport) => {
    setViewingReport(report);
    setViewDialogOpen(true);
  };

  const handleDownloadPdf = (report: GeneratedReport) => {
    const doc = new jsPDF();
    const data = report.data as any;
    
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(33, 37, 41);
    doc.text(report.name, margin, yPos);
    yPos += 12;
    
    // Generated date
    doc.setFontSize(10);
    doc.setTextColor(108, 117, 125);
    doc.text(`Generated: ${new Date(report.createdAt || "").toLocaleString()}`, margin, yPos);
    doc.text(`Tenant: ${currentTenant?.name || "Organization"}`, margin + 80, yPos);
    yPos += 15;
    
    // Executive Summary
    if (data?.executiveSummary) {
      doc.setFontSize(14);
      doc.setTextColor(33, 37, 41);
      doc.text("Executive Summary", margin, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(73, 80, 87);
      const summaryLines = doc.splitTextToSize(data.executiveSummary, contentWidth);
      doc.text(summaryLines, margin, yPos);
      yPos += summaryLines.length * 5 + 10;
    }
    
    // Statistics
    if (data?.statistics) {
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setTextColor(33, 37, 41);
      doc.text("Key Metrics", margin, yPos);
      yPos += 10;
      doc.setFontSize(10);
      doc.setTextColor(73, 80, 87);
      
      const stats = data.statistics;
      const statLines = [
        `Compliance Score: ${stats.complianceScore || 0}%`,
        `Controls Implemented: ${stats.controlsImplemented || 0} / ${stats.totalControls || 0}`,
        `Risks Identified: ${stats.risksIdentified || 0} (Critical: ${stats.criticalRisks || 0}, High: ${stats.highRisks || 0})`,
        `Active Policies: ${stats.policiesActive || 0}`,
        `Completed Audits: ${stats.auditsCompleted || 0}`,
      ];
      statLines.forEach(line => {
        doc.text(line, margin, yPos);
        yPos += 6;
      });
      yPos += 8;
    }
    
    // Key Findings
    if (data?.keyFindings && data.keyFindings.length > 0) {
      if (yPos > 220) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setTextColor(33, 37, 41);
      doc.text("Key Findings", margin, yPos);
      yPos += 10;
      
      data.keyFindings.forEach((finding: any, idx: number) => {
        if (yPos > 260) { doc.addPage(); yPos = 20; }
        doc.setFontSize(11);
        doc.setTextColor(33, 37, 41);
        doc.text(`${idx + 1}. ${finding.title} [${finding.severity?.toUpperCase()}]`, margin, yPos);
        yPos += 6;
        doc.setFontSize(9);
        doc.setTextColor(73, 80, 87);
        const findingLines = doc.splitTextToSize(finding.description || "", contentWidth - 5);
        doc.text(findingLines, margin + 5, yPos);
        yPos += findingLines.length * 4 + 6;
      });
      yPos += 5;
    }
    
    // Recommendations
    if (data?.recommendations && data.recommendations.length > 0) {
      if (yPos > 220) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setTextColor(33, 37, 41);
      doc.text("Recommendations", margin, yPos);
      yPos += 10;
      
      data.recommendations.forEach((rec: any, idx: number) => {
        if (yPos > 260) { doc.addPage(); yPos = 20; }
        doc.setFontSize(11);
        doc.setTextColor(33, 37, 41);
        doc.text(`${idx + 1}. ${rec.title} [${rec.priority?.toUpperCase()}]`, margin, yPos);
        yPos += 6;
        doc.setFontSize(9);
        doc.setTextColor(73, 80, 87);
        const recLines = doc.splitTextToSize(rec.description || "", contentWidth - 5);
        doc.text(recLines, margin + 5, yPos);
        yPos += recLines.length * 4 + 6;
      });
    }
    
    // Detailed Analysis
    if (data?.detailedAnalysis) {
      if (yPos > 180) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setTextColor(33, 37, 41);
      doc.text("Detailed Analysis", margin, yPos);
      yPos += 10;
      
      const analysis = data.detailedAnalysis;
      const sections = [
        { title: "Compliance Status", content: analysis.complianceStatus },
        { title: "Risk Landscape", content: analysis.riskLandscape },
        { title: "Control Effectiveness", content: analysis.controlEffectiveness },
        { title: "Audit Findings", content: analysis.auditFindings },
      ];
      
      sections.forEach(section => {
        if (section.content) {
          if (yPos > 250) { doc.addPage(); yPos = 20; }
          doc.setFontSize(11);
          doc.setTextColor(33, 37, 41);
          doc.text(section.title, margin, yPos);
          yPos += 6;
          doc.setFontSize(9);
          doc.setTextColor(73, 80, 87);
          const lines = doc.splitTextToSize(section.content, contentWidth);
          doc.text(lines, margin, yPos);
          yPos += lines.length * 4 + 8;
        }
      });
    }
    
    // Footer on last page
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated by GRC Shield - Page ${doc.getNumberOfPages()}`, margin, 285);
    
    // Download
    const filename = `${report.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    
    toast({
      title: "Report Downloaded",
      description: `${filename} has been saved to your downloads.`,
    });
  };

  const generateReportMutation = useMutation({
    mutationFn: async (templateId: string) => {
      if (!currentTenantId) throw new Error("No tenant selected");
      const response = await apiRequest("POST", "/api/generated-reports", {
        tenantId: currentTenantId,
        templateId,
        name: `${selectedTemplate?.name} - ${new Date().toLocaleDateString()}`,
        format: "pdf",
        status: "pending",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/generated-reports", currentTenantId] });
      toast({
        title: "Report Generation Started",
        description: "Your report is being generated and will be available shortly.",
      });
      setGenerateDialogOpen(false);
      setSelectedTemplate(null);
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesRegion = selectedRegion === "all" || template.region === selectedRegion || !template.region;
    return matchesSearch && matchesCategory && matchesRegion;
  });

  const templatesByCategory = filteredTemplates.reduce((acc, template) => {
    const category = template.category || "operational";
    if (!acc[category]) acc[category] = [];
    acc[category].push(template);
    return acc;
  }, {} as Record<string, ReportTemplate[]>);

  const handleGenerateReport = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setGenerateDialogOpen(true);
  };

  const confirmGenerate = () => {
    if (selectedTemplate) {
      generateReportMutation.mutate(selectedTemplate.id);
    }
  };

  const categories = ["all", "executive", "compliance", "risk", "audit", "privacy", "regulatory", "operational"];
  const regions = ["all", "Global", "US", "EU", "Gulf", "India", "SEA", "Africa"];

  if (templatesLoading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="mesh-gradient min-h-full p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="mesh-gradient min-h-full">
        <div className="p-6 pb-12 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Reports Center</h1>
              <p className="text-muted-foreground mt-1">
                {currentTenant
                  ? `Generate compliance and governance reports for ${currentTenant.name}`
                  : "Generate comprehensive GRC reports across all organizations"}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64 bg-card"
                  data-testid="input-search-reports"
                />
              </div>
            </div>
          </div>

          <Tabs defaultValue="templates" className="space-y-6">
            <TabsList className="bg-card">
              <TabsTrigger value="templates" data-testid="tab-templates">
                <FileText className="h-4 w-4 mr-2" />
                Report Templates
              </TabsTrigger>
              <TabsTrigger value="generated" data-testid="tab-generated">
                <FileBarChart className="h-4 w-4 mr-2" />
                Generated Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-6">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Filters:</span>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40 bg-card" data-testid="select-category">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-40 bg-card" data-testid="select-region">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region === "all" ? "All Regions" : region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="secondary" className="text-xs">
                  {filteredTemplates.length} templates
                </Badge>
              </div>

              {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => {
                const Icon = categoryIcons[category] || FileText;
                return (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-semibold capitalize">{category} Reports</h2>
                      <Badge variant="outline" className="text-xs">
                        {categoryTemplates.length}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryTemplates.map((template) => {
                        const CategoryIcon = categoryIcons[template.category || "operational"] || FileText;
                        return (
                          <Card
                            key={template.id}
                            className="glass-card hover-elevate cursor-pointer group"
                            data-testid={`card-template-${template.id}`}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${categoryColors[template.category || "operational"]}`}>
                                    <CategoryIcon className="h-4 w-4" />
                                  </div>
                                  <div className="space-y-1">
                                    <CardTitle className="text-sm font-medium leading-tight">
                                      {template.name}
                                    </CardTitle>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {template.region && (
                                        <Badge variant="outline" className="text-xs">
                                          <Globe className="h-3 w-3 mr-1" />
                                          {template.region}
                                        </Badge>
                                      )}
                                      {template.industry && (
                                        <Badge variant="outline" className="text-xs">
                                          <Building2 className="h-3 w-3 mr-1" />
                                          {template.industry}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-3">
                              <CardDescription className="text-xs line-clamp-2">
                                {template.description}
                              </CardDescription>
                              {template.framework && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Shield className="h-3 w-3" />
                                  <span>{template.framework}</span>
                                </div>
                              )}
                              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  <span>
                                    {template.roleAccess?.length || 0} roles
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleGenerateReport(template)}
                                  data-testid={`button-generate-${template.id}`}
                                >
                                  <Play className="h-3 w-3 mr-1" />
                                  Generate
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {filteredTemplates.length === 0 && (
                <Card className="glass-card">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="font-medium text-lg">No Report Templates Found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try adjusting your filters or search terms
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="generated" className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {reportsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : generatedReports.length > 0 ? (
                  generatedReports.map((report) => (
                    <Card key={report.id} className="glass-card" data-testid={`card-report-${report.id}`}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <FileBarChart className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{report.name}</h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(report.createdAt || "").toLocaleDateString()}
                              </span>
                              <span className="uppercase">{report.format}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={statusColors[report.status || "pending"]}>
                            {report.status === "completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {report.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                            {report.status === "in_progress" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                            {report.status}
                          </Badge>
                          {report.status === "completed" && (
                            <>
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => handleViewReport(report)}
                                data-testid={`button-view-${report.id}`}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleDownloadPdf(report)}
                                data-testid={`button-download-${report.id}`}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </Button>
                            </>
                          )}
                          {(report.status === "in_progress" || report.status === "pending") && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => refetchReports()}
                              data-testid={`button-refresh-${report.id}`}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="glass-card">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <FileDown className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="font-medium text-lg">No Generated Reports</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Generate your first report from the templates tab
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Report</DialogTitle>
                <DialogDescription>
                  Generate a new {selectedTemplate?.name} report for{" "}
                  {currentTenant?.name || "all organizations"}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{selectedTemplate?.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedTemplate?.description}</p>
                  </div>
                </div>
                {selectedTemplate?.framework && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Framework: {selectedTemplate.framework}</span>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={confirmGenerate}
                  disabled={generateReportMutation.isPending}
                  data-testid="button-confirm-generate"
                >
                  {generateReportMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              {viewingReport && (
                <ReportViewer 
                  report={viewingReport} 
                  onClose={() => setViewDialogOpen(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
