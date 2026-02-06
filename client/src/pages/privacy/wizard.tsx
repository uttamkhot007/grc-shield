import { useState, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, FileText, Users, Globe, Brain, Sparkles, Wand2,
  CheckCircle2, ArrowRight, ArrowLeft, Check, Building2,
  Scale, Database, Lock, Eye, UserCheck, AlertTriangle,
  Settings, Zap, Target, Lightbulb, BookOpen, ClipboardCheck,
  MapPin, RefreshCw, Loader2, Play, CircleDot
} from "lucide-react";
import { useTenant } from "@/contexts/tenant-context";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Framework, DataInventory, LegalBasis, DsrTypeRef, CountryFrameworkMapping } from "@shared/schema";

const FRAMEWORK_COLORS: Record<string, string> = {
  "GDPR": "bg-blue-500",
  "DPDP": "bg-orange-500",
  "Saudi PDP": "bg-green-500",
  "CCPA": "bg-amber-500",
  "LGPD": "bg-teal-500",
  "PDPA": "bg-purple-500",
  "UAE PDPL": "bg-emerald-500",
  "UK GDPR": "bg-indigo-500",
  "Bahrain PDPL": "bg-cyan-500",
  "Kenya DPA": "bg-red-500",
  "default": "bg-slate-500",
};

interface WizardState {
  selectedFrameworks: string[];
  organizationProfile: {
    name: string;
    industry: string;
    size: string;
    regions: string[];
    hasDPO: boolean;
    dpoName: string;
    dpoEmail: string;
  };
  dataInventory: {
    categories: string[];
    processingActivities: string[];
    thirdParties: string[];
  };
  legalBasis: {
    defaultBasis: string;
    purposes: { name: string; basis: string; description: string }[];
  };
  dsrConfig: {
    enabledRights: string[];
    responseTimeframe: string;
    verificationMethod: string;
    automationLevel: string;
  };
}

