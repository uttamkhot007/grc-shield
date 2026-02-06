import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GitBranch, AlertTriangle, CheckCircle2, Clock, Shield, FileText,
  Plus, Search, Eye, Settings, Zap, Brain, Sparkles, ChevronRight,
  AlertCircle, Target, Layers, RefreshCw, Activity, Network,
  ArrowRight, TrendingUp, Database, Loader2
} from "lucide-react";
import { useTenant } from "@/contexts/tenant-context";
import type { GovernanceChangeEvent, GovernanceChangeImpact } from "@shared/schema";

interface ChangeEvent {
  id: string;
  type: "policy" | "regulation" | "framework" | "control";
  name: string;
  changeType: "new" | "updated" | "deprecated";
  source: string;
  dateDetected: string;
  status: "pending" | "analyzed" | "actioned";
  impactLevel: "low" | "medium" | "high" | "critical";
}

interface ImpactItem {
  id: string;
  entityType: string;
  entityName: string;
  impactType: "requires_update" | "requires_review" | "gap_created" | "no_impact";
  description: string;
  priority: "low" | "medium" | "high";
}

const sampleChanges: ChangeEvent[] = [
  {
    id: "chg-001",
    type: "regulation",
    name: "DORA (Digital Operational Resilience Act)",
    changeType: "new",
    source: "EU Regulatory Feed",
    dateDetected: "2024-01-15",
    status: "analyzed",
    impactLevel: "high",
  },
  {
    id: "chg-002",
    type: "framework",
    name: "ISO 27001:2022 Update",
    changeType: "updated",
    source: "ISO Standards Feed",
    dateDetected: "2024-01-10",
    status: "actioned",
    impactLevel: "medium",
  },
  {
    id: "chg-003",
    type: "policy",
    name: "Data Protection Policy v2.1",
    changeType: "updated",
    source: "Internal",
    dateDetected: "2024-01-20",
    status: "pending",
    impactLevel: "medium",
  },
  {
    id: "chg-004",
    type: "regulation",
    name: "NIS2 Directive",
    changeType: "new",
    source: "EU Regulatory Feed",
    dateDetected: "2024-01-08",
    status: "analyzed",
    impactLevel: "critical",
  },
  {
    id: "chg-005",
    type: "control",
    name: "AC-2 Account Management",
    changeType: "updated",
    source: "NIST Update",
    dateDetected: "2024-01-18",
    status: "pending",
    impactLevel: "low",
  },
];

const sampleImpacts: ImpactItem[] = [
  {
    id: "imp-001",
    entityType: "Policy",
    entityName: "ICT Risk Management Policy",
    impactType: "gap_created",
    description: "New DORA requirements not covered by current policy",
    priority: "high",
  },
  {
    id: "imp-002",
    entityType: "Control",
    entityName: "Business Continuity Planning",
    impactType: "requires_update",
    description: "Resilience testing requirements expanded",
    priority: "high",
  },
  {
    id: "imp-003",
    entityType: "Process",
    entityName: "Incident Reporting Process",
    impactType: "requires_update",
    description: "New 24-hour reporting timeline introduced",
    priority: "high",
  },
  {
    id: "imp-004",
    entityType: "Control",
    entityName: "Third-Party Risk Assessment",
    impactType: "requires_review",
    description: "May need updates for ICT third-party oversight",
    priority: "medium",
  },
  {
    id: "imp-005",
    entityType: "Policy",
    entityName: "Information Security Policy",
    impactType: "no_impact",
    description: "Already compliant with new requirements",
    priority: "low",
  },
];

