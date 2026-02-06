import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["super_admin", "tenant_admin", "auditor", "end_user"]);
export const riskLevelEnum = pgEnum("risk_level", ["critical", "high", "medium", "low"]);
export const statusEnum = pgEnum("status", ["active", "inactive", "pending", "completed", "in_progress", "draft", "approved", "rejected", "open"]);
export const inviteStatusEnum = pgEnum("invite_status", ["pending", "accepted", "expired", "cancelled"]);
export const onboardingStepEnum = pgEnum("onboarding_step", ["invited", "profile_created", "license_selected", "activated"]);
export const onboardingRequestStatusEnum = pgEnum("onboarding_request_status", ["pending", "approved", "rejected", "provisioning", "completed"]);
export const provisioningStepEnum = pgEnum("provisioning_step", ["queued", "grc_core", "governance", "risk", "compliance", "audit", "privacy", "reports", "completed"]);
export const auditStatusEnum = pgEnum("audit_status", ["scheduled", "in_progress", "pending_review", "completed", "cancelled"]);
export const auditTypeEnum = pgEnum("audit_type", ["internal", "external", "regulatory", "surveillance", "certification", "follow_up"]);
export const auditPhaseEnum = pgEnum("audit_phase", ["planning", "preparation", "fieldwork", "reporting", "follow_up", "closure"]);
export const frameworkCategoryEnum = pgEnum("framework_category", ["security", "privacy", "governance", "regional", "industry"]);
export const licenseTypeEnum = pgEnum("license_type", ["starter", "professional", "enterprise", "unlimited"]);
export const languageEnum = pgEnum("language", ["en", "ar", "hi", "zh", "es", "fr", "de", "ja", "ko", "pt"]);
export const policyTypeEnum = pgEnum("policy_type", ["global", "industry", "regional"]);

export const regions = pgTable("regions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
});

