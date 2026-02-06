import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe, Plus, Search, Shield, AlertTriangle, CheckCircle2, ArrowRight,
  Eye, Edit, FileText, MapPin, Building, Clock, Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTenant } from "@/contexts/tenant-context";
import type { CrossBorderTransfer } from "@shared/schema";

const transferFormSchema = z.object({
  transferName: z.string().min(1, "Transfer name is required"),
  description: z.string().optional(),
  sourceCountry: z.string().min(1, "Source country is required"),
  destinationCountry: z.string().min(1, "Destination country is required"),
  destinationOrganization: z.string().optional(),
  transferMechanism: z.string().min(1, "Transfer mechanism is required"),
  adequacyDecision: z.boolean().default(false),
  sccType: z.string().optional(),
  tiaCompleted: z.boolean().default(false),
  tiaFindings: z.string().optional(),
  riskLevel: z.string().default("medium"),
});

type TransferFormValues = z.infer<typeof transferFormSchema>;

const riskColors: Record<string, string> = {
  low: "bg-chart-2/10 text-chart-2",
  medium: "bg-chart-1/10 text-chart-1",
  high: "bg-orange-500/10 text-orange-500",
  critical: "bg-destructive/10 text-destructive"
};

const mechanismLabels: Record<string, string> = {
  sccs: "Standard Contractual Clauses",
  adequacy: "Adequacy Decision",
  bcrs: "Binding Corporate Rules",
  derogation: "Specific Derogation"
};

