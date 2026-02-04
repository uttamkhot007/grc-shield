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
    }
  }, [fetchedTenants, setTenants]);

  if (isLoading || tenants.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

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
