import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { AUTH_URL, authHeaders } from "@/lib/api"
import Icon from "@/components/ui/icon"

export default function Profile() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading, refreshUser } = useAuth()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isSavingName, setIsSavingName] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth")
  }, [authLoading, user, navigate])

  useEffect(() => {
    if (user) setName(user.name || "")
  }, [user])

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingName(true)
    try {
      const res = await fetch(`${AUTH_URL}?action=profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Не удалось сохранить имя")
      await refreshUser()
      toast({ title: "Имя обновлено" })
    } catch (err) {
      toast({ title: "Ошибка", description: err instanceof Error ? err.message : "Попробуйте снова", variant: "destructive" })
    } finally {
      setIsSavingName(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast({ title: "Пароль слишком короткий", description: "Минимум 6 символов", variant: "destructive" })
      return
    }
    setIsSavingPassword(true)
    try {
      const res = await fetch(`${AUTH_URL}?action=profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Не удалось сменить пароль")
      setCurrentPassword("")
      setNewPassword("")
      toast({ title: "Пароль изменён" })
    } catch (err) {
      toast({ title: "Ошибка", description: err instanceof Error ? err.message : "Попробуйте снова", variant: "destructive" })
    } finally {
      setIsSavingPassword(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="dark min-h-screen bg-black flex items-center justify-center">
        <Icon name="Loader2" size={32} className="animate-spin text-red-500" />
      </div>
    )
  }

  return (
    <div className="dark min-h-screen bg-black">
      <nav className="border-b border-red-500/20 bg-black/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <Icon name="ArrowLeft" size={18} />
            <span className="text-sm">Назад</span>
          </button>
          <h1 className="font-orbitron text-lg font-bold text-white">
            Build<span className="text-red-500">APK</span>
          </h1>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border border-red-500/30">
            <AvatarFallback className="bg-red-500/10 text-red-400 font-semibold text-xl">
              {(user.name || user.email)[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-white text-xl font-orbitron font-bold">Мой профиль</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>

        <Card className="bg-neutral-950 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Icon name="User" size={18} className="text-red-500" />
              Основная информация
            </CardTitle>
            <CardDescription>Email используется как логин и не может быть изменён</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveName} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input id="email" value={user.email} disabled className="bg-neutral-900 border-red-500/10 text-gray-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Имя</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ваше имя"
                  className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
                />
              </div>
              <Button type="submit" disabled={isSavingName} className="bg-red-500 hover:bg-red-600 text-white border-0">
                {isSavingName ? <Icon name="Loader2" size={16} className="animate-spin mr-2" /> : null}
                Сохранить имя
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-neutral-950 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Icon name="Lock" size={18} className="text-red-500" />
              Смена пароля
            </CardTitle>
            <CardDescription>Введите текущий пароль, чтобы установить новый</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-white">Текущий пароль</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-white">Новый пароль</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
                  required
                />
              </div>
              <Button type="submit" disabled={isSavingPassword} className="bg-red-500 hover:bg-red-600 text-white border-0">
                {isSavingPassword ? <Icon name="Loader2" size={16} className="animate-spin mr-2" /> : null}
                Сменить пароль
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
