import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTenant } from "@/contexts/tenant-context";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Radar, Shield, AlertTriangle, RefreshCw, Plus, Trash2, Search,
  Clock, Globe, Database, Activity, FileWarning, Target, Zap
} from "lucide-react";

const FEED_SOURCES = [
  { id: 'alienvault', name: 'AlienVault OTX', type: 'ip_reputation' },
  { id: 'abuse_ch', name: 'Abuse.ch', type: 'malware_hash' },
  { id: 'emerging_threats', name: 'Emerging Threats', type: 'ip_reputation' },
  { id: 'phishtank', name: 'PhishTank', type: 'phishing' },
  { id: 'feodotracker', name: 'Feodo Tracker', type: 'c2_servers' },
  { id: 'urlhaus', name: 'URLhaus', type: 'domain_blocklist' },
];

export default function ThreatIntelPage() {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const [feedName, setFeedName] = useState("");
  const [feedType, setFeedType] = useState("ip_reputation");
  const [feedSource, setFeedSource] = useState("alienvault");
  const [searchValue, setSearchValue] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const selectedTenant = currentTenant?.id || null;

  const { data: feeds = [], isLoading: loadingFeeds } = useQuery<any[]>({
    queryKey: ['/api/security/threat-feeds', selectedTenant],
    queryFn: async () => {
      const res = await fetch(`/api/security/threat-feeds?tenantId=${selectedTenant}`);
      if (!res.ok) throw new Error('Failed to fetch feeds');
      return res.json();
    },
    enabled: !!selectedTenant,
  });

  const { data: indicators = [], isLoading: loadingIndicators } = useQuery<any[]>({
    queryKey: ['/api/security/threat-indicators', selectedTenant],
    queryFn: async () => {
      const res = await fetch(`/api/security/threat-indicators?tenantId=${selectedTenant}`);
      if (!res.ok) throw new Error('Failed to fetch indicators');
      return res.json();
    },
    enabled: !!selectedTenant,
  });

  const { data: matches = [] } = useQuery<any[]>({
    queryKey: ['/api/security/threat-matches', selectedTenant],
    queryFn: async () => {
      const res = await fetch(`/api/security/threat-matches?tenantId=${selectedTenant}`);
      if (!res.ok) throw new Error('Failed to fetch matches');
      return res.json();
    },
    enabled: !!selectedTenant,
  });

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const createFeedMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/security/threat-feeds', {
        tenantId: selectedTenant,
        ...data,
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Feed Added", 
        description: `Loaded ${data.indicatorsLoaded} threat indicators` 
      });
      setCreateDialogOpen(false);
      setFeedName("");
      queryClient.invalidateQueries({ queryKey: ['/api/security/threat-feeds', selectedTenant] });
      queryClient.invalidateQueries({ queryKey: ['/api/security/threat-indicators', selectedTenant] });
    },
    onError: (error: any) => {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    }
  });

  const deleteFeedMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/security/threat-feeds/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Feed removed" });
      queryClient.invalidateQueries({ queryKey: ['/api/security/threat-feeds', selectedTenant] });
      queryClient.invalidateQueries({ queryKey: ['/api/security/threat-indicators', selectedTenant] });
    }
  });

  const searchIndicatorsMutation = useMutation({
    mutationFn: async (value: string) => {
      const res = await apiRequest('/api/security/threat-indicators/search', 'POST', {
        searchValue: value,
        tenantId: selectedTenant,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setSearchResults(data);
      if (data.length === 0) {
        toast({ title: "No Matches", description: "No threat indicators match your search" });
      } else {
        toast({ title: "Found", description: `${data.length} matching indicators` });
      }
    }
  });

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-600/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return <Badge className={colors[severity] || colors.medium}>{severity?.toUpperCase()}</Badge>;
  };

  const getIndicatorTypeIcon = (type: string) => {
    switch (type) {
      case 'ip': return <Globe className="h-4 w-4" />;
      case 'domain': return <Database className="h-4 w-4" />;
      case 'hash': return <FileWarning className="h-4 w-4" />;
      case 'url': return <Activity className="h-4 w-4" />;
      case 'email': return <Target className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const totalIndicators = feeds.reduce((acc, f) => acc + (f.indicatorCount || 0), 0);
  const criticalIndicators = indicators.filter(i => i.severity === 'critical').length;
  const activeMatches = matches.filter(m => m.status === 'open').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Threat Intelligence (OSINT)
            </h1>
            <p className="text-muted-foreground mt-1">
              Open-source threat intelligence feeds, indicators of compromise, and threat correlation
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-feed" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Feed
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle>Add Threat Intelligence Feed</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm text-muted-foreground">Feed Source</label>
                  <Select value={feedSource} onValueChange={(v) => {
                    setFeedSource(v);
                    const source = FEED_SOURCES.find(s => s.id === v);
                    if (source) {
                      setFeedType(source.type);
                      setFeedName(source.name);
                    }
                  }}>
                    <SelectTrigger className="mt-1 bg-slate-800 border-slate-600" data-testid="select-feed-source">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEED_SOURCES.map(source => (
                        <SelectItem key={source.id} value={source.id}>{source.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Feed Type</label>
                  <Select value={feedType} onValueChange={setFeedType}>
                    <SelectTrigger className="mt-1 bg-slate-800 border-slate-600" data-testid="select-feed-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ip_reputation">IP Reputation</SelectItem>
                      <SelectItem value="domain_blocklist">Domain Blocklist</SelectItem>
                      <SelectItem value="malware_hash">Malware Hashes</SelectItem>
                      <SelectItem value="c2_servers">C2 Servers</SelectItem>
                      <SelectItem value="phishing">Phishing URLs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Feed Name</label>
                  <Input
                    data-testid="input-feed-name"
                    placeholder="My Threat Feed"
                    value={feedName}
                    onChange={(e) => setFeedName(e.target.value)}
                    className="mt-1 bg-slate-800 border-slate-600"
                  />
                </div>
                <Button
                  data-testid="button-create-feed"
                  className="w-full"
                  onClick={() => createFeedMutation.mutate({ feedName, feedType, feedSource })}
                  disabled={!feedName || createFeedMutation.isPending}
                >
                  {createFeedMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Loading Indicators...
                    </>
                  ) : (
                    'Add Feed'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-white">{feeds.filter(f => f.isActive).length}</div>
              <div className="text-sm text-muted-foreground">Active Feeds</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-cyan-400">{totalIndicators}</div>
              <div className="text-sm text-muted-foreground">Total Indicators</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-red-400">{criticalIndicators}</div>
              <div className="text-sm text-muted-foreground">Critical IOCs</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-orange-400">{activeMatches}</div>
              <div className="text-sm text-muted-foreground">Active Matches</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Threat Search
            </CardTitle>
            <CardDescription>Search for IPs, domains, or file hashes in threat intelligence</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                data-testid="input-threat-search"
                placeholder="Enter IP, domain, or file hash..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="bg-slate-800 border-slate-600"
              />
              <Button 
                onClick={() => searchIndicatorsMutation.mutate(searchValue)}
                disabled={!searchValue || searchIndicatorsMutation.isPending}
                data-testid="button-search"
              >
                {searchIndicatorsMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground">Search Results</h4>
                {searchResults.map((result, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getIndicatorTypeIcon(result.indicatorType)}
                      <div>
                        <code className="text-sm font-mono">{result.indicatorValue}</code>
                        <p className="text-xs text-muted-foreground">{result.threatType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Confidence: {result.confidence}%</Badge>
                      {getSeverityBadge(result.severity)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="feeds" className="space-y-4">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="feeds">Threat Feeds</TabsTrigger>
            <TabsTrigger value="indicators">Indicators ({indicators.length})</TabsTrigger>
            <TabsTrigger value="matches">Matches ({matches.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="feeds">
            {loadingFeeds ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
              </div>
            ) : feeds.length === 0 ? (
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="py-16 text-center">
                  <Radar className="h-16 w-16 mx-auto text-slate-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Threat Feeds</h3>
                  <p className="text-muted-foreground mb-4">Add threat intelligence feeds to start monitoring</p>
                  <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Feed
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {feeds.map((feed) => (
                  <Card 
                    key={feed.id} 
                    className="bg-slate-900/50 border-slate-700"
                    data-testid={`card-feed-${feed.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                            <Radar className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{feed.feedName}</h3>
                            <p className="text-sm text-muted-foreground">{feed.feedSource}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">{feed.feedType}</Badge>
                              <Badge className={feed.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                {feed.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-cyan-400">{feed.indicatorCount || 0}</div>
                          <div className="text-xs text-muted-foreground">Indicators</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Updated: {feed.lastUpdatedAt ? new Date(feed.lastUpdatedAt).toLocaleDateString() : 'Never'}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => deleteFeedMutation.mutate(feed.id)}
                          data-testid={`button-delete-${feed.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="indicators">
            {loadingIndicators ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
              </div>
            ) : indicators.length === 0 ? (
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="py-16 text-center">
                  <Shield className="h-16 w-16 mx-auto text-slate-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Indicators</h3>
                  <p className="text-muted-foreground">Add threat feeds to load indicators of compromise</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {indicators.slice(0, 50).map((indicator) => (
                  <Card 
                    key={indicator.id} 
                    className="bg-slate-900/50 border-slate-700"
                    data-testid={`card-indicator-${indicator.id}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded bg-slate-800 text-slate-400">
                            {getIndicatorTypeIcon(indicator.indicatorType)}
                          </div>
                          <div>
                            <code className="text-sm font-mono text-white">{indicator.indicatorValue}</code>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{indicator.indicatorType}</Badge>
                              <span className="text-xs text-muted-foreground">{indicator.threatType}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-semibold">{indicator.confidence}%</div>
                            <div className="text-xs text-muted-foreground">Confidence</div>
                          </div>
                          {getSeverityBadge(indicator.severity)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {indicators.length > 50 && (
                  <p className="text-center text-muted-foreground py-4">
                    Showing 50 of {indicators.length} indicators
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="matches">
            {matches.length === 0 ? (
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="py-16 text-center">
                  <Shield className="h-16 w-16 mx-auto text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Matches</h3>
                  <p className="text-muted-foreground">No threat indicators have matched your assets</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => (
                  <Card 
                    key={match.id} 
                    className="bg-slate-900/50 border-slate-700"
                    data-testid={`card-match-${match.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className={`h-5 w-5 mt-1 ${
                            match.severity === 'critical' ? 'text-red-400' : 
                            match.severity === 'high' ? 'text-orange-400' : 'text-yellow-400'
                          }`} />
                          <div>
                            <h4 className="font-semibold text-white">
                              Threat Match: {match.matchedValue}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Asset: {match.matchedAsset} | Type: {match.matchType}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getSeverityBadge(match.severity)}
                          <Badge variant={match.status === 'open' ? 'destructive' : 'outline'}>
                            {match.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
