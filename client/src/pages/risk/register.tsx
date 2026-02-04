import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  AlertTriangle,
  Shield,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Building2,
  User,
  Calendar,
  Target,
  FileDown,
  Download,
  History,
  BookOpen,
  Sparkles,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Settings,
  Copy,
  Save,
  Upload,
  FileSpreadsheet,
  Table2,
  Expand,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  fetchRisks, 
  createRisk, 
  updateRisk, 
  deleteRisk,
  fetchTenants,
} from "@/lib/api";
import { useTenant } from "@/contexts/tenant-context";
import type { Risk, Tenant } from "@shared/schema";
import { insertRiskRegisterTemplateSchema } from "@shared/schema";

interface RiskCatalogItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  subcategory: string | null;
  defaultLikelihood: number;
  defaultImpact: number;
  potentialCauses: string[] | null;
  potentialConsequences: string[] | null;
  suggestedControls: string[] | null;
  relatedFrameworks: string[] | null;
  aiEnriched: boolean;
}

const riskLevelStyles = {
  critical: { bg: "bg-destructive", text: "text-white" },
  high: { bg: "bg-chart-3", text: "text-white" },
  medium: { bg: "bg-chart-1", text: "text-white" },
  low: { bg: "bg-chart-2", text: "text-white" },
};

const statusStyles = {
  active: { bg: "bg-destructive/20", text: "text-destructive" },
  in_progress: { bg: "bg-chart-3/20", text: "text-chart-3" },
  pending: { bg: "bg-chart-1/20", text: "text-chart-1" },
  completed: { bg: "bg-chart-2/20", text: "text-chart-2" },
  inactive: { bg: "bg-muted", text: "text-muted-foreground" },
  draft: { bg: "bg-muted", text: "text-muted-foreground" },
  approved: { bg: "bg-chart-2/20", text: "text-chart-2" },
  rejected: { bg: "bg-destructive/20", text: "text-destructive" },
};

const riskFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  likelihood: z.number().min(1).max(5),
  impact: z.number().min(1).max(5),
  status: z.string().min(1, "Status is required"),
  mitigationPlan: z.string().optional(),
});

type RiskFormValues = z.infer<typeof riskFormSchema>;

const categoryOptions = [
  "Operational",
  "Financial",
  "Strategic",
  "Compliance",
  "Technology",
  "Cybersecurity",
  "Reputational",
  "Legal",
  "Environmental",
  "Human Resources",
  "Supply Chain",
  "Third Party",
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "in_progress", label: "In Progress" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "inactive", label: "Inactive" },
];

// Comprehensive Field Library - All possible columns for risk registers
const FIELD_LIBRARY = {
  identification: [
    { id: "riskId", label: "Risk ID", type: "text", required: true, description: "Unique identifier for the risk" },
    { id: "riskName", label: "Risk Name", type: "text", required: true, description: "Short name/title for the risk" },
    { id: "riskDescription", label: "Risk Description", type: "textarea", required: true, description: "Detailed description of the risk" },
    { id: "riskCode", label: "Risk Code", type: "text", description: "Internal reference code" },
    { id: "dateIdentified", label: "Date Identified", type: "date", description: "When the risk was first identified" },
    { id: "dateLastReviewed", label: "Date Last Reviewed", type: "date", description: "When the risk was last reviewed" },
    { id: "nextReviewDate", label: "Next Review Date", type: "date", description: "Scheduled next review date" },
  ],
  classification: [
    { id: "riskCategory", label: "Risk Category", type: "select", options: ["Strategic", "Operational", "Financial", "Compliance", "Technology", "Cybersecurity", "Reputational", "Legal", "Environmental", "HR"], description: "Primary category of the risk" },
    { id: "riskSubcategory", label: "Risk Subcategory", type: "text", description: "Subcategory within the primary category" },
    { id: "riskType", label: "Risk Type", type: "select", options: ["Threat", "Opportunity", "Uncertainty"], description: "Type of risk" },
    { id: "riskSource", label: "Risk Source", type: "select", options: ["Internal", "External", "Both"], description: "Origin of the risk" },
    { id: "riskDomain", label: "Risk Domain", type: "select", options: ["Business", "IT", "Regulatory", "Market", "Operational"], description: "Business domain affected" },
    { id: "businessUnit", label: "Business Unit", type: "text", description: "Affected business unit" },
    { id: "department", label: "Department", type: "text", description: "Affected department" },
    { id: "process", label: "Process", type: "text", description: "Associated business process" },
  ],
  ownership: [
    { id: "riskOwner", label: "Risk Owner", type: "user", required: true, description: "Person accountable for the risk" },
    { id: "riskManager", label: "Risk Manager", type: "user", description: "Person managing the risk day-to-day" },
    { id: "riskCustodian", label: "Risk Custodian", type: "text", description: "Person responsible for controls" },
    { id: "stakeholders", label: "Stakeholders", type: "multitext", description: "Key stakeholders affected" },
    { id: "escalationContact", label: "Escalation Contact", type: "user", description: "Person to escalate to" },
    { id: "approver", label: "Approver", type: "user", description: "Person who approves risk responses" },
  ],
  assessment: [
    { id: "inherentLikelihood", label: "Inherent Likelihood", type: "rating", min: 1, max: 5, description: "Likelihood before controls (1-5)" },
    { id: "inherentImpact", label: "Inherent Impact", type: "rating", min: 1, max: 5, description: "Impact before controls (1-5)" },
    { id: "inherentRiskScore", label: "Inherent Risk Score", type: "calculated", formula: "likelihood*impact", description: "Calculated inherent risk score" },
    { id: "inherentRiskLevel", label: "Inherent Risk Level", type: "calculated", description: "Risk level (Low/Medium/High/Critical)" },
    { id: "velocity", label: "Risk Velocity", type: "select", options: ["Very Fast", "Fast", "Moderate", "Slow", "Very Slow"], description: "Speed at which risk could materialize" },
    { id: "proximity", label: "Risk Proximity", type: "select", options: ["Imminent", "Short-term", "Medium-term", "Long-term"], description: "When the risk might occur" },
    { id: "volatility", label: "Risk Volatility", type: "select", options: ["Stable", "Increasing", "Decreasing", "Fluctuating"], description: "How the risk is changing over time" },
  ],
  cia_triad: [
    { id: "confidentiality", label: "Confidentiality Impact", type: "rating", min: 1, max: 5, description: "Impact on data confidentiality (1-5)" },
    { id: "integrity", label: "Integrity Impact", type: "rating", min: 1, max: 5, description: "Impact on data integrity (1-5)" },
    { id: "availability", label: "Availability Impact", type: "rating", min: 1, max: 5, description: "Impact on system availability (1-5)" },
    { id: "ciaScore", label: "CIA Score", type: "calculated", formula: "max(C,I,A)", description: "Maximum of C, I, A scores" },
  ],
  causes_consequences: [
    { id: "rootCauses", label: "Root Causes", type: "multitext", description: "Underlying causes of the risk" },
    { id: "threat", label: "Threat", type: "text", description: "Threat agent or event" },
    { id: "vulnerability", label: "Vulnerability", type: "text", description: "Weakness that could be exploited" },
    { id: "triggerEvents", label: "Trigger Events", type: "multitext", description: "Events that could trigger the risk" },
    { id: "consequences", label: "Consequences", type: "multitext", description: "Potential impacts if risk materializes" },
    { id: "financialImpact", label: "Financial Impact", type: "currency", description: "Estimated financial impact" },
    { id: "reputationalImpact", label: "Reputational Impact", type: "select", options: ["None", "Minor", "Moderate", "Major", "Severe"], description: "Impact on reputation" },
    { id: "operationalImpact", label: "Operational Impact", type: "textarea", description: "Description of operational impact" },
    { id: "regulatoryImpact", label: "Regulatory Impact", type: "textarea", description: "Potential regulatory consequences" },
  ],
  controls: [
    { id: "existingControls", label: "Existing Controls", type: "multitext", description: "Current controls in place" },
    { id: "controlReferences", label: "Control References", type: "multitext", description: "References to control frameworks" },
    { id: "controlEffectiveness", label: "Control Effectiveness", type: "select", options: ["Effective", "Partially Effective", "Ineffective", "Not Assessed"], description: "How effective are current controls" },
    { id: "controlGaps", label: "Control Gaps", type: "multitext", description: "Identified gaps in controls" },
    { id: "controlOwner", label: "Control Owner", type: "user", description: "Person responsible for controls" },
    { id: "controlTestDate", label: "Last Control Test Date", type: "date", description: "When controls were last tested" },
    { id: "controlTestResult", label: "Control Test Result", type: "select", options: ["Pass", "Partial Pass", "Fail", "Not Tested"], description: "Result of last control test" },
  ],
  residual: [
    { id: "residualLikelihood", label: "Residual Likelihood", type: "rating", min: 1, max: 5, description: "Likelihood after controls (1-5)" },
    { id: "residualImpact", label: "Residual Impact", type: "rating", min: 1, max: 5, description: "Impact after controls (1-5)" },
    { id: "residualRiskScore", label: "Residual Risk Score", type: "calculated", formula: "residualLikelihood*residualImpact", description: "Calculated residual risk score" },
    { id: "residualRiskLevel", label: "Residual Risk Level", type: "calculated", description: "Residual risk level" },
    { id: "riskReduction", label: "Risk Reduction %", type: "calculated", description: "Percentage reduction from inherent to residual" },
  ],
  treatment: [
    { id: "treatmentStrategy", label: "Treatment Strategy", type: "select", options: ["Accept", "Mitigate", "Transfer", "Avoid", "Exploit"], description: "Chosen risk treatment approach" },
    { id: "treatmentPlan", label: "Treatment Plan", type: "textarea", description: "Detailed treatment plan" },
    { id: "treatmentActions", label: "Treatment Actions", type: "multitext", description: "Specific actions to be taken" },
    { id: "treatmentOwner", label: "Treatment Owner", type: "user", description: "Person responsible for treatment" },
    { id: "treatmentCost", label: "Treatment Cost", type: "currency", description: "Estimated cost of treatment" },
    { id: "treatmentDeadline", label: "Treatment Deadline", type: "date", description: "Target date for treatment completion" },
    { id: "treatmentStatus", label: "Treatment Status", type: "select", options: ["Not Started", "In Progress", "Completed", "Delayed", "Cancelled"], description: "Current status of treatment" },
    { id: "treatmentProgress", label: "Treatment Progress %", type: "number", min: 0, max: 100, description: "Percentage completion of treatment" },
  ],
  target: [
    { id: "targetLikelihood", label: "Target Likelihood", type: "rating", min: 1, max: 5, description: "Target likelihood after treatment (1-5)" },
    { id: "targetImpact", label: "Target Impact", type: "rating", min: 1, max: 5, description: "Target impact after treatment (1-5)" },
    { id: "targetRiskScore", label: "Target Risk Score", type: "calculated", description: "Target risk score after treatment" },
    { id: "targetRiskLevel", label: "Target Risk Level", type: "calculated", description: "Target risk level" },
    { id: "targetDate", label: "Target Achievement Date", type: "date", description: "When target should be achieved" },
  ],
  compliance: [
    { id: "regulatoryRequirements", label: "Regulatory Requirements", type: "multitext", description: "Applicable regulations" },
    { id: "frameworkMapping", label: "Framework Mapping", type: "multitext", description: "Mapped control frameworks (ISO, NIST, etc.)" },
    { id: "complianceStatus", label: "Compliance Status", type: "select", options: ["Compliant", "Partially Compliant", "Non-Compliant", "Not Applicable"], description: "Current compliance status" },
    { id: "auditFindings", label: "Related Audit Findings", type: "multitext", description: "Related audit findings" },
    { id: "exceptions", label: "Exceptions/Waivers", type: "textarea", description: "Any approved exceptions" },
  ],
  monitoring: [
    { id: "kris", label: "Key Risk Indicators", type: "multitext", description: "KRIs for this risk" },
    { id: "thresholds", label: "Alert Thresholds", type: "textarea", description: "Thresholds that trigger alerts" },
    { id: "monitoringFrequency", label: "Monitoring Frequency", type: "select", options: ["Daily", "Weekly", "Monthly", "Quarterly", "Annually"], description: "How often risk is monitored" },
    { id: "lastMonitoringDate", label: "Last Monitoring Date", type: "date", description: "When risk was last monitored" },
    { id: "monitoringMethod", label: "Monitoring Method", type: "text", description: "How the risk is monitored" },
    { id: "earlyWarning", label: "Early Warning Signs", type: "multitext", description: "Signs that risk may be materializing" },
  ],
  nist_rmf: [
    { id: "informationSystem", label: "Information System", type: "text", description: "Affected information system" },
    { id: "securityCategory", label: "Security Category", type: "select", options: ["Low", "Moderate", "High"], description: "FIPS 199 security category" },
    { id: "controlFamily", label: "Control Family", type: "text", description: "NIST control family" },
    { id: "poa_m_id", label: "POA&M ID", type: "text", description: "Plan of Action & Milestones ID" },
    { id: "systemOwner", label: "System Owner", type: "user", description: "Information system owner" },
    { id: "authorizedBy", label: "Authorized By", type: "user", description: "Authorizing official" },
    { id: "authorizationDate", label: "Authorization Date", type: "date", description: "Date of authorization" },
  ],
  coso_erm: [
    { id: "strategicObjective", label: "Strategic Objective", type: "text", description: "Related strategic objective" },
    { id: "riskAppetite", label: "Risk Appetite", type: "select", options: ["Averse", "Minimal", "Cautious", "Open", "Hungry"], description: "Organizational risk appetite" },
    { id: "riskTolerance", label: "Risk Tolerance", type: "text", description: "Acceptable level of variation" },
    { id: "performanceTarget", label: "Performance Target", type: "text", description: "Related performance target" },
    { id: "enterpriseComponent", label: "Enterprise Component", type: "select", options: ["Governance & Culture", "Strategy & Objective-Setting", "Performance", "Review & Revision", "Information, Communication & Reporting"], description: "COSO ERM component" },
  ],
  fair: [
    { id: "assetValue", label: "Asset Value", type: "currency", description: "Value of asset at risk" },
    { id: "threatEventFrequency", label: "Threat Event Frequency", type: "select", options: ["Very High (100+/year)", "High (10-100/year)", "Moderate (1-10/year)", "Low (0.1-1/year)", "Very Low (<0.1/year)"], description: "Expected frequency of threat events" },
    { id: "vulnerabilityLevel", label: "Vulnerability Level", type: "select", options: ["Very High", "High", "Moderate", "Low", "Very Low"], description: "Probability threat results in loss" },
    { id: "lossEventFrequency", label: "Loss Event Frequency", type: "calculated", description: "TEF × Vulnerability" },
    { id: "primaryLoss", label: "Primary Loss", type: "currency", description: "Direct loss from event" },
    { id: "secondaryLoss", label: "Secondary Loss", type: "currency", description: "Indirect/consequential loss" },
    { id: "expectedLoss", label: "Expected Annual Loss", type: "calculated", description: "LEF × Loss Magnitude" },
  ],
  documentation: [
    { id: "status", label: "Risk Status", type: "select", options: ["Open", "In Treatment", "Monitoring", "Closed", "Accepted"], description: "Current status of the risk" },
    { id: "priority", label: "Priority", type: "select", options: ["Critical", "High", "Medium", "Low"], description: "Priority for attention" },
    { id: "tags", label: "Tags", type: "multitext", description: "Tags for categorization" },
    { id: "notes", label: "Notes", type: "textarea", description: "Additional notes" },
    { id: "attachments", label: "Attachments", type: "file", description: "Related documents" },
    { id: "history", label: "Change History", type: "readonly", description: "Audit trail of changes" },
    { id: "createdBy", label: "Created By", type: "readonly", description: "Person who created the record" },
    { id: "createdDate", label: "Created Date", type: "readonly", description: "Date record was created" },
    { id: "modifiedBy", label: "Modified By", type: "readonly", description: "Person who last modified" },
    { id: "modifiedDate", label: "Modified Date", type: "readonly", description: "Date of last modification" },
  ],
  response_management: [
    { id: "recommendedActions", label: "Recommended Actions", type: "textarea", description: "Recommended response actions" },
    { id: "managementResponse", label: "Management Response", type: "textarea", description: "Management's response to the risk" },
    { id: "acceptanceRationale", label: "Acceptance Rationale", type: "textarea", description: "Reason for accepting risk (if applicable)" },
    { id: "acceptedBy", label: "Accepted By", type: "user", description: "Person who accepted the risk" },
    { id: "acceptanceDate", label: "Acceptance Date", type: "date", description: "Date risk was accepted" },
    { id: "reviewComments", label: "Review Comments", type: "textarea", description: "Comments from review process" },
  ],
};

