import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import {
  Target, Plus, Download, CheckCircle2, AlertCircle, Circle
} from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis } from "recharts";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { EsgMaterialityTopic } from "@shared/schema";

const CATEGORY_COLORS = {
  environmental: "#22c55e",
  social: "#3b82f6",
  governance: "#8b5cf6",
};

export default function MaterialityPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: topics = [], isLoading } = useQuery<EsgMaterialityTopic[]>({
    queryKey: ["/api/esg/materiality-topics"],
  });

  const addTopicMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/esg/materiality-topics", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/esg/materiality-topics"] });
      setIsAddDialogOpen(false);
      toast({ title: "Materiality topic added successfully" });
    },
  });

  const materialTopics = topics.filter(t => t.isMaterial);
  const highPriorityCount = topics.filter(t => t.priority === "high").length;

  const scatterData = topics.map(t => ({
    name: t.name,
    x: t.businessImpact || 0,
    y: t.stakeholderImportance || 0,
    category: t.category,
    isMaterial: t.isMaterial,
    priority: t.priority,
  }));

  const EmptyState = () => (
    <Card className="glass-card">
      <CardContent className="p-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-amber-500/20 mb-4">
          <Target className="w-12 h-12 text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Materiality Assessment</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          Conduct a materiality assessment to identify and prioritize the ESG topics 
          most important to your stakeholders and business.
        </p>
        <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-topic">
          <Plus className="w-4 h-4 mr-2" />
          Add Topic
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Materiality Assessment
          </h1>
          <p className="text-muted-foreground mt-1">
            Identify and prioritize ESG topics based on stakeholder and business importance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export Matrix
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-topic">
                <Plus className="w-4 h-4 mr-2" />
                Add Topic
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Materiality Topic</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addTopicMutation.mutate({
                    name: formData.get("name"),
                    description: formData.get("description"),
                    category: formData.get("category"),
                    stakeholderImportance: parseInt(formData.get("stakeholderImportance") as string),
                    businessImpact: parseInt(formData.get("businessImpact") as string),
                    priority: formData.get("priority"),
                    isMaterial: formData.get("isMaterial") === "true",
                  });
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Topic Name</Label>
                  <Input name="name" placeholder="e.g., Climate Change" required data-testid="input-name" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea name="description" placeholder="Brief description of the topic" />
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
                    <Label>Priority</Label>
                    <Select name="priority" defaultValue="medium">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Stakeholder Importance (1-10)</Label>
                    <Input name="stakeholderImportance" type="number" min="1" max="10" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Impact (1-10)</Label>
                    <Input name="businessImpact" type="number" min="1" max="10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Is Material?</Label>
                  <Select name="isMaterial" defaultValue="true">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={addTopicMutation.isPending}>
                    {addTopicMutation.isPending ? "Adding..." : "Add Topic"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center text-muted-foreground">Loading materiality data...</CardContent>
        </Card>
      ) : topics.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/20">
                  <Target className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{topics.length}</p>
                  <p className="text-sm text-muted-foreground">Total Topics</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{materialTopics.length}</p>
                  <p className="text-sm text-muted-foreground">Material Topics</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-500/20">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{highPriorityCount}</p>
                  <p className="text-sm text-muted-foreground">High Priority</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <Circle className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Categories</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Materiality Matrix</CardTitle>
              <CardDescription>Topics plotted by stakeholder importance vs. business impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" dataKey="x" name="Business Impact" domain={[0, 10]} label={{ value: 'Business Impact', position: 'bottom' }} />
                    <YAxis type="number" dataKey="y" name="Stakeholder Importance" domain={[0, 10]} label={{ value: 'Stakeholder Importance', angle: -90, position: 'left' }} />
                    <ZAxis range={[100, 500]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-card border rounded-lg p-3 shadow-lg">
                              <p className="font-semibold">{data.name}</p>
                              <p className="text-sm text-muted-foreground capitalize">Category: {data.category}</p>
                              <p className="text-sm">Business Impact: {data.x}</p>
                              <p className="text-sm">Stakeholder Importance: {data.y}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="Topics" data={scatterData}>
                      {scatterData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS] || "#94a3b8"} 
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {Object.entries(CATEGORY_COLORS).map(([name, color]) => (
                  <div key={name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-sm capitalize">{name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>All Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stakeholder</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Material</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topics.map((topic) => (
                    <TableRow key={topic.id}>
                      <TableCell className="font-medium">{topic.name}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          style={{ borderColor: CATEGORY_COLORS[topic.category as keyof typeof CATEGORY_COLORS] }}
                          className="capitalize"
                        >
                          {topic.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{topic.stakeholderImportance}/10</TableCell>
                      <TableCell>{topic.businessImpact}/10</TableCell>
                      <TableCell>
                        <Badge variant={topic.priority === "high" ? "destructive" : topic.priority === "medium" ? "secondary" : "outline"} className="capitalize">
                          {topic.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {topic.isMaterial ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
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
