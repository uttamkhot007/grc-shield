import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Scale, Users, CheckCircle2, Clock, AlertTriangle, FileText,
  Plus, Search, Filter, Eye, Settings, UserCheck, Building2,
  ChevronRight, Workflow, GitBranch, Shield, Brain, Sparkles,
  AlertCircle, Calendar, User, BookOpen, Target, Loader2
} from "lucide-react";
import { useTenant } from "@/contexts/tenant-context";
import type { GovernanceDecision, RaciItem } from "@shared/schema";

interface Decision {
  id: string;
  title: string;
  category: string;
  status: "pending" | "approved" | "rejected" | "escalated";
  requestedBy: string;
  decisionOwner: string;
  dateRequested: string;
  dateDecided?: string;
  priority: "low" | "medium" | "high" | "critical";
  description: string;
}

interface DelegationRule {
  id: string;
  authority: string;
  delegatedTo: string;
  scope: string;
  limits: string;
  status: "active" | "suspended" | "expired";
  validUntil: string;
}

interface RACIEntry {
  activity: string;
  responsible: string;
  accountable: string;
  consulted: string[];
  informed: string[];
}

const sampleDecisions: Decision[] = [
  {
    id: "dec-001",
    title: "Use of GenAI for Customer Data Processing",
    category: "AI Governance",
    status: "pending",
    requestedBy: "Sarah Chen",
    decisionOwner: "CISO",
    dateRequested: "2024-01-20",
    priority: "high",
    description: "Request to use GPT-4 for analyzing customer support tickets",
  },
  {
    id: "dec-002",
    title: "Third-Party Cloud Migration",
    category: "Infrastructure",
    status: "approved",
    requestedBy: "Michael Torres",
    decisionOwner: "CTO",
    dateRequested: "2024-01-15",
    dateDecided: "2024-01-18",
    priority: "critical",
    description: "Migration of core services to AWS eu-west-1",
  },
  {
    id: "dec-003",
    title: "New Vendor Onboarding - DataCorp",
    category: "Vendor Risk",
    status: "pending",
    requestedBy: "Emily Watson",
    decisionOwner: "Procurement Lead",
    dateRequested: "2024-01-22",
    priority: "medium",
    description: "Onboard DataCorp as data analytics vendor",
  },
  {
    id: "dec-004",
    title: "Exception to Password Policy",
    category: "Security",
    status: "rejected",
    requestedBy: "James Wilson",
    decisionOwner: "CISO",
    dateRequested: "2024-01-10",
    dateDecided: "2024-01-12",
    priority: "low",
    description: "Request for legacy system password exception",
  },
  {
    id: "dec-005",
    title: "GDPR Data Subject Request Process Change",
    category: "Privacy",
    status: "escalated",
    requestedBy: "Lisa Park",
    decisionOwner: "DPO",
    dateRequested: "2024-01-19",
    priority: "high",
    description: "Modify DSR response timeline from 30 to 45 days",
  },
];

const sampleDelegations: DelegationRule[] = [
  {
    id: "del-001",
    authority: "Policy Approval (Non-Critical)",
    delegatedTo: "Department Heads",
    scope: "Departmental policies only",
    limits: "Budget impact < $50K",
    status: "active",
    validUntil: "2024-12-31",
  },
  {
    id: "del-002",
    authority: "Vendor Approval",
    delegatedTo: "Procurement Manager",
    scope: "Tier 2 & Tier 3 vendors",
    limits: "Contract value < $100K",
    status: "active",
    validUntil: "2024-06-30",
  },
  {
    id: "del-003",
    authority: "Data Access Requests",
    delegatedTo: "Data Stewards",
    scope: "Non-sensitive data only",
    limits: "Read-only access",
    status: "active",
    validUntil: "2024-12-31",
  },
  {
    id: "del-004",
    authority: "Security Exception",
    delegatedTo: "Security Team Lead",
    scope: "Low risk exceptions only",
    limits: "30-day maximum duration",
    status: "suspended",
    validUntil: "2024-03-31",
  },
];

