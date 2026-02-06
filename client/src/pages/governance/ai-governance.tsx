import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Brain, Sparkles, AlertTriangle, CheckCircle2, Clock, Shield,
  Eye, Users, Database, Lock, FileText, Settings, Plus, Search,
  Filter, ChevronRight, AlertCircle, Activity, Target, Zap,
  BarChart3, RefreshCw, GitBranch, Workflow, UserCheck, Scale,
  Bot, MessageSquare, Image, Code, FileSearch, Lightbulb,
  TrendingUp, AlertOctagon, ShieldCheck, BookOpen, Loader2
} from "lucide-react";
import { useTenant } from "@/contexts/tenant-context";
import type { AiSystem } from "@shared/schema";

interface AISystem {
  id: string;
  name: string;
  type: "genai" | "ml" | "rules" | "hybrid";
  riskLevel: "unacceptable" | "high" | "limited" | "minimal";
  status: "design" | "development" | "validation" | "deployed" | "monitoring" | "retired";
  owner: string;
  department: string;
  dataTypes: string[];
  purpose: string;
  complianceScore: number;
  lastReview: string;
  euAiActCategory?: string;
}

const sampleAISystems: AISystem[] = [
  {
    id: "ai-001",
    name: "Customer Service Chatbot",
    type: "genai",
    riskLevel: "limited",
    status: "deployed",
    owner: "Sarah Chen",
    department: "Customer Success",
    dataTypes: ["Customer queries", "Product information"],
    purpose: "Automated customer support and FAQ responses",
    complianceScore: 85,
    lastReview: "2024-01-15",
    euAiActCategory: "Limited Risk - Transparency",
  },
  {
    id: "ai-002",
    name: "Fraud Detection Model",
    type: "ml",
    riskLevel: "high",
    status: "deployed",
    owner: "Michael Torres",
    department: "Risk & Compliance",
    dataTypes: ["Transaction data", "Customer behavior", "Financial records"],
    purpose: "Real-time fraud detection and prevention",
    complianceScore: 92,
    lastReview: "2024-01-20",
    euAiActCategory: "High Risk - Credit/Finance",
  },
  {
    id: "ai-003",
    name: "Resume Screening AI",
    type: "ml",
    riskLevel: "high",
    status: "validation",
    owner: "Emily Watson",
    department: "Human Resources",
    dataTypes: ["Resume data", "Candidate information"],
    purpose: "Automated resume screening and candidate ranking",
    complianceScore: 68,
    lastReview: "2024-01-10",
    euAiActCategory: "High Risk - Employment",
  },
  {
    id: "ai-004",
    name: "Document Summarizer",
    type: "genai",
    riskLevel: "minimal",
    status: "deployed",
    owner: "David Kim",
    department: "Legal",
    dataTypes: ["Legal documents", "Contracts"],
    purpose: "Automated document summarization",
    complianceScore: 95,
    lastReview: "2024-01-18",
    euAiActCategory: "Minimal Risk",
  },
  {
    id: "ai-005",
    name: "Predictive Maintenance",
    type: "ml",
    riskLevel: "limited",
    status: "monitoring",
    owner: "James Wilson",
    department: "Operations",
    dataTypes: ["Sensor data", "Equipment logs"],
    purpose: "Predict equipment failures before they occur",
    complianceScore: 88,
    lastReview: "2024-01-12",
    euAiActCategory: "Limited Risk",
  },
];

const aiControls = [
  { id: "AI-01", name: "Bias & Fairness Testing", category: "Fairness", status: "implemented" },
  { id: "AI-02", name: "Explainability Documentation", category: "Transparency", status: "implemented" },
  { id: "AI-03", name: "Human-in-the-Loop Oversight", category: "Accountability", status: "partial" },
  { id: "AI-04", name: "Data Lineage Tracking", category: "Data Governance", status: "implemented" },
  { id: "AI-05", name: "Model Validation Process", category: "Quality", status: "implemented" },
  { id: "AI-06", name: "Prompt Governance", category: "GenAI", status: "pending" },
  { id: "AI-07", name: "Training Data Review", category: "Data Governance", status: "implemented" },
  { id: "AI-08", name: "Performance Monitoring", category: "Operations", status: "implemented" },
  { id: "AI-09", name: "Incident Response Plan", category: "Risk", status: "partial" },
  { id: "AI-10", name: "User Notification", category: "Transparency", status: "implemented" },
];

