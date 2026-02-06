import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLicense, LICENSE_MODULES } from "@/contexts/LicenseContext";
import {
  LayoutDashboard,
  Shield,
  AlertTriangle,
  FileCheck,
  Lock,
  Building2,
  Users,
  FileText,
  ClipboardCheck,
  Settings,
  BarChart3,
  Layers,
  Brain,
  ChevronDown,
  LogOut,
  Sparkles,
  Key,
  Crown,
  Activity,
  Folder,
  Newspaper,
  Plug,
  Award,
  BookOpen,
  Package,
  RefreshCw,
  Leaf,
  Gauge,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useLanguage } from "@/contexts/language-context";
import { TranslationKey } from "@/lib/i18n/translations";

// Admin-only navigation items
const adminNavItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "My Dashboard",
    url: "/my-dashboard",
    icon: Gauge,
    badge: "NEW",
  },
  {
    title: "Smart Insights",
    url: "/ai-insights",
    icon: Brain,
    badge: "Smart",
  },
];

// Employee Portal - visible to all users
const employeePortalItem = {
  title: "Employee Portal",
  url: "/employee-portal",
  icon: Users,
  badge: "NEW",
};

const grcModules = [
  {
    title: "Governance",
    icon: Shield,
    items: [
      { title: "Command Center", url: "/governance" },
      { title: "Policy Nexus", url: "/governance/policy-nexus", badge: "GRC" },
      { title: "Technology Governance", url: "/governance/ai-governance", badge: "NEW" },
      { title: "Ontology", url: "/governance/ontology", badge: "NEW" },
      { title: "Decision Authority", url: "/governance/decisions", badge: "NEW" },
      { title: "Data Governance", url: "/governance/data", badge: "NEW" },
      { title: "Change Impact", url: "/governance/change-impact", badge: "Smart" },
      { title: "Questionnaires", url: "/governance/questionnaire-templates" },
    ],
  },
  {
    title: "Risk Management",
    icon: AlertTriangle,
    items: [
      { title: "Executive Dashboard", url: "/risk/executive" },
      { title: "Risk Catalog", url: "/risk/catalog" },
      { title: "Risk Register", url: "/risk/register" },
      { title: "Risk Assessment", url: "/risk/assessment" },
      { title: "Mitigation Plans", url: "/risk/mitigation" },
      { title: "Risk Scenarios", url: "/risk/scenarios" },
      { title: "Risk Appetite", url: "/risk/appetite" },
      { title: "Risk Aggregation", url: "/risk/aggregation" },
      { title: "Control Effectiveness", url: "/risk/control-effectiveness" },
      { title: "Risk Signals", url: "/risk/signals" },
      { title: "Vendor Risk", url: "/vendors" },
    ],
  },
  {
    title: "Business Continuity",
    icon: RefreshCw,
    badge: "NEW",
    items: [
      { title: "BCM Dashboard", url: "/bcm" },
      { title: "Business Impact Analysis", url: "/bcm?tab=bia" },
      { title: "Services", url: "/bcm?tab=services" },
      { title: "Dependencies", url: "/bcm?tab=dependencies" },
      { title: "Strategies", url: "/bcm?tab=strategies" },
      { title: "Plans", url: "/bcm?tab=plans" },
      { title: "Activation", url: "/bcm?tab=activation" },
      { title: "Testing", url: "/bcm?tab=testing" },
      { title: "Vendors", url: "/bcm?tab=vendors" },
      { title: "Cyber Recovery", url: "/bcm?tab=cyber" },
      { title: "People & Skills", url: "/bcm?tab=people" },
      { title: "Compliance", url: "/bcm?tab=compliance" },
      { title: "BCM Wizard", url: "/bcm?tab=wizard", badge: "Smart" },
      { title: "Legacy BCP", url: "/bcp" },
    ],
  },
  {
    title: "Compliance",
    icon: FileCheck,
    items: [
      { title: "Compliance Status", url: "/compliance/status" },
      { title: "Evidence Library", url: "/compliance/evidence" },
      { title: "Gap Analysis", url: "/compliance/gaps" },
    ],
  },
  {
    title: "Data Privacy",
    icon: Lock,
    items: [
      { title: "Privacy Wizard", url: "/privacy/wizard", badge: "AI" },
      { title: "Privacy Dashboard", url: "/privacy/dashboard", badge: "NEW" },
      { title: "ROPA Registry", url: "/privacy/ropa" },
      { title: "Data Inventory", url: "/privacy/inventory" },
      { title: "Data Mapping", url: "/privacy/data-mapping" },
      { title: "Data Discovery", url: "/privacy/discovery", badge: "NEW" },
      { title: "Consent Management", url: "/privacy/consent" },
      { title: "Purpose Governance", url: "/privacy/purpose-governance", badge: "NEW" },
      { title: "DSR Portal", url: "/privacy/dsr" },
      { title: "DPIA", url: "/privacy/dpia" },
      { title: "Breach Management", url: "/privacy/breaches" },
      { title: "Cross-Border Transfers", url: "/privacy/cross-border", badge: "NEW" },
      { title: "AI Privacy Governance", url: "/privacy/ai-governance", badge: "NEW" },
      { title: "Privacy Signals", url: "/privacy/signals", badge: "NEW" },
      { title: "Retention Policies", url: "/privacy/retention" },
      { title: "DSPM", url: "/security/dspm" },
    ],
  },
  {
    title: "Security",
    icon: Shield,
    badge: "NEW",
    items: [
      { title: "Security Dashboard", url: "/security" },
      { title: "Controls Catalog", url: "/security/controls-catalog" },
      { title: "Vulnerability Management", url: "/security/vulnerabilities" },
      { title: "Security Assessments", url: "/security/assessments", badge: "BETA" },
      { title: "Threat Intelligence", url: "/security/threat-intel" },
    ],
  },
  {
    title: "ESG",
    icon: Leaf,
    badge: "NEW",
    items: [
      { title: "ESG Dashboard", url: "/esg" },
      { title: "Carbon & Emissions", url: "/esg/carbon", badge: "ENV" },
      { title: "Energy & Resources", url: "/esg/energy" },
      { title: "Water & Waste", url: "/esg/water-waste" },
      { title: "Diversity & Inclusion", url: "/esg/diversity", badge: "SOC" },
      { title: "Health & Safety", url: "/esg/health-safety" },
      { title: "Board & Ethics", url: "/esg/governance", badge: "GOV" },
      { title: "ESG Frameworks", url: "/esg/frameworks" },
      { title: "Materiality Assessment", url: "/esg/materiality" },
      { title: "ESG Disclosures", url: "/esg/disclosures" },
      { title: "Supply Chain ESG", url: "/esg/supply-chain" },
      { title: "ESG Targets", url: "/esg/targets" },
      { title: "ESG Ratings", url: "/esg/ratings" },
    ],
  },
];

