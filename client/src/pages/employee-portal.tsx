import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  FileText,
  CheckCircle2,
  Clock,
  Shield,
  Monitor,
  Lock,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  Send,
  GraduationCap,
  Laptop,
  Smartphone,
  HardDrive,
  Wifi,
  Plus,
  Eye,
  Download,
  RefreshCw,
} from "lucide-react";
import { useTenant } from "@/contexts/tenant-context";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function EmployeePortalPage() {
  const { currentTenantId, tenants } = useTenant();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("policies");
  const [isAcknowledgeDialogOpen, setIsAcknowledgeDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [isAddDeviceDialogOpen, setIsAddDeviceDialogOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const isSuperAdmin = user?.role === "super_admin";

  // Fetch pending policy acknowledgments
  const { data: pendingPolicies = [], isLoading: isLoadingPolicies } = useQuery({
    queryKey: [`/api/policies-pending-acknowledgment?tenantId=${currentTenantId}&userId=${user?.id}`],
    enabled: !!currentTenantId && !!user?.id,
  });

  // Fetch acknowledged policies
  const { data: acknowledgedPolicies = [] } = useQuery({
    queryKey: [`/api/policy-acknowledgments?tenantId=${currentTenantId}&userId=${user?.id}`],
    enabled: !!currentTenantId && !!user?.id,
  });

  // Fetch training assignments
  const { data: trainingAssignments = [], isLoading: isLoadingTraining } = useQuery({
    queryKey: [`/api/training-assignments?tenantId=${currentTenantId}&userId=${user?.id}`],
    enabled: !!currentTenantId && !!user?.id,
  });

  // Fetch employee devices
  const { data: devices = [], isLoading: isLoadingDevices } = useQuery({
    queryKey: [`/api/employee-devices?tenantId=${currentTenantId}&userId=${user?.id}`],
    enabled: !!currentTenantId && !!user?.id,
  });

  // Fetch cybersecurity tips
  const { data: tips = [] } = useQuery({
    queryKey: [`/api/cybersecurity-tips?tenantId=${currentTenantId}`],
    enabled: !!currentTenantId,
  });

  // Fetch incident guidance
  const { data: incidentGuidance = [] } = useQuery({
    queryKey: [`/api/incident-guidance?tenantId=${currentTenantId}`],
    enabled: !!currentTenantId,
  });

  // Acknowledge policy mutation
  const acknowledgeMutation = useMutation({
    mutationFn: async (policyId: string) => {
      const res = await apiRequest("POST", "/api/policy-acknowledgments", {
        tenantId: currentTenantId,
        policyId,
        userId: user?.id,
        policyVersion: selectedPolicy?.version || "1.0",
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Policy acknowledged successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/policy-acknowledgments?tenantId=${currentTenantId}&userId=${user?.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/policies-pending-acknowledgment?tenantId=${currentTenantId}&userId=${user?.id}`] });
      setIsAcknowledgeDialogOpen(false);
      setSelectedPolicy(null);
    },
    onError: () => {
      toast({ title: "Failed to acknowledge policy", variant: "destructive" });
    },
  });

  // Add device mutation
  const addDeviceMutation = useMutation({
    mutationFn: async (deviceData: any) => {
      const res = await apiRequest("POST", "/api/employee-devices", {
        ...deviceData,
        tenantId: currentTenantId,
        userId: user?.id,
        sourceType: "manual",
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Device added successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/employee-devices?tenantId=${currentTenantId}&userId=${user?.id}`] });
      setIsAddDeviceDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to add device", variant: "destructive" });
    },
  });

  // AI InfoSec Help
  const askAiHelp = async () => {
    if (!aiQuestion.trim()) return;
    
    setIsAiLoading(true);
    try {
      const res = await apiRequest("POST", "/api/ai-infosec-help", {
        question: aiQuestion,
        tenantId: currentTenantId,
      });
      const data = await res.json();
      setAiResponse(data.answer);
    } catch (error) {
      toast({ title: "Failed to get AI response", variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Stats calculations
  const pendingTrainings = trainingAssignments.filter((t: any) => t.status === "assigned" || t.status === "in_progress");
  const completedTrainings = trainingAssignments.filter((t: any) => t.status === "completed");
  const compliantDevices = devices.filter((d: any) => d.status === "compliant");

  // Default tips if none from database
  const displayTips = tips.length > 0 ? tips : [
    { id: 1, title: "Verify Before You Click", content: "Always hover over links to check the URL before clicking. Attackers often use look-alike domains.", category: "phishing", icon: "Shield" },
    { id: 2, title: "Strong Passwords Matter", content: "Use a password manager and enable multi-factor authentication on all accounts.", category: "passwords", icon: "Lock" },
    { id: 3, title: "Secure Your Devices", content: "Keep your devices updated and never leave them unattended in public places.", category: "devices", icon: "Monitor" },
    { id: 4, title: "Report Suspicious Activity", content: "If something seems off, report it immediately to the security team.", category: "reporting", icon: "AlertTriangle" },
  ];

  // Default incident guidance if none from database
  const displayGuidance = incidentGuidance.length > 0 ? incidentGuidance : [
    { 
      id: 1, 
      title: "Suspected Phishing Email", 
      incidentType: "phishing",
      steps: [
        "Do NOT click any links or download attachments",
        "Forward the email to security@company.com",
        "Delete the email from your inbox",
        "If you clicked anything, disconnect from the network and call IT immediately"
      ],
      contacts: { email: "security@company.com", phone: "+1-555-SEC-TEAM" }
    },
    { 
      id: 2, 
      title: "Lost or Stolen Device", 
      incidentType: "lost_device",
      steps: [
        "Report immediately to IT Security",
        "Change all passwords you accessed from the device",
        "Notify your manager",
        "File a police report if theft occurred"
      ],
      contacts: { email: "it-help@company.com", phone: "+1-555-IT-HELP" }
    },
    { 
      id: 3, 
      title: "Potential Data Breach", 
      incidentType: "data_breach",
      steps: [
        "Stop what you're doing immediately",
        "Do NOT attempt to fix it yourself",
        "Call the Security Hotline",
        "Document what happened and when",
        "Preserve all evidence"
      ],
      contacts: { email: "incident@company.com", phone: "+1-555-INCIDENT" }
    },
  ];

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Shield,
      Lock,
      Monitor,
      AlertTriangle,
      Lightbulb,
    };
    return icons[iconName] || Shield;
  };

  // Show tenant selection prompt for super admins without a tenant selected
  if (isSuperAdmin && !currentTenantId) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Employee Portal</h1>
            <p className="text-muted-foreground">Access security policies, training, and resources for any tenant</p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2 bg-primary/10">
            Super Admin
          </Badge>
        </div>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Select a Tenant to View Employee Portal
            </CardTitle>
            <CardDescription>
              As a super admin, you can view the Employee Portal for any tenant. 
              Please select a tenant from the tenant selector in the header to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Available tenants: <span className="font-medium text-foreground">{tenants.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Employee Portal</h1>
          <p className="text-muted-foreground">Access your security policies, training, and resources</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {isSuperAdmin ? "Super Admin" : `Welcome, ${user?.firstName || user?.email || "Employee"}`}
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="stat-gradient-amber">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <FileText className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingPolicies.length}</p>
                <p className="text-xs text-muted-foreground">Pending Policies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-gradient-blue">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <GraduationCap className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingTrainings.length}</p>
                <p className="text-xs text-muted-foreground">Pending Training</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-gradient-green">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{acknowledgedPolicies.length}</p>
                <p className="text-xs text-muted-foreground">Acknowledged</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-gradient-purple">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Laptop className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{compliantDevices.length}/{devices.length}</p>
                <p className="text-xs text-muted-foreground">Compliant Devices</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="policies" data-testid="tab-policies">
            <FileText className="h-4 w-4 mr-2" />
            Policies
          </TabsTrigger>
          <TabsTrigger value="training" data-testid="tab-training">
            <GraduationCap className="h-4 w-4 mr-2" />
            Training
          </TabsTrigger>
          <TabsTrigger value="devices" data-testid="tab-devices">
            <Laptop className="h-4 w-4 mr-2" />
            My Devices
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            <Shield className="h-4 w-4 mr-2" />
            Security Tips
          </TabsTrigger>
          <TabsTrigger value="help" data-testid="tab-help">
            <MessageSquare className="h-4 w-4 mr-2" />
            AI Help
          </TabsTrigger>
        </TabsList>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-6">
          {/* Pending Acknowledgments */}
          <Card className="card-3d border-amber-500/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-400" />
                <CardTitle>Pending Policy Acknowledgments</CardTitle>
              </div>
              <CardDescription>Review and acknowledge the following policies</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPolicies ? (
                <div className="text-center py-4">Loading...</div>
              ) : pendingPolicies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-emerald-400" />
                  <p>All policies have been acknowledged!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingPolicies.map((policy: any) => (
                    <div 
                      key={policy.id} 
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover-elevate"
                      data-testid={`pending-policy-${policy.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{policy.title}</p>
                          <p className="text-sm text-muted-foreground">Version {policy.version || "1.0"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedPolicy(policy);
                            setIsAcknowledgeDialogOpen(true);
                          }}
                          data-testid={`button-view-policy-${policy.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View & Acknowledge
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Acknowledged Policies */}
          <Card className="card-3d">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <CardTitle>Acknowledged Policies</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {acknowledgedPolicies.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No policies acknowledged yet</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Acknowledged Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {acknowledgedPolicies.map((ack: any) => (
                      <TableRow key={ack.id}>
                        <TableCell className="font-medium">{ack.policyId}</TableCell>
                        <TableCell>{ack.policyVersion}</TableCell>
                        <TableCell>{new Date(ack.acknowledgedAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-6">
          <Card className="card-3d">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <CardTitle>My Training Assignments</CardTitle>
                </div>
                <Badge variant="outline">
                  {completedTrainings.length}/{trainingAssignments.length} Completed
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingTraining ? (
                <div className="text-center py-4">Loading...</div>
              ) : trainingAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-2" />
                  <p>No training assignments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trainingAssignments.map((training: any) => (
                    <div 
                      key={training.id} 
                      className="p-4 rounded-lg border bg-card"
                      data-testid={`training-${training.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{training.title}</p>
                          <p className="text-sm text-muted-foreground">{training.description}</p>
                        </div>
                        <Badge 
                          variant={training.status === "completed" ? "default" : "secondary"}
                          className={training.status === "overdue" ? "bg-destructive/20 text-destructive" : ""}
                        >
                          {training.status}
                        </Badge>
                      </div>
                      {training.dueDate && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Due: {new Date(training.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      {training.status === "completed" && training.score && (
                        <div className="mt-2">
                          <Progress value={training.score} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">Score: {training.score}%</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-6">
          <Card className="card-3d">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Laptop className="h-5 w-5 text-primary" />
                  <CardTitle>My Devices</CardTitle>
                </div>
                <Button onClick={() => setIsAddDeviceDialogOpen(true)} data-testid="button-add-device">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Device
                </Button>
              </div>
              <CardDescription>View and manage your registered devices</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDevices ? (
                <div className="text-center py-4">Loading...</div>
              ) : devices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Laptop className="h-12 w-12 mx-auto mb-2" />
                  <p>No devices registered</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsAddDeviceDialogOpen(true)}
                  >
                    Register Your First Device
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>OS</TableHead>
                      <TableHead>Endpoint Security</TableHead>
                      <TableHead>Encryption</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {devices.map((device: any) => (
                      <TableRow key={device.id} data-testid={`device-row-${device.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {device.deviceType === "mobile" ? (
                              <Smartphone className="h-4 w-4" />
                            ) : (
                              <Laptop className="h-4 w-4" />
                            )}
                            <span className="font-medium">{device.deviceName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{device.ipAddress || "—"}</TableCell>
                        <TableCell>{device.operatingSystem} {device.osVersion}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={device.endpointSecurityStatus === "installed" ? "default" : "destructive"}
                          >
                            {device.endpointSecurityStatus || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {device.encryptionEnabled ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400">
                              <Lock className="h-3 w-3 mr-1" />
                              Enabled
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Disabled</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={device.status === "compliant" ? "default" : "secondary"}
                            className={device.status === "compliant" ? "bg-emerald-500/20 text-emerald-400" : ""}
                          >
                            {device.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tips & Incident Guidance Tab */}
        <TabsContent value="security" className="space-y-6">
          {/* Cybersecurity Tips */}
          <Card className="card-3d">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-400" />
                <CardTitle>Cybersecurity Tips</CardTitle>
              </div>
              <CardDescription>Stay safe with these security best practices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayTips.map((tip: any) => {
                  const IconComponent = getIconComponent(tip.icon);
                  return (
                    <Card key={tip.id} className="bg-card/50 hover-elevate">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/20">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{tip.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{tip.content}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Incident Guidance */}
          <Card className="card-3d border-destructive/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle>Incident Response Guidance</CardTitle>
              </div>
              <CardDescription>What to do if you suspect a security incident</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayGuidance.map((guide: any) => (
                  <Card key={guide.id} className="bg-card/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{guide.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        {(guide.steps || []).map((step: string, idx: number) => (
                          <li key={idx} className="text-muted-foreground">{step}</li>
                        ))}
                      </ol>
                      {guide.contacts && (
                        <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                          <p className="text-sm font-medium text-destructive">Emergency Contacts:</p>
                          <p className="text-sm text-muted-foreground">
                            Email: {guide.contacts.email} | Phone: {guide.contacts.phone}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Help Tab */}
        <TabsContent value="help" className="space-y-6">
          <Card className="card-3d">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle>AI InfoSec Assistant</CardTitle>
              </div>
              <CardDescription>
                Ask security questions and get instant guidance from our AI assistant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Your Question</Label>
                <Textarea
                  placeholder="Ask any security-related question... e.g., 'How do I create a strong password?' or 'What should I do if I receive a suspicious email?'"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  className="min-h-24"
                  data-testid="input-ai-question"
                />
              </div>
              <Button 
                onClick={askAiHelp} 
                disabled={isAiLoading || !aiQuestion.trim()}
                data-testid="button-ask-ai"
              >
                {isAiLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Ask AI Assistant
                  </>
                )}
              </Button>

              {aiResponse && (
                <Card className="bg-primary/5 border-primary/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">AI Response</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap">{aiResponse}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Acknowledge Policy Dialog */}
      <Dialog open={isAcknowledgeDialogOpen} onOpenChange={setIsAcknowledgeDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPolicy?.title}</DialogTitle>
            <DialogDescription>
              Version {selectedPolicy?.version || "1.0"} | Category: {selectedPolicy?.category || "General"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {selectedPolicy?.content ? (
                <div dangerouslySetInnerHTML={{ __html: selectedPolicy.content }} />
              ) : (
                <p className="text-muted-foreground">Policy content not available</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAcknowledgeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedPolicy && acknowledgeMutation.mutate(selectedPolicy.id)}
              disabled={acknowledgeMutation.isPending}
              data-testid="button-confirm-acknowledge"
            >
              {acknowledgeMutation.isPending ? "Acknowledging..." : "I Acknowledge This Policy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Device Dialog */}
      <Dialog open={isAddDeviceDialogOpen} onOpenChange={setIsAddDeviceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Device</DialogTitle>
            <DialogDescription>Register a device to track its security status</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            addDeviceMutation.mutate({
              deviceName: formData.get("deviceName"),
              deviceType: formData.get("deviceType"),
              operatingSystem: formData.get("operatingSystem"),
              osVersion: formData.get("osVersion"),
              ipAddress: formData.get("ipAddress"),
              endpointSecurityStatus: formData.get("endpointSecurityStatus"),
              endpointSecurityProduct: formData.get("endpointSecurityProduct"),
              encryptionEnabled: formData.get("encryptionEnabled") === "true",
              encryptionType: formData.get("encryptionType"),
              status: "unknown",
            });
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deviceName">Device Name</Label>
                <Input id="deviceName" name="deviceName" required placeholder="e.g., MacBook Pro" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deviceType">Device Type</Label>
                <select name="deviceType" className="w-full h-9 rounded-md border bg-background px-3">
                  <option value="laptop">Laptop</option>
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="operatingSystem">Operating System</Label>
                <Input id="operatingSystem" name="operatingSystem" placeholder="e.g., macOS" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="osVersion">OS Version</Label>
                <Input id="osVersion" name="osVersion" placeholder="e.g., 14.2" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input id="ipAddress" name="ipAddress" placeholder="e.g., 192.168.1.100" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endpointSecurityStatus">Endpoint Security</Label>
                <select name="endpointSecurityStatus" className="w-full h-9 rounded-md border bg-background px-3">
                  <option value="installed">Installed</option>
                  <option value="not_installed">Not Installed</option>
                  <option value="outdated">Outdated</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endpointSecurityProduct">Security Product</Label>
                <Input id="endpointSecurityProduct" name="endpointSecurityProduct" placeholder="e.g., CrowdStrike" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="encryptionEnabled">Encryption</Label>
                <select name="encryptionEnabled" className="w-full h-9 rounded-md border bg-background px-3">
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="encryptionType">Encryption Type</Label>
                <Input id="encryptionType" name="encryptionType" placeholder="e.g., FileVault" />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDeviceDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addDeviceMutation.isPending}>
                {addDeviceMutation.isPending ? "Adding..." : "Add Device"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
