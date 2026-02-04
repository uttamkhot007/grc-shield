import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Search,
  Shield,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
  Filter,
  ChevronRight,
  FileText,
  Target,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTenant } from "@/contexts/tenant-context";
import type { Control, Framework } from "@shared/schema";

const automationLevelColors: Record<string, string> = {
  full: "bg-chart-2/20 text-chart-2",
  partial: "bg-chart-3/20 text-chart-3",
  manual: "bg-muted text-muted-foreground",
};

export default function ControlsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFramework, setSelectedFramework] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAiEnrichedOnly, setShowAiEnrichedOnly] = useState(false);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);
  const { toast } = useToast();
  const { currentTenant } = useTenant();

  const { data: controls = [], isLoading: controlsLoading } = useQuery<Control[]>({
    queryKey: ["/api/controls"],
  });

  const { data: frameworks = [] } = useQuery<Framework[]>({
    queryKey: ["/api/frameworks"],
  });

  const aiEnrichMutation = useMutation({
    mutationFn: async (controlId: string) => {
      return apiRequest("POST", `/api/controls/${controlId}/ai-enrich`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/controls"] });
      toast({
        title: "AI Enrichment Complete",
        description: "The control has been enriched with AI-generated guidance.",
      });
    },
    onError: () => {
      toast({
        title: "Enrichment Failed",
        description: "Failed to enrich control. Please try again.",
        variant: "destructive",
      });
    },
  });

  const categories = Array.from(new Set(controls.map(c => c.category).filter(Boolean))) as string[];
  
  const filteredControls = controls.filter((control) => {
    const matchesSearch = 
      control.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      control.controlId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      control.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFramework = selectedFramework === "all" || control.frameworkId === selectedFramework;
    const matchesCategory = selectedCategory === "all" || control.category === selectedCategory;
    const matchesAiFilter = !showAiEnrichedOnly || control.aiEnriched;
    
    return matchesSearch && matchesFramework && matchesCategory && matchesAiFilter;
  });

  const getFrameworkName = (frameworkId: string | null) => {
    if (!frameworkId) return "General";
    const framework = frameworks.find(f => f.id === frameworkId);
    return framework?.name || frameworkId;
  };

  const aiEnrichedCount = controls.filter(c => c.aiEnriched).length;
  const enrichmentProgress = controls.length > 0 ? (aiEnrichedCount / controls.length) * 100 : 0;

  const openControlDetail = (control: Control) => {
    setSelectedControl(control);
    setDetailSheetOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Controls</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor compliance controls across frameworks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {controls.length} Controls
          </Badge>
          <Badge variant="outline" className="text-sm bg-chart-2/10 text-chart-2 border-chart-2/30">
            {aiEnrichedCount} AI Enriched
          </Badge>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-chart-1" />
            AI Enrichment Progress
          </CardTitle>
          <CardDescription>
            {aiEnrichedCount} of {controls.length} controls have been enriched with AI-generated guidance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={enrichmentProgress} className="h-2" />
            <p className="text-sm text-muted-foreground text-right">
              {enrichmentProgress.toFixed(1)}% complete
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search controls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-controls"
          />
        </div>
        
        <Select value={selectedFramework} onValueChange={setSelectedFramework}>
          <SelectTrigger className="w-[200px]" data-testid="select-framework-filter">
            <SelectValue placeholder="All Frameworks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Frameworks</SelectItem>
            {frameworks.map((framework) => (
              <SelectItem key={framework.id} value={framework.id}>
                {framework.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]" data-testid="select-category-filter">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category || ""}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={showAiEnrichedOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowAiEnrichedOnly(!showAiEnrichedOnly)}
          data-testid="button-ai-filter"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          AI Enriched Only
        </Button>
      </div>

      {controlsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass-card">
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredControls.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No controls found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Try adjusting your search or filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredControls.slice(0, 50).map((control) => (
            <Card
              key={control.id}
              className="glass-card cursor-pointer hover-elevate transition-all"
              onClick={() => openControlDetail(control)}
              data-testid={`card-control-${control.id}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base leading-tight line-clamp-2">
                      {control.title}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {control.controlId}
                    </CardDescription>
                  </div>
                  {control.aiEnriched && (
                    <Badge variant="outline" className="shrink-0 bg-chart-1/10 text-chart-1 border-chart-1/30">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {control.description || "No description available"}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Layers className="h-3 w-3 mr-1" />
                    {getFrameworkName(control.frameworkId)}
                  </Badge>
                  {control.category && (
                    <Badge variant="outline" className="text-xs">
                      {control.category}
                    </Badge>
                  )}
                  {control.automationLevel && (
                    <Badge className={`text-xs ${automationLevelColors[control.automationLevel] || "bg-muted text-muted-foreground"}`}>
                      {control.automationLevel}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredControls.length > 50 && (
        <div className="text-center text-muted-foreground text-sm">
          Showing 50 of {filteredControls.length} controls. Use search to find specific controls.
        </div>
      )}

      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedControl && (
            <>
              <SheetHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-chart-1/10">
                    <Shield className="h-6 w-6 text-chart-1" />
                  </div>
                  <div className="flex-1">
                    <SheetTitle className="text-xl">{selectedControl.title}</SheetTitle>
                    <SheetDescription className="mt-1">
                      {selectedControl.controlId} | {getFrameworkName(selectedControl.frameworkId)}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="flex flex-wrap gap-2">
                  {selectedControl.aiEnriched && (
                    <Badge className="bg-chart-1/20 text-chart-1 border-0">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Enriched
                    </Badge>
                  )}
                  {selectedControl.category && (
                    <Badge variant="outline">{selectedControl.category}</Badge>
                  )}
                  {selectedControl.automationLevel && (
                    <Badge className={automationLevelColors[selectedControl.automationLevel] || "bg-muted text-muted-foreground"}>
                      {selectedControl.automationLevel} automation
                    </Badge>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedControl.description || "No description available"}
                  </p>
                </div>

                {selectedControl.guidance && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Implementation Guidance</h4>
                    <Card>
                      <CardContent className="pt-4">
                        <pre className="text-sm whitespace-pre-wrap">{selectedControl.guidance}</pre>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {selectedControl.complianceSteps && Array.isArray(selectedControl.complianceSteps) && (selectedControl.complianceSteps as string[]).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-chart-2" />
                      Compliance Steps
                    </h4>
                    <Card>
                      <CardContent className="pt-4">
                        <ol className="space-y-2">
                          {(selectedControl.complianceSteps as string[]).map((step: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-3 text-sm">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-chart-2/20 text-chart-2 text-xs font-medium shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-muted-foreground">{String(step)}</span>
                            </li>
                          ))}
                        </ol>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {selectedControl.crossFrameworkMappings && typeof selectedControl.crossFrameworkMappings === 'object' && Object.keys(selectedControl.crossFrameworkMappings as object).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Layers className="h-4 w-4 text-chart-3" />
                      Cross-Framework Mappings
                    </h4>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(selectedControl.crossFrameworkMappings as Record<string, string>).map(([framework, mapping]: [string, string]) => (
                            <div key={framework} className="flex items-center gap-2 text-sm">
                              <Badge variant="outline" className="shrink-0">
                                {framework}
                              </Badge>
                              <span className="text-muted-foreground truncate">{String(mapping)}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {selectedControl.evidenceRequirements && selectedControl.evidenceRequirements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-chart-4" />
                      Evidence Requirements
                    </h4>
                    <Card>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          {selectedControl.evidenceRequirements.map((evidence, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <Check className="h-4 w-4 text-chart-2 shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">{evidence}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <Separator />

                <div className="flex gap-2">
                  {!selectedControl.aiEnriched && (
                    <Button
                      onClick={() => aiEnrichMutation.mutate(selectedControl.id)}
                      disabled={aiEnrichMutation.isPending}
                      data-testid="button-ai-enrich-control"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {aiEnrichMutation.isPending ? "Enriching..." : "AI Enrich Control"}
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setDetailSheetOpen(false)}>
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
