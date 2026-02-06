import { 
  SiAmazonwebservices, SiGooglecloud, SiOkta, SiAuth0,
  SiGithub, SiGitlab, SiJira, SiSplunk, SiSlack,
  SiZendesk, SiElasticsearch, SiGoogle,
  SiSendgrid, SiMailgun
} from "react-icons/si";
import { 
  Shield, Mail, Key, Ticket, Database, Bug, Settings2, Cloud, 
  Lock, Users, GitBranch, Server, Zap, AlertTriangle, CheckCircle2,
  XCircle, Clock, Activity
} from "lucide-react";

export type IntegrationStatus = "healthy" | "degraded" | "error" | "disconnected" | "unknown";

export interface IntegrationProvider {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: any;
  iconColor: string;
  website: string;
  setupSteps: string[];
  requiredCredentials: string[];
  apiDocUrl: string;
  healthCheckEndpoint?: string;
  features: string[];
  estimatedSetupTime: string;
}

export const integrationProviders: Record<string, IntegrationProvider> = {
  "Microsoft 365": {
    id: "microsoft365",
    name: "Microsoft 365",
    category: "email",
    description: "Enterprise email and collaboration suite from Microsoft",
    icon: Cloud,
    iconColor: "#0078D4",
    website: "https://www.microsoft.com/microsoft-365",
    setupSteps: [
      "Navigate to Azure Portal and register a new application in Azure Active Directory",
      "Grant the following API permissions: Mail.Read, Mail.Send, User.Read.All",
      "Generate a client secret and note the Application (client) ID",
      "Configure redirect URIs for OAuth authentication",
      "Enter the Tenant ID, Client ID, and Client Secret in the integration settings",
      "Test the connection using the 'Verify' button",
      "Configure email notification templates and recipients"
    ],
    requiredCredentials: ["Tenant ID", "Client ID", "Client Secret"],
    apiDocUrl: "https://docs.microsoft.com/en-us/graph/api/overview",
    healthCheckEndpoint: "/api/integrations/microsoft365/health",
    features: ["Email Alerts", "Calendar Sync", "User Directory", "Teams Notifications"],
    estimatedSetupTime: "15-20 minutes"
  },
  "Google Workspace": {
    id: "google-workspace",
    name: "Google Workspace",
    category: "email",
    description: "Google's productivity and collaboration tools",
    icon: SiGoogle,
    iconColor: "#4285F4",
    website: "https://workspace.google.com",
    setupSteps: [
      "Access Google Cloud Console and create a new project",
      "Enable Gmail API and Admin SDK API for the project",
      "Create OAuth 2.0 credentials with appropriate scopes",
      "Download the credentials JSON file",
      "Configure domain-wide delegation for service account",
      "Upload credentials and verify the domain",
      "Test email sending and receiving capabilities"
    ],
    requiredCredentials: ["Service Account JSON", "Domain", "Admin Email"],
    apiDocUrl: "https://developers.google.com/workspace",
    healthCheckEndpoint: "/api/integrations/google-workspace/health",
    features: ["Gmail Integration", "Drive Access", "User Provisioning", "Calendar Events"],
    estimatedSetupTime: "20-30 minutes"
  },
  "SendGrid": {
    id: "sendgrid",
    name: "SendGrid",
    category: "email",
    description: "Cloud-based email delivery service",
    icon: SiSendgrid,
    iconColor: "#1A82E2",
    website: "https://sendgrid.com",
    setupSteps: [
      "Sign up or log in to your SendGrid account",
      "Navigate to Settings > API Keys and create a new API key",
      "Select 'Full Access' or customize permissions for Mail Send",
      "Copy the generated API key (shown only once)",
      "Configure sender authentication with domain verification",
      "Enter the API key in the integration settings",
      "Send a test email to verify the configuration"
    ],
    requiredCredentials: ["API Key"],
    apiDocUrl: "https://docs.sendgrid.com/api-reference",
    healthCheckEndpoint: "/api/integrations/sendgrid/health",
    features: ["Transactional Email", "Email Templates", "Analytics", "Suppression Management"],
    estimatedSetupTime: "10-15 minutes"
  },
  "Mailgun": {
    id: "mailgun",
    name: "Mailgun",
    category: "email",
    description: "Email API service for developers",
    icon: SiMailgun,
    iconColor: "#F06B66",
    website: "https://www.mailgun.com",
    setupSteps: [
      "Create a Mailgun account and verify your domain",
      "Add DNS records (SPF, DKIM, MX) to your domain registrar",
      "Wait for domain verification (usually 24-48 hours)",
      "Navigate to API Keys section and copy your private API key",
      "Note your domain name and region (US or EU)",
      "Enter credentials in the integration settings",
      "Test with a sample email to the verified domain"
    ],
    requiredCredentials: ["API Key", "Domain", "Region"],
    apiDocUrl: "https://documentation.mailgun.com/",
    healthCheckEndpoint: "/api/integrations/mailgun/health",
    features: ["Email Delivery", "Tracking", "Templates", "Webhooks"],
    estimatedSetupTime: "15-20 minutes"
  },
  "Amazon SES": {
    id: "amazon-ses",
    name: "Amazon SES",
    category: "email",
    description: "AWS Simple Email Service",
    icon: SiAmazonwebservices,
    iconColor: "#FF9900",
    website: "https://aws.amazon.com/ses/",
    setupSteps: [
      "Log in to AWS Console and navigate to SES service",
      "Verify your sending domain or email address",
      "Create SMTP credentials or use AWS SDK credentials",
      "Configure IAM permissions for SES actions",
      "Move out of sandbox mode by requesting production access",
      "Note the SMTP endpoint for your region",
      "Enter credentials and test the connection"
    ],
    requiredCredentials: ["Access Key ID", "Secret Access Key", "Region"],
    apiDocUrl: "https://docs.aws.amazon.com/ses/",
    healthCheckEndpoint: "/api/integrations/amazon-ses/health",
    features: ["Bulk Email", "Deliverability Dashboard", "Dedicated IPs", "Email Templates"],
    estimatedSetupTime: "20-30 minutes"
  },
  "SMTP": {
    id: "smtp",
    name: "Custom SMTP",
    category: "email",
    description: "Generic SMTP server integration",
    icon: Mail,
    iconColor: "#6366F1",
    website: "",
    setupSteps: [
      "Obtain SMTP server hostname and port from your email provider",
      "Get authentication credentials (username and password)",
      "Determine if TLS/SSL is required (recommended)",
      "Configure sender email address and display name",
      "Enter all settings in the integration form",
      "Send a test email to verify configuration",
      "Configure any required firewall rules for outbound SMTP"
    ],
    requiredCredentials: ["SMTP Host", "Port", "Username", "Password"],
    apiDocUrl: "",
    healthCheckEndpoint: "/api/integrations/smtp/health",
    features: ["Basic Email", "Custom Headers", "TLS Support"],
    estimatedSetupTime: "5-10 minutes"
  },
  "Okta": {
    id: "okta",
    name: "Okta",
    category: "identity",
    description: "Enterprise identity and access management",
    icon: SiOkta,
    iconColor: "#007DC1",
    website: "https://www.okta.com",
    setupSteps: [
      "Log in to Okta Admin Console",
      "Navigate to Applications > Applications > Create App Integration",
      "Select OIDC - OpenID Connect and Web Application",
      "Configure redirect URIs for your GRC platform",
      "Note the Client ID and generate a Client Secret",
      "Configure group assignments and attribute mappings",
      "Set up SCIM provisioning for automatic user sync",
      "Enter credentials in integration settings and test SSO"
    ],
    requiredCredentials: ["Okta Domain", "Client ID", "Client Secret", "API Token"],
    apiDocUrl: "https://developer.okta.com/docs/reference/",
    healthCheckEndpoint: "/api/integrations/okta/health",
    features: ["SSO", "MFA", "User Provisioning", "Group Sync", "Lifecycle Management"],
    estimatedSetupTime: "25-35 minutes"
  },
  "Azure AD": {
    id: "azure-ad",
    name: "Azure Active Directory",
    category: "identity",
    description: "Microsoft cloud identity service",
    icon: Cloud,
    iconColor: "#0078D4",
    website: "https://azure.microsoft.com/en-us/services/active-directory/",
    setupSteps: [
      "Access Azure Portal and navigate to Azure Active Directory",
      "Register a new application in App registrations",
      "Configure platform settings with redirect URIs",
      "Create a client secret under Certificates & Secrets",
      "Grant API permissions: User.Read, Directory.Read.All",
      "Configure token claims and optional claims",
      "Set up enterprise application for SSO",
      "Test authentication flow and user sync"
    ],
    requiredCredentials: ["Tenant ID", "Client ID", "Client Secret"],
    apiDocUrl: "https://docs.microsoft.com/en-us/azure/active-directory/",
    healthCheckEndpoint: "/api/integrations/azure-ad/health",
    features: ["SSO", "Conditional Access", "B2B Collaboration", "Directory Sync"],
    estimatedSetupTime: "20-30 minutes"
  },
  "Auth0": {
    id: "auth0",
    name: "Auth0",
    category: "identity",
    description: "Flexible identity platform",
    icon: SiAuth0,
    iconColor: "#EB5424",
    website: "https://auth0.com",
    setupSteps: [
      "Create an Auth0 account and tenant",
      "Create a new Application of type 'Regular Web Application'",
      "Configure Application URIs (Callback, Logout, Web Origins)",
      "Note the Domain, Client ID, and Client Secret",
      "Enable the connections you want to use (Database, Social, Enterprise)",
      "Configure Rules or Actions for custom logic",
      "Set up RBAC and permissions",
      "Test login flow from the integration settings"
    ],
    requiredCredentials: ["Domain", "Client ID", "Client Secret", "Audience"],
    apiDocUrl: "https://auth0.com/docs/api",
    healthCheckEndpoint: "/api/integrations/auth0/health",
    features: ["Universal Login", "Social Connections", "MFA", "User Management"],
    estimatedSetupTime: "15-25 minutes"
  },
  "Ping Identity": {
    id: "ping-identity",
    name: "Ping Identity",
    category: "identity",
    description: "Enterprise identity security platform",
    icon: Key,
    iconColor: "#B30838",
    website: "https://www.pingidentity.com",
    setupSteps: [
      "Access PingOne Admin Console",
      "Create a new application for GRC platform",
      "Configure OIDC settings and scopes",
      "Set up attribute mapping for user claims",
      "Generate client credentials",
      "Configure authentication policies",
      "Enable MFA requirements if needed",
      "Test SSO integration end-to-end"
    ],
    requiredCredentials: ["Environment ID", "Client ID", "Client Secret"],
    apiDocUrl: "https://docs.pingidentity.com/",
    healthCheckEndpoint: "/api/integrations/ping-identity/health",
    features: ["SSO", "Adaptive MFA", "Risk Assessment", "User Federation"],
    estimatedSetupTime: "25-40 minutes"
  },
  "OneLogin": {
    id: "onelogin",
    name: "OneLogin",
    category: "identity",
    description: "Cloud-based identity and access management",
    icon: Lock,
    iconColor: "#0070C0",
    website: "https://www.onelogin.com",
    setupSteps: [
      "Log in to OneLogin Administration Portal",
      "Navigate to Applications and add a new app",
      "Select OIDC as the authentication method",
      "Configure redirect URIs and login URL",
      "Set up API credentials with appropriate permissions",
      "Map user attributes to claims",
      "Assign users and groups to the application",
      "Test the SSO flow"
    ],
    requiredCredentials: ["Subdomain", "Client ID", "Client Secret"],
    apiDocUrl: "https://developers.onelogin.com/",
    healthCheckEndpoint: "/api/integrations/onelogin/health",
    features: ["SSO", "Directory Integration", "Smart Factor Authentication"],
    estimatedSetupTime: "20-30 minutes"
  },
  "JumpCloud": {
    id: "jumpcloud",
    name: "JumpCloud",
    category: "identity",
    description: "Open directory platform for IT",
    icon: Cloud,
    iconColor: "#0E7FB0",
    website: "https://jumpcloud.com",
    setupSteps: [
      "Access JumpCloud Admin Portal",
      "Navigate to SSO and create a new application",
      "Select OIDC protocol and configure settings",
      "Set callback URL and logout URL",
      "Copy the Client ID and create a Client Secret",
      "Configure user groups for access",
      "Set up attribute mapping",
      "Activate the application and test"
    ],
    requiredCredentials: ["Organization ID", "Client ID", "Client Secret", "API Key"],
    apiDocUrl: "https://docs.jumpcloud.com/",
    healthCheckEndpoint: "/api/integrations/jumpcloud/health",
    features: ["SSO", "LDAP", "RADIUS", "Cloud Directory"],
    estimatedSetupTime: "20-30 minutes"
  },
  "ServiceNow": {
    id: "servicenow",
    name: "ServiceNow",
    category: "itsm",
    description: "Enterprise IT service management",
    icon: Server,
    iconColor: "#62D84E",
    website: "https://www.servicenow.com",
    setupSteps: [
      "Access your ServiceNow instance with admin credentials",
      "Navigate to System OAuth > Application Registry",
      "Create a new OAuth API endpoint for external clients",
      "Note the Client ID and generate a Client Secret",
      "Configure OAuth scopes for required tables",
      "Create a dedicated integration user with appropriate roles",
      "Set up REST API access for incident and request management",
      "Test API connectivity with a sample query"
    ],
    requiredCredentials: ["Instance URL", "Client ID", "Client Secret", "Username", "Password"],
    apiDocUrl: "https://developer.servicenow.com/",
    healthCheckEndpoint: "/api/integrations/servicenow/health",
    features: ["Incident Management", "CMDB Sync", "Change Requests", "Workflow Automation"],
    estimatedSetupTime: "30-45 minutes"
  },
  "Jira Service Management": {
    id: "jira-sm",
    name: "Jira Service Management",
    category: "itsm",
    description: "Atlassian IT service desk solution",
    icon: SiJira,
    iconColor: "#0052CC",
    website: "https://www.atlassian.com/software/jira/service-management",
    setupSteps: [
      "Log in to Atlassian Admin and go to API tokens",
      "Create a new API token and save it securely",
      "Note your Atlassian email and cloud instance URL",
      "Configure project keys for ticket creation",
      "Set up custom fields for GRC metadata",
      "Create automation rules for ticket routing",
      "Map priority levels between systems",
      "Test ticket creation and updates"
    ],
    requiredCredentials: ["Instance URL", "Email", "API Token"],
    apiDocUrl: "https://developer.atlassian.com/cloud/jira/platform/rest/v3/",
    healthCheckEndpoint: "/api/integrations/jira-sm/health",
    features: ["Ticket Creation", "SLA Tracking", "Automation", "Asset Management"],
    estimatedSetupTime: "20-30 minutes"
  },
  "Zendesk": {
    id: "zendesk",
    name: "Zendesk",
    category: "itsm",
    description: "Customer service and engagement platform",
    icon: SiZendesk,
    iconColor: "#03363D",
    website: "https://www.zendesk.com",
    setupSteps: [
      "Access Zendesk Admin Center",
      "Navigate to Apps and Integrations > APIs > Zendesk API",
      "Enable Token Access and create an API token",
      "Note your subdomain and admin email",
      "Configure OAuth client for advanced integration",
      "Set up triggers for ticket synchronization",
      "Map ticket fields to GRC entities",
      "Test creating and updating tickets"
    ],
    requiredCredentials: ["Subdomain", "Email", "API Token"],
    apiDocUrl: "https://developer.zendesk.com/api-reference/",
    healthCheckEndpoint: "/api/integrations/zendesk/health",
    features: ["Ticket Management", "Customer Portal", "Knowledge Base", "Reporting"],
    estimatedSetupTime: "15-25 minutes"
  },
  "Freshservice": {
    id: "freshservice",
    name: "Freshservice",
    category: "itsm",
    description: "Modern IT service management",
    icon: Ticket,
    iconColor: "#14C38E",
    website: "https://freshservice.com",
    setupSteps: [
      "Log in to Freshservice admin portal",
      "Navigate to Admin > API Settings",
      "Generate a new API key",
      "Configure OAuth for enhanced security if needed",
      "Set up webhook endpoints for real-time updates",
      "Map ticket categories and priorities",
      "Configure asset synchronization",
      "Test the integration with sample tickets"
    ],
    requiredCredentials: ["Domain", "API Key"],
    apiDocUrl: "https://api.freshservice.com/",
    healthCheckEndpoint: "/api/integrations/freshservice/health",
    features: ["Ticket Management", "Asset Discovery", "CMDB", "Workflow Automation"],
    estimatedSetupTime: "15-20 minutes"
  },
  "BMC Helix": {
    id: "bmc-helix",
    name: "BMC Helix",
    category: "itsm",
    description: "Enterprise service management platform",
    icon: Server,
    iconColor: "#F26522",
    website: "https://www.bmc.com/it-solutions/bmc-helix.html",
    setupSteps: [
      "Access BMC Helix Innovation Studio",
      "Create a new application for integration",
      "Configure REST API permissions",
      "Set up process definitions for ticket flow",
      "Create service account credentials",
      "Map form fields to GRC data model",
      "Configure notifications and escalations",
      "Test end-to-end ticket creation"
    ],
    requiredCredentials: ["Server URL", "Username", "Password", "API Key"],
    apiDocUrl: "https://docs.bmc.com/docs/helixplatform/",
    healthCheckEndpoint: "/api/integrations/bmc-helix/health",
    features: ["Service Catalog", "CMDB", "Change Management", "AI Ops"],
    estimatedSetupTime: "40-60 minutes"
  },
  "ManageEngine": {
    id: "manageengine",
    name: "ManageEngine ServiceDesk Plus",
    category: "itsm",
    description: "Comprehensive help desk software",
    icon: Settings2,
    iconColor: "#E84B3C",
    website: "https://www.manageengine.com/products/service-desk/",
    setupSteps: [
      "Log in to ManageEngine Admin Console",
      "Navigate to Admin > API Settings",
      "Generate API key with required permissions",
      "Configure OAuth 2.0 if using cloud version",
      "Set up custom triggers for GRC events",
      "Map templates and categories",
      "Configure SLA policies alignment",
      "Test ticket operations"
    ],
    requiredCredentials: ["Server URL", "API Key", "Technician Key"],
    apiDocUrl: "https://www.manageengine.com/products/service-desk/help/adminguide/api/rest-api.html",
    healthCheckEndpoint: "/api/integrations/manageengine/health",
    features: ["Incident Management", "Problem Management", "CMDB", "Reporting"],
    estimatedSetupTime: "20-30 minutes"
  },
  "CrowdStrike": {
    id: "crowdstrike",
    name: "CrowdStrike Falcon",
    category: "edr",
    description: "Cloud-native endpoint protection platform",
    icon: Shield,
    iconColor: "#FF0000",
    website: "https://www.crowdstrike.com",
    setupSteps: [
      "Access CrowdStrike Falcon Console",
      "Navigate to Support > API Clients and Keys",
      "Create a new API client with required scopes (Detections, Hosts, Incidents)",
      "Note the Client ID and Client Secret",
      "Configure API client with appropriate permissions",
      "Set up notification channels for alerts",
      "Map severity levels to GRC risk ratings",
      "Test API connectivity and data retrieval"
    ],
    requiredCredentials: ["Cloud Region", "Client ID", "Client Secret"],
    apiDocUrl: "https://falcon.crowdstrike.com/documentation/",
    healthCheckEndpoint: "/api/integrations/crowdstrike/health",
    features: ["Threat Detection", "Incident Response", "Host Inventory", "Vulnerability Data"],
    estimatedSetupTime: "20-30 minutes"
  },
  "SentinelOne": {
    id: "sentinelone",
    name: "SentinelOne",
    category: "edr",
    description: "Autonomous AI-powered endpoint security",
    icon: Shield,
    iconColor: "#6B2C91",
    website: "https://www.sentinelone.com",
    setupSteps: [
      "Log in to SentinelOne Management Console",
      "Navigate to Settings > Users > Service Users",
      "Create a new service user with API access",
      "Generate an API token for the service user",
      "Assign appropriate scope permissions",
      "Configure site and account access levels",
      "Set up webhook for real-time alerts",
      "Test API calls and data synchronization"
    ],
    requiredCredentials: ["Console URL", "API Token"],
    apiDocUrl: "https://usea1-partners.sentinelone.net/api-doc/",
    healthCheckEndpoint: "/api/integrations/sentinelone/health",
    features: ["Threat Detection", "Automated Response", "Deep Visibility", "Forensics"],
    estimatedSetupTime: "15-25 minutes"
  },
  "Microsoft Defender": {
    id: "microsoft-defender",
    name: "Microsoft Defender for Endpoint",
    category: "edr",
    description: "Microsoft enterprise endpoint security",
    icon: Cloud,
    iconColor: "#0078D4",
    website: "https://www.microsoft.com/en-us/security/business/threat-protection/endpoint-defender",
    setupSteps: [
      "Access Azure Portal and register an application",
      "Grant API permissions for WindowsDefenderATP",
      "Add permissions: Machine.Read.All, Alert.Read.All, Vulnerability.Read.All",
      "Create client credentials (secret or certificate)",
      "Configure RBAC roles in Microsoft 365 Defender portal",
      "Set up alert forwarding rules",
      "Map alert severities to GRC risk levels",
      "Test connectivity and data retrieval"
    ],
    requiredCredentials: ["Tenant ID", "Client ID", "Client Secret"],
    apiDocUrl: "https://docs.microsoft.com/en-us/microsoft-365/security/defender-endpoint/",
    healthCheckEndpoint: "/api/integrations/microsoft-defender/health",
    features: ["Threat Protection", "Attack Surface Reduction", "EDR", "Vulnerability Management"],
    estimatedSetupTime: "25-35 minutes"
  },
  "Carbon Black": {
    id: "carbon-black",
    name: "VMware Carbon Black",
    category: "edr",
    description: "Next-generation endpoint protection",
    icon: Shield,
    iconColor: "#00C7B7",
    website: "https://www.carbonblack.com",
    setupSteps: [
      "Access Carbon Black Cloud Console",
      "Navigate to Settings > API Access",
      "Create a new API Key with custom access level",
      "Select required permissions for integration",
      "Note the API Key ID and API Secret Key",
      "Configure organization key settings",
      "Set up SIEM connector for event forwarding",
      "Verify integration with test queries"
    ],
    requiredCredentials: ["Console URL", "API ID", "API Secret Key", "Org Key"],
    apiDocUrl: "https://developer.carbonblack.com/",
    healthCheckEndpoint: "/api/integrations/carbon-black/health",
    features: ["Threat Hunting", "Incident Response", "Audit Logs", "Device Control"],
    estimatedSetupTime: "20-30 minutes"
  },
  "Sophos": {
    id: "sophos",
    name: "Sophos Intercept X",
    category: "edr",
    description: "AI-powered endpoint protection",
    icon: Shield,
    iconColor: "#0080FF",
    website: "https://www.sophos.com",
    setupSteps: [
      "Log in to Sophos Central Admin",
      "Navigate to Global Settings > API Credentials",
      "Add new API credentials for partner/organization",
      "Note the Client ID and Client Secret",
      "Configure data region (EU/US)",
      "Set up API polling intervals",
      "Map threat categories to risk levels",
      "Test API access and alert retrieval"
    ],
    requiredCredentials: ["Client ID", "Client Secret", "Region"],
    apiDocUrl: "https://developer.sophos.com/",
    healthCheckEndpoint: "/api/integrations/sophos/health",
    features: ["Malware Protection", "Ransomware Defense", "Exploit Prevention", "XDR"],
    estimatedSetupTime: "15-20 minutes"
  },
  "Trend Micro": {
    id: "trend-micro",
    name: "Trend Micro Vision One",
    category: "edr",
    description: "Extended detection and response platform",
    icon: Shield,
    iconColor: "#D71920",
    website: "https://www.trendmicro.com",
    setupSteps: [
      "Access Trend Micro Vision One console",
      "Navigate to Administration > API Keys",
      "Generate a new API key with required roles",
      "Configure API key expiration policy",
      "Set permissions for detection and response",
      "Note the API URL for your region",
      "Configure webhook for real-time alerts",
      "Test API connectivity"
    ],
    requiredCredentials: ["API URL", "API Key"],
    apiDocUrl: "https://automation.trendmicro.com/",
    healthCheckEndpoint: "/api/integrations/trend-micro/health",
    features: ["XDR Analytics", "Threat Intelligence", "Investigation Workbench", "Response Actions"],
    estimatedSetupTime: "15-25 minutes"
  },
  "Splunk": {
    id: "splunk",
    name: "Splunk Enterprise Security",
    category: "siem",
    description: "Security information and event management",
    icon: SiSplunk,
    iconColor: "#65A637",
    website: "https://www.splunk.com",
    setupSteps: [
      "Access Splunk Web interface with admin credentials",
      "Navigate to Settings > Tokens (or create HTTP Event Collector)",
      "Create a new token with appropriate source type",
      "Configure index and permissions for the token",
      "Note the HEC endpoint URL and token value",
      "Set up saved searches for GRC alerts",
      "Configure correlation searches for compliance events",
      "Test data ingestion and query access"
    ],
    requiredCredentials: ["Splunk URL", "HEC Token", "API Token"],
    apiDocUrl: "https://docs.splunk.com/Documentation/Splunk/latest/RESTREF/RESTprolog",
    healthCheckEndpoint: "/api/integrations/splunk/health",
    features: ["Log Analysis", "Correlation", "Dashboards", "Alerting", "SOAR Integration"],
    estimatedSetupTime: "30-45 minutes"
  },
  "Microsoft Sentinel": {
    id: "microsoft-sentinel",
    name: "Microsoft Sentinel",
    category: "siem",
    description: "Cloud-native SIEM and SOAR solution",
    icon: Cloud,
    iconColor: "#0078D4",
    website: "https://azure.microsoft.com/en-us/services/microsoft-sentinel/",
    setupSteps: [
      "Access Azure Portal and navigate to Microsoft Sentinel",
      "Register an Azure AD application for API access",
      "Assign Sentinel Responder or Contributor role",
      "Create client credentials for authentication",
      "Note workspace ID and workspace key",
      "Configure data connectors for log sources",
      "Set up analytics rules for GRC alerts",
      "Test query execution and incident retrieval"
    ],
    requiredCredentials: ["Tenant ID", "Client ID", "Client Secret", "Workspace ID"],
    apiDocUrl: "https://docs.microsoft.com/en-us/azure/sentinel/",
    healthCheckEndpoint: "/api/integrations/microsoft-sentinel/health",
    features: ["Threat Detection", "Investigation", "Hunting", "Automation"],
    estimatedSetupTime: "35-50 minutes"
  },
  "IBM QRadar": {
    id: "ibm-qradar",
    name: "IBM QRadar",
    category: "siem",
    description: "Enterprise security analytics platform",
    icon: Database,
    iconColor: "#054ADA",
    website: "https://www.ibm.com/products/qradar-siem",
    setupSteps: [
      "Access QRadar Console with admin privileges",
      "Navigate to Admin > Authorized Services",
      "Create a new authorized service for API access",
      "Assign required capabilities (Offenses, Assets, Events)",
      "Note the security token",
      "Configure reference sets for GRC data",
      "Set up custom rules for compliance alerts",
      "Test API connectivity and data queries"
    ],
    requiredCredentials: ["Console URL", "Security Token"],
    apiDocUrl: "https://www.ibm.com/docs/en/qsip/",
    healthCheckEndpoint: "/api/integrations/ibm-qradar/health",
    features: ["Offense Management", "Flow Analysis", "Vulnerability", "Risk Manager"],
    estimatedSetupTime: "40-60 minutes"
  },
  "Elastic SIEM": {
    id: "elastic-siem",
    name: "Elastic Security",
    category: "siem",
    description: "Open and unified SIEM solution",
    icon: SiElasticsearch,
    iconColor: "#FEC514",
    website: "https://www.elastic.co/security",
    setupSteps: [
      "Access Kibana with admin credentials",
      "Navigate to Management > API Keys",
      "Create an API key with appropriate privileges",
      "Configure role with indices and features access",
      "Set up detection rules for GRC events",
      "Configure alerting connectors",
      "Map alert severity to risk levels",
      "Test connectivity and queries"
    ],
    requiredCredentials: ["Elasticsearch URL", "API Key ID", "API Key Secret"],
    apiDocUrl: "https://www.elastic.co/guide/en/elasticsearch/reference/current/rest-apis.html",
    healthCheckEndpoint: "/api/integrations/elastic-siem/health",
    features: ["Detection Rules", "Timeline", "Cases", "SIEM Detections"],
    estimatedSetupTime: "25-40 minutes"
  },
  "LogRhythm": {
    id: "logrhythm",
    name: "LogRhythm NextGen SIEM",
    category: "siem",
    description: "AI-powered SIEM platform",
    icon: Database,
    iconColor: "#FF6B00",
    website: "https://logrhythm.com",
    setupSteps: [
      "Access LogRhythm Client Console",
      "Navigate to Deployment Manager > API Gateway",
      "Enable API access and create credentials",
      "Configure user with API permissions",
      "Set up Web Console API access",
      "Create custom parsing rules for GRC events",
      "Configure alarm rules for compliance",
      "Test API integration and case creation"
    ],
    requiredCredentials: ["API URL", "Username", "Password", "API Key"],
    apiDocUrl: "https://docs.logrhythm.com/",
    healthCheckEndpoint: "/api/integrations/logrhythm/health",
    features: ["UEBA", "NDR", "Case Management", "SmartResponse"],
    estimatedSetupTime: "35-50 minutes"
  },
  "Sumo Logic": {
    id: "sumo-logic",
    name: "Sumo Logic Cloud SIEM",
    category: "siem",
    description: "Cloud-native machine data analytics",
    icon: Cloud,
    iconColor: "#000099",
    website: "https://www.sumologic.com",
    setupSteps: [
      "Log in to Sumo Logic platform",
      "Navigate to Administration > Security > Access Keys",
      "Generate new access key with required permissions",
      "Note the Access ID and Access Key",
      "Configure HTTP Source for data ingestion",
      "Set up scheduled searches for compliance",
      "Create monitors for alerting",
      "Test connectivity and query execution"
    ],
    requiredCredentials: ["API Endpoint", "Access ID", "Access Key"],
    apiDocUrl: "https://api.sumologic.com/docs/",
    healthCheckEndpoint: "/api/integrations/sumo-logic/health",
    features: ["Log Analytics", "Cloud SIEM", "SOAR", "Observability"],
    estimatedSetupTime: "20-35 minutes"
  },
  "Tenable": {
    id: "tenable",
    name: "Tenable.io",
    category: "vulnerability",
    description: "Vulnerability management platform",
    icon: Bug,
    iconColor: "#00C389",
    website: "https://www.tenable.com",
    setupSteps: [
      "Access Tenable.io platform",
      "Navigate to Settings > My Account > API Keys",
      "Generate new API keys (Access Key and Secret Key)",
      "Configure scanner groups and policies",
      "Set up asset groups for targeted scanning",
      "Create scan schedules aligned with compliance",
      "Configure vulnerability export settings",
      "Test API connectivity and data sync"
    ],
    requiredCredentials: ["Access Key", "Secret Key"],
    apiDocUrl: "https://developer.tenable.com/",
    healthCheckEndpoint: "/api/integrations/tenable/health",
    features: ["Vulnerability Scanning", "Container Security", "Web App Scanning", "Cloud Security"],
    estimatedSetupTime: "20-30 minutes"
  },
  "Qualys": {
    id: "qualys",
    name: "Qualys VMDR",
    category: "vulnerability",
    description: "Vulnerability management, detection, and response",
    icon: Bug,
    iconColor: "#ED1C24",
    website: "https://www.qualys.com",
    setupSteps: [
      "Log in to Qualys platform",
      "Navigate to Users > User Management > API",
      "Enable API access for your user account",
      "Note the API URL for your platform instance",
      "Configure scanning appliances if needed",
      "Set up asset groups and scan schedules",
      "Configure report templates for compliance",
      "Test API connectivity and data retrieval"
    ],
    requiredCredentials: ["Platform URL", "Username", "Password"],
    apiDocUrl: "https://www.qualys.com/docs/qualys-api-vmpc-user-guide.pdf",
    healthCheckEndpoint: "/api/integrations/qualys/health",
    features: ["Vulnerability Management", "Patch Management", "Compliance", "Cloud Agent"],
    estimatedSetupTime: "25-40 minutes"
  },
  "Rapid7": {
    id: "rapid7",
    name: "Rapid7 InsightVM",
    category: "vulnerability",
    description: "Vulnerability risk management solution",
    icon: Bug,
    iconColor: "#FF6600",
    website: "https://www.rapid7.com",
    setupSteps: [
      "Access InsightVM Security Console",
      "Navigate to Administration > Global Settings > API",
      "Enable the Insight Platform API",
      "Generate an API key in Rapid7 Insight Platform",
      "Configure scan engines and sites",
      "Set up dynamic asset groups",
      "Create remediation reports and dashboards",
      "Test connectivity and asset synchronization"
    ],
    requiredCredentials: ["Region", "API Key"],
    apiDocUrl: "https://help.rapid7.com/insightvm/en-us/api/",
    healthCheckEndpoint: "/api/integrations/rapid7/health",
    features: ["Live Dashboards", "Container Security", "Remediation", "Risk Scoring"],
    estimatedSetupTime: "20-35 minutes"
  },
  "Nessus": {
    id: "nessus",
    name: "Nessus Professional",
    category: "vulnerability",
    description: "Industry-standard vulnerability scanner",
    icon: Bug,
    iconColor: "#00B2E2",
    website: "https://www.tenable.com/products/nessus",
    setupSteps: [
      "Access Nessus interface with admin account",
      "Navigate to Settings > API Keys",
      "Generate new API keys (Access and Secret)",
      "Configure scan policies for compliance",
      "Set up scan schedules and targets",
      "Create custom compliance audit policies",
      "Configure export formats for reports",
      "Test API access and scan initiation"
    ],
    requiredCredentials: ["Server URL", "Access Key", "Secret Key"],
    apiDocUrl: "https://docs.tenable.com/nessus/",
    healthCheckEndpoint: "/api/integrations/nessus/health",
    features: ["Vulnerability Scanning", "Configuration Audit", "Malware Detection", "Sensitive Data"],
    estimatedSetupTime: "15-25 minutes"
  },
  "OpenVAS": {
    id: "openvas",
    name: "OpenVAS/Greenbone",
    category: "vulnerability",
    description: "Open-source vulnerability scanner",
    icon: Bug,
    iconColor: "#00AA00",
    website: "https://www.openvas.org",
    setupSteps: [
      "Access Greenbone Security Manager (GSM)",
      "Navigate to Administration > Users",
      "Create an API user with scanner role",
      "Generate an authentication token",
      "Configure scan configs and port lists",
      "Set up target definitions",
      "Create scheduled scan tasks",
      "Test GMP protocol connectivity"
    ],
    requiredCredentials: ["Server URL", "Username", "Password"],
    apiDocUrl: "https://docs.greenbone.net/",
    healthCheckEndpoint: "/api/integrations/openvas/health",
    features: ["Network Scanning", "CVE Detection", "Compliance Checks", "Custom NVTs"],
    estimatedSetupTime: "20-30 minutes"
  },
  "Burp Suite": {
    id: "burp-suite",
    name: "Burp Suite Enterprise",
    category: "vulnerability",
    description: "Web vulnerability scanner",
    icon: Bug,
    iconColor: "#FF6633",
    website: "https://portswigger.net/burp/enterprise",
    setupSteps: [
      "Access Burp Suite Enterprise dashboard",
      "Navigate to Settings > API",
      "Generate an API key with required permissions",
      "Configure scan configurations for web apps",
      "Set up site tree and scope definitions",
      "Create scheduled scans for continuous monitoring",
      "Configure issue severity mappings",
      "Test API connectivity and scan initiation"
    ],
    requiredCredentials: ["Server URL", "API Key"],
    apiDocUrl: "https://portswigger.net/burp/documentation/enterprise/api-documentation",
    healthCheckEndpoint: "/api/integrations/burp-suite/health",
    features: ["Web App Scanning", "DAST", "Crawling", "Issue Reporting"],
    estimatedSetupTime: "15-25 minutes"
  },
  "AWS": {
    id: "aws",
    name: "Amazon Web Services",
    category: "cloud",
    description: "Comprehensive cloud computing platform",
    icon: SiAmazonwebservices,
    iconColor: "#FF9900",
    website: "https://aws.amazon.com",
    setupSteps: [
      "Access AWS Console with appropriate permissions",
      "Navigate to IAM and create a dedicated integration user",
      "Attach policies for required services (SecurityHub, Config, CloudTrail)",
      "Generate Access Key ID and Secret Access Key",
      "Configure cross-account access if needed",
      "Set up AWS Config rules for compliance",
      "Enable Security Hub integrations",
      "Test API connectivity and data retrieval"
    ],
    requiredCredentials: ["Access Key ID", "Secret Access Key", "Region"],
    apiDocUrl: "https://docs.aws.amazon.com/",
    healthCheckEndpoint: "/api/integrations/aws/health",
    features: ["Security Hub", "Config", "CloudTrail", "IAM Analysis", "GuardDuty"],
    estimatedSetupTime: "25-40 minutes"
  },
  "Azure": {
    id: "azure",
    name: "Microsoft Azure",
    category: "cloud",
    description: "Microsoft's cloud computing platform",
    icon: Cloud,
    iconColor: "#0078D4",
    website: "https://azure.microsoft.com",
    setupSteps: [
      "Access Azure Portal and navigate to Azure Active Directory",
      "Register a new application for GRC integration",
      "Grant API permissions for Azure Resource Manager",
      "Create client secret and note credentials",
      "Assign Reader role at subscription level",
      "Configure Azure Policy for compliance tracking",
      "Enable Defender for Cloud integration",
      "Test connectivity and resource enumeration"
    ],
    requiredCredentials: ["Tenant ID", "Client ID", "Client Secret", "Subscription ID"],
    apiDocUrl: "https://docs.microsoft.com/en-us/azure/",
    healthCheckEndpoint: "/api/integrations/azure/health",
    features: ["Security Center", "Policy", "Compliance Manager", "Sentinel"],
    estimatedSetupTime: "25-40 minutes"
  },
  "Google Cloud": {
    id: "google-cloud",
    name: "Google Cloud Platform",
    category: "cloud",
    description: "Google's suite of cloud computing services",
    icon: SiGooglecloud,
    iconColor: "#4285F4",
    website: "https://cloud.google.com",
    setupSteps: [
      "Access Google Cloud Console",
      "Create a service account with appropriate roles",
      "Download the service account JSON key file",
      "Enable required APIs (Security Command Center, Cloud Asset)",
      "Configure organization policy constraints",
      "Set up Security Command Center findings export",
      "Configure Cloud Asset Inventory exports",
      "Test connectivity and data synchronization"
    ],
    requiredCredentials: ["Project ID", "Service Account JSON"],
    apiDocUrl: "https://cloud.google.com/docs",
    healthCheckEndpoint: "/api/integrations/google-cloud/health",
    features: ["Security Command Center", "Cloud Asset Inventory", "Compliance Reports", "IAM"],
    estimatedSetupTime: "25-35 minutes"
  },
  "GitHub": {
    id: "github",
    name: "GitHub",
    category: "devops",
    description: "Code hosting and version control platform",
    icon: SiGithub,
    iconColor: "#181717",
    website: "https://github.com",
    setupSteps: [
      "Access GitHub Settings for your organization",
      "Navigate to Developer Settings > Personal Access Tokens",
      "Create a fine-grained token with repository access",
      "Select required permissions (repo, security_events)",
      "Configure webhook for real-time updates",
      "Set up Dependabot alerts integration",
      "Enable code scanning and secret scanning",
      "Test API connectivity and repository access"
    ],
    requiredCredentials: ["Personal Access Token", "Organization"],
    apiDocUrl: "https://docs.github.com/en/rest",
    healthCheckEndpoint: "/api/integrations/github/health",
    features: ["Code Scanning", "Secret Scanning", "Dependabot", "Security Advisories"],
    estimatedSetupTime: "15-25 minutes"
  },
  "GitLab": {
    id: "gitlab",
    name: "GitLab",
    category: "devops",
    description: "Complete DevOps platform",
    icon: SiGitlab,
    iconColor: "#FC6D26",
    website: "https://gitlab.com",
    setupSteps: [
      "Access GitLab with admin or owner permissions",
      "Navigate to Preferences > Access Tokens",
      "Create a personal or project access token",
      "Select required scopes (api, read_repository)",
      "Configure webhook endpoints for events",
      "Enable SAST and DAST pipelines",
      "Set up vulnerability reports export",
      "Test API connectivity"
    ],
    requiredCredentials: ["GitLab URL", "Access Token"],
    apiDocUrl: "https://docs.gitlab.com/ee/api/",
    healthCheckEndpoint: "/api/integrations/gitlab/health",
    features: ["SAST", "DAST", "Dependency Scanning", "Container Scanning"],
    estimatedSetupTime: "15-20 minutes"
  },
  "Jira": {
    id: "jira",
    name: "Jira Software",
    category: "devops",
    description: "Issue tracking and project management",
    icon: SiJira,
    iconColor: "#0052CC",
    website: "https://www.atlassian.com/software/jira",
    setupSteps: [
      "Access Atlassian account settings",
      "Navigate to Security > API tokens",
      "Create a new API token for integration",
      "Note your Atlassian email and instance URL",
      "Configure JQL filters for GRC issues",
      "Set up custom fields for compliance metadata",
      "Create automation rules for ticket updates",
      "Test API connectivity and issue creation"
    ],
    requiredCredentials: ["Instance URL", "Email", "API Token"],
    apiDocUrl: "https://developer.atlassian.com/cloud/jira/platform/rest/v3/",
    healthCheckEndpoint: "/api/integrations/jira/health",
    features: ["Issue Tracking", "Workflows", "Automation", "Reporting"],
    estimatedSetupTime: "15-20 minutes"
  },
  "Slack": {
    id: "slack",
    name: "Slack",
    category: "collaboration",
    description: "Team messaging and collaboration",
    icon: SiSlack,
    iconColor: "#4A154B",
    website: "https://slack.com",
    setupSteps: [
      "Access Slack App Directory or create custom app",
      "Navigate to api.slack.com and create a new app",
      "Configure OAuth scopes (chat:write, channels:read)",
      "Install the app to your workspace",
      "Note the Bot Token and Signing Secret",
      "Configure incoming webhooks for channels",
      "Set up event subscriptions for interactivity",
      "Test message posting and interactions"
    ],
    requiredCredentials: ["Bot Token", "Signing Secret", "Channel ID"],
    apiDocUrl: "https://api.slack.com/",
    healthCheckEndpoint: "/api/integrations/slack/health",
    features: ["Notifications", "Alerts", "Workflows", "Interactive Messages"],
    estimatedSetupTime: "15-20 minutes"
  },
  "Workday": {
    id: "workday",
    name: "Workday",
    category: "hr",
    description: "Enterprise HR and finance platform",
    icon: Users,
    iconColor: "#F5820D",
    website: "https://www.workday.com",
    setupSteps: [
      "Access Workday tenant with integration permissions",
      "Navigate to Integration System Users setup",
      "Create a dedicated integration system user",
      "Configure security group access",
      "Set up custom integration with REST API",
      "Generate API client credentials",
      "Map worker data to GRC user attributes",
      "Test connectivity and data synchronization"
    ],
    requiredCredentials: ["Tenant URL", "Client ID", "Client Secret", "Refresh Token"],
    apiDocUrl: "https://community.workday.com/sites/default/files/file-hosting/restapi/",
    healthCheckEndpoint: "/api/integrations/workday/health",
    features: ["User Sync", "Org Structure", "Role Changes", "Termination Alerts"],
    estimatedSetupTime: "40-60 minutes"
  },
  "BambooHR": {
    id: "bamboohr",
    name: "BambooHR",
    category: "hr",
    description: "HR information system for SMBs",
    icon: Users,
    iconColor: "#73C41D",
    website: "https://www.bamboohr.com",
    setupSteps: [
      "Access BambooHR with admin permissions",
      "Navigate to Settings > API Keys",
      "Generate a new API key for integration",
      "Note your BambooHR subdomain",
      "Configure field mappings for user data",
      "Set up webhooks for employee changes",
      "Map departments and locations",
      "Test API connectivity and data sync"
    ],
    requiredCredentials: ["Subdomain", "API Key"],
    apiDocUrl: "https://documentation.bamboohr.com/docs",
    healthCheckEndpoint: "/api/integrations/bamboohr/health",
    features: ["Employee Directory", "Time Off Tracking", "Onboarding", "Reporting"],
    estimatedSetupTime: "15-25 minutes"
  }
};

export const getProviderByName = (name: string): IntegrationProvider | undefined => {
  return integrationProviders[name];
};

export const getProvidersByCategory = (category: string): IntegrationProvider[] => {
  return Object.values(integrationProviders).filter(p => p.category === category);
};

export const getStatusColor = (status: IntegrationStatus): string => {
  switch (status) {
    case "healthy": return "text-green-500";
    case "degraded": return "text-yellow-500";
    case "error": return "text-red-500";
    case "disconnected": return "text-gray-500";
    default: return "text-muted-foreground";
  }
};

export const getStatusBadgeVariant = (status: IntegrationStatus): string => {
  switch (status) {
    case "healthy": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "degraded": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "error": return "bg-red-500/20 text-red-400 border-red-500/30";
    case "disconnected": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    default: return "bg-muted text-muted-foreground";
  }
};
