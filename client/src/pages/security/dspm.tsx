import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useTenant } from "@/contexts/tenant-context";
import { 
  Database, Shield, Globe, ArrowRightLeft, AlertTriangle, Eye, Lock,
  FileSearch, Brain, RefreshCw, Server, Cloud, HardDrive, Users,
  MapPin, CheckCircle2, XCircle, AlertCircle, ChevronRight, Zap
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Treemap, Sankey, Layer
} from "recharts";

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#6b7280'];
const SENSITIVITY_COLORS: Record<string, string> = {
  highly_restricted: '#ef4444',
  restricted: '#f97316',
  confidential: '#f59e0b',
  internal: '#3b82f6',
  public: '#10b981'
};

export default function DSPMPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  const selectedTenant = currentTenant?.id || null;
  const [addLocationDialogOpen, setAddLocationDialogOpen] = useState(false);
  const [addFlowDialogOpen, setAddFlowDialogOpen] = useState(false);

  const { data: scans = [], isLoading: scansLoading } = useQuery<any[]>({
    queryKey: ['/api/dspm/scans', selectedTenant],
  });

  const { data: locations = [], isLoading: locationsLoading } = useQuery<any[]>({
    queryKey: ['/api/dspm/locations', selectedTenant],
  });

  const { data: flows = [], isLoading: flowsLoading } = useQuery<any[]>({
    queryKey: ['/api/dspm/flows', selectedTenant],
  });

  const { data: risks = [], isLoading: risksLoading } = useQuery<any[]>({
    queryKey: ['/api/dspm/risks', selectedTenant],
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('/api/dspm/analyze', 'POST', { tenantId: selectedTenant });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Analysis Complete", description: "DSPM analysis has been completed" });
    },
    onError: (error: any) => {
      toast({ title: "Analysis Failed", description: error.message, variant: "destructive" });
    }
  });

  const locationsBySensitivity = {
    highly_restricted: locations.filter((l: any) => l.sensitivity === 'highly_restricted').length,
    restricted: locations.filter((l: any) => l.sensitivity === 'restricted').length,
    confidential: locations.filter((l: any) => l.sensitivity === 'confidential').length,
    internal: locations.filter((l: any) => l.sensitivity === 'internal').length,
    public: locations.filter((l: any) => l.sensitivity === 'public').length,
  };

  const crossBorderFlows = flows.filter((f: any) => f.crossBorder === true).length;
  const openRisks = risks.filter((r: any) => r.status === 'open').length;
  const criticalRisks = risks.filter((r: any) => r.severity === 'critical').length;

  const pieData = Object.entries(locationsBySensitivity)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
      color: SENSITIVITY_COLORS[name]
    }));

  const locationsByType = locations.reduce((acc: any, loc: any) => {
    const type = loc.dataSourceType || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typeData = Object.entries(locationsByType).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: value as number
  }));

  const getSensitivityBadge = (sensitivity: string) => {
    switch (sensitivity) {
      case 'highly_restricted': return <Badge variant="destructive" data-testid="badge-sensitivity-highly-restricted">Highly Restricted</Badge>;
      case 'restricted': return <Badge className="bg-orange-500" data-testid="badge-sensitivity-restricted">Restricted</Badge>;
      case 'confidential': return <Badge className="bg-yellow-500 text-black" data-testid="badge-sensitivity-confidential">Confidential</Badge>;
      case 'internal': return <Badge className="bg-blue-500" data-testid="badge-sensitivity-internal">Internal</Badge>;
      case 'public': return <Badge className="bg-green-500" data-testid="badge-sensitivity-public">Public</Badge>;
      default: return <Badge variant="secondary" data-testid="badge-sensitivity-unknown">{sensitivity}</Badge>;
    }
  };

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'pii': return <Users className="h-4 w-4" />;
      case 'phi': return <Shield className="h-4 w-4" />;
      case 'pci': return <Lock className="h-4 w-4" />;
      case 'confidential_business': return <Database className="h-4 w-4" />;
      default: return <FileSearch className="h-4 w-4" />;
    }
  };

  const getSourceTypeIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'database': return <Database className="h-5 w-5" />;
      case 'cloud_storage': return <Cloud className="h-5 w-5" />;
      case 'file_server': return <Server className="h-5 w-5" />;
      case 'saas_application': return <Globe className="h-5 w-5" />;
      default: return <HardDrive className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent" data-testid="text-page-title">
            Data Security Posture Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover, classify, and protect sensitive data across your environment
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending}
            data-testid="button-analyze-dspm"
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Analysis
          </Button>
          <Dialog open={addLocationDialogOpen} onOpenChange={setAddLocationDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-location">
                <MapPin className="h-4 w-4 mr-2" />
                Add Data Location
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Sensitive Data Location</DialogTitle>
                <DialogDescription>
                  Register a new location where sensitive data is stored
                </DialogDescription>
              </DialogHeader>
              <AddLocationForm onSuccess={() => {
                setAddLocationDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ['/api/dspm/locations'] });
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="glass-card" data-testid="card-total-locations">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Locations</p>
                <p className="text-3xl font-bold">{locations.length}</p>
              </div>
              <Database className="h-10 w-10 text-primary/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card" data-testid="card-highly-restricted">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Highly Restricted</p>
                <p className="text-3xl font-bold text-red-500">{locationsBySensitivity.highly_restricted}</p>
              </div>
              <Lock className="h-10 w-10 text-red-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card" data-testid="card-data-flows">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Flows</p>
                <p className="text-3xl font-bold">{flows.length}</p>
              </div>
              <ArrowRightLeft className="h-10 w-10 text-blue-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card" data-testid="card-cross-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cross-Border Flows</p>
                <p className="text-3xl font-bold text-yellow-500">{crossBorderFlows}</p>
              </div>
              <Globe className="h-10 w-10 text-yellow-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card" data-testid="card-open-risks">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Risks</p>
                <p className="text-3xl font-bold text-orange-500">{openRisks}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-orange-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="glass-card" data-testid="tabs-dspm">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="locations" data-testid="tab-locations">Data Locations</TabsTrigger>
          <TabsTrigger value="flows" data-testid="tab-flows">Data Flows</TabsTrigger>
          <TabsTrigger value="risks" data-testid="tab-risks">Access Risks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Data Classification Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No data locations registered
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data by Source Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {typeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={typeData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
                        <YAxis type="category" dataKey="name" width={120} stroke="rgba(255,255,255,0.5)" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: '1px solid rgba(255,255,255,0.1)' 
                          }} 
                        />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No data locations registered
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Data Access Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {risks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No data access risks identified
                  </div>
                ) : (
                  <div className="space-y-4">
                    {risks.slice(0, 5).map((risk: any) => (
                      <div 
                        key={risk.id}
                        className="flex items-center justify-between p-4 border border-white/10 rounded-lg"
                        data-testid={`card-risk-${risk.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            risk.severity === 'critical' ? 'bg-red-500/10' :
                            risk.severity === 'high' ? 'bg-orange-500/10' :
                            'bg-yellow-500/10'
                          }`}>
                            <AlertTriangle className={`h-5 w-5 ${
                              risk.severity === 'critical' ? 'text-red-500' :
                              risk.severity === 'high' ? 'text-orange-500' :
                              'text-yellow-500'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-medium">{risk.riskType?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</h4>
                            <p className="text-sm text-muted-foreground">{risk.description}</p>
                          </div>
                        </div>
                        <Badge variant={risk.status === 'open' ? 'destructive' : 'secondary'}>
                          {risk.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Sensitive Data Locations</CardTitle>
              <CardDescription>All registered locations where sensitive data is stored</CardDescription>
            </CardHeader>
            <CardContent>
              {locationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : locations.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Data Locations</h3>
                  <p className="text-muted-foreground mb-4">Register your first sensitive data location to get started</p>
                  <Button onClick={() => setAddLocationDialogOpen(true)} data-testid="button-add-first-location">
                    <MapPin className="h-4 w-4 mr-2" />
                    Add Data Location
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {locations.map((location: any) => (
                    <div 
                      key={location.id} 
                      className="flex items-start justify-between p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                      data-testid={`card-location-${location.id}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {getSourceTypeIcon(location.dataSourceType)}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium">{location.name}</h4>
                          <p className="text-sm text-muted-foreground">{location.description}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">{location.dataSourceType?.replace(/_/g, ' ')}</Badge>
                            <Badge variant="outline">{location.dataType?.replace(/_/g, ' ').toUpperCase()}</Badge>
                            {location.region && <Badge variant="outline">{location.region}</Badge>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSensitivityBadge(location.sensitivity)}
                        {location.encryptionStatus === 'encrypted' ? (
                          <Badge className="bg-green-500" data-testid="badge-encrypted">
                            <Lock className="h-3 w-3 mr-1" />
                            Encrypted
                          </Badge>
                        ) : (
                          <Badge variant="destructive" data-testid="badge-unencrypted">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Unencrypted
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flows" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Dialog open={addFlowDialogOpen} onOpenChange={setAddFlowDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-flow">
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Add Data Flow
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Data Flow Mapping</DialogTitle>
                  <DialogDescription>
                    Map how data flows between systems
                  </DialogDescription>
                </DialogHeader>
                <AddFlowForm onSuccess={() => {
                  setAddFlowDialogOpen(false);
                  queryClient.invalidateQueries({ queryKey: ['/api/dspm/flows'] });
                }} />
              </DialogContent>
            </Dialog>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Data Flow Mappings</CardTitle>
              <CardDescription>Track how data moves between systems and across borders</CardDescription>
            </CardHeader>
            <CardContent>
              {flowsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : flows.length === 0 ? (
                <div className="text-center py-12">
                  <ArrowRightLeft className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Data Flows</h3>
                  <p className="text-muted-foreground mb-4">Add your first data flow mapping</p>
                  <Button onClick={() => setAddFlowDialogOpen(true)} data-testid="button-add-first-flow">
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Add Data Flow
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {flows.map((flow: any) => (
                    <div 
                      key={flow.id} 
                      className="flex items-center justify-between p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                      data-testid={`card-flow-${flow.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <Server className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="text-sm">
                            <div className="font-medium">{flow.sourceSystem}</div>
                            <div className="text-muted-foreground">{flow.sourceRegion}</div>
                          </div>
                        </div>
                        <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-purple-500/10">
                            <Cloud className="h-5 w-5 text-purple-500" />
                          </div>
                          <div className="text-sm">
                            <div className="font-medium">{flow.destinationSystem}</div>
                            <div className="text-muted-foreground">{flow.destinationRegion}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {flow.crossBorder && (
                          <Badge className="bg-yellow-500 text-black" data-testid="badge-cross-border">
                            <Globe className="h-3 w-3 mr-1" />
                            Cross-Border
                          </Badge>
                        )}
                        <Badge variant="outline">{flow.purpose}</Badge>
                        <Badge variant={flow.isActive ? 'default' : 'secondary'}>
                          {flow.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Data Access Risks</CardTitle>
              <CardDescription>Identified risks related to data access and protection</CardDescription>
            </CardHeader>
            <CardContent>
              {risksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : risks.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium">No Risks Identified</h3>
                  <p className="text-muted-foreground">No data access risks have been identified yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {risks.map((risk: any) => (
                    <div 
                      key={risk.id} 
                      className="flex items-start justify-between p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                      data-testid={`card-risk-detail-${risk.id}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${
                          risk.severity === 'critical' ? 'bg-red-500/10' :
                          risk.severity === 'high' ? 'bg-orange-500/10' :
                          risk.severity === 'medium' ? 'bg-yellow-500/10' :
                          'bg-green-500/10'
                        }`}>
                          <AlertTriangle className={`h-5 w-5 ${
                            risk.severity === 'critical' ? 'text-red-500' :
                            risk.severity === 'high' ? 'text-orange-500' :
                            risk.severity === 'medium' ? 'text-yellow-500' :
                            'text-green-500'
                          }`} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium">
                            {risk.riskType?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </h4>
                          <p className="text-sm text-muted-foreground">{risk.description}</p>
                          {risk.affectedUsers && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="h-3 w-3" />
                              {risk.affectedUsers} affected users
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          risk.severity === 'critical' ? 'destructive' :
                          risk.severity === 'high' ? 'default' :
                          'secondary'
                        }>
                          {risk.severity}
                        </Badge>
                        <Badge variant={risk.status === 'open' ? 'destructive' : 'secondary'}>
                          {risk.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AddLocationForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dataSourceType: 'database',
    dataSourcePath: '',
    dataType: 'pii',
    sensitivity: 'confidential',
    region: '',
    encryptionStatus: 'encrypted'
  });

  const createLocationMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('/api/dspm/locations', 'POST', data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Location Added", description: "Sensitive data location has been registered" });
      onSuccess();
    },
    onError: (error: any) => {
      toast({ title: "Failed to Add", description: error.message, variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLocationMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Location Name</Label>
        <Input 
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Customer Database"
          required
          data-testid="input-location-name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Primary customer data storage"
          data-testid="textarea-location-description"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Source Type</Label>
          <Select 
            value={formData.dataSourceType} 
            onValueChange={(v) => setFormData({ ...formData, dataSourceType: v })}
          >
            <SelectTrigger data-testid="select-source-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="database">Database</SelectItem>
              <SelectItem value="cloud_storage">Cloud Storage</SelectItem>
              <SelectItem value="file_server">File Server</SelectItem>
              <SelectItem value="saas_application">SaaS Application</SelectItem>
              <SelectItem value="data_warehouse">Data Warehouse</SelectItem>
              <SelectItem value="data_lake">Data Lake</SelectItem>
              <SelectItem value="api_endpoint">API Endpoint</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Data Type</Label>
          <Select 
            value={formData.dataType} 
            onValueChange={(v) => setFormData({ ...formData, dataType: v })}
          >
            <SelectTrigger data-testid="select-data-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pii">PII (Personal Identifiable Info)</SelectItem>
              <SelectItem value="phi">PHI (Protected Health Info)</SelectItem>
              <SelectItem value="pci">PCI (Payment Card Data)</SelectItem>
              <SelectItem value="confidential_business">Confidential Business</SelectItem>
              <SelectItem value="intellectual_property">Intellectual Property</SelectItem>
              <SelectItem value="financial">Financial Data</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Sensitivity Level</Label>
          <Select 
            value={formData.sensitivity} 
            onValueChange={(v) => setFormData({ ...formData, sensitivity: v })}
          >
            <SelectTrigger data-testid="select-sensitivity">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="highly_restricted">Highly Restricted</SelectItem>
              <SelectItem value="restricted">Restricted</SelectItem>
              <SelectItem value="confidential">Confidential</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="public">Public</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Encryption Status</Label>
          <Select 
            value={formData.encryptionStatus} 
            onValueChange={(v) => setFormData({ ...formData, encryptionStatus: v })}
          >
            <SelectTrigger data-testid="select-encryption">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="encrypted">Encrypted</SelectItem>
              <SelectItem value="unencrypted">Unencrypted</SelectItem>
              <SelectItem value="partial">Partially Encrypted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="region">Region/Location</Label>
        <Input 
          id="region"
          value={formData.region}
          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
          placeholder="US-East, EU-West, etc."
          data-testid="input-region"
        />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={createLocationMutation.isPending} data-testid="button-submit-location">
          {createLocationMutation.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 mr-2" />
              Add Location
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

function AddFlowForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    sourceSystem: '',
    sourceRegion: '',
    destinationSystem: '',
    destinationRegion: '',
    purpose: 'processing',
    crossBorder: false,
    isActive: true
  });

  const createFlowMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('/api/dspm/flows', 'POST', data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Flow Added", description: "Data flow mapping has been created" });
      onSuccess();
    },
    onError: (error: any) => {
      toast({ title: "Failed to Add", description: error.message, variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFlowMutation.mutate({
      ...formData,
      crossBorder: formData.sourceRegion !== formData.destinationRegion
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="flowName">Flow Name</Label>
        <Input 
          id="flowName"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Customer Data Sync"
          required
          data-testid="input-flow-name"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Source System</Label>
          <Input 
            value={formData.sourceSystem}
            onChange={(e) => setFormData({ ...formData, sourceSystem: e.target.value })}
            placeholder="CRM Database"
            required
            data-testid="input-source-system"
          />
        </div>
        <div className="space-y-2">
          <Label>Source Region</Label>
          <Input 
            value={formData.sourceRegion}
            onChange={(e) => setFormData({ ...formData, sourceRegion: e.target.value })}
            placeholder="US-East"
            required
            data-testid="input-source-region"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Destination System</Label>
          <Input 
            value={formData.destinationSystem}
            onChange={(e) => setFormData({ ...formData, destinationSystem: e.target.value })}
            placeholder="Analytics Platform"
            required
            data-testid="input-dest-system"
          />
        </div>
        <div className="space-y-2">
          <Label>Destination Region</Label>
          <Input 
            value={formData.destinationRegion}
            onChange={(e) => setFormData({ ...formData, destinationRegion: e.target.value })}
            placeholder="EU-West"
            required
            data-testid="input-dest-region"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Purpose</Label>
        <Select 
          value={formData.purpose} 
          onValueChange={(v) => setFormData({ ...formData, purpose: v })}
        >
          <SelectTrigger data-testid="select-purpose">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="processing">Data Processing</SelectItem>
            <SelectItem value="analytics">Analytics</SelectItem>
            <SelectItem value="backup">Backup/DR</SelectItem>
            <SelectItem value="integration">Integration</SelectItem>
            <SelectItem value="reporting">Reporting</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={createFlowMutation.isPending} data-testid="button-submit-flow">
          {createFlowMutation.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Add Flow
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