const FIELD_SECTIONS = [
  { key: "identification", label: "Identification", icon: "FileText" },
  { key: "classification", label: "Classification", icon: "Tags" },
  { key: "ownership", label: "Ownership & Accountability", icon: "Users" },
  { key: "assessment", label: "Risk Assessment", icon: "BarChart" },
  { key: "cia_triad", label: "CIA Triad (IT/Security)", icon: "Shield" },
  { key: "causes_consequences", label: "Causes & Consequences", icon: "AlertTriangle" },
  { key: "controls", label: "Controls", icon: "Lock" },
  { key: "residual", label: "Residual Risk", icon: "TrendingDown" },
  { key: "treatment", label: "Treatment & Response", icon: "Wrench" },
  { key: "target", label: "Target Risk", icon: "Target" },
  { key: "compliance", label: "Compliance & Regulatory", icon: "FileCheck" },
  { key: "monitoring", label: "Monitoring & KRIs", icon: "Activity" },
  { key: "nist_rmf", label: "NIST RMF Specific", icon: "Shield" },
  { key: "coso_erm", label: "COSO ERM Specific", icon: "Building" },
  { key: "fair", label: "FAIR Quantitative", icon: "DollarSign" },
  { key: "documentation", label: "Documentation & Audit", icon: "FileText" },
  { key: "response_management", label: "Response Management", icon: "MessageSquare" },
];

