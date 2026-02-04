import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Shield, CheckCircle2, Building2, Settings2, UserPlus, Mail, 
  Globe, Users, ArrowRight, ArrowLeft, Loader2, Check, 
  FileCheck, AlertTriangle, Lock, BarChart3, Database, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const orgSchema = z.object({
  organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
  domain: z.string().min(2, "Domain must be at least 2 characters"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  industry: z.string().min(1, "Please select an industry"),
  subIndustry: z.string().optional(),
  country: z.string().min(1, "Please select a country"),
  companySize: z.string().min(1, "Please select company size"),
  description: z.string().optional(),
});

const adminSchema = z.object({
  adminFirstName: z.string().min(2, "First name must be at least 2 characters"),
  adminLastName: z.string().min(2, "Last name must be at least 2 characters"),
  adminEmail: z.string().email("Please enter a valid email address"),
  adminPhone: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms"),
});

const industries = [
  "Financial Services",
  "Healthcare",
  "Technology",
  "Manufacturing",
  "Telecommunications",
  "Energy & Utilities",
  "Retail & Consumer",
  "Government & Public Sector",
  "Professional Services",
  "Education",
  "Transportation & Logistics",
  "Real Estate",
  "Media & Entertainment",
  "Hospitality",
  "Cybersecurity",
  "Other",
];

const countries = [
  { name: "United States", code: "US" },
  { name: "United Kingdom", code: "UK" },
  { name: "Germany", code: "DE" },
  { name: "France", code: "FR" },
  { name: "India", code: "IN" },
  { name: "Singapore", code: "SG" },
  { name: "United Arab Emirates", code: "AE" },
  { name: "Saudi Arabia", code: "SA" },
  { name: "Bahrain", code: "BH" },
  { name: "Qatar", code: "QA" },
  { name: "Kuwait", code: "KW" },
  { name: "Oman", code: "OM" },
  { name: "Australia", code: "AU" },
  { name: "Japan", code: "JP" },
  { name: "South Korea", code: "KR" },
  { name: "Brazil", code: "BR" },
  { name: "Canada", code: "CA" },
  { name: "Kenya", code: "KE" },
  { name: "South Africa", code: "ZA" },
  { name: "Nigeria", code: "NG" },
];

const companySizes = [
  { value: "1-50", label: "1-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1001-5000", label: "1001-5000 employees" },
  { value: "5000+", label: "5000+ employees" },
];

const modules = [
  { id: "governance", name: "Governance", icon: FileCheck, description: "Policy management, frameworks, processes" },
  { id: "risk", name: "Risk Management", icon: AlertTriangle, description: "Risk register, assessments, mitigation" },
  { id: "compliance", name: "Compliance", icon: Shield, description: "Compliance tracking, evidence, gaps" },
  { id: "audit", name: "Auditing", icon: Eye, description: "Audit planning, execution, findings" },
  { id: "privacy", name: "Data Privacy", icon: Lock, description: "DSAR, consent, breach management" },
  { id: "vendors", name: "Vendor Risk", icon: Users, description: "Third-party risk management" },
  { id: "reports", name: "Reports & Analytics", icon: BarChart3, description: "Dashboards, reports, insights" },
  { id: "bcp", name: "Business Continuity", icon: Database, description: "BCP/DR, BIA, recovery testing" },
];

const frameworks = [
  { id: "iso27001", name: "ISO 27001:2022", category: "Security", region: "Global" },
  { id: "soc2", name: "SOC 2 Type II", category: "Security", region: "Global" },
  { id: "gdpr", name: "GDPR", category: "Privacy", region: "Europe" },
  { id: "nist", name: "NIST CSF 2.0", category: "Security", region: "Global" },
  { id: "pci", name: "PCI DSS v4.0", category: "Security", region: "Global" },
  { id: "hipaa", name: "HIPAA", category: "Privacy", region: "US" },
  { id: "nca", name: "NCA ECC", category: "Security", region: "Gulf" },
  { id: "sama", name: "SAMA CSF", category: "Security", region: "Gulf" },
  { id: "dpdp", name: "DPDP Act", category: "Privacy", region: "India" },
  { id: "rbi", name: "RBI CSF", category: "Security", region: "India" },
  { id: "cmmc", name: "CMMC 2.0", category: "Security", region: "US" },
  { id: "ccpa", name: "CCPA/CPRA", category: "Privacy", region: "US" },
];

const steps = [
  { id: 1, name: "Email Verification", icon: Mail, description: "Verify your business email" },
  { id: 2, name: "Organization Details", icon: Building2, description: "Tell us about your organization" },
  { id: 3, name: "Modules & Frameworks", icon: Settings2, description: "Select your GRC modules" },
  { id: 4, name: "Admin Setup", icon: UserPlus, description: "Configure your admin account" },
];

const provisioningSteps = [
  { id: "grc_core", name: "GRC Core Platform", progress: 15 },
  { id: "governance", name: "Governance Module", progress: 30 },
  { id: "risk", name: "Risk Management", progress: 45 },
  { id: "compliance", name: "Compliance Engine", progress: 60 },
  { id: "audit", name: "Audit Workflows", progress: 70 },
  { id: "privacy", name: "Privacy Module", progress: 80 },
  { id: "reports", name: "Reports & Analytics", progress: 90 },
  { id: "completed", name: "Finalization", progress: 100 },
];

export default function TenantRegistrationPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>(["governance", "risk", "compliance", "reports"]);
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(["iso27001", "soc2"]);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisioningProgress, setProvisioningProgress] = useState(0);
  const [currentProvisioningStep, setCurrentProvisioningStep] = useState("");
  const [onboardingRequestId, setOnboardingRequestId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    organizationName: "",
    domain: "",
    website: "",
    industry: "",
    subIndustry: "",
    country: "",
    companySize: "",
    description: "",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPhone: "",
  });

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const orgForm = useForm<z.infer<typeof orgSchema>>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      organizationName: "",
      domain: "",
      website: "",
      industry: "",
      subIndustry: "",
      country: "",
      companySize: "",
      description: "",
    },
  });

  const adminForm = useForm<z.infer<typeof adminSchema>>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      adminFirstName: "",
      adminLastName: "",
      adminEmail: "",
      adminPhone: "",
      agreeToTerms: false,
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await apiRequest("POST", "/api/onboarding/verify-email", data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.verified) {
        setEmailVerified(true);
        setFormData(prev => ({ ...prev, email: emailForm.getValues("email") }));
        toast({
          title: "Email verified",
          description: "Your email domain is authorized. Please continue with registration.",
        });
        setCurrentStep(2);
      } else {
        setVerificationSent(true);
        toast({
          title: "Verification email sent",
          description: "Please check your inbox and click the verification link.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed",
        description: error.message || "Your email domain is not authorized for self-registration. Please contact support.",
        variant: "destructive",
      });
    },
  });

  const submitOnboardingMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/onboarding/submit", data);
      return res.json();
    },
    onSuccess: (data) => {
      setOnboardingRequestId(data.id);
      setIsProvisioning(true);
      toast({
        title: "Registration submitted",
        description: "Your tenant is being provisioned. This may take a moment.",
      });
      simulateProvisioning();
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to submit registration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const simulateProvisioning = () => {
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < provisioningSteps.length) {
        const step = provisioningSteps[stepIndex];
        setCurrentProvisioningStep(step.name);
        setProvisioningProgress(step.progress);
        stepIndex++;
      } else {
        clearInterval(interval);
        toast({
          title: "Tenant provisioned successfully!",
          description: "Your GRC Shield tenant is ready. Redirecting to login...",
        });
        setTimeout(() => navigate("/auth/login"), 2000);
      }
    }, 1500);
  };

  const handleEmailSubmit = (data: z.infer<typeof emailSchema>) => {
    verifyEmailMutation.mutate(data);
  };

  const handleOrgSubmit = (data: z.infer<typeof orgSchema>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setCurrentStep(3);
  };

  const handleModuleSelection = () => {
    setCurrentStep(4);
  };

  const handleAdminSubmit = (data: z.infer<typeof adminSchema>) => {
    const finalData = {
      ...formData,
      ...data,
      selectedModules,
      selectedFrameworks,
    };
    submitOnboardingMutation.mutate(finalData);
  };

  const toggleModule = (moduleId: string) => {
    setSelectedModules(prev =>
      prev.includes(moduleId) ? prev.filter(m => m !== moduleId) : [...prev, moduleId]
    );
  };

  const toggleFramework = (frameworkId: string) => {
    setSelectedFrameworks(prev =>
      prev.includes(frameworkId) ? prev.filter(f => f !== frameworkId) : [...prev, frameworkId]
    );
  };

  if (isProvisioning) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl glassmorphism-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <CardTitle className="text-2xl gradient-text">Provisioning Your Tenant</CardTitle>
            <CardDescription>
              Setting up your GRC Shield environment. This may take a moment...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{currentProvisioningStep}</span>
                <span className="font-medium">{provisioningProgress}%</span>
              </div>
              <Progress value={provisioningProgress} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {provisioningSteps.map((step, index) => {
                const isComplete = provisioningProgress >= step.progress;
                const isCurrent = currentProvisioningStep === step.name;
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                      isComplete ? "bg-chart-2/10 text-chart-2" : 
                      isCurrent ? "bg-primary/10 text-primary" : 
                      "text-muted-foreground"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border" />
                    )}
                    <span className="text-sm">{step.name}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold gradient-text">GRC Shield</span>
          </div>
          <Button variant="outline" asChild data-testid="button-back-to-login">
            <a href="/auth/login">Back to Login</a>
          </Button>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">Register Your Organization</h1>
            <p className="text-muted-foreground">
              Set up your enterprise GRC platform in just a few steps
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                      currentStep === step.id
                        ? "bg-primary text-primary-foreground"
                        : currentStep > step.id
                        ? "bg-chart-2/20 text-chart-2"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline text-sm font-medium">{step.name}</span>
                    <span className="sm:hidden text-sm font-medium">{step.id}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-1 ${currentStep > step.id ? "bg-chart-2" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card className="glassmorphism-card">
            {currentStep === 1 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Email Verification
                  </CardTitle>
                  <CardDescription>
                    Enter your business email to verify your organization's domain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-6">
                      <FormField
                        control={emailForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="you@company.com"
                                type="email"
                                data-testid="input-email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {verificationSent && (
                        <div className="p-4 bg-chart-2/10 border border-chart-2/20 rounded-lg">
                          <p className="text-sm text-chart-2">
                            A verification email has been sent. Please check your inbox and click the verification link.
                          </p>
                        </div>
                      )}
                      <Button
                        type="submit"
                        className="w-full glossy-btn"
                        disabled={verifyEmailMutation.isPending}
                        data-testid="button-verify-email"
                      >
                        {verifyEmailMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            Verify Email
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </>
            )}

            {currentStep === 2 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Organization Details
                  </CardTitle>
                  <CardDescription>
                    Tell us about your organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...orgForm}>
                    <form onSubmit={orgForm.handleSubmit(handleOrgSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={orgForm.control}
                          name="organizationName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Organization Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Acme Corporation" data-testid="input-org-name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={orgForm.control}
                          name="domain"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Primary Domain</FormLabel>
                              <FormControl>
                                <Input placeholder="acme.com" data-testid="input-domain" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={orgForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://acme.com" data-testid="input-website" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={orgForm.control}
                          name="industry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Industry</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-industry">
                                    <SelectValue placeholder="Select industry" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {industries.map((industry) => (
                                    <SelectItem key={industry} value={industry}>
                                      {industry}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={orgForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-country">
                                    <SelectValue placeholder="Select country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {countries.map((country) => (
                                    <SelectItem key={country.code} value={country.code}>
                                      {country.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={orgForm.control}
                        name="companySize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Size</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-company-size">
                                  <SelectValue placeholder="Select company size" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {companySizes.map((size) => (
                                  <SelectItem key={size.value} value={size.value}>
                                    {size.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={orgForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Brief description of your organization..."
                                className="resize-none"
                                data-testid="input-description"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(1)}
                          data-testid="button-back"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button type="submit" className="flex-1 glossy-btn" data-testid="button-continue">
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </>
            )}

            {currentStep === 3 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-primary" />
                    Modules & Frameworks
                  </CardTitle>
                  <CardDescription>
                    Select the GRC modules and compliance frameworks for your organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">GRC Modules</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {modules.map((module) => {
                        const isSelected = selectedModules.includes(module.id);
                        return (
                          <div
                            key={module.id}
                            onClick={() => toggleModule(module.id)}
                            className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border hover-elevate"
                            }`}
                            data-testid={`checkbox-module-${module.id}`}
                          >
                            <Checkbox checked={isSelected} className="mt-1" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <module.icon className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                                <span className="font-medium">{module.name}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-3 block">Compliance Frameworks</Label>
                    <div className="flex flex-wrap gap-2">
                      {frameworks.map((framework) => {
                        const isSelected = selectedFrameworks.includes(framework.id);
                        return (
                          <Badge
                            key={framework.id}
                            variant={isSelected ? "default" : "outline"}
                            className={`cursor-pointer px-3 py-1.5 ${
                              isSelected ? "bg-primary" : "hover-elevate"
                            }`}
                            onClick={() => toggleFramework(framework.id)}
                            data-testid={`badge-framework-${framework.id}`}
                          >
                            {framework.name}
                            {isSelected && <Check className="ml-1 h-3 w-3" />}
                          </Badge>
                        );
                      })}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {selectedFrameworks.length} framework(s)
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      data-testid="button-back-step3"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      onClick={handleModuleSelection}
                      className="flex-1 glossy-btn"
                      disabled={selectedModules.length === 0}
                      data-testid="button-continue-step3"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            )}

            {currentStep === 4 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    Admin Account Setup
                  </CardTitle>
                  <CardDescription>
                    Configure the primary administrator account for your organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...adminForm}>
                    <form onSubmit={adminForm.handleSubmit(handleAdminSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={adminForm.control}
                          name="adminFirstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" data-testid="input-admin-first-name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={adminForm.control}
                          name="adminLastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" data-testid="input-admin-last-name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={adminForm.control}
                          name="adminEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Admin Email</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="admin@company.com"
                                  type="email"
                                  data-testid="input-admin-email"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={adminForm.control}
                          name="adminPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="+1 (555) 123-4567" data-testid="input-admin-phone" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                        <h4 className="font-medium">Registration Summary</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Organization:</div>
                          <div>{formData.organizationName || "Not specified"}</div>
                          <div className="text-muted-foreground">Domain:</div>
                          <div>{formData.domain || "Not specified"}</div>
                          <div className="text-muted-foreground">Modules:</div>
                          <div>{selectedModules.length} selected</div>
                          <div className="text-muted-foreground">Frameworks:</div>
                          <div>{selectedFrameworks.length} selected</div>
                        </div>
                      </div>

                      <FormField
                        control={adminForm.control}
                        name="agreeToTerms"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-terms"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                I agree to the Terms of Service and Privacy Policy
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(3)}
                          data-testid="button-back-step4"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 glossy-btn"
                          disabled={submitOnboardingMutation.isPending}
                          data-testid="button-submit-registration"
                        >
                          {submitOnboardingMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              Complete Registration
                              <CheckCircle2 className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
