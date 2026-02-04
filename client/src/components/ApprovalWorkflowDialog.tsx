import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2, Clock, User, ChevronDown, ChevronRight, Eye, Users } from "lucide-react";
import { useTenant } from "@/contexts/tenant-context";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ApprovalWorkflowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: "policy" | "procedure" | "process";
  entityId: string;
  entityTitle: string;
  entityVersion?: string;
  entityStatus?: string;
}

type ApprovalLevelType = "direct" | "single" | "two_stage" | "governance" | "enterprise" | "executive";

const levelTypeOptions: { value: ApprovalLevelType; label: string; levels: number; description: string }[] = [
  { value: "direct", label: "Direct Approval", levels: 0, description: "Admin can approve directly without additional levels" },
  { value: "single", label: "1 Level - Single Approver", levels: 1, description: "Single approver review before activation" },
  { value: "two_stage", label: "2 Levels - Two-Stage Approval", levels: 2, description: "Two-stage review process" },
  { value: "governance", label: "3 Levels - Full Governance Chain", levels: 3, description: "Complete governance chain approval" },
  { value: "enterprise", label: "4 Levels - Enterprise Approval", levels: 4, description: "Enterprise-wide approval workflow" },
  { value: "executive", label: "5 Levels - Executive Board Approval", levels: 5, description: "Full executive board approval chain" },
];

const levelNames: Record<number, string[]> = {
  1: ["Approver"],
  2: ["Department Head", "Manager"],
  3: ["Department Head", "CISO/DPO", "Executive"],
  4: ["Department Head", "CISO/DPO", "CRO", "Executive"],
  5: ["Department Head", "CISO/DPO", "CRO", "CEO", "Board"],
};

