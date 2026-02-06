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
import {
  Target, Plus, Search, Shield, AlertTriangle, CheckCircle2, Lock,
  Eye, Edit, FileText, Brain, Users, Database, Scale
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTenant } from "@/contexts/tenant-context";
import type { PurposeLegalBasis } from "@shared/schema";

const purposeFormSchema = z.object({
  purposeName: z.string().min(1, "Purpose name is required"),
  purposeDescription: z.string().optional(),
  legalBasis: z.string().min(1, "Legal basis is required"),
  legalBasisJustification: z.string().optional(),
  automatedDecisionMaking: z.boolean().default(false),
  profiling: z.boolean().default(false),
  aiTrainingAllowed: z.boolean().default(false),
  thirdPartySharing: z.boolean().default(false),
  crossBorderTransfer: z.boolean().default(false),
  retentionPeriodDays: z.number().optional(),
});

type PurposeFormValues = z.infer<typeof purposeFormSchema>;

const legalBasisLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  consent: { label: "Consent", color: "bg-chart-2/10 text-chart-2", icon: CheckCircle2 },
  contract: { label: "Contract", color: "bg-primary/10 text-primary", icon: FileText },
  legal_obligation: { label: "Legal Obligation", color: "bg-chart-1/10 text-chart-1", icon: Scale },
  vital_interests: { label: "Vital Interests", color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
  public_task: { label: "Public Task", color: "bg-chart-3/10 text-chart-3", icon: Users },
  legitimate_interests: { label: "Legitimate Interests", color: "bg-orange-500/10 text-orange-500", icon: Target },
};

