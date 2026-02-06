import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Droplet, Recycle, Trash2, Plus, Download, Leaf, AlertCircle
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { EsgWaterData, EsgWasteData } from "@shared/schema";

const WATER_COLORS = {
  "withdrawal": "#3b82f6",
  "consumption": "#06b6d4",
  "discharge": "#22c55e",
  "recycled": "#8b5cf6",
};

const WASTE_COLORS = {
  "recycled": "#22c55e",
  "composted": "#84cc16",
  "landfill": "#ef4444",
  "incinerated": "#f97316",
};

export default function WaterWastePage() {
  const [activeTab, setActiveTab] = useState("water");
  const [isAddWaterOpen, setIsAddWaterOpen] = useState(false);
  const [isAddWasteOpen, setIsAddWasteOpen] = useState(false);
  const { toast } = useToast();

  const { data: waterData = [], isLoading: waterLoading } = useQuery<EsgWaterData[]>({
    queryKey: ["/api/esg/water-data"],
  });

  const { data: wasteData = [], isLoading: wasteLoading } = useQuery<EsgWasteData[]>({
    queryKey: ["/api/esg/waste-data"],
  });

  const addWaterMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/esg/water-data", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/esg/water-data"] });
      setIsAddWaterOpen(false);
      toast({ title: "Water data added successfully" });
    },
  });

  const addWasteMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/esg/waste-data", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/esg/waste-data"] });
      setIsAddWasteOpen(false);
      toast({ title: "Waste data added successfully" });
    },
  });

  const totalWater = waterData.reduce((sum, w) => sum + Number(w.volume || 0), 0);
  const recycledWater = waterData.filter(w => w.waterType === "recycled").reduce((sum, w) => sum + Number(w.volume || 0), 0);
  const waterRecyclingRate = totalWater > 0 ? (recycledWater / totalWater) * 100 : 0;

  const totalWaste = wasteData.reduce((sum, w) => sum + Number(w.weight || 0), 0);
  const recycledWaste = wasteData.filter(w => w.disposalMethod === "recycled").reduce((sum, w) => sum + Number(w.weight || 0), 0);
  const wasteDiversionRate = totalWaste > 0 ? (recycledWaste / totalWaste) * 100 : 0;

  const waterPieData = Object.entries(
    waterData.reduce((acc, w) => {
      acc[w.waterType || "other"] = (acc[w.waterType || "other"] || 0) + Number(w.volume || 0);
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: WATER_COLORS[name as keyof typeof WATER_COLORS] || "#94a3b8",
  }));

  const wastePieData = Object.entries(
    wasteData.reduce((acc, w) => {
      acc[w.disposalMethod || "other"] = (acc[w.disposalMethod || "other"] || 0) + Number(w.weight || 0);
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: WASTE_COLORS[name as keyof typeof WASTE_COLORS] || "#94a3b8",
  }));

  const EmptyWaterState = () => (
    <Card className="glass-card">
      <CardContent className="p-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-blue-500/20 mb-4">
          <Droplet className="w-12 h-12 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Water Data</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          Track water withdrawal, consumption, discharge, and recycling to manage water stewardship.
        </p>
        <Button onClick={() => setIsAddWaterOpen(true)} data-testid="button-add-first-water">
          <Plus className="w-4 h-4 mr-2" />
          Add Water Data
        </Button>
      </CardContent>
    </Card>
  );

  const EmptyWasteState = () => (
    <Card className="glass-card">
      <CardContent className="p-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-green-500/20 mb-4">
          <Recycle className="w-12 h-12 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Waste Data</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          Track waste generation, recycling rates, and disposal methods to achieve zero waste goals.
        </p>
        <Button onClick={() => setIsAddWasteOpen(true)} data-testid="button-add-first-waste">
          <Plus className="w-4 h-4 mr-2" />
          Add Waste Data
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent">
            Water & Waste Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Track water usage, waste generation, and circular economy initiatives
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Droplet className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalWater.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Water (m³)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-cyan-500/20">
              <Recycle className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{waterRecyclingRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Water Recycling</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-500/20">
              <Trash2 className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalWaste.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Waste (tons)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/20">
              <Leaf className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{wasteDiversionRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Waste Diversion</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass-card">
          <TabsTrigger value="water" data-testid="tab-water">
            <Droplet className="w-4 h-4 mr-2" />
            Water Management
          </TabsTrigger>
          <TabsTrigger value="waste" data-testid="tab-waste">
            <Recycle className="w-4 h-4 mr-2" />
            Waste Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="water" className="space-y-6 mt-6">
          <div className="flex justify-end">
            <Dialog open={isAddWaterOpen} onOpenChange={setIsAddWaterOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-water">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Water Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Water Data</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    addWaterMutation.mutate({
                      waterType: formData.get("waterType"),
                      source: formData.get("source"),
                      volume: parseInt(formData.get("volume") as string),
                      unit: "cubic_meters",
                      location: formData.get("location"),
                      reportingPeriod: formData.get("reportingPeriod"),
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Water Type</Label>
                      <Select name="waterType" defaultValue="withdrawal">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="withdrawal">Withdrawal</SelectItem>
                          <SelectItem value="consumption">Consumption</SelectItem>
                          <SelectItem value="discharge">Discharge</SelectItem>
                          <SelectItem value="recycled">Recycled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Source</Label>
                      <Input name="source" placeholder="e.g., Municipal supply" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Volume (m³)</Label>
                      <Input name="volume" type="number" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input name="location" placeholder="e.g., HQ" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Reporting Period</Label>
                    <Input name="reportingPeriod" placeholder="e.g., Q1-2024" required />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddWaterOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={addWaterMutation.isPending}>
                      {addWaterMutation.isPending ? "Adding..." : "Add"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {waterLoading ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">Loading water data...</CardContent>
            </Card>
          ) : waterData.length === 0 ? (
            <EmptyWaterState />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Water by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={waterPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                          {waterPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {waterPieData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">{item.value.toLocaleString()} m³</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Water Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Volume</TableHead>
                        <TableHead>Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {waterData.slice(0, 5).map((record) => (
                        <TableRow key={record.id}>
                          <TableCell><Badge variant="outline" className="capitalize">{record.waterType}</Badge></TableCell>
                          <TableCell>{record.source || '-'}</TableCell>
                          <TableCell>{Number(record.volume).toLocaleString()} m³</TableCell>
                          <TableCell>{record.location || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="waste" className="space-y-6 mt-6">
          <div className="flex justify-end">
            <Dialog open={isAddWasteOpen} onOpenChange={setIsAddWasteOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-waste">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Waste Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Waste Data</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    addWasteMutation.mutate({
                      wasteType: formData.get("wasteType"),
                      disposalMethod: formData.get("disposalMethod"),
                      weight: parseInt(formData.get("weight") as string),
                      unit: "metric_tons",
                      location: formData.get("location"),
                      reportingPeriod: formData.get("reportingPeriod"),
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Waste Type</Label>
                      <Select name="wasteType" defaultValue="non_hazardous">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hazardous">Hazardous</SelectItem>
                          <SelectItem value="non_hazardous">Non-Hazardous</SelectItem>
                          <SelectItem value="electronic">Electronic</SelectItem>
                          <SelectItem value="organic">Organic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Disposal Method</Label>
                      <Select name="disposalMethod" defaultValue="recycled">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recycled">Recycled</SelectItem>
                          <SelectItem value="composted">Composted</SelectItem>
                          <SelectItem value="landfill">Landfill</SelectItem>
                          <SelectItem value="incinerated">Incinerated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Weight (tons)</Label>
                      <Input name="weight" type="number" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input name="location" placeholder="e.g., HQ" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Reporting Period</Label>
                    <Input name="reportingPeriod" placeholder="e.g., Q1-2024" required />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddWasteOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={addWasteMutation.isPending}>
                      {addWasteMutation.isPending ? "Adding..." : "Add"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {wasteLoading ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">Loading waste data...</CardContent>
            </Card>
          ) : wasteData.length === 0 ? (
            <EmptyWasteState />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Waste by Disposal Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={wastePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                          {wastePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {wastePieData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">{item.value.toLocaleString()} tons</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Waste Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Disposal</TableHead>
                        <TableHead>Weight</TableHead>
                        <TableHead>Hazardous</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wasteData.slice(0, 5).map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="capitalize">{(record.wasteType || '').replace('_', ' ')}</TableCell>
                          <TableCell><Badge variant="outline" className="capitalize">{record.disposalMethod}</Badge></TableCell>
                          <TableCell>{Number(record.weight).toLocaleString()} tons</TableCell>
                          <TableCell>
                            {record.wasteType === "hazardous" ? (
                              <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Yes</Badge>
                            ) : (
                              <Badge variant="secondary">No</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
