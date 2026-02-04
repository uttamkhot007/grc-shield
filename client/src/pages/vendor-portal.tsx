import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Shield, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Send, 
  Save,
  FileCheck,
  Building2,
  Calendar,
  Loader2,
  Lock,
  XCircle
} from "lucide-react";

const QUESTIONNAIRE_TEMPLATES: Record<string, { name: string; questions: { id: string; category: string; question: string; type: 'text' | 'radio' | 'textarea' }[] }> = {
  sig_lite: {
    name: "SIG Lite Questionnaire",
    questions: [
      { id: "sl_1", category: "Governance", question: "Does your organization have a documented information security policy?", type: "radio" },
      { id: "sl_2", category: "Governance", question: "Is the information security policy reviewed and updated at least annually?", type: "radio" },
      { id: "sl_3", category: "Governance", question: "Does your organization have a designated security officer or team?", type: "radio" },
      { id: "sl_4", category: "Risk Management", question: "Does your organization conduct regular risk assessments?", type: "radio" },
      { id: "sl_5", category: "Risk Management", question: "Are risk treatment plans documented and tracked?", type: "radio" },
      { id: "sl_6", category: "Access Control", question: "Does your organization enforce multi-factor authentication?", type: "radio" },
      { id: "sl_7", category: "Access Control", question: "Are access rights reviewed periodically?", type: "radio" },
      { id: "sl_8", category: "Data Protection", question: "Is data encrypted at rest and in transit?", type: "radio" },
      { id: "sl_9", category: "Data Protection", question: "Does your organization have a data classification policy?", type: "radio" },
      { id: "sl_10", category: "Incident Management", question: "Does your organization have an incident response plan?", type: "radio" },
      { id: "sl_11", category: "Incident Management", question: "Are security incidents logged and reviewed?", type: "radio" },
      { id: "sl_12", category: "Business Continuity", question: "Does your organization have a business continuity plan?", type: "radio" },
      { id: "sl_13", category: "Business Continuity", question: "Are backup and recovery procedures tested regularly?", type: "radio" },
      { id: "sl_14", category: "Compliance", question: "Does your organization maintain relevant compliance certifications (SOC 2, ISO 27001, etc.)?", type: "radio" },
      { id: "sl_15", category: "Compliance", question: "Please list any compliance certifications your organization holds:", type: "textarea" },
    ]
  },
  sig_core: {
    name: "SIG Core Questionnaire",
    questions: [
      { id: "sc_1", category: "Information Security Management", question: "Does your organization have an Information Security Management System (ISMS)?", type: "radio" },
      { id: "sc_2", category: "Information Security Management", question: "Describe your organization's security governance structure:", type: "textarea" },
      { id: "sc_3", category: "Asset Management", question: "Does your organization maintain an inventory of information assets?", type: "radio" },
      { id: "sc_4", category: "Asset Management", question: "Are asset owners assigned and responsibilities documented?", type: "radio" },
      { id: "sc_5", category: "Human Resources Security", question: "Are background checks performed on employees?", type: "radio" },
      { id: "sc_6", category: "Human Resources Security", question: "Is security awareness training mandatory for all employees?", type: "radio" },
      { id: "sc_7", category: "Physical Security", question: "Are physical access controls in place for sensitive areas?", type: "radio" },
      { id: "sc_8", category: "Physical Security", question: "Describe your physical security measures:", type: "textarea" },
      { id: "sc_9", category: "Operations Security", question: "Are change management procedures documented and followed?", type: "radio" },
      { id: "sc_10", category: "Operations Security", question: "Is malware protection deployed across all systems?", type: "radio" },
      { id: "sc_11", category: "Communications Security", question: "Are network security controls implemented?", type: "radio" },
      { id: "sc_12", category: "Communications Security", question: "Is data transfer protected with encryption?", type: "radio" },
      { id: "sc_13", category: "Supplier Relationships", question: "Does your organization assess third-party vendor risks?", type: "radio" },
      { id: "sc_14", category: "Supplier Relationships", question: "Are vendor contracts reviewed for security requirements?", type: "radio" },
      { id: "sc_15", category: "Additional Information", question: "Please provide any additional security information:", type: "textarea" },
    ]
  },
  caiq: {
    name: "CAIQ (Cloud Security Alliance)",
    questions: [
      { id: "cq_1", category: "Application Security", question: "Are application security requirements identified and documented?", type: "radio" },
      { id: "cq_2", category: "Application Security", question: "Is secure coding practices training provided to developers?", type: "radio" },
      { id: "cq_3", category: "Audit & Assurance", question: "Are independent audits performed at least annually?", type: "radio" },
      { id: "cq_4", category: "Audit & Assurance", question: "Are audit findings tracked to remediation?", type: "radio" },
      { id: "cq_5", category: "Cloud Security", question: "Are cloud infrastructure configurations reviewed for security?", type: "radio" },
      { id: "cq_6", category: "Cloud Security", question: "Describe your cloud security architecture:", type: "textarea" },
      { id: "cq_7", category: "Data Security", question: "Is customer data segregated from other tenants?", type: "radio" },
      { id: "cq_8", category: "Data Security", question: "Are data retention and deletion policies documented?", type: "radio" },
      { id: "cq_9", category: "Encryption & Key Management", question: "Are encryption keys managed securely?", type: "radio" },
      { id: "cq_10", category: "Encryption & Key Management", question: "Describe your key management procedures:", type: "textarea" },
      { id: "cq_11", category: "Identity & Access Management", question: "Is single sign-on (SSO) supported?", type: "radio" },
      { id: "cq_12", category: "Identity & Access Management", question: "Are privileged accounts monitored and audited?", type: "radio" },
      { id: "cq_13", category: "Infrastructure Security", question: "Are vulnerability scans performed regularly?", type: "radio" },
      { id: "cq_14", category: "Infrastructure Security", question: "Is penetration testing performed at least annually?", type: "radio" },
      { id: "cq_15", category: "Additional Information", question: "Please provide any additional cloud security information:", type: "textarea" },
    ]
  },
  vsaq: {
    name: "VSAQ Questionnaire",
    questions: [
      { id: "vq_1", category: "Company Information", question: "Describe your organization's primary business activities:", type: "textarea" },
      { id: "vq_2", category: "Company Information", question: "How many employees does your organization have?", type: "text" },
      { id: "vq_3", category: "Security Program", question: "Does your organization have a formal security program?", type: "radio" },
      { id: "vq_4", category: "Security Program", question: "Describe your security program maturity:", type: "textarea" },
      { id: "vq_5", category: "Data Handling", question: "What types of data do you process for clients?", type: "textarea" },
      { id: "vq_6", category: "Data Handling", question: "Are data processing activities documented?", type: "radio" },
      { id: "vq_7", category: "Subcontractors", question: "Do you use subcontractors to process client data?", type: "radio" },
      { id: "vq_8", category: "Subcontractors", question: "If yes, describe subcontractor security requirements:", type: "textarea" },
      { id: "vq_9", category: "Security Controls", question: "Are endpoint protection solutions deployed?", type: "radio" },
      { id: "vq_10", category: "Security Controls", question: "Are security logs centrally collected and monitored?", type: "radio" },
      { id: "vq_11", category: "Disaster Recovery", question: "What is your Recovery Time Objective (RTO)?", type: "text" },
      { id: "vq_12", category: "Disaster Recovery", question: "What is your Recovery Point Objective (RPO)?", type: "text" },
      { id: "vq_13", category: "Privacy", question: "Does your organization have a privacy policy?", type: "radio" },
      { id: "vq_14", category: "Privacy", question: "Are data subject access requests handled?", type: "radio" },
      { id: "vq_15", category: "Additional Information", question: "Please provide any additional information about your security posture:", type: "textarea" },
    ]
  },
  custom: {
    name: "Custom Assessment",
    questions: [
      { id: "cu_1", category: "General Security", question: "Describe your organization's overall security posture:", type: "textarea" },
      { id: "cu_2", category: "General Security", question: "Does your organization have documented security policies?", type: "radio" },
      { id: "cu_3", category: "Access Control", question: "How do you manage user access to systems?", type: "textarea" },
      { id: "cu_4", category: "Access Control", question: "Is multi-factor authentication implemented?", type: "radio" },
      { id: "cu_5", category: "Data Protection", question: "How is sensitive data protected?", type: "textarea" },
      { id: "cu_6", category: "Data Protection", question: "Is data encryption used?", type: "radio" },
      { id: "cu_7", category: "Incident Response", question: "Do you have an incident response plan?", type: "radio" },
      { id: "cu_8", category: "Incident Response", question: "Describe your incident response process:", type: "textarea" },
      { id: "cu_9", category: "Compliance", question: "What compliance certifications do you hold?", type: "textarea" },
      { id: "cu_10", category: "Additional", question: "Any additional information you'd like to provide:", type: "textarea" },
    ]
  }
};