function getRiskLevel(likelihood: number, impact: number): string {
  const score = likelihood * impact;
  if (score >= 16) return "critical";
  if (score >= 9) return "high";
  if (score >= 4) return "medium";
  return "low";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function RiskMatrix({ likelihood, impact }: { likelihood: number; impact: number }) {
  return (
    <div className="grid grid-cols-5 gap-1">
      {[5, 4, 3, 2, 1].map((row) =>
        [1, 2, 3, 4, 5].map((col) => {
          const score = row * col;
          let bg = "bg-chart-2/30";
          if (score >= 16) bg = "bg-destructive/70";
          else if (score >= 9) bg = "bg-chart-3/70";
          else if (score >= 4) bg = "bg-chart-1/70";
          
          const isSelected = row === likelihood && col === impact;
          
          return (
            <div
              key={`${row}-${col}`}
              className={`w-6 h-6 rounded-sm ${bg} ${isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-background" : ""}`}
            />
          );
        })
      )}
    </div>
  );
}

export default function RiskRegisterPage() {
  const { currentTenantId } = useTenant();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [riskLevelFilter, setRiskLevelFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [isCatalogDialogOpen, setIsCatalogDialogOpen] = useState(false);
  const [catalogSearchQuery, setCatalogSearchQuery] = useState("");
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState("all");
  const [mainTab, setMainTab] = useState<"risks" | "templates">("risks");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customizedFields, setCustomizedFields] = useState<any[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [expandedTemplates, setExpandedTemplates] = useState<string[]>([]);
  const [expandedRegisters, setExpandedRegisters] = useState<string[]>([]);
  const [registerViewModes, setRegisterViewModes] = useState<Record<string, "spreadsheet" | "card">>({});
  const [registerPendingChanges, setRegisterPendingChanges] = useState<Map<string, Map<string, Partial<Risk>>>>(new Map());
  const [editingCell, setEditingCell] = useState<{ riskId: string; field: string; registerId: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateCategory, setNewTemplateCategory] = useState("IT");
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  const toggleTemplateExpand = (templateId: string) => {
    setExpandedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const toggleRegisterExpand = (registerId: string) => {
    setExpandedRegisters(prev => 
      prev.includes(registerId) 
        ? prev.filter(id => id !== registerId)
        : [...prev, registerId]
    );
  };

  const getRegisterViewMode = (registerId: string) => {
    return registerViewModes[registerId] || "spreadsheet";
  };

  const setRegisterViewMode = (registerId: string, mode: "spreadsheet" | "card") => {
    setRegisterViewModes(prev => ({ ...prev, [registerId]: mode }));
  };

  const getRegisterRisks = (registerId: string) => {
    return risks.filter((r: Risk) => r.tenantId === currentTenantId);
  };

  const startCellEdit = (registerId: string, riskId: string, field: string, currentValue: any) => {
    setEditingCell({ registerId, riskId, field });
    setEditValue(String(currentValue ?? ""));
  };

  const cancelCellEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const saveCellEdit = async (registerId: string, riskId: string, field: string, value: any) => {
    try {
      await updateRisk(riskId, { [field]: value });
      queryClient.invalidateQueries({ queryKey: ["/api/risks"] });
      toast({ title: "Cell updated" });
    } catch (error) {
      toast({ title: "Failed to update", variant: "destructive" });
    }
    setEditingCell(null);
    setEditValue("");
  };

  const handleCellKeyDown = (e: React.KeyboardEvent, registerId: string, riskId: string, field: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      let finalValue: any = editValue;
      if (field === "likelihood" || field === "impact") {
        finalValue = Math.min(5, Math.max(1, parseInt(editValue) || 3));
      }
      saveCellEdit(registerId, riskId, field, finalValue);
    } else if (e.key === "Escape") {
      cancelCellEdit();
    }
  };

  const spreadsheetColumns = [
    { key: "title", label: "Risk Title", width: 200, editable: true, type: "text" },
    { key: "description", label: "Description", width: 250, editable: true, type: "text" },
    { key: "category", label: "Category", width: 120, editable: true, type: "select", options: categoryOptions },
    { key: "riskLevel", label: "Risk Level", width: 100, editable: false, type: "computed" },
    { key: "likelihood", label: "Likelihood", width: 80, editable: true, type: "number" },
    { key: "impact", label: "Impact", width: 80, editable: true, type: "number" },
    { key: "score", label: "Score", width: 60, editable: false, type: "computed" },
    { key: "status", label: "Status", width: 100, editable: true, type: "select", options: ["active", "in_progress", "pending", "completed", "inactive"] },
    { key: "mitigationPlan", label: "Mitigation Plan", width: 200, editable: true, type: "text" },
  ];

  const getCellValue = (risk: Risk, key: string) => {
    if (key === "score") return (risk.likelihood || 1) * (risk.impact || 1);
    if (key === "riskLevel") return getRiskLevel(risk.likelihood || 1, risk.impact || 1);
    return (risk as any)[key];
  };

  const getFieldTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      text: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      textarea: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      select: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      rating: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      calculated: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      user: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      date: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      multitext: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    };
    return colors[type] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const exportRisksToCSV = () => {
    const headers = ["ID", "Title", "Description", "Category", "Risk Level", "Likelihood", "Impact", "Status", "Owner ID", "Mitigation Plan"];
    const csvData = filteredRisks.map((risk: Risk) => [
      risk.id,
      risk.title,
      risk.description || "",
      risk.category || "",
      getRiskLevel(risk.likelihood || 1, risk.impact || 1),
      risk.likelihood || 0,
      risk.impact || 0,
      risk.status || "",
      risk.ownerId || "",
      risk.mitigationPlan || ""
    ]);
    
    const csvContent = [headers, ...csvData].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `risk-register-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported to CSV", description: `${filteredRisks.length} risks exported` });
  };

  const exportRisksToExcel = async () => {
    const headers = ["ID", "Title", "Description", "Category", "Risk Level", "Likelihood", "Impact", "Status", "Owner ID", "Mitigation Plan"];
    const data = filteredRisks.map((risk: Risk) => ({
      ID: risk.id,
      Title: risk.title,
      Description: risk.description || "",
      Category: risk.category || "",
      "Risk Level": getRiskLevel(risk.likelihood || 1, risk.impact || 1),
      Likelihood: risk.likelihood || 0,
      Impact: risk.impact || 0,
      Status: risk.status || "",
      "Owner ID": risk.ownerId || "",
      "Mitigation Plan": risk.mitigationPlan || ""
    }));

    // Create Excel-compatible XML
    let excelContent = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
    excelContent += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">';
    excelContent += '<Worksheet ss:Name="Risk Register"><Table>';
    
    // Headers
    excelContent += '<Row>';
    headers.forEach(h => excelContent += `<Cell><Data ss:Type="String">${h}</Data></Cell>`);
    excelContent += '</Row>';
    
    // Data rows
    data.forEach(row => {
      excelContent += '<Row>';
      Object.values(row).forEach(val => excelContent += `<Cell><Data ss:Type="String">${val}</Data></Cell>`);
      excelContent += '</Row>';
    });
    
    excelContent += '</Table></Worksheet></Workbook>';
    
    const blob = new Blob([excelContent], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `risk-register-${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported to Excel", description: `${filteredRisks.length} risks exported` });
  };

  const { data: risks = [], isLoading } = useQuery({
    queryKey: ["/api/risks", currentTenantId || "all"],
    queryFn: () => fetchRisks(currentTenantId || undefined),
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ["/api/tenants"],
    queryFn: fetchTenants,
  });

  const { data: riskRegisterTemplates = [], isLoading: isLoadingTemplates } = useQuery<any[]>({
    queryKey: ["/api/risk-register-templates"],
  });

  // Fetch active tenant risk registers
  const { data: tenantRegisters = [], isLoading: isLoadingRegisters } = useQuery<any[]>({
    queryKey: ["/api/tenant-risk-registers", currentTenantId],
    queryFn: async () => {
      const tenantId = currentTenantId || tenants[0]?.id;
      if (!tenantId) return [];
      const res = await fetch(`/api/tenant-risk-registers?tenantId=${tenantId}`);
      if (!res.ok) throw new Error("Failed to fetch tenant risk registers");
      return res.json();
    },
    enabled: !!currentTenantId || tenants.length > 0,
  });

  const { data: catalogItems = [] } = useQuery<RiskCatalogItem[]>({
    queryKey: ["/api/risk-catalog"],
    enabled: isCatalogDialogOpen,
  });

  const filteredCatalogItems = useMemo(() => {
    return catalogItems.filter((item) => {
      if (catalogCategoryFilter !== "all" && item.category !== catalogCategoryFilter) return false;
      if (catalogSearchQuery) {
        const query = catalogSearchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.code.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [catalogItems, catalogCategoryFilter, catalogSearchQuery]);

  const catalogCategories = useMemo(() => {
    const categories = new Set(catalogItems.map((item) => item.category));
    return Array.from(categories).sort();
  }, [catalogItems]);

  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find((t: Tenant) => t.id === tenantId);
    return tenant?.name || "Unknown";
  };

  const createForm = useForm<RiskFormValues>({
    resolver: zodResolver(riskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      likelihood: 3,
      impact: 3,
      status: "open",
      mitigationPlan: "",
    },
  });

  const editForm = useForm<RiskFormValues>({
    resolver: zodResolver(riskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      likelihood: 3,
      impact: 3,
      status: "open",
      mitigationPlan: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createRisk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risks"] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      toast({ title: "Risk logged successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create risk", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Risk> }) => updateRisk(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risks"] });
      setIsEditDialogOpen(false);
      setSelectedRisk(null);
      toast({ title: "Risk updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update risk", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRisk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risks"] });
      setIsDeleteDialogOpen(false);
      setSelectedRisk(null);
      toast({ title: "Risk deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete risk", variant: "destructive" });
    },
  });

  const columnSchema = z.object({
    id: z.string(),
    name: z.string(),
    label: z.string(),
    type: z.string(),
    required: z.boolean(),
    options: z.array(z.string()).nullable().optional(),
    formula: z.string().nullable().optional(),
  });

  const templatePayloadSchema = insertRiskRegisterTemplateSchema.extend({
    columns: z.array(columnSchema),
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      // Validate against schema with explicit column shape before sending
      const validationResult = templatePayloadSchema.safeParse(templateData);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      
      const response = await apiRequest("POST", "/api/risk-register-templates", validationResult.data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risk-register-templates"] });
      setIsUploadDialogOpen(false);
      setUploadedFile(null);
      setNewTemplateName("");
      setPreviewTemplate(null);
      toast({ title: "Template created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create template", description: error.message, variant: "destructive" });
    },
  });

  // Mutation to activate a template (create tenant risk register)
  const activateTemplateMutation = useMutation({
    mutationFn: async (template: any) => {
      const tenantId = currentTenantId || tenants[0]?.id;
      if (!tenantId) throw new Error("No tenant selected");
      
      const registerData = {
        tenantId,
        templateId: template.id,
        name: template.name,
        description: template.description || `Risk register using ${template.name} template`,
        scope: "Enterprise-wide",
        status: "active",
        reviewFrequency: "Quarterly",
        settings: {
          columns: template.columns || template.fields || [],
          scoringMethodology: template.scoringMethodology,
          riskMatrix: template.riskMatrix,
        },
      };
      
      const response = await apiRequest("POST", "/api/tenant-risk-registers", registerData);
      return response.json();
    },
    onSuccess: (data, template) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant-risk-registers"] });
      setSelectedTemplate(null);
      toast({ 
        title: "Risk Register Created", 
        description: `${template.name} template is now active. You can add risks using this methodology.` 
      });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to activate template", description: error.message, variant: "destructive" });
    },
  });

  const handleCreate = (data: RiskFormValues) => {
    const tenantId = currentTenantId || tenants[0]?.id;
    if (!tenantId) {
      toast({ title: "No tenant selected", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      ...data,
      tenantId,
      ownerId: null,
      mitigationPlan: data.mitigationPlan || null,
    } as any);
  };

  const handleEdit = (data: RiskFormValues) => {
    if (!selectedRisk) return;
    updateMutation.mutate({
      id: selectedRisk.id,
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        likelihood: data.likelihood,
        impact: data.impact,
        status: data.status as "active" | "in_progress" | "pending" | "completed" | "inactive",
        mitigationPlan: data.mitigationPlan || null,
      },
    });
  };

  const openEditDialog = (risk: Risk) => {
    setSelectedRisk(risk);
    editForm.reset({
      title: risk.title,
      description: risk.description || "",
      category: risk.category || "",
      likelihood: risk.likelihood || 3,
      impact: risk.impact || 3,
      status: risk.status || "active",
      mitigationPlan: risk.mitigationPlan || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDetailSheet = (risk: Risk) => {
    setSelectedRisk(risk);
    setIsDetailSheetOpen(true);
  };

  const openDeleteDialog = (risk: Risk) => {
    setSelectedRisk(risk);
    setIsDeleteDialogOpen(true);
  };

  const exportToPdf = async (risk: Risk) => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    
    const riskLevel = getRiskLevel(risk.likelihood || 3, risk.impact || 3);
    const riskScore = (risk.likelihood || 3) * (risk.impact || 3);
    
    doc.setFontSize(20);
    doc.setTextColor(33, 37, 41);
    doc.text(risk.title, 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(108, 117, 125);
    doc.text(`Category: ${risk.category || "N/A"}`, 20, 45);
    doc.text(`Risk Level: ${riskLevel.toUpperCase()}`, 20, 55);
    doc.text(`Risk Score: ${riskScore} (Likelihood: ${risk.likelihood || 3}, Impact: ${risk.impact || 3})`, 20, 65);
    doc.text(`Status: ${(risk.status || "active").toUpperCase()}`, 20, 75);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 85, 190, 85);
    
    doc.setFontSize(14);
    doc.setTextColor(33, 37, 41);
    doc.text("Description", 20, 100);
    
    doc.setFontSize(11);
    const splitDescription = doc.splitTextToSize(risk.description || "", 170);
    doc.text(splitDescription, 20, 115);
    
    if (risk.mitigationPlan) {
      const yOffset = 115 + splitDescription.length * 7 + 20;
      doc.setFontSize(14);
      doc.text("Mitigation Plan", 20, yOffset);
      doc.setFontSize(11);
      const splitMitigation = doc.splitTextToSize(risk.mitigationPlan, 170);
      doc.text(splitMitigation, 20, yOffset + 15);
    }
    
    doc.setFontSize(8);
    doc.setTextColor(108, 117, 125);
    doc.text(`Generated on ${new Date().toLocaleString()} | GRC Shield Platform`, 20, 280);
    
    doc.save(`${risk.title.replace(/\s+/g, "_")}_risk.pdf`);
    toast({ title: "PDF exported successfully" });
  };

  const exportToWord = async (risk: Risk) => {
    const { Document, Paragraph, TextRun, Packer, HeadingLevel } = await import("docx");
    
    const riskLevel = getRiskLevel(risk.likelihood || 3, risk.impact || 3);
    const riskScore = (risk.likelihood || 3) * (risk.impact || 3);
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: risk.title,
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Category: ", bold: true }),
              new TextRun(risk.category || "N/A"),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Risk Level: ", bold: true }),
              new TextRun(riskLevel.toUpperCase()),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Risk Score: ", bold: true }),
              new TextRun(`${riskScore} (Likelihood: ${risk.likelihood || 3}, Impact: ${risk.impact || 3})`),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Status: ", bold: true }),
              new TextRun((risk.status || "active").toUpperCase()),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            text: "Description",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: risk.description || "",
          }),
          ...(risk.mitigationPlan ? [
            new Paragraph({ text: "" }),
            new Paragraph({
              text: "Mitigation Plan",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text: risk.mitigationPlan,
            }),
          ] : []),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: `Generated on ${new Date().toLocaleString()} | GRC Shield Platform`, italics: true, size: 18 }),
            ],
          }),
        ],
      }],
    });
    
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${risk.title.replace(/\s+/g, "_")}_risk.docx`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Word document exported successfully" });
  };

  const filteredRisks = risks.filter((risk) => {
    const matchesSearch = risk.title.toLowerCase().includes(searchQuery.toLowerCase());
    const riskLevel = getRiskLevel(risk.likelihood || 3, risk.impact || 3);
    const matchesLevel = riskLevelFilter === "all" || riskLevel === riskLevelFilter;
    return matchesSearch && matchesLevel;
  });

  const criticalCount = risks.filter((r) => getRiskLevel(r.likelihood || 3, r.impact || 3) === "critical").length;
  const highCount = risks.filter((r) => getRiskLevel(r.likelihood || 3, r.impact || 3) === "high").length;
  const mediumCount = risks.filter((r) => getRiskLevel(r.likelihood || 3, r.impact || 3) === "medium").length;
  const mitigatedCount = risks.filter((r) => r.status === "completed" || r.status === "inactive").length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="mesh-gradient min-h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Risk Register</h1>
              <p className="text-muted-foreground mt-1">
                Identify, assess, and manage organizational risks with comprehensive tracking
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" data-testid="button-add-from-catalog" onClick={() => setIsCatalogDialogOpen(true)}>
                <BookOpen className="h-4 w-4 mr-2" />
                Add from Catalog
              </Button>
              <Button data-testid="button-create-risk" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Log New Risk
              </Button>
            </div>
          </div>

          {/* Main Tabs for Risks and Templates */}
          <Tabs value={mainTab} onValueChange={(value) => setMainTab(value as "risks" | "templates")} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="risks" data-testid="tab-risks">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Risk Register
              </TabsTrigger>
              <TabsTrigger value="templates" data-testid="tab-templates">
                <BookOpen className="h-4 w-4 mr-2" />
                Templates ({riskRegisterTemplates.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="mt-0">
              {/* Active Risk Registers Section */}
              {tenantRegisters.length > 0 && (
                <Card className="card-3d mb-6 border-2 border-emerald-500/30">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                      <CardTitle className="text-emerald-400">Active Risk Registers</CardTitle>
                    </div>
                    <CardDescription>
                      Your organization's activated risk assessment registers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tenantRegisters.map((register: any) => (
                        <Card key={register.id} className="bg-emerald-500/10 border-emerald-500/30" data-testid={`active-register-${register.id}`}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{register.name}</CardTitle>
                              <Badge className="bg-emerald-500/20 text-emerald-400">Active</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground mb-2">{register.description}</p>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <Badge variant="outline">{register.scope || "Enterprise-wide"}</Badge>
                              <Badge variant="secondary">{register.reviewFrequency || "Quarterly"}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="card-3d">
                <CardHeader>
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle>Risk Register Templates</CardTitle>
                      <CardDescription>
                        Choose from globally-accepted risk assessment methodologies and frameworks
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={() => setIsUploadDialogOpen(true)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500"
                      data-testid="button-upload-template"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Custom Template
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingTemplates ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48" />
                      ))}
                    </div>
                  ) : riskRegisterTemplates.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No templates available
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {riskRegisterTemplates.map((template: any) => (
                        <Card 
                          key={template.id} 
                          className={`border-2 transition-all ${expandedTemplates.includes(template.id) ? 'border-primary/50' : ''}`}
                          data-testid={`template-card-${template.id}`}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 cursor-pointer" onClick={() => toggleTemplateExpand(template.id)}>
                                <div className="flex items-center gap-2">
                                  {expandedTemplates.includes(template.id) ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <CardTitle className="text-base">{template.name}</CardTitle>
                                </div>
                                {template.standard && (
                                  <Badge variant="outline" className="mt-1 ml-6">{template.standard}</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {template.isGlobal ? (
                                  <Badge className="bg-primary/20 text-primary">Global</Badge>
                                ) : (
                                  <Badge className="bg-amber-500/20 text-amber-400">Custom</Badge>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTemplate(template);
                                  }}
                                  data-testid={`button-use-template-${template.id}`}
                                >
                                  Use Template
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 ml-6">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 ml-6">
                              <Badge variant="secondary" className="text-xs">
                                <Table2 className="h-3 w-3 mr-1" />
                                {template.columns?.length || 0} fields
                              </Badge>
                              <span>•</span>
                              <span>{template.category || "General"}</span>
                            </div>
                            
                            {expandedTemplates.includes(template.id) && template.columns && template.columns.length > 0 && (
                              <div className="mt-4 ml-6 border rounded-lg overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between">
                                  <span className="text-sm font-medium">Template Columns Preview</span>
                                  <div className="flex gap-1">
                                    <Badge variant="outline" className="text-xs">{template.columns.length} columns</Badge>
                                  </div>
                                </div>
                                <div className="overflow-x-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-muted/30">
                                        <TableHead className="w-8">#</TableHead>
                                        <TableHead>Column Name</TableHead>
                                        <TableHead>Field Type</TableHead>
                                        <TableHead>Required</TableHead>
                                        <TableHead>Options/Formula</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {template.columns.map((col: any, idx: number) => (
                                        <TableRow key={col.id || idx}>
                                          <TableCell className="text-muted-foreground text-xs">{idx + 1}</TableCell>
                                          <TableCell className="font-medium">{col.label}</TableCell>
                                          <TableCell>
                                            <Badge className={`${getFieldTypeColor(col.type)} text-xs`}>
                                              {col.type}
                                            </Badge>
                                          </TableCell>
                                          <TableCell>
                                            {col.required ? (
                                              <Badge className="bg-red-500/20 text-red-400 text-xs">Required</Badge>
                                            ) : (
                                              <span className="text-muted-foreground text-xs">Optional</span>
                                            )}
                                          </TableCell>
                                          <TableCell className="text-xs text-muted-foreground max-w-48 truncate">
                                            {col.options ? col.options.join(", ") : col.formula || "-"}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}
                            
                            {(template.applicableRegions || template.applicable_regions) && (template.applicableRegions || template.applicable_regions).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3 ml-6">
                                {(template.applicableRegions || template.applicable_regions).slice(0, 5).map((region: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs">{region}</Badge>
                                ))}
                                {(template.applicableRegions || template.applicable_regions).length > 5 && (
                                  <Badge variant="outline" className="text-xs">+{(template.applicableRegions || template.applicable_regions).length - 5}</Badge>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="risks" className="mt-0 space-y-6">
              {/* Active Risk Registers - Expandable Cards with Spreadsheet View */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-lg font-semibold text-emerald-400">Active Risk Registers</h2>
                  <Badge variant="outline" className="ml-2">{tenantRegisters.length || 1}</Badge>
                </div>
                <Button variant="outline" size="sm" onClick={() => setMainTab("templates")} data-testid="button-view-templates">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Register
                </Button>
              </div>

              {/* Default Risk Register when no tenant registers exist */}
              {tenantRegisters.length === 0 && (
                <Card className="card-3d border border-emerald-500/30">
                  <Collapsible 
                    open={expandedRegisters.includes("default")} 
                    onOpenChange={() => toggleRegisterExpand("default")}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover-elevate pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {expandedRegisters.includes("default") ? (
                              <ChevronDown className="h-5 w-5 text-emerald-400" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-emerald-400" />
                            )}
                            <FileCheck className="h-5 w-5 text-emerald-400" />
                            <div>
                              <CardTitle className="text-base">Default Risk Register</CardTitle>
                              <CardDescription className="text-xs">Enterprise-wide risk register</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Badge variant="secondary" className="text-xs">{filteredRisks.length} risks</Badge>
                            <div className="flex items-center border rounded-md overflow-hidden">
                              <Button
                                variant={getRegisterViewMode("default") === "spreadsheet" ? "secondary" : "ghost"}
                                size="sm"
                                className="rounded-none h-8 px-2"
                                onClick={(e) => { e.stopPropagation(); setRegisterViewMode("default", "spreadsheet"); }}
                                data-testid="button-view-spreadsheet-default"
                              >
                                <Table2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant={getRegisterViewMode("default") === "card" ? "secondary" : "ghost"}
                                size="sm"
                                className="rounded-none h-8 px-2"
                                onClick={(e) => { e.stopPropagation(); setRegisterViewMode("default", "card"); }}
                                data-testid="button-view-card-default"
                              >
                                <FileSpreadsheet className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        {getRegisterViewMode("default") === "spreadsheet" ? (
                          <div className="border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted/50">
                                    {spreadsheetColumns.map((col) => (
                                      <TableHead key={col.key} style={{ minWidth: col.width }} className="text-xs font-semibold">
                                        {col.label}
                                      </TableHead>
                                    ))}
                                    <TableHead className="w-12"></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {filteredRisks.map((risk: Risk) => (
                                    <TableRow key={risk.id} className="group" data-testid={`spreadsheet-row-${risk.id}`}>
                                      {spreadsheetColumns.map((col) => {
                                        const isEditing = editingCell?.riskId === risk.id && editingCell?.field === col.key && editingCell?.registerId === "default";
                                        const cellValue = getCellValue(risk, col.key);
                                        
                                        return (
                                          <TableCell 
                                            key={col.key} 
                                            className={`p-1 ${col.editable ? "cursor-pointer hover:bg-muted/50" : ""}`}
                                            onClick={() => col.editable && startCellEdit("default", risk.id, col.key, cellValue)}
                                          >
                                            {isEditing ? (
                                              col.type === "select" ? (
                                                <Select
                                                  value={editValue}
                                                  onValueChange={(val) => {
                                                    saveCellEdit("default", risk.id, col.key, val);
                                                  }}
                                                >
                                                  <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    {col.options?.map((opt) => (
                                                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                              ) : (
                                                <Input
                                                  value={editValue}
                                                  onChange={(e) => setEditValue(e.target.value)}
                                                  onKeyDown={(e) => handleCellKeyDown(e, "default", risk.id, col.key)}
                                                  onBlur={() => saveCellEdit("default", risk.id, col.key, editValue)}
                                                  className="h-8 text-xs"
                                                  autoFocus
                                                  type={col.type === "number" ? "number" : "text"}
                                                  min={col.type === "number" ? 1 : undefined}
                                                  max={col.type === "number" ? 5 : undefined}
                                                />
                                              )
                                            ) : (
                                              <div className="px-2 py-1 text-sm truncate">
                                                {col.key === "riskLevel" ? (
                                                  <Badge className={`${riskLevelStyles[cellValue as keyof typeof riskLevelStyles]?.bg} ${riskLevelStyles[cellValue as keyof typeof riskLevelStyles]?.text} text-xs capitalize`}>
                                                    {cellValue}
                                                  </Badge>
                                                ) : col.key === "status" ? (
                                                  <Badge className={`${statusStyles[(cellValue as keyof typeof statusStyles) || "active"]?.bg} ${statusStyles[(cellValue as keyof typeof statusStyles) || "active"]?.text} text-xs capitalize`}>
                                                    {cellValue}
                                                  </Badge>
                                                ) : col.key === "score" ? (
                                                  <span className="font-bold">{cellValue}</span>
                                                ) : (
                                                  <span>{cellValue ?? "-"}</span>
                                                )}
                                              </div>
                                            )}
                                          </TableCell>
                                        );
                                      })}
                                      <TableCell className="p-1">
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                                              <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openDetailSheet(risk)}>
                                              <Eye className="h-4 w-4 mr-2" /> View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => openEditDialog(risk)}>
                                              <Edit className="h-4 w-4 mr-2" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(risk)}>
                                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  {filteredRisks.length === 0 && (
                                    <TableRow>
                                      <TableCell colSpan={spreadsheetColumns.length + 1} className="text-center py-8 text-muted-foreground">
                                        No risks found. Click "Add Risk" to create one.
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredRisks.map((risk: Risk) => {
                              const riskLevel = getRiskLevel(risk.likelihood || 1, risk.impact || 1);
                              const riskStyle = riskLevelStyles[riskLevel as keyof typeof riskLevelStyles];
                              return (
                                <Card key={risk.id} className="hover-elevate cursor-pointer" onClick={() => openDetailSheet(risk)}>
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                      <h4 className="font-medium text-sm line-clamp-2">{risk.title}</h4>
                                      <Badge className={`${riskStyle?.bg} ${riskStyle?.text} text-xs capitalize ml-2`}>
                                        {riskLevel}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{risk.description}</p>
                                    <div className="flex items-center justify-between">
                                      <Badge variant="outline" className="text-xs">{risk.category}</Badge>
                                      <span className="text-xs text-muted-foreground">Score: {(risk.likelihood || 1) * (risk.impact || 1)}</span>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}

              {/* Tenant Risk Registers */}
              {tenantRegisters.map((register: any) => (
                <Card key={register.id} className="card-3d border border-emerald-500/30">
                  <Collapsible 
                    open={expandedRegisters.includes(register.id)} 
                    onOpenChange={() => toggleRegisterExpand(register.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover-elevate pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {expandedRegisters.includes(register.id) ? (
                              <ChevronDown className="h-5 w-5 text-emerald-400" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-emerald-400" />
                            )}
                            <FileCheck className="h-5 w-5 text-emerald-400" />
                            <div>
                              <CardTitle className="text-base">{register.name}</CardTitle>
                              <CardDescription className="text-xs">{register.description || register.scope || "Enterprise-wide"}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Badge variant="secondary" className="text-xs">{register.reviewFrequency || "Quarterly"}</Badge>
                            <Badge variant="outline" className="text-xs">{getRegisterRisks(register.id).length} risks</Badge>
                            <div className="flex items-center border rounded-md overflow-hidden">
                              <Button
                                variant={getRegisterViewMode(register.id) === "spreadsheet" ? "secondary" : "ghost"}
                                size="sm"
                                className="rounded-none h-8 px-2"
                                onClick={(e) => { e.stopPropagation(); setRegisterViewMode(register.id, "spreadsheet"); }}
                                data-testid={`button-view-spreadsheet-${register.id}`}
                              >
                                <Table2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant={getRegisterViewMode(register.id) === "card" ? "secondary" : "ghost"}
                                size="sm"
                                className="rounded-none h-8 px-2"
                                onClick={(e) => { e.stopPropagation(); setRegisterViewMode(register.id, "card"); }}
                                data-testid={`button-view-card-${register.id}`}
                              >
                                <FileSpreadsheet className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        {getRegisterViewMode(register.id) === "spreadsheet" ? (
                          <div className="border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted/50">
                                    {spreadsheetColumns.map((col) => (
                                      <TableHead key={col.key} style={{ minWidth: col.width }} className="text-xs font-semibold">
                                        {col.label}
                                      </TableHead>
                                    ))}
                                    <TableHead className="w-12"></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {getRegisterRisks(register.id).map((risk: Risk) => (
                                    <TableRow key={risk.id} className="group" data-testid={`spreadsheet-row-${risk.id}`}>
                                      {spreadsheetColumns.map((col) => {
                                        const isEditing = editingCell?.riskId === risk.id && editingCell?.field === col.key && editingCell?.registerId === register.id;
                                        const cellValue = getCellValue(risk, col.key);
                                        
                                        return (
                                          <TableCell 
                                            key={col.key} 
                                            className={`p-1 ${col.editable ? "cursor-pointer hover:bg-muted/50" : ""}`}
                                            onClick={() => col.editable && startCellEdit(register.id, risk.id, col.key, cellValue)}
                                          >
                                            {isEditing ? (
                                              col.type === "select" ? (
                                                <Select
                                                  value={editValue}
                                                  onValueChange={(val) => {
                                                    saveCellEdit(register.id, risk.id, col.key, val);
                                                  }}
                                                >
                                                  <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    {col.options?.map((opt) => (
                                                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                              ) : (
                                                <Input
                                                  value={editValue}
                                                  onChange={(e) => setEditValue(e.target.value)}
                                                  onKeyDown={(e) => handleCellKeyDown(e, register.id, risk.id, col.key)}
                                                  onBlur={() => saveCellEdit(register.id, risk.id, col.key, editValue)}
                                                  className="h-8 text-xs"
                                                  autoFocus
                                                  type={col.type === "number" ? "number" : "text"}
                                                  min={col.type === "number" ? 1 : undefined}
                                                  max={col.type === "number" ? 5 : undefined}
                                                />
                                              )
                                            ) : (
                                              <div className="px-2 py-1 text-sm truncate">
                                                {col.key === "riskLevel" ? (
                                                  <Badge className={`${riskLevelStyles[cellValue as keyof typeof riskLevelStyles]?.bg} ${riskLevelStyles[cellValue as keyof typeof riskLevelStyles]?.text} text-xs capitalize`}>
                                                    {cellValue}
                                                  </Badge>
                                                ) : col.key === "status" ? (
                                                  <Badge className={`${statusStyles[(cellValue as keyof typeof statusStyles) || "active"]?.bg} ${statusStyles[(cellValue as keyof typeof statusStyles) || "active"]?.text} text-xs capitalize`}>
                                                    {cellValue}
                                                  </Badge>
                                                ) : col.key === "score" ? (
                                                  <span className="font-bold">{cellValue}</span>
                                                ) : (
                                                  <span>{cellValue ?? "-"}</span>
                                                )}
                                              </div>
                                            )}
                                          </TableCell>
                                        );
                                      })}
                                      <TableCell className="p-1">
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                                              <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openDetailSheet(risk)}>
                                              <Eye className="h-4 w-4 mr-2" /> View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => openEditDialog(risk)}>
                                              <Edit className="h-4 w-4 mr-2" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(risk)}>
                                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  {getRegisterRisks(register.id).length === 0 && (
                                    <TableRow>
                                      <TableCell colSpan={spreadsheetColumns.length + 1} className="text-center py-8 text-muted-foreground">
                                        No risks in this register. Click "Add Risk" to create one.
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {getRegisterRisks(register.id).map((risk: Risk) => {
                              const riskLevel = getRiskLevel(risk.likelihood || 1, risk.impact || 1);
                              const riskStyle = riskLevelStyles[riskLevel as keyof typeof riskLevelStyles];
                              return (
                                <Card key={risk.id} className="hover-elevate cursor-pointer" onClick={() => openDetailSheet(risk)}>
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                      <h4 className="font-medium text-sm line-clamp-2">{risk.title}</h4>
                                      <Badge className={`${riskStyle?.bg} ${riskStyle?.text} text-xs capitalize ml-2`}>
                                        {riskLevel}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{risk.description}</p>
                                    <div className="flex items-center justify-between">
                                      <Badge variant="outline" className="text-xs">{risk.category}</Badge>
                                      <span className="text-xs text-muted-foreground">Score: {(risk.likelihood || 1) * (risk.impact || 1)}</span>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="stat-gradient-red">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/20">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{isLoading ? "-" : criticalCount}</p>
                    <p className="text-xs text-muted-foreground">Critical Risks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-amber">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-3/20">
                    <AlertTriangle className="h-5 w-5 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{isLoading ? "-" : highCount}</p>
                    <p className="text-xs text-muted-foreground">High Risks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-blue">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-1/20">
                    <Shield className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{isLoading ? "-" : mediumCount}</p>
                    <p className="text-xs text-muted-foreground">Medium Risks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-green">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-2/20">
                    <CheckCircle2 className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{isLoading ? "-" : mitigatedCount}</p>
                    <p className="text-xs text-muted-foreground">Mitigated</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="card-3d">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <CardTitle className="text-base font-semibold">All Risks</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportRisksToCSV}
                      disabled={filteredRisks.length === 0}
                      data-testid="button-export-csv"
                    >
                      <FileDown className="h-4 w-4 mr-1" />
                      CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportRisksToExcel}
                      disabled={filteredRisks.length === 0}
                      data-testid="button-export-excel"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-1" />
                      Excel
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search risks..."
                      className="pl-9 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="input-search-risks"
                    />
                  </div>
                  <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
                    <SelectTrigger className="w-32" data-testid="select-risk-level">
                      <SelectValue placeholder="Risk Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <TableSkeleton />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Risk</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRisks.map((risk) => {
                      const likelihood = risk.likelihood || 3;
                      const impact = risk.impact || 3;
                      const riskLevel = getRiskLevel(likelihood, impact);
                      const riskStyle = riskLevelStyles[riskLevel as keyof typeof riskLevelStyles];
                      const statusStyle = statusStyles[(risk.status || "active") as keyof typeof statusStyles] || statusStyles.active;
                      const riskScore = likelihood * impact;
                      return (
                        <TableRow
                          key={risk.id}
                          className="cursor-pointer"
                          data-testid={`row-risk-${risk.id}`}
                          onClick={() => openDetailSheet(risk)}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{risk.title}</p>
                              <p className="text-xs text-muted-foreground">{risk.id.slice(0, 8)}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {risk.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${riskStyle.bg} ${riskStyle.text} border-0 capitalize`}>
                              {riskLevel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="font-bold">{riskScore}</span>
                              <span className="text-xs text-muted-foreground">
                                ({likelihood}x{impact})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statusStyle.bg} ${statusStyle.text} border-0 capitalize`}>
                              {risk.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{getTenantName(risk.tenantId || "")}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openDetailSheet(risk); }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(risk); }}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Risk
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); exportToPdf(risk); }}>
                                  <FileDown className="h-4 w-4 mr-2" />
                                  Export as PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); exportToWord(risk); }}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Export as Word
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive" 
                                  onClick={(e) => { e.stopPropagation(); openDeleteDialog(risk); }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredRisks.length === 0 && !isLoading && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No risks found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Template Detail Dialog - Enhanced with Customization */}
      <Dialog open={!!selectedTemplate} onOpenChange={(open) => {
        if (!open) {
          setSelectedTemplate(null);
          setIsCustomizing(false);
          setCustomizedFields([]);
          setExpandedSections([]);
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">{selectedTemplate?.name}</DialogTitle>
                <DialogDescription>{selectedTemplate?.description}</DialogDescription>
              </div>
              {!isCustomizing && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsCustomizing(true);
                    setCustomizedFields(selectedTemplate?.columns || selectedTemplate?.fields || []);
                  }}
                  data-testid="button-customize-template"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Customize Template
                </Button>
              )}
            </div>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="flex-1 overflow-hidden">
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedTemplate.standard && <Badge>{selectedTemplate.standard}</Badge>}
                {selectedTemplate.category && <Badge variant="outline">{selectedTemplate.category}</Badge>}
                {selectedTemplate.isGlobal && <Badge className="bg-primary/20 text-primary">Global Template</Badge>}
                <Badge variant="secondary">{(selectedTemplate.columns || selectedTemplate.fields || []).length} fields</Badge>
              </div>
              
              {selectedTemplate.scoringMethodology && (
                <div className="mb-4 p-3 rounded-lg bg-muted/30 border">
                  <h4 className="font-semibold text-sm mb-1">Scoring Methodology</h4>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.scoringMethodology}</p>
                </div>
              )}

              {isCustomizing ? (
                <div className="grid grid-cols-2 gap-4 h-[calc(100%-120px)]">
                  {/* Left: Available Fields Library */}
                  <div className="border rounded-lg overflow-hidden flex flex-col">
                    <div className="p-3 bg-muted/50 border-b">
                      <h4 className="font-semibold">Field Library</h4>
                      <p className="text-xs text-muted-foreground">Click to add fields to your template</p>
                    </div>
                    <ScrollArea className="flex-1 p-2">
                      {FIELD_SECTIONS.map((section) => {
                        const sectionFields = FIELD_LIBRARY[section.key as keyof typeof FIELD_LIBRARY] || [];
                        const isExpanded = expandedSections.includes(section.key);
                        
                        return (
                          <Collapsible 
                            key={section.key} 
                            open={isExpanded}
                            onOpenChange={(open) => {
                              setExpandedSections(open 
                                ? [...expandedSections, section.key]
                                : expandedSections.filter(s => s !== section.key)
                              );
                            }}
                          >
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" className="w-full justify-between p-2 h-auto" data-testid={`section-${section.key}`}>
                                <span className="text-sm font-medium">{section.label}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">{sectionFields.length}</Badge>
                                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </div>
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pl-2">
                              {sectionFields.map((field) => {
                                const isAdded = customizedFields.some(f => f.id === field.id);
                                return (
                                  <div 
                                    key={field.id} 
                                    className={`p-2 mb-1 rounded border cursor-pointer transition-all ${isAdded ? 'bg-primary/10 border-primary/30' : 'bg-muted/30 hover-elevate'}`}
                                    onClick={() => {
                                      if (!isAdded) {
                                        setCustomizedFields([...customizedFields, { ...field }]);
                                        toast({ title: "Field Added", description: `${field.label} added to template` });
                                      }
                                    }}
                                    data-testid={`field-${field.id}`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm">{field.label}</span>
                                      <div className="flex items-center gap-1">
                                        <Badge variant="outline" className="text-xs">{field.type}</Badge>
                                        {isAdded && <Check className="h-3 w-3 text-primary" />}
                                      </div>
                                    </div>
                                    {field.description && (
                                      <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
                                    )}
                                  </div>
                                );
                              })}
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                    </ScrollArea>
                  </div>

                  {/* Right: Selected Fields */}
                  <div className="border rounded-lg overflow-hidden flex flex-col">
                    <div className="p-3 bg-muted/50 border-b">
                      <h4 className="font-semibold">Template Fields ({customizedFields.length})</h4>
                      <p className="text-xs text-muted-foreground">Remove or reorder fields</p>
                    </div>
                    <ScrollArea className="flex-1 p-2">
                      {customizedFields.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No fields selected</p>
                          <p className="text-xs">Click fields from the library to add them</p>
                        </div>
                      ) : (
                        customizedFields.map((field, idx) => (
                          <div 
                            key={`${field.id}-${idx}`} 
                            className="p-2 mb-1 rounded border bg-card flex items-center gap-2"
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{field.label}</span>
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className="text-xs">{field.type}</Badge>
                                  {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                                </div>
                              </div>
                              {field.description && (
                                <p className="text-xs text-muted-foreground">{field.description}</p>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => {
                                setCustomizedFields(customizedFields.filter((_, i) => i !== idx));
                              }}
                              data-testid={`remove-field-${field.id}`}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                      )}
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold mb-2">Template Structure ({(selectedTemplate.columns || selectedTemplate.fields || []).length} fields)</h4>
                    {(selectedTemplate.columns || selectedTemplate.fields || []).map((field: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-muted/30 border">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{field.label || field.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{field.type}</Badge>
                            {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                          </div>
                        </div>
                        {field.description && (
                          <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
                        )}
                        {field.options && field.options.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {field.options.slice(0, 5).map((opt: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">{opt}</Badge>
                            ))}
                            {field.options.length > 5 && (
                              <Badge variant="secondary" className="text-xs">+{field.options.length - 5} more</Badge>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {selectedTemplate.riskMatrix && (
                    <div className="mt-4 p-3 rounded-lg bg-muted/30 border">
                      <h4 className="font-semibold mb-2">Risk Matrix</h4>
                      <p className="text-sm text-muted-foreground">Type: {selectedTemplate.riskMatrix.type}</p>
                      {selectedTemplate.riskMatrix.levels && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedTemplate.riskMatrix.levels.map((level: any, i: number) => (
                            <div key={i} className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: level.color }} />
                              <span className="text-xs capitalize">{level.level}: {level.min}-{level.max}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Applicable Organizations */}
                  {((selectedTemplate.applicableOrganizations || selectedTemplate.applicable_organizations) && (selectedTemplate.applicableOrganizations || selectedTemplate.applicable_organizations).length > 0) && (
                    <div className="mt-4 p-3 rounded-lg bg-muted/30 border">
                      <h4 className="font-semibold mb-2">Applicable Organizations</h4>
                      <div className="flex flex-wrap gap-2">
                        {(selectedTemplate.applicableOrganizations || selectedTemplate.applicable_organizations).map((org: string, idx: number) => (
                          <Badge key={idx} variant="outline">{org}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Applicable Regions */}
                  {((selectedTemplate.applicableRegions || selectedTemplate.applicable_regions) && (selectedTemplate.applicableRegions || selectedTemplate.applicable_regions).length > 0) && (
                    <div className="mt-4 p-3 rounded-lg bg-muted/30 border">
                      <h4 className="font-semibold mb-2">Applicable Regions</h4>
                      <div className="flex flex-wrap gap-2">
                        {(selectedTemplate.applicableRegions || selectedTemplate.applicable_regions).map((region: string, idx: number) => (
                          <Badge key={idx} variant="secondary">{region}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Applicable Frameworks */}
                  {((selectedTemplate.applicableFrameworks || selectedTemplate.applicable_frameworks) && (selectedTemplate.applicableFrameworks || selectedTemplate.applicable_frameworks).length > 0) && (
                    <div className="mt-4 p-3 rounded-lg bg-muted/30 border">
                      <h4 className="font-semibold mb-2">Compatible Frameworks</h4>
                      <div className="flex flex-wrap gap-2">
                        {(selectedTemplate.applicableFrameworks || selectedTemplate.applicable_frameworks).map((fw: string, idx: number) => (
                          <Badge key={idx} className="bg-primary/20 text-primary">{fw}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTemplate.riskCategories && selectedTemplate.riskCategories.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Risk Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTemplate.riskCategories.map((cat: string, idx: number) => (
                          <Badge key={idx} variant="secondary">{cat}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </ScrollArea>
              )}
            </div>
          )}
          
          <DialogFooter className="mt-4">
            {isCustomizing ? (
              <>
                <Button variant="outline" onClick={() => {
                  setIsCustomizing(false);
                  setCustomizedFields([]);
                }}>
                  Cancel Customization
                </Button>
                <Button 
                  onClick={() => {
                    toast({ 
                      title: "Customized Template Ready", 
                      description: `Template with ${customizedFields.length} fields is ready to use.` 
                    });
                    setIsCustomizing(false);
                    setSelectedTemplate(null);
                  }}
                  disabled={customizedFields.length === 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Use Customized Template ({customizedFields.length} fields)
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setSelectedTemplate(null)}>Close</Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsCustomizing(true);
                    setCustomizedFields(selectedTemplate?.columns || selectedTemplate?.fields || []);
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Customize & Use
                </Button>
                <Button 
                  onClick={() => activateTemplateMutation.mutate(selectedTemplate)}
                  disabled={activateTemplateMutation.isPending}
                  data-testid="button-activate-template"
                >
                  {activateTemplateMutation.isPending ? "Creating..." : "Use Original Template"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Log New Risk</DialogTitle>
            <DialogDescription>
              Record a new risk with likelihood and impact assessment.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Data Breach Risk" {...field} data-testid="input-risk-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-risk-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryOptions.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-risk-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="likelihood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Likelihood (1-5): {field.value}</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          value={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                          className="mt-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="impact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Impact (1-5): {field.value}</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          value={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                          className="mt-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Risk Score</span>
                  <Badge className={`${riskLevelStyles[getRiskLevel(createForm.watch("likelihood"), createForm.watch("impact")) as keyof typeof riskLevelStyles]?.bg} text-white border-0`}>
                    {createForm.watch("likelihood") * createForm.watch("impact")} - {getRiskLevel(createForm.watch("likelihood"), createForm.watch("impact")).toUpperCase()}
                  </Badge>
                </div>
              </div>
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the risk in detail..." 
                        className="min-h-[100px]" 
                        {...field} 
                        data-testid="textarea-risk-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="mitigationPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mitigation Plan (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the mitigation strategy..." 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-risk">
                  {createMutation.isPending ? "Creating..." : "Log Risk"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Risk</DialogTitle>
            <DialogDescription>
              Update the risk details and assessment.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Title</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-risk-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryOptions.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="likelihood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Likelihood (1-5): {field.value}</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          value={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                          className="mt-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="impact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Impact (1-5): {field.value}</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          value={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                          className="mt-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Risk Score</span>
                  <Badge className={`${riskLevelStyles[getRiskLevel(editForm.watch("likelihood"), editForm.watch("impact")) as keyof typeof riskLevelStyles]?.bg} text-white border-0`}>
                    {editForm.watch("likelihood") * editForm.watch("impact")} - {getRiskLevel(editForm.watch("likelihood"), editForm.watch("impact")).toUpperCase()}
                  </Badge>
                </div>
              </div>
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="mitigationPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mitigation Plan</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedRisk && (
            <>
              <SheetHeader>
                <div className="flex items-start justify-between pr-8">
                  <div>
                    <SheetTitle className="text-xl">{selectedRisk.title}</SheetTitle>
                    <SheetDescription className="mt-1">
                      {selectedRisk.category} Risk
                    </SheetDescription>
                  </div>
                  <Badge className={`${riskLevelStyles[getRiskLevel(selectedRisk.likelihood || 3, selectedRisk.impact || 3) as keyof typeof riskLevelStyles]?.bg} text-white border-0`}>
                    {getRiskLevel(selectedRisk.likelihood || 3, selectedRisk.impact || 3).toUpperCase()}
                  </Badge>
                </div>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="assessment">Assessment</TabsTrigger>
                    <TabsTrigger value="mitigation">Mitigation</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="mt-4 space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Risk Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Organization</p>
                            <p className="text-sm font-medium">{getTenantName(selectedRisk.tenantId || "")}</p>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex items-center gap-3">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Risk Score</p>
                            <p className="text-sm font-medium">
                              {(selectedRisk.likelihood || 3) * (selectedRisk.impact || 3)} 
                              (Likelihood: {selectedRisk.likelihood}, Impact: {selectedRisk.impact})
                            </p>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Status</p>
                            <Badge className={`${statusStyles[selectedRisk.status as keyof typeof statusStyles]?.bg} ${statusStyles[selectedRisk.status as keyof typeof statusStyles]?.text} border-0 capitalize`}>
                              {selectedRisk.status}
                            </Badge>
                          </div>
                        </div>
                        {selectedRisk.ownerId && (
                          <>
                            <Separator />
                            <div className="flex items-center gap-3">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Owner</p>
                                <p className="text-sm font-medium">{selectedRisk.ownerId}</p>
                              </div>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Description</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{selectedRisk.description}</p>
                      </CardContent>
                    </Card>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => openEditDialog(selectedRisk)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Risk
                      </Button>
                      <Button variant="outline" onClick={() => exportToPdf(selectedRisk)}>
                        <FileDown className="h-4 w-4 mr-2" />
                        Export PDF
                      </Button>
                      <Button variant="outline" onClick={() => exportToWord(selectedRisk)}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Word
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="assessment" className="mt-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Risk Assessment Matrix</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-center">
                          <RiskMatrix 
                            likelihood={selectedRisk.likelihood || 3} 
                            impact={selectedRisk.impact || 3} 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-muted/50 text-center">
                            <p className="text-2xl font-bold">{selectedRisk.likelihood || 3}</p>
                            <p className="text-xs text-muted-foreground">Likelihood</p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50 text-center">
                            <p className="text-2xl font-bold">{selectedRisk.impact || 3}</p>
                            <p className="text-xs text-muted-foreground">Impact</p>
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Total Risk Score</span>
                            <span className="text-2xl font-bold">{(selectedRisk.likelihood || 3) * (selectedRisk.impact || 3)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="mitigation" className="mt-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Mitigation Plan</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedRisk.mitigationPlan ? (
                          <p className="text-sm whitespace-pre-wrap">{selectedRisk.mitigationPlan}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">No mitigation plan has been defined for this risk.</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Risk</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedRisk?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedRisk && deleteMutation.mutate(selectedRisk.id)}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isCatalogDialogOpen} onOpenChange={setIsCatalogDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Add Risk from Catalog
            </DialogTitle>
            <DialogDescription>
              Select a risk from the catalog to add to your risk register with pre-defined attributes.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 py-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search catalog risks..."
                value={catalogSearchQuery}
                onChange={(e) => setCatalogSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-catalog-search"
              />
            </div>
            <Select value={catalogCategoryFilter} onValueChange={setCatalogCategoryFilter}>
              <SelectTrigger className="w-[200px]" data-testid="select-catalog-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {catalogCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-[100px]">Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">L/I</TableHead>
                  <TableHead className="text-center w-[60px]">AI</TableHead>
                  <TableHead className="w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCatalogItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No risks found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCatalogItems.map((item) => {
                    const score = item.defaultLikelihood * item.defaultImpact;
                    let riskLevel = "Low";
                    let levelColor = "bg-chart-2";
                    if (score >= 20) { riskLevel = "Critical"; levelColor = "bg-destructive"; }
                    else if (score >= 12) { riskLevel = "High"; levelColor = "bg-chart-3"; }
                    else if (score >= 6) { riskLevel = "Medium"; levelColor = "bg-chart-1"; }

                    return (
                      <TableRow key={item.id} data-testid={`row-catalog-${item.code}`}>
                        <TableCell>
                          <Badge variant="outline">{item.code}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium line-clamp-1">{item.name}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">{item.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">{item.category}</div>
                            {item.subcategory && (
                              <div className="text-xs text-muted-foreground">{item.subcategory}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${levelColor} text-white`}>{riskLevel}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.aiEnriched && <Sparkles className="h-4 w-4 text-chart-2 mx-auto" />}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => {
                              const tenantId = currentTenantId || tenants[0]?.id;
                              if (!tenantId) {
                                toast({ title: "No tenant selected", variant: "destructive" });
                                return;
                              }
                              createMutation.mutate({
                                title: item.name,
                                description: item.description,
                                category: item.category,
                                likelihood: item.defaultLikelihood,
                                impact: item.defaultImpact,
                                status: "active",
                                tenantId,
                                ownerId: null,
                                mitigationPlan: item.suggestedControls ? item.suggestedControls.join("\n- ") : null,
                              } as any, {
                                onSuccess: () => {
                                  toast({ 
                                    title: "Risk added from catalog",
                                    description: `"${item.name}" has been added to your risk register.`
                                  });
                                }
                              });
                            }}
                            data-testid={`button-add-catalog-${item.code}`}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="pt-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-muted-foreground">
                Showing {filteredCatalogItems.length} of {catalogItems.length} risks
              </span>
              <Button variant="outline" onClick={() => setIsCatalogDialogOpen(false)} data-testid="button-close-catalog-dialog">
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Custom Template
            </DialogTitle>
            <DialogDescription>
              Import a risk register template from a CSV file. The first row should contain single-line column headers (quoted commas are supported).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="e.g., Custom IT Risk Assessment"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                data-testid="input-template-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-category">Category</Label>
              <Select value={newTemplateCategory} onValueChange={setNewTemplateCategory}>
                <SelectTrigger id="template-category" data-testid="select-template-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT">IT Risk Assessment</SelectItem>
                  <SelectItem value="Operational">Operational Risk</SelectItem>
                  <SelectItem value="Compliance">Compliance Risk</SelectItem>
                  <SelectItem value="Financial">Financial Risk</SelectItem>
                  <SelectItem value="Strategic">Strategic Risk</SelectItem>
                  <SelectItem value="Environmental">Environmental Risk</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Template File</Label>
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  uploadedFile ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
              >
                {uploadedFile ? (
                  <div className="space-y-2">
                    <FileSpreadsheet className="h-10 w-10 mx-auto text-primary" />
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setUploadedFile(null)}
                      data-testid="button-remove-file"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">Drag & drop or click to upload</p>
                    <p className="text-xs text-muted-foreground">Supports CSV format</p>
                    <Input
                      type="file"
                      accept=".csv"
                      className="max-w-xs mx-auto cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setUploadedFile(file);
                      }}
                      data-testid="input-file-upload"
                    />
                  </div>
                )}
              </div>
            </div>

            {previewTemplate && previewTemplate.columns && (
              <div className="space-y-2">
                <Label>Preview Columns</Label>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-3 py-2 border-b flex items-center justify-between">
                    <span className="text-sm font-medium">Detected Columns</span>
                    <Badge variant="outline">{previewTemplate.columns.length} columns</Badge>
                  </div>
                  <div className="p-3 max-h-48 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {previewTemplate.columns.map((col: any, idx: number) => (
                        <Badge 
                          key={idx} 
                          variant="secondary"
                          className={getFieldTypeColor(col.type || 'text')}
                        >
                          {col.label || col.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsUploadDialogOpen(false);
                setUploadedFile(null);
                setNewTemplateName("");
                setPreviewTemplate(null);
              }}
              data-testid="button-cancel-upload"
            >
              Cancel
            </Button>
            <Button
              disabled={!uploadedFile || !newTemplateName}
              onClick={() => {
                if (!uploadedFile || !newTemplateName) return;
                
                const reader = new FileReader();
                reader.onload = (e) => {
                  const content = e.target?.result as string;
                  const lines = content.split('\n').filter(line => line.trim());
                  if (lines.length === 0) {
                    toast({ title: "Invalid file", description: "No data found in file", variant: "destructive" });
                    return;
                  }
                  
                  // Parse CSV header with support for quoted fields
                  const parseCSVLine = (line: string): string[] => {
                    const result: string[] = [];
                    let current = '';
                    let inQuotes = false;
                    
                    for (let i = 0; i < line.length; i++) {
                      const char = line[i];
                      if (char === '"') {
                        if (inQuotes && line[i + 1] === '"') {
                          current += '"';
                          i++;
                        } else {
                          inQuotes = !inQuotes;
                        }
                      } else if (char === ',' && !inQuotes) {
                        result.push(current.trim());
                        current = '';
                      } else {
                        current += char;
                      }
                    }
                    result.push(current.trim());
                    return result;
                  };
                  
                  const headers = parseCSVLine(lines[0]);
                  if (headers.length === 0 || headers.every(h => !h)) {
                    toast({ title: "Invalid file", description: "Could not parse column headers", variant: "destructive" });
                    return;
                  }
                  
                  const columns = headers.filter(h => h).map((header, idx) => ({
                    id: `col_${idx + 1}`,
                    name: header.toLowerCase().replace(/\s+/g, '_'),
                    label: header,
                    type: 'text',
                    required: idx === 0,
                    options: null,
                    formula: null,
                  }));
                  
                  setPreviewTemplate({ columns });
                  toast({ 
                    title: "Template parsed successfully", 
                    description: `Found ${columns.length} columns. Template ready to save.`
                  });
                };
                reader.readAsText(uploadedFile);
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
              data-testid="button-preview-template"
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button
              disabled={!previewTemplate || !newTemplateName || createTemplateMutation.isPending}
              onClick={() => {
                if (!previewTemplate || !newTemplateName) return;
                
                // Generate a unique code for the template
                const timestamp = Date.now().toString(36);
                const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
                const code = `TMPL-CUSTOM-${timestamp.toUpperCase()}-${randomSuffix}`;
                
                createTemplateMutation.mutate({
                  code,
                  name: newTemplateName,
                  category: newTemplateCategory,
                  description: `Custom uploaded template with ${previewTemplate.columns?.length || 0} fields`,
                  columns: previewTemplate.columns,
                  standard: "Custom",
                  isGlobal: false,
                  tenantId: currentTenantId || null,
                  applicableRegions: [],
                });
              }}
              data-testid="button-save-template"
            >
              <Save className="h-4 w-4 mr-1" />
              {createTemplateMutation.isPending ? "Saving..." : "Save Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
