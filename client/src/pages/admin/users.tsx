import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User, Tenant } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  Crown,
} from "lucide-react";

const ROLES = [
  { value: "super_admin", label: "Super Admin", description: "Full platform access" },
  { value: "tenant_admin", label: "Tenant Admin", description: "Manage tenant users & settings" },
  { value: "auditor", label: "Auditor", description: "Audit and compliance tasks" },
  { value: "end_user", label: "Standard User", description: "Training & document access" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "zh", label: "Chinese" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "pt", label: "Portuguese" },
];

export default function UsersPage() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filterTenant, setFilterTenant] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "default123",
    firstName: "",
    lastName: "",
    role: "end_user" as "super_admin" | "tenant_admin" | "auditor" | "end_user",
    tenantId: "",
    department: "",
    title: "",
    language: "en" as "en" | "ar" | "hi" | "zh" | "es" | "fr" | "de" | "ja" | "ko" | "pt",
    isActive: true,
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: tenants } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
  });

  const createUserMutation = useMutation({
    mutationFn: (data: typeof formData) => apiRequest("POST", "/api/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User created successfully" });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create user", variant: "destructive" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof formData> }) =>
      apiRequest("PATCH", `/api/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User updated successfully" });
      setEditingUser(null);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete user", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "default123",
      firstName: "",
      lastName: "",
      role: "end_user",
      tenantId: "",
      department: "",
      title: "",
      language: "en",
      isActive: true,
    });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      role: user.role || "end_user",
      tenantId: user.tenantId || "global",
      department: user.department || "",
      title: user.title || "",
      language: user.language || "en",
      isActive: user.isActive ?? true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = { 
      ...formData,
      tenantId: formData.tenantId === "global" ? undefined : formData.tenantId,
    };
    if (editingUser && !submitData.password) {
      delete (submitData as any).password;
    }
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data: submitData as any });
    } else {
      createUserMutation.mutate(submitData as any);
    }
  };

  const getTenantName = (tenantId: string | null) => {
    if (!tenantId) return "Global (Super Admin)";
    const tenant = tenants?.find((t) => t.id === tenantId);
    return tenant?.name || "Unknown";
  };

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case "super_admin":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30"><Crown className="h-3 w-3 mr-1" />Super Admin</Badge>;
      case "tenant_admin":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
      case "auditor":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Auditor</Badge>;
      default:
        return <Badge variant="outline">Standard User</Badge>;
    }
  };

  const filteredUsers = users?.filter((user) => {
    if (filterTenant !== "all" && user.tenantId !== filterTenant) return false;
    if (filterRole !== "all" && user.role !== filterRole) return false;
    return true;
  });

  const userStats = {
    total: users?.length || 0,
    active: users?.filter((u) => u.isActive).length || 0,
    admins: users?.filter((u) => u.role === "tenant_admin" || u.role === "super_admin").length || 0,
    auditors: users?.filter((u) => u.role === "auditor").length || 0,
  };

  if (usersLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage platform users, roles, and permissions
          </p>
        </div>

        <Dialog open={isCreateOpen || !!editingUser} onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingUser(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-user">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>
              <DialogDescription>
                {editingUser ? "Update user information and access" : "Add a new user to the platform"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="John"
                    data-testid="input-user-firstname"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Doe"
                    data-testid="input-user-lastname"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value, username: e.target.value })}
                    placeholder="user@example.com"
                    data-testid="input-user-email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{editingUser ? "New Password (leave blank to keep)" : "Password"}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? "Leave blank to keep current" : "Enter password"}
                    data-testid="input-user-password"
                    required={!editingUser}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger data-testid="select-user-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div>
                            <div className="font-medium">{role.label}</div>
                            <div className="text-xs text-muted-foreground">{role.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenant">Tenant Organization</Label>
                  <Select value={formData.tenantId} onValueChange={(value) => setFormData({ ...formData, tenantId: value })}>
                    <SelectTrigger data-testid="select-user-tenant">
                      <SelectValue placeholder="Select tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global (No Tenant)</SelectItem>
                      {tenants?.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="IT Security"
                    data-testid="input-user-department"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Security Analyst"
                    data-testid="input-user-title"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select value={formData.language} onValueChange={(value: any) => setFormData({ ...formData, language: value })}>
                    <SelectTrigger data-testid="select-user-language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.isActive ? "active" : "inactive"} onValueChange={(value) => setFormData({ ...formData, isActive: value === "active" })}>
                    <SelectTrigger data-testid="select-user-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateOpen(false);
                  setEditingUser(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createUserMutation.isPending || updateUserMutation.isPending} data-testid="button-submit-user">
                  {editingUser ? "Update User" : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/20">
                <UserCheck className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userStats.active}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <Shield className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userStats.admins}</p>
                <p className="text-sm text-muted-foreground">Administrators</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/20">
                <UserX className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userStats.auditors}</p>
                <p className="text-sm text-muted-foreground">Auditors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users</CardTitle>
            <div className="flex items-center gap-4">
              <Select value={filterTenant} onValueChange={setFilterTenant}>
                <SelectTrigger className="w-48" data-testid="filter-tenant">
                  <SelectValue placeholder="Filter by tenant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tenants</SelectItem>
                  {tenants?.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-40" data-testid="filter-role">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers?.map((user) => (
                <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getTenantName(user.tenantId)}</TableCell>
                  <TableCell>{user.department || "-"}</TableCell>
                  <TableCell>
                    <Badge className={user.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user)}
                        data-testid={`button-edit-user-${user.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this user?")) {
                            deleteUserMutation.mutate(user.id);
                          }
                        }}
                        data-testid={`button-delete-user-${user.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
