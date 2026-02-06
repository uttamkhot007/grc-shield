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
  Zap, Sun, Wind, Droplet, Flame, Plus, 
  Target, BarChart3, Download, Leaf
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { EsgEnergyData } from "@shared/schema";

const SOURCE_ICONS: Record<string, any> = {
  "solar": Sun,
  "wind": Wind,
  "hydro": Droplet,
  "natural_gas": Flame,
  "grid": Zap,
};

const SOURCE_COLORS: Record<string, string> = {
  "solar": "#f59e0b",
  "wind": "#3b82f6",
  "hydro": "#06b6d4",
  "natural_gas": "#ef4444",
  "grid": "#8b5cf6",
};

const ENERGY_TYPE_COLORS: Record<string, string> = {
  "electricity": "#8b5cf6",
  "natural_gas": "#f97316",
  "fuel": "#ef4444",
  "renewable": "#22c55e",
};

export default function EnergyResourcesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: energyData = [], isLoading } = useQuery<EsgEnergyData[]>({
    queryKey: ["/api/esg/energy-data"],
  });

  const addEnergyMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/esg/energy-data", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/esg/energy-data"] });
      setIsAddDialogOpen(false);
      toast({ title: "Energy consumption record added successfully" });
    },
  });

  const totalConsumption = energyData.reduce((sum, e) => sum + Number(e.consumption || 0), 0);
  const avgRenewable = energyData.length > 0 
    ? energyData.reduce((sum, e) => sum + (e.renewablePercentage || 0), 0) / energyData.length 
    : 0;
  const totalCost = energyData.reduce((sum, e) => sum + Number(e.cost || 0), 0);

  const typeBreakdown = energyData.reduce((acc, e) => {
    const type = e.energyType || "other";
    acc[type] = (acc[type] || 0) + Number(e.consumption || 0);
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(typeBreakdown).map(([name, value]) => ({
    name: name.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()),
    value,
    color: ENERGY_TYPE_COLORS[name] || "#94a3b8",
  }));

  const EmptyState = () => (
    <Card className="glass-card">
      <CardContent className="p-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-yellow-500/20 mb-4">
          <Zap className="w-12 h-12 text-yellow-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Energy Data</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          Track your organization's energy consumption, renewable sources, and resource efficiency 
          to support your sustainability goals.
        </p>
        <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-energy">
          <Plus className="w-4 h-4 mr-2" />
          Add Energy Record
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Energy & Resources
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor energy consumption, renewable adoption, and resource efficiency
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-energy">
                <Plus className="w-4 h-4 mr-2" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Energy Consumption Record</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addEnergyMutation.mutate({
                    energyType: formData.get("energyType"),
                    source: formData.get("source"),
                    consumption: parseInt(formData.get("consumption") as string),
                    unit: "MWh",
                    cost: parseInt(formData.get("cost") as string) || null,
                    renewablePercentage: parseInt(formData.get("renewablePercentage") as string) || 0,
                    reportingPeriod: formData.get("reportingPeriod"),
                  });
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Energy Type</Label>
                    <Select name="energyType" defaultValue="electricity">
                      <SelectTrigger data-testid="select-energy-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electricity">Electricity</SelectItem>
                        <SelectItem value="natural_gas">Natural Gas</SelectItem>
                        <SelectItem value="fuel">Fuel</SelectItem>
                        <SelectItem value="renewable">Renewable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Source</Label>
                    <Select name="source" defaultValue="grid">
                      <SelectTrigger data-testid="select-source">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grid</SelectItem>
                        <SelectItem value="solar">Solar</SelectItem>
                        <SelectItem value="wind">Wind</SelectItem>
                        <SelectItem value="hydro">Hydroelectric</SelectItem>
                        <SelectItem value="natural_gas">Natural Gas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Consumption (MWh)</Label>
                    <Input name="consumption" type="number" placeholder="0" required data-testid="input-consumption" />
                  </div>
                  <div className="space-y-2">
                    <Label>Cost (USD)</Label>
                    <Input name="cost" type="number" placeholder="0" data-testid="input-cost" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Renewable %</Label>
                    <Input name="renewablePercentage" type="number" min="0" max="100" placeholder="0" data-testid="input-renewable" />
                  </div>
                  <div className="space-y-2">
                    <Label>Reporting Period</Label>
                    <Input name="reportingPeriod" placeholder="e.g., Q1-2024" required data-testid="input-period" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addEnergyMutation.isPending} data-testid="button-submit-energy">
                    {addEnergyMutation.isPending ? "Adding..." : "Add Record"}
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
            Loading energy data...
          </CardContent>
        </Card>
      ) : energyData.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
                  <Zap className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalConsumption.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total MWh</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <Leaf className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgRenewable.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Avg Renewable</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <Sun className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Object.keys(typeBreakdown).length}</p>
                  <p className="text-sm text-muted-foreground">Energy Types</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${totalCost.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Energy Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Consumption</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Renewable %</TableHead>
                      <TableHead>Period</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {energyData.map((record) => {
                      const SourceIcon = SOURCE_ICONS[record.source || "grid"] || Zap;
                      return (
                        <TableRow key={record.id}>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {(record.energyType || "electricity").replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <SourceIcon className="w-4 h-4" style={{ color: SOURCE_COLORS[record.source || "grid"] }} />
                              <span className="capitalize">{(record.source || "grid").replace("_", " ")}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono">{Number(record.consumption || 0).toLocaleString()}</span>
                            <span className="text-muted-foreground ml-1">{record.unit}</span>
                          </TableCell>
                          <TableCell>
                            {record.cost ? `$${Number(record.cost).toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={record.renewablePercentage && record.renewablePercentage > 50 ? "default" : "secondary"}>
                              {record.renewablePercentage || 0}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {record.reportingPeriod}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Energy Mix</CardTitle>
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
                          <span className="text-sm font-medium">{item.value.toLocaleString()} MWh</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No energy data to display
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
