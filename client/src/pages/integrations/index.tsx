import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plug, Search, CheckCircle2, RefreshCw, Settings, ExternalLink,
  Cloud, Lock, Users, GitBranch, Ticket, Database, Shield,
  Plus, Clock, Zap, AlertTriangle, XCircle, Loader2, Sparkles,
  ChevronRight, ChevronLeft, BookOpen, Key, Activity, Copy, Check,
  Lightbulb, Terminal, HelpCircle, ArrowRight
} from "lucide-react";
import { 
  SiAmazonwebservices, SiGooglecloud, SiOkta, SiAuth0,
  SiGithub, SiGitlab, SiJira, SiSplunk, SiSlack,
  SiZendesk, SiElasticsearch, SiGoogle, SiSendgrid, SiMailgun,
  SiDigitalocean, SiBitbucket, SiJenkins, SiZoom
} from "react-icons/si";
import { useTenant } from "@/contexts/tenant-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { integrationProviders, getProviderByName, type IntegrationStatus } from "@/lib/integration-providers";
import { formatDistanceToNow } from "date-fns";

const providerIcons: Record<string, any> = {
  // Cloud Providers
  "AWS": SiAmazonwebservices,
  "Amazon Web Services": SiAmazonwebservices,
  "Amazon SES": SiAmazonwebservices,
  "Azure": Cloud,
  "Microsoft Azure": Cloud,
  "Azure AD": Cloud,
  "Microsoft 365": Cloud,
  "Microsoft Sentinel": Shield,
  "Microsoft Defender": Shield,
  "Microsoft Teams": Users,
  "Google Cloud": SiGooglecloud,
  "Google Workspace": SiGoogle,
  "DigitalOcean": SiDigitalocean,
  "Oracle Cloud": Database,
  "IBM Cloud": Cloud,
  "Alibaba Cloud": Cloud,
  
  // Identity Providers
  "Okta": SiOkta,
  "Auth0": SiAuth0,
  "OneLogin": Lock,
  "Ping Identity": Lock,
  "CyberArk": Key,
  "HashiCorp Vault": Key,
  "1Password": Key,
  
  // Security & SIEM
  "Splunk": SiSplunk,
  "CrowdStrike": Shield,
  "SentinelOne": Shield,
  "Elastic SIEM": SiElasticsearch,
  "IBM QRadar": Database,
  "Palo Alto": Shield,
  "Fortinet": Shield,
  "Cisco SecureX": Shield,
  "Carbon Black": Shield,
  
  // Cloud Security
  "Prisma Cloud": Shield,
  "Wiz": Shield,
  "Lacework": Shield,
  "Snyk": Shield,
  "Aqua Security": Shield,
  
  // Vulnerability Management
  "Tenable": Shield,
  "Qualys": Shield,
  "Rapid7": Shield,
  "Nessus": Shield,
  "Veracode": Shield,
  "Checkmarx": Shield,
  
  // Data Security
  "Varonis": Database,
  "BigID": Database,
  "Imperva": Shield,
  
  // GRC Platforms
  "OneTrust": Shield,
  "RSA Archer": Shield,
  "ServiceNow GRC": Shield,
  "Drata": Shield,
  "Vanta": Shield,
  "LogicGate": Shield,
  
  // DevOps
  "GitHub": SiGithub,
  "GitLab": SiGitlab,
  "Bitbucket": SiBitbucket,
  "Jenkins": SiJenkins,
  "CircleCI": GitBranch,
  "Terraform": Cloud,
  "Docker": Cloud,
  "Kubernetes": Cloud,
  
  // Ticketing & ITSM
  "Jira": SiJira,
  "Jira Service Management": SiJira,
  "ServiceNow": Ticket,
  "Zendesk": SiZendesk,
  "Freshservice": Ticket,
  "PagerDuty": Zap,
  "Opsgenie": Zap,
  
  // Monitoring
  "Datadog": Activity,
  "New Relic": Activity,
  "Dynatrace": Activity,
  "Grafana": Activity,
  "Sumo Logic": Database,
  
  // Backup & DR
  "Veeam": Cloud,
  "Rubrik": Cloud,
  "Cohesity": Cloud,
  "Commvault": Cloud,
  
  // Communication
  "Slack": SiSlack,
  "Zoom": SiZoom,
  "Webex": Users,
  
  // File Storage
  "Box": Cloud,
  "Dropbox": Cloud,
  "OneDrive": Cloud,
  "Google Drive": SiGoogle,
  "SharePoint": Cloud,
  
  // HR Systems
  "Workday": Users,
  "BambooHR": Users,
  "ADP": Users,
  "SuccessFactors": Users,
  "Namely": Users,
  
  // Security Awareness
  "KnowBe4": Users,
  "Proofpoint": Shield,
  "Mimecast": Shield,
  
  // Email
  "SendGrid": SiSendgrid,
  "Mailgun": SiMailgun,
  "Twilio": Zap,
};

const providerColors: Record<string, string> = {
  // Cloud Providers
  "AWS": "#FF9900",
  "Amazon Web Services": "#FF9900",
  "Amazon SES": "#FF9900",
  "Azure": "#0078D4",
  "Microsoft Azure": "#0078D4",
  "Azure AD": "#0078D4",
  "Microsoft 365": "#0078D4",
  "Microsoft Sentinel": "#0078D4",
  "Microsoft Defender": "#0078D4",
  "Microsoft Teams": "#6264A7",
  "Google Cloud": "#4285F4",
  "Google Workspace": "#4285F4",
  "DigitalOcean": "#0080FF",
  "Oracle Cloud": "#F80000",
  "IBM Cloud": "#054ADA",
  "Alibaba Cloud": "#FF6A00",
  
  // Identity Providers
  "Okta": "#007DC1",
  "Auth0": "#EB5424",
  "OneLogin": "#32A350",
  "Ping Identity": "#B30838",
  "CyberArk": "#0066CC",
  "HashiCorp Vault": "#000000",
  "1Password": "#0572EC",
  
  // Security & SIEM
  "Splunk": "#65A637",
  "CrowdStrike": "#FF0000",
  "SentinelOne": "#6B2C91",
  "Elastic SIEM": "#FEC514",
  "IBM QRadar": "#054ADA",
  "Palo Alto": "#FA582D",
  "Fortinet": "#EE3124",
  "Cisco SecureX": "#049FD9",
  "Carbon Black": "#00C389",
  
  // Cloud Security
  "Prisma Cloud": "#00C7B7",
  "Wiz": "#0080FF",
  "Lacework": "#FF6B35",
  "Snyk": "#4C4A73",
  "Aqua Security": "#1904DA",
  
  // Vulnerability Management
  "Tenable": "#00C389",
  "Qualys": "#ED1C24",
  "Rapid7": "#FF6600",
  "Nessus": "#00B2E2",
  "Veracode": "#00B4E6",
  "Checkmarx": "#54B848",
  
  // Data Security
  "Varonis": "#009639",
  "BigID": "#F7931E",
  "Imperva": "#00A5E0",
  
  // GRC Platforms
  "OneTrust": "#48BB78",
  "RSA Archer": "#D41F3C",
  "ServiceNow GRC": "#62D84E",
  "Drata": "#6366F1",
  "Vanta": "#5B21B6",
  "LogicGate": "#FF6B35",
  
  // DevOps
  "GitHub": "#181717",
  "GitLab": "#FC6D26",
  "Bitbucket": "#0052CC",
  "Jenkins": "#D24939",
  "CircleCI": "#343434",
  "Terraform": "#7B42BC",
  "Docker": "#2496ED",
  "Kubernetes": "#326CE5",
  
  // Ticketing & ITSM
  "Jira": "#0052CC",
  "Jira Service Management": "#0052CC",
  "ServiceNow": "#62D84E",
  "Zendesk": "#03363D",
  "Freshservice": "#14C38E",
  "PagerDuty": "#06AC38",
  "Opsgenie": "#2684FF",
  
  // Monitoring
  "Datadog": "#632CA6",
  "New Relic": "#1CE783",
  "Dynatrace": "#1496FF",
  "Grafana": "#F46800",
  "Sumo Logic": "#000099",
  
  // Backup & DR
  "Veeam": "#00B336",
  "Rubrik": "#00C389",
  "Cohesity": "#00AEEF",
  "Commvault": "#F7941E",
  
  // Communication
  "Slack": "#4A154B",
  "Zoom": "#2D8CFF",
  "Webex": "#00BCD4",
  
  // File Storage
  "Box": "#0061D5",
  "Dropbox": "#0061FF",
  "OneDrive": "#0078D4",
  "Google Drive": "#4285F4",
  "SharePoint": "#0078D4",
  
  // HR Systems
  "Workday": "#0072C6",
  "BambooHR": "#73C41D",
  "ADP": "#D0271D",
  "SuccessFactors": "#F0AB00",
  "Namely": "#FF6B35",
  
  // Security Awareness
  "KnowBe4": "#FF7F00",
  "Proofpoint": "#F58220",
  "Mimecast": "#00B5E2",
  
  // Email
  "SendGrid": "#1A82E2",
  "Mailgun": "#F06B66",
  "Twilio": "#F22F46",
};

