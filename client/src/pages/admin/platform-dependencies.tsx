import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ExternalLink, Shield, Brain, Eye, Search, AlertTriangle, CheckCircle2,
  XCircle, Clock, ChevronDown, ChevronRight, Zap, Server,
  FileText, Mail, Bug, Package, RefreshCcw, Wifi, WifiOff
} from "lucide-react";

type IntegrationStatus = "active" | "integrated" | "configured" | "not_connected" | "planned" | "not_integrated" | "simulated";
type LicenseType = "paid" | "free" | "open_source" | "freemium" | "enterprise";

interface Dependency {
  name: string;
  description: string;
  category: string;
  licenseType: LicenseType;
  status: IntegrationStatus;
  website: string;
  pricing?: string;
  features: string[];
  alternatives?: string[];
  notes?: string;
  apiRequired?: boolean;
  setupGuide?: string;
  envVars?: string[];
}

const platformDependencies: Dependency[] = [
  // Core Infrastructure
  {
    name: "PostgreSQL (Neon)",
    description: "Serverless PostgreSQL database for all application data",
    category: "Core Infrastructure",
    licenseType: "freemium",
    status: "active",
    website: "https://neon.tech",
    pricing: "Free tier available, paid plans from $19/month",
    features: ["Serverless scaling", "Branching", "Auto-suspend", "Point-in-time recovery"],
    notes: "Provided by Replit integration - Connected and active",
    setupGuide: "Automatically configured via Replit. Access via DATABASE_URL environment variable.",
    envVars: ["DATABASE_URL", "PGHOST", "PGPORT", "PGUSER", "PGPASSWORD", "PGDATABASE"]
  },
  {
    name: "Replit Auth (OpenID Connect)",
    description: "Authentication and user management",
    category: "Core Infrastructure",
    licenseType: "free",
    status: "active",
    website: "https://replit.com",
    features: ["SSO", "OAuth 2.0", "Session management", "User profiles"],
    notes: "Native Replit integration - Connected and active",
    setupGuide: "Automatically configured via Replit Auth integration. Uses ISSUER_URL for OIDC.",
    envVars: ["ISSUER_URL", "SESSION_SECRET"]
  },
  {
    name: "Replit Object Storage",
    description: "Cloud object storage for files and documents",
    category: "Core Infrastructure",
    licenseType: "freemium",
    status: "active",
    website: "https://replit.com",
    pricing: "Included with Replit plans",
    features: ["File uploads", "Document storage", "Evidence management"],
    notes: "Native Replit integration - Connected and active",
    setupGuide: "Automatically configured via Replit Object Storage integration.",
    envVars: ["DEFAULT_OBJECT_STORAGE_BUCKET_ID", "PUBLIC_OBJECT_SEARCH_PATHS", "PRIVATE_OBJECT_DIR"]
  },

  // AI & Machine Learning
  {
    name: "OpenAI GPT-4",
    description: "AI-powered compliance insights, policy analysis, and risk assessment",
    category: "AI & Machine Learning",
    licenseType: "paid",
    status: "active",
    website: "https://openai.com",
    pricing: "Pay-per-use: ~$0.03/1K input tokens, ~$0.06/1K output tokens (GPT-4)",
    features: ["Compliance gap detection", "Policy recommendations", "Risk analysis", "Content enrichment"],
    apiRequired: true,
    notes: "Integrated via Replit AI Integrations - Connected and active",
    setupGuide: "Configured via Replit AI Integrations. API key managed by Replit.",
    envVars: ["AI_INTEGRATIONS_OPENAI_API_KEY"]
  },
  {
    name: "Claude (Anthropic)",
    description: "Alternative LLM for AI-powered analysis",
    category: "AI & Machine Learning",
    licenseType: "paid",
    status: "not_connected",
    website: "https://anthropic.com",
    pricing: "Pay-per-use pricing",
    features: ["Long context analysis", "Safety-focused responses"],
    alternatives: ["OpenAI GPT-4", "Google Gemini"],
    setupGuide: "1. Get API key from Anthropic Console\n2. Add ANTHROPIC_API_KEY to secrets\n3. Enable in Integration Hub"
  },

  // Security Scanning - Web Application
  {
    name: "OWASP ZAP",
    description: "Open-source web application security scanner",
    category: "Web Application Scanning",
    licenseType: "open_source",
    status: "planned",
    website: "https://www.zaproxy.org",
    pricing: "Free (Apache 2.0 License)",
    features: ["OWASP Top 10 detection", "Active/passive scanning", "API scanning", "Automation"],
    alternatives: ["Nuclei", "Nikto", "Burp Suite"],
    notes: "Recommended for production integration"
  },
  {
    name: "Nuclei",
    description: "Fast vulnerability scanner with extensive template library",
    category: "Web Application Scanning",
    licenseType: "open_source",
    status: "planned",
    website: "https://nuclei.projectdiscovery.io",
    pricing: "Free (MIT License)",
    features: ["Template-based scanning", "CVE detection", "Technology fingerprinting", "CI/CD integration"],
    alternatives: ["OWASP ZAP", "Nikto"]
  },
  {
    name: "Acunetix",
    description: "Enterprise web vulnerability scanner",
    category: "Web Application Scanning",
    licenseType: "enterprise",
    status: "not_integrated",
    website: "https://www.acunetix.com",
    pricing: "Starting ~$4,500/year",
    features: ["Deep scanning", "DAST", "IAST", "AcuSensor technology", "Compliance reports"],
    alternatives: ["Qualys WAS", "Rapid7 InsightAppSec"]
  },
  {
    name: "Qualys WAS",
    description: "Cloud-based web application scanning",
    category: "Web Application Scanning",
    licenseType: "enterprise",
    status: "not_integrated",
    website: "https://www.qualys.com/apps/web-app-scanning/",
    pricing: "Enterprise pricing (contact sales)",
    features: ["Continuous scanning", "API security", "Malware detection", "PCI compliance"]
  },
  {
    name: "Burp Suite",
    description: "Industry-standard web security testing toolkit",
    category: "Web Application Scanning",
    licenseType: "freemium",
    status: "not_integrated",
    website: "https://portswigger.net/burp",
    pricing: "Pro: $449/user/year, Enterprise: contact sales",
    features: ["Manual testing", "Automated scanning", "API testing", "Extensions ecosystem"]
  },

  // Dark Web Monitoring - Free & Open Source
  {
    name: "MISP (Malware Information Sharing Platform)",
    description: "Open source threat intelligence platform for dark web indicators and IoC sharing",
    category: "Dark Web Monitoring",
    licenseType: "open_source",
    status: "configured",
    website: "https://www.misp-project.org/",
    pricing: "Free (self-hosted)",
    features: ["Central TI database", "IoC sharing", "Dark web indicators", "MITRE ATT&CK integration", "RESTful API"],
    apiRequired: false,
    notes: "Recommended open source solution for threat intelligence aggregation",
    setupGuide: "Self-hosted platform. Install via Docker or from source. Use PyMISP Python library for API integration.",
    envVars: ["MISP_URL", "MISP_API_KEY"]
  },
  {
    name: "AlienVault OTX (Open Threat Exchange)",
    description: "Community-driven threat intelligence platform with free API access",
    category: "Dark Web Monitoring",
    licenseType: "free",
    status: "configured",
    website: "https://otx.alienvault.com/",
    pricing: "Free",
    features: ["Community IoC sharing", "Threat pulses", "Malware analysis", "IP/domain reputation", "Free API"],
    apiRequired: true,
    notes: "Largest open threat intelligence community - easy API integration",
    setupGuide: "1. Create free account at otx.alienvault.com\n2. Get API key from Settings > API\n3. Use OTX DirectConnect SDK for integration",
    envVars: ["OTX_API_KEY"]
  },
  {
    name: "deepdarkCTI",
    description: "Curated collection of cyber threat intelligence sources from deep/dark web",
    category: "Dark Web Monitoring",
    licenseType: "open_source",
    status: "configured",
    website: "https://github.com/fastfire/deepdarkCTI",
    pricing: "Free",
    features: ["Ransomware sites", "Criminal forums", "Leak databases", "Telegram channels", "Exploit marketplaces"],
    apiRequired: false,
    notes: "Reference repository for dark web threat sources - community maintained"
  },
  {
    name: "Have I Been Pwned (HIBP) API",
    description: "Breach database lookup for compromised credentials",
    category: "Dark Web Monitoring",
    licenseType: "freemium",
    status: "planned",
    website: "https://haveibeenpwned.com/API/v3",
    pricing: "Free for personal use, $3.50/month for API access",
    features: ["Breach search", "Password exposure check", "Domain search", "Pwned passwords"],
    apiRequired: true,
    notes: "Industry standard for breach detection - affordable API",
    setupGuide: "1. Subscribe at haveibeenpwned.com/API/Key\n2. Add API key to environment\n3. Use hibp npm package for Node.js integration",
    envVars: ["HIBP_API_KEY"]
  },
  {
    name: "Shadowserver Foundation",
    description: "Non-profit providing free threat intelligence feeds",
    category: "Dark Web Monitoring",
    licenseType: "free",
    status: "configured",
    website: "https://www.shadowserver.org/",
    pricing: "Free",
    features: ["Scanning reports", "Malware activity", "Botnet data", "Sinkhole data", "Free feeds"],
    apiRequired: false,
    notes: "Highly respected source for actionable threat intelligence"
  },
  {
    name: "SpyCloud",
    description: "Enterprise dark web intelligence and breach detection",
    category: "Dark Web Monitoring",
    licenseType: "enterprise",
    status: "not_integrated",
    website: "https://spycloud.com",
    pricing: "Enterprise pricing (contact sales)",
    features: ["Stolen credential monitoring", "Malware data", "Account takeover prevention", "Employee monitoring"]
  },
  {
    name: "Flare",
    description: "Threat exposure management platform with 30-day free trial",
    category: "Dark Web Monitoring",
    licenseType: "enterprise",
    status: "not_integrated",
    website: "https://flare.io",
    pricing: "Free trial, then ~$15,000/year",
    features: ["Dark web monitoring", "Telegram monitoring", "Stealer logs", "Brand protection"],
    notes: "Monitors 58k+ Telegram channels, Tor, I2P"
  },
  {
    name: "Recorded Future",
    description: "Threat intelligence platform with dark web coverage",
    category: "Dark Web Monitoring",
    licenseType: "enterprise",
    status: "not_integrated",
    website: "https://www.recordedfuture.com",
    pricing: "Enterprise pricing (contact sales)",
    features: ["Real-time intelligence", "Dark web monitoring", "Brand monitoring", "Vulnerability intelligence"]
  },

  // Email Security
  {
    name: "DNS Lookups (Native)",
    description: "DMARC/DKIM/SPF record validation",
    category: "Email Security",
    licenseType: "free",
    status: "active",
    website: "",
    features: ["MX record lookup", "SPF validation", "DKIM check", "DMARC policy analysis"],
    notes: "Uses native DNS resolution libraries - Active and working",
    setupGuide: "Built-in DNS resolution using Node.js dns module. No configuration required."
  },
  {
    name: "MXToolbox API",
    description: "Comprehensive email infrastructure testing",
    category: "Email Security",
    licenseType: "freemium",
    status: "planned",
    website: "https://mxtoolbox.com",
    pricing: "Free tier available, Pro from $129/month",
    features: ["Blacklist monitoring", "SMTP diagnostics", "DNS health", "Deliverability testing"],
    apiRequired: true
  },

  // Vulnerability Intelligence
  {
    name: "NVD (National Vulnerability Database)",
    description: "Official US government CVE database",
    category: "Vulnerability Intelligence",
    licenseType: "free",
    status: "configured",
    website: "https://nvd.nist.gov",
    pricing: "Free (public data)",
    features: ["CVE details", "CVSS scores", "CPE matching", "JSON feeds"],
    notes: "Primary source for CVE data - Free API access configured",
    setupGuide: "Free public API. No authentication required for basic queries. Rate limited to 5 requests per 30 seconds without API key.",
    envVars: ["NVD_API_KEY"]
  },
  {
    name: "Vulners API",
    description: "Vulnerability database with aggregated sources",
    category: "Vulnerability Intelligence",
    licenseType: "freemium",
    status: "planned",
    website: "https://vulners.com",
    pricing: "Free tier available, paid plans for enterprise",
    features: ["CVE aggregation", "Exploit database", "AI scoring", "Patch intelligence"],
    apiRequired: true
  },
  {
    name: "Shodan",
    description: "Internet-wide device and service scanner",
    category: "Vulnerability Intelligence",
    licenseType: "freemium",
    status: "not_integrated",
    website: "https://www.shodan.io",
    pricing: "Free tier, Pro from $49/month",
    features: ["Port scanning", "Banner grabbing", "Vulnerability detection", "Network monitoring"],
    apiRequired: true
  },

  // GRC & Compliance Frameworks
  {
    name: "UCF (Unified Compliance Framework)",
    description: "Comprehensive compliance framework mapping",
    category: "GRC Frameworks",
    licenseType: "enterprise",
    status: "not_integrated",
    website: "https://www.unifiedcompliance.com",
    pricing: "Enterprise pricing",
    features: ["Control harmonization", "Framework mapping", "Citations", "Authority documents"]
  },
  {
    name: "NIST Cybersecurity Framework",
    description: "NIST CSF controls and guidelines",
    category: "GRC Frameworks",
    licenseType: "free",
    status: "active",
    website: "https://www.nist.gov/cyberframework",
    features: ["Control library", "Implementation guidance", "Assessment templates"],
    notes: "Included in built-in framework library - 109 frameworks loaded",
    setupGuide: "Pre-loaded in the platform's Framework Library. Access via Governance > Frameworks."
  },

  // Document Generation
  {
    name: "jsPDF",
    description: "Client-side PDF generation",
    category: "Document Generation",
    licenseType: "open_source",
    status: "active",
    website: "https://github.com/parallax/jsPDF",
    pricing: "Free (MIT License)",
    features: ["PDF export", "Report generation", "Custom templates"],
    setupGuide: "Already integrated via npm package. Used in Reports Center for PDF exports."
  },
  {
    name: "docx",
    description: "Microsoft Word document generation",
    category: "Document Generation",
    licenseType: "open_source",
    status: "active",
    website: "https://github.com/dolanmiu/docx",
    pricing: "Free (MIT License)",
    features: ["Word export", "Policy documents", "Template-based generation"],
    setupGuide: "Already integrated via npm package. Used in Reports Center for Word exports."
  },

  // Notifications & Communication
  {
    name: "SendGrid",
    description: "Transactional email service",
    category: "Notifications",
    licenseType: "freemium",
    status: "planned",
    website: "https://sendgrid.com",
    pricing: "Free tier (100 emails/day), paid from $19.95/month",
    features: ["Email delivery", "Templates", "Analytics", "Webhooks"],
    apiRequired: true,
    alternatives: ["AWS SES", "Mailgun", "Postmark"]
  },
  {
    name: "Twilio",
    description: "SMS and voice notifications",
    category: "Notifications",
    licenseType: "paid",
    status: "planned",
    website: "https://www.twilio.com",
    pricing: "Pay-per-use: ~$0.0079/SMS",
    features: ["SMS alerts", "Voice calls", "WhatsApp", "Programmable messaging"],
    apiRequired: true
  }
];

