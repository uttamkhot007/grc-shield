import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Tenant } from "@shared/schema";

interface TenantContextType {
  currentTenantId: string | null;
  currentTenant: Tenant | null;
  setCurrentTenantId: (id: string | null) => void;
  setTenants: (tenants: Tenant[]) => void;
  tenants: Tenant[];
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("grc-current-tenant");
    if (stored && stored !== "null") {
      setCurrentTenantId(stored);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (currentTenantId !== null) {
      localStorage.setItem("grc-current-tenant", currentTenantId);
    } else {
      localStorage.removeItem("grc-current-tenant");
    }
  }, [currentTenantId]);

  const currentTenant = tenants.find(t => t.id === currentTenantId) || null;

  return (
    <TenantContext.Provider value={{
      currentTenantId,
      currentTenant,
      setCurrentTenantId,
      tenants,
      setTenants,
      isLoading,
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}
