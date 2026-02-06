import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Database, Lock, Shield, Users, FileText, Clock, Eye,
  Plus, Search, Filter, Settings, AlertTriangle, CheckCircle2,
  Building2, Globe, Layers, Brain, Sparkles, ChevronRight,
  Trash2, Archive, RefreshCw, Key, UserCheck, Target, Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTenant } from "@/contexts/tenant-context";
import type { DataAsset } from "@shared/schema";

interface DataAsset {
  id: string;
  name: string;
  type: "database" | "file" | "api" | "application";
  classification: "public" | "internal" | "confidential" | "restricted" | "highly_restricted";
  owner: string;
  steward: string;
  department: string;
  retentionPeriod: string;
  location: string;
  containsPII: boolean;
  lastReview: string;
}

interface RetentionPolicy {
  id: string;
  dataCategory: string;
  retentionPeriod: string;
  legalBasis: string;
  deletionMethod: string;
  status: "active" | "pending" | "expired";
}

const sampleDataAssets: DataAsset[] = [
  {
    id: "da-001",
    name: "Customer Database",
    type: "database",
    classification: "confidential",
    owner: "Sarah Chen",
    steward: "Data Team Lead",
    department: "Customer Success",
    retentionPeriod: "7 years",
    location: "AWS eu-west-1",
    containsPII: true,
    lastReview: "2024-01-15",
  },
  {
    id: "da-002",
    name: "Employee Records",
    type: "database",
    classification: "restricted",
    owner: "HR Director",
    steward: "HR Data Steward",
    department: "Human Resources",
    retentionPeriod: "10 years post-employment",
    location: "Azure West Europe",
    containsPII: true,
    lastReview: "2024-01-10",
  },
  {
    id: "da-003",
    name: "Financial Transactions",
    type: "database",
    classification: "highly_restricted",
    owner: "CFO",
    steward: "Finance Data Steward",
    department: "Finance",
    retentionPeriod: "10 years",
    location: "AWS eu-central-1",
    containsPII: true,
    lastReview: "2024-01-18",
  },
  {
    id: "da-004",
    name: "Marketing Analytics",
    type: "application",
    classification: "internal",
    owner: "Marketing Director",
    steward: "Analytics Lead",
    department: "Marketing",
    retentionPeriod: "3 years",
    location: "GCP europe-west1",
    containsPII: false,
    lastReview: "2024-01-20",
  },
  {
    id: "da-005",
    name: "Public Website Content",
    type: "file",
    classification: "public",
    owner: "Content Manager",
    steward: "Web Team",
    department: "Marketing",
    retentionPeriod: "Indefinite",
    location: "CDN Global",
    containsPII: false,
    lastReview: "2024-01-22",
  },
];

const sampleRetentionPolicies: RetentionPolicy[] = [
  {
    id: "ret-001",
    dataCategory: "Customer PII",
    retentionPeriod: "7 years after relationship end",
    legalBasis: "GDPR Art. 17, Tax regulations",
    deletionMethod: "Secure erasure with certificate",
    status: "active",
  },
  {
    id: "ret-002",
    dataCategory: "Employee Records",
    retentionPeriod: "10 years post-employment",
    legalBasis: "Labor law, Tax regulations",
    deletionMethod: "Anonymization",
    status: "active",
  },
  {
    id: "ret-003",
    dataCategory: "Financial Records",
    retentionPeriod: "10 years",
    legalBasis: "Tax law, Audit requirements",
    deletionMethod: "Secure deletion",
    status: "active",
  },
  {
    id: "ret-004",
    dataCategory: "Marketing Data",
    retentionPeriod: "3 years or consent withdrawal",
    legalBasis: "GDPR Art. 6(1)(a)",
    deletionMethod: "Standard deletion",
    status: "active",
  },
  {
    id: "ret-005",
    dataCategory: "Log Files",
    retentionPeriod: "90 days",
    legalBasis: "Security monitoring",
    deletionMethod: "Automated purge",
    status: "pending",
  },
];