const categories = Array.from(new Set(platformDependencies.map(d => d.category)));

const getStatusBadge = (status: IntegrationStatus) => {
  switch (status) {
    case "active":
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30" data-testid={`badge-status-active`}><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>;
    case "integrated":
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30" data-testid={`badge-status-integrated`}><CheckCircle2 className="w-3 h-3 mr-1" />Integrated</Badge>;
    case "configured":
      return <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30" data-testid={`badge-status-configured`}><Zap className="w-3 h-3 mr-1" />Configured</Badge>;
    case "not_connected":
      return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30" data-testid={`badge-status-not-connected`}><XCircle className="w-3 h-3 mr-1" />Not Connected</Badge>;
    case "simulated":
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30" data-testid={`badge-status-simulated`}><Clock className="w-3 h-3 mr-1" />Simulated</Badge>;
    case "planned":
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30" data-testid={`badge-status-planned`}><Clock className="w-3 h-3 mr-1" />Planned</Badge>;
    case "not_integrated":
      return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30" data-testid={`badge-status-not-integrated`}><XCircle className="w-3 h-3 mr-1" />Not Integrated</Badge>;
  }
};

const getLicenseBadge = (license: LicenseType) => {
  switch (license) {
    case "free":
      return <Badge variant="outline" className="border-green-500/50 text-green-400">Free</Badge>;
    case "open_source":
      return <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">Open Source</Badge>;
    case "freemium":
      return <Badge variant="outline" className="border-blue-500/50 text-blue-400">Freemium</Badge>;
    case "paid":
      return <Badge variant="outline" className="border-orange-500/50 text-orange-400">Paid</Badge>;
    case "enterprise":
      return <Badge variant="outline" className="border-purple-500/50 text-purple-400">Enterprise</Badge>;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Core Infrastructure": return <Server className="w-5 h-5" />;
    case "AI & Machine Learning": return <Brain className="w-5 h-5" />;
    case "Web Application Scanning": return <Bug className="w-5 h-5" />;
    case "Dark Web Monitoring": return <Eye className="w-5 h-5" />;
    case "Email Security": return <Mail className="w-5 h-5" />;
    case "Vulnerability Intelligence": return <AlertTriangle className="w-5 h-5" />;
    case "GRC Frameworks": return <FileText className="w-5 h-5" />;
    case "Document Generation": return <FileText className="w-5 h-5" />;
    case "Notifications": return <Mail className="w-5 h-5" />;
    default: return <Package className="w-5 h-5" />;
  }
};

