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
import {
  FileText, Plus, Download, ExternalLink, Calendar, CheckCircle2, Clock
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { EsgDisclosure } from "@shared/schema";

export default function DisclosuresPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: disclosures = [], isLoading } = useQuery<EsgDisclosure[]>({
    queryKey: ["/api/esg/disclosures"],
  });

  const addDisclosureMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/esg/disclosures", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/esg/disclosures"] });
      setIsAddDialogOpen(false);
      toast({ title: "Disclosure added successfully" });
    },
  });

  const publishedCount = disclosures.filter(d => d.status === "published").length;
  const draftCount = disclosures.filter(d => d.status === "draft").length;

  const EmptyState = () => (
    <Card className="glass-card">
      <CardContent className="p-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-blue-500/20 mb-4">
          <FileText className="w-12 h-12 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No ESG Disclosures</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          Create and manage ESG reports, sustainability reports, and framework-specific disclosures.
        </p>
        <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-disclosure">
          <Plus className="w-4 h-4 mr-2" />
          Create Disclosure
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
            ESG Disclosures
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage sustainability reports and ESG disclosures
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-templates">
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-disclosure">
                <Plus className="w-4 h-4 mr-2" />
                Create Disclosure
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create ESG Disclosure</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addDisclosureMutation.mutate({
                    title: formData.get("title"),
                    disclosureType: formData.get("disclosureType"),
                    framework: formData.get("framework"),
                    reportingPeriod: formData.get("reportingPeriod"),
                    status: "draft",
                    description: formData.get("description"),
                  });
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input name="title" placeholder="e.g., 2024 Sustainability Report" required data-testid="input-title" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Disclosure Type</Label>
                    <Select name="disclosureType" defaultValue="annual_report">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annual_report">Annual Report</SelectItem>
                        <SelectItem value="sustainability_report">Sustainability Report</SelectItem>
                        <SelectItem value="climate_disclosure">Climate Disclosure</SelectItem>
                        <SelectItem value="framework_response">Framework Response</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Framework</Label>
                    <Select name="framework" defaultValue="gri">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gri">GRI Standards</SelectItem>
                        <SelectItem value="sasb">SASB</SelectItem>
                        <SelectItem value="tcfd">TCFD</SelectItem>
                        <SelectItem value="cdp">CDP</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reporting Period</Label>
                  <Input name="reportingPeriod" placeholder="e.g., FY2024" required data-testid="input-period" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea name="description" placeholder="Brief description of the disclosure" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={addDisclosureMutation.isPending}>
                    {addDisclosureMutation.isPending ? "Creating..." : "Create Draft"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center text-muted-foreground">Loading disclosures...</CardContent>
        </Card>
      ) : disclosures.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{disclosures.length}</p>
                  <p className="text-sm text-muted-foreground">Total Disclosures</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{publishedCount}</p>
                  <p className="text-sm text-muted-foreground">Published</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/20">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{draftCount}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2024</p>
                  <p className="text-sm text-muted-foreground">Current Year</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>All Disclosures</CardTitle>
              <CardDescription>ESG reports and framework disclosures</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Framework</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {disclosures.map((disclosure) => (
                    <TableRow key={disclosure.id}>
                      <TableCell className="font-medium">{disclosure.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {(disclosure.disclosureType || '').replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="uppercase">{disclosure.framework}</TableCell>
                      <TableCell>{disclosure.reportingPeriod}</TableCell>
                      <TableCell>
                        <Badge variant={disclosure.status === "published" ? "default" : "secondary"} className="capitalize">
                          {disclosure.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {disclosure.status === "draft" && (
                            <Button variant="outline" size="sm">
                              Publish
                            </Button>
                          )}
                        </div>
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
