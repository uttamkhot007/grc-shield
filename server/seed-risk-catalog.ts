import { db } from "./db";
import { sql } from "drizzle-orm";
import {
  riskCatalog,
  riskRegisterTemplates,
} from "@shared/schema";

// Globally accepted Risk Register Templates
const riskRegisterTemplatesData = [
  {
    code: "TMPL-IT-001",
    name: "IT Risk Assessment",
    description: "Comprehensive IT risk assessment template with CIA scoring, threat/vulnerability analysis, and residual risk tracking. Based on ISO 27001 standard methodology for systematic IT risk identification and assessment.",
    category: "IT",
    standard: "ISO 27001 (Custom)",
    applicableOrganizations: ["All Industries", "IT Companies", "Financial Services", "Healthcare", "Manufacturing", "Government"],
    applicableRegions: ["Global", "Middle East", "Europe", "North America", "Asia Pacific"],
    applicableFrameworks: ["ISO 27001:2022", "NIST CSF", "SOC 2", "PCI DSS", "GDPR"],
    columns: [
      { id: "riskId", label: "Risk ID", type: "text", required: true },
      { id: "assetOrProcess", label: "Assets/Process", type: "text", required: true },
      { id: "category", label: "Category", type: "select", required: true, options: ["Hardware", "Software", "Network", "Data", "Process", "People"] },
      { id: "owner", label: "Owner", type: "user", required: true },
      { id: "custodian", label: "Custodian", type: "text", required: false },
      { id: "location", label: "Location", type: "text", required: false },
      { id: "confidentiality", label: "C (Confidentiality)", type: "rating", min: 1, max: 5 },
      { id: "integrity", label: "I (Integrity)", type: "rating", min: 1, max: 5 },
      { id: "availability", label: "A (Availability)", type: "rating", min: 1, max: 5 },
      { id: "ciaScore", label: "CIA Score", type: "calculated", formula: "max(C,I,A)" },
      { id: "threat", label: "Threat", type: "text", required: true },
      { id: "vulnerability", label: "Vulnerability", type: "text", required: true },
      { id: "inherentLikelihood", label: "Probability", type: "rating", min: 1, max: 5 },
      { id: "inherentImpact", label: "Impact", type: "rating", min: 1, max: 5 },
      { id: "inherentRiskScore", label: "Risk Score", type: "calculated", formula: "likelihood*impact" },
      { id: "existingControls", label: "Existing Controls", type: "multitext" },
      { id: "controlReferences", label: "Controls From ISO 27001:2022", type: "multitext" },
      { id: "residualLikelihood", label: "Residual Probability", type: "rating", min: 1, max: 5 },
      { id: "residualImpact", label: "Residual Impact", type: "rating", min: 1, max: 5 },
      { id: "residualRiskScore", label: "Residual Risk Score", type: "calculated", formula: "residualLikelihood*residualImpact" },
      { id: "recommendedActions", label: "Recommended Action", type: "textarea" },
      { id: "managementResponse", label: "Management Response", type: "textarea" },
    ],
    riskMatrix: {
      type: "5x5",
      levels: [
        { min: 1, max: 4, level: "low", color: "#22c55e" },
        { min: 5, max: 9, level: "medium", color: "#eab308" },
        { min: 10, max: 16, level: "high", color: "#f97316" },
        { min: 17, max: 25, level: "critical", color: "#ef4444" },
      ],
    },
    isGlobal: true,
    isActive: true,
  },
  {
    code: "TMPL-ISO31000",
    name: "ISO 31000 Risk Register",
    description: "Enterprise risk management template aligned with ISO 31000:2018 risk management framework",
    category: "Enterprise",
    standard: "ISO 31000",
    applicableOrganizations: ["All Industries", "Large Enterprises", "Government", "Non-Profit", "Conglomerates", "Multinational Corporations"],
    applicableRegions: ["Global", "Europe", "Asia Pacific", "North America", "Middle East", "Africa", "Latin America"],
    applicableFrameworks: ["ISO 31000:2018", "ISO 9001", "ISO 14001", "COSO ERM", "AS/NZS 4360"],
    columns: [
      { id: "riskId", label: "Risk ID", type: "text", required: true },
      { id: "riskName", label: "Risk Name", type: "text", required: true },
      { id: "riskDescription", label: "Risk Description", type: "textarea", required: true },
      { id: "riskCategory", label: "Risk Category", type: "select", options: ["Strategic", "Operational", "Financial", "Compliance", "Technology", "Reputational"] },
      { id: "riskSource", label: "Risk Source", type: "select", options: ["Internal", "External", "Both"] },
      { id: "stakeholders", label: "Stakeholders Affected", type: "multitext" },
      { id: "owner", label: "Risk Owner", type: "user", required: true },
      { id: "inherentLikelihood", label: "Likelihood (Inherent)", type: "rating", min: 1, max: 5 },
      { id: "inherentImpact", label: "Impact (Inherent)", type: "rating", min: 1, max: 5 },
      { id: "inherentRiskScore", label: "Inherent Risk Rating", type: "calculated" },
      { id: "existingControls", label: "Current Controls", type: "multitext" },
      { id: "controlEffectiveness", label: "Control Effectiveness", type: "select", options: ["Effective", "Partially Effective", "Ineffective", "Not Assessed"] },
      { id: "residualLikelihood", label: "Likelihood (Residual)", type: "rating", min: 1, max: 5 },
      { id: "residualImpact", label: "Impact (Residual)", type: "rating", min: 1, max: 5 },
      { id: "residualRiskScore", label: "Residual Risk Rating", type: "calculated" },
      { id: "treatmentPlan", label: "Risk Treatment", type: "select", options: ["Accept", "Mitigate", "Transfer", "Avoid"] },
      { id: "treatmentActions", label: "Treatment Actions", type: "textarea" },
      { id: "targetDate", label: "Target Date", type: "date" },
      { id: "status", label: "Status", type: "select", options: ["Open", "In Treatment", "Monitoring", "Closed"] },
      { id: "reviewDate", label: "Next Review Date", type: "date" },
    ],
    riskMatrix: {
      type: "5x5",
      levels: [
        { min: 1, max: 4, level: "low", color: "#22c55e" },
        { min: 5, max: 9, level: "medium", color: "#eab308" },
        { min: 10, max: 16, level: "high", color: "#f97316" },
        { min: 17, max: 25, level: "critical", color: "#ef4444" },
      ],
    },
    isGlobal: true,
    isActive: true,
  },
  {
    code: "TMPL-NIST-RMF",
    name: "NIST Risk Management Framework",
    description: "Risk register template based on NIST RMF (SP 800-37) for federal and enterprise cybersecurity",
    category: "Cybersecurity",
    standard: "NIST RMF",
    applicableOrganizations: ["Federal Agencies", "Government Contractors", "Defense Industry", "Critical Infrastructure", "Technology Companies"],
    applicableRegions: ["United States", "NATO Countries", "Australia", "Canada", "United Kingdom"],
    applicableFrameworks: ["NIST SP 800-37", "NIST SP 800-53", "NIST CSF 2.0", "FedRAMP", "FISMA", "CMMC"],
    columns: [
      { id: "riskId", label: "Risk ID", type: "text", required: true },
      { id: "informationSystem", label: "Information System", type: "text", required: true },
      { id: "securityCategory", label: "Security Category", type: "select", options: ["Low", "Moderate", "High"] },
      { id: "threatSource", label: "Threat Source", type: "select", options: ["Adversarial", "Accidental", "Structural", "Environmental"] },
      { id: "threatEvent", label: "Threat Event", type: "text", required: true },
      { id: "vulnerability", label: "Vulnerability", type: "text", required: true },
      { id: "predisposingConditions", label: "Predisposing Conditions", type: "textarea" },
      { id: "inherentLikelihood", label: "Likelihood of Initiation", type: "select", options: ["Very Low", "Low", "Moderate", "High", "Very High"] },
      { id: "inherentImpact", label: "Level of Impact", type: "select", options: ["Very Low", "Low", "Moderate", "High", "Very High"] },
      { id: "inherentRiskScore", label: "Risk Level", type: "calculated" },
      { id: "securityControls", label: "Security Controls", type: "multitext" },
      { id: "controlBaseline", label: "Control Baseline", type: "select", options: ["Low", "Moderate", "High"] },
      { id: "residualLikelihood", label: "Residual Likelihood", type: "select", options: ["Very Low", "Low", "Moderate", "High", "Very High"] },
      { id: "residualImpact", label: "Residual Impact", type: "select", options: ["Very Low", "Low", "Moderate", "High", "Very High"] },
      { id: "residualRiskScore", label: "Residual Risk", type: "calculated" },
      { id: "riskResponse", label: "Risk Response", type: "select", options: ["Accept", "Avoid", "Mitigate", "Share", "Transfer"] },
      { id: "poam", label: "POA&M Reference", type: "text" },
      { id: "authorizingOfficial", label: "Authorizing Official", type: "user" },
      { id: "status", label: "Authorization Status", type: "select", options: ["Authorized", "Denied", "Pending", "Conditional"] },
    ],
    riskMatrix: {
      type: "qualitative",
      levels: [
        { values: ["Very Low", "Low"], level: "low", color: "#22c55e" },
        { values: ["Moderate"], level: "medium", color: "#eab308" },
        { values: ["High"], level: "high", color: "#f97316" },
        { values: ["Very High"], level: "critical", color: "#ef4444" },
      ],
    },
    isGlobal: true,
    isActive: true,
  },
  {
    code: "TMPL-COSO-ERM",
    name: "COSO Enterprise Risk Management",
    description: "Enterprise-wide risk register based on COSO ERM Framework integrating strategy and performance",
    category: "Enterprise",
    standard: "COSO ERM",
    applicableOrganizations: ["Publicly Traded Companies", "Financial Services", "Large Enterprises", "SEC Registrants", "Audit Firms"],
    applicableRegions: ["Global", "North America", "Europe", "Asia Pacific"],
    applicableFrameworks: ["COSO ERM 2017", "COSO Internal Control", "SOX", "SEC Regulations", "ISO 31000"],
    columns: [
      { id: "riskId", label: "Risk ID", type: "text", required: true },
      { id: "strategicObjective", label: "Strategic Objective", type: "text", required: true },
      { id: "riskEvent", label: "Risk Event", type: "text", required: true },
      { id: "riskDescription", label: "Risk Description", type: "textarea", required: true },
      { id: "riskCategory", label: "Risk Category", type: "select", options: ["Strategy", "Operations", "Reporting", "Compliance"] },
      { id: "rootCauses", label: "Root Causes", type: "multitext" },
      { id: "owner", label: "Risk Owner", type: "user", required: true },
      { id: "inherentLikelihood", label: "Inherent Likelihood", type: "rating", min: 1, max: 5 },
      { id: "inherentImpact", label: "Inherent Impact", type: "rating", min: 1, max: 5 },
      { id: "velocity", label: "Risk Velocity", type: "select", options: ["Immediate", "Days", "Weeks", "Months", "Years"] },
      { id: "inherentRiskScore", label: "Inherent Risk Score", type: "calculated" },
      { id: "riskAppetite", label: "Risk Appetite", type: "select", options: ["Averse", "Minimal", "Cautious", "Open", "Hungry"] },
      { id: "existingControls", label: "Existing Controls", type: "multitext" },
      { id: "residualLikelihood", label: "Residual Likelihood", type: "rating", min: 1, max: 5 },
      { id: "residualImpact", label: "Residual Impact", type: "rating", min: 1, max: 5 },
      { id: "residualRiskScore", label: "Residual Risk Score", type: "calculated" },
      { id: "targetRiskLevel", label: "Target Risk Level", type: "select", options: ["Critical", "High", "Medium", "Low"] },
      { id: "treatmentStrategy", label: "Treatment Strategy", type: "select", options: ["Accept", "Avoid", "Pursue", "Reduce", "Share"] },
      { id: "actionPlan", label: "Action Plan", type: "textarea" },
      { id: "kri", label: "Key Risk Indicators", type: "multitext" },
      { id: "monitoringFrequency", label: "Monitoring Frequency", type: "select", options: ["Daily", "Weekly", "Monthly", "Quarterly", "Annually"] },
    ],
    riskMatrix: {
      type: "5x5",
      levels: [
        { min: 1, max: 4, level: "low", color: "#22c55e" },
        { min: 5, max: 9, level: "medium", color: "#eab308" },
        { min: 10, max: 16, level: "high", color: "#f97316" },
        { min: 17, max: 25, level: "critical", color: "#ef4444" },
      ],
    },
    isGlobal: true,
    isActive: true,
  },
  {
    code: "TMPL-FAIR",
    name: "FAIR Quantitative Risk Analysis",
    description: "Factor Analysis of Information Risk (FAIR) template for quantitative cyber risk assessment",
    category: "Cybersecurity",
    standard: "FAIR",
    applicableOrganizations: ["Financial Services", "Insurance Companies", "Fortune 500", "Technology Companies", "Critical Infrastructure"],
    applicableRegions: ["Global", "North America", "Europe", "Asia Pacific"],
    applicableFrameworks: ["FAIR", "NIST CSF", "ISO 27005", "CIS Controls", "COBIT"],
    columns: [
      { id: "riskId", label: "Risk ID", type: "text", required: true },
      { id: "assetAtRisk", label: "Asset at Risk", type: "text", required: true },
      { id: "assetValue", label: "Asset Value ($)", type: "currency" },
      { id: "threatCommunity", label: "Threat Community", type: "select", options: ["External Malicious", "Internal Malicious", "Internal Accidental", "Partner/Vendor", "Nation State"] },
      { id: "threatCapability", label: "Threat Capability", type: "select", options: ["Very Low", "Low", "Moderate", "High", "Very High"] },
      { id: "contactFrequency", label: "Contact Frequency (per year)", type: "number" },
      { id: "probabilityOfAction", label: "Probability of Action", type: "percentage" },
      { id: "threatEventFrequency", label: "Threat Event Frequency", type: "calculated" },
      { id: "controlStrength", label: "Control Strength", type: "select", options: ["Very Low", "Low", "Moderate", "High", "Very High"] },
      { id: "vulnerability", label: "Vulnerability", type: "percentage" },
      { id: "lossEventFrequency", label: "Loss Event Frequency", type: "calculated" },
      { id: "primaryLoss", label: "Primary Loss ($)", type: "currency" },
      { id: "secondaryLossProbability", label: "Secondary Loss Probability", type: "percentage" },
      { id: "secondaryLoss", label: "Secondary Loss ($)", type: "currency" },
      { id: "expectedLoss", label: "Expected Annual Loss ($)", type: "calculated" },
      { id: "lossExceedanceCurve", label: "Loss Exceedance Data", type: "json" },
      { id: "confidenceLevel", label: "Confidence Level", type: "percentage" },
      { id: "treatmentCost", label: "Treatment Cost ($)", type: "currency" },
      { id: "roi", label: "ROI of Treatment", type: "calculated" },
      { id: "recommendation", label: "Recommendation", type: "textarea" },
    ],
    riskMatrix: {
      type: "quantitative",
      thresholds: [
        { max: 10000, level: "low", color: "#22c55e" },
        { max: 100000, level: "medium", color: "#eab308" },
        { max: 1000000, level: "high", color: "#f97316" },
        { max: Infinity, level: "critical", color: "#ef4444" },
      ],
    },
    isGlobal: true,
    isActive: true,
  },
  {
    code: "TMPL-SIMPLE",
    name: "Simple Risk Register",
    description: "Simplified risk register for small organizations or quick assessments",
    category: "General",
    standard: "Custom",
    applicableOrganizations: ["Small Businesses", "Startups", "Non-Profit", "Educational Institutions", "Project Teams"],
    applicableRegions: ["Global", "All Regions"],
    applicableFrameworks: ["General Risk Management", "Project Management", "Quality Management"],
    columns: [
      { id: "riskId", label: "Risk ID", type: "text", required: true },
      { id: "riskName", label: "Risk Name", type: "text", required: true },
      { id: "description", label: "Description", type: "textarea" },
      { id: "category", label: "Category", type: "select", options: ["Operational", "Financial", "Strategic", "Compliance", "Technology", "People"] },
      { id: "owner", label: "Owner", type: "user" },
      { id: "inherentLikelihood", label: "Likelihood", type: "rating", min: 1, max: 5 },
      { id: "inherentImpact", label: "Impact", type: "rating", min: 1, max: 5 },
      { id: "inherentRiskScore", label: "Risk Score", type: "calculated" },
      { id: "controls", label: "Controls", type: "textarea" },
      { id: "treatmentPlan", label: "Treatment", type: "select", options: ["Accept", "Mitigate", "Transfer", "Avoid"] },
      { id: "actions", label: "Actions", type: "textarea" },
      { id: "targetDate", label: "Target Date", type: "date" },
      { id: "status", label: "Status", type: "select", options: ["Open", "In Progress", "Closed"] },
    ],
    riskMatrix: {
      type: "5x5",
      levels: [
        { min: 1, max: 4, level: "low", color: "#22c55e" },
        { min: 5, max: 9, level: "medium", color: "#eab308" },
        { min: 10, max: 16, level: "high", color: "#f97316" },
        { min: 17, max: 25, level: "critical", color: "#ef4444" },
      ],
    },
    isGlobal: true,
    isActive: true,
  },
];

