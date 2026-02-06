import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Layers, Search, BookOpen, CheckCircle2, AlertCircle, Clock,
  FileText, Download, ExternalLink, Filter, Plus
} from "lucide-react";
import type { EsgFramework, EsgFrameworkRequirement } from "@shared/schema";

const FRAMEWORK_CATEGORIES = [
  { id: "reporting", name: "Reporting Standards", color: "#3b82f6" },
  { id: "disclosure", name: "Disclosure Frameworks", color: "#8b5cf6" },
  { id: "rating", name: "Rating Agencies", color: "#f59e0b" },
  { id: "regulatory", name: "Regulatory", color: "#ef4444" },
];

const SAMPLE_FRAMEWORKS = [
  {
    id: 1,
    name: "GRI Standards",
    fullName: "Global Reporting Initiative",
    category: "reporting",
    version: "2021",
    description: "Comprehensive sustainability reporting standards covering economic, environmental, and social topics.",
    status: "active",
    requirements: 120,
    compliant: 85,
  },
  {
    id: 2,
    name: "SASB Standards",
    fullName: "Sustainability Accounting Standards Board",
    category: "reporting",
    version: "2023",
    description: "Industry-specific sustainability disclosure standards for financially material ESG topics.",
    status: "active",
    requirements: 77,
    compliant: 62,
  },
  {
    id: 3,
    name: "TCFD",
    fullName: "Task Force on Climate-related Financial Disclosures",
    category: "disclosure",
    version: "2017",
    description: "Framework for climate-related financial risk disclosures across governance, strategy, risk management, and metrics.",
    status: "active",
    requirements: 11,
    compliant: 9,
  },
  {
    id: 4,
    name: "CDP",
    fullName: "Carbon Disclosure Project",
    category: "disclosure",
    version: "2024",
    description: "Environmental disclosure system for companies, cities, and financial institutions.",
    status: "active",
    requirements: 150,
    compliant: 120,
  },
  {
    id: 5,
    name: "ISSB Standards",
    fullName: "International Sustainability Standards Board",
    category: "regulatory",
    version: "2023",
    description: "Global baseline of sustainability disclosures focused on investor decision-making.",
    status: "active",
    requirements: 45,
    compliant: 30,
  },
  {
    id: 6,
    name: "EU CSRD",
    fullName: "Corporate Sustainability Reporting Directive",
    category: "regulatory",
    version: "2024",
    description: "EU mandatory sustainability reporting requirements with detailed European Sustainability Reporting Standards.",
    status: "pending",
    requirements: 200,
    compliant: 50,
  },
];

export default function ESGFrameworksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: frameworks = [], isLoading } = useQuery<EsgFramework[]>({
    queryKey: ["/api/esg/frameworks"],
  });

  const displayFrameworks = frameworks.length > 0 ? frameworks : SAMPLE_FRAMEWORKS;

  const filteredFrameworks = displayFrameworks.filter((f: any) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.fullName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            ESG Frameworks
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage compliance with global ESG reporting standards and frameworks
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export Matrix
          </Button>
          <Button data-testid="button-add-framework">
            <Plus className="w-4 h-4 mr-2" />
            Add Framework
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {FRAMEWORK_CATEGORIES.map((cat) => {
          const count = displayFrameworks.filter((f: any) => f.category === cat.id).length;
          return (
            <Card 
              key={cat.id} 
              className={`glass-card cursor-pointer transition-all ${selectedCategory === cat.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? "all" : cat.id)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: `${cat.color}20` }}>
                  <Layers className="w-6 h-6" style={{ color: cat.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground">{cat.name}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search frameworks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-frameworks"
          />
        </div>
        {selectedCategory !== "all" && (
          <Button variant="outline" onClick={() => setSelectedCategory("all")}>
            Clear Filter
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {filteredFrameworks.map((framework: any) => {
          const compliancePercentage = framework.requirements > 0 
            ? (framework.compliant / framework.requirements) * 100 
            : 0;
          const categoryColor = FRAMEWORK_CATEGORIES.find(c => c.id === framework.category)?.color || "#6b7280";

          return (
            <Card key={framework.id} className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div 
                      className="p-3 rounded-lg" 
                      style={{ backgroundColor: `${categoryColor}20` }}
                    >
                      <BookOpen className="w-6 h-6" style={{ color: categoryColor }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">{framework.name}</h3>
                        <Badge variant="outline">{framework.version}</Badge>
                        <Badge 
                          variant={framework.status === "active" ? "default" : "secondary"}
                        >
                          {framework.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{framework.fullName}</p>
                      <p className="text-sm text-foreground/80 max-w-2xl">{framework.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getComplianceColor(compliancePercentage)}`}>
                      {compliancePercentage.toFixed(0)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Compliance</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Requirements Progress</span>
                      <span className="font-medium">{framework.compliant} / {framework.requirements}</span>
                    </div>
                    <Progress value={compliancePercentage} className="h-2" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" data-testid={`button-view-${framework.id}`}>
                      <FileText className="w-4 h-4 mr-2" />
                      Requirements
                    </Button>
                    <Button variant="outline" size="sm" data-testid={`button-docs-${framework.id}`}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Documentation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Framework Compliance Matrix</CardTitle>
          <CardDescription>Cross-framework requirement mapping and compliance status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Framework</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Total Requirements</TableHead>
                <TableHead>Compliant</TableHead>
                <TableHead>In Progress</TableHead>
                <TableHead>Gaps</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFrameworks.map((framework: any) => {
                const gaps = framework.requirements - framework.compliant;
                const inProgress = Math.floor(gaps * 0.4);
                const actualGaps = gaps - inProgress;
                const score = (framework.compliant / framework.requirements) * 100;

                return (
                  <TableRow key={framework.id}>
                    <TableCell className="font-medium">{framework.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{framework.category}</Badge>
                    </TableCell>
                    <TableCell>{framework.requirements}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {framework.compliant}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        {inProgress}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        {actualGaps}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getComplianceColor(score)}>
                        {score.toFixed(0)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
