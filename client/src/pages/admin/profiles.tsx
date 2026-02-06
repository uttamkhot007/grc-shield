import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Profile, ProfilePermission, Tenant } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Settings,
  Check,
  X,
  Eye,
  PenSquare,
  FileCheck,
  Download,
  Lock,
  Users,
} from "lucide-react";

interface ModuleInfo {
  id: string;
  name: string;
  category: string;
}

interface PermissionState {
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canExport: boolean;
}

type ProfileWithPermissions = Profile & { permissions?: ProfilePermission[] };

export default function ProfilesPage() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ProfileWithPermissions | null>(null);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ProfileWithPermissions | null>(null);
  const [permissionsState, setPermissionsState] = useState<PermissionState[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tenantId: "",
    isActive: true,
  });

  const { data: profiles, isLoading: profilesLoading } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
  });

  const { data: tenants } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
  });

  const { data: modules } = useQuery<ModuleInfo[]>({
    queryKey: ["/api/system/modules"],
  });

  const createProfileMutation = useMutation({
    mutationFn: (data: typeof formData) => apiRequest("POST", "/api/profiles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      toast({ title: "Profile created successfully" });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create profile", variant: "destructive" });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof formData> }) =>
      apiRequest("PATCH", `/api/profiles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      toast({ title: "Profile updated successfully" });
      setEditingProfile(null);
    },
    onError: () => {
      toast({ title: "Failed to update profile", variant: "destructive" });
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/profiles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      toast({ title: "Profile deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete profile", variant: "destructive" });
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: ({ profileId, permissions }: { profileId: string; permissions: PermissionState[] }) =>
      apiRequest("PUT", `/api/profiles/${profileId}/permissions`, { permissions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      toast({ title: "Permissions updated successfully" });
      setIsPermissionsOpen(false);
      setSelectedProfile(null);
    },
    onError: () => {
      toast({ title: "Failed to update permissions", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      tenantId: "",
      isActive: true,
    });
  };

  const handleCreateSubmit = () => {
    createProfileMutation.mutate(formData);
  };

  const handleUpdateSubmit = () => {
    if (editingProfile) {
      updateProfileMutation.mutate({ id: editingProfile.id, data: formData });
    }
  };

  const openPermissionsDialog = async (profile: Profile) => {
    try {
      const response = await fetch(`/api/profiles/${profile.id}`);
      const profileWithPerms: ProfileWithPermissions = await response.json();
      setSelectedProfile(profileWithPerms);
      
      const existingPerms = profileWithPerms.permissions || [];
      const allModules = modules || [];
      
      const permsState: PermissionState[] = allModules.map(mod => {
        const existing = existingPerms.find(p => p.module === mod.id);
        return {
          module: mod.id,
          canView: existing?.canView || false,
          canCreate: existing?.canCreate || false,
          canEdit: existing?.canEdit || false,
          canDelete: existing?.canDelete || false,
          canApprove: existing?.canApprove || false,
          canExport: existing?.canExport || false,
        };
      });
      
      setPermissionsState(permsState);
      setIsPermissionsOpen(true);
    } catch (error) {
      toast({ title: "Failed to load profile permissions", variant: "destructive" });
    }
  };

  const handlePermissionChange = (moduleId: string, field: keyof PermissionState, value: boolean) => {
    setPermissionsState(prev => prev.map(p => 
      p.module === moduleId ? { ...p, [field]: value } : p
    ));
  };

  const handleSavePermissions = () => {
    if (selectedProfile) {
      const filteredPerms = permissionsState.filter(p => 
        p.canView || p.canCreate || p.canEdit || p.canDelete || p.canApprove || p.canExport
      );
      updatePermissionsMutation.mutate({ 
        profileId: selectedProfile.id, 
        permissions: filteredPerms 
      });
    }
  };

  const setAllPermissions = (moduleId: string, value: boolean) => {
    setPermissionsState(prev => prev.map(p => 
      p.module === moduleId ? { 
        ...p, 
        canView: value,
        canCreate: value,
        canEdit: value,
        canDelete: value,
        canApprove: value,
        canExport: value,
      } : p
    ));
  };

  const groupedModules = modules?.reduce((acc, mod) => {
    if (!acc[mod.category]) acc[mod.category] = [];
    acc[mod.category].push(mod);
    return acc;
  }, {} as Record<string, ModuleInfo[]>) || {};

  const getTenantName = (tenantId: string | null) => {
    if (!tenantId) return "Global";
    return tenants?.find(t => t.id === tenantId)?.name || "Unknown";
  };

  if (profilesLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Profile Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage permission profiles for users
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-profile">
          <Plus className="h-4 w-4 mr-2" />
          Create Profile
        </Button>
      </div>

      <div className="grid gap-4">
        {profiles?.map(profile => (
          <Card key={profile.id} className="hover-elevate" data-testid={`card-profile-${profile.id}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{profile.name}</h3>
                      {profile.isSystemProfile && (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          System
                        </Badge>
                      )}
                      <Badge variant={profile.isActive ? "default" : "secondary"}>
                        {profile.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {profile.description || "No description"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Scope: {getTenantName(profile.tenantId)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openPermissionsDialog(profile)}
                    data-testid={`button-permissions-${profile.id}`}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Permissions
                  </Button>
                  {!profile.isSystemProfile && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingProfile(profile);
                          setFormData({
                            name: profile.name,
                            description: profile.description || "",
                            tenantId: profile.tenantId || "",
                            isActive: profile.isActive ?? true,
                          });
                        }}
                        data-testid={`button-edit-${profile.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => deleteProfileMutation.mutate(profile.id)}
                        data-testid={`button-delete-${profile.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!profiles || profiles.length === 0) && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No profiles created yet. Create your first profile to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Profile</DialogTitle>
            <DialogDescription>
              Create a permission profile that can be assigned to users.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Profile Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Compliance Manager"
                data-testid="input-profile-name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the purpose of this profile..."
                data-testid="input-profile-description"
              />
            </div>
            <div>
              <Label htmlFor="tenantId">Scope</Label>
              <Select
                value={formData.tenantId || "global"}
                onValueChange={(value) => setFormData({ ...formData, tenantId: value === "global" ? "" : value })}
              >
                <SelectTrigger data-testid="select-tenant">
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global (All Tenants)</SelectItem>
                  {tenants?.map(tenant => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateSubmit} 
              disabled={!formData.name || createProfileMutation.isPending}
              data-testid="button-submit-profile"
            >
              Create Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingProfile} onOpenChange={() => setEditingProfile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update profile details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Profile Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="input-edit-profile-name"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                data-testid="input-edit-profile-description"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProfile(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateSubmit}
              disabled={!formData.name || updateProfileMutation.isPending}
              data-testid="button-update-profile"
            >
              Update Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configure Permissions: {selectedProfile?.name}
            </DialogTitle>
            <DialogDescription>
              Set module access and permissions for this profile.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {Object.entries(groupedModules).map(([category, mods]) => (
              <div key={category}>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                  {category}
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-40">Module</TableHead>
                      <TableHead className="text-center w-20">
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="h-3 w-3" /> View
                        </div>
                      </TableHead>
                      <TableHead className="text-center w-20">
                        <div className="flex items-center justify-center gap-1">
                          <Plus className="h-3 w-3" /> Create
                        </div>
                      </TableHead>
                      <TableHead className="text-center w-20">
                        <div className="flex items-center justify-center gap-1">
                          <PenSquare className="h-3 w-3" /> Edit
                        </div>
                      </TableHead>
                      <TableHead className="text-center w-20">
                        <div className="flex items-center justify-center gap-1">
                          <Trash2 className="h-3 w-3" /> Delete
                        </div>
                      </TableHead>
                      <TableHead className="text-center w-20">
                        <div className="flex items-center justify-center gap-1">
                          <FileCheck className="h-3 w-3" /> Approve
                        </div>
                      </TableHead>
                      <TableHead className="text-center w-20">
                        <div className="flex items-center justify-center gap-1">
                          <Download className="h-3 w-3" /> Export
                        </div>
                      </TableHead>
                      <TableHead className="text-center w-20">All</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mods.map(mod => {
                      const perm = permissionsState.find(p => p.module === mod.id);
                      const allSelected = perm && perm.canView && perm.canCreate && perm.canEdit && perm.canDelete && perm.canApprove && perm.canExport;
                      
                      return (
                        <TableRow key={mod.id}>
                          <TableCell className="font-medium">{mod.name}</TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={perm?.canView || false}
                              onCheckedChange={(checked) => handlePermissionChange(mod.id, 'canView', !!checked)}
                              data-testid={`checkbox-${mod.id}-view`}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={perm?.canCreate || false}
                              onCheckedChange={(checked) => handlePermissionChange(mod.id, 'canCreate', !!checked)}
                              data-testid={`checkbox-${mod.id}-create`}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={perm?.canEdit || false}
                              onCheckedChange={(checked) => handlePermissionChange(mod.id, 'canEdit', !!checked)}
                              data-testid={`checkbox-${mod.id}-edit`}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={perm?.canDelete || false}
                              onCheckedChange={(checked) => handlePermissionChange(mod.id, 'canDelete', !!checked)}
                              data-testid={`checkbox-${mod.id}-delete`}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={perm?.canApprove || false}
                              onCheckedChange={(checked) => handlePermissionChange(mod.id, 'canApprove', !!checked)}
                              data-testid={`checkbox-${mod.id}-approve`}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={perm?.canExport || false}
                              onCheckedChange={(checked) => handlePermissionChange(mod.id, 'canExport', !!checked)}
                              data-testid={`checkbox-${mod.id}-export`}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={allSelected}
                              onCheckedChange={(checked) => setAllPermissions(mod.id, !!checked)}
                              data-testid={`checkbox-${mod.id}-all`}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSavePermissions}
              disabled={updatePermissionsMutation.isPending}
              data-testid="button-save-permissions"
            >
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
