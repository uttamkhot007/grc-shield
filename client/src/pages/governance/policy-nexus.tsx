import { useState, useEffect, Fragment, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Policy, Process, Procedure, Framework, Control, User as UserType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users, FileText, Workflow, ListChecks, Search, Plus, Filter,
  CheckCircle2, Clock, AlertTriangle, Eye, Edit, Trash2, Download,
  Building2, UserCheck, ArrowRight, Sparkles, Brain, Target,
  RefreshCw, ChevronRight, ChevronDown, BarChart3, Shield, Layers, GitBranch,
  BookOpen, Folder, FileCheck, TrendingUp, Calendar, User,
  Settings, Send, Activity, Zap, Network, Link2, CheckCircle,
  XCircle, PlayCircle, PauseCircle, Archive, ArrowRightCircle,
  AlertCircle, ThumbsUp, ThumbsDown, MessageSquare, Save, Wand2
} from "lucide-react";
import { useTenant } from "@/contexts/tenant-context";

// Approval workflow type
interface ApprovalConfig {
  requiredApprovals: 1 | 2 | 3 | 4 | 5;
  approvers: { stage: number; userId: string; name: string; approved: boolean; approvedAt?: string }[];
  completedApprovals: number;
  approvalHistory: { action: string; by: string; at: string; comment?: string }[];
}

// Base item type with approval config
interface GRCItem {
  id: string;
  name: string;
  status: string;
  approvalStage: number;
  approvalConfig?: ApprovalConfig;
  description?: string;
  content?: string;
  [key: string]: any;
}

const approvalStages = [
  { id: "draft", name: "Draft", icon: FileText, color: "bg-slate-500", description: "Initial creation" },
  { id: "review", name: "Under Review", icon: Eye, color: "bg-blue-500", description: "Content review" },
  { id: "approval", name: "Pending Approval", icon: Clock, color: "bg-amber-500", description: "Awaiting approval" },
  { id: "published", name: "Published", icon: CheckCircle, color: "bg-emerald-500", description: "Active & live" },
  { id: "retired", name: "Retired", icon: Archive, color: "bg-gray-500", description: "No longer active" },
];

const pillars = [
  { id: "frameworks", name: "Frameworks", icon: BookOpen, color: "from-indigo-500 to-violet-500", description: "Compliance frameworks" },
  { id: "controls", name: "Controls", icon: Shield, color: "from-rose-500 to-red-500", description: "Security controls" },
  { id: "policies", name: "Policies", icon: FileText, color: "from-purple-500 to-pink-500", description: "Rules & guidelines" },
  { id: "processes", name: "Processes", icon: Workflow, color: "from-amber-500 to-orange-500", description: "Workflows" },
  { id: "procedures", name: "Procedures", icon: ListChecks, color: "from-emerald-500 to-teal-500", description: "Step-by-step instructions" },
  { id: "people", name: "People", icon: Users, color: "from-blue-500 to-cyan-500", description: "Roles & responsibilities" },
];

// Note: availableApprovers is now derived from apiUsers in the component

