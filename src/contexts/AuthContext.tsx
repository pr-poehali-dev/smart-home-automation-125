import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { AUTH_URL, getToken, setToken, clearToken, authHeaders } from "@/lib/api"

interface User {
  id: number
  email: string
  name: string | null
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  verifyCode: (email: string, code: string) => Promise<void>
  resendCode: (email: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchMe = async () => {
    const token = getToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    try {
      const res = await fetch(`${AUTH_URL}?action=me`, {
        headers: { ...authHeaders() },
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        clearToken()
      }
    } catch {
      clearToken()
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMe()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", email, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      const err = new Error(data.error || "Не удалось войти") as Error & { needsVerification?: boolean }
      if (data.needs_verification) err.needsVerification = true
      throw err
    }
    setToken(data.token)
    setUser(data.user)
  }

  const register = async (email: string, password: string, name: string) => {
    const res = await fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register", email, password, name }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Не удалось зарегистрироваться")
  }

  const verifyCode = async (email: string, code: string) => {
    const res = await fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", email, code }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Не удалось подтвердить код")
    setToken(data.token)
    setUser(data.user)
  }

  const resendCode = async (email: string) => {
    const res = await fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resend_code", email }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Не удалось отправить код повторно")
  }

  const logout = () => {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, verifyCode, resendCode, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth должен использоваться внутри AuthProvider")
  return ctx
}