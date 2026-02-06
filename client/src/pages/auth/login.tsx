import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Loader2, 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  Mail, 
  KeyRound,
  Brain,
  Target,
  FileCheck,
  Globe,
  Zap,
  ArrowRight,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AuthMode = "login" | "register" | "mfa";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Intelligence",
    description: "Predictive compliance & risk detection"
  },
  {
    icon: Globe,
    title: "109+ Global Frameworks",
    description: "ISO 27001, SOC 2, GDPR, NIST"
  },
  {
    icon: Target,
    title: "Risk Management",
    description: "Real-time risk monitoring"
  },
  {
    icon: FileCheck,
    title: "Policy Automation",
    description: "AI-enriched policy generation"
  }
];

const stats = [
  { value: "1,000+", label: "Controls" },
  { value: "109", label: "Frameworks" },
  { value: "89%", label: "AI Enriched" },
  { value: "24/7", label: "Monitoring" }
];

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, verifyMfa, register, isLoggingIn, isVerifyingMfa, isRegistering } = useAuth();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    mfaCode: "",
  });
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const result = await login({ username: formData.username, password: formData.password });
      
      if (result.requiresMfa) {
        setMode("mfa");
        toast({ title: "MFA Required", description: "Please enter your authentication code" });
      } else {
        toast({ title: "Welcome back!", description: "Login successful" });
        setLocation("/");
      }
    } catch (err: any) {
      const message = err.message || "Login failed";
      setError(message);
      toast({ title: "Login Failed", description: message, variant: "destructive" });
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      await verifyMfa({ code: formData.mfaCode });
      toast({ title: "Welcome back!", description: "MFA verified successfully" });
      setLocation("/");
    } catch (err: any) {
      const message = err.message || "Invalid MFA code";
      setError(message);
      toast({ title: "Verification Failed", description: message, variant: "destructive" });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      toast({ title: "Welcome!", description: "Account created successfully" });
      setLocation("/");
    } catch (err: any) {
      const message = err.message || "Registration failed";
      setError(message);
      toast({ title: "Registration Failed", description: message, variant: "destructive" });
    }
  };

  const isPending = isLoggingIn || isVerifyingMfa || isRegistering;

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 25%, #ede9fe 50%, #fce7f3 75%, #fdf2f8 100%)"
        }}
      />
      
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 20%, rgba(236, 72, 153, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 50% 30% at 60% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse 40% 50% at 10% 90%, rgba(244, 114, 182, 0.08) 0%, transparent 50%)
          `
        }}
      />
      
      <div className="absolute top-[5%] right-[8%] w-20 h-20 opacity-80 animate-float" style={{ animationDelay: "0s" }}>
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-violet-400/40 to-purple-500/30 backdrop-blur-sm border border-white/40 shadow-xl transform rotate-12 flex items-center justify-center">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-300/60 to-purple-400/40 border border-white/30" />
        </div>
      </div>
      
      <div className="absolute bottom-[15%] right-[5%] w-24 h-24 opacity-70 animate-float" style={{ animationDelay: "1s" }}>
        <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-300/30 to-rose-400/20 backdrop-blur-sm border border-white/30 shadow-lg flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200/50 to-rose-300/30 border border-white/40" />
        </div>
      </div>
      
      <div className="absolute top-[60%] right-[15%] w-16 h-16 opacity-60 animate-float" style={{ animationDelay: "2s" }}>
        <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-300/30 to-blue-400/20 backdrop-blur-sm border border-white/30 shadow-lg transform -rotate-6" />
      </div>
      
      <div className="absolute top-[25%] left-[60%] w-12 h-12 opacity-50 animate-float" style={{ animationDelay: "1.5s" }}>
        <div className="w-full h-full rounded-lg bg-gradient-to-br from-fuchsia-300/30 to-pink-400/20 backdrop-blur-sm border border-white/30 shadow-md" />
      </div>
      
      <div className="absolute bottom-[30%] left-[55%] w-8 h-8 rounded-full bg-pink-300/40 animate-pulse" />
      <div className="absolute top-[15%] left-[70%] w-6 h-6 rounded-full bg-violet-300/40 animate-pulse" style={{ animationDelay: "0.5s" }} />
      <div className="absolute bottom-[50%] right-[25%] w-4 h-4 rounded-full bg-purple-300/50 animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="hidden lg:flex lg:w-[50%] relative z-10">
        <div className="relative flex flex-col justify-center p-12 xl:p-16 w-full">
          <div data-testid="brand-logo" className="absolute top-8 left-12 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 backdrop-blur-sm border border-white/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 data-testid="text-brand-name" className="text-xl font-bold text-slate-800">GRC Shield</h1>
              <p className="text-xs text-slate-500">Enterprise Platform</p>
            </div>
          </div>

          <div className="max-w-lg mt-16">
            <h2 data-testid="text-headline" className="text-4xl xl:text-5xl font-bold text-slate-800 leading-tight mb-6">
              The World's Most{" "}
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                Powerful GRC
              </span>{" "}
              Platform.
            </h2>
            
            <p data-testid="text-subheading" className="text-lg text-slate-600 mb-10 leading-relaxed">
              Transform governance, risk, and compliance into your strategic advantage 
              with AI-powered intelligence and automation.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  data-testid={`card-feature-${index}`}
                  className="p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 shadow-lg shadow-purple-500/5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-3 shadow-md shadow-purple-500/20">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 data-testid={`text-feature-title-${index}`} className="font-semibold text-slate-800 text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>

            <div data-testid="stats-panel" className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 backdrop-blur-md border border-white/50 shadow-lg">
              {stats.map((stat, index) => (
                <div key={index} data-testid={`stat-${index}`} className="text-center flex-1">
                  <div data-testid={`text-stat-value-${index}`} className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{stat.value}</div>
                  <div data-testid={`text-stat-label-${index}`} className="text-xs text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div data-testid="mobile-brand-logo" className="lg:hidden absolute top-6 left-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span data-testid="mobile-brand-name" className="font-bold text-lg text-slate-800">GRC Shield</span>
        </div>

        <div className="lg:hidden absolute top-6 right-6">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/60 backdrop-blur-sm border-violet-200 text-violet-600 hover:bg-violet-50"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            data-testid="button-mobile-toggle-mode"
          >
            {mode === "login" ? "Sign up now" : "Sign in"}
          </Button>
        </div>

        <Card className="w-full max-w-md bg-white/70 backdrop-blur-xl border-white/50 shadow-2xl shadow-purple-500/10 relative overflow-hidden rounded-3xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-200/30 to-transparent rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-200/30 to-transparent rounded-tr-full" />
          
          <CardHeader className="text-center space-y-4 pb-2 relative z-10">
            <div className="lg:hidden mx-auto mb-2">
              <Badge data-testid="badge-mobile-platform" className="bg-violet-100 text-violet-600 border-violet-200">
                <Sparkles className="w-3 h-3 mr-1" />
                Enterprise GRC Platform
              </Badge>
            </div>
            <div>
              <CardTitle data-testid="text-form-title" className="text-2xl font-bold text-slate-800">
                {mode === "login" && "Sign in Now."}
                {mode === "register" && "Get Started."}
                {mode === "mfa" && "Verify Identity."}
              </CardTitle>
              <CardDescription data-testid="text-form-description" className="mt-2 text-slate-500">
                {mode === "login" && "Enter your details below"}
                {mode === "register" && "Create your account to get started"}
                {mode === "mfa" && "Enter the code from your authenticator"}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="pt-4 relative z-10">
            {error && (
              <div data-testid="text-error" className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            
            {mode === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-600">Username or Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="username"
                      data-testid="input-username"
                      placeholder="dash@ui8.net"
                      className="pl-11 h-12 bg-white/80 border-slate-200 rounded-xl focus:border-violet-400 focus:ring-violet-400/20 text-slate-800"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-slate-600">Password</Label>
                    <button type="button" className="text-xs text-violet-600 hover:text-violet-700 font-medium">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      data-testid="input-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="pl-11 pr-11 h-12 bg-white/80 border-slate-200 rounded-xl focus:border-violet-400 focus:ring-violet-400/20 text-slate-800"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1.5 text-slate-400 hover:text-slate-600"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  size="lg"
                  data-testid="button-login"
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5"
                  disabled={isPending}
                >
                  {isLoggingIn ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            )}
            
            {mode === "mfa" && (
              <form onSubmit={handleMfaVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mfaCode" className="text-slate-600">Authentication Code</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                    <Input
                      id="mfaCode"
                      data-testid="input-mfa-code"
                      placeholder="000000"
                      className="pl-11 text-center text-2xl tracking-widest h-14 bg-white/80 border-slate-200 rounded-xl focus:border-violet-400 text-slate-800"
                      maxLength={6}
                      value={formData.mfaCode}
                      onChange={(e) => setFormData({ ...formData, mfaCode: e.target.value.replace(/\D/g, "") })}
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>
                
                <Button
                  type="submit"
                  size="lg"
                  data-testid="button-verify-mfa"
                  className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-purple-500/25"
                  disabled={isPending || formData.mfaCode.length < 6}
                >
                  {isVerifyingMfa ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Verify & Continue
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-slate-500 hover:text-slate-700"
                  onClick={() => {
                    setMode("login");
                    setFormData({ ...formData, mfaCode: "" });
                  }}
                  data-testid="button-back-to-login"
                >
                  Back to Login
                </Button>
              </form>
            )}
            
            {mode === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-slate-600">First Name</Label>
                    <Input
                      id="firstName"
                      data-testid="input-first-name"
                      placeholder="John"
                      className="h-12 bg-white/80 border-slate-200 rounded-xl focus:border-violet-400 text-slate-800"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-slate-600">Last Name</Label>
                    <Input
                      id="lastName"
                      data-testid="input-last-name"
                      placeholder="Doe"
                      className="h-12 bg-white/80 border-slate-200 rounded-xl focus:border-violet-400 text-slate-800"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reg-username" className="text-slate-600">Username</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="reg-username"
                      data-testid="input-reg-username"
                      placeholder="Choose a username"
                      className="pl-11 h-12 bg-white/80 border-slate-200 rounded-xl focus:border-violet-400 text-slate-800"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-600">Work Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      data-testid="input-email"
                      type="email"
                      placeholder="john@company.com"
                      className="pl-11 h-12 bg-white/80 border-slate-200 rounded-xl focus:border-violet-400 text-slate-800"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-slate-600">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="reg-password"
                      data-testid="input-reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      className="pl-11 pr-11 h-12 bg-white/80 border-slate-200 rounded-xl focus:border-violet-400 text-slate-800"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1.5 text-slate-400"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="button-toggle-reg-password"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  size="lg"
                  data-testid="button-register"
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-purple-500/25"
                  disabled={isPending}
                >
                  {isRegistering ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <p data-testid="text-terms" className="text-xs text-slate-500 text-center">
                  By creating an account, you agree to our Terms of Service
                </p>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex-col space-y-4 pt-2 relative z-10">
            {mode !== "mfa" && (
              <div className="text-sm text-slate-500 text-center">
                {mode === "login" ? (
                  <>
                    Not a member?{" "}
                    <button
                      type="button"
                      className="text-violet-600 font-semibold hover:text-violet-700"
                      onClick={() => setMode("register")}
                      data-testid="link-register"
                    >
                      Sign up now
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="text-violet-600 font-semibold hover:text-violet-700"
                      onClick={() => setMode("login")}
                      data-testid="link-login"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>
            )}
            
            <div data-testid="compliance-badges" className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-2">
              <div data-testid="badge-soc2" className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-violet-500" />
                <span>SOC 2</span>
              </div>
              <div data-testid="badge-iso" className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-violet-500" />
                <span>ISO 27001</span>
              </div>
              <div data-testid="badge-gdpr" className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-violet-500" />
                <span>GDPR</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(var(--rotate, 12deg)); }
          50% { transform: translateY(-20px) rotate(var(--rotate, 12deg)); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
