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
  Workflow,
  BookTemplate,
  Building2,
  User,
  Sparkles,
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
  fetchProcesses, 
  createProcess, 
  updateProcess, 
  deleteProcess,
  fetchProcessTemplates,
  fetchTenants,
} from "@/lib/api";
import { useTenant } from "@/contexts/tenant-context";
import type { Process, ProcessTemplate, Tenant } from "@shared/schema";
import { ApprovalWorkflowDialog } from "@/components/ApprovalWorkflowDialog";
import { apiRequest } from "@/lib/queryClient";

const statusStyles = {
  approved: { bg: "bg-chart-2/20", text: "text-chart-2", icon: CheckCircle2 },
  pending: { bg: "bg-chart-3/20", text: "text-chart-3", icon: Clock },
  draft: { bg: "bg-muted", text: "text-muted-foreground", icon: FileText },
  rejected: { bg: "bg-destructive/20", text: "text-destructive", icon: XCircle },
  active: { bg: "bg-chart-2/20", text: "text-chart-2", icon: CheckCircle2 },
};

const processFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.string().min(1, "Category is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  version: z.string().min(1, "Version is required"),
  description: z.string().optional(),
});

type ProcessFormValues = z.infer<typeof processFormSchema>;

const categoryOptions = [
  "Incident Response",
  "Change Management",
  "Access Management",
  "Backup & Recovery",
  "Vulnerability Management",
  "Security Monitoring",
  "Asset Management",
  "User Onboarding/Offboarding",
  "Risk Assessment",
  "Third Party Management",
  "Data Classification",
  "Business Continuity",
];