const categoryIcons: Record<string, any> = {
  "Cloud": Cloud,
  "Identity": Lock,
  "Security": Shield,
  "DevOps": GitBranch,
  "Ticketing": Ticket,
  "HR": Users,
  "Collaboration": SiSlack,
  "cloud": Cloud,
  "identity": Lock,
  "security": Shield,
  "devops": GitBranch,
  "itsm": Ticket,
  "ticketing": Ticket,
  "hr": Users,
  "email": Cloud,
  "vulnerability": Shield,
  "siem": Database,
  "edr": Shield,
};

interface Connector {
  id: string;
  name: string;
  provider: string;
  category: string;
  description: string;
  status: "connected" | "available" | "error" | "degraded" | "active" | "inactive";
  lastSync: string | null;
  healthStatus?: IntegrationStatus;
  lastHealthCheck?: string;
  isEnabled?: boolean;
}

interface HealthCheckResult {
  integrationId: string;
  name: string;
  provider: string;
  status: IntegrationStatus;
  message: string;
  responseTime: number;
}

interface WizardStep {
  title: string;
  description: string;
  commands?: { label: string; code: string; }[];
  tip?: string;
  docLink?: string;
}

const integrationTypeCategories: Record<string, string> = {
  "email": "Cloud",
  "identity": "Identity",
  "itsm": "Ticketing",
  "edr": "Security",
  "siem": "Security",
  "vulnerability": "Security",
};

