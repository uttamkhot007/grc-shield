import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Mail,
  Key,
  Ticket,
  Shield,
  Database,
  Bug,
  Settings2,
  Check,
  X,
  Edit,
  Trash2,
  Power,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  FormDescription,
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
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  fetchIntegrationSettings, 
  createIntegrationSetting, 
  updateIntegrationSetting, 
  deleteIntegrationSetting,
  fetchTenants,
} from "@/lib/api";
import { useTenant } from "@/contexts/tenant-context";
import type { IntegrationSetting, Tenant } from "@shared/schema";

const integrationTypes = {
  email: { icon: Mail, label: "Email", description: "Email service integration" },
  identity: { icon: Key, label: "Identity", description: "Identity and access management" },
  itsm: { icon: Ticket, label: "ITSM", description: "IT Service Management" },
  edr: { icon: Shield, label: "EDR", description: "Endpoint Detection & Response" },
  siem: { icon: Database, label: "SIEM", description: "Security Information & Event Management" },
  vulnerability: { icon: Bug, label: "Vulnerability", description: "Vulnerability scanning platforms" },
};

const providerOptions = {
  email: ["Microsoft 365", "Google Workspace", "SendGrid", "Mailgun", "Amazon SES", "SMTP"],
  identity: ["Okta", "Azure AD", "Auth0", "Ping Identity", "OneLogin", "JumpCloud"],
  itsm: ["ServiceNow", "Jira Service Management", "Zendesk", "Freshservice", "BMC Helix", "ManageEngine"],
  edr: ["CrowdStrike", "SentinelOne", "Microsoft Defender", "Carbon Black", "Sophos", "Trend Micro"],
  siem: ["Splunk", "Microsoft Sentinel", "IBM QRadar", "Elastic SIEM", "LogRhythm", "Sumo Logic"],
  vulnerability: ["Tenable", "Qualys", "Rapid7", "Nessus", "OpenVAS", "Burp Suite"],
};