const auditItems = [
  {
    title: "Audits",
    url: "/audits",
    icon: ClipboardCheck,
  },
  {
    title: "Audit Checklists",
    url: "/audits/checklists",
    icon: FileText,
  },
];

const managementItems = [
  {
    title: "Users",
    url: "/users",
    icon: Users,
  },
  {
    title: "Frameworks Library",
    url: "/frameworks",
    icon: Layers,
  },
];

const analyticsItems = [
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
  },
  {
    title: "Control Monitoring",
    url: "/control-monitoring",
    icon: Activity,
  },
];


const settingsItems = [
  {
    title: "Documentation",
    url: "/settings/documentation",
    icon: BookOpen,
  },
  {
    title: "Security",
    url: "/settings/security",
    icon: Key,
  },
  {
    title: "Integration Hub",
    url: "/integrations",
    icon: Plug,
  },
  {
    title: "Trust Center",
    url: "/trust-center",
    icon: Award,
  },
  {
    title: "Regulatory Intel",
    url: "/regulatory",
    icon: Newspaper,
  },
];

const adminItems = [
  {
    title: "Tenants",
    url: "/admin/tenants",
    icon: Building2,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Profiles",
    url: "/admin/profiles",
    icon: Shield,
  },
  {
    title: "Licenses",
    url: "/admin/licenses",
    icon: Key,
  },
  {
    title: "Credential Vault",
    url: "/admin/credential-vault",
    icon: Lock,
  },
  {
    title: "Platform Dependencies",
    url: "/admin/platform-dependencies",
    icon: Package,
  },
];

