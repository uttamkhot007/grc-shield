import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  FileText, 
  Settings, 
  Link2, 
  Eye,
  Sparkles,
  Loader2,
  Wand2,
  AlertCircle,
  Calendar,
  User,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTenant } from "@/contexts/tenant-context";
import type { Framework, Control, User as UserType } from "@shared/schema";

interface PolicyWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

const POLICY_CATEGORIES = [
  { value: "information_security", label: "Information Security", description: "Policies for protecting information assets" },
  { value: "data_privacy", label: "Data Privacy", description: "GDPR, CCPA and privacy-related policies" },
  { value: "acceptable_use", label: "Acceptable Use", description: "Guidelines for proper use of resources" },
  { value: "access_control", label: "Access Control", description: "Identity and access management policies" },
  { value: "incident_response", label: "Incident Response", description: "Procedures for handling security incidents" },
  { value: "business_continuity", label: "Business Continuity", description: "Disaster recovery and continuity planning" },
  { value: "vendor_management", label: "Vendor Management", description: "Third-party risk management policies" },
  { value: "compliance", label: "Compliance", description: "Regulatory compliance requirements" },
  { value: "human_resources", label: "Human Resources", description: "Employee-related policies" },
  { value: "physical_security", label: "Physical Security", description: "Physical asset protection policies" },
];

const POLICY_TEMPLATES = [
  { id: "blank", name: "Blank Policy", description: "Start from scratch" },
  { id: "iso27001", name: "ISO 27001 Template", description: "Based on ISO 27001 standard" },
  { id: "gdpr", name: "GDPR Template", description: "GDPR-compliant policy template" },
  { id: "nist", name: "NIST CSF Template", description: "Based on NIST Cybersecurity Framework" },
  { id: "soc2", name: "SOC 2 Template", description: "SOC 2 compliance ready" },
];

const WIZARD_STEPS = [
  { id: "basics", label: "Basic Info", icon: FileText },
  { id: "content", label: "Content", icon: FileText },
  { id: "frameworks", label: "Frameworks & Controls", icon: Link2 },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "review", label: "Review", icon: Eye },
];