const createDefaultApprovalConfig = (requiredApprovals: 1 | 2 | 3 | 4 | 5 = 1): ApprovalConfig => ({
  requiredApprovals,
  approvers: [],
  completedApprovals: 0,
  approvalHistory: [],
});
function ApprovalProgressIndicator({ item }: { item: GRCItem }) {
  const config = item.approvalConfig;
  if (!config) return null;
  
  const completed = config.completedApprovals;
  const required = config.requiredApprovals;
  const percentage = (completed / required) * 100;
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: required }).map((_, idx) => (
          <div 
            key={idx}
            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
              idx < completed ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
            }`}
          >
            {idx < completed ? <CheckCircle2 className="w-2.5 h-2.5" /> : idx + 1}
          </div>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {completed}/{required}
      </span>
      {completed >= required && item.status !== 'published' && (
        <Badge className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px]">Ready to Publish</Badge>
      )}
    </div>
  );
}

function ApprovalWorkflowIndicator({ currentStage, itemType }: { currentStage: number; itemType: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {approvalStages.map((stage, idx) => (
        <div key={stage.id} className="flex items-center">
          <div 
            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
              idx + 1 < currentStage ? 'bg-emerald-500 text-white' :
              idx + 1 === currentStage ? stage.color + ' text-white' :
              'bg-muted text-muted-foreground'
            }`}
            title={stage.name}
          >
            {idx + 1 < currentStage ? <CheckCircle2 className="w-2.5 h-2.5" /> : idx + 1}
          </div>
          {idx < approvalStages.length - 1 && (
            <div className={`w-2 h-0.5 ${idx + 1 < currentStage ? 'bg-emerald-500' : 'bg-muted'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function ApprovalDialog({ 
  open, 
  onClose, 
  item, 
  itemType, 
  onApprove, 
  onReject,
  onUpdateApprovalConfig,
  availableApprovers
}: { 
  open: boolean; 
  onClose: () => void; 
  item: GRCItem | null; 
  itemType: string;
  onApprove: () => void;
  onReject: () => void;
  onUpdateApprovalConfig: (config: ApprovalConfig) => void;
  availableApprovers: { id: string; name: string; role: string }[];
}) {
  const [selectedApprovalCount, setSelectedApprovalCount] = useState<string>(
    item?.approvalConfig?.requiredApprovals?.toString() || "1"
  );
  const [approverSelections, setApproverSelections] = useState<{[key: number]: string}>({});
  
  const config = item?.approvalConfig;
  const completed = config?.completedApprovals || 0;
  const required = config?.requiredApprovals || 1;
  const allApprovalsComplete = completed >= required;
  const canPublish = allApprovalsComplete && item?.status !== 'published';
  
  const handleSaveApprovalConfig = () => {
    const newRequired = parseInt(selectedApprovalCount) as 1 | 2 | 3 | 4 | 5;
    const newApprovers: ApprovalConfig['approvers'] = [];
    
    for (let i = 1; i <= newRequired; i++) {
      const approverId = approverSelections[i];
      if (approverId) {
        const approver = availableApprovers.find(a => a.id === approverId);
        if (approver) {
          const existing = config?.approvers.find(a => a.stage === i);
          newApprovers.push({
            stage: i,
            userId: approver.id,
            name: approver.name,
            approved: existing?.userId === approverId ? existing.approved : false,
            approvedAt: existing?.userId === approverId ? existing.approvedAt : undefined
          });
        }
      }
    }
    
    onUpdateApprovalConfig({
      requiredApprovals: newRequired,
      approvers: newApprovers,
      completedApprovals: newApprovers.filter(a => a.approved).length,
      approvalHistory: config?.approvalHistory || []
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Approval Workflow - {item?.name}
          </DialogTitle>
          <DialogDescription>
            Configure approval requirements and manage approvals for this {itemType}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Approval Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Required Approvals</Label>
                  <Select 
                    value={selectedApprovalCount} 
                    onValueChange={setSelectedApprovalCount}
                  >
                    <SelectTrigger data-testid="select-approval-count">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Approval</SelectItem>
                      <SelectItem value="2">2 Approvals</SelectItem>
                      <SelectItem value="3">3 Approvals</SelectItem>
                      <SelectItem value="4">4 Approvals</SelectItem>
                      <SelectItem value="5">5 Approvals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={handleSaveApprovalConfig}
                    data-testid="button-save-approval-config"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Configuration
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>Assign Approvers</Label>
                {Array.from({ length: parseInt(selectedApprovalCount) }).map((_, idx) => {
                  const stageNum = idx + 1;
                  const existingApprover = config?.approvers.find(a => a.stage === stageNum);
                  return (
                    <div key={stageNum} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        existingApprover?.approved ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                      }`}>
                        {existingApprover?.approved ? <CheckCircle2 className="w-4 h-4" /> : stageNum}
                      </div>
                      <div className="flex-1">
                        <Select 
                          value={approverSelections[stageNum] || existingApprover?.userId || ""}
                          onValueChange={(value) => setApproverSelections(prev => ({ ...prev, [stageNum]: value }))}
                        >
                          <SelectTrigger data-testid={`select-approver-${stageNum}`}>
                            <SelectValue placeholder={`Select Approver ${stageNum}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableApprovers.map(approver => (
                              <SelectItem key={approver.id} value={approver.id}>
                                {approver.name} ({approver.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {existingApprover?.approved && (
                        <Badge className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                          Approved {existingApprover.approvedAt}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Approval Progress
                </span>
                <Badge variant={allApprovalsComplete ? "default" : "secondary"}>
                  {completed} of {required} Approvals
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={(completed / required) * 100} className="h-2" />
              
              {canPublish && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">All approvals complete! Ready to publish.</span>
                </div>
              )}
              
              <div className="pt-2">
                <h4 className="text-sm font-medium mb-2">Actions</h4>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    onClick={onApprove}
                    disabled={item?.status === 'published' || item?.status === 'retired'}
                    data-testid="button-approve-item"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    {canPublish ? 'Publish' : 'Record Approval'}
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={onReject}
                    disabled={completed === 0}
                    data-testid="button-reject-item"
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Reject / Reset
                  </Button>
                  <Button variant="outline" data-testid="button-add-comment">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {config?.approvalHistory && config.approvalHistory.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Approval History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[120px]">
                  <div className="space-y-2">
                    {config.approvalHistory.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm p-2 rounded bg-muted/30">
                        <Badge variant={entry.action === 'approved' ? 'default' : entry.action === 'rejected' ? 'destructive' : 'secondary'} className="text-[10px]">
                          {entry.action}
                        </Badge>
                        <span className="text-muted-foreground">{entry.by}</span>
                        <span className="text-muted-foreground text-xs">{entry.at}</span>
                        {entry.comment && <span className="text-xs italic">"{entry.comment}"</span>}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// Expandable Detail Row Component
function ExpandableDetailView({ 
  item, 
  itemType, 
  onEnrich, 
  onExpand,
  isEnriching,
  onApprove,
  onReject,
  onUpdateApprovalConfig,
  availableApprovers
}: { 
  item: GRCItem; 
  itemType: 'policy' | 'process' | 'procedure';
  onEnrich: () => void;
  onExpand: () => void;
  isEnriching: boolean;
  onApprove?: (item: GRCItem, itemType: string) => void;
  onReject?: (item: GRCItem, itemType: string) => void;
  onUpdateApprovalConfig?: (config: ApprovalConfig) => void;
  availableApprovers: { id: string; name: string; role: string }[];
}) {
  const [selectedApprovalCount, setSelectedApprovalCount] = useState(item.approvalConfig?.requiredApprovals?.toString() || "1");
  const [approverSelections, setApproverSelections] = useState<{[key: number]: string}>({});
  
  // Initialize approver selections from existing config
  useEffect(() => {
    if (item.approvalConfig?.approvers) {
      const existingSelections: {[key: number]: string} = {};
      item.approvalConfig.approvers.forEach(a => {
        existingSelections[a.stage] = a.userId;
      });
      setApproverSelections(existingSelections);
    }
  }, [item.approvalConfig]);
  
  // Generate dynamic linkages based on item's related data
  const getLinkages = () => {
    if (itemType === 'policy') {
      return {
        frameworks: item.linkedControls?.slice(0, 3).map(c => c.split('-')[0]) || [],
        controls: item.linkedControls || [],
        processes: [],
        procedures: []
      };
    }
    if (itemType === 'process') {
      return {
        policies: item.linkedPolicies || [],
        procedures: [],
        frameworks: [],
        controls: item.linkedControls || []
      };
    }
    return {
      process: item.process || '',
      policies: item.linkedPolicies || [],
      frameworks: [],
      controls: item.linkedControls || []
    };
  };
  
  const linkages = getLinkages();
  const config = item.approvalConfig;
  const completed = config?.completedApprovals || 0;
  const required = config?.requiredApprovals || 1;
  const allApprovalsComplete = completed >= required;
  const canPublish = allApprovalsComplete && item.status !== 'published';
  
  const handleSaveApprovalConfig = () => {
    if (!onUpdateApprovalConfig) return;
    const newRequired = parseInt(selectedApprovalCount) as 1 | 2 | 3 | 4 | 5;
    const newApprovers: ApprovalConfig['approvers'] = [];
    
    for (let i = 1; i <= newRequired; i++) {
      const approverId = approverSelections[i];
      const existing = config?.approvers.find(a => a.stage === i);
      
      if (approverId) {
        const approver = availableApprovers.find(a => a.id === approverId);
        if (approver) {
          newApprovers.push({
            stage: i,
            userId: approver.id,
            name: approver.name,
            approved: existing?.userId === approverId ? existing.approved : false,
            approvedAt: existing?.userId === approverId ? existing.approvedAt : undefined
          });
        }
      } else if (existing) {
        newApprovers.push(existing);
      }
    }
    
    onUpdateApprovalConfig({
      requiredApprovals: newRequired,
      approvers: newApprovers,
      completedApprovals: newApprovers.filter(a => a.approved).length,
      approvalHistory: config?.approvalHistory || []
    });
  };
  
  return (
    <div className="bg-card/50 dark:bg-gradient-to-br dark:from-slate-900/50 dark:to-slate-800/50 border border-purple-500/20 rounded-lg p-4 mt-2 space-y-4">
      {/* Approval Workflow Section */}
      <div className="bg-amber-50 dark:bg-gradient-to-r dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-300 flex items-center gap-2">
            <GitBranch className="w-4 h-4" /> Approval Workflow
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Approval Levels:</span>
            <Select value={selectedApprovalCount} onValueChange={setSelectedApprovalCount}>
              <SelectTrigger className="w-16 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map(n => (
                  <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={handleSaveApprovalConfig} className="h-7 text-xs">
              Save Config
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-5 gap-2 mb-3">
          {Array.from({ length: parseInt(selectedApprovalCount) }).map((_, idx) => {
            const stage = idx + 1;
            const approver = config?.approvers.find(a => a.stage === stage);
            const isApproved = approver?.approved;
            return (
              <div key={stage} className={`p-2 rounded-md border text-center ${isApproved ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-500/50' : 'bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600/30'}`}>
                <div className="text-xs font-medium mb-1">Stage {stage}</div>
                <Select value={approverSelections[stage] || approver?.userId || ""} onValueChange={(val) => setApproverSelections(prev => ({...prev, [stage]: val}))}>
                  <SelectTrigger className="h-6 text-xs">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableApprovers.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isApproved && <Badge className="mt-1 text-[10px] bg-emerald-100 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">Approved</Badge>}
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xs">
              Progress: <span className="font-semibold text-amber-600 dark:text-amber-400">{completed}/{required}</span>
            </div>
            {canPublish && (
              <Badge className="bg-emerald-100 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs border-emerald-500/30">Ready to Publish</Badge>
            )}
          </div>
          <div className="flex gap-2">
            {!allApprovalsComplete && onApprove && (
              <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-500/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20" onClick={() => onApprove(item, itemType.charAt(0).toUpperCase() + itemType.slice(1))}>
                <CheckCircle className="w-3 h-3 mr-1" /> Approve Stage {completed + 1}
              </Button>
            )}
            {onReject && (
              <Button size="sm" variant="outline" className="h-7 text-xs border-red-500/50 text-red-400 hover:bg-red-500/20" onClick={() => onReject(item, itemType.charAt(0).toUpperCase() + itemType.slice(1))}>
                <XCircle className="w-3 h-3 mr-1" /> Reject
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1">Description</h4>
            <p className="text-sm text-muted-foreground">{item.description || 'No description available'}</p>
          </div>
          
          {item.content && (
            <div>
              <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1">Content</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap max-h-32 overflow-y-auto">{item.content}</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 ml-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEnrich}
            disabled={isEnriching}
            className="border-purple-500/50"
            data-testid={`button-enrich-${item.id}`}
          >
            {isEnriching ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1" />}
            Enrich Content
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onExpand}
            disabled={isEnriching}
            className="border-purple-500/50"
            data-testid={`button-expand-${item.id}`}
          >
            {isEnriching ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
            Expand Details
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-purple-500/20">
        {'frameworks' in linkages && linkages.frameworks.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Applicable Frameworks
            </h5>
            <div className="flex flex-wrap gap-1">
              {linkages.frameworks.map((fw, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                  {fw}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {'controls' in linkages && linkages.controls.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-rose-400 mb-2 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Mapped Controls
            </h5>
            <div className="flex flex-wrap gap-1">
              {linkages.controls.map((ctrl, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-rose-500/10 border-rose-500/30 text-rose-300">
                  {ctrl}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {itemType === 'policy' && 'processes' in linkages && linkages.processes.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
              <Workflow className="w-3 h-3" /> Related Processes
            </h5>
            <div className="flex flex-wrap gap-1">
              {linkages.processes.map((proc, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-amber-50 dark:bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300">
                  {proc}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {itemType === 'policy' && 'procedures' in linkages && linkages.procedures.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-cyan-400 mb-2 flex items-center gap-1">
              <ListChecks className="w-3 h-3" /> Related Procedures
            </h5>
            <div className="flex flex-wrap gap-1">
              {linkages.procedures.map((prc, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-cyan-500/10 border-cyan-500/30 text-cyan-300">
                  {prc}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {itemType === 'process' && 'policies' in linkages && linkages.policies.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1">
              <FileText className="w-3 h-3" /> Related Policies
            </h5>
            <div className="flex flex-wrap gap-1">
              {linkages.policies.map((pol, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-purple-50 dark:bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300">
                  {pol}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {itemType === 'process' && 'procedures' in linkages && linkages.procedures.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-cyan-400 mb-2 flex items-center gap-1">
              <ListChecks className="w-3 h-3" /> Related Procedures
            </h5>
            <div className="flex flex-wrap gap-1">
              {linkages.procedures.map((prc, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-cyan-500/10 border-cyan-500/30 text-cyan-300">
                  {prc}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {itemType === 'procedure' && 'process' in linkages && linkages.process && (
          <div>
            <h5 className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
              <Workflow className="w-3 h-3" /> Parent Process
            </h5>
            <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300">
              {linkages.process}
            </Badge>
          </div>
        )}
        
        {itemType === 'procedure' && 'policies' in linkages && linkages.policies.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1">
              <FileText className="w-3 h-3" /> Related Policies
            </h5>
            <div className="flex flex-wrap gap-1">
              {linkages.policies.map((pol, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-purple-50 dark:bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300">
                  {pol}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-purple-500/20">
        <div>
          <span className="text-xs text-muted-foreground">Owner</span>
          <p className="text-sm font-medium">{item.owner || 'Not assigned'}</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Version</span>
          <p className="text-sm font-medium">{item.version || 'v1.0'}</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Last Review</span>
          <p className="text-sm font-medium">{item.lastReview || item.lastUpdated || 'N/A'}</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Next Review</span>
          <p className="text-sm font-medium">{item.nextReview || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}

// Content enrichment functions that generate detailed content
function generatePolicyEnrichment(item: GRCItem): string {
  // Generate dynamic linkages from item's related data
  const linkages = {
    frameworks: item.linkedControls?.slice(0, 3).map(c => c.split('-')[0]) || [],
    controls: item.linkedControls || [],
    processes: [],
    procedures: []
  };
  return `${item.content || item.description || ''}

═══════════════════════════════════════════════════════════════
                    ENHANCED POLICY CONTENT
═══════════════════════════════════════════════════════════════

1. POLICY OVERVIEW
────────────────────────────────────────────────────────────────
Policy Name: ${item.name}
Version: ${item.version || '1.0'}
Classification: ${item.category || 'General'}
Status: ${item.status}
Owner: ${item.owner || 'Not Assigned'}

2. PURPOSE & SCOPE
────────────────────────────────────────────────────────────────
2.1 Purpose
This policy establishes the organizational requirements and guidelines for ${item.name?.toLowerCase()}. It defines the principles, responsibilities, and procedures necessary to ensure compliance with applicable regulations and industry standards.

2.2 Scope
• Applies to all employees, contractors, and third parties
• Covers all organizational systems, data, and processes
• Encompasses physical and digital environments
• Extends to remote work and cloud-based operations

3. ROLES & RESPONSIBILITIES
────────────────────────────────────────────────────────────────
Executive Leadership:
• Approve policy and allocate resources
• Ensure organizational compliance
• Review policy effectiveness annually

Policy Owner (${item.owner || 'TBD'}):
• Maintain and update policy content
• Coordinate training and awareness
• Monitor compliance and report violations

Department Heads:
• Implement policy within their areas
• Ensure staff understanding and compliance
• Report issues and suggest improvements

All Personnel:
• Read and acknowledge the policy
• Comply with all requirements
• Report violations or concerns

4. REGULATORY COMPLIANCE
────────────────────────────────────────────────────────────────
This policy supports compliance with:
${linkages.frameworks.map(fw => `• ${fw}`).join('\n') || '• To be mapped to applicable frameworks'}

Mapped Controls:
${linkages.controls.map(ctrl => `• ${ctrl}`).join('\n') || '• Control mapping pending'}

5. POLICY REQUIREMENTS
────────────────────────────────────────────────────────────────
5.1 General Requirements
• All activities must align with organizational objectives
• Regular risk assessments must be conducted
• Documentation must be maintained for audit purposes
• Exceptions require formal approval

5.2 Specific Requirements
• Implementation within 30 days of approval
• Training completion within 14 days
• Annual review and attestation
• Quarterly compliance reporting

6. ENFORCEMENT & EXCEPTIONS
────────────────────────────────────────────────────────────────
Non-compliance may result in:
• Formal warning
• Mandatory retraining
• Disciplinary action
• Termination (severe cases)

Exception Process:
1. Submit exception request to Policy Owner
2. Risk assessment by relevant stakeholders
3. Approval by appropriate authority
4. Documentation and periodic review

7. REVIEW & MAINTENANCE
────────────────────────────────────────────────────────────────
• Review Frequency: Annual (or upon significant change)
• Last Review: ${item.lastReview || 'N/A'}
• Next Review: ${item.nextReview || 'TBD'}
• Change Control: All updates require approval workflow

═══════════════════════════════════════════════════════════════`;
}

function generateProcessEnrichment(item: GRCItem): string {
  // Generate dynamic linkages from item's related data
  const linkages = {
    policies: item.linkedPolicies || [],
    procedures: [],
    frameworks: [],
    controls: item.linkedControls || []
  };
  return `${item.content || item.description || ''}

═══════════════════════════════════════════════════════════════
                    ENHANCED PROCESS CONTENT
═══════════════════════════════════════════════════════════════

1. PROCESS OVERVIEW
────────────────────────────────────────────────────────────────
Process Name: ${item.name}
Category: ${item.category || 'General'}
Owner: ${item.owner || 'Not Assigned'}
Automation Level: ${item.automationLevel || 0}%
Total Steps: ${item.steps || 'N/A'}

2. PROCESS OBJECTIVES
────────────────────────────────────────────────────────────────
Primary Objective:
Establish a systematic and repeatable approach to ${item.name?.toLowerCase()} that ensures consistency, compliance, and continuous improvement.

Key Outcomes:
• Standardized execution across the organization
• Measurable performance metrics
• Audit-ready documentation
• Regulatory compliance assurance

3. PROCESS FLOW
────────────────────────────────────────────────────────────────
Phase 1: INITIATION
├── Trigger identification
├── Stakeholder notification
├── Resource allocation
└── Timeline establishment

Phase 2: PLANNING
├── Scope definition
├── Risk assessment
├── Resource planning
└── Communication plan

Phase 3: EXECUTION
├── Task assignment
├── Activity monitoring
├── Issue management
└── Progress tracking

Phase 4: CONTROL & MONITORING
├── Quality checks
├── Compliance verification
├── Performance measurement
└── Exception handling

Phase 5: CLOSURE
├── Deliverable review
├── Documentation completion
├── Lessons learned
└── Process improvement

4. LINKED POLICIES
────────────────────────────────────────────────────────────────
${linkages.policies.map(pol => `• ${pol}`).join('\n') || '• Policy mapping pending'}

5. SUPPORTING PROCEDURES
────────────────────────────────────────────────────────────────
${linkages.procedures.map(prc => `• ${prc}`).join('\n') || '• Procedure mapping pending'}

6. COMPLIANCE MAPPING
────────────────────────────────────────────────────────────────
Frameworks:
${linkages.frameworks.map(fw => `• ${fw}`).join('\n') || '• Framework mapping pending'}

Controls:
${linkages.controls.map(ctrl => `• ${ctrl}`).join('\n') || '• Control mapping pending'}

7. PERFORMANCE METRICS (KPIs)
────────────────────────────────────────────────────────────────
• Cycle Time: Average time from initiation to closure
• Quality Score: Defect rate and rework percentage
• Compliance Rate: Adherence to policy requirements
• Automation Index: Percentage of automated activities
• Stakeholder Satisfaction: Feedback scores

8. CONTINUOUS IMPROVEMENT
────────────────────────────────────────────────────────────────
Review Cycle: Quarterly
Improvement Sources:
• Process performance data
• Stakeholder feedback
• Audit findings
• Industry best practices

═══════════════════════════════════════════════════════════════`;
}

function generateProcedureEnrichment(item: GRCItem): string {
  // Generate dynamic linkages from item's related data
  const linkages = {
    process: item.process || '',
    policies: item.linkedPolicies || [],
    frameworks: [],
    controls: item.linkedControls || []
  };
  return `${item.content || item.description || ''}

═══════════════════════════════════════════════════════════════
                  ENHANCED PROCEDURE CONTENT
═══════════════════════════════════════════════════════════════

1. PROCEDURE OVERVIEW
────────────────────────────────────────────────────────────────
Procedure Name: ${item.name}
Parent Process: ${item.process || linkages.process || 'N/A'}
Complexity: ${item.complexity || 'Medium'}
Total Steps: ${item.steps || 'N/A'}
Last Updated: ${item.lastUpdated || 'N/A'}

2. PURPOSE
────────────────────────────────────────────────────────────────
This procedure provides step-by-step instructions for executing ${item.name?.toLowerCase()}. It ensures consistent execution, reduces errors, and maintains compliance with organizational policies and regulatory requirements.

3. PREREQUISITES
────────────────────────────────────────────────────────────────
Required Access:
• System access with appropriate permissions
• Authorization from supervisor/manager
• Completion of required training

Required Knowledge:
• Understanding of relevant policies
• Familiarity with supporting tools
• Awareness of compliance requirements

4. STEP-BY-STEP INSTRUCTIONS
────────────────────────────────────────────────────────────────
STEP 1: PREPARATION
□ Review procedure requirements
□ Gather necessary documentation
□ Verify system access and permissions
□ Notify relevant stakeholders

STEP 2: INITIAL ASSESSMENT
□ Evaluate the request/trigger
□ Determine scope and impact
□ Identify any special requirements
□ Document initial findings

STEP 3: EXECUTION
□ Follow established workflow
□ Document all actions taken
□ Capture evidence and artifacts
□ Handle exceptions per guidelines

STEP 4: VERIFICATION
□ Review completed work
□ Validate against requirements
□ Perform quality checks
□ Obtain necessary approvals

STEP 5: CLOSURE
□ Complete all documentation
□ Update relevant systems/records
□ Notify stakeholders of completion
□ Archive evidence for audit

5. RELATED POLICIES
────────────────────────────────────────────────────────────────
${linkages.policies.map(pol => `• ${pol}`).join('\n') || '• Policy mapping pending'}

6. COMPLIANCE CONTROLS
────────────────────────────────────────────────────────────────
Frameworks:
${linkages.frameworks.map(fw => `• ${fw}`).join('\n') || '• Framework mapping pending'}

Controls:
${linkages.controls.map(ctrl => `• ${ctrl}`).join('\n') || '• Control mapping pending'}

7. TROUBLESHOOTING
────────────────────────────────────────────────────────────────
Common Issue 1: Access Denied
→ Solution: Verify permissions and contact IT support

Common Issue 2: System Unavailable
→ Solution: Check system status and use backup procedure

Common Issue 3: Missing Information
→ Solution: Contact requester for clarification

Escalation Path:
Level 1: Team Lead
Level 2: Department Manager
Level 3: Process Owner

8. APPENDICES
────────────────────────────────────────────────────────────────
A. Reference Documents
B. Forms and Templates
C. System Access Guide
D. Contact Information

═══════════════════════════════════════════════════════════════`;
}

function EditItemDialog({
  open,
  onClose,
  item,
  itemType,
  onSave,
  onApprove,
  onReject,
  onUpdateApprovalConfig,
  availableApprovers
}: {
  open: boolean;
  onClose: () => void;
  item: GRCItem | null;
  itemType: string;
  onSave: (updates: Partial<GRCItem>) => void;
  onApprove?: () => void;
  onReject?: () => void;
  onUpdateApprovalConfig?: (config: ApprovalConfig) => void;
  availableApprovers: { id: string; name: string; role: string }[];
}) {
  const [name, setName] = useState(item?.name || "");
  const [description, setDescription] = useState(item?.description || "");
  const [content, setContent] = useState(item?.content || "");
  const [isEnriching, setIsEnriching] = useState(false);
  const [activeDialogTab, setActiveDialogTab] = useState("details");
  const [selectedApprovalCount, setSelectedApprovalCount] = useState<string>(
    item?.approvalConfig?.requiredApprovals?.toString() || "1"
  );
  const [approverSelections, setApproverSelections] = useState<{[key: number]: string}>({});
  
  const config = item?.approvalConfig;
  const completed = config?.completedApprovals || 0;
  const required = config?.requiredApprovals || 1;
  const allApprovalsComplete = completed >= required;
  const canPublish = allApprovalsComplete && item?.status !== 'published';
  
  // Sync local state when item changes
  useEffect(() => {
    if (item) {
      setName(item.name || "");
      setDescription(item.description || "");
      setContent(item.content || "");
      setSelectedApprovalCount(item.approvalConfig?.requiredApprovals?.toString() || "1");
      // Initialize approverSelections from existing config
      if (item.approvalConfig?.approvers) {
        const existingSelections: {[key: number]: string} = {};
        item.approvalConfig.approvers.forEach(a => {
          existingSelections[a.stage] = a.userId;
        });
        setApproverSelections(existingSelections);
      } else {
        setApproverSelections({});
      }
    }
  }, [item]);
  
  const handleSaveApprovalConfig = () => {
    if (!onUpdateApprovalConfig || !item) return;
    const newRequired = parseInt(selectedApprovalCount) as 1 | 2 | 3 | 4 | 5;
    const newApprovers: ApprovalConfig['approvers'] = [];
    
    for (let i = 1; i <= newRequired; i++) {
      // Use selection or fall back to existing approver
      const approverId = approverSelections[i];
      const existing = config?.approvers.find(a => a.stage === i);
      
      if (approverId) {
        const approver = availableApprovers.find(a => a.id === approverId);
        if (approver) {
          newApprovers.push({
            stage: i,
            userId: approver.id,
            name: approver.name,
            approved: existing?.userId === approverId ? existing.approved : false,
            approvedAt: existing?.userId === approverId ? existing.approvedAt : undefined
          });
        }
      } else if (existing) {
        // Preserve existing approver if no new selection
        newApprovers.push(existing);
      }
    }
    
    onUpdateApprovalConfig({
      requiredApprovals: newRequired,
      approvers: newApprovers,
      completedApprovals: newApprovers.filter(a => a.approved).length,
      approvalHistory: config?.approvalHistory || []
    });
  };
  
  const handleEnrich = () => {
    if (!item) return;
    setIsEnriching(true);
    setTimeout(() => {
      let enrichedContent = content;
      if (itemType === 'Policy') {
        enrichedContent = generatePolicyEnrichment({ ...item, content });
      } else if (itemType === 'Process') {
        enrichedContent = generateProcessEnrichment({ ...item, content });
      } else if (itemType === 'Procedure') {
        enrichedContent = generateProcedureEnrichment({ ...item, content });
      }
      setContent(enrichedContent);
      setIsEnriching(false);
    }, 1500);
  };
  
  const handleExpand = () => {
    if (!item) return;
    setIsEnriching(true);
    setTimeout(() => {
      const expandedContent = `${content}

══════════════════════════════════════════════════════════════
                    EXPANDED DETAILED SECTIONS
══════════════════════════════════════════════════════════════

SECTION A: IMPLEMENTATION ROADMAP
────────────────────────────────────────────────────────────────
Phase 1: Assessment (Week 1-2)
□ Current state analysis
□ Gap identification
□ Stakeholder interviews
□ Resource requirement analysis

Phase 2: Design (Week 3-4)
□ Solution architecture
□ Process flow design
□ Control framework mapping
□ Documentation templates

Phase 3: Implementation (Week 5-8)
□ Phased rollout plan
□ Training program execution
□ System configuration
□ Pilot testing

Phase 4: Validation (Week 9-10)
□ Compliance testing
□ User acceptance testing
□ Performance validation
□ Audit readiness review

SECTION B: RISK CONSIDERATIONS
────────────────────────────────────────────────────────────────
Identified Risks:
1. Non-compliance Risk
   - Likelihood: Medium
   - Impact: High
   - Mitigation: Regular audits and training

2. Operational Disruption
   - Likelihood: Low
   - Impact: Medium
   - Mitigation: Phased implementation

3. Resource Constraints
   - Likelihood: Medium
   - Impact: Medium
   - Mitigation: Early resource planning

SECTION C: METRICS & MONITORING
────────────────────────────────────────────────────────────────
Key Performance Indicators:
• Compliance Rate: Target 95%
• Training Completion: Target 100%
• Audit Findings: Target <3 per quarter
• Process Cycle Time: Baseline + 10% improvement

Monitoring Frequency:
• Daily: System health checks
• Weekly: Progress reports
• Monthly: Compliance dashboard
• Quarterly: Full assessment review

SECTION D: TRAINING REQUIREMENTS
────────────────────────────────────────────────────────────────
Required Training Modules:
1. Policy Awareness (All Staff) - 30 mins
2. Process Deep-Dive (Executors) - 2 hours
3. Compliance Workshop (Managers) - 4 hours
4. Audit Preparation (Compliance Team) - 1 day

Training Delivery Methods:
• E-learning modules
• Instructor-led sessions
• Hands-on workshops
• Assessment and certification

SECTION E: AUDIT & EVIDENCE
────────────────────────────────────────────────────────────────
Evidence Requirements:
□ Signed acknowledgment forms
□ Training completion records
□ System access logs
□ Exception request documentation
□ Review meeting minutes
□ Compliance reports

Retention Period: 7 years
Storage Location: GRC Document Repository
Access Controls: Role-based permissions

══════════════════════════════════════════════════════════════`;
      setContent(expandedContent);
      setIsEnriching(false);
    }, 1500);
  };
  
  const handleSave = () => {
    onSave({ name, description, content });
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Edit {itemType} - {item?.name}
          </DialogTitle>
          <DialogDescription>
            Modify, enrich, or manage approval workflow for this {itemType.toLowerCase()}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeDialogTab} onValueChange={setActiveDialogTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" data-testid="dialog-tab-details">
              <FileText className="w-4 h-4 mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="approval" data-testid="dialog-tab-approval">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approval
            </TabsTrigger>
            <TabsTrigger value="linkages" data-testid="dialog-tab-linkages">
              <Network className="w-4 h-4 mr-2" />
              Linkages
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 py-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium">Status:</span>
              {item?.status === "published" ? (
                <Badge className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">Published</Badge>
              ) : item?.status === "draft" ? (
                <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Draft</Badge>
              ) : (
                <Badge variant="outline">{item?.status}</Badge>
              )}
              {item?.status !== 'published' && (
                <span className="text-xs text-muted-foreground ml-2">
                  (Must complete approval workflow to publish)
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="item-name">Name</Label>
              <Input
                id="item-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-item-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="item-description">Description</Label>
              <Textarea
                id="item-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                data-testid="input-item-description"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="item-content">Content</Label>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleEnrich}
                    disabled={isEnriching}
                    data-testid="button-enrich-content"
                  >
                    {isEnriching ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1" />}
                    Enrich Content
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExpand}
                    disabled={isEnriching}
                    data-testid="button-expand-content"
                  >
                    {isEnriching ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                    Expand Details
                  </Button>
                </div>
              </div>
              <Textarea
                id="item-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="font-mono text-sm"
                data-testid="input-item-content"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="approval" className="space-y-4 py-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Approval Configuration
                </CardTitle>
                <CardDescription>
                  Configure approval levels (1-5) and assign approvers for each level
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Required Approvals</Label>
                    <Select 
                      value={selectedApprovalCount} 
                      onValueChange={setSelectedApprovalCount}
                    >
                      <SelectTrigger data-testid="dialog-select-approval-count">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Approval</SelectItem>
                        <SelectItem value="2">2 Approvals</SelectItem>
                        <SelectItem value="3">3 Approvals</SelectItem>
                        <SelectItem value="4">4 Approvals</SelectItem>
                        <SelectItem value="5">5 Approvals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      onClick={handleSaveApprovalConfig}
                      data-testid="dialog-button-save-approval-config"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Configuration
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label>Assign Approvers</Label>
                  {Array.from({ length: parseInt(selectedApprovalCount) }).map((_, idx) => {
                    const stageNum = idx + 1;
                    const existingApprover = config?.approvers.find(a => a.stage === stageNum);
                    return (
                      <div key={stageNum} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                          existingApprover?.approved ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                          {existingApprover?.approved ? <CheckCircle2 className="w-4 h-4" /> : stageNum}
                        </div>
                        <div className="flex-1">
                          <Select 
                            value={approverSelections[stageNum] || existingApprover?.userId || ""}
                            onValueChange={(value) => setApproverSelections(prev => ({ ...prev, [stageNum]: value }))}
                          >
                            <SelectTrigger data-testid={`dialog-select-approver-${stageNum}`}>
                              <SelectValue placeholder={`Select Approver ${stageNum}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {availableApprovers.map(approver => (
                                <SelectItem key={approver.id} value={approver.id}>
                                  {approver.name} ({approver.role})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {existingApprover?.approved && (
                          <Badge className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                            Approved {existingApprover.approvedAt}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Approval Progress
                  </span>
                  <Badge variant={allApprovalsComplete ? "default" : "secondary"}>
                    {completed} of {required} Approvals
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={(completed / required) * 100} className="h-2" />
                
                {item?.status === 'published' && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">This {itemType.toLowerCase()} is published and active.</span>
                  </div>
                )}
                
                {canPublish && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">All approvals complete! Ready to publish.</span>
                  </div>
                )}
                
                {item?.status === 'draft' && !allApprovalsComplete && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-500/20">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                      This {itemType.toLowerCase()} is in draft status. Complete all approvals to publish.
                    </span>
                  </div>
                )}
                
                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-2">Actions</h4>
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      onClick={onApprove}
                      disabled={item?.status === 'published' || item?.status === 'retired' || !onApprove}
                      data-testid="dialog-button-approve-item"
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      {canPublish ? 'Publish' : 'Record Approval'}
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={onReject}
                      disabled={completed === 0 || !onReject}
                      data-testid="dialog-button-reject-item"
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" />
                      Reject / Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {config?.approvalHistory && config.approvalHistory.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Approval History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[150px]">
                    <div className="space-y-2">
                      {config.approvalHistory.map((entry, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                          {entry.action === 'approved' ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                          )}
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{entry.by}</span>
                              <span className="text-xs text-muted-foreground">{entry.at}</span>
                            </div>
                            {entry.comment && <span className="text-xs italic">"{entry.comment}"</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="linkages" className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Related Items
                </CardTitle>
                <CardDescription>
                  View linked frameworks, controls, and related items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Linkage information is displayed in the expanded view of the {itemType.toLowerCase()} list.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} data-testid="button-save-item">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PolicyNexusPage() {
  const { currentTenantId } = useTenant();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Handle URL query parameter for tab selection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['overview', 'policies', 'processes', 'procedures', 'frameworks', 'controls', 'people', 'linkages', 'approvals'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GRCItem | null>(null);
  const [selectedItemType, setSelectedItemType] = useState("");
  
  // Expanded items tracking
  const [expandedPolicies, setExpandedPolicies] = useState<Set<string>>(new Set());
  const [expandedProcesses, setExpandedProcesses] = useState<Set<string>>(new Set());
  const [expandedProcedures, setExpandedProcedures] = useState<Set<string>>(new Set());
  const [enrichingItemId, setEnrichingItemId] = useState<string | null>(null);

  // Fetch real data from APIs
  const { data: apiPolicies = [] } = useQuery<Policy[]>({
    queryKey: ["/api/policies"],
  });
  
  const { data: apiProcesses = [] } = useQuery<Process[]>({
    queryKey: ["/api/processes"],
  });
  
  const { data: apiProcedures = [] } = useQuery<Procedure[]>({
    queryKey: ["/api/procedures"],
  });
  
  const { data: apiFrameworks = [] } = useQuery<Framework[]>({
    queryKey: ["/api/frameworks"],
  });
  
  const { data: apiControls = [] } = useQuery<Control[]>({
    queryKey: ["/api/controls"],
  });
  
  const { data: apiUsers = [] } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  // Derive available approvers from API users (filtering by roles that can approve)
  const availableApprovers = useMemo(() => {
    const approverRoles = ['super_admin', 'tenant_admin', 'auditor'];
    return apiUsers
      .filter(u => approverRoles.includes(u.role || ''))
      .map(u => ({
        id: u.id,
        name: u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.username || 'Unknown',
        role: u.role || 'User',
      }));
  }, [apiUsers]);

  // Transform API data to GRCItem format
  const transformedPolicies: GRCItem[] = useMemo(() => apiPolicies.map(p => ({
    id: p.id,
    name: p.title,
    category: p.category || "General",
    version: p.version || "1.0",
    status: p.status || "draft",
    approvalStage: p.status === "approved" ? 4 : 1,
    owner: "Policy Owner",
    lastReview: p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : undefined,
    nextReview: p.reviewDate ? new Date(p.reviewDate).toISOString().split('T')[0] : undefined,
    linkedControls: p.relatedControls || [],
    description: p.description || "",
    content: p.content || "",
    approvalConfig: createDefaultApprovalConfig(2),
  })), [apiPolicies]);

  const transformedProcesses: GRCItem[] = useMemo(() => apiProcesses.map(p => ({
    id: p.id,
    name: p.title,
    category: p.category || "General",
    version: p.version || "1.0",
    status: p.status || "draft",
    approvalStage: p.status === "approved" ? 4 : 1,
    owner: "Process Owner",
    lastReview: p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : undefined,
    nextReview: p.reviewDate ? new Date(p.reviewDate).toISOString().split('T')[0] : undefined,
    linkedControls: p.relatedControls || [],
    description: p.description || "",
    content: p.content || "",
    steps: (p as any).stepByStep?.length || 5,
    approvalConfig: createDefaultApprovalConfig(2),
  })), [apiProcesses]);

  const transformedProcedures: GRCItem[] = useMemo(() => apiProcedures.map(p => ({
    id: p.id,
    name: p.title,
    category: p.category || "General",
    version: p.version || "1.0",
    status: p.status || "draft",
    approvalStage: p.status === "approved" ? 4 : 1,
    owner: "Procedure Owner",
    lastReview: p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : undefined,
    nextReview: p.reviewDate ? new Date(p.reviewDate).toISOString().split('T')[0] : undefined,
    linkedControls: p.relatedControls || [],
    description: p.description || "",
    content: p.content || "",
    steps: (p as any).stepByStep?.length || 5,
    process: "Related Process",
    complexity: "medium",
    approvalConfig: createDefaultApprovalConfig(2),
  })), [apiProcedures]);

  // Use transformed data or sample data as fallback
  const [policies, setPolicies] = useState<GRCItem[]>([]);
  const [processes, setProcesses] = useState<GRCItem[]>([]);
  const [procedures, setProcedures] = useState<GRCItem[]>([]);
  
  // Update state when API data is available
  useEffect(() => {
    if (transformedPolicies.length > 0) setPolicies(transformedPolicies);
  }, [transformedPolicies]);
  
  useEffect(() => {
    if (transformedProcesses.length > 0) setProcesses(transformedProcesses);
  }, [transformedProcesses]);
  
  useEffect(() => {
    if (transformedProcedures.length > 0) setProcedures(transformedProcedures);
  }, [transformedProcedures]);
  
  // Toggle expanded state for items
  const togglePolicyExpanded = (id: string) => {
    setExpandedPolicies(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  
  const toggleProcessExpanded = (id: string) => {
    setExpandedProcesses(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  
  const toggleProcedureExpanded = (id: string) => {
    setExpandedProcedures(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  
  // Inline enrich/expand handlers
  const handleInlineEnrich = (item: GRCItem, itemType: 'policy' | 'process' | 'procedure') => {
    setEnrichingItemId(item.id);
    setTimeout(() => {
      let enrichedContent = '';
      if (itemType === 'policy') {
        enrichedContent = generatePolicyEnrichment(item);
        setPolicies(prev => prev.map(p => p.id === item.id ? { ...p, content: enrichedContent } : p));
      } else if (itemType === 'process') {
        enrichedContent = generateProcessEnrichment(item);
        setProcesses(prev => prev.map(p => p.id === item.id ? { ...p, content: enrichedContent } : p));
      } else {
        enrichedContent = generateProcedureEnrichment(item);
        setProcedures(prev => prev.map(p => p.id === item.id ? { ...p, content: enrichedContent } : p));
      }
      setEnrichingItemId(null);
    }, 1500);
  };
  
  const handleInlineExpand = (item: GRCItem, itemType: 'policy' | 'process' | 'procedure') => {
    setEnrichingItemId(item.id);
    setTimeout(() => {
      const expandedContent = `${item.content || item.description || ''}

══════════════════════════════════════════════════════════════
                    EXPANDED DETAILED SECTIONS
══════════════════════════════════════════════════════════════

SECTION A: IMPLEMENTATION ROADMAP
────────────────────────────────────────────────────────────────
Phase 1: Assessment (Week 1-2)
□ Current state analysis
□ Gap identification
□ Stakeholder interviews
□ Resource requirement analysis

Phase 2: Design (Week 3-4)
□ Solution architecture
□ Process flow design
□ Control framework mapping
□ Documentation templates

Phase 3: Implementation (Week 5-8)
□ Phased rollout plan
□ Training program execution
□ System configuration
□ Pilot testing

Phase 4: Validation (Week 9-10)
□ Compliance testing
□ User acceptance testing
□ Performance validation
□ Audit readiness review

SECTION B: RISK CONSIDERATIONS
────────────────────────────────────────────────────────────────
Identified Risks:
1. Non-compliance Risk - Likelihood: Medium, Impact: High
2. Operational Disruption - Likelihood: Low, Impact: Medium
3. Resource Constraints - Likelihood: Medium, Impact: Medium

SECTION C: METRICS & MONITORING
────────────────────────────────────────────────────────────────
Key Performance Indicators:
• Compliance Rate: Target 95%
• Training Completion: Target 100%
• Audit Findings: Target <3 per quarter
• Process Cycle Time: Baseline + 10% improvement

SECTION D: TRAINING REQUIREMENTS
────────────────────────────────────────────────────────────────
Required Training Modules:
1. Policy Awareness (All Staff) - 30 mins
2. Process Deep-Dive (Executors) - 2 hours
3. Compliance Workshop (Managers) - 4 hours

══════════════════════════════════════════════════════════════`;
      
      if (itemType === 'policy') {
        setPolicies(prev => prev.map(p => p.id === item.id ? { ...p, content: expandedContent } : p));
      } else if (itemType === 'process') {
        setProcesses(prev => prev.map(p => p.id === item.id ? { ...p, content: expandedContent } : p));
      } else {
        setProcedures(prev => prev.map(p => p.id === item.id ? { ...p, content: expandedContent } : p));
      }
      setEnrichingItemId(null);
    }, 1500);
  };

  const stats = {
    frameworks: { total: apiFrameworks.length, published: apiFrameworks.filter(f => f.status === "published" || f.status === "active").length },
    controls: { total: apiControls.length, published: apiControls.filter(c => c.status === "published" || c.status === "active").length },
    policies: { total: policies.length, published: policies.filter(p => p.status === "published" || p.status === "approved").length },
    processes: { total: processes.length, published: processes.filter(p => p.status === "published" || p.status === "approved").length },
    procedures: { total: procedures.length, published: procedures.filter(p => p.status === "published" || p.status === "approved").length },
    people: { total: apiUsers.length, active: apiUsers.filter(p => p.status === "active").length },
  };

  const openApprovalDialog = (item: GRCItem, type: string) => {
    setSelectedItem(item);
    setSelectedItemType(type);
    setApprovalDialogOpen(true);
  };

  const openEditDialog = (item: GRCItem, type: string) => {
    setSelectedItem(item);
    setSelectedItemType(type);
    setEditDialogOpen(true);
  };

  const handleApprove = (item?: GRCItem, itemType?: string) => {
    const targetItem = item || selectedItem;
    const targetType = itemType || selectedItemType;
    
    if (!targetItem) return;
    
    const config = targetItem.approvalConfig;
    if (!config) return;
    
    const newCompleted = config.completedApprovals + 1;
    const allComplete = newCompleted >= config.requiredApprovals;
    const newStatus = allComplete ? 'published' : 'draft';
    const newStage = allComplete ? 4 : 1;
    
    const now = new Date().toISOString().split('T')[0];
    const currentApprover = config.approvers[config.completedApprovals];
    
    const updatedApprovers = config.approvers.map((a, idx) => 
      idx === config.completedApprovals ? { ...a, approved: true, approvedAt: now } : a
    );
    
    const newConfig: ApprovalConfig = {
      ...config,
      approvers: updatedApprovers,
      completedApprovals: newCompleted,
      approvalHistory: [
        ...config.approvalHistory,
        { action: 'approved', by: currentApprover?.name || 'Current User', at: now }
      ]
    };
    
    const updatedItem = { 
      ...targetItem, 
      approvalStage: newStage, 
      status: newStatus,
      approvalConfig: newConfig
    };
    
    if (targetType === 'Policy') {
      setPolicies(prev => prev.map(p => p.id === targetItem.id ? updatedItem : p));
    } else if (targetType === 'Process') {
      setProcesses(prev => prev.map(p => p.id === targetItem.id ? updatedItem : p));
    } else if (targetType === 'Procedure') {
      setProcedures(prev => prev.map(p => p.id === targetItem.id ? updatedItem : p));
    }
    
    if (!item) setSelectedItem(updatedItem);
  };

  const handleReject = (item?: GRCItem, itemType?: string) => {
    const targetItem = item || selectedItem;
    const targetType = itemType || selectedItemType;
    
    if (!targetItem) return;
    
    const config = targetItem.approvalConfig;
    if (!config) return;
    
    const now = new Date().toISOString().split('T')[0];
    
    const resetApprovers = config.approvers.map(a => ({ ...a, approved: false, approvedAt: undefined }));
    
    const newConfig: ApprovalConfig = {
      ...config,
      approvers: resetApprovers,
      completedApprovals: 0,
      approvalHistory: [
        ...config.approvalHistory,
        { action: 'rejected', by: 'Current User', at: now, comment: 'Sent back for revision' }
      ]
    };
    
    const updatedItem = { 
      ...targetItem, 
      approvalStage: 1, 
      status: 'draft',
      approvalConfig: newConfig
    };
    
    if (targetType === 'Policy') {
      setPolicies(prev => prev.map(p => p.id === targetItem.id ? updatedItem : p));
    } else if (targetType === 'Process') {
      setProcesses(prev => prev.map(p => p.id === targetItem.id ? updatedItem : p));
    } else if (targetType === 'Procedure') {
      setProcedures(prev => prev.map(p => p.id === targetItem.id ? updatedItem : p));
    }
    
    if (!item) setSelectedItem(updatedItem);
  };

  const handleUpdateApprovalConfig = (newConfig: ApprovalConfig) => {
    if (!selectedItem) return;
    
    const updatedItem = { ...selectedItem, approvalConfig: newConfig };
    
    if (selectedItemType === 'Policy') {
      setPolicies(prev => prev.map(p => p.id === selectedItem.id ? updatedItem : p));
    } else if (selectedItemType === 'Process') {
      setProcesses(prev => prev.map(p => p.id === selectedItem.id ? updatedItem : p));
    } else if (selectedItemType === 'Procedure') {
      setProcedures(prev => prev.map(p => p.id === selectedItem.id ? updatedItem : p));
    }
    
    setSelectedItem(updatedItem);
  };

  const handleSaveItem = (updates: Partial<GRCItem>) => {
    if (!selectedItem) return;
    
    const updatedItem = { ...selectedItem, ...updates };
    
    if (selectedItemType === 'Policy') {
      setPolicies(prev => prev.map(p => p.id === selectedItem.id ? updatedItem : p));
    } else if (selectedItemType === 'Process') {
      setProcesses(prev => prev.map(p => p.id === selectedItem.id ? updatedItem : p));
    } else if (selectedItemType === 'Procedure') {
      setProcedures(prev => prev.map(p => p.id === selectedItem.id ? updatedItem : p));
    }
    
    setSelectedItem(updatedItem);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published": return <Badge className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">Published</Badge>;
      case "approval": return <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30">Pending Approval</Badge>;
      case "review": return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Under Review</Badge>;
      case "draft": return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Draft</Badge>;
      case "retired": return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Retired</Badge>;
      case "active": return <Badge className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">Active</Badge>;
      case "training": return <Badge className="bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30">Training</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getComplexityBadge = (complexity: string) => {
    switch (complexity) {
      case "low": return <Badge className="bg-green-500/20 text-green-400">Low</Badge>;
      case "medium": return <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400">Medium</Badge>;
      case "high": return <Badge className="bg-red-500/20 text-red-400">High</Badge>;
      default: return <Badge variant="outline">{complexity}</Badge>;
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <Layers className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                Policy Nexus
              </h1>
              <p className="text-muted-foreground">
                Complete GRC Lifecycle - Frameworks, Controls, Policies, Processes, Procedures & People
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-nexus-settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" data-testid="button-nexus-smart-assist">
            <Sparkles className="w-4 h-4 mr-2" />
            Smart Assistant
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-3">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          const statKey = pillar.id as keyof typeof stats;
          const stat = stats[statKey];
          return (
            <Card 
              key={pillar.id} 
              className="glass-card hover-elevate cursor-pointer group"
              onClick={() => setActiveTab(pillar.id)}
              data-testid={`card-pillar-${pillar.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br ${pillar.color} bg-opacity-20`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <div className="mt-3">
                  <h3 className="text-lg font-bold">{pillar.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{pillar.description}</p>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div>
                    <p className="text-xl font-bold">{stat.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="h-6 w-px bg-border" />
                  <div>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {(stat as any).published || (stat as any).active || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {pillar.id === "people" ? "Active" : "Published"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="glass-card p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="font-semibold">5-Stage Approval Workflow:</span>
          </div>
          <div className="flex items-center gap-2">
            {approvalStages.map((stage, idx) => (
              <div key={stage.id} className="flex items-center gap-1">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${stage.color} text-white flex items-center gap-1`}>
                  <stage.icon className="w-3 h-3" />
                  {stage.name}
                </div>
                {idx < approvalStages.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="glass-card">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-border/50 px-6 pt-4">
            <TabsList className="bg-transparent gap-1 flex-wrap">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20" data-testid="tab-overview">
                <Layers className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="policies" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20" data-testid="tab-policies">
                <FileText className="w-4 h-4 mr-2" />
                Policies
              </TabsTrigger>
              <TabsTrigger value="processes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-orange-500/20" data-testid="tab-processes">
                <Workflow className="w-4 h-4 mr-2" />
                Processes
              </TabsTrigger>
              <TabsTrigger value="procedures" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20" data-testid="tab-procedures">
                <ListChecks className="w-4 h-4 mr-2" />
                Procedures
              </TabsTrigger>
              <TabsTrigger value="frameworks" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20" data-testid="tab-frameworks">
                <Layers className="w-4 h-4 mr-2" />
                Frameworks
              </TabsTrigger>
              <TabsTrigger value="controls" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-teal-500/20" data-testid="tab-controls">
                <Shield className="w-4 h-4 mr-2" />
                Controls
              </TabsTrigger>
              <TabsTrigger value="people" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20" data-testid="tab-people">
                <Users className="w-4 h-4 mr-2" />
                People
              </TabsTrigger>
              <TabsTrigger value="linkages" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-500/20 data-[state=active]:to-pink-500/20" data-testid="tab-linkages">
                <Network className="w-4 h-4 mr-2" />
                Linkages
              </TabsTrigger>
              <TabsTrigger value="approvals" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-emerald-500/20" data-testid="tab-approvals">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approvals
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <Card className="glass-card col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    GRC Maturity Overview
                  </CardTitle>
                  <CardDescription>Complete lifecycle maturity assessment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pillars.map((pillar) => {
                    const maturity = pillar.id === "frameworks" ? 92 : pillar.id === "controls" ? 78 : pillar.id === "policies" ? 65 : pillar.id === "processes" ? 58 : pillar.id === "procedures" ? 52 : 85;
                    return (
                      <div key={pillar.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <pillar.icon className="w-4 h-4" />
                            <span className="font-medium text-sm">{pillar.name}</span>
                          </div>
                          <span className="text-sm font-medium">{maturity}%</span>
                        </div>
                        <Progress value={maturity} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    Pending Approvals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {[
                        ...policies.filter(p => p.status !== 'published' && p.status !== 'retired').map(p => ({ ...p, _type: 'Policy' as const })),
                        ...processes.filter(p => p.status !== 'published' && p.status !== 'retired').map(p => ({ ...p, _type: 'Process' as const })),
                        ...procedures.filter(p => p.status !== 'published' && p.status !== 'retired').map(p => ({ ...p, _type: 'Procedure' as const }))
                      ].slice(0, 6).map((item, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-muted/50 flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item._type} - {item.status}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => openApprovalDialog(item, item._type)}>
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-indigo-400" />
                  Complete GRC Linkage Cycle
                </CardTitle>
                <CardDescription>Framework → Control → Policy → Process → Procedure → People</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-2">
                  {pillars.map((pillar, idx) => (
                    <div key={pillar.id} className="flex items-center gap-2">
                      <div className={`p-4 rounded-xl bg-gradient-to-br ${pillar.color} bg-opacity-20 border border-white/10 text-center`}>
                        <pillar.icon className="w-6 h-6 text-white mx-auto" />
                        <p className="text-xs font-medium mt-2 text-white">{pillar.name}</p>
                        <p className="text-lg font-bold text-white">{(stats[pillar.id as keyof typeof stats] as any).total}</p>
                      </div>
                      {idx < pillars.length - 1 && <ArrowRight className="w-5 h-5 text-muted-foreground" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search policies..." className="pl-10 w-[300px]" data-testid="input-search-policies" />
                </div>
              </div>
              <Button data-testid="button-add-policy">
                <Plus className="w-4 h-4 mr-2" />
                Create Policy (Draft)
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Approval Stage</TableHead>
                  <TableHead>Linked Controls</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
                  <Fragment key={policy.id}>
                    <TableRow data-testid={`row-policy-${policy.id}`} className="cursor-pointer hover:bg-purple-500/5" onClick={() => togglePolicyExpanded(policy.id)}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {expandedPolicies.has(policy.id) ? (
                            <ChevronDown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          )}
                          <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span className="text-purple-700 dark:text-purple-300 hover:text-purple-200">{policy.name}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{policy.category}</Badge></TableCell>
                      <TableCell>v{policy.version}</TableCell>
                      <TableCell>
                        <ApprovalProgressIndicator item={policy} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {policy.linkedControls?.slice(0, 2).map((c: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">{c}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(policy.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" onClick={() => openApprovalDialog(policy, 'Policy')} data-testid={`button-workflow-policy-${policy.id}`}>
                            <GitBranch className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(policy, 'Policy')} data-testid={`button-edit-policy-${policy.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedPolicies.has(policy.id) && (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0">
                          <ExpandableDetailView
                            item={policy}
                            itemType="policy"
                            onEnrich={() => handleInlineEnrich(policy, 'policy')}
                            onExpand={() => handleInlineExpand(policy, 'policy')}
                            isEnriching={enrichingItemId === policy.id}
                            onApprove={(item, type) => handleApprove(item, type)}
                            onReject={(item, type) => handleReject(item, type)}
                            onUpdateApprovalConfig={(config) => {
                              setPolicies(prev => prev.map(p => p.id === policy.id ? { ...p, approvalConfig: config } : p));
                            }}
                            availableApprovers={availableApprovers}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="processes" className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search processes..." className="pl-10 w-[300px]" data-testid="input-search-processes" />
                </div>
              </div>
              <Button data-testid="button-add-process">
                <Plus className="w-4 h-4 mr-2" />
                Create Process (Draft)
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Process Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Approval Stage</TableHead>
                  <TableHead>Linked Policies</TableHead>
                  <TableHead>Automation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processes.map((process) => (
                  <Fragment key={process.id}>
                    <TableRow data-testid={`row-process-${process.id}`} className="cursor-pointer hover:bg-amber-500/5" onClick={() => toggleProcessExpanded(process.id)}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {expandedProcesses.has(process.id) ? (
                            <ChevronDown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          )}
                          <Workflow className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span className="text-amber-700 dark:text-amber-300 hover:text-amber-200">{process.name}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{process.category}</Badge></TableCell>
                      <TableCell>
                        <ApprovalProgressIndicator item={process} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {process.linkedPolicies?.slice(0, 1).map((p: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs truncate max-w-[150px]">{p}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={process.automationLevel} className="w-12 h-2" />
                          <span className="text-xs">{process.automationLevel}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(process.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" onClick={() => openApprovalDialog(process, 'Process')} data-testid={`button-workflow-process-${process.id}`}>
                            <GitBranch className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(process, 'Process')} data-testid={`button-edit-process-${process.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedProcesses.has(process.id) && (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0">
                          <ExpandableDetailView
                            item={process}
                            itemType="process"
                            onEnrich={() => handleInlineEnrich(process, 'process')}
                            onExpand={() => handleInlineExpand(process, 'process')}
                            isEnriching={enrichingItemId === process.id}
                            onApprove={(item, type) => handleApprove(item, type)}
                            onReject={(item, type) => handleReject(item, type)}
                            onUpdateApprovalConfig={(config) => {
                              setProcesses(prev => prev.map(p => p.id === process.id ? { ...p, approvalConfig: config } : p));
                            }}
                            availableApprovers={availableApprovers}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="procedures" className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search procedures..." className="pl-10 w-[300px]" data-testid="input-search-procedures" />
                </div>
              </div>
              <Button data-testid="button-add-procedure">
                <Plus className="w-4 h-4 mr-2" />
                Create Procedure (Draft)
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Procedure Name</TableHead>
                  <TableHead>Parent Process</TableHead>
                  <TableHead>Approval Stage</TableHead>
                  <TableHead>Complexity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {procedures.map((procedure) => (
                  <Fragment key={procedure.id}>
                    <TableRow data-testid={`row-procedure-${procedure.id}`} className="cursor-pointer hover:bg-emerald-500/5" onClick={() => toggleProcedureExpanded(procedure.id)}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {expandedProcedures.has(procedure.id) ? (
                            <ChevronDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          )}
                          <ListChecks className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-200">{procedure.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Workflow className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm truncate max-w-[150px]">{procedure.process}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ApprovalProgressIndicator item={procedure} />
                      </TableCell>
                      <TableCell>{getComplexityBadge(procedure.complexity)}</TableCell>
                      <TableCell>{getStatusBadge(procedure.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" onClick={() => openApprovalDialog(procedure, 'Procedure')} data-testid={`button-workflow-procedure-${procedure.id}`}>
                            <GitBranch className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(procedure, 'Procedure')} data-testid={`button-edit-procedure-${procedure.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedProcedures.has(procedure.id) && (
                      <TableRow>
                        <TableCell colSpan={6} className="p-0">
                          <ExpandableDetailView
                            item={procedure}
                            itemType="procedure"
                            onEnrich={() => handleInlineEnrich(procedure, 'procedure')}
                            onExpand={() => handleInlineExpand(procedure, 'procedure')}
                            isEnriching={enrichingItemId === procedure.id}
                            onApprove={(item, type) => handleApprove(item, type)}
                            onReject={(item, type) => handleReject(item, type)}
                            onUpdateApprovalConfig={(config) => {
                              setProcedures(prev => prev.map(p => p.id === procedure.id ? { ...p, approvalConfig: config } : p));
                            }}
                            availableApprovers={availableApprovers}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="frameworks" className="p-6 space-y-4" data-testid="content-frameworks">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search frameworks..." className="pl-10 w-[300px]" data-testid="input-search-frameworks" />
                </div>
              </div>
              <Button data-testid="button-add-framework">
                <Plus className="w-4 h-4 mr-2" />
                Add Framework
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apiFrameworks.map((framework) => (
                <Card key={framework.id} className="glass-card hover-elevate cursor-pointer" data-testid={`card-framework-${framework.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                        <Layers className="w-5 h-5 text-cyan-400" />
                      </div>
                      <Badge variant={framework.status === "published" || framework.status === "active" ? "default" : "secondary"}>
                        {framework.status || "draft"}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-1">{framework.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{framework.category || "General"}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{(framework as any).controlCount || 0} Controls</span>
                      <div className="flex items-center gap-1">
                        <Progress value={(framework as any).coverage || 0} className="w-16 h-2" />
                        <span className="text-xs">{(framework as any).coverage || 0}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="controls" className="p-6 space-y-4" data-testid="content-controls">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search controls..." className="pl-10 w-[300px]" data-testid="input-search-controls" />
                </div>
              </div>
              <Button data-testid="button-add-control">
                <Plus className="w-4 h-4 mr-2" />
                Add Control
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Control ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Framework</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Linked Policies</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiControls.map((control) => (
                  <TableRow key={control.id} data-testid={`row-control-${control.id}`}>
                    <TableCell className="font-medium">
                      <Badge variant="outline">{control.controlId || control.id.substring(0, 8)}</Badge>
                    </TableCell>
                    <TableCell>{control.title || control.name}</TableCell>
                    <TableCell>
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">{control.frameworkId || "General"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={control.status === "published" || control.status === "active" ? "default" : control.status === "review" ? "secondary" : "outline"}>
                        {control.status || "draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>{(control as any).linkedPolicies || 0}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" data-testid={`button-view-control-${control.id}`}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="people" className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search people..." className="pl-10 w-[300px]" data-testid="input-search-people" />
                </div>
              </div>
              <Button data-testid="button-add-person">
                <Plus className="w-4 h-4 mr-2" />
                Add Person
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Responsibilities</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiUsers.map((person) => (
                  <TableRow key={person.id} data-testid={`row-person-${person.id}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-medium">
                          {(person.firstName && person.lastName) ? `${person.firstName[0]}${person.lastName[0]}` : (person.username?.substring(0, 2).toUpperCase() || "U")}
                        </div>
                        {person.firstName && person.lastName ? `${person.firstName} ${person.lastName}` : person.username}
                      </div>
                    </TableCell>
                    <TableCell>{person.role || "User"}</TableCell>
                    <TableCell>{person.department || "General"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">{person.role || "User"}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(person.status || "active")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="linkages" className="p-6 space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-fuchsia-400" />
                  Complete GRC Linkage Matrix
                </CardTitle>
                <CardDescription>Visualize the full governance chain: Frameworks → Controls → Policies → Processes → Procedures → People</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-6 gap-2">
                  {pillars.map((pillar, idx) => (
                    <div key={pillar.id} className={`p-3 rounded-xl bg-gradient-to-br ${pillar.color} bg-opacity-10 border border-white/10`}>
                      <div className="flex items-center gap-2 mb-2">
                        <pillar.icon className="w-4 h-4 text-white" />
                        <span className="font-semibold text-sm text-white">{pillar.name}</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{(stats[pillar.id as keyof typeof stats] as any).total}</p>
                      <p className="text-xs text-white/70">{pillar.id === "people" ? "Active" : "Published"}: {(stats[pillar.id as keyof typeof stats] as any).published || (stats[pillar.id as keyof typeof stats] as any).active || 0}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        Framework → Control Mappings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {apiFrameworks.slice(0, 3).map(fw => (
                        <div key={fw.id} className="p-2 rounded bg-background/50 flex justify-between items-center">
                          <span className="text-sm">{fw.name}</span>
                          <Badge variant="outline">{(fw as any).controlCount || 0} controls</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4 text-rose-400" />
                        Control → Policy Mappings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {apiControls.slice(0, 3).map(ctrl => (
                        <div key={ctrl.id} className="p-2 rounded bg-background/50 flex justify-between items-center">
                          <span className="text-sm truncate max-w-[150px]">{ctrl.title || ctrl.name}</span>
                          <Badge variant="outline">{(ctrl as any).linkedPolicies || 0} policies</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        Policy → Process Mappings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {policies.slice(0, 3).map(pol => (
                        <div key={pol.id} className="p-2 rounded bg-background/50 flex justify-between items-center">
                          <span className="text-sm truncate max-w-[150px]">{pol.name}</span>
                          <Badge variant="outline">{processes.filter(p => p.linkedPolicies?.includes(pol.name)).length} processes</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      <div>
                        <h4 className="font-semibold">Smart Linkage Analysis</h4>
                        <p className="text-sm text-muted-foreground">
                          Detected 12 orphan policies without control mappings and 5 processes missing procedure documentation.
                        </p>
                      </div>
                      <Button variant="outline" className="ml-auto">
                        View Recommendations
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals" className="p-6 space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Approval Workflow Configuration
                </CardTitle>
                <CardDescription>Configure approval levels and approvers for policies, processes, and procedures</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <Card className="bg-purple-50 dark:bg-purple-500/10 border-purple-500/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        Policy Approvals
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{policies.length}</div>
                      <p className="text-xs text-muted-foreground">{policies.filter(p => p.status === 'draft').length} pending / {policies.filter(p => p.status === 'published').length} approved</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-amber-50 dark:bg-amber-500/10 border-amber-500/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        Process Approvals
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{processes.length}</div>
                      <p className="text-xs text-muted-foreground">{processes.filter(p => p.status === 'draft').length} pending / {processes.filter(p => p.status === 'published').length} approved</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-cyan-500/10 border-cyan-500/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ListChecks className="w-4 h-4 text-cyan-400" />
                        Procedure Approvals
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{procedures.length}</div>
                      <p className="text-xs text-muted-foreground">{procedures.filter(p => p.status === 'draft').length} pending / {procedures.filter(p => p.status === 'published').length} approved</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-sm">Pending Approvals Queue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Approval Level</TableHead>
                          <TableHead>Current Stage</TableHead>
                          <TableHead>Approvers</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...policies.map(p => ({...p, type: 'Policy'})),
                          ...processes.map(p => ({...p, type: 'Process'})),
                          ...procedures.map(p => ({...p, type: 'Procedure'}))
                        ].map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={
                                item.type === 'Policy' ? 'border-purple-500/50 text-purple-600 dark:text-purple-400' :
                                item.type === 'Process' ? 'border-amber-500/50 text-amber-600 dark:text-amber-400' :
                                'border-cyan-500/50 text-cyan-400'
                              }>
                                {item.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={item.approvalConfig?.requiredApprovals?.toString() || "1"}
                                onValueChange={(value) => {
                                  const newConfig = {
                                    ...item.approvalConfig!,
                                    requiredApprovals: parseInt(value) as 1 | 2 | 3 | 4 | 5
                                  };
                                  if (item.type === 'Policy') {
                                    setPolicies(prev => prev.map(p => p.id === item.id ? {...p, approvalConfig: newConfig} : p));
                                  } else if (item.type === 'Process') {
                                    setProcesses(prev => prev.map(p => p.id === item.id ? {...p, approvalConfig: newConfig} : p));
                                  } else {
                                    setProcedures(prev => prev.map(p => p.id === item.id ? {...p, approvalConfig: newConfig} : p));
                                  }
                                }}
                              >
                                <SelectTrigger className="w-[130px]" data-testid={`select-level-${item.id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 Approval</SelectItem>
                                  <SelectItem value="2">2 Approvals</SelectItem>
                                  <SelectItem value="3">3 Approvals</SelectItem>
                                  <SelectItem value="4">4 Approvals</SelectItem>
                                  <SelectItem value="5">5 Approvals</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <ApprovalProgressIndicator item={item} />
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {item.approvalConfig?.approvers?.map((approver, idx) => (
                                  <Badge key={idx} variant="outline" className={approver.approved ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-400' : ''}>
                                    {approver.name.split(' ')[0]}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setSelectedItemType(item.type.toLowerCase());
                                  setApprovalDialogOpen(true);
                                }}
                                data-testid={`button-configure-${item.id}`}
                              >
                                <Settings className="w-3 h-3 mr-1" />
                                Configure
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Sparkles className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <h4 className="font-semibold">Approval Workflow Tips</h4>
                        <p className="text-sm text-muted-foreground">
                          Configure 1-5 approval levels based on item criticality. High-risk policies should have more approval levels.
                          Each level can have a different approver assigned.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>

      <ApprovalDialog 
        open={approvalDialogOpen} 
        onClose={() => setApprovalDialogOpen(false)} 
        item={selectedItem}
        itemType={selectedItemType}
        onApprove={handleApprove}
        onReject={handleReject}
        onUpdateApprovalConfig={handleUpdateApprovalConfig}
        availableApprovers={availableApprovers}
      />
      
      <EditItemDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        item={selectedItem}
        itemType={selectedItemType}
        onSave={handleSaveItem}
        onApprove={handleApprove}
        onReject={handleReject}
        onUpdateApprovalConfig={handleUpdateApprovalConfig}
        availableApprovers={availableApprovers}
      />
    </div>
  );
}