export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  regionId: varchar("region_id").references(() => regions.id),
  logo: text("logo"),
  industry: text("industry"),
  subIndustry: text("sub_industry"),
  country: text("country"),
  website: text("website"),
  description: text("description"),
  size: text("size"),
  status: statusEnum("status").default("pending"),
  onboardingStep: onboardingStepEnum("onboarding_step").default("invited"),
  settings: jsonb("settings"),
  aiProfile: jsonb("ai_profile"),
  authorizedEmails: text("authorized_emails").array(), // List of authorized email addresses/domains for signup
  allowOpenSignup: boolean("allow_open_signup").default(false), // If true, anyone can signup; if false, only authorized emails
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tenant Invitations for enterprise onboarding workflow
export const tenantInvitations = pgTable("tenant_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  tenantName: text("tenant_name").notNull(),
  tenantSlug: text("tenant_slug").notNull().unique(),
  inviteToken: text("invite_token").notNull().unique(),
  status: inviteStatusEnum("status").default("pending"),
  invitedBy: varchar("invited_by").references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Whitelisted domains/emails for self-service tenant registration
export const whitelistedDomains = pgTable("whitelisted_domains", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  domain: text("domain"),
  email: text("email"),
  description: text("description"),
  authorizeType: text("authorize_type").default("domain"),
  organizationName: text("organization_name"),
  maxTenants: integer("max_tenants").default(1),
  allowedModules: text("allowed_modules").array(),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Self-service tenant onboarding requests
export const onboardingRequests = pgTable("onboarding_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Step 1: Email verification
  email: text("email").notNull(),
  emailVerified: boolean("email_verified").default(false),
  verificationToken: text("verification_token"),
  
  // Step 2: Organization details
  organizationName: text("organization_name"),
  domain: text("domain"),
  website: text("website"),
  industry: text("industry"),
  subIndustry: text("sub_industry"),
  country: text("country"),
  companySize: text("company_size"),
  description: text("description"),
  
  // Step 3: Module & Framework selection
  selectedModules: text("selected_modules").array(),
  selectedFrameworks: text("selected_frameworks").array(),
  licenseType: licenseTypeEnum("license_type").default("starter"),
  
  // Step 4: Admin details
  adminFirstName: text("admin_first_name"),
  adminLastName: text("admin_last_name"),
  adminEmail: text("admin_email"),
  adminPhone: text("admin_phone"),
  
  // Workflow status
  currentStep: integer("current_step").default(1),
  status: onboardingRequestStatusEnum("status").default("pending"),
  provisioningStep: provisioningStepEnum("provisioning_step").default("queued"),
  provisioningProgress: integer("provisioning_progress").default(0),
  
  // References
  approvedBy: varchar("approved_by"),
  rejectionReason: text("rejection_reason"),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatar: text("avatar"),
  role: userRoleEnum("role").default("end_user"),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  department: text("department"),
  title: text("title"),
  language: languageEnum("language").default("en"),
  isActive: boolean("is_active").default(true),
  mfaEnabled: boolean("mfa_enabled").default(false),
  mfaSecret: text("mfa_secret"),
  mfaBackupCodes: text("mfa_backup_codes").array(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Multi-tenant user access - allows users to have different roles in multiple tenants
export const userTenantAccess = pgTable("user_tenant_access", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  role: userRoleEnum("role").default("end_user"),
  isActive: boolean("is_active").default(true),
  grantedBy: varchar("granted_by").references(() => users.id),
  grantedAt: timestamp("granted_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserTenantAccessSchema = createInsertSchema(userTenantAccess).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUserTenantAccess = z.infer<typeof insertUserTenantAccessSchema>;
export type UserTenantAccess = typeof userTenantAccess.$inferSelect;

// Profile-based permissions system - allows super admin to create custom profiles
export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  name: text("name").notNull(),
  description: text("description"),
  isSystemProfile: boolean("is_system_profile").default(false),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

// Define all available modules/permissions in the system
export const modulePermissionEnum = pgEnum("module_permission", [
  "dashboard",
  "smart_insights",
  "employee_portal",
  "governance",
  "risk_management",
  "compliance",
  "data_privacy",
  "vendor_management",
  "security",
  "bcm",
  "esg",
  "auditing",
  "management",
  "analytics",
  "settings",
  "tenant_management",
  "report_center",
  "trust_center"
]);

// Profile permissions - what modules each profile can access
export const profilePermissions = pgTable("profile_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => profiles.id).notNull(),
  module: text("module").notNull(),
  canView: boolean("can_view").default(false),
  canCreate: boolean("can_create").default(false),
  canEdit: boolean("can_edit").default(false),
  canDelete: boolean("can_delete").default(false),
  canApprove: boolean("can_approve").default(false),
  canExport: boolean("can_export").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProfilePermissionSchema = createInsertSchema(profilePermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProfilePermission = z.infer<typeof insertProfilePermissionSchema>;
export type ProfilePermission = typeof profilePermissions.$inferSelect;

// Link users to profiles (optional - users can have a profile in addition to role)
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  profileId: varchar("profile_id").references(() => profiles.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  isActive: boolean("is_active").default(true),
  assignedBy: varchar("assigned_by").references(() => users.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

export const licenses = pgTable("licenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  licenseType: licenseTypeEnum("license_type").default("starter"),
  maxUsers: integer("max_users").default(10),
  maxAdmins: integer("max_admins").default(2),
  maxAuditors: integer("max_auditors").default(3),
  allowedFrameworks: text("allowed_frameworks").array(),
  allowedModules: text("allowed_modules").array(),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// License module types for feature gating
export const LICENSE_MODULES = {
  // Core modules available in all licenses
  DASHBOARD: "dashboard",
  POLICIES: "policies",
  FRAMEWORKS: "frameworks",
  
  // Professional+ modules
  RISK_REGISTER: "risk_register",
  AUDITS: "audits",
  VENDORS: "vendors",
  CONTROLS: "controls",
  
  // Enterprise+ modules
  AI_INSIGHTS: "ai_insights",
  PROCESSES: "processes",
  INTEGRATIONS: "integrations",
  
  // Unlimited modules
  PRIVACY_ROPA: "privacy_ropa",
  PRIVACY_CONSENT: "privacy_consent",
  PRIVACY_DSR: "privacy_dsr",
  PRIVACY_DPIA: "privacy_dpia",
  PRIVACY_BREACH: "privacy_breach",
  PRIVACY_DATA_MAPPING: "privacy_data_mapping",
  PRIVACY_RETENTION: "privacy_retention",
  PRIVACY_DISCOVERY: "privacy_discovery",
  
  // Security modules
  SECURITY: "security",
  DSPM: "dspm",
} as const;

// Default modules by license type
export const LICENSE_DEFAULTS = {
  starter: [
    LICENSE_MODULES.DASHBOARD,
    LICENSE_MODULES.POLICIES,
    LICENSE_MODULES.FRAMEWORKS,
  ],
  professional: [
    LICENSE_MODULES.DASHBOARD,
    LICENSE_MODULES.POLICIES,
    LICENSE_MODULES.FRAMEWORKS,
    LICENSE_MODULES.RISK_REGISTER,
    LICENSE_MODULES.AUDITS,
    LICENSE_MODULES.VENDORS,
    LICENSE_MODULES.CONTROLS,
  ],
  enterprise: [
    LICENSE_MODULES.DASHBOARD,
    LICENSE_MODULES.POLICIES,
    LICENSE_MODULES.FRAMEWORKS,
    LICENSE_MODULES.RISK_REGISTER,
    LICENSE_MODULES.AUDITS,
    LICENSE_MODULES.VENDORS,
    LICENSE_MODULES.CONTROLS,
    LICENSE_MODULES.AI_INSIGHTS,
    LICENSE_MODULES.PROCESSES,
    LICENSE_MODULES.INTEGRATIONS,
  ],
  unlimited: Object.values(LICENSE_MODULES),
} as const;

export const frameworks = pgTable("frameworks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  version: text("version"),
  description: text("description"),
  category: frameworkCategoryEnum("category").default("security"),
  region: text("region"),
  icon: text("icon"),
  controlCount: integer("control_count").default(0),
  isGlobal: boolean("is_global").default(true),
});

export const controls = pgTable("controls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  frameworkId: varchar("framework_id").references(() => frameworks.id),
  controlId: text("control_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  guidance: text("guidance"),
  evidenceRequirements: text("evidence_requirements").array(),
  automationLevel: text("automation_level"),
  complianceSteps: jsonb("compliance_steps"),
  crossFrameworkMappings: jsonb("cross_framework_mappings"),
  aiEnriched: boolean("ai_enriched").default(false),
});

export const tenantFrameworks = pgTable("tenant_frameworks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  frameworkId: varchar("framework_id").references(() => frameworks.id),
  status: statusEnum("status").default("active"),
  complianceScore: integer("compliance_score").default(0),
  applicabilityType: varchar("applicability_type").default("global"), // global, industry, regional
  assignedAt: timestamp("assigned_at").defaultNow(),
});

export const policies = pgTable("policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  version: text("version").default("1.0"),
  category: text("category"),
  policyType: policyTypeEnum("policy_type").default("industry"),
  relatedFrameworks: text("related_frameworks").array(),
  status: statusEnum("status").default("draft"),
  ownerId: varchar("owner_id").references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  effectiveDate: timestamp("effective_date"),
  reviewDate: timestamp("review_date"),
  relatedControls: text("related_controls").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const risks = pgTable("risks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  riskLevel: riskLevelEnum("risk_level").default("medium"),
  likelihood: integer("likelihood").default(3),
  impact: integer("impact").default(3),
  riskScore: integer("risk_score").default(9),
  status: statusEnum("status").default("active"),
  ownerId: varchar("owner_id").references(() => users.id),
  mitigationPlan: text("mitigation_plan"),
  relatedControls: text("related_controls").array(),
  identifiedAt: timestamp("identified_at").defaultNow(),
  reviewDate: timestamp("review_date"),
});

export const audits = pgTable("audits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  title: text("title").notNull(),
  description: text("description"),
  frameworkId: varchar("framework_id").references(() => frameworks.id),
  auditorId: varchar("auditor_id").references(() => users.id),
  auditType: auditTypeEnum("audit_type").default("internal"),
  currentPhase: auditPhaseEnum("current_phase").default("planning"),
  phaseProgress: jsonb("phase_progress"),
  status: auditStatusEnum("status").default("scheduled"),
  scheduledDate: timestamp("scheduled_date"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  findings: jsonb("findings"),
  recommendations: jsonb("recommendations"),
  score: integer("score"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditChecklist = pgTable("audit_checklist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auditId: varchar("audit_id").references(() => audits.id),
  controlId: varchar("control_id").references(() => controls.id),
  question: text("question").notNull(),
  guidance: text("guidance"),
  status: statusEnum("status").default("pending"),
  evidence: text("evidence").array(),
  notes: text("notes"),
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
});

export const complianceItems = pgTable("compliance_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  frameworkId: varchar("framework_id").references(() => frameworks.id),
  controlId: varchar("control_id").references(() => controls.id),
  status: statusEnum("status").default("pending"),
  evidence: text("evidence").array(),
  notes: text("notes"),
  assigneeId: varchar("assignee_id").references(() => users.id),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
});

export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  name: text("name").notNull(),
  category: text("category"),
  riskLevel: riskLevelEnum("risk_level").default("medium"),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contractStartDate: timestamp("contract_start_date"),
  contractEndDate: timestamp("contract_end_date"),
  status: statusEnum("status").default("active"),
  complianceCertifications: text("compliance_certifications").array(),
  aiEnrichedData: jsonb("ai_enriched_data"),
  portalAccessToken: varchar("portal_access_token"),
  portalAccessTokenExpiresAt: timestamp("portal_access_token_expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vendor Assessments for Third-Party Risk Management
export const vendorAssessmentStatusEnum = pgEnum("vendor_assessment_status", ["draft", "sent", "in_progress", "submitted", "reviewed", "completed"]);

export const vendorAssessments = pgTable("vendor_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  assessmentType: text("assessment_type").notNull(), // security, privacy, compliance, due_diligence
  questionnaireTemplate: text("questionnaire_template"), // SIG, CAIQ, custom
  status: vendorAssessmentStatusEnum("status").default("draft"),
  dueDate: timestamp("due_date"),
  submittedAt: timestamp("submitted_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  overallScore: integer("overall_score"),
  riskRating: riskLevelEnum("risk_rating"),
  responses: jsonb("responses"), // questionnaire responses
  findings: jsonb("findings"), // assessment findings
  recommendations: jsonb("recommendations"),
  attachments: jsonb("attachments"), // evidence documents
  aiAnalysis: text("ai_analysis"),
  accessToken: varchar("access_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vendor Contracts
export const vendorContracts = pgTable("vendor_contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  contractName: text("contract_name").notNull(),
  contractType: text("contract_type"), // MSA, NDA, DPA, SLA
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  value: integer("value"),
  currency: text("currency").default("USD"),
  autoRenew: boolean("auto_renew").default(false),
  renewalNoticeDays: integer("renewal_notice_days"),
  status: text("status").default("active"),
  keyTerms: jsonb("key_terms"),
  complianceRequirements: jsonb("compliance_requirements"),
  documentUrl: text("document_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vendor Due Diligence Checklist
export const vendorDueDiligence = pgTable("vendor_due_diligence", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  checklistType: text("checklist_type").notNull(), // pre_engagement, annual_review, exit
  items: jsonb("items").notNull(), // checklist items with status
  completedItems: integer("completed_items").default(0),
  totalItems: integer("total_items").default(0),
  completedBy: varchar("completed_by").references(() => users.id),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Questionnaire Templates for Vendor Risk Assessments
export const questionnaireTemplates = pgTable("questionnaire_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // vendor_risk, security, privacy, compliance
  isSystem: boolean("is_system").default(false), // true for built-in templates
  isActive: boolean("is_active").default(true),
  version: text("version").default("1.0"),
  questions: jsonb("questions").notNull(), // array of question objects
  totalQuestions: integer("total_questions").default(0),
  estimatedTime: integer("estimated_time"), // minutes to complete
  tags: text("tags").array(),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dataPrivacy = pgTable("data_privacy", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  dataType: text("data_type").notNull(),
  classification: text("classification"),
  storageLocation: text("storage_location"),
  retentionPeriod: text("retention_period"),
  legalBasis: text("legal_basis"),
  thirdPartySharing: boolean("third_party_sharing").default(false),
  encryptionStatus: boolean("encryption_status").default(true),
  relatedRegulations: text("related_regulations").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  userId: varchar("user_id").references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message"),
  severity: riskLevelEnum("severity").default("medium"),
  isRead: boolean("is_read").default(false),
  actionUrl: text("action_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiInsightPriorityEnum = pgEnum("ai_insight_priority", ["critical", "high", "medium", "low"]);
export const aiInsightStatusEnum = pgEnum("ai_insight_status", ["new", "acknowledged", "in_progress", "resolved", "dismissed"]);

export const aiInsights = pgTable("ai_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  insight: text("insight"),
  recommendation: text("recommendation"),
  priority: aiInsightPriorityEnum("priority").default("medium"),
  status: aiInsightStatusEnum("status").default("new"),
  confidence: integer("confidence").default(80),
  relatedEntities: jsonb("related_entities"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trainingModules = pgTable("training_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  category: text("category"),
  duration: integer("duration"),
  isRequired: boolean("is_required").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userTraining = pgTable("user_training", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  moduleId: varchar("module_id").references(() => trainingModules.id),
  status: statusEnum("status").default("pending"),
  progress: integer("progress").default(0),
  completedAt: timestamp("completed_at"),
  score: integer("score"),
});

export const insertRegionSchema = createInsertSchema(regions).omit({ id: true });
export const insertTenantSchema = createInsertSchema(tenants).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertFrameworkSchema = createInsertSchema(frameworks).omit({ id: true });
export const insertControlSchema = createInsertSchema(controls).omit({ id: true });
export const insertPolicySchema = createInsertSchema(policies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRiskSchema = createInsertSchema(risks).omit({ id: true, identifiedAt: true });
export const insertAuditSchema = createInsertSchema(audits).omit({ id: true, createdAt: true });
export const insertAuditChecklistSchema = createInsertSchema(auditChecklist).omit({ id: true });
export const insertComplianceItemSchema = createInsertSchema(complianceItems).omit({ id: true });
export const insertVendorSchema = createInsertSchema(vendors).omit({ id: true, createdAt: true });
export const insertVendorAssessmentSchema = createInsertSchema(vendorAssessments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVendorContractSchema = createInsertSchema(vendorContracts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVendorDueDiligenceSchema = createInsertSchema(vendorDueDiligence).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQuestionnaireTemplateSchema = createInsertSchema(questionnaireTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDataPrivacySchema = createInsertSchema(dataPrivacy).omit({ id: true, createdAt: true });
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, createdAt: true });
export const insertAiInsightSchema = createInsertSchema(aiInsights).omit({ id: true, createdAt: true });
export const insertTrainingModuleSchema = createInsertSchema(trainingModules).omit({ id: true, createdAt: true });
export const insertUserTrainingSchema = createInsertSchema(userTraining).omit({ id: true });
export const insertLicenseSchema = createInsertSchema(licenses).omit({ id: true, createdAt: true });

export type Region = typeof regions.$inferSelect;
export type InsertRegion = z.infer<typeof insertRegionSchema>;
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export const insertTenantInvitationSchema = createInsertSchema(tenantInvitations).omit({ id: true, createdAt: true });
export const insertWhitelistedDomainSchema = createInsertSchema(whitelistedDomains).omit({ id: true, createdAt: true });
export const insertOnboardingRequestSchema = createInsertSchema(onboardingRequests).omit({ id: true, createdAt: true, updatedAt: true });
export type TenantInvitation = typeof tenantInvitations.$inferSelect;
export type InsertTenantInvitation = z.infer<typeof insertTenantInvitationSchema>;
export type WhitelistedDomain = typeof whitelistedDomains.$inferSelect;
export type InsertWhitelistedDomain = z.infer<typeof insertWhitelistedDomainSchema>;
export type OnboardingRequest = typeof onboardingRequests.$inferSelect;
export type InsertOnboardingRequest = z.infer<typeof insertOnboardingRequestSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Framework = typeof frameworks.$inferSelect;
export type InsertFramework = z.infer<typeof insertFrameworkSchema>;
export type Control = typeof controls.$inferSelect;
export type InsertControl = z.infer<typeof insertControlSchema>;
export type Policy = typeof policies.$inferSelect;
export type InsertPolicy = z.infer<typeof insertPolicySchema>;
export type Risk = typeof risks.$inferSelect;
export type InsertRisk = z.infer<typeof insertRiskSchema>;
export type Audit = typeof audits.$inferSelect;
export type InsertAudit = z.infer<typeof insertAuditSchema>;
export type AuditChecklist = typeof auditChecklist.$inferSelect;
export type InsertAuditChecklist = z.infer<typeof insertAuditChecklistSchema>;
export type ComplianceItem = typeof complianceItems.$inferSelect;
export type InsertComplianceItem = z.infer<typeof insertComplianceItemSchema>;
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type VendorAssessment = typeof vendorAssessments.$inferSelect;
export type InsertVendorAssessment = z.infer<typeof insertVendorAssessmentSchema>;
export type VendorContract = typeof vendorContracts.$inferSelect;
export type InsertVendorContract = z.infer<typeof insertVendorContractSchema>;
export type VendorDueDiligence = typeof vendorDueDiligence.$inferSelect;
export type InsertVendorDueDiligence = z.infer<typeof insertVendorDueDiligenceSchema>;
export type QuestionnaireTemplate = typeof questionnaireTemplates.$inferSelect;
export type InsertQuestionnaireTemplate = z.infer<typeof insertQuestionnaireTemplateSchema>;
export type DataPrivacy = typeof dataPrivacy.$inferSelect;
export type InsertDataPrivacy = z.infer<typeof insertDataPrivacySchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type AiInsight = typeof aiInsights.$inferSelect;
export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;
export type TrainingModule = typeof trainingModules.$inferSelect;
export type InsertTrainingModule = z.infer<typeof insertTrainingModuleSchema>;
export type UserTraining = typeof userTraining.$inferSelect;
export type InsertUserTraining = z.infer<typeof insertUserTrainingSchema>;
export type License = typeof licenses.$inferSelect;
export type InsertLicense = z.infer<typeof insertLicenseSchema>;
export type TenantFramework = typeof tenantFrameworks.$inferSelect;

// ========================================
// COMPREHENSIVE PRIVACY MODULE
// ========================================

// Enums for Privacy Module
export const consentStatusEnum = pgEnum("consent_status", ["granted", "withdrawn", "expired", "pending"]);
export const consentPurposeEnum = pgEnum("consent_purpose", ["marketing", "analytics", "personalization", "third_party", "essential", "functional"]);
export const dsrTypeEnum = pgEnum("dsr_type", ["access", "rectification", "erasure", "portability", "restriction", "objection"]);
export const dsrStatusEnum = pgEnum("dsr_status", ["submitted", "verified", "in_progress", "pending_approval", "completed", "rejected", "cancelled"]);
export const breachSeverityEnum = pgEnum("breach_severity", ["critical", "high", "medium", "low"]);
export const breachStatusEnum = pgEnum("breach_status", ["detected", "investigating", "contained", "eradicated", "recovered", "closed"]);
export const dpiaStatusEnum = pgEnum("dpia_status", ["draft", "in_review", "approved", "requires_mitigation", "rejected"]);
export const dataClassificationLevelEnum = pgEnum("data_classification_level", ["public", "internal", "confidential", "restricted", "highly_restricted"]);
export const lawfulBasisEnum = pgEnum("lawful_basis", ["consent", "contract", "legal_obligation", "vital_interests", "public_task", "legitimate_interests"]);

// ROPA - Record of Processing Activities (GDPR Art. 30)
export const ropaEntries = pgTable("ropa_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  processingName: text("processing_name").notNull(),
  processingPurpose: text("processing_purpose").notNull(),
  lawfulBasis: lawfulBasisEnum("lawful_basis").notNull(),
  dataCategories: text("data_categories").array(),
  dataSubjects: text("data_subjects").array(),
  recipients: text("recipients").array(),
  thirdCountryTransfers: text("third_country_transfers").array(),
  safeguards: text("safeguards"),
  retentionPeriod: text("retention_period"),
  securityMeasures: text("security_measures"),
  dataController: text("data_controller"),
  dataControllerContact: text("data_controller_contact"),
  dataProcessor: text("data_processor"),
  dataProcessorContact: text("data_processor_contact"),
  dpoContact: text("dpo_contact"),
  riskLevel: riskLevelEnum("risk_level").default("low"),
  lastReviewDate: timestamp("last_review_date"),
  nextReviewDate: timestamp("next_review_date"),
  status: statusEnum("status").default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Consent Records - Full consent lifecycle management
export const consentRecords = pgTable("consent_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  dataSubjectId: text("data_subject_id").notNull(),
  dataSubjectEmail: text("data_subject_email"),
  dataSubjectName: text("data_subject_name"),
  purpose: consentPurposeEnum("purpose").notNull(),
  purposeDescription: text("purpose_description"),
  status: consentStatusEnum("status").default("pending"),
  consentText: text("consent_text"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  source: text("source"),
  version: text("version").default("1.0"),
  grantedAt: timestamp("granted_at"),
  withdrawnAt: timestamp("withdrawn_at"),
  expiresAt: timestamp("expires_at"),
  proofDocument: text("proof_document"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cookie Consents - Cookie banner and preference management
export const cookieConsents = pgTable("cookie_consents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  visitorId: text("visitor_id").notNull(),
  sessionId: text("session_id"),
  essential: boolean("essential").default(true),
  functional: boolean("functional").default(false),
  analytics: boolean("analytics").default(false),
  marketing: boolean("marketing").default(false),
  thirdParty: boolean("third_party").default(false),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  country: text("country"),
  region: text("region"),
  domain: text("domain"),
  consentVersion: text("consent_version").default("1.0"),
  preferences: jsonb("preferences"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Legal Bases Reference Table - GDPR Article 6 lawful bases
export const legalBases = pgTable("legal_bases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  frameworks: text("frameworks").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// DSR Types Reference Table - Data Subject Rights
export const dsrTypesRef = pgTable("dsr_types_ref", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  sla: text("sla").default("30 days"),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Country-Framework Mapping - Maps countries to applicable privacy frameworks
export const countryFrameworkMappings = pgTable("country_framework_mappings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  country: text("country").notNull(),
  countryCode: text("country_code"),
  frameworkId: varchar("framework_id").references(() => frameworks.id),
  frameworkShortName: text("framework_short_name").notNull(),
  isRequired: boolean("is_required").default(false),
  isRecommended: boolean("is_recommended").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Data Subject Requests (DSR/DSAR) - Enhanced request management
export const dsrRequests = pgTable("dsr_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  requestNumber: text("request_number").notNull(),
  requestType: dsrTypeEnum("request_type").notNull(),
  status: dsrStatusEnum("status").default("submitted"),
  dataSubjectName: text("data_subject_name").notNull(),
  dataSubjectEmail: text("data_subject_email").notNull(),
  dataSubjectPhone: text("data_subject_phone"),
  dataSubjectAddress: text("data_subject_address"),
  identityVerified: boolean("identity_verified").default(false),
  identityVerifiedAt: timestamp("identity_verified_at"),
  identityVerifiedBy: varchar("identity_verified_by").references(() => users.id),
  verificationMethod: text("verification_method"),
  requestDetails: text("request_details"),
  requestedData: text("requested_data").array(),
  assigneeId: varchar("assignee_id").references(() => users.id),
  priority: riskLevelEnum("priority").default("medium"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  responseDetails: text("response_details"),
  attachments: text("attachments").array(),
  extensionRequested: boolean("extension_requested").default(false),
  extensionReason: text("extension_reason"),
  extensionApprovedAt: timestamp("extension_approved_at"),
  rejectionReason: text("rejection_reason"),
  internalNotes: text("internal_notes"),
  auditLog: jsonb("audit_log"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Breach Incidents - Comprehensive breach management
export const breachIncidents = pgTable("breach_incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  incidentNumber: text("incident_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  severity: breachSeverityEnum("severity").default("medium"),
  status: breachStatusEnum("status").default("detected"),
  breachType: text("breach_type"),
  discoveredAt: timestamp("discovered_at").notNull(),
  occurredAt: timestamp("occurred_at"),
  containedAt: timestamp("contained_at"),
  resolvedAt: timestamp("resolved_at"),
  reportedToAuthorityAt: timestamp("reported_to_authority_at"),
  reportedToSubjectsAt: timestamp("reported_to_subjects_at"),
  affectedDataTypes: text("affected_data_types").array(),
  affectedDataSubjects: integer("affected_data_subjects"),
  affectedSystems: text("affected_systems").array(),
  rootCause: text("root_cause"),
  attackVector: text("attack_vector"),
  containmentActions: text("containment_actions"),
  eradicationActions: text("eradication_actions"),
  recoveryActions: text("recovery_actions"),
  lessonsLearned: text("lessons_learned"),
  preventiveMeasures: text("preventive_measures"),
  regulatoryNotificationRequired: boolean("regulatory_notification_required").default(false),
  dataSubjectNotificationRequired: boolean("data_subject_notification_required").default(false),
  regulatoryBody: text("regulatory_body"),
  regulatoryReferenceNumber: text("regulatory_reference_number"),
  leadInvestigatorId: varchar("lead_investigator_id").references(() => users.id),
  teamMembers: text("team_members").array(),
  externalConsultants: text("external_consultants"),
  evidence: text("evidence").array(),
  timeline: jsonb("timeline"),
  financialImpact: integer("financial_impact"),
  reputationalImpact: text("reputational_impact"),
  relatedIncidents: text("related_incidents").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// DPIA - Data Protection Impact Assessments
export const dpias = pgTable("dpias", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  assessmentNumber: text("assessment_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: dpiaStatusEnum("status").default("draft"),
  projectName: text("project_name"),
  projectDescription: text("project_description"),
  dataProcessingDescription: text("data_processing_description"),
  dataCategories: text("data_categories").array(),
  dataSubjectCategories: text("data_subject_categories").array(),
  lawfulBasis: lawfulBasisEnum("lawful_basis"),
  necessity: text("necessity"),
  proportionality: text("proportionality"),
  risksIdentified: jsonb("risks_identified"),
  mitigationMeasures: jsonb("mitigation_measures"),
  residualRisks: jsonb("residual_risks"),
  overallRiskLevel: riskLevelEnum("overall_risk_level").default("medium"),
  consultationRequired: boolean("consultation_required").default(false),
  consultationDetails: text("consultation_details"),
  dpoOpinion: text("dpo_opinion"),
  dpoApproval: boolean("dpo_approval").default(false),
  dpoApprovedAt: timestamp("dpo_approved_at"),
  ownerId: varchar("owner_id").references(() => users.id),
  reviewerId: varchar("reviewer_id").references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  reviewDate: timestamp("review_date"),
  nextReviewDate: timestamp("next_review_date"),
  relatedRopaId: varchar("related_ropa_id").references(() => ropaEntries.id),
  attachments: text("attachments").array(),
  version: text("version").default("1.0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Data Mappings - Visual data flow mappings
export const dataMappings = pgTable("data_mappings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  name: text("name").notNull(),
  description: text("description"),
  sourceSystem: text("source_system").notNull(),
  sourceType: text("source_type"),
  destinationSystem: text("destination_system").notNull(),
  destinationType: text("destination_type"),
  dataElements: jsonb("data_elements"),
  dataClassification: dataClassificationLevelEnum("data_classification").default("internal"),
  transferMechanism: text("transfer_mechanism"),
  frequency: text("frequency"),
  volume: text("volume"),
  lawfulBasis: lawfulBasisEnum("lawful_basis"),
  crossBorder: boolean("cross_border").default(false),
  destinationCountry: text("destination_country"),
  safeguards: text("safeguards"),
  encryptionInTransit: boolean("encryption_in_transit").default(true),
  encryptionAtRest: boolean("encryption_at_rest").default(true),
  retentionPeriod: text("retention_period"),
  dataOwnerId: varchar("data_owner_id").references(() => users.id),
  technicalOwnerId: varchar("technical_owner_id").references(() => users.id),
  status: statusEnum("status").default("active"),
  lastValidatedAt: timestamp("last_validated_at"),
  nextReviewDate: timestamp("next_review_date"),
  riskLevel: riskLevelEnum("risk_level").default("low"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Retention Policies - Data retention management
export const retentionPolicies = pgTable("retention_policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  name: text("name").notNull(),
  description: text("description"),
  dataCategory: text("data_category").notNull(),
  dataClassification: dataClassificationLevelEnum("data_classification").default("internal"),
  retentionPeriodDays: integer("retention_period_days").notNull(),
  legalBasis: text("legal_basis"),
  regulatoryRequirement: text("regulatory_requirement"),
  disposalMethod: text("disposal_method"),
  archiveRequired: boolean("archive_required").default(false),
  archivePeriodDays: integer("archive_period_days"),
  automationEnabled: boolean("automation_enabled").default(false),
  lastExecutedAt: timestamp("last_executed_at"),
  nextExecutionAt: timestamp("next_execution_at"),
  recordsProcessed: integer("records_processed").default(0),
  recordsDeleted: integer("records_deleted").default(0),
  recordsArchived: integer("records_archived").default(0),
  ownerId: varchar("owner_id").references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  status: statusEnum("status").default("active"),
  exceptions: jsonb("exceptions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Data Discovery Results - For DSPM functionality
export const dataDiscoveryResults = pgTable("data_discovery_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  scanId: text("scan_id").notNull(),
  scanDate: timestamp("scan_date").notNull(),
  sourceName: text("source_name").notNull(),
  sourceType: text("source_type"),
  sourceConnection: text("source_connection"),
  tableName: text("table_name"),
  columnName: text("column_name"),
  dataType: text("data_type"),
  sampleData: text("sample_data"),
  classificationLabel: dataClassificationLevelEnum("classification_label").default("internal"),
  piiDetected: boolean("pii_detected").default(false),
  piiTypes: text("pii_types").array(),
  confidence: integer("confidence").default(0),
  recordCount: integer("record_count"),
  isStale: boolean("is_stale").default(false),
  lastAccessedAt: timestamp("last_accessed_at"),
  riskScore: integer("risk_score").default(0),
  recommendations: text("recommendations").array(),
  status: statusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Purpose & Legal Basis Governance
export const purposeLegalBasis = pgTable("purpose_legal_basis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  purposeName: text("purpose_name").notNull(),
  purposeDescription: text("purpose_description"),
  legalBasis: lawfulBasisEnum("legal_basis").notNull(),
  legalBasisJustification: text("legal_basis_justification"),
  dataCategories: text("data_categories").array(),
  processingActivities: text("processing_activities").array(),
  automatedDecisionMaking: boolean("automated_decision_making").default(false),
  profiling: boolean("profiling").default(false),
  aiTrainingAllowed: boolean("ai_training_allowed").default(false),
  thirdPartySharing: boolean("third_party_sharing").default(false),
  crossBorderTransfer: boolean("cross_border_transfer").default(false),
  retentionPeriodDays: integer("retention_period_days"),
  status: statusEnum("status").default("active"),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cross-Border Transfer Governance
export const crossBorderTransfers = pgTable("cross_border_transfers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  transferName: text("transfer_name").notNull(),
  description: text("description"),
  sourceCountry: text("source_country").notNull(),
  destinationCountry: text("destination_country").notNull(),
  destinationOrganization: text("destination_organization"),
  transferMechanism: text("transfer_mechanism").notNull(), // sccs, adequacy, bcrs, derogation
  adequacyDecision: boolean("adequacy_decision").default(false),
  sccType: text("scc_type"), // controller_controller, controller_processor
  sccVersion: text("scc_version"),
  sccSignedDate: timestamp("scc_signed_date"),
  supplementaryMeasures: text("supplementary_measures").array(),
  tiaCompleted: boolean("tia_completed").default(false), // Transfer Impact Assessment
  tiaDate: timestamp("tia_date"),
  tiaFindings: text("tia_findings"),
  dataCategories: text("data_categories").array(),
  lawfulBasis: lawfulBasisEnum("lawful_basis"),
  riskLevel: text("risk_level").default("medium"), // low, medium, high, critical
  status: statusEnum("status").default("active"),
  reviewDate: timestamp("review_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Privacy Governance
export const aiPrivacyRecords = pgTable("ai_privacy_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  modelName: text("model_name").notNull(),
  modelDescription: text("model_description"),
  modelType: text("model_type"), // llm, classification, regression, generative
  vendor: text("vendor"),
  deploymentType: text("deployment_type"), // internal, saas, hybrid
  trainingDataSources: text("training_data_sources").array(),
  trainingDataCategories: text("training_data_categories").array(),
  containsPersonalData: boolean("contains_personal_data").default(false),
  containsSensitiveData: boolean("contains_sensitive_data").default(false),
  dataSubjectCategories: text("data_subject_categories").array(),
  purposeOfProcessing: text("purpose_of_processing"),
  legalBasis: lawfulBasisEnum("legal_basis"),
  dpiaRequired: boolean("dpia_required").default(false),
  dpiaCompleted: boolean("dpia_completed").default(false),
  dpiaId: varchar("dpia_id"),
  privacyRisks: jsonb("privacy_risks"), // [{risk, severity, mitigation}]
  reidentificationRisk: text("reidentification_risk").default("low"),
  modelMemorizationRisk: text("model_memorization_risk").default("low"),
  biasRisk: text("bias_risk").default("low"),
  dataLeakageRisk: text("data_leakage_risk").default("low"),
  promptPrivacyControls: boolean("prompt_privacy_controls").default(false),
  outputFiltering: boolean("output_filtering").default(false),
  humanOversight: boolean("human_oversight").default(false),
  aiActCategory: text("ai_act_category"), // minimal, limited, high, unacceptable
  complianceFrameworks: text("compliance_frameworks").array(), // eu_ai_act, iso_42001, nist_ai_rmf
  approvalStatus: text("approval_status").default("pending"), // pending, approved, rejected, review
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  status: statusEnum("status").default("active"),
  reviewDate: timestamp("review_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Privacy Signals - Continuous Compliance Monitoring
export const privacySignals = pgTable("privacy_signals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  signalType: text("signal_type").notNull(), // new_data_store, policy_drift, over_retention, consent_gap, vendor_risk
  severity: text("severity").default("medium"), // low, medium, high, critical
  title: text("title").notNull(),
  description: text("description"),
  affectedEntity: text("affected_entity"), // system, vendor, process name
  affectedEntityType: text("affected_entity_type"), // system, vendor, ropa, consent
  detectedAt: timestamp("detected_at").defaultNow(),
  detectionSource: text("detection_source"), // automated_scan, manual, integration
  currentState: text("current_state"),
  expectedState: text("expected_state"),
  driftPercentage: integer("drift_percentage"),
  impactedDataSubjects: integer("impacted_data_subjects"),
  impactedRecords: integer("impacted_records"),
  recommendedAction: text("recommended_action"),
  assignedTo: varchar("assigned_to"),
  status: statusEnum("status").default("active"),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedAt: timestamp("resolved_at"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Processes & Procedures
export const integrationTypeEnum = pgEnum("integration_type", ["email", "identity", "itsm", "edr", "siem", "vulnerability"]);

export const processes = pgTable("processes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  category: text("category"),
  version: text("version").default("1.0"),
  status: statusEnum("status").default("draft"),
  ownerId: varchar("owner_id"),
  templateId: varchar("template_id"),
  effectiveDate: timestamp("effective_date"),
  reviewDate: timestamp("review_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const processTemplates = pgTable("process_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  content: text("content"),
  category: text("category"),
  icon: text("icon"),
  isGlobal: boolean("is_global").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const procedures = pgTable("procedures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  processId: varchar("process_id").references(() => processes.id),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  category: text("category"),
  procedureType: policyTypeEnum("procedure_type").default("industry"),
  relatedFrameworks: text("related_frameworks").array(),
  relatedControls: text("related_controls").array(),
  version: text("version").default("1.0"),
  status: statusEnum("status").default("draft"),
  ownerId: varchar("owner_id"),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  effectiveDate: timestamp("effective_date"),
  reviewDate: timestamp("review_date"),
  stepByStep: jsonb("step_by_step"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const procedureTemplates = pgTable("procedure_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  content: text("content"),
  category: text("category"),
  icon: text("icon"),
  isGlobal: boolean("is_global").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Integration Settings for tenants
export const integrationSettings = pgTable("integration_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  integrationType: integrationTypeEnum("integration_type").notNull(),
  provider: text("provider").notNull(),
  name: text("name").notNull(),
  isEnabled: boolean("is_enabled").default(false),
  configuration: jsonb("configuration"),
  lastSyncAt: timestamp("last_sync_at"),
  status: statusEnum("status").default("inactive"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Report Templates for compliance reporting
export const reportCategoryEnum = pgEnum("report_category", ["compliance", "risk", "audit", "privacy", "executive", "regulatory", "operational"]);

export const reportTemplates = pgTable("report_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: reportCategoryEnum("category").default("compliance"),
  framework: text("framework"),
  region: text("region"),
  industry: text("industry"),
  roleAccess: text("role_access").array(),
  template: jsonb("template"),
  sections: jsonb("sections"),
  isBuiltIn: boolean("is_built_in").default(true),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const generatedReports = pgTable("generated_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  templateId: varchar("template_id").references(() => reportTemplates.id),
  name: text("name").notNull(),
  description: text("description"),
  generatedBy: varchar("generated_by"),
  format: text("format").default("pdf"),
  status: statusEnum("status").default("pending"),
  data: jsonb("data"),
  fileUrl: text("file_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReportTemplateSchema = createInsertSchema(reportTemplates).omit({ id: true, createdAt: true });
export const insertGeneratedReportSchema = createInsertSchema(generatedReports).omit({ id: true, createdAt: true });

export type ReportTemplate = typeof reportTemplates.$inferSelect;
export type InsertReportTemplate = z.infer<typeof insertReportTemplateSchema>;
export type GeneratedReport = typeof generatedReports.$inferSelect;
export type InsertGeneratedReport = z.infer<typeof insertGeneratedReportSchema>;

export const insertProcessSchema = createInsertSchema(processes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProcessTemplateSchema = createInsertSchema(processTemplates).omit({ id: true, createdAt: true });
export const insertProcedureSchema = createInsertSchema(procedures).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProcedureTemplateSchema = createInsertSchema(procedureTemplates).omit({ id: true, createdAt: true });
export const insertIntegrationSettingSchema = createInsertSchema(integrationSettings).omit({ id: true, createdAt: true, updatedAt: true });

// Privacy Module Insert Schemas
export const insertRopaEntrySchema = createInsertSchema(ropaEntries).omit({ id: true, createdAt: true, updatedAt: true });
export const insertConsentRecordSchema = createInsertSchema(consentRecords).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCookieConsentSchema = createInsertSchema(cookieConsents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDsrRequestSchema = createInsertSchema(dsrRequests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLegalBasisSchema = createInsertSchema(legalBases).omit({ id: true, createdAt: true });
export const insertDsrTypeRefSchema = createInsertSchema(dsrTypesRef).omit({ id: true, createdAt: true });
export const insertCountryFrameworkMappingSchema = createInsertSchema(countryFrameworkMappings).omit({ id: true, createdAt: true });
export const insertBreachIncidentSchema = createInsertSchema(breachIncidents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDpiaSchema = createInsertSchema(dpias).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDataMappingSchema = createInsertSchema(dataMappings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRetentionPolicySchema = createInsertSchema(retentionPolicies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDataDiscoveryResultSchema = createInsertSchema(dataDiscoveryResults).omit({ id: true, createdAt: true });
export const insertPurposeLegalBasisSchema = createInsertSchema(purposeLegalBasis).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCrossBorderTransferSchema = createInsertSchema(crossBorderTransfers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiPrivacyRecordSchema = createInsertSchema(aiPrivacyRecords).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPrivacySignalSchema = createInsertSchema(privacySignals).omit({ id: true, createdAt: true });

export type Process = typeof processes.$inferSelect;
export type InsertProcess = z.infer<typeof insertProcessSchema>;
export type ProcessTemplate = typeof processTemplates.$inferSelect;
export type InsertProcessTemplate = z.infer<typeof insertProcessTemplateSchema>;
export type Procedure = typeof procedures.$inferSelect;
export type InsertProcedure = z.infer<typeof insertProcedureSchema>;
export type ProcedureTemplate = typeof procedureTemplates.$inferSelect;
export type InsertProcedureTemplate = z.infer<typeof insertProcedureTemplateSchema>;
export type IntegrationSetting = typeof integrationSettings.$inferSelect;
export type InsertIntegrationSetting = z.infer<typeof insertIntegrationSettingSchema>;

// Privacy Module Types
export type RopaEntry = typeof ropaEntries.$inferSelect;
export type InsertRopaEntry = z.infer<typeof insertRopaEntrySchema>;
export type ConsentRecord = typeof consentRecords.$inferSelect;
export type InsertConsentRecord = z.infer<typeof insertConsentRecordSchema>;
export type CookieConsent = typeof cookieConsents.$inferSelect;
export type InsertCookieConsent = z.infer<typeof insertCookieConsentSchema>;
export type DsrRequest = typeof dsrRequests.$inferSelect;
export type InsertDsrRequest = z.infer<typeof insertDsrRequestSchema>;
export type LegalBasis = typeof legalBases.$inferSelect;
export type InsertLegalBasis = z.infer<typeof insertLegalBasisSchema>;
export type DsrTypeRef = typeof dsrTypesRef.$inferSelect;
export type CountryFrameworkMapping = typeof countryFrameworkMappings.$inferSelect;
export type InsertCountryFrameworkMapping = z.infer<typeof insertCountryFrameworkMappingSchema>;
export type InsertDsrTypeRef = z.infer<typeof insertDsrTypeRefSchema>;
export type BreachIncident = typeof breachIncidents.$inferSelect;
export type InsertBreachIncident = z.infer<typeof insertBreachIncidentSchema>;
export type Dpia = typeof dpias.$inferSelect;
export type InsertDpia = z.infer<typeof insertDpiaSchema>;
export type DataMapping = typeof dataMappings.$inferSelect;
export type InsertDataMapping = z.infer<typeof insertDataMappingSchema>;
export type RetentionPolicy = typeof retentionPolicies.$inferSelect;
export type InsertRetentionPolicy = z.infer<typeof insertRetentionPolicySchema>;
export type DataDiscoveryResult = typeof dataDiscoveryResults.$inferSelect;
export type InsertDataDiscoveryResult = z.infer<typeof insertDataDiscoveryResultSchema>;
export type PurposeLegalBasis = typeof purposeLegalBasis.$inferSelect;
export type InsertPurposeLegalBasis = z.infer<typeof insertPurposeLegalBasisSchema>;
export type CrossBorderTransfer = typeof crossBorderTransfers.$inferSelect;
export type InsertCrossBorderTransfer = z.infer<typeof insertCrossBorderTransferSchema>;
export type AiPrivacyRecord = typeof aiPrivacyRecords.$inferSelect;
export type InsertAiPrivacyRecord = z.infer<typeof insertAiPrivacyRecordSchema>;
export type PrivacySignal = typeof privacySignals.$inferSelect;
export type InsertPrivacySignal = z.infer<typeof insertPrivacySignalSchema>;

// Activity Logs for tracking real tenant-specific activity
export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  userId: varchar("user_id").references(() => users.id),
  action: text("action").notNull(), // approved, created, updated, deleted, completed, identified, uploaded, scheduled, reviewed
  targetType: text("target_type").notNull(), // policy, risk, control, audit, vendor, evidence, framework
  targetId: varchar("target_id"),
  targetName: text("target_name"),
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, createdAt: true });
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

// =============================================
// TRUST CENTER - Customer-facing compliance portal
// =============================================
export const trustCenterStatusEnum = pgEnum("trust_center_status", ["published", "draft", "archived"]);

export const trustCenterSettings = pgTable("trust_center_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull().unique(),
  isEnabled: boolean("is_enabled").default(false),
  publicUrl: text("public_url"),
  customDomain: text("custom_domain"),
  branding: jsonb("branding"), // logo, colors, fonts
  sections: jsonb("sections"), // which sections to show
  contactEmail: text("contact_email"),
  lastPublished: timestamp("last_published"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const trustCenterCertifications = pgTable("trust_center_certifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  frameworkId: varchar("framework_id").references(() => frameworks.id),
  name: text("name").notNull(),
  certificationBody: text("certification_body"),
  certificateNumber: text("certificate_number"),
  issuedDate: timestamp("issued_date"),
  expiryDate: timestamp("expiry_date"),
  status: trustCenterStatusEnum("status").default("draft"),
  documentUrl: text("document_url"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trustCenterDocuments = pgTable("trust_center_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"), // security, privacy, compliance, legal
  documentUrl: text("document_url"),
  requiresNda: boolean("requires_nda").default(false),
  isPublic: boolean("is_public").default(true),
  downloadCount: integer("download_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// =============================================
// CONTINUOUS CONTROL MONITORING
// =============================================
export const controlMonitorStatusEnum = pgEnum("control_monitor_status", ["healthy", "at_risk", "failing", "not_tested"]);

export const controlMonitors = pgTable("control_monitors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  controlId: varchar("control_id").references(() => controls.id),
  name: text("name").notNull(),
  description: text("description"),
  monitorType: text("monitor_type"), // automated, manual, hybrid
  frequency: text("frequency"), // real-time, daily, weekly, monthly
  status: controlMonitorStatusEnum("status").default("not_tested"),
  lastChecked: timestamp("last_checked"),
  nextCheck: timestamp("next_check"),
  successRate: integer("success_rate").default(0), // 0-100
  alertThreshold: integer("alert_threshold").default(80),
  configuration: jsonb("configuration"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const controlTestResults = pgTable("control_test_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  monitorId: varchar("monitor_id").references(() => controlMonitors.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  status: text("status").notNull(), // passed, failed, warning, skipped
  result: jsonb("result"),
  errorMessage: text("error_message"),
  evidenceCollected: jsonb("evidence_collected"),
  testedAt: timestamp("tested_at").defaultNow(),
  testedBy: varchar("tested_by"), // system or user id
});

export const controlAlerts = pgTable("control_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  monitorId: varchar("monitor_id").references(() => controlMonitors.id),
  controlId: varchar("control_id").references(() => controls.id),
  severity: riskLevelEnum("severity").default("medium"),
  title: text("title").notNull(),
  description: text("description"),
  isAcknowledged: boolean("is_acknowledged").default(false),
  acknowledgedBy: varchar("acknowledged_by"),
  acknowledgedAt: timestamp("acknowledged_at"),
  isResolved: boolean("is_resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// =============================================
// EVIDENCE MANAGEMENT & AUTOMATION
// =============================================
export const evidenceItems = pgTable("evidence_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  controlId: varchar("control_id").references(() => controls.id),
  frameworkId: varchar("framework_id").references(() => frameworks.id),
  auditId: varchar("audit_id").references(() => audits.id),
  taskId: text("task_id"), // Links to specific audit task
  title: text("title").notNull(),
  description: text("description"),
  evidenceType: text("evidence_type"), // document, screenshot, log, config, report
  sourceType: text("source_type"), // manual, automated, integration
  sourceSystem: text("source_system"), // AWS, Azure, Okta, etc.
  fileUrl: text("file_url"),
  filePath: text("file_path"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  hash: text("hash"), // for integrity verification
  collectedAt: timestamp("collected_at").defaultNow(),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  status: statusEnum("status").default("active"),
  // Auditor Review Workflow fields
  reviewStatus: text("review_status").default("pending"), // pending, accepted, rejected, needs_clarification
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  reviewComment: text("review_comment"),
  submittedBy: varchar("submitted_by"),
  submittedAt: timestamp("submitted_at"),
  metadata: jsonb("metadata"),
  collectedBy: varchar("collected_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const evidenceRequests = pgTable("evidence_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  controlId: varchar("control_id").references(() => controls.id),
  auditId: varchar("audit_id").references(() => audits.id),
  evidenceItemId: varchar("evidence_item_id").references(() => evidenceItems.id),
  title: text("title").notNull(),
  description: text("description"),
  requestType: text("request_type").default("clarification"), // clarification, additional, replacement
  requestedBy: varchar("requested_by"),
  assignedTo: varchar("assigned_to"),
  dueDate: timestamp("due_date"),
  status: statusEnum("status").default("pending"),
  priority: riskLevelEnum("priority").default("medium"),
  response: text("response"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// =============================================
// REGULATORY INTELLIGENCE / HORIZON SCANNING
// =============================================
export const regulatoryUpdates = pgTable("regulatory_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  summary: text("summary"),
  fullText: text("full_text"),
  source: text("source"), // regulator name
  sourceUrl: text("source_url"),
  region: text("region"),
  country: text("country"),
  industry: text("industry"),
  frameworks: text("frameworks").array(),
  effectiveDate: timestamp("effective_date"),
  publishedDate: timestamp("published_date"),
  impactLevel: riskLevelEnum("impact_level").default("medium"),
  status: text("status").default("new"), // new, reviewed, actioned, archived
  aiSummary: text("ai_summary"),
  aiRecommendations: jsonb("ai_recommendations"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tenantRegulatoryTracking = pgTable("tenant_regulatory_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  updateId: varchar("update_id").references(() => regulatoryUpdates.id).notNull(),
  status: text("status").default("pending"), // pending, reviewed, implementing, compliant, not_applicable
  assignedTo: varchar("assigned_to"),
  notes: text("notes"),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// =============================================
// RISK QUANTIFICATION
// =============================================
export const riskQuantification = pgTable("risk_quantification", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  riskId: varchar("risk_id").references(() => risks.id),
  annualLossExpectancy: integer("annual_loss_expectancy"), // in USD
  singleLossExpectancy: integer("single_loss_expectancy"),
  annualRateOfOccurrence: integer("annual_rate_of_occurrence"), // percentage
  controlEffectiveness: integer("control_effectiveness"), // 0-100
  residualRisk: integer("residual_risk"), // in USD
  confidenceLevel: integer("confidence_level"), // 0-100
  methodology: text("methodology"), // FAIR, Monte Carlo, etc.
  assumptions: jsonb("assumptions"),
  calculatedAt: timestamp("calculated_at").defaultNow(),
  calculatedBy: varchar("calculated_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// =============================================
// INTEGRATION HUB / CONNECTORS
// =============================================
export const integrationConnectors = pgTable("integration_connectors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category"), // cloud, identity, security, ticketing, hr
  provider: text("provider"), // AWS, Azure, Okta, etc.
  description: text("description"),
  logoUrl: text("logo_url"),
  configSchema: jsonb("config_schema"),
  capabilities: text("capabilities").array(), // evidence, monitoring, users, assets
  isBuiltIn: boolean("is_built_in").default(true),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tenantConnections = pgTable("tenant_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  connectorId: varchar("connector_id").references(() => integrationConnectors.id).notNull(),
  name: text("name").notNull(),
  configuration: jsonb("configuration"), // encrypted credentials
  status: text("status").default("pending"), // pending, connected, error, disabled
  lastSync: timestamp("last_sync"),
  syncFrequency: text("sync_frequency"), // real-time, hourly, daily
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// =============================================
// ESG (Environmental, Social, Governance) MODULE
// =============================================
export const esgCategories = pgTable("esg_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // environmental, social, governance
  description: text("description"),
  metrics: jsonb("metrics"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const esgMetrics = pgTable("esg_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  categoryId: varchar("category_id").references(() => esgCategories.id),
  name: text("name").notNull(),
  description: text("description"),
  unit: text("unit"), // kWh, tCO2e, hours, count
  targetValue: integer("target_value"),
  currentValue: integer("current_value"),
  previousValue: integer("previous_value"),
  period: text("period"), // Q1 2024, FY 2024
  trend: text("trend"), // improving, declining, stable
  status: text("status").default("on_track"), // on_track, at_risk, off_track
  evidence: jsonb("evidence"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const esgInitiatives = pgTable("esg_initiatives", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  categoryId: varchar("category_id").references(() => esgCategories.id),
  title: text("title").notNull(),
  description: text("description"),
  owner: varchar("owner"),
  startDate: timestamp("start_date"),
  targetDate: timestamp("target_date"),
  status: statusEnum("status").default("pending"),
  progress: integer("progress").default(0), // 0-100
  impact: jsonb("impact"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ESG Frameworks (GRI, SASB, TCFD, CDP, UN SDG, etc.)
export const esgFrameworks = pgTable("esg_frameworks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull(), // GRI, SASB, TCFD, CDP, CSRD, UN-SDG
  version: text("version"),
  description: text("description"),
  category: text("category"), // reporting, disclosure, goals
  region: text("region"), // global, eu, us
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ESG Framework Requirements/Disclosures
export const esgFrameworkRequirements = pgTable("esg_framework_requirements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  frameworkId: varchar("framework_id").references(() => esgFrameworks.id).notNull(),
  code: text("code").notNull(), // GRI 302-1, SASB-EM-EP-110a.1
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"), // environmental, social, governance
  subcategory: text("subcategory"), // energy, water, emissions, diversity
  dataType: text("data_type"), // quantitative, qualitative, narrative
  unit: text("unit"),
  guidance: text("guidance"),
  isRequired: boolean("is_required").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Carbon Footprint / Emissions Tracking
export const esgCarbonEmissions = pgTable("esg_carbon_emissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  reportingPeriod: text("reporting_period").notNull(), // FY2024, Q1-2024
  scope: text("scope").notNull(), // scope1, scope2, scope3
  category: text("category"), // For Scope 3: purchased goods, transportation, etc.
  source: text("source"), // natural gas, electricity, fleet, travel
  emissionsAmount: integer("emissions_amount"), // in tCO2e
  unit: text("unit").default("tCO2e"),
  methodology: text("methodology"), // GHG Protocol, ISO 14064
  verificationStatus: text("verification_status"), // unverified, internal, third-party
  baselineYear: text("baseline_year"),
  targetReduction: integer("target_reduction"), // percentage
  notes: text("notes"),
  evidence: jsonb("evidence"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Energy Consumption Tracking
export const esgEnergyData = pgTable("esg_energy_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  reportingPeriod: text("reporting_period").notNull(),
  energyType: text("energy_type").notNull(), // electricity, natural_gas, fuel, renewable
  source: text("source"), // grid, solar, wind, biomass
  consumption: integer("consumption"),
  unit: text("unit").default("MWh"),
  cost: integer("cost"),
  costCurrency: text("cost_currency").default("USD"),
  renewablePercentage: integer("renewable_percentage"),
  location: text("location"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Water Usage Tracking
export const esgWaterData = pgTable("esg_water_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  reportingPeriod: text("reporting_period").notNull(),
  waterType: text("water_type").notNull(), // withdrawal, consumption, discharge, recycled
  source: text("source"), // municipal, groundwater, surface, rainwater
  volume: integer("volume"),
  unit: text("unit").default("cubic_meters"),
  waterStressArea: boolean("water_stress_area").default(false),
  location: text("location"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Waste Management Tracking
export const esgWasteData = pgTable("esg_waste_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  reportingPeriod: text("reporting_period").notNull(),
  wasteType: text("waste_type").notNull(), // hazardous, non_hazardous, electronic, organic
  disposalMethod: text("disposal_method"), // recycled, landfill, incinerated, composted
  weight: integer("weight"),
  unit: text("unit").default("metric_tons"),
  recyclingRate: integer("recycling_rate"),
  location: text("location"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Diversity & Inclusion Data
export const esgDiversityData = pgTable("esg_diversity_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  reportingPeriod: text("reporting_period").notNull(),
  category: text("category").notNull(), // gender, ethnicity, age, disability
  level: text("level"), // board, executive, management, workforce
  dimension: text("dimension"), // male, female, non_binary, etc.
  count: integer("count"),
  percentage: integer("percentage"),
  payGapPercentage: integer("pay_gap_percentage"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Health & Safety Data
export const esgHealthSafetyData = pgTable("esg_health_safety_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  reportingPeriod: text("reporting_period").notNull(),
  metricType: text("metric_type").notNull(), // incidents, injuries, fatalities, near_misses, training_hours
  category: text("category"), // ltir, trir, fatality_rate
  value: integer("value"),
  unit: text("unit"),
  workforceType: text("workforce_type"), // employees, contractors, all
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Board Composition & Governance
export const esgBoardData = pgTable("esg_board_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  reportingPeriod: text("reporting_period").notNull(),
  metricType: text("metric_type").notNull(), // independence, diversity, tenure, meetings
  dimension: text("dimension"),
  value: integer("value"),
  unit: text("unit"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Materiality Assessment
export const esgMaterialityTopics = pgTable("esg_materiality_topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // environmental, social, governance
  stakeholderImportance: integer("stakeholder_importance"), // 1-10
  businessImpact: integer("business_impact"), // 1-10
  isMaterial: boolean("is_material").default(false),
  priority: text("priority"), // high, medium, low
  relatedFrameworks: jsonb("related_frameworks"), // GRI codes, SASB codes
  assessmentDate: timestamp("assessment_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ESG Targets / Net Zero Goals
export const esgTargets = pgTable("esg_targets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // environmental, social, governance
  metricType: text("metric_type"), // emissions, energy, water, diversity
  baselineYear: text("baseline_year"),
  baselineValue: integer("baseline_value"),
  targetYear: text("target_year"),
  targetValue: integer("target_value"),
  currentValue: integer("current_value"),
  unit: text("unit"),
  status: text("status").default("on_track"), // on_track, at_risk, achieved, missed
  isNetZero: boolean("is_net_zero").default(false),
  isSBTi: boolean("is_sbti").default(false), // Science Based Targets initiative
  progress: integer("progress").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ESG Disclosures / Reports
export const esgDisclosures = pgTable("esg_disclosures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  title: text("title").notNull(),
  reportType: text("report_type").notNull(), // sustainability_report, annual_report, cdp_response, tcfd_report
  frameworkId: varchar("framework_id").references(() => esgFrameworks.id),
  reportingPeriod: text("reporting_period").notNull(),
  status: statusEnum("status").default("draft"),
  publishedDate: timestamp("published_date"),
  dueDate: timestamp("due_date"),
  fileUrl: text("file_url"),
  assuranceLevel: text("assurance_level"), // none, limited, reasonable
  assuranceProvider: text("assurance_provider"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Supply Chain ESG
export const esgSupplyChain = pgTable("esg_supply_chain", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  vendorName: text("vendor_name"),
  assessmentDate: timestamp("assessment_date"),
  environmentalScore: integer("environmental_score"), // 0-100
  socialScore: integer("social_score"), // 0-100
  governanceScore: integer("governance_score"), // 0-100
  overallScore: integer("overall_score"), // 0-100
  riskLevel: text("risk_level"), // low, medium, high, critical
  hasCodeOfConduct: boolean("has_code_of_conduct").default(false),
  hasAuditRight: boolean("has_audit_right").default(false),
  certifications: jsonb("certifications"), // ISO 14001, SA8000, etc.
  issues: jsonb("issues"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ESG Incidents
export const esgIncidents = pgTable("esg_incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // environmental, social, governance
  subcategory: text("subcategory"), // spill, injury, ethics_violation, data_breach
  severity: text("severity"), // low, medium, high, critical
  incidentDate: timestamp("incident_date"),
  reportedDate: timestamp("reported_date"),
  status: statusEnum("status").default("open"),
  location: text("location"),
  rootCause: text("root_cause"),
  correctiveActions: text("corrective_actions"),
  financialImpact: integer("financial_impact"),
  regulatoryNotification: boolean("regulatory_notification").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ESG Ratings from external agencies
export const esgRatings = pgTable("esg_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  ratingAgency: text("rating_agency").notNull(), // MSCI, Sustainalytics, CDP, ISS, S&P
  ratingType: text("rating_type"), // overall, environmental, social, governance
  rating: text("rating"), // AAA, AA, A, BBB, etc.
  score: integer("score"), // numeric score if applicable
  maxScore: integer("max_score"),
  ratingDate: timestamp("rating_date"),
  previousRating: text("previous_rating"),
  previousScore: integer("previous_score"),
  industryRank: integer("industry_rank"),
  industryTotal: integer("industry_total"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// =============================================
// BUSINESS CONTINUITY MODULE
// =============================================
export const bcpPlans = pgTable("bcp_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  scope: text("scope"),
  version: text("version").default("1.0"),
  status: statusEnum("status").default("draft"),
  owner: varchar("owner"),
  lastReviewDate: timestamp("last_review_date"),
  nextReviewDate: timestamp("next_review_date"),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  sections: jsonb("sections"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const businessImpactAnalysis = pgTable("business_impact_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  bcpPlanId: varchar("bcp_plan_id").references(() => bcpPlans.id),
  processName: text("process_name").notNull(),
  department: text("department"),
  criticality: riskLevelEnum("criticality").default("medium"),
  rto: integer("rto"), // Recovery Time Objective in hours
  rpo: integer("rpo"), // Recovery Point Objective in hours
  mtpd: integer("mtpd"), // Maximum Tolerable Period of Disruption
  dependencies: jsonb("dependencies"),
  impactAssessment: jsonb("impact_assessment"),
  recoveryStrategy: text("recovery_strategy"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bcpTests = pgTable("bcp_tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  bcpPlanId: varchar("bcp_plan_id").references(() => bcpPlans.id),
  testType: text("test_type"), // tabletop, walkthrough, simulation, full
  scheduledDate: timestamp("scheduled_date"),
  conductedDate: timestamp("conducted_date"),
  status: statusEnum("status").default("pending"),
  participants: jsonb("participants"),
  scenarios: jsonb("scenarios"),
  findings: jsonb("findings"),
  lessonsLearned: text("lessons_learned"),
  nextActions: jsonb("next_actions"),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// BC/DR Plan Catalog - Global library of plan templates
export const bcpPlanCatalog = pgTable("bcp_plan_catalog", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // IT DR, Business Continuity, Crisis Management, Pandemic, Cyber Incident
  planType: text("plan_type"), // disaster_recovery, continuity, crisis, pandemic, cyber
  applicableIndustries: jsonb("applicable_industries"), // Industries this plan suits
  applicableScenarios: jsonb("applicable_scenarios"), // Scenarios covered
  sections: jsonb("sections"), // Predefined sections/structure
  checklistItems: jsonb("checklist_items"), // Key items to include
  rtoGuidance: text("rto_guidance"), // RTO recommendation
  rpoGuidance: text("rpo_guidance"), // RPO recommendation
  relatedFrameworks: text("related_frameworks").array(),
  aiEnriched: boolean("ai_enriched").default(false),
  aiTips: jsonb("ai_tips"), // AI-generated tips for this plan type
  isGlobal: boolean("is_global").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// BC/DR Test Templates - Workflows for different test types
export const bcpTestTemplates = pgTable("bcp_test_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  testType: text("test_type").notNull(), // tabletop, walkthrough, simulation, full_interruption
  difficulty: text("difficulty"), // beginner, intermediate, advanced
  duration: text("duration"), // e.g., "2-4 hours", "1 day", "1 week"
  participantsRequired: jsonb("participants_required"), // Roles needed
  scenarios: jsonb("scenarios"), // Pre-built scenarios
  situations: jsonb("situations"), // Different situations to test
  objectives: jsonb("objectives"), // Test objectives
  evaluationCriteria: jsonb("evaluation_criteria"), // Success metrics
  checklist: jsonb("checklist"), // Step-by-step checklist
  aiTips: jsonb("ai_tips"), // AI-generated tips
  isGlobal: boolean("is_global").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// =============================================
// COMPREHENSIVE BCM MODULE - Enterprise Business Continuity Management
// =============================================

// BCM Service Tiers Enum
export const bcmServiceTierEnum = pgEnum("bcm_service_tier", ["tier_0", "tier_1", "tier_2", "tier_3"]);
export const bcmStrategyTypeEnum = pgEnum("bcm_strategy_type", ["active_active", "active_passive", "manual_workaround", "backup_based", "pilot_light", "warm_standby", "hot_standby"]);
export const bcmIncidentSeverityEnum = pgEnum("bcm_incident_severity", ["critical", "major", "minor", "informational"]);
export const bcmActivationStatusEnum = pgEnum("bcm_activation_status", ["not_activated", "monitoring", "activated", "recovery_in_progress", "recovered", "closed"]);

// Business Services - Core entity for service dependency mapping
export const bcmServices = pgTable("bcm_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  owner: varchar("owner"),
  department: text("department"),
  serviceTier: bcmServiceTierEnum("service_tier").default("tier_2"),
  serviceType: text("service_type"), // business_critical, operational, support
  rto: integer("rto"), // Recovery Time Objective in minutes
  rpo: integer("rpo"), // Recovery Point Objective in minutes
  mtpd: integer("mtpd"), // Maximum Tolerable Period of Disruption in hours
  financialImpactPerHour: integer("financial_impact_per_hour"),
  regulatoryImpact: text("regulatory_impact"), // none, low, medium, high, critical
  customerImpact: text("customer_impact"),
  brandImpact: text("brand_impact"),
  operationalImpact: text("operational_impact"),
  bcStrategy: bcmStrategyTypeEnum("bc_strategy"),
  drStrategy: bcmStrategyTypeEnum("dr_strategy"),
  primaryLocation: varchar("primary_location"),
  secondaryLocation: varchar("secondary_location"),
  vendorDependencies: jsonb("vendor_dependencies"), // Array of vendor IDs
  applicationDependencies: jsonb("application_dependencies"),
  infrastructureDependencies: jsonb("infrastructure_dependencies"),
  peopleDependencies: jsonb("people_dependencies"),
  dataClassification: text("data_classification"),
  lastBiaDate: timestamp("last_bia_date"),
  nextBiaDate: timestamp("next_bia_date"),
  biaStatus: text("bia_status").default("pending"), // pending, in_progress, completed, needs_review
  aiEnriched: boolean("ai_enriched").default(false),
  aiInsights: jsonb("ai_insights"),
  metadata: jsonb("metadata"),
  status: statusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service Dependencies - Detailed dependency mapping
export const bcmServiceDependencies = pgTable("bcm_service_dependencies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  sourceServiceId: varchar("source_service_id").references(() => bcmServices.id).notNull(),
  targetServiceId: varchar("target_service_id").references(() => bcmServices.id),
  dependencyType: text("dependency_type").notNull(), // application, infrastructure, vendor, people, location, data
  dependencyName: text("dependency_name"),
  externalSystem: text("external_system"), // For external dependencies not in services
  criticality: riskLevelEnum("criticality").default("medium"),
  failoverCapability: boolean("failover_capability").default(false),
  failoverTime: integer("failover_time"), // Minutes to failover
  singlePointOfFailure: boolean("single_point_of_failure").default(false),
  alternativeExists: boolean("alternative_exists").default(false),
  alternativeDescription: text("alternative_description"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// BIA Questionnaire Templates
export const bcmBiaTemplates = pgTable("bcm_bia_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  targetAudience: text("target_audience"), // business, it, operations, executive
  questions: jsonb("questions").notNull(), // Array of BIA questions
  scoringMatrix: jsonb("scoring_matrix"), // How to calculate impact scores
  rtoCalculationLogic: jsonb("rto_calculation_logic"),
  rpoCalculationLogic: jsonb("rpo_calculation_logic"),
  mtpdCalculationLogic: jsonb("mtpd_calculation_logic"),
  tieringRules: jsonb("tiering_rules"), // Auto-tiering based on scores
  isGlobal: boolean("is_global").default(true),
  status: statusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// BIA Responses - Actual responses from assessments
export const bcmBiaResponses = pgTable("bcm_bia_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  serviceId: varchar("service_id").references(() => bcmServices.id).notNull(),
  templateId: varchar("template_id").references(() => bcmBiaTemplates.id),
  respondent: varchar("respondent"),
  respondentRole: text("respondent_role"),
  responses: jsonb("responses").notNull(), // Question-answer pairs
  calculatedRto: integer("calculated_rto"),
  calculatedRpo: integer("calculated_rpo"),
  calculatedMtpd: integer("calculated_mtpd"),
  financialImpactScore: integer("financial_impact_score"),
  regulatoryImpactScore: integer("regulatory_impact_score"),
  customerImpactScore: integer("customer_impact_score"),
  brandImpactScore: integer("brand_impact_score"),
  overallImpactScore: integer("overall_impact_score"),
  recommendedTier: bcmServiceTierEnum("recommended_tier"),
  aiAnalysis: jsonb("ai_analysis"),
  validatedBy: varchar("validated_by"),
  validatedAt: timestamp("validated_at"),
  status: text("status").default("draft"), // draft, submitted, validated, approved
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// BCM Strategies - Strategy definitions per service
export const bcmStrategies = pgTable("bcm_strategies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  serviceId: varchar("service_id").references(() => bcmServices.id).notNull(),
  strategyType: text("strategy_type").notNull(), // bc, dr, cyber
  strategyName: text("strategy_name").notNull(),
  description: text("description"),
  recoveryApproach: bcmStrategyTypeEnum("recovery_approach"),
  targetRto: integer("target_rto"),
  targetRpo: integer("target_rpo"),
  estimatedCost: integer("estimated_cost"),
  annualCost: integer("annual_cost"),
  resources: jsonb("resources"), // Required resources
  procedures: jsonb("procedures"), // Step-by-step procedures
  prerequisites: jsonb("prerequisites"),
  testingRequirements: jsonb("testing_requirements"),
  gapAnalysis: jsonb("gap_analysis"), // Current vs target gaps
  aiRecommendations: jsonb("ai_recommendations"),
  isOverEngineered: boolean("is_over_engineered").default(false),
  isUnderProtected: boolean("is_under_protected").default(false),
  status: statusEnum("status").default("draft"),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// BCM Incidents - Incidents that may trigger BCM activation
export const bcmIncidents = pgTable("bcm_incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  incidentNumber: text("incident_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  severity: bcmIncidentSeverityEnum("severity").default("minor"),
  category: text("category"), // infrastructure, cyber, natural_disaster, vendor, pandemic
  affectedServices: jsonb("affected_services"), // Array of service IDs
  affectedLocations: jsonb("affected_locations"),
  estimatedImpact: text("estimated_impact"),
  activationStatus: bcmActivationStatusEnum("activation_status").default("not_activated"),
  activatedPlans: jsonb("activated_plans"), // Array of plan IDs
  commanderAssigned: varchar("commander_assigned"),
  escalationLevel: integer("escalation_level").default(0),
  externalReference: text("external_reference"), // ServiceNow/Jira ticket
  timeline: jsonb("timeline"), // Array of timeline events
  decisionLog: jsonb("decision_log"), // Key decisions made
  actualRto: integer("actual_rto"), // Actual recovery time achieved
  lessonsLearned: text("lessons_learned"),
  postIncidentReview: jsonb("post_incident_review"),
  reportedBy: varchar("reported_by"),
  reportedAt: timestamp("reported_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),
  status: text("status").default("open"), // open, investigating, activated, recovering, resolved, closed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// BCM Activation Workflows
export const bcmActivationWorkflows = pgTable("bcm_activation_workflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  triggerConditions: jsonb("trigger_conditions"), // Severity, type, affected services
  decisionTree: jsonb("decision_tree"), // Decision logic
  escalationMatrix: jsonb("escalation_matrix"), // Who to contact at each level
  notificationTemplates: jsonb("notification_templates"),
  autoActivationRules: jsonb("auto_activation_rules"),
  approvalRequired: boolean("approval_required").default(true),
  approvers: jsonb("approvers"),
  status: statusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// BCM Recovery Teams
export const bcmRecoveryTeams = pgTable("bcm_recovery_teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  teamType: text("team_type"), // crisis_management, it_recovery, business_recovery, communications
  primaryLead: varchar("primary_lead"),
  alternateLead: varchar("alternate_lead"),
  members: jsonb("members"), // Array of team members with roles
  responsibilities: jsonb("responsibilities"),
  contactInfo: jsonb("contact_info"),
  activationProcedure: text("activation_procedure"),
  meetingLocation: text("meeting_location"),
  virtualMeetingDetails: jsonb("virtual_meeting_details"),
  equipment: jsonb("equipment"), // Required equipment
  status: statusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// BCM Skills Matrix
export const bcmSkillsMatrix = pgTable("bcm_skills_matrix", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  skillName: text("skill_name").notNull(),
  skillCategory: text("skill_category"), // technical, business, leadership, communication
  proficiencyLevel: text("proficiency_level"), // basic, intermediate, advanced, expert
  certifications: jsonb("certifications"),
  lastAssessedDate: timestamp("last_assessed_date"),
  backupFor: jsonb("backup_for"), // Array of user IDs this person can backup
  canBackup: jsonb("can_backup"), // Array of role names this person can fill
  availabilityStatus: text("availability_status").default("available"), // available, limited, unavailable
  remoteWorkCapable: boolean("remote_work_capable").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// BCM Locations
export const bcmLocations = pgTable("bcm_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  locationType: text("location_type"), // primary, secondary, dr_site, cloud_region
  address: text("address"),
  city: text("city"),
  country: text("country"),
  region: text("region"),
  coordinates: jsonb("coordinates"), // lat/long
  capacity: integer("capacity"),
  currentOccupancy: integer("current_occupancy"),
  criticalInfrastructure: jsonb("critical_infrastructure"),
  riskFactors: jsonb("risk_factors"), // Natural disasters, political, etc.
  alternateLocations: jsonb("alternate_locations"), // Fallback locations
  travelTimeFromPrimary: integer("travel_time_from_primary"), // Minutes
  remoteWorkPercentage: integer("remote_work_percentage"),
  activationTime: integer("activation_time"), // Minutes to activate
  lastTestedDate: timestamp("last_tested_date"),
  status: statusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// BCM Test Results - Detailed test execution results
export const bcmTestResults = pgTable("bcm_test_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  testId: varchar("test_id").references(() => bcpTests.id).notNull(),
  serviceId: varchar("service_id").references(() => bcmServices.id),
  plannedRto: integer("planned_rto"),
  achievedRto: integer("achieved_rto"),
  plannedRpo: integer("planned_rpo"),
  achievedRpo: integer("achieved_rpo"),
  objectivesMet: jsonb("objectives_met"), // Which objectives passed/failed
  scenarioResults: jsonb("scenario_results"),
  participantFeedback: jsonb("participant_feedback"),
  issuesIdentified: jsonb("issues_identified"),
  correctiveActions: jsonb("corrective_actions"),
  evidenceLinks: jsonb("evidence_links"), // Links to evidence files
  rtoGapPercentage: integer("rto_gap_percentage"),
  rpoGapPercentage: integer("rpo_gap_percentage"),
  overallScore: integer("overall_score"), // 0-100
  passFailStatus: text("pass_fail_status"), // pass, partial, fail
  riskReRatingRequired: boolean("risk_re_rating_required").default(false),
  recommendations: jsonb("recommendations"),
  aiAnalysis: jsonb("ai_analysis"),
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// BCM Vendor Resilience
export const bcmVendorResilience = pgTable("bcm_vendor_resilience", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  vendorName: text("vendor_name"),
  criticalityRating: riskLevelEnum("criticality_rating").default("medium"),
  servicesDependent: jsonb("services_dependent"), // Array of service IDs
  hasBcp: boolean("has_bcp").default(false),
  bcpDocumentLink: text("bcp_document_link"),
  bcpLastReviewDate: timestamp("bcp_last_review_date"),
  hasDrp: boolean("has_drp").default(false),
  drpDocumentLink: text("drp_document_link"),
  contractedRto: integer("contracted_rto"),
  contractedRpo: integer("contracted_rpo"),
  slaMismatch: boolean("sla_mismatch").default(false),
  slaMismatchDetails: text("sla_mismatch_details"),
  singlePointOfFailure: boolean("single_point_of_failure").default(false),
  alternativeVendors: jsonb("alternative_vendors"),
  exitStrategy: text("exit_strategy"),
  exitTimeline: integer("exit_timeline"), // Days
  lastAssessmentDate: timestamp("last_assessment_date"),
  resilienceScore: integer("resilience_score"), // 0-100
  aiRiskAnalysis: jsonb("ai_risk_analysis"),
  status: statusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// BCM Cyber Recovery Plans
export const bcmCyberRecoveryPlans = pgTable("bcm_cyber_recovery_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  scenarioType: text("scenario_type"), // ransomware, data_breach, ddos, insider_threat
  affectedSystems: jsonb("affected_systems"),
  isolationProcedures: jsonb("isolation_procedures"),
  cleanRoomLocation: text("clean_room_location"),
  cleanRoomStatus: text("clean_room_status"), // not_setup, configured, tested, ready
  immutableBackupLocations: jsonb("immutable_backup_locations"),
  backupValidationStatus: text("backup_validation_status"),
  lastBackupValidation: timestamp("last_backup_validation"),
  identityRecoverySteps: jsonb("identity_recovery_steps"),
  networkRecoverySteps: jsonb("network_recovery_steps"),
  dataRecoverySteps: jsonb("data_recovery_steps"),
  applicationRecoverySteps: jsonb("application_recovery_steps"),
  communicationPlan: jsonb("communication_plan"),
  regulatoryNotifications: jsonb("regulatory_notifications"),
  forensicsProcess: jsonb("forensics_process"),
  estimatedRecoveryTime: integer("estimated_recovery_time"), // Hours
  dependencies: jsonb("dependencies"),
  testingSchedule: jsonb("testing_schedule"),
  lastTestedDate: timestamp("last_tested_date"),
  status: statusEnum("status").default("draft"),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// BCM Compliance Mappings
export const bcmComplianceMappings = pgTable("bcm_compliance_mappings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  bcmArtifactType: text("bcm_artifact_type").notNull(), // plan, test, bia, strategy
  bcmArtifactId: varchar("bcm_artifact_id").notNull(),
  frameworkId: varchar("framework_id"),
  frameworkName: text("framework_name"), // ISO 22301, DORA, NIS2, SAMA, etc.
  controlReference: text("control_reference"),
  controlDescription: text("control_description"),
  evidenceLinks: jsonb("evidence_links"),
  complianceStatus: text("compliance_status").default("not_assessed"), // compliant, partial, non_compliant, not_assessed
  lastAssessedDate: timestamp("last_assessed_date"),
  assessedBy: varchar("assessed_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// BCM Dashboard Metrics
export const bcmMetrics = pgTable("bcm_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  metricDate: timestamp("metric_date").notNull(),
  totalServices: integer("total_services").default(0),
  tier0Services: integer("tier0_services").default(0),
  tier1Services: integer("tier1_services").default(0),
  tier2Services: integer("tier2_services").default(0),
  tier3Services: integer("tier3_services").default(0),
  servicesMeetingRto: integer("services_meeting_rto").default(0),
  servicesMeetingRpo: integer("services_meeting_rpo").default(0),
  singlePointsOfFailure: integer("single_points_of_failure").default(0),
  untestedPlans: integer("untested_plans").default(0),
  overdueTests: integer("overdue_tests").default(0),
  vendorResilienceScore: integer("vendor_resilience_score").default(0),
  cyberRecoveryReadiness: integer("cyber_recovery_readiness").default(0),
  biaCompletionRate: integer("bia_completion_rate").default(0),
  planCompletionRate: integer("plan_completion_rate").default(0),
  testPassRate: integer("test_pass_rate").default(0),
  avgRtoGap: integer("avg_rto_gap").default(0),
  avgRpoGap: integer("avg_rpo_gap").default(0),
  topRisks: jsonb("top_risks"),
  aiInsights: jsonb("ai_insights"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Risk Catalog - Global library of risks for use in risk registers
export const riskCatalog = pgTable("risk_catalog", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull(), // e.g., RC-IT-001, RC-OPS-001
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // IT, Operational, Financial, Strategic, Compliance, etc.
  subcategory: text("subcategory"), // More specific classification
  riskType: text("risk_type"), // threat, vulnerability, impact
  defaultLikelihood: integer("default_likelihood").default(3),
  defaultImpact: integer("default_impact").default(3),
  potentialCauses: text("potential_causes").array(),
  potentialConsequences: text("potential_consequences").array(),
  suggestedControls: text("suggested_controls").array(),
  relatedFrameworks: text("related_frameworks").array(),
  keywords: text("keywords").array(),
  aiEnriched: boolean("ai_enriched").default(false),
  aiEnrichedData: jsonb("ai_enriched_data"), // AI-generated comprehensive analysis
  isGlobal: boolean("is_global").default(true), // true = available to all tenants
  tenantId: varchar("tenant_id").references(() => tenants.id), // null for global risks
  status: statusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Risk Register Templates - Globally accepted and custom templates
export const riskRegisterTemplates = pgTable("risk_register_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(), // e.g., TMPL-IT, TMPL-ISO, TMPL-NIST
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"), // IT, Enterprise, Industry-specific, Custom
  standard: text("standard"), // ISO 31000, NIST, COSO, FAIR, Custom
  columns: jsonb("columns").notNull(), // Array of column definitions
  defaultFields: jsonb("default_fields"), // Pre-populated field mappings
  riskMatrix: jsonb("risk_matrix"), // Custom risk matrix configuration
  applicableOrganizations: jsonb("applicable_organizations"), // Organization types this template suits
  applicableRegions: jsonb("applicable_regions"), // Geographic regions where applicable
  applicableFrameworks: jsonb("applicable_frameworks"), // Compatible compliance frameworks
  isGlobal: boolean("is_global").default(true),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tenant Risk Register Instances - Per-tenant risk registers using templates
export const tenantRiskRegisters = pgTable("tenant_risk_registers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  templateId: varchar("template_id").references(() => riskRegisterTemplates.id),
  name: text("name").notNull(),
  description: text("description"),
  scope: text("scope"), // Department, Project, Enterprise-wide
  status: statusEnum("status").default("active"),
  reviewFrequency: text("review_frequency"), // Monthly, Quarterly, Annually
  lastReviewDate: timestamp("last_review_date"),
  nextReviewDate: timestamp("next_review_date"),
  ownerId: varchar("owner_id").references(() => users.id),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Risk Register Entries - Individual risks in a tenant's risk register
export const riskRegisterEntries = pgTable("risk_register_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  registerId: varchar("register_id").references(() => tenantRiskRegisters.id).notNull(),
  catalogRiskId: varchar("catalog_risk_id").references(() => riskCatalog.id), // Link to risk catalog
  riskId: text("risk_id"), // Custom risk ID within the register
  assetOrProcess: text("asset_or_process"),
  category: text("category"),
  owner: varchar("owner").references(() => users.id),
  custodian: varchar("custodian"),
  location: text("location"),
  confidentiality: integer("confidentiality").default(3), // C score 1-5
  integrity: integer("integrity").default(3), // I score 1-5
  availability: integer("availability").default(3), // A score 1-5
  ciaScore: integer("cia_score"),
  threat: text("threat"),
  vulnerability: text("vulnerability"),
  inherentLikelihood: integer("inherent_likelihood").default(3),
  inherentImpact: integer("inherent_impact").default(3),
  inherentRiskScore: integer("inherent_risk_score"),
  existingControls: text("existing_controls").array(),
  controlReferences: text("control_references").array(), // ISO 27001, NIST etc.
  residualLikelihood: integer("residual_likelihood").default(2),
  residualImpact: integer("residual_impact").default(2),
  residualRiskScore: integer("residual_risk_score"),
  recommendedActions: text("recommended_actions"),
  managementResponse: text("management_response"),
  treatmentPlan: text("treatment_plan"), // Accept, Mitigate, Transfer, Avoid
  treatmentStatus: statusEnum("treatment_status").default("pending"),
  targetDate: timestamp("target_date"),
  completedDate: timestamp("completed_date"),
  customFields: jsonb("custom_fields"), // Template-specific additional fields
  status: statusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for new tables
export const insertRiskCatalogSchema = createInsertSchema(riskCatalog).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRiskRegisterTemplateSchema = createInsertSchema(riskRegisterTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTenantRiskRegisterSchema = createInsertSchema(tenantRiskRegisters).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRiskRegisterEntrySchema = createInsertSchema(riskRegisterEntries).omit({ id: true, createdAt: true, updatedAt: true });

export const insertTrustCenterSettingsSchema = createInsertSchema(trustCenterSettings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTrustCenterCertificationSchema = createInsertSchema(trustCenterCertifications).omit({ id: true, createdAt: true });
export const insertTrustCenterDocumentSchema = createInsertSchema(trustCenterDocuments).omit({ id: true, createdAt: true });
export const insertControlMonitorSchema = createInsertSchema(controlMonitors).omit({ id: true, createdAt: true, updatedAt: true });
export const insertControlTestResultSchema = createInsertSchema(controlTestResults).omit({ id: true });
export const insertControlAlertSchema = createInsertSchema(controlAlerts).omit({ id: true, createdAt: true });
export const insertEvidenceItemSchema = createInsertSchema(evidenceItems).omit({ id: true, createdAt: true });
export const insertEvidenceRequestSchema = createInsertSchema(evidenceRequests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRegulatoryUpdateSchema = createInsertSchema(regulatoryUpdates).omit({ id: true, createdAt: true });
export const insertTenantRegulatoryTrackingSchema = createInsertSchema(tenantRegulatoryTracking).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRiskQuantificationSchema = createInsertSchema(riskQuantification).omit({ id: true, createdAt: true });
export const insertIntegrationConnectorSchema = createInsertSchema(integrationConnectors).omit({ id: true, createdAt: true });
export const insertTenantConnectionSchema = createInsertSchema(tenantConnections).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEsgCategorySchema = createInsertSchema(esgCategories).omit({ id: true, createdAt: true });
export const insertEsgMetricSchema = createInsertSchema(esgMetrics).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEsgInitiativeSchema = createInsertSchema(esgInitiatives).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEsgFrameworkSchema = createInsertSchema(esgFrameworks).omit({ id: true, createdAt: true });
export const insertEsgFrameworkRequirementSchema = createInsertSchema(esgFrameworkRequirements).omit({ id: true, createdAt: true });
export const insertEsgCarbonEmissionsSchema = createInsertSchema(esgCarbonEmissions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEsgEnergyDataSchema = createInsertSchema(esgEnergyData).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEsgWaterDataSchema = createInsertSchema(esgWaterData).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEsgWasteDataSchema = createInsertSchema(esgWasteData).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEsgDiversityDataSchema = createInsertSchema(esgDiversityData).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEsgHealthSafetyDataSchema = createInsertSchema(esgHealthSafetyData).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEsgBoardDataSchema = createInsertSchema(esgBoardData).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEsgMaterialityTopicsSchema = createInsertSchema(esgMaterialityTopics).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEsgTargetsSchema = createInsertSchema(esgTargets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEsgDisclosuresSchema = createInsertSchema(esgDisclosures).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEsgSupplyChainSchema = createInsertSchema(esgSupplyChain).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEsgIncidentsSchema = createInsertSchema(esgIncidents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEsgRatingsSchema = createInsertSchema(esgRatings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBcpPlanSchema = createInsertSchema(bcpPlans).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBusinessImpactAnalysisSchema = createInsertSchema(businessImpactAnalysis).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBcpTestSchema = createInsertSchema(bcpTests).omit({ id: true, createdAt: true });
export const insertBcpPlanCatalogSchema = createInsertSchema(bcpPlanCatalog).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBcpTestTemplateSchema = createInsertSchema(bcpTestTemplates).omit({ id: true, createdAt: true, updatedAt: true });

// Comprehensive BCM Module Insert Schemas
export const insertBcmServiceSchema = createInsertSchema(bcmServices).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBcmServiceDependencySchema = createInsertSchema(bcmServiceDependencies).omit({ id: true, createdAt: true });
export const insertBcmBiaTemplateSchema = createInsertSchema(bcmBiaTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBcmBiaResponseSchema = createInsertSchema(bcmBiaResponses).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBcmStrategySchema = createInsertSchema(bcmStrategies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBcmIncidentSchema = createInsertSchema(bcmIncidents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBcmActivationWorkflowSchema = createInsertSchema(bcmActivationWorkflows).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBcmRecoveryTeamSchema = createInsertSchema(bcmRecoveryTeams).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBcmSkillsMatrixSchema = createInsertSchema(bcmSkillsMatrix).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBcmLocationSchema = createInsertSchema(bcmLocations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBcmTestResultSchema = createInsertSchema(bcmTestResults).omit({ id: true, createdAt: true });
export const insertBcmVendorResilienceSchema = createInsertSchema(bcmVendorResilience).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBcmCyberRecoveryPlanSchema = createInsertSchema(bcmCyberRecoveryPlans).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBcmComplianceMappingSchema = createInsertSchema(bcmComplianceMappings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBcmMetricSchema = createInsertSchema(bcmMetrics).omit({ id: true, createdAt: true });

// Zod schemas for BC/DR JSONB fields - provides type safety across API and UI
export const AiTipSchema = z.object({
  type: z.enum(["tip", "insight", "prediction"]),
  title: z.string(),
  content: z.string(),
});

export const PlanSectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  subsections: z.array(z.string()).optional(),
});

export const TestParticipantSchema = z.object({
  role: z.string(),
  description: z.string(),
  required: z.boolean(),
});

export const ScenarioInjectSchema = z.object({
  time: z.string(),
  event: z.string(),
  expectedResponse: z.string().optional(),
});

export const TestScenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  injects: z.array(ScenarioInjectSchema).optional(),
});

export const TestSituationSchema = z.object({
  type: z.string(),
  description: z.string(),
});

export const EvaluationCriterionSchema = z.object({
  criterion: z.string(),
  description: z.string(),
  weight: z.number(),
});

// Types for BC/DR JSONB fields
export type AiTip = z.infer<typeof AiTipSchema>;
export type PlanSection = z.infer<typeof PlanSectionSchema>;
export type TestParticipant = z.infer<typeof TestParticipantSchema>;
export type ScenarioInject = z.infer<typeof ScenarioInjectSchema>;
export type TestScenario = z.infer<typeof TestScenarioSchema>;
export type TestSituation = z.infer<typeof TestSituationSchema>;
export type EvaluationCriterion = z.infer<typeof EvaluationCriterionSchema>;

// Types for new tables
export type TrustCenterSettings = typeof trustCenterSettings.$inferSelect;
export type InsertTrustCenterSettings = z.infer<typeof insertTrustCenterSettingsSchema>;
export type TrustCenterCertification = typeof trustCenterCertifications.$inferSelect;
export type InsertTrustCenterCertification = z.infer<typeof insertTrustCenterCertificationSchema>;
export type TrustCenterDocument = typeof trustCenterDocuments.$inferSelect;
export type InsertTrustCenterDocument = z.infer<typeof insertTrustCenterDocumentSchema>;
export type ControlMonitor = typeof controlMonitors.$inferSelect;
export type InsertControlMonitor = z.infer<typeof insertControlMonitorSchema>;
export type ControlTestResult = typeof controlTestResults.$inferSelect;
export type InsertControlTestResult = z.infer<typeof insertControlTestResultSchema>;
export type ControlAlert = typeof controlAlerts.$inferSelect;
export type InsertControlAlert = z.infer<typeof insertControlAlertSchema>;
export type EvidenceItem = typeof evidenceItems.$inferSelect;
export type InsertEvidenceItem = z.infer<typeof insertEvidenceItemSchema>;
export type EvidenceRequest = typeof evidenceRequests.$inferSelect;
export type InsertEvidenceRequest = z.infer<typeof insertEvidenceRequestSchema>;
export type RegulatoryUpdate = typeof regulatoryUpdates.$inferSelect;
export type InsertRegulatoryUpdate = z.infer<typeof insertRegulatoryUpdateSchema>;
export type TenantRegulatoryTracking = typeof tenantRegulatoryTracking.$inferSelect;
export type InsertTenantRegulatoryTracking = z.infer<typeof insertTenantRegulatoryTrackingSchema>;
export type RiskQuantification = typeof riskQuantification.$inferSelect;
export type InsertRiskQuantification = z.infer<typeof insertRiskQuantificationSchema>;
export type IntegrationConnector = typeof integrationConnectors.$inferSelect;
export type InsertIntegrationConnector = z.infer<typeof insertIntegrationConnectorSchema>;
export type TenantConnection = typeof tenantConnections.$inferSelect;
export type InsertTenantConnection = z.infer<typeof insertTenantConnectionSchema>;
export type EsgCategory = typeof esgCategories.$inferSelect;
export type InsertEsgCategory = z.infer<typeof insertEsgCategorySchema>;
export type EsgMetric = typeof esgMetrics.$inferSelect;
export type InsertEsgMetric = z.infer<typeof insertEsgMetricSchema>;
export type EsgInitiative = typeof esgInitiatives.$inferSelect;
export type InsertEsgInitiative = z.infer<typeof insertEsgInitiativeSchema>;
export type EsgFramework = typeof esgFrameworks.$inferSelect;
export type InsertEsgFramework = z.infer<typeof insertEsgFrameworkSchema>;
export type EsgFrameworkRequirement = typeof esgFrameworkRequirements.$inferSelect;
export type InsertEsgFrameworkRequirement = z.infer<typeof insertEsgFrameworkRequirementSchema>;
export type EsgCarbonEmissions = typeof esgCarbonEmissions.$inferSelect;
export type InsertEsgCarbonEmissions = z.infer<typeof insertEsgCarbonEmissionsSchema>;
export type EsgEnergyData = typeof esgEnergyData.$inferSelect;
export type InsertEsgEnergyData = z.infer<typeof insertEsgEnergyDataSchema>;
export type EsgWaterData = typeof esgWaterData.$inferSelect;
export type InsertEsgWaterData = z.infer<typeof insertEsgWaterDataSchema>;
export type EsgWasteData = typeof esgWasteData.$inferSelect;
export type InsertEsgWasteData = z.infer<typeof insertEsgWasteDataSchema>;
export type EsgDiversityData = typeof esgDiversityData.$inferSelect;
export type InsertEsgDiversityData = z.infer<typeof insertEsgDiversityDataSchema>;
export type EsgHealthSafetyData = typeof esgHealthSafetyData.$inferSelect;
export type InsertEsgHealthSafetyData = z.infer<typeof insertEsgHealthSafetyDataSchema>;
export type EsgBoardData = typeof esgBoardData.$inferSelect;
export type InsertEsgBoardData = z.infer<typeof insertEsgBoardDataSchema>;
export type EsgMaterialityTopic = typeof esgMaterialityTopics.$inferSelect;
export type InsertEsgMaterialityTopic = z.infer<typeof insertEsgMaterialityTopicsSchema>;
export type EsgTarget = typeof esgTargets.$inferSelect;
export type InsertEsgTarget = z.infer<typeof insertEsgTargetsSchema>;
export type EsgDisclosure = typeof esgDisclosures.$inferSelect;
export type InsertEsgDisclosure = z.infer<typeof insertEsgDisclosuresSchema>;
export type EsgSupplyChain = typeof esgSupplyChain.$inferSelect;
export type InsertEsgSupplyChain = z.infer<typeof insertEsgSupplyChainSchema>;
export type EsgIncident = typeof esgIncidents.$inferSelect;
export type InsertEsgIncident = z.infer<typeof insertEsgIncidentsSchema>;
export type EsgRating = typeof esgRatings.$inferSelect;
export type InsertEsgRating = z.infer<typeof insertEsgRatingsSchema>;
export type BcpPlan = typeof bcpPlans.$inferSelect;
export type InsertBcpPlan = z.infer<typeof insertBcpPlanSchema>;
export type BusinessImpactAnalysis = typeof businessImpactAnalysis.$inferSelect;
export type InsertBusinessImpactAnalysis = z.infer<typeof insertBusinessImpactAnalysisSchema>;
export type BcpTest = typeof bcpTests.$inferSelect;
export type InsertBcpTest = z.infer<typeof insertBcpTestSchema>;
export type BcpPlanCatalogItem = typeof bcpPlanCatalog.$inferSelect;
export type InsertBcpPlanCatalogItem = z.infer<typeof insertBcpPlanCatalogSchema>;
export type BcpTestTemplate = typeof bcpTestTemplates.$inferSelect;
export type InsertBcpTestTemplate = z.infer<typeof insertBcpTestTemplateSchema>;

// Comprehensive BCM Module Types
export type BcmService = typeof bcmServices.$inferSelect;
export type InsertBcmService = z.infer<typeof insertBcmServiceSchema>;
export type BcmServiceDependency = typeof bcmServiceDependencies.$inferSelect;
export type InsertBcmServiceDependency = z.infer<typeof insertBcmServiceDependencySchema>;
export type BcmBiaTemplate = typeof bcmBiaTemplates.$inferSelect;
export type InsertBcmBiaTemplate = z.infer<typeof insertBcmBiaTemplateSchema>;
export type BcmBiaResponse = typeof bcmBiaResponses.$inferSelect;
export type InsertBcmBiaResponse = z.infer<typeof insertBcmBiaResponseSchema>;
export type BcmStrategy = typeof bcmStrategies.$inferSelect;
export type InsertBcmStrategy = z.infer<typeof insertBcmStrategySchema>;
export type BcmIncident = typeof bcmIncidents.$inferSelect;
export type InsertBcmIncident = z.infer<typeof insertBcmIncidentSchema>;
export type BcmActivationWorkflow = typeof bcmActivationWorkflows.$inferSelect;
export type InsertBcmActivationWorkflow = z.infer<typeof insertBcmActivationWorkflowSchema>;
export type BcmRecoveryTeam = typeof bcmRecoveryTeams.$inferSelect;
export type InsertBcmRecoveryTeam = z.infer<typeof insertBcmRecoveryTeamSchema>;
export type BcmSkillsMatrix = typeof bcmSkillsMatrix.$inferSelect;
export type InsertBcmSkillsMatrix = z.infer<typeof insertBcmSkillsMatrixSchema>;
export type BcmLocation = typeof bcmLocations.$inferSelect;
export type InsertBcmLocation = z.infer<typeof insertBcmLocationSchema>;
export type BcmTestResult = typeof bcmTestResults.$inferSelect;
export type InsertBcmTestResult = z.infer<typeof insertBcmTestResultSchema>;
export type BcmVendorResilience = typeof bcmVendorResilience.$inferSelect;
export type InsertBcmVendorResilience = z.infer<typeof insertBcmVendorResilienceSchema>;
export type BcmCyberRecoveryPlan = typeof bcmCyberRecoveryPlans.$inferSelect;
export type InsertBcmCyberRecoveryPlan = z.infer<typeof insertBcmCyberRecoveryPlanSchema>;
export type BcmComplianceMapping = typeof bcmComplianceMappings.$inferSelect;
export type InsertBcmComplianceMapping = z.infer<typeof insertBcmComplianceMappingSchema>;
export type BcmMetric = typeof bcmMetrics.$inferSelect;
export type InsertBcmMetric = z.infer<typeof insertBcmMetricSchema>;

export type RiskCatalogItem = typeof riskCatalog.$inferSelect;
export type InsertRiskCatalogItem = z.infer<typeof insertRiskCatalogSchema>;
export type RiskRegisterTemplate = typeof riskRegisterTemplates.$inferSelect;
export type InsertRiskRegisterTemplate = z.infer<typeof insertRiskRegisterTemplateSchema>;
export type TenantRiskRegister = typeof tenantRiskRegisters.$inferSelect;
export type InsertTenantRiskRegister = z.infer<typeof insertTenantRiskRegisterSchema>;
export type RiskRegisterEntry = typeof riskRegisterEntries.$inferSelect;
export type InsertRiskRegisterEntry = z.infer<typeof insertRiskRegisterEntrySchema>;

// Documentation Management System
export const documentTypeEnum = pgEnum("document_type", ["release_notes", "admin_guide", "datasheet", "product_presentation"]);
export const documentStatusEnum = pgEnum("document_status", ["draft", "published", "archived"]);

export const platformDocuments = pgTable("platform_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: documentTypeEnum("type").notNull(),
  title: text("title").notNull(),
  version: text("version").notNull().default("1.0"),
  content: text("content").notNull(),
  summary: text("summary"),
  status: documentStatusEnum("status").default("draft"),
  metadata: jsonb("metadata"), // AI generation metadata, features list, etc.
  aiGenerated: boolean("ai_generated").default(false),
  aiEnrichmentDate: timestamp("ai_enrichment_date"),
  publishedAt: timestamp("published_at"),
  createdBy: varchar("created_by").references(() => users.id),
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPlatformDocumentSchema = createInsertSchema(platformDocuments).omit({ id: true, createdAt: true, updatedAt: true });
export type PlatformDocument = typeof platformDocuments.$inferSelect;
export type InsertPlatformDocument = z.infer<typeof insertPlatformDocumentSchema>;

// ==========================================
// APPROVAL WORKFLOW SYSTEM
// ==========================================

export const approvalLevelTypeEnum = pgEnum("approval_level_type", [
  "direct",      // Admin direct approval, no levels needed
  "single",      // 1 level - Single Approver
  "two_stage",   // 2 levels - Two-Stage Approval  
  "governance",  // 3 levels - Full Governance Chain
  "enterprise",  // 4 levels - Enterprise Approval
  "executive"    // 5 levels - Executive Board Approval
]);

export const approvalStatusEnum = pgEnum("approval_status", [
  "pending",
  "approved",
  "rejected",
  "skipped",
  "cancelled"
]);

export const documentEntityTypeEnum = pgEnum("document_entity_type", [
  "policy",
  "procedure", 
  "process"
]);

// Approval Workflow Configuration - per document
export const approvalWorkflows = pgTable("approval_workflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  entityType: documentEntityTypeEnum("entity_type").notNull(),
  entityId: varchar("entity_id").notNull(), // References policy, procedure, or process
  workflowType: approvalLevelTypeEnum("workflow_type").default("single"),
  totalLevels: integer("total_levels").default(1),
  currentLevel: integer("current_level").default(0),
  status: approvalStatusEnum("status").default("pending"),
  initiatedBy: varchar("initiated_by").references(() => users.id),
  initiatedAt: timestamp("initiated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Approval Levels - defines approvers per level
export const approvalLevels = pgTable("approval_levels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").references(() => approvalWorkflows.id).notNull(),
  levelNumber: integer("level_number").notNull(),
  levelName: text("level_name"), // e.g., "Department Head", "CISO", "Board"
  approverId: varchar("approver_id").references(() => users.id),
  status: approvalStatusEnum("status").default("pending"),
  comments: text("comments"),
  actionAt: timestamp("action_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Approver Role Assignments - employees assigned as approvers
export const approverAssignments = pgTable("approver_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  approverLevel: integer("approver_level").default(1), // 1-5 indicating max level they can approve
  department: text("department"),
  isActive: boolean("is_active").default(true),
  assignedBy: varchar("assigned_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==========================================
// EMPLOYEE PORTAL - DEVICE MANAGEMENT
// ==========================================

export const deviceStatusEnum = pgEnum("device_status", [
  "compliant",
  "non_compliant",
  "unknown",
  "needs_attention"
]);

export const employeeDevices = pgTable("employee_devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  deviceName: text("device_name").notNull(),
  deviceType: text("device_type"), // laptop, desktop, mobile
  ipAddress: text("ip_address"),
  macAddress: text("mac_address"),
  operatingSystem: text("operating_system"),
  osVersion: text("os_version"),
  endpointSecurityStatus: text("endpoint_security_status"), // installed, not_installed, outdated
  endpointSecurityProduct: text("endpoint_security_product"),
  encryptionEnabled: boolean("encryption_enabled").default(false),
  encryptionType: text("encryption_type"), // BitLocker, FileVault, etc.
  lastSyncAt: timestamp("last_sync_at"),
  status: deviceStatusEnum("status").default("unknown"),
  sourceType: text("source_type").default("manual"), // manual, integration
  integrationId: varchar("integration_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==========================================
// EMPLOYEE PORTAL - POLICY ACKNOWLEDGMENTS
// ==========================================

export const policyAcknowledgments = pgTable("policy_acknowledgments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  policyId: varchar("policy_id").references(() => policies.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  acknowledgedAt: timestamp("acknowledged_at").defaultNow(),
  policyVersion: text("policy_version"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  signature: text("signature"), // Optional e-signature
  createdAt: timestamp("created_at").defaultNow(),
});

// ==========================================
// EMPLOYEE PORTAL - TRAINING ASSIGNMENTS
// ==========================================

export const trainingStatusEnum = pgEnum("training_status", [
  "assigned",
  "in_progress", 
  "completed",
  "overdue",
  "expired"
]);

export const trainingAssignments = pgTable("training_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  trainingId: varchar("training_id"), // Reference to external training module
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  status: trainingStatusEnum("status").default("assigned"),
  score: integer("score"),
  certificateUrl: text("certificate_url"),
  assignedBy: varchar("assigned_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==========================================
// EMPLOYEE PORTAL - CYBERSECURITY TIPS
// ==========================================

export const cybersecurityTips = pgTable("cybersecurity_tips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"), // null = global tips
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category"), // phishing, passwords, social_engineering, etc.
  icon: text("icon"),
  priority: integer("priority").default(0),
  isActive: boolean("is_active").default(true),
  displayFrom: timestamp("display_from"),
  displayUntil: timestamp("display_until"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==========================================
// EMPLOYEE PORTAL - INCIDENT GUIDANCE
// ==========================================

export const incidentGuidance = pgTable("incident_guidance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"), // null = global guidance
  title: text("title").notNull(),
  description: text("description"),
  incidentType: text("incident_type"), // phishing, malware, data_breach, etc.
  steps: jsonb("steps"), // Array of step objects
  contacts: jsonb("contacts"), // Emergency contacts
  priority: integer("priority").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==========================================
// SECURITY MODULE - SCAN REPORTS
// ==========================================

export const securityToolTypeEnum = pgEnum("security_tool_type", [
  "vulnerability_scanner", "sast", "dast", "sca", "container_scanner", 
  "cloud_security", "endpoint", "siem", "penetration_test", "compliance_scan", "other"
]);

export const securityScanStatusEnum = pgEnum("security_scan_status", [
  "pending", "processing", "analyzed", "failed"
]);

export const securityScans = pgTable("security_scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  toolType: securityToolTypeEnum("tool_type").notNull(),
  toolName: text("tool_name").notNull(), // e.g., "Qualys", "Nessus", "OWASP ZAP"
  scanDate: timestamp("scan_date").notNull(),
  reportFile: text("report_file"), // Object storage path
  originalFileName: text("original_file_name"),
  rawData: jsonb("raw_data"), // Parsed report data
  status: securityScanStatusEnum("status").default("pending"),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==========================================
// SECURITY MODULE - FINDINGS
// ==========================================

export const securitySeverityEnum = pgEnum("security_severity", [
  "critical", "high", "medium", "low", "info"
]);

export const findingStatusEnum = pgEnum("finding_status", [
  "open", "in_progress", "remediated", "accepted", "false_positive"
]);

export const securityFindings = pgTable("security_findings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  scanId: varchar("scan_id").references(() => securityScans.id),
  title: text("title").notNull(),
  description: text("description"),
  severity: securitySeverityEnum("severity").notNull(),
  cvssScore: text("cvss_score"),
  cveId: text("cve_id"),
  cweId: text("cwe_id"),
  affectedAsset: text("affected_asset"),
  affectedComponent: text("affected_component"),
  remediation: text("remediation"),
  aiRecommendations: jsonb("ai_recommendations"),
  status: findingStatusEnum("status").default("open"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  dueDate: timestamp("due_date"),
  remediatedAt: timestamp("remediated_at"),
  remediatedBy: varchar("remediated_by").references(() => users.id),
  controlMapping: text("control_mapping").array(), // Related control IDs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==========================================
// SECURITY MODULE - POSTURE ASSESSMENTS
// ==========================================

export const securityPostureAssessments = pgTable("security_posture_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  assessmentDate: timestamp("assessment_date").defaultNow(),
  overallScore: integer("overall_score"), // 0-100
  targetScore: integer("target_score"), // Desired security score
  previousScore: integer("previous_score"),
  categories: jsonb("categories"), // Breakdown by category
  metrics: jsonb("metrics"), // Detailed metrics
  strengths: jsonb("strengths"),
  weaknesses: jsonb("weaknesses"),
  recommendations: jsonb("recommendations"),
  aiInsights: jsonb("ai_insights"),
  assessedBy: varchar("assessed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==========================================
// SECURITY MODULE - SCORECARDS
// ==========================================

export const securityScorecards = pgTable("security_scorecards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  period: text("period"), // e.g., "2026-Q1", "2026-01"
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  overallGrade: text("overall_grade"), // A, B, C, D, F
  overallScore: integer("overall_score"), // 0-100
  dimensions: jsonb("dimensions"), // Score breakdown by security dimension
  trends: jsonb("trends"), // Month-over-month trends
  highlights: jsonb("highlights"),
  concerns: jsonb("concerns"),
  recommendations: jsonb("recommendations"),
  comparisonData: jsonb("comparison_data"), // vs industry benchmarks, previous periods
  generatedAt: timestamp("generated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==========================================
// SECURITY MODULE - POSTURE HISTORY (for trends)
// ==========================================

export const securityPostureHistory = pgTable("security_posture_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  recordDate: timestamp("record_date").defaultNow(),
  metrics: jsonb("metrics"), // All security metrics snapshot
  vulnerabilities: jsonb("vulnerabilities"), // Count by severity
  findings: jsonb("findings"), // Open/closed counts
  complianceScore: integer("compliance_score"),
  riskScore: integer("risk_score"),
  maturityLevel: integer("maturity_level"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Security Control Assessments - for firewall, endpoint, network assessments
export const securityControlAssessments = pgTable("security_control_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name").notNull(),
  assessmentType: varchar("assessment_type").notNull(), // firewall, endpoint, network, access_control, encryption, cloud, application
  category: varchar("category"), // infrastructure, identity, data, application
  description: text("description"),
  scope: text("scope"), // What systems/assets are being assessed
  assessorName: varchar("assessor_name"),
  assessmentDate: timestamp("assessment_date").defaultNow(),
  dueDate: timestamp("due_date"),
  status: varchar("status").default("draft"), // draft, in_progress, completed, approved
  overallScore: integer("overall_score"), // 0-100
  maturityLevel: integer("maturity_level"), // 1-5
  findings: jsonb("findings"), // Array of findings with severity
  recommendations: jsonb("recommendations"), // AI-generated or manual
  controls: jsonb("controls"), // Control checklist with pass/fail/na
  evidence: jsonb("evidence"), // Evidence references
  previousScore: integer("previous_score"),
  targetScore: integer("target_score").default(85),
  frameworkMappings: jsonb("framework_mappings"), // Maps to ISO 27001, NIST, etc.
  aiAnalysis: text("ai_analysis"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Security Control Checklist Items
export const securityControlItems = pgTable("security_control_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  assessmentId: varchar("assessment_id").references(() => securityControlAssessments.id),
  controlCategory: varchar("control_category").notNull(), // firewall_rules, endpoint_protection, network_segmentation, etc.
  controlName: varchar("control_name").notNull(),
  controlDescription: text("control_description"),
  expectedConfiguration: text("expected_configuration"),
  actualConfiguration: text("actual_configuration"),
  status: varchar("status").default("pending"), // pass, fail, partial, na, pending
  severity: varchar("severity").default("medium"), // critical, high, medium, low, info
  gap: text("gap"), // Description of the gap if status is fail/partial
  remediation: text("remediation"), // Recommended remediation
  evidence: varchar("evidence"), // Evidence file/screenshot reference
  dueDate: timestamp("due_date"),
  assignedTo: varchar("assigned_to"),
  notes: text("notes"),
  frameworkControl: varchar("framework_control"), // e.g., ISO 27001:A.13.1.1
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==========================================
// DATA PRIVACY - DSPM (Data Security Posture Management)
// ==========================================

export const dataSensitivityEnum = pgEnum("data_sensitivity", [
  "public", "internal", "confidential", "restricted", "highly_restricted"
]);

export const dataDiscoveryScans = pgTable("data_discovery_scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  scanType: text("scan_type"), // cloud, on-prem, database, file_system
  targetSystems: jsonb("target_systems"),
  status: text("status").default("pending"), // pending, running, completed, failed
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  summary: jsonb("summary"), // Scan results summary
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sensitiveDataLocations = pgTable("sensitive_data_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  scanId: varchar("scan_id").references(() => dataDiscoveryScans.id),
  dataType: text("data_type").notNull(), // PII, PHI, PCI, credentials, etc.
  sensitivity: dataSensitivityEnum("sensitivity").notNull(),
  location: text("location").notNull(), // System/path where data is found
  systemType: text("system_type"), // cloud_storage, database, file_server, etc.
  cloudProvider: text("cloud_provider"), // AWS, Azure, GCP
  region: text("region"),
  recordCount: integer("record_count"),
  dataElements: jsonb("data_elements"), // Specific data elements found
  accessControls: jsonb("access_controls"),
  encryptionStatus: text("encryption_status"), // encrypted, unencrypted, partial
  riskLevel: riskLevelEnum("risk_level"),
  lastAccessed: timestamp("last_accessed"),
  recommendations: jsonb("recommendations"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dataFlowMappings = pgTable("data_flow_mappings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  sourceSystem: text("source_system").notNull(),
  destinationSystem: text("destination_system").notNull(),
  dataTypes: text("data_types").array(),
  sensitivity: dataSensitivityEnum("sensitivity"),
  transferMethod: text("transfer_method"), // API, file transfer, sync, etc.
  frequency: text("frequency"), // real-time, daily, weekly, etc.
  encryptionInTransit: boolean("encryption_in_transit").default(false),
  crossBorder: boolean("cross_border").default(false),
  legalBasis: text("legal_basis"),
  retentionPeriod: text("retention_period"),
  riskLevel: riskLevelEnum("risk_level"),
  controls: jsonb("controls"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dataAccessRisks = pgTable("data_access_risks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  locationId: varchar("location_id").references(() => sensitiveDataLocations.id),
  riskType: text("risk_type").notNull(), // over_privileged, stale_access, external_sharing, etc.
  description: text("description"),
  severity: securitySeverityEnum("severity").notNull(),
  affectedUsers: integer("affected_users"),
  affectedData: text("affected_data"),
  recommendation: text("recommendation"),
  aiAnalysis: jsonb("ai_analysis"),
  status: findingStatusEnum("status").default("open"),
  remediatedAt: timestamp("remediated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============ Security Scanning Engines ============

// Email Security Assessment (DMARC, DKIM, SPF)
export const emailSecurityAssessments = pgTable("email_security_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  domain: text("domain").notNull(),
  
  // SPF Results
  spfStatus: text("spf_status"), // pass, fail, softfail, neutral, none, permerror, temperror
  spfRecord: text("spf_record"),
  spfDetails: jsonb("spf_details"),
  
  // DKIM Results
  dkimStatus: text("dkim_status"), // pass, fail, none
  dkimSelector: text("dkim_selector"),
  dkimRecord: text("dkim_record"),
  dkimDetails: jsonb("dkim_details"),
  
  // DMARC Results
  dmarcStatus: text("dmarc_status"), // pass, fail, none
  dmarcPolicy: text("dmarc_policy"), // none, quarantine, reject
  dmarcRecord: text("dmarc_record"),
  dmarcDetails: jsonb("dmarc_details"),
  
  // MX Records
  mxRecords: jsonb("mx_records"),
  
  // BIMI (Brand Indicators for Message Identification)
  bimiStatus: text("bimi_status"),
  bimiRecord: text("bimi_record"),
  
  // MTA-STS (Mail Transfer Agent Strict Transport Security)
  mtaStsStatus: text("mta_sts_status"),
  mtaStsPolicy: text("mta_sts_policy"),
  
  // TLS-RPT (TLS Reporting)
  tlsRptStatus: text("tls_rpt_status"),
  tlsRptRecord: text("tls_rpt_record"),
  
  // Overall score
  overallScore: integer("overall_score"),
  recommendations: jsonb("recommendations"),
  aiAnalysis: jsonb("ai_analysis"),
  
  scanStatus: text("scan_status").default("pending"), // pending, in_progress, completed, failed
  lastScannedAt: timestamp("last_scanned_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Web Application Scanner
export const webAppScans = pgTable("web_app_scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  targetUrl: text("target_url").notNull(),
  scanName: text("scan_name"),
  scanType: text("scan_type").default("full"), // quick, full, authenticated, api
  
  // Scan configuration
  scanConfig: jsonb("scan_config"), // depth, exclusions, authentication, etc.
  
  // Results summary
  vulnerabilitiesCount: jsonb("vulnerabilities_count"), // {critical: 0, high: 0, medium: 0, low: 0, info: 0}
  owaspFindings: jsonb("owasp_findings"), // OWASP Top 10 findings
  
  // Detailed results
  sslInfo: jsonb("ssl_info"), // SSL/TLS configuration
  headerAnalysis: jsonb("header_analysis"), // Security headers
  cookieAnalysis: jsonb("cookie_analysis"), // Cookie security
  
  overallScore: integer("overall_score"),
  riskLevel: text("risk_level"), // critical, high, medium, low
  
  scanStatus: text("scan_status").default("pending"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // in seconds
  
  aiAnalysis: jsonb("ai_analysis"),
  recommendations: jsonb("recommendations"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Web App Scan Vulnerabilities
export const webAppVulnerabilities = pgTable("web_app_vulnerabilities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scanId: varchar("scan_id").references(() => webAppScans.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  
  vulnerabilityType: text("vulnerability_type").notNull(), // xss, sqli, csrf, etc.
  owaspCategory: text("owasp_category"), // A01:2021-Broken Access Control, etc.
  severity: securitySeverityEnum("severity").notNull(),
  
  title: text("title").notNull(),
  description: text("description"),
  affectedUrl: text("affected_url"),
  affectedParameter: text("affected_parameter"),
  
  evidence: text("evidence"),
  request: text("request"),
  response: text("response"),
  
  remediation: text("remediation"),
  references: jsonb("references"), // CVE, CWE links
  
  cweId: text("cwe_id"),
  cvssScore: text("cvss_score"),
  
  status: findingStatusEnum("status").default("open"),
  verifiedAt: timestamp("verified_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Dark Web / Deep Web Monitoring
export const darkWebMonitors = pgTable("dark_web_monitors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  
  monitorType: text("monitor_type").notNull(), // domain, email, credential, brand, executive
  monitorValue: text("monitor_value").notNull(), // domain.com, email@domain.com, etc.
  monitorName: text("monitor_name"),
  
  isActive: boolean("is_active").default(true),
  scanFrequency: text("scan_frequency").default("daily"), // hourly, daily, weekly
  
  lastScanAt: timestamp("last_scan_at"),
  nextScanAt: timestamp("next_scan_at"),
  
  alertsCount: integer("alerts_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dark Web Alerts/Findings
export const darkWebAlerts = pgTable("dark_web_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  monitorId: varchar("monitor_id").references(() => darkWebMonitors.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  
  alertType: text("alert_type").notNull(), // credential_leak, data_breach, brand_mention, paste_exposure
  severity: securitySeverityEnum("severity").notNull(),
  
  title: text("title").notNull(),
  description: text("description"),
  
  sourceType: text("source_type"), // paste_site, forum, marketplace, breach_database
  sourceName: text("source_name"),
  sourceUrl: text("source_url"),
  
  exposedData: jsonb("exposed_data"), // sanitized summary of what was found
  affectedAccounts: integer("affected_accounts"),
  
  discoveredAt: timestamp("discovered_at"),
  
  status: findingStatusEnum("status").default("open"),
  acknowledgedAt: timestamp("acknowledged_at"),
  acknowledgedBy: varchar("acknowledged_by").references(() => users.id),
  
  recommendations: jsonb("recommendations"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Threat Intelligence (OSINT)
export const threatIntelFeeds = pgTable("threat_intel_feeds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  feedName: text("feed_name").notNull(),
  feedType: text("feed_type").notNull(), // ip_reputation, domain_blocklist, malware_hash, c2_servers, phishing
  feedSource: text("feed_source").notNull(), // abuse.ch, alienvault, emergingthreats, etc.
  feedUrl: text("feed_url"),
  
  isActive: boolean("is_active").default(true),
  isGlobal: boolean("is_global").default(false), // available to all tenants
  
  lastUpdatedAt: timestamp("last_updated_at"),
  updateFrequency: text("update_frequency").default("daily"),
  
  indicatorCount: integer("indicator_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Threat Intelligence Indicators
export const threatIndicators = pgTable("threat_indicators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  feedId: varchar("feed_id").references(() => threatIntelFeeds.id),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  indicatorType: text("indicator_type").notNull(), // ip, domain, url, hash, email
  indicatorValue: text("indicator_value").notNull(),
  
  threatType: text("threat_type"), // malware, phishing, c2, spam, botnet
  confidence: integer("confidence"), // 0-100
  severity: securitySeverityEnum("severity"),
  
  firstSeen: timestamp("first_seen"),
  lastSeen: timestamp("last_seen"),
  
  tags: text("tags").array(),
  metadata: jsonb("metadata"),
  
  source: text("source"),
  
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Threat Intel Matches (when indicators match tenant assets)
export const threatIntelMatches = pgTable("threat_intel_matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  indicatorId: varchar("indicator_id").references(() => threatIndicators.id),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  
  matchType: text("match_type").notNull(), // ip_connection, domain_resolution, file_hash, email_sender
  matchedAsset: text("matched_asset"), // the tenant asset that matched
  matchedValue: text("matched_value"),
  
  severity: securitySeverityEnum("severity").notNull(),
  
  context: jsonb("context"), // additional context about the match
  
  status: findingStatusEnum("status").default("open"),
  investigatedAt: timestamp("investigated_at"),
  investigatedBy: varchar("investigated_by").references(() => users.id),
  
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for new tables
export const insertApprovalWorkflowSchema = createInsertSchema(approvalWorkflows).omit({ id: true, createdAt: true, updatedAt: true });
export const insertApprovalLevelSchema = createInsertSchema(approvalLevels).omit({ id: true, createdAt: true });
export const insertApproverAssignmentSchema = createInsertSchema(approverAssignments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmployeeDeviceSchema = createInsertSchema(employeeDevices).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPolicyAcknowledgmentSchema = createInsertSchema(policyAcknowledgments).omit({ id: true, createdAt: true });
export const insertTrainingAssignmentSchema = createInsertSchema(trainingAssignments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCybersecurityTipSchema = createInsertSchema(cybersecurityTips).omit({ id: true, createdAt: true, updatedAt: true });
export const insertIncidentGuidanceSchema = createInsertSchema(incidentGuidance).omit({ id: true, createdAt: true, updatedAt: true });

// Security Module schemas
export const insertSecurityScanSchema = createInsertSchema(securityScans).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSecurityFindingSchema = createInsertSchema(securityFindings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSecurityPostureAssessmentSchema = createInsertSchema(securityPostureAssessments).omit({ id: true, createdAt: true });
export const insertSecurityScorecardSchema = createInsertSchema(securityScorecards).omit({ id: true, createdAt: true, generatedAt: true });
export const insertSecurityPostureHistorySchema = createInsertSchema(securityPostureHistory).omit({ id: true, createdAt: true });
export const insertSecurityControlAssessmentSchema = createInsertSchema(securityControlAssessments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSecurityControlItemSchema = createInsertSchema(securityControlItems).omit({ id: true, createdAt: true, updatedAt: true });

// DSPM schemas
export const insertDataDiscoveryScanSchema = createInsertSchema(dataDiscoveryScans).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSensitiveDataLocationSchema = createInsertSchema(sensitiveDataLocations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDataFlowMappingSchema = createInsertSchema(dataFlowMappings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDataAccessRiskSchema = createInsertSchema(dataAccessRisks).omit({ id: true, createdAt: true, updatedAt: true });

// Security Scanning Engine schemas
export const insertEmailSecurityAssessmentSchema = createInsertSchema(emailSecurityAssessments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWebAppScanSchema = createInsertSchema(webAppScans).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWebAppVulnerabilitySchema = createInsertSchema(webAppVulnerabilities).omit({ id: true, createdAt: true });
export const insertDarkWebMonitorSchema = createInsertSchema(darkWebMonitors).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDarkWebAlertSchema = createInsertSchema(darkWebAlerts).omit({ id: true, createdAt: true });
export const insertThreatIntelFeedSchema = createInsertSchema(threatIntelFeeds).omit({ id: true, createdAt: true });
export const insertThreatIndicatorSchema = createInsertSchema(threatIndicators).omit({ id: true, createdAt: true });
export const insertThreatIntelMatchSchema = createInsertSchema(threatIntelMatches).omit({ id: true, createdAt: true });

// Types for new tables
export type ApprovalWorkflow = typeof approvalWorkflows.$inferSelect;
export type InsertApprovalWorkflow = z.infer<typeof insertApprovalWorkflowSchema>;
export type ApprovalLevel = typeof approvalLevels.$inferSelect;
export type InsertApprovalLevel = z.infer<typeof insertApprovalLevelSchema>;
export type ApproverAssignment = typeof approverAssignments.$inferSelect;
export type InsertApproverAssignment = z.infer<typeof insertApproverAssignmentSchema>;
export type EmployeeDevice = typeof employeeDevices.$inferSelect;
export type InsertEmployeeDevice = z.infer<typeof insertEmployeeDeviceSchema>;
export type PolicyAcknowledgment = typeof policyAcknowledgments.$inferSelect;
export type InsertPolicyAcknowledgment = z.infer<typeof insertPolicyAcknowledgmentSchema>;
export type TrainingAssignment = typeof trainingAssignments.$inferSelect;
export type InsertTrainingAssignment = z.infer<typeof insertTrainingAssignmentSchema>;
export type CybersecurityTip = typeof cybersecurityTips.$inferSelect;
export type InsertCybersecurityTip = z.infer<typeof insertCybersecurityTipSchema>;
export type IncidentGuidance = typeof incidentGuidance.$inferSelect;
export type InsertIncidentGuidance = z.infer<typeof insertIncidentGuidanceSchema>;

// Security Module types
export type SecurityScan = typeof securityScans.$inferSelect;
export type InsertSecurityScan = z.infer<typeof insertSecurityScanSchema>;
export type SecurityFinding = typeof securityFindings.$inferSelect;
export type InsertSecurityFinding = z.infer<typeof insertSecurityFindingSchema>;
export type SecurityPostureAssessment = typeof securityPostureAssessments.$inferSelect;
export type InsertSecurityPostureAssessment = z.infer<typeof insertSecurityPostureAssessmentSchema>;
export type SecurityScorecard = typeof securityScorecards.$inferSelect;
export type InsertSecurityScorecard = z.infer<typeof insertSecurityScorecardSchema>;
export type SecurityPostureHistory = typeof securityPostureHistory.$inferSelect;
export type InsertSecurityPostureHistory = z.infer<typeof insertSecurityPostureHistorySchema>;
export type SecurityControlAssessment = typeof securityControlAssessments.$inferSelect;
export type InsertSecurityControlAssessment = z.infer<typeof insertSecurityControlAssessmentSchema>;
export type SecurityControlItem = typeof securityControlItems.$inferSelect;
export type InsertSecurityControlItem = z.infer<typeof insertSecurityControlItemSchema>;

// DSPM types
export type DataDiscoveryScan = typeof dataDiscoveryScans.$inferSelect;
export type InsertDataDiscoveryScan = z.infer<typeof insertDataDiscoveryScanSchema>;
export type SensitiveDataLocation = typeof sensitiveDataLocations.$inferSelect;
export type InsertSensitiveDataLocation = z.infer<typeof insertSensitiveDataLocationSchema>;
export type DataFlowMapping = typeof dataFlowMappings.$inferSelect;
export type InsertDataFlowMapping = z.infer<typeof insertDataFlowMappingSchema>;
export type DataAccessRisk = typeof dataAccessRisks.$inferSelect;
export type InsertDataAccessRisk = z.infer<typeof insertDataAccessRiskSchema>;

// Security Scanning Engine types
export type EmailSecurityAssessment = typeof emailSecurityAssessments.$inferSelect;
export type InsertEmailSecurityAssessment = z.infer<typeof insertEmailSecurityAssessmentSchema>;
export type WebAppScan = typeof webAppScans.$inferSelect;
export type InsertWebAppScan = z.infer<typeof insertWebAppScanSchema>;
export type WebAppVulnerability = typeof webAppVulnerabilities.$inferSelect;
export type InsertWebAppVulnerability = z.infer<typeof insertWebAppVulnerabilitySchema>;
export type DarkWebMonitor = typeof darkWebMonitors.$inferSelect;
export type InsertDarkWebMonitor = z.infer<typeof insertDarkWebMonitorSchema>;
export type DarkWebAlert = typeof darkWebAlerts.$inferSelect;
export type InsertDarkWebAlert = z.infer<typeof insertDarkWebAlertSchema>;
export type ThreatIntelFeed = typeof threatIntelFeeds.$inferSelect;
export type InsertThreatIntelFeed = z.infer<typeof insertThreatIntelFeedSchema>;
export type ThreatIndicator = typeof threatIndicators.$inferSelect;
export type InsertThreatIndicator = z.infer<typeof insertThreatIndicatorSchema>;
export type ThreatIntelMatch = typeof threatIntelMatches.$inferSelect;
export type InsertThreatIntelMatch = z.infer<typeof insertThreatIntelMatchSchema>;

// Security Controls Catalog - Asset Categories for coverage tracking
export const controlCategoryEnum = pgEnum("control_category", [
  "access_control",
  "application_security",
  "asset_management",
  "backup_recovery",
  "business_continuity",
  "cloud_security",
  "compliance",
  "cryptography",
  "data_protection",
  "email_security",
  "endpoint_security",
  "identity_management",
  "incident_response",
  "iot_security",
  "logging_monitoring",
  "mobile_security",
  "network_security",
  "physical_security",
  "privacy",
  "security_awareness",
  "security_governance",
  "security_operations",
  "supply_chain_security",
  "third_party_risk",
  "threat_intelligence",
  "vulnerability_management",
  "zero_trust"
]);

export const implementationStatusEnum = pgEnum("implementation_status", [
  "not_evaluated",
  "not_implemented",
  "in_progress",
  "partial",
  "implemented",
  "not_applicable"
]);

// Control Nature - Technical, Administrative, or Physical
export const controlNatureEnum = pgEnum("control_nature", [
  "technical",
  "administrative",
  "physical",
  "hybrid"
]);

// Control Function/Subtype - Detective, Preventive, Corrective, etc.
export const controlFunctionEnum = pgEnum("control_function", [
  "preventive",
  "detective",
  "corrective",
  "deterrent",
  "compensating",
  "recovery"
]);

// Security Controls Catalog - main table for tracking control implementations
export const securityControlsCatalog = pgTable("security_controls_catalog", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  controlId: varchar("control_id").references(() => controls.id),
  
  // Control details
  controlCode: text("control_code").notNull(),
  controlTitle: text("control_title").notNull(),
  controlDescription: text("control_description"),
  category: controlCategoryEnum("category").notNull(),
  
  // Control classification
  controlNature: controlNatureEnum("control_nature").default("technical"), // Technical, Administrative, Physical, Hybrid
  controlFunction: controlFunctionEnum("control_function").default("preventive"), // Preventive, Detective, Corrective, etc.
  
  // Implementing solutions - tracks which tools/products implement this control
  implementingSolutions: jsonb("implementing_solutions"), // [{name: "CrowdStrike", vendor: "CrowdStrike", type: "EDR", status: "active"}, ...]
  primarySolution: text("primary_solution"), // Main solution implementing this control
  solutionCoverage: integer("solution_coverage").default(0), // 0-100 percentage
  
  // Existing product/tool tracking for technical controls
  existingProductName: text("existing_product_name"), // e.g., "CrowdStrike Falcon", "Microsoft Defender", "Okta"
  existingProductVersion: text("existing_product_version"), // e.g., "7.0", "2024.1", "v3.2.1"
  existingProductVendor: text("existing_product_vendor"), // e.g., "CrowdStrike", "Microsoft", "Okta"
  existingProductStatus: text("existing_product_status").default("active"), // active, deprecated, planned, evaluating
  existingProductLicenseType: text("existing_product_license_type"), // e.g., "Enterprise", "Professional", "Standard"
  existingProductLicenseExpiry: timestamp("existing_product_license_expiry"),
  
  // Features enabled for this control (category-specific)
  enabledFeatures: jsonb("enabled_features"), // Array of feature keys enabled: ["anti_phishing", "anti_spam", "bec_detection"]
  
  // Mandatory status
  isMandatory: boolean("is_mandatory").default(false),
  mandatoryReason: text("mandatory_reason"),
  regulatoryReference: text("regulatory_reference"),
  
  // Implementation status
  implementationStatus: implementationStatusEnum("implementation_status").default("not_evaluated"),
  implementationNotes: text("implementation_notes"),
  implementedAt: timestamp("implemented_at"),
  implementedBy: varchar("implemented_by").references(() => users.id),
  
  // Version tracking
  currentVersion: text("current_version").default("1.0"),
  latestVersion: text("latest_version").default("1.0"),
  versionNotes: text("version_notes"),
  lastVersionCheck: timestamp("last_version_check"),
  
  // Asset coverage
  totalAssets: integer("total_assets").default(0),
  coveredAssets: integer("covered_assets").default(0),
  coveragePercentage: integer("coverage_percentage").default(0),
  assetCategories: jsonb("asset_categories"), // e.g. {servers: 10, workstations: 50, network: 5}
  coveredAssetDetails: jsonb("covered_asset_details"), // e.g. {servers: 8, workstations: 45, network: 5}
  
  // Risk and priority
  riskLevel: riskLevelEnum("risk_level").default("medium"),
  priority: integer("priority").default(3), // 1-5 scale
  
  // AI enrichment
  aiEnriched: boolean("ai_enriched").default(false),
  aiEnrichmentData: jsonb("ai_enrichment_data"),
  aiRecommendations: text("ai_recommendations").array(),
  aiLastEnrichedAt: timestamp("ai_last_enriched_at"),
  
  // Effectiveness scoring
  effectivenessScore: integer("effectiveness_score").default(0), // 0-100
  maturityLevel: integer("maturity_level").default(1), // 1-5
  
  // Related frameworks and controls
  relatedFrameworks: text("related_frameworks").array(),
  relatedControls: text("related_controls").array(),
  
  // Evidence and documentation
  evidenceLinks: text("evidence_links").array(),
  documentationLinks: text("documentation_links").array(),
  
  // Review cycle
  lastReviewDate: timestamp("last_review_date"),
  nextReviewDate: timestamp("next_review_date"),
  reviewCycle: integer("review_cycle").default(90), // days
  reviewerId: varchar("reviewer_id").references(() => users.id),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Asset tracking table for controls catalog
export const controlAssets = pgTable("control_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  assetName: text("asset_name").notNull(),
  assetType: text("asset_type").notNull(), // server, workstation, network, application, database, cloud_resource
  assetCategory: text("asset_category"), // infrastructure, endpoint, application, data
  assetCriticality: text("asset_criticality").default("medium"), // critical, high, medium, low
  
  // Asset details
  hostname: text("hostname"),
  ipAddress: text("ip_address"),
  operatingSystem: text("operating_system"),
  owner: varchar("owner").references(() => users.id),
  department: text("department"),
  location: text("location"),
  
  // Status
  isActive: boolean("is_active").default(true),
  lastSeen: timestamp("last_seen"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Junction table for control-asset coverage mapping
export const controlAssetCoverage = pgTable("control_asset_coverage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  catalogEntryId: varchar("catalog_entry_id").references(() => securityControlsCatalog.id),
  assetId: varchar("asset_id").references(() => controlAssets.id),
  
  coverageStatus: text("coverage_status").default("covered"), // covered, partial, not_covered
  coverageNotes: text("coverage_notes"),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: varchar("verified_by").references(() => users.id),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Cyber Security Posture tracking
export const cyberSecurityPosture = pgTable("cyber_security_posture", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  // Overall scores
  overallScore: integer("overall_score").default(0), // 0-100
  maturityLevel: integer("maturity_level").default(1), // 1-5
  riskRating: text("risk_rating").default("medium"), // critical, high, medium, low
  
  // Category scores
  categoryScores: jsonb("category_scores"), // {access_control: 85, network_security: 72, ...}
  
  // Coverage metrics
  totalControls: integer("total_controls").default(0),
  implementedControls: integer("implemented_controls").default(0),
  partialControls: integer("partial_controls").default(0),
  notImplementedControls: integer("not_implemented_controls").default(0),
  controlCoveragePercentage: integer("control_coverage_percentage").default(0),
  
  // Asset metrics
  totalAssets: integer("total_assets").default(0),
  coveredAssets: integer("covered_assets").default(0),
  assetCoveragePercentage: integer("asset_coverage_percentage").default(0),
  
  // Mandatory compliance
  mandatoryControls: integer("mandatory_controls").default(0),
  mandatoryCompliant: integer("mandatory_compliant").default(0),
  mandatoryCompliancePercentage: integer("mandatory_compliance_percentage").default(0),
  
  // Trend data
  previousScore: integer("previous_score"),
  scoreTrend: text("score_trend").default("stable"), // improving, stable, declining
  
  // AI insights
  aiInsights: jsonb("ai_insights"),
  aiRecommendations: text("ai_recommendations").array(),
  
  calculatedAt: timestamp("calculated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Posture history for trend tracking
export const cyberSecurityPostureHistory = pgTable("cyber_security_posture_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  overallScore: integer("overall_score").default(0),
  categoryScores: jsonb("category_scores"),
  controlCoveragePercentage: integer("control_coverage_percentage").default(0),
  assetCoveragePercentage: integer("asset_coverage_percentage").default(0),
  mandatoryCompliancePercentage: integer("mandatory_compliance_percentage").default(0),
  
  recordedAt: timestamp("recorded_at").defaultNow(),
});

// Insert schemas for Security Controls Catalog
export const insertSecurityControlsCatalogSchema = createInsertSchema(securityControlsCatalog).omit({ id: true, createdAt: true, updatedAt: true });
export const insertControlAssetSchema = createInsertSchema(controlAssets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertControlAssetCoverageSchema = createInsertSchema(controlAssetCoverage).omit({ id: true, createdAt: true });
export const insertCyberSecurityPostureSchema = createInsertSchema(cyberSecurityPosture).omit({ id: true, createdAt: true, calculatedAt: true });
export const insertCyberSecurityPostureHistorySchema = createInsertSchema(cyberSecurityPostureHistory).omit({ id: true, recordedAt: true });

// Types for Security Controls Catalog
export type SecurityControlsCatalogEntry = typeof securityControlsCatalog.$inferSelect;
export type InsertSecurityControlsCatalogEntry = z.infer<typeof insertSecurityControlsCatalogSchema>;
export type ControlAsset = typeof controlAssets.$inferSelect;
export type InsertControlAsset = z.infer<typeof insertControlAssetSchema>;
export type ControlAssetCoverage = typeof controlAssetCoverage.$inferSelect;
export type InsertControlAssetCoverage = z.infer<typeof insertControlAssetCoverageSchema>;
export type CyberSecurityPosture = typeof cyberSecurityPosture.$inferSelect;
export type InsertCyberSecurityPosture = z.infer<typeof insertCyberSecurityPostureSchema>;
export type CyberSecurityPostureHistory = typeof cyberSecurityPostureHistory.$inferSelect;
export type InsertCyberSecurityPostureHistory = z.infer<typeof insertCyberSecurityPostureHistorySchema>;

// =============================================
// GOVERNANCE MODULE TABLES
// =============================================

// Enums for Governance Module
export const aiRiskLevelEnum = pgEnum("ai_risk_level", ["unacceptable", "high", "limited", "minimal"]);
export const aiSystemStatusEnum = pgEnum("ai_system_status", ["development", "testing", "deployed", "retired"]);
export const dataClassificationEnum = pgEnum("data_classification", ["public", "internal", "confidential", "restricted", "highly_restricted"]);
export const changeTypeEnum = pgEnum("change_type", ["new", "updated", "deprecated"]);
export const changeStatusEnum = pgEnum("change_status", ["pending", "analyzed", "actioned"]);
export const impactTypeEnum = pgEnum("impact_type", ["requires_update", "requires_review", "gap_created", "no_impact"]);
export const decisionStatusEnum = pgEnum("decision_status", ["pending", "approved", "rejected", "deferred"]);

// AI Systems Registry for AI Governance
export const aiSystems = pgTable("ai_systems", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // llm, ml_model, decision_system, automation, etc.
  purpose: text("purpose"),
  
  // AI Risk Classification (EU AI Act)
  riskLevel: aiRiskLevelEnum("risk_level").default("minimal"),
  riskJustification: text("risk_justification"),
  
  // Lifecycle & Status
  status: aiSystemStatusEnum("status").default("development"),
  version: text("version"),
  deploymentDate: timestamp("deployment_date"),
  lastAssessmentDate: timestamp("last_assessment_date"),
  
  // Ownership
  owner: varchar("owner").references(() => users.id),
  department: text("department"),
  
  // Compliance & Metrics
  complianceScore: integer("compliance_score").default(0), // 0-100
  transparencyScore: integer("transparency_score").default(0),
  fairnessScore: integer("fairness_score").default(0),
  
  // Technical Details
  dataInputs: text("data_inputs").array(),
  dataOutputs: text("data_outputs").array(),
  trainingData: text("training_data"),
  modelType: text("model_type"),
  vendor: text("vendor"),
  
  // Documentation
  documentationUrl: text("documentation_url"),
  riskAssessmentId: varchar("risk_assessment_id"),
  
  // AI-enriched fields
  aiEnriched: boolean("ai_enriched").default(false),
  aiRecommendations: jsonb("ai_recommendations"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Data Assets for Data Governance
export const dataAssets = pgTable("data_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  name: text("name").notNull(),
  description: text("description"),
  
  // Classification
  classification: dataClassificationEnum("classification").default("internal"),
  containsPii: boolean("contains_pii").default(false),
  piiTypes: text("pii_types").array(), // name, email, ssn, address, etc.
  
  // Location & Type
  dataType: text("data_type").notNull(), // database, file, api, application, etc.
  location: text("location"),
  system: text("system"),
  
  // Ownership
  dataOwner: varchar("data_owner").references(() => users.id),
  dataSteward: varchar("data_steward").references(() => users.id),
  department: text("department"),
  
  // Retention
  retentionPeriod: text("retention_period"),
  retentionPolicyId: varchar("retention_policy_id"),
  lastReviewDate: timestamp("last_review_date"),
  nextReviewDate: timestamp("next_review_date"),
  
  // Quality & Compliance
  qualityScore: integer("quality_score").default(0), // 0-100
  complianceStatus: text("compliance_status").default("pending"),
  
  // Metadata
  recordCount: integer("record_count"),
  lastUpdated: timestamp("last_updated"),
  tags: text("tags").array(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Governance Decisions
export const governanceDecisions = pgTable("governance_decisions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // policy, risk, compliance, security, data, etc.
  
  // Decision Details
  status: decisionStatusEnum("status").default("pending"),
  priority: text("priority").default("medium"), // low, medium, high, critical
  dueDate: timestamp("due_date"),
  
  // Decision Outcome
  outcome: text("outcome"),
  rationale: text("rationale"),
  decisionDate: timestamp("decision_date"),
  
  // Stakeholders
  requestedBy: varchar("requested_by").references(() => users.id),
  decidedBy: varchar("decided_by").references(() => users.id),
  approvers: text("approvers").array(),
  
  // Impact
  impactedAreas: text("impacted_areas").array(),
  implementationNotes: text("implementation_notes"),
  
  // Related Entities
  relatedPolicyId: varchar("related_policy_id"),
  relatedRiskId: varchar("related_risk_id"),
  relatedControlId: varchar("related_control_id"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// RACI Matrix Items
export const raciItems = pgTable("raci_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  activity: text("activity").notNull(),
  description: text("description"),
  category: text("category"), // governance, risk, compliance, security, etc.
  
  // RACI Assignments (roles/departments)
  responsible: text("responsible").array(),
  accountable: text("accountable"),
  consulted: text("consulted").array(),
  informed: text("informed").array(),
  
  // Metadata
  frequency: text("frequency"), // daily, weekly, monthly, quarterly, as_needed
  lastReviewDate: timestamp("last_review_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Change Events for Change Impact Analysis
export const governanceChangeEvents = pgTable("governance_change_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  name: text("name").notNull(),
  description: text("description"),
  
  // Change Classification
  entityType: text("entity_type").notNull(), // policy, regulation, framework, control
  changeType: changeTypeEnum("change_type").default("updated"),
  source: text("source"), // regulatory_feed, internal, standards_body, etc.
  
  // Impact Assessment
  impactLevel: text("impact_level").default("medium"), // low, medium, high, critical
  status: changeStatusEnum("status").default("pending"),
  
  // Detection & Analysis
  detectedAt: timestamp("detected_at").defaultNow(),
  analyzedAt: timestamp("analyzed_at"),
  analyzedBy: varchar("analyzed_by").references(() => users.id),
  
  // Action Items
  actionRequired: text("action_required"),
  actionedAt: timestamp("actioned_at"),
  actionedBy: varchar("actioned_by").references(() => users.id),
  
  // Reference
  externalReference: text("external_reference"),
  originalContent: text("original_content"),
  changedContent: text("changed_content"),
  
  // AI Analysis
  aiAnalysis: jsonb("ai_analysis"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Change Impacts
export const governanceChangeImpacts = pgTable("governance_change_impacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  changeEventId: varchar("change_event_id").references(() => governanceChangeEvents.id),
  
  // Impacted Entity
  entityType: text("entity_type").notNull(), // policy, process, procedure, control, etc.
  entityId: varchar("entity_id"),
  entityName: text("entity_name").notNull(),
  
  // Impact Classification
  impactType: impactTypeEnum("impact_type").default("requires_review"),
  priority: text("priority").default("medium"), // low, medium, high
  
  description: text("description"),
  recommendedAction: text("recommended_action"),
  
  // Resolution
  resolved: boolean("resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolutionNotes: text("resolution_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Governance Nodes for Ontology
export const governanceNodes = pgTable("governance_nodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  name: text("name").notNull(),
  description: text("description"),
  nodeType: text("node_type").notNull(), // policy, principle, control, evidence, risk, regulation, system
  
  // Node Metadata
  status: text("status").default("active"),
  owner: varchar("owner").references(() => users.id),
  
  // For positioning in graph
  positionX: integer("position_x").default(0),
  positionY: integer("position_y").default(0),
  
  // Reference to actual entity
  referenceId: varchar("reference_id"),
  referenceType: text("reference_type"),
  
  metadata: jsonb("metadata"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Governance Node Relationships
export const governanceNodeRelationships = pgTable("governance_node_relationships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  sourceNodeId: varchar("source_node_id").references(() => governanceNodes.id),
  targetNodeId: varchar("target_node_id").references(() => governanceNodes.id),
  
  relationshipType: text("relationship_type").notNull(), // implements, derives_from, supports, validates, etc.
  strength: integer("strength").default(1), // 1-5 for visualization
  
  description: text("description"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert Schemas for Governance Module
export const insertAiSystemSchema = createInsertSchema(aiSystems).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDataAssetSchema = createInsertSchema(dataAssets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGovernanceDecisionSchema = createInsertSchema(governanceDecisions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRaciItemSchema = createInsertSchema(raciItems).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGovernanceChangeEventSchema = createInsertSchema(governanceChangeEvents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGovernanceChangeImpactSchema = createInsertSchema(governanceChangeImpacts).omit({ id: true, createdAt: true });
export const insertGovernanceNodeSchema = createInsertSchema(governanceNodes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGovernanceNodeRelationshipSchema = createInsertSchema(governanceNodeRelationships).omit({ id: true, createdAt: true });

// Types for Governance Module
export type AiSystem = typeof aiSystems.$inferSelect;
export type InsertAiSystem = z.infer<typeof insertAiSystemSchema>;
export type DataAsset = typeof dataAssets.$inferSelect;
export type InsertDataAsset = z.infer<typeof insertDataAssetSchema>;
export type GovernanceDecision = typeof governanceDecisions.$inferSelect;
export type InsertGovernanceDecision = z.infer<typeof insertGovernanceDecisionSchema>;
export type RaciItem = typeof raciItems.$inferSelect;
export type InsertRaciItem = z.infer<typeof insertRaciItemSchema>;
export type GovernanceChangeEvent = typeof governanceChangeEvents.$inferSelect;
export type InsertGovernanceChangeEvent = z.infer<typeof insertGovernanceChangeEventSchema>;
export type GovernanceChangeImpact = typeof governanceChangeImpacts.$inferSelect;
export type InsertGovernanceChangeImpact = z.infer<typeof insertGovernanceChangeImpactSchema>;
export type GovernanceNode = typeof governanceNodes.$inferSelect;
export type InsertGovernanceNode = z.infer<typeof insertGovernanceNodeSchema>;
export type GovernanceNodeRelationship = typeof governanceNodeRelationships.$inferSelect;
export type InsertGovernanceNodeRelationship = z.infer<typeof insertGovernanceNodeRelationshipSchema>;

// =============================================
// ADVANCED RISK MODULE TABLES
// =============================================

// Risk Scenarios - Scenario-based risk modeling
export const riskScenarios = pgTable("risk_scenarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  name: text("name").notNull(),
  description: text("description"),
  scenarioType: text("scenario_type").notNull(), // ransomware, data_breach, system_failure, natural_disaster, vendor_failure
  
  // Scenario Details
  trigger: text("trigger"), // What initiates the scenario
  threatActor: text("threat_actor"), // Internal, external, natural
  attackVector: text("attack_vector"), // Phishing, malware, physical, etc.
  
  // Impact Path
  affectedSystems: text("affected_systems").array(),
  affectedProcesses: text("affected_processes").array(),
  affectedData: text("affected_data").array(),
  impactPath: jsonb("impact_path"), // Chain of events
  
  // Impact Assessment
  financialImpactMin: integer("financial_impact_min"),
  financialImpactMax: integer("financial_impact_max"),
  financialImpactMostLikely: integer("financial_impact_most_likely"),
  operationalImpact: text("operational_impact"),
  reputationalImpact: text("reputational_impact"),
  regulatoryImpact: text("regulatory_impact"),
  estimatedDowntimeHours: integer("estimated_downtime_hours"),
  
  // Recovery Assumptions
  recoveryStrategy: text("recovery_strategy"),
  rtoHours: integer("rto_hours"),
  rpoHours: integer("rpo_hours"),
  recoveryResources: text("recovery_resources").array(),
  
  // Scoring
  likelihood: integer("likelihood").default(3), // 1-5
  impact: integer("impact").default(3), // 1-5
  velocity: text("velocity"), // rapid, moderate, slow
  inherentRiskScore: integer("inherent_risk_score"),
  residualRiskScore: integer("residual_risk_score"),
  
  // Related Entities
  relatedRisks: text("related_risks").array(),
  relatedControls: text("related_controls").array(),
  relatedBcpPlan: varchar("related_bcp_plan"),
  
  // Status
  status: statusEnum("status").default("active"),
  lastAssessmentDate: timestamp("last_assessment_date"),
  nextReviewDate: timestamp("next_review_date"),
  
  ownerId: varchar("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Risk Appetite - Organizational risk tolerance settings
export const riskAppetite = pgTable("risk_appetite", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  
  name: text("name").notNull(),
  category: text("category").notNull(), // strategic, operational, financial, compliance, cyber, privacy
  
  // Quantitative Thresholds
  acceptableRiskScore: integer("acceptable_risk_score").default(6), // Below this = acceptable
  tolerableRiskScore: integer("tolerable_risk_score").default(12), // Between acceptable and this = tolerable
  unacceptableThreshold: integer("unacceptable_threshold").default(16), // Above this = unacceptable
  
  // Financial Thresholds
  maxFinancialExposure: integer("max_financial_exposure"), // Maximum acceptable financial loss
  maxSingleEventLoss: integer("max_single_event_loss"),
  annualLossExpectancy: integer("annual_loss_expectancy"),
  
  // Operational Thresholds
  maxDowntimeHours: integer("max_downtime_hours"),
  minDataRecoveryPercent: integer("min_data_recovery_percent"),
  maxIncidentsPerMonth: integer("max_incidents_per_month"),
  
  // Compliance Thresholds
  minComplianceScore: integer("min_compliance_score").default(80),
  maxOpenFindings: integer("max_open_findings").default(5),
  maxCriticalFindings: integer("max_critical_findings").default(0),
  
  // Escalation Rules
  autoEscalateOnBreach: boolean("auto_escalate_on_breach").default(true),
  escalationRecipients: text("escalation_recipients").array(),
  breachNotificationTemplate: text("breach_notification_template"),
  
  // Status
  isActive: boolean("is_active").default(true),
  effectiveDate: timestamp("effective_date"),
  reviewDate: timestamp("review_date"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Risk Appetite Breaches - Track when appetite thresholds are exceeded
export const riskAppetiteBreaches = pgTable("risk_appetite_breaches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  appetiteId: varchar("appetite_id").references(() => riskAppetite.id),
  
  breachType: text("breach_type").notNull(), // score_exceeded, financial_exceeded, downtime_exceeded
  breachDescription: text("breach_description"),
  
  // Breach Details
  thresholdValue: integer("threshold_value"),
  actualValue: integer("actual_value"),
  severity: riskLevelEnum("severity").default("high"),
  
  // Related Risk
  riskId: varchar("risk_id").references(() => risks.id),
  scenarioId: varchar("scenario_id").references(() => riskScenarios.id),
  
  // Resolution
  status: statusEnum("status").default("active"), // active, acknowledged, resolved
  acknowledgedBy: varchar("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolutionNotes: text("resolution_notes"),
  resolvedAt: timestamp("resolved_at"),
  
  // Escalation
  escalatedTo: text("escalated_to").array(),
  escalatedAt: timestamp("escalated_at"),
  
  detectedAt: timestamp("detected_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Risk Aggregation - Concentration risk by various dimensions
export const riskAggregation = pgTable("risk_aggregation", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  aggregationType: text("aggregation_type").notNull(), // vendor, platform, region, data_type, business_unit
  aggregationKey: text("aggregation_key").notNull(), // The specific vendor/platform/region name
  
  // Metrics
  totalRisks: integer("total_risks").default(0),
  criticalRisks: integer("critical_risks").default(0),
  highRisks: integer("high_risks").default(0),
  mediumRisks: integer("medium_risks").default(0),
  lowRisks: integer("low_risks").default(0),
  
  aggregatedRiskScore: integer("aggregated_risk_score"),
  concentrationPercent: integer("concentration_percent"), // % of total risks in this aggregation
  
  // Dependency Analysis
  dependentServices: integer("dependent_services").default(0),
  singlePointOfFailure: boolean("single_point_of_failure").default(false),
  spofDescription: text("spof_description"),
  
  // Financial Impact
  totalFinancialExposure: integer("total_financial_exposure"),
  
  // Trend
  previousScore: integer("previous_score"),
  scoreTrend: text("score_trend"), // increasing, decreasing, stable
  
  // Last Calculated
  calculatedAt: timestamp("calculated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Control Effectiveness - Track design vs operating effectiveness
export const controlEffectiveness = pgTable("control_effectiveness", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  controlId: varchar("control_id").references(() => controls.id),
  
  // Design Effectiveness
  designEffectiveness: integer("design_effectiveness").default(0), // 0-100
  designAssessmentDate: timestamp("design_assessment_date"),
  designAssessmentNotes: text("design_assessment_notes"),
  designEvidence: text("design_evidence").array(),
  
  // Operating Effectiveness
  operatingEffectiveness: integer("operating_effectiveness").default(0), // 0-100
  operatingAssessmentDate: timestamp("operating_assessment_date"),
  operatingAssessmentNotes: text("operating_assessment_notes"),
  operatingEvidence: text("operating_evidence").array(),
  
  // Combined Score
  overallEffectiveness: integer("overall_effectiveness").default(0), // Weighted average
  effectivenessRating: text("effectiveness_rating"), // effective, partially_effective, ineffective
  
  // Testing
  testFrequency: text("test_frequency"), // daily, weekly, monthly, quarterly, annually
  lastTestDate: timestamp("last_test_date"),
  nextTestDate: timestamp("next_test_date"),
  testResults: jsonb("test_results"),
  
  // Impact on Risk
  riskReductionFactor: integer("risk_reduction_factor").default(50), // How much this control reduces risk (%)
  
  // Trend
  previousScore: integer("previous_score"),
  scoreTrend: text("score_trend"), // improving, declining, stable
  
  assessedBy: varchar("assessed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Risk Signals - Continuous risk signal inputs
export const riskSignals = pgTable("risk_signals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  signalType: text("signal_type").notNull(), // vulnerability, incident, control_failure, compliance_gap, vendor_issue
  signalSource: text("signal_source"), // cloud_security, itsm, iam, vulnerability_scanner, bcm
  
  title: text("title").notNull(),
  description: text("description"),
  
  // Signal Details
  severity: riskLevelEnum("severity").default("medium"),
  confidence: integer("confidence").default(80), // 0-100, how confident we are in this signal
  
  // Related Entities
  relatedRiskId: varchar("related_risk_id").references(() => risks.id),
  relatedControlId: varchar("related_control_id").references(() => controls.id),
  relatedAsset: text("related_asset"),
  
  // Impact
  riskScoreImpact: integer("risk_score_impact"), // How much this signal should adjust risk score
  requiresAction: boolean("requires_action").default(false),
  
  // Status
  status: statusEnum("status").default("active"), // active, acknowledged, resolved, dismissed
  acknowledgedBy: varchar("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  
  detectedAt: timestamp("detected_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert Schemas for Advanced Risk Module
export const insertRiskScenarioSchema = createInsertSchema(riskScenarios).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRiskAppetiteSchema = createInsertSchema(riskAppetite).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRiskAppetiteBreachSchema = createInsertSchema(riskAppetiteBreaches).omit({ id: true, createdAt: true });
export const insertRiskAggregationSchema = createInsertSchema(riskAggregation).omit({ id: true, createdAt: true, updatedAt: true });
export const insertControlEffectivenessSchema = createInsertSchema(controlEffectiveness).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRiskSignalSchema = createInsertSchema(riskSignals).omit({ id: true, createdAt: true });

// Types for Advanced Risk Module
export type RiskScenario = typeof riskScenarios.$inferSelect;
export type InsertRiskScenario = z.infer<typeof insertRiskScenarioSchema>;
export type RiskAppetite = typeof riskAppetite.$inferSelect;
export type InsertRiskAppetite = z.infer<typeof insertRiskAppetiteSchema>;
export type RiskAppetiteBreach = typeof riskAppetiteBreaches.$inferSelect;
export type InsertRiskAppetiteBreach = z.infer<typeof insertRiskAppetiteBreachSchema>;
export type RiskAggregation = typeof riskAggregation.$inferSelect;
export type InsertRiskAggregation = z.infer<typeof insertRiskAggregationSchema>;
export type ControlEffectiveness = typeof controlEffectiveness.$inferSelect;
export type InsertControlEffectiveness = z.infer<typeof insertControlEffectivenessSchema>;
export type RiskSignal = typeof riskSignals.$inferSelect;
export type InsertRiskSignal = z.infer<typeof insertRiskSignalSchema>;

// ==========================================
// Credential Vault - Secure Secrets Management
// ==========================================

export const credentialStorageTypeEnum = pgEnum("credential_storage_type", ["local", "external_kms", "integration"]);
export const kmsProviderEnum = pgEnum("kms_provider", ["hashicorp_vault", "aws_kms", "azure_keyvault", "gcp_kms", "custom"]);
export const credentialTypeEnum = pgEnum("credential_type", ["api_key", "oauth_token", "service_account", "database", "ssh_key", "certificate", "password", "custom"]);

// External Key Management System Configurations
export const externalKmsConfigs = pgTable("external_kms_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  name: text("name").notNull(),
  description: text("description"),
  provider: kmsProviderEnum("provider").notNull(),
  
  // Connection settings (stored encrypted)
  endpoint: text("endpoint"), // e.g., https://vault.company.com:8200
  namespace: text("namespace"), // HashiCorp namespace or equivalent
  mountPath: text("mount_path"), // e.g., secret/data/grc-shield
  
  // Authentication (sensitive - encrypted)
  authMethod: text("auth_method"), // token, approle, kubernetes, aws, azure, gcp
  authConfig: jsonb("auth_config"), // Encrypted auth configuration
  
  // TLS Configuration
  tlsEnabled: boolean("tls_enabled").default(true),
  tlsSkipVerify: boolean("tls_skip_verify").default(false),
  caCertificate: text("ca_certificate"), // Encrypted CA cert for custom CAs
  
  // Status
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  lastHealthCheck: timestamp("last_health_check"),
  healthStatus: text("health_status"), // healthy, degraded, unreachable
  
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Credential Vault - Main credential storage
export const credentialVault = pgTable("credential_vault", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  // Credential identification
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"), // integration, database, api, infrastructure, custom
  credentialType: credentialTypeEnum("credential_type").notNull(),
  
  // Storage type
  storageType: credentialStorageTypeEnum("storage_type").default("local"),
  
  // For local storage (encrypted at rest)
  encryptedValue: text("encrypted_value"), // AES-256 encrypted credential value
  encryptionKeyId: text("encryption_key_id"), // Key rotation support
  
  // For external KMS storage
  externalKmsId: varchar("external_kms_id").references(() => externalKmsConfigs.id),
  externalPath: text("external_path"), // Path in external KMS
  externalVersion: text("external_version"), // Version/revision in KMS
  
  // For Replit integration secrets
  integrationSecretKey: text("integration_secret_key"), // Reference to Replit secret
  
  // Metadata
  metadata: jsonb("metadata"), // Additional non-sensitive metadata
  tags: text("tags").array(),
  
  // Access control
  allowedRoles: text("allowed_roles").array(), // Roles that can access this credential
  allowedUsers: text("allowed_users").array(), // Specific users that can access
  
  // Rotation policy
  rotationEnabled: boolean("rotation_enabled").default(false),
  rotationIntervalDays: integer("rotation_interval_days"),
  lastRotatedAt: timestamp("last_rotated_at"),
  nextRotationAt: timestamp("next_rotation_at"),
  rotationWarningDays: integer("rotation_warning_days").default(7),
  
  // Expiration
  expiresAt: timestamp("expires_at"),
  
  // Status
  isActive: boolean("is_active").default(true),
  
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Credential Access Logs - Audit trail
export const credentialAccessLogs = pgTable("credential_access_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  credentialId: varchar("credential_id").references(() => credentialVault.id),
  
  // Access details
  action: text("action").notNull(), // view, retrieve, rotate, update, delete, create
  accessedBy: varchar("accessed_by").references(() => users.id),
  
  // Context
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  sessionId: text("session_id"),
  
  // Result
  success: boolean("success").default(true),
  failureReason: text("failure_reason"),
  
  // Metadata
  metadata: jsonb("metadata"),
  
  accessedAt: timestamp("accessed_at").defaultNow(),
});

// Insert Schemas for Credential Vault
export const insertExternalKmsConfigSchema = createInsertSchema(externalKmsConfigs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCredentialVaultSchema = createInsertSchema(credentialVault).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCredentialAccessLogSchema = createInsertSchema(credentialAccessLogs).omit({ id: true, accessedAt: true });

// Types for Credential Vault
export type ExternalKmsConfig = typeof externalKmsConfigs.$inferSelect;
export type InsertExternalKmsConfig = z.infer<typeof insertExternalKmsConfigSchema>;
export type CredentialVault = typeof credentialVault.$inferSelect;
export type InsertCredentialVault = z.infer<typeof insertCredentialVaultSchema>;
export type CredentialAccessLog = typeof credentialAccessLogs.$inferSelect;
export type InsertCredentialAccessLog = z.infer<typeof insertCredentialAccessLogSchema>;

// Re-export auth models
export * from "./models/auth";
