import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  CheckCircle2,
  Clock,
  Shield,
  Bell,
  Home,
  BookOpen,
  User,
  AlertTriangle,
  MessageSquare,
  Send,
  GraduationCap,
  RefreshCw,
  ChevronRight,
  Search,
  Settings,
  Check,
  Sparkles,
  Lightbulb,
  Lock,
  Monitor,
} from "lucide-react";
import { useTenant } from "@/contexts/tenant-context";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";

type MobileTab = "home" | "policies" | "alerts" | "training" | "profile";

interface MobileAlert {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "urgent" | "success";
  timestamp: string;
  read: boolean;
  policyId?: string;
}

interface MobilePolicy {
  id: string;
  name: string;
  category: string;
  version: string;
  status: string;
  description: string;
  content?: string;
  lastUpdated: string;
  acknowledged?: boolean;
  acknowledgedAt?: string;
}

interface MobileTraining {
  id: string;
  name: string;
  status: string;
  dueDate: string;
  progress: number;
  duration: string;
  completedAt?: string;
}

export default function MobileAppPage() {
  const { currentTenantId } = useTenant();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<MobileTab>("home");
  const [selectedPolicy, setSelectedPolicy] = useState<MobilePolicy | null>(null);
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [alerts, setAlerts] = useState<MobileAlert[]>([
    { id: "a1", title: "New Policy Published", message: "Information Security Policy v3.2 has been published. Please review and acknowledge.", type: "urgent", timestamp: "2024-03-15T10:30:00Z", read: false, policyId: "pol1" },
    { id: "a2", title: "Training Due Soon", message: "Security Awareness Training is due in 3 days.", type: "warning", timestamp: "2024-03-14T14:00:00Z", read: false },
    { id: "a3", title: "Policy Acknowledged", message: "You have successfully acknowledged the Acceptable Use Policy.", type: "success", timestamp: "2024-03-13T09:15:00Z", read: true },
    { id: "a4", title: "Monthly Security Reminder", message: "Remember to update your passwords and review security guidelines.", type: "info", timestamp: "2024-03-12T08:00:00Z", read: true },
    { id: "a5", title: "Data Protection Update", message: "GDPR compliance requirements have been updated. Please review the changes.", type: "warning", timestamp: "2024-03-11T16:45:00Z", read: false },
  ]);

  const [policies] = useState<MobilePolicy[]>([
    { id: "pol1", name: "Information Security Policy", category: "Security", version: "3.2", status: "published", description: "Establishes the organization's approach to information security management.", content: "This policy defines the security controls and practices that must be followed by all employees to protect company information assets. Key requirements include: password management, data classification, access control, and incident reporting.", lastUpdated: "2024-03-15", acknowledged: false },
    { id: "pol2", name: "Data Protection Policy", category: "Privacy", version: "2.1", status: "published", description: "Ensures compliance with data protection regulations including GDPR.", content: "This policy outlines how personal data must be collected, processed, stored, and disposed of in compliance with applicable data protection laws.", lastUpdated: "2024-03-10", acknowledged: true, acknowledgedAt: "2024-03-12" },
    { id: "pol3", name: "Acceptable Use Policy", category: "IT", version: "4.0", status: "published", description: "Defines acceptable use of IT resources and systems.", content: "Employees must use company IT resources responsibly. This includes proper use of email, internet, and company devices.", lastUpdated: "2024-03-08", acknowledged: true, acknowledgedAt: "2024-03-09" },
    { id: "pol4", name: "Remote Work Policy", category: "IT", version: "2.8", status: "published", description: "Establishes security requirements for remote working.", content: "When working remotely, employees must ensure secure network connections, protect company devices, and maintain confidentiality.", lastUpdated: "2024-03-05", acknowledged: false },
    { id: "pol5", name: "Business Continuity Policy", category: "Operations", version: "2.5", status: "published", description: "Establishes business continuity and disaster recovery procedures.", content: "This policy defines how the organization will continue operations during and after a disruption.", lastUpdated: "2024-03-01", acknowledged: true, acknowledgedAt: "2024-03-03" },
    { id: "pol6", name: "Third-Party Risk Policy", category: "Vendor", version: "1.8", status: "published", description: "Manages risks associated with third-party vendors.", content: "All vendors must undergo security assessment before engagement. Ongoing monitoring is required.", lastUpdated: "2024-02-28", acknowledged: false },
    { id: "pol7", name: "Password Policy", category: "Security", version: "3.0", status: "published", description: "Defines password requirements and management.", content: "Passwords must be at least 12 characters, include uppercase, lowercase, numbers, and special characters.", lastUpdated: "2024-02-25", acknowledged: true, acknowledgedAt: "2024-02-27" },
    { id: "pol8", name: "Email Security Policy", category: "Security", version: "2.5", status: "published", description: "Establishes email security and usage requirements.", content: "Employees must be vigilant about phishing attempts and never share sensitive information via email.", lastUpdated: "2024-02-20", acknowledged: false },
  ]);

  const [trainings] = useState([
    { id: "t1", name: "Security Awareness Training", status: "assigned", dueDate: "2024-03-18", progress: 0, duration: "45 min" },
    { id: "t2", name: "GDPR Fundamentals", status: "in_progress", dueDate: "2024-03-25", progress: 60, duration: "30 min" },
    { id: "t3", name: "Phishing Prevention", status: "completed", dueDate: "2024-03-10", progress: 100, duration: "20 min", completedAt: "2024-03-08" },
    { id: "t4", name: "Data Classification", status: "completed", dueDate: "2024-02-28", progress: 100, duration: "25 min", completedAt: "2024-02-25" },
  ]);

  const unreadAlerts = alerts.filter(a => !a.read).length;
  const pendingPolicies = policies.filter(p => !p.acknowledged).length;
  const pendingTrainings = trainings.filter(t => t.status !== "completed").length;
  const completedTrainings = trainings.filter(t => t.status === "completed").length;

  const handleAcknowledgePolicy = async (policy: MobilePolicy) => {
    setIsAcknowledging(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({ title: "Policy acknowledged successfully" });
    setIsPolicyDialogOpen(false);
    setSelectedPolicy(null);
    setIsAcknowledging(false);
  };

  const markAlertAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
  };

  const getAlertIcon = (type: MobileAlert["type"]) => {
    switch (type) {
      case "urgent": return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case "warning": return <Clock className="w-5 h-5 text-amber-400" />;
      case "success": return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      default: return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  const getAlertBorderColor = (type: MobileAlert["type"]) => {
    switch (type) {
      case "urgent": return "border-l-red-500";
      case "warning": return "border-l-amber-500";
      case "success": return "border-l-emerald-500";
      default: return "border-l-blue-500";
    }
  };

  const filteredPolicies = policies.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const askAiHelp = async () => {
    if (!aiQuestion.trim()) return;
    
    setIsAiLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setAiResponse(`Based on your question about "${aiQuestion}", here's what I found:

The relevant policy information indicates that you should follow these guidelines:

1. Always verify requests through official channels
2. Report any suspicious activity to the security team
3. Maintain confidentiality of sensitive information
4. Follow the escalation procedures outlined in the Security Policy

For more specific guidance, please review the Information Security Policy or contact your manager.`);
    setIsAiLoading(false);
  };

  const securityTips = [
    { id: 1, title: "Verify Before You Click", content: "Always hover over links to check the URL before clicking.", icon: Shield },
    { id: 2, title: "Strong Passwords Matter", content: "Use a password manager and enable MFA on all accounts.", icon: Lock },
    { id: 3, title: "Secure Your Devices", content: "Keep devices updated and never leave them unattended.", icon: Monitor },
    { id: 4, title: "Report Suspicious Activity", content: "If something seems off, report it immediately.", icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex flex-col">
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-white/10 px-4 py-3 safe-area-inset-top">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-white">GRC Shield</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" onClick={() => setActiveTab("alerts")} data-testid="button-header-alerts">
              <Bell className="w-5 h-5" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                  {unreadAlerts}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === "home" && (
          <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-white">Welcome back, {user?.firstName || user?.email?.split('@')[0] || "User"}</h1>
              <p className="text-sm text-muted-foreground">Your compliance dashboard</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30" onClick={() => setActiveTab("policies")} data-testid="card-pending-policies">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{pendingPolicies}</p>
                      <p className="text-xs text-muted-foreground">Pending Policies</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30" onClick={() => setActiveTab("training")} data-testid="card-pending-trainings">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{pendingTrainings}</p>
                      <p className="text-xs text-muted-foreground">Due Trainings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500/20 to-rose-500/20 border-red-500/30" onClick={() => setActiveTab("alerts")} data-testid="card-unread-alerts">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{unreadAlerts}</p>
                      <p className="text-xs text-muted-foreground">Unread Alerts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30" data-testid="card-completed-trainings">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{completedTrainings}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  AI Security Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask about policies, security, or compliance..."
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    className="min-h-[60px] bg-background/50 resize-none"
                    data-testid="textarea-ai-question"
                  />
                </div>
                <Button 
                  onClick={askAiHelp} 
                  disabled={isAiLoading || !aiQuestion.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                  data-testid="button-ask-ai"
                >
                  {isAiLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Ask AI Assistant
                </Button>
                {aiResponse && (
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    <p className="whitespace-pre-line">{aiResponse}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  Security Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="w-full">
                  <div className="flex gap-3 pb-2">
                    {securityTips.map((tip) => (
                      <Card key={tip.id} className="min-w-[200px] bg-muted/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <tip.icon className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-medium">{tip.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{tip.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {pendingPolicies > 0 && (
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Action Required</p>
                      <p className="text-xs text-muted-foreground">You have {pendingPolicies} policies pending acknowledgment</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setActiveTab("policies")} data-testid="button-review-policies">
                      Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "policies" && (
          <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-white">Policies</h1>
              <p className="text-sm text-muted-foreground">Review and acknowledge company policies</p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search policies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50"
                data-testid="input-search-policies"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              <Badge variant="outline" className="whitespace-nowrap cursor-pointer bg-purple-500/20 border-purple-500/50">All ({policies.length})</Badge>
              <Badge variant="outline" className="whitespace-nowrap cursor-pointer">Pending ({pendingPolicies})</Badge>
              <Badge variant="outline" className="whitespace-nowrap cursor-pointer">Acknowledged ({policies.filter(p => p.acknowledged).length})</Badge>
            </div>

            <div className="space-y-3">
              {filteredPolicies.map((policy) => (
                <Card 
                  key={policy.id} 
                  className={`cursor-pointer transition-all ${policy.acknowledged ? 'border-emerald-500/30' : 'border-amber-500/30'}`}
                  onClick={() => {
                    setSelectedPolicy(policy);
                    setIsPolicyDialogOpen(true);
                  }}
                  data-testid={`card-policy-${policy.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px]">{policy.category}</Badge>
                          <Badge variant="outline" className="text-[10px]">v{policy.version}</Badge>
                        </div>
                        <h3 className="font-medium text-sm truncate">{policy.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{policy.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {policy.acknowledged ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Clock className="w-5 h-5 text-amber-400" />
                        )}
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-white">Alerts & Notifications</h1>
              <p className="text-sm text-muted-foreground">{unreadAlerts} unread notifications</p>
            </div>

            <div className="space-y-3">
              {alerts.map((alert) => (
                <Card 
                  key={alert.id} 
                  className={`border-l-4 ${getAlertBorderColor(alert.type)} ${!alert.read ? 'bg-muted/30' : ''}`}
                  onClick={() => markAlertAsRead(alert.id)}
                  data-testid={`card-alert-${alert.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm">{alert.title}</h3>
                          {!alert.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-2">
                          {new Date(alert.timestamp).toLocaleDateString()} at {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "training" && (
          <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-white">Training</h1>
              <p className="text-sm text-muted-foreground">Complete your assigned training courses</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-amber-400">{pendingTrainings}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card className="bg-emerald-500/10 border-emerald-500/30">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-400">{completedTrainings}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              {trainings.map((training) => (
                <Card 
                  key={training.id}
                  className={training.status === "completed" ? "border-emerald-500/30" : "border-amber-500/30"}
                  data-testid={`card-training-${training.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant="outline" 
                            className={
                              training.status === "completed" ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" :
                              training.status === "in_progress" ? "bg-blue-500/20 border-blue-500/50 text-blue-400" :
                              "bg-amber-500/20 border-amber-500/50 text-amber-400"
                            }
                          >
                            {training.status === "completed" ? "Completed" : training.status === "in_progress" ? "In Progress" : "Assigned"}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{training.duration}</span>
                        </div>
                        <h3 className="font-medium text-sm">{training.name}</h3>
                        {training.status !== "completed" && (
                          <p className="text-xs text-muted-foreground mt-1">Due: {new Date(training.dueDate).toLocaleDateString()}</p>
                        )}
                        {training.status === "in_progress" && (
                          <div className="mt-2">
                            <Progress value={training.progress} className="h-1.5" />
                            <p className="text-[10px] text-muted-foreground mt-1">{training.progress}% complete</p>
                          </div>
                        )}
                      </div>
                      {training.status !== "completed" && (
                        <Button size="sm" variant="outline" data-testid={`button-start-training-${training.id}`}>
                          {training.status === "in_progress" ? "Continue" : "Start"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-white">Profile</h1>
              <p className="text-sm text-muted-foreground">Your account and settings</p>
            </div>

            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">{user?.firstName || user?.email?.split('@')[0] || "User"}</h2>
                    <p className="text-sm text-muted-foreground">Employee</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Compliance Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Policy Acknowledgments</span>
                  <span className="text-sm font-medium">{policies.filter(p => p.acknowledged).length}/{policies.length}</span>
                </div>
                <Progress value={(policies.filter(p => p.acknowledged).length / policies.length) * 100} />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Training Completion</span>
                  <span className="text-sm font-medium">{completedTrainings}/{trainings.length}</span>
                </div>
                <Progress value={(completedTrainings / trainings.length) * 100} />
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-3" data-testid="button-settings">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3" data-testid="button-help">
                <MessageSquare className="w-4 h-4" />
                Help & Support
              </Button>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-white/10 safe-area-inset-bottom z-50">
        <div className="flex items-center justify-around max-w-lg mx-auto py-2">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${activeTab === "home" ? "text-purple-400" : "text-muted-foreground"}`}
            data-testid="nav-home"
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button
            onClick={() => setActiveTab("policies")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${activeTab === "policies" ? "text-purple-400" : "text-muted-foreground"}`}
            data-testid="nav-policies"
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] font-medium">Policies</span>
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors relative ${activeTab === "alerts" ? "text-purple-400" : "text-muted-foreground"}`}
            data-testid="nav-alerts"
          >
            <Bell className="w-5 h-5" />
            {unreadAlerts > 0 && (
              <span className="absolute top-1 right-2 w-4 h-4 bg-red-500 rounded-full text-[8px] flex items-center justify-center text-white font-bold">
                {unreadAlerts}
              </span>
            )}
            <span className="text-[10px] font-medium">Alerts</span>
          </button>
          <button
            onClick={() => setActiveTab("training")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${activeTab === "training" ? "text-purple-400" : "text-muted-foreground"}`}
            data-testid="nav-training"
          >
            <GraduationCap className="w-5 h-5" />
            <span className="text-[10px] font-medium">Training</span>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${activeTab === "profile" ? "text-purple-400" : "text-muted-foreground"}`}
            data-testid="nav-profile"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>

      <Dialog open={isPolicyDialogOpen} onOpenChange={setIsPolicyDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              {selectedPolicy?.name}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Badge variant="outline">{selectedPolicy?.category}</Badge>
              <Badge variant="outline">v{selectedPolicy?.version}</Badge>
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-4 py-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedPolicy?.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Policy Content</h4>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm whitespace-pre-line">{selectedPolicy?.content}</p>
                </div>
              </div>

              {selectedPolicy?.acknowledged && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-400">
                      Acknowledged on {new Date(selectedPolicy.acknowledgedAt!).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="flex-shrink-0">
            {!selectedPolicy?.acknowledged && (
              <Button 
                onClick={() => handleAcknowledgePolicy(selectedPolicy!)}
                disabled={isAcknowledging}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                data-testid="button-acknowledge-policy"
              >
                {isAcknowledging ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                I Acknowledge This Policy
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
