import { db } from "./db";
import bcrypt from "bcryptjs";
import { eq, ne, sql } from "drizzle-orm";
import {
  regions,
  tenants,
  users,
  frameworks,
  controls,
  policies,
  risks,
  audits,
  vendors,
  aiInsights,
  licenses,
  trainingModules,
  userTraining,
  processTemplates,
  reportTemplates,
  tenantFrameworks,
  generatedReports,
  processes,
  procedures,
  legalBases,
  dsrTypesRef,
} from "@shared/schema";
import { seedRiskCatalog } from "./seed-risk-catalog";

async function ensureSuperAdmin() {
  const existingAdmin = await db.select().from(users).where(
    eq(users.username, "admin")
  );
  
  if (existingAdmin.length === 0) {
    console.log("Creating super admin user...");
    const hashedPassword = await bcrypt.hash("Admin@123", 12);
    await db.insert(users).values({
      id: crypto.randomUUID(),
      username: "admin",
      email: "admin@grcshield.com",
      password: hashedPassword,
      firstName: "Super",
      lastName: "Admin",
      role: "super_admin",
      isActive: true,
      mfaEnabled: false,
    });
    console.log("Super admin created: admin / Admin@123");
  } else {
    // Ensure password is correct (update if needed)
    const adminUser = existingAdmin[0];
    if (!adminUser.password || adminUser.password === "hashed_password" || !adminUser.password.startsWith("$2")) {
      console.log("Updating super admin password...");
      const hashedPassword = await bcrypt.hash("Admin@123", 12);
      await db.update(users)
        .set({ password: hashedPassword, role: "super_admin" })
        .where(eq(users.id, adminUser.id));
      console.log("Super admin password updated");
    }
  }
}

async function seedReportTemplates() {
  await db.insert(reportTemplates).values([
    // Executive Reports (5)
    {
      id: "exec-board-summary",
      name: "Board Summary Report",
      description: "Executive-level summary of GRC posture for board presentations",
      category: "executive",
      roleAccess: ["super_admin", "tenant_admin"],
      isBuiltIn: true,
      sections: JSON.stringify(["Executive Summary", "Risk Overview", "Compliance Status", "Key Metrics", "Recommendations"]),
    },
    {
      id: "exec-quarterly-review",
      name: "Quarterly GRC Review",
      description: "Comprehensive quarterly review of governance, risk, and compliance activities",
      category: "executive",
      roleAccess: ["super_admin", "tenant_admin"],
      isBuiltIn: true,
      sections: JSON.stringify(["Quarter Highlights", "Risk Trends", "Compliance Progress", "Audit Findings", "Next Quarter Priorities"]),
    },
    {
      id: "exec-annual-report",
      name: "Annual GRC Report",
      description: "Year-end comprehensive GRC performance report",
      category: "executive",
      roleAccess: ["super_admin", "tenant_admin"],
      isBuiltIn: true,
      sections: JSON.stringify(["Year in Review", "Key Achievements", "Risk Management", "Compliance Metrics", "Strategic Outlook"]),
    },
    {
      id: "exec-risk-dashboard",
      name: "Executive Risk Dashboard",
      description: "High-level risk overview for executive decision-making",
      category: "executive",
      roleAccess: ["super_admin", "tenant_admin"],
      isBuiltIn: true,
      sections: JSON.stringify(["Risk Heat Map", "Top 10 Risks", "Mitigation Status", "Trend Analysis"]),
    },
    {
      id: "exec-compliance-scorecard",
      name: "Compliance Scorecard",
      description: "Executive scorecard showing compliance status across frameworks",
      category: "executive",
      roleAccess: ["super_admin", "tenant_admin"],
      isBuiltIn: true,
      sections: JSON.stringify(["Overall Score", "Framework Breakdown", "Gap Analysis", "Action Items"]),
    },
    // Compliance Reports (5)
    {
      id: "comp-iso27001-status",
      name: "ISO 27001 Compliance Status",
      description: "Detailed ISO 27001 compliance status and gap analysis",
      category: "compliance",
      framework: "ISO 27001",
      roleAccess: ["super_admin", "tenant_admin", "auditor"],
      isBuiltIn: true,
      sections: JSON.stringify(["Control Status", "Gap Analysis", "Evidence Summary", "Remediation Plan"]),
    },
    {
      id: "comp-soc2-status",
      name: "SOC 2 Readiness Report",
      description: "SOC 2 Type II readiness assessment and evidence status",
      category: "compliance",
      framework: "SOC 2",
      roleAccess: ["super_admin", "tenant_admin", "auditor"],
      isBuiltIn: true,
      sections: JSON.stringify(["Trust Services Criteria", "Control Effectiveness", "Evidence Gaps", "Timeline"]),
    },
    {
      id: "comp-gdpr-status",
      name: "GDPR Compliance Report",
      description: "GDPR compliance status including data processing activities",
      category: "compliance",
      framework: "GDPR",
      region: "European Union",
      roleAccess: ["super_admin", "tenant_admin", "auditor"],
      isBuiltIn: true,
      sections: JSON.stringify(["Data Processing Overview", "DPIA Status", "DSAR Metrics", "Breach History"]),
    },
    {
      id: "comp-pci-dss-status",
      name: "PCI DSS Compliance Report",
      description: "Payment Card Industry Data Security Standard compliance status",
      category: "compliance",
      framework: "PCI DSS",
      industry: "Financial Services",
      roleAccess: ["super_admin", "tenant_admin", "auditor"],
      isBuiltIn: true,
      sections: JSON.stringify(["SAQ Status", "Control Requirements", "Vulnerability Scans", "Penetration Testing"]),
    },
    {
      id: "comp-hipaa-status",
      name: "HIPAA Compliance Report",
      description: "Health Insurance Portability and Accountability Act compliance status",
      category: "compliance",
      framework: "HIPAA",
      industry: "Healthcare",
      roleAccess: ["super_admin", "tenant_admin", "auditor"],
      isBuiltIn: true,
      sections: JSON.stringify(["Privacy Rule", "Security Rule", "Breach Notification", "Risk Assessment"]),
    },
    // Risk Reports (5)
    {
      id: "risk-register-full",
      name: "Complete Risk Register",
      description: "Full export of organizational risk register with all details",
      category: "risk",
      roleAccess: ["super_admin", "tenant_admin", "auditor"],
      isBuiltIn: true,
      sections: JSON.stringify(["Risk Inventory", "Risk Ratings", "Mitigation Plans", "Risk Owners"]),
    },
    {
      id: "risk-treatment-status",
      name: "Risk Treatment Status Report",
      description: "Status of all risk treatment plans and mitigation activities",
      category: "risk",
      roleAccess: ["super_admin", "tenant_admin", "auditor"],
      isBuiltIn: true,
      sections: JSON.stringify(["Treatment Plans", "Implementation Status", "Effectiveness Review", "Residual Risk"]),
    },
    {
      id: "risk-emerging-threats",
      name: "Emerging Threats Report",
      description: "Analysis of emerging threats and their potential impact",
      category: "risk",
      roleAccess: ["super_admin", "tenant_admin"],
      isBuiltIn: true,
      sections: JSON.stringify(["Threat Landscape", "Industry Trends", "Vulnerability Analysis", "Recommendations"]),
    },
    {
      id: "risk-third-party",
      name: "Third-Party Risk Report",
      description: "Comprehensive third-party and vendor risk assessment summary",
      category: "risk",
      roleAccess: ["super_admin", "tenant_admin", "auditor"],
      isBuiltIn: true,
      sections: JSON.stringify(["Vendor Inventory", "Risk Ratings", "Due Diligence Status", "Contractual Compliance"]),
    },
    {
      id: "risk-business-impact",
      name: "Business Impact Analysis",
      description: "Business impact analysis for critical processes and systems",
      category: "risk",
      roleAccess: ["super_admin", "tenant_admin"],
      isBuiltIn: true,
      sections: JSON.stringify(["Critical Processes", "Recovery Objectives", "Dependencies", "Impact Assessment"]),
    },
    // Audit Reports (5)
    {
      id: "audit-internal-summary",
      name: "Internal Audit Summary",
      description: "Summary of internal audit activities and findings",
      category: "audit",
      roleAccess: ["super_admin", "tenant_admin", "auditor"],
      isBuiltIn: true,
      sections: JSON.stringify(["Audit Plan", "Completed Audits", "Findings Summary", "Remediation Status"]),
    },
    {
      id: "audit-findings-tracker",
      name: "Audit Findings Tracker",
      description: "Detailed tracking of all audit findings and remediation progress",
      category: "audit",
      roleAccess: ["super_admin", "tenant_admin", "auditor"],
      isBuiltIn: true,
      sections: JSON.stringify(["Open Findings", "Remediation Progress", "Overdue Items", "Trend Analysis"]),
    },
    {
      id: "audit-control-testing",
      name: "Control Testing Report",
      description: "Results of control testing and effectiveness assessment",
      category: "audit",
      roleAccess: ["super_admin", "tenant_admin", "auditor"],
      isBuiltIn: true,
      sections: JSON.stringify(["Testing Methodology", "Control Results", "Exceptions", "Recommendations"]),
    },
    {
      id: "audit-external-prep",
      name: "External Audit Preparation",
      description: "Preparation checklist and status for upcoming external audits",
      category: "audit",
      roleAccess: ["super_admin", "tenant_admin", "auditor"],
      isBuiltIn: true,
      sections: JSON.stringify(["Audit Scope", "Evidence Checklist", "Interview Schedule", "Open Items"]),
    },
    {
      id: "audit-management-response",
      name: "Management Response Report",
      description: "Consolidated management responses to audit findings",
      category: "audit",
      roleAccess: ["super_admin", "tenant_admin", "auditor"],
      isBuiltIn: true,
      sections: JSON.stringify(["Finding Summary", "Management Response", "Action Plans", "Due Dates"]),
    },
    // Privacy Reports (5)
    {
      id: "privacy-ropa",
      name: "ROPA (Records of Processing Activities)",
      description: "Complete record of personal data processing activities",
      category: "privacy",
      roleAccess: ["super_admin", "tenant_admin", "auditor"],
      isBuiltIn: true,
      sections: JSON.stringify(["Processing Activities", "Legal Basis", "Data Categories", "Retention Periods"]),
    },
    {
      id: "privacy-dpia-summary",
      name: "DPIA Summary Report",
      description: "Summary of all Data Protection Impact Assessments",
      category: "privacy",
      roleAccess: ["super_admin", "tenant_admin", "auditor"],
      isBuiltIn: true,
      sections: JSON.stringify(["High-Risk Processing", "Assessment Results", "Mitigation Measures", "DPO Recommendations"]),
    },
    {
      id: "privacy-dsar-metrics",
      name: "DSAR Metrics Report",
      description: "Data Subject Access Request handling metrics and performance",
      category: "privacy",
      roleAccess: ["super_admin", "tenant_admin"],
      isBuiltIn: true,
      sections: JSON.stringify(["Request Volume", "Response Times", "Request Types", "Compliance Rate"]),
    },
    {
      id: "privacy-breach-report",
      name: "Privacy Breach Report",
      description: "Summary of privacy incidents and breach notifications",
      category: "privacy",
      roleAccess: ["super_admin", "tenant_admin"],
      isBuiltIn: true,
      sections: JSON.stringify(["Incident Summary", "Root Cause", "Notification Status", "Remediation Actions"]),
    },
    {
      id: "privacy-consent-management",
      name: "Consent Management Report",
      description: "Status of consent collection and management across channels",
      category: "privacy",
      roleAccess: ["super_admin", "tenant_admin"],
      isBuiltIn: true,
      sections: JSON.stringify(["Consent Overview", "Collection Points", "Withdrawal Tracking", "Audit Trail"]),
    },
    // Regulatory Reports (5)
    {
      id: "reg-nist-csf",
      name: "NIST CSF Assessment",
      description: "NIST Cybersecurity Framework maturity assessment",
      category: "regulatory",
      framework: "NIST CSF",
      region: "United States",
      roleAccess: ["super_admin", "tenant_admin", "auditor"],
      isBuiltIn: true,
      sections: JSON.stringify(["Function Scores", "Maturity Levels", "Gap Analysis", "Improvement Plan"]),
    },
    {
      id: "reg-fedramp",
      name: "FedRAMP Authorization Status",
      description: "Federal Risk and Authorization Management Program status",
      category: "regulatory",
      framework: "FedRAMP",
      region: "United States",
      roleAccess: ["super_admin", "tenant_admin", "auditor"],
      isBuiltIn: true,
      sections: JSON.stringify(["Authorization Level", "Control Status", "POA&M Items", "Continuous Monitoring"]),
    },
    {
      id: "reg-nis2",
      name: "NIS2 Compliance Report",
      description: "EU Network and Information Security Directive 2 compliance",
      category: "regulatory",
      framework: "NIS2",
      region: "European Union",
      roleAccess: ["super_admin", "tenant_admin", "auditor"],
      isBuiltIn: true,
      sections: JSON.stringify(["Entity Classification", "Security Measures", "Incident Reporting", "Supply Chain"]),
    },
    {
      id: "reg-sama",
      name: "SAMA Cybersecurity Report",
      description: "Saudi Arabian Monetary Authority cybersecurity framework compliance",
      category: "regulatory",
      framework: "SAMA-CSF",
      region: "Gulf",
      roleAccess: ["super_admin", "tenant_admin", "auditor"],
      isBuiltIn: true,
      sections: JSON.stringify(["Domain Compliance", "Control Implementation", "Maturity Assessment", "Action Plan"]),
    },
    {
      id: "reg-mas-trm",
      name: "MAS TRM Guidelines Report",
      description: "Monetary Authority of Singapore Technology Risk Management compliance",
      category: "regulatory",
      framework: "MAS-TRM",
      region: "SEA",
      roleAccess: ["super_admin", "tenant_admin", "auditor"],
      isBuiltIn: true,
      sections: JSON.stringify(["Risk Assessment", "Control Framework", "Third Party Management", "Resilience"]),
    },
    // Operational Reports (5)
    {
      id: "ops-policy-status",
      name: "Policy Management Status",
      description: "Status of all policies including review dates and approvals",
      category: "operational",
      roleAccess: ["super_admin", "tenant_admin"],
      isBuiltIn: true,
      sections: JSON.stringify(["Policy Inventory", "Review Status", "Approval Workflow", "Distribution Status"]),
    },
    {
      id: "ops-training-completion",
      name: "Training Completion Report",
      description: "Employee training completion rates and compliance status",
      category: "operational",
      roleAccess: ["super_admin", "tenant_admin"],
      isBuiltIn: true,
      sections: JSON.stringify(["Completion Rates", "Overdue Training", "By Department", "Trend Analysis"]),
    },
    {
      id: "ops-incident-summary",
      name: "Security Incident Summary",
      description: "Summary of security incidents and response metrics",
      category: "operational",
      roleAccess: ["super_admin", "tenant_admin"],
      isBuiltIn: true,
      sections: JSON.stringify(["Incident Volume", "Categories", "Response Times", "Lessons Learned"]),
    },
    {
      id: "ops-access-review",
      name: "Access Review Report",
      description: "User access review status and privilege audit results",
      category: "operational",
      roleAccess: ["super_admin", "tenant_admin"],
      isBuiltIn: true,
      sections: JSON.stringify(["Review Schedule", "Completion Status", "Access Changes", "Exceptions"]),
    },
    {
      id: "ops-asset-inventory",
      name: "Asset Inventory Report",
      description: "Complete inventory of IT assets and their security classification",
      category: "operational",
      roleAccess: ["super_admin", "tenant_admin"],
      isBuiltIn: true,
      sections: JSON.stringify(["Asset Categories", "Classification", "Ownership", "Lifecycle Status"]),
    },
  ]);
  console.log("Report templates seeded successfully!");
}

async function seedPrivacyReferenceData() {
  // Seed Legal Bases (GDPR Article 6)
  const existingLegalBases = await db.select().from(legalBases);
  if (existingLegalBases.length === 0) {
    console.log("Seeding legal bases reference data...");
    await db.insert(legalBases).values([
      { code: "consent", name: "Consent", description: "Individual has given clear consent for processing", frameworks: ["GDPR", "DPDP", "PDPA", "LGPD"] },
      { code: "contract", name: "Contractual Necessity", description: "Processing necessary for contract performance", frameworks: ["GDPR", "DPDP"] },
      { code: "legal_obligation", name: "Legal Obligation", description: "Processing required by law", frameworks: ["GDPR", "DPDP", "CCPA"] },
      { code: "vital_interests", name: "Vital Interests", description: "Necessary to protect someone's life", frameworks: ["GDPR", "DPDP"] },
      { code: "public_task", name: "Public Task", description: "Necessary for public interest task", frameworks: ["GDPR"] },
      { code: "legitimate_interest", name: "Legitimate Interests", description: "Legitimate business interests (with balancing test)", frameworks: ["GDPR", "PDPA"] },
    ]);
    console.log("Legal bases seeded successfully!");
  }

  // Seed DSR Types (GDPR Chapter III)
  const existingDsrTypes = await db.select().from(dsrTypesRef);
  if (existingDsrTypes.length === 0) {
    console.log("Seeding DSR types reference data...");
    await db.insert(dsrTypesRef).values([
      { code: "access", name: "Right of Access", description: "Right to obtain confirmation and access to personal data", sla: "30 days", icon: "Eye" },
      { code: "rectification", name: "Right to Rectification", description: "Right to have inaccurate personal data corrected", sla: "30 days", icon: "Edit" },
      { code: "erasure", name: "Right to Erasure", description: "Right to have personal data erased (right to be forgotten)", sla: "30 days", icon: "Trash2" },
      { code: "portability", name: "Data Portability", description: "Right to receive data in a portable format", sla: "30 days", icon: "Download" },
      { code: "restriction", name: "Restriction of Processing", description: "Right to limit how data is used", sla: "30 days", icon: "Pause" },
      { code: "objection", name: "Right to Object", description: "Right to object to processing for certain purposes", sla: "30 days", icon: "XCircle" },
    ]);
    console.log("DSR types seeded successfully!");
  }
}

