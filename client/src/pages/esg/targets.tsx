import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Target, Plus, Download, TrendingUp, Calendar, Flag, CheckCircle2
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { EsgTarget } from "@shared/schema";

export default function TargetsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: targets = [], isLoading } = useQuery<EsgTarget[]>({
    queryKey: ["/api/esg/targets"],
  });

  const addTargetMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/esg/targets", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/esg/targets"] });
      setIsAddDialogOpen(false);
      toast({ title: "Target added successfully" });
    },
  });

  const activeTargets = targets.filter(t => t.status === "active");
  const achievedTargets = targets.filter(t => t.status === "achieved");
  const avgProgress = targets.length > 0 
    ? targets.reduce((sum, t) => sum + (t.progressPercentage || 0), 0) / targets.length 
    : 0;

  const EmptyState = () => (
    <Card className="glass-card">
      <CardContent className="p-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-green-500/20 mb-4">
          <Target className="w-12 h-12 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No ESG Targets Set</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          Set measurable ESG targets like net-zero emissions, diversity goals, 
          or governance improvements to track progress.
        </p>
        <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-target">
          <Plus className="w-4 h-4 mr-2" />
          Set Target
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-500 bg-clip-text text-transparent">
            ESG Targets & Goals
          </h1>
          <p className="text-muted-foreground mt-1">
            Set and track progress towards sustainability targets
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-target">
                <Plus className="w-4 h-4 mr-2" />
                Set Target
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Set ESG Target</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addTargetMutation.mutate({
                    name: formData.get("name"),
                    description: formData.get("description"),
                    category: formData.get("category"),
                    targetValue: parseInt(formData.get("targetValue") as string),
                    unit: formData.get("unit"),
                    baselineValue: parseInt(formData.get("baselineValue") as string) || null,
                    baselineYear: formData.get("baselineYear"),
                    targetYear: formData.get("targetYear"),
                    status: "active",
                    progressPercentage: 0,
                  });
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Target Name</Label>
                  <Input name="name" placeholder="e.g., Net Zero Emissions by 2030" required data-testid="input-name" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea name="description" placeholder="Detailed description of the target" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select name="category" defaultValue="environmental">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="environmental">Environmental</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="governance">Governance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Year</Label>
                    <Input name="targetYear" placeholder="e.g., 2030" required data-testid="input-target-year" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Baseline Value</Label>
                    <Input name="baselineValue" type="number" placeholder="0" data-testid="input-baseline" />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Value</Label>
                    <Input name="targetValue" type="number" required data-testid="input-target-value" />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input name="unit" placeholder="e.g., %, tCO2e" required data-testid="input-unit" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Baseline Year</Label>
                  <Input name="baselineYear" placeholder="e.g., 2020" data-testid="input-baseline-year" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={addTargetMutation.isPending}>
                    {addTargetMutation.isPending ? "Adding..." : "Set Target"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center text-muted-foreground">Loading targets...</CardContent>
        </Card>
      ) : targets.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <Target className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{targets.length}</p>
                  <p className="text-sm text-muted-foreground">Total Targets</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <Flag className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeTargets.length}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/20">
                  <CheckCircle2 className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{achievedTargets.length}</p>
                  <p className="text-sm text-muted-foreground">Achieved</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgProgress.toFixed(0)}%</p>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4">
            {targets.map((target) => (
              <Card key={target.id} className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">{target.name}</h3>
                        <Badge variant="outline" className="capitalize">{target.category}</Badge>
                        <Badge variant={target.status === "achieved" ? "default" : target.status === "active" ? "secondary" : "outline"} className="capitalize">
                          {target.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{target.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{target.progressPercentage || 0}%</p>
                      <p className="text-sm text-muted-foreground">Progress</p>
                    </div>
                  </div>
                  <Progress value={target.progressPercentage || 0} className="h-3 mb-4" />
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Baseline:</span>{" "}
                      <span className="font-medium">{target.baselineValue || 0} {target.unit}</span>
                      {target.baselineYear && <span className="text-muted-foreground"> ({target.baselineYear})</span>}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target:</span>{" "}
                      <span className="font-medium">{target.targetValue} {target.unit}</span>
                      <span className="text-muted-foreground"> ({target.targetYear})</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