export default function PrivacyWizardPage() {
  const { currentTenantId, currentTenant } = useTenant();
  const { toast } = useToast();
  const [wizardStep, setWizardStep] = useState(1);
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);

  const { data: dbFrameworks = [] } = useQuery<Framework[]>({
    queryKey: ["/api/frameworks"],
  });

  const { data: dbDataInventory = [] } = useQuery<DataInventory[]>({
    queryKey: ["/api/data-inventory", currentTenantId],
    enabled: !!currentTenantId,
  });

  const { data: legalBases = [] } = useQuery<LegalBasis[]>({
    queryKey: ["/api/privacy/legal-bases"],
  });

  const { data: dsrTypes = [] } = useQuery<DsrTypeRef[]>({
    queryKey: ["/api/privacy/dsr-types"],
  });

  // Fetch country-specific framework recommendations based on tenant's country
  const tenantCountry = currentTenant?.country || "";
  const { data: countryMappings = [] } = useQuery<CountryFrameworkMapping[]>({
    queryKey: ["/api/privacy/frameworks-by-country", tenantCountry],
    enabled: !!tenantCountry,
  });

  // Create a lookup map for country recommendations
  const countryRecommendations = useMemo(() => {
    const map: Record<string, { isRequired: boolean; isRecommended: boolean; notes: string }> = {};
    countryMappings.forEach((m) => {
      if (m.frameworkId) {
        map[m.frameworkId] = {
          isRequired: m.isRequired || false,
          isRecommended: m.isRecommended || false,
          notes: m.notes || "",
        };
      }
    });
    return map;
  }, [countryMappings]);

  const privacyFrameworks = useMemo(() => {
    const frameworks = dbFrameworks
      .filter((f) => f.category === "privacy")
      .map((f) => {
        const countryRec = countryRecommendations[f.id] || null;
        return {
          id: f.id,
          name: f.shortName || f.name,
          fullName: f.name,
          region: f.region || "Global",
          description: f.description || "",
          color: FRAMEWORK_COLORS[f.shortName || ""] || FRAMEWORK_COLORS.default,
          requirements: [],
          controlCount: f.controlCount || 0,
          isRequired: countryRec?.isRequired || false,
          isRecommended: countryRec?.isRecommended || false,
          countryNotes: countryRec?.notes || "",
        };
      });
    
    // Sort: required first, then recommended, then alphabetical
    return frameworks.sort((a, b) => {
      if (a.isRequired && !b.isRequired) return -1;
      if (!a.isRequired && b.isRequired) return 1;
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [dbFrameworks, countryRecommendations]);

  const dataCategories = useMemo(() => {
    return dbDataInventory.map((item) => ({
      id: item.id,
      name: item.dataClass || item.category || "Unknown",
      examples: item.description || "",
      sensitivity: item.sensitivity || "medium",
    }));
  }, [dbDataInventory]);
  
  const [wizardState, setWizardState] = useState<WizardState>({
    selectedFrameworks: [],
    organizationProfile: {
      name: currentTenant?.name || "",
      industry: "",
      size: "",
      regions: [],
      hasDPO: false,
      dpoName: "",
      dpoEmail: "",
    },
    dataInventory: {
      categories: [],
      processingActivities: [],
      thirdParties: [],
    },
    legalBasis: {
      defaultBasis: "consent",
      purposes: [],
    },
    dsrConfig: {
      enabledRights: ["access", "rectification", "erasure", "portability"],
      responseTimeframe: "30",
      verificationMethod: "email",
      automationLevel: "semi",
    },
  });

  const toggleFramework = (frameworkId: string) => {
    setWizardState(prev => ({
      ...prev,
      selectedFrameworks: prev.selectedFrameworks.includes(frameworkId)
        ? prev.selectedFrameworks.filter(f => f !== frameworkId)
        : [...prev.selectedFrameworks, frameworkId]
    }));
  };

  const toggleDataCategory = (categoryId: string) => {
    setWizardState(prev => ({
      ...prev,
      dataInventory: {
        ...prev.dataInventory,
        categories: prev.dataInventory.categories.includes(categoryId)
          ? prev.dataInventory.categories.filter(c => c !== categoryId)
          : [...prev.dataInventory.categories, categoryId]
      }
    }));
  };

  const toggleDsrRight = (rightId: string) => {
    setWizardState(prev => ({
      ...prev,
      dsrConfig: {
        ...prev.dsrConfig,
        enabledRights: prev.dsrConfig.enabledRights.includes(rightId)
          ? prev.dsrConfig.enabledRights.filter(r => r !== rightId)
          : [...prev.dsrConfig.enabledRights, rightId]
      }
    }));
  };

  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);

  const aiAnalysisMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/ai/privacy-analysis", "POST", {
        tenantId: currentTenantId,
        wizardState,
      });
    },
    onSuccess: (data) => {
      setAiRecommendations(data);
      setAiAnalysisError(null);
    },
    onError: (error: Error) => {
      setAiAnalysisError(error.message || "Failed to run AI analysis. Please try again.");
      setAiRecommendations(null);
    },
  });

  const runAiAnalysis = () => {
    setAiAnalysisError(null);
    aiAnalysisMutation.mutate();
  };

  const setupPrivacyMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/privacy/setup", "POST", {
        tenantId: currentTenantId,
        configuration: wizardState,
        aiRecommendations,
      });
    },
    onSuccess: () => {
      toast({
        title: "Privacy Program Configured",
        description: "Your privacy compliance setup has been completed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/privacy"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ropa-records", currentTenantId] });
      queryClient.invalidateQueries({ queryKey: ["/api/consent-purposes", currentTenantId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to save privacy configuration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const WIZARD_STEPS = [
    { step: 1, label: "Framework Selection", icon: Scale },
    { step: 2, label: "Organization Profile", icon: Building2 },
    { step: 3, label: "Data Inventory", icon: Database },
    { step: 4, label: "Legal Basis", icon: FileText },
    { step: 5, label: "DSR & Consent", icon: UserCheck },
    { step: 6, label: "AI Analysis", icon: Brain },
  ];

  const getSelectedFrameworkDetails = () => {
    return privacyFrameworks.filter(f => wizardState.selectedFrameworks.includes(f.id));
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="mesh-gradient min-h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <Wand2 className="h-6 w-6 text-purple-400" />
                </div>
                <h1 className="text-2xl font-bold gradient-text">Privacy Compliance Wizard</h1>
              </div>
              <p className="text-muted-foreground">
                Automate your privacy program setup with AI-powered guidance and framework-specific recommendations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-purple-400 border-purple-400/30">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Enhanced
              </Badge>
              <Progress value={(wizardStep / 6) * 100} className="w-32 h-2" />
              <span className="text-sm text-muted-foreground">Step {wizardStep} of 6</span>
            </div>
          </div>

          <Card className="card-3d overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Privacy Program Setup</CardTitle>
                <div className="flex items-center gap-2">
                  {wizardState.selectedFrameworks.length > 0 && (
                    <div className="flex gap-1">
                      {wizardState.selectedFrameworks.slice(0, 3).map(fId => {
                        const framework = privacyFrameworks.find(f => f.id === fId);
                        return framework ? (
                          <Badge key={fId} className={`${framework.color} text-white text-xs`}>
                            {framework.name}
                          </Badge>
                        ) : null;
                      })}
                      {wizardState.selectedFrameworks.length > 3 && (
                        <Badge variant="outline">+{wizardState.selectedFrameworks.length - 3}</Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-8 px-4 overflow-x-auto">
                {WIZARD_STEPS.map(({ step, label, icon: StepIcon }, index, arr) => (
                  <div key={step} className="flex items-center">
                    <div className="flex flex-col items-center min-w-[80px]">
                      <Button
                        size="icon"
                        variant={wizardStep === step ? "default" : wizardStep > step ? "outline" : "ghost"}
                        onClick={() => setWizardStep(step)}
                        className={`rounded-full transition-all duration-300 ${
                          wizardStep === step
                            ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 border-0"
                            : wizardStep > step
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : ""
                        }`}
                        data-testid={`wizard-step-${step}`}
                      >
                        {wizardStep > step ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <StepIcon className="w-5 h-5" />
                        )}
                      </Button>
                      <span className={`text-xs mt-2 font-medium text-center ${
                        wizardStep === step ? "text-purple-400" : "text-muted-foreground"
                      }`}>
                        {label}
                      </span>
                    </div>
                    {index < arr.length - 1 && (
                      <div className={`w-12 h-0.5 mx-2 ${
                        wizardStep > step ? "bg-green-500/50" : "bg-border"
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              <div className="min-h-[450px] p-6 rounded-xl bg-background/50 border border-border/50">
                {wizardStep === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-purple-500/10">
                        <Scale className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">Select Privacy Frameworks</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Choose the privacy regulations applicable to your organization. You can select multiple frameworks.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-purple-400 font-medium">AI will map requirements</span>
                      </div>
                    </div>

                    {tenantCountry && countryMappings.length > 0 && (
                      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Globe className="w-5 h-5 text-blue-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">
                                Recommendations for <span className="text-blue-400">{tenantCountry}</span>
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Based on your organization's location, we've highlighted applicable privacy frameworks.
                                <span className="text-red-400 ml-1">Required</span> frameworks are mandatory for compliance, 
                                while <span className="text-green-400">Recommended</span> frameworks provide additional best practices.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dbFrameworks.length === 0 ? (
                        <Card className="col-span-full bg-muted/30 border-dashed">
                          <CardContent className="p-8 text-center">
                            <Loader2 className="w-8 h-8 mx-auto text-muted-foreground/50 mb-4 animate-spin" />
                            <p className="text-muted-foreground">Loading privacy frameworks from database...</p>
                          </CardContent>
                        </Card>
                      ) : privacyFrameworks.length === 0 ? (
                        <Card className="col-span-full bg-amber-500/10 border-amber-500/20">
                          <CardContent className="p-6 text-center">
                            <AlertTriangle className="w-8 h-8 mx-auto text-amber-400 mb-3" />
                            <p className="text-amber-400 font-medium">No privacy frameworks found</p>
                            <p className="text-sm text-muted-foreground mt-1">Privacy frameworks need to be configured in your tenant settings.</p>
                          </CardContent>
                        </Card>
                      ) : (
                        privacyFrameworks.map((framework) => (
                          <Card
                            key={framework.id}
                            className={`cursor-pointer transition-all hover-elevate ${
                              wizardState.selectedFrameworks.includes(framework.id)
                                ? "ring-2 ring-purple-500 bg-purple-500/5"
                                : framework.isRequired
                                ? "ring-1 ring-red-500/50 bg-red-500/5"
                                : framework.isRecommended
                                ? "ring-1 ring-green-500/50 bg-green-500/5"
                                : ""
                            }`}
                            onClick={() => toggleFramework(framework.id)}
                            data-testid={`framework-${framework.id}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className={`p-2 rounded-lg ${framework.color}/20`}>
                                  <Shield className={`w-5 h-5 ${framework.color.replace("bg-", "text-")}`} />
                                </div>
                                <div className="flex items-center gap-1">
                                  {framework.isRequired && (
                                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] px-1.5 py-0">
                                      Required
                                    </Badge>
                                  )}
                                  {framework.isRecommended && !framework.isRequired && (
                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] px-1.5 py-0">
                                      Recommended
                                    </Badge>
                                  )}
                                  {wizardState.selectedFrameworks.includes(framework.id) && (
                                    <CheckCircle2 className="w-5 h-5 text-purple-400" />
                                  )}
                                </div>
                              </div>
                              <h4 className="font-semibold">{framework.name}</h4>
                              <p className="text-xs text-muted-foreground mb-2">{framework.fullName}</p>
                              <div className="flex flex-wrap gap-1 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {framework.region}
                                </Badge>
                                {framework.controlCount > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {framework.controlCount} controls
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">{framework.description}</p>
                              {framework.countryNotes && (
                                <p className="text-[10px] text-muted-foreground mt-2 italic">{framework.countryNotes}</p>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>

                    {wizardState.selectedFrameworks.length > 0 && (
                      <Card className="bg-purple-500/5 border-purple-500/20">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Brain className="w-5 h-5 text-purple-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-purple-400">AI Analysis Preview</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                You've selected {wizardState.selectedFrameworks.length} framework(s). AI will analyze overlapping requirements 
                                and create a unified compliance program covering all selected regulations.
                              </p>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {getSelectedFrameworkDetails().map(f => (
                                  <Badge key={f.id} variant="secondary" className="text-xs">
                                    {f.requirements.length} requirements
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-blue-500/10">
                        <Building2 className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">Organization Profile</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Help us understand your organization to tailor privacy requirements
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="org-name">Organization Name</Label>
                        <Input
                          id="org-name"
                          value={wizardState.organizationProfile.name}
                          onChange={(e) => setWizardState(prev => ({
                            ...prev,
                            organizationProfile: { ...prev.organizationProfile, name: e.target.value }
                          }))}
                          placeholder="Enter organization name"
                          data-testid="input-wizard-org-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="org-industry">Industry Sector</Label>
                        <Select
                          value={wizardState.organizationProfile.industry}
                          onValueChange={(value) => setWizardState(prev => ({
                            ...prev,
                            organizationProfile: { ...prev.organizationProfile, industry: value }
                          }))}
                        >
                          <SelectTrigger data-testid="select-wizard-industry">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="financial">Financial Services</SelectItem>
                            <SelectItem value="healthcare">Healthcare & Life Sciences</SelectItem>
                            <SelectItem value="technology">Technology & Software</SelectItem>
                            <SelectItem value="retail">Retail & E-commerce</SelectItem>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="government">Government & Public Sector</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="telecom">Telecommunications</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="org-size">Organization Size</Label>
                        <Select
                          value={wizardState.organizationProfile.size}
                          onValueChange={(value) => setWizardState(prev => ({
                            ...prev,
                            organizationProfile: { ...prev.organizationProfile, size: value }
                          }))}
                        >
                          <SelectTrigger data-testid="select-wizard-size">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small (1-100 employees)</SelectItem>
                            <SelectItem value="medium">Medium (101-1000 employees)</SelectItem>
                            <SelectItem value="large">Large (1001-10000 employees)</SelectItem>
                            <SelectItem value="enterprise">Enterprise (10000+ employees)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="data-subjects">Estimated Data Subjects</Label>
                        <Select>
                          <SelectTrigger data-testid="select-wizard-data-subjects">
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="under10k">Under 10,000</SelectItem>
                            <SelectItem value="10k-100k">10,000 - 100,000</SelectItem>
                            <SelectItem value="100k-1m">100,000 - 1 Million</SelectItem>
                            <SelectItem value="over1m">Over 1 Million</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="border-t border-border/50 pt-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Checkbox
                          id="has-dpo"
                          checked={wizardState.organizationProfile.hasDPO}
                          onCheckedChange={(checked) => setWizardState(prev => ({
                            ...prev,
                            organizationProfile: { ...prev.organizationProfile, hasDPO: !!checked }
                          }))}
                        />
                        <Label htmlFor="has-dpo">Organization has a Data Protection Officer (DPO)</Label>
                      </div>
                      {wizardState.organizationProfile.hasDPO && (
                        <div className="grid md:grid-cols-2 gap-4 pl-6">
                          <div>
                            <Label htmlFor="dpo-name">DPO Name</Label>
                            <Input
                              id="dpo-name"
                              value={wizardState.organizationProfile.dpoName}
                              onChange={(e) => setWizardState(prev => ({
                                ...prev,
                                organizationProfile: { ...prev.organizationProfile, dpoName: e.target.value }
                              }))}
                              placeholder="Enter DPO name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="dpo-email">DPO Email</Label>
                            <Input
                              id="dpo-email"
                              type="email"
                              value={wizardState.organizationProfile.dpoEmail}
                              onChange={(e) => setWizardState(prev => ({
                                ...prev,
                                organizationProfile: { ...prev.organizationProfile, dpoEmail: e.target.value }
                              }))}
                              placeholder="dpo@company.com"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <Card className="bg-blue-500/5 border-blue-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="w-5 h-5 text-blue-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-400">AI Insight</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {wizardState.organizationProfile.industry === "healthcare"
                                ? "Healthcare organizations typically require enhanced data protection measures including HIPAA compliance considerations alongside selected privacy frameworks."
                                : wizardState.organizationProfile.industry === "financial"
                                ? "Financial services organizations often face additional regulatory requirements. AI will consider sector-specific data protection rules."
                                : "Based on your organization profile, AI will customize privacy requirements and suggest appropriate control implementations."}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-teal-500/10">
                        <Database className="w-6 h-6 text-teal-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">Data Inventory</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Select the categories of personal data your organization processes
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Wand2 className="w-4 h-4" />
                        Auto-Detect
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      {dataCategories.length === 0 ? (
                        <Card className="col-span-full bg-amber-500/10 border-amber-500/20">
                          <CardContent className="p-6 text-center">
                            <Database className="w-8 h-8 mx-auto text-amber-400 mb-3" />
                            <p className="text-amber-400 font-medium">No Data Inventory Found</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Data inventory needs to be configured first. Go to Privacy &gt; Data Inventory to add your data categories.
                            </p>
                          </CardContent>
                        </Card>
                      ) : (
                        dataCategories.map((category) => (
                          <Card
                            key={category.id}
                            className={`cursor-pointer transition-all hover-elevate ${
                              wizardState.dataInventory.categories.includes(category.id)
                                ? "ring-2 ring-teal-500 bg-teal-500/5"
                                : ""
                            }`}
                            onClick={() => toggleDataCategory(category.id)}
                            data-testid={`data-category-${category.id}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    checked={wizardState.dataInventory.categories.includes(category.id)}
                                    onCheckedChange={() => toggleDataCategory(category.id)}
                                  />
                                  <div>
                                    <p className="font-medium">{category.name}</p>
                                    <p className="text-xs text-muted-foreground">{category.examples}</p>
                                  </div>
                                </div>
                                <Badge
                                  className={`text-xs ${
                                    category.sensitivity === "critical"
                                      ? "bg-red-500/20 text-red-400"
                                      : category.sensitivity === "high"
                                      ? "bg-orange-500/20 text-orange-400"
                                      : "bg-blue-500/20 text-blue-400"
                                  }`}
                                >
                                  {category.sensitivity}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>

                    <div>
                      <Label className="mb-2 block">Third-Party Data Sharing</Label>
                      <Textarea
                        placeholder="List key third parties you share data with (e.g., Cloud providers, Marketing platforms, Payment processors)"
                        className="min-h-[80px]"
                        data-testid="textarea-third-parties"
                      />
                    </div>

                    <Card className="bg-teal-500/5 border-teal-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-teal-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-teal-400">Data Sensitivity Alert</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {wizardState.dataInventory.categories.filter(c => 
                                dataCategories.find(dc => dc.id === c)?.sensitivity === "critical"
                              ).length > 0
                                ? "You've selected critical/special category data. This triggers enhanced protection requirements including mandatory DPIAs and stricter consent mechanisms."
                                : "Select all applicable data categories to ensure comprehensive privacy coverage."}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {wizardStep === 4 && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-amber-500/10">
                        <FileText className="w-6 h-6 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">Legal Basis & Purpose</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Define the legal grounds for processing personal data
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className="mb-3 block">Primary Legal Basis</Label>
                      <div className="grid md:grid-cols-3 gap-3">
                        {legalBases.length === 0 ? (
                          <Card className="col-span-full bg-muted/30 border-dashed">
                            <CardContent className="p-6 text-center">
                              <Loader2 className="w-6 h-6 mx-auto text-muted-foreground/50 animate-spin" />
                              <p className="text-muted-foreground text-sm mt-2">Loading legal bases...</p>
                            </CardContent>
                          </Card>
                        ) : legalBases.map((basis) => (
                          <Card
                            key={basis.code}
                            className={`cursor-pointer transition-all hover-elevate ${
                              wizardState.legalBasis.defaultBasis === basis.code
                                ? "ring-2 ring-amber-500 bg-amber-500/5"
                                : ""
                            }`}
                            onClick={() => setWizardState(prev => ({
                              ...prev,
                              legalBasis: { ...prev.legalBasis, defaultBasis: basis.code }
                            }))}
                            data-testid={`legal-basis-${basis.code}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <CircleDot className={`w-4 h-4 ${
                                  wizardState.legalBasis.defaultBasis === basis.code
                                    ? "text-amber-400"
                                    : "text-muted-foreground"
                                }`} />
                                <p className="font-medium text-sm">{basis.name}</p>
                              </div>
                              <p className="text-xs text-muted-foreground">{basis.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="mb-3 block">Processing Purposes</Label>
                      <div className="space-y-2">
                        {["Customer Service", "Marketing Communications", "Analytics & Research", "Legal Compliance", "HR & Employment"].map((purpose, i) => (
                          <Card key={i} className="bg-background/50">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Checkbox defaultChecked />
                                  <span className="text-sm font-medium">{purpose}</span>
                                </div>
                                <Select defaultValue="consent">
                                  <SelectTrigger className="w-40 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {legalBases.map(b => (
                                      <SelectItem key={b.code} value={b.code}>{b.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <Card className="bg-amber-500/5 border-amber-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <BookOpen className="w-5 h-5 text-amber-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-amber-400">Framework Guidance</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {wizardState.selectedFrameworks.includes("gdpr")
                                ? "Under GDPR, you must document the legal basis for each processing activity. Consent must be freely given, specific, informed, and unambiguous."
                                : "Ensure you have a valid legal basis for each processing purpose. This is a core requirement across most privacy frameworks."}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {wizardStep === 5 && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-green-500/10">
                        <UserCheck className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">DSR & Consent Configuration</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Configure data subject rights handling and consent management
                        </p>
                      </div>
                    </div>

                    <Tabs defaultValue="dsr" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="dsr">Data Subject Rights</TabsTrigger>
                        <TabsTrigger value="consent">Consent Management</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="dsr" className="mt-4 space-y-4">
                        <div className="grid md:grid-cols-2 gap-3">
                          {dsrTypes.length === 0 ? (
                            <Card className="col-span-full bg-muted/30 border-dashed">
                              <CardContent className="p-6 text-center">
                                <Loader2 className="w-6 h-6 mx-auto text-muted-foreground/50 animate-spin" />
                                <p className="text-muted-foreground text-sm mt-2">Loading DSR types...</p>
                              </CardContent>
                            </Card>
                          ) : dsrTypes.map((dsr) => (
                            <Card
                              key={dsr.code}
                              className={`cursor-pointer transition-all hover-elevate ${
                                wizardState.dsrConfig.enabledRights.includes(dsr.code)
                                  ? "ring-2 ring-green-500 bg-green-500/5"
                                  : ""
                              }`}
                              onClick={() => toggleDsrRight(dsr.code)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-3">
                                    <Checkbox
                                      checked={wizardState.dsrConfig.enabledRights.includes(dsr.code)}
                                      onCheckedChange={() => toggleDsrRight(dsr.code)}
                                    />
                                    <div>
                                      <p className="font-medium text-sm">{dsr.name}</p>
                                      <p className="text-xs text-muted-foreground">{dsr.description}</p>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {dsr.sla}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 pt-4">
                          <div>
                            <Label>Identity Verification Method</Label>
                            <Select
                              value={wizardState.dsrConfig.verificationMethod}
                              onValueChange={(value) => setWizardState(prev => ({
                                ...prev,
                                dsrConfig: { ...prev.dsrConfig, verificationMethod: value }
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="email">Email Verification</SelectItem>
                                <SelectItem value="id_document">ID Document Upload</SelectItem>
                                <SelectItem value="account_login">Account Login</SelectItem>
                                <SelectItem value="multi_factor">Multi-Factor Verification</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Automation Level</Label>
                            <Select
                              value={wizardState.dsrConfig.automationLevel}
                              onValueChange={(value) => setWizardState(prev => ({
                                ...prev,
                                dsrConfig: { ...prev.dsrConfig, automationLevel: value }
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="manual">Manual Processing</SelectItem>
                                <SelectItem value="semi">Semi-Automated</SelectItem>
                                <SelectItem value="full">Fully Automated</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="consent" className="mt-4 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <Card className="bg-background/50">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-green-500/10">
                                  <ClipboardCheck className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                  <p className="font-medium">Consent Collection</p>
                                  <p className="text-xs text-muted-foreground">Configure how consent is obtained</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Checkbox defaultChecked id="explicit-consent" />
                                  <Label htmlFor="explicit-consent" className="text-sm">Require explicit opt-in</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Checkbox defaultChecked id="granular-consent" />
                                  <Label htmlFor="granular-consent" className="text-sm">Granular purpose-level consent</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Checkbox defaultChecked id="consent-proof" />
                                  <Label htmlFor="consent-proof" className="text-sm">Store consent proof/audit trail</Label>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="bg-background/50">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                  <RefreshCw className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                  <p className="font-medium">Consent Renewal</p>
                                  <p className="text-xs text-muted-foreground">Configure renewal settings</p>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <Label className="text-sm">Renewal Period</Label>
                                  <Select defaultValue="12">
                                    <SelectTrigger className="mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="6">Every 6 months</SelectItem>
                                      <SelectItem value="12">Every 12 months</SelectItem>
                                      <SelectItem value="24">Every 24 months</SelectItem>
                                      <SelectItem value="never">No automatic renewal</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <Card className="bg-green-500/5 border-green-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Zap className="w-5 h-5 text-green-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-green-400">Automation Opportunity</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              With semi-automated DSR processing, you can reduce response time by up to 70% while maintaining 
                              human oversight for complex requests. AI can assist with data discovery and report generation.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {wizardStep === 6 && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                        <Brain className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">AI Analysis & Recommendations</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Get AI-powered insights and automation recommendations for your privacy program
                        </p>
                      </div>
                      <Button
                        onClick={runAiAnalysis}
                        disabled={aiAnalysisMutation.isPending}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        data-testid="button-run-ai-analysis"
                      >
                        {aiAnalysisMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Run AI Analysis
                          </>
                        )}
                      </Button>
                    </div>

                    {aiAnalysisError && (
                      <Card className="bg-red-500/10 border-red-500/20">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-400">AI Analysis Failed</p>
                              <p className="text-sm text-muted-foreground mt-1">{aiAnalysisError}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={runAiAnalysis}
                                className="mt-3"
                                disabled={aiAnalysisMutation.isPending}
                              >
                                Try Again
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {aiRecommendations ? (
                      <div className="space-y-4">
                        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="text-lg font-semibold">Compliance Score</h4>
                                <p className="text-sm text-muted-foreground">Based on selected frameworks and configuration</p>
                              </div>
                              <div className="text-right">
                                <p className="text-4xl font-bold gradient-text">{aiRecommendations.complianceScore}%</p>
                                <p className="text-xs text-muted-foreground">Current readiness</p>
                              </div>
                            </div>
                            <Progress value={aiRecommendations.complianceScore} className="h-3" />
                          </CardContent>
                        </Card>

                        <div className="grid md:grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                Compliance Gaps
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ScrollArea className="h-[180px]">
                                <div className="space-y-3">
                                  {aiRecommendations.gaps.map((gap: any, i: number) => (
                                    <div key={i} className="p-3 rounded-lg bg-muted/50">
                                      <div className="flex items-start justify-between mb-1">
                                        <p className="font-medium text-sm">{gap.area}</p>
                                        <Badge className={`text-xs ${
                                          gap.priority === "high"
                                            ? "bg-red-500/20 text-red-400"
                                            : "bg-amber-500/20 text-amber-400"
                                        }`}>
                                          {gap.priority}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground">{gap.recommendation}</p>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Zap className="w-4 h-4 text-green-400" />
                                Automation Opportunities
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ScrollArea className="h-[180px]">
                                <div className="space-y-3">
                                  {aiRecommendations.automationOpportunities.map((opp: any, i: number) => (
                                    <div key={i} className="p-3 rounded-lg bg-muted/50">
                                      <div className="flex items-start justify-between mb-1">
                                        <p className="font-medium text-sm">{opp.area}</p>
                                        <Badge className="bg-green-500/20 text-green-400 text-xs">
                                          {opp.potential} automatable
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground">{opp.description}</p>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </CardContent>
                          </Card>
                        </div>

                        {aiRecommendations.frameworkMapping.length > 0 && (
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Target className="w-4 h-4 text-blue-400" />
                                Framework Coverage
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid md:grid-cols-3 gap-4">
                                {aiRecommendations.frameworkMapping.map((fm: any, i: number) => (
                                  <div key={i} className="text-center p-4 rounded-lg bg-muted/50">
                                    <p className="font-semibold mb-2">{fm.framework}</p>
                                    <div className="relative inline-flex items-center justify-center w-16 h-16 mb-2">
                                      <svg className="transform -rotate-90 w-16 h-16">
                                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted" />
                                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" 
                                          strokeDasharray={`${fm.coverage * 1.76} 176`}
                                          className="text-purple-500" />
                                      </svg>
                                      <span className="absolute text-sm font-bold">{fm.coverage}%</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{fm.missingControls} controls needed</p>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    ) : (
                      <Card className="bg-muted/30 border-dashed">
                        <CardContent className="p-12 text-center">
                          <Brain className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                          <h4 className="text-lg font-semibold mb-2">Ready for AI Analysis</h4>
                          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                            Click "Run AI Analysis" to get personalized recommendations based on your 
                            selected frameworks, organization profile, and data inventory.
                          </p>
                          <div className="flex justify-center gap-2 flex-wrap">
                            <Badge variant="outline">Gap Analysis</Badge>
                            <Badge variant="outline">Control Mapping</Badge>
                            <Badge variant="outline">Automation Recommendations</Badge>
                            <Badge variant="outline">Compliance Scoring</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/50">
                <Button
                  variant="outline"
                  onClick={() => setWizardStep(Math.max(1, wizardStep - 1))}
                  disabled={wizardStep === 1}
                  data-testid="button-wizard-previous"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <div className="flex gap-1">
                  {WIZARD_STEPS.map(({ step }) => (
                    <Button
                      key={step}
                      size="sm"
                      variant="ghost"
                      onClick={() => setWizardStep(step)}
                      className={`w-8 h-8 p-0 rounded-full ${
                        wizardStep === step 
                          ? "bg-purple-500/20 text-purple-400" 
                          : wizardStep > step 
                          ? "bg-green-500/20 text-green-400"
                          : ""
                      }`}
                    >
                      {step}
                    </Button>
                  ))}
                </div>
                {wizardStep === 6 ? (
                  <Button
                    onClick={() => setupPrivacyMutation.mutate()}
                    disabled={setupPrivacyMutation.isPending}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    data-testid="button-complete-wizard"
                  >
                    {setupPrivacyMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Complete Setup
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setWizardStep(Math.min(6, wizardStep + 1))}
                    data-testid="button-wizard-next"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