export default function VendorPortal() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [responses, setResponses] = useState<Record<string, string>>({});

  const { data: portalData, isLoading, error } = useQuery({
    queryKey: ['/api/vendor-portal', token],
    queryFn: async () => {
      const res = await fetch(`/api/vendor-portal/${token}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to load assessment');
      }
      return res.json();
    },
    enabled: !!token,
    retry: false
  });

  useEffect(() => {
    if (portalData?.assessment?.responses) {
      setResponses(portalData.assessment.responses as Record<string, string>);
    }
  }, [portalData]);

  const submitMutation = useMutation({
    mutationFn: async ({ saveAsDraft }: { saveAsDraft: boolean }) => {
      const res = await apiRequest('POST', `/api/vendor-portal/${token}/submit`, { 
        responses, 
        saveAsDraft 
      });
      return res.json();
    },
    onSuccess: (data, variables) => {
      toast({ 
        title: variables.saveAsDraft ? "Progress Saved" : "Assessment Submitted",
        description: variables.saveAsDraft 
          ? "Your progress has been saved. You can continue later."
          : "Thank you! Your assessment has been submitted for review."
      });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-800/50 border-red-500/30">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              {(error as any).message || "This assessment link is invalid or has expired."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const assessment = portalData?.assessment;
  const vendor = portalData?.vendor;
  const tenant = portalData?.tenant;
  const template = QUESTIONNAIRE_TEMPLATES[assessment?.questionnaireTemplate || 'custom'];
  const questions = template?.questions || [];
  
  const answeredCount = Object.keys(responses).filter(k => responses[k]?.trim()).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
  const isSubmitted = assessment?.status === 'submitted' || assessment?.status === 'reviewed' || assessment?.status === 'completed';

  const categories = Array.from(new Set(questions.map(q => q.category)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Shield className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="font-bold text-white">{tenant?.name || 'GRC Shield'}</h1>
                <p className="text-sm text-muted-foreground">Vendor Security Assessment</p>
              </div>
            </div>
            {isSubmitted ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Submitted
              </Badge>
            ) : (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                <Clock className="h-3 w-3 mr-1" />
                In Progress
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-white">{vendor?.name}</CardTitle>
            </div>
            <CardDescription className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1">
                <FileCheck className="h-4 w-4" />
                {template?.name || 'Assessment'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Due: {assessment?.dueDate ? new Date(assessment.dueDate).toLocaleDateString() : 'No deadline'}
              </span>
              <span>
                Type: {assessment?.assessmentType?.replace('_', ' ').toUpperCase()}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-white">{answeredCount} of {questions.length} questions answered</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {isSubmitted ? (
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Assessment Submitted</h2>
              <p className="text-muted-foreground">
                Thank you for completing this assessment. Your responses have been submitted for review.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => (
              <Card key={category} className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">{category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {questions
                    .filter(q => q.category === category)
                    .map((question, idx) => (
                      <div key={question.id} className="space-y-3">
                        <Label className="text-white flex items-start gap-2">
                          <span className="text-muted-foreground">{idx + 1}.</span>
                          {question.question}
                        </Label>
                        
                        {question.type === 'radio' && (
                          <RadioGroup
                            value={responses[question.id] || ''}
                            onValueChange={(value) => setResponses(prev => ({ ...prev, [question.id]: value }))}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                              <Label htmlFor={`${question.id}-yes`} className="text-green-400 cursor-pointer">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id={`${question.id}-no`} />
                              <Label htmlFor={`${question.id}-no`} className="text-red-400 cursor-pointer">No</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="partial" id={`${question.id}-partial`} />
                              <Label htmlFor={`${question.id}-partial`} className="text-amber-400 cursor-pointer">Partial</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="na" id={`${question.id}-na`} />
                              <Label htmlFor={`${question.id}-na`} className="text-muted-foreground cursor-pointer">N/A</Label>
                            </div>
                          </RadioGroup>
                        )}
                        
                        {question.type === 'text' && (
                          <Input
                            value={responses[question.id] || ''}
                            onChange={(e) => setResponses(prev => ({ ...prev, [question.id]: e.target.value }))}
                            className="bg-slate-700 border-slate-600"
                            placeholder="Enter your answer..."
                            data-testid={`input-${question.id}`}
                          />
                        )}
                        
                        {question.type === 'textarea' && (
                          <Textarea
                            value={responses[question.id] || ''}
                            onChange={(e) => setResponses(prev => ({ ...prev, [question.id]: e.target.value }))}
                            className="bg-slate-700 border-slate-600 min-h-[100px]"
                            placeholder="Provide detailed information..."
                            data-testid={`textarea-${question.id}`}
                          />
                        )}
                        
                        {idx < questions.filter(q => q.category === category).length - 1 && (
                          <Separator className="bg-slate-700 mt-4" />
                        )}
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))}

            <div className="flex gap-4 justify-end sticky bottom-4 bg-slate-900/80 backdrop-blur-xl p-4 rounded-lg border border-slate-700">
              <Button
                variant="outline"
                onClick={() => submitMutation.mutate({ saveAsDraft: true })}
                disabled={submitMutation.isPending}
                className="gap-2"
                data-testid="button-save-draft"
              >
                {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Progress
              </Button>
              <Button
                onClick={() => submitMutation.mutate({ saveAsDraft: false })}
                disabled={submitMutation.isPending || answeredCount === 0}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
                data-testid="button-submit-assessment"
              >
                {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Submit Assessment
              </Button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-700 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Lock className="h-4 w-4" />
            Your responses are encrypted and securely transmitted
          </p>
        </div>
      </footer>
    </div>
  );
}