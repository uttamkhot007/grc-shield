import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TenantProvider } from "@/contexts/tenant-context";
import { LicenseProvider } from "@/contexts/LicenseContext";
import { TenantSwitcher } from "@/components/tenant-switcher";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/auth/login";
import Dashboard from "@/pages/dashboard";
import PoliciesPage from "@/pages/governance/policies";
import FrameworksPage from "@/pages/governance/frameworks";
import ProcessesPage from "@/pages/governance/processes";
import ProceduresPage from "@/pages/governance/procedures";
import ControlsPage from "@/pages/governance/controls";
import QuestionnaireTemplatesPage from "@/pages/governance/questionnaire-templates";
import RiskRegisterPage from "@/pages/risk/register";
import RiskAssessmentPage from "@/pages/risk/assessment";
import RiskMitigationPage from "@/pages/risk/mitigation";
import RiskCatalogPage from "@/pages/risk/catalog";
import ComplianceStatusPage from "@/pages/compliance/status";
import AuditsPage from "@/pages/audits/index";
import AuditDetailPage from "@/pages/audits/detail";
import AuditChecklistsPage from "@/pages/audits/checklists";
import VendorsPage from "@/pages/vendors/index";
import AiInsightsPage from "@/pages/ai-insights";
import EndUserPortal from "@/pages/end-user-portal";
import TenantsPage from "@/pages/admin/tenants";
import TenantSettingsPage from "@/pages/admin/tenant-settings";
import UsersPage from "@/pages/admin/users";
import LicensesPage from "@/pages/admin/licenses";
import IntegrationsPage from "@/pages/admin/integrations";
import PlatformDependenciesPage from "@/pages/admin/platform-dependencies";
import RopaPage from "@/pages/privacy/ropa";
import DataInventoryPage from "@/pages/privacy/inventory";
import DataMappingPage from "@/pages/privacy/data-mapping";
import ConsentManagementPage from "@/pages/privacy/consent";
import DSRPortalPage from "@/pages/privacy/dsr";
import DPIAPage from "@/pages/privacy/dpia";
import BreachManagementPage from "@/pages/privacy/breaches";
import RetentionPoliciesPage from "@/pages/privacy/retention";
import ReportsPage from "@/pages/reports";
import SecuritySettingsPage from "@/pages/settings/security";
import DocumentationPage from "@/pages/settings/documentation";
import MobilePortal from "@/pages/mobile/index";
import AcceptInvitePage from "@/pages/onboarding/accept-invite";
import TenantRegistrationPage from "@/pages/onboarding/register";
import TrustCenterPage from "@/pages/trust-center/index";
import ControlMonitoringPage from "@/pages/control-monitoring/index";
import EvidencePage from "@/pages/evidence/index";
import RegulatoryIntelligencePage from "@/pages/regulatory/index";
import ESGPage from "@/pages/esg/index";
import BCPPage from "@/pages/bcp/index";
import IntegrationHubPage from "@/pages/integrations/index";
import EmployeePortalPage from "@/pages/employee-portal";
import SecurityModulePage from "@/pages/security/index";
import SecurityAssessmentsPage from "@/pages/security/assessments";
import DSPMPage from "@/pages/security/dspm";
import EmailSecurityPage from "@/pages/security/email-security";
import WebAppScannerPage from "@/pages/security/webapp-scanner";
import DarkWebMonitorPage from "@/pages/security/darkweb-monitor";
import ThreatIntelPage from "@/pages/security/threat-intel";
import VulnerabilityManagementPage from "@/pages/security/vulnerabilities";
import SecurityControlsCatalogPage from "@/pages/security/controls-catalog";
import VendorPortalPage from "@/pages/vendor-portal";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/ai-insights" component={AiInsightsPage} />
      <Route path="/governance/policies" component={PoliciesPage} />
      <Route path="/governance/frameworks" component={FrameworksPage} />
      <Route path="/governance/processes" component={ProcessesPage} />
      <Route path="/governance/procedures" component={ProceduresPage} />
      <Route path="/governance/controls" component={ControlsPage} />
      <Route path="/governance/questionnaire-templates" component={QuestionnaireTemplatesPage} />
      <Route path="/risk/register" component={RiskRegisterPage} />
      <Route path="/risk/catalog" component={RiskCatalogPage} />
      <Route path="/risk/assessment" component={RiskAssessmentPage} />
      <Route path="/risk/mitigation" component={RiskMitigationPage} />
      <Route path="/compliance/status" component={ComplianceStatusPage} />
      <Route path="/compliance/evidence" component={EvidencePage} />
      <Route path="/compliance/gaps" component={ComplianceStatusPage} />
      <Route path="/privacy/ropa" component={RopaPage} />
      <Route path="/privacy/inventory" component={DataInventoryPage} />
      <Route path="/privacy/data-mapping" component={DataMappingPage} />
      <Route path="/privacy/consent" component={ConsentManagementPage} />
      <Route path="/privacy/dsr" component={DSRPortalPage} />
      <Route path="/privacy/dpia" component={DPIAPage} />
      <Route path="/privacy/breaches" component={BreachManagementPage} />
      <Route path="/privacy/retention" component={RetentionPoliciesPage} />
      <Route path="/audits" component={AuditsPage} />
      <Route path="/audits/checklists" component={AuditChecklistsPage} />
      <Route path="/audits/:id" component={AuditDetailPage} />
      <Route path="/tenant/:tenantId/audits" component={AuditsPage} />
      <Route path="/tenant/:tenantId/audits/:id" component={AuditDetailPage} />
      <Route path="/vendors" component={VendorsPage} />
      <Route path="/vendor-portal/:token" component={VendorPortalPage} />
      <Route path="/admin/tenants" component={TenantsPage} />
      <Route path="/admin/tenants/:id" component={TenantSettingsPage} />
      <Route path="/admin/users" component={UsersPage} />
      <Route path="/admin/licenses" component={LicensesPage} />
      <Route path="/admin/integrations" component={IntegrationsPage} />
      <Route path="/admin/platform-dependencies" component={PlatformDependenciesPage} />
      <Route path="/users" component={UsersPage} />
      <Route path="/frameworks" component={FrameworksPage} />
      <Route path="/reports" component={ReportsPage} />
      <Route path="/end-user" component={EndUserPortal} />
      <Route path="/employee-portal" component={EmployeePortalPage} />
      <Route path="/mobile" component={MobilePortal} />
      <Route path="/settings/security" component={SecuritySettingsPage} />
      <Route path="/settings/documentation" component={DocumentationPage} />
      <Route path="/trust-center" component={TrustCenterPage} />
      <Route path="/control-monitoring" component={ControlMonitoringPage} />
      <Route path="/evidence" component={EvidencePage} />
      <Route path="/regulatory" component={RegulatoryIntelligencePage} />
      <Route path="/esg" component={ESGPage} />
      <Route path="/bcp" component={BCPPage} />
      <Route path="/integrations" component={IntegrationHubPage} />
      <Route path="/security" component={SecurityModulePage} />
      <Route path="/security/assessments" component={SecurityAssessmentsPage} />
      <Route path="/security/vulnerabilities" component={VulnerabilityManagementPage} />
      <Route path="/security/dspm" component={DSPMPage} />
      <Route path="/security/email" component={EmailSecurityPage} />
      <Route path="/security/webapp-scanner" component={WebAppScannerPage} />
      <Route path="/security/darkweb" component={DarkWebMonitorPage} />
      <Route path="/security/threat-intel" component={ThreatIntelPage} />
      <Route path="/security/controls-catalog" component={SecurityControlsCatalogPage} />
      <Route path="/onboarding/register" component={TenantRegistrationPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const { user, logout, isLoggingOut } = useAuth();
  
  const sidebarStyle = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "3.5rem",
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <TenantProvider>
      <LicenseProvider>
        <TooltipProvider>
          <SidebarProvider style={sidebarStyle as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 min-w-0">
                <header className="flex items-center justify-between gap-4 p-3 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <div className="flex items-center gap-3">
                    <TenantSwitcher />
                    <ThemeToggle />
                    <div className="flex items-center gap-2 pl-2 border-l border-border">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImageUrl || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(user?.firstName, user?.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => logout()}
                        disabled={isLoggingOut}
                        data-testid="button-logout"
                      >
                        {isLoggingOut ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <LogOut className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </header>
                <main className="flex-1 overflow-auto">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </LicenseProvider>
    </TenantProvider>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();
  
  const isOnboardingPath = window.location.pathname.startsWith("/onboarding");
  const isOrgPath = window.location.pathname.startsWith("/org/");
  
  const isRegistrationPath = window.location.pathname === "/onboarding/register";
  
  if (isRegistrationPath) {
    return (
      <TooltipProvider>
        <TenantRegistrationPage />
        <Toaster />
      </TooltipProvider>
    );
  }
  
  if (isOnboardingPath) {
    return (
      <TooltipProvider>
        <AcceptInvitePage />
        <Toaster />
      </TooltipProvider>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