function ProcessCard({ process, onClick }: { process: Process; onClick: () => void }) {
  const status = (process.status as keyof typeof statusStyles) || "draft";
  const StatusIcon = statusStyles[status]?.icon || FileText;

  return (
    <Card
      className="glass-card cursor-pointer transition-all hover:shadow-lg hover:border-primary/30"
      onClick={onClick}
      data-testid={`process-card-${process.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Workflow className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{process.title}</CardTitle>
              <CardDescription className="text-xs mt-1">{process.category}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={`${statusStyles[status]?.bg} ${statusStyles[status]?.text} border-0`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {process.description || "No description available"}
        </p>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>Version {process.version}</span>
          <span>{process.createdAt ? new Date(process.createdAt).toLocaleDateString() : "N/A"}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function TemplateCard({ template, onUse }: { template: ProcessTemplate; onUse: () => void }) {
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
          {template.description || "Standard process template"}
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

export default function ProcessesPage() {
  const { currentTenantId } = useTenant();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [activeTab, setActiveTab] = useState("processes");
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);

  const { data: processes = [], isLoading } = useQuery({
    queryKey: ["/api/processes", currentTenantId || "all"],
    queryFn: () => fetchProcesses(currentTenantId || undefined),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["/api/process-templates"],
    queryFn: fetchProcessTemplates,
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ["/api/tenants"],
    queryFn: fetchTenants,
  });

  const getTenantName = (tenantId: string | null) => {
    if (!tenantId) return "Unknown";
    const tenant = tenants.find((t: Tenant) => t.id === tenantId);
    return tenant?.name || "Unknown";
  };

  const createForm = useForm<ProcessFormValues>({
    resolver: zodResolver(processFormSchema),
    defaultValues: {
      title: "",
      category: "",
      content: "",
      version: "1.0",
      description: "",
    },
  });

  const editForm = useForm<ProcessFormValues>({
    resolver: zodResolver(processFormSchema),
    defaultValues: {
      title: "",
      category: "",
      content: "",
      version: "1.0",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createProcess,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/processes"] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      toast({
        title: "Process created",
        description: "The process has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create process.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Process> }) => updateProcess(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/processes"] });
      setIsEditDialogOpen(false);
      toast({
        title: "Process updated",
        description: "The process has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update process.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProcess,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/processes"] });
      setIsDeleteDialogOpen(false);
      setIsDetailSheetOpen(false);
      setSelectedProcess(null);
      toast({
        title: "Process deleted",
        description: "The process has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete process.",
        variant: "destructive",
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, approverId }: { id: string; approverId: string }) => {
      return apiRequest("POST", `/api/processes/${id}/approve`, { approverId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/processes"] });
      toast({
        title: "Process Approved",
        description: "The process has been approved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve process.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/processes/${id}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/processes"] });
      toast({
        title: "Process Rejected",
        description: "The process has been rejected.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject process.",
        variant: "destructive",
      });
    },
  });

  const filteredProcesses = processes.filter((p: Process) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleUseTemplate = (template: ProcessTemplate) => {
    createForm.reset({
      title: template.name,
      category: template.category || "",
      content: template.content || "",
      version: "1.0",
      description: template.description || "",
    });
    setIsCreateDialogOpen(true);
  };

  const onCreateSubmit = (data: ProcessFormValues) => {
    createMutation.mutate({
      ...data,
      tenantId: currentTenantId || null,
      status: "draft",
    } as any);
  };

  const onEditSubmit = (data: ProcessFormValues) => {
    if (!selectedProcess) return;
    updateMutation.mutate({
      id: selectedProcess.id,
      data: data as any,
    });
  };

  const openEditDialog = (process: Process) => {
    editForm.reset({
      title: process.title,
      category: process.category || "",
      content: process.content || "",
      version: process.version || "1.0",
      description: process.description || "",
    });
    setSelectedProcess(process);
    setIsEditDialogOpen(true);
  };

  const openDetailSheet = (process: Process) => {
    setSelectedProcess(process);
    setIsDetailSheetOpen(true);
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold gradient-text">Processes & Procedures</h1>
            <p className="text-muted-foreground mt-1">
              Manage organizational processes and standard operating procedures
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="glossy-btn" data-testid="button-new-process">
            <Plus className="h-4 w-4 mr-2" />
            New Process
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="processes" data-testid="tab-processes">
              <Workflow className="h-4 w-4 mr-2" />
              Processes ({processes.length})
            </TabsTrigger>
            <TabsTrigger value="templates" data-testid="tab-templates">
              <BookTemplate className="h-4 w-4 mr-2" />
              Templates ({templates.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="processes" className="mt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search processes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-processes"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="glass-card">
                    <CardHeader>
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-12 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProcesses.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Workflow className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No processes found</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Create your first process or use a template to get started.
                  </p>
                  <Button className="mt-4" onClick={() => setActiveTab("templates")}>
                    <BookTemplate className="h-4 w-4 mr-2" />
                    Browse Templates
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredProcesses.map((process: Process) => (
                  <ProcessCard
                    key={process.id}
                    process={process}
                    onClick={() => openDetailSheet(process)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            {templates.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookTemplate className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No templates available</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Templates will be added to help you get started quickly.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template: ProcessTemplate) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onUse={() => handleUseTemplate(template)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Process</DialogTitle>
              <DialogDescription>
                Define a new process or procedure for your organization.
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
                        <Input placeholder="Process title" {...field} data-testid="input-process-title" />
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
                            <SelectTrigger data-testid="select-process-category">
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
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Version</FormLabel>
                        <FormControl>
                          <Input placeholder="1.0" {...field} data-testid="input-process-version" />
                        </FormControl>
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
                        <Textarea placeholder="Brief description..." {...field} data-testid="input-process-description" />
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
                      <FormLabel>Process Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detailed process steps and procedures..." 
                          className="min-h-[200px]"
                          {...field} 
                          data-testid="input-process-content"
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
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-create-process-submit">
                    {createMutation.isPending ? "Creating..." : "Create Process"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Process</DialogTitle>
              <DialogDescription>
                Update the process details.
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
                        <Input placeholder="Process title" {...field} />
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
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Version</FormLabel>
                        <FormControl>
                          <Input placeholder="1.0" {...field} />
                        </FormControl>
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
                        <Textarea placeholder="Brief description..." {...field} />
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
                      <FormLabel>Process Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detailed process steps and procedures..." 
                          className="min-h-[200px]"
                          {...field} 
                        />
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
          <SheetContent className="sm:max-w-xl overflow-y-auto">
            {selectedProcess && (
              <>
                <SheetHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Workflow className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <SheetTitle>{selectedProcess.title}</SheetTitle>
                      <SheetDescription>{selectedProcess.category}</SheetDescription>
                    </div>
                  </div>
                </SheetHeader>

                <div className="mt-6 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(selectedProcess)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Version:</span>
                        <span className="ml-2">{selectedProcess.version}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <Badge className="ml-2" variant="outline">
                          {selectedProcess.status}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Organization:</span>
                        <span className="ml-2">{getTenantName(selectedProcess.tenantId)}</span>
                      </div>
                    </div>
                  </div>

                  {selectedProcess.description && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">{selectedProcess.description}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium mb-2">Process Content</h4>
                    <Card>
                      <CardContent className="pt-4">
                        <pre className="text-sm whitespace-pre-wrap">{selectedProcess.content || "No content available"}</pre>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  <div className="flex flex-wrap gap-2">
                    {selectedProcess.status === "draft" && (
                      <Button 
                        onClick={() => setIsApprovalDialogOpen(true)}
                        data-testid="button-submit-for-approval"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Submit for Approval
                      </Button>
                    )}
                    {selectedProcess.status === "pending" && (
                      <>
                        <Button 
                          variant="default"
                          onClick={() => approveMutation.mutate({ id: selectedProcess.id, approverId: "demo-user" })}
                          disabled={approveMutation.isPending}
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => rejectMutation.mutate(selectedProcess.id)}
                          disabled={rejectMutation.isPending}
                        >
                          <ThumbsDown className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                    <Button variant="outline" onClick={() => openEditDialog(selectedProcess)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
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
              </>
            )}
          </SheetContent>
        </Sheet>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Process</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this process? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedProcess && deleteMutation.mutate(selectedProcess.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Approval Workflow Dialog */}
        {selectedProcess && (
          <ApprovalWorkflowDialog
            isOpen={isApprovalDialogOpen}
            onClose={() => setIsApprovalDialogOpen(false)}
            entityType="process"
            entityId={selectedProcess.id}
            entityTitle={selectedProcess.title}
            entityVersion={selectedProcess.version || "1.0"}
            entityStatus={selectedProcess.status || "draft"}
          />
        )}
      </div>
    </div>
  );
}