export default function IntegrationHubPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [isGeneratingSteps, setIsGeneratingSteps] = useState(false);
  const [aiGeneratedSteps, setAiGeneratedSteps] = useState<string[]>([]);
  const [healthStatuses, setHealthStatuses] = useState<Record<string, IntegrationStatus>>({});
  const [isHealthChecking, setIsHealthChecking] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardSteps, setWizardSteps] = useState<WizardStep[]>([]);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const { currentTenantId } = useTenant();
  const { toast } = useToast();

  const { data: integrationSettings = [], isLoading: isLoadingSettings, refetch: refetchSettings } = useQuery({
    queryKey: ["/api/integration-settings", currentTenantId || "all"],
    queryFn: async () => {
      const url = currentTenantId 
        ? `/api/integration-settings?tenantId=${currentTenantId}`
        : "/api/integration-settings";
      const response = await fetch(url);
      return response.json();
    },
  });

  const connectors: Connector[] = integrationSettings.map((setting: any) => ({
    id: setting.id,
    name: setting.name,
    provider: setting.provider,
    category: integrationTypeCategories[setting.integrationType] || "Cloud",
    description: getProviderByName(setting.provider)?.description || `${setting.provider} integration`,
    status: setting.isEnabled 
      ? (setting.status === "error" ? "error" : setting.status === "inactive" ? "degraded" : "connected")
      : "available",
    lastSync: setting.lastSyncAt ? formatDistanceToNow(new Date(setting.lastSyncAt), { addSuffix: true }) : null,
    isEnabled: setting.isEnabled,
  }));

  // All available integration placeholders - always shown with real logos
  const allIntegrationPlaceholders: Connector[] = [
    // ============ CLOUD PROVIDERS ============
    { id: "aws", name: "AWS", provider: "AWS", category: "Cloud", description: "Amazon Web Services - cloud infrastructure and evidence collection", status: "available", lastSync: null },
    { id: "azure", name: "Microsoft Azure", provider: "Azure", category: "Cloud", description: "Microsoft Azure cloud services integration", status: "available", lastSync: null },
    { id: "gcp", name: "Google Cloud", provider: "Google Cloud", category: "Cloud", description: "GCP integration for infrastructure monitoring", status: "available", lastSync: null },
    { id: "digitalocean", name: "DigitalOcean", provider: "DigitalOcean", category: "Cloud", description: "DigitalOcean cloud infrastructure", status: "available", lastSync: null },
    { id: "oracle-cloud", name: "Oracle Cloud", provider: "Oracle Cloud", category: "Cloud", description: "Oracle Cloud Infrastructure (OCI)", status: "available", lastSync: null },
    { id: "ibm-cloud", name: "IBM Cloud", provider: "IBM Cloud", category: "Cloud", description: "IBM Cloud platform and services", status: "available", lastSync: null },
    { id: "alibaba-cloud", name: "Alibaba Cloud", provider: "Alibaba Cloud", category: "Cloud", description: "Alibaba Cloud for APAC regions", status: "available", lastSync: null },
    
    // ============ IDENTITY & ACCESS MANAGEMENT ============
    { id: "okta", name: "Okta", provider: "Okta", category: "Identity", description: "Enterprise identity and access management", status: "available", lastSync: null },
    { id: "auth0", name: "Auth0", provider: "Auth0", category: "Identity", description: "Flexible identity platform for developers", status: "available", lastSync: null },
    { id: "azure-ad", name: "Azure AD", provider: "Azure AD", category: "Identity", description: "Microsoft Entra ID (Azure Active Directory)", status: "available", lastSync: null },
    { id: "onelogin", name: "OneLogin", provider: "OneLogin", category: "Identity", description: "Cloud-based identity management", status: "available", lastSync: null },
    { id: "ping", name: "Ping Identity", provider: "Ping Identity", category: "Identity", description: "Enterprise identity security platform", status: "available", lastSync: null },
    { id: "cyberark", name: "CyberArk", provider: "CyberArk", category: "Identity", description: "Privileged access management (PAM)", status: "available", lastSync: null },
    { id: "hashicorp-vault", name: "HashiCorp Vault", provider: "HashiCorp Vault", category: "Identity", description: "Secrets management and data protection", status: "available", lastSync: null },
    { id: "1password", name: "1Password", provider: "1Password", category: "Identity", description: "Enterprise password management", status: "available", lastSync: null },
    
    // ============ SECURITY & SIEM ============
    { id: "splunk", name: "Splunk", provider: "Splunk", category: "Security", description: "SIEM and security analytics platform", status: "available", lastSync: null },
    { id: "crowdstrike", name: "CrowdStrike", provider: "CrowdStrike", category: "Security", description: "Endpoint detection and response (EDR)", status: "available", lastSync: null },
    { id: "sentinelone", name: "SentinelOne", provider: "SentinelOne", category: "Security", description: "AI-powered endpoint protection", status: "available", lastSync: null },
    { id: "microsoft-sentinel", name: "Microsoft Sentinel", provider: "Microsoft Sentinel", category: "Security", description: "Cloud-native SIEM solution", status: "available", lastSync: null },
    { id: "elastic-siem", name: "Elastic SIEM", provider: "Elastic SIEM", category: "Security", description: "Elastic Security for threat detection", status: "available", lastSync: null },
    { id: "qradar", name: "IBM QRadar", provider: "IBM QRadar", category: "Security", description: "Security intelligence platform", status: "available", lastSync: null },
    { id: "palo-alto", name: "Palo Alto Networks", provider: "Palo Alto", category: "Security", description: "Next-gen firewall and cloud security", status: "available", lastSync: null },
    { id: "fortinet", name: "Fortinet", provider: "Fortinet", category: "Security", description: "Network security and firewall solutions", status: "available", lastSync: null },
    { id: "cisco-security", name: "Cisco SecureX", provider: "Cisco SecureX", category: "Security", description: "Integrated security platform", status: "available", lastSync: null },
    { id: "carbon-black", name: "Carbon Black", provider: "Carbon Black", category: "Security", description: "VMware endpoint security", status: "available", lastSync: null },
    { id: "cynet", name: "Cynet 360", provider: "Cynet", category: "Security", description: "Autonomous breach protection platform with XDR, automated response, and 24/7 MDR", status: "available", lastSync: null },
    { id: "deceptive-bytes", name: "Deceptive Bytes", provider: "Deceptive Bytes", category: "Security", description: "Active endpoint deception for advanced threat prevention", status: "available", lastSync: null },
    { id: "checkpoint-hec", name: "Check Point HEC", provider: "Check Point HEC", category: "Security", description: "Harmony Endpoint security for complete endpoint protection", status: "available", lastSync: null },
    { id: "skyhigh-security", name: "Skyhigh Security", provider: "Skyhigh Security", category: "Security", description: "Cloud-native security platform for CASB, SWG, and ZTNA", status: "available", lastSync: null },
    { id: "forcepoint-dlp", name: "Forcepoint DLP", provider: "Forcepoint DLP", category: "Security", description: "Data loss prevention with risk-adaptive protection", status: "available", lastSync: null },
    
    // ============ CLOUD SECURITY POSTURE ============
    { id: "prisma-cloud", name: "Prisma Cloud", provider: "Prisma Cloud", category: "Security", description: "Cloud security posture management (CSPM)", status: "available", lastSync: null },
    { id: "wiz", name: "Wiz", provider: "Wiz", category: "Security", description: "Cloud security platform", status: "available", lastSync: null },
    { id: "lacework", name: "Lacework", provider: "Lacework", category: "Security", description: "Cloud security and compliance", status: "available", lastSync: null },
    { id: "snyk", name: "Snyk", provider: "Snyk", category: "Security", description: "Developer security - code and dependencies", status: "available", lastSync: null },
    { id: "aqua", name: "Aqua Security", provider: "Aqua Security", category: "Security", description: "Container and cloud-native security", status: "available", lastSync: null },
    
    // ============ VULNERABILITY MANAGEMENT ============
    { id: "tenable", name: "Tenable", provider: "Tenable", category: "Security", description: "Vulnerability management and scanning", status: "available", lastSync: null },
    { id: "qualys", name: "Qualys", provider: "Qualys", category: "Security", description: "Cloud security and compliance platform", status: "available", lastSync: null },
    { id: "rapid7", name: "Rapid7", provider: "Rapid7", category: "Security", description: "Vulnerability management and analytics", status: "available", lastSync: null },
    { id: "nessus", name: "Nessus", provider: "Nessus", category: "Security", description: "Vulnerability assessment scanner", status: "available", lastSync: null },
    { id: "veracode", name: "Veracode", provider: "Veracode", category: "Security", description: "Application security testing", status: "available", lastSync: null },
    { id: "checkmarx", name: "Checkmarx", provider: "Checkmarx", category: "Security", description: "Static application security testing", status: "available", lastSync: null },
    
    // ============ DATA SECURITY ============
    { id: "varonis", name: "Varonis", provider: "Varonis", category: "Security", description: "Data security and insider threat detection", status: "available", lastSync: null },
    { id: "bigid", name: "BigID", provider: "BigID", category: "Security", description: "Data discovery and privacy", status: "available", lastSync: null },
    { id: "imperva", name: "Imperva", provider: "Imperva", category: "Security", description: "Data and application security", status: "available", lastSync: null },
    
    // ============ GRC PLATFORMS ============
    { id: "onetrust", name: "OneTrust", provider: "OneTrust", category: "Security", description: "Privacy, security, and governance platform", status: "available", lastSync: null },
    { id: "archer", name: "RSA Archer", provider: "RSA Archer", category: "Security", description: "Integrated risk management", status: "available", lastSync: null },
    { id: "servicenow-grc", name: "ServiceNow GRC", provider: "ServiceNow GRC", category: "Security", description: "Governance, risk, and compliance", status: "available", lastSync: null },
    { id: "drata", name: "Drata", provider: "Drata", category: "Security", description: "Compliance automation platform", status: "available", lastSync: null },
    { id: "vanta", name: "Vanta", provider: "Vanta", category: "Security", description: "Automated security compliance", status: "available", lastSync: null },
    { id: "logicgate", name: "LogicGate", provider: "LogicGate", category: "Security", description: "Risk cloud platform", status: "available", lastSync: null },
    
    // ============ DEVOPS & SOURCE CONTROL ============
    { id: "github", name: "GitHub", provider: "GitHub", category: "DevOps", description: "Source code and repository management", status: "available", lastSync: null },
    { id: "gitlab", name: "GitLab", provider: "GitLab", category: "DevOps", description: "DevOps platform with CI/CD", status: "available", lastSync: null },
    { id: "bitbucket", name: "Bitbucket", provider: "Bitbucket", category: "DevOps", description: "Atlassian Git repository hosting", status: "available", lastSync: null },
    { id: "jenkins", name: "Jenkins", provider: "Jenkins", category: "DevOps", description: "Automation server for CI/CD", status: "available", lastSync: null },
    { id: "circleci", name: "CircleCI", provider: "CircleCI", category: "DevOps", description: "Continuous integration and delivery", status: "available", lastSync: null },
    { id: "terraform", name: "Terraform Cloud", provider: "Terraform", category: "DevOps", description: "Infrastructure as code platform", status: "available", lastSync: null },
    { id: "docker", name: "Docker Hub", provider: "Docker", category: "DevOps", description: "Container registry and management", status: "available", lastSync: null },
    { id: "kubernetes", name: "Kubernetes", provider: "Kubernetes", category: "DevOps", description: "Container orchestration platform", status: "available", lastSync: null },
    
    // ============ TICKETING & ITSM ============
    { id: "jira", name: "Jira", provider: "Jira", category: "Ticketing", description: "Issue tracking and project management", status: "available", lastSync: null },
    { id: "servicenow", name: "ServiceNow", provider: "ServiceNow", category: "Ticketing", description: "IT service management platform", status: "available", lastSync: null },
    { id: "zendesk", name: "Zendesk", provider: "Zendesk", category: "Ticketing", description: "Customer service and support platform", status: "available", lastSync: null },
    { id: "freshservice", name: "Freshservice", provider: "Freshservice", category: "Ticketing", description: "IT service desk software", status: "available", lastSync: null },
    { id: "pagerduty", name: "PagerDuty", provider: "PagerDuty", category: "Ticketing", description: "Incident management platform", status: "available", lastSync: null },
    { id: "opsgenie", name: "Opsgenie", provider: "Opsgenie", category: "Ticketing", description: "Alert and on-call management", status: "available", lastSync: null },
    
    // ============ MONITORING & OBSERVABILITY ============
    { id: "datadog", name: "Datadog", provider: "Datadog", category: "Security", description: "Cloud monitoring and security", status: "available", lastSync: null },
    { id: "newrelic", name: "New Relic", provider: "New Relic", category: "Security", description: "Application performance monitoring", status: "available", lastSync: null },
    { id: "dynatrace", name: "Dynatrace", provider: "Dynatrace", category: "Security", description: "Software intelligence platform", status: "available", lastSync: null },
    { id: "grafana", name: "Grafana", provider: "Grafana", category: "Security", description: "Observability and dashboards", status: "available", lastSync: null },
    { id: "sumologic", name: "Sumo Logic", provider: "Sumo Logic", category: "Security", description: "Cloud log management and SIEM", status: "available", lastSync: null },
    
    // ============ BACKUP & DISASTER RECOVERY ============
    { id: "veeam", name: "Veeam", provider: "Veeam", category: "Cloud", description: "Backup and disaster recovery", status: "available", lastSync: null },
    { id: "rubrik", name: "Rubrik", provider: "Rubrik", category: "Cloud", description: "Cloud data management", status: "available", lastSync: null },
    { id: "cohesity", name: "Cohesity", provider: "Cohesity", category: "Cloud", description: "Data management and protection", status: "available", lastSync: null },
    { id: "commvault", name: "Commvault", provider: "Commvault", category: "Cloud", description: "Enterprise data protection", status: "available", lastSync: null },
    
    // ============ COMMUNICATION & COLLABORATION ============
    { id: "slack", name: "Slack", provider: "Slack", category: "Collaboration", description: "Team messaging and notifications", status: "available", lastSync: null },
    { id: "teams", name: "Microsoft Teams", provider: "Microsoft Teams", category: "Collaboration", description: "Team collaboration and communication", status: "available", lastSync: null },
    { id: "zoom", name: "Zoom", provider: "Zoom", category: "Collaboration", description: "Video conferencing and webinars", status: "available", lastSync: null },
    { id: "webex", name: "Cisco Webex", provider: "Webex", category: "Collaboration", description: "Video conferencing and collaboration", status: "available", lastSync: null },
    
    // ============ FILE STORAGE & SHARING ============
    { id: "box", name: "Box", provider: "Box", category: "Cloud", description: "Enterprise content management", status: "available", lastSync: null },
    { id: "dropbox", name: "Dropbox Business", provider: "Dropbox", category: "Cloud", description: "Cloud file storage and sharing", status: "available", lastSync: null },
    { id: "onedrive", name: "OneDrive", provider: "OneDrive", category: "Cloud", description: "Microsoft cloud storage", status: "available", lastSync: null },
    { id: "google-drive", name: "Google Drive", provider: "Google Drive", category: "Cloud", description: "Cloud storage and collaboration", status: "available", lastSync: null },
    { id: "sharepoint", name: "SharePoint", provider: "SharePoint", category: "Cloud", description: "Microsoft document management", status: "available", lastSync: null },
    
    // ============ HR SYSTEMS ============
    { id: "workday", name: "Workday", provider: "Workday", category: "HR", description: "Human capital management", status: "available", lastSync: null },
    { id: "bamboohr", name: "BambooHR", provider: "BambooHR", category: "HR", description: "HR information system", status: "available", lastSync: null },
    { id: "adp", name: "ADP", provider: "ADP", category: "HR", description: "Payroll and HR services", status: "available", lastSync: null },
    { id: "successfactors", name: "SAP SuccessFactors", provider: "SuccessFactors", category: "HR", description: "SAP human experience management", status: "available", lastSync: null },
    { id: "namely", name: "Namely", provider: "Namely", category: "HR", description: "All-in-one HR platform", status: "available", lastSync: null },
    
    // ============ SECURITY AWARENESS ============
    { id: "knowbe4", name: "KnowBe4", provider: "KnowBe4", category: "Security", description: "Security awareness training", status: "available", lastSync: null },
    { id: "proofpoint", name: "Proofpoint", provider: "Proofpoint", category: "Security", description: "Email security and awareness", status: "available", lastSync: null },
    { id: "mimecast", name: "Mimecast", provider: "Mimecast", category: "Security", description: "Email and data security", status: "available", lastSync: null },
    
    // ============ EMAIL & NOTIFICATIONS ============
    { id: "sendgrid", name: "SendGrid", provider: "SendGrid", category: "Email", description: "Email delivery and API platform", status: "available", lastSync: null },
    { id: "mailgun", name: "Mailgun", provider: "Mailgun", category: "Email", description: "Email API for developers", status: "available", lastSync: null },
    { id: "ses", name: "Amazon SES", provider: "Amazon SES", category: "Email", description: "AWS Simple Email Service", status: "available", lastSync: null },
    { id: "twilio", name: "Twilio", provider: "Twilio", category: "Email", description: "Communication APIs (SMS, Voice, Email)", status: "available", lastSync: null },
  ];

  // Merge database integrations with placeholders - connected ones show status, others show as available
  const connectedProviders = new Set(connectors.map(c => c.provider));
  const availableProviders = allIntegrationPlaceholders.filter(p => !connectedProviders.has(p.provider));
  
  const allConnectors = [...connectors, ...availableProviders];

  const checkIntegrationHealth = async (connectorId: string, connectorName: string) => {
    if (connectorId.includes("-available")) {
      toast({
        title: "Integration Not Connected",
        description: "Connect this integration first to run health checks.",
        variant: "destructive",
      });
      return;
    }
    
    setHealthStatuses(prev => ({ ...prev, [connectorId]: "unknown" as IntegrationStatus }));
    
    try {
      const response = await apiRequest("POST", `/api/integration-settings/${connectorId}/health-check`, {
        tenantId: currentTenantId,
      });
      const result = await response.json() as HealthCheckResult;
      
      setHealthStatuses(prev => ({ ...prev, [connectorId]: result.status }));
      
      queryClient.invalidateQueries({ queryKey: ["/api/integration-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts", currentTenantId] });
      
      if (result.status === "error") {
        toast({
          title: "Integration Error Detected",
          description: `${connectorName}: ${result.message}`,
          variant: "destructive",
        });
      } else if (result.status === "degraded") {
        toast({
          title: "Integration Warning",
          description: `${connectorName}: ${result.message}`,
        });
      } else {
        toast({
          title: "Health Check Passed",
          description: `${connectorName} is operating normally (${result.responseTime}ms)`,
        });
      }
      
      return result.status;
    } catch (error: any) {
      setHealthStatuses(prev => ({ ...prev, [connectorId]: "error" }));
      toast({
        title: "Health Check Failed",
        description: `Failed to check ${connectorName}: ${error.message}`,
        variant: "destructive",
      });
      return "error";
    }
  };

  const checkAllIntegrations = async () => {
    const connectedIntegrations = connectors.filter(c => c.isEnabled);
    
    if (connectedIntegrations.length === 0) {
      toast({
        title: "No Connected Integrations",
        description: "Connect some integrations first to run health checks.",
      });
      return;
    }
    
    setIsHealthChecking(true);
    
    toast({
      title: "Health Check Started",
      description: `Checking ${connectedIntegrations.length} integrations...`,
    });
    
    try {
      const response = await apiRequest("POST", "/api/integration-settings/health-check-all", {
        tenantId: currentTenantId,
      });
      const result = await response.json();
      
      const newStatuses: Record<string, IntegrationStatus> = {};
      result.results?.forEach((r: HealthCheckResult) => {
        newStatuses[r.integrationId] = r.status;
      });
      setHealthStatuses(newStatuses);
      
      queryClient.invalidateQueries({ queryKey: ["/api/integration-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts", currentTenantId] });
      
      toast({
        title: "Health Check Complete",
        description: `Healthy: ${result.summary?.healthy || 0}, Degraded: ${result.summary?.degraded || 0}, Errors: ${result.summary?.errors || 0}`,
      });
    } catch (error: any) {
      toast({
        title: "Health Check Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsHealthChecking(false);
    }
  };

  const categories = [
    { id: "all", name: "All Integrations", icon: Plug },
    { id: "cloud", name: "Cloud", icon: Cloud },
    { id: "identity", name: "Identity", icon: Lock },
    { id: "security", name: "Security", icon: Shield },
    { id: "devops", name: "DevOps", icon: GitBranch },
    { id: "ticketing", name: "Ticketing", icon: Ticket },
    { id: "hr", name: "HR", icon: Users },
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filter from allConnectors (database + placeholders) to show all integrations
  const filteredConnectors = allConnectors.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || c.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate stats from allConnectors to include placeholders
  const availableCount = allConnectors.filter(c => c.status === "available").length;
  const connectedCount = allConnectors.filter(c => c.status === "connected" || c.status === "active").length;
  const errorCount = allConnectors.filter(c => c.status === "error").length;
  const degradedCount = allConnectors.filter(c => c.status === "degraded").length;

  const generateAIWizardSteps = (connectorName: string, provider: string): WizardStep[] => {
    const providerLower = provider.toLowerCase();
    
    if (providerLower.includes("aws") || providerLower.includes("amazon")) {
      return [
        {
          title: "Create IAM Role for GRC Shield",
          description: "In your AWS Console, navigate to IAM > Roles > Create Role. Select 'Another AWS account' as the trusted entity type.",
          commands: [
            { label: "COMMAND", code: `aws iam create-role --role-name GRCShieldSecurityRole --assume-role-policy-document file://trust-policy.json` },
          ],
          tip: "Use a dedicated role with least-privilege permissions for security scanning.",
          docLink: "https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create.html",
        },
        {
          title: "Attach Required Policies",
          description: "Attach the necessary IAM policies to allow GRC Shield to read security configurations and compliance data.",
          commands: [
            { label: "COMMAND", code: `aws iam attach-role-policy --role-name GRCShieldSecurityRole --policy-arn arn:aws:iam::aws:policy/SecurityAudit` },
            { label: "COMMAND", code: `aws iam attach-role-policy --role-name GRCShieldSecurityRole --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess` },
          ],
          tip: "The SecurityAudit policy provides read-only access to security configuration data.",
        },
        {
          title: "Configure External ID",
          description: "Set up an External ID for additional security when assuming the role from GRC Shield.",
          commands: [
            { label: "EXTERNAL ID", code: `grc-shield-${Date.now().toString(36)}` },
          ],
          tip: "External IDs prevent confused deputy attacks and should be kept confidential.",
        },
        {
          title: "Enter Credentials in GRC Shield",
          description: "Copy your AWS Account ID, Role ARN, and External ID to complete the integration setup.",
          tip: "You can find your Account ID in the AWS Console under your account dropdown.",
        },
        {
          title: "Test Connection",
          description: "Verify the integration by running a test connection. GRC Shield will attempt to list your S3 buckets and EC2 instances.",
          tip: "Initial sync may take 5-10 minutes depending on your AWS environment size.",
        },
      ];
    }
    
    if (providerLower.includes("okta")) {
      return [
        {
          title: "Create API Token in Okta",
          description: "Navigate to Security > API > Tokens in your Okta Admin Console and create a new API token.",
          commands: [
            { label: "TOKEN NAME", code: `GRCShield-Integration-${new Date().toISOString().split('T')[0]}` },
          ],
          tip: "Store this token securely - it will only be shown once.",
          docLink: "https://developer.okta.com/docs/guides/create-an-api-token/main/",
        },
        {
          title: "Configure Okta Domain",
          description: "Enter your Okta organization URL to connect GRC Shield to your identity provider.",
          commands: [
            { label: "OKTA DOMAIN", code: `https://your-org.okta.com` },
          ],
          tip: "Use your production Okta domain, not the admin or preview domains.",
        },
        {
          title: "Set API Permissions",
          description: "Ensure your API token has read access to users, groups, applications, and security events.",
          tip: "Super Admin tokens provide full read access. For least privilege, use a Read-Only Admin.",
        },
        {
          title: "Enter Credentials",
          description: "Paste your Okta API token and domain URL in the configuration form below.",
          tip: "Credentials are encrypted at rest and in transit.",
        },
        {
          title: "Verify & Sync",
          description: "Test the connection and initiate the first data sync to import users, groups, and applications.",
          tip: "Full sync may take several minutes for large directories.",
        },
      ];
    }
    
    if (providerLower.includes("splunk")) {
      return [
        {
          title: "Create HTTP Event Collector Token",
          description: "In Splunk, go to Settings > Data Inputs > HTTP Event Collector and create a new token.",
          commands: [
            { label: "COMMAND", code: `curl -k https://splunk.company.com:8089/servicesNS/admin/splunk_httpinput/data/inputs/http -d name=grc_shield` },
          ],
          tip: "Enable acknowledgement for reliable event delivery.",
          docLink: "https://docs.splunk.com/Documentation/Splunk/latest/Data/UsetheHTTPEventCollector",
        },
        {
          title: "Configure Token Settings",
          description: "Set the allowed indexes and sourcetype for GRC Shield events.",
          commands: [
            { label: "SOURCETYPE", code: `grc_shield:security_events` },
            { label: "INDEX", code: `main` },
          ],
          tip: "Create a dedicated index for GRC data for better data management.",
        },
        {
          title: "Set Up Splunk Endpoint",
          description: "Enter your Splunk HEC endpoint URL with the correct port.",
          commands: [
            { label: "ENDPOINT", code: `https://splunk.company.com:8088/services/collector` },
          ],
          tip: "Default HEC port is 8088. Ensure firewall allows this connection.",
        },
        {
          title: "Enter Token in GRC Shield",
          description: "Paste your HEC token and endpoint URL to complete the integration.",
          tip: "Test with a single event before enabling full integration.",
        },
        {
          title: "Verify Data Flow",
          description: "Check Splunk for incoming events from GRC Shield to confirm successful integration.",
          tip: "Search for 'sourcetype=grc_shield:*' to find your events.",
        },
      ];
    }

    if (providerLower.includes("github")) {
      return [
        {
          title: "Create GitHub App",
          description: "Navigate to GitHub Settings > Developer settings > GitHub Apps and create a new app for GRC Shield.",
          tip: "GitHub Apps are preferred over OAuth Apps for better security and granular permissions.",
          docLink: "https://docs.github.com/en/apps/creating-github-apps",
        },
        {
          title: "Configure App Permissions",
          description: "Set repository permissions to read-only for code, security events, and organization settings.",
          commands: [
            { label: "PERMISSIONS", code: `Repository: Read-only (Contents, Security events)\nOrganization: Read-only (Members)` },
          ],
          tip: "Request only the minimum permissions needed for compliance monitoring.",
        },
        {
          title: "Generate Private Key",
          description: "Generate a private key for your GitHub App and download it securely.",
          tip: "Keep this private key secure - it's used to authenticate as your app.",
        },
        {
          title: "Install App on Organization",
          description: "Install the GitHub App on your organization and select which repositories to grant access to.",
          tip: "You can start with a subset of repositories and expand later.",
        },
        {
          title: "Enter Credentials",
          description: "Provide your App ID, Installation ID, and private key to complete the setup.",
          tip: "Find your Installation ID in the URL after installing the app.",
        },
      ];
    }

    if (providerLower.includes("azure") && !providerLower.includes("ad")) {
      return [
        {
          title: "Register Azure Application",
          description: "In Azure Portal, navigate to Azure Active Directory > App registrations > New registration.",
          commands: [
            { label: "APP NAME", code: `GRCShield-Integration` },
            { label: "REDIRECT URI", code: `https://your-grcshield-domain.com/auth/azure/callback` },
          ],
          tip: "Select 'Accounts in this organizational directory only' for single-tenant apps.",
          docLink: "https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app",
        },
        {
          title: "Create Client Secret",
          description: "Under Certificates & secrets, create a new client secret for GRC Shield authentication.",
          commands: [
            { label: "SECRET DESCRIPTION", code: `GRCShield Production Secret` },
            { label: "EXPIRY", code: `24 months (recommended)` },
          ],
          tip: "Copy the secret value immediately - it won't be shown again.",
        },
        {
          title: "Assign API Permissions",
          description: "Grant the required Microsoft Graph and Azure Resource Manager permissions.",
          commands: [
            { label: "GRAPH PERMISSIONS", code: `Directory.Read.All, SecurityEvents.Read.All, Policy.Read.All` },
            { label: "ARM PERMISSIONS", code: `Reader role on subscriptions` },
          ],
          tip: "Admin consent is required for most security-related permissions.",
        },
        {
          title: "Configure Subscription Access",
          description: "Assign the Reader role to your app on each Azure subscription you want to monitor.",
          commands: [
            { label: "AZURE CLI", code: `az role assignment create --assignee <app-id> --role Reader --scope /subscriptions/<subscription-id>` },
          ],
          tip: "Use a custom role with minimal permissions for production environments.",
        },
        {
          title: "Enter Credentials",
          description: "Provide your Tenant ID, Client ID, Client Secret, and Subscription IDs.",
          tip: "Find your Tenant ID in Azure AD > Overview.",
        },
      ];
    }

    if (providerLower.includes("google cloud") || providerLower.includes("gcp")) {
      return [
        {
          title: "Create Service Account",
          description: "In Google Cloud Console, navigate to IAM & Admin > Service Accounts and create a new service account.",
          commands: [
            { label: "GCLOUD CLI", code: `gcloud iam service-accounts create grcshield-integration --display-name="GRC Shield Integration"` },
          ],
          tip: "Use a dedicated service account for GRC Shield with minimal permissions.",
          docLink: "https://cloud.google.com/iam/docs/service-accounts-create",
        },
        {
          title: "Assign IAM Roles",
          description: "Grant the necessary viewer roles for security and compliance monitoring.",
          commands: [
            { label: "COMMAND", code: `gcloud projects add-iam-policy-binding PROJECT_ID --member="serviceAccount:grcshield-integration@PROJECT_ID.iam.gserviceaccount.com" --role="roles/viewer"` },
            { label: "SECURITY ROLE", code: `gcloud projects add-iam-policy-binding PROJECT_ID --member="serviceAccount:..." --role="roles/securitycenter.findingsViewer"` },
          ],
          tip: "The Security Center Findings Viewer role provides access to security findings.",
        },
        {
          title: "Generate Service Account Key",
          description: "Create and download a JSON key file for the service account.",
          commands: [
            { label: "COMMAND", code: `gcloud iam service-accounts keys create grcshield-key.json --iam-account=grcshield-integration@PROJECT_ID.iam.gserviceaccount.com` },
          ],
          tip: "Store this key securely - it provides full access to granted resources.",
        },
        {
          title: "Enable Required APIs",
          description: "Enable the Cloud Resource Manager and Security Command Center APIs.",
          commands: [
            { label: "COMMAND", code: `gcloud services enable cloudresourcemanager.googleapis.com securitycenter.googleapis.com` },
          ],
          tip: "API enablement may take a few minutes to propagate.",
        },
        {
          title: "Upload Service Account Key",
          description: "Upload the JSON key file or paste its contents to complete the integration.",
          tip: "The key file contains sensitive credentials - never commit it to version control.",
        },
      ];
    }

    if (providerLower.includes("jira")) {
      return [
        {
          title: "Generate API Token",
          description: "Go to Atlassian Account Settings > Security > API tokens and create a new token.",
          commands: [
            { label: "TOKEN LABEL", code: `GRCShield Integration Token` },
          ],
          tip: "API tokens are tied to your Atlassian account - use a service account for production.",
          docLink: "https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/",
        },
        {
          title: "Configure Jira Site URL",
          description: "Enter your Atlassian site URL where GRC Shield will connect.",
          commands: [
            { label: "SITE URL", code: `https://your-company.atlassian.net` },
          ],
          tip: "Use your cloud instance URL, not the on-premise server URL.",
        },
        {
          title: "Set Project Permissions",
          description: "Ensure the API token account has access to the projects you want to integrate.",
          tip: "The account needs 'Browse Projects' permission at minimum for read access.",
        },
        {
          title: "Enter Credentials",
          description: "Provide your email address, API token, and Jira site URL.",
          tip: "GRC Shield uses Basic Auth with email:token for Jira Cloud API.",
        },
        {
          title: "Configure Issue Sync",
          description: "Select which projects and issue types to sync with GRC Shield.",
          tip: "Start with a single project to verify the integration works correctly.",
        },
      ];
    }

    if (providerLower.includes("servicenow")) {
      return [
        {
          title: "Create Integration User",
          description: "In ServiceNow, create a dedicated user account for GRC Shield API access.",
          commands: [
            { label: "USER ID", code: `grcshield.integration` },
            { label: "ROLES", code: `itil, sn_grc_read, sn_sec_cmn_read` },
          ],
          tip: "Use a non-interactive service account with password that doesn't expire.",
          docLink: "https://docs.servicenow.com/bundle/utah-platform-security/page/administer/users-and-groups/task/t_CreateAUser.html",
        },
        {
          title: "Configure OAuth Application",
          description: "Set up an OAuth application in ServiceNow for secure API authentication.",
          commands: [
            { label: "OAUTH ENDPOINT", code: `https://your-instance.service-now.com/oauth_token.do` },
          ],
          tip: "OAuth is recommended over Basic Auth for production integrations.",
        },
        {
          title: "Set Table Access",
          description: "Grant read access to required tables for GRC data collection.",
          commands: [
            { label: "TABLES", code: `sn_grc_risk, sn_grc_control, sn_grc_policy, incident, change_request` },
          ],
          tip: "Use Access Control Lists (ACLs) to limit access to specific records.",
        },
        {
          title: "Configure Instance URL",
          description: "Enter your ServiceNow instance URL.",
          commands: [
            { label: "INSTANCE URL", code: `https://your-instance.service-now.com` },
          ],
          tip: "Use your production instance URL, not developer instances.",
        },
        {
          title: "Test Connection",
          description: "Verify the integration by testing API connectivity and data access.",
          tip: "Initial sync may take several minutes depending on data volume.",
        },
      ];
    }

    if (providerLower.includes("slack")) {
      return [
        {
          title: "Create Slack App",
          description: "Go to api.slack.com/apps and create a new Slack app for your workspace.",
          commands: [
            { label: "APP NAME", code: `GRC Shield Alerts` },
          ],
          tip: "Create the app from scratch rather than using a manifest for more control.",
          docLink: "https://api.slack.com/apps",
        },
        {
          title: "Configure Bot Permissions",
          description: "Add the required OAuth scopes for posting messages and reading channels.",
          commands: [
            { label: "BOT SCOPES", code: `chat:write, channels:read, users:read, incoming-webhook` },
          ],
          tip: "Only request the minimum scopes needed for your use case.",
        },
        {
          title: "Install App to Workspace",
          description: "Install the app to your Slack workspace and authorize the permissions.",
          tip: "You'll need workspace admin approval for apps with sensitive permissions.",
        },
        {
          title: "Copy Bot Token",
          description: "After installation, copy the Bot User OAuth Token from the OAuth & Permissions page.",
          commands: [
            { label: "TOKEN FORMAT", code: `xoxb-xxxxxxxxxxxx-xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx` },
          ],
          tip: "Bot tokens start with 'xoxb-' - don't confuse with user tokens.",
        },
        {
          title: "Configure Notification Channels",
          description: "Select which Slack channels should receive GRC Shield notifications.",
          tip: "Create dedicated channels like #security-alerts and #compliance-updates.",
        },
      ];
    }

    if (providerLower.includes("datadog")) {
      return [
        {
          title: "Generate API Key",
          description: "In Datadog, go to Organization Settings > API Keys and create a new API key.",
          commands: [
            { label: "KEY NAME", code: `GRCShield Integration Key` },
          ],
          tip: "API keys are used for sending data to Datadog.",
          docLink: "https://docs.datadoghq.com/account_management/api-app-keys/",
        },
        {
          title: "Create Application Key",
          description: "Generate an Application key for reading data from Datadog APIs.",
          commands: [
            { label: "APP KEY NAME", code: `GRCShield Reader` },
          ],
          tip: "Application keys are used for querying Datadog APIs.",
        },
        {
          title: "Configure Datadog Site",
          description: "Select your Datadog site region for API endpoints.",
          commands: [
            { label: "US1 (DEFAULT)", code: `https://api.datadoghq.com` },
            { label: "EU1", code: `https://api.datadoghq.eu` },
            { label: "US3", code: `https://api.us3.datadoghq.com` },
          ],
          tip: "Use the correct site based on where your Datadog organization is hosted.",
        },
        {
          title: "Enter API Credentials",
          description: "Provide your API key, Application key, and site region.",
          tip: "Both keys are required - API key for writes, App key for reads.",
        },
        {
          title: "Configure Dashboards",
          description: "Select which Datadog dashboards and monitors to sync with GRC Shield.",
          tip: "Start with security and compliance-related monitors.",
        },
      ];
    }

    if (providerLower.includes("crowdstrike")) {
      return [
        {
          title: "Create API Client",
          description: "In CrowdStrike Falcon Console, navigate to Support > API Clients and Credentials.",
          commands: [
            { label: "CLIENT NAME", code: `GRCShield Integration` },
          ],
          tip: "You need Falcon Administrator privileges to create API clients.",
          docLink: "https://falcon.crowdstrike.com/documentation/46/crowdstrike-oauth2-based-apis",
        },
        {
          title: "Configure API Scopes",
          description: "Grant the required read scopes for security data collection.",
          commands: [
            { label: "SCOPES", code: `Detections:read, Hosts:read, Incidents:read, Vulnerabilities:read, Zero Trust Assessment:read` },
          ],
          tip: "Use read-only scopes unless you need GRC Shield to take remediation actions.",
        },
        {
          title: "Note Client Credentials",
          description: "Copy the Client ID and Client Secret after creation.",
          tip: "The secret is only shown once - store it securely.",
        },
        {
          title: "Identify Your Cloud Region",
          description: "Determine which CrowdStrike cloud your organization uses.",
          commands: [
            { label: "US-1", code: `api.crowdstrike.com` },
            { label: "US-2", code: `api.us-2.crowdstrike.com` },
            { label: "EU-1", code: `api.eu-1.crowdstrike.com` },
          ],
          tip: "Check your Falcon Console URL to identify your cloud region.",
        },
        {
          title: "Enter Credentials",
          description: "Provide your Client ID, Client Secret, and cloud region.",
          tip: "GRC Shield will automatically handle OAuth token refresh.",
        },
      ];
    }

    if (providerLower.includes("tenable")) {
      return [
        {
          title: "Generate API Keys",
          description: "In Tenable.io, go to Settings > My Account > API Keys and generate new keys.",
          commands: [
            { label: "ACCESS KEY", code: `(Will be generated)` },
            { label: "SECRET KEY", code: `(Will be generated)` },
          ],
          tip: "API keys inherit your user permissions - use a service account with appropriate access.",
          docLink: "https://developer.tenable.com/docs/authorization",
        },
        {
          title: "Configure User Permissions",
          description: "Ensure the API key user has the required permissions for vulnerability data.",
          commands: [
            { label: "MINIMUM ROLE", code: `Basic User (for read-only access)` },
            { label: "RECOMMENDED", code: `Scan Operator (for scan scheduling)` },
          ],
          tip: "The Administrator role provides full access but isn't required for data collection.",
        },
        {
          title: "Note API Endpoint",
          description: "Identify the correct API endpoint for your Tenable deployment.",
          commands: [
            { label: "TENABLE.IO", code: `https://cloud.tenable.com` },
            { label: "TENABLE.SC", code: `https://your-sc-server.company.com` },
          ],
          tip: "Tenable.io and Tenable.sc have different API structures.",
        },
        {
          title: "Enter Credentials",
          description: "Provide your Access Key, Secret Key, and API endpoint.",
          tip: "Keys are encrypted and stored securely in GRC Shield.",
        },
        {
          title: "Configure Scan Sync",
          description: "Select which scan folders and agent groups to sync with GRC Shield.",
          tip: "Initial vulnerability sync may take several minutes.",
        },
      ];
    }

    if (providerLower.includes("qualys")) {
      return [
        {
          title: "Create API User",
          description: "In Qualys, create a dedicated user with API access enabled.",
          commands: [
            { label: "USERNAME", code: `grcshield_api_user` },
            { label: "ROLE", code: `Reader` },
          ],
          tip: "Enable 'API Access' in the user's profile settings.",
          docLink: "https://www.qualys.com/docs/qualys-api-vmpc-user-guide.pdf",
        },
        {
          title: "Identify API Endpoint",
          description: "Determine your Qualys platform URL based on your subscription.",
          commands: [
            { label: "US PLATFORM 1", code: `https://qualysapi.qualys.com` },
            { label: "US PLATFORM 2", code: `https://qualysapi.qg2.apps.qualys.com` },
            { label: "EU PLATFORM", code: `https://qualysapi.qualys.eu` },
          ],
          tip: "Check your Qualys login URL to identify your platform.",
        },
        {
          title: "Configure Subscription",
          description: "Ensure your Qualys subscription includes API access.",
          tip: "Contact your Qualys account manager if API access isn't enabled.",
        },
        {
          title: "Enter Credentials",
          description: "Provide your username, password, and API endpoint URL.",
          tip: "GRC Shield supports both basic auth and Qualys API tokens.",
        },
        {
          title: "Select Asset Groups",
          description: "Choose which asset groups and scan data to sync with GRC Shield.",
          tip: "Start with critical asset groups to reduce initial sync time.",
        },
      ];
    }

    if (providerLower.includes("cynet")) {
      return [
        {
          title: "Access Cynet 360 Dashboard",
          description: "Log in to your Cynet 360 management console with administrator credentials.",
          commands: [
            { label: "CONSOLE URL", code: `https://your-tenant.cynet.com` },
          ],
          tip: "You need Cynet 360 XDR or AutoXDR subscription with API access enabled.",
          docLink: "https://www.cynet.com/platform/",
        },
        {
          title: "Generate API Token",
          description: "Navigate to Settings > API Integration and generate a new API token for GRC Shield.",
          commands: [
            { label: "TOKEN NAME", code: `GRCShield-Integration` },
            { label: "PERMISSIONS", code: `Read: Alerts, Hosts, Incidents, Forensics` },
          ],
          tip: "Create a dedicated token with read-only permissions for security monitoring.",
        },
        {
          title: "Configure Data Collection Scope",
          description: "Select which data types to sync: alerts, incidents, host inventory, and forensic data.",
          commands: [
            { label: "ENDPOINTS", code: `/api/v1/alerts, /api/v1/incidents, /api/v1/hosts` },
            { label: "DATA TYPES", code: `XDR Alerts, Autonomous Response Actions, MDR Reports` },
          ],
          tip: "Cynet's autonomous response actions provide rich context for compliance reporting.",
        },
        {
          title: "Enable Event Streaming",
          description: "Configure real-time event streaming for immediate threat visibility in GRC Shield.",
          commands: [
            { label: "WEBHOOK URL", code: `https://your-grcshield.com/api/webhooks/cynet` },
          ],
          tip: "Webhooks provide faster detection than polling-based integrations.",
        },
        {
          title: "Enter Credentials",
          description: "Provide your Cynet tenant URL, API token, and configure sync preferences.",
          tip: "GRC Shield will automatically correlate Cynet XDR data with your risk assessments.",
        },
      ];
    }

    if (providerLower.includes("deceptive bytes")) {
      return [
        {
          title: "Access Deceptive Bytes Console",
          description: "Log in to the Deceptive Bytes management console with administrator privileges.",
          commands: [
            { label: "CONSOLE URL", code: `https://console.deceptivebytes.com` },
          ],
          tip: "Deceptive Bytes uses active endpoint deception to prevent advanced threats.",
          docLink: "https://www.deceptivebytes.com/",
        },
        {
          title: "Create API Credentials",
          description: "Navigate to Settings > API Access and generate new API credentials for integration.",
          commands: [
            { label: "CLIENT NAME", code: `GRCShield-Deception-Integration` },
            { label: "SCOPE", code: `Endpoints:read, Deceptions:read, Alerts:read, Reports:read` },
          ],
          tip: "Use read-only scopes to monitor deception events without affecting endpoint protection.",
        },
        {
          title: "Configure Deception Policy Sync",
          description: "Select which deception policies and endpoint groups to monitor.",
          commands: [
            { label: "POLICY TYPES", code: `Malware Deception, Ransomware Deception, Fileless Attack Deception` },
            { label: "ENDPOINT GROUPS", code: `All managed endpoints or specific groups` },
          ],
          tip: "Deception events indicate active attack attempts - valuable for risk scoring.",
        },
        {
          title: "Enable Alert Forwarding",
          description: "Configure Deceptive Bytes to forward deception alerts to GRC Shield.",
          commands: [
            { label: "SYSLOG/WEBHOOK", code: `https://your-grcshield.com/api/webhooks/deceptive-bytes` },
            { label: "FORMAT", code: `JSON or CEF` },
          ],
          tip: "Real-time alert forwarding ensures immediate visibility into deception triggers.",
        },
        {
          title: "Complete Integration",
          description: "Enter your API credentials and verify the connection to Deceptive Bytes.",
          tip: "Deception-based detections provide high-confidence threat indicators for compliance.",
        },
      ];
    }

    if (providerLower.includes("check point") || providerLower.includes("checkpoint") || providerLower.includes("hec")) {
      return [
        {
          title: "Access Check Point Infinity Portal",
          description: "Log in to the Check Point Infinity Portal with administrator credentials.",
          commands: [
            { label: "PORTAL URL", code: `https://portal.checkpoint.com` },
          ],
          tip: "Harmony Endpoint Connect (HEC) provides unified endpoint security management.",
          docLink: "https://www.checkpoint.com/harmony/endpoint/",
        },
        {
          title: "Generate API Key",
          description: "Navigate to Global Settings > API Keys and create a new API key for GRC Shield.",
          commands: [
            { label: "KEY NAME", code: `GRCShield-HEC-Integration` },
            { label: "SERVICE", code: `Harmony Endpoint` },
            { label: "PERMISSIONS", code: `Endpoint Management: Read, Threat Prevention: Read, Logs: Read` },
          ],
          tip: "API keys are scoped to specific Infinity Portal services.",
        },
        {
          title: "Configure Harmony Endpoint Access",
          description: "Enable API access for Harmony Endpoint security data collection.",
          commands: [
            { label: "DATA SOURCES", code: `Anti-Malware, Anti-Ransomware, Threat Emulation, Forensics` },
            { label: "ENDPOINT GROUPS", code: `All or specific endpoint groups` },
          ],
          tip: "Threat Emulation data provides sandbox analysis results for compliance evidence.",
        },
        {
          title: "Set Up Log Export",
          description: "Configure Harmony Endpoint to export security logs to GRC Shield.",
          commands: [
            { label: "EXPORT FORMAT", code: `JSON via API or Syslog (CEF)` },
            { label: "LOG TYPES", code: `Threat Prevention, Forensics, Behavioral Guard` },
          ],
          tip: "Enable Behavioral Guard logs for advanced threat detection visibility.",
        },
        {
          title: "Enter Credentials",
          description: "Provide your API key, Client ID, and Infinity Portal tenant information.",
          tip: "GRC Shield will automatically map Check Point security events to compliance controls.",
        },
      ];
    }

    if (providerLower.includes("skyhigh")) {
      return [
        {
          title: "Access Skyhigh Security Console",
          description: "Log in to the Skyhigh Security management console (formerly McAfee MVISION Cloud).",
          commands: [
            { label: "CONSOLE URL", code: `https://www.myshn.net` },
          ],
          tip: "Skyhigh Security provides CASB, SWG, and ZTNA capabilities in one platform.",
          docLink: "https://www.skyhighsecurity.com/",
        },
        {
          title: "Create API Credentials",
          description: "Navigate to Settings > API Credentials and create a new client for GRC Shield.",
          commands: [
            { label: "CLIENT NAME", code: `GRCShield-Skyhigh-Integration` },
            { label: "CLIENT TYPE", code: `Machine-to-Machine (M2M)` },
            { label: "SCOPES", code: `casb:read, swg:read, ztna:read, dlp:read` },
          ],
          tip: "Use M2M client type for server-side integrations without user interaction.",
        },
        {
          title: "Configure Data Access Scopes",
          description: "Define which Skyhigh Security modules to integrate with GRC Shield.",
          commands: [
            { label: "CASB", code: `Shadow IT Discovery, Cloud DLP, User Activity` },
            { label: "SWG", code: `Web Traffic Logs, Threat Events, Policy Violations` },
            { label: "ZTNA", code: `Private Access Events, Device Posture` },
          ],
          tip: "CASB Shadow IT data is valuable for vendor risk and cloud security assessments.",
        },
        {
          title: "Enable Event Streaming",
          description: "Configure real-time event streaming to GRC Shield for continuous monitoring.",
          commands: [
            { label: "STREAMING ENDPOINT", code: `https://your-grcshield.com/api/webhooks/skyhigh` },
            { label: "EVENT TYPES", code: `DLP Incidents, Policy Violations, Anomalies` },
          ],
          tip: "DLP incident streaming provides immediate visibility into data protection events.",
        },
        {
          title: "Complete Setup",
          description: "Enter your Client ID, Client Secret, and tenant URL to complete the integration.",
          tip: "Skyhigh data enriches cloud security posture and DLP compliance reporting.",
        },
      ];
    }

    if (providerLower.includes("forcepoint")) {
      return [
        {
          title: "Access Forcepoint Security Manager",
          description: "Log in to the Forcepoint Security Manager or Cloud Security Gateway console.",
          commands: [
            { label: "CLOUD CONSOLE", code: `https://admin.forcepoint.net` },
            { label: "ON-PREM MANAGER", code: `https://your-fsm-server:port` },
          ],
          tip: "Forcepoint DLP protects data across endpoints, network, and cloud.",
          docLink: "https://www.forcepoint.com/product/dlp-data-loss-prevention",
        },
        {
          title: "Generate API Credentials",
          description: "Create API credentials for Forcepoint DLP integration.",
          commands: [
            { label: "ADMIN PATH", code: `Settings > API Access > Create New Credentials` },
            { label: "CREDENTIAL NAME", code: `GRCShield-Forcepoint-DLP` },
            { label: "PERMISSIONS", code: `Incidents:read, Policies:read, Reports:read, Forensics:read` },
          ],
          tip: "Use a dedicated service account with minimum required permissions.",
        },
        {
          title: "Configure DLP Policy Visibility",
          description: "Select which DLP policies and data classifications to monitor.",
          commands: [
            { label: "DATA CLASSIFIERS", code: `PII, PCI, PHI, Intellectual Property, Custom` },
            { label: "CHANNELS", code: `Email, Web, Endpoint, Cloud Apps, Network` },
          ],
          tip: "Forcepoint's risk-adaptive protection adjusts controls based on user behavior.",
        },
        {
          title: "Enable Incident Forwarding",
          description: "Configure Forcepoint to forward DLP incidents to GRC Shield.",
          commands: [
            { label: "SIEM INTEGRATION", code: `Enable syslog or HTTPS forwarding` },
            { label: "INCIDENT SEVERITY", code: `High, Medium, Low (select which to forward)` },
          ],
          tip: "Forward high-severity incidents in real-time; batch lower severity for efficiency.",
        },
        {
          title: "Enter Credentials",
          description: "Provide your API credentials, tenant URL, and configure sync preferences.",
          tip: "GRC Shield maps Forcepoint DLP incidents to data privacy compliance frameworks.",
        },
      ];
    }

    // Default steps for any provider
    return [
      {
        title: `Access ${connectorName} Admin Console`,
        description: `Log in to your ${connectorName} administrator portal with admin credentials.`,
        tip: "Ensure you have admin or developer access to create API credentials.",
        docLink: getProviderByName(connectorName)?.apiDocUrl,
      },
      {
        title: "Navigate to API Settings",
        description: `Find the API, Developer, or Integrations section in your ${connectorName} settings.`,
        commands: [
          { label: "TYPICAL PATH", code: `Settings > Security > API Keys` },
        ],
        tip: "Look for 'Developer', 'Integrations', or 'API' in the navigation menu.",
      },
      {
        title: "Create API Credentials",
        description: "Generate new API credentials (API key, OAuth client, or service account) for GRC Shield.",
        commands: [
          { label: "APPLICATION NAME", code: `GRCShield-Integration` },
        ],
        tip: "Use a descriptive name to identify the GRC Shield integration.",
      },
      {
        title: "Configure Permissions",
        description: "Grant the minimum required permissions for compliance monitoring and security analysis.",
        tip: "Follow the principle of least privilege - only grant read access where possible.",
      },
      {
        title: "Enter Credentials in GRC Shield",
        description: "Copy your API credentials and paste them into the integration configuration below.",
        tip: "All credentials are encrypted and stored securely.",
      },
    ];
  };

  const generateAISetupSteps = async (connectorName: string) => {
    setIsGeneratingSteps(true);
    setAiGeneratedSteps([]);
    setWizardSteps([]);
    setCurrentStep(0);
    
    const provider = getProviderByName(connectorName);
    
    // Generate wizard steps
    const steps = generateAIWizardSteps(connectorName, provider?.name || connectorName);
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setWizardSteps(steps);
    
    // Also set simple steps for backwards compatibility
    if (provider) {
      setAiGeneratedSteps(provider.setupSteps);
    } else {
      setAiGeneratedSteps(steps.map(s => s.title));
    }
    
    setIsGeneratingSteps(false);
  };

  const openSetupDialog = (connector: Connector) => {
    setSelectedConnector(connector);
    setShowSetupDialog(true);
    setCurrentStep(0);
    setWizardSteps([]);
    setAiGeneratedSteps([]);
    setCopiedCommand(null);
    generateAISetupSteps(connector.name);
  };

  const copyToClipboard = async (text: string, commandId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCommand(commandId);
      toast({ title: "Copied to clipboard" });
      setTimeout(() => setCopiedCommand(null), 2000);
    } catch (error) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const nextStep = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getConnectorIcon = (connector: Connector) => {
    const IconComponent = providerIcons[connector.name] || categoryIcons[connector.category] || Plug;
    const iconColor = providerColors[connector.name] || "#6366F1";
    
    return (
      <div 
        className="p-2.5 rounded-lg" 
        style={{ backgroundColor: `${iconColor}20` }}
      >
        <IconComponent 
          className="w-6 h-6" 
          style={{ color: iconColor }}
        />
      </div>
    );
  };

  const getStatusBadge = (connector: Connector) => {
    const healthStatus = healthStatuses[connector.id];
    
    if (healthStatus === "error" || connector.status === "error") {
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
          <XCircle className="w-3 h-3 mr-1" /> Error
        </Badge>
      );
    }
    
    if (healthStatus === "degraded" || connector.status === "degraded") {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          <AlertTriangle className="w-3 h-3 mr-1" /> Degraded
        </Badge>
      );
    }
    
    if (connector.status === "connected") {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary">
        Available
      </Badge>
    );
  };

  const getProviderInfo = (connectorName: string) => {
    return getProviderByName(connectorName);
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Integration Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect your tools for automated evidence collection and monitoring
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={checkAllIntegrations} data-testid="button-health-check">
            <Activity className="w-4 h-4 mr-2" />
            Health Check
          </Button>
          <Button variant="outline" data-testid="button-sync-all">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync All
          </Button>
          <Button data-testid="button-request-integration">
            <Plus className="w-4 h-4 mr-2" />
            Request Integration
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Plug className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{availableCount}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/20">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{connectedCount}</p>
              <p className="text-sm text-muted-foreground">Connected</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-red-500/20">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{errorCount}</p>
              <p className="text-sm text-muted-foreground">Errors</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-yellow-500/20">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{degradedCount}</p>
              <p className="text-sm text-muted-foreground">Degraded</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-sm text-muted-foreground">Monitoring</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search integrations..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-integrations"
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            data-testid={`button-filter-${cat.id}`}
          >
            <cat.icon className="w-4 h-4 mr-2" />
            {cat.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredConnectors.map((connector) => {
          const providerInfo = getProviderInfo(connector.name);
          
          return (
            <Card key={connector.id} className="glass-card hover-elevate transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getConnectorIcon(connector)}
                    <div>
                      <h3 className="font-semibold">{connector.name}</h3>
                      <Badge variant="outline" className="text-xs mt-1">{connector.category}</Badge>
                    </div>
                  </div>
                  {getStatusBadge(connector)}
                </div>
                <p className="text-sm text-muted-foreground mb-4">{connector.description}</p>
                
                {providerInfo && (
                  <div className="mb-4 p-2 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      Setup time: {providerInfo.estimatedSetupTime}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {providerInfo.features.slice(0, 3).map((feature, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {providerInfo.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{providerInfo.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  {connector.lastSync ? (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {connector.status === "error" ? "Failed" : `Last sync: ${connector.lastSync}`}
                    </span>
                  ) : (
                    <span></span>
                  )}
                  <div className="flex gap-2">
                    {connector.status === "connected" || connector.status === "error" || connector.status === "degraded" ? (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => checkIntegrationHealth(connector.id, connector.name)}
                          data-testid={`button-check-health-${connector.id}`}
                        >
                          <Activity className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openSetupDialog(connector)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => openSetupDialog(connector)}
                        data-testid={`button-connect-${connector.id}`}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0">
          {/* Header with provider info */}
          <div className="p-6 pb-4 border-b border-border/50">
            <div className="flex items-center gap-4">
              {selectedConnector && (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border border-primary/30">
                  {getConnectorIcon(selectedConnector)}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <DialogTitle className="text-xl">Connect {selectedConnector?.name}</DialogTitle>
                  {selectedConnector && getProviderInfo(selectedConnector.name) && (
                    <Badge variant="outline" className="bg-muted/50">
                      <Clock className="w-3 h-3 mr-1" />
                      {getProviderInfo(selectedConnector.name)?.estimatedSetupTime}
                    </Badge>
                  )}
                </div>
                <DialogDescription className="mt-1">
                  Follow the step-by-step guide below to connect your {selectedConnector?.name} account
                </DialogDescription>
              </div>
            </div>
          </div>
          
          {/* Step indicators */}
          {!isGeneratingSteps && wizardSteps.length > 0 && (
            <div className="px-6 py-4 border-b border-border/30 bg-muted/20">
              <div className="flex items-center justify-between max-w-xl mx-auto">
                {wizardSteps.map((_, index) => (
                  <div key={index} className="flex items-center">
                    <button
                      onClick={() => setCurrentStep(index)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        index === currentStep
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                          : index < currentStep
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                      data-testid={`step-indicator-${index + 1}`}
                    >
                      {index < currentStep ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </button>
                    {index < wizardSteps.length - 1 && (
                      <div className={`w-12 md:w-20 h-0.5 mx-1 ${
                        index < currentStep ? "bg-green-500" : "bg-muted"
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {isGeneratingSteps ? (
                <div className="space-y-6 py-8">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                      </div>
                      <Loader2 className="w-6 h-6 text-primary animate-spin absolute -top-1 -right-1" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-lg">Generating AI-Powered Setup Guide</h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        Creating personalized instructions for {selectedConnector?.name}...
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 max-w-md mx-auto">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : wizardSteps.length > 0 && wizardSteps[currentStep] ? (
                <div className="space-y-6">
                  {/* Current step content */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          Step {currentStep + 1}: {wizardSteps[currentStep].title}
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          {wizardSteps[currentStep].description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Command blocks */}
                    {wizardSteps[currentStep].commands && wizardSteps[currentStep].commands!.length > 0 && (
                      <div className="space-y-3 ml-13">
                        {wizardSteps[currentStep].commands!.map((cmd, cmdIndex) => (
                          <div key={cmdIndex} className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Terminal className="w-3 h-3" />
                              {cmd.label}
                            </div>
                            <div className="relative group">
                              <div className="bg-slate-900 rounded-lg p-4 pr-12 font-mono text-sm text-slate-100 overflow-x-auto border border-slate-700">
                                <code>{cmd.code}</code>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
                                onClick={() => copyToClipboard(cmd.code, `${currentStep}-${cmdIndex}`)}
                                data-testid={`button-copy-${currentStep}-${cmdIndex}`}
                              >
                                {copiedCommand === `${currentStep}-${cmdIndex}` ? (
                                  <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Tip section */}
                    {wizardSteps[currentStep].tip && (
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 ml-13">
                        <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-amber-400">Tip: </span>
                          <span className="text-amber-200/80">{wizardSteps[currentStep].tip}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Documentation link */}
                    {wizardSteps[currentStep].docLink && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50 ml-13">
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Need help? Check the </span>
                        <a
                          href={wizardSteps[currentStep].docLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          official documentation
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {/* Required credentials summary */}
                  {currentStep === wizardSteps.length - 1 && selectedConnector && getProviderInfo(selectedConnector.name) && (
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        Required Credentials
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {getProviderInfo(selectedConnector.name)?.requiredCredentials.map((cred, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {cred}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No setup steps available for this integration.
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Footer navigation */}
          <div className="p-4 border-t border-border/50 bg-muted/10">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 0 || isGeneratingSteps}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSetupDialog(false)}
                >
                  Cancel
                </Button>
                
                {currentStep === wizardSteps.length - 1 ? (
                  <Button 
                    className="gap-2 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                    disabled={isGeneratingSteps}
                    data-testid="button-complete-setup"
                  >
                    <Plug className="w-4 h-4" />
                    Complete Setup
                  </Button>
                ) : (
                  <Button 
                    onClick={nextStep}
                    disabled={isGeneratingSteps || wizardSteps.length === 0}
                    className="gap-2"
                    data-testid="button-next-step"
                  >
                    Next Step
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
