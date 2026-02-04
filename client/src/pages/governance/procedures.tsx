import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Edit,
  Trash2,
  X,
  FileDown,
  ListChecks,
  BookTemplate,
  Building2,
  User,
  Sparkles,
  ChevronRight,
  Send,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  fetchProcedures, 
  createProcedure, 
  updateProcedure, 
  deleteProcedure,
  fetchProcedureTemplates,
  fetchTenants,
} from "@/lib/api";
import { useTenant } from "@/contexts/tenant-context";
import type { Procedure, ProcedureTemplate, Tenant } from "@shared/schema";
import { ApprovalWorkflowDialog } from "@/components/ApprovalWorkflowDialog";
import { apiRequest } from "@/lib/queryClient";

const statusStyles = {
  approved: { bg: "bg-chart-2/20", text: "text-chart-2", icon: CheckCircle2 },
  pending: { bg: "bg-chart-3/20", text: "text-chart-3", icon: Clock },
  draft: { bg: "bg-muted", text: "text-muted-foreground", icon: FileText },
  rejected: { bg: "bg-destructive/20", text: "text-destructive", icon: XCircle },
  active: { bg: "bg-chart-2/20", text: "text-chart-2", icon: CheckCircle2 },
};

const procedureTypeStyles = {
  global: { bg: "bg-chart-1/20", text: "text-chart-1" },
  industry: { bg: "bg-chart-2/20", text: "text-chart-2" },
  regional: { bg: "bg-chart-3/20", text: "text-chart-3" },
};

const procedureFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.string().min(1, "Category is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  version: z.string().min(1, "Version is required"),
  description: z.string().optional(),
  procedureType: z.enum(["global", "industry", "regional"]).default("industry"),
});

type ProcedureFormValues = z.infer<typeof procedureFormSchema>;

const categoryOptions = [
  "Access Control",
  "Incident Management",
  "Backup & Recovery",
  "Vulnerability Management",
  "Change Management",
  "User Provisioning",
  "Access Review",
  "Security Monitoring",
  "Compliance",
  "Privacy",
  "Audit",
  "Documentation",
];

interface Step {
  step: number;
  action: string;
  responsible: string;
}

