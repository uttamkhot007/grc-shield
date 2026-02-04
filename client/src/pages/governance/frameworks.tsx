import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Shield,
  Lock,
  Globe,
  FileCheck,
  Building2,
  ChevronRight,
  FileText,
  BarChart3,
  Download,
  Layers,
  Target,
  Check,
  X,
  MapPin,
  Factory,
  Briefcase,
  Upload,
  FileSpreadsheet,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTenant } from "@/contexts/tenant-context";
import type { Framework, Control } from "@shared/schema";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

interface TenantFramework {
  id: string;
  tenantId: string;
  frameworkId: string;
  applicabilityType: string | null;
  status: string;
  complianceScore: number | null;
  assignedAt: string;
}

const categoryColors: Record<string, string> = {
  security: "bg-chart-1/20 text-chart-1",
  privacy: "bg-chart-4/20 text-chart-4",
  industry: "bg-chart-3/20 text-chart-3",
  governance: "bg-chart-2/20 text-chart-2",
  regional: "bg-chart-5/20 text-chart-5",
};

const applicabilityColors: Record<string, string> = {
  global: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  industry: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  regional: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const applicabilityIcons: Record<string, any> = {
  global: Globe,
  industry: Factory,
  regional: MapPin,
};

const categoryIcons: Record<string, any> = {
  security: Shield,
  privacy: Lock,
  industry: Building2,
  governance: FileCheck,
  regional: Globe,
};

export default function FrameworksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [librarySearchQuery, setLibrarySearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
  const [detailTab, setDetailTab] = useState("overview");
  const [libraryCategory, setLibraryCategory] = useState("all");
  const [libraryApplicability, setLibraryApplicability] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newFramework, setNewFramework] = useState({
    name: "",
    shortName: "",
    description: "",
    category: "security",
    region: "Global",
    version: "1.0",
  });
  const [newControls, setNewControls] = useState<Array<{
    controlId: string;
    title: string;
    description: string;
    category: string;
  }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { currentTenant } = useTenant();

  const { data: frameworks = [], isLoading: frameworksLoading } = useQuery<Framework[]>({
    queryKey: ["/api/frameworks"],
  });

  const { data: controls = [] } = useQuery<Control[]>({
    queryKey: ["/api/controls"],
  });

  const { data: tenantFrameworks = [] } = useQuery<TenantFramework[]>({
    queryKey: [`/api/tenant-frameworks?tenantId=${currentTenant?.id}`],
    enabled: !!currentTenant?.id,
  });

  const addFrameworkMutation = useMutation({
    mutationFn: async ({ frameworkId, applicabilityType }: { frameworkId: string; applicabilityType: string }) => {
      if (!currentTenant?.id) {
        throw new Error("No tenant selected");
      }
      return apiRequest("POST", "/api/tenant-frameworks", {
        tenantId: currentTenant.id,
        frameworkId,
        applicabilityType,
        status: "active",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tenant-frameworks?tenantId=${currentTenant?.id}`] });
      toast({
        title: "Framework Added",
        description: "The framework has been added to your active frameworks.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add framework. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeFrameworkMutation = useMutation({
    mutationFn: async (tenantFrameworkId: string) => {
      return apiRequest("DELETE", `/api/tenant-frameworks/${tenantFrameworkId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tenant-frameworks?tenantId=${currentTenant?.id}`] });
      toast({
        title: "Framework Removed",
        description: "The framework has been removed from your active frameworks.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove framework. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createFrameworkMutation = useMutation({
    mutationFn: async (data: { framework: typeof newFramework; controls: typeof newControls }) => {
      return apiRequest("POST", "/api/frameworks/custom", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/frameworks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/controls"] });
      setIsCreateDialogOpen(false);
      setNewFramework({
        name: "",
        shortName: "",
        description: "",
        category: "security",
        region: "Global",
        version: "1.0",
      });
      setNewControls([]);
      toast({
        title: "Framework Created",
        description: "Your custom framework has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create framework. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({
          title: "Invalid File",
          description: "The file must contain a header row and at least one control row.",
          variant: "destructive",
        });
        return;
      }

      const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
      const controlIdIndex = header.findIndex(h => h.includes('control') && h.includes('id') || h === 'controlid' || h === 'id');
      const titleIndex = header.findIndex(h => h === 'title' || h === 'name' || h === 'control name');
      const descriptionIndex = header.findIndex(h => h === 'description' || h === 'desc');
      const categoryIndex = header.findIndex(h => h === 'category' || h === 'type' || h === 'domain');

      if (controlIdIndex === -1 || titleIndex === -1) {
        toast({
          title: "Invalid CSV Format",
          description: "CSV must contain 'Control ID' and 'Title' columns.",
          variant: "destructive",
        });
        return;
      }

      const parsedControls: typeof newControls = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
        
        if (values[controlIdIndex] && values[titleIndex]) {
          parsedControls.push({
            controlId: values[controlIdIndex],
            title: values[titleIndex],
            description: descriptionIndex !== -1 ? values[descriptionIndex] || '' : '',
            category: categoryIndex !== -1 ? values[categoryIndex] || 'general' : 'general',
          });
        }
      }

      if (parsedControls.length > 0) {
        setNewControls(prev => [...prev, ...parsedControls]);
        toast({
          title: "Controls Imported",
          description: `Successfully imported ${parsedControls.length} controls from the file.`,
        });
      }
    } catch (error) {
      toast({
        title: "Import Error",
        description: "Failed to parse the file. Please ensure it's a valid CSV format.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const addEmptyControl = () => {
    setNewControls(prev => [...prev, {
      controlId: `CTRL-${(prev.length + 1).toString().padStart(3, '0')}`,
      title: '',
      description: '',
      category: 'general',
    }]);
  };

  const removeControl = (index: number) => {
    setNewControls(prev => prev.filter((_, i) => i !== index));
  };

  const updateControl = (index: number, field: string, value: string) => {
    setNewControls(prev => prev.map((ctrl, i) => 
      i === index ? { ...ctrl, [field]: value } : ctrl
    ));
  };

  const handleCreateFramework = () => {
    if (!newFramework.name || !newFramework.shortName) {
      toast({
        title: "Validation Error",
        description: "Framework name and short name are required.",
        variant: "destructive",
      });
      return;
    }
    createFrameworkMutation.mutate({ framework: newFramework, controls: newControls });
  };

  const downloadTemplate = () => {
    const csvContent = "Control ID,Title,Description,Category\nCTRL-001,Example Control,Description of the control,Access Control\nCTRL-002,Another Control,Another description,Data Protection";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'controls-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const activeTenantFrameworks = tenantFrameworks.filter(tf => tf.status === "active" || tf.status === "in_progress");
  const tenantFrameworkIds = new Set(activeTenantFrameworks.map(tf => tf.frameworkId));
  
  const activeFrameworks = frameworks.filter(f => tenantFrameworkIds.has(f.id));
  const libraryFrameworks = frameworks.filter(f => !tenantFrameworkIds.has(f.id));

  const getApplicabilityType = (frameworkId: string) => {
    const tf = tenantFrameworks.find(tf => tf.frameworkId === frameworkId);
    return tf?.applicabilityType || "global";
  };

  const getTenantFrameworkId = (frameworkId: string) => {
    const tf = tenantFrameworks.find(tf => tf.frameworkId === frameworkId);
    return tf?.id;
  };

  const globalFrameworks = activeFrameworks.filter(f => getApplicabilityType(f.id) === "global");
  const industryFrameworks = activeFrameworks.filter(f => getApplicabilityType(f.id) === "industry");
  const regionalFrameworks = activeFrameworks.filter(f => getApplicabilityType(f.id) === "regional");

  const filteredActiveFrameworks = activeFrameworks.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.shortName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const determineApplicabilityType = (framework: Framework): string => {
    if (framework.isGlobal) return "global";
    if (framework.category === "industry") return "industry";
    if (framework.category === "regional") return "regional";
    if (framework.region && framework.region !== "Global") return "regional";
    return "global";
  };

  const filteredLibraryFrameworks = libraryFrameworks.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(librarySearchQuery.toLowerCase()) ||
      f.shortName?.toLowerCase().includes(librarySearchQuery.toLowerCase());
    const matchesCategory = libraryCategory === "all" || f.category === libraryCategory;
    const determinedApplicability = determineApplicabilityType(f);
    const matchesApplicability = libraryApplicability === "all" || determinedApplicability === libraryApplicability;
    return matchesSearch && matchesCategory && matchesApplicability;
  });

  const openDetailSheet = (framework: Framework) => {
    setSelectedFramework(framework);
    setDetailTab("overview");
    setDetailSheetOpen(true);
  };

  const getFrameworkControls = (frameworkId: string) => {
    return controls.filter(c => c.frameworkId === frameworkId);
  };

  const handleAddFramework = (framework: Framework) => {
    const applicabilityType = determineApplicabilityType(framework);
    addFrameworkMutation.mutate({ frameworkId: framework.id, applicabilityType });
  };

  const handleRemoveFramework = (frameworkId: string) => {
    const tfId = getTenantFrameworkId(frameworkId);
    if (tfId) {
      removeFrameworkMutation.mutate(tfId);
    }
  };

  const exportToPDF = (framework: Framework) => {
    const doc = new jsPDF();
    const frameworkControls = getFrameworkControls(framework.id);
    
    doc.setFillColor(26, 26, 26);
    doc.rect(0, 0, 210, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text(framework.name, 20, 25);
    
    doc.setFontSize(12);
    doc.setTextColor(108, 117, 125);
    doc.text(`Category: ${framework.category || "Security"}`, 20, 50);
    doc.text(`Region: ${framework.region || "Global"}`, 20, 60);
    doc.text(`Version: ${framework.version || "N/A"}`, 20, 70);
    doc.text(`Total Controls: ${framework.controlCount || frameworkControls.length}`, 20, 80);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 90, 190, 90);
    
    doc.setFontSize(14);
    doc.setTextColor(33, 37, 41);
    doc.text("Description", 20, 105);
    
    doc.setFontSize(11);
    const splitDescription = doc.splitTextToSize(framework.description || "", 170);
    doc.text(splitDescription, 20, 120);
    
    if (frameworkControls.length > 0) {
      let yOffset = 120 + splitDescription.length * 7 + 20;
      doc.setFontSize(14);
      doc.text("Controls", 20, yOffset);
      yOffset += 15;
      
      doc.setFontSize(10);
      frameworkControls.slice(0, 10).forEach((control) => {
        if (yOffset < 270) {
          doc.text(`${control.controlId}: ${control.title}`, 20, yOffset);
          yOffset += 10;
        }
      });
      
      if (frameworkControls.length > 10) {
        doc.text(`... and ${frameworkControls.length - 10} more controls`, 20, yOffset);
      }
    }
    
    doc.save(`${framework.shortName || framework.name}-framework.pdf`);
  };

  const exportToWord = async (framework: Framework) => {
    const frameworkControls = getFrameworkControls(framework.id);
    
    const controlParagraphs = frameworkControls.map(control => 
      new Paragraph({
        children: [
          new TextRun({ text: `${control.controlId}: `, bold: true }),
          new TextRun(control.title),
        ],
      })
    );
    
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: framework.name,
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Category: ", bold: true }),
                new TextRun(framework.category || "Security"),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Region: ", bold: true }),
                new TextRun(framework.region || "Global"),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Version: ", bold: true }),
                new TextRun(framework.version || "N/A"),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Total Controls: ", bold: true }),
                new TextRun(String(framework.controlCount || frameworkControls.length)),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              text: "Description",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text: framework.description || "",
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              text: "Controls",
              heading: HeadingLevel.HEADING_2,
            }),
            ...controlParagraphs,
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${framework.shortName || framework.name}-framework.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const FrameworkSection = ({ 
    title, 
    description, 
    frameworks: sectionFrameworks, 
    applicabilityType,
    icon: Icon 
  }: { 
    title: string; 
    description: string; 
    frameworks: Framework[]; 
    applicabilityType: string;
    icon: any;
  }) => {
    const filtered = sectionFrameworks.filter((f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.shortName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filtered.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${applicabilityColors[applicabilityType]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Badge className={`ml-auto ${applicabilityColors[applicabilityType]}`}>
            {filtered.length} frameworks
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((framework) => {
            const category = framework.category || "security";
            const CategoryIcon = categoryIcons[category] || Shield;
            const frameworkControls = getFrameworkControls(framework.id);
            const controlCount = framework.controlCount || frameworkControls.length;
            
            return (
              <Card
                key={framework.id}
                className="card-3d cursor-pointer hover-elevate group"
                data-testid={`card-framework-${framework.id}`}
                onClick={() => openDetailSheet(framework)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-chart-1/20 to-chart-4/20">
                        <CategoryIcon className="h-5 w-5 text-chart-1" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{framework.shortName || framework.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {framework.region || "Global"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFramework(framework.id);
                      }}
                      data-testid={`button-remove-framework-${framework.id}`}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <Badge className={categoryColors[category] || categoryColors.security}>
                      {category}
                    </Badge>
                    <Badge variant="outline" className={applicabilityColors[applicabilityType]}>
                      {applicabilityType}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {framework.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Controls</span>
                      <span className="font-medium">{controlCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Version {framework.version || "N/A"}</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const LibraryCategorySection = ({ category, frameworks: catFrameworks }: { category: string; frameworks: Framework[] }) => {
    const Icon = categoryIcons[category] || Shield;
    
    if (catFrameworks.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium capitalize">{category}</h3>
          <Badge variant="outline" className="text-xs">{catFrameworks.length}</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {catFrameworks.map((framework) => (
            <div
              key={framework.id}
              className="p-4 rounded-lg border border-border hover-elevate cursor-pointer group"
              data-testid={`card-library-${framework.id}`}
              onClick={() => openDetailSheet(framework)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-sm">{framework.shortName || framework.name}</h4>
                  <p className="text-xs text-muted-foreground">{framework.region || "Global"}</p>
                </div>
                <Badge className={categoryColors[framework.category || "security"]} variant="outline">
                  {framework.category || "security"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {framework.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {framework.controlCount || 0} controls
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddFramework(framework);
                  }}
                  disabled={addFrameworkMutation.isPending || !currentTenant}
                  data-testid={`button-add-framework-${framework.id}`}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (frameworksLoading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="mesh-gradient min-h-full">
          <div className="p-6 space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-72" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="card-3d">
                  <CardContent className="p-5">
                    <Skeleton className="h-12 w-full mb-4" />
                    <Skeleton className="h-16 w-full mb-4" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categories = ["security", "privacy", "governance", "industry", "regional"];
  const groupedLibraryFrameworks = categories.reduce((acc, cat) => {
    acc[cat] = filteredLibraryFrameworks.filter(f => f.category === cat);
    return acc;
  }, {} as Record<string, Framework[]>);

  return (
    <div className="flex-1 overflow-auto">
      <div className="mesh-gradient min-h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Framework Library</h1>
              <p className="text-muted-foreground mt-1">
                Manage compliance frameworks organized by Global, Industry, and Regional applicability
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1">
                <Briefcase className="h-3 w-3 mr-1" />
                {currentTenant?.name || "All Tenants"}
              </Badge>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                data-testid="button-create-framework"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Framework
              </Button>
            </div>
          </div>

          <Card className="card-3d">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <Globe className="h-4 w-4 text-blue-400" />
                    <span className="text-2xl font-bold">{globalFrameworks.length}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Global Frameworks</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <Factory className="h-4 w-4 text-amber-400" />
                    <span className="text-2xl font-bold">{industryFrameworks.length}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Industry Frameworks</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-400" />
                    <span className="text-2xl font-bold">{regionalFrameworks.length}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Regional Frameworks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="active" data-testid="tab-active-frameworks">
                Active Frameworks ({activeFrameworks.length})
              </TabsTrigger>
              <TabsTrigger value="library" data-testid="tab-framework-library">
                Framework Library ({libraryFrameworks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6 space-y-8">
              <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search active frameworks..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search-frameworks"
                  />
                </div>
              </div>

              {activeFrameworks.length === 0 ? (
                <Card className="card-3d">
                  <CardContent className="py-12 text-center">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No Active Frameworks</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add frameworks from the library to start tracking compliance.
                    </p>
                    <Button onClick={() => setActiveTab("library")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Browse Framework Library
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <FrameworkSection
                    title="Global Frameworks"
                    description="Core frameworks applicable across all operations and regions"
                    frameworks={globalFrameworks}
                    applicabilityType="global"
                    icon={Globe}
                  />
                  
                  <FrameworkSection
                    title="Industry-Specific Frameworks"
                    description="Frameworks specific to your industry vertical"
                    frameworks={industryFrameworks}
                    applicabilityType="industry"
                    icon={Factory}
                  />
                  
                  <FrameworkSection
                    title="Regional Frameworks"
                    description="Frameworks required by regional regulatory bodies"
                    frameworks={regionalFrameworks}
                    applicabilityType="regional"
                    icon={MapPin}
                  />
                </>
              )}
            </TabsContent>

            <TabsContent value="library" className="mt-6 space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search framework library..."
                      className="pl-9"
                      value={librarySearchQuery}
                      onChange={(e) => setLibrarySearchQuery(e.target.value)}
                      data-testid="input-search-library"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Filter by Applicability:</p>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={libraryApplicability === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLibraryApplicability("all")}
                      data-testid="filter-applicability-all"
                    >
                      All Types
                    </Button>
                    <Button
                      variant={libraryApplicability === "global" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLibraryApplicability("global")}
                      className={libraryApplicability === "global" ? "" : applicabilityColors.global}
                      data-testid="filter-applicability-global"
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      Global
                    </Button>
                    <Button
                      variant={libraryApplicability === "industry" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLibraryApplicability("industry")}
                      className={libraryApplicability === "industry" ? "" : applicabilityColors.industry}
                      data-testid="filter-applicability-industry"
                    >
                      <Factory className="h-3 w-3 mr-1" />
                      Industry
                    </Button>
                    <Button
                      variant={libraryApplicability === "regional" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLibraryApplicability("regional")}
                      className={libraryApplicability === "regional" ? "" : applicabilityColors.regional}
                      data-testid="filter-applicability-regional"
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      Regional
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Filter by Category:</p>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={libraryCategory === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLibraryCategory("all")}
                      data-testid="filter-all"
                    >
                      All ({libraryFrameworks.length})
                    </Button>
                    {categories.map((cat) => {
                      const count = libraryFrameworks.filter(f => f.category === cat).length;
                      const Icon = categoryIcons[cat] || Shield;
                      return (
                        <Button
                          key={cat}
                          variant={libraryCategory === cat ? "default" : "outline"}
                          size="sm"
                          onClick={() => setLibraryCategory(cat)}
                          data-testid={`filter-${cat}`}
                        >
                          <Icon className="h-3 w-3 mr-1" />
                          {cat.charAt(0).toUpperCase() + cat.slice(1)} ({count})
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {libraryFrameworks.length === 0 ? (
                <Card className="card-3d">
                  <CardContent className="py-12 text-center">
                    <Check className="h-12 w-12 text-chart-2 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">All Frameworks Active</h3>
                    <p className="text-sm text-muted-foreground">
                      You have added all available frameworks to your active list.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-8">
                  {libraryCategory === "all" ? (
                    categories.map((cat) => (
                      <LibraryCategorySection
                        key={cat}
                        category={cat}
                        frameworks={groupedLibraryFrameworks[cat]}
                      />
                    ))
                  ) : (
                    <LibraryCategorySection
                      category={libraryCategory}
                      frameworks={filteredLibraryFrameworks}
                    />
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedFramework && (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-chart-1/20 to-chart-4/20">
                      <Shield className="h-6 w-6 text-chart-1" />
                    </div>
                    <div>
                      <SheetTitle className="text-xl">
                        {selectedFramework.name}
                      </SheetTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedFramework.shortName} - Version {selectedFramework.version || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToPDF(selectedFramework)}
                      data-testid="button-export-framework-pdf"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToWord(selectedFramework)}
                      data-testid="button-export-framework-word"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Word
                    </Button>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex gap-2 mb-4">
                {tenantFrameworkIds.has(selectedFramework.id) ? (
                  <Badge className="bg-chart-2/20 text-chart-2">
                    <Check className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleAddFramework(selectedFramework)}
                    disabled={addFrameworkMutation.isPending || !currentTenant}
                    data-testid="button-add-framework-detail"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add to Active Frameworks
                  </Button>
                )}
                <Badge className={applicabilityColors[determineApplicabilityType(selectedFramework)]}>
                  {determineApplicabilityType(selectedFramework)}
                </Badge>
              </div>

              <Tabs value={detailTab} onValueChange={setDetailTab} className="mt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="overview" className="flex-1" data-testid="tab-framework-overview">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="controls" className="flex-1" data-testid="tab-framework-controls">
                    Controls
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4 space-y-4">
                  <Card className="glass-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Framework Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Region</p>
                          <p className="text-sm font-medium">{selectedFramework.region || "Global"}</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Category</p>
                          <p className="text-sm font-medium capitalize">{selectedFramework.category || "Security"}</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Total Controls</p>
                          <p className="text-sm font-medium">{selectedFramework.controlCount || getFrameworkControls(selectedFramework.id).length}</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Version</p>
                          <p className="text-sm font-medium">{selectedFramework.version || "N/A"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">
                        {selectedFramework.description || "No description available."}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Applicability
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className={applicabilityColors[determineApplicabilityType(selectedFramework)]}>
                        {determineApplicabilityType(selectedFramework).charAt(0).toUpperCase() + 
                         determineApplicabilityType(selectedFramework).slice(1)} Framework
                      </Badge>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="controls" className="mt-4 space-y-4">
                  {(() => {
                    const frameworkControls = getFrameworkControls(selectedFramework.id);
                    
                    if (frameworkControls.length === 0) {
                      return (
                        <Card className="glass-card">
                          <CardContent className="py-8 text-center">
                            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No controls found for this framework.</p>
                            <p className="text-sm text-muted-foreground mt-1">Controls will be displayed here once they are mapped.</p>
                          </CardContent>
                        </Card>
                      );
                    }
                    
                    return (
                      <div className="space-y-3">
                        {frameworkControls.map((control) => (
                          <Card key={control.id} className="glass-card">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs">
                                      {control.controlId}
                                    </Badge>
                                    {control.category && (
                                      <Badge className="bg-chart-1/20 text-chart-1 text-xs">
                                        {control.category}
                                      </Badge>
                                    )}
                                  </div>
                                  <h4 className="font-medium text-sm">{control.title}</h4>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {control.description}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    );
                  })()}
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Custom Framework Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Create Custom Framework
            </DialogTitle>
            <DialogDescription>
              Create your own compliance framework and define custom controls. You can add controls manually or import them from a CSV file.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 pb-4">
              {/* Framework Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Framework Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="framework-name">Name *</Label>
                    <Input
                      id="framework-name"
                      placeholder="e.g., Company Security Policy"
                      value={newFramework.name}
                      onChange={(e) => setNewFramework(prev => ({ ...prev, name: e.target.value }))}
                      data-testid="input-framework-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="framework-short-name">Short Name *</Label>
                    <Input
                      id="framework-short-name"
                      placeholder="e.g., CSP"
                      value={newFramework.shortName}
                      onChange={(e) => setNewFramework(prev => ({ ...prev, shortName: e.target.value }))}
                      data-testid="input-framework-short-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="framework-category">Category</Label>
                    <Select 
                      value={newFramework.category} 
                      onValueChange={(value) => setNewFramework(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger id="framework-category" data-testid="select-framework-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="privacy">Privacy</SelectItem>
                        <SelectItem value="governance">Governance</SelectItem>
                        <SelectItem value="industry">Industry</SelectItem>
                        <SelectItem value="regional">Regional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="framework-region">Region</Label>
                    <Input
                      id="framework-region"
                      placeholder="e.g., Global, USA, EU"
                      value={newFramework.region}
                      onChange={(e) => setNewFramework(prev => ({ ...prev, region: e.target.value }))}
                      data-testid="input-framework-region"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="framework-description">Description</Label>
                    <Textarea
                      id="framework-description"
                      placeholder="Describe the purpose and scope of this framework..."
                      value={newFramework.description}
                      onChange={(e) => setNewFramework(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      data-testid="input-framework-description"
                    />
                  </div>
                </div>
              </div>

              {/* Controls Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Controls ({newControls.length})</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadTemplate}
                      data-testid="button-download-template"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download Template
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      data-testid="input-file-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      data-testid="button-upload-csv"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      {isUploading ? "Importing..." : "Import CSV"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addEmptyControl}
                      data-testid="button-add-control"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Control
                    </Button>
                  </div>
                </div>

                {newControls.length === 0 ? (
                  <Card className="glass-card">
                    <CardContent className="py-8 text-center">
                      <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No controls added yet.</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add controls manually or import from a CSV file.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {newControls.map((control, index) => (
                      <Card key={index} className="glass-card">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-12 gap-3 items-start">
                            <div className="col-span-2">
                              <Label className="text-xs">Control ID</Label>
                              <Input
                                value={control.controlId}
                                onChange={(e) => updateControl(index, 'controlId', e.target.value)}
                                placeholder="CTRL-001"
                                className="h-8 text-sm"
                                data-testid={`input-control-id-${index}`}
                              />
                            </div>
                            <div className="col-span-4">
                              <Label className="text-xs">Title</Label>
                              <Input
                                value={control.title}
                                onChange={(e) => updateControl(index, 'title', e.target.value)}
                                placeholder="Control title"
                                className="h-8 text-sm"
                                data-testid={`input-control-title-${index}`}
                              />
                            </div>
                            <div className="col-span-4">
                              <Label className="text-xs">Description</Label>
                              <Input
                                value={control.description}
                                onChange={(e) => updateControl(index, 'description', e.target.value)}
                                placeholder="Control description"
                                className="h-8 text-sm"
                                data-testid={`input-control-description-${index}`}
                              />
                            </div>
                            <div className="col-span-1">
                              <Label className="text-xs">Category</Label>
                              <Input
                                value={control.category}
                                onChange={(e) => updateControl(index, 'category', e.target.value)}
                                placeholder="Category"
                                className="h-8 text-sm"
                                data-testid={`input-control-category-${index}`}
                              />
                            </div>
                            <div className="col-span-1 pt-5">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeControl(index)}
                                className="h-8 w-8"
                                data-testid={`button-remove-control-${index}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateFramework}
              disabled={createFrameworkMutation.isPending || !newFramework.name || !newFramework.shortName}
              data-testid="button-save-framework"
            >
              {createFrameworkMutation.isPending ? "Creating..." : "Create Framework"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