const classificationColors: Record<string, string> = {
  public: "bg-green-500/20 text-green-400 border-green-500/30",
  internal: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  confidential: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  restricted: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  highly_restricted: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function DataGovernancePage() {
  const { currentTenantId } = useTenant();
  const [activeTab, setActiveTab] = useState("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("all");

  const filteredAssets = sampleDataAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClassification = classificationFilter === "all" || asset.classification === classificationFilter;
    return matchesSearch && matchesClassification;
  });

  const piiAssets = sampleDataAssets.filter(a => a.containsPII).length;
  const restrictedAssets = sampleDataAssets.filter(a => a.classification === "restricted" || a.classification === "highly_restricted").length;

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Data Governance
          </h1>
          <p className="text-muted-foreground mt-1">
            Data classification, ownership, stewardship & retention policies
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-data-lineage">
            <Layers className="w-4 h-4 mr-2" />
            Data Lineage
          </Button>
          <Button variant="outline" data-testid="button-data-settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button data-testid="button-add-data-asset">
            <Plus className="w-4 h-4 mr-2" />
            Add Data Asset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="glass-card hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/20">
                <Database className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sampleDataAssets.length}</p>
                <p className="text-sm text-muted-foreground">Data Assets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/20">
                <Lock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{piiAssets}</p>
                <p className="text-sm text-muted-foreground">PII Assets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-red-500/20">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{restrictedAssets}</p>
                <p className="text-sm text-muted-foreground">Restricted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-500/20">
                <UserCheck className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Stewards</p>
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
                <p className="text-2xl font-bold">{sampleRetentionPolicies.length}</p>
                <p className="text-sm text-muted-foreground">Retention Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-500/20">
                <Target className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">92%</p>
                <p className="text-sm text-muted-foreground">Compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-background/50 border border-border/50">
          <TabsTrigger value="catalog" data-testid="tab-catalog">Data Catalog</TabsTrigger>
          <TabsTrigger value="classification" data-testid="tab-classification">Classification</TabsTrigger>
          <TabsTrigger value="ownership" data-testid="tab-ownership">Ownership</TabsTrigger>
          <TabsTrigger value="retention" data-testid="tab-retention">Retention</TabsTrigger>
          <TabsTrigger value="usage" data-testid="tab-usage">Usage Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search data assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-data"
              />
            </div>
            <Select value={classificationFilter} onValueChange={setClassificationFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-classification-filter">
                <SelectValue placeholder="All Classifications" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classifications</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="confidential">Confidential</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
                <SelectItem value="highly_restricted">Highly Restricted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="glass-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data Asset</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>PII</TableHead>
                    <TableHead>Retention</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => (
                    <TableRow key={asset.id} className="hover-elevate" data-testid={`row-data-${asset.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Database className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium">{asset.name}</p>
                            <p className="text-xs text-muted-foreground">{asset.department}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize ${classificationColors[asset.classification]}`}>
                          {asset.classification.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{asset.owner}</TableCell>
                      <TableCell className="text-sm">{asset.location}</TableCell>
                      <TableCell>
                        {asset.containsPII ? (
                          <Badge className="bg-purple-500/20 text-purple-400">PII</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{asset.retentionPeriod}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" data-testid={`button-view-data-${asset.id}`}>
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

        <TabsContent value="classification" className="space-y-4">
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { level: "Public", color: "green", count: 1, description: "No restrictions" },
              { level: "Internal", color: "blue", count: 1, description: "Employees only" },
              { level: "Confidential", color: "amber", count: 1, description: "Need-to-know basis" },
              { level: "Restricted", color: "orange", count: 1, description: "Highly limited access" },
              { level: "Highly Restricted", color: "red", count: 1, description: "Critical data" },
            ].map((cls, i) => (
              <Card key={i} className="glass-card hover-elevate" data-testid={`classification-${cls.level.toLowerCase().replace(" ", "-")}`}>
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 bg-${cls.color}-500/20`}>
                    <Shield className={`w-6 h-6 text-${cls.color}-400`} />
                  </div>
                  <h4 className="font-semibold">{cls.level}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{cls.description}</p>
                  <Badge variant="outline">{cls.count} assets</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                Classification Policies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Data Classification Standard", status: "active", version: "2.1" },
                { name: "PII Handling Guidelines", status: "active", version: "1.5" },
                { name: "Cross-Border Data Transfer Policy", status: "active", version: "1.3" },
              ].map((policy, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover-elevate">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-medium">{policy.name}</p>
                      <p className="text-xs text-muted-foreground">Version {policy.version}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">{policy.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ownership" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Data Ownership Model
              </CardTitle>
              <CardDescription>Data owners, stewards, and custodians</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-400" />
                    Data Owners
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">Accountable for data quality and security</p>
                  <div className="space-y-2">
                    {["CFO (Finance)", "HR Director (HR)", "CISO (Security)"].map((owner, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded bg-background/50">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-medium">
                          {owner.charAt(0)}
                        </div>
                        <span className="text-sm">{owner}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Key className="w-4 h-4 text-purple-400" />
                    Data Stewards
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">Day-to-day data management</p>
                  <div className="space-y-2">
                    {["Data Team Lead", "HR Data Steward", "Finance Data Steward"].map((steward, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded bg-background/50">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-medium">
                          {steward.charAt(0)}
                        </div>
                        <span className="text-sm">{steward}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Database className="w-4 h-4 text-green-400" />
                    Data Custodians
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">Technical data management</p>
                  <div className="space-y-2">
                    {["Platform Team", "DBA Team", "Cloud Ops"].map((custodian, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded bg-background/50">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-medium">
                          {custodian.charAt(0)}
                        </div>
                        <span className="text-sm">{custodian}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Retention Policies
              </CardTitle>
              <CardDescription>Data lifecycle and retention requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data Category</TableHead>
                    <TableHead>Retention Period</TableHead>
                    <TableHead>Legal Basis</TableHead>
                    <TableHead>Deletion Method</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleRetentionPolicies.map((policy) => (
                    <TableRow key={policy.id} className="hover-elevate" data-testid={`row-retention-${policy.id}`}>
                      <TableCell className="font-medium">{policy.dataCategory}</TableCell>
                      <TableCell>{policy.retentionPeriod}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{policy.legalBasis}</TableCell>
                      <TableCell className="text-sm">{policy.deletionMethod}</TableCell>
                      <TableCell>
                        <Badge className={policy.status === "active" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}>
                          {policy.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="glass-card border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-amber-400" />
                Upcoming Deletions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { dataset: "Q1 2021 Marketing Leads", dueDate: "2024-03-31", records: "45,000" },
                { dataset: "Legacy CRM Export", dueDate: "2024-04-15", records: "12,500" },
                { dataset: "2020 Log Archives", dueDate: "2024-05-01", records: "1.2M" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <p className="font-medium">{item.dataset}</p>
                    <p className="text-xs text-muted-foreground">{item.records} records</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-amber-400">{item.dueDate}</p>
                    <Button size="sm" variant="ghost" className="text-xs" data-testid={`button-review-deletion-${i}`}>Review</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Data Usage Rules
              </CardTitle>
              <CardDescription>Policies governing how data can be used</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  rule: "AI/ML Training Data Usage",
                  description: "PII data cannot be used for AI model training without anonymization",
                  applies: ["Confidential", "Restricted", "Highly Restricted"],
                  status: "enforced",
                },
                {
                  rule: "Cross-Border Transfer",
                  description: "Data transfers outside EU require SCCs or adequacy decision",
                  applies: ["All PII data"],
                  status: "enforced",
                },
                {
                  rule: "Third-Party Sharing",
                  description: "Restricted data cannot be shared with third parties without DPA",
                  applies: ["Restricted", "Highly Restricted"],
                  status: "enforced",
                },
                {
                  rule: "Analytics & Profiling",
                  description: "Customer profiling requires explicit consent",
                  applies: ["Customer PII"],
                  status: "monitored",
                },
              ].map((rule, i) => (
                <div key={i} className="p-4 rounded-lg bg-muted/30 border border-border/50 hover-elevate" data-testid={`usage-rule-${i}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{rule.rule}</h4>
                    <Badge className={rule.status === "enforced" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}>
                      {rule.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    {rule.applies.map((tag, j) => (
                      <Badge key={j} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">AI Data Usage Assistant</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-background/50 mb-3">
                <p className="text-sm font-medium text-amber-400">Question</p>
                <p className="text-sm mt-1">"Can this dataset be used to train an AI model?"</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50">
                <p className="text-sm font-medium text-green-400">AI Assessment</p>
                <p className="text-sm mt-1">Based on classification (Confidential) and PII content, this dataset requires:</p>
                <ul className="text-sm mt-2 space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Anonymization or differential privacy</li>
                  <li>Data owner approval</li>
                  <li>AI governance board review</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
