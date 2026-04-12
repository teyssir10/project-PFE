"use client"

import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { createContext, useContext, useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";
import { Spin } from "antd";
 type AuthContextType={
    user:User | null
    session:Session | null
    isLoading:boolean
    signIn:(email: string, password: string) =>Promise<{error:AuthError | null}>
    signUp:(email: string, password: string) =>Promise<{error:AuthError | null; data:{user:User | null; session:Session | null} | null}> 
    signOut:()=>Promise<void>
    signInWithGoogle: () => Promise<{error: AuthError | null}>
 }
const AuthContext=createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({children}:{children:React.ReactNode}){
    const[session, setSession]=useState<Session | null>(null)
    const[user, setUser]=useState<User | null>(null)
    const[isLoading, setIsLoading]=useState(true)
    const router= useRouter()
    useEffect(()=>{
    const getSession=async()=>{
        setIsLoading(true)

        const{data,error}=await supabase.auth.getSession()
          if(!error){
            setSession(data.session)
            setUser(data.session?.user || null)

          }
            setIsLoading(false)

          }
           getSession()  },[])
           const signIn=async(email:string,password:string)=>{
            const{data,error}=await supabase.auth.signInWithPassword({email,password})
            if(!error){
                router.push('/dashboard')
            }
            return{error}
        }
          const signUp=async(email:string,password:string)=>{
            const{data,error}=await supabase.auth.signUp({
                email,
                password,
                options:{
                    emailRedirectTo: 'http://localhost:3000/login'}
                })

            return{data,error}}
            const signOut=async()=>{
                await supabase.auth.signOut()
                router.push('/login')}
                    const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/dashboard`,
        },
    })
    return { error }}
                const value:AuthContextType={user,session,isLoading,signIn,signUp,signOut,signInWithGoogle}
                return<AuthContext.Provider value={value}>
                    {children}
                </AuthContext.Provider>
     
          }
      

          
export function useAuth(){
    const context=useContext(AuthContext)
    if(!context)throw new Error('useauth must be used within an AuthProvider')
    return context
}
export function AuthGuard({children}:{children:React.ReactNode}){
    const{user,isLoading}=useAuth()
    const pathname=usePathname()
    const router=useRouter()
    useEffect(()=>{
        if(!isLoading){
            const isPublicRoute=pathname==='/login'||pathname==='/signup'
            if(!user && !isPublicRoute){
                router.push('/login')
            }
            if(user && isPublicRoute){
                router.push('/')
            }


        }
    },[user, router,pathname,isLoading])
    if(isLoading){
        return <div className="flex justify-center items-center min-h-screen bg-slate-50">
            <Spin size="large"/>
        </div>
}
return <>{children} </>}