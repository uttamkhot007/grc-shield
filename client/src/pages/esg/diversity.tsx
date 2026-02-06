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
  Users, UserCircle, Heart, Plus, Award,
  Target, BarChart3, Download, Briefcase
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { EsgDiversityData } from "@shared/schema";

const CATEGORY_COLORS: Record<string, string> = {
  "gender": "#ec4899",
  "ethnicity": "#8b5cf6",
  "age": "#06b6d4",
  "disability": "#22c55e",
};

export default function DiversityInclusionPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: diversityData = [], isLoading } = useQuery<EsgDiversityData[]>({
    queryKey: ["/api/esg/diversity-data"],
  });

  const addDiversityMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/esg/diversity-data", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/esg/diversity-data"] });
      setIsAddDialogOpen(false);
      toast({ title: "Diversity data added successfully" });
    },
  });

  const genderData = diversityData.filter(d => d.category === "gender");
  const totalEmployees = diversityData.reduce((sum, d) => sum + (d.count || 0), 0);
  const femaleCount = genderData.find(d => d.dimension === "female")?.count || 0;
  const femalePercentage = totalEmployees > 0 ? (femaleCount / totalEmployees) * 100 : 0;

  const categoryBreakdown = diversityData.reduce((acc, d) => {
    const cat = d.category || "other";
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += (d.count || 0);
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryBreakdown).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: CATEGORY_COLORS[name] || "#94a3b8",
  }));

  const radarData = [
    { dimension: "Gender Parity", value: femalePercentage, fullMark: 50 },
    { dimension: "Leadership", value: 35, fullMark: 50 },
    { dimension: "Age Diversity", value: 65, fullMark: 100 },
    { dimension: "Ethnic Diversity", value: 40, fullMark: 100 },
    { dimension: "Inclusion Score", value: 82, fullMark: 100 },
  ];

  const EmptyState = () => (
    <Card className="glass-card">
      <CardContent className="p-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-pink-500/20 mb-4">
          <Users className="w-12 h-12 text-pink-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Diversity Data</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          Track workforce diversity metrics across gender, ethnicity, age, and disability status 
          to build an inclusive workplace.
        </p>
        <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-diversity">
          <Plus className="w-4 h-4 mr-2" />
          Add Diversity Data
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
            Diversity & Inclusion
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and promote workforce diversity, equity, and inclusion
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-diversity">
                <Plus className="w-4 h-4 mr-2" />
                Add Data
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Diversity Data</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addDiversityMutation.mutate({
                    category: formData.get("category"),
                    dimension: formData.get("dimension"),
                    level: formData.get("level"),
                    count: parseInt(formData.get("count") as string),
                    percentage: parseInt(formData.get("percentage") as string) || null,
                    reportingPeriod: formData.get("reportingPeriod"),
                  });
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select name="category" defaultValue="gender">
                      <SelectTrigger data-testid="select-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gender">Gender</SelectItem>
                        <SelectItem value="ethnicity">Ethnicity</SelectItem>
                        <SelectItem value="age">Age</SelectItem>
                        <SelectItem value="disability">Disability</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Dimension</Label>
                    <Input name="dimension" placeholder="e.g., Female, Under 30" required data-testid="input-dimension" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Level</Label>
                    <Select name="level" defaultValue="workforce">
                      <SelectTrigger data-testid="select-level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="workforce">All Workforce</SelectItem>
                        <SelectItem value="leadership">Leadership</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="board">Board</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Count</Label>
                    <Input name="count" type="number" placeholder="0" required data-testid="input-count" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Percentage (%)</Label>
                    <Input name="percentage" type="number" min="0" max="100" placeholder="0" data-testid="input-percentage" />
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
                  <Button type="submit" disabled={addDiversityMutation.isPending} data-testid="button-submit-diversity">
                    {addDiversityMutation.isPending ? "Adding..." : "Add Data"}
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
            Loading diversity data...
          </CardContent>
        </Card>
      ) : diversityData.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                  <Users className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalEmployees.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Workforce</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-pink-500/20">
                  <UserCircle className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{femalePercentage.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Women in Workforce</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <Briefcase className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Object.keys(categoryBreakdown).length}</p>
                  <p className="text-sm text-muted-foreground">Categories Tracked</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <Award className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">82</p>
                  <p className="text-sm text-muted-foreground">Inclusion Index</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Diversity Scorecard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid className="stroke-muted" />
                      <PolarAngleAxis dataKey="dimension" className="text-xs" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke="#ec4899"
                        fill="#ec4899"
                        fillOpacity={0.5}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Workforce by Category</CardTitle>
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
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {pieData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm truncate">{item.name}</span>
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

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Diversity Metrics</CardTitle>
              <CardDescription>Detailed breakdown of workforce demographics</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Dimension</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Period</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {diversityData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          style={{ borderColor: CATEGORY_COLORS[record.category || ""] }}
                          className="capitalize"
                        >
                          {record.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium capitalize">{record.dimension}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">{record.level || "All"}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{(record.count || 0).toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        {record.percentage ? (
                          <div className="flex items-center gap-2">
                            <Progress value={record.percentage} className="h-2 w-16" />
                            <span className="text-sm">{record.percentage}%</span>
                          </div>
                        ) : '-'}
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