// Comprehensive Risk Catalog organized by category
const riskCatalogData = [
  // ============ IT/TECHNOLOGY RISKS (80+ risks) ============
  // Cybersecurity Threats
  { code: "RC-IT-001", name: "Ransomware Attack", description: "Malicious software that encrypts data and demands payment for decryption keys", category: "IT", subcategory: "Cybersecurity", riskType: "threat", defaultLikelihood: 4, defaultImpact: 5, potentialCauses: ["Phishing emails", "Unpatched systems", "Weak access controls", "Malicious downloads"], potentialConsequences: ["Data loss", "Operational disruption", "Financial loss", "Reputational damage"], suggestedControls: ["Email filtering", "Endpoint protection", "Regular backups", "Security awareness training", "Network segmentation"], relatedFrameworks: ["ISO 27001", "NIST CSF", "CIS Controls"], keywords: ["ransomware", "malware", "encryption", "extortion"] },
  { code: "RC-IT-002", name: "Phishing Attack", description: "Social engineering attacks using fraudulent communications to steal credentials or deploy malware", category: "IT", subcategory: "Cybersecurity", riskType: "threat", defaultLikelihood: 5, defaultImpact: 4, potentialCauses: ["Lack of awareness", "Sophisticated social engineering", "Inadequate email security"], potentialConsequences: ["Credential theft", "Account compromise", "Data breach", "Financial fraud"], suggestedControls: ["Security awareness training", "Email filtering", "MFA", "Anti-phishing tools", "Reporting mechanisms"], relatedFrameworks: ["ISO 27001", "NIST CSF", "SOC 2"], keywords: ["phishing", "social engineering", "email", "credentials"] },
  { code: "RC-IT-003", name: "Distributed Denial of Service (DDoS)", description: "Overwhelming attack on network resources making services unavailable", category: "IT", subcategory: "Cybersecurity", riskType: "threat", defaultLikelihood: 3, defaultImpact: 4, potentialCauses: ["Competitor attacks", "Hacktivism", "Extortion attempts", "Botnets"], potentialConsequences: ["Service unavailability", "Revenue loss", "Customer dissatisfaction", "SLA breaches"], suggestedControls: ["DDoS protection services", "Load balancing", "Traffic analysis", "Incident response plan", "CDN usage"], relatedFrameworks: ["ISO 27001", "NIST CSF"], keywords: ["ddos", "denial of service", "availability", "network"] },
  { code: "RC-IT-004", name: "Zero-Day Vulnerability Exploitation", description: "Attack exploiting unknown software vulnerabilities before patches are available", category: "IT", subcategory: "Cybersecurity", riskType: "threat", defaultLikelihood: 2, defaultImpact: 5, potentialCauses: ["Undiscovered software flaws", "Advanced persistent threats", "Nation-state actors"], potentialConsequences: ["System compromise", "Data theft", "Persistent access", "Supply chain attacks"], suggestedControls: ["Threat intelligence", "Network segmentation", "Behavior analytics", "Defense in depth", "Rapid patching capability"], relatedFrameworks: ["NIST CSF", "ISO 27001", "MITRE ATT&CK"], keywords: ["zero-day", "vulnerability", "exploit", "APT"] },
  { code: "RC-IT-005", name: "SQL Injection Attack", description: "Injection of malicious SQL code to manipulate databases", category: "IT", subcategory: "Cybersecurity", riskType: "threat", defaultLikelihood: 3, defaultImpact: 4, potentialCauses: ["Poor input validation", "Legacy applications", "Inadequate code review"], potentialConsequences: ["Data theft", "Data manipulation", "Authentication bypass", "Database destruction"], suggestedControls: ["Input validation", "Parameterized queries", "Web application firewall", "Code review", "Penetration testing"], relatedFrameworks: ["OWASP", "ISO 27001", "PCI DSS"], keywords: ["sql injection", "database", "web security", "injection"] },
  { code: "RC-IT-006", name: "Insider Threat - Malicious", description: "Intentional harm by employees, contractors, or partners with system access", category: "IT", subcategory: "Cybersecurity", riskType: "threat", defaultLikelihood: 2, defaultImpact: 5, potentialCauses: ["Disgruntled employees", "Financial motivation", "Espionage", "Coercion"], potentialConsequences: ["Data theft", "Sabotage", "Fraud", "Intellectual property loss"], suggestedControls: ["Access controls", "User behavior analytics", "Background checks", "Separation of duties", "Exit procedures"], relatedFrameworks: ["ISO 27001", "NIST CSF", "SOC 2"], keywords: ["insider threat", "malicious insider", "employee risk"] },
  { code: "RC-IT-007", name: "Man-in-the-Middle Attack", description: "Interception of communications between two parties", category: "IT", subcategory: "Cybersecurity", riskType: "threat", defaultLikelihood: 2, defaultImpact: 4, potentialCauses: ["Weak encryption", "Unsecured networks", "Certificate vulnerabilities"], potentialConsequences: ["Data interception", "Credential theft", "Session hijacking", "Data manipulation"], suggestedControls: ["TLS/SSL encryption", "Certificate pinning", "VPN usage", "Network monitoring", "HSTS"], relatedFrameworks: ["ISO 27001", "NIST CSF", "PCI DSS"], keywords: ["mitm", "interception", "encryption", "network security"] },
  { code: "RC-IT-008", name: "Advanced Persistent Threat (APT)", description: "Sophisticated, prolonged attacks by well-resourced threat actors", category: "IT", subcategory: "Cybersecurity", riskType: "threat", defaultLikelihood: 2, defaultImpact: 5, potentialCauses: ["Nation-state actors", "Organized crime", "Corporate espionage", "Geopolitical tensions"], potentialConsequences: ["Long-term data exfiltration", "Infrastructure compromise", "Intellectual property theft", "Supply chain compromise"], suggestedControls: ["Threat intelligence", "Advanced endpoint detection", "Network segmentation", "Security operations center", "Incident response team"], relatedFrameworks: ["NIST CSF", "MITRE ATT&CK", "ISO 27001"], keywords: ["apt", "advanced threat", "nation state", "espionage"] },
  { code: "RC-IT-009", name: "Cryptojacking", description: "Unauthorized use of computing resources for cryptocurrency mining", category: "IT", subcategory: "Cybersecurity", riskType: "threat", defaultLikelihood: 3, defaultImpact: 2, potentialCauses: ["Malware infection", "Compromised websites", "Malicious browser extensions"], potentialConsequences: ["Performance degradation", "Increased energy costs", "Hardware wear", "Indicator of broader compromise"], suggestedControls: ["Endpoint protection", "Browser security", "Resource monitoring", "Ad blockers", "Script controls"], relatedFrameworks: ["ISO 27001", "CIS Controls"], keywords: ["cryptojacking", "mining", "cryptocurrency", "resource abuse"] },
  { code: "RC-IT-010", name: "Supply Chain Attack", description: "Compromise of software or hardware supply chain to attack downstream targets", category: "IT", subcategory: "Cybersecurity", riskType: "threat", defaultLikelihood: 2, defaultImpact: 5, potentialCauses: ["Vendor compromise", "Malicious updates", "Counterfeit components", "Third-party vulnerabilities"], potentialConsequences: ["Widespread compromise", "Persistent backdoors", "Data breach", "Operational disruption"], suggestedControls: ["Vendor security assessment", "Software composition analysis", "Code signing verification", "Supply chain visibility", "Zero trust architecture"], relatedFrameworks: ["NIST CSF", "ISO 27001", "SLSA"], keywords: ["supply chain", "vendor", "third party", "solarwinds"] },
  
  // Infrastructure Risks
  { code: "RC-IT-011", name: "Server Hardware Failure", description: "Physical failure of server components causing service interruption", category: "IT", subcategory: "Infrastructure", riskType: "threat", defaultLikelihood: 3, defaultImpact: 4, potentialCauses: ["Component aging", "Power surges", "Environmental factors", "Manufacturing defects"], potentialConsequences: ["Service downtime", "Data loss", "Recovery costs", "SLA breaches"], suggestedControls: ["Redundant systems", "Regular maintenance", "Monitoring", "Hot standby", "Disaster recovery"], relatedFrameworks: ["ISO 27001", "ITIL"], keywords: ["hardware failure", "server", "downtime", "infrastructure"] },
  { code: "RC-IT-012", name: "Network Outage", description: "Loss of network connectivity affecting business operations", category: "IT", subcategory: "Infrastructure", riskType: "threat", defaultLikelihood: 3, defaultImpact: 4, potentialCauses: ["ISP failure", "Equipment failure", "Cable damage", "Configuration errors", "Cyberattack"], potentialConsequences: ["Business disruption", "Communication breakdown", "Revenue loss", "Productivity impact"], suggestedControls: ["Redundant connections", "Failover systems", "Network monitoring", "SLA with providers", "Backup connectivity"], relatedFrameworks: ["ISO 27001", "ITIL"], keywords: ["network", "outage", "connectivity", "ISP"] },
  { code: "RC-IT-013", name: "Data Center Power Failure", description: "Loss of electrical power to data center facilities", category: "IT", subcategory: "Infrastructure", riskType: "threat", defaultLikelihood: 2, defaultImpact: 5, potentialCauses: ["Grid failure", "UPS failure", "Generator failure", "Electrical faults"], potentialConsequences: ["Complete outage", "Data corruption", "Hardware damage", "Extended recovery"], suggestedControls: ["UPS systems", "Backup generators", "Dual power feeds", "Power monitoring", "Regular testing"], relatedFrameworks: ["ISO 27001", "Uptime Institute"], keywords: ["power", "data center", "UPS", "electrical"] },
  { code: "RC-IT-014", name: "Cloud Service Provider Outage", description: "Unavailability of cloud services due to provider issues", category: "IT", subcategory: "Infrastructure", riskType: "threat", defaultLikelihood: 2, defaultImpact: 4, potentialCauses: ["Provider infrastructure failure", "Network issues", "Software bugs", "Capacity issues"], potentialConsequences: ["Service unavailability", "Data inaccessibility", "Customer impact", "Revenue loss"], suggestedControls: ["Multi-cloud strategy", "Data backup", "Failover procedures", "SLA monitoring", "Business continuity plan"], relatedFrameworks: ["ISO 27001", "CSA CCM"], keywords: ["cloud", "AWS", "Azure", "GCP", "outage"] },
  { code: "RC-IT-015", name: "Storage System Failure", description: "Failure of storage arrays or systems causing data unavailability", category: "IT", subcategory: "Infrastructure", riskType: "threat", defaultLikelihood: 2, defaultImpact: 4, potentialCauses: ["Disk failure", "Controller failure", "Firmware bugs", "Capacity exhaustion"], potentialConsequences: ["Data loss", "Application failure", "Business disruption", "Recovery costs"], suggestedControls: ["RAID configuration", "Regular backups", "Storage monitoring", "Redundant arrays", "Disaster recovery"], relatedFrameworks: ["ISO 27001", "ITIL"], keywords: ["storage", "disk", "SAN", "NAS", "data"] },
  { code: "RC-IT-016", name: "Database Corruption", description: "Corruption of database files leading to data integrity issues", category: "IT", subcategory: "Infrastructure", riskType: "threat", defaultLikelihood: 2, defaultImpact: 4, potentialCauses: ["Hardware failure", "Software bugs", "Power failure", "Human error"], potentialConsequences: ["Data loss", "Data integrity issues", "Application failures", "Extended recovery"], suggestedControls: ["Regular backups", "Database monitoring", "Integrity checks", "Transaction logging", "Point-in-time recovery"], relatedFrameworks: ["ISO 27001"], keywords: ["database", "corruption", "data integrity"] },
  { code: "RC-IT-017", name: "Virtualization Platform Failure", description: "Failure of hypervisor or virtualization layer affecting multiple systems", category: "IT", subcategory: "Infrastructure", riskType: "threat", defaultLikelihood: 2, defaultImpact: 4, potentialCauses: ["Software bugs", "Resource exhaustion", "Configuration errors", "Security vulnerabilities"], potentialConsequences: ["Multiple VM failures", "Service disruption", "Data loss", "Extended recovery"], suggestedControls: ["High availability clusters", "Monitoring", "Capacity planning", "Regular patching", "Backup systems"], relatedFrameworks: ["ISO 27001", "ITIL"], keywords: ["virtualization", "VMware", "Hyper-V", "hypervisor"] },
  { code: "RC-IT-018", name: "Backup System Failure", description: "Failure of backup systems leading to unrecoverable data", category: "IT", subcategory: "Infrastructure", riskType: "threat", defaultLikelihood: 2, defaultImpact: 5, potentialCauses: ["Media failure", "Software failure", "Configuration errors", "Capacity issues"], potentialConsequences: ["Unrecoverable data", "Extended downtime", "Compliance violations", "Business impact"], suggestedControls: ["Backup testing", "Multiple backup copies", "Offsite storage", "Backup monitoring", "3-2-1 backup rule"], relatedFrameworks: ["ISO 27001", "NIST CSF"], keywords: ["backup", "recovery", "data protection"] },

  // Application Risks
  { code: "RC-IT-019", name: "Application Security Vulnerability", description: "Security flaws in applications that can be exploited", category: "IT", subcategory: "Application", riskType: "vulnerability", defaultLikelihood: 4, defaultImpact: 4, potentialCauses: ["Insecure coding", "Lack of testing", "Third-party components", "Design flaws"], potentialConsequences: ["Data breach", "System compromise", "Regulatory violations", "Reputational damage"], suggestedControls: ["Secure SDLC", "Code review", "Penetration testing", "Vulnerability scanning", "WAF"], relatedFrameworks: ["OWASP", "ISO 27001", "PCI DSS"], keywords: ["application security", "vulnerability", "secure coding"] },
  { code: "RC-IT-020", name: "Legacy System Failure", description: "Failure of outdated systems that lack vendor support", category: "IT", subcategory: "Application", riskType: "threat", defaultLikelihood: 4, defaultImpact: 4, potentialCauses: ["End of support", "Component failure", "Incompatibility", "Skills shortage"], potentialConsequences: ["Service disruption", "Security vulnerabilities", "Integration issues", "High maintenance costs"], suggestedControls: ["Modernization planning", "Extended support", "Virtual patching", "Documentation", "Knowledge transfer"], relatedFrameworks: ["ISO 27001", "ITIL"], keywords: ["legacy", "outdated", "end of life", "EOL"] },
  { code: "RC-IT-021", name: "API Security Breach", description: "Unauthorized access or data exposure through insecure APIs", category: "IT", subcategory: "Application", riskType: "vulnerability", defaultLikelihood: 3, defaultImpact: 4, potentialCauses: ["Weak authentication", "Lack of rate limiting", "Excessive data exposure", "Broken authorization"], potentialConsequences: ["Data breach", "Unauthorized access", "Service abuse", "Financial loss"], suggestedControls: ["API gateway", "OAuth/JWT", "Rate limiting", "Input validation", "API security testing"], relatedFrameworks: ["OWASP API Security", "ISO 27001"], keywords: ["API", "web services", "REST", "authentication"] },
  { code: "RC-IT-022", name: "Software License Compliance Violation", description: "Non-compliance with software licensing terms and conditions", category: "IT", subcategory: "Application", riskType: "vulnerability", defaultLikelihood: 3, defaultImpact: 3, potentialCauses: ["Shadow IT", "Poor tracking", "Over-deployment", "License misunderstanding"], potentialConsequences: ["Legal action", "Financial penalties", "Audit findings", "Vendor disputes"], suggestedControls: ["License management system", "Regular audits", "Procurement controls", "Asset inventory", "Vendor management"], relatedFrameworks: ["ISO 27001", "ITIL"], keywords: ["license", "compliance", "software audit", "SAM"] },

  // Data Management Risks
  { code: "RC-IT-023", name: "Data Breach - External", description: "Unauthorized access to sensitive data by external actors", category: "IT", subcategory: "Data", riskType: "threat", defaultLikelihood: 3, defaultImpact: 5, potentialCauses: ["Cyberattack", "Stolen credentials", "System vulnerabilities", "Social engineering"], potentialConsequences: ["Financial loss", "Regulatory fines", "Reputational damage", "Legal liability", "Customer churn"], suggestedControls: ["Encryption", "Access controls", "DLP", "Monitoring", "Incident response"], relatedFrameworks: ["GDPR", "ISO 27001", "PCI DSS", "HIPAA"], keywords: ["data breach", "unauthorized access", "data theft"] },
  { code: "RC-IT-024", name: "Data Loss - Accidental", description: "Unintentional loss or destruction of data", category: "IT", subcategory: "Data", riskType: "threat", defaultLikelihood: 3, defaultImpact: 4, potentialCauses: ["Human error", "System failure", "Natural disaster", "Malware"], potentialConsequences: ["Data loss", "Business disruption", "Recovery costs", "Compliance issues"], suggestedControls: ["Regular backups", "Data classification", "User training", "Access controls", "Disaster recovery"], relatedFrameworks: ["ISO 27001", "NIST CSF"], keywords: ["data loss", "accidental deletion", "human error"] },
  { code: "RC-IT-025", name: "Data Privacy Violation", description: "Processing of personal data in violation of privacy regulations", category: "IT", subcategory: "Data", riskType: "vulnerability", defaultLikelihood: 3, defaultImpact: 4, potentialCauses: ["Inadequate consent", "Excessive collection", "Improper sharing", "Retention violations"], potentialConsequences: ["Regulatory fines", "Legal action", "Reputational damage", "Loss of trust"], suggestedControls: ["Privacy by design", "Consent management", "Data minimization", "Privacy impact assessments", "DPO appointment"], relatedFrameworks: ["GDPR", "CCPA", "PDPA", "LGPD"], keywords: ["privacy", "personal data", "GDPR", "consent"] },
  { code: "RC-IT-026", name: "Data Integrity Compromise", description: "Unauthorized or unintended modification of data", category: "IT", subcategory: "Data", riskType: "threat", defaultLikelihood: 2, defaultImpact: 4, potentialCauses: ["Cyberattack", "Software bugs", "Human error", "System failures"], potentialConsequences: ["Decision errors", "Regulatory violations", "Trust erosion", "Financial impact"], suggestedControls: ["Integrity monitoring", "Checksums", "Audit trails", "Access controls", "Change management"], relatedFrameworks: ["ISO 27001", "SOX"], keywords: ["data integrity", "modification", "tampering"] },

  // ============ OPERATIONAL RISKS (60+ risks) ============
  { code: "RC-OPS-001", name: "Business Continuity Disruption", description: "Major event disrupting normal business operations", category: "Operational", subcategory: "Continuity", riskType: "threat", defaultLikelihood: 2, defaultImpact: 5, potentialCauses: ["Natural disaster", "Pandemic", "Infrastructure failure", "Cyberattack", "Civil unrest"], potentialConsequences: ["Revenue loss", "Customer impact", "Contractual breaches", "Market share loss"], suggestedControls: ["BCP", "Disaster recovery", "Alternate sites", "Remote work capability", "Regular testing"], relatedFrameworks: ["ISO 22301", "ISO 27001"], keywords: ["business continuity", "BCP", "disaster recovery"] },
  { code: "RC-OPS-002", name: "Key Person Dependency", description: "Over-reliance on specific individuals for critical knowledge or functions", category: "Operational", subcategory: "People", riskType: "vulnerability", defaultLikelihood: 4, defaultImpact: 3, potentialCauses: ["Specialized knowledge", "Lack of documentation", "Poor succession planning", "Limited cross-training"], potentialConsequences: ["Knowledge loss", "Operational delays", "Project failures", "Service degradation"], suggestedControls: ["Cross-training", "Documentation", "Succession planning", "Knowledge management", "Team redundancy"], relatedFrameworks: ["ISO 22301", "COSO ERM"], keywords: ["key person", "single point of failure", "knowledge"] },
  { code: "RC-OPS-003", name: "Process Failure", description: "Breakdown in operational processes causing service or product issues", category: "Operational", subcategory: "Process", riskType: "vulnerability", defaultLikelihood: 3, defaultImpact: 3, potentialCauses: ["Poor design", "Lack of controls", "Human error", "System failures", "Inadequate training"], potentialConsequences: ["Quality issues", "Customer complaints", "Rework costs", "Regulatory violations"], suggestedControls: ["Process documentation", "Quality controls", "Training", "Monitoring", "Continuous improvement"], relatedFrameworks: ["ISO 9001", "COBIT"], keywords: ["process", "quality", "procedures"] },
  { code: "RC-OPS-004", name: "Supply Chain Disruption", description: "Interruption in the supply of critical goods or services", category: "Operational", subcategory: "Supply Chain", riskType: "threat", defaultLikelihood: 3, defaultImpact: 4, potentialCauses: ["Supplier failure", "Logistics issues", "Geopolitical events", "Natural disasters", "Quality issues"], potentialConsequences: ["Production delays", "Revenue loss", "Customer impact", "Increased costs"], suggestedControls: ["Supplier diversification", "Inventory buffers", "Supplier monitoring", "Alternative sourcing", "Contractual protections"], relatedFrameworks: ["ISO 28000", "COSO ERM"], keywords: ["supply chain", "supplier", "logistics", "procurement"] },
  { code: "RC-OPS-005", name: "Workplace Safety Incident", description: "Accidents or injuries in the workplace", category: "Operational", subcategory: "Safety", riskType: "threat", defaultLikelihood: 2, defaultImpact: 4, potentialCauses: ["Unsafe conditions", "Equipment failure", "Human error", "Inadequate training", "Fatigue"], potentialConsequences: ["Injuries", "Legal liability", "Regulatory fines", "Productivity loss", "Reputational damage"], suggestedControls: ["Safety training", "PPE", "Hazard assessments", "Safety audits", "Incident reporting"], relatedFrameworks: ["OSHA", "ISO 45001"], keywords: ["safety", "workplace", "injury", "accident"] },
  { code: "RC-OPS-006", name: "Quality Control Failure", description: "Failure to meet quality standards for products or services", category: "Operational", subcategory: "Quality", riskType: "vulnerability", defaultLikelihood: 3, defaultImpact: 4, potentialCauses: ["Process issues", "Material defects", "Human error", "Equipment problems", "Inadequate testing"], potentialConsequences: ["Customer complaints", "Returns", "Recalls", "Legal liability", "Reputation damage"], suggestedControls: ["Quality management system", "Testing procedures", "Supplier quality", "Continuous monitoring", "Root cause analysis"], relatedFrameworks: ["ISO 9001"], keywords: ["quality", "defects", "QA", "QC"] },
  { code: "RC-OPS-007", name: "Project Failure", description: "Failure to deliver projects on time, within budget, or meeting requirements", category: "Operational", subcategory: "Project", riskType: "vulnerability", defaultLikelihood: 3, defaultImpact: 3, potentialCauses: ["Poor planning", "Scope creep", "Resource issues", "Technical challenges", "Stakeholder conflicts"], potentialConsequences: ["Cost overruns", "Delayed benefits", "Opportunity costs", "Reputation impact"], suggestedControls: ["Project management methodology", "Risk management", "Stakeholder management", "Change control", "Regular reviews"], relatedFrameworks: ["PMBOK", "PRINCE2"], keywords: ["project", "delivery", "scope", "budget"] },
  { code: "RC-OPS-008", name: "Capacity Shortage", description: "Insufficient capacity to meet demand", category: "Operational", subcategory: "Capacity", riskType: "vulnerability", defaultLikelihood: 3, defaultImpact: 3, potentialCauses: ["Demand growth", "Resource constraints", "Equipment limitations", "Staff shortages"], potentialConsequences: ["Service degradation", "Lost sales", "Customer dissatisfaction", "SLA breaches"], suggestedControls: ["Capacity planning", "Demand forecasting", "Scalability", "Resource management", "Outsourcing options"], relatedFrameworks: ["ITIL", "COSO ERM"], keywords: ["capacity", "scalability", "demand"] },
  { code: "RC-OPS-009", name: "Vendor Non-Performance", description: "Failure of vendors to meet contractual obligations", category: "Operational", subcategory: "Vendor", riskType: "threat", defaultLikelihood: 3, defaultImpact: 3, potentialCauses: ["Vendor financial issues", "Resource constraints", "Quality problems", "Communication failures"], potentialConsequences: ["Service disruption", "Cost increases", "Quality issues", "Contractual disputes"], suggestedControls: ["Vendor due diligence", "SLA monitoring", "Performance reviews", "Contractual remedies", "Backup vendors"], relatedFrameworks: ["ISO 27001", "COSO ERM"], keywords: ["vendor", "supplier", "SLA", "performance"] },
  { code: "RC-OPS-010", name: "Communication Failure", description: "Breakdown in internal or external communications", category: "Operational", subcategory: "Communication", riskType: "vulnerability", defaultLikelihood: 3, defaultImpact: 3, potentialCauses: ["Technical issues", "Organizational silos", "Cultural barriers", "Process gaps"], potentialConsequences: ["Misunderstandings", "Delays", "Errors", "Relationship damage"], suggestedControls: ["Communication protocols", "Collaboration tools", "Training", "Escalation procedures", "Stakeholder management"], relatedFrameworks: ["COSO ERM"], keywords: ["communication", "collaboration", "information sharing"] },

  // ============ FINANCIAL RISKS (40+ risks) ============
  { code: "RC-FIN-001", name: "Liquidity Risk", description: "Inability to meet short-term financial obligations", category: "Financial", subcategory: "Liquidity", riskType: "vulnerability", defaultLikelihood: 2, defaultImpact: 5, potentialCauses: ["Cash flow issues", "Economic downturn", "Customer defaults", "Unexpected expenses"], potentialConsequences: ["Insolvency", "Credit rating downgrade", "Supplier issues", "Operational disruption"], suggestedControls: ["Cash flow forecasting", "Credit facilities", "Working capital management", "Stress testing", "Contingency planning"], relatedFrameworks: ["Basel III", "COSO ERM"], keywords: ["liquidity", "cash flow", "working capital"] },
  { code: "RC-FIN-002", name: "Credit Risk", description: "Risk of financial loss from counterparty default", category: "Financial", subcategory: "Credit", riskType: "threat", defaultLikelihood: 3, defaultImpact: 4, potentialCauses: ["Customer default", "Economic conditions", "Counterparty failure", "Concentration risk"], potentialConsequences: ["Financial loss", "Cash flow impact", "Write-offs", "Provision increases"], suggestedControls: ["Credit assessment", "Credit limits", "Collateral", "Monitoring", "Diversification"], relatedFrameworks: ["Basel III", "IFRS 9"], keywords: ["credit", "default", "counterparty"] },
  { code: "RC-FIN-003", name: "Currency Exchange Risk", description: "Financial impact from currency fluctuations", category: "Financial", subcategory: "Market", riskType: "threat", defaultLikelihood: 4, defaultImpact: 3, potentialCauses: ["Market volatility", "Economic policies", "Political events", "Interest rate changes"], potentialConsequences: ["Margin erosion", "Earnings volatility", "Balance sheet impact", "Cash flow variation"], suggestedControls: ["Hedging strategies", "Natural hedging", "Currency monitoring", "Forward contracts", "Policy limits"], relatedFrameworks: ["COSO ERM", "Basel III"], keywords: ["currency", "FX", "exchange rate", "hedging"] },
  { code: "RC-FIN-004", name: "Interest Rate Risk", description: "Financial impact from interest rate changes", category: "Financial", subcategory: "Market", riskType: "threat", defaultLikelihood: 3, defaultImpact: 3, potentialCauses: ["Monetary policy", "Inflation", "Economic conditions", "Market expectations"], potentialConsequences: ["Borrowing cost changes", "Investment value impact", "Margin pressure", "Cash flow variation"], suggestedControls: ["Interest rate hedging", "Asset-liability management", "Rate monitoring", "Fixed/floating mix", "Duration management"], relatedFrameworks: ["Basel III", "COSO ERM"], keywords: ["interest rate", "borrowing cost", "ALM"] },
  { code: "RC-FIN-005", name: "Fraud - Internal", description: "Fraudulent activities by employees or insiders", category: "Financial", subcategory: "Fraud", riskType: "threat", defaultLikelihood: 2, defaultImpact: 4, potentialCauses: ["Weak controls", "Opportunity", "Financial pressure", "Rationalization"], potentialConsequences: ["Financial loss", "Regulatory penalties", "Reputational damage", "Legal costs"], suggestedControls: ["Segregation of duties", "Authorization controls", "Monitoring", "Whistleblower program", "Background checks"], relatedFrameworks: ["COSO", "SOX"], keywords: ["fraud", "internal fraud", "embezzlement"] },
  { code: "RC-FIN-006", name: "Fraud - External", description: "Fraudulent activities by external parties", category: "Financial", subcategory: "Fraud", riskType: "threat", defaultLikelihood: 3, defaultImpact: 4, potentialCauses: ["Identity theft", "Phishing", "Social engineering", "Payment fraud"], potentialConsequences: ["Financial loss", "Customer impact", "Reputational damage", "Operational costs"], suggestedControls: ["Authentication controls", "Transaction monitoring", "Fraud detection", "Customer education", "Insurance"], relatedFrameworks: ["PCI DSS", "COSO"], keywords: ["external fraud", "payment fraud", "identity theft"] },
  { code: "RC-FIN-007", name: "Budget Overrun", description: "Exceeding planned budget allocations", category: "Financial", subcategory: "Budget", riskType: "vulnerability", defaultLikelihood: 4, defaultImpact: 3, potentialCauses: ["Poor estimation", "Scope changes", "Unexpected costs", "Vendor issues", "Market changes"], potentialConsequences: ["Profit impact", "Cash flow strain", "Project delays", "Resource reallocation"], suggestedControls: ["Budget controls", "Regular monitoring", "Variance analysis", "Approval processes", "Contingency reserves"], relatedFrameworks: ["COSO ERM"], keywords: ["budget", "cost overrun", "financial control"] },
  { code: "RC-FIN-008", name: "Revenue Loss", description: "Significant decline in revenue affecting financial performance", category: "Financial", subcategory: "Revenue", riskType: "threat", defaultLikelihood: 3, defaultImpact: 4, potentialCauses: ["Market changes", "Competition", "Customer churn", "Economic downturn", "Operational issues"], potentialConsequences: ["Profit decline", "Cash flow issues", "Restructuring", "Market value decline"], suggestedControls: ["Revenue diversification", "Customer retention", "Market monitoring", "Cost flexibility", "Strategic planning"], relatedFrameworks: ["COSO ERM"], keywords: ["revenue", "sales decline", "market share"] },
  { code: "RC-FIN-009", name: "Investment Loss", description: "Loss in value of investments and financial assets", category: "Financial", subcategory: "Investment", riskType: "threat", defaultLikelihood: 3, defaultImpact: 4, potentialCauses: ["Market decline", "Credit events", "Wrong strategy", "Concentration risk"], potentialConsequences: ["Balance sheet impact", "Earnings impact", "Pension funding", "Regulatory capital"], suggestedControls: ["Investment policy", "Diversification", "Risk limits", "Monitoring", "Stress testing"], relatedFrameworks: ["Basel III", "COSO ERM"], keywords: ["investment", "portfolio", "market risk"] },
  { code: "RC-FIN-010", name: "Tax Risk", description: "Risk of tax disputes, penalties, or unexpected liabilities", category: "Financial", subcategory: "Tax", riskType: "vulnerability", defaultLikelihood: 2, defaultImpact: 3, potentialCauses: ["Complex regulations", "Interpretation errors", "Transfer pricing", "Regulatory changes"], potentialConsequences: ["Additional taxes", "Penalties", "Reputation impact", "Audit costs"], suggestedControls: ["Tax compliance", "Expert advice", "Documentation", "Monitoring changes", "Internal review"], relatedFrameworks: ["COSO ERM"], keywords: ["tax", "compliance", "penalty"] },

  // ============ STRATEGIC RISKS (30+ risks) ============
  { code: "RC-STR-001", name: "Competitive Disruption", description: "New competitors or technologies disrupting market position", category: "Strategic", subcategory: "Competition", riskType: "threat", defaultLikelihood: 3, defaultImpact: 4, potentialCauses: ["Technology changes", "New entrants", "Market evolution", "Customer preferences"], potentialConsequences: ["Market share loss", "Margin pressure", "Obsolescence", "Revenue decline"], suggestedControls: ["Market monitoring", "Innovation investment", "Customer focus", "Strategic planning", "Agility"], relatedFrameworks: ["COSO ERM"], keywords: ["competition", "disruption", "market", "innovation"] },
  { code: "RC-STR-002", name: "Merger and Acquisition Risk", description: "Risks associated with M&A activities", category: "Strategic", subcategory: "Growth", riskType: "vulnerability", defaultLikelihood: 3, defaultImpact: 4, potentialCauses: ["Integration challenges", "Cultural differences", "Overvaluation", "Due diligence gaps"], potentialConsequences: ["Value destruction", "Integration costs", "Talent loss", "Customer impact"], suggestedControls: ["Due diligence", "Integration planning", "Cultural assessment", "Value tracking", "Expert advice"], relatedFrameworks: ["COSO ERM"], keywords: ["M&A", "acquisition", "merger", "integration"] },
  { code: "RC-STR-003", name: "Reputation Damage", description: "Significant harm to organizational reputation", category: "Strategic", subcategory: "Reputation", riskType: "threat", defaultLikelihood: 2, defaultImpact: 5, potentialCauses: ["Scandals", "Product failures", "Executive misconduct", "Social media", "Data breaches"], potentialConsequences: ["Customer loss", "Revenue decline", "Talent retention", "Market value decline"], suggestedControls: ["Crisis management", "Media monitoring", "Stakeholder communication", "Ethics program", "Social media management"], relatedFrameworks: ["COSO ERM"], keywords: ["reputation", "brand", "public relations", "crisis"] },
  { code: "RC-STR-004", name: "Strategic Initiative Failure", description: "Failure of major strategic initiatives to deliver expected value", category: "Strategic", subcategory: "Strategy", riskType: "vulnerability", defaultLikelihood: 3, defaultImpact: 4, potentialCauses: ["Poor planning", "Resource constraints", "Market changes", "Execution issues"], potentialConsequences: ["Investment loss", "Opportunity cost", "Competitive disadvantage", "Stakeholder confidence"], suggestedControls: ["Strategic governance", "Milestone tracking", "Risk assessment", "Portfolio management", "Regular review"], relatedFrameworks: ["COSO ERM"], keywords: ["strategy", "initiative", "transformation"] },
  { code: "RC-STR-005", name: "Market Entry Risk", description: "Risks associated with entering new markets or geographies", category: "Strategic", subcategory: "Growth", riskType: "vulnerability", defaultLikelihood: 3, defaultImpact: 3, potentialCauses: ["Market misunderstanding", "Regulatory barriers", "Competition", "Cultural factors"], potentialConsequences: ["Financial loss", "Resource drain", "Brand damage", "Opportunity cost"], suggestedControls: ["Market research", "Pilot programs", "Local partnerships", "Phased approach", "Exit planning"], relatedFrameworks: ["COSO ERM"], keywords: ["market entry", "expansion", "internationalization"] },
  { code: "RC-STR-006", name: "Technology Obsolescence", description: "Risk of technology investments becoming obsolete", category: "Strategic", subcategory: "Technology", riskType: "threat", defaultLikelihood: 3, defaultImpact: 4, potentialCauses: ["Rapid change", "Poor planning", "Vendor decisions", "Industry shifts"], potentialConsequences: ["Stranded investment", "Competitive disadvantage", "Integration issues", "Replacement costs"], suggestedControls: ["Technology roadmap", "Vendor monitoring", "Flexible architecture", "Regular review", "Innovation tracking"], relatedFrameworks: ["COSO ERM", "COBIT"], keywords: ["technology", "obsolescence", "innovation"] },
  { code: "RC-STR-007", name: "Geopolitical Risk", description: "Impact of political events and instability on operations", category: "Strategic", subcategory: "External", riskType: "threat", defaultLikelihood: 2, defaultImpact: 4, potentialCauses: ["Political instability", "Trade disputes", "Sanctions", "Regulatory changes", "Conflict"], potentialConsequences: ["Operational disruption", "Market access loss", "Supply chain issues", "Financial impact"], suggestedControls: ["Geographic diversification", "Scenario planning", "Political monitoring", "Contingency plans", "Insurance"], relatedFrameworks: ["COSO ERM"], keywords: ["geopolitical", "political", "sanctions", "trade"] },
  { code: "RC-STR-008", name: "Climate Change Risk", description: "Business impact from climate change and transition to low-carbon economy", category: "Strategic", subcategory: "ESG", riskType: "threat", defaultLikelihood: 4, defaultImpact: 4, potentialCauses: ["Physical climate impacts", "Regulatory changes", "Market shifts", "Stakeholder pressure"], potentialConsequences: ["Asset impairment", "Operational disruption", "Regulatory costs", "Reputation impact"], suggestedControls: ["Climate risk assessment", "Emission reduction", "Scenario analysis", "Disclosure", "Adaptation planning"], relatedFrameworks: ["TCFD", "SASB", "CDP"], keywords: ["climate", "ESG", "sustainability", "carbon"] },

  // ============ COMPLIANCE RISKS (40+ risks) ============
  { code: "RC-CMP-001", name: "Regulatory Non-Compliance", description: "Failure to comply with applicable regulations and laws", category: "Compliance", subcategory: "Regulatory", riskType: "vulnerability", defaultLikelihood: 2, defaultImpact: 5, potentialCauses: ["Complex regulations", "Inadequate monitoring", "Resource constraints", "Interpretation errors"], potentialConsequences: ["Fines", "Legal action", "License revocation", "Reputation damage"], suggestedControls: ["Compliance program", "Regulatory monitoring", "Training", "Internal audit", "Expert advice"], relatedFrameworks: ["ISO 37301", "COSO ERM"], keywords: ["regulatory", "compliance", "legal", "penalty"] },
  { code: "RC-CMP-002", name: "Data Protection Violation", description: "Non-compliance with data protection and privacy regulations", category: "Compliance", subcategory: "Privacy", riskType: "vulnerability", defaultLikelihood: 3, defaultImpact: 5, potentialCauses: ["Inadequate controls", "Third-party issues", "Process gaps", "Training gaps"], potentialConsequences: ["Regulatory fines", "Legal action", "Reputation damage", "Customer loss"], suggestedControls: ["Privacy program", "DPO", "DPIA", "Training", "Third-party management"], relatedFrameworks: ["GDPR", "CCPA", "PDPA"], keywords: ["GDPR", "privacy", "data protection", "personal data"] },
  { code: "RC-CMP-003", name: "Anti-Money Laundering Failure", description: "Failure to prevent or detect money laundering activities", category: "Compliance", subcategory: "Financial Crime", riskType: "vulnerability", defaultLikelihood: 2, defaultImpact: 5, potentialCauses: ["Inadequate KYC", "Transaction monitoring gaps", "Training issues", "Complex structures"], potentialConsequences: ["Regulatory action", "Criminal liability", "License revocation", "Reputation damage"], suggestedControls: ["AML program", "KYC procedures", "Transaction monitoring", "SAR filing", "Training"], relatedFrameworks: ["FATF", "BSA/AML"], keywords: ["AML", "money laundering", "KYC", "financial crime"] },
  { code: "RC-CMP-004", name: "Bribery and Corruption", description: "Risk of bribery or corrupt practices", category: "Compliance", subcategory: "Ethics", riskType: "vulnerability", defaultLikelihood: 2, defaultImpact: 5, potentialCauses: ["Third-party relationships", "High-risk markets", "Inadequate controls", "Pressure to perform"], potentialConsequences: ["Criminal prosecution", "Fines", "Debarment", "Reputation damage"], suggestedControls: ["Anti-corruption policy", "Third-party due diligence", "Training", "Whistleblower program", "Internal audit"], relatedFrameworks: ["FCPA", "UK Bribery Act", "ISO 37001"], keywords: ["bribery", "corruption", "FCPA", "ethics"] },
  { code: "RC-CMP-005", name: "Sanctions Violation", description: "Violation of economic sanctions and trade restrictions", category: "Compliance", subcategory: "Regulatory", riskType: "vulnerability", defaultLikelihood: 2, defaultImpact: 5, potentialCauses: ["Complex regulations", "Screening gaps", "Third-party exposure", "Rapid changes"], potentialConsequences: ["Criminal penalties", "Civil fines", "Debarment", "Reputation damage"], suggestedControls: ["Sanctions screening", "Policy and procedures", "Training", "Monitoring", "Expert advice"], relatedFrameworks: ["OFAC", "EU Sanctions"], keywords: ["sanctions", "OFAC", "trade compliance", "embargo"] },
  { code: "RC-CMP-006", name: "Environmental Non-Compliance", description: "Failure to comply with environmental regulations", category: "Compliance", subcategory: "Environmental", riskType: "vulnerability", defaultLikelihood: 2, defaultImpact: 4, potentialCauses: ["Inadequate monitoring", "Process issues", "Regulatory changes", "Waste management"], potentialConsequences: ["Fines", "Remediation costs", "License issues", "Reputation damage"], suggestedControls: ["Environmental management system", "Monitoring", "Training", "Permits management", "Audits"], relatedFrameworks: ["ISO 14001", "EPA regulations"], keywords: ["environmental", "pollution", "emissions", "waste"] },
  { code: "RC-CMP-007", name: "Health and Safety Non-Compliance", description: "Failure to comply with occupational health and safety regulations", category: "Compliance", subcategory: "Safety", riskType: "vulnerability", defaultLikelihood: 3, defaultImpact: 4, potentialCauses: ["Inadequate procedures", "Training gaps", "Equipment issues", "Monitoring failures"], potentialConsequences: ["Injuries", "Regulatory penalties", "Legal liability", "Reputation damage"], suggestedControls: ["OHS management system", "Training", "Audits", "Incident investigation", "Equipment maintenance"], relatedFrameworks: ["OSHA", "ISO 45001"], keywords: ["health", "safety", "OSHA", "workplace"] },
  { code: "RC-CMP-008", name: "Contract Non-Compliance", description: "Failure to meet contractual obligations", category: "Compliance", subcategory: "Contractual", riskType: "vulnerability", defaultLikelihood: 3, defaultImpact: 3, potentialCauses: ["Resource issues", "Misunderstanding", "Process failures", "Third-party issues"], potentialConsequences: ["Financial penalties", "Legal disputes", "Relationship damage", "Reputation impact"], suggestedControls: ["Contract management", "Obligation tracking", "Regular review", "Communication", "Escalation procedures"], relatedFrameworks: ["COSO ERM"], keywords: ["contract", "SLA", "obligations", "breach"] },
  { code: "RC-CMP-009", name: "Financial Reporting Error", description: "Errors or misstatements in financial reporting", category: "Compliance", subcategory: "Financial", riskType: "vulnerability", defaultLikelihood: 2, defaultImpact: 4, potentialCauses: ["Complex accounting", "Human error", "System issues", "Control failures"], potentialConsequences: ["Restatements", "Regulatory action", "Investor confidence", "Reputation damage"], suggestedControls: ["Internal controls", "Review procedures", "Training", "Audit", "System controls"], relatedFrameworks: ["SOX", "IFRS", "GAAP"], keywords: ["financial reporting", "SOX", "accounting", "audit"] },
  { code: "RC-CMP-010", name: "Industry-Specific Regulation Breach", description: "Non-compliance with sector-specific regulations", category: "Compliance", subcategory: "Industry", riskType: "vulnerability", defaultLikelihood: 2, defaultImpact: 4, potentialCauses: ["Complex requirements", "Regulatory changes", "Resource constraints", "Interpretation issues"], potentialConsequences: ["Regulatory sanctions", "License risk", "Fines", "Reputation damage"], suggestedControls: ["Specialized compliance program", "Expert resources", "Monitoring", "Training", "Industry engagement"], relatedFrameworks: ["Industry-specific frameworks"], keywords: ["industry regulation", "sector compliance"] },

  // ============ LEGAL RISKS (20+ risks) ============
  { code: "RC-LGL-001", name: "Litigation Risk", description: "Risk of legal disputes and lawsuits", category: "Legal", subcategory: "Litigation", riskType: "threat", defaultLikelihood: 3, defaultImpact: 4, potentialCauses: ["Contract disputes", "Employment issues", "IP infringement", "Product liability"], potentialConsequences: ["Financial loss", "Legal costs", "Management distraction", "Reputation impact"], suggestedControls: ["Legal review", "Contract management", "Insurance", "Dispute resolution", "Compliance programs"], relatedFrameworks: ["COSO ERM"], keywords: ["litigation", "lawsuit", "legal dispute"] },
  { code: "RC-LGL-002", name: "Intellectual Property Infringement", description: "Unauthorized use or theft of intellectual property", category: "Legal", subcategory: "IP", riskType: "threat", defaultLikelihood: 2, defaultImpact: 4, potentialCauses: ["Copying", "Patent violation", "Trade secret theft", "Trademark infringement"], potentialConsequences: ["Legal action", "Financial loss", "Product issues", "Competitive impact"], suggestedControls: ["IP protection", "Legal review", "Employee agreements", "Monitoring", "Registration"], relatedFrameworks: ["COSO ERM"], keywords: ["IP", "patent", "trademark", "copyright"] },
  { code: "RC-LGL-003", name: "Employment Law Violation", description: "Breach of employment laws and regulations", category: "Legal", subcategory: "Employment", riskType: "vulnerability", defaultLikelihood: 3, defaultImpact: 3, potentialCauses: ["HR policy gaps", "Manager actions", "Discrimination", "Wage issues"], potentialConsequences: ["Legal claims", "Regulatory penalties", "Reputation damage", "Employee relations"], suggestedControls: ["HR policies", "Training", "Legal review", "Complaint procedures", "Documentation"], relatedFrameworks: ["Employment law"], keywords: ["employment", "discrimination", "labor law", "HR"] },
  { code: "RC-LGL-004", name: "Product Liability", description: "Legal liability for harm caused by products", category: "Legal", subcategory: "Product", riskType: "threat", defaultLikelihood: 2, defaultImpact: 5, potentialCauses: ["Design defects", "Manufacturing issues", "Inadequate warnings", "Quality failures"], potentialConsequences: ["Lawsuits", "Recalls", "Reputation damage", "Insurance costs"], suggestedControls: ["Quality management", "Testing", "Warnings", "Insurance", "Incident tracking"], relatedFrameworks: ["Product safety regulations"], keywords: ["product liability", "recall", "defect"] },

  // ============ HUMAN RESOURCES RISKS (25+ risks) ============
  { code: "RC-HR-001", name: "Talent Shortage", description: "Inability to attract and retain qualified personnel", category: "Human Resources", subcategory: "Talent", riskType: "vulnerability", defaultLikelihood: 4, defaultImpact: 4, potentialCauses: ["Market competition", "Compensation", "Location", "Skills shortage", "Culture"], potentialConsequences: ["Operational impact", "Project delays", "Quality issues", "Increased costs"], suggestedControls: ["Talent strategy", "Competitive compensation", "Development programs", "Employer branding", "Retention initiatives"], relatedFrameworks: ["COSO ERM"], keywords: ["talent", "recruitment", "retention", "skills gap"] },
  { code: "RC-HR-002", name: "Employee Misconduct", description: "Unethical or illegal behavior by employees", category: "Human Resources", subcategory: "Conduct", riskType: "threat", defaultLikelihood: 2, defaultImpact: 4, potentialCauses: ["Weak culture", "Inadequate controls", "Pressure", "Poor hiring"], potentialConsequences: ["Legal liability", "Financial loss", "Reputation damage", "Regulatory action"], suggestedControls: ["Code of conduct", "Training", "Whistleblower program", "Background checks", "Monitoring"], relatedFrameworks: ["COSO ERM"], keywords: ["misconduct", "ethics", "employee behavior"] },
  { code: "RC-HR-003", name: "Labor Dispute", description: "Conflicts with labor unions or employee groups", category: "Human Resources", subcategory: "Labor Relations", riskType: "threat", defaultLikelihood: 2, defaultImpact: 4, potentialCauses: ["Compensation disputes", "Working conditions", "Policy changes", "Communication failures"], potentialConsequences: ["Strikes", "Productivity loss", "Legal costs", "Reputation impact"], suggestedControls: ["Labor relations program", "Communication", "Fair practices", "Negotiation skills", "Contingency planning"], relatedFrameworks: ["Labor law"], keywords: ["labor", "union", "strike", "negotiation"] },
  { code: "RC-HR-004", name: "Workplace Harassment", description: "Harassment or discrimination in the workplace", category: "Human Resources", subcategory: "Conduct", riskType: "vulnerability", defaultLikelihood: 2, defaultImpact: 4, potentialCauses: ["Culture issues", "Leadership failures", "Inadequate policies", "Lack of training"], potentialConsequences: ["Legal action", "Reputation damage", "Employee turnover", "Productivity impact"], suggestedControls: ["Anti-harassment policy", "Training", "Reporting mechanisms", "Investigation procedures", "Leadership accountability"], relatedFrameworks: ["Employment law", "COSO ERM"], keywords: ["harassment", "discrimination", "workplace", "DEI"] },
  { code: "RC-HR-005", name: "Training and Competency Gap", description: "Insufficient skills or training for job requirements", category: "Human Resources", subcategory: "Capability", riskType: "vulnerability", defaultLikelihood: 3, defaultImpact: 3, potentialCauses: ["Rapid change", "Budget constraints", "Program gaps", "Technology changes"], potentialConsequences: ["Performance issues", "Quality problems", "Safety risks", "Compliance failures"], suggestedControls: ["Training programs", "Competency frameworks", "Performance management", "Development plans", "Knowledge sharing"], relatedFrameworks: ["COSO ERM", "ISO standards"], keywords: ["training", "competency", "skills", "development"] },

  // ============ THIRD PARTY RISKS (20+ risks) ============
  { code: "RC-3P-001", name: "Third-Party Data Breach", description: "Data breach occurring at a third-party service provider", category: "Third Party", subcategory: "Security", riskType: "threat", defaultLikelihood: 3, defaultImpact: 4, potentialCauses: ["Vendor security weakness", "Shared access", "Supply chain attack", "Insider threat"], potentialConsequences: ["Data exposure", "Regulatory penalties", "Reputation damage", "Customer impact"], suggestedControls: ["Vendor security assessment", "Contract requirements", "Monitoring", "Access controls", "Incident response"], relatedFrameworks: ["ISO 27001", "NIST CSF"], keywords: ["vendor", "third party", "data breach", "supply chain"] },
  { code: "RC-3P-002", name: "Outsourcing Failure", description: "Failure of outsourced services to meet requirements", category: "Third Party", subcategory: "Service", riskType: "vulnerability", defaultLikelihood: 3, defaultImpact: 3, potentialCauses: ["Provider issues", "Contract gaps", "Communication", "Capability shortfall"], potentialConsequences: ["Service disruption", "Quality issues", "Cost increases", "Customer impact"], suggestedControls: ["Due diligence", "SLA management", "Performance monitoring", "Relationship management", "Exit planning"], relatedFrameworks: ["COSO ERM", "ISO 27001"], keywords: ["outsourcing", "vendor", "managed services"] },
  { code: "RC-3P-003", name: "Vendor Concentration Risk", description: "Over-reliance on a single vendor for critical services", category: "Third Party", subcategory: "Concentration", riskType: "vulnerability", defaultLikelihood: 3, defaultImpact: 4, potentialCauses: ["Limited alternatives", "Cost optimization", "Technical lock-in", "Relationship history"], potentialConsequences: ["Bargaining power loss", "Continuity risk", "Innovation constraints", "Price increases"], suggestedControls: ["Vendor diversification", "Exit planning", "Contract terms", "Regular review", "Alternative sourcing"], relatedFrameworks: ["COSO ERM"], keywords: ["concentration", "vendor", "single point of failure"] },
  { code: "RC-3P-004", name: "Subcontractor Risk", description: "Risks from vendors using subcontractors", category: "Third Party", subcategory: "Extended Supply Chain", riskType: "vulnerability", defaultLikelihood: 3, defaultImpact: 3, potentialCauses: ["Lack of visibility", "Subcontractor issues", "Control gaps", "Compliance failures"], potentialConsequences: ["Service issues", "Security risks", "Compliance violations", "Quality problems"], suggestedControls: ["Subcontracting controls", "Right to audit", "Flow-down requirements", "Visibility requirements", "Regular assessment"], relatedFrameworks: ["ISO 27001", "COSO ERM"], keywords: ["subcontractor", "fourth party", "supply chain"] },

  // ============ REPUTATIONAL RISKS (10+ risks) ============
  { code: "RC-REP-001", name: "Social Media Crisis", description: "Negative viral content on social media platforms", category: "Reputational", subcategory: "Social Media", riskType: "threat", defaultLikelihood: 3, defaultImpact: 4, potentialCauses: ["Customer complaints", "Employee posts", "Competitor actions", "Misinformation"], potentialConsequences: ["Brand damage", "Customer loss", "Stock impact", "Crisis management costs"], suggestedControls: ["Social media monitoring", "Response protocols", "Employee guidelines", "Crisis communication", "Stakeholder engagement"], relatedFrameworks: ["COSO ERM"], keywords: ["social media", "viral", "reputation", "crisis"] },
  { code: "RC-REP-002", name: "Negative Media Coverage", description: "Unfavorable reporting by news media", category: "Reputational", subcategory: "Media", riskType: "threat", defaultLikelihood: 2, defaultImpact: 4, potentialCauses: ["Incidents", "Investigations", "Whistleblowers", "Competitor activities"], potentialConsequences: ["Reputation damage", "Stakeholder concern", "Regulatory scrutiny", "Customer impact"], suggestedControls: ["Media relations", "Proactive communication", "Crisis management", "Stakeholder engagement", "Transparency"], relatedFrameworks: ["COSO ERM"], keywords: ["media", "press", "reputation", "PR"] },
  { code: "RC-REP-003", name: "Product/Service Failure Public Incident", description: "Highly visible failure of products or services", category: "Reputational", subcategory: "Product", riskType: "threat", defaultLikelihood: 2, defaultImpact: 5, potentialCauses: ["Quality issues", "Design flaws", "Manufacturing defects", "Service failures"], potentialConsequences: ["Customer loss", "Legal action", "Regulatory scrutiny", "Long-term brand damage"], suggestedControls: ["Quality management", "Testing", "Incident response", "Communication strategy", "Remediation programs"], relatedFrameworks: ["ISO 9001", "COSO ERM"], keywords: ["product failure", "service failure", "quality", "reputation"] },
];

