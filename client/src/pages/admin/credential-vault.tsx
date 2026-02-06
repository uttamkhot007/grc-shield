import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { CredentialVault, ExternalKmsConfig, CredentialAccessLog, Tenant } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Key,
  Lock,
  Server,
  Cloud,
  Database,
  Settings,
  FileText,
  RefreshCw,
  Copy,
  CheckCircle,
  AlertTriangle,
  History,
} from "lucide-react";
type CredentialWithMasked = CredentialVault & { decryptedValue?: string };

const CREDENTIAL_TYPES = [
  { value: "api_key", label: "API Key" },
  { value: "oauth_token", label: "OAuth Token" },
  { value: "service_account", label: "Service Account" },
  { value: "database", label: "Database Credentials" },
  { value: "ssh_key", label: "SSH Key" },
  { value: "certificate", label: "Certificate" },
  { value: "password", label: "Password" },
  { value: "custom", label: "Custom" },
];

const STORAGE_TYPES = [
  { value: "local", label: "Local (Encrypted)", icon: Lock },
  { value: "external_kms", label: "External KMS", icon: Cloud },
  { value: "integration", label: "Platform Integration", icon: Server },
];

const KMS_PROVIDERS = [
  { value: "hashicorp_vault", label: "HashiCorp Vault", icon: Key, color: "#000000" },
  { value: "aws_kms", label: "AWS KMS", icon: Cloud, color: "#FF9900" },
  { value: "azure_keyvault", label: "Azure Key Vault", icon: Cloud, color: "#0078D4" },
  { value: "gcp_kms", label: "GCP Cloud KMS", icon: Cloud, color: "#4285F4" },
  { value: "custom", label: "Custom KMS", icon: Key, color: "#6B7280" },
];

const getKmsProviderIcon = (provider: string) => {
  const kms = KMS_PROVIDERS.find(k => k.value === provider);
  if (!kms) return <Key className="w-4 h-4" />;
  const Icon = kms.icon;
  return <Icon className="w-4 h-4" style={{ color: kms.color }} />;
};

const CATEGORIES = [
  "integration",
  "database",
  "api",
  "infrastructure",
  "custom",
];