interface LiveIntegration {
  name: string;
  status: string;
  connected: boolean;
  hasApiKey?: boolean;
  rateLimit?: string;
  category: string;
  lastSuccessful?: number | null;
  lastError?: string | null;
}

function formatLastUpdated(timestamp: number | null | undefined): string {
  if (!timestamp) return 'Never';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function PlatformDependenciesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterLicense, setFilterLicense] = useState<string>("all");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(categories);

  const { data: liveStatus, isLoading: isLoadingStatus, isError, error, refetch: refetchStatus, dataUpdatedAt } = useQuery<{ integrations: LiveIntegration[] }>({
    queryKey: ["/api/integrations/status"],
    refetchInterval: 30000,
    retry: 2,
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredDependencies = platformDependencies.filter(dep => {
    const matchesSearch = dep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dep.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || dep.status === filterStatus;
    const matchesLicense = filterLicense === "all" || dep.licenseType === filterLicense;
    return matchesSearch && matchesStatus && matchesLicense;
  });

  const groupedDependencies = categories.map(category => ({
    category,
    dependencies: filteredDependencies.filter(d => d.category === category)
  })).filter(g => g.dependencies.length > 0);

  const stats = {
    total: platformDependencies.length,
    active: platformDependencies.filter(d => d.status === "active").length,
    configured: platformDependencies.filter(d => d.status === "configured").length,
    integrated: platformDependencies.filter(d => d.status === "integrated").length,
    notConnected: platformDependencies.filter(d => d.status === "not_connected").length,
    planned: platformDependencies.filter(d => d.status === "planned").length,
    free: platformDependencies.filter(d => d.licenseType === "free" || d.licenseType === "open_source").length,
    paid: platformDependencies.filter(d => d.licenseType === "paid" || d.licenseType === "enterprise").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
              Platform Dependencies
            </h1>
            <p className="text-muted-foreground mt-1">
              External integrations, APIs, and third-party services used by the platform
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="bg-slate-900/50 border-slate-700/50" data-testid="card-stat-total">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white" data-testid="text-stat-total">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-emerald-500/30" data-testid="card-stat-active">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400" data-testid="text-stat-active">{stats.active}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-cyan-500/30" data-testid="card-stat-configured">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-cyan-400" data-testid="text-stat-configured">{stats.configured}</div>
              <div className="text-xs text-muted-foreground">Configured</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-green-500/30" data-testid="card-stat-integrated">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400" data-testid="text-stat-integrated">{stats.integrated}</div>
              <div className="text-xs text-muted-foreground">Integrated</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-orange-500/30" data-testid="card-stat-not-connected">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-400" data-testid="text-stat-not-connected">{stats.notConnected}</div>
              <div className="text-xs text-muted-foreground">Not Connected</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-blue-500/30" data-testid="card-stat-planned">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400" data-testid="text-stat-planned">{stats.planned}</div>
              <div className="text-xs text-muted-foreground">Planned</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-purple-500/30" data-testid="card-stat-free">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-400" data-testid="text-stat-free">{stats.free}</div>
              <div className="text-xs text-muted-foreground">Free/OSS</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-emerald-900/30 to-cyan-900/30 border-emerald-500/30" data-testid="card-live-status">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-emerald-300" data-testid="text-live-status-title">
                <Wifi className="w-5 h-5" />
                Live Connection Status
              </CardTitle>
              <div className="flex items-center gap-3">
                {dataUpdatedAt > 0 && (
                  <span className="text-xs text-muted-foreground" data-testid="text-last-updated">
                    Updated: {formatLastUpdated(dataUpdatedAt)}
                  </span>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => refetchStatus()}
                  className="text-emerald-400 hover:text-emerald-300"
                  data-testid="button-refresh-status"
                >
                  <RefreshCcw className="w-4 h-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>
            <CardDescription>Real-time status of connected integrations</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStatus ? (
              <div className="flex gap-4">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-16 flex-1 bg-slate-700/50" />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center text-red-400 py-4" data-testid="error-live-status">
                <WifiOff className="w-8 h-8 mx-auto mb-2 opacity-70" />
                <p className="font-medium">Failed to fetch integration status</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {error instanceof Error ? error.message : 'Unknown error occurred'}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetchStatus()}
                  className="mt-3"
                  data-testid="button-retry-status"
                >
                  <RefreshCcw className="w-4 h-4 mr-1" />
                  Retry
                </Button>
              </div>
            ) : liveStatus?.integrations ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {liveStatus.integrations.map(integration => (
                  <div 
                    key={integration.name}
                    className={`p-3 rounded-lg border ${
                      integration.connected 
                        ? 'bg-emerald-900/20 border-emerald-500/30' 
                        : 'bg-red-900/20 border-red-500/30'
                    }`}
                    data-testid={`live-integration-${integration.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {integration.connected ? (
                        <Wifi className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-xs font-medium text-white truncate">{integration.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={integration.connected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}
                      >
                        {integration.connected ? 'Connected' : 'Offline'}
                      </Badge>
                      {integration.lastError && !integration.connected && (
                        <span className="text-[10px] text-red-400" title={integration.lastError}>!</span>
                      )}
                    </div>
                    {integration.rateLimit && (
                      <p className="text-[10px] text-muted-foreground mt-1">{integration.rateLimit}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                <WifiOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Unable to fetch integration status</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetchStatus()}
                  className="mt-3"
                  data-testid="button-retry-empty-status"
                >
                  <RefreshCcw className="w-4 h-4 mr-1" />
                  Retry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search dependencies..." 
                  className="pl-10 bg-slate-800/50 border-slate-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-dependencies"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[160px] bg-slate-800/50 border-slate-600" data-testid="select-filter-status">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="configured">Configured</SelectItem>
                    <SelectItem value="integrated">Integrated</SelectItem>
                    <SelectItem value="not_connected">Not Connected</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="simulated">Simulated</SelectItem>
                    <SelectItem value="not_integrated">Not Integrated</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterLicense} onValueChange={setFilterLicense}>
                  <SelectTrigger className="w-[150px] bg-slate-800/50 border-slate-600" data-testid="select-filter-license">
                    <SelectValue placeholder="All Licenses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Licenses</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="open_source">Open Source</SelectItem>
                    <SelectItem value="freemium">Freemium</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {groupedDependencies.map(group => (
              <Collapsible 
                key={group.category}
                open={expandedCategories.includes(group.category)}
                onOpenChange={() => toggleCategory(group.category)}
              >
                <CollapsibleTrigger className="w-full" data-testid={`trigger-category-${group.category.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover-elevate cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                        {getCategoryIcon(group.category)}
                      </div>
                      <span className="font-semibold text-white" data-testid={`text-category-${group.category.toLowerCase().replace(/\s+/g, '-')}`}>{group.category}</span>
                      <Badge variant="outline" className="border-slate-600" data-testid={`badge-count-${group.category.toLowerCase().replace(/\s+/g, '-')}`}>{group.dependencies.length}</Badge>
                    </div>
                    {expandedCategories.includes(group.category) ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                  {group.dependencies.map(dep => (
                    <Card key={dep.name} className="bg-slate-800/20 border-slate-700/30" data-testid={`card-dependency-${dep.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-white" data-testid={`text-dep-name-${dep.name.toLowerCase().replace(/\s+/g, '-')}`}>{dep.name}</h3>
                              {getStatusBadge(dep.status)}
                              {getLicenseBadge(dep.licenseType)}
                              {dep.apiRequired && (
                                <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                                  <Zap className="w-3 h-3 mr-1" />API Key Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{dep.description}</p>
                            {dep.pricing && (
                              <p className="text-sm">
                                <span className="text-muted-foreground">Pricing:</span>{" "}
                                <span className="text-blue-300">{dep.pricing}</span>
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {dep.features.slice(0, 4).map(feature => (
                                <Badge key={feature} variant="secondary" className="bg-slate-700/50 text-xs">
                                  {feature}
                                </Badge>
                              ))}
                              {dep.features.length > 4 && (
                                <Badge variant="secondary" className="bg-slate-700/50 text-xs">
                                  +{dep.features.length - 4} more
                                </Badge>
                              )}
                            </div>
                            {dep.notes && (
                              <p className="text-xs text-amber-400/80 mt-2">
                                <AlertTriangle className="w-3 h-3 inline mr-1" />
                                {dep.notes}
                              </p>
                            )}
                            {dep.alternatives && dep.alternatives.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                <span className="text-slate-400">Alternatives:</span> {dep.alternatives.join(", ")}
                              </p>
                            )}
                            {dep.setupGuide && (
                              <div className="mt-3 p-2 bg-slate-900/50 rounded border border-slate-700/50" data-testid={`guide-${dep.name.toLowerCase().replace(/\s+/g, '-')}`}>
                                <p className="text-xs font-medium text-cyan-400 mb-1">Setup Guide:</p>
                                <p className="text-xs text-slate-300 whitespace-pre-line">{dep.setupGuide}</p>
                              </div>
                            )}
                            {dep.envVars && dep.envVars.length > 0 && (
                              <div className="mt-2" data-testid={`envvars-${dep.name.toLowerCase().replace(/\s+/g, '-')}`}>
                                <p className="text-xs text-muted-foreground mb-1">Environment Variables:</p>
                                <div className="flex flex-wrap gap-1">
                                  {dep.envVars.map(envVar => (
                                    <code key={envVar} className="text-xs px-1.5 py-0.5 bg-slate-800 text-cyan-300 rounded">
                                      {envVar}
                                    </code>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          {dep.website && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="shrink-0"
                              onClick={() => window.open(dep.website, "_blank")}
                              data-testid={`button-visit-${dep.name.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Visit
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/30" data-testid="card-recommendations">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-300" data-testid="text-recommendations-title">
              <Shield className="w-5 h-5" />
              Integration Recommendations
            </CardTitle>
            <CardDescription>Recommended integrations for production deployment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/30 rounded-lg space-y-2" data-testid="card-rec-webapp-scanning">
                <h4 className="font-semibold text-white flex items-center gap-2" data-testid="text-rec-webapp-title">
                  <Bug className="w-4 h-4 text-red-400" />
                  Web Application Scanning
                </h4>
                <p className="text-sm text-muted-foreground">
                  For production-grade web app scanning, we recommend:
                </p>
                <ul className="text-sm space-y-1 ml-4 list-disc text-slate-300" data-testid="list-rec-webapp">
                  <li><strong>OWASP ZAP</strong> (Free) - Best open-source option with active community</li>
                  <li><strong>Nuclei</strong> (Free) - Fast, template-based with 7000+ CVE templates</li>
                  <li><strong>Acunetix</strong> (Paid) - Enterprise-grade with advanced detection</li>
                </ul>
              </div>
              <div className="p-4 bg-slate-800/30 rounded-lg space-y-2" data-testid="card-rec-darkweb">
                <h4 className="font-semibold text-white flex items-center gap-2" data-testid="text-rec-darkweb-title">
                  <Eye className="w-4 h-4 text-purple-400" />
                  Dark Web Monitoring
                </h4>
                <p className="text-sm text-muted-foreground">
                  For comprehensive dark web intelligence:
                </p>
                <ul className="text-sm space-y-1 ml-4 list-disc text-slate-300" data-testid="list-rec-darkweb">
                  <li><strong>HIBP API</strong> ($3.50/mo) - Essential breach database lookup</li>
                  <li><strong>SpyCloud</strong> (Enterprise) - Comprehensive stolen credential monitoring</li>
                  <li><strong>Flare</strong> (Enterprise) - Full threat exposure management</li>
                </ul>
              </div>
            </div>
            <div className="p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg" data-testid="card-implementation-note">
              <h4 className="font-semibold text-amber-300 flex items-center gap-2" data-testid="text-implementation-note-title">
                <AlertTriangle className="w-4 h-4" />
                Current Implementation Note
              </h4>
              <p className="text-sm text-slate-300 mt-2" data-testid="text-implementation-note">
                The Web App Scanner and Dark Web Monitor modules currently use <strong>simulated scanning engines</strong> for demonstration purposes. 
                To enable production-grade scanning, integrate with the recommended services above and configure the appropriate API keys in the platform settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
