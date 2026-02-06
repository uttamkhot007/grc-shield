import { eq, desc, and, or, isNull, like, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  tenants,
  tenantInvitations,
  regions,
  frameworks,
  controls,
  policies,
  risks,
  audits,
  auditChecklist,
  complianceItems,
  vendors,
  dataPrivacy,
  alerts,
  aiInsights,
  trainingModules,
  userTraining,
  tenantFrameworks,
  licenses,
  processes,
  processTemplates,
  procedures,
  procedureTemplates,
  integrationSettings,
  ropaEntries,
  consentRecords,
  cookieConsents,
  dsrRequests,
  breachIncidents,
  dpias,
  dataMappings,
  retentionPolicies,
  dataDiscoveryResults,
  purposeLegalBasis,
  crossBorderTransfers,
  aiPrivacyRecords,
  privacySignals,
  reportTemplates,
  generatedReports,
  activityLogs,
  trustCenterSettings,
  trustCenterCertifications,
  trustCenterDocuments,
  controlMonitors,
  controlTestResults,
  controlAlerts,
  evidenceItems,
  evidenceRequests,
  regulatoryUpdates,
  tenantRegulatoryTracking,
  riskQuantification,
  integrationConnectors,
  tenantConnections,
  esgCategories,
  esgMetrics,
  esgInitiatives,
  bcpPlans,
  businessImpactAnalysis,
  bcpTests,
  bcpPlanCatalog,
  bcpTestTemplates,
  riskCatalog,
  riskRegisterTemplates,
  tenantRiskRegisters,
  riskRegisterEntries,
  platformDocuments,
  approvalWorkflows,
  approvalLevels,
  approverAssignments,
  employeeDevices,
  policyAcknowledgments,
  trainingAssignments,
  cybersecurityTips,
  incidentGuidance,
  securityScans,
  securityFindings,
  securityPostureAssessments,
  securityScorecards,
  securityPostureHistory,
  securityControlAssessments,
  securityControlItems,
  dataDiscoveryScans,
  sensitiveDataLocations,
  dataFlowMappings,
  dataAccessRisks,
  // Governance Module Tables
  aiSystems,
  dataAssets,
  governanceDecisions,
  raciItems,
  governanceChangeEvents,
  governanceChangeImpacts,
  governanceNodes,
  governanceNodeRelationships,
  // Advanced Risk Module Tables
  riskScenarios,
  riskAppetite,
  riskAppetiteBreaches,
  riskAggregation,
  controlEffectiveness,
  riskSignals,
  type User,
  type InsertUser,
  type Tenant,
  type InsertTenant,
  type Region,
  type InsertRegion,
  type Framework,
  type InsertFramework,
  type Control,
  type InsertControl,
  type Policy,
  type InsertPolicy,
  type Risk,
  type InsertRisk,
  type Audit,
  type InsertAudit,
  type Vendor,
  type InsertVendor,
  type AiInsight,
  type InsertAiInsight,
  type Alert,
  type InsertAlert,
  type License,
  type InsertLicense,
  type TrainingModule,
  type InsertTrainingModule,
  type UserTraining,
  type InsertUserTraining,
  type Process,
  type InsertProcess,
  type ProcessTemplate,
  type InsertProcessTemplate,
  type Procedure,
  type InsertProcedure,
  type ProcedureTemplate,
  type InsertProcedureTemplate,
  type IntegrationSetting,
  type InsertIntegrationSetting,
  type RopaEntry,
  type InsertRopaEntry,
  type ConsentRecord,
  type InsertConsentRecord,
  type CookieConsent,
  type InsertCookieConsent,
  type DsrRequest,
  type InsertDsrRequest,
  type BreachIncident,
  type InsertBreachIncident,
  type Dpia,
  type InsertDpia,
  type DataMapping,
  type InsertDataMapping,
  type RetentionPolicy,
  type InsertRetentionPolicy,
  type DataDiscoveryResult,
  type InsertDataDiscoveryResult,
  type PurposeLegalBasis,
  type InsertPurposeLegalBasis,
  type CrossBorderTransfer,
  type InsertCrossBorderTransfer,
  type AiPrivacyRecord,
  type InsertAiPrivacyRecord,
  type PrivacySignal,
  type InsertPrivacySignal,
  type ReportTemplate,
  type InsertReportTemplate,
  type GeneratedReport,
  type InsertGeneratedReport,
  type ActivityLog,
  type InsertActivityLog,
  type TenantInvitation,
  type InsertTenantInvitation,
  type RiskCatalogItem,
  type InsertRiskCatalogItem,
  type RiskRegisterTemplate,
  type InsertRiskRegisterTemplate,
  type TenantRiskRegister,
  type InsertTenantRiskRegister,
  type RiskRegisterEntry,
  type InsertRiskRegisterEntry,
  type PlatformDocument,
  type InsertPlatformDocument,
  // Governance Module Types
  type AiSystem,
  type InsertAiSystem,
  type DataAsset,
  type InsertDataAsset,
  type GovernanceDecision,
  type InsertGovernanceDecision,
  type RaciItem,
  type InsertRaciItem,
  type GovernanceChangeEvent,
  type InsertGovernanceChangeEvent,
  type GovernanceChangeImpact,
  type InsertGovernanceChangeImpact,
  type GovernanceNode,
  type InsertGovernanceNode,
  type GovernanceNodeRelationship,
  type InsertGovernanceNodeRelationship,
  // Advanced Risk Module Types
  type RiskScenario,
  type InsertRiskScenario,
  type RiskAppetite as RiskAppetiteRecord,
  type InsertRiskAppetite,
  type RiskAppetiteBreach,
  type InsertRiskAppetiteBreach,
  type RiskAggregation as RiskAggregationRecord,
  type InsertRiskAggregation,
  type ControlEffectiveness as ControlEffectivenessRecord,
  type InsertControlEffectiveness,
  type RiskSignal as RiskSignalRecord,
  type InsertRiskSignal,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(tenantId?: string): Promise<User[]>;
  
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenants(): Promise<Tenant[]>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  
  getRegions(): Promise<Region[]>;
  createRegion(region: InsertRegion): Promise<Region>;
  
  getFrameworks(): Promise<Framework[]>;
  getFramework(id: string): Promise<Framework | undefined>;
  createFramework(framework: InsertFramework): Promise<Framework>;
  
  getControls(frameworkId?: string): Promise<Control[]>;
  getControl(id: string): Promise<Control | undefined>;
  createControl(control: InsertControl): Promise<Control>;
  updateControl(id: string, control: Partial<InsertControl>): Promise<Control | undefined>;
  
  getPolicies(tenantId?: string): Promise<Policy[]>;
  getPolicy(id: string): Promise<Policy | undefined>;
  createPolicy(policy: InsertPolicy): Promise<Policy>;
  updatePolicy(id: string, policy: Partial<InsertPolicy>): Promise<Policy | undefined>;
  deletePolicy(id: string): Promise<boolean>;
  
  getRisks(tenantId?: string): Promise<Risk[]>;
  getRisk(id: string): Promise<Risk | undefined>;
  createRisk(risk: InsertRisk): Promise<Risk>;
  updateRisk(id: string, risk: Partial<InsertRisk>): Promise<Risk | undefined>;
  deleteRisk(id: string): Promise<boolean>;
  
  getAudits(tenantId?: string): Promise<Audit[]>;
  getAudit(id: string): Promise<Audit | undefined>;
  createAudit(audit: InsertAudit): Promise<Audit>;
  updateAudit(id: string, audit: Partial<InsertAudit>): Promise<Audit | undefined>;
  
  getVendors(tenantId?: string): Promise<Vendor[]>;
  getVendor(id: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: string, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
  
  getAiInsights(tenantId?: string): Promise<AiInsight[]>;
  createAiInsight(insight: InsertAiInsight): Promise<AiInsight>;
  
  getAlerts(tenantId: string, userId?: string): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertRead(id: string): Promise<Alert | undefined>;
  
  getLicenses(): Promise<License[]>;
  getLicense(id: string): Promise<License | undefined>;
  getLicenseByTenant(tenantId: string): Promise<License | undefined>;
  createLicense(license: InsertLicense): Promise<License>;
  updateLicense(id: string, license: Partial<InsertLicense>): Promise<License | undefined>;
  deleteLicense(id: string): Promise<boolean>;

  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  
  updateTenant(id: string, tenant: Partial<InsertTenant>): Promise<Tenant | undefined>;
  deleteTenant(id: string): Promise<boolean>;
  getTenantBySlug(slug: string): Promise<Tenant | undefined>;
  
  // Tenant Invitations (Onboarding Workflow)
  getTenantInvitations(): Promise<TenantInvitation[]>;
  getTenantInvitation(id: string): Promise<TenantInvitation | undefined>;
  getTenantInvitationByToken(token: string): Promise<TenantInvitation | undefined>;
  getTenantInvitationBySlug(slug: string): Promise<TenantInvitation | undefined>;
  createTenantInvitation(invitation: InsertTenantInvitation): Promise<TenantInvitation>;
  updateTenantInvitation(id: string, invitation: Partial<InsertTenantInvitation>): Promise<TenantInvitation | undefined>;
  
  getTrainingModules(tenantId?: string): Promise<TrainingModule[]>;
  getTrainingModule(id: string): Promise<TrainingModule | undefined>;
  createTrainingModule(module: InsertTrainingModule): Promise<TrainingModule>;
  
  getUserTrainings(userId: string): Promise<UserTraining[]>;
  createUserTraining(training: InsertUserTraining): Promise<UserTraining>;
  updateUserTraining(id: string, training: Partial<InsertUserTraining>): Promise<UserTraining | undefined>;
  
  getDashboardStats(tenantId?: string): Promise<{
    complianceScore: number | null;
    activeRisks: number;
    controlsImplemented: number;
    pendingAudits: number;
    criticalRisks: number;
    highRisks: number;
    automatedControls: number | null;
    nextAuditDays: number | null;
    nextAuditName: string | null;
    hasComplianceData: boolean;
  }>;

  // Activity Logs
  getActivityLogs(tenantId?: string, limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  
  // Tenant Frameworks
  getTenantFrameworks(tenantId: string): Promise<any[]>;
  addTenantFramework(data: { tenantId: string; frameworkId: string; applicabilityType: string; status: string }): Promise<any>;
  removeTenantFramework(id: string): Promise<boolean>;
  
  // Upcoming Deadlines
  getUpcomingDeadlines(tenantId?: string): Promise<any[]>;

  // Processes & Procedures
  getProcesses(tenantId?: string): Promise<Process[]>;
  getProcess(id: string): Promise<Process | undefined>;
  createProcess(process: InsertProcess): Promise<Process>;
  updateProcess(id: string, process: Partial<InsertProcess>): Promise<Process | undefined>;
  deleteProcess(id: string): Promise<boolean>;
  
  getProcessTemplates(): Promise<ProcessTemplate[]>;
  getProcessTemplate(id: string): Promise<ProcessTemplate | undefined>;
  createProcessTemplate(template: InsertProcessTemplate): Promise<ProcessTemplate>;
  
  // Procedures
  getProcedures(tenantId?: string): Promise<Procedure[]>;
  getProcedure(id: string): Promise<Procedure | undefined>;
  createProcedure(procedure: InsertProcedure): Promise<Procedure>;
  updateProcedure(id: string, procedure: Partial<InsertProcedure>): Promise<Procedure | undefined>;
  deleteProcedure(id: string): Promise<boolean>;
  
  getProcedureTemplates(): Promise<ProcedureTemplate[]>;
  getProcedureTemplate(id: string): Promise<ProcedureTemplate | undefined>;
  createProcedureTemplate(template: InsertProcedureTemplate): Promise<ProcedureTemplate>;
  
  // Integration Settings
  getIntegrationSettings(tenantId?: string): Promise<IntegrationSetting[]>;
  getIntegrationSetting(id: string): Promise<IntegrationSetting | undefined>;
  createIntegrationSetting(setting: InsertIntegrationSetting): Promise<IntegrationSetting>;
  updateIntegrationSetting(id: string, setting: Partial<InsertIntegrationSetting>): Promise<IntegrationSetting | undefined>;
  deleteIntegrationSetting(id: string): Promise<boolean>;

  // ========================================
  // PRIVACY MODULE
  // ========================================
  
  // ROPA (Record of Processing Activities)
  getRopaEntries(tenantId?: string): Promise<RopaEntry[]>;
  getRopaEntry(id: string): Promise<RopaEntry | undefined>;
  createRopaEntry(entry: InsertRopaEntry): Promise<RopaEntry>;
  updateRopaEntry(id: string, entry: Partial<InsertRopaEntry>): Promise<RopaEntry | undefined>;
  deleteRopaEntry(id: string): Promise<boolean>;

  // Consent Records
  getConsentRecords(tenantId?: string): Promise<ConsentRecord[]>;
  getConsentRecord(id: string): Promise<ConsentRecord | undefined>;
  createConsentRecord(record: InsertConsentRecord): Promise<ConsentRecord>;
  updateConsentRecord(id: string, record: Partial<InsertConsentRecord>): Promise<ConsentRecord | undefined>;
  deleteConsentRecord(id: string): Promise<boolean>;

  // Cookie Consents
  getCookieConsents(tenantId?: string): Promise<CookieConsent[]>;
  getCookieConsent(id: string): Promise<CookieConsent | undefined>;
  createCookieConsent(consent: InsertCookieConsent): Promise<CookieConsent>;
  updateCookieConsent(id: string, consent: Partial<InsertCookieConsent>): Promise<CookieConsent | undefined>;

  // DSR Requests
  getDsrRequests(tenantId?: string): Promise<DsrRequest[]>;
  getDsrRequest(id: string): Promise<DsrRequest | undefined>;
  createDsrRequest(request: InsertDsrRequest): Promise<DsrRequest>;
  updateDsrRequest(id: string, request: Partial<InsertDsrRequest>): Promise<DsrRequest | undefined>;
  deleteDsrRequest(id: string): Promise<boolean>;

  // Breach Incidents
  getBreachIncidents(tenantId?: string): Promise<BreachIncident[]>;
  getBreachIncident(id: string): Promise<BreachIncident | undefined>;
  createBreachIncident(incident: InsertBreachIncident): Promise<BreachIncident>;
  updateBreachIncident(id: string, incident: Partial<InsertBreachIncident>): Promise<BreachIncident | undefined>;
  deleteBreachIncident(id: string): Promise<boolean>;

  // DPIAs
  getDpias(tenantId?: string): Promise<Dpia[]>;
  getDpia(id: string): Promise<Dpia | undefined>;
  createDpia(dpia: InsertDpia): Promise<Dpia>;
  updateDpia(id: string, dpia: Partial<InsertDpia>): Promise<Dpia | undefined>;
  deleteDpia(id: string): Promise<boolean>;

  // Data Mappings
  getDataMappings(tenantId?: string): Promise<DataMapping[]>;
  getDataMapping(id: string): Promise<DataMapping | undefined>;
  createDataMapping(mapping: InsertDataMapping): Promise<DataMapping>;
  updateDataMapping(id: string, mapping: Partial<InsertDataMapping>): Promise<DataMapping | undefined>;
  deleteDataMapping(id: string): Promise<boolean>;

  // Retention Policies
  getRetentionPolicies(tenantId?: string): Promise<RetentionPolicy[]>;
  getRetentionPolicy(id: string): Promise<RetentionPolicy | undefined>;
  createRetentionPolicy(policy: InsertRetentionPolicy): Promise<RetentionPolicy>;
  updateRetentionPolicy(id: string, policy: Partial<InsertRetentionPolicy>): Promise<RetentionPolicy | undefined>;
  deleteRetentionPolicy(id: string): Promise<boolean>;

  // Data Discovery Results
  getDataDiscoveryResults(tenantId?: string): Promise<DataDiscoveryResult[]>;
  getDataDiscoveryResult(id: string): Promise<DataDiscoveryResult | undefined>;
  createDataDiscoveryResult(result: InsertDataDiscoveryResult): Promise<DataDiscoveryResult>;

  // Purpose & Legal Basis
  getPurposeLegalBasisEntries(tenantId?: string): Promise<PurposeLegalBasis[]>;
  createPurposeLegalBasis(data: InsertPurposeLegalBasis): Promise<PurposeLegalBasis>;
  updatePurposeLegalBasis(id: string, data: Partial<InsertPurposeLegalBasis>): Promise<PurposeLegalBasis | undefined>;

  // Cross-Border Transfers
  getCrossBorderTransfers(tenantId?: string): Promise<CrossBorderTransfer[]>;
  createCrossBorderTransfer(data: InsertCrossBorderTransfer): Promise<CrossBorderTransfer>;
  updateCrossBorderTransfer(id: string, data: Partial<InsertCrossBorderTransfer>): Promise<CrossBorderTransfer | undefined>;

  // AI Privacy Records
  getAiPrivacyRecords(tenantId?: string): Promise<AiPrivacyRecord[]>;
  createAiPrivacyRecord(data: InsertAiPrivacyRecord): Promise<AiPrivacyRecord>;
  updateAiPrivacyRecord(id: string, data: Partial<InsertAiPrivacyRecord>): Promise<AiPrivacyRecord | undefined>;

  // Privacy Signals
  getPrivacySignals(tenantId?: string): Promise<PrivacySignal[]>;
  createPrivacySignal(data: InsertPrivacySignal): Promise<PrivacySignal>;
  updatePrivacySignal(id: string, data: Partial<InsertPrivacySignal>): Promise<PrivacySignal | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUsers(tenantId?: string): Promise<User[]> {
    if (tenantId) {
      return db.select().from(users).where(eq(users.tenantId, tenantId));
    }
    return db.select().from(users);
  }

  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }

  async getTenants(): Promise<Tenant[]> {
    return db.select().from(tenants).orderBy(desc(tenants.createdAt));
  }

  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const [newTenant] = await db.insert(tenants).values(tenant).returning();
    return newTenant;
  }

  async getRegions(): Promise<Region[]> {
    return db.select().from(regions);
  }

  async createRegion(region: InsertRegion): Promise<Region> {
    const [newRegion] = await db.insert(regions).values(region).returning();
    return newRegion;
  }

  async getFrameworks(): Promise<Framework[]> {
    return db.select().from(frameworks);
  }

  async getFramework(id: string): Promise<Framework | undefined> {
    const [framework] = await db.select().from(frameworks).where(eq(frameworks.id, id));
    return framework;
  }

  async createFramework(framework: InsertFramework): Promise<Framework> {
    const [newFramework] = await db.insert(frameworks).values(framework).returning();
    return newFramework;
  }

  async getControls(frameworkId?: string): Promise<Control[]> {
    if (frameworkId) {
      return db.select().from(controls).where(eq(controls.frameworkId, frameworkId));
    }
    return db.select().from(controls);
  }

  async createControl(control: InsertControl): Promise<Control> {
    const [newControl] = await db.insert(controls).values(control).returning();
    return newControl;
  }

  async getControl(id: string): Promise<Control | undefined> {
    const [control] = await db.select().from(controls).where(eq(controls.id, id));
    return control;
  }

  async updateControl(id: string, control: Partial<InsertControl>): Promise<Control | undefined> {
    const [updated] = await db.update(controls).set(control).where(eq(controls.id, id)).returning();
    return updated;
  }

  async getPolicies(tenantId?: string): Promise<Policy[]> {
    if (tenantId) {
      // Return tenant-specific policies AND global policies (NULL tenantId)
      return db.select().from(policies)
        .where(or(eq(policies.tenantId, tenantId), isNull(policies.tenantId)))
        .orderBy(desc(policies.createdAt));
    }
    return db.select().from(policies).orderBy(desc(policies.createdAt));
  }

  async getPolicy(id: string): Promise<Policy | undefined> {
    const [policy] = await db.select().from(policies).where(eq(policies.id, id));
    return policy;
  }

  async createPolicy(policy: InsertPolicy): Promise<Policy> {
    const [newPolicy] = await db.insert(policies).values(policy).returning();
    return newPolicy;
  }

  async updatePolicy(id: string, policy: Partial<InsertPolicy>): Promise<Policy | undefined> {
    const [updated] = await db.update(policies).set({ ...policy, updatedAt: new Date() }).where(eq(policies.id, id)).returning();
    return updated;
  }

  async deletePolicy(id: string): Promise<boolean> {
    const result = await db.delete(policies).where(eq(policies.id, id));
    return true;
  }

  async getRisks(tenantId?: string): Promise<Risk[]> {
    if (tenantId) {
      return db.select().from(risks).where(eq(risks.tenantId, tenantId)).orderBy(desc(risks.identifiedAt));
    }
    return db.select().from(risks).orderBy(desc(risks.identifiedAt));
  }

  async getRisk(id: string): Promise<Risk | undefined> {
    const [risk] = await db.select().from(risks).where(eq(risks.id, id));
    return risk;
  }

  async createRisk(risk: InsertRisk): Promise<Risk> {
    const [newRisk] = await db.insert(risks).values(risk).returning();
    return newRisk;
  }

  async updateRisk(id: string, risk: Partial<InsertRisk>): Promise<Risk | undefined> {
    const [updated] = await db.update(risks).set(risk).where(eq(risks.id, id)).returning();
    return updated;
  }

  async deleteRisk(id: string): Promise<boolean> {
    await db.delete(risks).where(eq(risks.id, id));
    return true;
  }

  async getAudits(tenantId?: string): Promise<Audit[]> {
    if (tenantId) {
      return db.select().from(audits).where(eq(audits.tenantId, tenantId)).orderBy(desc(audits.createdAt));
    }
    return db.select().from(audits).orderBy(desc(audits.createdAt));
  }

  async getAudit(id: string): Promise<Audit | undefined> {
    const [audit] = await db.select().from(audits).where(eq(audits.id, id));
    return audit;
  }

  async createAudit(audit: InsertAudit): Promise<Audit> {
    const [newAudit] = await db.insert(audits).values(audit).returning();
    return newAudit;
  }

  async updateAudit(id: string, audit: Partial<InsertAudit>): Promise<Audit | undefined> {
    const [updated] = await db.update(audits).set(audit).where(eq(audits.id, id)).returning();
    return updated;
  }

  async getVendors(tenantId?: string): Promise<Vendor[]> {
    if (tenantId) {
      return db.select().from(vendors).where(eq(vendors.tenantId, tenantId)).orderBy(desc(vendors.createdAt));
    }
    return db.select().from(vendors).orderBy(desc(vendors.createdAt));
  }

  async getVendor(id: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor;
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }

  async updateVendor(id: string, vendor: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const [updated] = await db.update(vendors).set(vendor).where(eq(vendors.id, id)).returning();
    return updated;
  }

  async getAiInsights(tenantId?: string): Promise<AiInsight[]> {
    if (tenantId) {
      return db.select().from(aiInsights).where(eq(aiInsights.tenantId, tenantId)).orderBy(desc(aiInsights.createdAt));
    }
    return db.select().from(aiInsights).orderBy(desc(aiInsights.createdAt));
  }

  async createAiInsight(insight: InsertAiInsight): Promise<AiInsight> {
    const [newInsight] = await db.insert(aiInsights).values(insight).returning();
    return newInsight;
  }

  async getAlerts(tenantId: string, userId?: string): Promise<Alert[]> {
    if (userId) {
      return db.select().from(alerts).where(and(eq(alerts.tenantId, tenantId), eq(alerts.userId, userId))).orderBy(desc(alerts.createdAt));
    }
    return db.select().from(alerts).where(eq(alerts.tenantId, tenantId)).orderBy(desc(alerts.createdAt));
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db.insert(alerts).values(alert).returning();
    return newAlert;
  }

  async markAlertRead(id: string): Promise<Alert | undefined> {
    const [updated] = await db.update(alerts).set({ isRead: true }).where(eq(alerts.id, id)).returning();
    return updated;
  }

  async getDashboardStats(tenantId?: string): Promise<{
    complianceScore: number | null;
    activeRisks: number;
    controlsImplemented: number;
    pendingAudits: number;
    criticalRisks: number;
    highRisks: number;
    automatedControls: number | null;
    nextAuditDays: number | null;
    nextAuditName: string | null;
    hasComplianceData: boolean;
  }> {
    // Get risks - filtered by tenant if provided
    const tenantRisks = tenantId 
      ? await db.select().from(risks).where(eq(risks.tenantId, tenantId))
      : await db.select().from(risks);
    
    // Get audits - filtered by tenant if provided
    const tenantAudits = tenantId
      ? await db.select().from(audits).where(eq(audits.tenantId, tenantId))
      : await db.select().from(audits);
    
    // Get compliance items to calculate actual score
    const tenantCompliance = tenantId
      ? await db.select().from(complianceItems).where(eq(complianceItems.tenantId, tenantId))
      : await db.select().from(complianceItems);
    
    // Get all controls - check for automatedCheck field to count automated controls
    const allControls = await db.select().from(controls);
    
    // Calculate real compliance score based on compliance items
    const hasComplianceData = tenantCompliance.length > 0;
    const compliantItems = tenantCompliance.filter(c => 
      c.status?.toLowerCase() === "compliant" || 
      c.status?.toLowerCase() === "implemented" ||
      c.status?.toLowerCase() === "complete"
    ).length;
    const complianceScore = hasComplianceData 
      ? Math.round((compliantItems / tenantCompliance.length) * 100)
      : null;
    
    // Calculate risk counts - normalize status and level comparisons
    const activeRisksList = tenantRisks.filter(r => {
      const status = r.status?.toLowerCase();
      return status === "active" || status === "open" || status === "identified";
    });
    const activeRisks = activeRisksList.length;
    const criticalRisks = activeRisksList.filter(r => r.riskLevel?.toLowerCase() === "critical").length;
    const highRisks = activeRisksList.filter(r => r.riskLevel?.toLowerCase() === "high").length;
    
    // Calculate pending audits
    const pendingAuditsList = tenantAudits.filter(a => {
      const status = a.status?.toLowerCase();
      return status === "scheduled" || status === "in_progress" || status === "in progress" || status === "pending";
    });
    const pendingAudits = pendingAuditsList.length;
    
    // Find next upcoming audit - only use real data, no defaults
    const scheduledAudits = tenantAudits
      .filter(a => (a.status?.toLowerCase() === "scheduled" || a.status?.toLowerCase() === "pending") && a.startDate)
      .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime());
    
    const nextAudit = scheduledAudits[0];
    const nextAuditDays = nextAudit && nextAudit.startDate 
      ? Math.max(0, Math.ceil((new Date(nextAudit.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;
    const nextAuditName = nextAudit?.title || null;
    
    // Calculate automated controls from actual control data - return null if no controls
    const automatedControlsCount = allControls.filter(c => c.automationLevel === 'fully_automated').length;
    const automatedControls = allControls.length > 0 
      ? Math.round((automatedControlsCount / allControls.length) * 100)
      : null;
    
    return {
      complianceScore,
      activeRisks,
      controlsImplemented: allControls.length,
      pendingAudits,
      criticalRisks,
      highRisks,
      automatedControls,
      nextAuditDays,
      nextAuditName,
      hasComplianceData,
    };
  }

  // License methods
  async getLicenses(): Promise<License[]> {
    return db.select().from(licenses).orderBy(desc(licenses.createdAt));
  }

  async getLicense(id: string): Promise<License | undefined> {
    const [license] = await db.select().from(licenses).where(eq(licenses.id, id));
    return license;
  }

  async getLicenseByTenant(tenantId: string): Promise<License | undefined> {
    const [license] = await db.select().from(licenses).where(eq(licenses.tenantId, tenantId));
    return license;
  }

  async createLicense(license: InsertLicense): Promise<License> {
    const [newLicense] = await db.insert(licenses).values(license).returning();
    return newLicense;
  }

  async updateLicense(id: string, license: Partial<InsertLicense>): Promise<License | undefined> {
    const [updated] = await db.update(licenses).set(license).where(eq(licenses.id, id)).returning();
    return updated;
  }

  async deleteLicense(id: string): Promise<boolean> {
    const result = await db.delete(licenses).where(eq(licenses.id, id));
    return true;
  }

  // User update/delete methods
  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    await db.delete(users).where(eq(users.id, id));
    return true;
  }

  // Tenant update/delete methods
  async updateTenant(id: string, tenant: Partial<InsertTenant>): Promise<Tenant | undefined> {
    const [updated] = await db.update(tenants).set(tenant).where(eq(tenants.id, id)).returning();
    return updated;
  }

  async deleteTenant(id: string): Promise<boolean> {
    // Cascade delete all related records before deleting the tenant
    // Wrapped in transaction for atomicity
    await db.transaction(async (tx) => {
      // Get all users for this tenant to delete userTraining records
      const tenantUsers = await tx.select({ id: users.id }).from(users).where(eq(users.tenantId, id));
      const userIds = tenantUsers.map(u => u.id);
      
      // Get all audits for this tenant to delete auditChecklist records
      const tenantAudits = await tx.select({ id: audits.id }).from(audits).where(eq(audits.tenantId, id));
      const auditIds = tenantAudits.map(a => a.id);
      
      // Delete userTraining for tenant users
      if (userIds.length > 0) {
        for (const userId of userIds) {
          await tx.delete(userTraining).where(eq(userTraining.userId, userId));
        }
      }
      
      // Delete auditChecklist for tenant audits
      if (auditIds.length > 0) {
        for (const auditId of auditIds) {
          await tx.delete(auditChecklist).where(eq(auditChecklist.auditId, auditId));
        }
      }
      
      // Delete records with direct tenantId references
      await tx.delete(controlAlerts).where(eq(controlAlerts.tenantId, id));
      await tx.delete(controlTestResults).where(eq(controlTestResults.tenantId, id));
      await tx.delete(controlMonitors).where(eq(controlMonitors.tenantId, id));
      await tx.delete(evidenceRequests).where(eq(evidenceRequests.tenantId, id));
      await tx.delete(evidenceItems).where(eq(evidenceItems.tenantId, id));
      await tx.delete(trustCenterDocuments).where(eq(trustCenterDocuments.tenantId, id));
      await tx.delete(trustCenterCertifications).where(eq(trustCenterCertifications.tenantId, id));
      await tx.delete(trustCenterSettings).where(eq(trustCenterSettings.tenantId, id));
      await tx.delete(tenantRegulatoryTracking).where(eq(tenantRegulatoryTracking.tenantId, id));
      await tx.delete(tenantConnections).where(eq(tenantConnections.tenantId, id));
      await tx.delete(esgInitiatives).where(eq(esgInitiatives.tenantId, id));
      await tx.delete(esgMetrics).where(eq(esgMetrics.tenantId, id));
      await tx.delete(bcpTests).where(eq(bcpTests.tenantId, id));
      await tx.delete(businessImpactAnalysis).where(eq(businessImpactAnalysis.tenantId, id));
      await tx.delete(bcpPlans).where(eq(bcpPlans.tenantId, id));
      await tx.delete(riskQuantification).where(eq(riskQuantification.tenantId, id));
      await tx.delete(generatedReports).where(eq(generatedReports.tenantId, id));
      await tx.delete(integrationSettings).where(eq(integrationSettings.tenantId, id));
      await tx.delete(procedures).where(eq(procedures.tenantId, id));
      await tx.delete(processes).where(eq(processes.tenantId, id));
      await tx.delete(dataDiscoveryResults).where(eq(dataDiscoveryResults.tenantId, id));
      await tx.delete(retentionPolicies).where(eq(retentionPolicies.tenantId, id));
      await tx.delete(dataMappings).where(eq(dataMappings.tenantId, id));
      await tx.delete(dpias).where(eq(dpias.tenantId, id));
      await tx.delete(breachIncidents).where(eq(breachIncidents.tenantId, id));
      await tx.delete(dsrRequests).where(eq(dsrRequests.tenantId, id));
      await tx.delete(cookieConsents).where(eq(cookieConsents.tenantId, id));
      await tx.delete(consentRecords).where(eq(consentRecords.tenantId, id));
      await tx.delete(ropaEntries).where(eq(ropaEntries.tenantId, id));
      await tx.delete(trainingModules).where(eq(trainingModules.tenantId, id));
      await tx.delete(aiInsights).where(eq(aiInsights.tenantId, id));
      await tx.delete(alerts).where(eq(alerts.tenantId, id));
      await tx.delete(dataPrivacy).where(eq(dataPrivacy.tenantId, id));
      await tx.delete(vendors).where(eq(vendors.tenantId, id));
      await tx.delete(complianceItems).where(eq(complianceItems.tenantId, id));
      await tx.delete(audits).where(eq(audits.tenantId, id));
      await tx.delete(risks).where(eq(risks.tenantId, id));
      await tx.delete(policies).where(eq(policies.tenantId, id));
      await tx.delete(tenantFrameworks).where(eq(tenantFrameworks.tenantId, id));
      await tx.delete(activityLogs).where(eq(activityLogs.tenantId, id));
      await tx.delete(users).where(eq(users.tenantId, id));
      await tx.delete(licenses).where(eq(licenses.tenantId, id));
      // Finally delete the tenant
      await tx.delete(tenants).where(eq(tenants.id, id));
    });
    return true;
  }

  async getTenantBySlug(slug: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, slug));
    return tenant;
  }

  // Tenant Invitations (Onboarding Workflow)
  async getTenantInvitations(): Promise<TenantInvitation[]> {
    return db.select().from(tenantInvitations).orderBy(desc(tenantInvitations.createdAt));
  }

  async getTenantInvitation(id: string): Promise<TenantInvitation | undefined> {
    const [invitation] = await db.select().from(tenantInvitations).where(eq(tenantInvitations.id, id));
    return invitation;
  }

  async getTenantInvitationByToken(token: string): Promise<TenantInvitation | undefined> {
    const [invitation] = await db.select().from(tenantInvitations).where(eq(tenantInvitations.inviteToken, token));
    return invitation;
  }

  async getTenantInvitationBySlug(slug: string): Promise<TenantInvitation | undefined> {
    const [invitation] = await db.select().from(tenantInvitations).where(eq(tenantInvitations.tenantSlug, slug));
    return invitation;
  }

  async createTenantInvitation(invitation: InsertTenantInvitation): Promise<TenantInvitation> {
    const [newInvitation] = await db.insert(tenantInvitations).values(invitation).returning();
    return newInvitation;
  }

  async updateTenantInvitation(id: string, invitation: Partial<InsertTenantInvitation>): Promise<TenantInvitation | undefined> {
    const [updated] = await db.update(tenantInvitations).set(invitation).where(eq(tenantInvitations.id, id)).returning();
    return updated;
  }

  // Training module methods
  async getTrainingModules(tenantId?: string): Promise<TrainingModule[]> {
    if (tenantId) {
      return db.select().from(trainingModules).where(eq(trainingModules.tenantId, tenantId));
    }
    return db.select().from(trainingModules);
  }

  async getTrainingModule(id: string): Promise<TrainingModule | undefined> {
    const [module] = await db.select().from(trainingModules).where(eq(trainingModules.id, id));
    return module;
  }

  async createTrainingModule(module: InsertTrainingModule): Promise<TrainingModule> {
    const [newModule] = await db.insert(trainingModules).values(module).returning();
    return newModule;
  }

  async getUserTrainings(userId: string): Promise<UserTraining[]> {
    return db.select().from(userTraining).where(eq(userTraining.userId, userId));
  }

  async createUserTraining(training: InsertUserTraining): Promise<UserTraining> {
    const [newTraining] = await db.insert(userTraining).values(training).returning();
    return newTraining;
  }

  async updateUserTraining(id: string, training: Partial<InsertUserTraining>): Promise<UserTraining | undefined> {
    const [updated] = await db.update(userTraining).set(training).where(eq(userTraining.id, id)).returning();
    return updated;
  }

  // Processes & Procedures
  async getProcesses(tenantId?: string): Promise<Process[]> {
    if (tenantId) {
      // Return tenant-specific processes AND global processes (NULL tenantId)
      return db.select().from(processes)
        .where(or(eq(processes.tenantId, tenantId), isNull(processes.tenantId)))
        .orderBy(desc(processes.createdAt));
    }
    return db.select().from(processes).orderBy(desc(processes.createdAt));
  }

  async getProcess(id: string): Promise<Process | undefined> {
    const [process] = await db.select().from(processes).where(eq(processes.id, id));
    return process;
  }

  async createProcess(process: InsertProcess): Promise<Process> {
    const [newProcess] = await db.insert(processes).values(process).returning();
    return newProcess;
  }

  async updateProcess(id: string, process: Partial<InsertProcess>): Promise<Process | undefined> {
    const [updated] = await db.update(processes).set({ ...process, updatedAt: new Date() }).where(eq(processes.id, id)).returning();
    return updated;
  }

  async deleteProcess(id: string): Promise<boolean> {
    const result = await db.delete(processes).where(eq(processes.id, id)).returning();
    return result.length > 0;
  }

  async getProcessTemplates(): Promise<ProcessTemplate[]> {
    return db.select().from(processTemplates).orderBy(processTemplates.name);
  }

  async getProcessTemplate(id: string): Promise<ProcessTemplate | undefined> {
    const [template] = await db.select().from(processTemplates).where(eq(processTemplates.id, id));
    return template;
  }

  async createProcessTemplate(template: InsertProcessTemplate): Promise<ProcessTemplate> {
    const [newTemplate] = await db.insert(processTemplates).values(template).returning();
    return newTemplate;
  }

  // Procedures
  async getProcedures(tenantId?: string): Promise<Procedure[]> {
    if (tenantId) {
      // Return tenant-specific procedures AND global procedures (NULL tenantId)
      return db.select().from(procedures)
        .where(or(eq(procedures.tenantId, tenantId), isNull(procedures.tenantId)))
        .orderBy(desc(procedures.createdAt));
    }
    return db.select().from(procedures).orderBy(desc(procedures.createdAt));
  }

  async getProcedure(id: string): Promise<Procedure | undefined> {
    const [procedure] = await db.select().from(procedures).where(eq(procedures.id, id));
    return procedure;
  }

  async createProcedure(procedure: InsertProcedure): Promise<Procedure> {
    const [newProcedure] = await db.insert(procedures).values(procedure).returning();
    return newProcedure;
  }

  async updateProcedure(id: string, procedure: Partial<InsertProcedure>): Promise<Procedure | undefined> {
    const [updated] = await db.update(procedures).set({ ...procedure, updatedAt: new Date() }).where(eq(procedures.id, id)).returning();
    return updated;
  }

  async deleteProcedure(id: string): Promise<boolean> {
    const result = await db.delete(procedures).where(eq(procedures.id, id)).returning();
    return result.length > 0;
  }

  async getProcedureTemplates(): Promise<ProcedureTemplate[]> {
    return db.select().from(procedureTemplates).orderBy(procedureTemplates.name);
  }

  async getProcedureTemplate(id: string): Promise<ProcedureTemplate | undefined> {
    const [template] = await db.select().from(procedureTemplates).where(eq(procedureTemplates.id, id));
    return template;
  }

  async createProcedureTemplate(template: InsertProcedureTemplate): Promise<ProcedureTemplate> {
    const [newTemplate] = await db.insert(procedureTemplates).values(template).returning();
    return newTemplate;
  }

  // Integration Settings
  async getIntegrationSettings(tenantId?: string): Promise<IntegrationSetting[]> {
    if (tenantId) {
      return db.select().from(integrationSettings).where(eq(integrationSettings.tenantId, tenantId)).orderBy(integrationSettings.integrationType);
    }
    return db.select().from(integrationSettings).orderBy(integrationSettings.integrationType);
  }

  async getIntegrationSetting(id: string): Promise<IntegrationSetting | undefined> {
    const [setting] = await db.select().from(integrationSettings).where(eq(integrationSettings.id, id));
    return setting;
  }

  async createIntegrationSetting(setting: InsertIntegrationSetting): Promise<IntegrationSetting> {
    const [newSetting] = await db.insert(integrationSettings).values(setting).returning();
    return newSetting;
  }

  async updateIntegrationSetting(id: string, setting: Partial<InsertIntegrationSetting>): Promise<IntegrationSetting | undefined> {
    const [updated] = await db.update(integrationSettings).set({ ...setting, updatedAt: new Date() }).where(eq(integrationSettings.id, id)).returning();
    return updated;
  }

  async deleteIntegrationSetting(id: string): Promise<boolean> {
    const result = await db.delete(integrationSettings).where(eq(integrationSettings.id, id)).returning();
    return result.length > 0;
  }

  // ========================================
  // PRIVACY MODULE IMPLEMENTATION
  // ========================================

  // ROPA (Record of Processing Activities)
  async getRopaEntries(tenantId?: string): Promise<RopaEntry[]> {
    if (tenantId) {
      return db.select().from(ropaEntries).where(eq(ropaEntries.tenantId, tenantId)).orderBy(desc(ropaEntries.createdAt));
    }
    return db.select().from(ropaEntries).orderBy(desc(ropaEntries.createdAt));
  }

  async getRopaEntry(id: string): Promise<RopaEntry | undefined> {
    const [entry] = await db.select().from(ropaEntries).where(eq(ropaEntries.id, id));
    return entry;
  }

  async createRopaEntry(entry: InsertRopaEntry): Promise<RopaEntry> {
    const [newEntry] = await db.insert(ropaEntries).values(entry).returning();
    return newEntry;
  }

  async updateRopaEntry(id: string, entry: Partial<InsertRopaEntry>): Promise<RopaEntry | undefined> {
    const [updated] = await db.update(ropaEntries).set({ ...entry, updatedAt: new Date() }).where(eq(ropaEntries.id, id)).returning();
    return updated;
  }

  async deleteRopaEntry(id: string): Promise<boolean> {
    const result = await db.delete(ropaEntries).where(eq(ropaEntries.id, id)).returning();
    return result.length > 0;
  }

  // Consent Records
  async getConsentRecords(tenantId?: string): Promise<ConsentRecord[]> {
    if (tenantId) {
      return db.select().from(consentRecords).where(eq(consentRecords.tenantId, tenantId)).orderBy(desc(consentRecords.createdAt));
    }
    return db.select().from(consentRecords).orderBy(desc(consentRecords.createdAt));
  }

  async getConsentRecord(id: string): Promise<ConsentRecord | undefined> {
    const [record] = await db.select().from(consentRecords).where(eq(consentRecords.id, id));
    return record;
  }

  async createConsentRecord(record: InsertConsentRecord): Promise<ConsentRecord> {
    const [newRecord] = await db.insert(consentRecords).values(record).returning();
    return newRecord;
  }

  async updateConsentRecord(id: string, record: Partial<InsertConsentRecord>): Promise<ConsentRecord | undefined> {
    const [updated] = await db.update(consentRecords).set({ ...record, updatedAt: new Date() }).where(eq(consentRecords.id, id)).returning();
    return updated;
  }

  async deleteConsentRecord(id: string): Promise<boolean> {
    const result = await db.delete(consentRecords).where(eq(consentRecords.id, id)).returning();
    return result.length > 0;
  }

  // Cookie Consents
  async getCookieConsents(tenantId?: string): Promise<CookieConsent[]> {
    if (tenantId) {
      return db.select().from(cookieConsents).where(eq(cookieConsents.tenantId, tenantId)).orderBy(desc(cookieConsents.createdAt));
    }
    return db.select().from(cookieConsents).orderBy(desc(cookieConsents.createdAt));
  }

  async getCookieConsent(id: string): Promise<CookieConsent | undefined> {
    const [consent] = await db.select().from(cookieConsents).where(eq(cookieConsents.id, id));
    return consent;
  }

  async createCookieConsent(consent: InsertCookieConsent): Promise<CookieConsent> {
    const [newConsent] = await db.insert(cookieConsents).values(consent).returning();
    return newConsent;
  }

  async updateCookieConsent(id: string, consent: Partial<InsertCookieConsent>): Promise<CookieConsent | undefined> {
    const [updated] = await db.update(cookieConsents).set({ ...consent, updatedAt: new Date() }).where(eq(cookieConsents.id, id)).returning();
    return updated;
  }

  // DSR Requests
  async getDsrRequests(tenantId?: string): Promise<DsrRequest[]> {
    if (tenantId) {
      return db.select().from(dsrRequests).where(eq(dsrRequests.tenantId, tenantId)).orderBy(desc(dsrRequests.createdAt));
    }
    return db.select().from(dsrRequests).orderBy(desc(dsrRequests.createdAt));
  }

  async getDsrRequest(id: string): Promise<DsrRequest | undefined> {
    const [request] = await db.select().from(dsrRequests).where(eq(dsrRequests.id, id));
    return request;
  }

  async createDsrRequest(request: InsertDsrRequest): Promise<DsrRequest> {
    const [newRequest] = await db.insert(dsrRequests).values(request).returning();
    return newRequest;
  }

  async updateDsrRequest(id: string, request: Partial<InsertDsrRequest>): Promise<DsrRequest | undefined> {
    const [updated] = await db.update(dsrRequests).set({ ...request, updatedAt: new Date() }).where(eq(dsrRequests.id, id)).returning();
    return updated;
  }

  async deleteDsrRequest(id: string): Promise<boolean> {
    const result = await db.delete(dsrRequests).where(eq(dsrRequests.id, id)).returning();
    return result.length > 0;
  }

  // Breach Incidents
  async getBreachIncidents(tenantId?: string): Promise<BreachIncident[]> {
    if (tenantId) {
      return db.select().from(breachIncidents).where(eq(breachIncidents.tenantId, tenantId)).orderBy(desc(breachIncidents.createdAt));
    }
    return db.select().from(breachIncidents).orderBy(desc(breachIncidents.createdAt));
  }

  async getBreachIncident(id: string): Promise<BreachIncident | undefined> {
    const [incident] = await db.select().from(breachIncidents).where(eq(breachIncidents.id, id));
    return incident;
  }

  async createBreachIncident(incident: InsertBreachIncident): Promise<BreachIncident> {
    const [newIncident] = await db.insert(breachIncidents).values(incident).returning();
    return newIncident;
  }

  async updateBreachIncident(id: string, incident: Partial<InsertBreachIncident>): Promise<BreachIncident | undefined> {
    const [updated] = await db.update(breachIncidents).set({ ...incident, updatedAt: new Date() }).where(eq(breachIncidents.id, id)).returning();
    return updated;
  }

  async deleteBreachIncident(id: string): Promise<boolean> {
    const result = await db.delete(breachIncidents).where(eq(breachIncidents.id, id)).returning();
    return result.length > 0;
  }

  // DPIAs
  async getDpias(tenantId?: string): Promise<Dpia[]> {
    if (tenantId) {
      return db.select().from(dpias).where(eq(dpias.tenantId, tenantId)).orderBy(desc(dpias.createdAt));
    }
    return db.select().from(dpias).orderBy(desc(dpias.createdAt));
  }

  async getDpia(id: string): Promise<Dpia | undefined> {
    const [dpia] = await db.select().from(dpias).where(eq(dpias.id, id));
    return dpia;
  }

  async createDpia(dpia: InsertDpia): Promise<Dpia> {
    const [newDpia] = await db.insert(dpias).values(dpia).returning();
    return newDpia;
  }

  async updateDpia(id: string, dpia: Partial<InsertDpia>): Promise<Dpia | undefined> {
    const [updated] = await db.update(dpias).set({ ...dpia, updatedAt: new Date() }).where(eq(dpias.id, id)).returning();
    return updated;
  }

  async deleteDpia(id: string): Promise<boolean> {
    const result = await db.delete(dpias).where(eq(dpias.id, id)).returning();
    return result.length > 0;
  }

  // Data Mappings
  async getDataMappings(tenantId?: string): Promise<DataMapping[]> {
    if (tenantId) {
      return db.select().from(dataMappings).where(eq(dataMappings.tenantId, tenantId)).orderBy(desc(dataMappings.createdAt));
    }
    return db.select().from(dataMappings).orderBy(desc(dataMappings.createdAt));
  }

  async getDataMapping(id: string): Promise<DataMapping | undefined> {
    const [mapping] = await db.select().from(dataMappings).where(eq(dataMappings.id, id));
    return mapping;
  }

  async createDataMapping(mapping: InsertDataMapping): Promise<DataMapping> {
    const [newMapping] = await db.insert(dataMappings).values(mapping).returning();
    return newMapping;
  }

  async updateDataMapping(id: string, mapping: Partial<InsertDataMapping>): Promise<DataMapping | undefined> {
    const [updated] = await db.update(dataMappings).set({ ...mapping, updatedAt: new Date() }).where(eq(dataMappings.id, id)).returning();
    return updated;
  }

  async deleteDataMapping(id: string): Promise<boolean> {
    const result = await db.delete(dataMappings).where(eq(dataMappings.id, id)).returning();
    return result.length > 0;
  }

  // Retention Policies
  async getRetentionPolicies(tenantId?: string): Promise<RetentionPolicy[]> {
    if (tenantId) {
      return db.select().from(retentionPolicies).where(eq(retentionPolicies.tenantId, tenantId)).orderBy(desc(retentionPolicies.createdAt));
    }
    return db.select().from(retentionPolicies).orderBy(desc(retentionPolicies.createdAt));
  }

  async getRetentionPolicy(id: string): Promise<RetentionPolicy | undefined> {
    const [policy] = await db.select().from(retentionPolicies).where(eq(retentionPolicies.id, id));
    return policy;
  }

  async createRetentionPolicy(policy: InsertRetentionPolicy): Promise<RetentionPolicy> {
    const [newPolicy] = await db.insert(retentionPolicies).values(policy).returning();
    return newPolicy;
  }

  async updateRetentionPolicy(id: string, policy: Partial<InsertRetentionPolicy>): Promise<RetentionPolicy | undefined> {
    const [updated] = await db.update(retentionPolicies).set({ ...policy, updatedAt: new Date() }).where(eq(retentionPolicies.id, id)).returning();
    return updated;
  }

  async deleteRetentionPolicy(id: string): Promise<boolean> {
    const result = await db.delete(retentionPolicies).where(eq(retentionPolicies.id, id)).returning();
    return result.length > 0;
  }

  // Data Discovery Results
  async getDataDiscoveryResults(tenantId?: string): Promise<DataDiscoveryResult[]> {
    if (tenantId) {
      return db.select().from(dataDiscoveryResults).where(eq(dataDiscoveryResults.tenantId, tenantId)).orderBy(desc(dataDiscoveryResults.createdAt));
    }
    return db.select().from(dataDiscoveryResults).orderBy(desc(dataDiscoveryResults.createdAt));
  }

  async getDataDiscoveryResult(id: string): Promise<DataDiscoveryResult | undefined> {
    const [result] = await db.select().from(dataDiscoveryResults).where(eq(dataDiscoveryResults.id, id));
    return result;
  }

  async createDataDiscoveryResult(result: InsertDataDiscoveryResult): Promise<DataDiscoveryResult> {
    const [newResult] = await db.insert(dataDiscoveryResults).values(result).returning();
    return newResult;
  }

  // Purpose & Legal Basis
  async getPurposeLegalBasisEntries(tenantId?: string): Promise<PurposeLegalBasis[]> {
    if (tenantId) {
      return db.select().from(purposeLegalBasis).where(eq(purposeLegalBasis.tenantId, tenantId)).orderBy(desc(purposeLegalBasis.createdAt));
    }
    return db.select().from(purposeLegalBasis).orderBy(desc(purposeLegalBasis.createdAt));
  }

  async createPurposeLegalBasis(data: InsertPurposeLegalBasis): Promise<PurposeLegalBasis> {
    const [result] = await db.insert(purposeLegalBasis).values(data).returning();
    return result;
  }

  async updatePurposeLegalBasis(id: string, data: Partial<InsertPurposeLegalBasis>): Promise<PurposeLegalBasis | undefined> {
    const [result] = await db.update(purposeLegalBasis).set({ ...data, updatedAt: new Date() }).where(eq(purposeLegalBasis.id, id)).returning();
    return result;
  }

  // Cross-Border Transfers
  async getCrossBorderTransfers(tenantId?: string): Promise<CrossBorderTransfer[]> {
    if (tenantId) {
      return db.select().from(crossBorderTransfers).where(eq(crossBorderTransfers.tenantId, tenantId)).orderBy(desc(crossBorderTransfers.createdAt));
    }
    return db.select().from(crossBorderTransfers).orderBy(desc(crossBorderTransfers.createdAt));
  }

  async createCrossBorderTransfer(data: InsertCrossBorderTransfer): Promise<CrossBorderTransfer> {
    const [result] = await db.insert(crossBorderTransfers).values(data).returning();
    return result;
  }

  async updateCrossBorderTransfer(id: string, data: Partial<InsertCrossBorderTransfer>): Promise<CrossBorderTransfer | undefined> {
    const [result] = await db.update(crossBorderTransfers).set({ ...data, updatedAt: new Date() }).where(eq(crossBorderTransfers.id, id)).returning();
    return result;
  }

  // AI Privacy Records
  async getAiPrivacyRecords(tenantId?: string): Promise<AiPrivacyRecord[]> {
    if (tenantId) {
      return db.select().from(aiPrivacyRecords).where(eq(aiPrivacyRecords.tenantId, tenantId)).orderBy(desc(aiPrivacyRecords.createdAt));
    }
    return db.select().from(aiPrivacyRecords).orderBy(desc(aiPrivacyRecords.createdAt));
  }

  async createAiPrivacyRecord(data: InsertAiPrivacyRecord): Promise<AiPrivacyRecord> {
    const [result] = await db.insert(aiPrivacyRecords).values(data).returning();
    return result;
  }

  async updateAiPrivacyRecord(id: string, data: Partial<InsertAiPrivacyRecord>): Promise<AiPrivacyRecord | undefined> {
    const [result] = await db.update(aiPrivacyRecords).set({ ...data, updatedAt: new Date() }).where(eq(aiPrivacyRecords.id, id)).returning();
    return result;
  }

  // Privacy Signals
  async getPrivacySignals(tenantId?: string): Promise<PrivacySignal[]> {
    if (tenantId) {
      return db.select().from(privacySignals).where(eq(privacySignals.tenantId, tenantId)).orderBy(desc(privacySignals.createdAt));
    }
    return db.select().from(privacySignals).orderBy(desc(privacySignals.createdAt));
  }

  async createPrivacySignal(data: InsertPrivacySignal): Promise<PrivacySignal> {
    const [result] = await db.insert(privacySignals).values(data).returning();
    return result;
  }

  async updatePrivacySignal(id: string, data: Partial<InsertPrivacySignal>): Promise<PrivacySignal | undefined> {
    const [result] = await db.update(privacySignals).set(data).where(eq(privacySignals.id, id)).returning();
    return result;
  }

  // Report Templates
  async getReportTemplates(): Promise<ReportTemplate[]> {
    return db.select().from(reportTemplates).orderBy(reportTemplates.category, reportTemplates.name);
  }

  async getReportTemplate(id: string): Promise<ReportTemplate | undefined> {
    const [template] = await db.select().from(reportTemplates).where(eq(reportTemplates.id, id));
    return template;
  }

  async createReportTemplate(template: InsertReportTemplate): Promise<ReportTemplate> {
    const [newTemplate] = await db.insert(reportTemplates).values(template).returning();
    return newTemplate;
  }

  // Generated Reports
  async getGeneratedReports(tenantId?: string): Promise<GeneratedReport[]> {
    if (tenantId) {
      return db.select().from(generatedReports).where(eq(generatedReports.tenantId, tenantId)).orderBy(desc(generatedReports.createdAt));
    }
    return db.select().from(generatedReports).orderBy(desc(generatedReports.createdAt));
  }

  async getGeneratedReport(id: string): Promise<GeneratedReport | undefined> {
    const [report] = await db.select().from(generatedReports).where(eq(generatedReports.id, id));
    return report;
  }

  async createGeneratedReport(report: InsertGeneratedReport): Promise<GeneratedReport> {
    const [newReport] = await db.insert(generatedReports).values(report).returning();
    return newReport;
  }

  async updateGeneratedReport(id: string, updates: Partial<InsertGeneratedReport>): Promise<GeneratedReport | undefined> {
    const [updated] = await db.update(generatedReports)
      .set(updates)
      .where(eq(generatedReports.id, id))
      .returning();
    return updated;
  }

  // Activity Logs - tenant-specific activity tracking
  async getActivityLogs(tenantId?: string, limit: number = 10): Promise<ActivityLog[]> {
    if (tenantId) {
      return db.select().from(activityLogs)
        .where(eq(activityLogs.tenantId, tenantId))
        .orderBy(desc(activityLogs.createdAt))
        .limit(limit);
    }
    return db.select().from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db.insert(activityLogs).values(log).returning();
    return newLog;
  }

  // Tenant Frameworks - get frameworks assigned to a specific tenant with compliance data
  async getTenantFrameworks(tenantId: string): Promise<any[]> {
    const result = await db.select({
      id: tenantFrameworks.id,
      tenantId: tenantFrameworks.tenantId,
      frameworkId: tenantFrameworks.frameworkId,
      status: tenantFrameworks.status,
      complianceScore: tenantFrameworks.complianceScore,
      applicabilityType: tenantFrameworks.applicabilityType,
      assignedAt: tenantFrameworks.assignedAt,
      frameworkName: frameworks.name,
      frameworkShortName: frameworks.shortName,
      frameworkDescription: frameworks.description,
      frameworkCategory: frameworks.category,
      frameworkRegion: frameworks.region,
      controlCount: frameworks.controlCount,
    })
    .from(tenantFrameworks)
    .leftJoin(frameworks, eq(tenantFrameworks.frameworkId, frameworks.id))
    .where(eq(tenantFrameworks.tenantId, tenantId))
    .orderBy(tenantFrameworks.applicabilityType, frameworks.name);
    
    return result;
  }

  async addTenantFramework(data: { tenantId: string; frameworkId: string; applicabilityType: string; status: string }): Promise<any> {
    const [result] = await db.insert(tenantFrameworks).values({
      tenantId: data.tenantId,
      frameworkId: data.frameworkId,
      applicabilityType: data.applicabilityType,
      status: data.status as any,
      assignedAt: new Date(),
    }).returning();
    return result;
  }

  async removeTenantFramework(id: string): Promise<boolean> {
    const result = await db.delete(tenantFrameworks).where(eq(tenantFrameworks.id, id));
    return true;
  }

  // Upcoming Deadlines - get real deadlines from audits and policies
  async getUpcomingDeadlines(tenantId?: string): Promise<any[]> {
    const now = new Date();
    const deadlines: any[] = [];

    // Get upcoming audits
    const upcomingAudits = tenantId 
      ? await db.select().from(audits).where(eq(audits.tenantId, tenantId)).orderBy(audits.scheduledDate)
      : await db.select().from(audits).orderBy(audits.scheduledDate);
    
    for (const audit of upcomingAudits) {
      if (audit.scheduledDate && new Date(audit.scheduledDate) > now) {
        const daysLeft = Math.ceil((new Date(audit.scheduledDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        deadlines.push({
          id: audit.id,
          title: audit.title,
          type: 'audit',
          date: audit.scheduledDate,
          daysLeft,
          priority: daysLeft <= 14 ? 'critical' : daysLeft <= 30 ? 'high' : 'medium',
        });
      }
    }

    // Get policy review dates
    const policiesWithReview = tenantId
      ? await db.select().from(policies).where(eq(policies.tenantId, tenantId)).orderBy(policies.reviewDate)
      : await db.select().from(policies).orderBy(policies.reviewDate);
    
    for (const policy of policiesWithReview) {
      if (policy.reviewDate && new Date(policy.reviewDate) > now) {
        const daysLeft = Math.ceil((new Date(policy.reviewDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        deadlines.push({
          id: policy.id,
          title: `${policy.title} Review`,
          type: 'policy',
          date: policy.reviewDate,
          daysLeft,
          priority: daysLeft <= 14 ? 'critical' : daysLeft <= 30 ? 'high' : 'medium',
        });
      }
    }

    // Sort by days left and return top 10
    deadlines.sort((a, b) => a.daysLeft - b.daysLeft);
    return deadlines.slice(0, 10);
  }

  // ====================================
  // ENTERPRISE FEATURES STORAGE METHODS
  // ====================================

  // Trust Center
  async getTrustCenterSettings(tenantId: string): Promise<any> {
    if (!tenantId) return null;
    const [settings] = await db.select().from(trustCenterSettings).where(eq(trustCenterSettings.tenantId, tenantId));
    return settings;
  }

  async getTrustCenterCertifications(tenantId: string): Promise<any[]> {
    if (!tenantId) return [];
    return await db.select().from(trustCenterCertifications).where(eq(trustCenterCertifications.tenantId, tenantId));
  }

  async getTrustCenterDocuments(tenantId: string): Promise<any[]> {
    if (!tenantId) return [];
    return await db.select().from(trustCenterDocuments).where(eq(trustCenterDocuments.tenantId, tenantId));
  }

  // Control Monitoring
  async getControlMonitors(tenantId: string): Promise<any[]> {
    if (!tenantId) return [];
    return await db.select().from(controlMonitors).where(eq(controlMonitors.tenantId, tenantId));
  }

  async getControlAlerts(tenantId: string): Promise<any[]> {
    if (!tenantId) return [];
    return await db.select().from(controlAlerts).where(eq(controlAlerts.tenantId, tenantId)).orderBy(desc(controlAlerts.createdAt));
  }

  // Evidence Management
  async getEvidenceItems(tenantId: string): Promise<any[]> {
    if (!tenantId) return [];
    return await db.select().from(evidenceItems).where(eq(evidenceItems.tenantId, tenantId)).orderBy(desc(evidenceItems.createdAt));
  }

  async getEvidenceItemById(id: string): Promise<any> {
    const result = await db.select().from(evidenceItems).where(eq(evidenceItems.id, id)).limit(1);
    return result[0];
  }

  async getEvidenceItemsByAudit(auditId: string): Promise<any[]> {
    if (!auditId) return [];
    return await db.select().from(evidenceItems).where(eq(evidenceItems.auditId, auditId)).orderBy(desc(evidenceItems.createdAt));
  }

  async createEvidenceItem(data: any): Promise<any> {
    const result = await db.insert(evidenceItems).values({
      ...data,
      submittedAt: new Date(),
    }).returning();
    return result[0];
  }

  async updateEvidenceItem(id: string, data: any): Promise<any> {
    const result = await db.update(evidenceItems).set(data).where(eq(evidenceItems.id, id)).returning();
    return result[0];
  }

  async updateEvidenceReviewStatus(id: string, reviewStatus: string, reviewedBy: string, reviewComment?: string): Promise<any> {
    const result = await db.update(evidenceItems).set({
      reviewStatus,
      reviewedBy,
      reviewedAt: new Date(),
      reviewComment: reviewComment || null,
    }).where(eq(evidenceItems.id, id)).returning();
    return result[0];
  }

  async deleteEvidenceItem(id: string): Promise<void> {
    await db.delete(evidenceItems).where(eq(evidenceItems.id, id));
  }

  async getEvidenceRequests(tenantId: string): Promise<any[]> {
    if (!tenantId) return [];
    return await db.select().from(evidenceRequests).where(eq(evidenceRequests.tenantId, tenantId)).orderBy(desc(evidenceRequests.createdAt));
  }

  async getEvidenceRequestsByEvidence(evidenceItemId: string): Promise<any[]> {
    if (!evidenceItemId) return [];
    return await db.select().from(evidenceRequests).where(eq(evidenceRequests.evidenceItemId, evidenceItemId)).orderBy(desc(evidenceRequests.createdAt));
  }

  async createEvidenceRequest(data: any): Promise<any> {
    const result = await db.insert(evidenceRequests).values(data).returning();
    return result[0];
  }

  async updateEvidenceRequest(id: string, data: any): Promise<any> {
    const result = await db.update(evidenceRequests).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(evidenceRequests.id, id)).returning();
    return result[0];
  }

  // Regulatory Intelligence
  async getRegulatoryUpdates(): Promise<any[]> {
    return await db.select().from(regulatoryUpdates).orderBy(desc(regulatoryUpdates.createdAt));
  }

  async getTenantRegulatoryTracking(tenantId: string): Promise<any[]> {
    if (!tenantId) return [];
    return await db.select().from(tenantRegulatoryTracking).where(eq(tenantRegulatoryTracking.tenantId, tenantId));
  }

  // ESG Module
  async getEsgCategories(): Promise<any[]> {
    return await db.select().from(esgCategories);
  }

  async getEsgMetrics(tenantId: string): Promise<any[]> {
    if (!tenantId) return [];
    return await db.select().from(esgMetrics).where(eq(esgMetrics.tenantId, tenantId));
  }

  async getEsgInitiatives(tenantId: string): Promise<any[]> {
    if (!tenantId) return [];
    return await db.select().from(esgInitiatives).where(eq(esgInitiatives.tenantId, tenantId));
  }

  // Business Continuity
  async getBcpPlans(tenantId: string): Promise<any[]> {
    if (!tenantId) return [];
    return await db.select().from(bcpPlans).where(eq(bcpPlans.tenantId, tenantId));
  }

  async getBusinessImpactAnalysis(tenantId: string): Promise<any[]> {
    if (!tenantId) return [];
    return await db.select().from(businessImpactAnalysis).where(eq(businessImpactAnalysis.tenantId, tenantId));
  }

  async getBcpTests(tenantId: string): Promise<any[]> {
    if (!tenantId) return [];
    return await db.select().from(bcpTests).where(eq(bcpTests.tenantId, tenantId)).orderBy(desc(bcpTests.createdAt));
  }

  async createBcpPlan(plan: any): Promise<any> {
    const result = await db.insert(bcpPlans).values(plan).returning();
    return result[0];
  }

  async updateBcpPlan(id: string, plan: any): Promise<any> {
    const result = await db.update(bcpPlans).set({ ...plan, updatedAt: new Date() }).where(eq(bcpPlans.id, id)).returning();
    return result[0];
  }

  async getBcpPlan(id: string): Promise<any> {
    const result = await db.select().from(bcpPlans).where(eq(bcpPlans.id, id));
    return result[0];
  }

  async createBcpTest(test: any): Promise<any> {
    const result = await db.insert(bcpTests).values(test).returning();
    return result[0];
  }

  async updateBcpTest(id: string, test: any): Promise<any> {
    const result = await db.update(bcpTests).set({ ...test, updatedAt: new Date() }).where(eq(bcpTests.id, id)).returning();
    return result[0];
  }

  async getBcpTest(id: string): Promise<any> {
    const result = await db.select().from(bcpTests).where(eq(bcpTests.id, id));
    return result[0];
  }

  async getBcpPlanCatalogItem(id: string): Promise<any> {
    const result = await db.select().from(bcpPlanCatalog).where(eq(bcpPlanCatalog.id, id));
    return result[0];
  }

  async getBcpTestTemplate(id: string): Promise<any> {
    const result = await db.select().from(bcpTestTemplates).where(eq(bcpTestTemplates.id, id));
    return result[0];
  }

  // Integration Hub
  async getIntegrationConnectors(): Promise<any[]> {
    return await db.select().from(integrationConnectors);
  }

  async getTenantConnections(tenantId: string): Promise<any[]> {
    if (!tenantId) return [];
    return await db.select().from(tenantConnections).where(eq(tenantConnections.tenantId, tenantId));
  }

  // ============ RISK CATALOG ============
  
  async getRiskCatalog(filters?: {
    category?: string;
    subcategory?: string;
    search?: string;
    tenantId?: string;
    aiEnriched?: boolean;
  }): Promise<RiskCatalogItem[]> {
    let query = db.select().from(riskCatalog);
    const conditions: any[] = [];

    // Global risks OR tenant-specific
    if (filters?.tenantId) {
      conditions.push(or(
        eq(riskCatalog.isGlobal, true),
        eq(riskCatalog.tenantId, filters.tenantId)
      ));
    } else {
      conditions.push(eq(riskCatalog.isGlobal, true));
    }

    if (filters?.category) {
      conditions.push(eq(riskCatalog.category, filters.category));
    }
    if (filters?.subcategory) {
      conditions.push(eq(riskCatalog.subcategory, filters.subcategory));
    }
    if (filters?.aiEnriched !== undefined) {
      conditions.push(eq(riskCatalog.aiEnriched, filters.aiEnriched));
    }
    if (filters?.search) {
      conditions.push(or(
        like(riskCatalog.name, `%${filters.search}%`),
        like(riskCatalog.description, `%${filters.search}%`),
        like(riskCatalog.code, `%${filters.search}%`)
      ));
    }

    if (conditions.length > 0) {
      return await db.select().from(riskCatalog).where(and(...conditions)).orderBy(riskCatalog.category, riskCatalog.code);
    }
    return await db.select().from(riskCatalog).orderBy(riskCatalog.category, riskCatalog.code);
  }

  async getRiskCatalogItem(id: string): Promise<RiskCatalogItem | undefined> {
    const result = await db.select().from(riskCatalog).where(eq(riskCatalog.id, id));
    return result[0];
  }

  async createRiskCatalogItem(item: InsertRiskCatalogItem): Promise<RiskCatalogItem> {
    const result = await db.insert(riskCatalog).values(item).returning();
    return result[0];
  }

  async updateRiskCatalogItem(id: string, item: Partial<InsertRiskCatalogItem>): Promise<RiskCatalogItem | undefined> {
    const result = await db.update(riskCatalog).set({ ...item, updatedAt: new Date() }).where(eq(riskCatalog.id, id)).returning();
    return result[0];
  }

  async deleteRiskCatalogItem(id: string): Promise<boolean> {
    await db.delete(riskCatalog).where(eq(riskCatalog.id, id));
    return true;
  }

  async getRiskCatalogCategories(): Promise<{ category: string; subcategories: string[] }[]> {
    const items = await db.select({ category: riskCatalog.category, subcategory: riskCatalog.subcategory }).from(riskCatalog).where(eq(riskCatalog.isGlobal, true));
    const categoryMap = new Map<string, Set<string>>();
    for (const item of items) {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, new Set());
      }
      if (item.subcategory) {
        categoryMap.get(item.category)!.add(item.subcategory);
      }
    }
    return Array.from(categoryMap.entries()).map(([category, subcategories]) => ({
      category,
      subcategories: Array.from(subcategories).sort(),
    })).sort((a, b) => a.category.localeCompare(b.category));
  }

  // ============ RISK REGISTER TEMPLATES ============

  async getRiskRegisterTemplates(filters?: {
    tenantId?: string;
    category?: string;
    standard?: string;
    isGlobal?: boolean;
  }): Promise<RiskRegisterTemplate[]> {
    const conditions: any[] = [];

    if (filters?.tenantId) {
      conditions.push(or(
        eq(riskRegisterTemplates.isGlobal, true),
        eq(riskRegisterTemplates.tenantId, filters.tenantId)
      ));
    }
    if (filters?.category) {
      conditions.push(eq(riskRegisterTemplates.category, filters.category));
    }
    if (filters?.standard) {
      conditions.push(eq(riskRegisterTemplates.standard, filters.standard));
    }
    if (filters?.isGlobal !== undefined) {
      conditions.push(eq(riskRegisterTemplates.isGlobal, filters.isGlobal));
    }
    conditions.push(eq(riskRegisterTemplates.isActive, true));

    if (conditions.length > 0) {
      return await db.select().from(riskRegisterTemplates).where(and(...conditions)).orderBy(riskRegisterTemplates.name);
    }
    return await db.select().from(riskRegisterTemplates).where(eq(riskRegisterTemplates.isActive, true)).orderBy(riskRegisterTemplates.name);
  }

  async getRiskRegisterTemplate(id: string): Promise<RiskRegisterTemplate | undefined> {
    const result = await db.select().from(riskRegisterTemplates).where(eq(riskRegisterTemplates.id, id));
    return result[0];
  }

  async createRiskRegisterTemplate(template: InsertRiskRegisterTemplate): Promise<RiskRegisterTemplate> {
    const result = await db.insert(riskRegisterTemplates).values(template).returning();
    return result[0];
  }

  async updateRiskRegisterTemplate(id: string, template: Partial<InsertRiskRegisterTemplate>): Promise<RiskRegisterTemplate | undefined> {
    const result = await db.update(riskRegisterTemplates).set({ ...template, updatedAt: new Date() }).where(eq(riskRegisterTemplates.id, id)).returning();
    return result[0];
  }

  async deleteRiskRegisterTemplate(id: string): Promise<boolean> {
    await db.update(riskRegisterTemplates).set({ isActive: false }).where(eq(riskRegisterTemplates.id, id));
    return true;
  }

  // ============ TENANT RISK REGISTERS ============

  async getTenantRiskRegisters(tenantId: string): Promise<TenantRiskRegister[]> {
    if (!tenantId) return [];
    return await db.select().from(tenantRiskRegisters).where(eq(tenantRiskRegisters.tenantId, tenantId)).orderBy(desc(tenantRiskRegisters.createdAt));
  }

  async getTenantRiskRegister(id: string): Promise<TenantRiskRegister | undefined> {
    const result = await db.select().from(tenantRiskRegisters).where(eq(tenantRiskRegisters.id, id));
    return result[0];
  }

  async createTenantRiskRegister(register: InsertTenantRiskRegister): Promise<TenantRiskRegister> {
    const result = await db.insert(tenantRiskRegisters).values(register).returning();
    return result[0];
  }

  async updateTenantRiskRegister(id: string, register: Partial<InsertTenantRiskRegister>): Promise<TenantRiskRegister | undefined> {
    const result = await db.update(tenantRiskRegisters).set({ ...register, updatedAt: new Date() }).where(eq(tenantRiskRegisters.id, id)).returning();
    return result[0];
  }

  async deleteTenantRiskRegister(id: string): Promise<boolean> {
    // Delete entries first
    await db.delete(riskRegisterEntries).where(eq(riskRegisterEntries.registerId, id));
    // Then delete register
    await db.delete(tenantRiskRegisters).where(eq(tenantRiskRegisters.id, id));
    return true;
  }

  // ============ RISK REGISTER ENTRIES ============

  async getRiskRegisterEntries(registerId: string): Promise<RiskRegisterEntry[]> {
    if (!registerId) return [];
    return await db.select().from(riskRegisterEntries).where(eq(riskRegisterEntries.registerId, registerId)).orderBy(desc(riskRegisterEntries.createdAt));
  }

  async getRiskRegisterEntry(id: string): Promise<RiskRegisterEntry | undefined> {
    const result = await db.select().from(riskRegisterEntries).where(eq(riskRegisterEntries.id, id));
    return result[0];
  }

  async createRiskRegisterEntry(entry: InsertRiskRegisterEntry): Promise<RiskRegisterEntry> {
    // Calculate scores
    const inherentScore = (entry.inherentLikelihood || 3) * (entry.inherentImpact || 3);
    const residualScore = (entry.residualLikelihood || 2) * (entry.residualImpact || 2);
    const ciaScore = Math.max(entry.confidentiality || 3, entry.integrity || 3, entry.availability || 3);
    
    const result = await db.insert(riskRegisterEntries).values({
      ...entry,
      inherentRiskScore: inherentScore,
      residualRiskScore: residualScore,
      ciaScore,
    }).returning();
    return result[0];
  }

  async updateRiskRegisterEntry(id: string, entry: Partial<InsertRiskRegisterEntry>): Promise<RiskRegisterEntry | undefined> {
    // Recalculate scores if likelihood/impact changed
    const updates: any = { ...entry, updatedAt: new Date() };
    
    if (entry.inherentLikelihood !== undefined || entry.inherentImpact !== undefined) {
      const current = await this.getRiskRegisterEntry(id);
      if (current) {
        const likelihood = entry.inherentLikelihood ?? current.inherentLikelihood ?? 3;
        const impact = entry.inherentImpact ?? current.inherentImpact ?? 3;
        updates.inherentRiskScore = likelihood * impact;
      }
    }
    
    if (entry.residualLikelihood !== undefined || entry.residualImpact !== undefined) {
      const current = await this.getRiskRegisterEntry(id);
      if (current) {
        const likelihood = entry.residualLikelihood ?? current.residualLikelihood ?? 2;
        const impact = entry.residualImpact ?? current.residualImpact ?? 2;
        updates.residualRiskScore = likelihood * impact;
      }
    }

    if (entry.confidentiality !== undefined || entry.integrity !== undefined || entry.availability !== undefined) {
      const current = await this.getRiskRegisterEntry(id);
      if (current) {
        const c = entry.confidentiality ?? current.confidentiality ?? 3;
        const i = entry.integrity ?? current.integrity ?? 3;
        const a = entry.availability ?? current.availability ?? 3;
        updates.ciaScore = Math.max(c, i, a);
      }
    }

    const result = await db.update(riskRegisterEntries).set(updates).where(eq(riskRegisterEntries.id, id)).returning();
    return result[0];
  }

  async deleteRiskRegisterEntry(id: string): Promise<boolean> {
    await db.delete(riskRegisterEntries).where(eq(riskRegisterEntries.id, id));
    return true;
  }

  // ============ ADVANCED RISK MODULE STORAGE ============

  // Risk Scenarios
  async getRiskScenarios(tenantId?: string): Promise<RiskScenario[]> {
    if (tenantId) {
      return db.select().from(riskScenarios).where(eq(riskScenarios.tenantId, tenantId)).orderBy(desc(riskScenarios.createdAt));
    }
    return db.select().from(riskScenarios).orderBy(desc(riskScenarios.createdAt));
  }

  async getRiskScenario(id: string): Promise<RiskScenario | undefined> {
    const result = await db.select().from(riskScenarios).where(eq(riskScenarios.id, id));
    return result[0];
  }

  async createRiskScenario(scenario: InsertRiskScenario): Promise<RiskScenario> {
    const result = await db.insert(riskScenarios).values(scenario).returning();
    return result[0];
  }

  async updateRiskScenario(id: string, scenario: Partial<InsertRiskScenario>): Promise<RiskScenario | undefined> {
    const result = await db.update(riskScenarios)
      .set({ ...scenario, updatedAt: new Date() })
      .where(eq(riskScenarios.id, id))
      .returning();
    return result[0];
  }

  async deleteRiskScenario(id: string): Promise<boolean> {
    await db.delete(riskScenarios).where(eq(riskScenarios.id, id));
    return true;
  }

  // Risk Appetite
  async getRiskAppetites(tenantId?: string): Promise<RiskAppetiteRecord[]> {
    if (tenantId) {
      return db.select().from(riskAppetite).where(eq(riskAppetite.tenantId, tenantId)).orderBy(desc(riskAppetite.createdAt));
    }
    return db.select().from(riskAppetite).orderBy(desc(riskAppetite.createdAt));
  }

  async getRiskAppetite(id: string): Promise<RiskAppetiteRecord | undefined> {
    const result = await db.select().from(riskAppetite).where(eq(riskAppetite.id, id));
    return result[0];
  }

  async createRiskAppetite(appetite: InsertRiskAppetite): Promise<RiskAppetiteRecord> {
    const result = await db.insert(riskAppetite).values(appetite).returning();
    return result[0];
  }

  async updateRiskAppetite(id: string, appetite: Partial<InsertRiskAppetite>): Promise<RiskAppetiteRecord | undefined> {
    const result = await db.update(riskAppetite)
      .set({ ...appetite, updatedAt: new Date() })
      .where(eq(riskAppetite.id, id))
      .returning();
    return result[0];
  }

  async deleteRiskAppetite(id: string): Promise<boolean> {
    await db.delete(riskAppetite).where(eq(riskAppetite.id, id));
    return true;
  }

  // Risk Appetite Breaches
  async getRiskAppetiteBreaches(tenantId?: string): Promise<RiskAppetiteBreach[]> {
    if (tenantId) {
      return db.select().from(riskAppetiteBreaches).where(eq(riskAppetiteBreaches.tenantId, tenantId)).orderBy(desc(riskAppetiteBreaches.detectedAt));
    }
    return db.select().from(riskAppetiteBreaches).orderBy(desc(riskAppetiteBreaches.detectedAt));
  }

  async createRiskAppetiteBreach(breach: InsertRiskAppetiteBreach): Promise<RiskAppetiteBreach> {
    const result = await db.insert(riskAppetiteBreaches).values(breach).returning();
    return result[0];
  }

  async updateRiskAppetiteBreach(id: string, breach: Partial<InsertRiskAppetiteBreach>): Promise<RiskAppetiteBreach | undefined> {
    const result = await db.update(riskAppetiteBreaches)
      .set(breach)
      .where(eq(riskAppetiteBreaches.id, id))
      .returning();
    return result[0];
  }

  // Risk Aggregation
  async getRiskAggregations(tenantId?: string, aggregationType?: string): Promise<RiskAggregationRecord[]> {
    let query = db.select().from(riskAggregation);
    if (tenantId && aggregationType) {
      return query.where(and(eq(riskAggregation.tenantId, tenantId), eq(riskAggregation.aggregationType, aggregationType))).orderBy(desc(riskAggregation.aggregatedRiskScore));
    } else if (tenantId) {
      return query.where(eq(riskAggregation.tenantId, tenantId)).orderBy(desc(riskAggregation.aggregatedRiskScore));
    } else if (aggregationType) {
      return query.where(eq(riskAggregation.aggregationType, aggregationType)).orderBy(desc(riskAggregation.aggregatedRiskScore));
    }
    return query.orderBy(desc(riskAggregation.aggregatedRiskScore));
  }

  async calculateRiskAggregation(tenantId: string): Promise<{ success: boolean; aggregations: RiskAggregationRecord[] }> {
    const risksData = await this.getRisks(tenantId);
    const aggregations: Record<string, any> = {};
    
    for (const risk of risksData) {
      const category = risk.category || "Uncategorized";
      if (!aggregations[category]) {
        aggregations[category] = {
          tenantId,
          aggregationType: "category",
          aggregationKey: category,
          totalRisks: 0,
          criticalRisks: 0,
          highRisks: 0,
          mediumRisks: 0,
          lowRisks: 0,
          aggregatedRiskScore: 0,
        };
      }
      aggregations[category].totalRisks++;
      if (risk.riskLevel === "critical") aggregations[category].criticalRisks++;
      else if (risk.riskLevel === "high") aggregations[category].highRisks++;
      else if (risk.riskLevel === "medium") aggregations[category].mediumRisks++;
      else aggregations[category].lowRisks++;
      aggregations[category].aggregatedRiskScore += risk.riskScore || 0;
    }
    
    const results: RiskAggregationRecord[] = [];
    for (const key of Object.keys(aggregations)) {
      const agg = aggregations[key];
      agg.concentrationPercent = Math.round((agg.totalRisks / (risksData.length || 1)) * 100);
      const result = await db.insert(riskAggregation).values(agg).returning();
      results.push(result[0]);
    }
    
    return { success: true, aggregations: results };
  }

  // Control Effectiveness
  async getControlEffectivenessRecords(tenantId?: string): Promise<ControlEffectivenessRecord[]> {
    if (tenantId) {
      return db.select().from(controlEffectiveness).where(eq(controlEffectiveness.tenantId, tenantId)).orderBy(desc(controlEffectiveness.overallEffectiveness));
    }
    return db.select().from(controlEffectiveness).orderBy(desc(controlEffectiveness.overallEffectiveness));
  }

  async getControlEffectiveness(controlId: string): Promise<ControlEffectivenessRecord | undefined> {
    const result = await db.select().from(controlEffectiveness).where(eq(controlEffectiveness.controlId, controlId));
    return result[0];
  }

  async createControlEffectiveness(effectiveness: InsertControlEffectiveness): Promise<ControlEffectivenessRecord> {
    const overallScore = Math.round(((effectiveness.designEffectiveness || 0) * 0.4) + ((effectiveness.operatingEffectiveness || 0) * 0.6));
    const effectivenessRating = overallScore >= 80 ? "effective" : overallScore >= 50 ? "partially_effective" : "ineffective";
    const result = await db.insert(controlEffectiveness).values({
      ...effectiveness,
      overallEffectiveness: overallScore,
      effectivenessRating,
    }).returning();
    return result[0];
  }

  async updateControlEffectiveness(id: string, effectiveness: Partial<InsertControlEffectiveness>): Promise<ControlEffectivenessRecord | undefined> {
    let updates: any = { ...effectiveness, updatedAt: new Date() };
    if (effectiveness.designEffectiveness !== undefined || effectiveness.operatingEffectiveness !== undefined) {
      const current = await db.select().from(controlEffectiveness).where(eq(controlEffectiveness.id, id));
      if (current[0]) {
        const designScore = effectiveness.designEffectiveness ?? current[0].designEffectiveness ?? 0;
        const operatingScore = effectiveness.operatingEffectiveness ?? current[0].operatingEffectiveness ?? 0;
        updates.overallEffectiveness = Math.round((designScore * 0.4) + (operatingScore * 0.6));
        updates.effectivenessRating = updates.overallEffectiveness >= 80 ? "effective" : updates.overallEffectiveness >= 50 ? "partially_effective" : "ineffective";
      }
    }
    const result = await db.update(controlEffectiveness)
      .set(updates)
      .where(eq(controlEffectiveness.id, id))
      .returning();
    return result[0];
  }

  // Risk Signals
  async getRiskSignals(tenantId?: string): Promise<RiskSignalRecord[]> {
    if (tenantId) {
      return db.select().from(riskSignals).where(eq(riskSignals.tenantId, tenantId)).orderBy(desc(riskSignals.detectedAt));
    }
    return db.select().from(riskSignals).orderBy(desc(riskSignals.detectedAt));
  }

  async createRiskSignal(signal: InsertRiskSignal): Promise<RiskSignalRecord> {
    const result = await db.insert(riskSignals).values(signal).returning();
    return result[0];
  }

  async updateRiskSignal(id: string, signal: Partial<InsertRiskSignal>): Promise<RiskSignalRecord | undefined> {
    const result = await db.update(riskSignals)
      .set(signal)
      .where(eq(riskSignals.id, id))
      .returning();
    return result[0];
  }

  // Platform Documents
  async getPlatformDocuments(): Promise<PlatformDocument[]> {
    return db.select().from(platformDocuments).orderBy(desc(platformDocuments.updatedAt));
  }

  async getPlatformDocument(id: string): Promise<PlatformDocument | undefined> {
    const result = await db.select().from(platformDocuments).where(eq(platformDocuments.id, id));
    return result[0];
  }

  async createPlatformDocument(doc: InsertPlatformDocument): Promise<PlatformDocument> {
    const result = await db.insert(platformDocuments).values(doc).returning();
    return result[0];
  }

  async updatePlatformDocument(id: string, doc: Partial<InsertPlatformDocument>): Promise<PlatformDocument | undefined> {
    const result = await db.update(platformDocuments)
      .set({ ...doc, updatedAt: new Date() })
      .where(eq(platformDocuments.id, id))
      .returning();
    return result[0];
  }

  async deletePlatformDocument(id: string): Promise<boolean> {
    await db.delete(platformDocuments).where(eq(platformDocuments.id, id));
    return true;
  }

  // ============ APPROVAL WORKFLOW STORAGE ============

  async getApprovers(tenantId: string): Promise<any[]> {
    const result = await db
      .select({
        id: approverAssignments.id,
        tenantId: approverAssignments.tenantId,
        userId: approverAssignments.userId,
        approverLevel: approverAssignments.approverLevel,
        department: approverAssignments.department,
        isActive: approverAssignments.isActive,
        createdAt: approverAssignments.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        }
      })
      .from(approverAssignments)
      .leftJoin(users, eq(approverAssignments.userId, users.id))
      .where(eq(approverAssignments.tenantId, tenantId));
    return result;
  }

  async createApproverAssignment(data: any): Promise<any> {
    const [result] = await db.insert(approverAssignments).values(data).returning();
    return result;
  }

  async updateApproverAssignment(id: string, data: any): Promise<any> {
    const [result] = await db.update(approverAssignments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(approverAssignments.id, id))
      .returning();
    return result;
  }

  async deleteApproverAssignment(id: string): Promise<boolean> {
    await db.delete(approverAssignments).where(eq(approverAssignments.id, id));
    return true;
  }

  async getApprovalWorkflows(tenantId: string, entityType?: string, entityId?: string): Promise<any[]> {
    const results = await db.select().from(approvalWorkflows).where(eq(approvalWorkflows.tenantId, tenantId));
    
    // Filter in memory for optional params
    return results.filter(w => {
      if (entityType && w.entityType !== entityType) return false;
      if (entityId && w.entityId !== entityId) return false;
      return true;
    });
  }

  async createApprovalWorkflow(data: any): Promise<any> {
    const [result] = await db.insert(approvalWorkflows).values(data).returning();
    return result;
  }

  async getApprovalWorkflowWithLevels(id: string): Promise<any> {
    const [workflow] = await db.select().from(approvalWorkflows).where(eq(approvalWorkflows.id, id));
    if (!workflow) return null;
    
    const levels = await db.select().from(approvalLevels)
      .where(eq(approvalLevels.workflowId, id))
      .orderBy(approvalLevels.levelNumber);
    
    return { ...workflow, levels };
  }

  async updateApprovalWorkflow(id: string, data: any): Promise<any> {
    const [result] = await db.update(approvalWorkflows)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(approvalWorkflows.id, id))
      .returning();
    return result;
  }

  async processApprovalAction(workflowId: string, action: { action: string; comments?: string; levelId: string; approverId: string }): Promise<any> {
    // Update the approval level
    const newStatus = action.action === 'approve' ? 'approved' : 'rejected';
    await db.update(approvalLevels)
      .set({ 
        status: newStatus as any, 
        comments: action.comments,
        actionAt: new Date()
      })
      .where(eq(approvalLevels.id, action.levelId));
    
    // Get the workflow
    const [workflow] = await db.select().from(approvalWorkflows).where(eq(approvalWorkflows.id, workflowId));
    
    if (action.action === 'reject') {
      // Workflow is rejected
      await db.update(approvalWorkflows)
        .set({ status: 'rejected', completedAt: new Date(), updatedAt: new Date() })
        .where(eq(approvalWorkflows.id, workflowId));
    } else {
      // Check if all levels are approved
      const pendingLevels = await db.select().from(approvalLevels)
        .where(eq(approvalLevels.workflowId, workflowId))
        .then(levels => levels.filter(l => l.status === 'pending'));
      
      if (pendingLevels.length === 0) {
        // All levels approved - workflow complete
        await db.update(approvalWorkflows)
          .set({ status: 'approved', completedAt: new Date(), currentLevel: workflow.totalLevels || 1, updatedAt: new Date() })
          .where(eq(approvalWorkflows.id, workflowId));
        
        // Update the source document to approved status
        if (workflow.entityType === 'policy') {
          await db.update(policies)
            .set({ status: 'approved', approvedAt: new Date(), updatedAt: new Date() })
            .where(eq(policies.id, workflow.entityId));
        } else if (workflow.entityType === 'procedure') {
          await db.update(procedures)
            .set({ status: 'approved', approvedAt: new Date(), updatedAt: new Date() })
            .where(eq(procedures.id, workflow.entityId));
        } else if (workflow.entityType === 'process') {
          await db.update(processes)
            .set({ status: 'approved', updatedAt: new Date() })
            .where(eq(processes.id, workflow.entityId));
        }
      } else {
        // Move to next level
        await db.update(approvalWorkflows)
          .set({ currentLevel: (workflow.currentLevel || 0) + 1, updatedAt: new Date() })
          .where(eq(approvalWorkflows.id, workflowId));
      }
    }
    
    return this.getApprovalWorkflowWithLevels(workflowId);
  }

  async createApprovalLevels(workflowId: string, levels: any[]): Promise<any[]> {
    const result = await db.insert(approvalLevels)
      .values(levels.map(l => ({ ...l, workflowId })))
      .returning();
    return result;
  }

  // ============ EMPLOYEE PORTAL STORAGE ============

  async getPolicyAcknowledgments(tenantId: string, userId?: string): Promise<any[]> {
    let conditions = [eq(policyAcknowledgments.tenantId, tenantId)];
    if (userId) {
      conditions.push(eq(policyAcknowledgments.userId, userId));
    }
    return db.select().from(policyAcknowledgments).where(and(...conditions));
  }

  async createPolicyAcknowledgment(data: any): Promise<any> {
    const [result] = await db.insert(policyAcknowledgments).values(data).returning();
    return result;
  }

  async getPoliciesPendingAcknowledgment(tenantId: string, userId: string): Promise<any[]> {
    // Get all approved policies for tenant
    const approvedPolicies = await db.select().from(policies)
      .where(and(
        eq(policies.tenantId, tenantId),
        eq(policies.status, 'approved')
      ));
    
    // Get user's acknowledgments
    const acknowledged = await db.select().from(policyAcknowledgments)
      .where(and(
        eq(policyAcknowledgments.tenantId, tenantId),
        eq(policyAcknowledgments.userId, userId)
      ));
    
    const acknowledgedIds = new Set(acknowledged.map(a => a.policyId));
    
    return approvedPolicies.filter(p => !acknowledgedIds.has(p.id));
  }

  async getTrainingAssignments(tenantId: string, userId?: string): Promise<any[]> {
    let conditions = [eq(trainingAssignments.tenantId, tenantId)];
    if (userId) {
      conditions.push(eq(trainingAssignments.userId, userId));
    }
    return db.select().from(trainingAssignments).where(and(...conditions));
  }

  async createTrainingAssignment(data: any): Promise<any> {
    const [result] = await db.insert(trainingAssignments).values(data).returning();
    return result;
  }

  async updateTrainingAssignment(id: string, data: any): Promise<any> {
    const [result] = await db.update(trainingAssignments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(trainingAssignments.id, id))
      .returning();
    return result;
  }

  async getEmployeeDevices(tenantId: string, userId?: string): Promise<any[]> {
    let conditions = [eq(employeeDevices.tenantId, tenantId)];
    if (userId) {
      conditions.push(eq(employeeDevices.userId, userId));
    }
    return db.select().from(employeeDevices).where(and(...conditions));
  }

  async createEmployeeDevice(data: any): Promise<any> {
    const [result] = await db.insert(employeeDevices).values(data).returning();
    return result;
  }

  async updateEmployeeDevice(id: string, data: any): Promise<any> {
    const [result] = await db.update(employeeDevices)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(employeeDevices.id, id))
      .returning();
    return result;
  }

  async deleteEmployeeDevice(id: string): Promise<boolean> {
    await db.delete(employeeDevices).where(eq(employeeDevices.id, id));
    return true;
  }

  async getCybersecurityTips(tenantId?: string, language?: string): Promise<any[]> {
    const results = await db.select().from(cybersecurityTips)
      .where(eq(cybersecurityTips.isActive, true))
      .orderBy(cybersecurityTips.priority);
    
    // Filter for tenant-specific or global tips
    return results.filter(t => !t.tenantId || t.tenantId === tenantId);
  }

  async getIncidentGuidance(tenantId?: string, incidentType?: string): Promise<any[]> {
    const results = await db.select().from(incidentGuidance)
      .where(eq(incidentGuidance.isActive, true))
      .orderBy(incidentGuidance.priority);
    
    // Filter for tenant-specific or global guidance
    return results.filter(g => {
      if (g.tenantId && g.tenantId !== tenantId) return false;
      if (incidentType && g.incidentType !== incidentType) return false;
      return true;
    });
  }

  // ============ SECURITY MODULE STORAGE ============

  async getSecurityScans(tenantId?: string): Promise<any[]> {
    if (tenantId) {
      return db.select().from(securityScans).where(eq(securityScans.tenantId, tenantId)).orderBy(desc(securityScans.scanDate));
    }
    return db.select().from(securityScans).orderBy(desc(securityScans.scanDate));
  }

  async getSecurityScan(id: string): Promise<any | null> {
    const [result] = await db.select().from(securityScans).where(eq(securityScans.id, id));
    return result || null;
  }

  async createSecurityScan(data: any): Promise<any> {
    const [result] = await db.insert(securityScans).values(data).returning();
    return result;
  }

  async updateSecurityScan(id: string, data: any): Promise<any> {
    const [result] = await db.update(securityScans)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(securityScans.id, id))
      .returning();
    return result;
  }

  async getSecurityFindings(tenantId?: string, scanId?: string, severity?: string, status?: string): Promise<any[]> {
    let conditions: any[] = [];
    if (tenantId) conditions.push(eq(securityFindings.tenantId, tenantId));
    if (scanId) conditions.push(eq(securityFindings.scanId, scanId));
    if (severity) conditions.push(eq(securityFindings.severity, severity as any));
    if (status) conditions.push(eq(securityFindings.status, status as any));
    
    if (conditions.length > 0) {
      return db.select().from(securityFindings).where(and(...conditions)).orderBy(desc(securityFindings.createdAt));
    }
    return db.select().from(securityFindings).orderBy(desc(securityFindings.createdAt));
  }

  async createSecurityFinding(data: any): Promise<any> {
    const [result] = await db.insert(securityFindings).values(data).returning();
    return result;
  }

  async updateSecurityFinding(id: string, data: any): Promise<any> {
    const [result] = await db.update(securityFindings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(securityFindings.id, id))
      .returning();
    return result;
  }

  async getSecurityPostureAssessments(tenantId?: string): Promise<any[]> {
    if (tenantId) {
      return db.select().from(securityPostureAssessments).where(eq(securityPostureAssessments.tenantId, tenantId)).orderBy(desc(securityPostureAssessments.assessmentDate));
    }
    return db.select().from(securityPostureAssessments).orderBy(desc(securityPostureAssessments.assessmentDate));
  }

  async createSecurityPostureAssessment(data: any): Promise<any> {
    const [result] = await db.insert(securityPostureAssessments).values(data).returning();
    return result;
  }

  async getSecurityScorecards(tenantId?: string, period?: string): Promise<any[]> {
    let conditions: any[] = [];
    if (tenantId) conditions.push(eq(securityScorecards.tenantId, tenantId));
    if (period) conditions.push(eq(securityScorecards.period, period));
    
    if (conditions.length > 0) {
      return db.select().from(securityScorecards).where(and(...conditions)).orderBy(desc(securityScorecards.generatedAt));
    }
    return db.select().from(securityScorecards).orderBy(desc(securityScorecards.generatedAt));
  }

  async createSecurityScorecard(data: any): Promise<any> {
    const [result] = await db.insert(securityScorecards).values(data).returning();
    return result;
  }

  async getSecurityPostureHistory(tenantId?: string, startDate?: string, endDate?: string): Promise<any[]> {
    let conditions: any[] = [];
    if (tenantId) conditions.push(eq(securityPostureHistory.tenantId, tenantId));
    
    if (conditions.length > 0) {
      return db.select().from(securityPostureHistory).where(and(...conditions)).orderBy(desc(securityPostureHistory.recordDate));
    }
    return db.select().from(securityPostureHistory).orderBy(desc(securityPostureHistory.recordDate));
  }

  // ============ SECURITY CONTROL ASSESSMENTS STORAGE ============

  async getSecurityControlAssessments(tenantId?: string, assessmentType?: string, status?: string): Promise<any[]> {
    let conditions: any[] = [];
    if (tenantId) conditions.push(eq(securityControlAssessments.tenantId, tenantId));
    if (assessmentType) conditions.push(eq(securityControlAssessments.assessmentType, assessmentType));
    if (status) conditions.push(eq(securityControlAssessments.status, status));
    
    if (conditions.length > 0) {
      return db.select().from(securityControlAssessments).where(and(...conditions)).orderBy(desc(securityControlAssessments.assessmentDate));
    }
    return db.select().from(securityControlAssessments).orderBy(desc(securityControlAssessments.assessmentDate));
  }

  async getSecurityControlAssessment(id: string): Promise<any | null> {
    const [result] = await db.select().from(securityControlAssessments).where(eq(securityControlAssessments.id, id));
    return result || null;
  }

  async createSecurityControlAssessment(data: any): Promise<any> {
    const [result] = await db.insert(securityControlAssessments).values(data).returning();
    return result;
  }

  async updateSecurityControlAssessment(id: string, data: any): Promise<any> {
    const [result] = await db.update(securityControlAssessments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(securityControlAssessments.id, id))
      .returning();
    return result;
  }

  async getSecurityControlItems(tenantId?: string, assessmentId?: string, status?: string): Promise<any[]> {
    let conditions: any[] = [];
    if (tenantId) conditions.push(eq(securityControlItems.tenantId, tenantId));
    if (assessmentId) conditions.push(eq(securityControlItems.assessmentId, assessmentId));
    if (status) conditions.push(eq(securityControlItems.status, status));
    
    if (conditions.length > 0) {
      return db.select().from(securityControlItems).where(and(...conditions));
    }
    return db.select().from(securityControlItems);
  }

  async createSecurityControlItem(data: any): Promise<any> {
    const [result] = await db.insert(securityControlItems).values(data).returning();
    return result;
  }

  async updateSecurityControlItem(id: string, data: any): Promise<any> {
    const [result] = await db.update(securityControlItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(securityControlItems.id, id))
      .returning();
    return result;
  }

  // ============ DSPM STORAGE ============

  async getDataDiscoveryScans(tenantId?: string): Promise<any[]> {
    if (tenantId) {
      return db.select().from(dataDiscoveryScans).where(eq(dataDiscoveryScans.tenantId, tenantId)).orderBy(desc(dataDiscoveryScans.createdAt));
    }
    return db.select().from(dataDiscoveryScans).orderBy(desc(dataDiscoveryScans.createdAt));
  }

  async createDataDiscoveryScan(data: any): Promise<any> {
    const [result] = await db.insert(dataDiscoveryScans).values(data).returning();
    return result;
  }

  async getSensitiveDataLocations(tenantId?: string, sensitivity?: string, dataType?: string): Promise<any[]> {
    let conditions: any[] = [];
    if (tenantId) conditions.push(eq(sensitiveDataLocations.tenantId, tenantId));
    if (sensitivity) conditions.push(eq(sensitiveDataLocations.sensitivity, sensitivity as any));
    if (dataType) conditions.push(eq(sensitiveDataLocations.dataType, dataType));
    
    if (conditions.length > 0) {
      return db.select().from(sensitiveDataLocations).where(and(...conditions));
    }
    return db.select().from(sensitiveDataLocations);
  }

  async createSensitiveDataLocation(data: any): Promise<any> {
    const [result] = await db.insert(sensitiveDataLocations).values(data).returning();
    return result;
  }

  async getDataFlowMappings(tenantId?: string): Promise<any[]> {
    if (tenantId) {
      return db.select().from(dataFlowMappings).where(eq(dataFlowMappings.tenantId, tenantId));
    }
    return db.select().from(dataFlowMappings);
  }

  async createDataFlowMapping(data: any): Promise<any> {
    const [result] = await db.insert(dataFlowMappings).values(data).returning();
    return result;
  }

  async getDataAccessRisks(tenantId?: string, severity?: string, status?: string): Promise<any[]> {
    let conditions: any[] = [];
    if (tenantId) conditions.push(eq(dataAccessRisks.tenantId, tenantId));
    if (severity) conditions.push(eq(dataAccessRisks.severity, severity as any));
    if (status) conditions.push(eq(dataAccessRisks.status, status as any));
    
    if (conditions.length > 0) {
      return db.select().from(dataAccessRisks).where(and(...conditions));
    }
    return db.select().from(dataAccessRisks);
  }

  async createDataAccessRisk(data: any): Promise<any> {
    const [result] = await db.insert(dataAccessRisks).values(data).returning();
    return result;
  }

  // ============ GOVERNANCE MODULE STORAGE ============

  // AI Systems
  async getAiSystems(tenantId?: string): Promise<AiSystem[]> {
    if (tenantId) {
      return db.select().from(aiSystems).where(eq(aiSystems.tenantId, tenantId)).orderBy(desc(aiSystems.createdAt));
    }
    return db.select().from(aiSystems).orderBy(desc(aiSystems.createdAt));
  }

  async getAiSystem(id: string): Promise<AiSystem | null> {
    const [result] = await db.select().from(aiSystems).where(eq(aiSystems.id, id));
    return result || null;
  }

  async createAiSystem(data: InsertAiSystem): Promise<AiSystem> {
    const [result] = await db.insert(aiSystems).values(data).returning();
    return result;
  }

  async updateAiSystem(id: string, data: Partial<InsertAiSystem>): Promise<AiSystem | null> {
    const [result] = await db.update(aiSystems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiSystems.id, id))
      .returning();
    return result || null;
  }

  async deleteAiSystem(id: string): Promise<boolean> {
    const result = await db.delete(aiSystems).where(eq(aiSystems.id, id));
    return true;
  }

  // Data Assets
  async getDataAssets(tenantId?: string): Promise<DataAsset[]> {
    if (tenantId) {
      return db.select().from(dataAssets).where(eq(dataAssets.tenantId, tenantId)).orderBy(desc(dataAssets.createdAt));
    }
    return db.select().from(dataAssets).orderBy(desc(dataAssets.createdAt));
  }

  async getDataAsset(id: string): Promise<DataAsset | null> {
    const [result] = await db.select().from(dataAssets).where(eq(dataAssets.id, id));
    return result || null;
  }

  async createDataAsset(data: InsertDataAsset): Promise<DataAsset> {
    const [result] = await db.insert(dataAssets).values(data).returning();
    return result;
  }

  async updateDataAsset(id: string, data: Partial<InsertDataAsset>): Promise<DataAsset | null> {
    const [result] = await db.update(dataAssets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(dataAssets.id, id))
      .returning();
    return result || null;
  }

  async deleteDataAsset(id: string): Promise<boolean> {
    await db.delete(dataAssets).where(eq(dataAssets.id, id));
    return true;
  }

  // Governance Decisions
  async getGovernanceDecisions(tenantId?: string): Promise<GovernanceDecision[]> {
    if (tenantId) {
      return db.select().from(governanceDecisions).where(eq(governanceDecisions.tenantId, tenantId)).orderBy(desc(governanceDecisions.createdAt));
    }
    return db.select().from(governanceDecisions).orderBy(desc(governanceDecisions.createdAt));
  }

  async getGovernanceDecision(id: string): Promise<GovernanceDecision | null> {
    const [result] = await db.select().from(governanceDecisions).where(eq(governanceDecisions.id, id));
    return result || null;
  }

  async createGovernanceDecision(data: InsertGovernanceDecision): Promise<GovernanceDecision> {
    const [result] = await db.insert(governanceDecisions).values(data).returning();
    return result;
  }

  async updateGovernanceDecision(id: string, data: Partial<InsertGovernanceDecision>): Promise<GovernanceDecision | null> {
    const [result] = await db.update(governanceDecisions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(governanceDecisions.id, id))
      .returning();
    return result || null;
  }

  async deleteGovernanceDecision(id: string): Promise<boolean> {
    await db.delete(governanceDecisions).where(eq(governanceDecisions.id, id));
    return true;
  }

  // RACI Items
  async getRaciItems(tenantId?: string): Promise<RaciItem[]> {
    if (tenantId) {
      return db.select().from(raciItems).where(eq(raciItems.tenantId, tenantId)).orderBy(desc(raciItems.createdAt));
    }
    return db.select().from(raciItems).orderBy(desc(raciItems.createdAt));
  }

  async createRaciItem(data: InsertRaciItem): Promise<RaciItem> {
    const [result] = await db.insert(raciItems).values(data).returning();
    return result;
  }

  async updateRaciItem(id: string, data: Partial<InsertRaciItem>): Promise<RaciItem | null> {
    const [result] = await db.update(raciItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(raciItems.id, id))
      .returning();
    return result || null;
  }

  async deleteRaciItem(id: string): Promise<boolean> {
    await db.delete(raciItems).where(eq(raciItems.id, id));
    return true;
  }

  // Change Events
  async getGovernanceChangeEvents(tenantId?: string): Promise<GovernanceChangeEvent[]> {
    if (tenantId) {
      return db.select().from(governanceChangeEvents).where(eq(governanceChangeEvents.tenantId, tenantId)).orderBy(desc(governanceChangeEvents.createdAt));
    }
    return db.select().from(governanceChangeEvents).orderBy(desc(governanceChangeEvents.createdAt));
  }

  async getGovernanceChangeEvent(id: string): Promise<GovernanceChangeEvent | null> {
    const [result] = await db.select().from(governanceChangeEvents).where(eq(governanceChangeEvents.id, id));
    return result || null;
  }

  async createGovernanceChangeEvent(data: InsertGovernanceChangeEvent): Promise<GovernanceChangeEvent> {
    const [result] = await db.insert(governanceChangeEvents).values(data).returning();
    return result;
  }

  async updateGovernanceChangeEvent(id: string, data: Partial<InsertGovernanceChangeEvent>): Promise<GovernanceChangeEvent | null> {
    const [result] = await db.update(governanceChangeEvents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(governanceChangeEvents.id, id))
      .returning();
    return result || null;
  }

  async deleteGovernanceChangeEvent(id: string): Promise<boolean> {
    await db.delete(governanceChangeEvents).where(eq(governanceChangeEvents.id, id));
    return true;
  }

  // Change Impacts
  async getGovernanceChangeImpacts(tenantId?: string, changeEventId?: string): Promise<GovernanceChangeImpact[]> {
    let conditions: any[] = [];
    if (tenantId) conditions.push(eq(governanceChangeImpacts.tenantId, tenantId));
    if (changeEventId) conditions.push(eq(governanceChangeImpacts.changeEventId, changeEventId));
    
    if (conditions.length > 0) {
      return db.select().from(governanceChangeImpacts).where(and(...conditions)).orderBy(desc(governanceChangeImpacts.createdAt));
    }
    return db.select().from(governanceChangeImpacts).orderBy(desc(governanceChangeImpacts.createdAt));
  }

  async createGovernanceChangeImpact(data: InsertGovernanceChangeImpact): Promise<GovernanceChangeImpact> {
    const [result] = await db.insert(governanceChangeImpacts).values(data).returning();
    return result;
  }

  async updateGovernanceChangeImpact(id: string, data: Partial<InsertGovernanceChangeImpact>): Promise<GovernanceChangeImpact | null> {
    const [result] = await db.update(governanceChangeImpacts)
      .set(data)
      .where(eq(governanceChangeImpacts.id, id))
      .returning();
    return result || null;
  }

  async deleteGovernanceChangeImpact(id: string): Promise<boolean> {
    await db.delete(governanceChangeImpacts).where(eq(governanceChangeImpacts.id, id));
    return true;
  }

  // Governance Nodes (Ontology)
  async getGovernanceNodes(tenantId?: string): Promise<GovernanceNode[]> {
    if (tenantId) {
      return db.select().from(governanceNodes).where(eq(governanceNodes.tenantId, tenantId));
    }
    return db.select().from(governanceNodes);
  }

  async getGovernanceNode(id: string): Promise<GovernanceNode | null> {
    const [result] = await db.select().from(governanceNodes).where(eq(governanceNodes.id, id));
    return result || null;
  }

  async createGovernanceNode(data: InsertGovernanceNode): Promise<GovernanceNode> {
    const [result] = await db.insert(governanceNodes).values(data).returning();
    return result;
  }

  async updateGovernanceNode(id: string, data: Partial<InsertGovernanceNode>): Promise<GovernanceNode | null> {
    const [result] = await db.update(governanceNodes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(governanceNodes.id, id))
      .returning();
    return result || null;
  }

  async deleteGovernanceNode(id: string): Promise<boolean> {
    await db.delete(governanceNodes).where(eq(governanceNodes.id, id));
    return true;
  }

  // Governance Node Relationships
  async getGovernanceNodeRelationships(tenantId?: string): Promise<GovernanceNodeRelationship[]> {
    if (tenantId) {
      return db.select().from(governanceNodeRelationships).where(eq(governanceNodeRelationships.tenantId, tenantId));
    }
    return db.select().from(governanceNodeRelationships);
  }

  async createGovernanceNodeRelationship(data: InsertGovernanceNodeRelationship): Promise<GovernanceNodeRelationship> {
    const [result] = await db.insert(governanceNodeRelationships).values(data).returning();
    return result;
  }

  async deleteGovernanceNodeRelationship(id: string): Promise<boolean> {
    await db.delete(governanceNodeRelationships).where(eq(governanceNodeRelationships.id, id));
    return true;
  }
}

export const storage = new DatabaseStorage();