export async function seedDatabase() {
  try {
    // Clean up duplicates first (remove duplicate frameworks, policies, processes, procedures by name/title)
    console.log("Checking for and removing duplicates...");
    await db.execute(sql`
      DELETE FROM frameworks WHERE id IN (
        SELECT id FROM (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY name ORDER BY id) as rn FROM frameworks
        ) t WHERE rn > 1
      )
    `);
    await db.execute(sql`
      DELETE FROM policies WHERE id IN (
        SELECT id FROM (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY title ORDER BY id) as rn FROM policies
        ) t WHERE rn > 1
      )
    `);
    await db.execute(sql`
      DELETE FROM processes WHERE id IN (
        SELECT id FROM (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY title ORDER BY id) as rn FROM processes
        ) t WHERE rn > 1
      )
    `);
    await db.execute(sql`
      DELETE FROM procedures WHERE id IN (
        SELECT id FROM (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY title ORDER BY id) as rn FROM procedures
        ) t WHERE rn > 1
      )
    `);
    
    // Check if already seeded with CORRECT data (6 named tenants AND frameworks/policies exist)
    const existingTenants = await db.select().from(tenants);
    const existingFrameworks = await db.select().from(frameworks);
    const existingPolicies = await db.select().from(policies);
    
    // If we have any existing tenants and frameworks, consider it seeded
    // Avoid reseeding due to complex foreign key dependencies
    const isFullySeeded = existingTenants.length > 0 && existingFrameworks.length > 0 && existingPolicies.length > 0;
    
    if (isFullySeeded) {
      // Check if report templates exist, if not seed them
      const existingReports = await db.select().from(reportTemplates);
      if (existingReports.length === 0) {
        console.log("Seeding report templates...");
        await seedReportTemplates();
      }
      // Always ensure risk catalog is seeded
      await seedRiskCatalog();
      // Always ensure processes and procedures are seeded
      await seedProcessesAndProcedures();
      // Always ensure questionnaire templates are seeded
      await seedQuestionnaireTemplates();
      // Always ensure privacy reference data is seeded
      await seedPrivacyReferenceData();
      console.log("Database already seeded with correct data");
      return;
    }
    
    // Skip reseeding if data already exists - use database admin to clear if fresh reseed needed
    console.log("Seeding database...");

    // Check if regions exist, use existing or create new
    let usRegion, euRegion, apacRegion, meRegion;
    const existingRegions = await db.select().from(regions);
    
    if (existingRegions.length >= 4) {
      usRegion = existingRegions.find(r => r.code === "us-east-1") || existingRegions[0];
      euRegion = existingRegions.find(r => r.code === "eu-west-1") || existingRegions[1];
      apacRegion = existingRegions.find(r => r.code === "ap-southeast-1") || existingRegions[2];
      meRegion = existingRegions.find(r => r.code === "me-south-1") || existingRegions[3];
    } else {
      [usRegion, euRegion, apacRegion, meRegion] = await db.insert(regions).values([
        { name: "United States", code: "us-east-1", description: "US East (N. Virginia)" },
        { name: "European Union", code: "eu-west-1", description: "EU (Ireland)" },
        { name: "Asia Pacific", code: "ap-southeast-1", description: "Asia Pacific (Singapore)" },
        { name: "Middle East", code: "me-south-1", description: "Middle East (Bahrain)" },
      ]).returning();
    }

    // Check if tenants exist, use existing or create new
    let kalaamTenant, vincaTenant, cibervestTenant;
    
    // Try to find existing tenants or create new ones
    const existingKalaam = existingTenants.find(t => t.name === "Kalaam Telecom");
    const existingVinca = existingTenants.find(t => t.name === "Vinca Cyber");
    const existingCibervest = existingTenants.find(t => t.name === "Cibervest Security");
    
    if (existingKalaam && existingVinca && existingCibervest) {
      kalaamTenant = existingKalaam;
      vincaTenant = existingVinca;
      cibervestTenant = existingCibervest;
    } else if (existingTenants.length === 0) {
      [kalaamTenant, vincaTenant, cibervestTenant] = await db.insert(tenants).values([
        {
          name: "Kalaam Telecom",
          slug: "kalaam",
          regionId: meRegion.id,
          industry: "Telecommunications",
          subIndustry: "Enterprise Communications",
          country: "Bahrain",
          website: "https://kalaam.com",
          description: "Kalaam Telecom is a leading telecommunications provider in the Gulf region, offering enterprise communications, cloud services, and managed security solutions.",
          size: "Enterprise",
          status: "active",
          settings: {
            region: "Gulf",
            branding: {
              logoUrl: "https://ui-avatars.com/api/?name=KT&size=128&background=1565c0&color=fff&bold=true",
              primaryColor: "#1565c0",
              companyTagline: "Connecting the Future"
            }
          },
          aiProfile: {
            founded: "2004",
            markets: ["Bahrain", "Saudi Arabia", "UAE", "Kuwait"],
            services: ["Enterprise Communications", "Cloud Services", "Managed Security", "Data Centers"],
            employees: "500+",
            certifications: ["ISO 27001", "ISO 9001", "PCI DSS"],
            compliance_focus: ["NCA ECC", "CBB", "SAMA CSF", "GDPR"]
          },
          authorizedEmails: ["kalaam.com", "kalaamtelecom.com"],
          allowOpenSignup: false,
        },
        {
          name: "Vinca Cyber",
          slug: "vinca",
          regionId: apacRegion.id,
          industry: "Cybersecurity",
          subIndustry: "Security Consulting",
          country: "India",
          website: "https://vincacyber.com",
          description: "Vinca Cyber is a cybersecurity consulting firm specializing in GRC, penetration testing, and security operations for enterprises across Asia-Pacific.",
          size: "Mid-Market",
          status: "active",
          settings: {
            region: "APAC",
            branding: {
              logoUrl: "https://ui-avatars.com/api/?name=VC&size=128&background=7b1fa2&color=fff&bold=true",
              primaryColor: "#7b1fa2",
              companyTagline: "Securing Digital Futures"
            }
          },
          aiProfile: {
            founded: "2015",
            markets: ["India", "Singapore", "UAE", "Australia"],
            services: ["GRC Consulting", "Penetration Testing", "SOC Services", "Compliance Audits"],
            employees: "100-200",
            certifications: ["ISO 27001", "CREST", "CERT-IN"],
            compliance_focus: ["DPDP", "RBI CSF", "ISO 27001", "SOC 2"]
          },
          authorizedEmails: ["vincacyber.com", "vinca.in"],
          allowOpenSignup: false,
        },
        {
          name: "Cibervest Security",
          slug: "cibervest",
          regionId: usRegion.id,
          industry: "Cybersecurity",
          subIndustry: "Managed Security Services",
          country: "United States",
          website: "https://cibervest.com",
          description: "Cibervest Security provides enterprise-grade managed security services, threat intelligence, and compliance solutions to Fortune 500 companies.",
          size: "Enterprise",
          status: "active",
          settings: {
            region: "Americas",
            branding: {
              logoUrl: "https://ui-avatars.com/api/?name=CS&size=128&background=00695c&color=fff&bold=true",
              primaryColor: "#00695c",
              companyTagline: "Enterprise Security Excellence"
            }
          },
          aiProfile: {
            founded: "2010",
            markets: ["United States", "Canada", "Europe"],
            services: ["MSSP", "Threat Intelligence", "Incident Response", "Compliance Management"],
            employees: "300+",
            certifications: ["SOC 2 Type II", "ISO 27001", "FedRAMP"],
            compliance_focus: ["NIST CSF", "SOC 2", "HIPAA", "CMMC"]
          },
          authorizedEmails: ["cibervest.com", "cibervest.io"],
          allowOpenSignup: false,
        },
      ]).returning();
    } else {
      // Tenants exist but aren't our expected ones - just use first 3 existing tenants
      kalaamTenant = existingTenants[0];
      vincaTenant = existingTenants[1] || existingTenants[0];
      cibervestTenant = existingTenants[2] || existingTenants[0];
    }

    // Set demo tenant for backward compatibility
    const demoTenant = kalaamTenant;

    // Check if users already exist
    const existingUsers = await db.select().from(users);
    let superAdmin: any, kalaamAdmin: any, kalaamAuditor: any, kalaamUser: any;
    
    // Check for existing super admin and kalaam admin
    const existingSuperAdmin = existingUsers.find(u => u.role === "super_admin");
    const existingKalaamAdmin = existingUsers.find(u => u.email === "admin@kalaam.com");
    
    // Use existing users if found, otherwise create new ones
    // If we have a super admin, assume database is already seeded with users
    if (existingSuperAdmin) {
      superAdmin = existingSuperAdmin;
      kalaamAdmin = existingKalaamAdmin || existingUsers.find(u => u.role === "tenant_admin") || existingSuperAdmin;
      kalaamAuditor = existingUsers.find(u => u.email === "auditor@kalaam.com") || existingUsers.find(u => u.role === "auditor") || existingSuperAdmin;
      kalaamUser = existingUsers.find(u => u.email === "user@kalaam.com") || existingUsers.find(u => u.role === "end_user") || existingSuperAdmin;
      // Skip additional seeding as users already exist
      console.log("Users already exist, skipping user seeding...");
      // Always ensure core data is seeded
      await seedRiskCatalog();
      await seedGlobalPolicies();
      await seedProcessesAndProcedures();
      await seedQuestionnaireTemplates();
      console.log("Database core data seeded");
      return;
    } else {
      // Seed Super Admin (global)
      const adminPassword = await bcrypt.hash("Admin@123", 12);
      [superAdmin] = await db.insert(users).values([
        {
          username: "admin",
          email: "admin@grcshield.com",
          password: adminPassword,
          firstName: "Super",
          lastName: "Admin",
          role: "super_admin",
          tenantId: null,
          department: "Platform Administration",
          title: "Super Administrator",
          language: "en",
          isActive: true,
        },
      ]).returning();

      // Seed Users for Kalaam Telecom
      const userPassword = await bcrypt.hash("User@123", 12);
      [kalaamAdmin, kalaamAuditor, kalaamUser] = await db.insert(users).values([
        {
          username: "admin@kalaam.com",
          email: "admin@kalaam.com",
          password: userPassword,
          firstName: "Mohammed",
          lastName: "Al-Rashid",
          role: "tenant_admin",
          tenantId: kalaamTenant.id,
          department: "IT Security",
          title: "CISO",
          language: "ar",
          isActive: true,
        },
        {
          username: "auditor@kalaam.com",
          email: "auditor@kalaam.com",
          password: userPassword,
          firstName: "Sara",
          lastName: "Al-Bahrani",
          role: "auditor",
          tenantId: kalaamTenant.id,
          department: "Internal Audit",
          title: "Senior Auditor",
          language: "ar",
          isActive: true,
        },
        {
          username: "user@kalaam.com",
          email: "user@kalaam.com",
          password: userPassword,
          firstName: "Ali",
          lastName: "Hassan",
          role: "end_user",
          tenantId: kalaamTenant.id,
          department: "Network Operations",
          title: "Network Engineer",
          language: "ar",
          isActive: true,
        },
      ]).returning();

      // Seed Users for Vinca Cyber
      await db.insert(users).values([
        {
          username: "admin@vinca.com",
          email: "admin@vinca.com",
          password: userPassword,
          firstName: "Raj",
          lastName: "Patel",
          role: "tenant_admin",
          tenantId: vincaTenant.id,
          department: "Security",
          title: "Security Director",
          language: "en",
          isActive: true,
        },
        {
          username: "auditor@vinca.com",
          email: "auditor@vinca.com",
          password: userPassword,
          firstName: "Priya",
          lastName: "Sharma",
          role: "auditor",
          tenantId: vincaTenant.id,
          department: "Compliance",
          title: "Lead Auditor",
          language: "hi",
          isActive: true,
        },
      ]);

      // Seed Users for Cibervest Security
      await db.insert(users).values([
        {
          username: "admin@cibervest.com",
          email: "admin@cibervest.com",
          password: userPassword,
          firstName: "Michael",
          lastName: "Thompson",
          role: "tenant_admin",
          tenantId: cibervestTenant.id,
          department: "Security Operations",
          title: "VP Security",
          language: "en",
          isActive: true,
        },
        {
          username: "auditor@cibervest.com",
          email: "auditor@cibervest.com",
          password: userPassword,
          firstName: "Jennifer",
          lastName: "Martinez",
          role: "auditor",
          tenantId: cibervestTenant.id,
          department: "Compliance",
          title: "Compliance Manager",
          language: "en",
          isActive: true,
        },
      ]);
    }

    // Backward compatibility aliases
    const adminUser = kalaamAdmin;
    const auditorUser = kalaamAuditor;
    const endUser = kalaamUser;

    // Seed Licenses for all tenants
    await db.insert(licenses).values([
      {
        tenantId: kalaamTenant.id,
        licenseType: "enterprise",
        maxUsers: 500,
        maxAdmins: 10,
        maxAuditors: 20,
        allowedFrameworks: ["ISO 27001", "NCA ECC", "CBB", "SAMA CSF", "PCI DSS", "GDPR"],
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        tenantId: vincaTenant.id,
        licenseType: "professional",
        maxUsers: 100,
        maxAdmins: 3,
        maxAuditors: 5,
        allowedFrameworks: ["ISO 27001", "SOC 2", "DPDP", "RBI CSF", "NIST CSF"],
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        tenantId: cibervestTenant.id,
        licenseType: "enterprise",
        maxUsers: 300,
        maxAdmins: 8,
        maxAuditors: 15,
        allowedFrameworks: ["NIST CSF", "SOC 2", "HIPAA", "CMMC", "FedRAMP", "ISO 27001"],
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    ]);

    // Seed Frameworks
    const seededFrameworks = await db.insert(frameworks).values([
      {
        name: "ISO 27001:2022",
        shortName: "ISO 27001",
        version: "2022",
        description: "Information Security Management System",
        category: "security",
        region: "Global",
        controlCount: 114,
        isGlobal: true,
      },
      {
        name: "SOC 2 Type II",
        shortName: "SOC 2",
        version: "2017",
        description: "Service Organization Controls",
        category: "security",
        region: "Global",
        controlCount: 81,
        isGlobal: true,
      },
      {
        name: "General Data Protection Regulation",
        shortName: "GDPR",
        version: "2018",
        description: "EU Data Protection Regulation",
        category: "privacy",
        region: "European Union",
        controlCount: 50,
        isGlobal: false,
      },
      {
        name: "PCI DSS v4.0",
        shortName: "PCI DSS",
        version: "4.0",
        description: "Payment Card Industry Data Security Standard",
        category: "industry",
        region: "Global",
        controlCount: 300,
        isGlobal: true,
      },
      {
        name: "NIST Cybersecurity Framework 2.0",
        shortName: "NIST CSF",
        version: "2.0",
        description: "Cybersecurity Framework",
        category: "security",
        region: "United States",
        controlCount: 106,
        isGlobal: false,
      },
      {
        name: "HIPAA",
        shortName: "HIPAA",
        version: "1996",
        description: "Health Insurance Portability and Accountability Act",
        category: "industry",
        region: "United States",
        controlCount: 75,
        isGlobal: false,
      },
    ]).returning();

    // Get framework references for controls
    const isoFramework = seededFrameworks.find(f => f.shortName === "ISO 27001");
    const soc2Framework = seededFrameworks.find(f => f.shortName === "SOC 2");
    const gdprFramework = seededFrameworks.find(f => f.shortName === "GDPR");
    const pciFramework = seededFrameworks.find(f => f.shortName === "PCI DSS");
    const nistFramework = seededFrameworks.find(f => f.shortName === "NIST CSF");

    // Seed Controls for ISO 27001:2022
    if (isoFramework) {
      await db.insert(controls).values([
        // A.5 - Organizational Controls
        { frameworkId: isoFramework.id, controlId: "A.5.1", title: "Policies for information security", description: "Information security policy and topic-specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and relevant interested parties, and reviewed at planned intervals and if significant changes occur.", category: "Organizational Controls", guidance: "Define and maintain an information security policy framework", evidenceRequirements: ["Information security policy document", "Policy acknowledgment records", "Review meeting minutes"] },
        { frameworkId: isoFramework.id, controlId: "A.5.2", title: "Information security roles and responsibilities", description: "Information security roles and responsibilities shall be defined and allocated according to the organization needs.", category: "Organizational Controls", guidance: "Establish clear roles and responsibilities for information security", evidenceRequirements: ["RACI matrix", "Job descriptions", "Organizational chart"] },
        { frameworkId: isoFramework.id, controlId: "A.5.3", title: "Segregation of duties", description: "Conflicting duties and conflicting areas of responsibility shall be segregated.", category: "Organizational Controls", guidance: "Implement separation of duties to reduce risk of fraud or error", evidenceRequirements: ["Segregation of duties matrix", "Access control reports", "Workflow approvals"] },
        { frameworkId: isoFramework.id, controlId: "A.5.4", title: "Management responsibilities", description: "Management shall require all personnel to apply information security in accordance with the established information security policy, topic-specific policies and procedures of the organization.", category: "Organizational Controls", guidance: "Ensure management enforces security policies", evidenceRequirements: ["Management directives", "Security awareness training records", "Policy compliance reports"] },
        { frameworkId: isoFramework.id, controlId: "A.5.5", title: "Contact with authorities", description: "The organization shall establish and maintain contact with relevant authorities.", category: "Organizational Controls", guidance: "Maintain relationships with regulatory bodies and law enforcement", evidenceRequirements: ["Contact list of authorities", "Communication records", "Incident reporting procedures"] },
        { frameworkId: isoFramework.id, controlId: "A.5.6", title: "Contact with special interest groups", description: "The organization shall establish and maintain contact with special interest groups or other specialist security forums and professional associations.", category: "Organizational Controls", guidance: "Engage with security communities and industry groups", evidenceRequirements: ["Membership records", "Meeting attendance records", "Information sharing agreements"] },
        { frameworkId: isoFramework.id, controlId: "A.5.7", title: "Threat intelligence", description: "Information relating to information security threats shall be collected and analysed to produce threat intelligence.", category: "Organizational Controls", guidance: "Establish threat intelligence capabilities", evidenceRequirements: ["Threat intelligence feeds", "Analysis reports", "Risk assessments"] },
        { frameworkId: isoFramework.id, controlId: "A.5.8", title: "Information security in project management", description: "Information security shall be integrated into project management.", category: "Organizational Controls", guidance: "Include security in project lifecycle", evidenceRequirements: ["Project security checklists", "Security sign-off records", "Risk assessments"] },
        // A.6 - People Controls
        { frameworkId: isoFramework.id, controlId: "A.6.1", title: "Screening", description: "Background verification checks on all candidates to become personnel shall be carried out prior to joining the organization and on an ongoing basis taking into consideration applicable laws, regulations and ethics and be proportional to the business requirements, the classification of the information to be accessed and the perceived risks.", category: "People Controls", guidance: "Conduct background checks on all personnel", evidenceRequirements: ["Background check records", "Screening policy", "Verification certificates"] },
        { frameworkId: isoFramework.id, controlId: "A.6.2", title: "Terms and conditions of employment", description: "The employment contractual agreements shall state the personnel's and the organization's responsibilities for information security.", category: "People Controls", guidance: "Include security clauses in employment contracts", evidenceRequirements: ["Employment contracts", "NDA agreements", "Security responsibility statements"] },
        { frameworkId: isoFramework.id, controlId: "A.6.3", title: "Information security awareness, education and training", description: "Personnel of the organization and relevant interested parties shall receive appropriate information security awareness, education and training and regular updates of the organization's information security policy, topic-specific policies and procedures, as relevant for their job function.", category: "People Controls", guidance: "Provide security awareness training to all personnel", evidenceRequirements: ["Training records", "Awareness program materials", "Quiz/assessment results"] },
        { frameworkId: isoFramework.id, controlId: "A.6.4", title: "Disciplinary process", description: "A disciplinary process shall be formalized and communicated to take actions against personnel and other relevant interested parties who have committed an information security policy violation.", category: "People Controls", guidance: "Establish disciplinary procedures for security violations", evidenceRequirements: ["Disciplinary policy", "Violation records", "Action taken documentation"] },
        { frameworkId: isoFramework.id, controlId: "A.6.5", title: "Responsibilities after termination or change of employment", description: "Information security responsibilities and duties that remain valid after termination or change of employment shall be defined, enforced and communicated to relevant personnel and other interested parties.", category: "People Controls", guidance: "Define post-employment security responsibilities", evidenceRequirements: ["Exit procedures", "NDA continuation records", "Access revocation records"] },
        // A.7 - Physical Controls
        { frameworkId: isoFramework.id, controlId: "A.7.1", title: "Physical security perimeters", description: "Security perimeters shall be defined and used to protect areas that contain information and other associated assets.", category: "Physical Controls", guidance: "Define physical security boundaries", evidenceRequirements: ["Facility plans", "Perimeter security assessment", "Access control system logs"] },
        { frameworkId: isoFramework.id, controlId: "A.7.2", title: "Physical entry", description: "Secure areas shall be protected by appropriate entry controls to ensure that only authorized personnel are allowed access.", category: "Physical Controls", guidance: "Implement physical access controls", evidenceRequirements: ["Access logs", "Visitor logs", "Badge system records"] },
        { frameworkId: isoFramework.id, controlId: "A.7.3", title: "Securing offices, rooms and facilities", description: "Physical security for offices, rooms and facilities shall be designed and implemented.", category: "Physical Controls", guidance: "Secure physical work areas", evidenceRequirements: ["Physical security assessments", "Lock and key records", "CCTV coverage maps"] },
        { frameworkId: isoFramework.id, controlId: "A.7.4", title: "Physical security monitoring", description: "Premises shall be continuously monitored for unauthorized physical access.", category: "Physical Controls", guidance: "Monitor physical access attempts", evidenceRequirements: ["CCTV footage retention policy", "Monitoring logs", "Incident reports"] },
        // A.8 - Technological Controls
        { frameworkId: isoFramework.id, controlId: "A.8.1", title: "User endpoint devices", description: "Information stored on, processed by or accessible via user endpoint devices shall be protected.", category: "Technological Controls", guidance: "Secure endpoint devices", evidenceRequirements: ["Endpoint protection policy", "MDM enrollment records", "Encryption status reports"] },
        { frameworkId: isoFramework.id, controlId: "A.8.2", title: "Privileged access rights", description: "The allocation and use of privileged access rights shall be restricted and managed.", category: "Technological Controls", guidance: "Control privileged access", evidenceRequirements: ["Privileged account inventory", "Access review records", "PAM system logs"] },
        { frameworkId: isoFramework.id, controlId: "A.8.3", title: "Information access restriction", description: "Access to information and other associated assets shall be restricted in accordance with the established topic-specific policy on access control.", category: "Technological Controls", guidance: "Restrict access based on classification", evidenceRequirements: ["Access control lists", "Role-based access matrix", "Access request logs"] },
        { frameworkId: isoFramework.id, controlId: "A.8.4", title: "Access to source code", description: "Read and write access to source code, development tools and software libraries shall be appropriately managed.", category: "Technological Controls", guidance: "Control source code access", evidenceRequirements: ["Repository access logs", "Code review records", "Version control policies"] },
        { frameworkId: isoFramework.id, controlId: "A.8.5", title: "Secure authentication", description: "Secure authentication technologies and procedures shall be implemented based on information access restrictions and the topic-specific policy on access control.", category: "Technological Controls", guidance: "Implement strong authentication", evidenceRequirements: ["Authentication policy", "MFA enrollment records", "Password policy compliance"] },
        { frameworkId: isoFramework.id, controlId: "A.8.6", title: "Capacity management", description: "The use of resources shall be monitored and adjusted in line with current and expected capacity requirements.", category: "Technological Controls", guidance: "Monitor and plan for capacity needs", evidenceRequirements: ["Capacity monitoring reports", "Trend analysis", "Capacity planning documents"] },
        { frameworkId: isoFramework.id, controlId: "A.8.7", title: "Protection against malware", description: "Protection against malware shall be implemented and supported by appropriate user awareness.", category: "Technological Controls", guidance: "Deploy anti-malware solutions", evidenceRequirements: ["Anti-malware deployment records", "Scan reports", "Incident response records"] },
        { frameworkId: isoFramework.id, controlId: "A.8.8", title: "Management of technical vulnerabilities", description: "Information about technical vulnerabilities of information systems in use shall be obtained, the organization's exposure to such vulnerabilities shall be evaluated and appropriate measures shall be taken.", category: "Technological Controls", guidance: "Manage technical vulnerabilities", evidenceRequirements: ["Vulnerability scan reports", "Patch management records", "Risk assessments"] },
        { frameworkId: isoFramework.id, controlId: "A.8.9", title: "Configuration management", description: "Configurations, including security configurations, of hardware, software, services and networks shall be established, documented, implemented, monitored and reviewed.", category: "Technological Controls", guidance: "Manage system configurations", evidenceRequirements: ["Configuration baselines", "Change records", "Compliance reports"] },
        { frameworkId: isoFramework.id, controlId: "A.8.10", title: "Information deletion", description: "Information stored in information systems, devices or in any other storage media shall be deleted when no longer required.", category: "Technological Controls", guidance: "Implement secure data deletion", evidenceRequirements: ["Data retention schedules", "Deletion certificates", "Disposal records"] },
        { frameworkId: isoFramework.id, controlId: "A.8.11", title: "Data masking", description: "Data masking shall be used in accordance with the organization's topic-specific policy on access control and other related topic-specific policies, and business requirements, taking applicable legislation into consideration.", category: "Technological Controls", guidance: "Implement data masking", evidenceRequirements: ["Data masking policy", "Implementation records", "Access logs"] },
        { frameworkId: isoFramework.id, controlId: "A.8.12", title: "Data leakage prevention", description: "Data leakage prevention measures shall be applied to systems, networks and any other devices that process, store or transmit sensitive information.", category: "Technological Controls", guidance: "Deploy DLP solutions", evidenceRequirements: ["DLP policy", "Implementation records", "Incident reports"] },
        { frameworkId: isoFramework.id, controlId: "A.8.13", title: "Information backup", description: "Backup copies of information, software and systems shall be maintained and regularly tested in accordance with the agreed topic-specific policy on backup.", category: "Technological Controls", guidance: "Implement backup procedures", evidenceRequirements: ["Backup policy", "Backup logs", "Restore test records"] },
        { frameworkId: isoFramework.id, controlId: "A.8.14", title: "Redundancy of information processing facilities", description: "Information processing facilities shall be implemented with redundancy sufficient to meet availability requirements.", category: "Technological Controls", guidance: "Implement redundancy", evidenceRequirements: ["Redundancy architecture", "Failover test records", "Availability reports"] },
        { frameworkId: isoFramework.id, controlId: "A.8.15", title: "Logging", description: "Logs that record activities, exceptions, faults and other relevant events shall be produced, stored, protected and analysed.", category: "Technological Controls", guidance: "Implement comprehensive logging", evidenceRequirements: ["Logging policy", "Log retention records", "Log analysis reports"] },
        { frameworkId: isoFramework.id, controlId: "A.8.16", title: "Monitoring activities", description: "Networks, systems and applications shall be monitored for anomalous behaviour and appropriate actions taken to evaluate potential information security incidents.", category: "Technological Controls", guidance: "Monitor for security events", evidenceRequirements: ["Monitoring procedures", "Alert records", "Incident reports"] },
        { frameworkId: isoFramework.id, controlId: "A.8.17", title: "Clock synchronization", description: "The clocks of information processing systems used by the organization shall be synchronized to approved time sources.", category: "Technological Controls", guidance: "Synchronize system clocks", evidenceRequirements: ["NTP configuration", "Time synchronization logs", "Audit trails"] },
        { frameworkId: isoFramework.id, controlId: "A.8.18", title: "Use of privileged utility programs", description: "The use of utility programs that might be capable of overriding system and application controls shall be restricted and tightly controlled.", category: "Technological Controls", guidance: "Control privileged utilities", evidenceRequirements: ["Utility inventory", "Access controls", "Usage logs"] },
        { frameworkId: isoFramework.id, controlId: "A.8.19", title: "Installation of software on operational systems", description: "Procedures and measures shall be implemented to securely manage software installation on operational systems.", category: "Technological Controls", guidance: "Control software installation", evidenceRequirements: ["Software installation policy", "Approval records", "Deployment logs"] },
        { frameworkId: isoFramework.id, controlId: "A.8.20", title: "Networks security", description: "Networks and network devices shall be secured, managed and controlled to protect information in systems and applications.", category: "Technological Controls", guidance: "Secure network infrastructure", evidenceRequirements: ["Network architecture", "Firewall rules", "Security assessments"] },
        { frameworkId: isoFramework.id, controlId: "A.8.21", title: "Security of network services", description: "Security mechanisms, service levels and service requirements of network services shall be identified, implemented and monitored.", category: "Technological Controls", guidance: "Secure network services", evidenceRequirements: ["Service level agreements", "Security assessments", "Monitoring reports"] },
        { frameworkId: isoFramework.id, controlId: "A.8.22", title: "Segregation of networks", description: "Groups of information services, users and information systems shall be segregated in the organization's networks.", category: "Technological Controls", guidance: "Implement network segmentation", evidenceRequirements: ["Network diagrams", "Segmentation policy", "Firewall rules"] },
        { frameworkId: isoFramework.id, controlId: "A.8.23", title: "Web filtering", description: "Access to external websites shall be managed to reduce exposure to malicious content.", category: "Technological Controls", guidance: "Implement web filtering", evidenceRequirements: ["Web filtering policy", "Configuration records", "Block logs"] },
        { frameworkId: isoFramework.id, controlId: "A.8.24", title: "Use of cryptography", description: "Rules for the effective use of cryptography, including cryptographic key management, shall be defined and implemented.", category: "Technological Controls", guidance: "Implement cryptographic controls", evidenceRequirements: ["Cryptography policy", "Key management records", "Encryption deployment records"] },
        { frameworkId: isoFramework.id, controlId: "A.8.25", title: "Secure development life cycle", description: "Rules for the secure development of software and systems shall be established and applied.", category: "Technological Controls", guidance: "Implement secure SDLC", evidenceRequirements: ["SDLC policy", "Security requirements", "Code review records"] },
        { frameworkId: isoFramework.id, controlId: "A.8.26", title: "Application security requirements", description: "Information security requirements shall be identified, specified and approved when developing or acquiring applications.", category: "Technological Controls", guidance: "Define application security requirements", evidenceRequirements: ["Security requirements documents", "Approval records", "Testing records"] },
        { frameworkId: isoFramework.id, controlId: "A.8.27", title: "Secure system architecture and engineering principles", description: "Principles for engineering secure systems shall be established, documented, maintained and applied to any information system development activities.", category: "Technological Controls", guidance: "Apply secure design principles", evidenceRequirements: ["Architecture standards", "Design reviews", "Security assessments"] },
        { frameworkId: isoFramework.id, controlId: "A.8.28", title: "Secure coding", description: "Secure coding principles shall be applied to software development.", category: "Technological Controls", guidance: "Implement secure coding practices", evidenceRequirements: ["Coding standards", "Code review records", "SAST reports"] },
        { frameworkId: isoFramework.id, controlId: "A.8.29", title: "Security testing in development and acceptance", description: "Security testing processes shall be defined and implemented in the development life cycle.", category: "Technological Controls", guidance: "Conduct security testing", evidenceRequirements: ["Testing procedures", "Test results", "Acceptance records"] },
        { frameworkId: isoFramework.id, controlId: "A.8.30", title: "Outsourced development", description: "The organization shall direct, monitor and review the activities related to outsourced system development.", category: "Technological Controls", guidance: "Manage outsourced development", evidenceRequirements: ["Vendor agreements", "Review records", "Acceptance testing"] },
        { frameworkId: isoFramework.id, controlId: "A.8.31", title: "Separation of development, test and production environments", description: "Development, testing and production environments shall be separated and secured.", category: "Technological Controls", guidance: "Separate environments", evidenceRequirements: ["Environment documentation", "Access controls", "Change management records"] },
        { frameworkId: isoFramework.id, controlId: "A.8.32", title: "Change management", description: "Changes to information processing facilities and information systems shall be subject to change management procedures.", category: "Technological Controls", guidance: "Implement change management", evidenceRequirements: ["Change management policy", "Change records", "Approval logs"] },
        { frameworkId: isoFramework.id, controlId: "A.8.33", title: "Test information", description: "Test information shall be appropriately selected, protected and managed.", category: "Technological Controls", guidance: "Protect test data", evidenceRequirements: ["Test data policy", "Data masking records", "Access controls"] },
        { frameworkId: isoFramework.id, controlId: "A.8.34", title: "Protection of information systems during audit testing", description: "Audit tests and other assurance activities involving assessment of operational systems shall be planned and agreed between the tester and appropriate management.", category: "Technological Controls", guidance: "Plan and control audit testing", evidenceRequirements: ["Audit test plans", "Approval records", "Access logs"] },
      ]);
    }

    // Seed Controls for SOC 2
    if (soc2Framework) {
      await db.insert(controls).values([
        { frameworkId: soc2Framework.id, controlId: "CC1.1", title: "COSO Principle 1", description: "The entity demonstrates a commitment to integrity and ethical values.", category: "Control Environment", guidance: "Establish tone at the top for ethics and integrity", evidenceRequirements: ["Code of conduct", "Ethics training records", "Compliance certifications"] },
        { frameworkId: soc2Framework.id, controlId: "CC1.2", title: "COSO Principle 2", description: "The board of directors demonstrates independence from management and exercises oversight.", category: "Control Environment", guidance: "Ensure board independence and oversight", evidenceRequirements: ["Board charter", "Meeting minutes", "Independence declarations"] },
        { frameworkId: soc2Framework.id, controlId: "CC1.3", title: "COSO Principle 3", description: "Management establishes structures, reporting lines, and appropriate authorities and responsibilities.", category: "Control Environment", guidance: "Define organizational structure and responsibilities", evidenceRequirements: ["Org charts", "RACI matrices", "Job descriptions"] },
        { frameworkId: soc2Framework.id, controlId: "CC1.4", title: "COSO Principle 4", description: "The entity demonstrates a commitment to attract, develop, and retain competent individuals.", category: "Control Environment", guidance: "Attract and retain skilled personnel", evidenceRequirements: ["HR policies", "Training records", "Performance reviews"] },
        { frameworkId: soc2Framework.id, controlId: "CC1.5", title: "COSO Principle 5", description: "The entity holds individuals accountable for their internal control responsibilities.", category: "Control Environment", guidance: "Establish accountability for controls", evidenceRequirements: ["Performance metrics", "Accountability policies", "Disciplinary records"] },
        { frameworkId: soc2Framework.id, controlId: "CC2.1", title: "COSO Principle 13", description: "The entity obtains or generates and uses relevant, quality information.", category: "Communication and Information", guidance: "Ensure quality information", evidenceRequirements: ["Data quality policies", "Information classification", "Validation procedures"] },
        { frameworkId: soc2Framework.id, controlId: "CC2.2", title: "COSO Principle 14", description: "The entity internally communicates information necessary to support the functioning of internal control.", category: "Communication and Information", guidance: "Establish internal communication channels", evidenceRequirements: ["Communication policies", "Meeting records", "Training materials"] },
        { frameworkId: soc2Framework.id, controlId: "CC2.3", title: "COSO Principle 15", description: "The entity communicates with external parties.", category: "Communication and Information", guidance: "Manage external communications", evidenceRequirements: ["External communication policies", "Stakeholder communications", "Disclosure records"] },
        { frameworkId: soc2Framework.id, controlId: "CC3.1", title: "COSO Principle 6", description: "The entity specifies objectives with sufficient clarity.", category: "Risk Assessment", guidance: "Define clear objectives", evidenceRequirements: ["Objective statements", "Strategic plans", "KPIs"] },
        { frameworkId: soc2Framework.id, controlId: "CC3.2", title: "COSO Principle 7", description: "The entity identifies risks to the achievement of its objectives.", category: "Risk Assessment", guidance: "Identify organizational risks", evidenceRequirements: ["Risk register", "Risk assessments", "Threat analysis"] },
        { frameworkId: soc2Framework.id, controlId: "CC3.3", title: "COSO Principle 8", description: "The entity considers the potential for fraud.", category: "Risk Assessment", guidance: "Assess fraud risks", evidenceRequirements: ["Fraud risk assessment", "Anti-fraud controls", "Monitoring reports"] },
        { frameworkId: soc2Framework.id, controlId: "CC3.4", title: "COSO Principle 9", description: "The entity identifies and assesses changes that could significantly impact internal control.", category: "Risk Assessment", guidance: "Assess impact of changes", evidenceRequirements: ["Change risk assessments", "Impact analysis", "Control updates"] },
        { frameworkId: soc2Framework.id, controlId: "CC4.1", title: "COSO Principle 16", description: "The entity selects, develops, and performs ongoing evaluations to ascertain internal control is present and functioning.", category: "Monitoring Activities", guidance: "Monitor control effectiveness", evidenceRequirements: ["Control testing records", "Monitoring reports", "Effectiveness assessments"] },
        { frameworkId: soc2Framework.id, controlId: "CC4.2", title: "COSO Principle 17", description: "The entity evaluates and communicates internal control deficiencies.", category: "Monitoring Activities", guidance: "Report control deficiencies", evidenceRequirements: ["Deficiency reports", "Remediation plans", "Management communications"] },
        { frameworkId: soc2Framework.id, controlId: "CC5.1", title: "COSO Principle 10", description: "The entity selects and develops control activities that contribute to mitigation of risks.", category: "Control Activities", guidance: "Develop risk mitigation controls", evidenceRequirements: ["Control design documentation", "Risk-control mapping", "Testing records"] },
        { frameworkId: soc2Framework.id, controlId: "CC5.2", title: "COSO Principle 11", description: "The entity selects and develops general control activities over technology.", category: "Control Activities", guidance: "Implement IT general controls", evidenceRequirements: ["IT control policies", "Technical documentation", "Testing records"] },
        { frameworkId: soc2Framework.id, controlId: "CC5.3", title: "COSO Principle 12", description: "The entity deploys control activities through policies and procedures.", category: "Control Activities", guidance: "Document and deploy controls", evidenceRequirements: ["Policy documents", "Procedure manuals", "Deployment records"] },
        { frameworkId: soc2Framework.id, controlId: "CC6.1", title: "Logical and Physical Access", description: "The entity implements logical access security software, infrastructure, and architectures.", category: "Logical and Physical Access", guidance: "Implement access controls", evidenceRequirements: ["Access control policies", "Technical configurations", "Access logs"] },
        { frameworkId: soc2Framework.id, controlId: "CC6.2", title: "System Access Provisioning", description: "Prior to issuing system credentials, the entity registers and authorizes new internal and external users.", category: "Logical and Physical Access", guidance: "Control user provisioning", evidenceRequirements: ["Provisioning procedures", "Authorization records", "Access request forms"] },
        { frameworkId: soc2Framework.id, controlId: "CC6.3", title: "Access Removal", description: "The entity removes access to protected information assets when an individual no longer requires access.", category: "Logical and Physical Access", guidance: "Manage access termination", evidenceRequirements: ["Termination procedures", "Access removal logs", "Periodic reviews"] },
        { frameworkId: soc2Framework.id, controlId: "CC6.6", title: "System Boundaries", description: "The entity implements logical access security measures to protect against threats from sources outside its system boundaries.", category: "Logical and Physical Access", guidance: "Protect system boundaries", evidenceRequirements: ["Firewall rules", "Network diagrams", "Security architecture"] },
        { frameworkId: soc2Framework.id, controlId: "CC6.7", title: "Data Transmission", description: "The entity restricts the transmission, movement, and removal of information to authorized users and processes.", category: "Logical and Physical Access", guidance: "Control data transmission", evidenceRequirements: ["DLP policies", "Encryption records", "Transfer logs"] },
        { frameworkId: soc2Framework.id, controlId: "CC6.8", title: "Malware Prevention", description: "The entity implements controls to prevent or detect and act upon the introduction of unauthorized or malicious software.", category: "Logical and Physical Access", guidance: "Implement malware protection", evidenceRequirements: ["Anti-malware policies", "Scan reports", "Incident records"] },
        { frameworkId: soc2Framework.id, controlId: "CC7.1", title: "Security Monitoring", description: "The entity uses detection and monitoring procedures to identify changes to configurations.", category: "System Operations", guidance: "Monitor security events", evidenceRequirements: ["SIEM configuration", "Alert procedures", "Monitoring reports"] },
        { frameworkId: soc2Framework.id, controlId: "CC7.2", title: "Incident Response", description: "The entity monitors system components and the operation of those components for anomalies.", category: "System Operations", guidance: "Detect and respond to incidents", evidenceRequirements: ["Incident response plan", "Detection procedures", "Incident logs"] },
        { frameworkId: soc2Framework.id, controlId: "CC7.3", title: "Incident Containment", description: "The entity evaluates security events to determine whether they constitute security incidents.", category: "System Operations", guidance: "Classify and contain incidents", evidenceRequirements: ["Classification criteria", "Containment procedures", "Response records"] },
        { frameworkId: soc2Framework.id, controlId: "CC7.4", title: "Incident Recovery", description: "The entity responds to identified security incidents by executing a defined incident response program.", category: "System Operations", guidance: "Execute incident recovery", evidenceRequirements: ["Recovery procedures", "Post-incident reviews", "Lessons learned"] },
        { frameworkId: soc2Framework.id, controlId: "CC8.1", title: "Change Management", description: "The entity authorizes, designs, develops, configures, documents, tests, approves, and implements changes.", category: "Change Management", guidance: "Implement change management", evidenceRequirements: ["Change management policy", "Change records", "Approval logs"] },
        { frameworkId: soc2Framework.id, controlId: "CC9.1", title: "Business Disruption", description: "The entity identifies, selects, and develops risk mitigation activities for risks arising from potential business disruptions.", category: "Risk Mitigation", guidance: "Plan for business continuity", evidenceRequirements: ["BCP plans", "Risk assessments", "Testing records"] },
        { frameworkId: soc2Framework.id, controlId: "CC9.2", title: "Vendor and Business Partner Risks", description: "The entity assesses and manages risks associated with vendors and business partners.", category: "Risk Mitigation", guidance: "Manage third-party risks", evidenceRequirements: ["Vendor assessments", "Contracts", "Monitoring reports"] },
      ]);
    }

    // Seed Comprehensive Policies for All Tenants
    await db.insert(policies).values([
      // Kalaam Telecom Policies
      {
        tenantId: kalaamTenant.id,
        title: "Information Security Policy",
        content: `1. PURPOSE
This policy establishes the framework for protecting PKF International's information assets, ensuring confidentiality, integrity, and availability of all organizational data.

2. SCOPE
This policy applies to all employees, contractors, and third parties who access PKF International's information systems and data.

3. POLICY STATEMENTS
3.1 Information Classification
All information assets must be classified according to their sensitivity level: Public, Internal, Confidential, or Restricted.

3.2 Access Control
Access to information systems shall be granted based on the principle of least privilege and business need-to-know.

3.3 Data Protection
All sensitive data must be encrypted in transit and at rest using approved encryption algorithms.

3.4 Security Awareness
All personnel must complete security awareness training annually and acknowledge this policy.

4. COMPLIANCE
Violations of this policy may result in disciplinary action up to and including termination of employment.

5. REVIEW
This policy shall be reviewed annually or upon significant organizational changes.`,
        category: "Information Security",
        status: "approved",
        version: "3.2",
        ownerId: kalaamAdmin.id,
        approvedBy: kalaamAdmin.id,
        approvedAt: new Date("2025-01-15"),
        effectiveDate: new Date("2025-01-15"),
        reviewDate: new Date("2026-01-15"),
      },
      {
        tenantId: kalaamTenant.id,
        title: "Data Protection & Privacy Policy",
        content: `1. PURPOSE
This policy defines PKF International's commitment to protecting personal data in compliance with GDPR and applicable privacy regulations.

2. SCOPE
This policy covers all personal data processed by PKF International, including employee, client, and third-party data.

3. PRINCIPLES
3.1 Lawfulness, Fairness, and Transparency
Personal data shall be processed lawfully, fairly, and in a transparent manner.

3.2 Purpose Limitation
Data shall be collected for specified, explicit, and legitimate purposes only.

3.3 Data Minimization
Only data necessary for the specified purpose shall be collected and processed.

3.4 Accuracy
Personal data shall be accurate and kept up to date.

3.5 Storage Limitation
Data shall be retained only as long as necessary for the stated purpose.

3.6 Security
Appropriate technical and organizational measures shall protect personal data.

4. DATA SUBJECT RIGHTS
Individuals have the right to access, rectify, erase, restrict processing, and port their personal data.

5. BREACH NOTIFICATION
Data breaches affecting personal data must be reported to the DPO within 24 hours.`,
        category: "Privacy",
        status: "approved",
        version: "2.1",
        ownerId: kalaamAuditor.id,
        approvedBy: kalaamAdmin.id,
        approvedAt: new Date("2025-03-01"),
        effectiveDate: new Date("2025-03-01"),
        reviewDate: new Date("2026-03-01"),
      },
      {
        tenantId: kalaamTenant.id,
        title: "Access Control Policy",
        content: `1. PURPOSE
To establish requirements for controlling access to PKF International's information systems and data.

2. SCOPE
This policy applies to all systems, applications, networks, and data repositories.

3. ACCESS MANAGEMENT
3.1 User Registration
All users must be formally registered and authorized before receiving access credentials.

3.2 Authentication
Multi-factor authentication is required for all remote access and privileged accounts.

3.3 Password Requirements
- Minimum 14 characters
- Complexity requirements (uppercase, lowercase, numbers, special characters)
- 90-day rotation policy for standard accounts
- 30-day rotation for privileged accounts

3.4 Access Reviews
Quarterly access reviews must be conducted for all critical systems.

4. PRIVILEGED ACCESS
Privileged access must be requested, approved, and monitored. Just-in-time access is preferred.`,
        category: "Access Control",
        status: "pending",
        version: "1.5",
        ownerId: kalaamAdmin.id,
      },
      {
        tenantId: kalaamTenant.id,
        title: "Incident Response Policy",
        content: `1. PURPOSE
To establish a structured approach for identifying, containing, and recovering from security incidents.

2. INCIDENT CLASSIFICATION
Level 1 - Critical: Data breach, ransomware, complete system outage
Level 2 - High: Malware infection, partial outage, unauthorized access
Level 3 - Medium: Phishing attempt, policy violation, suspicious activity
Level 4 - Low: Minor security events, false positives

3. RESPONSE PHASES
3.1 Detection and Identification
3.2 Containment
3.3 Eradication
3.4 Recovery
3.5 Post-Incident Review

4. REPORTING
All incidents must be reported to the Security Operations Center immediately.
Critical incidents must be escalated to executive leadership within 1 hour.

5. COMMUNICATION
External communications regarding incidents must be approved by Legal and Communications.`,
        category: "Incident Management",
        status: "draft",
        version: "1.0",
        ownerId: kalaamAuditor.id,
      },
      {
        tenantId: kalaamTenant.id,
        title: "Business Continuity Policy",
        content: `1. PURPOSE
To ensure PKF International can maintain critical operations during and after disruptive events.

2. BUSINESS IMPACT ANALYSIS
Critical systems and processes must have documented RTOs (Recovery Time Objectives) and RPOs (Recovery Point Objectives).

3. CONTINUITY STRATEGIES
3.1 Data Center Redundancy
Primary and secondary data centers with real-time replication.

3.2 Remote Work Capability
All employees must be equipped for remote work within 4 hours of office closure.

3.3 Communication Plans
Alternative communication methods documented and tested quarterly.

4. TESTING
Annual full-scale business continuity exercises are mandatory.
Quarterly tabletop exercises for critical scenarios.

5. PLAN MAINTENANCE
Business continuity plans must be reviewed and updated annually.`,
        category: "Business Continuity",
        status: "approved",
        version: "2.0",
        ownerId: kalaamAdmin.id,
        approvedBy: kalaamAdmin.id,
        approvedAt: new Date("2024-11-01"),
        effectiveDate: new Date("2024-11-01"),
        reviewDate: new Date("2025-11-01"),
      },
      // Vinca Cyber Policies
      {
        tenantId: vincaTenant.id,
        title: "Maritime Cybersecurity Policy",
        content: `1. PURPOSE
To protect industrial operational technology (OT) and information technology (IT) systems from cyber threats specific to critical infrastructure.

2. SCOPE
This policy covers all industrial control systems, operational systems, and enterprise IT infrastructure.

3. OT/IT SECURITY
3.1 Network Segmentation
OT networks must be physically or logically separated from IT networks.

3.2 Industrial Control Systems
SCADA and ICS systems must follow IEC 62443 standards.

3.3 Connected Systems
All connected systems must comply with industry-specific cyber risk management guidelines.

4. COMPLIANCE
This policy aligns with ISO 27001, NIST CSF, and industry-specific regulations.`,
        category: "Cybersecurity",
        status: "approved",
        version: "1.0",
        ownerId: null,
        effectiveDate: new Date("2025-01-01"),
        reviewDate: new Date("2026-01-01"),
      },
      {
        tenantId: vincaTenant.id,
        title: "Physical Security Policy",
        content: `1. PURPOSE
To establish physical security requirements for organization facilities and controlled zones.

2. ACCESS ZONES
Zone 1 - Public: Reception, visitor areas
Zone 2 - Restricted: Office spaces
Zone 3 - Secure: Control rooms, data centers
Zone 4 - Critical: Dry docks, operational areas

3. ACCESS CONTROL
Biometric and badge access required for Zones 2-4.
Visitor escorts mandatory in Zones 3-4.

4. SURVEILLANCE
24/7 CCTV monitoring with 90-day retention.

5. EMERGENCY PROCEDURES
Evacuation plans posted in all areas.
Regular drills conducted quarterly.`,
        category: "Physical Security",
        status: "approved",
        version: "2.3",
        ownerId: null,
        effectiveDate: new Date("2024-06-01"),
        reviewDate: new Date("2025-06-01"),
      },
      // Vinca Cyber Policies
      {
        tenantId: vincaTenant.id,
        title: "Penetration Testing Policy",
        content: `1. PURPOSE
To define the standards and procedures for conducting penetration testing activities at Vinca Cyber.

2. SCOPE
This policy covers all authorized penetration testing activities performed for clients and internal systems.

3. AUTHORIZATION
Written authorization must be obtained before any testing begins.
Scope and rules of engagement must be clearly documented.

4. METHODOLOGY
4.1 Reconnaissance
4.2 Scanning and Enumeration
4.3 Exploitation
4.4 Post-Exploitation
4.5 Reporting

5. TOOLS
Only approved and licensed tools may be used.
Tool lists must be maintained and reviewed quarterly.

6. REPORTING
Reports must include executive summary, technical findings, and remediation recommendations.`,
        category: "Security Operations",
        status: "approved",
        version: "3.0",
        ownerId: null,
        effectiveDate: new Date("2025-02-01"),
        reviewDate: new Date("2026-02-01"),
      },
      // Cibervest Security Policies
      {
        tenantId: cibervestTenant.id,
        title: "Software Development Security Policy",
        content: `1. PURPOSE
To ensure secure software development practices are followed throughout the SDLC at MACM Technologies.

2. SECURE CODING STANDARDS
Developers must follow OWASP Secure Coding Guidelines.
Code reviews are mandatory for all production changes.

3. SECURITY TESTING
3.1 Static Analysis (SAST) - Run on every commit
3.2 Dynamic Analysis (DAST) - Weekly automated scans
3.3 Penetration Testing - Annual third-party assessment

4. DEPENDENCY MANAGEMENT
Third-party libraries must be scanned for vulnerabilities.
Known vulnerable dependencies must be patched within SLA.

5. SECRETS MANAGEMENT
No secrets in code repositories.
Use approved secrets management solutions.

6. RELEASE MANAGEMENT
Security signoff required for all production releases.`,
        category: "Application Security",
        status: "approved",
        version: "2.5",
        ownerId: null,
        effectiveDate: new Date("2025-01-01"),
        reviewDate: new Date("2026-01-01"),
      },
      // Vinca Cyber - Additional Policies
      {
        tenantId: vincaTenant.id,
        title: "Data Analytics Ethics Policy",
        content: `1. PURPOSE
To establish ethical guidelines for data collection, analysis, and use at Maantic Analytics.

2. ETHICAL PRINCIPLES
2.1 Transparency - Be clear about data collection and use
2.2 Fairness - Avoid bias in algorithms and analysis
2.3 Privacy - Protect individual privacy rights
2.4 Accountability - Take responsibility for analytical outputs

3. DATA HANDLING
Anonymization and pseudonymization required for personal data.
Data retention limits must be defined for all datasets.

4. ALGORITHM GOVERNANCE
All production algorithms must be documented and explainable.
Bias testing required before deployment.

5. CLIENT DATA
Client data segregation is mandatory.
Client approval required for data use beyond contracted scope.`,
        category: "Data Ethics",
        status: "approved",
        version: "1.0",
        ownerId: null,
        effectiveDate: new Date("2025-03-01"),
        reviewDate: new Date("2026-03-01"),
      },
      // Cibervest Security - Additional Policies
      {
        tenantId: cibervestTenant.id,
        title: "Cloud Security Policy",
        content: `1. PURPOSE
To define security requirements for cloud services used and provided by Yodaplus Solutions.

2. CLOUD PROVIDERS
Only approved cloud providers may be used (AWS, Azure, GCP).
Provider security certifications must be verified annually.

3. CONFIGURATION SECURITY
Cloud Security Posture Management (CSPM) tools required.
Infrastructure as Code (IaC) must be scanned for misconfigurations.

4. DATA PROTECTION
Encryption at rest using cloud provider KMS.
Customer data must not leave designated regions.

5. IDENTITY AND ACCESS
SSO integration for all cloud services.
Privileged access requires MFA and just-in-time provisioning.

6. MONITORING
Cloud activity logs must be centralized.
Security events must trigger automated alerts.`,
        category: "Cloud Security",
        status: "approved",
        version: "2.0",
        ownerId: null,
        effectiveDate: new Date("2025-01-15"),
        reviewDate: new Date("2026-01-15"),
      },
    ]);

    // Seed Risks
    await db.insert(risks).values([
      {
        tenantId: demoTenant.id,
        title: "Third-Party Data Breach",
        description: "Risk of data breach through third-party vendor vulnerabilities",
        category: "Vendor",
        riskLevel: "critical",
        likelihood: 4,
        impact: 5,
        riskScore: 20,
        status: "active",
        ownerId: adminUser.id,
        mitigationPlan: "Implement vendor security assessment program",
      },
      {
        tenantId: demoTenant.id,
        title: "Unauthorized Access to Production",
        description: "Risk of unauthorized access to production systems",
        category: "Access Control",
        riskLevel: "high",
        likelihood: 3,
        impact: 5,
        riskScore: 15,
        status: "active",
        ownerId: adminUser.id,
        mitigationPlan: "Implement MFA and privileged access management",
      },
      {
        tenantId: demoTenant.id,
        title: "Ransomware Attack",
        description: "Risk of ransomware infection affecting critical systems",
        category: "Cyber",
        riskLevel: "critical",
        likelihood: 4,
        impact: 5,
        riskScore: 20,
        status: "in_progress",
        ownerId: auditorUser.id,
        mitigationPlan: "Deploy EDR solution and backup strategy",
      },
      {
        tenantId: demoTenant.id,
        title: "Non-compliance with GDPR",
        description: "Risk of regulatory penalties for GDPR non-compliance",
        category: "Compliance",
        riskLevel: "high",
        likelihood: 3,
        impact: 4,
        riskScore: 12,
        status: "active",
        ownerId: auditorUser.id,
        mitigationPlan: "Conduct GDPR gap assessment and remediation",
      },
      {
        tenantId: demoTenant.id,
        title: "Data Loss from System Failure",
        description: "Risk of data loss due to system or hardware failure",
        category: "Operations",
        riskLevel: "medium",
        likelihood: 2,
        impact: 4,
        riskScore: 8,
        status: "completed",
        ownerId: adminUser.id,
        mitigationPlan: "Implement redundant systems and backup procedures",
      },
    ]);

    // Seed Audits
    await db.insert(audits).values([
      {
        tenantId: demoTenant.id,
        title: "ISO 27001 Surveillance Audit",
        description: "Annual surveillance audit for ISO 27001 certification",
        frameworkId: seededFrameworks[0].id,
        auditorId: auditorUser.id,
        status: "scheduled",
        scheduledDate: new Date("2026-02-15"),
      },
      {
        tenantId: demoTenant.id,
        title: "SOC 2 Type II Annual Audit",
        description: "Annual SOC 2 Type II audit",
        frameworkId: seededFrameworks[1].id,
        auditorId: auditorUser.id,
        status: "in_progress",
        scheduledDate: new Date("2026-01-10"),
        startDate: new Date("2026-01-10"),
      },
      {
        tenantId: demoTenant.id,
        title: "Q4 Internal Security Assessment",
        description: "Quarterly internal security assessment",
        auditorId: auditorUser.id,
        status: "pending_review",
        scheduledDate: new Date("2025-12-20"),
        startDate: new Date("2025-12-20"),
        endDate: new Date("2026-01-05"),
        score: 87,
      },
      {
        tenantId: demoTenant.id,
        title: "GDPR Compliance Review",
        description: "Annual GDPR compliance review",
        frameworkId: seededFrameworks[2].id,
        auditorId: auditorUser.id,
        status: "completed",
        scheduledDate: new Date("2025-11-15"),
        startDate: new Date("2025-11-15"),
        endDate: new Date("2025-11-30"),
        score: 94,
      },
    ]);

    // Seed Vendors
    await db.insert(vendors).values([
      {
        tenantId: demoTenant.id,
        name: "AWS Cloud Services",
        category: "Cloud Provider",
        riskLevel: "low",
        contactName: "Enterprise Support",
        contactEmail: "support@aws.amazon.com",
        contractStartDate: new Date("2024-01-01"),
        contractEndDate: new Date("2027-12-31"),
        status: "active",
        complianceCertifications: ["SOC 2", "ISO 27001", "PCI DSS"],
        aiEnrichedData: { securityScore: 95, industryRanking: 1 },
      },
      {
        tenantId: demoTenant.id,
        name: "Salesforce CRM",
        category: "SaaS Application",
        riskLevel: "medium",
        contactName: "Account Manager",
        contactEmail: "sales@salesforce.com",
        contractStartDate: new Date("2024-06-01"),
        contractEndDate: new Date("2026-06-30"),
        status: "active",
        complianceCertifications: ["SOC 2", "ISO 27001"],
        aiEnrichedData: { securityScore: 88, industryRanking: 2 },
      },
      {
        tenantId: demoTenant.id,
        name: "DataDog Monitoring",
        category: "Monitoring",
        riskLevel: "low",
        contactName: "Support Team",
        contactEmail: "support@datadog.com",
        contractStartDate: new Date("2025-01-01"),
        contractEndDate: new Date("2026-03-15"),
        status: "active",
        complianceCertifications: ["SOC 2", "ISO 27001", "GDPR"],
        aiEnrichedData: { securityScore: 91, industryRanking: 3 },
      },
      {
        tenantId: demoTenant.id,
        name: "SecurePayments Inc",
        category: "Payment Processor",
        riskLevel: "high",
        contactName: "John Smith",
        contactEmail: "j.smith@securepay.com",
        contractStartDate: new Date("2024-01-01"),
        contractEndDate: new Date("2026-01-31"),
        status: "active",
        complianceCertifications: ["PCI DSS"],
        aiEnrichedData: { securityScore: 72, industryRanking: 15 },
      },
    ]);

    // Seed AI Insights
    await db.insert(aiInsights).values([
      {
        tenantId: demoTenant.id,
        category: "compliance",
        title: "SOC 2 Control Gap Detected",
        description: "AI analysis identified 3 controls in the Access Management category that are not meeting the required implementation standards. These gaps could affect your upcoming audit.",
        insight: "Controls CC6.1, CC6.2, and CC6.3 show compliance gaps",
        recommendation: "Implement multi-factor authentication for all privileged accounts and update access review procedures to include quarterly reviews.",
        priority: "high",
        status: "new",
        confidence: 94,
        relatedEntities: { controls: ["CC6.1", "CC6.2", "CC6.3"] },
      },
      {
        tenantId: demoTenant.id,
        category: "risk",
        title: "Vendor Risk Pattern Identified",
        description: "Machine learning models detected a correlation between 4 vendors with similar security posture weaknesses. These vendors collectively process 45% of your customer data.",
        insight: "4 vendors show similar security weaknesses",
        recommendation: "Consider implementing standardized security requirements and conducting joint security assessments for these vendors.",
        priority: "critical",
        status: "acknowledged",
        confidence: 87,
        relatedEntities: { vendors: ["VND-002", "VND-004"] },
      },
      {
        tenantId: demoTenant.id,
        category: "policy",
        title: "Policy Update Recommendation",
        description: "Your Incident Response Policy hasn't been updated in 14 months. Recent regulatory changes and industry best practices suggest updates are needed.",
        insight: "Incident Response Policy is outdated",
        recommendation: "Review and update sections on breach notification timelines to align with new GDPR guidelines and add ransomware-specific response procedures.",
        priority: "medium",
        status: "new",
        confidence: 91,
        relatedEntities: { policies: ["POL-004"] },
      },
      {
        tenantId: demoTenant.id,
        category: "vendor",
        title: "Contract Expiration Warning",
        description: "SecurePayments Inc contract expires in 30 days. This is a high-risk vendor requiring immediate attention for renewal or replacement.",
        insight: "High-risk payment vendor contract expiring soon",
        recommendation: "Initiate contract renewal negotiations immediately or begin vendor replacement assessment.",
        priority: "high",
        status: "in_progress",
        confidence: 99,
        relatedEntities: { vendors: ["SecurePayments Inc"] },
      },
      {
        tenantId: demoTenant.id,
        category: "compliance",
        title: "GDPR Data Retention Violation Risk",
        description: "Data retention policies for 2 systems exceed the documented retention periods in your privacy notices. This could result in regulatory non-compliance.",
        insight: "Data retention settings exceed documented policies",
        recommendation: "Update data retention settings in CRM and Marketing Automation systems to match documented retention periods of 36 months.",
        priority: "critical",
        status: "new",
        confidence: 96,
        relatedEntities: { regulations: ["GDPR Article 5", "GDPR Article 17"] },
      },
      {
        tenantId: demoTenant.id,
        category: "risk",
        title: "Emerging Threat Pattern Detected",
        description: "AI models have detected increased phishing attempts targeting employees in the Finance department over the past 2 weeks.",
        insight: "Finance department targeted by phishing campaign",
        recommendation: "Send targeted security awareness training to Finance team and consider implementing additional email security controls.",
        priority: "high",
        status: "acknowledged",
        confidence: 89,
        relatedEntities: { departments: ["Finance"] },
      },
    ]);

    // Seed Training Modules
    const [training1, training2, training3, training4, training5] = await db.insert(trainingModules).values([
      {
        tenantId: demoTenant.id,
        title: "Security Awareness Fundamentals",
        description: "Learn the basics of information security and how to protect yourself and the organization.",
        category: "security",
        duration: 45,
        isRequired: true,
      },
      {
        tenantId: demoTenant.id,
        title: "Phishing Detection & Prevention",
        description: "Identify phishing attempts and learn how to protect yourself from social engineering attacks.",
        category: "security",
        duration: 30,
        isRequired: true,
      },
      {
        tenantId: demoTenant.id,
        title: "Data Privacy & GDPR Basics",
        description: "Understand data privacy regulations and how they apply to your daily work.",
        category: "privacy",
        duration: 40,
        isRequired: true,
      },
      {
        tenantId: demoTenant.id,
        title: "Password Security Best Practices",
        description: "Create strong passwords and use password managers effectively.",
        category: "security",
        duration: 20,
        isRequired: false,
      },
      {
        tenantId: demoTenant.id,
        title: "Remote Work Security",
        description: "Secure your home office and protect company data while working remotely.",
        category: "security",
        duration: 35,
        isRequired: false,
      },
    ]).returning();

    // Seed User Training Progress (for demo user)
    const demoUser = await db.select().from(users).limit(1);
    if (demoUser.length > 0) {
      await db.insert(userTraining).values([
        {
          userId: demoUser[0].id,
          moduleId: training1.id,
          status: "completed",
          progress: 100,
          score: 92,
        },
        {
          userId: demoUser[0].id,
          moduleId: training2.id,
          status: "in_progress",
          progress: 65,
        },
        {
          userId: demoUser[0].id,
          moduleId: training4.id,
          status: "completed",
          progress: 100,
          score: 88,
        },
      ]);
    }

    // Seed Process Templates
    await db.insert(processTemplates).values([
      {
        name: "Incident Response Procedure",
        category: "Incident Response",
        description: "Standard procedure for responding to security incidents",
        content: `# Incident Response Procedure

## 1. Purpose
This procedure outlines the steps to follow when a security incident is detected.

## 2. Scope
Applies to all employees and contractors who identify or are involved in security incidents.

## 3. Procedure Steps

### 3.1 Detection & Reporting
- Identify potential security incident
- Document initial observations
- Report to Security Operations Center (SOC)
- Preserve evidence

### 3.2 Assessment
- Classify incident severity (Critical/High/Medium/Low)
- Identify affected systems and data
- Determine containment strategy

### 3.3 Containment
- Isolate affected systems
- Block malicious traffic/accounts
- Implement temporary controls

### 3.4 Eradication
- Remove malware/threats
- Patch vulnerabilities
- Reset compromised credentials

### 3.5 Recovery
- Restore systems from backups
- Verify system integrity
- Monitor for recurring activity

### 3.6 Post-Incident
- Document lessons learned
- Update procedures as needed
- Conduct post-incident review`,
      },
      {
        name: "Change Management Process",
        category: "Change Management",
        description: "Standard process for managing IT changes",
        content: `# Change Management Process

## 1. Purpose
Ensure all IT changes are properly evaluated, approved, and implemented.

## 2. Change Request Submission
- Submit change request form
- Include business justification
- Identify affected systems

## 3. Impact Assessment
- Evaluate risk and impact
- Identify rollback plan
- Document testing requirements

## 4. Approval Workflow
- Technical review
- Security review (if applicable)
- CAB approval for major changes

## 5. Implementation
- Schedule change window
- Notify stakeholders
- Execute change per plan

## 6. Verification
- Test functionality
- Confirm no adverse impacts
- Close change ticket`,
      },
      {
        name: "Access Management Procedure",
        category: "Access Management",
        description: "Standard procedure for granting and revoking access",
        content: `# Access Management Procedure

## 1. Purpose
Define the process for managing user access to systems and data.

## 2. Access Request
- Submit access request via ticketing system
- Manager approval required
- Include business justification

## 3. Access Provisioning
- Verify identity
- Apply least privilege principle
- Configure role-based access

## 4. Access Review
- Quarterly access reviews
- Manager certification
- Remove unnecessary access

## 5. Access Revocation
- Immediate removal for terminations
- Transfer access updates
- Disable dormant accounts`,
      },
      {
        name: "Backup and Recovery Procedure",
        category: "Backup & Recovery",
        description: "Standard procedure for data backup and recovery",
        content: `# Backup and Recovery Procedure

## 1. Purpose
Ensure critical data is backed up and can be recovered in case of data loss.

## 2. Backup Schedule
- Daily incremental backups
- Weekly full backups
- Monthly archive backups

## 3. Backup Verification
- Automated integrity checks
- Monthly test restores
- Annual DR testing

## 4. Recovery Procedures
- Identify data to restore
- Select appropriate backup
- Execute restoration
- Verify data integrity

## 5. Documentation
- Backup logs maintained
- Recovery tests documented
- RTO/RPO compliance tracked`,
      },
      {
        name: "Vulnerability Management Process",
        category: "Vulnerability Management",
        description: "Standard process for identifying and remediating vulnerabilities",
        content: `# Vulnerability Management Process

## 1. Purpose
Establish systematic approach to identifying and remediating security vulnerabilities.

## 2. Scanning
- Weekly automated scans
- Quarterly penetration testing
- Ad-hoc scans for new systems

## 3. Assessment
- Prioritize by CVSS score
- Evaluate business context
- Assign remediation owner

## 4. Remediation
- Critical: 24-48 hours
- High: 7 days
- Medium: 30 days
- Low: 90 days

## 5. Verification
- Rescan after remediation
- Document exceptions
- Report to management`,
      },
      {
        name: "User Onboarding Procedure",
        category: "User Onboarding/Offboarding",
        description: "Standard procedure for new employee onboarding",
        content: `# User Onboarding Procedure

## 1. Pre-Start Activities
- Create user accounts
- Provision hardware
- Prepare workspace

## 2. Day 1 Activities
- ID badge issuance
- System access activation
- Security awareness briefing

## 3. First Week
- Role-specific training
- Policy acknowledgments
- Manager introduction

## 4. First Month
- Complete mandatory training
- Obtain required certifications
- Full system access granted`,
      },
      {
        name: "User Offboarding Procedure",
        category: "User Onboarding/Offboarding",
        description: "Standard procedure for employee separation",
        content: `# User Offboarding Procedure

## 1. Notification
- HR notifies IT of separation
- Manager confirms last day

## 2. Access Termination
- Disable all accounts
- Revoke VPN/remote access
- Remove building access

## 3. Asset Collection
- Collect laptop/devices
- Retrieve ID badge
- Return company property

## 4. Data Handling
- Transfer ownership of files
- Archive email per policy
- Wipe personal devices`,
      },
      {
        name: "Third Party Risk Assessment",
        category: "Third Party Management",
        description: "Standard process for assessing vendor security",
        content: `# Third Party Risk Assessment

## 1. Purpose
Evaluate security posture of third-party vendors and partners.

## 2. Initial Assessment
- Security questionnaire
- Documentation review
- SOC 2/ISO certification check

## 3. Risk Rating
- Critical: Access to sensitive data
- High: System integrations
- Medium: Limited data access
- Low: No data access

## 4. Ongoing Monitoring
- Annual reassessment
- Continuous monitoring alerts
- Contract review

## 5. Termination
- Data return/destruction
- Access revocation verification
- Contract closure`,
      },
    ]);

    // Seed Report Templates (35 templates across 7 categories)
    await db.insert(reportTemplates).values([
      // Executive Reports (5)
      {
        id: "exec-board-summary",
        name: "Board Summary Report",
        description: "Executive-level summary of GRC posture for board presentations",
        category: "executive",
        roleAccess: ["super_admin", "tenant_admin"],
        isBuiltIn: true,
        sections: JSON.stringify(["Executive Summary", "Risk Overview", "Compliance Status", "Key Metrics", "Recommendations"]),
      },
      {
        id: "exec-quarterly-review",
        name: "Quarterly GRC Review",
        description: "Comprehensive quarterly review of governance, risk, and compliance activities",
        category: "executive",
        roleAccess: ["super_admin", "tenant_admin"],
        isBuiltIn: true,
        sections: JSON.stringify(["Quarter Highlights", "Risk Trends", "Compliance Progress", "Audit Findings", "Next Quarter Priorities"]),
      },
      {
        id: "exec-annual-report",
        name: "Annual GRC Report",
        description: "Year-end comprehensive GRC performance report",
        category: "executive",
        roleAccess: ["super_admin", "tenant_admin"],
        isBuiltIn: true,
        sections: JSON.stringify(["Year in Review", "Key Achievements", "Risk Management", "Compliance Metrics", "Strategic Outlook"]),
      },
      {
        id: "exec-risk-dashboard",
        name: "Executive Risk Dashboard",
        description: "High-level risk overview for executive decision-making",
        category: "executive",
        roleAccess: ["super_admin", "tenant_admin"],
        isBuiltIn: true,
        sections: JSON.stringify(["Risk Heat Map", "Top 10 Risks", "Mitigation Status", "Trend Analysis"]),
      },
      {
        id: "exec-compliance-scorecard",
        name: "Compliance Scorecard",
        description: "Executive scorecard showing compliance status across frameworks",
        category: "executive",
        roleAccess: ["super_admin", "tenant_admin"],
        isBuiltIn: true,
        sections: JSON.stringify(["Overall Score", "Framework Breakdown", "Gap Analysis", "Action Items"]),
      },
      // Compliance Reports (5)
      {
        id: "comp-iso27001-status",
        name: "ISO 27001 Compliance Status",
        description: "Detailed ISO 27001 compliance status and gap analysis",
        category: "compliance",
        framework: "ISO 27001",
        roleAccess: ["super_admin", "tenant_admin", "auditor"],
        isBuiltIn: true,
        sections: JSON.stringify(["Control Status", "Gap Analysis", "Evidence Summary", "Remediation Plan"]),
      },
      {
        id: "comp-soc2-status",
        name: "SOC 2 Readiness Report",
        description: "SOC 2 Type II readiness assessment and evidence status",
        category: "compliance",
        framework: "SOC 2",
        roleAccess: ["super_admin", "tenant_admin", "auditor"],
        isBuiltIn: true,
        sections: JSON.stringify(["Trust Services Criteria", "Control Effectiveness", "Evidence Gaps", "Timeline"]),
      },
      {
        id: "comp-gdpr-status",
        name: "GDPR Compliance Report",
        description: "GDPR compliance status including data processing activities",
        category: "compliance",
        framework: "GDPR",
        region: "European Union",
        roleAccess: ["super_admin", "tenant_admin", "auditor"],
        isBuiltIn: true,
        sections: JSON.stringify(["Data Processing Overview", "DPIA Status", "DSAR Metrics", "Breach History"]),
      },
      {
        id: "comp-pci-dss-status",
        name: "PCI DSS Compliance Report",
        description: "Payment Card Industry Data Security Standard compliance status",
        category: "compliance",
        framework: "PCI DSS",
        industry: "Financial Services",
        roleAccess: ["super_admin", "tenant_admin", "auditor"],
        isBuiltIn: true,
        sections: JSON.stringify(["SAQ Status", "Control Requirements", "Vulnerability Scans", "Penetration Testing"]),
      },
      {
        id: "comp-hipaa-status",
        name: "HIPAA Compliance Report",
        description: "Health Insurance Portability and Accountability Act compliance status",
        category: "compliance",
        framework: "HIPAA",
        industry: "Healthcare",
        roleAccess: ["super_admin", "tenant_admin", "auditor"],
        isBuiltIn: true,
        sections: JSON.stringify(["Privacy Rule", "Security Rule", "Breach Notification", "Risk Assessment"]),
      },
      // Risk Reports (5)
      {
        id: "risk-register-full",
        name: "Complete Risk Register",
        description: "Full export of organizational risk register with all details",
        category: "risk",
        roleAccess: ["super_admin", "tenant_admin", "auditor"],
        isBuiltIn: true,
        sections: JSON.stringify(["Risk Inventory", "Risk Ratings", "Mitigation Plans", "Risk Owners"]),
      },
      {
        id: "risk-treatment-status",
        name: "Risk Treatment Status Report",
        description: "Status of all risk treatment plans and mitigation activities",
        category: "risk",
        roleAccess: ["super_admin", "tenant_admin", "auditor"],
        isBuiltIn: true,
        sections: JSON.stringify(["Treatment Plans", "Implementation Status", "Effectiveness Review", "Residual Risk"]),
      },
      {
        id: "risk-emerging-threats",
        name: "Emerging Threats Report",
        description: "Analysis of emerging threats and their potential impact",
        category: "risk",
        roleAccess: ["super_admin", "tenant_admin"],
        isBuiltIn: true,
        sections: JSON.stringify(["Threat Landscape", "Industry Trends", "Vulnerability Analysis", "Recommendations"]),
      },
      {
        id: "risk-third-party",
        name: "Third-Party Risk Report",
        description: "Comprehensive third-party and vendor risk assessment summary",
        category: "risk",
        roleAccess: ["super_admin", "tenant_admin", "auditor"],
        isBuiltIn: true,
        sections: JSON.stringify(["Vendor Inventory", "Risk Ratings", "Due Diligence Status", "Contractual Compliance"]),
      },
      {
        id: "risk-business-impact",
        name: "Business Impact Analysis",
        description: "Business impact analysis for critical processes and systems",
        category: "risk",
        roleAccess: ["super_admin", "tenant_admin"],
        isBuiltIn: true,
        sections: JSON.stringify(["Critical Processes", "Recovery Objectives", "Dependencies", "Impact Assessment"]),
      },
      // Audit Reports (5)
      {
        id: "audit-internal-summary",
        name: "Internal Audit Summary",
        description: "Summary of internal audit activities and findings",
        category: "audit",
        roleAccess: ["super_admin", "tenant_admin", "auditor"],
        isBuiltIn: true,
        sections: JSON.stringify(["Audit Plan", "Completed Audits", "Findings Summary", "Remediation Status"]),
      },
      {
        id: "audit-findings-tracker",
        name: "Audit Findings Tracker",
        description: "Detailed tracking of all audit findings and remediation progress",
        category: "audit",
        roleAccess: ["super_admin", "tenant_admin", "auditor"],
        isBuiltIn: true,
        sections: JSON.stringify(["Open Findings", "Remediation Progress", "Overdue Items", "Trend Analysis"]),
      },
      {
        id: "audit-control-testing",
        name: "Control Testing Report",
        description: "Results of control testing and effectiveness assessment",
        category: "audit",
        roleAccess: ["super_admin", "tenant_admin", "auditor"],
        isBuiltIn: true,
        sections: JSON.stringify(["Testing Methodology", "Control Results", "Exceptions", "Recommendations"]),
      },
      {
        id: "audit-external-prep",
        name: "External Audit Preparation",
        description: "Preparation checklist and status for upcoming external audits",
        category: "audit",
        roleAccess: ["super_admin", "tenant_admin", "auditor"],
        isBuiltIn: true,
        sections: JSON.stringify(["Audit Scope", "Evidence Checklist", "Interview Schedule", "Open Items"]),
      },
      {
        id: "audit-management-response",
        name: "Management Response Report",
        description: "Consolidated management responses to audit findings",
        category: "audit",
        roleAccess: ["super_admin", "tenant_admin", "auditor"],
        isBuiltIn: true,
        sections: JSON.stringify(["Finding Summary", "Management Response", "Action Plans", "Due Dates"]),
      },
      // Privacy Reports (5)
      {
        id: "privacy-ropa",
        name: "ROPA (Records of Processing Activities)",
        description: "Complete record of personal data processing activities",
        category: "privacy",
        roleAccess: ["super_admin", "tenant_admin", "auditor"],
        isBuiltIn: true,
        sections: JSON.stringify(["Processing Activities", "Legal Basis", "Data Categories", "Retention Periods"]),
      },
      {
        id: "privacy-dpia-summary",
        name: "DPIA Summary Report",
        description: "Summary of all Data Protection Impact Assessments",
        category: "privacy",
        roleAccess: ["super_admin", "tenant_admin", "auditor"],
        isBuiltIn: true,
        sections: JSON.stringify(["High-Risk Processing", "Assessment Results", "Mitigation Measures", "DPO Recommendations"]),
      },
      {
        id: "privacy-dsar-metrics",
        name: "DSAR Metrics Report",
        description: "Data Subject Access Request handling metrics and performance",
        category: "privacy",
        roleAccess: ["super_admin", "tenant_admin"],
        isBuiltIn: true,
        sections: JSON.stringify(["Request Volume", "Response Times", "Request Types", "Compliance Rate"]),
      },
      {
        id: "privacy-breach-report",
        name: "Privacy Breach Report",
        description: "Summary of privacy incidents and breach notifications",
        category: "privacy",
        roleAccess: ["super_admin", "tenant_admin"],
        isBuiltIn: true,
        sections: JSON.stringify(["Incident Summary", "Root Cause", "Notification Status", "Remediation Actions"]),
      },
      {
        id: "privacy-consent-management",
        name: "Consent Management Report",
        description: "Status of consent collection and management across channels",
        category: "privacy",
        roleAccess: ["super_admin", "tenant_admin"],
        isBuiltIn: true,
        sections: JSON.stringify(["Consent Overview", "Collection Points", "Withdrawal Tracking", "Audit Trail"]),
      },
      // Regulatory Reports (5)
      {
        id: "reg-nist-csf",
        name: "NIST CSF Assessment",
        description: "NIST Cybersecurity Framework maturity assessment",
        category: "regulatory",
        framework: "NIST CSF",
        region: "United States",
        roleAccess: ["super_admin", "tenant_admin", "auditor"],
        isBuiltIn: true,
        sections: JSON.stringify(["Function Scores", "Maturity Levels", "Gap Analysis", "Improvement Plan"]),
      },
      {
        id: "reg-fedramp",
        name: "FedRAMP Authorization Status",
        description: "Federal Risk and Authorization Management Program status",
        category: "regulatory",
        framework: "FedRAMP",
        region: "United States",
        roleAccess: ["super_admin", "tenant_admin", "auditor"],
        isBuiltIn: true,
        sections: JSON.stringify(["Authorization Level", "Control Status", "POA&M Items", "Continuous Monitoring"]),
      },
      {
        id: "reg-nis2",
        name: "NIS2 Compliance Report",
        description: "EU Network and Information Security Directive 2 compliance",
        category: "regulatory",
        framework: "NIS2",
        region: "European Union",
        roleAccess: ["super_admin", "tenant_admin", "auditor"],
        isBuiltIn: true,
        sections: JSON.stringify(["Entity Classification", "Security Measures", "Incident Reporting", "Supply Chain"]),
      },
      {
        id: "reg-sama",
        name: "SAMA Cybersecurity Report",
        description: "Saudi Arabian Monetary Authority cybersecurity framework compliance",
        category: "regulatory",
        framework: "SAMA-CSF",
        region: "Gulf",
        roleAccess: ["super_admin", "tenant_admin", "auditor"],
        isBuiltIn: true,
        sections: JSON.stringify(["Domain Compliance", "Control Implementation", "Maturity Assessment", "Action Plan"]),
      },
      {
        id: "reg-mas-trm",
        name: "MAS TRM Guidelines Report",
        description: "Monetary Authority of Singapore Technology Risk Management compliance",
        category: "regulatory",
        framework: "MAS-TRM",
        region: "SEA",
        roleAccess: ["super_admin", "tenant_admin", "auditor"],
        isBuiltIn: true,
        sections: JSON.stringify(["Risk Assessment", "Control Framework", "Third Party Management", "Resilience"]),
      },
      // Operational Reports (5)
      {
        id: "ops-policy-status",
        name: "Policy Management Status",
        description: "Status of all policies including review dates and approvals",
        category: "operational",
        roleAccess: ["super_admin", "tenant_admin"],
        isBuiltIn: true,
        sections: JSON.stringify(["Policy Inventory", "Review Status", "Approval Workflow", "Distribution Status"]),
      },
      {
        id: "ops-training-completion",
        name: "Training Completion Report",
        description: "Employee training completion rates and compliance status",
        category: "operational",
        roleAccess: ["super_admin", "tenant_admin"],
        isBuiltIn: true,
        sections: JSON.stringify(["Completion Rates", "Overdue Training", "By Department", "Trend Analysis"]),
      },
      {
        id: "ops-incident-summary",
        name: "Security Incident Summary",
        description: "Summary of security incidents and response metrics",
        category: "operational",
        roleAccess: ["super_admin", "tenant_admin"],
        isBuiltIn: true,
        sections: JSON.stringify(["Incident Volume", "Categories", "Response Times", "Lessons Learned"]),
      },
      {
        id: "ops-access-review",
        name: "Access Review Report",
        description: "User access review status and privilege audit results",
        category: "operational",
        roleAccess: ["super_admin", "tenant_admin"],
        isBuiltIn: true,
        sections: JSON.stringify(["Review Schedule", "Completion Status", "Access Changes", "Exceptions"]),
      },
      {
        id: "ops-asset-inventory",
        name: "Asset Inventory Report",
        description: "Complete inventory of IT assets and their security classification",
        category: "operational",
        roleAccess: ["super_admin", "tenant_admin"],
        isBuiltIn: true,
        sections: JSON.stringify(["Asset Categories", "Classification", "Ownership", "Lifecycle Status"]),
      },
    ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Force seed function that bypasses all checks and seeds missing data
export async function forceSeedDatabase() {
  console.log("Force seeding database - clearing ALL data and reseeding...");
  
  try {
    // Use raw SQL with CASCADE to force delete everything
    console.log("Step 1: Clearing ALL existing data using TRUNCATE CASCADE...");
    
    // Use TRUNCATE CASCADE to forcefully clear all tables
    const tablesToClear = [
      'user_training', 'training_modules', 'ai_insights', 'licenses', 
      'vendors', 'audits', 'risks', 'policies', 'tenant_frameworks',
      'controls', 'frameworks', 'process_templates', 'generated_reports',
      'report_templates', 'tenant_invitations', 'users', 'tenants', 'regions'
    ];
    
    for (const table of tablesToClear) {
      try {
        await db.execute(sql.raw(`TRUNCATE TABLE "${table}" CASCADE`));
        console.log(`Truncated ${table}`);
      } catch (e: any) {
        console.log(`Could not truncate ${table}: ${e.message}`);
        // Fallback to DELETE if TRUNCATE fails
        try {
          await db.execute(sql.raw(`DELETE FROM "${table}"`));
          console.log(`Deleted from ${table}`);
        } catch (e2: any) {
          console.log(`Could not delete from ${table}: ${e2.message}`);
        }
      }
    }
    
    console.log("Step 2: Demo data cleared. Running full seed...");
    await seedDatabase();
    console.log("Force seed completed successfully!");
  } catch (error) {
    console.error("Force seed error:", error);
    throw error;
  }
}

// Sync new tenants to ensure all 20 tenants exist
export async function syncNewTenants() {
  try {
    const existingTenants = await db.select().from(tenants);
    const existingSlugs = existingTenants.map(t => t.slug);
    
    const newTenants = [
      { slug: 'manjushree', name: 'Manjushree Technopack', industry: 'Manufacturing', subIndustry: 'Rigid Plastic Packaging', country: 'India', website: 'https://www.manjushreeindia.com', description: 'Leading rigid plastic packaging company with 30 manufacturing plants.', status: 'active' as const, licenseType: 'enterprise' as const, settings: { theme: 'dark', language: 'en', timezone: 'Asia/Kolkata' }, aiProfile: { companySize: 'Large Enterprise', riskLevel: 'medium', employeeCount: '5000+', annualRevenue: '$500M+', primaryRisks: ['Supply Chain', 'Environmental Compliance', 'Quality Control'], keyAssets: ['Manufacturing Plants', 'R&D Centers', 'Customer Data'], dataTypes: ['Customer PII', 'Manufacturing Data', 'Financial Records'], complianceMaturity: 'intermediate' } },
      { slug: 'apraava', name: 'Apraava Energy', industry: 'Energy', subIndustry: 'Power Generation & Transmission', country: 'India', website: 'https://www.apraava.com', description: '3GW+ power company providing conventional, solar, wind energy solutions.', status: 'active' as const, licenseType: 'enterprise' as const, settings: { theme: 'dark', language: 'en', timezone: 'Asia/Kolkata' }, aiProfile: { companySize: 'Large Enterprise', riskLevel: 'high', employeeCount: '2000+', annualRevenue: '$1B+', primaryRisks: ['Critical Infrastructure', 'OT Security', 'Environmental', 'Regulatory'], keyAssets: ['Power Plants', 'Grid Infrastructure', 'SCADA Systems'], dataTypes: ['Grid Data', 'Customer Data', 'SCADA/OT Data'], complianceMaturity: 'advanced' } },
      { slug: 'mirae-asset', name: 'Mirae Asset Capital Markets', industry: 'Financial Services', subIndustry: 'Investment Banking & Broking', country: 'India', website: 'https://cm.miraeasset.co.in', description: 'Diversified financial services firm offering investment banking and capital market services.', status: 'active' as const, licenseType: 'enterprise' as const, settings: { theme: 'dark', language: 'en', timezone: 'Asia/Kolkata' }, aiProfile: { companySize: 'Large Enterprise', riskLevel: 'very-high', employeeCount: '1000+', annualRevenue: '$200M+', primaryRisks: ['Market Risk', 'Operational Risk', 'Regulatory Compliance', 'Cyber Threats'], keyAssets: ['Trading Systems', 'Client Data', 'Financial Records'], dataTypes: ['Customer PII', 'Financial Data', 'Trading Data'], complianceMaturity: 'advanced' } },
      { slug: 'nineleaps', name: 'Nineleaps Technology Solutions', industry: 'IT Services', subIndustry: 'Software Engineering & AI', country: 'India', website: 'https://www.nineleaps.com', description: 'Technology services provider specializing in platform engineering and AI solutions.', status: 'active' as const, licenseType: 'professional' as const, settings: { theme: 'dark', language: 'en', timezone: 'Asia/Kolkata' }, aiProfile: { companySize: 'Medium Enterprise', riskLevel: 'medium', employeeCount: '500+', annualRevenue: '$50M+', primaryRisks: ['Data Security', 'IP Protection', 'Client Data'], keyAssets: ['Source Code', 'Client Systems', 'AI Models'], dataTypes: ['Client Data', 'Source Code', 'Employee Data'], complianceMaturity: 'intermediate' } },
      { slug: 'im-bank', name: 'I&M Bank Group', industry: 'Banking', subIndustry: 'Commercial Banking', country: 'Kenya', website: 'https://www.imbankgroup.com', description: 'Leading banking group in East Africa with presence in Kenya, Mauritius, Rwanda, Tanzania, Uganda.', status: 'active' as const, licenseType: 'enterprise' as const, settings: { theme: 'dark', language: 'en', timezone: 'Africa/Nairobi' }, aiProfile: { companySize: 'Large Enterprise', riskLevel: 'very-high', employeeCount: '3000+', annualRevenue: '$500M+', primaryRisks: ['Credit Risk', 'Operational Risk', 'Cyber Security', 'Regulatory'], keyAssets: ['Core Banking Systems', 'Customer Data', 'Branch Network'], dataTypes: ['Customer PII', 'Financial Transactions', 'KYC Records'], complianceMaturity: 'advanced' } },
      { slug: 'dtb-bank', name: 'Diamond Trust Bank', industry: 'Banking', subIndustry: 'Commercial Banking', country: 'Kenya', website: 'https://dtbk.dtbafrica.com', description: 'Commercial bank with 89 branches in Kenya and 159 across East Africa.', status: 'active' as const, licenseType: 'enterprise' as const, settings: { theme: 'dark', language: 'en', timezone: 'Africa/Nairobi' }, aiProfile: { companySize: 'Large Enterprise', riskLevel: 'very-high', employeeCount: '2500+', annualRevenue: '$400M+', primaryRisks: ['Credit Risk', 'Fraud', 'Cyber Security', 'Mobile Banking Security'], keyAssets: ['Core Banking', 'Mobile Banking Platform', 'Customer Data'], dataTypes: ['Customer PII', 'Transaction Data', 'Credit Records'], complianceMaturity: 'advanced' } },
      { slug: 'karnataka-bank', name: 'Karnataka Bank', industry: 'Banking', subIndustry: 'Scheduled Commercial Bank', country: 'India', website: 'https://www.karnatakabank.bank.in', description: 'Major scheduled commercial bank in India offering retail, corporate, and digital banking services.', status: 'active' as const, licenseType: 'enterprise' as const, settings: { theme: 'dark', language: 'en', timezone: 'Asia/Kolkata' }, aiProfile: { companySize: 'Large Enterprise', riskLevel: 'very-high', employeeCount: '8000+', annualRevenue: '$1B+', primaryRisks: ['Credit Risk', 'Operational Risk', 'Cyber Threats', 'RBI Compliance'], keyAssets: ['Core Banking System', 'Branch Network', 'Digital Platforms'], dataTypes: ['Customer PII', 'Financial Transactions', 'Loan Data'], complianceMaturity: 'advanced' } },
      { slug: 'sadhana-bank', name: 'Sadhana Sahakari Bank', industry: 'Banking', subIndustry: 'Cooperative Bank', country: 'India', website: 'https://sadhanapune.bank.in', description: 'Cooperative bank established in 1978 in Pune, providing savings and lending services.', status: 'active' as const, licenseType: 'professional' as const, settings: { theme: 'dark', language: 'en', timezone: 'Asia/Kolkata' }, aiProfile: { companySize: 'Medium Enterprise', riskLevel: 'high', employeeCount: '500+', annualRevenue: '$50M+', primaryRisks: ['Credit Risk', 'Operational Risk', 'Regulatory Compliance', 'Fraud'], keyAssets: ['Core Banking', 'Branch Network', 'ATM Network'], dataTypes: ['Customer PII', 'Loan Data', 'Deposit Data'], complianceMaturity: 'intermediate' } },
      { slug: 'karnataka-gramin-bank', name: 'Karnataka Gramin Bank', industry: 'Banking', subIndustry: 'Regional Rural Bank', country: 'India', website: 'https://karnatakagb.bank.in', description: 'Regional Rural Bank serving Karnataka with focus on agricultural and rural banking.', status: 'active' as const, licenseType: 'enterprise' as const, settings: { theme: 'dark', language: 'en', timezone: 'Asia/Kolkata' }, aiProfile: { companySize: 'Large Enterprise', riskLevel: 'high', employeeCount: '5000+', annualRevenue: '$200M+', primaryRisks: ['Credit Risk', 'Agricultural Risk', 'Operational Risk', 'RBI Compliance'], keyAssets: ['Core Banking', 'Rural Branch Network', 'Mobile Banking'], dataTypes: ['Farmer Data', 'Loan Records', 'Deposit Data'], complianceMaturity: 'intermediate' } },
      { slug: 'praj', name: 'Praj Industries', industry: 'Manufacturing', subIndustry: 'Bioenergy & Industrial Engineering', country: 'India', website: 'https://praj.net', description: 'Global leader in bioenergy solutions including ethanol, brewery equipment, and wastewater treatment.', status: 'active' as const, licenseType: 'enterprise' as const, settings: { theme: 'dark', language: 'en', timezone: 'Asia/Kolkata' }, aiProfile: { companySize: 'Large Enterprise', riskLevel: 'medium', employeeCount: '2000+', annualRevenue: '$300M+', primaryRisks: ['IP Protection', 'Environmental', 'Project Delivery', 'Supply Chain'], keyAssets: ['Engineering IP', 'R&D Centers', 'Manufacturing Facilities'], dataTypes: ['Engineering Data', 'Client Projects', 'R&D Data'], complianceMaturity: 'advanced' } },
      { slug: 'pkf-africa', name: 'PKF Africa', industry: 'Professional Services', subIndustry: 'Audit & Accounting', country: 'Kenya', website: 'https://www.pkf.com/pkf-firms/africa/', description: 'Pan-African professional services network with offices in 40+ African countries.', status: 'active' as const, licenseType: 'enterprise' as const, settings: { theme: 'dark', language: 'en', timezone: 'Africa/Nairobi' }, aiProfile: { companySize: 'Large Enterprise', riskLevel: 'high', employeeCount: '3000+', annualRevenue: '$100M+', primaryRisks: ['Client Confidentiality', 'Professional Liability', 'Data Security', 'Regulatory'], keyAssets: ['Audit Workpapers', 'Client Data', 'Professional Staff'], dataTypes: ['Client Financial Data', 'Audit Records', 'Tax Records'], complianceMaturity: 'advanced' } },
      { slug: 'fedfina', name: 'Fedbank Financial Services (Fedfina)', industry: 'Financial Services', subIndustry: 'NBFC - Lending', country: 'India', website: 'https://www.fedfina.com', description: 'Listed NBFC subsidiary of Federal Bank offering gold loans, property loans, home loans across India.', status: 'active' as const, licenseType: 'enterprise' as const, settings: { theme: 'dark', language: 'en', timezone: 'Asia/Kolkata' }, aiProfile: { companySize: 'Large Enterprise', riskLevel: 'high', employeeCount: '5000+', annualRevenue: '$200M+', primaryRisks: ['Credit Risk', 'Operational Risk', 'RBI/NHB Compliance', 'Fraud'], keyAssets: ['Loan Management System', 'Gold Custody', 'Customer Data'], dataTypes: ['Customer PII', 'Loan Data', 'Collateral Data'], complianceMaturity: 'advanced' } },
      { slug: 'kalaam-telecom', name: 'Kalaam Telecom Group', industry: 'Telecommunications', subIndustry: 'ISP & Digital Solutions', country: 'Bahrain', website: 'https://kalaam-telecom.com', description: 'Leading Pan-Arab managed solutions provider with licensed ISP operations in Bahrain, Saudi Arabia, Kuwait.', status: 'active' as const, licenseType: 'enterprise' as const, settings: { theme: 'dark', language: 'en', timezone: 'Asia/Bahrain' }, aiProfile: { companySize: 'Large Enterprise', riskLevel: 'high', employeeCount: '1000+', annualRevenue: '$150M+', primaryRisks: ['Network Security', 'Customer Data', 'Service Availability', 'Regulatory'], keyAssets: ['Network Infrastructure', 'Data Centers', 'Customer Systems'], dataTypes: ['Customer Data', 'Network Traffic', 'Business Data'], complianceMaturity: 'advanced' } },
      { slug: 'cibervest', name: 'Cibervest', industry: 'Cybersecurity', subIndustry: 'Managed Security Services', country: 'India', website: 'https://cibervest.com', description: 'AI-powered MSSP providing 24/7 SOC operations and managed security services.', status: 'active' as const, licenseType: 'professional' as const, settings: { theme: 'dark', language: 'en', timezone: 'Asia/Kolkata' }, aiProfile: { companySize: 'Small Enterprise', riskLevel: 'medium', employeeCount: '50+', annualRevenue: '$5M+', primaryRisks: ['Client Data Protection', 'Service Availability', 'Threat Intelligence'], keyAssets: ['SOC Platform', 'Threat Intelligence', 'AI Systems'], dataTypes: ['Security Logs', 'Client Incident Data', 'Vulnerability Data'], complianceMaturity: 'advanced' } },
    ];
    
    const tenantsToAdd = newTenants.filter(t => !existingSlugs.includes(t.slug));
    
    if (tenantsToAdd.length > 0) {
      console.log(`Adding ${tenantsToAdd.length} new tenants...`);
      for (const tenant of tenantsToAdd) {
        try {
          await db.insert(tenants).values({
            id: crypto.randomUUID(),
            ...tenant,
          });
          console.log(`  Added tenant: ${tenant.name}`);
        } catch (e: any) {
          console.log(`  Skipped ${tenant.name}: ${e.message}`);
        }
      }
    }
    
    // Assign frameworks to new tenants
    await assignFrameworksToNewTenants();
    
    console.log("Tenant sync completed!");
  } catch (error) {
    console.error("Tenant sync error:", error);
  }
}

// Assign frameworks based on industry and country
async function assignFrameworksToNewTenants() {
  try {
    const allTenants = await db.select().from(tenants);
    const existingAssignments = await db.select().from(tenantFrameworks);
    const existingPairs = new Set(existingAssignments.map(a => `${a.tenantId}-${a.frameworkId}`));
    
    // Get framework IDs
    const allFrameworks = await db.select().from(frameworks);
    const getFrameworkId = (code: string) => allFrameworks.find(f => f.id === code || f.name?.toLowerCase().includes(code.toLowerCase()))?.id;
    
    // Global frameworks for all
    const globalFrameworkIds = [
      getFrameworkId('iso-27001') || getFrameworkId('27001'),
      getFrameworkId('nist-csf') || getFrameworkId('nist csf'),
      getFrameworkId('iso-31000') || 'global-iso-31000',
      getFrameworkId('iso-22301') || 'global-iso-22301',
      getFrameworkId('cobit') || 'global-cobit-2019',
      getFrameworkId('csa-ccm') || 'global-csa-ccm',
      getFrameworkId('soc-2') || getFrameworkId('soc 2'),
    ].filter(Boolean);
    
    // Regional frameworks by country
    const regionalFrameworks: Record<string, string[]> = {
      'India': ['ind-dpdp', 'ind-cert-in', 'ind-it-act'],
      'Kenya': ['afr-dpda-kenya'],
      'Bahrain': ['gcc-bahrain-pdpl', 'gcc-bahrain-cyber', 'gcc-cbn-bahrain', 'gcc-nca-ecc', 'gcc-sama'],
      'United Kingdom': ['eu-gdpr', 'eu-nis2'],
      'United States': ['us-ccpa', 'us-fisma'],
    };
    
    // Industry frameworks
    const industryFrameworks: Record<string, string[]> = {
      'Banking': ['ind-rbi-cyber'],
      'Financial Services': ['ind-rbi-cyber', 'ind-sebi-cyber'],
    };
    
    let addedCount = 0;
    for (const tenant of allTenants) {
      const frameworksToAssign: { frameworkId: string; type: string }[] = [];
      
      // Add global frameworks
      for (const fwId of globalFrameworkIds) {
        if (fwId && !existingPairs.has(`${tenant.id}-${fwId}`)) {
          frameworksToAssign.push({ frameworkId: fwId, type: 'global' });
        }
      }
      
      // Add regional frameworks
      const country = tenant.country || '';
      const regional = regionalFrameworks[country] || [];
      for (const fwId of regional) {
        if (!existingPairs.has(`${tenant.id}-${fwId}`)) {
          frameworksToAssign.push({ frameworkId: fwId, type: 'regional' });
        }
      }
      
      // Add industry frameworks (only for Banking/Financial Services in India)
      if (tenant.country === 'India') {
        const industry = tenant.industry || '';
        const industryFws = industryFrameworks[industry] || [];
        for (const fwId of industryFws) {
          if (!existingPairs.has(`${tenant.id}-${fwId}`)) {
            frameworksToAssign.push({ frameworkId: fwId, type: 'industry' });
          }
        }
      }
      
      // Insert framework assignments
      for (const fw of frameworksToAssign) {
        try {
          await db.insert(tenantFrameworks).values({
            tenantId: tenant.id,
            frameworkId: fw.frameworkId,
            applicabilityType: fw.type,
            status: 'active',
            complianceScore: 0,
          });
          addedCount++;
          existingPairs.add(`${tenant.id}-${fw.frameworkId}`);
        } catch (e) {
          // Skip duplicates
        }
      }
    }
    
    if (addedCount > 0) {
      console.log(`  Assigned ${addedCount} framework assignments to tenants`);
    }
  } catch (error) {
    console.error("Framework assignment error:", error);
  }
}

// Seed questionnaire templates for vendor risk assessments
export async function seedQuestionnaireTemplates() {
  try {
    const { questionnaireTemplates } = await import("@shared/schema");
    
    const existing = await db.select({ shortName: questionnaireTemplates.shortName }).from(questionnaireTemplates);
    if (existing.length > 0) {
      console.log(`Questionnaire templates already exist (${existing.length} found)`);
      return;
    }
    
    console.log("Seeding Questionnaire Templates...");
    
    const templates = [
      {
        name: "SIG Lite Questionnaire",
        shortName: "SIG-LITE",
        description: "Standardized Information Gathering (SIG) Lite questionnaire for initial vendor risk assessment. Covers key security domains with essential questions.",
        category: "vendor_risk",
        isSystem: true,
        isActive: true,
        version: "2024.1",
        estimatedTime: 30,
        tags: ["vendor-risk", "sig", "security"],
        questions: [
          { id: "sig-1", section: "Company Information", question: "What is your company's legal name and primary business address?", type: "text", required: true },
          { id: "sig-2", section: "Company Information", question: "How many employees does your organization have?", type: "select", options: ["1-50", "51-200", "201-500", "501-1000", "1000+"], required: true },
          { id: "sig-3", section: "Security Governance", question: "Does your organization have a formal information security policy?", type: "boolean", required: true },
          { id: "sig-4", section: "Security Governance", question: "Is your organization certified under any security frameworks (ISO 27001, SOC 2, etc.)?", type: "multiselect", options: ["ISO 27001", "SOC 2 Type I", "SOC 2 Type II", "PCI DSS", "HIPAA", "Other", "None"], required: true },
          { id: "sig-5", section: "Access Control", question: "Do you implement multi-factor authentication for accessing systems containing customer data?", type: "boolean", required: true },
          { id: "sig-6", section: "Access Control", question: "Describe your user access provisioning and deprovisioning process.", type: "textarea", required: true },
          { id: "sig-7", section: "Data Protection", question: "Is customer data encrypted at rest and in transit?", type: "boolean", required: true },
          { id: "sig-8", section: "Data Protection", question: "Where is customer data stored geographically?", type: "text", required: true },
          { id: "sig-9", section: "Incident Response", question: "Do you have a documented incident response plan?", type: "boolean", required: true },
          { id: "sig-10", section: "Incident Response", question: "What is your commitment for notifying customers of security incidents?", type: "select", options: ["Within 24 hours", "Within 48 hours", "Within 72 hours", "As required by contract", "No defined timeline"], required: true },
          { id: "sig-11", section: "Business Continuity", question: "Do you have documented business continuity and disaster recovery plans?", type: "boolean", required: true },
          { id: "sig-12", section: "Business Continuity", question: "When was your last disaster recovery test conducted?", type: "date", required: false },
        ],
        totalQuestions: 12,
      },
      {
        name: "SIG Core Questionnaire",
        shortName: "SIG-CORE",
        description: "Comprehensive SIG Core questionnaire covering 18 security domains. Suitable for critical vendors handling sensitive data.",
        category: "vendor_risk",
        isSystem: true,
        isActive: true,
        version: "2024.1",
        estimatedTime: 120,
        tags: ["vendor-risk", "sig", "security", "comprehensive"],
        questions: [
          { id: "sigc-1", section: "Enterprise Risk Management", question: "Does your organization have a formal risk management program?", type: "boolean", required: true },
          { id: "sigc-2", section: "Enterprise Risk Management", question: "How often do you conduct risk assessments?", type: "select", options: ["Annually", "Bi-annually", "Quarterly", "Monthly", "Continuous"], required: true },
          { id: "sigc-3", section: "Security Policy", question: "Are information security policies reviewed and approved by management at least annually?", type: "boolean", required: true },
          { id: "sigc-4", section: "Security Policy", question: "How are security policies communicated to employees?", type: "textarea", required: true },
          { id: "sigc-5", section: "Organization Security", question: "Do you have a dedicated information security team or officer?", type: "boolean", required: true },
          { id: "sigc-6", section: "Organization Security", question: "What is the reporting structure for information security within your organization?", type: "textarea", required: true },
          { id: "sigc-7", section: "Asset Management", question: "Do you maintain an inventory of information assets?", type: "boolean", required: true },
          { id: "sigc-8", section: "Asset Management", question: "How do you classify data sensitivity levels?", type: "textarea", required: true },
          { id: "sigc-9", section: "Human Resources", question: "Are background checks performed on employees with access to sensitive data?", type: "boolean", required: true },
          { id: "sigc-10", section: "Human Resources", question: "Is security awareness training mandatory for all employees?", type: "boolean", required: true },
          { id: "sigc-11", section: "Physical Security", question: "Describe physical security controls at your data centers/offices.", type: "textarea", required: true },
          { id: "sigc-12", section: "Physical Security", question: "Do you have 24/7 security monitoring at facilities housing customer data?", type: "boolean", required: true },
          { id: "sigc-13", section: "Operations Management", question: "Are change management procedures documented and followed?", type: "boolean", required: true },
          { id: "sigc-14", section: "Operations Management", question: "How do you ensure segregation of duties in critical operations?", type: "textarea", required: true },
          { id: "sigc-15", section: "Network Security", question: "Are firewalls and intrusion detection/prevention systems deployed?", type: "boolean", required: true },
          { id: "sigc-16", section: "Network Security", question: "How often are vulnerability scans and penetration tests conducted?", type: "select", options: ["Monthly", "Quarterly", "Bi-annually", "Annually", "Ad-hoc"], required: true },
          { id: "sigc-17", section: "Application Security", question: "Is secure software development lifecycle (SDLC) implemented?", type: "boolean", required: true },
          { id: "sigc-18", section: "Application Security", question: "How are security vulnerabilities in applications remediated?", type: "textarea", required: true },
        ],
        totalQuestions: 18,
      },
      {
        name: "Cloud Security Alliance CAIQ",
        shortName: "CAIQ",
        description: "Consensus Assessments Initiative Questionnaire (CAIQ) for cloud service providers. Based on Cloud Controls Matrix (CCM).",
        category: "vendor_risk",
        isSystem: true,
        isActive: true,
        version: "4.0",
        estimatedTime: 90,
        tags: ["vendor-risk", "cloud", "csa", "caiq"],
        questions: [
          { id: "caiq-1", section: "Audit & Assurance", question: "Are independent security assessments conducted at least annually?", type: "boolean", required: true },
          { id: "caiq-2", section: "Audit & Assurance", question: "List all current security certifications and attestations.", type: "textarea", required: true },
          { id: "caiq-3", section: "Application Security", question: "Is application code reviewed for security vulnerabilities before deployment?", type: "boolean", required: true },
          { id: "caiq-4", section: "Application Security", question: "Are web application firewalls (WAF) deployed?", type: "boolean", required: true },
          { id: "caiq-5", section: "Change Management", question: "Are all changes logged, tested, and approved before implementation?", type: "boolean", required: true },
          { id: "caiq-6", section: "Data Security", question: "Is data encrypted using industry-standard algorithms (AES-256 or equivalent)?", type: "boolean", required: true },
          { id: "caiq-7", section: "Data Security", question: "How is encryption key management handled?", type: "textarea", required: true },
          { id: "caiq-8", section: "Datacenter Security", question: "Are physical access controls implemented at all data center facilities?", type: "boolean", required: true },
          { id: "caiq-9", section: "Identity & Access", question: "Is role-based access control (RBAC) implemented?", type: "boolean", required: true },
          { id: "caiq-10", section: "Identity & Access", question: "Are privileged access management controls in place?", type: "boolean", required: true },
          { id: "caiq-11", section: "Infrastructure Security", question: "Are network segmentation controls implemented?", type: "boolean", required: true },
          { id: "caiq-12", section: "Logging & Monitoring", question: "Are security events logged and monitored 24/7?", type: "boolean", required: true },
          { id: "caiq-13", section: "Logging & Monitoring", question: "What is the log retention period?", type: "select", options: ["30 days", "90 days", "1 year", "2+ years"], required: true },
          { id: "caiq-14", section: "Supply Chain", question: "Do you assess the security of your subprocessors/subcontractors?", type: "boolean", required: true },
          { id: "caiq-15", section: "Threat & Vulnerability", question: "Is a vulnerability management program in place?", type: "boolean", required: true },
        ],
        totalQuestions: 15,
      },
      {
        name: "Vendor Security Assessment Questionnaire",
        shortName: "VSAQ",
        description: "General vendor security assessment questionnaire covering essential security controls and compliance requirements.",
        category: "vendor_risk",
        isSystem: true,
        isActive: true,
        version: "1.0",
        estimatedTime: 45,
        tags: ["vendor-risk", "security", "general"],
        questions: [
          { id: "vsaq-1", section: "General Information", question: "Company legal name and registration number.", type: "text", required: true },
          { id: "vsaq-2", section: "General Information", question: "Primary point of contact for security matters.", type: "text", required: true },
          { id: "vsaq-3", section: "Certifications", question: "Select all applicable security certifications.", type: "multiselect", options: ["ISO 27001", "SOC 2", "PCI DSS", "HIPAA", "GDPR Compliant", "ISO 27701", "CSA STAR", "FedRAMP", "None"], required: true },
          { id: "vsaq-4", section: "Data Handling", question: "What types of data will you process on our behalf?", type: "multiselect", options: ["Personal Data", "Financial Data", "Health Data", "Intellectual Property", "Credentials", "Other Sensitive Data"], required: true },
          { id: "vsaq-5", section: "Data Handling", question: "In which countries/regions will our data be stored?", type: "textarea", required: true },
          { id: "vsaq-6", section: "Security Controls", question: "Do you encrypt data at rest?", type: "boolean", required: true },
          { id: "vsaq-7", section: "Security Controls", question: "Do you encrypt data in transit?", type: "boolean", required: true },
          { id: "vsaq-8", section: "Security Controls", question: "Do you have a Security Operations Center (SOC)?", type: "select", options: ["24/7 in-house SOC", "24/7 outsourced SOC", "Business hours only", "No SOC"], required: true },
          { id: "vsaq-9", section: "Incident Management", question: "Do you have a documented incident response procedure?", type: "boolean", required: true },
          { id: "vsaq-10", section: "Incident Management", question: "Have you experienced any security breaches in the past 3 years?", type: "boolean", required: true },
          { id: "vsaq-11", section: "Business Continuity", question: "What is your committed Recovery Time Objective (RTO)?", type: "select", options: ["< 1 hour", "1-4 hours", "4-24 hours", "24-72 hours", "> 72 hours"], required: true },
          { id: "vsaq-12", section: "Compliance", question: "Do you conduct regular compliance audits?", type: "boolean", required: true },
        ],
        totalQuestions: 12,
      },
      {
        name: "Privacy Impact Assessment",
        shortName: "PIA",
        description: "Privacy-focused questionnaire for vendors handling personal data. Covers GDPR, CCPA, and other privacy requirements.",
        category: "privacy",
        isSystem: true,
        isActive: true,
        version: "1.0",
        estimatedTime: 60,
        tags: ["privacy", "gdpr", "ccpa", "data-protection"],
        questions: [
          { id: "pia-1", section: "Data Processing", question: "What personal data will be processed?", type: "multiselect", options: ["Names", "Email addresses", "Phone numbers", "Addresses", "Financial data", "Health data", "Biometric data", "Location data", "IP addresses", "Cookies/identifiers"], required: true },
          { id: "pia-2", section: "Data Processing", question: "What is the lawful basis for processing?", type: "select", options: ["Consent", "Contract", "Legal obligation", "Vital interests", "Public task", "Legitimate interests"], required: true },
          { id: "pia-3", section: "Data Processing", question: "Are you acting as a data controller or processor?", type: "select", options: ["Controller", "Processor", "Joint Controller", "Sub-processor"], required: true },
          { id: "pia-4", section: "Data Subjects", question: "Whose personal data will be processed?", type: "multiselect", options: ["Employees", "Customers", "Minors", "Patients", "Website visitors", "Business contacts"], required: true },
          { id: "pia-5", section: "Data Transfers", question: "Will personal data be transferred outside the EEA/UK?", type: "boolean", required: true },
          { id: "pia-6", section: "Data Transfers", question: "If yes, what transfer mechanism is used?", type: "select", options: ["Standard Contractual Clauses", "Adequacy Decision", "Binding Corporate Rules", "Explicit Consent", "Not Applicable"], required: false },
          { id: "pia-7", section: "Data Retention", question: "What is the data retention period?", type: "text", required: true },
          { id: "pia-8", section: "Data Subject Rights", question: "How do you handle data subject access requests?", type: "textarea", required: true },
          { id: "pia-9", section: "Security Measures", question: "Describe technical measures to protect personal data.", type: "textarea", required: true },
          { id: "pia-10", section: "Security Measures", question: "Describe organizational measures to protect personal data.", type: "textarea", required: true },
          { id: "pia-11", section: "Sub-processors", question: "Do you use sub-processors?", type: "boolean", required: true },
          { id: "pia-12", section: "Sub-processors", question: "If yes, list all sub-processors with access to personal data.", type: "textarea", required: false },
        ],
        totalQuestions: 12,
      },
    ];
    
    for (const template of templates) {
      await db.insert(questionnaireTemplates).values(template);
    }
    
    console.log(`Seeded ${templates.length} questionnaire templates`);
  } catch (error) {
    console.error("Error seeding questionnaire templates:", error);
  }
}

// Seed global policy templates (without tenant ID) for all tenants to see
export async function seedGlobalPolicies() {
  try {
    const existingPolicies = await db.select({ title: policies.title }).from(policies);
    const existingTitles = new Set(existingPolicies.map(p => p.title));
    
    const globalPolicyTemplates = [
      // ISO 27001 Global Policies
      {
        title: "Information Security Policy",
        description: "Establishes the organization's commitment to information security and provides the framework for setting objectives.",
        content: "1. PURPOSE\nThis policy establishes the framework for protecting the organization's information assets, ensuring confidentiality, integrity, and availability.\n\n2. SCOPE\nThis policy applies to all employees, contractors, and third parties with access to organizational information systems.\n\n3. POLICY STATEMENTS\n3.1 Information Classification\nAll information assets must be classified according to sensitivity: Public, Internal, Confidential, Restricted.\n\n3.2 Access Control\nAccess shall be granted based on least privilege and business need-to-know principles.\n\n3.3 Security Awareness\nAll personnel must complete security awareness training annually.\n\n4. COMPLIANCE\nViolations may result in disciplinary action up to and including termination.",
        category: "Information Security",
        version: "1.0",
        status: "draft" as const,
        effectiveDate: new Date(),
        reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Access Control Policy",
        description: "Defines requirements for controlling access to information systems and data.",
        content: "1. PURPOSE\nTo establish requirements for controlling access to organizational information systems and data.\n\n2. SCOPE\nApplies to all systems, applications, networks, and data repositories.\n\n3. ACCESS MANAGEMENT\n3.1 User Registration\nUsers must be formally registered and authorized before receiving access credentials.\n\n3.2 Authentication\nMulti-factor authentication required for remote access and privileged accounts.\n\n3.3 Password Requirements\n- Minimum 14 characters\n- Complexity requirements\n- 90-day rotation for standard accounts\n\n3.4 Access Reviews\nQuarterly access reviews for all critical systems.",
        category: "Access Control",
        version: "1.0",
        status: "draft" as const,
        effectiveDate: new Date(),
        reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Data Protection Policy",
        description: "Defines requirements for protecting personal and sensitive data in compliance with regulations.",
        content: "1. PURPOSE\nDefines the organization's commitment to protecting personal data in compliance with applicable privacy regulations.\n\n2. PRINCIPLES\n2.1 Lawfulness and Transparency\nPersonal data shall be processed lawfully, fairly, and transparently.\n\n2.2 Purpose Limitation\nData collected for specified, explicit, and legitimate purposes only.\n\n2.3 Data Minimization\nOnly necessary data shall be collected and processed.\n\n2.4 Accuracy\nPersonal data shall be accurate and kept up to date.\n\n2.5 Security\nAppropriate technical and organizational measures shall protect personal data.\n\n3. DATA SUBJECT RIGHTS\nIndividuals have rights to access, rectify, erase, and port their personal data.",
        category: "Privacy",
        version: "1.0",
        status: "draft" as const,
        effectiveDate: new Date(),
        reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Acceptable Use Policy",
        description: "Defines acceptable use of organizational IT resources and systems.",
        content: "1. PURPOSE\nTo define acceptable use of organizational IT resources including computers, networks, email, and internet access.\n\n2. SCOPE\nApplies to all users of organizational IT resources.\n\n3. ACCEPTABLE USE\n3.1 Business Use\nIT resources are primarily for business purposes.\n\n3.2 Email and Internet\nProfessional standards must be maintained in all communications.\n\n3.3 Prohibited Activities\n- Unauthorized software installation\n- Accessing inappropriate content\n- Sharing credentials\n- Circumventing security controls\n\n4. MONITORING\nThe organization reserves the right to monitor all IT resource usage.",
        category: "IT Governance",
        version: "1.0",
        status: "draft" as const,
        effectiveDate: new Date(),
        reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Incident Response Policy",
        description: "Establishes the framework for detecting, responding to, and recovering from security incidents.",
        content: "1. PURPOSE\nTo establish a structured approach for managing security incidents.\n\n2. INCIDENT CLASSIFICATION\nLevel 1: Critical - Major breach, system-wide impact\nLevel 2: High - Significant security event\nLevel 3: Medium - Limited impact incident\nLevel 4: Low - Minor security event\n\n3. RESPONSE PHASES\n3.1 Detection and Analysis\n3.2 Containment\n3.3 Eradication\n3.4 Recovery\n3.5 Post-Incident Review\n\n4. REPORTING\nAll incidents must be reported to the Security team within 1 hour of detection.",
        category: "Incident Management",
        version: "1.0",
        status: "draft" as const,
        effectiveDate: new Date(),
        reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Business Continuity Policy",
        description: "Establishes requirements for business continuity planning and disaster recovery.",
        content: "1. PURPOSE\nTo ensure continuity of critical business operations during and after disruptive events.\n\n2. SCOPE\nApplies to all critical business processes and supporting IT systems.\n\n3. REQUIREMENTS\n3.1 Business Impact Analysis\nAnnual BIA for all critical processes.\n\n3.2 Recovery Objectives\n- RTO: Maximum tolerable downtime\n- RPO: Maximum acceptable data loss\n\n3.3 Testing\nBCP/DR plans tested annually.\n\n4. PLAN MAINTENANCE\nPlans reviewed and updated annually or after significant changes.",
        category: "Business Continuity",
        version: "1.0",
        status: "draft" as const,
        effectiveDate: new Date(),
        reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Asset Management Policy",
        description: "Defines requirements for identifying, classifying, and protecting organizational assets.",
        content: "1. PURPOSE\nTo ensure all organizational assets are properly identified, classified, and protected.\n\n2. ASSET TYPES\n- Hardware assets\n- Software assets\n- Information assets\n- Personnel\n- Third-party services\n\n3. ASSET LIFECYCLE\n3.1 Acquisition\n3.2 Deployment\n3.3 Maintenance\n3.4 Disposal\n\n4. CLASSIFICATION\nAssets classified based on confidentiality, integrity, and availability requirements.",
        category: "Asset Management",
        version: "1.0",
        status: "draft" as const,
        effectiveDate: new Date(),
        reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Vendor Risk Management Policy",
        description: "Establishes requirements for assessing and managing third-party vendor risks.",
        content: "1. PURPOSE\nTo establish requirements for managing risks associated with third-party vendors and service providers.\n\n2. VENDOR CLASSIFICATION\nTier 1: Critical - Direct access to sensitive data\nTier 2: Important - Significant business reliance\nTier 3: Standard - Limited risk exposure\n\n3. DUE DILIGENCE\n3.1 Security assessment before engagement\n3.2 Review of certifications (SOC 2, ISO 27001)\n3.3 Contract security requirements\n\n4. ONGOING MONITORING\nAnnual reassessment for Tier 1 and 2 vendors.",
        category: "Vendor Management",
        version: "1.0",
        status: "draft" as const,
        effectiveDate: new Date(),
        reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Change Management Policy",
        description: "Defines requirements for managing changes to IT systems and infrastructure.",
        content: "1. PURPOSE\nTo ensure changes to IT systems are properly authorized, tested, and implemented.\n\n2. CHANGE TYPES\n- Standard: Pre-approved, low-risk\n- Normal: Requires CAB approval\n- Emergency: Urgent business need\n\n3. CHANGE PROCESS\n3.1 Request and documentation\n3.2 Impact assessment\n3.3 Testing and validation\n3.4 Approval\n3.5 Implementation\n3.6 Post-implementation review\n\n4. ROLLBACK\nAll changes require a documented rollback plan.",
        category: "Change Management",
        version: "1.0",
        status: "draft" as const,
        effectiveDate: new Date(),
        reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Network Security Policy",
        description: "Defines requirements for securing network infrastructure and communications.",
        content: "1. PURPOSE\nTo protect organizational networks from unauthorized access and threats.\n\n2. NETWORK ARCHITECTURE\n2.1 Network segmentation based on data sensitivity\n2.2 Defense in depth approach\n\n3. SECURITY CONTROLS\n3.1 Firewalls at network perimeters\n3.2 IDS/IPS for threat detection\n3.3 Network access control (NAC)\n3.4 Encryption for data in transit\n\n4. MONITORING\nContinuous network monitoring and logging required.",
        category: "Network Security",
        version: "1.0",
        status: "draft" as const,
        effectiveDate: new Date(),
        reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Cryptography Policy",
        description: "Establishes requirements for the use of cryptographic controls to protect information.",
        content: "1. PURPOSE\nTo ensure appropriate use of cryptography to protect confidentiality and integrity of information.\n\n2. APPROVED ALGORITHMS\n- AES-256 for symmetric encryption\n- RSA-2048+ or ECC for asymmetric\n- SHA-256+ for hashing\n\n3. KEY MANAGEMENT\n3.1 Secure key generation\n3.2 Protected key storage\n3.3 Key rotation schedules\n3.4 Secure key destruction\n\n4. CERTIFICATES\nDigital certificates from approved CAs only.",
        category: "Cryptography",
        version: "1.0",
        status: "draft" as const,
        effectiveDate: new Date(),
        reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Physical Security Policy",
        description: "Defines requirements for physical protection of facilities and equipment.",
        content: "1. PURPOSE\nTo protect organizational facilities and equipment from physical threats.\n\n2. SECURE AREAS\n2.1 Defined security perimeters\n2.2 Physical entry controls\n2.3 Secured offices, rooms, and facilities\n\n3. EQUIPMENT SECURITY\n3.1 Equipment siting and protection\n3.2 Supporting utilities\n3.3 Cabling security\n3.4 Equipment maintenance\n\n4. VISITOR MANAGEMENT\nAll visitors must be registered and escorted.",
        category: "Physical Security",
        version: "1.0",
        status: "draft" as const,
        effectiveDate: new Date(),
        reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    ];
    
    let insertedCount = 0;
    for (const policy of globalPolicyTemplates) {
      if (!existingTitles.has(policy.title)) {
        await db.insert(policies).values({
          tenantId: null, // Global template - visible to all tenants
          ...policy,
        });
        insertedCount++;
      }
    }
    
    if (insertedCount > 0) {
      console.log(`Seeded ${insertedCount} global policy templates`);
    } else {
      console.log("Global policies already exist");
    }
  } catch (error) {
    console.error("Error seeding global policies:", error);
  }
}

// Seed processes and procedures (global templates without tenant ID)
export async function seedProcessesAndProcedures() {
  try {
    // Check existing processes
    const existingProcesses = await db.select({ id: processes.id }).from(processes);
    const existingProcessIds = new Set(existingProcesses.map(p => p.id));
    
    const processData = [
      { id: "process-isms", title: "ISMS Documentation and Control Process", category: "Documentation", description: "Process for managing Information Security Management System documentation and records control.", content: "1. Document Creation and Approval\\n2. Version Control Management\\n3. Distribution and Access Control\\n4. Review and Update Cycles\\n5. Archive and Retention", status: "draft" as const, version: "1.0" },
      { id: "process-risk-mgmt", title: "Enterprise Risk Management Process", category: "Risk Management", description: "Comprehensive process for identifying, assessing, and managing enterprise-wide risks.", content: "1. Risk Identification\\n2. Risk Assessment\\n3. Risk Treatment Selection\\n4. Implementation and Monitoring\\n5. Reporting and Communication", status: "active" as const, version: "1.0" },
      { id: "process-bcm", title: "Business Continuity Management Process", category: "Business Continuity", description: "Process for ensuring business continuity during disruptions and disasters.", content: "1. Business Impact Analysis\\n2. Strategy Development\\n3. Plan Development\\n4. Testing and Exercises\\n5. Maintenance and Review", status: "active" as const, version: "1.0" },
      { id: "process-it-gov", title: "IT Governance Process", category: "IT Governance", description: "Process for ensuring IT investments align with business objectives.", content: "1. Strategic Alignment\\n2. Value Delivery\\n3. Risk Management\\n4. Resource Management\\n5. Performance Measurement", status: "active" as const, version: "1.0" },
      { id: "process-cloud-sec", title: "Cloud Security Assurance Process", category: "Cloud Security", description: "Process for ensuring security of cloud services and deployments.", content: "1. Cloud Security Assessment\\n2. Configuration Management\\n3. Access Control\\n4. Data Protection\\n5. Compliance Monitoring", status: "active" as const, version: "1.0" },
      { id: "process-tprm", title: "Third-Party Risk Management Process", category: "Vendor Risk", description: "Process for managing risks from third-party vendors and service providers.", content: "1. Vendor Identification\\n2. Due Diligence Assessment\\n3. Contract Review\\n4. Ongoing Monitoring\\n5. Termination Management", status: "active" as const, version: "1.0" },
      { id: "process-audit", title: "Internal Audit Process", category: "Audit", description: "Process for conducting internal audits of GRC controls and processes.", content: "1. Audit Planning\\n2. Risk-Based Scoping\\n3. Fieldwork Execution\\n4. Finding Documentation\\n5. Report and Follow-up", status: "draft" as const, version: "1.0" },
      { id: "process-incident", title: "Incident Response Process", category: "Incident Management", description: "Process for detecting, responding to, and recovering from security incidents.", content: "1. Preparation\\n2. Detection and Analysis\\n3. Containment\\n4. Eradication and Recovery\\n5. Post-Incident Review", status: "draft" as const, version: "1.0" },
      { id: "process-change", title: "Change Management Process", category: "Change Control", description: "Process for managing changes to IT systems and infrastructure.", content: "1. Change Request\\n2. Impact Assessment\\n3. Approval\\n4. Implementation\\n5. Review and Closure", status: "draft" as const, version: "1.0" },
      { id: "process-supplier", title: "Supplier Management Process", category: "Vendor Management", description: "Process for selecting, onboarding, and managing suppliers.", content: "1. Supplier Selection\\n2. Contract Negotiation\\n3. Onboarding\\n4. Performance Monitoring\\n5. Relationship Management", status: "draft" as const, version: "1.0" },
      { id: "process-pci", title: "PCI DSS Quarterly Network Scan Process", category: "Compliance", description: "Process for conducting quarterly network vulnerability scans per PCI DSS.", content: "1. Scope Definition\\n2. ASV Selection\\n3. Scan Execution\\n4. Remediation\\n5. Attestation", status: "draft" as const, version: "1.0" },
      { id: "process-rbi", title: "RBI Incident Reporting Process", category: "Incident Management", description: "Process for reporting cybersecurity incidents to RBI per guidelines.", content: "1. Incident Classification\\n2. Initial Notification\\n3. Detailed Reporting\\n4. Root Cause Analysis\\n5. Closure Notification", status: "draft" as const, version: "1.0" },
      { id: "process-sama", title: "SAMA Cybersecurity Assessment Process", category: "Compliance", description: "Process for conducting SAMA Cybersecurity Framework assessments.", content: "1. Self-Assessment Preparation\\n2. Control Evaluation\\n3. Gap Analysis\\n4. Remediation Planning\\n5. Reporting to SAMA", status: "draft" as const, version: "1.0" },
      { id: "process-gdpr", title: "GDPR Data Subject Access Request Process", category: "Privacy", description: "Process for handling data subject access requests under GDPR.", content: "1. Request Receipt\\n2. Identity Verification\\n3. Data Compilation\\n4. Response Preparation\\n5. Delivery and Documentation", status: "draft" as const, version: "1.0" },
      { id: "process-dpdp", title: "DPDP Compliance Process", category: "Privacy", description: "Process for ensuring compliance with India's Digital Personal Data Protection Act.", content: "1. Consent Management\\n2. Data Processing Records\\n3. Rights Handling\\n4. Breach Notification\\n5. Audit and Review", status: "draft" as const, version: "1.0" },
    ];
    
    let insertedProcesses = 0;
    for (const proc of processData) {
      if (!existingProcessIds.has(proc.id)) {
        await db.insert(processes).values({
          id: proc.id,
          tenantId: null,
          title: proc.title,
          description: proc.description,
          content: proc.content,
          category: proc.category,
          version: proc.version,
          status: proc.status,
        });
        insertedProcesses++;
      }
    }
    
    if (insertedProcesses > 0) {
      console.log(`  Seeded ${insertedProcesses} processes`);
    }
    
    // Check existing procedures
    const existingProcedures = await db.select({ id: procedures.id }).from(procedures);
    const existingProcedureIds = new Set(existingProcedures.map(p => p.id));
    
    const procedureData = [
      { id: "proc-user-create", title: "User Account Creation Procedure", category: "Access Control", description: "Step-by-step procedure for creating user accounts.", procedureType: "global" as const, stepByStep: [{ step: 1, action: "Receive approved access request" }, { step: 2, action: "Verify authorization" }, { step: 3, action: "Create account in IAM system" }, { step: 4, action: "Assign role-based permissions" }, { step: 5, action: "Notify user and provide credentials" }] },
      { id: "proc-user-deprov", title: "User Account Deprovisioning Procedure", category: "Access Control", description: "Step-by-step procedure for removing user access.", procedureType: "global" as const, stepByStep: [{ step: 1, action: "Receive termination notification" }, { step: 2, action: "Disable user account immediately" }, { step: 3, action: "Revoke all access permissions" }, { step: 4, action: "Collect company assets" }, { step: 5, action: "Archive and document" }] },
      { id: "proc-incident-report", title: "Security Incident Reporting Procedure", category: "Incident Management", description: "Procedure for reporting security incidents.", procedureType: "global" as const, stepByStep: [{ step: 1, action: "Identify and classify incident" }, { step: 2, action: "Report to security team immediately" }, { step: 3, action: "Document initial findings" }, { step: 4, action: "Escalate if required" }, { step: 5, action: "Preserve evidence" }] },
      { id: "proc-backup", title: "Backup and Recovery Procedure", category: "Business Continuity", description: "Procedure for data backup and recovery operations.", procedureType: "global" as const, stepByStep: [{ step: 1, action: "Identify critical data and systems" }, { step: 2, action: "Execute scheduled backups" }, { step: 3, action: "Verify backup integrity" }, { step: 4, action: "Store offsite copies" }, { step: 5, action: "Test recovery procedures quarterly" }] },
      { id: "proc-vuln-mgmt", title: "Vulnerability Management Procedure", category: "Vulnerability Management", description: "Procedure for identifying and remediating vulnerabilities.", procedureType: "global" as const, stepByStep: [{ step: 1, action: "Conduct vulnerability scans" }, { step: 2, action: "Analyze and prioritize findings" }, { step: 3, action: "Assign remediation owners" }, { step: 4, action: "Apply patches and fixes" }, { step: 5, action: "Verify remediation" }] },
      { id: "proc-access-review", title: "Access Review Procedure", category: "Access Control", description: "Procedure for periodic access rights review.", procedureType: "global" as const, stepByStep: [{ step: 1, action: "Generate access reports" }, { step: 2, action: "Distribute to managers for review" }, { step: 3, action: "Document approvals and changes" }, { step: 4, action: "Remove unauthorized access" }, { step: 5, action: "Report completion" }] },
      { id: "proc-pci-assess", title: "PCI DSS Annual Self-Assessment Procedure", category: "Compliance", description: "Procedure for completing PCI DSS self-assessment questionnaire.", procedureType: "industry" as const, stepByStep: [{ step: 1, action: "Determine SAQ type" }, { step: 2, action: "Gather evidence for each requirement" }, { step: 3, action: "Complete SAQ responses" }, { step: 4, action: "Submit attestation of compliance" }, { step: 5, action: "Maintain documentation" }] },
      { id: "proc-rbi-audit", title: "RBI Cyber Security Audit Procedure", category: "Audit", description: "Procedure for conducting RBI mandated cyber security audits.", procedureType: "regional" as const, stepByStep: [{ step: 1, action: "Engage empaneled auditor" }, { step: 2, action: "Provide access to systems and documentation" }, { step: 3, action: "Support audit fieldwork" }, { step: 4, action: "Review and respond to findings" }, { step: 5, action: "Submit report to RBI" }] },
      { id: "proc-sama-gap", title: "SAMA Cybersecurity Framework Gap Assessment Procedure", category: "Compliance", description: "Procedure for SAMA CSF gap analysis.", procedureType: "regional" as const, stepByStep: [{ step: 1, action: "Map controls to SAMA domains" }, { step: 2, action: "Assess current maturity level" }, { step: 3, action: "Identify gaps" }, { step: 4, action: "Develop remediation roadmap" }, { step: 5, action: "Report to management" }] },
      { id: "proc-gdpr-breach", title: "GDPR Data Breach Notification Procedure", category: "Incident Management", description: "Procedure for GDPR breach notification within 72 hours.", procedureType: "regional" as const, stepByStep: [{ step: 1, action: "Assess breach severity" }, { step: 2, action: "Document breach details" }, { step: 3, action: "Notify DPA within 72 hours" }, { step: 4, action: "Notify affected individuals if high risk" }, { step: 5, action: "Implement corrective actions" }] },
      { id: "proc-dpdp-rights", title: "DPDP Data Principal Rights Handling Procedure", category: "Privacy", description: "Procedure for handling data principal rights requests under DPDP.", procedureType: "regional" as const, stepByStep: [{ step: 1, action: "Receive rights request" }, { step: 2, action: "Verify principal identity" }, { step: 3, action: "Process request within timeline" }, { step: 4, action: "Document response" }, { step: 5, action: "Maintain audit trail" }] },
      { id: "proc-bia", title: "Business Impact Analysis Procedure", category: "Business Continuity", description: "Procedure for conducting business impact analysis.", procedureType: "global" as const, stepByStep: [{ step: 1, action: "Identify critical business functions" }, { step: 2, action: "Assess impact of disruption" }, { step: 3, action: "Determine RTO and RPO" }, { step: 4, action: "Identify dependencies" }, { step: 5, action: "Document and prioritize" }] },
      { id: "proc-risk-assess", title: "Risk Assessment Procedure", category: "Risk Management", description: "Procedure for conducting risk assessments.", procedureType: "global" as const, stepByStep: [{ step: 1, action: "Identify assets and threats" }, { step: 2, action: "Assess vulnerabilities" }, { step: 3, action: "Calculate risk scores" }, { step: 4, action: "Determine risk treatment" }, { step: 5, action: "Document and communicate" }] },
      { id: "proc-vendor-dd", title: "Vendor Due Diligence Procedure", category: "Vendor Risk", description: "Procedure for vendor security due diligence.", procedureType: "global" as const, stepByStep: [{ step: 1, action: "Send security questionnaire" }, { step: 2, action: "Review SOC reports and certifications" }, { step: 3, action: "Assess data handling practices" }, { step: 4, action: "Evaluate business continuity" }, { step: 5, action: "Document risk rating" }] },
      { id: "proc-nca-assess", title: "NCA ECC Self-Assessment Procedure", category: "Compliance", description: "Procedure for NCA Essential Cybersecurity Controls self-assessment.", procedureType: "regional" as const, stepByStep: [{ step: 1, action: "Map controls to ECC domains" }, { step: 2, action: "Gather compliance evidence" }, { step: 3, action: "Assess implementation level" }, { step: 4, action: "Document gaps and remediation" }, { step: 5, action: "Submit to NCA portal" }] },
    ];
    
    let insertedProcedures = 0;
    for (const proc of procedureData) {
      if (!existingProcedureIds.has(proc.id)) {
        await db.insert(procedures).values({
          id: proc.id,
          tenantId: null,
          processId: null,
          title: proc.title,
          description: proc.description,
          content: proc.description,
          category: proc.category,
          procedureType: proc.procedureType,
          version: "1.0",
          status: "approved",
          stepByStep: proc.stepByStep,
        });
        insertedProcedures++;
      }
    }
    
    if (insertedProcedures > 0) {
      console.log(`  Seeded ${insertedProcedures} procedures`);
    }
    
  } catch (error) {
    console.error("Error seeding processes and procedures:", error);
  }
}
