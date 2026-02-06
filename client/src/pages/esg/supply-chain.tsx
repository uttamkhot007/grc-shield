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
  Truck, Plus, Download, Building, AlertTriangle, CheckCircle2, TrendingUp
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { EsgSupplyChain } from "@shared/schema";

const RISK_COLORS = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

export default function SupplyChainPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: suppliers = [], isLoading } = useQuery<EsgSupplyChain[]>({
    queryKey: ["/api/esg/supply-chain"],
  });

  const addSupplierMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/esg/supply-chain", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/esg/supply-chain"] });
      setIsAddDialogOpen(false);
      toast({ title: "Supplier ESG data added successfully" });
    },
  });

  const highRiskCount = suppliers.filter(s => s.riskLevel === "high").length;
  const assessedCount = suppliers.filter(s => s.assessmentStatus === "completed").length;
  const avgScore = suppliers.length > 0 
    ? suppliers.reduce((sum, s) => sum + (s.esgScore || 0), 0) / suppliers.length 
    : 0;

  const riskBreakdown = suppliers.reduce((acc, s) => {
    const risk = s.riskLevel || "unknown";
    acc[risk] = (acc[risk] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(riskBreakdown).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: RISK_COLORS[name as keyof typeof RISK_COLORS] || "#94a3b8",
  }));

  const EmptyState = () => (
    <Card className="glass-card">
      <CardContent className="p-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-amber-500/20 mb-4">
          <Truck className="w-12 h-12 text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Supply Chain ESG Data</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          Track ESG performance and risks across your supply chain to ensure 
          sustainable and ethical sourcing practices.
        </p>
        <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-supplier">
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Supply Chain ESG
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor ESG performance and risks across your supply chain
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-supplier">
                <Plus className="w-4 h-4 mr-2" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Supplier ESG Data</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addSupplierMutation.mutate({
                    supplierName: formData.get("supplierName"),
                    category: formData.get("category"),
                    country: formData.get("country"),
                    riskLevel: formData.get("riskLevel"),
                    esgScore: parseInt(formData.get("esgScore") as string) || null,
                    assessmentStatus: formData.get("assessmentStatus"),
                    lastAssessmentDate: formData.get("lastAssessmentDate"),
                  });
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Supplier Name</Label>
                  <Input name="supplierName" placeholder="e.g., Acme Corp" required data-testid="input-name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select name="category" defaultValue="manufacturing">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="raw_materials">Raw Materials</SelectItem>
                        <SelectItem value="logistics">Logistics</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input name="country" placeholder="e.g., USA" required data-testid="input-country" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Risk Level</Label>
                    <Select name="riskLevel" defaultValue="medium">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>ESG Score (0-100)</Label>
                    <Input name="esgScore" type="number" min="0" max="100" placeholder="0" data-testid="input-score" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Assessment Status</Label>
                    <Select name="assessmentStatus" defaultValue="pending">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Last Assessment Date</Label>
                    <Input name="lastAssessmentDate" type="date" data-testid="input-date" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={addSupplierMutation.isPending}>
                    {addSupplierMutation.isPending ? "Adding..." : "Add Supplier"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center text-muted-foreground">Loading supply chain data...</CardContent>
        </Card>
      ) : suppliers.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/20">
                  <Building className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{suppliers.length}</p>
                  <p className="text-sm text-muted-foreground">Total Suppliers</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-500/20">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{highRiskCount}</p>
                  <p className="text-sm text-muted-foreground">High Risk</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{assessedCount}</p>
                  <p className="text-sm text-muted-foreground">Assessed</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgScore.toFixed(0)}</p>
                  <p className="text-sm text-muted-foreground">Avg ESG Score</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <CardTitle>Suppliers</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>ESG Score</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">{supplier.supplierName}</TableCell>
                        <TableCell className="capitalize">{(supplier.category || '').replace('_', ' ')}</TableCell>
                        <TableCell>{supplier.country}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={supplier.riskLevel === "high" ? "destructive" : supplier.riskLevel === "medium" ? "secondary" : "default"}
                            className="capitalize"
                          >
                            {supplier.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {supplier.esgScore ? (
                            <div className="flex items-center gap-2">
                              <Progress value={supplier.esgScore} className="w-16 h-2" />
                              <span>{supplier.esgScore}</span>
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {(supplier.assessmentStatus || '').replace('_', ' ')}
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
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
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
                            <span className="text-sm">{item.name} Risk</span>
                          </div>
                          <span className="text-sm font-medium">{item.value} suppliers</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No data to display
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
