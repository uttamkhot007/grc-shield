import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Network, FileText, Shield, Target, AlertTriangle, Users,
  ChevronRight, ArrowRight, Layers, Database, Globe, Building2,
  GitBranch, Link2, Eye, Search, Filter, Sparkles, Brain,
  CheckCircle2, Clock, Zap, Activity, Scale, Lock, FileCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTenant } from "@/contexts/tenant-context";

interface OntologyNode {
  id: string;
  type: "policy" | "principle" | "objective" | "control" | "evidence" | "risk" | "regulation" | "process" | "system" | "owner";
  name: string;
  status?: string;
  connections: string[];
}

const sampleOntology: OntologyNode[] = [
  { id: "pol-001", type: "policy", name: "Data Protection Policy", status: "approved", connections: ["prin-001", "ctrl-001", "ctrl-002", "risk-001"] },
  { id: "pol-002", type: "policy", name: "Access Control Policy", status: "approved", connections: ["prin-002", "ctrl-003", "ctrl-004", "risk-002"] },
  { id: "pol-003", type: "policy", name: "AI Governance Policy", status: "draft", connections: ["prin-003", "ctrl-005", "risk-003"] },
  { id: "prin-001", type: "principle", name: "Data Minimization", connections: ["pol-001", "reg-001"] },
  { id: "prin-002", type: "principle", name: "Least Privilege", connections: ["pol-002", "reg-002"] },
  { id: "prin-003", type: "principle", name: "AI Transparency", connections: ["pol-003", "reg-003"] },
  { id: "ctrl-001", type: "control", name: "Data Encryption at Rest", status: "implemented", connections: ["pol-001", "evd-001", "sys-001"] },
  { id: "ctrl-002", type: "control", name: "Data Retention Controls", status: "implemented", connections: ["pol-001", "evd-002"] },
  { id: "ctrl-003", type: "control", name: "MFA Enforcement", status: "implemented", connections: ["pol-002", "evd-003", "sys-002"] },
  { id: "ctrl-004", type: "control", name: "Role-Based Access", status: "partial", connections: ["pol-002", "sys-002"] },
  { id: "ctrl-005", type: "control", name: "AI Explainability", status: "pending", connections: ["pol-003"] },
  { id: "evd-001", type: "evidence", name: "Encryption Audit Report", connections: ["ctrl-001"] },
  { id: "evd-002", type: "evidence", name: "Retention Schedule", connections: ["ctrl-002"] },
  { id: "evd-003", type: "evidence", name: "MFA Enrollment Report", connections: ["ctrl-003"] },
  { id: "risk-001", type: "risk", name: "Data Breach Risk", status: "medium", connections: ["pol-001", "ctrl-001", "ctrl-002"] },
  { id: "risk-002", type: "risk", name: "Unauthorized Access", status: "high", connections: ["pol-002", "ctrl-003", "ctrl-004"] },
  { id: "risk-003", type: "risk", name: "AI Bias Risk", status: "medium", connections: ["pol-003", "ctrl-005"] },
  { id: "reg-001", type: "regulation", name: "GDPR Art. 5", connections: ["prin-001", "pol-001"] },
  { id: "reg-002", type: "regulation", name: "ISO 27001 A.9", connections: ["prin-002", "pol-002"] },
  { id: "reg-003", type: "regulation", name: "EU AI Act", connections: ["prin-003", "pol-003"] },
  { id: "sys-001", type: "system", name: "AWS KMS", connections: ["ctrl-001"] },
  { id: "sys-002", type: "system", name: "Azure AD", connections: ["ctrl-003", "ctrl-004"] },
];

const getNodeIcon = (type: string) => {
  switch (type) {
    case "policy": return FileText;
    case "principle": return Scale;
    case "objective": return Target;
    case "control": return Shield;
    case "evidence": return FileCheck;
    case "risk": return AlertTriangle;
    case "regulation": return Globe;
    case "process": return GitBranch;
    case "system": return Database;
    case "owner": return Users;
    default: return Layers;
  }
};

