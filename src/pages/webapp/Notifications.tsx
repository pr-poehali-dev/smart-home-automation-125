import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { AUTH_URL, authHeaders } from "@/lib/api"
import Icon from "@/components/ui/icon"

export default function Notifications() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading, refreshUser } = useAuth()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth")
  }, [authLoading, user, navigate])

  const handleToggle = async (checked: boolean) => {
    setIsSaving(true)
    try {
      const res = await fetch(`${AUTH_URL}?action=notifications`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ email_notifications_enabled: checked }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Не удалось сохранить настройку")
      await refreshUser()
      toast({ title: checked ? "Уведомления включены" : "Уведомления отключены" })
    } catch (err) {
      toast({ title: "Ошибка", description: err instanceof Error ? err.message : "Попробуйте снова", variant: "destructive" })
    } finally {
      setIsSaving(false)
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
        <h2 className="text-white text-xl font-orbitron font-bold flex items-center gap-2">
          <Icon name="Bell" size={20} className="text-red-500" />
          Уведомления
        </h2>

        <Card className="bg-neutral-950 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-white text-base">Email-уведомления о сборках</CardTitle>
            <CardDescription>
              Присылать письмо на вашу почту, когда APK-файл готов к скачиванию или если при сборке произошла ошибка
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between bg-neutral-900 border border-red-500/10 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <Icon name="Mail" size={18} className="text-gray-400" />
                <div>
                  <p className="text-white text-sm font-medium">Уведомления о готовности сборки</p>
                  <p className="text-gray-500 text-xs">{user.email}</p>
                </div>
              </div>
              <Switch
                checked={user.email_notifications_enabled !== false}
                onCheckedChange={handleToggle}
                disabled={isSaving}
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
