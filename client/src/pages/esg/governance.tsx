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
  Building, Scale, Users, Award, Plus, Shield, 
  Target, Download, CheckCircle2, Gavel
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { EsgBoardData } from "@shared/schema";

export default function BoardEthicsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: boardData = [], isLoading } = useQuery<EsgBoardData[]>({
    queryKey: ["/api/esg/board-data"],
  });

  const addBoardMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/esg/board-data", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/esg/board-data"] });
      setIsAddDialogOpen(false);
      toast({ title: "Board data added successfully" });
    },
  });

  const independenceData = boardData.filter(d => d.metricType === "independence");
  const diversityData = boardData.filter(d => d.metricType === "diversity");
  const meetingsData = boardData.filter(d => d.metricType === "meetings");

  const totalMembers = boardData.find(d => d.metricType === "independence" && d.dimension === "total")?.value || 0;
  const independentMembers = boardData.find(d => d.metricType === "independence" && d.dimension === "independent")?.value || 0;
  const femaleMembers = boardData.find(d => d.metricType === "diversity" && d.dimension === "female")?.value || 0;
  const meetingsHeld = boardData.find(d => d.metricType === "meetings" && d.dimension === "held")?.value || 0;

  const independenceRate = totalMembers > 0 ? (independentMembers / totalMembers) * 100 : 0;
  const genderDiversityRate = totalMembers > 0 ? (femaleMembers / totalMembers) * 100 : 0;

  const genderPieData = [
    { name: "Female", value: femaleMembers, color: "#ec4899" },
    { name: "Male", value: Math.max(0, totalMembers - femaleMembers), color: "#3b82f6" },
  ].filter(d => d.value > 0);

  const governanceScores = [
    { dimension: "Independence", value: independenceRate || 60, fullMark: 100 },
    { dimension: "Gender Diversity", value: genderDiversityRate || 40, fullMark: 50 },
    { dimension: "Meeting Attendance", value: 92, fullMark: 100 },
    { dimension: "Ethics Training", value: 85, fullMark: 100 },
    { dimension: "Compliance Score", value: 92, fullMark: 100 },
  ];

  const EmptyState = () => (
    <Card className="glass-card">
      <CardContent className="p-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-purple-500/20 mb-4">
          <Building className="w-12 h-12 text-purple-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Board & Governance Data</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          Track board composition, independence, diversity, and corporate governance metrics.
        </p>
        <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-board">
          <Plus className="w-4 h-4 mr-2" />
          Add Board Data
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
            Board & Ethics
          </h1>
          <p className="text-muted-foreground mt-1">
            Corporate governance, board composition, and ethics metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-board">
                <Plus className="w-4 h-4 mr-2" />
                Add Data
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Board Governance Data</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addBoardMutation.mutate({
                    metricType: formData.get("metricType"),
                    dimension: formData.get("dimension"),
                    value: parseInt(formData.get("value") as string),
                    unit: formData.get("unit") || null,
                    reportingPeriod: formData.get("reportingPeriod"),
                  });
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Metric Type</Label>
                    <Select name="metricType" defaultValue="independence">
                      <SelectTrigger data-testid="select-metric-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="independence">Independence</SelectItem>
                        <SelectItem value="diversity">Diversity</SelectItem>
                        <SelectItem value="tenure">Tenure</SelectItem>
                        <SelectItem value="meetings">Meetings</SelectItem>
                        <SelectItem value="attendance">Attendance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Dimension</Label>
                    <Input name="dimension" placeholder="e.g., total, independent, female" required data-testid="input-dimension" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input name="value" type="number" placeholder="0" required data-testid="input-value" />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit (optional)</Label>
                    <Input name="unit" placeholder="e.g., %, years" data-testid="input-unit" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reporting Period</Label>
                  <Input name="reportingPeriod" placeholder="e.g., FY2024" required data-testid="input-period" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={addBoardMutation.isPending} data-testid="button-submit-board">
                    {addBoardMutation.isPending ? "Adding..." : "Add Data"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center text-muted-foreground">Loading board data...</CardContent>
        </Card>
      ) : boardData.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalMembers}</p>
                  <p className="text-sm text-muted-foreground">Board Size</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{independenceRate.toFixed(0)}%</p>
                  <p className="text-sm text-muted-foreground">Independence</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-pink-500/20">
                  <Award className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{genderDiversityRate.toFixed(0)}%</p>
                  <p className="text-sm text-muted-foreground">Women on Board</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <Gavel className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{meetingsHeld}</p>
                  <p className="text-sm text-muted-foreground">Meetings Held</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Governance Scorecard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={governanceScores}>
                      <PolarGrid className="stroke-muted" />
                      <PolarAngleAxis dataKey="dimension" className="text-xs" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Score" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Gender Diversity</CardTitle>
              </CardHeader>
              <CardContent>
                {genderPieData.length > 0 ? (
                  <>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={genderPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value">
                            {genderPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-2">
                      {genderPieData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm">{item.name}: {item.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground">
                    No data to display
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  Ethics & Compliance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Code of Conduct Training</span>
                    <div className="flex items-center gap-2">
                      <Progress value={98} className="w-24 h-2" />
                      <span className="font-medium">98%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Anti-Bribery Training</span>
                    <div className="flex items-center gap-2">
                      <Progress value={95} className="w-24 h-2" />
                      <span className="font-medium">95%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Whistleblower Reports Resolved</span>
                    <div className="flex items-center gap-2">
                      <Progress value={92} className="w-24 h-2" />
                      <span className="font-medium">92%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Policy Acknowledgment</span>
                    <div className="flex items-center gap-2">
                      <Progress value={97} className="w-24 h-2" />
                      <span className="font-medium">97%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Board Governance Records</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>Dimension</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Period</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {boardData.slice(0, 6).map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {record.metricType}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{record.dimension}</TableCell>
                        <TableCell>
                          <span className="font-mono">{record.value}</span>
                          {record.unit && <span className="text-muted-foreground ml-1">{record.unit}</span>}
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
          </div>
        </>
      )}
    </div>
  );
}
