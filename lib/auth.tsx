"use client";

import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Spin } from "antd";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    data: { user: User | null; session: Session | null } | null;
    error: AuthError | null;
  }>;
  signUp: (
    email: string,
    password: string,
    metadata?: {
      firstname: string;
      lastname: string;
      country?: string | null;
      region?: string | null;
    }
  ) => Promise<{
    error: AuthError | null;
    data: { user: User | null; session: Session | null } | null;
  }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSessionData = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
      }
      setIsLoading(false);
    };
    getSessionData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  // FIX 1: Added country and region to metadata type and signUp call
  const signUp = async (
    email: string,
    password: string,
    metadata?: {
      firstname: string;
      lastname: string;
      country?: string | null;
      region?: string | null;
    }
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstname: metadata?.firstname,
          lastname: metadata?.lastname,
          country: metadata?.country ?? null,
          region: metadata?.region ?? null,
        },
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // FIX 2: redirectTo now includes the locale prefix extracted from the current URL
  const signInWithGoogle = async () => {
    const locale = window.location.pathname.split("/")[1] || "fr";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/${locale}/dashboard`,
      },
    });
    return { error };
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();

  const isPublicRoute =
    pathname.includes("/login") ||
    pathname.includes("/signup") ||
    pathname.includes("/register");
  const isAdminRoute = pathname.includes("/admin");

  useEffect(() => {
    if (isLoading) return;

    // Not logged in on protected route → redirect to login
    if (!user && !isPublicRoute) {
      router.replace(`/${locale}/login`);
      return;
    }

    // Logged in on public page → redirect based on role
    if (user && isPublicRoute) {
      const checkRole = async () => {
        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin") {
          router.replace(`/${locale}/admin/dashboard`);
        } else {
          router.replace(`/${locale}/dashboard`);
        }
      };
      checkRole();
      return;
    }

    // Regular user trying to access /admin → block
    if (user && isAdminRoute) {
      const checkAdmin = async () => {
        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role !== "admin") {
          router.replace(`/${locale}/dashboard`);
        }
      };
      checkAdmin();
    }
  }, [user, pathname, isLoading, router, locale]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <Spin size="large" />
      </div>
    );
  }

  if (!user && !isPublicRoute) return null;
  if (user && isPublicRoute) return null;

  return <>{children}</>;
}