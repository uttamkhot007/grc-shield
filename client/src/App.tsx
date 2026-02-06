import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageProvider } from "@/contexts/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TenantProvider } from "@/contexts/tenant-context";
import { LicenseProvider } from "@/contexts/LicenseContext";
import { TenantSwitcher } from "@/components/tenant-switcher";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { AlertCenter } from "@/components/AlertCenter";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/auth/login";
import Dashboard from "@/pages/dashboard";
import PoliciesPage from "@/pages/governance/policies";
import FrameworksPage from "@/pages/governance/frameworks";
import ProcessesPage from "@/pages/governance/processes";
import ProceduresPage from "@/pages/governance/procedures";
import ControlsPage from "@/pages/governance/controls";
import QuestionnaireTemplatesPage from "@/pages/governance/questionnaire-templates";
import GovernanceDashboard from "@/pages/governance/index";
import AIGovernancePage from "@/pages/governance/ai-governance";
import GovernanceOntologyPage from "@/pages/governance/ontology";
import DecisionAuthorityPage from "@/pages/governance/decisions";
import DataGovernancePage from "@/pages/governance/data-governance";
import ChangeImpactPage from "@/pages/governance/change-impact";
import PolicyNexusPage from "@/pages/governance/policy-nexus";
import RiskRegisterPage from "@/pages/risk/register";
import RiskAssessmentPage from "@/pages/risk/assessment";
import RiskMitigationPage from "@/pages/risk/mitigation";
import RiskCatalogPage from "@/pages/risk/catalog";
import RiskScenariosPage from "@/pages/risk/scenarios";
import RiskAppetitePage from "@/pages/risk/appetite";
import ExecutiveRiskDashboard from "@/pages/risk/executive-dashboard";
import RiskAggregationPage from "@/pages/risk/aggregation";
import ControlEffectivenessPage from "@/pages/risk/control-effectiveness";
import RiskSignalsPage from "@/pages/risk/signals";
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
import ProfilesPage from "@/pages/admin/profiles";
import LicensesPage from "@/pages/admin/licenses";
import IntegrationsPage from "@/pages/admin/integrations";
import CredentialVaultPage from "@/pages/admin/credential-vault";
import PlatformDependenciesPage from "@/pages/admin/platform-dependencies";
import RopaPage from "@/pages/privacy/ropa";
import DataInventoryPage from "@/pages/privacy/inventory";
import DataMappingPage from "@/pages/privacy/data-mapping";
import ConsentManagementPage from "@/pages/privacy/consent";
import DSRPortalPage from "@/pages/privacy/dsr";
import DPIAPage from "@/pages/privacy/dpia";
import BreachManagementPage from "@/pages/privacy/breaches";
import RetentionPoliciesPage from "@/pages/privacy/retention";
import PrivacyDashboardPage from "@/pages/privacy/dashboard";
import AiPrivacyGovernancePage from "@/pages/privacy/ai-governance";
import PurposeGovernancePage from "@/pages/privacy/purpose-governance";
import CrossBorderTransfersPage from "@/pages/privacy/cross-border";
import PrivacySignalsPage from "@/pages/privacy/signals";
import DataDiscoveryPage from "@/pages/privacy/discovery";
import PrivacyWizardPage from "@/pages/privacy/wizard";
import ReportsPage from "@/pages/reports";
import AlertsPage from "@/pages/alerts";
import CustomDashboardPage from "@/pages/custom-dashboard";
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
import CarbonEmissionsPage from "@/pages/esg/carbon";
import EnergyResourcesPage from "@/pages/esg/energy";
import WaterWastePage from "@/pages/esg/water-waste";
import DiversityInclusionPage from "@/pages/esg/diversity";
import HealthSafetyPage from "@/pages/esg/health-safety";
import BoardEthicsPage from "@/pages/esg/governance";
import ESGFrameworksPage from "@/pages/esg/frameworks";
import MaterialityPage from "@/pages/esg/materiality";
import DisclosuresPage from "@/pages/esg/disclosures";
import TargetsPage from "@/pages/esg/targets";
import SupplyChainPage from "@/pages/esg/supply-chain";
import RatingsPage from "@/pages/esg/ratings";
import BCPPage from "@/pages/bcp/index";
import BCMPage from "@/pages/bcm/index";
import IntegrationHubPage from "@/pages/integrations/index";
import EmployeePortalPage from "@/pages/employee-portal";
import MobileAppPage from "@/pages/mobile-app";
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
      <Route path="/governance" component={GovernanceDashboard} />
      <Route path="/admin/governance/analytics">{() => <Redirect to="/governance" />}</Route>
      <Route path="/governance/policies" component={PoliciesPage} />
      <Route path="/governance/frameworks">{() => <Redirect to="/governance/policy-nexus?tab=frameworks" />}</Route>
      <Route path="/governance/processes" component={ProcessesPage} />
      <Route path="/governance/procedures" component={ProceduresPage} />
      <Route path="/governance/controls">{() => <Redirect to="/governance/policy-nexus?tab=controls" />}</Route>
      <Route path="/governance/questionnaire-templates" component={QuestionnaireTemplatesPage} />
      <Route path="/governance/ai-governance" component={AIGovernancePage} />
      <Route path="/governance/ontology" component={GovernanceOntologyPage} />
      <Route path="/governance/decisions" component={DecisionAuthorityPage} />
      <Route path="/governance/data" component={DataGovernancePage} />
      <Route path="/governance/change-impact" component={ChangeImpactPage} />
      <Route path="/governance/policy-nexus" component={PolicyNexusPage} />
      <Route path="/risk/register" component={RiskRegisterPage} />
      <Route path="/risk/catalog" component={RiskCatalogPage} />
      <Route path="/risk/assessment" component={RiskAssessmentPage} />
      <Route path="/risk/mitigation" component={RiskMitigationPage} />
      <Route path="/risk/scenarios" component={RiskScenariosPage} />
      <Route path="/risk/appetite" component={RiskAppetitePage} />
      <Route path="/risk/executive" component={ExecutiveRiskDashboard} />
      <Route path="/risk/aggregation" component={RiskAggregationPage} />
      <Route path="/risk/control-effectiveness" component={ControlEffectivenessPage} />
      <Route path="/risk/signals" component={RiskSignalsPage} />
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
      <Route path="/privacy/dashboard" component={PrivacyDashboardPage} />
      <Route path="/privacy/ai-governance" component={AiPrivacyGovernancePage} />
      <Route path="/privacy/purpose-governance" component={PurposeGovernancePage} />
      <Route path="/privacy/cross-border" component={CrossBorderTransfersPage} />
      <Route path="/privacy/signals" component={PrivacySignalsPage} />
      <Route path="/privacy/discovery" component={DataDiscoveryPage} />
      <Route path="/privacy/wizard" component={PrivacyWizardPage} />
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
      <Route path="/admin/profiles" component={ProfilesPage} />
      <Route path="/admin/licenses" component={LicensesPage} />
      <Route path="/admin/integrations" component={IntegrationsPage} />
      <Route path="/admin/credential-vault" component={CredentialVaultPage} />
      <Route path="/admin/platform-dependencies" component={PlatformDependenciesPage} />
      <Route path="/admin/governance" component={GovernanceDashboard} />
      <Route path="/admin/governance/policies" component={PoliciesPage} />
      <Route path="/admin/governance/frameworks" component={FrameworksPage} />
      <Route path="/admin/governance/processes" component={ProcessesPage} />
      <Route path="/admin/governance/procedures" component={ProceduresPage} />
      <Route path="/admin/governance/controls" component={ControlsPage} />
      <Route path="/admin/governance/policy-nexus" component={PolicyNexusPage} />
      <Route path="/users" component={UsersPage} />
      <Route path="/frameworks" component={FrameworksPage} />
      <Route path="/reports" component={ReportsPage} />
      <Route path="/alerts" component={AlertsPage} />
      <Route path="/my-dashboard" component={CustomDashboardPage} />
      <Route path="/end-user" component={EndUserPortal} />
      <Route path="/employee-portal" component={EmployeePortalPage} />
      <Route path="/mobile" component={MobilePortal} />
      <Route path="/app" component={MobileAppPage} />
      <Route path="/settings/security" component={SecuritySettingsPage} />
      <Route path="/settings/documentation" component={DocumentationPage} />
      <Route path="/trust-center" component={TrustCenterPage} />
      <Route path="/control-monitoring" component={ControlMonitoringPage} />
      <Route path="/evidence" component={EvidencePage} />
      <Route path="/regulatory" component={RegulatoryIntelligencePage} />
      <Route path="/esg" component={ESGPage} />
      <Route path="/esg/carbon" component={CarbonEmissionsPage} />
      <Route path="/esg/energy" component={EnergyResourcesPage} />
      <Route path="/esg/water-waste" component={WaterWastePage} />
      <Route path="/esg/diversity" component={DiversityInclusionPage} />
      <Route path="/esg/health-safety" component={HealthSafetyPage} />
      <Route path="/esg/governance" component={BoardEthicsPage} />
      <Route path="/esg/frameworks" component={ESGFrameworksPage} />
      <Route path="/esg/materiality" component={MaterialityPage} />
      <Route path="/esg/disclosures" component={DisclosuresPage} />
      <Route path="/esg/targets" component={TargetsPage} />
      <Route path="/esg/supply-chain" component={SupplyChainPage} />
      <Route path="/esg/ratings" component={RatingsPage} />
      <Route path="/bcm" component={BCMPage} />
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
                  <div className="flex items-center gap-3">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <span className="text-sm text-muted-foreground hidden sm:inline" data-testid="text-welcome-user">
                      Welcome, <span className="font-medium text-foreground">{user?.firstName || user?.email?.split('@')[0] || 'User'}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <TenantSwitcher />
                    <AlertCenter showBell={true} enableRealTimePolling={true} pollingInterval={30000} />
                    <LanguageSwitcher />
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
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