function ProcedureCard({ procedure, onClick }: { procedure: Procedure; onClick: () => void }) {
  const status = (procedure.status as keyof typeof statusStyles) || "draft";
  const procedureType = (procedure.procedureType as keyof typeof procedureTypeStyles) || "industry";
  const StatusIcon = statusStyles[status]?.icon || FileText;

  return (
    <Card
      className="glass-card cursor-pointer transition-all hover:shadow-lg hover:border-primary/30"
      onClick={onClick}
      data-testid={`procedure-card-${procedure.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ListChecks className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{procedure.title}</CardTitle>
              <CardDescription className="text-xs mt-1">{procedure.category}</CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className={`${statusStyles[status]?.bg} ${statusStyles[status]?.text} border-0`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status}
            </Badge>
            <Badge variant="outline" className={`${procedureTypeStyles[procedureType]?.bg} ${procedureTypeStyles[procedureType]?.text} border-0 text-xs`}>
              {procedureType}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {procedure.description || "No description available"}
        </p>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>Version {procedure.version}</span>
          <span>{procedure.createdAt ? new Date(procedure.createdAt).toLocaleDateString() : "N/A"}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function TemplateCard({ template, onUse }: { template: ProcedureTemplate; onUse: () => void }) {
  return (
    <Card className="glass-card transition-all hover:shadow-lg hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-1/10">
              <BookTemplate className="h-5 w-5 text-chart-1" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{template.name}</CardTitle>
              <CardDescription className="text-xs mt-1">{template.category}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {template.description || "Standard procedure template"}
        </p>
        <Button 
          size="sm" 
          className="mt-3 w-full"
          onClick={onUse}
          data-testid={`use-template-${template.id}`}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Use Template
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ProceduresPage() {
  const { currentTenantId } = useTenant();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  const [activeTab, setActiveTab] = useState("procedures");
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);

  const { data: procedures = [], isLoading } = useQuery({
    queryKey: ["/api/procedures", currentTenantId || "all"],
    queryFn: () => fetchProcedures(currentTenantId || undefined),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["/api/procedure-templates"],
    queryFn: fetchProcedureTemplates,
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ["/api/tenants"],
    queryFn: fetchTenants,
  });

  const getTenantName = (tenantId: string | null) => {
    if (!tenantId) return "Global";
    const tenant = tenants.find((t: Tenant) => t.id === tenantId);
    return tenant?.name || "Unknown";
  };

  const createForm = useForm<ProcedureFormValues>({
    resolver: zodResolver(procedureFormSchema),
    defaultValues: {
      title: "",
      category: "",
      content: "",
      version: "1.0",
      description: "",
      procedureType: "industry",
    },
  });

  const editForm = useForm<ProcedureFormValues>({
    resolver: zodResolver(procedureFormSchema),
    defaultValues: {
      title: "",
      category: "",
      content: "",
      version: "1.0",
      description: "",
      procedureType: "industry",
    },
  });

  const createMutation = useMutation({
    mutationFn: createProcedure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/procedures"] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      toast({
        title: "Procedure created",
        description: "The procedure has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create procedure.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Procedure> }) => updateProcedure(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/procedures"] });
      setIsEditDialogOpen(false);
      toast({
        title: "Procedure updated",
        description: "The procedure has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update procedure.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProcedure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/procedures"] });
      setIsDeleteDialogOpen(false);
      setIsDetailSheetOpen(false);
      setSelectedProcedure(null);
      toast({
        title: "Procedure deleted",
        description: "The procedure has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete procedure.",
        variant: "destructive",
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, approverId }: { id: string; approverId: string }) => {
      return apiRequest("POST", `/api/procedures/${id}/approve`, { approverId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/procedures"] });
      toast({
        title: "Procedure Approved",
        description: "The procedure has been approved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve procedure.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/procedures/${id}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/procedures"] });
      toast({
        title: "Procedure Rejected",
        description: "The procedure has been rejected.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject procedure.",
        variant: "destructive",
      });
    },
  });

  const filteredProcedures = procedures.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const globalProcedures = filteredProcedures.filter(p => p.procedureType === "global" || !p.tenantId);
  const industryProcedures = filteredProcedures.filter(p => p.procedureType === "industry");
  const regionalProcedures = filteredProcedures.filter(p => p.procedureType === "regional");

  const onCreateSubmit = (data: ProcedureFormValues) => {
    createMutation.mutate({
      ...data,
      tenantId: currentTenantId || undefined,
      status: "draft",
    } as any);
  };

  const onEditSubmit = (data: ProcedureFormValues) => {
    if (selectedProcedure) {
      updateMutation.mutate({ id: selectedProcedure.id, data });
    }
  };

  const handleEditProcedure = (procedure: Procedure) => {
    setSelectedProcedure(procedure);
    editForm.reset({
      title: procedure.title,
      category: procedure.category || "",
      content: procedure.content || "",
      version: procedure.version || "1.0",
      description: procedure.description || "",
      procedureType: (procedure.procedureType as "global" | "industry" | "regional") || "industry",
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteProcedure = () => {
    if (selectedProcedure) {
      deleteMutation.mutate(selectedProcedure.id);
    }
  };

  const handleUseTemplate = (template: ProcedureTemplate) => {
    createForm.reset({
      title: template.name,
      category: template.category || "",
      content: template.content || "",
      version: "1.0",
      description: template.description || "",
      procedureType: "industry",
    });
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Procedures</h1>
          <p className="text-muted-foreground">
            Manage step-by-step operational procedures and work instructions
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="create-procedure-btn">
          <Plus className="h-4 w-4 mr-2" />
          New Procedure
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass-card">
          <TabsTrigger value="procedures" data-testid="tab-procedures">
            Procedures ({filteredProcedures.length})
          </TabsTrigger>
          <TabsTrigger value="templates" data-testid="tab-templates">
            Templates ({templates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="procedures" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search procedures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-procedures"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="glass-card">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-12 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProcedures.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ListChecks className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No procedures found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first procedure or use a template to get started.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Procedure
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {globalProcedures.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge className="bg-chart-1/20 text-chart-1 border-0">Global</Badge>
                    Procedures ({globalProcedures.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {globalProcedures.map((procedure) => (
                      <ProcedureCard
                        key={procedure.id}
                        procedure={procedure}
                        onClick={() => {
                          setSelectedProcedure(procedure);
                          setIsDetailSheetOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {industryProcedures.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge className="bg-chart-2/20 text-chart-2 border-0">Industry</Badge>
                    Procedures ({industryProcedures.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {industryProcedures.map((procedure) => (
                      <ProcedureCard
                        key={procedure.id}
                        procedure={procedure}
                        onClick={() => {
                          setSelectedProcedure(procedure);
                          setIsDetailSheetOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {regionalProcedures.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge className="bg-chart-3/20 text-chart-3 border-0">Regional</Badge>
                    Procedures ({regionalProcedures.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {regionalProcedures.map((procedure) => (
                      <ProcedureCard
                        key={procedure.id}
                        procedure={procedure}
                        onClick={() => {
                          setSelectedProcedure(procedure);
                          setIsDetailSheetOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.length === 0 ? (
              <Card className="glass-card col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookTemplate className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No templates available</h3>
                  <p className="text-muted-foreground text-center">
                    Procedure templates will appear here when available.
                  </p>
                </CardContent>
              </Card>
            ) : (
              templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUse={() => handleUseTemplate(template)}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Procedure</DialogTitle>
            <DialogDescription>
              Define a new operational procedure with step-by-step instructions.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="User Account Creation Procedure" {...field} data-testid="input-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryOptions.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="procedureType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="global">Global</SelectItem>
                          <SelectItem value="industry">Industry</SelectItem>
                          <SelectItem value="regional">Regional</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief description of the procedure..." {...field} data-testid="input-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed procedure content and instructions..." 
                        className="min-h-[150px]" 
                        {...field} 
                        data-testid="input-content"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="submit-create">
                  {createMutation.isPending ? "Creating..." : "Create Procedure"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Procedure</DialogTitle>
            <DialogDescription>
              Update the procedure details and content.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryOptions.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="procedureType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="global">Global</SelectItem>
                          <SelectItem value="industry">Industry</SelectItem>
                          <SelectItem value="regional">Regional</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[150px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              {selectedProcedure?.title}
            </SheetTitle>
            <SheetDescription>
              {selectedProcedure?.category} • Version {selectedProcedure?.version}
            </SheetDescription>
          </SheetHeader>
          
          {selectedProcedure && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-2">
                <Badge className={`${statusStyles[selectedProcedure.status as keyof typeof statusStyles]?.bg} ${statusStyles[selectedProcedure.status as keyof typeof statusStyles]?.text} border-0`}>
                  {selectedProcedure.status}
                </Badge>
                <Badge className={`${procedureTypeStyles[selectedProcedure.procedureType as keyof typeof procedureTypeStyles]?.bg} ${procedureTypeStyles[selectedProcedure.procedureType as keyof typeof procedureTypeStyles]?.text} border-0`}>
                  {selectedProcedure.procedureType || "industry"}
                </Badge>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedProcedure.description || "No description available"}
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm mb-2">Content</h4>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 rounded-lg p-4">
                  {selectedProcedure.content || "No content available"}
                </div>
              </div>

              {Array.isArray(selectedProcedure.stepByStep) && selectedProcedure.stepByStep.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Step-by-Step Instructions</h4>
                    <div className="space-y-2">
                      {(selectedProcedure.stepByStep as Step[]).map((step, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{step.action}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              <User className="inline h-3 w-3 mr-1" />
                              {step.responsible}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Tenant</span>
                  <p className="font-medium flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {getTenantName(selectedProcedure.tenantId)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created</span>
                  <p className="font-medium">
                    {selectedProcedure.createdAt ? new Date(selectedProcedure.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-4">
                {selectedProcedure.status === "draft" && (
                  <Button 
                    onClick={() => setIsApprovalDialogOpen(true)}
                    data-testid="button-submit-for-approval"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit for Approval
                  </Button>
                )}
                {selectedProcedure.status === "pending" && (
                  <>
                    <Button 
                      variant="default"
                      onClick={() => approveMutation.mutate({ id: selectedProcedure.id, approverId: "demo-user" })}
                      disabled={approveMutation.isPending}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => rejectMutation.mutate(selectedProcedure.id)}
                      disabled={rejectMutation.isPending}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => handleEditProcedure(selectedProcedure)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline">
                  <FileDown className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Procedure</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedProcedure?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProcedure}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approval Workflow Dialog */}
      {selectedProcedure && (
        <ApprovalWorkflowDialog
          isOpen={isApprovalDialogOpen}
          onClose={() => setIsApprovalDialogOpen(false)}
          entityType="procedure"
          entityId={selectedProcedure.id}
          entityTitle={selectedProcedure.title}
          entityVersion={selectedProcedure.version || "1.0"}
          entityStatus={selectedProcedure.status || "draft"}
        />
      )}
    </div>
  );
}
