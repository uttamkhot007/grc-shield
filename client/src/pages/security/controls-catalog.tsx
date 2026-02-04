import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Search,
  Filter,
  Sparkles,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Database,
  Server,
  Monitor,
  Cloud,
  Lock,
  Eye,
  Network,
  Key,
  Users,
  FileText,
  ChevronRight,
  BarChart3,
  Target,
  Activity,
  AlertCircle,
  Loader2,
  Download,
  Plus,
  Zap,
  ArrowUpRight,
  Package,
  HelpCircle
} from "lucide-react";

const categoryLabels: Record<string, string> = {
  access_control: "Access Control",
  application_security: "Application Security",
  asset_management: "Asset Management",
  backup_recovery: "Backup & Recovery",
  business_continuity: "Business Continuity",
  cloud_security: "Cloud Security",
  compliance: "Compliance",
  cryptography: "Cryptography",
  data_protection: "Data Protection",
  email_security: "Email Security",
  endpoint_security: "Endpoint Security",
  identity_management: "Identity Management",
  incident_response: "Incident Response",
  iot_security: "IoT Security",
  logging_monitoring: "Logging & Monitoring",
  mobile_security: "Mobile Security",
  network_security: "Network Security",
  physical_security: "Physical Security",
  privacy: "Privacy",
  security_awareness: "Security Awareness",
  security_governance: "Security Governance",
  security_operations: "Security Operations",
  supply_chain_security: "Supply Chain Security",
  third_party_risk: "Third Party Risk",
  threat_intelligence: "Threat Intelligence",
  vulnerability_management: "Vulnerability Management",
  zero_trust: "Zero Trust",
};

const controlNatureLabels: Record<string, string> = {
  technical: "Technical",
  administrative: "Administrative",
  physical: "Physical",
  hybrid: "Hybrid",
};

const controlFunctionLabels: Record<string, string> = {
  preventive: "Preventive",
  detective: "Detective",
  corrective: "Corrective",
  deterrent: "Deterrent",
  compensating: "Compensating",
  recovery: "Recovery",
};

