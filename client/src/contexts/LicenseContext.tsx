import { createContext, useContext, ReactNode, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "./tenant-context";
import { useAuth } from "@/hooks/use-auth";
import { LICENSE_MODULES } from "@shared/schema";

// Define license defaults here to avoid type issues
const LICENSE_DEFAULTS: Record<string, string[]> = {
  starter: ["dashboard", "policies", "frameworks"],
  professional: ["dashboard", "policies", "frameworks", "risk_register", "audits", "vendors", "controls"],
  enterprise: ["dashboard", "policies", "frameworks", "risk_register", "audits", "vendors", "controls", "ai_insights", "processes", "integrations"],
  unlimited: Object.values(LICENSE_MODULES),
};

type LicenseType = "starter" | "professional" | "enterprise" | "unlimited";

interface License {
  id: string;
  tenantId: string;
  licenseType: LicenseType;
  maxUsers: number;
  maxAdmins: number;
  maxAuditors: number;
  allowedFrameworks: string[] | null;
  allowedModules: string[] | null;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
}

interface LicenseContextType {
  license: License | null;
  isLoading: boolean;
  hasModule: (module: string) => boolean;
  hasFramework: (framework: string) => boolean;
  isLicenseValid: () => boolean;
  licenseType: LicenseType | null;
  canUpgrade: boolean;
  isSuperAdmin: boolean;
}

const LicenseContext = createContext<LicenseContextType | null>(null);

export function LicenseProvider({ children }: { children: ReactNode }) {
  const { currentTenantId } = useTenant();
  const { user } = useAuth();

  // Super admin has full access to all features regardless of license
  const isSuperAdmin = user?.role === "super_admin";

  const { data: licenses, isLoading } = useQuery<License[]>({
    queryKey: ["/api/licenses"],
  });

  const license = useMemo(() => {
    if (!licenses || !currentTenantId) return null;
    return licenses.find((l) => l.tenantId === currentTenantId && l.isActive) || null;
  }, [licenses, currentTenantId]);

  const hasModule = (module: string): boolean => {
    // Super admin bypasses all license restrictions
    if (isSuperAdmin) return true;
    
    if (!license) return false;
    
    // If allowedModules is set, use it; otherwise use defaults based on license type
    const modules = license.allowedModules || 
      LICENSE_DEFAULTS[license.licenseType] || 
      LICENSE_DEFAULTS.starter;
    
    return modules.includes(module);
  };

  const hasFramework = (framework: string): boolean => {
    // Super admin bypasses all license restrictions
    if (isSuperAdmin) return true;
    
    if (!license) return false;
    if (!license.allowedFrameworks) return true; // No restriction = all allowed
    return license.allowedFrameworks.includes(framework);
  };

  const isLicenseValid = (): boolean => {
    // Super admin always has valid access
    if (isSuperAdmin) return true;
    
    if (!license) return false;
    if (!license.isActive) return false;
    
    const now = new Date();
    if (license.validUntil) {
      const validUntil = new Date(license.validUntil);
      if (now > validUntil) return false;
    }
    
    return true;
  };

  const canUpgrade = !isSuperAdmin && license?.licenseType !== "unlimited";

  return (
    <LicenseContext.Provider
      value={{
        license,
        isLoading,
        hasModule,
        hasFramework,
        isLicenseValid,
        licenseType: license?.licenseType || null,
        canUpgrade,
        isSuperAdmin,
      }}
    >
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense() {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error("useLicense must be used within a LicenseProvider");
  }
  return context;
}

// Export LICENSE_MODULES for use in components
export { LICENSE_MODULES };
