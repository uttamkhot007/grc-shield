import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Search,
  Database,
  Server,
  Shield,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  FileText,
  Globe,
  Lock,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTenant } from "@/contexts/tenant-context";

interface DataInventoryItem {
  id: string;
  name: string;
  dataType: string;
  source: string;
  owner: string;
  classification: string;
  retention: string;
  status: string;
  description?: string;
}

const inventoryFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  dataType: z.string().min(1, "Data type is required"),
  source: z.string().min(1, "Source is required"),
  owner: z.string().min(1, "Owner is required"),
  classification: z.string().min(1, "Classification is required"),
  retention: z.string().min(1, "Retention period is required"),
  description: z.string().optional(),
});

type InventoryFormValues = z.infer<typeof inventoryFormSchema>;

const classificationStyles: Record<string, { bg: string; text: string }> = {
  public: { bg: "bg-chart-2/20", text: "text-chart-2" },
  internal: { bg: "bg-chart-1/20", text: "text-chart-1" },
  confidential: { bg: "bg-chart-3/20", text: "text-chart-3" },
  restricted: { bg: "bg-destructive/20", text: "text-destructive" },
};

const mockInventory: DataInventoryItem[] = [
  { id: "1", name: "Customer Records", dataType: "Personal Data", source: "CRM System", owner: "Sales Department", classification: "confidential", retention: "7 years", status: "active", description: "Customer contact and transaction data" },
  { id: "2", name: "Employee Data", dataType: "HR Data", source: "HRIS", owner: "HR Department", classification: "restricted", retention: "Employment + 7 years", status: "active", description: "Employee personal and employment records" },
  { id: "3", name: "Website Analytics", dataType: "Behavioral Data", source: "Google Analytics", owner: "Marketing", classification: "internal", retention: "2 years", status: "active", description: "User behavior and interaction data" },
  { id: "4", name: "Financial Transactions", dataType: "Financial Data", source: "ERP System", owner: "Finance", classification: "restricted", retention: "10 years", status: "active", description: "Transaction records and financial data" },
  { id: "5", name: "Marketing Leads", dataType: "Contact Data", source: "Marketing Platform", owner: "Marketing", classification: "confidential", retention: "3 years", status: "active", description: "Prospect and lead information" },
];

export default function DataInventoryPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [inventory] = useState<DataInventoryItem[]>(mockInventory);

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      name: "",
      dataType: "",
      source: "",
      owner: "",
      classification: "",
      retention: "",
      description: "",
    },
  });

  const handleCreate = (data: InventoryFormValues) => {
    toast({ title: "Data inventory item created successfully" });
    setIsCreateDialogOpen(false);
    form.reset();
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.dataType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClassification = classificationFilter === "all" || item.classification === classificationFilter;
    return matchesSearch && matchesClassification;
  });

  const classificationCounts = {
    public: inventory.filter(i => i.classification === "public").length,
    internal: inventory.filter(i => i.classification === "internal").length,
    confidential: inventory.filter(i => i.classification === "confidential").length,
    restricted: inventory.filter(i => i.classification === "restricted").length,
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="mesh-gradient min-h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Data Inventory</h1>
              <p className="text-muted-foreground mt-1">
                Catalog and classify all data assets across your organization
              </p>
            </div>
            <Button data-testid="button-add-inventory" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Data Asset
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="stat-gradient-green">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-2/20">
                    <Globe className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{classificationCounts.public}</p>
                    <p className="text-xs text-muted-foreground">Public</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-blue">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-1/20">
                    <Users className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{classificationCounts.internal}</p>
                    <p className="text-xs text-muted-foreground">Internal</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-amber">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-3/20">
                    <Shield className="h-5 w-5 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{classificationCounts.confidential}</p>
                    <p className="text-xs text-muted-foreground">Confidential</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-gradient-red">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/20">
                    <Lock className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{classificationCounts.restricted}</p>
                    <p className="text-xs text-muted-foreground">Restricted</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="card-3d">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-base">Data Assets</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search data assets..."
                      className="pl-9 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="input-search-inventory"
                    />
                  </div>
                  <Select value={classificationFilter} onValueChange={setClassificationFilter}>
                    <SelectTrigger className="w-36" data-testid="select-classification">
                      <SelectValue placeholder="Classification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="internal">Internal</SelectItem>
                      <SelectItem value="confidential">Confidential</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Data Asset</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead>Retention</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => {
                    const style = classificationStyles[item.classification] || classificationStyles.internal;
                    return (
                      <TableRow key={item.id} data-testid={`row-inventory-${item.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.dataType}</TableCell>
                        <TableCell>{item.source}</TableCell>
                        <TableCell>{item.owner}</TableCell>
                        <TableCell>
                          <Badge className={`${style.bg} ${style.text} border-0 capitalize`}>
                            {item.classification}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.retention}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Data Asset</DialogTitle>
                <DialogDescription>
                  Add a new data asset to your inventory
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Customer Records" data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dataType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="personal">Personal Data</SelectItem>
                              <SelectItem value="financial">Financial Data</SelectItem>
                              <SelectItem value="hr">HR Data</SelectItem>
                              <SelectItem value="behavioral">Behavioral Data</SelectItem>
                              <SelectItem value="contact">Contact Data</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="classification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Classification</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select classification" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="internal">Internal</SelectItem>
                              <SelectItem value="confidential">Confidential</SelectItem>
                              <SelectItem value="restricted">Restricted</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="source"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., CRM System" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="owner"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Owner</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Sales Department" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="retention"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Retention Period</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 7 years" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} placeholder="Brief description of the data asset" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Asset</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