export function PolicyWizard({ onComplete, onCancel }: PolicyWizardProps) {
  const { toast } = useToast();
  const { currentTenant } = useTenant();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    template: "blank",
    content: "",
    version: "1.0",
    effectiveDate: "",
    reviewDate: "",
    ownerId: "",
    relatedFrameworks: [] as string[],
    relatedControls: [] as string[],
    status: "draft" as const,
  });

  const { data: frameworks } = useQuery<Framework[]>({
    queryKey: ["/api/frameworks"],
  });

  const { data: controls } = useQuery<Control[]>({
    queryKey: ["/api/controls"],
  });

  const { data: users } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  const createPolicyMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/policies", {
        ...data,
        tenantId: currentTenant?.id,
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : undefined,
        reviewDate: data.reviewDate ? new Date(data.reviewDate) : undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
      toast({
        title: "Policy Created",
        description: "Your policy has been created successfully.",
      });
      onComplete();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create policy. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateContentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/generate-policy", {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        template: formData.template,
      });
      return response.json() as Promise<{ content: string }>;
    },
    onSuccess: (data: { content: string }) => {
      setFormData({ ...formData, content: data.content });
      toast({
        title: "Content Generated",
        description: "AI has generated policy content for you to review and edit.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Could not generate content. Please try again or write manually.",
        variant: "destructive",
      });
    },
  });

  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.title.length >= 3 && formData.category !== "";
      case 1:
        return formData.content.length >= 10;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      createPolicyMutation.mutate(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFrameworkToggle = (frameworkId: string) => {
    const current = formData.relatedFrameworks;
    if (current.includes(frameworkId)) {
      setFormData({ ...formData, relatedFrameworks: current.filter(id => id !== frameworkId) });
    } else {
      setFormData({ ...formData, relatedFrameworks: [...current, frameworkId] });
    }
  };

  const handleControlToggle = (controlId: string) => {
    const current = formData.relatedControls;
    if (current.includes(controlId)) {
      setFormData({ ...formData, relatedControls: current.filter(id => id !== controlId) });
    } else {
      setFormData({ ...formData, relatedControls: [...current, controlId] });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Policy Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Information Security Policy"
                data-testid="input-policy-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the policy purpose..."
                rows={3}
                data-testid="input-policy-description"
              />
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <div className="grid grid-cols-2 gap-3">
                {POLICY_CATEGORIES.map((cat) => (
                  <Card
                    key={cat.value}
                    className={`cursor-pointer transition-all hover-elevate ${
                      formData.category === cat.value ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    data-testid={`card-category-${cat.value}`}
                  >
                    <CardContent className="p-3">
                      <div className="font-medium text-sm">{cat.label}</div>
                      <div className="text-xs text-muted-foreground">{cat.description}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={formData.template} onValueChange={(v) => setFormData({ ...formData, template: v })}>
                <SelectTrigger data-testid="select-policy-template">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {POLICY_TEMPLATES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <div>
                        <div>{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Policy Content *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => generateContentMutation.mutate()}
                disabled={generateContentMutation.isPending || !formData.title || !formData.category}
                data-testid="button-generate-content"
              >
                {generateContentMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                Generate with AI
              </Button>
            </div>
            
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter or generate policy content..."
              rows={15}
              className="font-mono text-sm"
              data-testid="textarea-policy-content"
            />
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span>Tip: Use AI generation to create a draft, then customize as needed.</span>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Related Frameworks</Label>
              <p className="text-sm text-muted-foreground">
                Select frameworks that this policy helps comply with.
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {frameworks?.slice(0, 20).map((framework) => (
                  <div
                    key={framework.id}
                    className="flex items-center gap-2 p-2 rounded-md border hover-elevate cursor-pointer"
                    onClick={() => handleFrameworkToggle(framework.id)}
                    data-testid={`checkbox-framework-${framework.id}`}
                  >
                    <Checkbox checked={formData.relatedFrameworks.includes(framework.id)} />
                    <span className="text-sm truncate">{framework.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Related Controls</Label>
              <p className="text-sm text-muted-foreground">
                Link controls that implement this policy.
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {controls?.slice(0, 20).map((control) => (
                  <div
                    key={control.id}
                    className="flex items-center gap-2 p-2 rounded-md border hover-elevate cursor-pointer"
                    onClick={() => handleControlToggle(control.id)}
                    data-testid={`checkbox-control-${control.id}`}
                  >
                    <Checkbox checked={formData.relatedControls.includes(control.id)} />
                    <span className="text-sm truncate">{control.controlId || control.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="1.0"
                  data-testid="input-policy-version"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner">Policy Owner</Label>
                <Select value={formData.ownerId} onValueChange={(v) => setFormData({ ...formData, ownerId: v })}>
                  <SelectTrigger data-testid="select-policy-owner">
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="effectiveDate">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Effective Date
                </Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  data-testid="input-policy-effective-date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewDate">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Review Date
                </Label>
                <Input
                  id="reviewDate"
                  type="date"
                  value={formData.reviewDate}
                  onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                  data-testid="input-policy-review-date"
                />
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Policy will be created as a draft. You can submit it for approval after creation.
                </span>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Policy Summary</CardTitle>
                <CardDescription>Review your policy before creating</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Title</div>
                    <div className="font-medium">{formData.title}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Category</div>
                    <div className="font-medium">
                      {POLICY_CATEGORIES.find(c => c.value === formData.category)?.label || formData.category}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Version</div>
                    <div className="font-medium">{formData.version}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <Badge variant="secondary">Draft</Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="text-sm text-muted-foreground mb-2">Content Preview</div>
                  <div className="p-3 bg-muted/50 rounded-md text-sm max-h-32 overflow-y-auto">
                    {formData.content.slice(0, 500)}
                    {formData.content.length > 500 && "..."}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Related Frameworks</div>
                    <div className="flex flex-wrap gap-1">
                      {formData.relatedFrameworks.length > 0 ? (
                        formData.relatedFrameworks.map(id => (
                          <Badge key={id} variant="outline" className="text-xs">
                            {frameworks?.find(f => f.id === id)?.name || id}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">None selected</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Related Controls</div>
                    <div className="flex flex-wrap gap-1">
                      {formData.relatedControls.length > 0 ? (
                        <Badge variant="outline">{formData.relatedControls.length} controls</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">None selected</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-6 py-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Create New Policy</h2>
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {WIZARD_STEPS.length}: {WIZARD_STEPS[currentStep].label}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel} data-testid="button-cancel-wizard">
            Cancel
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-2">
          {WIZARD_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isActive
                      ? "bg-primary/20 text-primary border-2 border-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                {index < WIZARD_STEPS.length - 1 && (
                  <div className={`w-12 h-0.5 mx-1 ${isCompleted ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            );
          })}
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {renderStepContent()}
      </div>

      <div className="flex-shrink-0 px-6 py-4 border-t flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          data-testid="button-wizard-back"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed() || createPolicyMutation.isPending}
          data-testid="button-wizard-next"
        >
          {createPolicyMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {currentStep === WIZARD_STEPS.length - 1 ? (
            <>
              Create Policy
              <Check className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
