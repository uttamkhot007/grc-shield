import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express, RequestHandler, Request, Response } from "express";
import { storage } from "./storage";

declare module "express-session" {
  interface SessionData {
    userId: string;
    mfaPending: boolean;
    isAuthenticated: boolean;
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
      sameSite: "lax",
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: "Account is disabled" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.mfaEnabled && user.mfaSecret) {
        req.session.regenerate((err) => {
          if (err) {
            return res.status(500).json({ message: "Session error" });
          }
          req.session.userId = user.id;
          req.session.mfaPending = true;
          req.session.isAuthenticated = false;
          res.json({ requiresMfa: true, message: "MFA verification required" });
        });
        return;
      }

      req.session.regenerate((err) => {
        if (err) {
          return res.status(500).json({ message: "Session error" });
        }
        req.session.userId = user.id;
        req.session.mfaPending = false;
        req.session.isAuthenticated = true;

        storage.updateUser(user.id, { lastLogin: new Date() });
        
        const { password: _, mfaSecret: __, mfaBackupCodes: ___, ...safeUser } = user;
        res.json({ user: safeUser, message: "Login successful" });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/verify-mfa", async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      const userId = req.session.userId;

      if (!userId || !req.session.mfaPending) {
        return res.status(401).json({ message: "No pending MFA verification" });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.mfaSecret) {
        return res.status(401).json({ message: "MFA not configured" });
      }

      const isValid = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: "base32",
        token: code,
        window: 2
      });
      
      let usedBackupCode = false;
      if (!isValid) {
        if (user.mfaBackupCodes?.includes(code)) {
          usedBackupCode = true;
          const newBackupCodes = user.mfaBackupCodes.filter(c => c !== code);
          await storage.updateUser(user.id, { mfaBackupCodes: newBackupCodes });
        } else {
          return res.status(401).json({ message: "Invalid MFA code" });
        }
      }

      const currentUserId = user.id;
      req.session.regenerate(async (err) => {
        if (err) {
          return res.status(500).json({ message: "Session error" });
        }
        req.session.userId = currentUserId;
        req.session.mfaPending = false;
        req.session.isAuthenticated = true;

        await storage.updateUser(currentUserId, { lastLogin: new Date() });
        
        const { password: _, mfaSecret: __, mfaBackupCodes: ___, ...safeUser } = user;
        res.json({ user: safeUser, message: "MFA verified successfully", usedBackupCode });
      });
    } catch (error) {
      console.error("MFA verification error:", error);
      res.status(500).json({ message: "MFA verification failed" });
    }
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, email, password, firstName, lastName } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        role: "end_user",
        isActive: true,
      });

      req.session.userId = user.id;
      req.session.mfaPending = false;
      req.session.isAuthenticated = true;

      const { password: _, mfaSecret: __, mfaBackupCodes: ___, ...safeUser } = user;
      res.status(201).json({ user: safeUser, message: "Registration successful" });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, mfaSecret: __, mfaBackupCodes: ___, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.post("/api/auth/mfa/setup", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const secret = speakeasy.generateSecret({
        name: `GRC Shield (${user.email})`,
        issuer: "GRC Shield"
      });

      const qrCode = await QRCode.toDataURL(secret.otpauth_url || "");

      await storage.updateUser(userId, { mfaSecret: secret.base32 });

      res.json({ secret: secret.base32, qrCode, message: "Scan the QR code with your authenticator app" });
    } catch (error) {
      console.error("MFA setup error:", error);
      res.status(500).json({ message: "MFA setup failed" });
    }
  });

  app.post("/api/auth/mfa/enable", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.mfaSecret) {
        return res.status(400).json({ message: "MFA setup not initiated" });
      }

      const isValid = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: "base32",
        token: code,
        window: 2
      });
      
      if (!isValid) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      const backupCodes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );

      await storage.updateUser(userId, { mfaEnabled: true, mfaBackupCodes: backupCodes });

      res.json({ backupCodes, message: "MFA enabled successfully. Save your backup codes!" });
    } catch (error) {
      console.error("MFA enable error:", error);
      res.status(500).json({ message: "Failed to enable MFA" });
    }
  });

  app.post("/api/auth/mfa/disable", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { password } = req.body;
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid password" });
      }

      await storage.updateUser(userId, { 
        mfaEnabled: false, 
        mfaSecret: null, 
        mfaBackupCodes: null 
      });

      res.json({ message: "MFA disabled successfully" });
    } catch (error) {
      console.error("MFA disable error:", error);
      res.status(500).json({ message: "Failed to disable MFA" });
    }
  });

  app.post("/api/auth/change-password", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new password are required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await storage.updateUser(userId, { password: hashedPassword });

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.session.userId || !req.session.isAuthenticated || req.session.mfaPending) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export const requireSuperAdmin: RequestHandler = async (req, res, next) => {
  if (!req.session.userId || !req.session.isAuthenticated || req.session.mfaPending) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "super_admin") {
    return res.status(403).json({ message: "Access denied - Super Admin only" });
  }
  next();
};
