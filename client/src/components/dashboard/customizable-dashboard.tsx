import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  LayoutGrid,
  Save,
  RotateCcw,
  Search,
  AlertTriangle,
  Shield,
  FileText,
  Bell,
  Building2,
  ClipboardCheck,
  CheckSquare,
  Layers,
  Activity,
  Lock,
  BarChart3,
  Grid3X3,
} from "lucide-react";
import {
  DashboardWidget,
  WidgetType,
  widgetConfigs,
  defaultDashboardLayout,
} from "./widget-types";
import { widgetComponents } from "./dashboard-widgets";
import { useToast } from "@/hooks/use-toast";
import { useTenant } from "@/contexts/tenant-context";

const getStorageKey = (tenantId?: string | null) => 
  `grc-dashboard-layout-${tenantId || "default"}`;

const iconMap: Record<string, React.ElementType> = {
  BarChart3,
  AlertTriangle,
  Shield,
  FileText,
  Bell,
  Grid3X3,
  Building2,
  ClipboardCheck,
  CheckSquare,
  Layers,
  Activity,
  Lock,
};

export function CustomizableDashboard() {
  const { toast } = useToast();
  const { currentTenant, currentTenantId } = useTenant();
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  useEffect(() => {
    const storageKey = getStorageKey(currentTenantId);
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setWidgets(JSON.parse(saved));
      } catch {
        setWidgets(defaultDashboardLayout);
      }
    } else {
      setWidgets(defaultDashboardLayout);
    }
  }, [currentTenantId]);

  const saveLayout = useCallback(() => {
    const storageKey = getStorageKey(currentTenantId);
    localStorage.setItem(storageKey, JSON.stringify(widgets));
    toast({
      title: "Layout Saved",
      description: "Your dashboard layout has been saved.",
    });
  }, [widgets, toast, currentTenantId]);

  const resetLayout = useCallback(() => {
    setWidgets(defaultDashboardLayout);
    const storageKey = getStorageKey(currentTenantId);
    localStorage.removeItem(storageKey);
    toast({
      title: "Layout Reset",
      description: "Dashboard restored to default layout.",
    });
  }, [toast, currentTenantId]);

  const addWidget = useCallback((type: WidgetType) => {
    const config = widgetConfigs.find((w) => w.type === type);
    if (!config) return;

    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type,
      title: config.name,
      width: config.defaultWidth,
      height: config.defaultHeight,
      order: widgets.length,
    };

    setWidgets((prev) => [...prev, newWidget]);
    setIsLibraryOpen(false);
    toast({
      title: "Widget Added",
      description: `${config.name} added to dashboard.`,
    });
  }, [widgets.length, toast]);

  const removeWidget = useCallback((id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, widgetId: string) => {
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedWidget || draggedWidget === targetId) {
      setDraggedWidget(null);
      return;
    }

    setWidgets((prev) => {
      const newWidgets = [...prev];
      const draggedIndex = newWidgets.findIndex((w) => w.id === draggedWidget);
      const targetIndex = newWidgets.findIndex((w) => w.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) return prev;

      const [removed] = newWidgets.splice(draggedIndex, 1);
      newWidgets.splice(targetIndex, 0, removed);

      return newWidgets.map((w, i) => ({ ...w, order: i }));
    });

    setDraggedWidget(null);
  }, [draggedWidget]);

  const handleDragEnd = useCallback(() => {
    setDraggedWidget(null);
  }, []);

  const filteredWidgetConfigs = widgetConfigs.filter((config) => {
    const existingTypes = widgets.map((w) => w.type);
    const alreadyAdded = existingTypes.includes(config.type);
    const matchesSearch = config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && !alreadyAdded;
  });

  return (
    <div className="flex-1 overflow-auto">
      <div className="mesh-gradient min-h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text">
                Customizable Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                {currentTenant
                  ? `Drag and drop widgets to customize your view for ${currentTenant.name}`
                  : "Drag and drop widgets to customize your view"}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Sheet open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
                <SheetTrigger asChild>
                  <Button className="gap-2" data-testid="button-add-widget">
                    <Plus className="h-4 w-4" />
                    Add Widget
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[540px]">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <LayoutGrid className="h-5 w-5" />
                      Widget Library
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search widgets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                        data-testid="input-widget-search"
                      />
                    </div>
                    <div className="grid gap-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                      {filteredWidgetConfigs.map((config) => {
                        const IconComponent = iconMap[config.icon] || BarChart3;
                        return (
                          <Card
                            key={config.type}
                            className="cursor-pointer hover-elevate transition-all"
                            onClick={() => addWidget(config.type)}
                            data-testid={`widget-library-${config.type}`}
                          >
                            <CardContent className="p-4 flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <IconComponent className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{config.name}</div>
                                <div className="text-sm text-muted-foreground">{config.description}</div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {config.defaultWidth}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {config.defaultHeight}
                                  </Badge>
                                </div>
                              </div>
                              <Plus className="h-5 w-5 text-muted-foreground" />
                            </CardContent>
                          </Card>
                        );
                      })}
                      {filteredWidgetConfigs.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          {searchQuery
                            ? "No matching widgets found"
                            : "All widgets have been added to your dashboard"}
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              <Button variant="outline" className="gap-2" onClick={saveLayout} data-testid="button-save-layout">
                <Save className="h-4 w-4" />
                Save Layout
              </Button>
              <Button variant="ghost" className="gap-2" onClick={resetLayout} data-testid="button-reset-layout">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          {widgets.length === 0 ? (
            <Card className="glass-card border-white/10">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <LayoutGrid className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Widgets</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  Your dashboard is empty. Add widgets from the library to build your personalized view.
                </p>
                <Button onClick={() => setIsLibraryOpen(true)} data-testid="button-add-first-widget">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Widget
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {widgets
                .sort((a, b) => a.order - b.order)
                .map((widget) => {
                  const WidgetComponent = widgetComponents[widget.type];
                  if (!WidgetComponent) return null;

                  return (
                    <div
                      key={widget.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, widget.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, widget.id)}
                      onDragEnd={handleDragEnd}
                      className={draggedWidget === widget.id ? "opacity-50" : ""}
                    >
                      <WidgetComponent
                        widget={widget}
                        onRemove={removeWidget}
                        isDragging={draggedWidget === widget.id}
                      />
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
