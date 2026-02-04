import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Smartphone, Key, Lock, Loader2, Check, Copy, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MfaSetupResponse {
  secret: string;
  qrCode: string;
  message: string;
}

interface MfaEnableResponse {
  backupCodes: string[];
  message: string;
}

export default function SecuritySettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isDisableOpen, setIsDisableOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  const setupMfaMutation = useMutation<MfaSetupResponse, Error>({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/mfa/setup", {});
      return res.json();
    },
  });

  const enableMfaMutation = useMutation<MfaEnableResponse, Error, { code: string }>({
    mutationFn: async ({ code }) => {
      const res = await apiRequest("POST", "/api/auth/mfa/enable", { code });
      return res.json();
    },
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      setShowBackupCodes(true);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "MFA Enabled", description: "Two-factor authentication is now active" });
    },
    onError: (error) => {
      toast({ title: "Failed to enable MFA", description: error.message, variant: "destructive" });
    },
  });

  const disableMfaMutation = useMutation({
    mutationFn: async (password: string) => {
      const res = await apiRequest("POST", "/api/auth/mfa/disable", { password });
      return res.json();
    },
    onSuccess: () => {
      setIsDisableOpen(false);
      setDisablePassword("");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "MFA Disabled", description: "Two-factor authentication has been turned off" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to disable MFA", description: error.message, variant: "destructive" });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest("POST", "/api/auth/change-password", data);
      return res.json();
    },
    onSuccess: () => {
      setIsChangePasswordOpen(false);
      setPasswords({ current: "", new: "", confirm: "" });
      toast({ title: "Password Changed", description: "Your password has been updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to change password", description: error.message, variant: "destructive" });
    },
  });

  const handleStartSetup = async () => {
    try {
      await setupMfaMutation.mutateAsync();
      setIsSetupOpen(true);
    } catch (error: any) {
      toast({ title: "Setup Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleEnableMfa = async () => {
    if (verificationCode.length !== 6) {
      toast({ title: "Invalid Code", description: "Please enter a 6-digit code", variant: "destructive" });
      return;
    }
    await enableMfaMutation.mutateAsync({ code: verificationCode });
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({ title: "Passwords don't match", description: "New password and confirmation must match", variant: "destructive" });
      return;
    }
    if (passwords.new.length < 8) {
      toast({ title: "Password too short", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    await changePasswordMutation.mutateAsync({
      currentPassword: passwords.current,
      newPassword: passwords.new,
    });
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast({ title: "Copied", description: "Backup codes copied to clipboard" });
  };

  const mfaEnabled = (user as any)?.mfaEnabled;

  return (
    <div className="container py-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Security Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account security and authentication methods</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </div>
            </div>
            {mfaEnabled ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Check className="h-3 w-3 mr-1" /> Enabled
              </Badge>
            ) : (
              <Badge variant="secondary">Disabled</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Two-factor authentication adds a second layer of security by requiring a code from your authenticator app when signing in.
          </p>
          
          {mfaEnabled ? (
            <div className="flex gap-3">
              <Dialog open={isDisableOpen} onOpenChange={setIsDisableOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" data-testid="button-disable-mfa">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Disable MFA
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
                    <DialogDescription>
                      This will make your account less secure. Enter your password to confirm.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="disable-password">Password</Label>
                      <Input
                        id="disable-password"
                        type="password"
                        value={disablePassword}
                        onChange={(e) => setDisablePassword(e.target.value)}
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDisableOpen(false)}>Cancel</Button>
                    <Button
                      variant="destructive"
                      onClick={() => disableMfaMutation.mutate(disablePassword)}
                      disabled={disableMfaMutation.isPending}
                    >
                      {disableMfaMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Disable MFA
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <Button onClick={handleStartSetup} disabled={setupMfaMutation.isPending} data-testid="button-setup-mfa">
              {setupMfaMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <Shield className="h-4 w-4 mr-2" />
              Enable Two-Factor Authentication
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={isSetupOpen} onOpenChange={(open) => {
        setIsSetupOpen(open);
        if (!open) {
          setVerificationCode("");
          setBackupCodes([]);
          setShowBackupCodes(false);
        }
      }}>
        <DialogContent className="max-w-md">
          {showBackupCodes ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  MFA Enabled Successfully
                </DialogTitle>
                <DialogDescription>
                  Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator device.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="bg-muted/50 p-4 rounded-lg border">
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {backupCodes.map((code, i) => (
                      <div key={i} className="p-2 bg-background rounded">{code}</div>
                    ))}
                  </div>
                </div>
                <Button variant="outline" className="mt-4 w-full" onClick={copyBackupCodes}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Backup Codes
                </Button>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsSetupOpen(false)}>Done</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
                <DialogDescription>
                  Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                {setupMfaMutation.data && (
                  <>
                    <div className="flex justify-center">
                      <img
                        src={setupMfaMutation.data.qrCode}
                        alt="MFA QR Code"
                        className="w-48 h-48 rounded-lg border"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Or enter this code manually:</p>
                      <code className="text-sm bg-muted px-2 py-1 rounded">{setupMfaMutation.data.secret}</code>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="verify-code">Verification Code</Label>
                      <Input
                        id="verify-code"
                        data-testid="input-mfa-verify-code"
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                        maxLength={6}
                        className="text-center text-xl tracking-widest"
                      />
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSetupOpen(false)}>Cancel</Button>
                <Button
                  onClick={handleEnableMfa}
                  disabled={enableMfaMutation.isPending || verificationCode.length !== 6}
                  data-testid="button-verify-mfa-setup"
                >
                  {enableMfaMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Verify & Enable
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your account password</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-change-password">
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                  Enter your current password and a new password.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-10 w-10"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-10 w-10"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-10 w-10"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsChangePasswordOpen(false)}>Cancel</Button>
                <Button
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Update Password
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