const sampleRACIMatrix: RACIEntry[] = [
  {
    activity: "Policy Creation",
    responsible: "Policy Owner",
    accountable: "CISO",
    consulted: ["Legal", "Compliance", "HR"],
    informed: ["All Staff"],
  },
  {
    activity: "Risk Assessment",
    responsible: "Risk Manager",
    accountable: "CRO",
    consulted: ["Business Units", "IT Security"],
    informed: ["Executive Team"],
  },
  {
    activity: "Vendor Due Diligence",
    responsible: "Procurement",
    accountable: "CPO",
    consulted: ["Legal", "Security", "Privacy"],
    informed: ["Requesting Department"],
  },
  {
    activity: "Incident Response",
    responsible: "SOC Team",
    accountable: "CISO",
    consulted: ["Legal", "PR", "HR"],
    informed: ["CEO", "Board"],
  },
  {
    activity: "AI Model Deployment",
    responsible: "ML Engineering",
    accountable: "CTO",
    consulted: ["Ethics Board", "Legal", "Privacy"],
    informed: ["Business Stakeholders"],
  },
];

export default function DecisionAuthorityPage() {
  const { currentTenantId } = useTenant();
  const [activeTab, setActiveTab] = useState("register");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);

  const filteredDecisions = sampleDecisions.filter(decision => {
    const matchesSearch = decision.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         decision.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || decision.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = sampleDecisions.filter(d => d.status === "pending").length;
  const avgDecisionTime = 2.3;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500/20 text-green-400";
      case "pending": return "bg-amber-500/20 text-amber-400";
      case "rejected": return "bg-red-500/20 text-red-400";
      case "escalated": return "bg-purple-500/20 text-purple-400";
      case "active": return "bg-green-500/20 text-green-400";
      case "suspended": return "bg-amber-500/20 text-amber-400";
      case "expired": return "bg-gray-500/20 text-gray-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "medium": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "low": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Decision & Authority Model
          </h1>
          <p className="text-muted-foreground mt-1">
            Decision registers, delegation matrix & RACI modeling
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-authority-matrix">
            <Users className="w-4 h-4 mr-2" />
            Authority Matrix
          </Button>
          <Button onClick={() => setShowDecisionDialog(true)} data-testid="button-new-decision">
            <Plus className="w-4 h-4 mr-2" />
            Request Decision
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card className="glass-card hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/20">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-500/20">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sampleDecisions.filter(d => d.status === "approved").length}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/20">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgDecisionTime}d</p>
                <p className="text-sm text-muted-foreground">Avg Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/20">
                <UserCheck className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sampleDelegations.filter(d => d.status === "active").length}</p>
                <p className="text-sm text-muted-foreground">Delegations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-500/20">
                <Workflow className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sampleRACIMatrix.length}</p>
                <p className="text-sm text-muted-foreground">RACI Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-background/50 border border-border/50">
          <TabsTrigger value="register" data-testid="tab-register">Decision Register</TabsTrigger>
          <TabsTrigger value="delegation" data-testid="tab-delegation">Delegation Matrix</TabsTrigger>
          <TabsTrigger value="raci" data-testid="tab-raci">RACI Model</TabsTrigger>
          <TabsTrigger value="approvals" data-testid="tab-approvals">Approval Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search decisions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-decisions"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="glass-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Decision</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDecisions.map((decision) => (
                    <TableRow key={decision.id} className="hover-elevate" data-testid={`row-decision-${decision.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{decision.title}</p>
                          <p className="text-xs text-muted-foreground">by {decision.requestedBy}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{decision.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize ${getPriorityColor(decision.priority)}`}>
                          {decision.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`capitalize ${getStatusColor(decision.status)}`}>
                          {decision.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{decision.decisionOwner}</TableCell>
                      <TableCell className="text-sm">{decision.dateRequested}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedDecision(decision)} data-testid={`button-view-decision-${decision.id}`}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {decision.status === "pending" && (
                            <>
                              <Button size="sm" variant="ghost" className="text-green-400" data-testid={`button-approve-${decision.id}`}>
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delegation" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                Delegation of Authority
              </CardTitle>
              <CardDescription>Who can decide what within defined limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleDelegations.map((delegation) => (
                  <div key={delegation.id} className="p-4 rounded-lg bg-muted/30 border border-border/50 hover-elevate" data-testid={`delegation-${delegation.id}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{delegation.authority}</h4>
                        <p className="text-sm text-muted-foreground">Delegated to: <span className="text-foreground">{delegation.delegatedTo}</span></p>
                      </div>
                      <Badge className={getStatusColor(delegation.status)}>{delegation.status}</Badge>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Scope</p>
                        <p>{delegation.scope}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Limits</p>
                        <p>{delegation.limits}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valid Until</p>
                        <p>{delegation.validUntil}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raci" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-primary" />
                RACI Matrix
              </CardTitle>
              <CardDescription>Responsible, Accountable, Consulted, Informed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Activity</TableHead>
                      <TableHead className="text-center">
                        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">R</Badge>
                        <span className="ml-1 text-xs">Responsible</span>
                      </TableHead>
                      <TableHead className="text-center">
                        <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">A</Badge>
                        <span className="ml-1 text-xs">Accountable</span>
                      </TableHead>
                      <TableHead className="text-center">
                        <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">C</Badge>
                        <span className="ml-1 text-xs">Consulted</span>
                      </TableHead>
                      <TableHead className="text-center">
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">I</Badge>
                        <span className="ml-1 text-xs">Informed</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleRACIMatrix.map((entry, i) => (
                      <TableRow key={i} className="hover-elevate" data-testid={`raci-row-${i}`}>
                        <TableCell className="font-medium">{entry.activity}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-green-500/10">{entry.responsible}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-red-500/10">{entry.accountable}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {entry.consulted.map((c, j) => (
                              <Badge key={j} variant="outline" className="text-xs bg-amber-500/10">{c}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {entry.informed.map((info, j) => (
                              <Badge key={j} variant="outline" className="text-xs bg-blue-500/10">{info}</Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-muted-foreground" />
                  Approval Workflows
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Policy Approval", stages: 3, active: true },
                  { name: "Vendor Onboarding", stages: 4, active: true },
                  { name: "Security Exception", stages: 2, active: true },
                  { name: "AI Model Deployment", stages: 5, active: true },
                  { name: "Data Access Request", stages: 2, active: false },
                ].map((workflow, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/50 hover-elevate" data-testid={`workflow-${i}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Workflow className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">{workflow.name}</p>
                          <p className="text-xs text-muted-foreground">{workflow.stages} approval stages</p>
                        </div>
                      </div>
                      <Badge className={workflow.active ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                        {workflow.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <CardTitle className="text-base">AI Decision Support</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-background/50">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Decision Recommendation</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        "GenAI Customer Data" request has precedent - similar request approved 3 months ago with DPA conditions
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-background/50">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Bottleneck Alert</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        CISO has 3 pending decisions averaging 5.2 days wait time
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-background/50">
                  <div className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Delegation Suggestion</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Low-risk vendor approvals could be delegated to reduce CISO workload by 40%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              Request Decision
            </DialogTitle>
            <DialogDescription>
              Submit a governance decision request
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="decision-title">Decision Title</Label>
              <Input id="decision-title" placeholder="e.g., Use of GenAI for customer data" data-testid="input-decision-title" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="decision-category">Category</Label>
                <Select>
                  <SelectTrigger data-testid="select-decision-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai">AI Governance</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="privacy">Privacy</SelectItem>
                    <SelectItem value="vendor">Vendor Risk</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="decision-priority">Priority</Label>
                <Select>
                  <SelectTrigger data-testid="select-decision-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="decision-description">Description</Label>
              <Textarea id="decision-description" placeholder="Describe the decision needed and its context..." data-testid="input-decision-description" />
            </div>
            <div>
              <Label htmlFor="decision-owner">Decision Owner</Label>
              <Select>
                <SelectTrigger data-testid="select-decision-owner">
                  <SelectValue placeholder="Who should decide" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ciso">CISO</SelectItem>
                  <SelectItem value="cto">CTO</SelectItem>
                  <SelectItem value="dpo">DPO</SelectItem>
                  <SelectItem value="cro">CRO</SelectItem>
                  <SelectItem value="cpo">CPO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDecisionDialog(false)} data-testid="button-cancel-decision">Cancel</Button>
            <Button data-testid="button-submit-decision">Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