export async function seedRiskCatalog() {
  console.log("Seeding Risk Register Templates...");
  
  // Check if templates already exist
  const existingTemplates = await db.select().from(riskRegisterTemplates);
  if (existingTemplates.length === 0) {
    for (const template of riskRegisterTemplatesData) {
      await db.insert(riskRegisterTemplates).values({
        ...template,
        columns: JSON.stringify(template.columns),
        riskMatrix: JSON.stringify(template.riskMatrix),
      });
    }
    console.log(`Inserted ${riskRegisterTemplatesData.length} risk register templates`);
  } else {
    console.log(`Risk register templates already exist (${existingTemplates.length} found)`);
  }

  // ALWAYS fix any legacy ASRY template names (runs every startup)
  const allTemplates = await db.select().from(riskRegisterTemplates);
  const asryTemplate = allTemplates.find(t => 
    t.code === "TMPL-IT-ASRY" || 
    (t.name && t.name.includes("ASRY")) ||
    (t.standard && t.standard.includes("ASRY"))
  );
  if (asryTemplate) {
    console.log("Found ASRY template, cleaning up references...");
    await db.update(riskRegisterTemplates)
      .set({
        code: "TMPL-IT-001",
        name: "IT Risk Assessment",
        standard: "ISO 27001",
        description: "Comprehensive IT risk assessment template with CIA scoring, threat/vulnerability analysis, and residual risk tracking. Based on ISO 27001 standard methodology for systematic IT risk identification and assessment.",
      })
      .where(sql`${riskRegisterTemplates.id} = ${asryTemplate.id}`);
    console.log("Updated IT Risk Assessment template - removed ASRY references");
  }

  console.log("Seeding Risk Catalog...");
  
  // Check if risk catalog already exists
  const existingCatalog = await db.select().from(riskCatalog);
  if (existingCatalog.length === 0) {
    for (const risk of riskCatalogData) {
      await db.insert(riskCatalog).values({
        ...risk,
        potentialCauses: risk.potentialCauses,
        potentialConsequences: risk.potentialConsequences,
        suggestedControls: risk.suggestedControls,
        relatedFrameworks: risk.relatedFrameworks,
        keywords: risk.keywords,
        isGlobal: true,
        status: "active",
      });
    }
    console.log(`Inserted ${riskCatalogData.length} risks into the catalog`);
  } else {
    console.log(`Risk catalog already exists (${existingCatalog.length} risks found)`);
  }
}

// Export for use in main seed
export { riskCatalogData, riskRegisterTemplatesData };
