import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  BookOpen, 
  FileSpreadsheet, 
  Presentation,
  Plus,
  Sparkles,
  Download,
  Edit,
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle,
  Archive,
  Eye,
  Wand2,
  Save,
  Loader2,
  FileType,
  Calendar
} from "lucide-react";
import type { PlatformDocument } from "@shared/schema";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

type DocumentType = "release_notes" | "admin_guide" | "datasheet" | "product_presentation";

const documentTypeConfig: Record<DocumentType, { name: string; icon: typeof FileText; color: string; description: string }> = {
  release_notes: {
    name: "Release Notes",
    icon: FileText,
    color: "from-blue-500 to-cyan-500",
    description: "Version history and feature updates"
  },
  admin_guide: {
    name: "Admin Guide",
    icon: BookOpen,
    color: "from-emerald-500 to-teal-500",
    description: "Comprehensive administrator documentation"
  },
  datasheet: {
    name: "Datasheet",
    icon: FileSpreadsheet,
    color: "from-purple-500 to-pink-500",
    description: "Product specifications and capabilities"
  },
  product_presentation: {
    name: "Product Presentation",
    icon: Presentation,
    color: "from-amber-500 to-orange-500",
    description: "Solution overview, features, and USPs"
  }
};

export default function DocumentationPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<DocumentType>("release_notes");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<PlatformDocument | null>(null);
  const [newDocType, setNewDocType] = useState<DocumentType>("release_notes");
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocVersion, setNewDocVersion] = useState("1.0");
  const [editContent, setEditContent] = useState("");

  const { data: documents = [], isLoading } = useQuery<PlatformDocument[]>({
    queryKey: ["/api/platform-documents"],
  });

  const createDocMutation = useMutation({
    mutationFn: async (data: { type: DocumentType; title: string; version: string; content: string }) => {
      const res = await apiRequest("POST", "/api/platform-documents", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform-documents"] });
      setIsCreateDialogOpen(false);
      setNewDocTitle("");
      setNewDocVersion("1.0");
      toast({ title: "Document created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create document", description: error.message, variant: "destructive" });
    }
  });

  const updateDocMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PlatformDocument> }) => {
      const res = await apiRequest("PATCH", `/api/platform-documents/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform-documents"] });
      setIsEditDialogOpen(false);
      toast({ title: "Document updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update document", description: error.message, variant: "destructive" });
    }
  });

  const deleteDocMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/platform-documents/${id}`);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform-documents"] });
      toast({ title: "Document deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete document", description: error.message, variant: "destructive" });
    }
  });

  const generateDocMutation = useMutation({
    mutationFn: async (type: DocumentType) => {
      const response = await apiRequest("POST", "/api/platform-documents/generate", { type });
      return response.json();
    },
    onSuccess: (data: { content: string }, type) => {
      const config = documentTypeConfig[type];
      createDocMutation.mutate({
        type,
        title: `${config.name} - ${new Date().toLocaleDateString()}`,
        version: "1.0",
        content: data.content,
      });
    },
    onError: (error: any) => {
      toast({ title: "Failed to generate document", description: error.message, variant: "destructive" });
    }
  });

  const enrichDocMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/platform-documents/${id}/enrich`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform-documents"] });
      toast({ title: "Document enriched with AI successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to enrich document", description: error.message, variant: "destructive" });
    }
  });

  const filteredDocuments = documents.filter(doc => doc.type === activeTab);

  const exportAsPdf = async (doc: PlatformDocument) => {
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.setFillColor(10, 10, 15);
    pdf.rect(0, 0, 210, 297, "F");
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.text(doc.title, 15, 25);
    
    pdf.setFontSize(12);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Version: ${doc.version}`, 15, 35);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 15, 42);
    
    pdf.setTextColor(200, 200, 200);
    pdf.setFontSize(10);
    
    const lines = pdf.splitTextToSize(doc.content.replace(/[#*`]/g, ''), 180);
    let y = 55;
    for (const line of lines) {
      if (y > 280) {
        pdf.addPage();
        pdf.setFillColor(10, 10, 15);
        pdf.rect(0, 0, 210, 297, "F");
        y = 20;
      }
      pdf.text(line, 15, y);
      y += 5;
    }
    
    pdf.save(`${doc.title.toLowerCase().replace(/\s+/g, "-")}.pdf`);
    toast({ title: "PDF exported successfully" });
  };

  const exportAsWord = async (doc: PlatformDocument) => {
    const paragraphs = doc.content.split('\n').map(line => {
      const isHeading = line.startsWith('#');
      const cleanLine = line.replace(/^#+\s*/, '').replace(/[*`]/g, '');
      
      if (isHeading) {
        return new Paragraph({
          children: [new TextRun({ text: cleanLine, bold: true, size: 32 })],
          heading: HeadingLevel.HEADING_1,
        });
      }
      return new Paragraph({
        children: [new TextRun({ text: cleanLine, size: 24 })],
      });
    });

    const wordDoc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: doc.title, bold: true, size: 48 })],
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph({
            children: [new TextRun({ text: `Version: ${doc.version}`, size: 24, color: "666666" })],
          }),
          new Paragraph({ children: [] }),
          ...paragraphs,
        ],
      }],
    });

    const blob = await Packer.toBlob(wordDoc);
    const link = document.createElement("a");
    link.download = `${doc.title.toLowerCase().replace(/\s+/g, "-")}.docx`;
    link.href = URL.createObjectURL(blob);
    link.click();
    toast({ title: "Word document exported successfully" });
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "published":
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle className="h-3 w-3 mr-1" /> Published</Badge>;
      case "archived":
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30"><Archive className="h-3 w-3 mr-1" /> Archived</Badge>;
      default:
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Clock className="h-3 w-3 mr-1" /> Draft</Badge>;
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20">
              <BookOpen className="h-6 w-6 text-purple-400" />
            </div>
            Documentation Center
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered documentation management for Release Notes, Admin Guide, Datasheet, and Product Presentation
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" data-testid="button-create-document">
                <Plus className="h-4 w-4 mr-2" />
                Create Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Document</DialogTitle>
                <DialogDescription>Create a new document manually or generate with AI</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Select value={newDocType} onValueChange={(v) => setNewDocType(v as DocumentType)}>
                    <SelectTrigger data-testid="select-document-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(documentTypeConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className="h-4 w-4" />
                            {config.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    placeholder="Enter document title"
                    data-testid="input-document-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Version</Label>
                  <Input
                    value={newDocVersion}
                    onChange={(e) => setNewDocVersion(e.target.value)}
                    placeholder="1.0"
                    data-testid="input-document-version"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      if (!newDocTitle.trim()) {
                        toast({ title: "Please enter a title", variant: "destructive" });
                        return;
                      }
                      createDocMutation.mutate({
                        type: newDocType,
                        title: newDocTitle,
                        version: newDocVersion,
                        content: "# " + newDocTitle + "\n\nStart writing your documentation here...",
                      });
                    }}
                    disabled={createDocMutation.isPending}
                    data-testid="button-create-manual"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Create Manual
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                    onClick={() => generateDocMutation.mutate(newDocType)}
                    disabled={generateDocMutation.isPending || createDocMutation.isPending}
                    data-testid="button-generate-ai"
                  >
                    {generateDocMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Generate with AI
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DocumentType)} className="w-full">
        <TabsList className="grid grid-cols-4 bg-card/50 backdrop-blur-sm border border-white/10 p-1 h-auto">
          {Object.entries(documentTypeConfig).map(([key, config]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:border-purple-500/30 py-3"
              data-testid={`tab-${key}`}
            >
              <config.icon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{config.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(documentTypeConfig).map((type) => (
          <TabsContent key={type} value={type} className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : filteredDocuments.length === 0 ? (
              <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className={`p-4 rounded-full bg-gradient-to-br ${documentTypeConfig[type as DocumentType].color} opacity-20 mb-4`}>
                    {(() => {
                      const Icon = documentTypeConfig[type as DocumentType].icon;
                      return <Icon className="h-8 w-8 text-white" />;
                    })()}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No {documentTypeConfig[type as DocumentType].name} Yet</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-4">
                    {documentTypeConfig[type as DocumentType].description}. Create your first document manually or generate one with AI.
                  </p>
                  <Button
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                    onClick={() => {
                      setNewDocType(type as DocumentType);
                      setIsCreateDialogOpen(true);
                    }}
                    data-testid={`button-create-first-${type}`}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create {documentTypeConfig[type as DocumentType].name}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDocuments.map((doc) => {
                  const config = documentTypeConfig[doc.type as DocumentType];
                  return (
                    <Card key={doc.id} className="bg-card/50 backdrop-blur-sm border-white/10 hover:border-purple-500/30 transition-all duration-300 group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color} opacity-80`}>
                            <config.icon className="h-4 w-4 text-white" />
                          </div>
                          {getStatusBadge(doc.status)}
                        </div>
                        <CardTitle className="text-lg line-clamp-2 mt-2">{doc.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">v{doc.version}</Badge>
                          {doc.aiGenerated && (
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI Generated
                            </Badge>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
                          <Calendar className="h-3 w-3" />
                          Updated: {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDocument(doc);
                              setIsViewDialogOpen(true);
                            }}
                            data-testid={`button-view-${doc.id}`}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDocument(doc);
                              setEditContent(doc.content);
                              setIsEditDialogOpen(true);
                            }}
                            data-testid={`button-edit-${doc.id}`}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => enrichDocMutation.mutate(doc.id)}
                            disabled={enrichDocMutation.isPending}
                            data-testid={`button-enrich-${doc.id}`}
                          >
                            {enrichDocMutation.isPending ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <Wand2 className="h-3 w-3 mr-1" />
                            )}
                            Enrich
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportAsPdf(doc)}
                            data-testid={`button-export-pdf-${doc.id}`}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportAsWord(doc)}
                            data-testid={`button-export-word-${doc.id}`}
                          >
                            <FileType className="h-3 w-3 mr-1" />
                            Word
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this document?")) {
                                deleteDocMutation.mutate(doc.id);
                              }
                            }}
                            data-testid={`button-delete-${doc.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDocument && (
                <>
                  {(() => {
                    const config = documentTypeConfig[selectedDocument.type as DocumentType];
                    return (
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color}`}>
                        <config.icon className="h-4 w-4 text-white" />
                      </div>
                    );
                  })()}
                  {selectedDocument.title}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedDocument && `Version ${selectedDocument.version} • ${documentTypeConfig[selectedDocument.type as DocumentType].name}`}
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="prose prose-invert max-w-none mt-4">
              <ReactMarkdown>{selectedDocument.content}</ReactMarkdown>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>
              {selectedDocument && `Editing: ${selectedDocument.title}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 min-h-[400px] font-mono text-sm resize-none"
              placeholder="Write your documentation in Markdown format..."
              data-testid="textarea-edit-content"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500"
                onClick={() => {
                  if (selectedDocument) {
                    updateDocMutation.mutate({
                      id: selectedDocument.id,
                      data: { content: editContent }
                    });
                  }
                }}
                disabled={updateDocMutation.isPending}
                data-testid="button-save-changes"
              >
                {updateDocMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
