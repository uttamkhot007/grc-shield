import { apiRequest } from "./queryClient";
import type { 
  Framework, 
  Policy, 
  Risk, 
  Audit, 
  Vendor, 
  AiInsight,
  Alert,
  User,
  Tenant,
  Process,
  ProcessTemplate,
  Procedure,
  ProcedureTemplate,
  IntegrationSetting,
} from "@shared/schema";

export async function fetchFrameworks(): Promise<Framework[]> {
  const response = await fetch("/api/frameworks");
  if (!response.ok) throw new Error("Failed to fetch frameworks");
  return response.json();
}

export async function fetchPolicies(tenantId?: string): Promise<Policy[]> {
  const url = tenantId ? `/api/policies?tenantId=${tenantId}` : "/api/policies";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch policies");
  return response.json();
}

export async function fetchRisks(tenantId?: string): Promise<Risk[]> {
  const url = tenantId ? `/api/risks?tenantId=${tenantId}` : "/api/risks";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch risks");
  return response.json();
}

export async function fetchAudits(tenantId?: string): Promise<Audit[]> {
  const url = tenantId ? `/api/audits?tenantId=${tenantId}` : "/api/audits";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch audits");
  return response.json();
}

export async function fetchVendors(tenantId?: string): Promise<Vendor[]> {
  const url = tenantId ? `/api/vendors?tenantId=${tenantId}` : "/api/vendors";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch vendors");
  return response.json();
}

export async function fetchAiInsights(tenantId?: string): Promise<AiInsight[]> {
  const url = tenantId ? `/api/ai-insights?tenantId=${tenantId}` : "/api/ai-insights";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch AI insights");
  return response.json();
}

export async function fetchAlerts(tenantId: string, userId?: string): Promise<Alert[]> {
  let url = `/api/alerts?tenantId=${tenantId}`;
  if (userId) url += `&userId=${userId}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch alerts");
  return response.json();
}

export async function fetchDashboardStats(tenantId?: string): Promise<{
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
  const url = tenantId ? `/api/dashboard/stats?tenantId=${tenantId}` : "/api/dashboard/stats";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch dashboard stats");
  return response.json();
}

export async function fetchUsers(tenantId?: string): Promise<User[]> {
  let url = "/api/users";
  if (tenantId) url += `?tenantId=${tenantId}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
}

export async function fetchTenants(): Promise<Tenant[]> {
  const response = await fetch("/api/tenants");
  if (!response.ok) throw new Error("Failed to fetch tenants");
  return response.json();
}

export async function createPolicy(data: Omit<Policy, "id" | "createdAt" | "updatedAt">): Promise<Policy> {
  const response = await fetch("/api/policies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create policy");
  return response.json();
}

export async function updatePolicy(id: string, data: Partial<Policy>): Promise<Policy> {
  const response = await fetch(`/api/policies/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update policy");
  return response.json();
}

export async function deletePolicy(id: string): Promise<void> {
  const response = await fetch(`/api/policies/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete policy");
}

export async function submitPolicyForApproval(id: string): Promise<Policy> {
  const response = await fetch(`/api/policies/${id}/submit-for-approval`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to submit policy for approval");
  return response.json();
}

export async function approvePolicy(id: string, approverId: string): Promise<Policy> {
  const response = await fetch(`/api/policies/${id}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approverId }),
  });
  if (!response.ok) throw new Error("Failed to approve policy");
  return response.json();
}

export async function rejectPolicy(id: string): Promise<Policy> {
  const response = await fetch(`/api/policies/${id}/reject`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to reject policy");
  return response.json();
}

export async function createRisk(data: Omit<Risk, "id" | "createdAt" | "updatedAt">): Promise<Risk> {
  const response = await fetch("/api/risks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create risk");
  return response.json();
}

export async function updateRisk(id: string, data: Partial<Risk>): Promise<Risk> {
  const response = await fetch(`/api/risks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update risk");
  return response.json();
}

export async function deleteRisk(id: string): Promise<void> {
  const response = await fetch(`/api/risks/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete risk");
}

// Processes & Procedures
export async function fetchProcesses(tenantId?: string): Promise<Process[]> {
  const url = tenantId ? `/api/processes?tenantId=${tenantId}` : "/api/processes";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch processes");
  return response.json();
}

export async function createProcess(data: Omit<Process, "id" | "createdAt" | "updatedAt">): Promise<Process> {
  const response = await fetch("/api/processes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create process");
  return response.json();
}

export async function updateProcess(id: string, data: Partial<Process>): Promise<Process> {
  const response = await fetch(`/api/processes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update process");
  return response.json();
}

export async function deleteProcess(id: string): Promise<void> {
  const response = await fetch(`/api/processes/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete process");
}

export async function fetchProcessTemplates(): Promise<ProcessTemplate[]> {
  const response = await fetch("/api/process-templates");
  if (!response.ok) throw new Error("Failed to fetch process templates");
  return response.json();
}

// Procedures
export async function fetchProcedures(tenantId?: string): Promise<Procedure[]> {
  const url = tenantId ? `/api/procedures?tenantId=${tenantId}` : "/api/procedures";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch procedures");
  return response.json();
}

export async function createProcedure(data: Omit<Procedure, "id" | "createdAt" | "updatedAt">): Promise<Procedure> {
  const response = await fetch("/api/procedures", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create procedure");
  return response.json();
}

export async function updateProcedure(id: string, data: Partial<Procedure>): Promise<Procedure> {
  const response = await fetch(`/api/procedures/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update procedure");
  return response.json();
}

export async function deleteProcedure(id: string): Promise<void> {
  const response = await fetch(`/api/procedures/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete procedure");
}

export async function fetchProcedureTemplates(): Promise<ProcedureTemplate[]> {
  const response = await fetch("/api/procedure-templates");
  if (!response.ok) throw new Error("Failed to fetch procedure templates");
  return response.json();
}

// Integration Settings
export async function fetchIntegrationSettings(tenantId?: string): Promise<IntegrationSetting[]> {
  const url = tenantId ? `/api/integration-settings?tenantId=${tenantId}` : "/api/integration-settings";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch integration settings");
  return response.json();
}

export async function createIntegrationSetting(data: Omit<IntegrationSetting, "id" | "createdAt" | "updatedAt">): Promise<IntegrationSetting> {
  const response = await fetch("/api/integration-settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create integration setting");
  return response.json();
}

export async function updateIntegrationSetting(id: string, data: Partial<IntegrationSetting>): Promise<IntegrationSetting> {
  const response = await fetch(`/api/integration-settings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update integration setting");
  return response.json();
}

export async function deleteIntegrationSetting(id: string): Promise<void> {
  const response = await fetch(`/api/integration-settings/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete integration setting");
}