interface AppSidebarProps {
  userRole?: "super_admin" | "tenant_admin" | "auditor" | "end_user";
}

// Map URLs to license modules for feature gating
const URL_TO_MODULE: Record<string, string> = {
  "/ai-insights": LICENSE_MODULES.AI_INSIGHTS,
  "/risk/register": LICENSE_MODULES.RISK_REGISTER,
  "/risk/assessment": LICENSE_MODULES.RISK_REGISTER,
  "/risk/mitigation": LICENSE_MODULES.RISK_REGISTER,
  "/risk/scenarios": LICENSE_MODULES.RISK_REGISTER,
  "/risk/appetite": LICENSE_MODULES.RISK_REGISTER,
  "/risk/executive": LICENSE_MODULES.RISK_REGISTER,
  "/risk/aggregation": LICENSE_MODULES.RISK_REGISTER,
  "/risk/control-effectiveness": LICENSE_MODULES.RISK_REGISTER,
  "/risk/signals": LICENSE_MODULES.RISK_REGISTER,
  "/audits": LICENSE_MODULES.AUDITS,
  "/audits/checklists": LICENSE_MODULES.AUDITS,
  "/vendors": LICENSE_MODULES.VENDORS,
  "/governance/processes": LICENSE_MODULES.PROCESSES,
  "/governance/procedures": LICENSE_MODULES.PROCESSES,
  "/governance/controls": LICENSE_MODULES.CONTROLS,
  "/admin/integrations": LICENSE_MODULES.INTEGRATIONS,
  "/privacy/ropa": LICENSE_MODULES.PRIVACY_ROPA,
  "/privacy/inventory": LICENSE_MODULES.PRIVACY_DATA_MAPPING,
  "/privacy/data-mapping": LICENSE_MODULES.PRIVACY_DATA_MAPPING,
  "/privacy/consent": LICENSE_MODULES.PRIVACY_CONSENT,
  "/privacy/dsr": LICENSE_MODULES.PRIVACY_DSR,
  "/privacy/dpia": LICENSE_MODULES.PRIVACY_DPIA,
  "/privacy/breaches": LICENSE_MODULES.PRIVACY_BREACH,
  "/privacy/retention": LICENSE_MODULES.PRIVACY_RETENTION,
  "/privacy/discovery": LICENSE_MODULES.PRIVACY_DISCOVERY,
};

