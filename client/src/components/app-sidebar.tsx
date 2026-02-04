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

const mainNavItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "AI Insights",
    url: "/ai-insights",
    icon: Brain,
    badge: "AI",
  },
  {
    title: "Employee Portal",
    url: "/employee-portal",
    icon: Users,
    badge: "NEW",
  },
];

const grcModules = [
  {
    title: "Governance",
    icon: Shield,
    items: [
      { title: "Policies", url: "/governance/policies" },
      { title: "Frameworks", url: "/governance/frameworks" },
      { title: "Processes", url: "/governance/processes" },
      { title: "Procedures", url: "/governance/procedures" },
      { title: "Controls", url: "/governance/controls" },
      { title: "Questionnaires", url: "/governance/questionnaire-templates" },
    ],
  },
  {
    title: "Risk Management",
    icon: AlertTriangle,
    items: [
      { title: "Risk Catalog", url: "/risk/catalog" },
      { title: "Risk Register", url: "/risk/register" },
      { title: "Risk Assessment", url: "/risk/assessment" },
      { title: "Mitigation Plans", url: "/risk/mitigation" },
      { title: "Vendor Risk", url: "/vendors" },
      { title: "Business Continuity", url: "/bcp" },
    ],
  },
  {
    title: "Compliance",
    icon: FileCheck,
    items: [
      { title: "Compliance Status", url: "/compliance/status" },
      { title: "Evidence Library", url: "/compliance/evidence" },
      { title: "Gap Analysis", url: "/compliance/gaps" },
      { title: "ESG", url: "/esg" },
    ],
  },
  {
    title: "Data Privacy",
    icon: Lock,
    items: [
      { title: "ROPA Registry", url: "/privacy/ropa" },
      { title: "Data Inventory", url: "/privacy/inventory" },
      { title: "Data Mapping", url: "/privacy/data-mapping" },
      { title: "Consent Management", url: "/privacy/consent" },
      { title: "DSR Portal", url: "/privacy/dsr" },
      { title: "DPIA", url: "/privacy/dpia" },
      { title: "Breach Management", url: "/privacy/breaches" },
      { title: "Retention Policies", url: "/privacy/retention" },
      { title: "DSPM", url: "/security/dspm", badge: "NEW" },
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
    title: "Licenses",
    url: "/admin/licenses",
    icon: Key,
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

export function AppSidebar({ userRole = "tenant_admin" }: AppSidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { hasModule, licenseType, isLicenseValid } = useLicense();

  const isActive = (url: string) => location === url;
  const isGroupActive = (items: { url: string }[]) =>
    items.some((item) => location === item.url);
  
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
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
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
                        <span>{item.title}</span>
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
                        <span>{module.title}</span>
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
                                    <span>{item.title}</span>
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
                        <span>{item.title}</span>
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
                        <span>{item.title}</span>
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
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

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
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

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
                        <span>{item.title}</span>
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