export default function CredentialVaultPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("credentials");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isKmsCreateOpen, setIsKmsCreateOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<CredentialWithMasked | null>(null);
  const [viewingLogs, setViewingLogs] = useState<string | null>(null);
  const [revealedCredentials, setRevealedCredentials] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [credentialForm, setCredentialForm] = useState({
    name: "",
    description: "",
    category: "integration",
    credentialType: "api_key" as string,
    storageType: "local" as string,
    value: "",
    externalKmsId: "",
    externalPath: "",
    integrationSecretKey: "",
    rotationEnabled: false,
    rotationIntervalDays: 90,
    tags: [] as string[],
  });

  const [kmsForm, setKmsForm] = useState({
    name: "",
    description: "",
    provider: "hashicorp_vault" as string,
    endpoint: "",
    namespace: "",
    mountPath: "",
    authMethod: "token",
    tlsEnabled: true,
    tlsSkipVerify: false,
    isDefault: false,
  });

  const { data: credentials, isLoading: credentialsLoading } = useQuery<CredentialWithMasked[]>({
    queryKey: ["/api/credentials"],
  });

  const { data: kmsConfigs, isLoading: kmsLoading } = useQuery<ExternalKmsConfig[]>({
    queryKey: ["/api/kms-configs"],
  });

  const { data: tenants } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
  });

  const { data: logs, isLoading: logsLoading } = useQuery<CredentialAccessLog[]>({
    queryKey: ["/api/credentials", viewingLogs, "logs"],
    enabled: !!viewingLogs,
  });

  const createCredentialMutation = useMutation({
    mutationFn: (data: typeof credentialForm) => apiRequest("POST", "/api/credentials", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credentials"] });
      toast({ title: "Credential created successfully" });
      setIsCreateOpen(false);
      resetCredentialForm();
    },
    onError: () => {
      toast({ title: "Failed to create credential", variant: "destructive" });
    },
  });

  const updateCredentialMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof credentialForm> }) =>
      apiRequest("PATCH", `/api/credentials/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credentials"] });
      toast({ title: "Credential updated successfully" });
      setEditingCredential(null);
    },
    onError: () => {
      toast({ title: "Failed to update credential", variant: "destructive" });
    },
  });

  const deleteCredentialMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/credentials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credentials"] });
      toast({ title: "Credential deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete credential", variant: "destructive" });
    },
  });

  const createKmsMutation = useMutation({
    mutationFn: (data: typeof kmsForm) => apiRequest("POST", "/api/kms-configs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kms-configs"] });
      toast({ title: "KMS configuration created successfully" });
      setIsKmsCreateOpen(false);
      resetKmsForm();
    },
    onError: () => {
      toast({ title: "Failed to create KMS configuration", variant: "destructive" });
    },
  });

  const testKmsMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/kms-configs/${id}/test`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kms-configs"] });
      toast({ title: "KMS connection test successful" });
    },
    onError: () => {
      toast({ title: "KMS connection test failed", variant: "destructive" });
    },
  });

  const resetCredentialForm = () => {
    setCredentialForm({
      name: "",
      description: "",
      category: "integration",
      credentialType: "api_key",
      storageType: "local",
      value: "",
      externalKmsId: "",
      externalPath: "",
      integrationSecretKey: "",
      rotationEnabled: false,
      rotationIntervalDays: 90,
      tags: [],
    });
  };

  const resetKmsForm = () => {
    setKmsForm({
      name: "",
      description: "",
      provider: "hashicorp_vault",
      endpoint: "",
      namespace: "",
      mountPath: "",
      authMethod: "token",
      tlsEnabled: true,
      tlsSkipVerify: false,
      isDefault: false,
    });
  };

  const [revealedValues, setRevealedValues] = useState<Map<string, string>>(new Map());
  const revealTimeoutRef = useState<Map<string, NodeJS.Timeout>>(new Map())[0];

  const handleRevealCredential = async (id: string) => {
    if (revealedCredentials.has(id)) {
      setRevealedCredentials((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setRevealedValues((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      const timeout = revealTimeoutRef.get(id);
      if (timeout) {
        clearTimeout(timeout);
        revealTimeoutRef.delete(id);
      }
    } else {
      try {
        const response = await fetch(`/api/credentials/${id}?reveal=true`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.decryptedValue) {
          setRevealedCredentials((prev) => new Set(prev).add(id));
          setRevealedValues((prev) => new Map(prev).set(id, data.decryptedValue));
          const timeout = setTimeout(() => {
            setRevealedCredentials((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
            setRevealedValues((prev) => {
              const next = new Map(prev);
              next.delete(id);
              return next;
            });
            revealTimeoutRef.delete(id);
            toast({ title: "Credential hidden for security", description: "Auto-hidden after 60 seconds" });
          }, 60000);
          revealTimeoutRef.set(id, timeout);
        }
      } catch (error) {
        toast({ title: "Failed to reveal credential", variant: "destructive" });
      }
    }
  };

  const handleCopyCredential = async (id: string) => {
    const decryptedValue = revealedValues.get(id);
    if (decryptedValue) {
      await navigator.clipboard.writeText(decryptedValue);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast({ title: "Credential copied to clipboard" });
    } else {
      toast({ title: "Please reveal the credential first", variant: "destructive" });
    }
  };

  const getStorageTypeIcon = (type: string) => {
    switch (type) {
      case "local":
        return <Lock className="w-4 h-4" />;
      case "external_kms":
        return <Cloud className="w-4 h-4" />;
      case "integration":
        return <Server className="w-4 h-4" />;
      default:
        return <Key className="w-4 h-4" />;
    }
  };

  const getHealthBadge = (status: string | null) => {
    switch (status) {
      case "healthy":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">Healthy</Badge>;
      case "degraded":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">Degraded</Badge>;
      case "unreachable":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">Unreachable</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/30">Unknown</Badge>;
    }
  };

  if (credentialsLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <Shield className="w-8 h-8 text-pink-500" />
            Credential Vault
          </h1>
          <p className="text-muted-foreground mt-1">
            Securely store and manage integration credentials, API keys, and secrets
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="credentials" data-testid="tab-credentials">
            <Key className="w-4 h-4 mr-2" />
            Credentials
          </TabsTrigger>
          <TabsTrigger value="kms" data-testid="tab-kms">
            <Cloud className="w-4 h-4 mr-2" />
            External KMS
          </TabsTrigger>
          <TabsTrigger value="audit" data-testid="tab-audit">
            <History className="w-4 h-4 mr-2" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="credentials" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsCreateOpen(true)} data-testid="button-add-credential">
              <Plus className="w-4 h-4 mr-2" />
              Add Credential
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stored Credentials</CardTitle>
              <CardDescription>
                All credentials are encrypted at rest using AES-256-GCM encryption
              </CardDescription>
            </CardHeader>
            <CardContent>
              {credentials?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No credentials stored yet</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsCreateOpen(true)}
                    data-testid="button-add-first-credential"
                  >
                    Add your first credential
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Storage</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Rotation</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {credentials?.map((credential) => (
                      <TableRow key={credential.id} data-testid={`row-credential-${credential.id}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{credential.name}</div>
                            {credential.description && (
                              <div className="text-sm text-muted-foreground">{credential.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {CREDENTIAL_TYPES.find((t) => t.value === credential.credentialType)?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{credential.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStorageTypeIcon(credential.storageType || "local")}
                            <span className="text-sm">
                              {STORAGE_TYPES.find((s) => s.value === credential.storageType)?.label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                              {revealedCredentials.has(credential.id) && revealedValues.get(credential.id)
                                ? revealedValues.get(credential.id)
                                : "••••••••••••"}
                            </code>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRevealCredential(credential.id)}
                              data-testid={`button-reveal-${credential.id}`}
                            >
                              {revealedCredentials.has(credential.id) ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleCopyCredential(credential.id)}
                              disabled={!revealedCredentials.has(credential.id)}
                              data-testid={`button-copy-${credential.id}`}
                            >
                              {copiedId === credential.id ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {credential.rotationEnabled ? (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                              Every {credential.rotationIntervalDays} days
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">Disabled</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setViewingLogs(credential.id)}
                              data-testid={`button-logs-${credential.id}`}
                            >
                              <History className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setEditingCredential(credential)}
                              data-testid={`button-edit-${credential.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteCredentialMutation.mutate(credential.id)}
                              data-testid={`button-delete-${credential.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kms" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsKmsCreateOpen(true)} data-testid="button-add-kms">
              <Plus className="w-4 h-4 mr-2" />
              Add KMS Configuration
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>External Key Management Systems</CardTitle>
              <CardDescription>
                Configure connections to external KMS providers like HashiCorp Vault, AWS KMS, Azure Key Vault, or GCP Cloud KMS
              </CardDescription>
            </CardHeader>
            <CardContent>
              {kmsLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : kmsConfigs?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Cloud className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No external KMS configured</p>
                  <p className="text-sm mt-2">
                    Connect to HashiCorp Vault, AWS KMS, Azure Key Vault, or GCP Cloud KMS for enterprise-grade secret management
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsKmsCreateOpen(true)}
                    data-testid="button-add-first-kms"
                  >
                    Configure External KMS
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {kmsConfigs?.map((config) => (
                    <Card key={config.id} className="relative" data-testid={`card-kms-${config.id}`}>
                      {config.isDefault && (
                        <Badge className="absolute top-2 right-2 bg-purple-500">Default</Badge>
                      )}
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-600/20">
                            {getKmsProviderIcon(config.provider)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{config.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              {getKmsProviderIcon(config.provider)}
                              <span>{KMS_PROVIDERS.find((p) => p.value === config.provider)?.label}</span>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Endpoint:</span>{" "}
                          <code className="bg-muted px-1 py-0.5 rounded">{config.endpoint}</code>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Status:</span>
                            {getHealthBadge(config.healthStatus)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => testKmsMutation.mutate(config.id)}
                              disabled={testKmsMutation.isPending}
                              data-testid={`button-test-kms-${config.id}`}
                            >
                              <RefreshCw className={`w-4 h-4 mr-1 ${testKmsMutation.isPending ? "animate-spin" : ""}`} />
                              Test
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Audit Log</CardTitle>
              <CardDescription>
                Complete audit trail of all credential access, modifications, and retrievals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a credential to view its access logs</p>
                <p className="text-sm mt-2">
                  Click the history icon next to any credential in the Credentials tab
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Credential</DialogTitle>
            <DialogDescription>
              Securely store a new credential. All values are encrypted using AES-256-GCM encryption.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={credentialForm.name}
                  onChange={(e) => setCredentialForm({ ...credentialForm, name: e.target.value })}
                  placeholder="e.g., Stripe API Key"
                  data-testid="input-credential-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={credentialForm.category}
                  onValueChange={(value) => setCredentialForm({ ...credentialForm, category: value })}
                >
                  <SelectTrigger data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={credentialForm.description}
                onChange={(e) => setCredentialForm({ ...credentialForm, description: e.target.value })}
                placeholder="Optional description of this credential"
                data-testid="input-credential-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Credential Type</Label>
                <Select
                  value={credentialForm.credentialType}
                  onValueChange={(value) => setCredentialForm({ ...credentialForm, credentialType: value })}
                >
                  <SelectTrigger data-testid="select-credential-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CREDENTIAL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Storage Type</Label>
                <Select
                  value={credentialForm.storageType}
                  onValueChange={(value) => setCredentialForm({ ...credentialForm, storageType: value })}
                >
                  <SelectTrigger data-testid="select-storage-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STORAGE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {credentialForm.storageType === "local" && (
              <div className="space-y-2">
                <Label htmlFor="value">Credential Value</Label>
                <Input
                  id="value"
                  type="password"
                  value={credentialForm.value}
                  onChange={(e) => setCredentialForm({ ...credentialForm, value: e.target.value })}
                  placeholder="Enter the secret value"
                  data-testid="input-credential-value"
                />
                <p className="text-xs text-muted-foreground">
                  This value will be encrypted with AES-256-GCM before storage
                </p>
              </div>
            )}

            {credentialForm.storageType === "external_kms" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>KMS Configuration</Label>
                  <Select
                    value={credentialForm.externalKmsId}
                    onValueChange={(value) => setCredentialForm({ ...credentialForm, externalKmsId: value })}
                  >
                    <SelectTrigger data-testid="select-kms-config">
                      <SelectValue placeholder="Select KMS" />
                    </SelectTrigger>
                    <SelectContent>
                      {kmsConfigs?.map((config) => (
                        <SelectItem key={config.id} value={config.id}>
                          {config.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="externalPath">Secret Path in KMS</Label>
                  <Input
                    id="externalPath"
                    value={credentialForm.externalPath}
                    onChange={(e) => setCredentialForm({ ...credentialForm, externalPath: e.target.value })}
                    placeholder="e.g., secret/data/myapp/api-key"
                    data-testid="input-external-path"
                  />
                </div>
              </div>
            )}

            {credentialForm.storageType === "integration" && (
              <div className="space-y-2">
                <Label htmlFor="integrationSecretKey">Platform Secret Key</Label>
                <Input
                  id="integrationSecretKey"
                  value={credentialForm.integrationSecretKey}
                  onChange={(e) => setCredentialForm({ ...credentialForm, integrationSecretKey: e.target.value })}
                  placeholder="e.g., STRIPE_API_KEY"
                  data-testid="input-integration-key"
                />
                <p className="text-xs text-muted-foreground">
                  Reference to a secret managed by the platform's native secret management
                </p>
              </div>
            )}

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label>Enable Rotation</Label>
                <p className="text-sm text-muted-foreground">Automatically track credential rotation schedule</p>
              </div>
              <Switch
                checked={credentialForm.rotationEnabled}
                onCheckedChange={(checked) => setCredentialForm({ ...credentialForm, rotationEnabled: checked })}
                data-testid="switch-rotation"
              />
            </div>

            {credentialForm.rotationEnabled && (
              <div className="space-y-2">
                <Label htmlFor="rotationInterval">Rotation Interval (days)</Label>
                <Input
                  id="rotationInterval"
                  type="number"
                  value={credentialForm.rotationIntervalDays}
                  onChange={(e) =>
                    setCredentialForm({ ...credentialForm, rotationIntervalDays: parseInt(e.target.value) || 90 })
                  }
                  data-testid="input-rotation-interval"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} data-testid="button-cancel-credential">
              Cancel
            </Button>
            <Button
              onClick={() => createCredentialMutation.mutate(credentialForm)}
              disabled={!credentialForm.name || createCredentialMutation.isPending}
              data-testid="button-save-credential"
            >
              {createCredentialMutation.isPending ? "Saving..." : "Save Credential"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isKmsCreateOpen} onOpenChange={setIsKmsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure External KMS</DialogTitle>
            <DialogDescription>
              Connect to an external Key Management System for enterprise-grade secret management
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kmsName">Configuration Name</Label>
                <Input
                  id="kmsName"
                  value={kmsForm.name}
                  onChange={(e) => setKmsForm({ ...kmsForm, name: e.target.value })}
                  placeholder="e.g., Production Vault"
                  data-testid="input-kms-name"
                />
              </div>
              <div className="space-y-2">
                <Label>KMS Provider</Label>
                <Select
                  value={kmsForm.provider}
                  onValueChange={(value) => setKmsForm({ ...kmsForm, provider: value })}
                >
                  <SelectTrigger data-testid="select-kms-provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KMS_PROVIDERS.map((provider) => {
                      const Icon = provider.icon;
                      return (
                        <SelectItem key={provider.value} value={provider.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" style={{ color: provider.color }} />
                            <span>{provider.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kmsDescription">Description</Label>
              <Textarea
                id="kmsDescription"
                value={kmsForm.description}
                onChange={(e) => setKmsForm({ ...kmsForm, description: e.target.value })}
                placeholder="Optional description"
                data-testid="input-kms-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint URL</Label>
              <Input
                id="endpoint"
                value={kmsForm.endpoint}
                onChange={(e) => setKmsForm({ ...kmsForm, endpoint: e.target.value })}
                placeholder="https://vault.company.com:8200"
                data-testid="input-kms-endpoint"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="namespace">Namespace (optional)</Label>
                <Input
                  id="namespace"
                  value={kmsForm.namespace}
                  onChange={(e) => setKmsForm({ ...kmsForm, namespace: e.target.value })}
                  placeholder="e.g., admin/grc-shield"
                  data-testid="input-kms-namespace"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mountPath">Mount Path</Label>
                <Input
                  id="mountPath"
                  value={kmsForm.mountPath}
                  onChange={(e) => setKmsForm({ ...kmsForm, mountPath: e.target.value })}
                  placeholder="e.g., secret/data/"
                  data-testid="input-kms-mount-path"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Authentication Method</Label>
              <Select
                value={kmsForm.authMethod}
                onValueChange={(value) => setKmsForm({ ...kmsForm, authMethod: value })}
              >
                <SelectTrigger data-testid="select-auth-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="token">Token</SelectItem>
                  <SelectItem value="approle">AppRole</SelectItem>
                  <SelectItem value="kubernetes">Kubernetes</SelectItem>
                  <SelectItem value="aws">AWS IAM</SelectItem>
                  <SelectItem value="azure">Azure</SelectItem>
                  <SelectItem value="gcp">GCP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label>TLS Enabled</Label>
                <p className="text-sm text-muted-foreground">Use HTTPS for secure communication</p>
              </div>
              <Switch
                checked={kmsForm.tlsEnabled}
                onCheckedChange={(checked) => setKmsForm({ ...kmsForm, tlsEnabled: checked })}
                data-testid="switch-tls"
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label>Set as Default</Label>
                <p className="text-sm text-muted-foreground">Use this KMS for new credentials by default</p>
              </div>
              <Switch
                checked={kmsForm.isDefault}
                onCheckedChange={(checked) => setKmsForm({ ...kmsForm, isDefault: checked })}
                data-testid="switch-default-kms"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsKmsCreateOpen(false)} data-testid="button-cancel-kms">
              Cancel
            </Button>
            <Button
              onClick={() => createKmsMutation.mutate(kmsForm)}
              disabled={!kmsForm.name || !kmsForm.endpoint || createKmsMutation.isPending}
              data-testid="button-save-kms"
            >
              {createKmsMutation.isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingLogs} onOpenChange={() => setViewingLogs(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Access Logs</DialogTitle>
            <DialogDescription>
              Audit trail for credential: {credentials?.find((c) => c.id === viewingLogs)?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {logsLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : logs?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No access logs recorded yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Accessed By</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.accessedBy}</TableCell>
                      <TableCell>
                        {log.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        {log.accessedAt ? new Date(log.accessedAt).toLocaleString() : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