const getNodeColor = (type: string) => {
  switch (type) {
    case "policy": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "principle": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "objective": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
    case "control": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "evidence": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "risk": return "bg-red-500/20 text-red-400 border-red-500/30";
    case "regulation": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "process": return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
    case "system": return "bg-pink-500/20 text-pink-400 border-pink-500/30";
    case "owner": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

export default function GovernanceOntologyPage() {
  const { currentTenantId } = useTenant();
  const [activeTab, setActiveTab] = useState("graph");
  const [selectedNode, setSelectedNode] = useState<OntologyNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredNodes = sampleOntology.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || node.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const nodeTypes = ["policy", "principle", "control", "evidence", "risk", "regulation", "system"];
  const nodeTypeCounts = nodeTypes.reduce((acc, type) => {
    acc[type] = sampleOntology.filter(n => n.type === type).length;
    return acc;
  }, {} as Record<string, number>);

  const getConnectedNodes = (node: OntologyNode) => {
    return sampleOntology.filter(n => node.connections.includes(n.id));
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Governance Ontology
          </h1>
          <p className="text-muted-foreground mt-1">
            Visual governance graph showing Policy → Principle → Control → Evidence relationships
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export-ontology">
            <Network className="w-4 h-4 mr-2" />
            Export Graph
          </Button>
          <Button data-testid="button-add-relationship">
            <Link2 className="w-4 h-4 mr-2" />
            Add Relationship
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {nodeTypes.map(type => {
          const Icon = getNodeIcon(type);
          return (
            <Card key={type} className={`glass-card hover-elevate cursor-pointer ${typeFilter === type ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setTypeFilter(typeFilter === type ? "all" : type)}
                  data-testid={`filter-${type}`}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${getNodeColor(type)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{nodeTypeCounts[type]}</p>
                    <p className="text-xs text-muted-foreground capitalize">{type}s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-background/50 border border-border/50">
          <TabsTrigger value="graph" data-testid="tab-graph">Graph View</TabsTrigger>
          <TabsTrigger value="hierarchy" data-testid="tab-hierarchy">Hierarchy</TabsTrigger>
          <TabsTrigger value="matrix" data-testid="tab-matrix">Relationship Matrix</TabsTrigger>
          <TabsTrigger value="impact" data-testid="tab-impact">Impact Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="graph" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-ontology"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]" data-testid="select-type-filter">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {nodeTypes.map(type => (
                  <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="w-5 h-5 text-primary" />
                    Governance Graph
                  </CardTitle>
                  <CardDescription>Interactive visualization of governance relationships</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative min-h-[500px] bg-muted/20 rounded-lg border border-border/50 p-6 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-full max-w-3xl">
                        <div className="flex justify-center mb-8">
                          <div className="text-center">
                            <Badge className="bg-amber-500/20 text-amber-400 mb-2">Regulations</Badge>
                            <div className="flex gap-3 justify-center">
                              {sampleOntology.filter(n => n.type === "regulation").slice(0, 3).map(node => (
                                <div key={node.id} 
                                     className={`p-3 rounded-lg cursor-pointer transition-all hover:scale-105 ${getNodeColor(node.type)} ${selectedNode?.id === node.id ? 'ring-2 ring-primary' : ''}`}
                                     onClick={() => setSelectedNode(node)}
                                     data-testid={`node-${node.id}`}>
                                  <Globe className="w-5 h-5 mx-auto mb-1" />
                                  <p className="text-xs font-medium text-center">{node.name}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 mb-4">
                          <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
                        </div>

                        <div className="flex justify-center mb-8">
                          <div className="text-center">
                            <Badge className="bg-purple-500/20 text-purple-400 mb-2">Principles</Badge>
                            <div className="flex gap-3 justify-center">
                              {sampleOntology.filter(n => n.type === "principle").map(node => (
                                <div key={node.id}
                                     className={`p-3 rounded-lg cursor-pointer transition-all hover:scale-105 ${getNodeColor(node.type)} ${selectedNode?.id === node.id ? 'ring-2 ring-primary' : ''}`}
                                     onClick={() => setSelectedNode(node)}
                                     data-testid={`node-${node.id}`}>
                                  <Scale className="w-5 h-5 mx-auto mb-1" />
                                  <p className="text-xs font-medium text-center">{node.name}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 mb-4">
                          <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
                        </div>

                        <div className="flex justify-center mb-8">
                          <div className="text-center">
                            <Badge className="bg-blue-500/20 text-blue-400 mb-2">Policies</Badge>
                            <div className="flex gap-3 justify-center">
                              {sampleOntology.filter(n => n.type === "policy").map(node => (
                                <div key={node.id}
                                     className={`p-3 rounded-lg cursor-pointer transition-all hover:scale-105 ${getNodeColor(node.type)} ${selectedNode?.id === node.id ? 'ring-2 ring-primary' : ''}`}
                                     onClick={() => setSelectedNode(node)}
                                     data-testid={`node-${node.id}`}>
                                  <FileText className="w-5 h-5 mx-auto mb-1" />
                                  <p className="text-xs font-medium text-center max-w-[100px] truncate">{node.name}</p>
                                  {node.status && (
                                    <Badge variant="outline" className="text-[10px] mt-1">{node.status}</Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 mb-4">
                          <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
                        </div>

                        <div className="flex justify-center mb-8">
                          <div className="text-center">
                            <Badge className="bg-green-500/20 text-green-400 mb-2">Controls</Badge>
                            <div className="flex gap-2 justify-center flex-wrap max-w-xl">
                              {sampleOntology.filter(n => n.type === "control").map(node => (
                                <div key={node.id}
                                     className={`p-2 rounded-lg cursor-pointer transition-all hover:scale-105 ${getNodeColor(node.type)} ${selectedNode?.id === node.id ? 'ring-2 ring-primary' : ''}`}
                                     onClick={() => setSelectedNode(node)}
                                     data-testid={`node-${node.id}`}>
                                  <Shield className="w-4 h-4 mx-auto mb-1" />
                                  <p className="text-[10px] font-medium text-center max-w-[80px] truncate">{node.name}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 mb-4">
                          <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
                        </div>

                        <div className="flex justify-center">
                          <div className="text-center">
                            <Badge className="bg-emerald-500/20 text-emerald-400 mb-2">Evidence</Badge>
                            <div className="flex gap-2 justify-center">
                              {sampleOntology.filter(n => n.type === "evidence").map(node => (
                                <div key={node.id}
                                     className={`p-2 rounded-lg cursor-pointer transition-all hover:scale-105 ${getNodeColor(node.type)} ${selectedNode?.id === node.id ? 'ring-2 ring-primary' : ''}`}
                                     onClick={() => setSelectedNode(node)}
                                     data-testid={`node-${node.id}`}>
                                  <FileCheck className="w-4 h-4 mx-auto mb-1" />
                                  <p className="text-[10px] font-medium text-center max-w-[80px] truncate">{node.name}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-muted-foreground" />
                    {selectedNode ? "Node Details" : "Select a Node"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedNode ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${getNodeColor(selectedNode.type)}`}>
                          {(() => { const Icon = getNodeIcon(selectedNode.type); return <Icon className="w-6 h-6" />; })()}
                        </div>
                        <div>
                          <p className="font-semibold">{selectedNode.name}</p>
                          <Badge variant="outline" className="capitalize text-xs">{selectedNode.type}</Badge>
                        </div>
                      </div>

                      {selectedNode.status && (
                        <div className="p-3 rounded-lg bg-muted/30">
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge className={
                            selectedNode.status === "approved" || selectedNode.status === "implemented" ? "bg-green-500/20 text-green-400" :
                            selectedNode.status === "partial" ? "bg-amber-500/20 text-amber-400" :
                            selectedNode.status === "high" ? "bg-red-500/20 text-red-400" :
                            selectedNode.status === "medium" ? "bg-amber-500/20 text-amber-400" :
                            "bg-gray-500/20 text-gray-400"
                          }>
                            {selectedNode.status}
                          </Badge>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium mb-2">Connected Nodes ({selectedNode.connections.length})</p>
                        <ScrollArea className="h-[200px]">
                          <div className="space-y-2">
                            {getConnectedNodes(selectedNode).map(node => {
                              const Icon = getNodeIcon(node.type);
                              return (
                                <div key={node.id}
                                     className={`p-2 rounded-lg cursor-pointer hover-elevate ${getNodeColor(node.type)}`}
                                     onClick={() => setSelectedNode(node)}>
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm">{node.name}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Network className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Click on a node in the graph to view its details and connections</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card mt-4 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm">AI Analysis</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="p-2 rounded bg-background/50 text-sm">
                    <p className="text-amber-400 font-medium">Gap Detected</p>
                    <p className="text-xs text-muted-foreground">AI Governance Policy missing evidence links</p>
                  </div>
                  <div className="p-2 rounded bg-background/50 text-sm">
                    <p className="text-blue-400 font-medium">Suggestion</p>
                    <p className="text-xs text-muted-foreground">Link RBAC control to ISO 27001 A.9.2</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hierarchy" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Governance Hierarchy</CardTitle>
              <CardDescription>Hierarchical view of governance relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleOntology.filter(n => n.type === "policy").map(policy => (
                  <div key={policy.id} className="border border-border/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <span className="font-medium">{policy.name}</span>
                      <Badge variant="outline" className="text-xs">{policy.status}</Badge>
                    </div>
                    <div className="ml-6 space-y-2">
                      {getConnectedNodes(policy).filter(n => n.type === "control").map(control => (
                        <div key={control.id} className="flex items-center gap-2 p-2 rounded bg-muted/30">
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          <Shield className="w-4 h-4 text-green-400" />
                          <span className="text-sm">{control.name}</span>
                          <Badge variant="outline" className="text-xs ml-auto">{control.status}</Badge>
                        </div>
                      ))}
                      {getConnectedNodes(policy).filter(n => n.type === "risk").map(risk => (
                        <div key={risk.id} className="flex items-center gap-2 p-2 rounded bg-red-500/5">
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span className="text-sm">{risk.name}</span>
                          <Badge variant="outline" className="text-xs ml-auto text-red-400">{risk.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Relationship Matrix</CardTitle>
              <CardDescription>Cross-reference matrix showing all governance relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Entity</th>
                      <th className="p-2 text-center">Policies</th>
                      <th className="p-2 text-center">Controls</th>
                      <th className="p-2 text-center">Risks</th>
                      <th className="p-2 text-center">Evidence</th>
                      <th className="p-2 text-center">Regulations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleOntology.filter(n => n.type === "policy").map(policy => {
                      const connected = getConnectedNodes(policy);
                      return (
                        <tr key={policy.id} className="border-b hover:bg-muted/30">
                          <td className="p-2 font-medium">{policy.name}</td>
                          <td className="p-2 text-center">-</td>
                          <td className="p-2 text-center">
                            <Badge variant="outline">{connected.filter(n => n.type === "control").length}</Badge>
                          </td>
                          <td className="p-2 text-center">
                            <Badge variant="outline">{connected.filter(n => n.type === "risk").length}</Badge>
                          </td>
                          <td className="p-2 text-center">
                            <Badge variant="outline">{connected.filter(n => n.type === "evidence").length}</Badge>
                          </td>
                          <td className="p-2 text-center">
                            <Badge variant="outline">{connected.filter(n => n.type === "regulation").length}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact" className="space-y-4">
          <Card className="glass-card border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Change Impact Analysis
              </CardTitle>
              <CardDescription>Simulate the impact of governance changes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <h4 className="font-medium mb-3">Simulate: What if we update "Data Protection Policy"?</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm font-medium text-blue-400">Controls Affected</p>
                    <p className="text-2xl font-bold">2</p>
                    <p className="text-xs text-muted-foreground">Data Encryption, Data Retention</p>
                  </div>
                  <div className="p-3 rounded bg-red-500/10 border border-red-500/20">
                    <p className="text-sm font-medium text-red-400">Risks Impacted</p>
                    <p className="text-2xl font-bold">1</p>
                    <p className="text-xs text-muted-foreground">Data Breach Risk</p>
                  </div>
                  <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm font-medium text-amber-400">Regulations Affected</p>
                    <p className="text-2xl font-bold">1</p>
                    <p className="text-xs text-muted-foreground">GDPR Art. 5</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <h4 className="font-medium mb-3">Simulate: New regulation added (DORA)</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-3 rounded bg-purple-500/10 border border-purple-500/20">
                    <p className="text-sm font-medium text-purple-400">New Policies Needed</p>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-xs text-muted-foreground">ICT Risk, Incident Reporting, Resilience</p>
                  </div>
                  <div className="p-3 rounded bg-green-500/10 border border-green-500/20">
                    <p className="text-sm font-medium text-green-400">Controls to Create</p>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-xs text-muted-foreground">Mapped from DORA requirements</p>
                  </div>
                  <div className="p-3 rounded bg-cyan-500/10 border border-cyan-500/20">
                    <p className="text-sm font-medium text-cyan-400">Existing Coverage</p>
                    <p className="text-2xl font-bold">45%</p>
                    <p className="text-xs text-muted-foreground">From current controls</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
