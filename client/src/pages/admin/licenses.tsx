import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { License, Tenant, Framework } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Key,
  Plus,
  Edit,
  Trash2,
  Users,
  Shield,
  Calendar,
  Building2,
  Download,
} from "lucide-react";

const LICENSE_TYPES = [
  { value: "starter", label: "Starter", maxUsers: 10, description: "For small teams" },
  { value: "professional", label: "Professional", maxUsers: 100, description: "For growing organizations" },
  { value: "enterprise", label: "Enterprise", maxUsers: 500, description: "For large enterprises" },
  { value: "unlimited", label: "Unlimited", maxUsers: 9999, description: "No user limits" },
];

export default function LicensesPage() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [formData, setFormData] = useState({
    tenantId: "",
    licenseType: "starter" as "starter" | "professional" | "enterprise" | "unlimited",
    maxUsers: 10,
    maxAdmins: 2,
    maxAuditors: 3,
    allowedFrameworks: [] as string[],
    validFrom: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    isActive: true,
  });

  const { data: licenses, isLoading: licensesLoading } = useQuery<License[]>({
    queryKey: ["/api/licenses"],
  });

  const { data: tenants } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
  });

  const { data: frameworks } = useQuery<Framework[]>({
    queryKey: ["/api/frameworks"],
  });

  const createLicenseMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/licenses", {
      ...data,
      validFrom: new Date(data.validFrom),
      validUntil: new Date(data.validUntil),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
      toast({ title: "License created successfully" });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create license", variant: "destructive" });
    },
  });

  const updateLicenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest("PATCH", `/api/licenses/${id}`, {
        ...data,
        validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
      toast({ title: "License updated successfully" });
      setEditingLicense(null);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to update license", variant: "destructive" });
    },
  });

  const deleteLicenseMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/licenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
      toast({ title: "License deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete license", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      tenantId: "",
      licenseType: "starter",
      maxUsers: 10,
      maxAdmins: 2,
      maxAuditors: 3,
      allowedFrameworks: [],
      validFrom: new Date().toISOString().split("T")[0],
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      isActive: true,
    });
  };

  const handleEdit = (license: License) => {
    setEditingLicense(license);
    setFormData({
      tenantId: license.tenantId,
      licenseType: license.licenseType || "starter",
      maxUsers: license.maxUsers || 10,
      maxAdmins: license.maxAdmins || 2,
      maxAuditors: license.maxAuditors || 3,
      allowedFrameworks: license.allowedFrameworks || [],
      validFrom: license.validFrom ? new Date(license.validFrom).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      validUntil: license.validUntil ? new Date(license.validUntil).toISOString().split("T")[0] : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      isActive: license.isActive ?? true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLicense) {
      updateLicenseMutation.mutate({ id: editingLicense.id, data: formData });
    } else {
      createLicenseMutation.mutate(formData);
    }
  };

  const getTenantName = (tenantId: string) => {
    const tenant = tenants?.find((t) => t.id === tenantId);
    return tenant?.name || "Unknown";
  };

  const getLicenseTypeInfo = (type: string | null) => {
    return LICENSE_TYPES.find((lt) => lt.value === type) || LICENSE_TYPES[0];
  };

  const generateLicenseFile = (license: License) => {
    const tenant = tenants?.find((t) => t.id === license.tenantId);
    if (!tenant) return;

    const licenseData = {
      licenseId: `LIC-${tenant.slug.toUpperCase()}-${Date.now()}`,
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantSlug: tenant.slug,
      licenseType: license.licenseType,
      issuedAt: new Date().toISOString(),
      validFrom: license.validFrom,
      validUntil: license.validUntil,
      licensedUsers: license.maxUsers,
      licensedAdmins: license.maxAdmins,
      licensedAuditors: license.maxAuditors,
      licensedModules: license.allowedModules || [],
      licensedFrameworks: license.allowedFrameworks || [],
      signature: btoa(`${tenant.id}-${tenant.name}-${license.id}-${Date.now()}`),
    };

    const blob = new Blob([JSON.stringify(licenseData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `license-${tenant.slug}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: "License file generated successfully" });
  };

  const toggleFramework = (frameworkName: string) => {
    const current = formData.allowedFrameworks || [];
    if (current.includes(frameworkName)) {
      setFormData({ ...formData, allowedFrameworks: current.filter((f) => f !== frameworkName) });
    } else {
      setFormData({ ...formData, allowedFrameworks: [...current, frameworkName] });
    }
  };

  const getLicenseStatus = (license: License) => {
    if (!license.isActive) return { label: "Inactive", color: "bg-red-500/20 text-red-400" };
    if (license.validUntil && new Date(license.validUntil) < new Date()) {
      return { label: "Expired", color: "bg-amber-500/20 text-amber-400" };
    }
    return { label: "Active", color: "bg-green-500/20 text-green-400" };
  };

  const stats = {
    total: licenses?.length || 0,
    active: licenses?.filter((l) => l.isActive).length || 0,
    totalUsers: licenses?.reduce((sum, l) => sum + (l.maxUsers || 0), 0) || 0,
    expiringSoon: licenses?.filter((l) => {
      if (!l.validUntil) return false;
      const daysUntilExpiry = (new Date(l.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    }).length || 0,
  };

  if (licensesLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">License Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage tenant licenses, user limits, and framework access
          </p>
        </div>

        <Dialog open={isCreateOpen || !!editingLicense} onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingLicense(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-license">
              <Plus className="h-4 w-4 mr-2" />
              Add License
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLicense ? "Edit License" : "Create New License"}</DialogTitle>
              <DialogDescription>
                {editingLicense ? "Update license configuration" : "Configure a new license for a tenant"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tenant">Tenant Organization</Label>
                  <Select value={formData.tenantId} onValueChange={(value) => setFormData({ ...formData, tenantId: value })}>
                    <SelectTrigger data-testid="select-license-tenant">
                      <SelectValue placeholder="Select tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants?.filter((t) => !licenses?.find((l) => l.tenantId === t.id && l.id !== editingLicense?.id)).map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                      {editingLicense && (
                        <SelectItem value={editingLicense.tenantId}>
                          {getTenantName(editingLicense.tenantId)}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseType">License Type</Label>
                  <Select value={formData.licenseType} onValueChange={(value: typeof formData.licenseType) => {
                    const typeInfo = getLicenseTypeInfo(value);
                    setFormData({
                      ...formData,
                      licenseType: value,
                      maxUsers: typeInfo.maxUsers,
                    });
                  }}>
                    <SelectTrigger data-testid="select-license-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {LICENSE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUsers">Max Standard Users</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    value={formData.maxUsers}
                    onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) || 0 })}
                    data-testid="input-max-users"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAdmins">Max Admins</Label>
                  <Input
                    id="maxAdmins"
                    type="number"
                    value={formData.maxAdmins}
                    onChange={(e) => setFormData({ ...formData, maxAdmins: parseInt(e.target.value) || 0 })}
                    data-testid="input-max-admins"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAuditors">Max Auditors</Label>
                  <Input
                    id="maxAuditors"
                    type="number"
                    value={formData.maxAuditors}
                    onChange={(e) => setFormData({ ...formData, maxAuditors: parseInt(e.target.value) || 0 })}
                    data-testid="input-max-auditors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Valid From</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    data-testid="input-valid-from"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    data-testid="input-valid-until"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Allowed Frameworks</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {frameworks?.map((framework) => (
                    <div key={framework.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`fw-${framework.id}`}
                        checked={formData.allowedFrameworks.includes(framework.shortName)}
                        onCheckedChange={() => toggleFramework(framework.shortName)}
                        data-testid={`checkbox-framework-${framework.shortName}`}
                      />
                      <label htmlFor={`fw-${framework.id}`} className="text-sm cursor-pointer">
                        {framework.shortName}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selected: {formData.allowedFrameworks.length} frameworks
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
                  data-testid="checkbox-license-active"
                />
                <label htmlFor="isActive" className="text-sm">License is active</label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateOpen(false);
                  setEditingLicense(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createLicenseMutation.isPending || updateLicenseMutation.isPending} data-testid="button-submit-license">
                  {editingLicense ? "Update License" : "Create License"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Key className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Licenses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/20">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active Licenses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-sm text-muted-foreground">Total User Capacity</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/20">
                <Calendar className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.expiringSoon}</p>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {licenses?.map((license) => {
          const status = getLicenseStatus(license);
          const typeInfo = getLicenseTypeInfo(license.licenseType);
          return (
            <Card key={license.id} className="glass-card card-3d hover-elevate" data-testid={`card-license-${license.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{getTenantName(license.tenantId)}</CardTitle>
                      <CardDescription className="text-sm capitalize">{typeInfo.label} License</CardDescription>
                    </div>
                  </div>
                  <Badge className={status.color}>
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{license.maxUsers}</p>
                    <p className="text-xs text-muted-foreground">Users</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{license.maxAdmins}</p>
                    <p className="text-xs text-muted-foreground">Admins</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{license.maxAuditors}</p>
                    <p className="text-xs text-muted-foreground">Auditors</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Allowed Frameworks</p>
                  <div className="flex flex-wrap gap-1">
                    {license.allowedFrameworks?.slice(0, 4).map((fw) => (
                      <Badge key={fw} variant="outline" className="text-xs">
                        {fw}
                      </Badge>
                    ))}
                    {(license.allowedFrameworks?.length || 0) > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{(license.allowedFrameworks?.length || 0) - 4} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valid Until</span>
                    <span className="font-medium">
                      {license.validUntil ? new Date(license.validUntil).toLocaleDateString() : "No Expiry"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => generateLicenseFile(license)}
                    data-testid={`button-download-license-${license.id}`}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(license)}
                    data-testid={`button-edit-license-${license.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this license?")) {
                        deleteLicenseMutation.mutate(license.id);
                      }
                    }}
                    data-testid={`button-delete-license-${license.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