function TransferCard({ transfer, onView, onEdit }: { transfer: CrossBorderTransfer; onView: () => void; onEdit: () => void }) {
  return (
    <Card className="card-3d hover-elevate">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{transfer.transferName}</h3>
              <p className="text-xs text-muted-foreground">
                {mechanismLabels[transfer.transferMechanism] || transfer.transferMechanism}
              </p>
            </div>
          </div>
          <Badge className={riskColors[transfer.riskLevel || "medium"]}>
            {transfer.riskLevel} risk
          </Badge>
        </div>

        <div className="flex items-center gap-2 mb-3 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{transfer.sourceCountry}</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{transfer.destinationCountry}</span>
          </div>
        </div>

        {transfer.destinationOrganization && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Building className="h-4 w-4" />
            <span>{transfer.destinationOrganization}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 mb-3">
          {transfer.adequacyDecision && (
            <Badge variant="outline" className="text-xs text-chart-2 border-chart-2/30">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Adequacy
            </Badge>
          )}
          {transfer.tiaCompleted && (
            <Badge variant="outline" className="text-xs">
              <FileText className="h-3 w-3 mr-1" /> TIA Completed
            </Badge>
          )}
          {transfer.sccType && (
            <Badge variant="outline" className="text-xs">
              <Shield className="h-3 w-3 mr-1" /> SCCs
            </Badge>
          )}
        </div>

        <div className="flex gap-2 pt-3 border-t border-border">
          <Button variant="outline" size="sm" className="flex-1" onClick={onView} data-testid={`view-transfer-${transfer.id}`}>
            <Eye className="h-4 w-4 mr-1" /> Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={onEdit} data-testid={`edit-transfer-${transfer.id}`}>
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CrossBorderTransfersPage() {
  const { toast } = useToast();
  const { currentTenantId } = useTenant();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<CrossBorderTransfer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  const { data: transfers = [], isLoading } = useQuery<CrossBorderTransfer[]>({
    queryKey: ["/api/cross-border-transfers", currentTenantId],
  });

  const createMutation = useMutation({
    mutationFn: async (data: TransferFormValues) => {
      return apiRequest("POST", "/api/cross-border-transfers", { ...data, tenantId: currentTenantId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cross-border-transfers"] });
      setIsCreateOpen(false);
      toast({ title: "Transfer created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Creation failed", description: error.message, variant: "destructive" });
    },
  });

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      transferName: "",
      description: "",
      sourceCountry: "",
      destinationCountry: "",
      destinationOrganization: "",
      transferMechanism: "",
      adequacyDecision: false,
      sccType: "",
      tiaCompleted: false,
      tiaFindings: "",
      riskLevel: "medium",
    },
  });

  const filteredTransfers = useMemo(() => {
    return transfers.filter(t => {
      const matchesSearch = !searchQuery || 
        t.transferName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.sourceCountry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.destinationCountry.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = riskFilter === "all" || t.riskLevel === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [transfers, searchQuery, riskFilter]);

  const stats = useMemo(() => {
    const byMechanism: Record<string, number> = {};
    transfers.forEach(t => {
      byMechanism[t.transferMechanism] = (byMechanism[t.transferMechanism] || 0) + 1;
    });
    const uniqueDestinations = new Set(transfers.map(t => t.destinationCountry));
    return {
      total: transfers.length,
      byMechanism,
      uniqueDestinations: uniqueDestinations.size,
      highRisk: transfers.filter(t => t.riskLevel === "high" || t.riskLevel === "critical").length,
      withTia: transfers.filter(t => t.tiaCompleted).length,
    };
  }, [transfers]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Cross-Border Transfer Governance</h1>
          <p className="text-muted-foreground">Manage international data transfers and compliance</p>
        </div>
        <Button className="btn-gradient" onClick={() => setIsCreateOpen(true)} data-testid="button-add-transfer">
          <Plus className="h-4 w-4 mr-2" /> Register Transfer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Transfers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-chart-1/10">
                <MapPin className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.uniqueDestinations}</p>
                <p className="text-xs text-muted-foreground">Destinations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-chart-2/10">
                <Shield className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.byMechanism["sccs"] || 0}</p>
                <p className="text-xs text-muted-foreground">With SCCs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.highRisk}</p>
                <p className="text-xs text-muted-foreground">High Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-chart-3/10">
                <FileText className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.withTia}</p>
                <p className="text-xs text-muted-foreground">TIA Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search transfers..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-transfer"
          />
        </div>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-48" data-testid="select-risk-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter risk" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk Levels</SelectItem>
            <SelectItem value="low">Low Risk</SelectItem>
            <SelectItem value="medium">Medium Risk</SelectItem>
            <SelectItem value="high">High Risk</SelectItem>
            <SelectItem value="critical">Critical Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <Card key={i} className="card-3d animate-pulse">
              <CardContent className="p-5 h-52" />
            </Card>
          ))}
        </div>
      ) : filteredTransfers.length === 0 ? (
        <Card className="card-3d">
          <CardContent className="py-12 text-center">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Cross-Border Transfers</h3>
            <p className="text-muted-foreground mb-4">Register international data transfers for compliance</p>
            <Button className="btn-gradient" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Register First Transfer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTransfers.map(transfer => (
            <TransferCard
              key={transfer.id}
              transfer={transfer}
              onView={() => setSelectedTransfer(transfer)}
              onEdit={() => {
                form.reset(transfer as any);
                setIsCreateOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register Cross-Border Transfer</DialogTitle>
            <DialogDescription>Document international data transfers and safeguards</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
              <FormField control={form.control} name="transferName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Transfer Name</FormLabel>
                  <FormControl><Input placeholder="e.g., EU to US Customer Data" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Describe the transfer..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="sourceCountry" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Country</FormLabel>
                    <FormControl><Input placeholder="e.g., Germany" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="destinationCountry" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Country</FormLabel>
                    <FormControl><Input placeholder="e.g., United States" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="destinationOrganization" render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Organization</FormLabel>
                  <FormControl><Input placeholder="e.g., Cloud Provider Inc." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="transferMechanism" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transfer Mechanism</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select mechanism" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="sccs">Standard Contractual Clauses</SelectItem>
                        <SelectItem value="adequacy">Adequacy Decision</SelectItem>
                        <SelectItem value="bcrs">Binding Corporate Rules</SelectItem>
                        <SelectItem value="derogation">Specific Derogation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="riskLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="adequacyDecision" render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <FormLabel>Adequacy Decision</FormLabel>
                      <FormDescription className="text-xs">Country has adequacy status</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="tiaCompleted" render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <FormLabel>TIA Completed</FormLabel>
                      <FormDescription className="text-xs">Transfer Impact Assessment</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="sccType" render={({ field }) => (
                <FormItem>
                  <FormLabel>SCC Type (if applicable)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select SCC type" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="controller_controller">Controller to Controller</SelectItem>
                      <SelectItem value="controller_processor">Controller to Processor</SelectItem>
                      <SelectItem value="processor_processor">Processor to Processor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="tiaFindings" render={({ field }) => (
                <FormItem>
                  <FormLabel>TIA Findings</FormLabel>
                  <FormControl><Textarea placeholder="Document TIA findings..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-transfer">
                  {createMutation.isPending ? "Creating..." : "Register Transfer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
