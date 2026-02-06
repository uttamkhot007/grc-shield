import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTenant } from "@/contexts/tenant-context";
import type { Tenant } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Globe } from "lucide-react";

export function TenantSwitcher() {
  const { currentTenantId, setCurrentTenantId, setTenants, tenants, currentTenant } = useTenant();
  
  const { data: fetchedTenants, isLoading } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
  });

  useEffect(() => {
    if (fetchedTenants) {
      setTenants(fetchedTenants);
      
      // Check if current tenant is still valid for this user
      const isCurrentTenantValid = currentTenantId && 
        fetchedTenants.some(t => t.id === currentTenantId);
      
      if (!isCurrentTenantValid && fetchedTenants.length > 0) {
        // Current tenant is not in user's available tenants, auto-select first one
        setCurrentTenantId(fetchedTenants[0].id);
      } else if (fetchedTenants.length === 0 && currentTenantId) {
        // User has no tenants, clear selection
        setCurrentTenantId(null);
      }
    }
  }, [fetchedTenants, setTenants, currentTenantId, setCurrentTenantId]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md">
        <Building2 className="h-4 w-4 text-primary animate-pulse" />
        <span className="text-sm text-muted-foreground">{currentTenant?.name || 'Loading...'}</span>
      </div>
    );
  }
  
  if (tenants.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md">
        <Building2 className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">{currentTenant?.name || 'No Organization'}</span>
      </div>
    );
  }

  // If user has only one tenant, just display the name without dropdown
  if (tenants.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md" data-testid="text-tenant-name">
        <Building2 className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">{tenants[0].name}</span>
      </div>
    );
  }

  // Multiple tenants - show dropdown with "All Organizations" option
  return (
    <Select 
      value={currentTenantId || "all"} 
      onValueChange={(value) => setCurrentTenantId(value === "all" ? null : value)}
    >
      <SelectTrigger className="w-56 bg-card/50 border-border/50" data-testid="select-tenant-switcher">
        <div className="flex items-center gap-2">
          {currentTenantId ? (
            <Building2 className="h-4 w-4 text-primary" />
          ) : (
            <Globe className="h-4 w-4 text-amber-400" />
          )}
          <SelectValue placeholder="Select organization" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-amber-400" />
            <span>All Organizations</span>
          </div>
        </SelectItem>
        {tenants.map((tenant) => (
          <SelectItem key={tenant.id} value={tenant.id}>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span>{tenant.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
