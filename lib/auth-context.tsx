"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (data.session?.user) {
          console.log("[v0] Found existing session:", data.session.user.email)
          setUser(data.session.user)
        }
      } catch (error) {
        console.log("[v0] No existing session or error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Auth state changed:", event)
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      console.log("[v0] Attempting sign in for:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("[v0] Sign in error:", error.message)
        setLoading(false)
        return { error }
      }

      if (data.user) {
        console.log("[v0] Sign in successful:", data.user.email)
        setUser(data.user)
      }

      setLoading(false)
      return { error: null }
    } catch (error) {
      console.error("[v0] Sign in exception:", error)
      setLoading(false)
      return { error: error as Error }
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true)
      console.log("[v0] Attempting sign up for:", email)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
          data: {
            name: name,
          },
        },
      })

      if (error) {
        console.error("[v0] Sign up error:", error.message)
        setLoading(false)
        return { error }
      }

      if (data.user) {
        console.log("[v0] Sign up successful:", data.user.email)

        try {
          const { error: profileError } = await supabase.from("owners").insert([
            {
              id: data.user.id,
              name: name,
              email: email,
              created_at: new Date().toISOString(),
            },
          ])

          if (profileError) console.error("[v0] Error creating owner profile:", profileError)
        } catch (profileError) {
          console.error("[v0] Exception creating owner profile:", profileError)
        }

        setUser(data.user)
      }

      setLoading(false)
      return { error: null }
    } catch (error) {
      console.error("[v0] Sign up exception:", error)
      setLoading(false)
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    console.log("[v0] Signing out")
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
