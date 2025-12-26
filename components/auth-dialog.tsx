"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function translateAuthError(errorMessage: string): string {
  const errorMap: Record<string, string> = {
    "Invalid login credentials": "Email ou senha incorretos. Verifique e tente novamente.",
    "Email not confirmed": "Por favor, confirme seu email antes de fazer login.",
    "User already registered": "Este email já está cadastrado. Faça login ou recupere sua senha.",
    "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres.",
    "Unable to validate email address: invalid format": "Formato de email inválido.",
    "Signup requires a valid password": "Por favor, insira uma senha válida.",
    "Email rate limit exceeded": "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  }

  for (const [key, value] of Object.entries(errorMap)) {
    if (errorMessage.includes(key)) {
      return value
    }
  }

  return errorMessage
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) {
          setError(translateAuthError(error.message))
        } else {
          onOpenChange(false)
          setEmail("")
          setPassword("")
        }
      } else {
        const { error } = await signUp(email, password, name)
        if (error) {
          setError(translateAuthError(error.message))
        } else {
          alert("Conta criada com sucesso! Você já pode fazer login.")
          setIsLogin(true)
          setPassword("")
          setName("")
        }
      }
    } catch (err) {
      setError("Erro ao processar solicitação. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isLogin ? "Fazer Login" : "Criar Conta"}</DialogTitle>
          <DialogDescription>
            {isLogin ? "Entre para acessar seus dados" : "Crie uma conta para começar a usar o Meevi"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete={isLogin ? "email" : "off"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
            {!isLogin && <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>}
          </div>

          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">{error}</div>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : isLogin ? (
              "Entrar"
            ) : (
              "Criar Conta"
            )}
          </Button>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError("")
              }}
              className="text-blue-600 hover:underline"
            >
              {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça login"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