export default function AIGovernancePage() {
  const { currentTenantId } = useTenant();
  const [activeTab, setActiveTab] = useState("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<AiSystem | null>(null);

  // Fetch AI Systems from API
  const { data: aiSystems = [], isLoading } = useQuery<AiSystem[]>({
    queryKey: ["/api/governance/ai-systems", currentTenantId],
  });

  // Use API data or fallback to sample data
  const systemsToUse = aiSystems.length > 0 ? aiSystems : sampleAISystems.map(s => ({
    ...s,
    type: s.type === "genai" ? "llm" : s.type === "ml" ? "ml_model" : s.type,
    status: s.status === "design" ? "development" : s.status === "validation" ? "testing" : s.status === "monitoring" ? "deployed" : s.status,
  } as unknown as AiSystem));

  const filteredSystems = systemsToUse.filter(system => {
    const matchesSearch = system.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         system.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === "all" || system.riskLevel === riskFilter;
    const matchesStatus = statusFilter === "all" || system.status === statusFilter;
    return matchesSearch && matchesRisk && matchesStatus;
  });

  const highRiskCount = systemsToUse.filter(s => s.riskLevel === "high" || s.riskLevel === "unacceptable").length;
  const deployedCount = systemsToUse.filter(s => s.status === "deployed").length;
  const avgCompliance = systemsToUse.length > 0 
    ? Math.round(systemsToUse.reduce((acc, s) => acc + (s.complianceScore || 0), 0) / systemsToUse.length)
    : 0;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "unacceptable": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "limited": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "minimal": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "deployed": case "monitoring": return "bg-green-500/20 text-green-400";
      case "validation": return "bg-blue-500/20 text-blue-400";
      case "development": case "design": return "bg-amber-500/20 text-amber-400";
      case "retired": return "bg-gray-500/20 text-gray-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "genai": return <MessageSquare className="w-4 h-4" />;
      case "ml": return <Brain className="w-4 h-4" />;
      case "rules": return <Code className="w-4 h-4" />;
      case "hybrid": return <Zap className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            AI Governance
          </h1>
          <p className="text-muted-foreground mt-1">
            AI inventory, lifecycle governance & EU AI Act compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-ai-policies">
            <FileText className="w-4 h-4 mr-2" />
            AI Policies
          </Button>
          <Button variant="outline" data-testid="button-ai-settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => setShowRegisterDialog(true)} data-testid="button-register-ai-system">
            <Plus className="w-4 h-4 mr-2" />
            Register AI System
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="glass-card hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/20">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "..." : systemsToUse.length}</p>
                <p className="text-sm text-muted-foreground">AI Systems</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-orange-500/20">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{highRiskCount}</p>
                <p className="text-sm text-muted-foreground">High Risk</p>
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
                <p className="text-2xl font-bold">{deployedCount}</p>
                <p className="text-sm text-muted-foreground">Deployed</p>
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
                <p className="text-2xl font-bold">{avgCompliance}%</p>
                <p className="text-sm text-muted-foreground">Compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-500/20">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{aiControls.length}</p>
                <p className="text-sm text-muted-foreground">AI Controls</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/20">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-background/50 border border-border/50">
          <TabsTrigger value="inventory" data-testid="tab-inventory">AI Inventory</TabsTrigger>
          <TabsTrigger value="lifecycle" data-testid="tab-lifecycle">Lifecycle</TabsTrigger>
          <TabsTrigger value="controls" data-testid="tab-controls">AI Controls</TabsTrigger>
          <TabsTrigger value="euaiact" data-testid="tab-euaiact">EU AI Act</TabsTrigger>
          <TabsTrigger value="frameworks" data-testid="tab-frameworks">Frameworks</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search AI systems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-ai"
                />
              </div>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-[150px]" data-testid="select-risk-filter">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risks</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="limited">Limited Risk</SelectItem>
                  <SelectItem value="minimal">Minimal Risk</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="validation">Validation</SelectItem>
                  <SelectItem value="deployed">Deployed</SelectItem>
                  <SelectItem value="monitoring">Monitoring</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="glass-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>AI System</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSystems.map((system) => (
                    <TableRow key={system.id} className="hover-elevate cursor-pointer" data-testid={`row-ai-${system.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            {getTypeIcon(system.type)}
                          </div>
                          <div>
                            <p className="font-medium">{system.name}</p>
                            <p className="text-xs text-muted-foreground">{system.department}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {system.type === "genai" ? "GenAI" : system.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize ${getRiskColor(system.riskLevel)}`}>
                          {system.riskLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`capitalize ${getStatusColor(system.status)}`}>
                          {system.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={system.complianceScore} className="w-16 h-2" />
                          <span className="text-sm">{system.complianceScore}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{system.owner}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedSystem(system)} data-testid={`button-view-ai-${system.id}`}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lifecycle" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-primary" />
                AI Lifecycle Governance
              </CardTitle>
              <CardDescription>End-to-end AI system lifecycle management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4 py-8">
                {["Design", "Development", "Validation", "Deployment", "Monitoring", "Retirement"].map((stage, i) => (
                  <div key={stage} className="flex-1 text-center relative">
                    <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                      i < 4 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {i + 1}
                    </div>
                    <p className="mt-2 text-sm font-medium">{stage}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {i === 0 && "Risk assessment"}
                      {i === 1 && "Data governance"}
                      {i === 2 && "Model validation"}
                      {i === 3 && "Approval gate"}
                      {i === 4 && "Performance track"}
                      {i === 5 && "Decommission"}
                    </p>
                    {i < 5 && (
                      <div className="absolute top-6 left-[60%] w-[80%] h-0.5 bg-border" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSearch className="w-5 h-5 text-muted-foreground" />
                  Pending Approvals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-amber-400" />
                      <span className="font-medium">Resume Screening AI</span>
                    </div>
                    <Badge variant="outline" className="text-amber-400 border-amber-400/30">Validation</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Awaiting bias testing approval before production deployment</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" data-testid="button-review-resume-ai">Review</Button>
                    <Button size="sm" data-testid="button-approve-resume-ai">Approve</Button>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-400" />
                      <span className="font-medium">Sales Assistant Bot</span>
                    </div>
                    <Badge variant="outline" className="text-blue-400 border-blue-400/30">Design</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Design review pending for new GenAI sales assistant</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" data-testid="button-review-sales-ai">Review</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-muted-foreground" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-3">
                    {[
                      { action: "Model retrained", system: "Fraud Detection", time: "2 hours ago", type: "info" },
                      { action: "Bias test passed", system: "Customer Chatbot", time: "5 hours ago", type: "success" },
                      { action: "Performance alert", system: "Predictive Maintenance", time: "1 day ago", type: "warning" },
                      { action: "Deployed to prod", system: "Document Summarizer", time: "2 days ago", type: "success" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover-elevate">
                        <div className={`w-2 h-2 rounded-full ${
                          item.type === "success" ? "bg-green-400" :
                          item.type === "warning" ? "bg-amber-400" : "bg-blue-400"
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.action}</p>
                          <p className="text-xs text-muted-foreground">{item.system}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                AI-Specific Controls
              </CardTitle>
              <CardDescription>Controls mapped to AI governance requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {aiControls.map((control) => (
                  <div key={control.id} className="p-4 rounded-lg bg-muted/30 border border-border/50 hover-elevate" data-testid={`control-${control.id}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{control.id}</Badge>
                        <span className="font-medium">{control.name}</span>
                      </div>
                      <Badge className={
                        control.status === "implemented" ? "bg-green-500/20 text-green-400" :
                        control.status === "partial" ? "bg-amber-500/20 text-amber-400" :
                        "bg-gray-500/20 text-gray-400"
                      }>
                        {control.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{control.category}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="euaiact" className="space-y-6">
          <Card className="glass-card border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                  <Scale className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>EU AI Act Compliance</CardTitle>
                  <CardDescription>Risk-based classification and requirements mapping</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                  <AlertOctagon className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="font-bold text-2xl text-red-400">0</p>
                  <p className="text-sm text-muted-foreground">Unacceptable</p>
                  <p className="text-xs text-red-400 mt-1">Prohibited</p>
                </div>
                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-center">
                  <AlertTriangle className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <p className="font-bold text-2xl text-orange-400">{highRiskCount}</p>
                  <p className="text-sm text-muted-foreground">High Risk</p>
                  <p className="text-xs text-orange-400 mt-1">Strict requirements</p>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                  <Eye className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="font-bold text-2xl text-amber-400">2</p>
                  <p className="text-sm text-muted-foreground">Limited Risk</p>
                  <p className="text-xs text-amber-400 mt-1">Transparency required</p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="font-bold text-2xl text-green-400">1</p>
                  <p className="text-sm text-muted-foreground">Minimal Risk</p>
                  <p className="text-xs text-green-400 mt-1">No requirements</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  High-Risk AI Requirements Checklist
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { name: "Risk Management System", status: true },
                    { name: "Data Governance", status: true },
                    { name: "Technical Documentation", status: true },
                    { name: "Record Keeping", status: false },
                    { name: "Transparency & Information", status: true },
                    { name: "Human Oversight", status: false },
                    { name: "Accuracy & Robustness", status: true },
                    { name: "Cybersecurity", status: true },
                  ].map((req, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/30">
                      {req.status ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                      )}
                      <span className="text-sm">{req.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frameworks" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: "EU AI Act", org: "European Union", status: "Active", coverage: 85 },
              { name: "ISO 42001", org: "ISO", status: "Active", coverage: 72 },
              { name: "NIST AI RMF", org: "NIST", status: "Planned", coverage: 45 },
            ].map((framework, i) => (
              <Card key={i} className="glass-card hover-elevate" data-testid={`framework-${framework.name.toLowerCase().replace(/\s/g, '-')}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-lg bg-primary/20">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant={framework.status === "Active" ? "default" : "secondary"}>
                      {framework.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-1">{framework.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{framework.org}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Coverage</span>
                      <span className="font-medium">{framework.coverage}%</span>
                    </div>
                    <Progress value={framework.coverage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Register AI System
            </DialogTitle>
            <DialogDescription>
              Add a new AI system to the governance inventory
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ai-name">System Name</Label>
                <Input id="ai-name" placeholder="Customer Service Bot" data-testid="input-ai-name" />
              </div>
              <div>
                <Label htmlFor="ai-type">AI Type</Label>
                <Select>
                  <SelectTrigger data-testid="select-ai-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="genai">Generative AI</SelectItem>
                    <SelectItem value="ml">Machine Learning</SelectItem>
                    <SelectItem value="rules">Rules-based</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ai-risk">Risk Classification</Label>
                <Select>
                  <SelectTrigger data-testid="select-ai-risk">
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Minimal Risk</SelectItem>
                    <SelectItem value="limited">Limited Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ai-owner">System Owner</Label>
                <Input id="ai-owner" placeholder="John Smith" data-testid="input-ai-owner" />
              </div>
            </div>
            <div>
              <Label htmlFor="ai-purpose">Purpose & Use Case</Label>
              <Textarea id="ai-purpose" placeholder="Describe the AI system's purpose and intended use..." data-testid="input-ai-purpose" />
            </div>
            <div>
              <Label htmlFor="ai-data">Data Types Used</Label>
              <Input id="ai-data" placeholder="Customer data, Product info, etc." data-testid="input-ai-data" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegisterDialog(false)} data-testid="button-cancel-register">Cancel</Button>
            <Button data-testid="button-save-ai-system">Register System</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
