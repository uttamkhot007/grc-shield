import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Plus,
  Search,
  FileText,
  Copy,
  Pencil,
  Trash2,
  Clock,
  HelpCircle,
  Tag,
  Shield,
  Lock,
  CheckCircle,
  ChevronRight,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTenant } from "@/contexts/tenant-context";
import type { QuestionnaireTemplate, InsertQuestionnaireTemplate } from "@shared/schema";

interface Question {
  id: string;
  section: string;
  question: string;
  type: "text" | "textarea" | "boolean" | "select" | "multiselect" | "date";
  options?: string[];
  required: boolean;
}

const categoryConfig: Record<string, { label: string; color: string; icon: any }> = {
  vendor_risk: { label: "Vendor Risk", color: "bg-chart-1/20 text-chart-1", icon: Shield },
  privacy: { label: "Privacy", color: "bg-chart-4/20 text-chart-4", icon: Lock },
  security: { label: "Security", color: "bg-chart-2/20 text-chart-2", icon: Shield },
  compliance: { label: "Compliance", color: "bg-chart-3/20 text-chart-3", icon: CheckCircle },
};

const questionTypeLabels: Record<string, string> = {
  text: "Short Text",
  textarea: "Long Text",
  boolean: "Yes/No",
  select: "Single Choice",
  multiselect: "Multiple Choice",
  date: "Date",
};