export function ApprovalWorkflowDialog({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityTitle,
  entityVersion = "1.0",
  entityStatus = "draft",
}: ApprovalWorkflowDialogProps) {
  const { currentTenantId } = useTenant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"content" | "metadata" | "workflow" | "history">("workflow");
  const [selectedLevelType, setSelectedLevelType] = useState<ApprovalLevelType>("single");
  const [selectedApprovers, setSelectedApprovers] = useState<Record<number, string>>({});

  // Fetch approvers for this tenant
  const { data: approvers = [] } = useQuery<any[]>({
    queryKey: [`/api/approvers?tenantId=${currentTenantId}`],
    enabled: !!currentTenantId && isOpen,
  });

  // Fetch all users as potential approvers (if no designated approvers exist)
  const { data: allUsers = [] } = useQuery<any[]>({
    queryKey: [`/api/users?tenantId=${currentTenantId}`],
    enabled: !!currentTenantId && isOpen,
  });

  // Available approvers list - use designated approvers or all users
  const availableApprovers = approvers.length > 0 
    ? approvers.map((a) => ({
        id: a.userId,
        name: a.user ? `${a.user.firstName || ''} ${a.user.lastName || ''}`.trim() || a.user.email : 'Unknown',
        email: a.user?.email || '',
        level: a.approverLevel,
      }))
    : allUsers.map((u) => ({
        id: u.id,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
        email: u.email || '',
        level: 1,
      }));

  const createWorkflowMutation = useMutation({
    mutationFn: async () => {
      const levelConfig = levelTypeOptions.find(l => l.value === selectedLevelType);
      const numLevels = levelConfig?.levels || 1;

      // Create the workflow
      const workflowRes = await apiRequest("POST", "/api/approval-workflows", {
        tenantId: currentTenantId,
        entityType,
        entityId,
        workflowType: selectedLevelType,
        totalLevels: numLevels,
        currentLevel: 1,
        status: "pending",
      });
      const workflow = await workflowRes.json();

      // If not direct approval, create levels with approvers
      if (numLevels > 0) {
        const levels = [];
        for (let i = 1; i <= numLevels; i++) {
          levels.push({
            levelNumber: i,
            levelName: levelNames[numLevels]?.[i - 1] || `Level ${i}`,
            approverId: selectedApprovers[i] || null,
            status: "pending",
          });
        }

        await apiRequest("POST", `/api/approval-workflows/${workflow.id}/levels`, { levels });
      }

      return workflow;
    },
    onSuccess: () => {
      toast({ title: "Approval workflow initiated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/approval-workflows"] });
      queryClient.invalidateQueries({ queryKey: [`/api/${entityType === "policy" ? "policies" : entityType + "s"}`] });
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to initiate approval workflow", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const selectedLevelConfig = levelTypeOptions.find(l => l.value === selectedLevelType);
  const numLevels = selectedLevelConfig?.levels || 0;

  // Validation - check if all required approvers are selected
  const allApproversSelected = numLevels === 0 || 
    Array.from({ length: numLevels }, (_, i) => i + 1).every(level => selectedApprovers[level]);

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{entityTitle}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{entityType.toUpperCase()}</Badge>
                <span>v{entityVersion}</span>
                <Badge 
                  variant={entityStatus === "approved" ? "default" : "secondary"}
                  className={entityStatus === "draft" ? "bg-amber-500/20 text-amber-400" : ""}
                >
                  {entityStatus}
                </Badge>
              </DialogDescription>
            </div>
            <Button variant="outline" size="sm" data-testid="button-preview">
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="workflow" className="mt-4 space-y-6">
            <Accordion type="single" collapsible defaultValue="approval">
              <AccordionItem value="approval" className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="font-medium">Approval Workflow Configuration</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-6">
                    {/* Number of Approval Levels */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Number of Approval Levels</Label>
                      <p className="text-xs text-muted-foreground">
                        Select how many approval levels are required for this {entityType}
                      </p>
                      
                      <Select 
                        value={selectedLevelType} 
                        onValueChange={(v) => {
                          setSelectedLevelType(v as ApprovalLevelType);
                          setSelectedApprovers({});
                        }}
                      >
                        <SelectTrigger className="w-full" data-testid="select-approval-levels">
                          <SelectValue placeholder="Select approval level" />
                        </SelectTrigger>
                        <SelectContent>
                          {levelTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Approver Selection */}
                    {numLevels > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          <Label className="text-sm font-medium">Select Approvers</Label>
                        </div>

                        <div className="space-y-3">
                          {Array.from({ length: numLevels }, (_, i) => i + 1).map((levelNum) => (
                            <div key={levelNum} className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
                              <div className="flex-1">
                                <Label className="text-sm">
                                  Level {levelNum}: {levelNames[numLevels]?.[levelNum - 1] || `Approver ${levelNum}`}
                                </Label>
                              </div>
                              <div className="flex-1">
                                <Select 
                                  value={selectedApprovers[levelNum] || ""}
                                  onValueChange={(v) => setSelectedApprovers(prev => ({ ...prev, [levelNum]: v }))}
                                >
                                  <SelectTrigger data-testid={`select-approver-level-${levelNum}`}>
                                    <SelectValue placeholder="Select approver" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableApprovers.map((approver: any) => (
                                      <SelectItem key={approver.id} value={approver.id}>
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                            <User className="h-3 w-3" />
                                          </div>
                                          <div>
                                            <div className="font-medium">{approver.name}</div>
                                            <div className="text-xs text-muted-foreground">{approver.email}</div>
                                          </div>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Checkbox 
                                checked={!!selectedApprovers[levelNum]}
                                className="pointer-events-none"
                              />
                            </div>
                          ))}
                        </div>

                        {!allApproversSelected && (
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">
                              No approvers selected. You must assign at least one approver per level before initiating approval.
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedLevelType === "direct" && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm">
                          Direct approval mode: Admin can approve this {entityType} directly without additional approvers.
                        </span>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="content" className="mt-4">
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                Content preview for {entityType} would be displayed here.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metadata" className="mt-4">
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                Metadata and properties would be displayed here.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                Version history and audit trail would be displayed here.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} data-testid="button-close">
            Close
          </Button>
          <Button 
            onClick={() => createWorkflowMutation.mutate()}
            disabled={!allApproversSelected || createWorkflowMutation.isPending}
            data-testid="button-initiate-approval"
          >
            {createWorkflowMutation.isPending ? "Initiating..." : "Initiate Approval"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
