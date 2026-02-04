import { ReactNode } from "react";
import { useLicense, LICENSE_MODULES } from "@/contexts/LicenseContext";
import { Lock, Crown, Sparkles, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FeatureGateProps {
  module: string;
  children: ReactNode;
  fallback?: ReactNode;
  showLockedOverlay?: boolean;
}

// Map modules to their required license tier
const MODULE_TIERS: Record<string, string> = {
  [LICENSE_MODULES.DASHBOARD]: "Starter",
  [LICENSE_MODULES.POLICIES]: "Starter",
  [LICENSE_MODULES.FRAMEWORKS]: "Starter",
  [LICENSE_MODULES.RISK_REGISTER]: "Professional",
  [LICENSE_MODULES.AUDITS]: "Professional",
  [LICENSE_MODULES.VENDORS]: "Professional",
  [LICENSE_MODULES.CONTROLS]: "Professional",
  [LICENSE_MODULES.AI_INSIGHTS]: "Enterprise",
  [LICENSE_MODULES.PROCESSES]: "Enterprise",
  [LICENSE_MODULES.INTEGRATIONS]: "Enterprise",
  [LICENSE_MODULES.PRIVACY_ROPA]: "Unlimited",
  [LICENSE_MODULES.PRIVACY_CONSENT]: "Unlimited",
  [LICENSE_MODULES.PRIVACY_DSR]: "Unlimited",
  [LICENSE_MODULES.PRIVACY_DPIA]: "Unlimited",
  [LICENSE_MODULES.PRIVACY_BREACH]: "Unlimited",
  [LICENSE_MODULES.PRIVACY_DATA_MAPPING]: "Unlimited",
  [LICENSE_MODULES.PRIVACY_RETENTION]: "Unlimited",
  [LICENSE_MODULES.PRIVACY_DISCOVERY]: "Unlimited",
};

// Module descriptions for the upgrade dialog
const MODULE_DESCRIPTIONS: Record<string, string> = {
  [LICENSE_MODULES.RISK_REGISTER]: "Comprehensive risk management with scoring and mitigation tracking",
  [LICENSE_MODULES.AUDITS]: "Full audit lifecycle management with checklists and findings",
  [LICENSE_MODULES.VENDORS]: "Third-party vendor risk assessment and monitoring",
  [LICENSE_MODULES.CONTROLS]: "Security control implementation and evidence tracking",
  [LICENSE_MODULES.AI_INSIGHTS]: "AI-powered compliance recommendations and gap analysis",
  [LICENSE_MODULES.PROCESSES]: "Process and procedure documentation with templates",
  [LICENSE_MODULES.INTEGRATIONS]: "Connect with ITSM, SIEM, EDR and identity platforms",
  [LICENSE_MODULES.PRIVACY_ROPA]: "GDPR Article 30 compliant Records of Processing Activities",
  [LICENSE_MODULES.PRIVACY_CONSENT]: "Consent lifecycle management and preference center",
  [LICENSE_MODULES.PRIVACY_DSR]: "Data Subject Request portal with automated workflows",
  [LICENSE_MODULES.PRIVACY_DPIA]: "Data Protection Impact Assessment automation",
  [LICENSE_MODULES.PRIVACY_BREACH]: "Privacy incident response and breach notification",
  [LICENSE_MODULES.PRIVACY_DATA_MAPPING]: "Visual data flow mapping and classification",
  [LICENSE_MODULES.PRIVACY_RETENTION]: "Automated data retention policy enforcement",
  [LICENSE_MODULES.PRIVACY_DISCOVERY]: "PII discovery and sensitive data scanning",
};

export function FeatureGate({ 
  module, 
  children, 
  fallback,
  showLockedOverlay = true 
}: FeatureGateProps) {
  const { hasModule, licenseType, isLicenseValid } = useLicense();

  // Check if module is accessible
  const hasAccess = hasModule(module) && isLicenseValid();

  if (hasAccess) {
    return <>{children}</>;
  }

  // If no overlay requested, just show fallback or nothing
  if (!showLockedOverlay) {
    return <>{fallback || null}</>;
  }

  const requiredTier = MODULE_TIERS[module] || "Professional";
  const description = MODULE_DESCRIPTIONS[module] || "This feature requires an upgraded license.";

  return (
    <div className="relative">
      {/* Blurred content preview */}
      <div className="pointer-events-none select-none blur-sm opacity-40">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
        <div className="text-center p-8 max-w-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-amber-500" />
          </div>
          
          <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            Premium Feature
          </h3>
          
          <p className="text-muted-foreground mb-4">
            {description}
          </p>

          <Badge variant="outline" className="mb-4 border-amber-500/50 text-amber-500">
            Requires {requiredTier} License
          </Badge>

          <div className="mt-4">
            <UpgradeDialog currentTier={licenseType} requiredTier={requiredTier} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface UpgradeDialogProps {
  currentTier: string | null;
  requiredTier: string;
}

function UpgradeDialog({ currentTier, requiredTier }: UpgradeDialogProps) {
  const tiers = [
    {
      name: "Starter",
      price: "$299",
      period: "/month",
      features: ["Dashboard", "Policies", "Frameworks", "5 Users", "2 Frameworks"],
    },
    {
      name: "Professional",
      price: "$599",
      period: "/month",
      features: ["Everything in Starter", "Risk Register", "Audits", "Vendors", "Controls", "25 Users", "5 Frameworks"],
    },
    {
      name: "Enterprise",
      price: "$1,499",
      period: "/month",
      features: ["Everything in Professional", "AI Insights", "Processes", "Integrations", "100 Users", "All Frameworks"],
    },
    {
      name: "Unlimited",
      price: "Custom",
      period: "",
      features: ["Everything in Enterprise", "Full Privacy Module", "ROPA Registry", "Consent Management", "DSR Portal", "DPIA", "Unlimited Users"],
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2" data-testid="button-upgrade-license">
          <Sparkles className="w-4 h-4" />
          Upgrade License
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="w-6 h-6 text-amber-500" />
            Upgrade Your License
          </DialogTitle>
          <DialogDescription>
            {currentTier 
              ? `You're currently on the ${currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} plan. Upgrade to ${requiredTier} or higher to unlock this feature.`
              : `Upgrade to ${requiredTier} or higher to unlock this feature.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {tiers.map((tier) => {
            const isCurrentTier = currentTier?.toLowerCase() === tier.name.toLowerCase();
            const isRecommended = tier.name === requiredTier;
            
            return (
              <div
                key={tier.name}
                className={`relative rounded-xl border p-4 ${
                  isRecommended 
                    ? "border-primary bg-primary/5 ring-2 ring-primary" 
                    : isCurrentTier
                    ? "border-muted bg-muted/50"
                    : "border-border"
                }`}
              >
                {isRecommended && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                    Recommended
                  </Badge>
                )}
                {isCurrentTier && (
                  <Badge variant="secondary" className="absolute -top-2 left-1/2 -translate-x-1/2">
                    Current Plan
                  </Badge>
                )}
                
                <div className="pt-2">
                  <h4 className="font-semibold text-lg">{tier.name}</h4>
                  <div className="mt-2 mb-4">
                    <span className="text-2xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground text-sm">{tier.period}</span>
                  </div>
                  
                  <ul className="space-y-2 text-sm">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    className="w-full mt-4 gap-2"
                    variant={isRecommended ? "default" : "outline"}
                    disabled={isCurrentTier}
                    data-testid={`button-select-${tier.name.toLowerCase()}`}
                  >
                    {isCurrentTier ? "Current Plan" : "Select Plan"}
                    {!isCurrentTier && <ArrowUpRight className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Contact our sales team at <strong>sales@grcshield.com</strong> for custom enterprise pricing and volume discounts.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Wrapper for locked sidebar menu items
interface LockedMenuItemProps {
  module: string;
  children: ReactNode;
}

export function LockedMenuItem({ module, children }: LockedMenuItemProps) {
  const { hasModule, isLicenseValid } = useLicense();
  const hasAccess = hasModule(module) && isLicenseValid();
  const requiredTier = MODULE_TIERS[module] || "Professional";

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      <div className="opacity-60 pointer-events-none">
        {children}
      </div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <Lock className="w-3 h-3 text-amber-500" />
        <span className="text-xs text-amber-500 hidden group-hover:inline">
          {requiredTier}
        </span>
      </div>
    </div>
  );
}
