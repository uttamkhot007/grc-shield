import { Shield, Lock, BarChart3, FileCheck, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Comprehensive Security",
    description: "Enterprise-grade security frameworks including ISO 27001, SOC 2, GDPR, and more.",
  },
  {
    icon: Lock,
    title: "Risk Management",
    description: "Identify, assess, and mitigate risks with our intelligent risk register and heat maps.",
  },
  {
    icon: BarChart3,
    title: "Real-time Dashboards",
    description: "Tableau-quality analytics with compliance trends, risk distributions, and KPIs.",
  },
  {
    icon: FileCheck,
    title: "Policy Management",
    description: "Create, approve, and track policies with built-in workflow automation.",
  },
  {
    icon: Users,
    title: "Multi-Tenant Architecture",
    description: "Manage multiple organizations with role-based access and data segregation.",
  },
  {
    icon: Zap,
    title: "AI-Powered Insights",
    description: "Get intelligent recommendations for compliance gaps and policy improvements.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold gradient-text">GRC Shield</span>
          </div>
          <Button asChild data-testid="button-login">
            <a href="/api/login">Sign In</a>
          </Button>
        </div>
      </header>

      <main className="pt-16">
        <section className="relative overflow-hidden py-24 lg:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-1/5" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          
          <div className="relative max-w-7xl mx-auto px-6">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="gradient-text">Enterprise-Grade</span>
                <br />
                Governance, Risk & Compliance
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
                GRC Shield is a next-generation platform designed for modern enterprises. 
                Streamline your compliance workflows, manage risks intelligently, and maintain 
                audit-ready documentation with our AI-powered solution.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button size="lg" asChild className="glossy-btn" data-testid="button-get-started">
                  <a href="/api/login">Get Started</a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#features">Learn More</a>
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-chart-2" />
                  <span>100+ Security Frameworks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-chart-1" />
                  <span>AI-Powered Insights</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Everything You Need for GRC Excellence</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                Our comprehensive platform covers all aspects of governance, risk, and compliance 
                management for enterprises of any size.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index} className="glass-card group hover:border-primary/30 transition-all">
                  <CardContent className="pt-6">
                    <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your GRC Program?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join leading organizations that trust GRC Shield for their governance, 
              risk, and compliance needs.
            </p>
            <Button size="lg" asChild className="glossy-btn">
              <a href="/api/login">Start Your Journey</a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold">GRC Shield</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GRC Shield. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
