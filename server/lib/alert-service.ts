import { storage } from "../storage";
import type { InsertAlert, Risk, ComplianceItem, Policy, Vendor, Audit } from "@shared/schema";

type AlertSeverity = "critical" | "high" | "medium" | "low";

interface AlertTriggerContext {
  tenantId: string;
  userId?: string;
}

export async function triggerRiskAlert(
  risk: Risk,
  context: AlertTriggerContext,
  action: "created" | "updated" | "escalated"
): Promise<void> {
  const riskScore = (risk.likelihood || 1) * (risk.impact || 1);
  const severity = risk.riskLevel as AlertSeverity || 
    (riskScore >= 16 ? "critical" : riskScore >= 9 ? "high" : riskScore >= 4 ? "medium" : "low");

  if (severity === "critical" || severity === "high") {
    const alertData: InsertAlert = {
      tenantId: context.tenantId,
      userId: context.userId || null,
      type: severity === "critical" ? "risk_critical" : "risk_high",
      title: `${severity === "critical" ? "Critical" : "High"} Risk ${action === "created" ? "Identified" : action === "updated" ? "Updated" : "Escalated"}: ${risk.title}`,
      message: `Risk "${risk.title}" has a score of ${riskScore} (${risk.likelihood || 1} x ${risk.impact || 1}). ${risk.description || ""}`.substring(0, 500),
      severity,
      isRead: false,
      actionUrl: `/risk/register?riskId=${risk.id}`,
    };

    await storage.createAlert(alertData);
  }
}

export async function triggerComplianceAlert(
  item: ComplianceItem,
  context: AlertTriggerContext,
  alertType: "breach" | "due_soon" | "overdue"
): Promise<void> {
  const severity: AlertSeverity = alertType === "breach" || alertType === "overdue" ? "critical" : "high";
  
  const alertData: InsertAlert = {
    tenantId: context.tenantId,
    userId: context.userId || null,
    type: alertType === "breach" ? "compliance_breach" : "compliance_due",
    title: alertType === "breach" 
      ? `Compliance Breach Detected: ${item.controlId || item.id}`
      : alertType === "overdue"
        ? `Overdue Compliance Requirement: ${item.controlId || item.id}`
        : `Compliance Deadline Approaching: ${item.controlId || item.id}`,
    message: `Compliance item "${item.controlId}" requires attention. Status: ${item.status}. ${item.notes || ""}`.substring(0, 500),
    severity,
    isRead: false,
    actionUrl: `/compliance/status`,
  };

  await storage.createAlert(alertData);
}

export async function triggerPolicyAlert(
  policy: Policy,
  context: AlertTriggerContext,
  alertType: "approval_required" | "expired" | "expiring_soon" | "rejected"
): Promise<void> {
  const severityMap: Record<string, AlertSeverity> = {
    approval_required: "medium",
    expired: "high",
    expiring_soon: "medium",
    rejected: "high",
  };
  const severity = severityMap[alertType] || "medium";

  const titleMap: Record<string, string> = {
    approval_required: `Policy Approval Required: ${policy.title}`,
    expired: `Policy Expired: ${policy.title}`,
    expiring_soon: `Policy Expiring Soon: ${policy.title}`,
    rejected: `Policy Rejected: ${policy.title}`,
  };

  const alertData: InsertAlert = {
    tenantId: context.tenantId,
    userId: context.userId || null,
    type: "policy_approval",
    title: titleMap[alertType] || `Policy Update: ${policy.title}`,
    message: `Policy "${policy.title}" ${alertType.replace(/_/g, " ")}. Version: ${policy.version || "1.0"}. ${policy.description || ""}`.substring(0, 500),
    severity,
    isRead: false,
    actionUrl: `/governance/policies?policyId=${policy.id}`,
  };

  await storage.createAlert(alertData);
}

export async function triggerVendorRiskAlert(
  vendor: Vendor,
  context: AlertTriggerContext,
  riskLevel: string
): Promise<void> {
  const severity: AlertSeverity = riskLevel === "critical" || riskLevel === "high" ? "high" : "medium";
  
  if (riskLevel === "critical" || riskLevel === "high") {
    const alertData: InsertAlert = {
      tenantId: context.tenantId,
      userId: context.userId || null,
      type: "vendor_risk",
      title: `${riskLevel === "critical" ? "Critical" : "High"} Vendor Risk: ${vendor.name}`,
      message: `Vendor "${vendor.name}" has been assessed with ${riskLevel} risk level. Category: ${vendor.category || "N/A"}.`.substring(0, 500),
      severity,
      isRead: false,
      actionUrl: `/vendors?vendorId=${vendor.id}`,
    };

    await storage.createAlert(alertData);
  }
}

export async function triggerAuditFindingAlert(
  audit: Audit,
  context: AlertTriggerContext,
  findingsCount: number,
  criticalCount: number
): Promise<void> {
  if (findingsCount === 0) return;

  const severity: AlertSeverity = criticalCount > 0 ? "critical" : findingsCount > 5 ? "high" : "medium";
  
  const alertData: InsertAlert = {
    tenantId: context.tenantId,
    userId: context.userId || null,
    type: "audit_finding",
    title: `Audit Findings: ${audit.title}`,
    message: `Audit "${audit.title}" has ${findingsCount} finding(s)${criticalCount > 0 ? `, including ${criticalCount} critical` : ""}.`.substring(0, 500),
    severity,
    isRead: false,
    actionUrl: `/audits/${audit.id}`,
  };

  await storage.createAlert(alertData);
}

export async function triggerSecurityAlert(
  context: AlertTriggerContext,
  alertType: "vulnerability" | "breach_detected" | "threat_intel",
  title: string,
  message: string,
  severity: AlertSeverity = "high"
): Promise<void> {
  const alertData: InsertAlert = {
    tenantId: context.tenantId,
    userId: context.userId || null,
    type: "security_alert",
    title,
    message: message.substring(0, 500),
    severity,
    isRead: false,
    actionUrl: `/security`,
  };

  await storage.createAlert(alertData);
}

export async function checkAndTriggerComplianceDeadlines(tenantId: string): Promise<number> {
  return 0;
}

export async function triggerSystemAlert(
  context: AlertTriggerContext,
  title: string,
  message: string,
  severity: AlertSeverity = "low"
): Promise<void> {
  const alertData: InsertAlert = {
    tenantId: context.tenantId,
    userId: context.userId || null,
    type: "system",
    title,
    message: message.substring(0, 500),
    severity,
    isRead: false,
    actionUrl: null,
  };

  await storage.createAlert(alertData);
}
