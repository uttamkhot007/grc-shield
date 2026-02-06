import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Tenant, License, User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Building2,
  Palette,
  Globe,
  Users,
  Shield,
  Lock,
  Key,
  Save,
  Plus,
  Trash2,
  Download,
  FileKey,
  Upload,
  Sparkles,
  Loader2,
  MapPin,
  Briefcase,
} from "lucide-react";

interface TenantSettings {
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    faviconUrl?: string;
    companyTagline?: string;
  };
  allowedDomains?: string[];
  mfa?: {
    enabled: boolean;
    methods: string[];
    requiredForAdmins: boolean;
    requiredForAllUsers: boolean;
  };
  passwordPolicy?: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
    preventReuse: number;
  };
  sessionPolicy?: {
    maxSessionDuration: number;
    idleTimeout: number;
    maxConcurrentSessions: number;
  };
}

const defaultSettings: TenantSettings = {
  branding: {
    primaryColor: "#3b82f6",
    secondaryColor: "#8b5cf6",
    logoUrl: "",
    faviconUrl: "",
    companyTagline: "",
  },
  allowedDomains: [],
  mfa: {
    enabled: false,
    methods: ["totp"],
    requiredForAdmins: false,
    requiredForAllUsers: false,
  },
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    expiryDays: 90,
    preventReuse: 5,
  },
  sessionPolicy: {
    maxSessionDuration: 480,
    idleTimeout: 30,
    maxConcurrentSessions: 3,
  },
};