const integrationFormSchema = z.object({
  integrationType: z.enum(["email", "identity", "itsm", "edr", "siem", "vulnerability"]),
  provider: z.string().min(1, "Provider is required"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  isEnabled: z.boolean().default(false),
});

type IntegrationFormValues = z.infer<typeof integrationFormSchema>;

function IntegrationCard({ 
  setting, 
  onEdit, 
  onDelete,
  onToggle,
}: { 
  setting: IntegrationSetting; 
  onEdit: () => void; 
  onDelete: () => void;
  onToggle: () => void;
}) {
  const typeInfo = integrationTypes[setting.integrationType as keyof typeof integrationTypes];
  const Icon = typeInfo?.icon || Settings2;

  return (
    <Card className="glass-card" data-testid={`integration-card-${setting.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${setting.isEnabled ? 'bg-chart-2/10' : 'bg-muted'}`}>
              <Icon className={`h-5 w-5 ${setting.isEnabled ? 'text-chart-2' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{setting.name}</CardTitle>
              <CardDescription className="text-xs mt-1">{setting.provider}</CardDescription>
            </div>
          </div>
          <Switch 
            checked={setting.isEnabled || false} 
            onCheckedChange={onToggle}
            data-testid={`toggle-integration-${setting.id}`}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {typeInfo?.label || setting.integrationType}
          </Badge>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit} data-testid={`edit-integration-${setting.id}`}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive" data-testid={`delete-integration-${setting.id}`}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {setting.lastSyncAt && (
          <p className="text-xs text-muted-foreground mt-2">
            Last synced: {new Date(setting.lastSyncAt).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function IntegrationsPage() {
  const { currentTenantId } = useTenant();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<IntegrationSetting | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["/api/integration-settings", currentTenantId || "all"],
    queryFn: () => fetchIntegrationSettings(currentTenantId || undefined),
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ["/api/tenants"],
    queryFn: fetchTenants,
  });

  const getTenantName = (tenantId: string | null) => {
    if (!tenantId) return "All Organizations";
    const tenant = tenants.find((t: Tenant) => t.id === tenantId);
    return tenant?.name || "Unknown";
  };

  const form = useForm<IntegrationFormValues>({
    resolver: zodResolver(integrationFormSchema),
    defaultValues: {
      integrationType: "email",
      provider: "",
      name: "",
      isEnabled: false,
    },
  });

  const selectedType = form.watch("integrationType");

  const createMutation = useMutation({
    mutationFn: createIntegrationSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integration-settings"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Integration created",
        description: "The integration has been configured successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create integration.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IntegrationSetting> }) => 
      updateIntegrationSetting(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integration-settings"] });
      setIsEditDialogOpen(false);
      toast({
        title: "Integration updated",
        description: "The integration has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update integration.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteIntegrationSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integration-settings"] });
      setIsDeleteDialogOpen(false);
      setSelectedSetting(null);
      toast({
        title: "Integration deleted",
        description: "The integration has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete integration.",
        variant: "destructive",
      });
    },
  });

  const filteredSettings = activeTab === "all" 
    ? settings 
    : settings.filter((s: IntegrationSetting) => s.integrationType === activeTab);

  const onCreateSubmit = (data: IntegrationFormValues) => {
    createMutation.mutate({
      ...data,
      tenantId: currentTenantId || null,
      status: data.isEnabled ? "active" : "inactive",
    } as any);
  };

  const onEditSubmit = (data: IntegrationFormValues) => {
    if (!selectedSetting) return;
    updateMutation.mutate({
      id: selectedSetting.id,
      data: {
        ...data,
        status: data.isEnabled ? "active" : "inactive",
      } as any,
    });
  };

  const handleToggle = (setting: IntegrationSetting) => {
    updateMutation.mutate({
      id: setting.id,
      data: {
        isEnabled: !setting.isEnabled,
        status: !setting.isEnabled ? "active" : "inactive",
      } as any,
    });
  };

  const openEditDialog = (setting: IntegrationSetting) => {
    form.reset({
      integrationType: setting.integrationType as any,
      provider: setting.provider,
      name: setting.name,
      isEnabled: setting.isEnabled || false,
    });
    setSelectedSetting(setting);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (setting: IntegrationSetting) => {
    setSelectedSetting(setting);
    setIsDeleteDialogOpen(true);
  };

  const integrationCounts = Object.keys(integrationTypes).reduce((acc, type) => {
    acc[type] = settings.filter((s: IntegrationSetting) => s.integrationType === type).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold gradient-text">Integration Settings</h1>
            <p className="text-muted-foreground mt-1">
              Configure integrations with Email, Identity, ITSM, EDR, SIEM, and Vulnerability platforms
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="glossy-btn" data-testid="button-new-integration">
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="all" data-testid="tab-all">
              All ({settings.length})
            </TabsTrigger>
            {Object.entries(integrationTypes).map(([key, { icon: Icon, label }]) => (
              <TabsTrigger key={key} value={key} data-testid={`tab-${key}`}>
                <Icon className="h-4 w-4 mr-1" />
                {label} ({integrationCounts[key] || 0})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="glass-card">
                    <CardHeader>
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredSettings.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Settings2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No integrations configured</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Add your first integration to connect with external platforms.
                  </p>
                  <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Integration
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSettings.map((setting: IntegrationSetting) => (
                  <IntegrationCard
                    key={setting.id}
                    setting={setting}
                    onEdit={() => openEditDialog(setting)}
                    onDelete={() => openDeleteDialog(setting)}
                    onToggle={() => handleToggle(setting)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Integration</DialogTitle>
              <DialogDescription>
                Configure a new integration with an external platform.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="integrationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Integration Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-integration-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(integrationTypes).map(([key, { icon: Icon, label, description }]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span>{label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {integrationTypes[selectedType as keyof typeof integrationTypes]?.description}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-integration-provider">
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {providerOptions[selectedType as keyof typeof providerOptions]?.map((provider) => (
                            <SelectItem key={provider} value={provider}>
                              {provider}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Production Email" {...field} data-testid="input-integration-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <FormLabel>Enable Integration</FormLabel>
                        <FormDescription className="text-xs">
                          Activate this integration immediately
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-create-integration-submit">
                    {createMutation.isPending ? "Creating..." : "Add Integration"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Integration</DialogTitle>
              <DialogDescription>
                Update the integration configuration.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="integrationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Integration Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(integrationTypes).map(([key, { label }]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {providerOptions[selectedType as keyof typeof providerOptions]?.map((provider) => (
                            <SelectItem key={provider} value={provider}>
                              {provider}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Production Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <FormLabel>Enable Integration</FormLabel>
                        <FormDescription className="text-xs">
                          Activate this integration
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
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

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Integration</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this integration? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedSetting && deleteMutation.mutate(selectedSetting.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
