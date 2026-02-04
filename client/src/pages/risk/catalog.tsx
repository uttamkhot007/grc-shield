import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Search,
  Filter,
  Sparkles,
  BookOpen,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Eye,
  RefreshCw,
  Check,
  Loader2,
  Database,
  Brain,
  Shield,
  Building2,
  Scale,
  Users,
  Truck,
  Star,
  Laptop,
  FileText,
  Target,
  Layers,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTenant } from "@/contexts/tenant-context";

const categoryIcons: Record<string, typeof AlertTriangle> = {
  "IT & Cybersecurity": Laptop,
  "Operational": Building2,
  "Financial": Scale,
  "Strategic": Target,
  "Compliance & Regulatory": Shield,
  "Legal": FileText,
  "Human Resources": Users,
  "Third Party & Vendor": Truck,
  "Reputational": Star,
  "Environmental": Layers,
};

const riskLevelColors: Record<string, string> = {
  "Critical": "bg-destructive text-white",
  "High": "bg-chart-3 text-white",
  "Medium": "bg-chart-1 text-white",
  "Low": "bg-chart-2 text-white",
};

interface RiskCatalogItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  subcategory: string | null;
  defaultLikelihood: number;
  defaultImpact: number;
  potentialCauses: string[] | null;
  potentialConsequences: string[] | null;
  suggestedControls: string[] | null;
  relatedFrameworks: string[] | null;
  aiEnriched: boolean;
  aiEnrichmentData: any | null;
  isGlobal: boolean;
  tenantId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CategoryInfo {
  category: string;
  subcategories: string[];
}

function getRiskLevel(likelihood: number, impact: number): string {
  const score = likelihood * impact;
  if (score >= 20) return "Critical";
  if (score >= 12) return "High";
  if (score >= 6) return "Medium";
  return "Low";
}