export default function TenantSettingsPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/admin/tenants/:id");
  const tenantId = params?.id;
  const { user } = useAuth();

  const [settings, setSettings] = useState<TenantSettings>(defaultSettings);
  const [newDomain, setNewDomain] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "end_user" as "tenant_admin" | "auditor" | "end_user",
  });
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [orgProfile, setOrgProfile] = useState({
    country: "",
    regionId: "",
    industry: "",
    subIndustry: "",
    size: "",
    description: "",
  });
  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>([]);
  const [allowOpenSignup, setAllowOpenSignup] = useState(false);
  const [newAuthorizedEmail, setNewAuthorizedEmail] = useState("");

  const { data: tenant, isLoading: tenantLoading } = useQuery<Tenant>({
    queryKey: ["/api/tenants", tenantId],
    enabled: !!tenantId,
  });

  const { data: regions = [] } = useQuery<{ id: string; name: string; code: string }[]>({
    queryKey: ["/api/regions"],
  });

  useEffect(() => {
    if (tenant) {
      // Initialize website URL and organization profile from tenant
      setWebsiteUrl((tenant as any)?.website || "");
      setOrgProfile({
        country: (tenant as any)?.country || "",
        regionId: (tenant as any)?.regionId || "",
        industry: (tenant as any)?.industry || "",
        subIndustry: (tenant as any)?.subIndustry || "",
        size: (tenant as any)?.size || "",
        description: (tenant as any)?.description || "",
      });
      // Initialize authorized emails and open signup settings
      setAuthorizedEmails((tenant as any)?.authorizedEmails || []);
      setAllowOpenSignup((tenant as any)?.allowOpenSignup || false);
    }
    if (tenant?.settings) {
      const savedSettings = tenant.settings as Partial<TenantSettings>;
      setSettings({
        branding: { 
          primaryColor: savedSettings.branding?.primaryColor ?? defaultSettings.branding?.primaryColor ?? "#3b82f6",
          secondaryColor: savedSettings.branding?.secondaryColor ?? defaultSettings.branding?.secondaryColor ?? "#8b5cf6",
          logoUrl: savedSettings.branding?.logoUrl ?? defaultSettings.branding?.logoUrl ?? "",
          faviconUrl: savedSettings.branding?.faviconUrl ?? defaultSettings.branding?.faviconUrl ?? "",
          companyTagline: savedSettings.branding?.companyTagline ?? defaultSettings.branding?.companyTagline ?? "",
        },
        allowedDomains: savedSettings.allowedDomains ?? defaultSettings.allowedDomains ?? [],
        mfa: {
          enabled: savedSettings.mfa?.enabled ?? defaultSettings.mfa?.enabled ?? false,
          methods: savedSettings.mfa?.methods ?? defaultSettings.mfa?.methods ?? ["totp"],
          requiredForAdmins: savedSettings.mfa?.requiredForAdmins ?? defaultSettings.mfa?.requiredForAdmins ?? false,
          requiredForAllUsers: savedSettings.mfa?.requiredForAllUsers ?? defaultSettings.mfa?.requiredForAllUsers ?? false,
        },
        passwordPolicy: {
          minLength: savedSettings.passwordPolicy?.minLength ?? defaultSettings.passwordPolicy?.minLength ?? 8,
          requireUppercase: savedSettings.passwordPolicy?.requireUppercase ?? defaultSettings.passwordPolicy?.requireUppercase ?? true,
          requireLowercase: savedSettings.passwordPolicy?.requireLowercase ?? defaultSettings.passwordPolicy?.requireLowercase ?? true,
          requireNumbers: savedSettings.passwordPolicy?.requireNumbers ?? defaultSettings.passwordPolicy?.requireNumbers ?? true,
          requireSpecialChars: savedSettings.passwordPolicy?.requireSpecialChars ?? defaultSettings.passwordPolicy?.requireSpecialChars ?? true,
          expiryDays: savedSettings.passwordPolicy?.expiryDays ?? defaultSettings.passwordPolicy?.expiryDays ?? 90,
          preventReuse: savedSettings.passwordPolicy?.preventReuse ?? defaultSettings.passwordPolicy?.preventReuse ?? 5,
        },
        sessionPolicy: {
          maxSessionDuration: savedSettings.sessionPolicy?.maxSessionDuration ?? defaultSettings.sessionPolicy?.maxSessionDuration ?? 480,
          idleTimeout: savedSettings.sessionPolicy?.idleTimeout ?? defaultSettings.sessionPolicy?.idleTimeout ?? 30,
          maxConcurrentSessions: savedSettings.sessionPolicy?.maxConcurrentSessions ?? defaultSettings.sessionPolicy?.maxConcurrentSessions ?? 3,
        },
      });
    }
  }, [tenant]);

  const { data: license } = useQuery<License[]>({
    queryKey: ["/api/licenses"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const tenantLicense = license?.find((l) => l.tenantId === tenantId);
  const tenantUsers = users?.filter((u) => u.tenantId === tenantId) || [];

  const updateTenantMutation = useMutation({
    mutationFn: (data: Partial<Tenant>) =>
      apiRequest("PATCH", `/api/tenants/${tenantId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tenants", tenantId] });
      toast({ title: "Settings saved successfully", description: "Your changes have been saved to the database." });
    },
    onError: () => {
      toast({ title: "Failed to save settings", variant: "destructive" });
    },
  });

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const createUserMutation = useMutation({
    mutationFn: (data: typeof newUser) => {
      const tempPassword = generateRandomPassword();
      return apiRequest("POST", "/api/users", { ...data, tenantId, username: data.email, password: tempPassword, adminCreate: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ 
        title: "User added successfully",
        description: "A temporary password has been assigned. Please share login credentials with the user."
      });
      setIsAddUserOpen(false);
      setNewUser({ email: "", firstName: "", lastName: "", role: "end_user" });
    },
    onError: () => {
      toast({ title: "Failed to add user", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => apiRequest("DELETE", `/api/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User removed successfully" });
    },
  });

  const aiEnrichMutation = useMutation({
    mutationFn: async (website?: string) => {
      const response = await apiRequest("POST", `/api/tenants/${tenantId}/ai-enrich`, { website });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants", tenantId] });
      toast({ 
        title: "Organization profile enriched", 
        description: `AI has analyzed your organization and updated ${data.fieldsUpdated?.length || 0} fields.`
      });
    },
    onError: () => {
      toast({ title: "Failed to enrich profile", variant: "destructive" });
    },
  });

  const handleSaveSettings = () => {
    updateTenantMutation.mutate({ 
      settings: settings as any,
      authorizedEmails,
      allowOpenSignup,
    });
  };

  const isValidEmailPattern = (pattern: string): boolean => {
    const trimmed = pattern.trim().toLowerCase();
    // Must be at least 3 characters (minimum domain like "a.b")
    if (trimmed.length < 3) return false;
    
    // Exact email: user@domain.com
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(trimmed)) return true;
    
    // Domain wildcard: *@domain.com
    const wildcardRegex = /^\*@[^\s@]+\.[^\s@]+$/;
    if (wildcardRegex.test(trimmed)) return true;
    
    // Domain only: domain.com (no @ symbol, contains a dot)
    const domainRegex = /^[^\s@]+\.[^\s@]+$/;
    if (domainRegex.test(trimmed) && !trimmed.includes('@')) return true;
    
    return false;
  };

  const addAuthorizedEmail = () => {
    const email = newAuthorizedEmail.trim().toLowerCase();
    if (!email) return;
    
    if (!isValidEmailPattern(email)) {
      toast({
        title: "Invalid pattern",
        description: "Please enter a valid email (user@domain.com), domain wildcard (*@domain.com), or domain (domain.com)",
        variant: "destructive",
      });
      return;
    }
    
    if (authorizedEmails.includes(email)) {
      toast({
        title: "Duplicate entry",
        description: "This email or pattern is already in the list",
        variant: "destructive",
      });
      return;
    }
    
    setAuthorizedEmails([...authorizedEmails, email]);
    setNewAuthorizedEmail("");
  };

  const removeAuthorizedEmail = (email: string) => {
    setAuthorizedEmails(authorizedEmails.filter((e) => e !== email));
  };

  const saveAccessSettings = () => {
    updateTenantMutation.mutate({ 
      authorizedEmails,
      allowOpenSignup,
    });
  };

  const addDomain = () => {
    if (newDomain && !settings.allowedDomains?.includes(newDomain)) {
      setSettings({
        ...settings,
        allowedDomains: [...(settings.allowedDomains || []), newDomain],
      });
      setNewDomain("");
    }
  };

  const removeDomain = (domain: string) => {
    setSettings({
      ...settings,
      allowedDomains: settings.allowedDomains?.filter((d) => d !== domain),
    });
  };

  const generateLicenseFile = () => {
    if (!tenant || !tenantLicense) return;

    const licenseData = {
      licenseId: `LIC-${tenant.slug.toUpperCase()}-${Date.now()}`,
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantSlug: tenant.slug,
      licenseType: tenantLicense.licenseType,
      issuedAt: new Date().toISOString(),
      validFrom: tenantLicense.validFrom,
      validUntil: tenantLicense.validUntil,
      licensedUsers: tenantLicense.maxUsers,
      licensedAdmins: tenantLicense.maxAdmins,
      licensedAuditors: tenantLicense.maxAuditors,
      licensedModules: tenantLicense.allowedModules || [],
      licensedFrameworks: tenantLicense.allowedFrameworks || [],
      signature: btoa(`${tenant.id}-${tenant.name}-${Date.now()}`),
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

  if (tenantLoading) {
    return (
      <div className="h-full overflow-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  const isSuperAdmin = user?.role === "super_admin";
  const isTenantAdmin = user?.role === "tenant_admin" && user?.tenantId === tenantId;
  const hasAccess = isSuperAdmin || isTenantAdmin;

  if (!hasAccess) {
    return (
      <div className="h-full overflow-auto p-6">
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access this tenant's settings.
              {isSuperAdmin ? "" : " Only super admins and tenant administrators can access this page."}
            </p>
            <Button onClick={() => navigate("/admin/tenants")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tenants
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="h-full overflow-auto p-6">
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Tenant Not Found</h2>
            <p className="text-muted-foreground mb-4">The tenant you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/admin/tenants")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tenants
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/tenants")} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">{tenant.name}</h1>
            <p className="text-muted-foreground">Manage organization settings, users, and configurations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={tenant.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
            {tenant.status}
          </Badge>
          <Button onClick={handleSaveSettings} disabled={updateTenantMutation.isPending} data-testid="button-save-settings">
            <Save className="h-4 w-4 mr-2" />
            Save All Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8 lg:w-auto lg:inline-grid">
          <TabsTrigger value="organization" className="gap-2" data-testid="tab-organization">
            <Building2 className="h-4 w-4" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="access" className="gap-2" data-testid="tab-access">
            <Shield className="h-4 w-4" />
            Access Control
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-2" data-testid="tab-branding">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="domains" className="gap-2" data-testid="tab-domains">
            <Globe className="h-4 w-4" />
            Domains
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2" data-testid="tab-users">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="mfa" className="gap-2" data-testid="tab-mfa">
            <Lock className="h-4 w-4" />
            MFA
          </TabsTrigger>
          <TabsTrigger value="password" className="gap-2" data-testid="tab-password">
            <Key className="h-4 w-4" />
            Password
          </TabsTrigger>
          <TabsTrigger value="license" className="gap-2" data-testid="tab-license">
            <FileKey className="h-4 w-4" />
            License
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-4">
          <Card className="glass-card card-3d">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Organization Profile
              </CardTitle>
              <CardDescription>Manage your organization's details and location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="orgCountry">Country</Label>
                  <Input
                    id="orgCountry"
                    value={orgProfile.country}
                    onChange={(e) => setOrgProfile({ ...orgProfile, country: e.target.value })}
                    placeholder="e.g., Saudi Arabia, UAE, USA"
                    data-testid="input-org-country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgRegion">Region</Label>
                  <Select
                    value={orgProfile.regionId}
                    onValueChange={(value) => setOrgProfile({ ...orgProfile, regionId: value })}
                  >
                    <SelectTrigger data-testid="select-org-region">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgIndustry">Industry</Label>
                  <Select
                    value={orgProfile.industry}
                    onValueChange={(value) => setOrgProfile({ ...orgProfile, industry: value })}
                  >
                    <SelectTrigger data-testid="select-org-industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Financial Services">Financial Services</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Energy">Energy</SelectItem>
                      <SelectItem value="Government">Government</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Telecommunications">Telecommunications</SelectItem>
                      <SelectItem value="Real Estate">Real Estate</SelectItem>
                      <SelectItem value="Transportation">Transportation</SelectItem>
                      <SelectItem value="Hospitality">Hospitality</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgSubIndustry">Sub-Industry</Label>
                  <Input
                    id="orgSubIndustry"
                    value={orgProfile.subIndustry}
                    onChange={(e) => setOrgProfile({ ...orgProfile, subIndustry: e.target.value })}
                    placeholder="e.g., Commercial Banking, SaaS"
                    data-testid="input-org-sub-industry"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgSize">Organization Size</Label>
                  <Select
                    value={orgProfile.size}
                    onValueChange={(value) => setOrgProfile({ ...orgProfile, size: value })}
                  >
                    <SelectTrigger data-testid="select-org-size">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-50">1-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="501-1000">501-1000 employees</SelectItem>
                      <SelectItem value="1001-5000">1001-5000 employees</SelectItem>
                      <SelectItem value="5000+">5000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgDescription">Description</Label>
                <Input
                  id="orgDescription"
                  value={orgProfile.description}
                  onChange={(e) => setOrgProfile({ ...orgProfile, description: e.target.value })}
                  placeholder="Brief description of your organization"
                  data-testid="input-org-description"
                />
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => updateTenantMutation.mutate(orgProfile)}
                  disabled={updateTenantMutation.isPending}
                  data-testid="button-save-org-profile"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Organization Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card card-3d">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-chart-4" />
                AI Organization Enrichment
              </CardTitle>
              <CardDescription>
                Use AI to automatically detect your organization's country, industry, and other profile information based on your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="websiteUrl"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourcompany.com"
                    data-testid="input-website-url"
                  />
                  <Button 
                    variant="outline"
                    onClick={() => updateTenantMutation.mutate({ website: websiteUrl })}
                    disabled={updateTenantMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>

              <Button 
                onClick={() => aiEnrichMutation.mutate(websiteUrl)}
                disabled={aiEnrichMutation.isPending || !websiteUrl}
                data-testid="button-ai-enrich"
              >
                {aiEnrichMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {aiEnrichMutation.isPending ? "Analyzing..." : "AI Enrich Organization"}
              </Button>

              {(tenant as any)?.aiProfile && (
                <div className="mt-4 p-4 rounded-lg bg-muted/50 space-y-3">
                  <h4 className="font-semibold text-sm">AI Profile</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{((tenant as any).aiProfile as any)?.inferred_country_name || (tenant as any)?.country || "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>{((tenant as any).aiProfile as any)?.inferred_region || "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{((tenant as any).aiProfile as any)?.inferred_industry || tenant?.industry || "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{((tenant as any).aiProfile as any)?.employees || "Unknown"}</span>
                    </div>
                  </div>
                  {((tenant as any).aiProfile as any)?.business_summary && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-sm text-muted-foreground">{((tenant as any).aiProfile as any).business_summary}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <Card className="apple-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Authorized Email Access
              </CardTitle>
              <CardDescription>
                Control who can sign up and access your organization. Only users with authorized emails can create accounts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                <div className="space-y-1">
                  <Label htmlFor="allowOpenSignup" className="text-base font-medium">Allow Open Signup</Label>
                  <p className="text-sm text-muted-foreground">
                    When enabled, anyone can sign up. When disabled, only authorized emails can sign up.
                  </p>
                </div>
                <Switch
                  id="allowOpenSignup"
                  checked={allowOpenSignup}
                  onCheckedChange={setAllowOpenSignup}
                  data-testid="switch-allow-open-signup"
                />
              </div>

              {!allowOpenSignup && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter email address or domain pattern (e.g., *@company.com)"
                      value={newAuthorizedEmail}
                      onChange={(e) => setNewAuthorizedEmail(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addAuthorizedEmail()}
                      className="apple-input"
                      data-testid="input-authorized-email"
                    />
                    <Button onClick={addAuthorizedEmail} data-testid="button-add-authorized-email">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    You can add specific email addresses or use domain patterns like <code className="px-1 py-0.5 rounded bg-muted">*@company.com</code> to allow all users from a domain.
                  </div>

                  {authorizedEmails.length > 0 ? (
                    <div className="space-y-2">
                      <Label>Authorized Emails ({authorizedEmails.length})</Label>
                      <div className="flex flex-wrap gap-2">
                        {authorizedEmails.map((email) => (
                          <Badge
                            key={email}
                            variant="secondary"
                            className="flex items-center gap-1 px-3 py-1 apple-pill"
                          >
                            {email}
                            <button
                              onClick={() => removeAuthorizedEmail(email)}
                              className="ml-1 hover:text-destructive transition-colors"
                              data-testid={`button-remove-email-${email.replace(/[@.]/g, '-')}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 rounded-lg border-2 border-dashed text-center">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="font-semibold mb-1">No Authorized Emails</h3>
                      <p className="text-sm text-muted-foreground">
                        Add email addresses or domain patterns to allow specific users to sign up.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={saveAccessSettings} disabled={updateTenantMutation.isPending} data-testid="button-save-access-settings">
                  {updateTenantMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Access Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card className="glass-card card-3d">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Branding Settings
              </CardTitle>
              <CardDescription>Customize the look and feel for this organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.branding?.primaryColor || "#3b82f6"}
                      onChange={(e) => setSettings({
                        ...settings,
                        branding: { ...settings.branding, primaryColor: e.target.value }
                      })}
                      className="w-16 h-10 p-1"
                      data-testid="input-primary-color"
                    />
                    <Input
                      value={settings.branding?.primaryColor || "#3b82f6"}
                      onChange={(e) => setSettings({
                        ...settings,
                        branding: { ...settings.branding, primaryColor: e.target.value }
                      })}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={settings.branding?.secondaryColor || "#8b5cf6"}
                      onChange={(e) => setSettings({
                        ...settings,
                        branding: { ...settings.branding, secondaryColor: e.target.value }
                      })}
                      className="w-16 h-10 p-1"
                      data-testid="input-secondary-color"
                    />
                    <Input
                      value={settings.branding?.secondaryColor || "#8b5cf6"}
                      onChange={(e) => setSettings({
                        ...settings,
                        branding: { ...settings.branding, secondaryColor: e.target.value }
                      })}
                      placeholder="#8b5cf6"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={settings.branding?.logoUrl || ""}
                  onChange={(e) => setSettings({
                    ...settings,
                    branding: { ...settings.branding, logoUrl: e.target.value }
                  })}
                  placeholder="https://example.com/logo.png"
                  data-testid="input-logo-url"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="faviconUrl">Favicon URL</Label>
                <Input
                  id="faviconUrl"
                  value={settings.branding?.faviconUrl || ""}
                  onChange={(e) => setSettings({
                    ...settings,
                    branding: { ...settings.branding, faviconUrl: e.target.value }
                  })}
                  placeholder="https://example.com/favicon.ico"
                  data-testid="input-favicon-url"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Company Tagline</Label>
                <Input
                  id="tagline"
                  value={settings.branding?.companyTagline || ""}
                  onChange={(e) => setSettings({
                    ...settings,
                    branding: { ...settings.branding, companyTagline: e.target.value }
                  })}
                  placeholder="Your company tagline"
                  data-testid="input-tagline"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domains" className="space-y-4">
          <Card className="glass-card card-3d">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Allowed Domains
              </CardTitle>
              <CardDescription>Restrict user registration to specific email domains</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="example.com"
                  data-testid="input-new-domain"
                />
                <Button onClick={addDomain} data-testid="button-add-domain">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Domain
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {settings.allowedDomains?.map((domain) => (
                  <Badge key={domain} variant="secondary" className="flex items-center gap-2 px-3 py-1">
                    {domain}
                    <button
                      onClick={() => removeDomain(domain)}
                      className="hover:text-destructive"
                      data-testid={`button-remove-domain-${domain}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {(!settings.allowedDomains || settings.allowedDomains.length === 0) && (
                  <p className="text-muted-foreground text-sm">No domain restrictions. All email domains are allowed.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card className="glass-card card-3d">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Tenant Users
                </CardTitle>
                <CardDescription>Manage users and their roles for this organization</CardDescription>
              </div>
              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-user">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>Add a user to {tenant.name}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={newUser.firstName}
                          onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                          data-testid="input-user-first-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={newUser.lastName}
                          onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                          data-testid="input-user-last-name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        data-testid="input-user-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value: "tenant_admin" | "auditor" | "end_user") =>
                          setNewUser({ ...newUser, role: value })
                        }
                      >
                        <SelectTrigger data-testid="select-user-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                          <SelectItem value="auditor">Auditor</SelectItem>
                          <SelectItem value="end_user">End User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => createUserMutation.mutate(newUser)}
                      disabled={createUserMutation.isPending}
                      data-testid="button-submit-user"
                    >
                      Add User
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tenantUsers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No users found for this tenant.</p>
                ) : (
                  tenantUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 rounded-lg bg-card/50 border">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {(user.firstName?.[0] || "") + (user.lastName?.[0] || "")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{user.role}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteUserMutation.mutate(user.id)}
                          data-testid={`button-delete-user-${user.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mfa" className="space-y-4">
          <Card className="glass-card card-3d">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Multi-Factor Authentication
              </CardTitle>
              <CardDescription>Configure MFA requirements for this organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable MFA</Label>
                  <p className="text-sm text-muted-foreground">Require MFA for all users in this organization</p>
                </div>
                <Switch
                  checked={settings.mfa?.enabled}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    mfa: { ...settings.mfa!, enabled: checked }
                  })}
                  data-testid="switch-mfa-enabled"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Required for Admins</Label>
                  <p className="text-sm text-muted-foreground">Force MFA for tenant administrators</p>
                </div>
                <Switch
                  checked={settings.mfa?.requiredForAdmins}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    mfa: { ...settings.mfa!, requiredForAdmins: checked }
                  })}
                  data-testid="switch-mfa-admins"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Required for All Users</Label>
                  <p className="text-sm text-muted-foreground">Force MFA for all users including end users</p>
                </div>
                <Switch
                  checked={settings.mfa?.requiredForAllUsers}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    mfa: { ...settings.mfa!, requiredForAllUsers: checked }
                  })}
                  data-testid="switch-mfa-all-users"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Allowed MFA Methods</Label>
                <div className="flex flex-wrap gap-2">
                  {["totp", "sms", "email", "hardware_key"].map((method) => (
                    <Badge
                      key={method}
                      variant={settings.mfa?.methods?.includes(method) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const methods = settings.mfa?.methods || [];
                        const newMethods = methods.includes(method)
                          ? methods.filter((m) => m !== method)
                          : [...methods, method];
                        setSettings({
                          ...settings,
                          mfa: { ...settings.mfa!, methods: newMethods }
                        });
                      }}
                      data-testid={`badge-mfa-method-${method}`}
                    >
                      {method.replace("_", " ").toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-4">
          <Card className="glass-card card-3d">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Password Policy
              </CardTitle>
              <CardDescription>Configure password requirements for this organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minLength">Minimum Password Length</Label>
                  <Input
                    id="minLength"
                    type="number"
                    min={6}
                    max={32}
                    value={settings.passwordPolicy?.minLength || 8}
                    onChange={(e) => setSettings({
                      ...settings,
                      passwordPolicy: { ...settings.passwordPolicy!, minLength: parseInt(e.target.value) }
                    })}
                    data-testid="input-password-min-length"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDays">Password Expiry (Days)</Label>
                  <Input
                    id="expiryDays"
                    type="number"
                    min={0}
                    max={365}
                    value={settings.passwordPolicy?.expiryDays || 90}
                    onChange={(e) => setSettings({
                      ...settings,
                      passwordPolicy: { ...settings.passwordPolicy!, expiryDays: parseInt(e.target.value) }
                    })}
                    data-testid="input-password-expiry"
                  />
                  <p className="text-xs text-muted-foreground">0 = No expiry</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preventReuse">Prevent Password Reuse</Label>
                  <Input
                    id="preventReuse"
                    type="number"
                    min={0}
                    max={24}
                    value={settings.passwordPolicy?.preventReuse || 5}
                    onChange={(e) => setSettings({
                      ...settings,
                      passwordPolicy: { ...settings.passwordPolicy!, preventReuse: parseInt(e.target.value) }
                    })}
                    data-testid="input-password-reuse"
                  />
                  <p className="text-xs text-muted-foreground">Number of previous passwords to block</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Password Requirements</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-card/50 border">
                    <Label htmlFor="requireUppercase">Require Uppercase Letters</Label>
                    <Switch
                      id="requireUppercase"
                      checked={settings.passwordPolicy?.requireUppercase}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        passwordPolicy: { ...settings.passwordPolicy!, requireUppercase: checked }
                      })}
                      data-testid="switch-require-uppercase"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-card/50 border">
                    <Label htmlFor="requireLowercase">Require Lowercase Letters</Label>
                    <Switch
                      id="requireLowercase"
                      checked={settings.passwordPolicy?.requireLowercase}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        passwordPolicy: { ...settings.passwordPolicy!, requireLowercase: checked }
                      })}
                      data-testid="switch-require-lowercase"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-card/50 border">
                    <Label htmlFor="requireNumbers">Require Numbers</Label>
                    <Switch
                      id="requireNumbers"
                      checked={settings.passwordPolicy?.requireNumbers}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        passwordPolicy: { ...settings.passwordPolicy!, requireNumbers: checked }
                      })}
                      data-testid="switch-require-numbers"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-card/50 border">
                    <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                    <Switch
                      id="requireSpecialChars"
                      checked={settings.passwordPolicy?.requireSpecialChars}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        passwordPolicy: { ...settings.passwordPolicy!, requireSpecialChars: checked }
                      })}
                      data-testid="switch-require-special"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="license" className="space-y-4">
          <Card className="glass-card card-3d">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                License Information
              </CardTitle>
              <CardDescription>View and manage license details for this organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {tenantLicense ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-card/50 border">
                      <p className="text-sm text-muted-foreground">License Type</p>
                      <p className="text-2xl font-bold capitalize">{tenantLicense.licenseType}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-card/50 border">
                      <p className="text-sm text-muted-foreground">Licensed Users</p>
                      <p className="text-2xl font-bold">{tenantLicense.maxUsers}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-card/50 border">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={tenantLicense.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                        {tenantLicense.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-card/50 border">
                      <p className="text-sm text-muted-foreground">Valid From</p>
                      <p className="font-medium">{tenantLicense.validFrom ? new Date(tenantLicense.validFrom).toLocaleDateString() : "N/A"}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-card/50 border">
                      <p className="text-sm text-muted-foreground">Valid Until</p>
                      <p className="font-medium">{tenantLicense.validUntil ? new Date(tenantLicense.validUntil).toLocaleDateString() : "Perpetual"}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Licensed Modules</Label>
                    <div className="flex flex-wrap gap-2">
                      {(tenantLicense.allowedModules || []).map((module) => (
                        <Badge key={module} variant="secondary">{module}</Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-4">
                    <Button onClick={generateLicenseFile} className="flex-1" data-testid="button-generate-license">
                      <Download className="h-4 w-4 mr-2" />
                      Generate License File
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/admin/licenses")} data-testid="button-manage-license">
                      <FileKey className="h-4 w-4 mr-2" />
                      Manage License
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No license assigned to this tenant.</p>
                  <Button onClick={() => navigate("/admin/licenses")} data-testid="button-assign-license">
                    <Plus className="h-4 w-4 mr-2" />
                    Assign License
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
