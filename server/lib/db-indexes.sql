-- Database Indexes for Scalability & Performance
-- These indexes support 100s of tenants and 1M+ users/devices
-- Run with: psql $DATABASE_URL -f server/lib/db-indexes.sql

-- ============================================
-- TENANT ISOLATION INDEXES (Critical for multi-tenancy)
-- ============================================

-- Users by tenant (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_active ON users(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login DESC);

-- Risks by tenant with status
CREATE INDEX IF NOT EXISTS idx_risks_tenant_id ON risks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_risks_tenant_status ON risks(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_risks_tenant_level ON risks(tenant_id, risk_level);
CREATE INDEX IF NOT EXISTS idx_risks_created_at ON risks(created_at DESC);

-- Policies by tenant
CREATE INDEX IF NOT EXISTS idx_policies_tenant_id ON policies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_policies_tenant_status ON policies(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_policies_created_at ON policies(created_at DESC);

-- Controls by tenant
CREATE INDEX IF NOT EXISTS idx_controls_tenant_id ON controls(tenant_id);
CREATE INDEX IF NOT EXISTS idx_controls_tenant_status ON controls(tenant_id, status);

-- Vendors by tenant
CREATE INDEX IF NOT EXISTS idx_vendors_tenant_id ON vendors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vendors_tenant_status ON vendors(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_vendors_risk_tier ON vendors(tenant_id, risk_tier);

-- Audits by tenant
CREATE INDEX IF NOT EXISTS idx_audits_tenant_id ON audits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audits_tenant_status ON audits(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_audits_dates ON audits(start_date, end_date);

-- ============================================
-- FRAMEWORK & CONTROL CATALOG INDEXES (Global)
-- ============================================

-- Frameworks lookup
CREATE INDEX IF NOT EXISTS idx_frameworks_category ON frameworks(category);
CREATE INDEX IF NOT EXISTS idx_frameworks_status ON frameworks(status);
CREATE INDEX IF NOT EXISTS idx_frameworks_name ON frameworks(name);

-- Security Controls Catalog (1000+ controls)
CREATE INDEX IF NOT EXISTS idx_security_controls_category ON security_controls_catalog(category);
CREATE INDEX IF NOT EXISTS idx_security_controls_status ON security_controls_catalog(implementation_status);
CREATE INDEX IF NOT EXISTS idx_security_controls_criticality ON security_controls_catalog(criticality);
CREATE INDEX IF NOT EXISTS idx_security_controls_ai_enriched ON security_controls_catalog(is_ai_enriched);

-- Risk Catalog
CREATE INDEX IF NOT EXISTS idx_risk_catalog_category ON risk_catalog(category);
CREATE INDEX IF NOT EXISTS idx_risk_catalog_subcategory ON risk_catalog(sub_category);
CREATE INDEX IF NOT EXISTS idx_risk_catalog_level ON risk_catalog(inherent_risk_level);

-- ============================================
-- ACTIVITY & AUDIT LOG INDEXES (High volume)
-- ============================================

-- Activity logs (high volume - partitioning candidate)
CREATE INDEX IF NOT EXISTS idx_activity_logs_tenant ON activity_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

-- ============================================
-- SEARCH & FILTERING INDEXES (Performance)
-- ============================================

-- Full-text search support (if using PostgreSQL FTS)
-- CREATE INDEX IF NOT EXISTS idx_policies_search ON policies USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));
-- CREATE INDEX IF NOT EXISTS idx_risks_search ON risks USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ============================================
-- FOREIGN KEY RELATIONSHIP INDEXES
-- ============================================

-- Tenant invitations
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_email ON tenant_invitations(email);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_status ON tenant_invitations(status);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_token ON tenant_invitations(invite_token);

-- Licenses
CREATE INDEX IF NOT EXISTS idx_licenses_tenant ON licenses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_licenses_active ON licenses(tenant_id, is_active);

-- Onboarding requests
CREATE INDEX IF NOT EXISTS idx_onboarding_email ON onboarding_requests(email);
CREATE INDEX IF NOT EXISTS idx_onboarding_status ON onboarding_requests(status);

-- Employee devices (high volume for 1M+ devices)
CREATE INDEX IF NOT EXISTS idx_employee_devices_tenant ON employee_devices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employee_devices_user ON employee_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_devices_status ON employee_devices(status);
CREATE INDEX IF NOT EXISTS idx_employee_devices_type ON employee_devices(device_type);

-- Policy acknowledgments (high volume)
CREATE INDEX IF NOT EXISTS idx_policy_acks_tenant ON policy_acknowledgments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_policy_acks_user ON policy_acknowledgments(user_id);
CREATE INDEX IF NOT EXISTS idx_policy_acks_policy ON policy_acknowledgments(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_acks_status ON policy_acknowledgments(status);

-- Training assignments (high volume)
CREATE INDEX IF NOT EXISTS idx_training_assignments_tenant ON training_assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_training_assignments_user ON training_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_training_assignments_status ON training_assignments(status);

-- ============================================
-- SECURITY MODULE INDEXES
-- ============================================

-- Email security assessments
CREATE INDEX IF NOT EXISTS idx_email_security_tenant ON email_security_assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_email_security_domain ON email_security_assessments(domain);

-- Web app scans
CREATE INDEX IF NOT EXISTS idx_web_scans_tenant ON web_app_scans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_web_scans_status ON web_app_scans(status);

-- Dark web monitors
CREATE INDEX IF NOT EXISTS idx_dark_web_tenant ON dark_web_monitors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dark_web_domain ON dark_web_monitors(domain);

-- Threat intelligence
CREATE INDEX IF NOT EXISTS idx_threat_intel_tenant ON threat_intel_feeds(tenant_id);
CREATE INDEX IF NOT EXISTS idx_threat_indicators_feed ON threat_indicators(feed_id);

-- ============================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================

-- Dashboard statistics (frequently queried)
CREATE INDEX IF NOT EXISTS idx_risks_tenant_status_level ON risks(tenant_id, status, risk_level);
CREATE INDEX IF NOT EXISTS idx_policies_tenant_status_type ON policies(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_vendors_tenant_risk ON vendors(tenant_id, risk_tier, status);

-- User lookup patterns
CREATE INDEX IF NOT EXISTS idx_users_tenant_role ON users(tenant_id, role);
CREATE INDEX IF NOT EXISTS idx_users_tenant_dept ON users(tenant_id, department);

-- ============================================
-- PARTIAL INDEXES (Optimize specific queries)
-- ============================================

-- Active users only (common filter)
CREATE INDEX IF NOT EXISTS idx_users_active_only ON users(tenant_id) WHERE is_active = true;

-- Open risks only
CREATE INDEX IF NOT EXISTS idx_risks_open_only ON risks(tenant_id, risk_level) WHERE status != 'completed';

-- Pending approvals
CREATE INDEX IF NOT EXISTS idx_pending_approvals ON onboarding_requests(created_at DESC) WHERE status = 'pending';

-- ============================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- ============================================

ANALYZE users;
ANALYZE tenants;
ANALYZE risks;
ANALYZE policies;
ANALYZE controls;
ANALYZE vendors;
ANALYZE frameworks;
ANALYZE security_controls_catalog;
ANALYZE activity_logs;
