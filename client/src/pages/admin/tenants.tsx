import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Tenant, License, Region, TenantInvitation, OnboardingRequest, WhitelistedDomain } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Users,
  Shield,
  Globe,
  Factory,
  Settings,
  Sparkles,
  Loader2,
  Mail,
  Link,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  UserPlus,
  AtSign,
  Play,
  Eye,
  ImageIcon,
} from "lucide-react";

function TenantLogo({ logo, name, tenantId }: { logo?: string; name: string; tenantId: string }) {
  const [imgError, setImgError] = useState(false);

  if (!logo || imgError) {
    return (
      <div className="p-2 rounded-lg bg-primary/20" data-testid={`tenant-logo-fallback-${tenantId}`}>
        <Factory className="h-5 w-5 text-primary" />
      </div>
    );
  }

  return (
    <img 
      src={logo} 
      alt={`${name} logo`}
      className="h-10 w-10 rounded-lg object-contain bg-white/10"
      onError={() => setImgError(true)}
      data-testid={`tenant-logo-${tenantId}`}
    />
  );
}

export default function TenantsPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [activeTab, setActiveTab] = useState("tenants");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    regionId: "",
    industry: "",
    size: "Mid-Market",
    status: "active" as "active" | "inactive" | "pending" | "completed" | "in_progress" | "draft" | "approved" | "rejected",
    website: "",
  });
  const [inviteData, setInviteData] = useState({
    email: "",
    tenantName: "",
    tenantSlug: "",
  });

  const { data: tenants, isLoading: tenantsLoading } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
  });

  const { data: regions } = useQuery<Region[]>({
    queryKey: ["/api/regions"],
  });

  const { data: licenses } = useQuery<License[]>({
    queryKey: ["/api/licenses"],
  });

  const { data: invitations, isLoading: invitationsLoading } = useQuery<TenantInvitation[]>({
    queryKey: ["/api/tenant-invitations"],
  });

  const { data: onboardingRequests, isLoading: onboardingLoading } = useQuery<OnboardingRequest[]>({
    queryKey: ["/api/admin/onboarding-requests"],
  });

  const { data: whitelistedDomains, isLoading: domainsLoading } = useQuery<WhitelistedDomain[]>({
    queryKey: ["/api/admin/whitelisted-domains"],
  });

  const [domainFormData, setDomainFormData] = useState({
    domain: "",
    email: "",
    description: "",
    authorizeType: "domain" as "domain" | "email",
  });
  const [isAddDomainOpen, setIsAddDomainOpen] = useState(false);

  const addDomainMutation = useMutation({
    mutationFn: (data: typeof domainFormData) => apiRequest("POST", "/api/admin/whitelisted-domains", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whitelisted-domains"] });
      toast({ title: "Whitelist entry added successfully" });
      setIsAddDomainOpen(false);
      setDomainFormData({ domain: "", email: "", description: "", authorizeType: "domain" });
    },
    onError: () => {
      toast({ title: "Failed to add whitelist entry", variant: "destructive" });
    },
  });

  const deleteDomainMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/whitelisted-domains/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whitelisted-domains"] });
      toast({ title: "Whitelist entry removed" });
    },
    onError: () => {
      toast({ title: "Failed to remove entry", variant: "destructive" });
    },
  });

  const approveRequestMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/admin/onboarding-requests/${id}`, { status: "approved" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/onboarding-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
      toast({ title: "Onboarding request approved and provisioned" });
    },
    onError: () => {
      toast({ title: "Failed to approve request", variant: "destructive" });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      apiRequest("PATCH", `/api/admin/onboarding-requests/${id}`, { status: "rejected", rejectionReason: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/onboarding-requests"] });
      toast({ title: "Onboarding request rejected" });
    },
    onError: () => {
      toast({ title: "Failed to reject request", variant: "destructive" });
    },
  });

  const createInvitationMutation = useMutation({
    mutationFn: (data: typeof inviteData) => apiRequest("POST", "/api/tenant-invitations", data),
    onSuccess: async (response) => {
      const invite = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/tenant-invitations"] });
      toast({ 
        title: "Invitation sent successfully",
        description: `Invite link created for ${invite.tenantName}`,
      });
      setIsInviteOpen(false);
      setInviteData({ email: "", tenantName: "", tenantSlug: "" });
    },
    onError: () => {
      toast({ title: "Failed to send invitation", variant: "destructive" });
    },
  });

  const createTenantMutation = useMutation({
    mutationFn: (data: typeof formData) => apiRequest("POST", "/api/tenants", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
      toast({ title: "Tenant created successfully" });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create tenant", variant: "destructive" });
    },
  });

  const updateTenantMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof formData> }) =>
      apiRequest("PATCH", `/api/tenants/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
      toast({ title: "Tenant updated successfully" });
      setEditingTenant(null);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to update tenant", variant: "destructive" });
    },
  });

  const deleteTenantMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tenants/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
      toast({ title: "Tenant deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete tenant", variant: "destructive" });
    },
  });

  const [enrichingTenantId, setEnrichingTenantId] = useState<string | null>(null);
  const [enrichFromUrlId, setEnrichFromUrlId] = useState<string | null>(null);
  
  const aiEnrichMutation = useMutation({
    mutationFn: (id: string) => {
      setEnrichingTenantId(id);
      return apiRequest("POST", `/api/tenants/${id}/ai-enrich`);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
      toast({ 
        title: "AI Profile Generated", 
        description: `Successfully enriched profile with ${data.aiProfile?.recommended_frameworks?.length || 0} framework recommendations.`
      });
      setEnrichingTenantId(null);
    },
    onError: () => {
      toast({ title: "Failed to enrich tenant profile", variant: "destructive" });
      setEnrichingTenantId(null);
    },
  });

  const enrichFromUrlMutation = useMutation({
    mutationFn: ({ id, url }: { id: string; url?: string }) => {
      setEnrichFromUrlId(id);
      return apiRequest("POST", `/api/tenants/${id}/enrich-from-url`, url ? { url } : {});
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
      const fieldsUpdated = data.fieldsUpdated?.length || 0;
      toast({ 
        title: "Tenant Enriched from Website", 
        description: `Updated ${fieldsUpdated} fields including logo, description, and industry.`
      });
      setEnrichFromUrlId(null);
    },
    onError: () => {
      toast({ title: "Failed to enrich from URL", description: "Make sure the tenant has a website URL set.", variant: "destructive" });
      setEnrichFromUrlId(null);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      regionId: "",
      industry: "",
      size: "Mid-Market",
      status: "active",
      website: "",
    });
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      slug: tenant.slug,
      regionId: tenant.regionId || "",
      industry: tenant.industry || "",
      size: tenant.size || "Mid-Market",
      status: tenant.status || "active",
      website: (tenant as any).website || "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTenant) {
      updateTenantMutation.mutate({ id: editingTenant.id, data: formData });
    } else {
      createTenantMutation.mutate(formData);
    }
  };

  const getRegionName = (regionId: string | null) => {
    if (!regionId || !regions) return "Not Assigned";
    const region = regions.find((r) => r.id === regionId);
    return region?.name || "Unknown";
  };

  const getTenantLicense = (tenantId: string) => {
    return licenses?.find((l) => l.tenantId === tenantId);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "inactive":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (tenantsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/onboarding?token=${token}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link copied to clipboard" });
  };

  const getInviteStatusBadge = (invitation: TenantInvitation) => {
    const isExpired = new Date(invitation.expiresAt) < new Date();
    if (invitation.status === "accepted") {
      return <Badge className="bg-green-500/20 text-green-400"><CheckCircle2 className="h-3 w-3 mr-1" /> Accepted</Badge>;
    }
    if (isExpired) {
      return <Badge className="bg-red-500/20 text-red-400"><XCircle className="h-3 w-3 mr-1" /> Expired</Badge>;
    }
    if (invitation.status === "pending") {
      return <Badge className="bg-yellow-500/20 text-yellow-400"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
    return <Badge>{invitation.status}</Badge>;
  };

  const pendingRequests = onboardingRequests?.filter(r => r.status === "pending") || [];
  const activeWhitelists = whitelistedDomains?.filter(d => d.isActive) || [];

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Tenant Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage organization tenants, onboarding requests, and access control
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-send-invite">
                <Mail className="h-4 w-4 mr-2" />
                Send Invite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New Organization</DialogTitle>
                <DialogDescription>
                  Send an invitation to a tenant admin to set up their organization
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createInvitationMutation.mutate(inviteData); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Admin Email</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                    placeholder="admin@company.com"
                    required
                    data-testid="input-invite-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteTenantName">Organization Name</Label>
                  <Input
                    id="inviteTenantName"
                    value={inviteData.tenantName}
                    onChange={(e) => setInviteData({ 
                      ...inviteData, 
                      tenantName: e.target.value,
                      tenantSlug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
                    })}
                    placeholder="Acme Corporation"
                    required
                    data-testid="input-invite-tenant-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteTenantSlug">Organization URL</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">grc-shield.replit.app/org/</span>
                    <Input
                      id="inviteTenantSlug"
                      value={inviteData.tenantSlug}
                      onChange={(e) => setInviteData({ ...inviteData, tenantSlug: e.target.value })}
                      placeholder="acme-corp"
                      required
                      data-testid="input-invite-tenant-slug"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createInvitationMutation.isPending} data-testid="button-submit-invite">
                    {createInvitationMutation.isPending ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending...</>
                    ) : (
                      <><Mail className="h-4 w-4 mr-2" /> Send Invitation</>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

        <Dialog open={isCreateOpen || !!editingTenant} onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingTenant(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-tenant">
              <Plus className="h-4 w-4 mr-2" />
              Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingTenant ? "Edit Tenant" : "Create New Tenant"}</DialogTitle>
              <DialogDescription>
                {editingTenant ? "Update tenant information" : "Add a new organization tenant to the platform"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  placeholder="Enter organization name"
                  data-testid="input-tenant-name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="organization-slug"
                  data-testid="input-tenant-slug"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                  data-testid="input-tenant-website"
                />
                <p className="text-xs text-muted-foreground">
                  Used to fetch logo and organization details automatically
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select value={formData.regionId} onValueChange={(value) => setFormData({ ...formData, regionId: value })}>
                    <SelectTrigger data-testid="select-tenant-region">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions?.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                    <SelectTrigger data-testid="select-tenant-industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Financial Services">Financial Services</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Professional Services">Professional Services</SelectItem>
                      <SelectItem value="Maritime">Maritime</SelectItem>
                      <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                      <SelectItem value="Data Analytics">Data Analytics</SelectItem>
                      <SelectItem value="IT Services">IT Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size">Organization Size</Label>
                  <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value })}>
                    <SelectTrigger data-testid="select-tenant-size">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Startup">Startup</SelectItem>
                      <SelectItem value="Small">Small</SelectItem>
                      <SelectItem value="Mid-Market">Mid-Market</SelectItem>
                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: typeof formData.status) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger data-testid="select-tenant-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateOpen(false);
                  setEditingTenant(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTenantMutation.isPending || updateTenantMutation.isPending} data-testid="button-submit-tenant">
                  {editingTenant ? "Update Tenant" : "Create Tenant"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Building2 className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tenants?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Tenants</p>
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
                <p className="text-2xl font-bold">{tenants?.filter((t) => t.status === "active").length || 0}</p>
                <p className="text-sm text-muted-foreground">Active Tenants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <UserPlus className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/20">
                <AtSign className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeWhitelists.length}</p>
                <p className="text-sm text-muted-foreground">Whitelisted Domains</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tenants" data-testid="tab-tenants">
            <Building2 className="h-4 w-4 mr-2" />
            Tenants ({tenants?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="onboarding" data-testid="tab-onboarding">
            <UserPlus className="h-4 w-4 mr-2" />
            Onboarding ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="whitelists" data-testid="tab-whitelists">
            <AtSign className="h-4 w-4 mr-2" />
            Whitelists ({activeWhitelists.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants?.map((tenant) => {
              const license = getTenantLicense(tenant.id);
              return (
                <Card key={tenant.id} className="glass-card card-3d hover-elevate" data-testid={`card-tenant-${tenant.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <TenantLogo 
                          logo={(tenant as any).logo} 
                          name={tenant.name}
                          tenantId={tenant.id}
                        />
                        <div>
                          <CardTitle className="text-lg">{tenant.name}</CardTitle>
                          <CardDescription className="text-sm">/{tenant.slug}</CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(tenant.status)}>
                        {tenant.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Region</p>
                        <p className="font-medium">{getRegionName(tenant.regionId)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Industry</p>
                        <p className="font-medium">{tenant.industry || "Not Set"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Size</p>
                        <p className="font-medium">{tenant.size || "Not Set"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">License</p>
                        <p className="font-medium capitalize">{license?.licenseType || "None"}</p>
                      </div>
                    </div>

                    {license && (
                      <div className="pt-3 border-t border-border/50">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">User Limit</span>
                          <span className="font-medium">{license.maxUsers} users</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-muted-foreground">Frameworks</span>
                          <span className="font-medium">{license.allowedFrameworks?.length || 0} enabled</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/admin/tenants/${tenant.id}`)}
                        data-testid={`button-settings-tenant-${tenant.id}`}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Settings
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => enrichFromUrlMutation.mutate({ id: tenant.id })}
                        disabled={enrichFromUrlId === tenant.id}
                        data-testid={`button-enrich-url-tenant-${tenant.id}`}
                        title="Fetch Logo & Details from Website"
                      >
                        {enrichFromUrlId === tenant.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-blue-400" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => aiEnrichMutation.mutate(tenant.id)}
                        disabled={enrichingTenantId === tenant.id}
                        data-testid={`button-ai-enrich-tenant-${tenant.id}`}
                        title="Generate AI Profile"
                      >
                        {enrichingTenantId === tenant.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-chart-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(tenant)}
                        data-testid={`button-edit-tenant-${tenant.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this tenant?")) {
                            deleteTenantMutation.mutate(tenant.id);
                          }
                        }}
                        data-testid={`button-delete-tenant-${tenant.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Pending Onboarding Requests
              </CardTitle>
              <CardDescription>
                Review and approve self-service tenant registration requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {onboardingLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending onboarding requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <Card key={request.id} className="bg-secondary/10 border-border/50">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-semibold">{request.organizationName}</h4>
                            <p className="text-sm text-muted-foreground">{request.email}</p>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge variant="outline">{request.industry}</Badge>
                              <Badge variant="outline">{request.companySize}</Badge>
                              <Badge variant="outline">{request.country}</Badge>
                            </div>
                            {request.selectedModules && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Modules: {(request.selectedModules as string[]).join(", ")}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const reason = prompt("Enter rejection reason:");
                                if (reason) {
                                  rejectRequestMutation.mutate({ id: request.id, reason });
                                }
                              }}
                              disabled={rejectRequestMutation.isPending}
                              data-testid={`button-reject-request-${request.id}`}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => approveRequestMutation.mutate(request.id)}
                              disabled={approveRequestMutation.isPending}
                              data-testid={`button-approve-request-${request.id}`}
                            >
                              {approveRequestMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                              )}
                              Approve & Provision
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

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                All Onboarding Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {onboardingRequests?.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/10">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{request.organizationName}</p>
                        <p className="text-sm text-muted-foreground">{request.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        request.status === "approved" ? "bg-green-500/20 text-green-400" :
                        request.status === "rejected" ? "bg-red-500/20 text-red-400" :
                        request.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                        request.status === "provisioning" ? "bg-blue-500/20 text-blue-400" :
                        request.status === "completed" ? "bg-emerald-500/20 text-emerald-400" :
                        "bg-gray-500/20 text-gray-400"
                      }>
                        {request.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(request.createdAt!).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whitelists" className="space-y-4">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AtSign className="h-5 w-5 text-primary" />
                  Whitelisted Domains & Emails
                </CardTitle>
                <CardDescription>
                  Authorize domains or specific emails for self-service tenant registration
                </CardDescription>
              </div>
              <Dialog open={isAddDomainOpen} onOpenChange={setIsAddDomainOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-whitelist">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Whitelist
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Whitelist Entry</DialogTitle>
                    <DialogDescription>
                      Authorize a domain or specific email for self-service registration
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={(e) => { e.preventDefault(); addDomainMutation.mutate(domainFormData); }} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Authorization Type</Label>
                      <Select value={domainFormData.authorizeType} onValueChange={(value: "domain" | "email") => setDomainFormData({ ...domainFormData, authorizeType: value })}>
                        <SelectTrigger data-testid="select-auth-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="domain">Domain (e.g. acme.com)</SelectItem>
                          <SelectItem value="email">Specific Email</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {domainFormData.authorizeType === "domain" ? (
                      <div className="space-y-2">
                        <Label htmlFor="domain">Domain</Label>
                        <Input
                          id="domain"
                          value={domainFormData.domain}
                          onChange={(e) => setDomainFormData({ ...domainFormData, domain: e.target.value })}
                          placeholder="acme.com"
                          required
                          data-testid="input-whitelist-domain"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={domainFormData.email}
                          onChange={(e) => setDomainFormData({ ...domainFormData, email: e.target.value })}
                          placeholder="user@example.com"
                          required
                          data-testid="input-whitelist-email"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (optional)</Label>
                      <Input
                        id="description"
                        value={domainFormData.description}
                        onChange={(e) => setDomainFormData({ ...domainFormData, description: e.target.value })}
                        placeholder="Partner company authorized for Q1 onboarding"
                        data-testid="input-whitelist-description"
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={addDomainMutation.isPending} data-testid="button-submit-whitelist">
                        {addDomainMutation.isPending ? (
                          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Adding...</>
                        ) : (
                          <><Plus className="h-4 w-4 mr-2" /> Add to Whitelist</>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {domainsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : whitelistedDomains?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AtSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No whitelisted domains or emails</p>
                  <p className="text-sm">Add domains to allow self-service registration</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {whitelistedDomains?.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/10">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${entry.domain ? "bg-primary/20" : "bg-purple-500/20"}`}>
                          {entry.domain ? <Globe className="h-4 w-4 text-primary" /> : <Mail className="h-4 w-4 text-purple-400" />}
                        </div>
                        <div>
                          <p className="font-medium">{entry.domain || entry.email}</p>
                          <p className="text-sm text-muted-foreground">{entry.description || (entry.domain ? "Domain whitelist" : "Email whitelist")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={entry.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                          {entry.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => {
                            if (confirm("Remove this whitelist entry?")) {
                              deleteDomainMutation.mutate(entry.id);
                            }
                          }}
                          data-testid={`button-delete-whitelist-${entry.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
