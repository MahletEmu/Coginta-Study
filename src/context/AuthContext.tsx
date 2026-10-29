"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserProfile } from "@/types";

export interface AuthUser extends UserProfile {
  user_metadata?: {
    full_name?: string;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  session: { user: AuthUser } | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error?: string; requiresConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error?: string; success?: boolean }>;
  updatePassword: (newPassword: string) => Promise<{ error?: string; success?: boolean }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<{ user: AuthUser } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const authUser: AuthUser = {
            ...data.user,
            user_metadata: { full_name: data.user.fullName },
          };
          setUser(authUser);
          setProfile(data.user);
          setSession({ user: authUser });
          return;
        }
      }
    } catch (err) {
      console.warn("Failed to check auth session:", err);
    }
    setUser(null);
    setProfile(null);
    setSession(null);
  }, []);

  useEffect(() => {
    fetchSession().finally(() => {
      setIsLoading(false);
    });
  }, [fetchSession]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return { error: data.error || "Failed to sign in." };
      }

      const authUser: AuthUser = {
        ...data.user,
        user_metadata: { full_name: data.user.fullName },
      };
      setUser(authUser);
      setProfile(data.user);
      setSession({ user: authUser });
      return {};
    } catch {
      return { error: "Network error during sign in." };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return { error: data.error || "Failed to register." };
      }

      const authUser: AuthUser = {
        ...data.user,
        user_metadata: { full_name: data.user.fullName },
      };
      setUser(authUser);
      setProfile(data.user);
      setSession({ user: authUser });
      return {};
    } catch {
      return { error: "Network error during registration." };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const resetPasswordForEmail = async (_email: string) => {
    return { success: true };
  };

  const updatePassword = async (_newPassword: string) => {
    return { success: true };
  };

  const refreshProfile = async () => {
    await fetchSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isConfigured: true,
        signIn,
        signUp,
        signOut,
        resetPasswordForEmail,
        updatePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