const titleTranslations: Record<string, TranslationKey> = {
  "Dashboard": "nav_dashboard",
  "My Dashboard": "nav_my_dashboard",
  "Smart Insights": "nav_smart_insights",
  "Employee Portal": "nav_employee_portal",
  "Governance": "nav_governance",
  "Risk Management": "nav_risk",
  "Compliance": "nav_compliance",
  "Privacy": "nav_privacy",
  "Vendors": "vendor_management",
  "Audits": "nav_audits",
  "Security": "nav_security",
  "Settings": "nav_settings",
  "Reports": "nav_reports",
  "Command Center": "nav_command_center",
  "Policy Nexus": "nav_policy_nexus",
  "Technology Governance": "nav_technology_governance",
  "Questionnaires": "nav_questionnaires",
  "Risk Register": "nav_risk_register",
  "Risk Catalog": "nav_risk_catalog",
  "Risk Assessment": "nav_risk_assessment",
  "Risk Appetite": "nav_risk_appetite",
  "Executive Dashboard": "nav_executive_dashboard",
  "Compliance Status": "nav_compliance_status",
  "Evidence": "nav_evidence",
  "Gap Analysis": "nav_gap_analysis",
  "Privacy Dashboard": "nav_privacy_dashboard",
  "ROPA": "nav_ropa",
  "Data Inventory": "nav_data_inventory",
  "Consent Management": "nav_consent_management",
  "Vendor Registry": "nav_vendor_registry",
  "Contracts": "nav_contracts",
  "Due Diligence": "nav_due_diligence",
  "Audit Schedule": "nav_audit_schedule",
  "Findings": "nav_findings",
  "Checklists": "nav_checklists",
  "Security Dashboard": "nav_security_dashboard",
  "Vulnerabilities": "nav_vulnerabilities",
  "Threat Intelligence": "nav_threat_intel",
  "Users": "nav_users",
  "Tenants": "nav_tenants",
  "Profiles": "nav_profiles",
  "Licenses": "nav_licenses",
  "Integrations": "nav_integrations",
  "Ontology": "nav_ontology",
  "Decision Authority": "nav_decision_authority",
  "Data Governance": "nav_data_governance",
  "Change Impact": "nav_change_impact",
  "Mitigation Plans": "nav_mitigation_plans",
  "Risk Scenarios": "nav_risk_scenarios",
  "Risk Aggregation": "nav_risk_aggregation",
  "Control Effectiveness": "nav_control_effectiveness",
  "Risk Signals": "nav_risk_signals",
  "Data Subject Requests": "nav_dsr",
  "Retention": "nav_retention",
  "Discovery": "nav_discovery",
  "Privacy Wizard": "nav_privacy_wizard",
  "Assessments": "nav_assessments",
  "Email Security": "nav_email_security",
  "Web Scanner": "nav_web_scanner",
  "Dark Web Monitor": "nav_dark_web",
  "Posture Assessment": "nav_posture_assessment",
  "BCM Dashboard": "nav_bcm_dashboard",
  "BIA": "nav_bia",
  "BC Plans": "nav_bc_plans",
  "DR Plans": "nav_dr_plans",
  "Incident Activation": "nav_incident_activation",
  "Testing": "nav_testing",
  "ESG Dashboard": "nav_esg_dashboard",
  "ESG Metrics": "nav_esg_metrics",
  "ESG Reporting": "nav_esg_reporting",
  "Trust Center": "nav_trust_center",
  "Credential Vault": "nav_credential_vault",
};