export default function RiskCatalogPage() {
  const { toast } = useToast();
  const { currentTenant } = useTenant();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [filterAiEnriched, setFilterAiEnriched] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [selectedRisk, setSelectedRisk] = useState<RiskCatalogItem | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const { data: catalogItems = [], isLoading: isLoadingCatalog, refetch } = useQuery<RiskCatalogItem[]>({
    queryKey: ["/api/risk-catalog", currentTenant?.id],
    enabled: true,
  });

  const { data: categories = [] } = useQuery<CategoryInfo[]>({
    queryKey: ["/api/risk-catalog/categories"],
  });

  const enrichMutation = useMutation({
    mutationFn: async (riskId: string) => {
      const response = await apiRequest("POST", `/api/risk-catalog/${riskId}/ai-enrich`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "AI Enrichment Complete",
        description: "Risk has been enriched with AI-generated insights.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/risk-catalog"] });
      if (selectedRisk) {
        setSelectedRisk({ ...selectedRisk, aiEnriched: true, aiEnrichmentData: data.enrichmentData });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Enrichment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredItems = useMemo(() => {
    return catalogItems.filter((item) => {
      if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
      if (selectedSubcategory !== "all" && item.subcategory !== selectedSubcategory) return false;
      if (filterAiEnriched === "enriched" && !item.aiEnriched) return false;
      if (filterAiEnriched === "not_enriched" && item.aiEnriched) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.code.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [catalogItems, selectedCategory, selectedSubcategory, filterAiEnriched, searchQuery]);

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, RiskCatalogItem[]> = {};
    filteredItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  const stats = useMemo(() => {
    const total = catalogItems.length;
    const enriched = catalogItems.filter((r) => r.aiEnriched).length;
    const categoryCount = new Set(catalogItems.map((r) => r.category)).size;
    const criticalCount = catalogItems.filter((r) => getRiskLevel(r.defaultLikelihood, r.defaultImpact) === "Critical").length;
    return { total, enriched, categoryCount, criticalCount };
  }, [catalogItems]);

  const subcategories = useMemo(() => {
    if (selectedCategory === "all") return [];
    const cat = categories.find((c) => c.category === selectedCategory);
    return cat?.subcategories || [];
  }, [selectedCategory, categories]);

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleViewRisk = (risk: RiskCatalogItem) => {
    setSelectedRisk(risk);
    setDetailSheetOpen(true);
  };

  const handleEnrich = (riskId: string) => {
    enrichMutation.mutate(riskId);
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-3" data-testid="text-page-title">
            <BookOpen className="h-8 w-8" />
            Risk Catalog
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive library of categorized risks with AI enrichment capabilities
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Risks</p>
                <p className="text-2xl font-bold" data-testid="text-stat-total">{stats.total}</p>
              </div>
              <Database className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Enriched</p>
                <p className="text-2xl font-bold" data-testid="text-stat-enriched">
                  {stats.enriched}
                  <span className="text-sm text-muted-foreground ml-1">
                    ({stats.total > 0 ? Math.round((stats.enriched / stats.total) * 100) : 0}%)
                  </span>
                </p>
              </div>
              <Brain className="h-8 w-8 text-chart-2/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold" data-testid="text-stat-categories">{stats.categoryCount}</p>
              </div>
              <Layers className="h-8 w-8 text-chart-1/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Risks</p>
                <p className="text-2xl font-bold text-destructive" data-testid="text-stat-critical">{stats.criticalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search risks by name, code, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setSelectedSubcategory("all"); }}>
                <SelectTrigger className="w-[200px]" data-testid="select-category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.category} value={cat.category}>{cat.category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {subcategories.length > 0 && (
                <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                  <SelectTrigger className="w-[200px]" data-testid="select-subcategory">
                    <SelectValue placeholder="All Subcategories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subcategories</SelectItem>
                    {subcategories.map((sub) => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select value={filterAiEnriched} onValueChange={setFilterAiEnriched}>
                <SelectTrigger className="w-[160px]" data-testid="select-ai-filter">
                  <SelectValue placeholder="AI Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risks</SelectItem>
                  <SelectItem value="enriched">AI Enriched</SelectItem>
                  <SelectItem value="not_enriched">Not Enriched</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "cards" | "table")}>
                <TabsList>
                  <TabsTrigger value="cards" data-testid="tab-cards">Cards</TabsTrigger>
                  <TabsTrigger value="table" data-testid="tab-table">Table</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoadingCatalog ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : viewMode === "cards" ? (
        <div className="space-y-6">
          {Object.entries(groupedByCategory).map(([category, risks]) => {
            const CategoryIcon = categoryIcons[category] || AlertTriangle;
            const isExpanded = expandedCategories.includes(category);
            return (
              <Card key={category} className="glass-card overflow-hidden">
                <CardHeader
                  className="cursor-pointer hover-elevate py-4"
                  onClick={() => toggleCategoryExpansion(category)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CategoryIcon className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{category}</CardTitle>
                        <CardDescription>{risks.length} risks in this category</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {risks.filter((r) => r.aiEnriched).length}/{risks.length} enriched
                      </Badge>
                      {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </div>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {risks.map((risk) => {
                        const riskLevel = getRiskLevel(risk.defaultLikelihood, risk.defaultImpact);
                        return (
                          <Card
                            key={risk.id}
                            className="glass-card hover-lift cursor-pointer"
                            onClick={() => handleViewRisk(risk)}
                            data-testid={`card-risk-${risk.code}`}
                          >
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <Badge variant="outline" className="mb-2">{risk.code}</Badge>
                                  <h4 className="font-medium line-clamp-2">{risk.name}</h4>
                                </div>
                                {risk.aiEnriched && (
                                  <Sparkles className="h-4 w-4 text-chart-2 shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">{risk.description}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={riskLevelColors[riskLevel]}>{riskLevel}</Badge>
                                {risk.subcategory && (
                                  <Badge variant="secondary">{risk.subcategory}</Badge>
                                )}
                              </div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>L:{risk.defaultLikelihood} | I:{risk.defaultImpact}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => { e.stopPropagation(); handleViewRisk(risk); }}
                                  data-testid={`button-view-${risk.code}`}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
          {Object.keys(groupedByCategory).length === 0 && (
            <Card className="glass-card p-12 text-center">
              <p className="text-muted-foreground">No risks found matching your criteria.</p>
            </Card>
          )}
        </div>
      ) : (
        <Card className="glass-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead className="text-center">L/I</TableHead>
                  <TableHead className="text-center">AI</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((risk) => {
                  const riskLevel = getRiskLevel(risk.defaultLikelihood, risk.defaultImpact);
                  return (
                    <TableRow key={risk.id} className="cursor-pointer hover-elevate" onClick={() => handleViewRisk(risk)} data-testid={`row-risk-${risk.code}`}>
                      <TableCell>
                        <Badge variant="outline">{risk.code}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <span className="line-clamp-1 font-medium">{risk.name}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{risk.category}</span>
                          {risk.subcategory && (
                            <span className="text-xs text-muted-foreground">{risk.subcategory}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={riskLevelColors[riskLevel]}>{riskLevel}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{risk.defaultLikelihood}/{risk.defaultImpact}</TableCell>
                      <TableCell className="text-center">
                        {risk.aiEnriched ? (
                          <Sparkles className="h-4 w-4 text-chart-2 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); handleViewRisk(risk); }}
                          data-testid={`button-table-view-${risk.code}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredItems.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                No risks found matching your criteria.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedRisk && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedRisk.code}</Badge>
                  {selectedRisk.aiEnriched && (
                    <Badge className="bg-chart-2 text-white">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Enriched
                    </Badge>
                  )}
                </div>
                <SheetTitle className="text-xl">{selectedRisk.name}</SheetTitle>
                <SheetDescription>
                  {selectedRisk.category} {selectedRisk.subcategory && `> ${selectedRisk.subcategory}`}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedRisk.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="glass-card">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Likelihood</p>
                      <p className="text-2xl font-bold">{selectedRisk.defaultLikelihood}/5</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Impact</p>
                      <p className="text-2xl font-bold">{selectedRisk.defaultImpact}/5</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center">
                  <Badge className={`${riskLevelColors[getRiskLevel(selectedRisk.defaultLikelihood, selectedRisk.defaultImpact)]} text-lg px-4 py-1`}>
                    {getRiskLevel(selectedRisk.defaultLikelihood, selectedRisk.defaultImpact)} Risk
                  </Badge>
                </div>

                {selectedRisk.potentialCauses && selectedRisk.potentialCauses.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Potential Causes</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {selectedRisk.potentialCauses.map((cause, i) => (
                        <li key={i}>{cause}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedRisk.potentialConsequences && selectedRisk.potentialConsequences.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Potential Consequences</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {selectedRisk.potentialConsequences.map((consequence, i) => (
                        <li key={i}>{consequence}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedRisk.suggestedControls && selectedRisk.suggestedControls.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Suggested Controls</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRisk.suggestedControls.map((control, i) => (
                        <Badge key={i} variant="outline">{control}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRisk.relatedFrameworks && selectedRisk.relatedFrameworks.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Related Frameworks</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRisk.relatedFrameworks.map((framework, i) => (
                        <Badge key={i} variant="secondary">{framework}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRisk.aiEnriched && selectedRisk.aiEnrichmentData && (
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Brain className="h-4 w-4 text-chart-2" />
                      AI-Enhanced Insights
                    </h4>

                    {selectedRisk.aiEnrichmentData.enhancedDescription && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h5 className="text-sm font-medium mb-2">Enhanced Description</h5>
                        <p className="text-sm text-muted-foreground">{selectedRisk.aiEnrichmentData.enhancedDescription}</p>
                      </div>
                    )}

                    {selectedRisk.aiEnrichmentData.keyIndicators && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h5 className="text-sm font-medium mb-2">Key Risk Indicators</h5>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {selectedRisk.aiEnrichmentData.keyIndicators.map((indicator: string, i: number) => (
                            <li key={i}>{indicator}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedRisk.aiEnrichmentData.mitigationStrategies && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h5 className="text-sm font-medium mb-2">Mitigation Strategies</h5>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {selectedRisk.aiEnrichmentData.mitigationStrategies.map((strategy: string, i: number) => (
                            <li key={i}>{strategy}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedRisk.aiEnrichmentData.controlMappings && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h5 className="text-sm font-medium mb-2">Control Framework Mappings</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(selectedRisk.aiEnrichmentData.controlMappings).map(([framework, controls]) => (
                            <div key={framework}>
                              <span className="font-medium">{framework}:</span>
                              <span className="text-muted-foreground ml-1">{Array.isArray(controls) ? controls.join(", ") : String(controls)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  {!selectedRisk.aiEnriched && (
                    <Button
                      onClick={() => handleEnrich(selectedRisk.id)}
                      disabled={enrichMutation.isPending}
                      className="flex-1"
                      data-testid="button-enrich"
                    >
                      {enrichMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enriching...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Enrich with AI
                        </>
                      )}
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setDetailSheetOpen(false)} data-testid="button-close-detail-sheet">
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
