import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Newspaper, Search, Filter, Globe, AlertTriangle, CheckCircle2,
  Clock, ExternalLink, Bell, Settings, TrendingUp, Calendar,
  BookOpen, Flag, ChevronRight, Plus, FolderOpen
} from "lucide-react";
import type { RegulatoryUpdate } from "@shared/schema";

export default function RegulatoryIntelligencePage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: regulatoryUpdates = [], isLoading } = useQuery<RegulatoryUpdate[]>({
    queryKey: ["/api/regulatory/updates"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-500/20 text-blue-400";
      case "reviewing": return "bg-amber-500/20 text-amber-400";
      case "implementing": return "bg-purple-500/20 text-purple-400";
      case "actioned": return "bg-green-500/20 text-green-400";
      case "reviewed": return "bg-gray-500/20 text-gray-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getImpactBadge = (level: string | null) => {
    switch (level) {
      case "high": return <Badge variant="destructive">High Impact</Badge>;
      case "medium": return <Badge variant="secondary">Medium Impact</Badge>;
      case "low": return <Badge variant="outline">Low Impact</Badge>;
      default: return null;
    }
  };

  const highImpactCount = regulatoryUpdates.filter(u => u.impactLevel === "high").length;
  const newCount = regulatoryUpdates.filter(u => u.status === "new" || u.status === "pending").length;
  const implementingCount = regulatoryUpdates.filter(u => u.status === "in_progress").length;
  const actionedCount = regulatoryUpdates.filter(u => u.status === "completed").length;

  const EmptyState = ({ title, description, icon: Icon }: { title: string; description: string; icon: any }) => (
    <Card className="glass-card">
      <CardContent className="p-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          <Icon className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
        <Button data-testid="button-get-started">
          <Plus className="w-4 h-4 mr-2" />
          Get Started
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Regulatory Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            Track regulatory changes and horizon scanning across your frameworks
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-subscribe">
            <Bell className="w-4 h-4 mr-2" />
            Alerts
          </Button>
          <Button data-testid="button-settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Newspaper className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{regulatoryUpdates.length}</p>
              <p className="text-sm text-muted-foreground">Total Updates</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-red-500/20">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{highImpactCount}</p>
              <p className="text-sm text-muted-foreground">High Impact</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-500/20">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{newCount}</p>
              <p className="text-sm text-muted-foreground">New/Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{implementingCount}</p>
              <p className="text-sm text-muted-foreground">Implementing</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/20">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{actionedCount}</p>
              <p className="text-sm text-muted-foreground">Actioned</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="updates" className="space-y-4">
        <TabsList className="glass-card">
          <TabsTrigger value="updates" data-testid="tab-updates">
            <Newspaper className="w-4 h-4 mr-2" />
            Regulatory Updates
          </TabsTrigger>
          <TabsTrigger value="horizon" data-testid="tab-horizon">
            <Globe className="w-4 h-4 mr-2" />
            Horizon Scanning
          </TabsTrigger>
          <TabsTrigger value="calendar" data-testid="tab-calendar">
            <Calendar className="w-4 h-4 mr-2" />
            Compliance Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="updates" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search regulatory updates..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-regulatory"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {isLoading ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading regulatory updates...
              </CardContent>
            </Card>
          ) : regulatoryUpdates.length === 0 ? (
            <EmptyState 
              title="No Regulatory Updates Yet"
              description="Stay informed about regulatory changes affecting your compliance frameworks. Add updates from NCA, GDPR, PCI SSC, and other regulatory bodies."
              icon={Newspaper}
            />
          ) : (
            <div className="grid gap-4">
              {regulatoryUpdates.map((update) => (
                <Card key={update.id} className={`glass-card ${update.status === "new" || update.status === "pending" ? "border-blue-500/50" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Flag className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold">{update.title}</h3>
                          {getImpactBadge(update.impactLevel)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{update.summary}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            {update.source}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {update.region}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {update.publishedDate ? new Date(update.publishedDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(update.status || "new")}>
                          {update.status}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="horizon">
          <EmptyState 
            title="No Horizon Scanning Data"
            description="Track upcoming regulatory changes on the horizon - EU AI Act deadlines, DORA compliance, NIS2 implementation, and more."
            icon={Globe}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <EmptyState 
            title="No Compliance Deadlines"
            description="Add key compliance dates and deadlines to track certification renewals, audit schedules, and regulatory milestones."
            icon={Calendar}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
