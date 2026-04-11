"use client";

import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Spin } from "antd";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{
    error: AuthError | null;
    data: { user: User | null; session: Session | null } | null;
  }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // ✅ 1. GET SESSION + LISTENER (IMPORTANT)
  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);

      const { data, error } = await supabase.auth.getSession();

      if (!error) {
        setSession(data.session);
        setUser(data.session?.user ?? null);
      }

      setIsLoading(false);
    };

    getSession();

    // 🔥 LISTENER SUPABASE (FIX PRINCIPAL)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ✅ SIGN IN
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      router.push("/dashboard");
    }

    return { error };
  };

  // ✅ SIGN UP
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    return { data, error };
  };

  // ✅ SIGN OUT (FIX IMPORTANT)
  const signOut = async () => {
    await supabase.auth.signOut();

    setUser(null);      // 🔥 IMPORTANT
    setSession(null);   // 🔥 IMPORTANT

    router.push("/login");
  };

  // ✅ GOOGLE
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
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

// ✅ HOOK
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

// ✅ AUTH GUARD (petite amélioration)
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute =
        pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/hero"; // 👈 optionnel

      if (!user && !isPublicRoute) {
        router.replace("/login"); // 🔥 mieux que push
      }

      if (user && isPublicRoute) {
        router.replace("/dashboard");
      }
    }
  }, [user, pathname, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}