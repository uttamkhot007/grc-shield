import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, FileCheck, Globe, ExternalLink, Upload, Plus, Eye, Settings, Award, FileText, Download, FolderOpen } from "lucide-react";
import type { TrustCenterCertification, TrustCenterDocument } from "@shared/schema";

export default function TrustCenterPage() {
  const [isEnabled, setIsEnabled] = useState(false);
  
  const { data: certifications = [], isLoading: certLoading } = useQuery<TrustCenterCertification[]>({
    queryKey: ["/api/trust-center/certifications"],
  });
  
  const { data: documents = [], isLoading: docsLoading } = useQuery<TrustCenterDocument[]>({
    queryKey: ["/api/trust-center/documents"],
  });

  const totalDownloads = documents.reduce((sum, doc) => sum + (doc.downloadCount || 0), 0);

  const EmptyState = ({ title, description, icon: Icon, action }: { title: string; description: string; icon: any; action?: string }) => (
    <Card className="glass-card">
      <CardContent className="p-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          <Icon className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
        <Button data-testid="button-get-started">
          <Plus className="w-4 h-4 mr-2" />
          {action || "Get Started"}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Trust Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Customer-facing compliance portal - share your security posture publicly
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch 
              checked={isEnabled} 
              onCheckedChange={setIsEnabled}
              data-testid="switch-trust-center-enabled"
            />
            <Label>Enable Trust Center</Label>
          </div>
          <Button variant="outline" data-testid="button-preview-trust-center">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button data-testid="button-publish-trust-center">
            <Globe className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/20">
              <Award className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{certifications.length}</p>
              <p className="text-sm text-muted-foreground">Certifications</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{documents.length}</p>
              <p className="text-sm text-muted-foreground">Documents</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Download className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalDownloads}</p>
              <p className="text-sm text-muted-foreground">Total Downloads</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-500/20">
              <Eye className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Page Views</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="certifications" className="space-y-4">
        <TabsList className="glass-card">
          <TabsTrigger value="certifications" data-testid="tab-certifications">
            <Award className="w-4 h-4 mr-2" />
            Certifications
          </TabsTrigger>
          <TabsTrigger value="documents" data-testid="tab-documents">
            <FileText className="w-4 h-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="certifications" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Certifications & Compliance</h2>
            <Button data-testid="button-add-certification">
              <Plus className="w-4 h-4 mr-2" />
              Add Certification
            </Button>
          </div>
          {certLoading ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading certifications...
              </CardContent>
            </Card>
          ) : certifications.length === 0 ? (
            <EmptyState 
              title="No Certifications Yet"
              description="Add your compliance certifications like ISO 27001, SOC 2, PCI DSS, and GDPR to share with your customers."
              icon={Award}
              action="Add Certification"
            />
          ) : (
            <div className="grid gap-4">
              {certifications.map((cert) => (
                <Card key={cert.id} className="glass-card">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/20">
                        <Shield className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{cert.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Certified by {cert.certificationBody} • Expires: {cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={cert.status === "published" ? "default" : "secondary"}>
                        {cert.status}
                      </Badge>
                      <Switch checked={cert.isPublic || false} />
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Security Documents</h2>
            <Button data-testid="button-upload-document">
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>
          {docsLoading ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading documents...
              </CardContent>
            </Card>
          ) : documents.length === 0 ? (
            <EmptyState 
              title="No Documents Yet"
              description="Upload security whitepapers, privacy policies, SOC reports, and other compliance documents to share with customers."
              icon={FileText}
              action="Upload Document"
            />
          ) : (
            <div className="grid gap-4">
              {documents.map((doc) => (
                <Card key={doc.id} className="glass-card">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-blue-500/20">
                        <FileText className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{doc.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {doc.category} • {doc.downloadCount || 0} downloads
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {doc.requiresNda && (
                        <Badge variant="outline">Requires NDA</Badge>
                      )}
                      <Switch checked={!doc.requiresNda} />
                      <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Trust Center Settings</CardTitle>
              <CardDescription>Configure your public trust center portal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Public URL</Label>
                  <Input 
                    placeholder="trust.yourcompany.com" 
                    data-testid="input-trust-center-url"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input 
                    placeholder="security@yourcompany.com" 
                    data-testid="input-contact-email"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Visible Sections</h3>
                <div className="grid grid-cols-2 gap-4">
                  {["Certifications", "Security Policies", "Compliance Status", "Penetration Tests", "SOC Reports", "Privacy Policy"].map((section) => (
                    <div key={section} className="flex items-center justify-between p-3 rounded-lg border">
                      <span>{section}</span>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </div>
              <Button data-testid="button-save-settings">Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
