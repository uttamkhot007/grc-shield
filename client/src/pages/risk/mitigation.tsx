import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Search,
  Shield,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight,
  Edit,
  Calendar,
  User,
  FileText,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { fetchRisks, updateRisk } from "@/lib/api";
import { useTenant } from "@/contexts/tenant-context";
import type { Risk } from "@shared/schema";
import { Link } from "wouter";

const riskLevelStyles = {
  critical: { bg: "bg-destructive", text: "text-white" },
  high: { bg: "bg-chart-3", text: "text-white" },
  medium: { bg: "bg-chart-1", text: "text-white" },
  low: { bg: "bg-chart-2", text: "text-white" },
};

const treatmentOptions = [
  { value: "mitigate", label: "Mitigate", description: "Reduce the likelihood or impact" },
  { value: "accept", label: "Accept", description: "Acknowledge and monitor the risk" },
  { value: "transfer", label: "Transfer", description: "Transfer to third party (insurance)" },
  { value: "avoid", label: "Avoid", description: "Eliminate the risk source" },
];

function getRiskLevel(likelihood: number, impact: number): string {
  const score = likelihood * impact;
  if (score >= 16) return "critical";
  if (score >= 9) return "high";
  if (score >= 4) return "medium";
  return "low";
}

const mitigationFormSchema = z.object({
  mitigationPlan: z.string().min(10, "Mitigation plan must be at least 10 characters"),
  status: z.string(),
});

type MitigationFormValues = z.infer<typeof mitigationFormSchema>;

function MitigationCard({ risk, onEdit }: { risk: Risk; onEdit: (risk: Risk) => void }) {
  const likelihood = risk.likelihood || 3;
  const impact = risk.impact || 3;
  const riskLevel = getRiskLevel(likelihood, impact);
  const riskScore = likelihood * impact;
  const style = riskLevelStyles[riskLevel as keyof typeof riskLevelStyles];

  const getStatusProgress = () => {
    switch (risk.status) {
      case "completed": return 100;
      case "in_progress": return 60;
      case "pending": return 30;
      case "active": return 10;
      default: return 0;
    }
  };

  const getStatusLabel = () => {
    switch (risk.status) {
      case "completed": return "Mitigated";
      case "in_progress": return "In Progress";
      case "pending": return "Pending Review";
      case "active": return "Requires Action";
      default: return risk.status || "Unknown";
    }
  };

  return (
    <Card className="card-3d" data-testid={`mitigation-risk-${risk.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`${style.bg} ${style.text} border-0 capitalize text-xs`}>
                {riskLevel}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Score: {riskScore}
              </Badge>
            </div>
            <h4 className="font-semibold text-sm">{risk.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">{risk.category}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Treatment Progress</span>
            <span className="font-medium">{getStatusProgress()}%</span>
          </div>
          <Progress value={getStatusProgress()} className="h-2" />
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">{getStatusLabel()}</span>
          </div>
        </div>

        {risk.mitigationPlan ? (
          <div className="p-3 bg-muted/50 rounded-lg mb-3">
            <p className="text-xs font-medium mb-1">Mitigation Plan</p>
            <p className="text-xs text-muted-foreground line-clamp-3">{risk.mitigationPlan}</p>
          </div>
        ) : (
          <div className="p-3 bg-chart-3/10 rounded-lg mb-3 border border-chart-3/30">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-chart-3" />
              <p className="text-xs text-chart-3">No mitigation plan defined</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {risk.identifiedAt ? new Date(risk.identifiedAt).toLocaleDateString() : "N/A"}
          </div>
          <Button variant="outline" size="sm" onClick={() => onEdit(risk)}>
            <Edit className="h-3 w-3 mr-1" />
            Update Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MitigationPlansPage() {
  const { currentTenantId } = useTenant();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);

  const { data: risks = [], isLoading } = useQuery({
    queryKey: ["/api/risks", currentTenantId || "all"],
    queryFn: () => fetchRisks(currentTenantId || undefined),
  });

  const form = useForm<MitigationFormValues>({
    resolver: zodResolver(mitigationFormSchema),
    defaultValues: {
      mitigationPlan: "",
      status: "in_progress",
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Risk> }) => updateRisk(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risks"] });
      setIsEditDialogOpen(false);
      setSelectedRisk(null);
      toast({ title: "Mitigation plan updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update mitigation plan", variant: "destructive" });
    },
  });

  const handleEdit = (data: MitigationFormValues) => {
    if (!selectedRisk) return;
    updateMutation.mutate({
      id: selectedRisk.id,
      data: {
        mitigationPlan: data.mitigationPlan,
        status: data.status as any,
      },
    });
  };

  const openEditDialog = (risk: Risk) => {
    setSelectedRisk(risk);
    form.reset({
      mitigationPlan: risk.mitigationPlan || "",
      status: risk.status || "active",
    });
    setIsEditDialogOpen(true);
  };

  const filteredRisks = risks.filter((risk) => {
    const matchesSearch = risk.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || risk.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const requiresAction = risks.filter(r => r.status === "active" && !r.mitigationPlan).length;
  const inProgress = risks.filter(r => r.status === "in_progress").length;
  const completed = risks.filter(r => r.status === "completed").length;
  const hasPlan = risks.filter(r => r.mitigationPlan).length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="mesh-gradient min-h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Mitigation Plans</h1>
              <p className="text-muted-foreground mt-1">
                Develop and track risk treatment strategies across your organization
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/risk/register">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Risk Register
                </Button>
              </Link>
              <Link href="/risk/assessment">
                <Button>
                  <Target className="h-4 w-4 mr-2" />
                  Assessment
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="stat-gradient-red">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/20">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{isLoading ? "-" : requiresAction}</p>
                    <p className="text-xs text-muted-foreground">Requires Action</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-gradient-amber">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-3/20">
                    <Clock className="h-5 w-5 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{isLoading ? "-" : inProgress}</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
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
                    <p className="text-2xl font-bold">{isLoading ? "-" : completed}</p>
                    <p className="text-xs text-muted-foreground">Mitigated</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-gradient-blue">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-1/20">
                    <TrendingDown className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{isLoading ? "-" : hasPlan}</p>
                    <p className="text-xs text-muted-foreground">Have Plans</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="text-base">Risk Treatment Options</CardTitle>
              <CardDescription>Available strategies for addressing identified risks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {treatmentOptions.map((option) => (
                  <div
                    key={option.value}
                    className="p-4 bg-muted/50 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-sm">{option.label}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="card-3d">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-base">Risk Mitigation Tracking</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search risks..."
                      className="pl-9 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="input-search-mitigation"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40" data-testid="select-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="card-3d">
                      <CardContent className="p-4 space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="h-16" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredRisks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRisks.map((risk) => (
                    <MitigationCard key={risk.id} risk={risk} onEdit={openEditDialog} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No risks found matching your criteria</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Update Mitigation Plan</DialogTitle>
                <DialogDescription>
                  {selectedRisk?.title}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleEdit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="mitigationPlan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mitigation Plan</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={5}
                            placeholder="Describe the mitigation strategy, action items, and expected outcomes..."
                            data-testid="input-mitigation-plan"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-mitigation-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active (Requires Action)</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="pending">Pending Review</SelectItem>
                            <SelectItem value="completed">Completed (Mitigated)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
