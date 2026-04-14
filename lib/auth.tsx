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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Session initiale
    const getSessionData = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
      }
      setIsLoading(false);
    };
    getSessionData();


    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

   
    return () => subscription.unsubscribe();

  }, []);

  
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'http://localhost:3000/email-confirmed',
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

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


export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

//  AUTH GUARD
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/hero";

  useEffect(() => {
    if (!isLoading) {
      if (!user && !isPublicRoute) {
        router.replace("/login");
      }

      if (user && isPublicRoute) {
        router.replace("/dashboard");
      }
    }
  }, [user, pathname, isLoading, router]);

  // ✅ 1. Loading → spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <Spin size="large" />
      </div>
    );
  }

  // ✅ 2. PAS connecté → bloquer rendu
  if (!user && !isPublicRoute) {
    return null; // 🔥 empêche le flash
  }

  // ✅ 3. Connecté mais sur login → bloquer aussi
  if (user && isPublicRoute) {
    return null;
  }

  // ✅ 4. OK
  return <>{children}</>;
}