export default function ChangeImpactPage() {
  const { currentTenantId } = useTenant();
  const [activeTab, setActiveTab] = useState("changes");
  const [selectedChange, setSelectedChange] = useState<ChangeEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredChanges = sampleChanges.filter(change => {
    const matchesSearch = change.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || change.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = sampleChanges.filter(c => c.status === "pending").length;
  const criticalCount = sampleChanges.filter(c => c.impactLevel === "critical" || c.impactLevel === "high").length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "regulation": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "framework": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "policy": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "control": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "critical": return "bg-red-500/20 text-red-400";
      case "high": return "bg-orange-500/20 text-orange-400";
      case "medium": return "bg-amber-500/20 text-amber-400";
      case "low": return "bg-green-500/20 text-green-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getImpactTypeColor = (type: string) => {
    switch (type) {
      case "gap_created": return "bg-red-500/20 text-red-400";
      case "requires_update": return "bg-amber-500/20 text-amber-400";
      case "requires_review": return "bg-blue-500/20 text-blue-400";
      case "no_impact": return "bg-green-500/20 text-green-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Change Impact Analysis
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered impact detection for policy, regulation & framework changes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-scan-changes">
            <RefreshCw className="w-4 h-4 mr-2" />
            Scan for Changes
          </Button>
          <Button variant="outline" data-testid="button-impact-settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button data-testid="button-manual-change">
            <Plus className="w-4 h-4 mr-2" />
            Add Change
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card className="glass-card hover-elevate" data-testid="metric-pending">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/20">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-elevate" data-testid="metric-critical">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-red-500/20">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{criticalCount}</p>
                <p className="text-sm text-muted-foreground">High/Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-elevate" data-testid="metric-changes">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/20">
                <GitBranch className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sampleChanges.length}</p>
                <p className="text-sm text-muted-foreground">Total Changes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-elevate" data-testid="metric-impacts">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/20">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sampleImpacts.length}</p>
                <p className="text-sm text-muted-foreground">Impacts Detected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-elevate" data-testid="metric-gaps">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-500/20">
                <Target className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sampleImpacts.filter(i => i.impactType === "gap_created").length}</p>
                <p className="text-sm text-muted-foreground">Gaps Created</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-background/50 border border-border/50">
          <TabsTrigger value="changes" data-testid="tab-changes">Change Feed</TabsTrigger>
          <TabsTrigger value="impacts" data-testid="tab-impacts">Impact Analysis</TabsTrigger>
          <TabsTrigger value="simulator" data-testid="tab-simulator">Impact Simulator</TabsTrigger>
          <TabsTrigger value="automation" data-testid="tab-automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="changes" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search changes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-changes"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="analyzed">Analyzed</SelectItem>
                <SelectItem value="actioned">Actioned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="glass-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Change</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Change Type</TableHead>
                    <TableHead>Impact Level</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Detected</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChanges.map((change) => (
                    <TableRow key={change.id} data-testid={`row-change-${change.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getTypeColor(change.type)}`}>
                            {change.type === "regulation" ? <Layers className="w-4 h-4" /> :
                             change.type === "framework" ? <Shield className="w-4 h-4" /> :
                             change.type === "policy" ? <FileText className="w-4 h-4" /> :
                             <Target className="w-4 h-4" />}
                          </div>
                          <span className="font-medium">{change.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize ${getTypeColor(change.type)}`}>
                          {change.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {change.changeType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`capitalize ${getImpactColor(change.impactLevel)}`}>
                          {change.impactLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{change.source}</TableCell>
                      <TableCell className="text-sm">{change.dateDetected}</TableCell>
                      <TableCell>
                        <Badge variant={change.status === "actioned" ? "default" : "secondary"} className="capitalize">
                          {change.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedChange(change)} data-testid={`button-analyze-${change.id}`}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" data-testid={`button-action-${change.id}`}>
                            <Zap className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impacts" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Detected Impacts
              </CardTitle>
              <CardDescription>AI-analyzed impacts from detected changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleImpacts.map((impact) => (
                  <div key={impact.id} className="p-4 rounded-lg bg-muted/30 border border-border/50" data-testid={`impact-${impact.id}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{impact.entityType}</Badge>
                        <span className="font-medium">{impact.entityName}</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`capitalize ${getImpactTypeColor(impact.impactType)}`}>
                          {impact.impactType.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline" className="capitalize">{impact.priority}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{impact.description}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" data-testid={`button-view-impact-${impact.id}`}>View Details</Button>
                      <Button size="sm" data-testid={`button-create-task-${impact.id}`}>Create Task</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulator" className="space-y-4">
          <Card className="glass-card border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <CardTitle>AI Impact Simulator</CardTitle>
              </div>
              <CardDescription>Simulate the impact of proposed changes before implementation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Change Type</label>
                  <Select>
                    <SelectTrigger data-testid="select-sim-type">
                      <SelectValue placeholder="Choose change type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="policy">Policy Change</SelectItem>
                      <SelectItem value="regulation">New Regulation</SelectItem>
                      <SelectItem value="framework">Framework Update</SelectItem>
                      <SelectItem value="control">Control Modification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Entity</label>
                  <Select>
                    <SelectTrigger data-testid="select-sim-entity">
                      <SelectValue placeholder="Choose entity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="data-protection">Data Protection Policy</SelectItem>
                      <SelectItem value="access-control">Access Control Policy</SelectItem>
                      <SelectItem value="incident">Incident Response Policy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full" data-testid="button-run-simulation">
                <Sparkles className="w-4 h-4 mr-2" />
                Run Impact Simulation
              </Button>

              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Simulation Results Preview
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20 text-center">
                    <p className="text-2xl font-bold text-blue-400">5</p>
                    <p className="text-xs text-muted-foreground">Controls Affected</p>
                  </div>
                  <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20 text-center">
                    <p className="text-2xl font-bold text-amber-400">2</p>
                    <p className="text-xs text-muted-foreground">Processes to Update</p>
                  </div>
                  <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-center">
                    <p className="text-2xl font-bold text-red-400">1</p>
                    <p className="text-xs text-muted-foreground">Gaps Created</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-muted-foreground" />
                  Automation Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Auto-scan regulatory feeds", status: "active", frequency: "Daily" },
                  { name: "Notify on high-impact changes", status: "active", frequency: "Immediate" },
                  { name: "Auto-create tasks for gaps", status: "active", frequency: "Immediate" },
                  { name: "Update control mappings", status: "inactive", frequency: "Weekly" },
                ].map((rule, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30" data-testid={`automation-rule-${i}`}>
                    <div>
                      <p className="font-medium">{rule.name}</p>
                      <p className="text-xs text-muted-foreground">{rule.frequency}</p>
                    </div>
                    <Badge className={rule.status === "active" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                      {rule.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-muted-foreground" />
                  Connected Sources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "EU Regulatory Feed", status: "connected", lastSync: "2 hours ago" },
                  { name: "ISO Standards Updates", status: "connected", lastSync: "1 day ago" },
                  { name: "NIST Publications", status: "connected", lastSync: "3 hours ago" },
                  { name: "Industry Alerts", status: "pending", lastSync: "Never" },
                ].map((source, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30" data-testid={`source-${i}`}>
                    <div>
                      <p className="font-medium">{source.name}</p>
                      <p className="text-xs text-muted-foreground">Last sync: {source.lastSync}</p>
                    </div>
                    <Badge className={source.status === "connected" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}>
                      {source.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