export function AppSidebar({ userRole = "tenant_admin" }: AppSidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { hasModule, licenseType, isLicenseValid } = useLicense();
  const { t, direction } = useLanguage();

  const isActive = (url: string) => location === url;
  const isGroupActive = (items: { url: string }[]) =>
    items.some((item) => location === item.url);
  
  const translateTitle = (title: string): string => {
    const key = titleTranslations[title];
    return key ? t(key) : title;
  };
  
  const isModuleLocked = (url: string): boolean => {
    // If license is invalid/expired, lock all premium modules
    if (!isLicenseValid()) {
      const module = URL_TO_MODULE[url];
      if (module) return true; // Lock all mapped modules if license invalid
    }
    
    const module = URL_TO_MODULE[url];
    if (!module) return false; // No module mapping = always accessible
    return !hasModule(module);
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    return "User";
  };

  const getUserRole = () => {
    return user?.role || userRole;
  };

  // Role-based access control for sidebar sections
  const currentRole = getUserRole();
  const isAdmin = currentRole === 'super_admin' || currentRole === 'tenant_admin';
  const isAuditor = currentRole === 'auditor';
  const isEndUser = currentRole === 'end_user';
  
  // Role-based visibility rules:
  // - Super Admin/Tenant Admin: See everything
  // - Auditor: See only Auditing section  
  // - End User: See only Employee Portal
  const canSeeMainNav = isAdmin; // Dashboard, Smart Insights - admins only
  const canSeeEmployeePortal = true; // All users can see Employee Portal
  const canSeeGrcModules = isAdmin; // Only admins see GRC modules
  const canSeeAuditing = isAdmin || isAuditor; // Auditors see Auditing section
  const canSeeManagement = isAdmin; // Only admins can manage
  const canSeeSettings = isAdmin; // Only admins can access settings
  const canSeeTenantManagement = isAdmin; // Only admins can manage tenants
  const canSeeAnalytics = isAdmin; // Only admins see analytics

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center glow">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-chart-2 rounded-full flex items-center justify-center">
              <Sparkles className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg gradient-text">GRC Shield</span>
            <span className="text-xs text-muted-foreground">Enterprise Platform</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Admin-only navigation: Dashboard, Smart Insights */}
        {canSeeMainNav && (
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => {
                const locked = isModuleLocked(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      className={`gap-3 ${locked ? "opacity-60" : ""}`}
                    >
                      <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{translateTitle(item.title)}</span>
                        {item.badge && !locked && (
                          <Badge variant="secondary" className="ml-auto text-xs bg-gradient-to-r from-chart-4 to-chart-5 text-white border-0">
                            {item.badge}
                          </Badge>
                        )}
                        {locked && (
                          <Lock className="ml-auto h-3 w-3 text-amber-500" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}

        {/* Employee Portal - visible to all users */}
        {canSeeEmployeePortal && (
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(employeePortalItem.url)}
                  className="gap-3"
                >
                  <Link href={employeePortalItem.url} data-testid={`nav-${employeePortalItem.title.toLowerCase().replace(/\s+/g, "-")}`}>
                    <employeePortalItem.icon className="h-4 w-4" />
                    <span>{employeePortalItem.title}</span>
                    <Badge variant="secondary" className="ml-auto text-xs bg-gradient-to-r from-chart-4 to-chart-5 text-white border-0">
                      {employeePortalItem.badge}
                    </Badge>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}

        {canSeeGrcModules && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            GRC Modules
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {grcModules.map((module) => (
                <Collapsible
                  key={module.title}
                  defaultOpen={isGroupActive(module.items)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="gap-3">
                        <module.icon className="h-4 w-4" />
                        <span>{translateTitle(module.title)}</span>
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {module.items.map((item) => {
                          const locked = isModuleLocked(item.url);
                          return (
                            <SidebarMenuSubItem key={item.url}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive(item.url)}
                                className={locked ? "opacity-60" : ""}
                              >
                                <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                                  <span className="flex items-center justify-between w-full">
                                    <span>{translateTitle(item.title)}</span>
                                    {locked && (
                                      <Lock className="h-3 w-3 text-amber-500 ml-2" />
                                    )}
                                  </span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}

        {canSeeAuditing && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            Auditing
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {auditItems.map((item) => {
                const locked = isModuleLocked(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      className={`gap-3 ${locked ? "opacity-60" : ""}`}
                    >
                      <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{translateTitle(item.title)}</span>
                        {locked && (
                          <Lock className="ml-auto h-3 w-3 text-amber-500" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}

        {canSeeManagement && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => {
                const locked = isModuleLocked(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      className={`gap-3 ${locked ? "opacity-60" : ""}`}
                    >
                      <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{translateTitle(item.title)}</span>
                        {locked && (
                          <Lock className="ml-auto h-3 w-3 text-amber-500" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}

        {canSeeAnalytics && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="gap-3"
                  >
                    <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{translateTitle(item.title)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}

        {canSeeSettings && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            <div className="flex items-center gap-2">
              <Settings className="h-3 w-3" />
              Settings
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="gap-3"
                  >
                    <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{translateTitle(item.title)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}

        {canSeeTenantManagement && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            <div className="flex items-center gap-2">
              <Crown className="h-3 w-3 text-amber-400" />
              Tenant Management
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => {
                const locked = isModuleLocked(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      className={`gap-3 ${locked ? "opacity-60" : ""}`}
                    >
                      <Link href={item.url} data-testid={`nav-admin-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{translateTitle(item.title)}</span>
                        {locked && (
                          <Lock className="ml-auto h-3 w-3 text-amber-500" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-2 rounded-lg hover-elevate cursor-pointer">
          <Avatar className="h-9 w-9 border-2 border-primary/30">
            <AvatarImage src={user?.profileImageUrl || ""} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-chart-4 text-white text-sm">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium truncate">{getUserDisplayName()}</span>
            <span className="text-xs text-muted-foreground truncate capitalize">
              {getUserRole()?.replace("_", " ")}
            </span>
          </div>
          <LogOut className="h-4 w-4 text-muted-foreground" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
