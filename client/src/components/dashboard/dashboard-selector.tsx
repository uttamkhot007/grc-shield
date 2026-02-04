import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileImage,
  FileText,
  File,
  Presentation,
  LayoutDashboard,
  Shield,
  AlertTriangle,
  Lock,
  Users,
  Sparkles,
} from "lucide-react";
import { ExportFormat } from "@/lib/dashboard-export";

export type DashboardType = "executive" | "ciso" | "cro" | "cdpo" | "chro";

interface DashboardConfig {
  id: DashboardType;
  name: string;
  title: string;
  description: string;
  icon: typeof LayoutDashboard;
  color: string;
}

export const dashboardConfigs: DashboardConfig[] = [
  {
    id: "executive",
    name: "Executive Summary",
    title: "Executive Command Center",
    description: "High-level organizational overview for board and executives",
    icon: Presentation,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "ciso",
    name: "CISO Dashboard",
    title: "Security Operations Center",
    description: "Security-focused with threats, vulnerabilities, and controls",
    icon: Shield,
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "cro",
    name: "CRO Dashboard",
    title: "Risk Intelligence Center",
    description: "Risk metrics, heat maps, mitigation tracking, risk appetite",
    icon: AlertTriangle,
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "cdpo",
    name: "CDPO Dashboard",
    title: "Privacy Command Center",
    description: "DSAR stats, data inventory, privacy compliance, breaches",
    icon: Lock,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "chro",
    name: "CHRO Dashboard",
    title: "Workforce Compliance Center",
    description: "Training compliance, awareness metrics, policy acknowledgments",
    icon: Users,
    color: "from-rose-500 to-red-500",
  },
];

interface DashboardSelectorProps {
  currentDashboard: DashboardType;
  onDashboardChange: (dashboard: DashboardType) => void;
  onExport: (format: ExportFormat) => void;
  isExporting?: boolean;
}

export function DashboardSelector({
  currentDashboard,
  onDashboardChange,
  onExport,
  isExporting = false,
}: DashboardSelectorProps) {
  const currentConfig = dashboardConfigs.find((d) => d.id === currentDashboard);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <Select value={currentDashboard} onValueChange={(v) => onDashboardChange(v as DashboardType)}>
          <SelectTrigger
            className="w-[220px] bg-card/50 backdrop-blur-sm border-white/10"
            data-testid="select-dashboard-type"
          >
            <SelectValue placeholder="Select Dashboard">
              <div className="flex items-center gap-2">
                {currentConfig && (
                  <>
                    <currentConfig.icon className="h-4 w-4" />
                    <span>{currentConfig.name}</span>
                  </>
                )}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {dashboardConfigs.map((config) => (
              <SelectItem key={config.id} value={config.id}>
                <div className="flex items-center gap-2">
                  <config.icon className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{config.name}</span>
                    <span className="text-xs text-muted-foreground">{config.description}</span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge
          variant="secondary"
          className="bg-gradient-to-r from-chart-4 to-chart-5 text-white border-0"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          AI-Powered
        </Badge>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isExporting}
            className="bg-card/50 backdrop-blur-sm border-white/10"
            data-testid="button-export-dashboard"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onExport("pdf")} data-testid="export-pdf">
            <FileText className="h-4 w-4 mr-2 text-red-500" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport("jpeg")} data-testid="export-jpeg">
            <FileImage className="h-4 w-4 mr-2 text-blue-500" />
            Export as JPEG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport("word")} data-testid="export-word">
            <File className="h-4 w-4 mr-2 text-blue-600" />
            Export as Word
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