const natureColors: Record<string, string> = {
  technical: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  administrative: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  physical: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  hybrid: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

const functionColors: Record<string, string> = {
  preventive: "bg-green-500/20 text-green-400 border-green-500/30",
  detective: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  corrective: "bg-red-500/20 text-red-400 border-red-500/30",
  deterrent: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  compensating: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  recovery: "bg-teal-500/20 text-teal-400 border-teal-500/30",
};

// Category-specific features for technical controls
const categoryFeatures: Record<string, { key: string; label: string; description?: string }[]> = {
  email_security: [
    { key: "anti_phishing", label: "Anti-Phishing", description: "Protection against phishing attacks" },
    { key: "anti_spam", label: "Anti-Spam", description: "Spam email filtering" },
    { key: "anti_malware", label: "Anti-Malware", description: "Malware detection in emails" },
    { key: "bec_detection", label: "BEC Detection", description: "Business Email Compromise detection" },
    { key: "url_rewriting", label: "URL Rewriting", description: "Safe link rewriting and scanning" },
    { key: "attachment_sandboxing", label: "Attachment Sandboxing", description: "Sandboxed attachment analysis" },
    { key: "dmarc_dkim_spf", label: "DMARC/DKIM/SPF", description: "Email authentication protocols" },
    { key: "dlp_email", label: "Email DLP", description: "Data loss prevention for emails" },
    { key: "email_encryption", label: "Email Encryption", description: "End-to-end email encryption" },
  ],
  endpoint_security: [
    { key: "edr", label: "EDR", description: "Endpoint Detection and Response" },
    { key: "antivirus", label: "Antivirus/Anti-Malware", description: "Traditional AV protection" },
    { key: "device_control", label: "Device Control", description: "USB and peripheral device control" },
    { key: "application_control", label: "Application Control", description: "Application whitelisting/blacklisting" },
    { key: "disk_encryption", label: "Disk Encryption", description: "Full disk encryption" },
    { key: "host_firewall", label: "Host Firewall", description: "Endpoint firewall" },
    { key: "vulnerability_scanning", label: "Vulnerability Scanning", description: "Endpoint vulnerability assessment" },
    { key: "patch_management", label: "Patch Management", description: "Automated patching" },
    { key: "xdr", label: "XDR", description: "Extended Detection and Response" },
  ],
  network_security: [
    { key: "firewall", label: "Firewall", description: "Network firewall protection" },
    { key: "ips_ids", label: "IPS/IDS", description: "Intrusion Prevention/Detection" },
    { key: "vpn", label: "VPN", description: "Virtual Private Network" },
    { key: "nac", label: "NAC", description: "Network Access Control" },
    { key: "segmentation", label: "Network Segmentation", description: "Network microsegmentation" },
    { key: "ddos_protection", label: "DDoS Protection", description: "Distributed denial of service protection" },
    { key: "ssl_inspection", label: "SSL/TLS Inspection", description: "Encrypted traffic inspection" },
    { key: "web_filtering", label: "Web Filtering", description: "URL and content filtering" },
    { key: "dns_security", label: "DNS Security", description: "DNS-based security filtering" },
  ],
  identity_management: [
    { key: "sso", label: "SSO", description: "Single Sign-On" },
    { key: "mfa", label: "MFA", description: "Multi-Factor Authentication" },
    { key: "pam", label: "PAM", description: "Privileged Access Management" },
    { key: "identity_governance", label: "Identity Governance", description: "Access reviews and certification" },
    { key: "password_management", label: "Password Management", description: "Password policies and vaulting" },
    { key: "directory_services", label: "Directory Services", description: "LDAP/AD integration" },
    { key: "adaptive_auth", label: "Adaptive Authentication", description: "Risk-based authentication" },
    { key: "lifecycle_management", label: "Lifecycle Management", description: "User provisioning/deprovisioning" },
  ],
  cloud_security: [
    { key: "casb", label: "CASB", description: "Cloud Access Security Broker" },
    { key: "cspm", label: "CSPM", description: "Cloud Security Posture Management" },
    { key: "cwpp", label: "CWPP", description: "Cloud Workload Protection Platform" },
    { key: "cnapp", label: "CNAPP", description: "Cloud Native Application Protection" },
    { key: "ciem", label: "CIEM", description: "Cloud Infrastructure Entitlement Management" },
    { key: "container_security", label: "Container Security", description: "Docker/Kubernetes security" },
    { key: "serverless_security", label: "Serverless Security", description: "FaaS security monitoring" },
    { key: "iac_scanning", label: "IaC Scanning", description: "Infrastructure as Code security" },
  ],
  data_protection: [
    { key: "dlp", label: "DLP", description: "Data Loss Prevention" },
    { key: "encryption_at_rest", label: "Encryption at Rest", description: "Data encryption at rest" },
    { key: "encryption_in_transit", label: "Encryption in Transit", description: "Data encryption in transit" },
    { key: "key_management", label: "Key Management", description: "Cryptographic key management" },
    { key: "data_classification", label: "Data Classification", description: "Data discovery and classification" },
    { key: "data_masking", label: "Data Masking", description: "Data masking and tokenization" },
    { key: "rights_management", label: "Rights Management", description: "Digital rights management (IRM)" },
    { key: "backup_encryption", label: "Backup Encryption", description: "Encrypted backups" },
  ],
  logging_monitoring: [
    { key: "siem", label: "SIEM", description: "Security Information and Event Management" },
    { key: "soar", label: "SOAR", description: "Security Orchestration and Response" },
    { key: "log_aggregation", label: "Log Aggregation", description: "Centralized log collection" },
    { key: "ueba", label: "UEBA", description: "User and Entity Behavior Analytics" },
    { key: "ndr", label: "NDR", description: "Network Detection and Response" },
    { key: "threat_hunting", label: "Threat Hunting", description: "Proactive threat hunting" },
    { key: "file_integrity", label: "File Integrity Monitoring", description: "FIM capability" },
    { key: "alert_management", label: "Alert Management", description: "Alert triage and management" },
  ],
  application_security: [
    { key: "sast", label: "SAST", description: "Static Application Security Testing" },
    { key: "dast", label: "DAST", description: "Dynamic Application Security Testing" },
    { key: "iast", label: "IAST", description: "Interactive Application Security Testing" },
    { key: "sca", label: "SCA", description: "Software Composition Analysis" },
    { key: "waf", label: "WAF", description: "Web Application Firewall" },
    { key: "api_security", label: "API Security", description: "API protection and gateway" },
    { key: "rasp", label: "RASP", description: "Runtime Application Self-Protection" },
    { key: "secure_code_review", label: "Secure Code Review", description: "Automated code review" },
  ],
  vulnerability_management: [
    { key: "vulnerability_scanning", label: "Vulnerability Scanning", description: "Automated vulnerability scanning" },
    { key: "penetration_testing", label: "Penetration Testing", description: "Manual and automated pen testing" },
    { key: "risk_scoring", label: "Risk Scoring", description: "CVSS/risk-based prioritization" },
    { key: "patch_management", label: "Patch Management", description: "Vulnerability remediation" },
    { key: "asset_discovery", label: "Asset Discovery", description: "Automated asset inventory" },
    { key: "configuration_assessment", label: "Configuration Assessment", description: "Security configuration review" },
  ],
  access_control: [
    { key: "rbac", label: "RBAC", description: "Role-Based Access Control" },
    { key: "abac", label: "ABAC", description: "Attribute-Based Access Control" },
    { key: "just_in_time", label: "Just-in-Time Access", description: "Temporary elevated access" },
    { key: "zero_standing", label: "Zero Standing Privileges", description: "No permanent privileged access" },
    { key: "access_reviews", label: "Access Reviews", description: "Periodic access certification" },
    { key: "separation_of_duties", label: "Separation of Duties", description: "SoD enforcement" },
  ],
  mobile_security: [
    { key: "mdm", label: "MDM", description: "Mobile Device Management" },
    { key: "mam", label: "MAM", description: "Mobile Application Management" },
    { key: "mtd", label: "MTD", description: "Mobile Threat Defense" },
    { key: "containerization", label: "Containerization", description: "Work/personal separation" },
    { key: "remote_wipe", label: "Remote Wipe", description: "Remote data wipe capability" },
    { key: "app_vetting", label: "App Vetting", description: "Application security analysis" },
  ],
  threat_intelligence: [
    { key: "threat_feeds", label: "Threat Feeds", description: "External threat intelligence feeds" },
    { key: "ioc_management", label: "IoC Management", description: "Indicators of Compromise tracking" },
    { key: "ttp_tracking", label: "TTP Tracking", description: "Tactics, Techniques, Procedures analysis" },
    { key: "dark_web_monitoring", label: "Dark Web Monitoring", description: "Dark web reconnaissance" },
    { key: "brand_monitoring", label: "Brand Monitoring", description: "Brand impersonation detection" },
    { key: "threat_actor_tracking", label: "Threat Actor Tracking", description: "Adversary profiling" },
  ],
  incident_response: [
    { key: "incident_detection", label: "Incident Detection", description: "Automated incident detection" },
    { key: "case_management", label: "Case Management", description: "Incident case tracking" },
    { key: "forensics", label: "Digital Forensics", description: "Forensic investigation tools" },
    { key: "playbooks", label: "Playbooks", description: "Automated response playbooks" },
    { key: "communication", label: "Communication", description: "Stakeholder communication" },
    { key: "evidence_collection", label: "Evidence Collection", description: "Evidence preservation" },
  ],
  security_operations: [
    { key: "soc_automation", label: "SOC Automation", description: "Security operations automation" },
    { key: "alert_triage", label: "Alert Triage", description: "Alert prioritization and triage" },
    { key: "shift_management", label: "Shift Management", description: "SOC shift handoffs" },
    { key: "runbook_automation", label: "Runbook Automation", description: "Automated runbooks" },
    { key: "metrics_dashboard", label: "Metrics Dashboard", description: "SOC performance metrics" },
    { key: "ticket_integration", label: "Ticket Integration", description: "ITSM integration" },
  ],
  zero_trust: [
    { key: "continuous_verification", label: "Continuous Verification", description: "Always verify, never trust" },
    { key: "micro_segmentation", label: "Micro-Segmentation", description: "Granular network segmentation" },
    { key: "device_trust", label: "Device Trust", description: "Device health verification" },
    { key: "identity_verification", label: "Identity Verification", description: "Strong identity verification" },
    { key: "least_privilege", label: "Least Privilege", description: "Minimal access rights" },
    { key: "software_defined_perimeter", label: "SDP", description: "Software Defined Perimeter" },
  ],
  backup_recovery: [
    { key: "automated_backup", label: "Automated Backup", description: "Scheduled automatic backups" },
    { key: "immutable_backup", label: "Immutable Backup", description: "Immutable backup storage" },
    { key: "disaster_recovery", label: "Disaster Recovery", description: "DR site replication" },
    { key: "backup_testing", label: "Backup Testing", description: "Regular restore testing" },
    { key: "air_gapped", label: "Air-Gapped", description: "Offline backup copies" },
    { key: "ransomware_recovery", label: "Ransomware Recovery", description: "Ransomware-specific recovery" },
  ],
  cryptography: [
    { key: "key_management", label: "Key Management", description: "Cryptographic key lifecycle" },
    { key: "hsm", label: "HSM", description: "Hardware Security Modules" },
    { key: "pki", label: "PKI", description: "Public Key Infrastructure" },
    { key: "certificate_management", label: "Certificate Management", description: "TLS/SSL certificate lifecycle" },
    { key: "encryption_standards", label: "Encryption Standards", description: "AES-256, RSA compliance" },
    { key: "key_rotation", label: "Key Rotation", description: "Automated key rotation" },
  ],
  iot_security: [
    { key: "device_inventory", label: "Device Inventory", description: "IoT device discovery" },
    { key: "iot_monitoring", label: "IoT Monitoring", description: "IoT traffic monitoring" },
    { key: "firmware_security", label: "Firmware Security", description: "Firmware analysis and updates" },
    { key: "iot_segmentation", label: "IoT Segmentation", description: "IoT network isolation" },
    { key: "ot_security", label: "OT Security", description: "Operational Technology protection" },
    { key: "scada_protection", label: "SCADA Protection", description: "Industrial control security" },
  ],
  third_party_risk: [
    { key: "vendor_assessment", label: "Vendor Assessment", description: "Third-party security assessment" },
    { key: "continuous_monitoring", label: "Continuous Monitoring", description: "Ongoing vendor monitoring" },
    { key: "contract_review", label: "Contract Review", description: "Security clauses in contracts" },
    { key: "sla_monitoring", label: "SLA Monitoring", description: "Service level monitoring" },
    { key: "risk_scoring", label: "Risk Scoring", description: "Vendor risk scoring" },
    { key: "due_diligence", label: "Due Diligence", description: "Vendor due diligence" },
  ],
};

const categoryIcons: Record<string, any> = {
  access_control: Lock,
  application_security: FileText,
  asset_management: Database,
  backup_recovery: Database,
  business_continuity: Activity,
  cloud_security: Cloud,
  compliance: CheckCircle2,
  cryptography: Key,
  data_protection: Shield,
  email_security: FileText,
  endpoint_security: Monitor,
  identity_management: Users,
  incident_response: AlertTriangle,
  iot_security: Monitor,
  logging_monitoring: Eye,
  mobile_security: Monitor,
  network_security: Network,
  physical_security: Server,
  privacy: Shield,
  security_awareness: Eye,
  security_governance: FileText,
  security_operations: Activity,
  supply_chain_security: Network,
  third_party_risk: Users,
  threat_intelligence: ShieldAlert,
  vulnerability_management: ShieldAlert,
  zero_trust: Lock,
};

export default function SecurityControlsCatalog() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [mandatoryFilter, setMandatoryFilter] = useState<string>("all");
  const [selectedControl, setSelectedControl] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [natureFilter, setNatureFilter] = useState<string>("all");
  const [functionFilter, setFunctionFilter] = useState<string>("all");

  const { data: controls = [], isLoading: controlsLoading, refetch: refetchControls } = useQuery<any[]>({
    queryKey: ["/api/security/controls-catalog"],
  });

  const { data: posture, isLoading: postureLoading, refetch: refetchPosture } = useQuery<any>({
    queryKey: ["/api/security/posture"],
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/security/controls-catalog/seed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/security/controls-catalog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/security/posture"] });
      toast({ title: "Controls catalog seeded successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error seeding controls", description: error.message, variant: "destructive" });
    }
  });

  const enrichMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/security/controls-catalog/${id}/enrich`);
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/security/controls-catalog"] });
      setSelectedControl(data);
      toast({ title: "Control enriched with AI insights" });
    },
    onError: (error: any) => {
      toast({ title: "Error enriching control", description: error.message, variant: "destructive" });
    }
  });

  const analyzePostureMutation = useMutation<any>({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/security/posture/analyze");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Posture analysis complete" });
    },
    onError: (error: any) => {
      toast({ title: "Error analyzing posture", description: error.message, variant: "destructive" });
    }
  });

  const updateControlMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/security/controls-catalog/${id}`, data);
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/security/controls-catalog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/security/posture"] });
      setSelectedControl(data);
      setEditDialogOpen(false);
      toast({ title: "Control updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error updating control", description: error.message, variant: "destructive" });
    }
  });

  const openEditDialog = (control: any) => {
    setEditForm({
      controlTitle: control.controlTitle || "",
      controlDescription: control.controlDescription || "",
      category: control.category || "access_control",
      controlNature: control.controlNature || "technical",
      controlFunction: control.controlFunction || "preventive",
      implementationStatus: control.implementationStatus || "not_evaluated",
      isMandatory: control.isMandatory || false,
      currentVersion: control.currentVersion || "1.0",
      latestVersion: control.latestVersion || "1.0",
      primarySolution: control.primarySolution || "",
      solutionCoverage: control.solutionCoverage || 0,
      coveragePercentage: control.coveragePercentage || 0,
      regulatoryReference: control.regulatoryReference || "",
      implementingSolutions: control.implementingSolutions || [],
      existingProductName: control.existingProductName || "",
      existingProductVersion: control.existingProductVersion || "",
      existingProductVendor: control.existingProductVendor || "",
      existingProductStatus: control.existingProductStatus || "active",
      existingProductLicenseType: control.existingProductLicenseType || "",
      enabledFeatures: control.enabledFeatures || [],
    });
    setSelectedControl(control);
    setEditDialogOpen(true);
  };

  const handleSaveControl = () => {
    if (!selectedControl?.id) return;
    updateControlMutation.mutate({ id: selectedControl.id, data: editForm });
  };

  const addSolution = () => {
    setEditForm({
      ...editForm,
      implementingSolutions: [
        ...(editForm.implementingSolutions || []),
        { name: "", vendor: "", type: "", status: "active" }
      ]
    });
  };

  const updateSolution = (index: number, field: string, value: string) => {
    const updated = [...(editForm.implementingSolutions || [])];
    updated[index] = { ...updated[index], [field]: value };
    setEditForm({ ...editForm, implementingSolutions: updated });
  };

  const removeSolution = (index: number) => {
    const updated = (editForm.implementingSolutions || []).filter((_: any, i: number) => i !== index);
    setEditForm({ ...editForm, implementingSolutions: updated });
  };

  const filteredControls = controls.filter((control: any) => {
    const matchesSearch = 
      control.controlCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.controlTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.primarySolution?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || control.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || control.implementationStatus === statusFilter;
    const matchesMandatory = mandatoryFilter === "all" || 
      (mandatoryFilter === "mandatory" && control.isMandatory) ||
      (mandatoryFilter === "optional" && !control.isMandatory);
    const matchesNature = natureFilter === "all" || control.controlNature === natureFilter;
    const matchesFunction = functionFilter === "all" || control.controlFunction === functionFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesMandatory && matchesNature && matchesFunction;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "implemented":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle2 className="h-3 w-3 mr-1" /> Implemented</Badge>;
      case "partial":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><AlertTriangle className="h-3 w-3 mr-1" /> Partial</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Clock className="h-3 w-3 mr-1" /> In Progress</Badge>;
      case "not_implemented":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="h-3 w-3 mr-1" /> Not Implemented</Badge>;
      case "not_evaluated":
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30"><HelpCircle className="h-3 w-3 mr-1" /> Not Evaluated</Badge>;
      case "not_applicable":
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30"><Minus className="h-3 w-3 mr-1" /> N/A</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCoverageColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-400";
    if (percentage >= 70) return "text-yellow-400";
    if (percentage >= 50) return "text-orange-400";
    return "text-red-400";
  };

  const getVersionStatus = (current: string, latest: string) => {
    if (current === latest) {
      return <Badge variant="outline" className="text-green-400 border-green-500/30">Current</Badge>;
    }
    return <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">Update Available</Badge>;
  };

  const getRiskRatingColor = (rating: string) => {
    switch (rating) {
      case "critical": return "text-red-500";
      case "high": return "text-orange-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-green-500";
      default: return "text-gray-400";
    }
  };

  const getMaturityLabel = (level: number) => {
    const labels = ["", "Initial", "Developing", "Defined", "Managed", "Optimizing"];
    return labels[level] || "Unknown";
  };

  const CategoryIcon = ({ category }: { category: string }) => {
    const Icon = categoryIcons[category] || Shield;
    return <Icon className="h-4 w-4" />;
  };

  const categorySummary = controls.reduce((acc: any, control: any) => {
    if (!acc[control.category]) {
      acc[control.category] = { total: 0, implemented: 0, partial: 0, notImplemented: 0 };
    }
    acc[control.category].total++;
    if (control.implementationStatus === "implemented") acc[control.category].implemented++;
    else if (control.implementationStatus === "partial") acc[control.category].partial++;
    else if (control.implementationStatus === "not_implemented") acc[control.category].notImplemented++;
    return acc;
  }, {});

  if (controlsLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent" data-testid="text-page-title">
            Security Controls Catalog
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive view of security controls with implementation status and asset coverage
          </p>
        </div>
        <div className="flex gap-2">
          {controls.length === 0 && (
            <Button 
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              data-testid="button-seed-controls"
            >
              {seedMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
              Initialize Catalog
            </Button>
          )}
          <Button variant="outline" onClick={() => { refetchControls(); refetchPosture(); }} data-testid="button-refresh">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {posture && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="glass-card" data-testid="card-overall-score">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cyber Security Posture</p>
                  <p className={`text-4xl font-bold ${posture.overallScore >= 75 ? 'text-green-400' : posture.overallScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {posture.overallScore}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getMaturityLabel(posture.maturityLevel)} Maturity
                  </p>
                </div>
                <div className="relative">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" />
                    <circle 
                      cx="32" cy="32" r="28" 
                      stroke="url(#scoreGradient)" 
                      strokeWidth="4" 
                      fill="none" 
                      strokeDasharray={`${posture.overallScore * 1.76} 176`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card" data-testid="card-control-coverage">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Control Coverage</p>
                  <p className="text-3xl font-bold">{posture.implementedControls}/{posture.totalControls}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {posture.partialControls} partial
                  </p>
                </div>
                <ShieldCheck className="h-10 w-10 text-green-500/30" />
              </div>
              <Progress value={posture.controlCoveragePercentage} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="glass-card" data-testid="card-asset-coverage">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Asset Coverage</p>
                  <p className="text-3xl font-bold">{posture.assetCoveragePercentage}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {posture.coveredAssets?.toLocaleString()}/{posture.totalAssets?.toLocaleString()} assets
                  </p>
                </div>
                <Server className="h-10 w-10 text-blue-500/30" />
              </div>
              <Progress value={posture.assetCoveragePercentage} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="glass-card" data-testid="card-mandatory-compliance">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Mandatory Compliance</p>
                  <p className="text-3xl font-bold">{posture.mandatoryCompliancePercentage}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {posture.mandatoryCompliant}/{posture.mandatoryControls} mandatory
                  </p>
                </div>
                <Target className="h-10 w-10 text-purple-500/30" />
              </div>
              <Progress value={posture.mandatoryCompliancePercentage} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="glass-card" data-testid="card-risk-rating">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Risk Rating</p>
                  <p className={`text-3xl font-bold capitalize ${getRiskRatingColor(posture.riskRating)}`}>
                    {posture.riskRating}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on control coverage
                  </p>
                </div>
                {posture.riskRating === 'low' ? (
                  <TrendingDown className="h-10 w-10 text-green-500/30" />
                ) : posture.riskRating === 'critical' ? (
                  <TrendingUp className="h-10 w-10 text-red-500/30" />
                ) : (
                  <Activity className="h-10 w-10 text-yellow-500/30" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="controls" className="space-y-4">
        <TabsList className="glass-card" data-testid="tabs-controls">
          <TabsTrigger value="controls" data-testid="tab-controls">Controls List</TabsTrigger>
          <TabsTrigger value="categories" data-testid="tab-categories">By Category</TabsTrigger>
          <TabsTrigger value="posture" data-testid="tab-posture">Posture Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="controls" className="space-y-4">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search controls..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]" data-testid="select-category">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px]" data-testid="select-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="not_evaluated">Not Evaluated</SelectItem>
                      <SelectItem value="not_implemented">Not Implemented</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="implemented">Implemented</SelectItem>
                      <SelectItem value="not_applicable">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={mandatoryFilter} onValueChange={setMandatoryFilter}>
                    <SelectTrigger className="w-[140px]" data-testid="select-mandatory">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="mandatory">Mandatory</SelectItem>
                      <SelectItem value="optional">Optional</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={natureFilter} onValueChange={setNatureFilter}>
                    <SelectTrigger className="w-[150px]" data-testid="select-nature">
                      <SelectValue placeholder="Nature" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Natures</SelectItem>
                      {Object.entries(controlNatureLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={functionFilter} onValueChange={setFunctionFilter}>
                    <SelectTrigger className="w-[150px]" data-testid="select-function">
                      <SelectValue placeholder="Function" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Functions</SelectItem>
                      {Object.entries(controlFunctionLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="table-controls">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Code</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Control</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Function</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Solution</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Coverage</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredControls.map((control: any) => (
                      <tr 
                        key={control.id} 
                        className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                        onClick={() => { setSelectedControl(control); setDetailDialogOpen(true); }}
                        data-testid={`row-control-${control.controlCode}`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-cyan-400">{control.controlCode}</span>
                            {control.isMandatory && (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">M</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="max-w-xs">
                            <p className="font-medium truncate">{control.controlTitle}</p>
                            {control.regulatoryReference && (
                              <p className="text-xs text-muted-foreground truncate">{control.regulatoryReference}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <CategoryIcon category={control.category} />
                            <span className="text-sm">{categoryLabels[control.category] || control.category}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={`text-xs ${natureColors[control.controlNature] || "bg-gray-500/20 text-gray-400"}`}>
                            {controlNatureLabels[control.controlNature] || control.controlNature || "Technical"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={`text-xs ${functionColors[control.controlFunction] || "bg-gray-500/20 text-gray-400"}`}>
                            {controlFunctionLabels[control.controlFunction] || control.controlFunction || "Preventive"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(control.implementationStatus)}
                        </td>
                        <td className="py-3 px-4">
                          {control.primarySolution ? (
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3 text-cyan-400" />
                              <span className="text-sm truncate max-w-[120px]">{control.primarySolution}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No solution</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`text-sm font-bold ${getCoverageColor(control.coveragePercentage || 0)}`}>
                            {control.coveragePercentage || 0}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditDialog(control)}
                              data-testid={`button-edit-${control.controlCode}`}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => enrichMutation.mutate(control.id)}
                              disabled={enrichMutation.isPending}
                              data-testid={`button-enrich-${control.controlCode}`}
                            >
                              {enrichMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Sparkles className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredControls.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No controls found matching your filters</p>
                  {controls.length === 0 && (
                    <Button 
                      onClick={() => seedMutation.mutate()} 
                      className="mt-4"
                      disabled={seedMutation.isPending}
                    >
                      Initialize Controls Catalog
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categorySummary).map(([category, stats]: [string, any]) => {
              const Icon = categoryIcons[category] || Shield;
              const implementedPct = Math.round((stats.implemented / stats.total) * 100) || 0;
              
              return (
                <Card 
                  key={category} 
                  className="glass-card hover:border-cyan-500/30 transition-all cursor-pointer"
                  onClick={() => { setCategoryFilter(category); }}
                  data-testid={`card-category-${category}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/10">
                          <Icon className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">{categoryLabels[category] || category}</h3>
                          <p className="text-sm text-muted-foreground">{stats.total} controls</p>
                        </div>
                      </div>
                      <span className={`text-2xl font-bold ${getCoverageColor(implementedPct)}`}>
                        {implementedPct}%
                      </span>
                    </div>
                    <Progress value={implementedPct} className="h-2 mb-3" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="text-green-400">{stats.implemented} implemented</span>
                      <span className="text-yellow-400">{stats.partial} partial</span>
                      <span className="text-red-400">{stats.notImplemented} missing</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="posture" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Cyber Security Posture Analysis
                  </CardTitle>
                  <CardDescription>
                    AI-powered analysis of your security posture based on control implementation
                  </CardDescription>
                </div>
                <Button
                  onClick={() => analyzePostureMutation.mutate()}
                  disabled={analyzePostureMutation.isPending}
                  data-testid="button-analyze-posture"
                >
                  {analyzePostureMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Analyze with AI
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {posture?.categoryScores && (
                <div className="space-y-4">
                  <h4 className="font-medium mb-3">Category Scores</h4>
                  <div className="space-y-3">
                    {Object.entries(posture.categoryScores).map(([category, score]: [string, any]) => (
                      <div key={category} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <CategoryIcon category={category} />
                            <span>{categoryLabels[category] || category}</span>
                          </div>
                          <span className={`font-bold ${getCoverageColor(score)}`}>{score}%</span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analyzePostureMutation.data && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <h4 className="font-medium text-cyan-400 mb-2">Executive Summary</h4>
                    <p className="text-sm">{analyzePostureMutation.data.executiveSummary}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <h4 className="font-medium text-green-400 mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Strengths
                      </h4>
                      <ul className="text-sm space-y-1">
                        {analyzePostureMutation.data.strengths?.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                      <h4 className="font-medium text-red-400 mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Weaknesses
                      </h4>
                      <ul className="text-sm space-y-1">
                        {analyzePostureMutation.data.weaknesses?.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <h4 className="font-medium text-purple-400 mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Prioritized Actions
                    </h4>
                    <ol className="text-sm space-y-2">
                      {analyzePostureMutation.data.prioritizedActions?.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">
                            {i + 1}
                          </span>
                          {item}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedControl && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="font-mono text-cyan-400">{selectedControl.controlCode}</span>
                  {selectedControl.controlTitle}
                </DialogTitle>
                <DialogDescription>
                  {categoryLabels[selectedControl.category]} • {selectedControl.isMandatory ? "Mandatory" : "Optional"}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {getStatusBadge(selectedControl.implementationStatus)}
                  {getVersionStatus(selectedControl.currentVersion, selectedControl.latestVersion)}
                  {selectedControl.aiEnriched && (
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Enriched
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-xs text-muted-foreground">Asset Coverage</p>
                    <p className="text-2xl font-bold">{selectedControl.coveredAssets}/{selectedControl.totalAssets}</p>
                    <Progress value={selectedControl.coveragePercentage} className="h-2 mt-2" />
                    <p className={`text-sm mt-1 ${getCoverageColor(selectedControl.coveragePercentage)}`}>
                      {selectedControl.coveragePercentage}% covered
                    </p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-xs text-muted-foreground">Version</p>
                    <p className="text-2xl font-bold font-mono">{selectedControl.currentVersion}</p>
                    {selectedControl.currentVersion !== selectedControl.latestVersion && (
                      <p className="text-sm text-yellow-400 mt-1">
                        Latest: {selectedControl.latestVersion}
                      </p>
                    )}
                  </div>
                </div>

                {selectedControl.regulatoryReference && (
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Regulatory Reference</p>
                    <p className="text-sm">{selectedControl.regulatoryReference}</p>
                  </div>
                )}

                {selectedControl.aiEnrichmentData && (
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      AI Insights
                    </h4>
                    
                    {selectedControl.aiEnrichmentData.riskAssessment && (
                      <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <p className="text-xs text-red-400 mb-1">Risk Assessment</p>
                        <p className="text-sm">{selectedControl.aiEnrichmentData.riskAssessment}</p>
                      </div>
                    )}

                    {selectedControl.aiEnrichmentData.bestPractices && (
                      <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <p className="text-xs text-green-400 mb-1">Best Practices</p>
                        <ul className="text-sm space-y-1">
                          {selectedControl.aiEnrichmentData.bestPractices.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="h-3 w-3 mt-1 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedControl.aiRecommendations && selectedControl.aiRecommendations.length > 0 && (
                      <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <p className="text-xs text-purple-400 mb-1">Recommendations</p>
                        <ul className="text-sm space-y-1">
                          {selectedControl.aiRecommendations.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <ArrowUpRight className="h-3 w-3 mt-1 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => openEditDialog(selectedControl)}
                    data-testid="button-edit-control"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Edit Control
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => enrichMutation.mutate(selectedControl.id)}
                    disabled={enrichMutation.isPending}
                  >
                    {enrichMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    {selectedControl.aiEnriched ? "Re-Enrich" : "Enrich with AI"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Edit Control: {selectedControl?.controlCode}
            </DialogTitle>
            <DialogDescription>
              Update control details, classification, and implementing solutions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Control Title</label>
                <Input
                  value={editForm.controlTitle || ""}
                  onChange={(e) => setEditForm({ ...editForm, controlTitle: e.target.value })}
                  data-testid="input-edit-title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={editForm.category} onValueChange={(v) => setEditForm({ ...editForm, category: v })}>
                  <SelectTrigger data-testid="select-edit-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={editForm.controlDescription || ""}
                onChange={(e) => setEditForm({ ...editForm, controlDescription: e.target.value })}
                placeholder="Control description..."
                data-testid="input-edit-description"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Control Nature (Type)</label>
                <Select value={editForm.controlNature} onValueChange={(v) => setEditForm({ ...editForm, controlNature: v })}>
                  <SelectTrigger data-testid="select-edit-nature">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(controlNatureLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Control Function (Subtype)</label>
                <Select value={editForm.controlFunction} onValueChange={(v) => setEditForm({ ...editForm, controlFunction: v })}>
                  <SelectTrigger data-testid="select-edit-function">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(controlFunctionLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Implementation Status</label>
                <Select value={editForm.implementationStatus} onValueChange={(v) => setEditForm({ ...editForm, implementationStatus: v })}>
                  <SelectTrigger data-testid="select-edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_evaluated">Not Evaluated</SelectItem>
                    <SelectItem value="not_implemented">Not Implemented</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="implemented">Implemented</SelectItem>
                    <SelectItem value="not_applicable">N/A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mandatory</label>
                <Select value={editForm.isMandatory ? "yes" : "no"} onValueChange={(v) => setEditForm({ ...editForm, isMandatory: v === "yes" })}>
                  <SelectTrigger data-testid="select-edit-mandatory">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Mandatory</SelectItem>
                    <SelectItem value="no">Optional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Version</label>
                <Input
                  value={editForm.currentVersion || ""}
                  onChange={(e) => setEditForm({ ...editForm, currentVersion: e.target.value })}
                  placeholder="1.0"
                  data-testid="input-edit-current-version"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Latest Version</label>
                <Input
                  value={editForm.latestVersion || ""}
                  onChange={(e) => setEditForm({ ...editForm, latestVersion: e.target.value })}
                  placeholder="1.0"
                  data-testid="input-edit-latest-version"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Regulatory Reference</label>
                <Input
                  value={editForm.regulatoryReference || ""}
                  onChange={(e) => setEditForm({ ...editForm, regulatoryReference: e.target.value })}
                  placeholder="e.g., ISO 27001:2022 A.5.15"
                  data-testid="input-edit-regulatory"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Coverage %</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.coveragePercentage || 0}
                  onChange={(e) => setEditForm({ ...editForm, coveragePercentage: parseInt(e.target.value) || 0 })}
                  data-testid="input-edit-coverage"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-cyan-400" />
                  Implementing Solutions
                </label>
                <Button size="sm" variant="outline" onClick={addSolution} data-testid="button-add-solution">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Solution
                </Button>
              </div>

              {(editForm.implementingSolutions || []).length === 0 ? (
                <div className="text-center py-4 text-muted-foreground border border-dashed rounded-lg">
                  No solutions configured. Add solutions that implement this control.
                </div>
              ) : (
                <div className="space-y-3">
                  {(editForm.implementingSolutions || []).map((solution: any, index: number) => (
                    <div key={index} className="grid grid-cols-5 gap-2 p-3 bg-white/5 rounded-lg">
                      <Input
                        placeholder="Solution Name"
                        value={solution.name || ""}
                        onChange={(e) => updateSolution(index, "name", e.target.value)}
                        data-testid={`input-solution-name-${index}`}
                      />
                      <Input
                        placeholder="Vendor"
                        value={solution.vendor || ""}
                        onChange={(e) => updateSolution(index, "vendor", e.target.value)}
                        data-testid={`input-solution-vendor-${index}`}
                      />
                      <Input
                        placeholder="Type (e.g., EDR, SIEM)"
                        value={solution.type || ""}
                        onChange={(e) => updateSolution(index, "type", e.target.value)}
                        data-testid={`input-solution-type-${index}`}
                      />
                      <Select value={solution.status || "active"} onValueChange={(v) => updateSolution(index, "status", v)}>
                        <SelectTrigger data-testid={`select-solution-status-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="deprecated">Deprecated</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400"
                        onClick={() => removeSolution(index)}
                        data-testid={`button-remove-solution-${index}`}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Primary Solution</label>
                  <Input
                    value={editForm.primarySolution || ""}
                    onChange={(e) => setEditForm({ ...editForm, primarySolution: e.target.value })}
                    placeholder="Main solution implementing this control"
                    data-testid="input-edit-primary-solution"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Solution Coverage %</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={editForm.solutionCoverage || 0}
                    onChange={(e) => setEditForm({ ...editForm, solutionCoverage: parseInt(e.target.value) || 0 })}
                    data-testid="input-edit-solution-coverage"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <label className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-cyan-400" />
                Existing Product/Tool (for Technical Controls)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Product Name</label>
                  <Input
                    value={editForm.existingProductName || ""}
                    onChange={(e) => setEditForm({ ...editForm, existingProductName: e.target.value })}
                    placeholder="e.g., CrowdStrike Falcon, Microsoft Defender"
                    data-testid="input-edit-product-name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Product Version</label>
                  <Input
                    value={editForm.existingProductVersion || ""}
                    onChange={(e) => setEditForm({ ...editForm, existingProductVersion: e.target.value })}
                    placeholder="e.g., 7.0, 2024.1, v3.2.1"
                    data-testid="input-edit-product-version"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Vendor</label>
                  <Input
                    value={editForm.existingProductVendor || ""}
                    onChange={(e) => setEditForm({ ...editForm, existingProductVendor: e.target.value })}
                    placeholder="e.g., CrowdStrike, Microsoft, Okta"
                    data-testid="input-edit-product-vendor"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Status</label>
                  <Select value={editForm.existingProductStatus || "active"} onValueChange={(v) => setEditForm({ ...editForm, existingProductStatus: v })}>
                    <SelectTrigger data-testid="select-edit-product-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="evaluating">Evaluating</SelectItem>
                      <SelectItem value="deprecated">Deprecated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">License Type</label>
                <Input
                  value={editForm.existingProductLicenseType || ""}
                  onChange={(e) => setEditForm({ ...editForm, existingProductLicenseType: e.target.value })}
                  placeholder="e.g., Enterprise, Professional, Standard"
                  data-testid="input-edit-license-type"
                />
              </div>
            </div>

            {/* Features Selection - Category-specific */}
            {editForm.controlNature === "technical" && categoryFeatures[editForm.category] && (
              <div className="space-y-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-400" />
                  Enabled Features for {categoryLabels[editForm.category]}
                </label>
                <p className="text-xs text-muted-foreground">
                  Select the features enabled in your {editForm.existingProductName || "product"} deployment
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {categoryFeatures[editForm.category]?.map((feature) => {
                    const isEnabled = (editForm.enabledFeatures || []).includes(feature.key);
                    return (
                      <div
                        key={feature.key}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isEnabled 
                            ? "bg-purple-500/20 border-purple-500/50" 
                            : "bg-card/30 border-border/50 hover:border-purple-500/30"
                        }`}
                        onClick={() => {
                          const currentFeatures = editForm.enabledFeatures || [];
                          const newFeatures = isEnabled
                            ? currentFeatures.filter((f: string) => f !== feature.key)
                            : [...currentFeatures, feature.key];
                          setEditForm({ ...editForm, enabledFeatures: newFeatures });
                        }}
                        data-testid={`feature-toggle-${feature.key}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`h-4 w-4 rounded border flex items-center justify-center ${
                            isEnabled ? "bg-purple-500 border-purple-500" : "border-muted-foreground"
                          }`}>
                            {isEnabled && <CheckCircle2 className="h-3 w-3 text-white" />}
                          </div>
                          <span className="text-sm font-medium">{feature.label}</span>
                        </div>
                        {feature.description && (
                          <p className="text-xs text-muted-foreground mt-1 ml-6">{feature.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
                {(editForm.enabledFeatures || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2 border-t border-purple-500/20">
                    <span className="text-xs text-muted-foreground mr-2">Selected:</span>
                    {(editForm.enabledFeatures || []).map((featureKey: string) => {
                      const feature = categoryFeatures[editForm.category]?.find(f => f.key === featureKey);
                      return feature ? (
                        <Badge key={featureKey} variant="secondary" className="text-xs bg-purple-500/20 text-purple-300">
                          {feature.label}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveControl}
                disabled={updateControlMutation.isPending}
                data-testid="button-save-control"
              >
                {updateControlMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
