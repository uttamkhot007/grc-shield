import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Shield, Building, User, Lock, Globe, Briefcase, CheckCircle2, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const INDUSTRIES = [
  "Technology",
  "Financial Services",
  "Healthcare",
  "Manufacturing",
  "Retail",
  "Energy",
  "Telecommunications",
  "Government",
  "Education",
  "Other"
];

const COMPANY_SIZES = [
  "1-50 employees",
  "51-200 employees",
  "201-1000 employees",
  "1001-5000 employees",
  "5000+ employees"
];

const LICENSE_TYPES = [
  { value: "starter", name: "Starter", description: "For small teams getting started with GRC", modules: ["Dashboard", "Policies", "Frameworks"], users: 10, price: "$99/mo" },
  { value: "professional", name: "Professional", description: "For growing organizations with advanced needs", modules: ["Dashboard", "Policies", "Frameworks", "Risk Register", "Audits", "Vendors", "Controls"], users: 25, price: "$299/mo" },
  { value: "enterprise", name: "Enterprise", description: "For large organizations with AI and integrations", modules: ["All Professional modules", "AI Insights", "Processes", "Integrations"], users: 100, price: "$799/mo" },
  { value: "unlimited", name: "Unlimited", description: "Complete GRC suite with privacy modules", modules: ["All Enterprise modules", "Full Privacy Suite", "ROPA", "DSR", "DPIA", "Breach Management"], users: 999, price: "Custom" },
];

export default function AcceptInvitePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<"loading" | "profile" | "license" | "complete">("loading");
  const [createdTenant, setCreatedTenant] = useState<any>(null);
  
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    industry: "",
    subIndustry: "",
    country: "",
    website: "",
    description: "",
    size: "",
    department: "",
    title: "",
    language: "en",
  });
  
  const [selectedLicense, setSelectedLicense] = useState("professional");
  
  const token = new URLSearchParams(window.location.search).get("token");
  
  const { data: invitation, isLoading, error } = useQuery({
    queryKey: ["/api/tenant-invitations/token", token],
    queryFn: async () => {
      if (!token) throw new Error("No invitation token provided");
      const res = await fetch(`/api/tenant-invitations/token/${token}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Invalid invitation");
      }
      return res.json();
    },
    enabled: !!token,
  });
  
  useEffect(() => {
    if (invitation && !isLoading) {
      setStep("profile");
    }
  }, [invitation, isLoading]);
  
  const acceptMutation = useMutation({
    mutationFn: async (data: { token: string; profile: typeof profile }) => {
      const res = await apiRequest("POST", "/api/onboarding/accept-invite", data);
      return res.json();
    },
    onSuccess: (data) => {
      setCreatedTenant(data.tenant);
      setStep("license");
      toast({
        title: "Profile created",
        description: "Now select your license to activate your organization.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const licenseMutation = useMutation({
    mutationFn: async (data: { tenantId: string; licenseType: string }) => {
      const res = await apiRequest("POST", "/api/onboarding/select-license", data);
      return res.json();
    },
    onSuccess: () => {
      setStep("complete");
      toast({
        title: "Organization activated",
        description: "Your organization is now ready to use.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.password !== profile.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    if (profile.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }
    acceptMutation.mutate({ token: token!, profile });
  };
  
  const handleLicenseSubmit = () => {
    if (!createdTenant) return;
    licenseMutation.mutate({ tenantId: createdTenant.id, licenseType: selectedLicense });
  };
  
  if (isLoading || step === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }
  
  if (error || !token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              {(error as Error)?.message || "This invitation link is invalid or has expired."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate("/")}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (step === "complete") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <CardTitle className="text-2xl">Welcome to GRC Shield!</CardTitle>
            <CardDescription>
              Your organization <strong>{invitation?.tenantName}</strong> has been activated successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              You can now log in using your organization URL:
            </p>
            <code className="block bg-muted p-3 rounded-lg text-sm">
              https://grc-shield.replit.app/org/{invitation?.tenantSlug}
            </code>
            <Button onClick={() => navigate("/auth/login")} className="w-full" data-testid="button-goto-login">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (step === "license") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold mb-2">Select Your License</h1>
            <p className="text-muted-foreground">
              Choose the plan that best fits your organization's needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {LICENSE_TYPES.map((license) => (
              <Card 
                key={license.value}
                className={`cursor-pointer transition-all ${
                  selectedLicense === license.value 
                    ? "border-primary border-2 shadow-lg" 
                    : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedLicense(license.value)}
                data-testid={`card-license-${license.value}`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {license.name}
                    {selectedLicense === license.value && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </CardTitle>
                  <CardDescription>{license.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-4">{license.price}</div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Up to {license.users} users
                  </div>
                  <ul className="space-y-1">
                    {license.modules.map((mod, idx) => (
                      <li key={idx} className="text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        {mod}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button 
              size="lg" 
              onClick={handleLicenseSubmit}
              disabled={licenseMutation.isPending}
              data-testid="button-activate-org"
            >
              {licenseMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Activating...
                </>
              ) : (
                <>Activate Organization</>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">Welcome to GRC Shield</h1>
          <p className="text-muted-foreground">
            Complete your profile to set up <strong>{invitation?.tenantName}</strong>
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Organization Profile
            </CardTitle>
            <CardDescription>
              Set up your organization and admin account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      className="pl-10"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      required
                      data-testid="input-first-name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    required
                    data-testid="input-last-name"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      className="pl-10"
                      value={profile.password}
                      onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                      required
                      data-testid="input-password"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={profile.confirmPassword}
                    onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                    required
                    data-testid="input-confirm-password"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={profile.industry}
                    onValueChange={(value) => setProfile({ ...profile, industry: value })}
                  >
                    <SelectTrigger data-testid="select-industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Company Size</Label>
                  <Select
                    value={profile.size}
                    onValueChange={(value) => setProfile({ ...profile, size: value })}
                  >
                    <SelectTrigger data-testid="select-size">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="country"
                      className="pl-10"
                      value={profile.country}
                      onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                      placeholder="e.g., United States"
                      data-testid="input-country"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder="https://example.com"
                    data-testid="input-website"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="department"
                      className="pl-10"
                      value={profile.department}
                      onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                      placeholder="e.g., IT Security"
                      data-testid="input-department"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={profile.title}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    placeholder="e.g., CISO"
                    data-testid="input-title"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={acceptMutation.isPending}
                data-testid="button-create-profile"
              >
                {acceptMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Profile...
                  </>
                ) : (
                  <>Continue to License Selection</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
