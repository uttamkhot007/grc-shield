import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  FileText,
  AlertTriangle,
  ClipboardCheck,
  Upload,
  Users,
  Building2,
  Shield,
} from "lucide-react";

const actions = [
  {
    label: "New Policy",
    icon: FileText,
    color: "bg-chart-1/20 text-chart-1 hover:bg-chart-1/30",
    href: "/governance/policies/new",
  },
  {
    label: "Log Risk",
    icon: AlertTriangle,
    color: "bg-chart-3/20 text-chart-3 hover:bg-chart-3/30",
    href: "/risk/register/new",
  },
  {
    label: "Start Audit",
    icon: ClipboardCheck,
    color: "bg-chart-2/20 text-chart-2 hover:bg-chart-2/30",
    href: "/audits/new",
  },
  {
    label: "Upload Evidence",
    icon: Upload,
    color: "bg-chart-4/20 text-chart-4 hover:bg-chart-4/30",
    href: "/compliance/evidence/upload",
  },
  {
    label: "Add Vendor",
    icon: Building2,
    color: "bg-chart-5/20 text-chart-5 hover:bg-chart-5/30",
    href: "/vendors/new",
  },
  {
    label: "Invite User",
    icon: Users,
    color: "bg-muted text-muted-foreground hover:bg-muted/80",
    href: "/users/invite",
  },
];

export function QuickActions() {
  return (
    <Card className="card-3d" data-testid="quick-actions">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              className={`h-auto py-3 flex flex-col items-center gap-2 ${action.color}`}
              data-testid={`action-${action.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <action.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