function PurposeCard({ purpose, onView, onEdit }: { purpose: PurposeLegalBasis; onView: () => void; onEdit: () => void }) {
  const basisConfig = legalBasisLabels[purpose.legalBasis] || legalBasisLabels.consent;
  const Icon = basisConfig.icon;

  return (
    <Card className="card-3d hover-elevate">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${basisConfig.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">{purpose.purposeName}</h3>
              <Badge className={`${basisConfig.color} mt-1`}>{basisConfig.label}</Badge>
            </div>
          </div>
          <Badge variant={purpose.status === "active" ? "default" : "secondary"}>
            {purpose.status}
          </Badge>
        </div>

        {purpose.purposeDescription && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{purpose.purposeDescription}</p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-3">
          {purpose.automatedDecisionMaking && (
            <Badge variant="outline" className="text-xs"><Brain className="h-3 w-3 mr-1" /> Automated</Badge>
          )}
          {purpose.profiling && (
            <Badge variant="outline" className="text-xs"><Users className="h-3 w-3 mr-1" /> Profiling</Badge>
          )}
          {purpose.aiTrainingAllowed && (
            <Badge variant="outline" className="text-xs text-chart-2 border-chart-2/30"><Brain className="h-3 w-3 mr-1" /> AI Training</Badge>
          )}
          {purpose.thirdPartySharing && (
            <Badge variant="outline" className="text-xs text-chart-1 border-chart-1/30"><Users className="h-3 w-3 mr-1" /> Third-Party</Badge>
          )}
          {purpose.crossBorderTransfer && (
            <Badge variant="outline" className="text-xs text-orange-500 border-orange-500/30"><Database className="h-3 w-3 mr-1" /> Cross-Border</Badge>
          )}
        </div>

        {purpose.retentionPeriodDays && (
          <div className="text-sm text-muted-foreground mb-3">
            Retention: <span className="font-medium">{purpose.retentionPeriodDays} days</span>
          </div>
        )}

        <div className="flex gap-2 pt-3 border-t border-border">
          <Button variant="outline" size="sm" className="flex-1" onClick={onView} data-testid={`view-purpose-${purpose.id}`}>
            <Eye className="h-4 w-4 mr-1" /> Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={onEdit} data-testid={`edit-purpose-${purpose.id}`}>
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PurposeGovernancePage() {
  const { toast } = useToast();
  const { currentTenantId } = useTenant();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState<PurposeLegalBasis | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: purposes = [], isLoading } = useQuery<PurposeLegalBasis[]>({
    queryKey: ["/api/purpose-legal-basis", currentTenantId],
  });

  const createMutation = useMutation({
    mutationFn: async (data: PurposeFormValues) => {
      return apiRequest("POST", "/api/purpose-legal-basis", { ...data, tenantId: currentTenantId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purpose-legal-basis"] });
      setIsCreateOpen(false);
      toast({ title: "Purpose created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Creation failed", description: error.message, variant: "destructive" });
    },
  });

  const form = useForm<PurposeFormValues>({
    resolver: zodResolver(purposeFormSchema),
    defaultValues: {
      purposeName: "",
      purposeDescription: "",
      legalBasis: "",
      legalBasisJustification: "",
      automatedDecisionMaking: false,
      profiling: false,
      aiTrainingAllowed: false,
      thirdPartySharing: false,
      crossBorderTransfer: false,
      retentionPeriodDays: undefined,
    },
  });

  const filteredPurposes = useMemo(() => {
    return purposes.filter(p => {
      return !searchQuery || p.purposeName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [purposes, searchQuery]);

  const stats = useMemo(() => {
    const byBasis: Record<string, number> = {};
    purposes.forEach(p => {
      byBasis[p.legalBasis] = (byBasis[p.legalBasis] || 0) + 1;
    });
    return {
      total: purposes.length,
      byBasis,
      withAiTraining: purposes.filter(p => p.aiTrainingAllowed).length,
      withAutomated: purposes.filter(p => p.automatedDecisionMaking).length,
    };
  }, [purposes]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Purpose & Legal Basis Governance</h1>
          <p className="text-muted-foreground">Define and enforce lawful processing purposes</p>
        </div>
        <Button className="btn-gradient" onClick={() => setIsCreateOpen(true)} data-testid="button-add-purpose">
          <Plus className="h-4 w-4 mr-2" /> Define Purpose
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Purposes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-chart-2/10">
                <CheckCircle2 className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.byBasis["consent"] || 0}</p>
                <p className="text-xs text-muted-foreground">Consent-Based</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-chart-1/10">
                <Brain className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.withAiTraining}</p>
                <p className="text-xs text-muted-foreground">AI Training Allowed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-3d">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-orange-500/10">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.withAutomated}</p>
                <p className="text-xs text-muted-foreground">Automated Decisions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search purposes..." 
          className="pl-10 max-w-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          data-testid="input-search-purpose"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <Card key={i} className="card-3d animate-pulse">
              <CardContent className="p-5 h-48" />
            </Card>
          ))}
        </div>
      ) : filteredPurposes.length === 0 ? (
        <Card className="card-3d">
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Purposes Defined</h3>
            <p className="text-muted-foreground mb-4">Define processing purposes to enforce lawful data use</p>
            <Button className="btn-gradient" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Define First Purpose
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPurposes.map(purpose => (
            <PurposeCard
              key={purpose.id}
              purpose={purpose}
              onView={() => setSelectedPurpose(purpose)}
              onEdit={() => {
                form.reset(purpose as any);
                setIsCreateOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Define Processing Purpose</DialogTitle>
            <DialogDescription>Specify purpose, legal basis, and usage restrictions</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
              <FormField control={form.control} name="purposeName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Marketing Communications" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="purposeDescription" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Describe the purpose..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="legalBasis" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legal Basis</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select legal basis" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="consent">Consent</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="legal_obligation">Legal Obligation</SelectItem>
                        <SelectItem value="vital_interests">Vital Interests</SelectItem>
                        <SelectItem value="public_task">Public Task</SelectItem>
                        <SelectItem value="legitimate_interests">Legitimate Interests</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="retentionPeriodDays" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retention (days)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 365" {...field} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="legalBasisJustification" render={({ field }) => (
                <FormItem>
                  <FormLabel>Legal Basis Justification</FormLabel>
                  <FormControl><Textarea placeholder="Justify the legal basis..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="space-y-3 pt-2">
                <p className="text-sm font-medium">Processing Characteristics</p>
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="automatedDecisionMaking" render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                      <FormLabel className="text-sm">Automated Decision Making</FormLabel>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="profiling" render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                      <FormLabel className="text-sm">Profiling</FormLabel>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="aiTrainingAllowed" render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                      <FormLabel className="text-sm">AI Training Allowed</FormLabel>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="thirdPartySharing" render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                      <FormLabel className="text-sm">Third-Party Sharing</FormLabel>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="crossBorderTransfer" render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-3 border rounded-lg col-span-2">
                      <FormLabel className="text-sm">Cross-Border Transfer</FormLabel>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-purpose">
                  {createMutation.isPending ? "Creating..." : "Create Purpose"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
