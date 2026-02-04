import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Shield,
  ChevronDown,
  ChevronRight,
  FileCheck,
  Download,
  Eye,
  Plus,
  Building2,
  Lock,
  Globe,
  Scale,
  Factory,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { useTenant } from "@/contexts/tenant-context";
import type { Framework, Control } from "@shared/schema";
import { Link } from "wouter";

const categoryIcons = {
  security: Shield,
  privacy: Lock,
  governance: Building2,
  regional: Globe,
  industry: Factory,
};

const categoryColors = {
  security: "bg-chart-1/20 text-chart-1",
  privacy: "bg-chart-4/20 text-chart-4",
  governance: "bg-chart-2/20 text-chart-2",
  regional: "bg-chart-3/20 text-chart-3",
  industry: "bg-primary/20 text-primary",
};

function FrameworkSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="card-3d">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-2 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ControlChecklist({ controls, frameworkName }: { controls: Control[]; frameworkName: string }) {
  return (
    <div className="space-y-2 pt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Control ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {controls.map((control) => (
            <TableRow key={control.id} data-testid={`checklist-control-${control.id}`}>
              <TableCell className="font-mono text-xs">{control.controlId}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-sm">{control.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{control.description}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {control.category}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Circle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Pending</span>
                </div>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function AuditChecklistsPage() {
  const { currentTenantId } = useTenant();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [expandedFrameworks, setExpandedFrameworks] = useState<string[]>([]);

  const { data: frameworks = [], isLoading: frameworksLoading } = useQuery<Framework[]>({
    queryKey: ["/api/frameworks", currentTenantId || "all"],
  });

  const { data: controls = [], isLoading: controlsLoading } = useQuery<Control[]>({
    queryKey: ["/api/controls"],
  });

  const isLoading = frameworksLoading || controlsLoading;

  const filteredFrameworks = frameworks.filter((framework) => {
    const matchesSearch = framework.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      framework.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || framework.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getControlsForFramework = (frameworkId: string) => {
    return controls.filter((control) => control.frameworkId === frameworkId);
  };

  const getControlStats = (frameworkId: string) => {
    const frameworkControls = getControlsForFramework(frameworkId);
    return {
      total: frameworkControls.length,
      completed: 0,
      pending: frameworkControls.length,
    };
  };

  const totalControls = controls.length;
  const totalFrameworks = frameworks.length;
  const categoryCounts = frameworks.reduce((acc, f) => {
    const category = f.category || "governance";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const toggleFramework = (frameworkId: string) => {
    setExpandedFrameworks((prev) =>
      prev.includes(frameworkId)
        ? prev.filter((id) => id !== frameworkId)
        : [...prev, frameworkId]
    );
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="mesh-gradient min-h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold" data-testid="page-title">Audit Checklists</h1>
              <p className="text-muted-foreground mt-1">
                Framework-based compliance checklists for audit execution
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/audits">
                <Button variant="outline">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  View Audits
                </Button>
              </Link>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Checklist
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="stat-gradient-blue">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-1/20">
                    <ClipboardList className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{isLoading ? "-" : totalFrameworks}</p>
                    <p className="text-xs text-muted-foreground">Frameworks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-gradient-green">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-2/20">
                    <CheckCircle2 className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{isLoading ? "-" : totalControls}</p>
                    <p className="text-xs text-muted-foreground">Total Controls</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-gradient-amber">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-3/20">
                    <Shield className="h-5 w-5 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{isLoading ? "-" : categoryCounts.security || 0}</p>
                    <p className="text-xs text-muted-foreground">Security Frameworks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-gradient-purple">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-4/20">
                    <Lock className="h-5 w-5 text-chart-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{isLoading ? "-" : categoryCounts.privacy || 0}</p>
                    <p className="text-xs text-muted-foreground">Privacy Frameworks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="card-3d">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-base">Compliance Checklists by Framework</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search frameworks..."
                      className="pl-9 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="input-search-checklists"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40" data-testid="select-category-filter">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="privacy">Privacy</SelectItem>
                      <SelectItem value="governance">Governance</SelectItem>
                      <SelectItem value="regional">Regional</SelectItem>
                      <SelectItem value="industry">Industry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <FrameworkSkeleton />
              ) : filteredFrameworks.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No checklists found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery || categoryFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "No frameworks available for checklists"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFrameworks.map((framework) => {
                    const stats = getControlStats(framework.id);
                    const frameworkControls = getControlsForFramework(framework.id);
                    const isExpanded = expandedFrameworks.includes(framework.id);
                    const CategoryIcon = categoryIcons[framework.category as keyof typeof categoryIcons] || Shield;
                    const categoryColor = categoryColors[framework.category as keyof typeof categoryColors] || categoryColors.security;

                    return (
                      <Card
                        key={framework.id}
                        className="card-3d overflow-visible"
                        data-testid={`framework-checklist-${framework.id}`}
                      >
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() => toggleFramework(framework.id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${categoryColor.split(" ")[0]}`}>
                              <CategoryIcon className={`h-5 w-5 ${categoryColor.split(" ")[1]}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{framework.name}</h3>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {framework.category}
                                </Badge>
                                {framework.version && (
                                  <Badge variant="secondary" className="text-xs">
                                    v{framework.version}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {framework.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-lg font-bold">{stats.total}</p>
                                <p className="text-xs text-muted-foreground">Controls</p>
                              </div>
                              <div className="w-32 hidden md:block">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-medium">
                                    {stats.total > 0
                                      ? Math.round((stats.completed / stats.total) * 100)
                                      : 0}%
                                  </span>
                                </div>
                                <Progress
                                  value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}
                                  className="h-2"
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFramework(framework.id);
                                }}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-5 w-5" />
                                ) : (
                                  <ChevronRight className="h-5 w-5" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                        {isExpanded && frameworkControls.length > 0 && (
                          <div className="border-t border-border px-4 pb-4">
                            <ControlChecklist
                              controls={frameworkControls}
                              frameworkName={framework.name}
                            />
                          </div>
                        )}
                        {isExpanded && frameworkControls.length === 0 && (
                          <div className="border-t border-border p-6 text-center">
                            <p className="text-sm text-muted-foreground">
                              No controls defined for this framework yet
                            </p>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="text-base">Checklist Categories</CardTitle>
              <CardDescription>Quick access to checklists by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {Object.entries(categoryIcons).map(([category, Icon]) => {
                  const count = categoryCounts[category] || 0;
                  const color = categoryColors[category as keyof typeof categoryColors];
                  return (
                    <Button
                      key={category}
                      variant="outline"
                      className="h-auto p-4 flex-col items-start gap-2"
                      onClick={() => setCategoryFilter(category)}
                      data-testid={`category-button-${category}`}
                    >
                      <div className={`p-2 rounded-lg ${color.split(" ")[0]}`}>
                        <Icon className={`h-5 w-5 ${color.split(" ")[1]}`} />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold capitalize">{category}</p>
                        <p className="text-xs text-muted-foreground">{count} frameworks</p>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