export default function QuestionnaireTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<QuestionnaireTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<QuestionnaireTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    shortName: "",
    description: "",
    category: "vendor_risk",
    version: "1.0",
    estimatedTime: 30,
    tags: [] as string[],
    questions: [] as Question[],
    isActive: true,
  });
  const { toast } = useToast();
  const { currentTenant } = useTenant();

  const { data: templates = [], isLoading } = useQuery<QuestionnaireTemplate[]>({
    queryKey: ["/api/questionnaire-templates"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newTemplate) => {
      return apiRequest("POST", "/api/questionnaire-templates", {
        ...data,
        totalQuestions: data.questions.length,
        tenantId: currentTenant?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaire-templates"] });
      toast({
        title: "Template Created",
        description: "The questionnaire template has been created successfully.",
      });
      setIsCreateDialogOpen(false);
      resetNewTemplate();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string } & Partial<typeof newTemplate>) => {
      const { id, ...rest } = data;
      return apiRequest("PATCH", `/api/questionnaire-templates/${id}`, {
        ...rest,
        totalQuestions: rest.questions?.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaire-templates"] });
      toast({
        title: "Template Updated",
        description: "The questionnaire template has been updated successfully.",
      });
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/questionnaire-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaire-templates"] });
      toast({
        title: "Template Deleted",
        description: "The questionnaire template has been deleted.",
      });
      setIsDeleteDialogOpen(false);
      setTemplateToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/questionnaire-templates/${id}/duplicate`, {
        tenantId: currentTenant?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaire-templates"] });
      toast({
        title: "Template Duplicated",
        description: "A copy of the template has been created.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to duplicate template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/questionnaire-templates/seed");
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaire-templates"] });
      toast({
        title: "Templates Seeded",
        description: data.message || "System templates have been created.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to seed templates. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetNewTemplate = () => {
    setNewTemplate({
      name: "",
      shortName: "",
      description: "",
      category: "vendor_risk",
      version: "1.0",
      estimatedTime: 30,
      tags: [],
      questions: [],
      isActive: true,
    });
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "system" && template.isSystem) ||
      (activeTab === "custom" && !template.isSystem);
    
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
    
    return matchesSearch && matchesTab && matchesCategory;
  });

  const openTemplateDetail = (template: QuestionnaireTemplate) => {
    setSelectedTemplate(template);
    setDetailSheetOpen(true);
  };

  const openEditDialog = (template: QuestionnaireTemplate) => {
    setSelectedTemplate(template);
    setNewTemplate({
      name: template.name,
      shortName: template.shortName,
      description: template.description || "",
      category: template.category,
      version: template.version || "1.0",
      estimatedTime: template.estimatedTime || 30,
      tags: template.tags || [],
      questions: (template.questions as Question[]) || [],
      isActive: template.isActive ?? true,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (template: QuestionnaireTemplate) => {
    setTemplateToDelete(template);
    setIsDeleteDialogOpen(true);
  };

  const groupQuestionsBySection = (questions: Question[]) => {
    const sections: Record<string, Question[]> = {};
    questions.forEach((q) => {
      if (!sections[q.section]) {
        sections[q.section] = [];
      }
      sections[q.section].push(q);
    });
    return sections;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Questionnaire Templates</h1>
          <p className="text-muted-foreground mt-1">
            Manage assessment questionnaire templates for vendor risk, privacy, and compliance evaluations
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-template">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">
              All ({templates.length})
            </TabsTrigger>
            <TabsTrigger value="system" data-testid="tab-system">
              System ({templates.filter((t) => t.isSystem).length})
            </TabsTrigger>
            <TabsTrigger value="custom" data-testid="tab-custom">
              Custom ({templates.filter((t) => !t.isSystem).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-templates"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40" data-testid="select-category-filter">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="vendor_risk">Vendor Risk</SelectItem>
              <SelectItem value="privacy">Privacy</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || categoryFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first questionnaire template to get started"}
          </p>
          {!searchQuery && categoryFilter === "all" && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => seedMutation.mutate()}
                disabled={seedMutation.isPending}
                data-testid="button-seed-templates"
              >
                {seedMutation.isPending ? "Seeding..." : "Seed System Templates"}
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const categoryInfo = categoryConfig[template.category] || categoryConfig.vendor_risk;
            const CategoryIcon = categoryInfo.icon;

            return (
              <Card
                key={template.id}
                className="hover-elevate cursor-pointer transition-all"
                onClick={() => openTemplateDetail(template)}
                data-testid={`card-template-${template.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={categoryInfo.color}>
                          <CategoryIcon className="h-3 w-3 mr-1" />
                          {categoryInfo.label}
                        </Badge>
                        {template.isSystem && (
                          <Badge variant="secondary" className="text-xs">
                            System
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base font-medium line-clamp-1">
                        {template.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground font-mono">
                        {template.shortName}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button size="icon" variant="ghost" data-testid={`button-menu-${template.id}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openTemplateDetail(template); }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {!template.isSystem && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(template); }}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); duplicateMutation.mutate(template.id); }}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        {!template.isSystem && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => { e.stopPropagation(); handleDeleteClick(template); }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <HelpCircle className="h-4 w-4" />
                        <span>{template.totalQuestions} questions</span>
                      </div>
                      {template.estimatedTime && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{template.estimatedTime} min</span>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedTemplate && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2 mb-1">
                  {(() => {
                    const categoryInfo = categoryConfig[selectedTemplate.category] || categoryConfig.vendor_risk;
                    return (
                      <Badge variant="outline" className={categoryInfo.color}>
                        {categoryInfo.label}
                      </Badge>
                    );
                  })()}
                  {selectedTemplate.isSystem && (
                    <Badge variant="secondary">System Template</Badge>
                  )}
                  {!selectedTemplate.isActive && (
                    <Badge variant="outline" className="text-muted-foreground">
                      Inactive
                    </Badge>
                  )}
                </div>
                <SheetTitle>{selectedTemplate.name}</SheetTitle>
                <SheetDescription className="font-mono">
                  {selectedTemplate.shortName} {selectedTemplate.version && `v${selectedTemplate.version}`}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedTemplate.description || "No description provided."}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <HelpCircle className="h-4 w-4" />
                      <span>Questions</span>
                    </div>
                    <p className="font-medium">{selectedTemplate.totalQuestions}</p>
                  </div>
                  {selectedTemplate.estimatedTime && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Clock className="h-4 w-4" />
                        <span>Est. Time</span>
                      </div>
                      <p className="font-medium">{selectedTemplate.estimatedTime} minutes</p>
                    </div>
                  )}
                </div>

                {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Tag className="h-4 w-4" />
                      <span>Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-4">Questions Preview</h4>
                  <ScrollArea className="h-[400px] pr-4">
                    {Object.entries(groupQuestionsBySection((selectedTemplate.questions as Question[]) || [])).map(
                      ([section, questions]) => (
                        <div key={section} className="mb-6">
                          <h5 className="text-sm font-medium text-muted-foreground mb-3">
                            {section}
                          </h5>
                          <div className="space-y-3">
                            {questions.map((q, idx) => (
                              <div
                                key={q.id}
                                className="p-3 rounded-md bg-muted/50 border border-border/50"
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-xs text-muted-foreground font-mono mt-0.5">
                                    {idx + 1}.
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-sm">
                                      {q.question}
                                      {q.required && (
                                        <span className="text-destructive ml-1">*</span>
                                      )}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge variant="outline" className="text-xs">
                                        {questionTypeLabels[q.type]}
                                      </Badge>
                                      {q.options && q.options.length > 0 && (
                                        <span className="text-xs text-muted-foreground">
                                          {q.options.length} options
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </ScrollArea>
                </div>

                <Separator />

                <div className="flex gap-2">
                  {!selectedTemplate.isSystem && (
                    <Button
                      className="flex-1"
                      onClick={() => {
                        setDetailSheetOpen(false);
                        openEditDialog(selectedTemplate);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Template
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => duplicateMutation.mutate(selectedTemplate.id)}
                    disabled={duplicateMutation.isPending}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Questionnaire Template</DialogTitle>
            <DialogDescription>
              Create a new questionnaire template for assessments. You can add questions after creation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Vendor Security Assessment"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  data-testid="input-template-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortName">Short Name / Code</Label>
                <Input
                  id="shortName"
                  placeholder="e.g., VSA-01"
                  value={newTemplate.shortName}
                  onChange={(e) => setNewTemplate({ ...newTemplate, shortName: e.target.value })}
                  data-testid="input-template-shortname"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose and scope of this questionnaire..."
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                rows={3}
                data-testid="input-template-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newTemplate.category}
                  onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value })}
                >
                  <SelectTrigger data-testid="select-template-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendor_risk">Vendor Risk</SelectItem>
                    <SelectItem value="privacy">Privacy</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  placeholder="1.0"
                  value={newTemplate.version}
                  onChange={(e) => setNewTemplate({ ...newTemplate, version: e.target.value })}
                  data-testid="input-template-version"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedTime">Estimated Completion Time (minutes)</Label>
              <Input
                id="estimatedTime"
                type="number"
                min={1}
                value={newTemplate.estimatedTime}
                onChange={(e) => setNewTemplate({ ...newTemplate, estimatedTime: parseInt(e.target.value) || 30 })}
                data-testid="input-template-time"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">
                  Inactive templates won't appear in assessment options
                </p>
              </div>
              <Switch
                checked={newTemplate.isActive}
                onCheckedChange={(checked) => setNewTemplate({ ...newTemplate, isActive: checked })}
                data-testid="switch-template-active"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(newTemplate)}
              disabled={!newTemplate.name || !newTemplate.shortName || createMutation.isPending}
              data-testid="button-submit-template"
            >
              {createMutation.isPending ? "Creating..." : "Create Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Questionnaire Template</DialogTitle>
            <DialogDescription>
              Update the template details. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Template Name</Label>
                <Input
                  id="edit-name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  data-testid="input-edit-template-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-shortName">Short Name / Code</Label>
                <Input
                  id="edit-shortName"
                  value={newTemplate.shortName}
                  onChange={(e) => setNewTemplate({ ...newTemplate, shortName: e.target.value })}
                  data-testid="input-edit-template-shortname"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                rows={3}
                data-testid="input-edit-template-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newTemplate.category}
                  onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value })}
                >
                  <SelectTrigger data-testid="select-edit-template-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendor_risk">Vendor Risk</SelectItem>
                    <SelectItem value="privacy">Privacy</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-version">Version</Label>
                <Input
                  id="edit-version"
                  value={newTemplate.version}
                  onChange={(e) => setNewTemplate({ ...newTemplate, version: e.target.value })}
                  data-testid="input-edit-template-version"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-estimatedTime">Estimated Completion Time (minutes)</Label>
              <Input
                id="edit-estimatedTime"
                type="number"
                min={1}
                value={newTemplate.estimatedTime}
                onChange={(e) => setNewTemplate({ ...newTemplate, estimatedTime: parseInt(e.target.value) || 30 })}
                data-testid="input-edit-template-time"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">
                  Inactive templates won't appear in assessment options
                </p>
              </div>
              <Switch
                checked={newTemplate.isActive}
                onCheckedChange={(checked) => setNewTemplate({ ...newTemplate, isActive: checked })}
                data-testid="switch-edit-template-active"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedTemplate) {
                  updateMutation.mutate({ id: selectedTemplate.id, ...newTemplate });
                }
              }}
              disabled={!newTemplate.name || !newTemplate.shortName || updateMutation.isPending}
              data-testid="button-save-template"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => templateToDelete && deleteMutation.mutate(templateToDelete.id)}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
