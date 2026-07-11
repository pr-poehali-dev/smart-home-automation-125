import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import Icon from "@/components/ui/icon"

export default function Auth() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const referralCode = searchParams.get("ref") || undefined
  const { login, register, verifyCode, resendCode } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  const [regName, setRegName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")

  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [isResending, setIsResending] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(loginEmail, loginPassword)
      navigate("/dashboard")
    } catch (err) {
      const error = err as Error & { needsVerification?: boolean }
      if (error.needsVerification) {
        setPendingEmail(loginEmail)
        toast({ title: "Подтвердите email", description: "Введите код, отправленный вам на почту" })
      } else {
        toast({
          title: "Ошибка входа",
          description: error.message || "Попробуйте снова",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await register(regEmail, regPassword, regName, referralCode)
      setPendingEmail(regEmail)
      toast({ title: "Проверьте почту", description: "Мы отправили код подтверждения на ваш email" })
    } catch (err) {
      toast({
        title: "Ошибка регистрации",
        description: err instanceof Error ? err.message : "Попробуйте снова",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pendingEmail) return
    setIsLoading(true)
    try {
      await verifyCode(pendingEmail, verificationCode)
      navigate("/dashboard")
    } catch (err) {
      toast({
        title: "Ошибка подтверждения",
        description: err instanceof Error ? err.message : "Попробуйте снова",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!pendingEmail) return
    setIsResending(true)
    try {
      await resendCode(pendingEmail)
      toast({ title: "Код отправлен повторно" })
    } catch (err) {
      toast({
        title: "Ошибка",
        description: err instanceof Error ? err.message : "Попробуйте снова",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  if (pendingEmail) {
    return (
      <div className="dark min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-orbitron text-3xl font-bold text-white">
              Build<span className="text-red-500">APK</span>
            </h1>
            <p className="text-gray-400 mt-2">Подтверждение email</p>
          </div>

          <div className="bg-neutral-950 border border-red-500/20 rounded-lg p-6">
            <p className="text-gray-300 text-sm mb-4">
              Мы отправили код подтверждения на <span className="text-white">{pendingEmail}</span>. Введите его ниже.
            </p>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verify-code" className="text-white">Код из письма</Label>
                <Input
                  id="verify-code"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500 text-center tracking-widest text-lg"
                  maxLength={6}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-red-500 hover:bg-red-600 text-white border-0">
                {isLoading ? <Icon name="Loader2" size={18} className="animate-spin" /> : "Подтвердить"}
              </Button>
            </form>
            <button
              onClick={handleResend}
              disabled={isResending}
              className="w-full text-center text-sm text-gray-400 hover:text-red-500 transition-colors mt-4"
            >
              {isResending ? "Отправляем..." : "Отправить код повторно"}
            </button>
            <button
              onClick={() => setPendingEmail(null)}
              className="w-full text-center text-sm text-gray-500 hover:text-white transition-colors mt-2"
            >
              ← Назад
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dark min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-orbitron text-3xl font-bold text-white">
            Build<span className="text-red-500">APK</span>
          </h1>
          <p className="text-gray-400 mt-2">Личный кабинет разработчика</p>
        </div>

        <div className="bg-neutral-950 border border-red-500/20 rounded-lg p-6">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 bg-neutral-900">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-white">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@mail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-white">Пароль</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-red-500 hover:bg-red-600 text-white border-0">
                  {isLoading ? <Icon name="Loader2" size={18} className="animate-spin" /> : "Войти"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              {referralCode && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2 mt-4 text-xs text-red-400">
                  <Icon name="Gift" size={14} />
                  Вы регистрируетесь по приглашению друга
                </div>
              )}
              <form onSubmit={handleRegister} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name" className="text-white">Имя</Label>
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="Иван"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-white">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@mail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-white">Пароль</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Минимум 6 символов"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-red-500 hover:bg-red-600 text-white border-0">
                  {isLoading ? <Icon name="Loader2" size={18} className="animate-spin" /> : "Создать аккаунт"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          <a href="/" className="hover:text-red-500 transition-colors">← Вернуться на главную</a>
        </p>
      </div>
    </div>
  )
}