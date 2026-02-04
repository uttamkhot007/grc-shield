import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plug, Search, CheckCircle2, RefreshCw, Settings,
  Cloud, Lock, Users, GitBranch, Ticket, Database, Shield,
  Plus, Clock, Zap
} from "lucide-react";

export default function IntegrationHubPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const connectors = [
    { id: 1, name: "AWS", category: "Cloud", description: "Amazon Web Services integration for evidence collection", status: "connected", lastSync: "5 min ago" },
    { id: 2, name: "Azure", category: "Cloud", description: "Microsoft Azure cloud services integration", status: "connected", lastSync: "10 min ago" },
    { id: 3, name: "Google Cloud", category: "Cloud", description: "GCP integration for infrastructure monitoring", status: "available", lastSync: null },
    { id: 4, name: "Okta", category: "Identity", description: "Identity and access management", status: "connected", lastSync: "2 min ago" },
    { id: 5, name: "Azure AD", category: "Identity", description: "Microsoft Entra ID integration", status: "available", lastSync: null },
    { id: 6, name: "GitHub", category: "DevOps", description: "Source code and repository management", status: "connected", lastSync: "1 hour ago" },
    { id: 7, name: "GitLab", category: "DevOps", description: "DevOps platform integration", status: "available", lastSync: null },
    { id: 8, name: "Jira", category: "Ticketing", description: "Issue tracking and project management", status: "connected", lastSync: "30 min ago" },
    { id: 9, name: "ServiceNow", category: "Ticketing", description: "IT service management platform", status: "available", lastSync: null },
    { id: 10, name: "Qualys", category: "Security", description: "Vulnerability management and scanning", status: "connected", lastSync: "4 hours ago" },
    { id: 11, name: "CrowdStrike", category: "Security", description: "Endpoint protection and threat detection", status: "available", lastSync: null },
    { id: 12, name: "Splunk", category: "Security", description: "SIEM and log management", status: "connected", lastSync: "15 min ago" },
    { id: 13, name: "Workday", category: "HR", description: "Human resources management", status: "available", lastSync: null },
    { id: 14, name: "BambooHR", category: "HR", description: "HR information system", status: "available", lastSync: null },
    { id: 15, name: "Slack", category: "Collaboration", description: "Team messaging and alerts", status: "connected", lastSync: "1 min ago" },
  ];

  const categories = [
    { id: "all", name: "All Integrations", icon: Plug },
    { id: "cloud", name: "Cloud", icon: Cloud },
    { id: "identity", name: "Identity", icon: Lock },
    { id: "security", name: "Security", icon: Shield },
    { id: "devops", name: "DevOps", icon: GitBranch },
    { id: "ticketing", name: "Ticketing", icon: Ticket },
    { id: "hr", name: "HR", icon: Users },
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredConnectors = connectors.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || c.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const connectedCount = connectors.filter(c => c.status === "connected").length;

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Integration Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect your tools for automated evidence collection and monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-sync-all">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync All
          </Button>
          <Button data-testid="button-request-integration">
            <Plus className="w-4 h-4 mr-2" />
            Request Integration
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Plug className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{connectors.length}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/20">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{connectedCount}</p>
              <p className="text-sm text-muted-foreground">Connected</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-sm text-muted-foreground">Auto-Sync</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-500/20">
              <Database className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">1,247</p>
              <p className="text-sm text-muted-foreground">Evidence Items</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search integrations..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-integrations"
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            data-testid={`button-filter-${cat.id}`}
          >
            <cat.icon className="w-4 h-4 mr-2" />
            {cat.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredConnectors.map((connector) => (
          <Card key={connector.id} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    {connector.category === "Cloud" ? <Cloud className="w-6 h-6 text-primary" /> :
                     connector.category === "Identity" ? <Lock className="w-6 h-6 text-primary" /> :
                     connector.category === "Security" ? <Shield className="w-6 h-6 text-primary" /> :
                     connector.category === "DevOps" ? <GitBranch className="w-6 h-6 text-primary" /> :
                     connector.category === "Ticketing" ? <Ticket className="w-6 h-6 text-primary" /> :
                     connector.category === "HR" ? <Users className="w-6 h-6 text-primary" /> :
                     <Plug className="w-6 h-6 text-primary" />}
                  </div>
                  <div>
                    <h3 className="font-semibold">{connector.name}</h3>
                    <Badge variant="outline" className="text-xs">{connector.category}</Badge>
                  </div>
                </div>
                <Badge variant={connector.status === "connected" ? "default" : "secondary"}>
                  {connector.status === "connected" ? (
                    <><CheckCircle2 className="w-3 h-3 mr-1" /> Connected</>
                  ) : (
                    "Available"
                  )}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{connector.description}</p>
              <div className="flex items-center justify-between">
                {connector.lastSync ? (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last sync: {connector.lastSync}
                  </span>
                ) : (
                  <span></span>
                )}
                <div className="flex gap-2">
                  {connector.status === "connected" ? (
                    <>
                      <Button variant="ghost" size="sm">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" data-testid={`button-connect-${connector.id}`}>
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
