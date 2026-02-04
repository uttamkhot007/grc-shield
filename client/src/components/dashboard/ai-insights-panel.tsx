import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Target,
  BookOpen,
  Shield,
  FileText,
  Play,
  ClipboardCheck,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const guidanceTips = [
  {
    id: 1,
    type: "getting_started",
    title: "Create Your First Risk Register",
    description:
      "Start by selecting a risk register template that matches your industry and compliance needs. Choose from IT-019, ISO 31000, NIST RMF, COSO ERM, or FAIR templates.",
    steps: [
      "Navigate to Risk > Register",
      "Click 'Templates' to browse available templates",
      "Select a template that fits your organization",
      "Click 'Use This Template' to create your register",
    ],
    link: "/risk/register",
    icon: Shield,
    priority: "high",
    category: "Risk Management",
  },
  {
    id: 2,
    type: "getting_started",
    title: "Run Your First BC/DR Test",
    description:
      "Validate your business continuity plans with structured testing. Start with a tabletop exercise before progressing to simulations.",
    steps: [
      "Go to Business Continuity module",
      "Select 'Test Workflows' tab",
      "Choose a tabletop exercise for beginners",
      "Review scenarios and schedule the test",
    ],
    link: "/bcp",
    icon: Play,
    priority: "medium",
    category: "Business Continuity",
  },
  {
    id: 3,
    type: "how_to",
    title: "Conduct Different Types of Audits",
    description:
      "GRC Shield supports internal audits, compliance audits, and certification audits. Each type has specific workflows and evidence requirements.",
    steps: [
      "Navigate to Audits section",
      "Click 'New Audit' and select audit type",
      "Define scope and assign auditors",
      "Create checklists and schedule fieldwork",
    ],
    link: "/audits",
    icon: ClipboardCheck,
    priority: "medium",
    category: "Auditing",
  },
  {
    id: 4,
    type: "how_to",
    title: "Map Controls to Frameworks",
    description:
      "Controls can be mapped to multiple compliance frameworks simultaneously. This enables efficient multi-framework compliance tracking.",
    steps: [
      "Go to Governance > Controls",
      "Select a control to view details",
      "Use 'Framework Mappings' to link to standards",
      "View cross-framework compliance coverage",
    ],
    link: "/governance/controls",
    icon: Target,
    priority: "low",
    category: "Compliance",
  },
  {
    id: 5,
    type: "best_practice",
    title: "Set Up Vendor Risk Assessments",
    description:
      "Third-party vendors can introduce significant risk. Establish a vendor risk management program to continuously monitor and assess vendor security.",
    steps: [
      "Navigate to Vendors section",
      "Add new vendors with basic information",
      "Assign risk tier based on data access",
      "Schedule periodic security assessments",
    ],
    link: "/vendors",
    icon: Users,
    priority: "medium",
    category: "Vendor Management",
  },
  {
    id: 6,
    type: "how_to",
    title: "Generate Compliance Reports",
    description:
      "Create executive-ready compliance reports from the Report Center. Choose from 35+ templates including SOC 2, ISO 27001, and regulatory reports.",
    steps: [
      "Go to Report Center",
      "Browse report categories",
      "Select template and customize parameters",
      "Generate and export as PDF or Word",
    ],
    link: "/reports",
    icon: FileText,
    priority: "low",
    category: "Reporting",
  },
];

const typeIcons = {
  getting_started: BookOpen,
  how_to: Lightbulb,
  best_practice: Target,
};

const priorityStyles = {
  high: "bg-amber-500/20 text-amber-500 border-amber-500/30",
  medium: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  low: "bg-muted text-muted-foreground",
};

const typeLabels = {
  getting_started: "Getting Started",
  how_to: "How To",
  best_practice: "Best Practice",
};

export function AiInsightsPanel() {
  return (
    <Card className="card-3d overflow-hidden" data-testid="ai-insights-panel">
      <CardHeader className="pb-2 bg-gradient-to-r from-chart-4/10 via-chart-5/10 to-chart-1/10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-chart-4 to-chart-5 glow">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-base font-semibold">
              Platform Guide
            </CardTitle>
            <Badge variant="secondary" className="bg-gradient-to-r from-chart-4/20 to-chart-5/20 border-0">
              <Sparkles className="h-3 w-3 mr-1" />
              Tips
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="text-xs">
            View All
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[360px]">
          <div className="space-y-3 p-4">
            {guidanceTips.map((tip) => {
              const TypeIcon = typeIcons[tip.type as keyof typeof typeIcons];
              const TipIcon = tip.icon;
              return (
                <div
                  key={tip.id}
                  className="p-4 rounded-lg bg-muted/50 border border-border/50 hover-elevate cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-primary/20">
                        <TipIcon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-semibold">{tip.title}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] capitalize",
                        priorityStyles[tip.priority as keyof typeof priorityStyles]
                      )}
                    >
                      {typeLabels[tip.type as keyof typeof typeLabels]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tip.description}
                  </p>
                  <div className="space-y-1 bg-background/50 rounded p-2">
                    {tip.steps.slice(0, 3).map((step, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] font-medium">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{step}</span>
                      </div>
                    ))}
                    {tip.steps.length > 3 && (
                      <p className="text-[10px] text-muted-foreground pl-6">
                        +{tip.steps.length - 3} more steps
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {tip.category}
                    </Badge>
                    <Link href={tip.link}>
                      <Button variant="secondary" size="sm" className="h-7 text-xs">
                        Start
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
