import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import Icon from "@/components/ui/icon"

export default function Auth() {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  const [regName, setRegName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(loginEmail, loginPassword)
      navigate("/dashboard")
    } catch (err) {
      toast({
        title: "Ошибка входа",
        description: err instanceof Error ? err.message : "Попробуйте снова",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await register(regEmail, regPassword, regName)
      navigate("/dashboard")
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
