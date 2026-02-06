import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Leaf, Factory, Truck, Building, Plus, TrendingDown,
  Target, BarChart3, Calendar, Download, Zap
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { EsgCarbonEmissions } from "@shared/schema";

const SCOPE_COLORS = {
  "scope1": "#ef4444",
  "scope2": "#f97316",
  "scope3": "#eab308"
};

export default function CarbonEmissionsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const { toast } = useToast();

  const { data: emissions = [], isLoading } = useQuery<EsgCarbonEmissions[]>({
    queryKey: ["/api/esg/carbon-emissions"],
  });

  const addEmissionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/esg/carbon-emissions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/esg/carbon-emissions"] });
      setIsAddDialogOpen(false);
      toast({ title: "Carbon emission record added successfully" });
    },
  });

  const totalEmissions = emissions.reduce((sum, e) => sum + Number(e.emissionsAmount || 0), 0);
  const scope1Total = emissions.filter(e => e.scope === "scope1").reduce((sum, e) => sum + Number(e.emissionsAmount || 0), 0);
  const scope2Total = emissions.filter(e => e.scope === "scope2").reduce((sum, e) => sum + Number(e.emissionsAmount || 0), 0);
  const scope3Total = emissions.filter(e => e.scope === "scope3").reduce((sum, e) => sum + Number(e.emissionsAmount || 0), 0);

  const pieData = [
    { name: "Scope 1", value: scope1Total, color: SCOPE_COLORS["scope1"] },
    { name: "Scope 2", value: scope2Total, color: SCOPE_COLORS["scope2"] },
    { name: "Scope 3", value: scope3Total, color: SCOPE_COLORS["scope3"] },
  ].filter(d => d.value > 0);

  const EmptyState = () => (
    <Card className="glass-card">
      <CardContent className="p-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-green-500/20 mb-4">
          <Leaf className="w-12 h-12 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Carbon Emissions Data</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          Start tracking your organization's carbon footprint across Scope 1 (direct), 
          Scope 2 (energy), and Scope 3 (value chain) emissions.
        </p>
        <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-emission">
          <Plus className="w-4 h-4 mr-2" />
          Add First Emission Record
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Carbon & Emissions
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage greenhouse gas emissions across all scopes
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32" data-testid="select-year">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-emission">
                <Plus className="w-4 h-4 mr-2" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Carbon Emission Record</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addEmissionMutation.mutate({
                    scope: formData.get("scope"),
                    category: formData.get("category"),
                    source: formData.get("source"),
                    emissionsAmount: parseInt(formData.get("emissionsAmount") as string),
                    unit: "tCO2e",
                    reportingPeriod: formData.get("reportingPeriod"),
                    methodology: formData.get("methodology"),
                  });
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Scope</Label>
                    <Select name="scope" defaultValue="scope1">
                      <SelectTrigger data-testid="select-scope">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scope1">Scope 1 - Direct</SelectItem>
                        <SelectItem value="scope2">Scope 2 - Energy</SelectItem>
                        <SelectItem value="scope3">Scope 3 - Value Chain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Reporting Period</Label>
                    <Input name="reportingPeriod" placeholder="e.g., FY2024, Q1-2024" required data-testid="input-period" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input name="category" placeholder="e.g., Stationary Combustion" data-testid="input-category" />
                  </div>
                  <div className="space-y-2">
                    <Label>Emission Source</Label>
                    <Input name="source" placeholder="e.g., Natural gas boilers" data-testid="input-source" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Emissions (tCO2e)</Label>
                    <Input name="emissionsAmount" type="number" placeholder="0" required data-testid="input-emissions" />
                  </div>
                  <div className="space-y-2">
                    <Label>Methodology</Label>
                    <Select name="methodology" defaultValue="ghg_protocol">
                      <SelectTrigger data-testid="select-methodology">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ghg_protocol">GHG Protocol</SelectItem>
                        <SelectItem value="iso_14064">ISO 14064</SelectItem>
                        <SelectItem value="epa_method">EPA Method</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addEmissionMutation.isPending} data-testid="button-submit-emission">
                    {addEmissionMutation.isPending ? "Adding..." : "Add Record"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center text-muted-foreground">
            Loading carbon emissions data...
          </CardContent>
        </Card>
      ) : emissions.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                  <Leaf className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalEmissions.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total tCO2e</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-500/20">
                  <Factory className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{scope1Total.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Scope 1 (Direct)</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-orange-500/20">
                  <Zap className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{scope2Total.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Scope 2 (Energy)</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/20">
                  <Truck className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{scope3Total.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Scope 3 (Value Chain)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Emissions by Scope
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Scope</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Emissions</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emissions.map((emission) => (
                      <TableRow key={emission.id}>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className="font-mono capitalize"
                            style={{ borderColor: SCOPE_COLORS[emission.scope as keyof typeof SCOPE_COLORS] }}
                          >
                            {emission.scope.replace("scope", "Scope ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{emission.category || '-'}</TableCell>
                        <TableCell>{emission.source || '-'}</TableCell>
                        <TableCell>
                          <span className="font-mono">{Number(emission.emissionsAmount || 0).toLocaleString()}</span>
                          <span className="text-muted-foreground ml-1">tCO2e</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {emission.reportingPeriod}
                        </TableCell>
                        <TableCell>
                          <Badge variant={emission.verificationStatus === "third-party" ? "default" : "outline"}>
                            {emission.verificationStatus || "Unverified"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Emissions Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-4">
                      {pieData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <span className="text-sm font-medium">{((item.value / totalEmissions) * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No emissions data to display
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
