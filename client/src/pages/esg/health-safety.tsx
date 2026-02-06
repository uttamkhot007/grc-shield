import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  HeartPulse, Shield, AlertTriangle, Users, Plus, 
  Target, BarChart3, Download, CheckCircle2, Activity
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { EsgHealthSafetyData } from "@shared/schema";

export default function HealthSafetyPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: safetyData = [], isLoading } = useQuery<EsgHealthSafetyData[]>({
    queryKey: ["/api/esg/health-safety-data"],
  });

  const addSafetyMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/esg/health-safety-data", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/esg/health-safety-data"] });
      setIsAddDialogOpen(false);
      toast({ title: "Health & safety data added successfully" });
    },
  });

  const incidentData = safetyData.filter(d => d.metricType === "incidents");
  const injuryData = safetyData.filter(d => d.metricType === "injuries");
  const trainingData = safetyData.filter(d => d.metricType === "training_hours");
  
  const totalIncidents = incidentData.reduce((sum, d) => sum + (d.value || 0), 0);
  const totalInjuries = injuryData.reduce((sum, d) => sum + (d.value || 0), 0);
  const totalTrainingHours = trainingData.reduce((sum, d) => sum + (d.value || 0), 0);

  const metricTypeBreakdown = safetyData.reduce((acc, d) => {
    const type = d.metricType || "other";
    if (!acc[type]) acc[type] = 0;
    acc[type] += d.value || 0;
    return acc;
  }, {} as Record<string, number>);

  const EmptyState = () => (
    <Card className="glass-card">
      <CardContent className="p-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-red-500/20 mb-4">
          <HeartPulse className="w-12 h-12 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Health & Safety Data</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          Track workplace safety metrics including incidents, injuries, near misses, 
          and safety training hours.
        </p>
        <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-safety">
          <Plus className="w-4 h-4 mr-2" />
          Add Safety Data
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            Health & Safety
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor workplace safety, incident rates, and employee wellbeing
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-safety">
                <Plus className="w-4 h-4 mr-2" />
                Add Data
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Health & Safety Data</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addSafetyMutation.mutate({
                    metricType: formData.get("metricType"),
                    category: formData.get("category"),
                    value: parseInt(formData.get("value") as string),
                    unit: formData.get("unit") || null,
                    workforceType: formData.get("workforceType"),
                    reportingPeriod: formData.get("reportingPeriod"),
                  });
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Metric Type</Label>
                    <Select name="metricType" defaultValue="incidents">
                      <SelectTrigger data-testid="select-metric-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="incidents">Incidents</SelectItem>
                        <SelectItem value="injuries">Injuries</SelectItem>
                        <SelectItem value="fatalities">Fatalities</SelectItem>
                        <SelectItem value="near_misses">Near Misses</SelectItem>
                        <SelectItem value="training_hours">Training Hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select name="category" defaultValue="ltir">
                      <SelectTrigger data-testid="select-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ltir">LTIR</SelectItem>
                        <SelectItem value="trir">TRIR</SelectItem>
                        <SelectItem value="fatality_rate">Fatality Rate</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input name="value" type="number" placeholder="0" required data-testid="input-value" />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit (optional)</Label>
                    <Input name="unit" placeholder="e.g., per 100 employees" data-testid="input-unit" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Workforce Type</Label>
                    <Select name="workforceType" defaultValue="all">
                      <SelectTrigger data-testid="select-workforce">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="employees">Employees</SelectItem>
                        <SelectItem value="contractors">Contractors</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Reporting Period</Label>
                    <Input name="reportingPeriod" placeholder="e.g., Q1-2024" required data-testid="input-period" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={addSafetyMutation.isPending} data-testid="button-submit-safety">
                    {addSafetyMutation.isPending ? "Adding..." : "Add Data"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center text-muted-foreground">Loading health & safety data...</CardContent>
        </Card>
      ) : safetyData.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-500/20">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalIncidents}</p>
                  <p className="text-sm text-muted-foreground">Total Incidents</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-orange-500/20">
                  <Activity className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalInjuries}</p>
                  <p className="text-sm text-muted-foreground">Total Injuries</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/20">
                  <Shield className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Object.keys(metricTypeBreakdown).length}</p>
                  <p className="text-sm text-muted-foreground">Metrics Tracked</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalTrainingHours.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Training Hours</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Safety Records</CardTitle>
              <CardDescription>Health and safety metrics by type and period</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Workforce</TableHead>
                    <TableHead>Period</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safetyData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <Badge 
                          variant={record.metricType === "fatalities" ? "destructive" : "outline"}
                          className="capitalize"
                        >
                          {(record.metricType || '').replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{(record.category || '').replace('_', ' ')}</TableCell>
                      <TableCell>
                        <span className="font-mono">{(record.value || 0).toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{record.unit || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">{record.workforceType || "All"}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {record.reportingPeriod}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
