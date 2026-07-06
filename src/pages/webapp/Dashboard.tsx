import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { BUILDS_URL, authHeaders } from "@/lib/api"
import Icon from "@/components/ui/icon"

interface Build {
  id: number
  site_url: string
  app_name: string
  package_name: string | null
  icon_url: string | null
  splash_color: string
  theme_color: string
  push_enabled: boolean
  offline_enabled: boolean
  status: "queued" | "building" | "ready" | "failed"
  apk_url: string | null
  created_at: string
}

const statusMap: Record<Build["status"], { label: string; color: string }> = {
  queued: { label: "В очереди", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  building: { label: "Собирается", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  ready: { label: "Готово", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  failed: { label: "Ошибка", color: "bg-red-500/20 text-red-400 border-red-500/30" },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading, logout } = useAuth()
  const { toast } = useToast()

  const [builds, setBuilds] = useState<Build[]>([])
  const [isLoadingBuilds, setIsLoadingBuilds] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [siteUrl, setSiteUrl] = useState("")
  const [appName, setAppName] = useState("")
  const [packageName, setPackageName] = useState("")
  const [themeColor, setThemeColor] = useState("#ef4444")
  const [splashColor, setSplashColor] = useState("#000000")
  const [pushEnabled, setPushEnabled] = useState(false)
  const [offlineEnabled, setOfflineEnabled] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth")
    }
  }, [authLoading, user, navigate])

  const loadBuilds = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true)
    else setIsLoadingBuilds(true)
    try {
      const res = await fetch(BUILDS_URL, { headers: { ...authHeaders() } })
      if (res.ok) {
        const data = await res.json()
        setBuilds(Array.isArray(data) ? data : data.builds || [])
        if (isManualRefresh) toast({ title: "Список обновлён" })
      }
    } finally {
      setIsLoadingBuilds(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (user) loadBuilds()
  }, [user])

  const handleCreateBuild = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!siteUrl || !appName) {
      toast({ title: "Заполните обязательные поля", description: "Укажите сайт и название приложения", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(BUILDS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          site_url: siteUrl,
          app_name: appName,
          package_name: packageName,
          theme_color: themeColor,
          splash_color: splashColor,
          push_enabled: pushEnabled,
          offline_enabled: offlineEnabled,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Не удалось создать сборку")

      const newBuild: Build = {
        id: data.id,
        site_url: siteUrl,
        app_name: appName,
        package_name: packageName || null,
        icon_url: null,
        splash_color: splashColor,
        theme_color: themeColor,
        push_enabled: pushEnabled,
        offline_enabled: offlineEnabled,
        status: data.status,
        apk_url: null,
        created_at: data.created_at,
      }
      setBuilds((prev) => [newBuild, ...prev])
      setSiteUrl("")
      setAppName("")
      setPackageName("")
      setPushEnabled(false)
      setOfflineEnabled(false)
      toast({ title: "Заявка создана!", description: `Сборка «${appName}» добавлена в очередь.` })
    } catch (err) {
      toast({ title: "Ошибка", description: err instanceof Error ? err.message : "Попробуйте снова", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteBuild = async (id: number) => {
    setDeletingId(id)
    try {
      const res = await fetch(`${BUILDS_URL}?id=${id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Не удалось удалить сборку")
      }
      setBuilds((prev) => prev.filter((b) => b.id !== id))
      toast({ title: "Сборка удалена" })
    } catch (err) {
      toast({ title: "Ошибка", description: err instanceof Error ? err.message : "Попробуйте снова", variant: "destructive" })
    } finally {
      setDeletingId(null)
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="font-orbitron text-xl font-bold text-white">
            Build<span className="text-red-500">APK</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm hidden sm:block">{user.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { logout(); navigate("/") }}
              className="border-red-500/30 text-white hover:bg-red-500/10 bg-transparent"
            >
              <Icon name="LogOut" size={16} />
              Выйти
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-neutral-950 border-red-500/20 sticky top-24">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white font-orbitron flex items-center gap-2">
                  <Icon name="Hammer" size={20} className="text-red-500" />
                  Новая сборка
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/builder")}
                  className="border-red-500/30 text-white hover:bg-red-500/10 bg-transparent"
                >
                  <Icon name="SlidersHorizontal" size={14} />
                  Конструктор
                </Button>
              </div>
              <CardDescription className="text-gray-400">
                Настройте приложение и запустите сборку APK
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateBuild} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteUrl" className="text-white">Ссылка на сайт *</Label>
                  <Input
                    id="siteUrl"
                    type="url"
                    placeholder="https://example.com"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appName" className="text-white">Название приложения *</Label>
                  <Input
                    id="appName"
                    placeholder="Моё приложение"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="packageName" className="text-white">Package name</Label>
                  <Input
                    id="packageName"
                    placeholder="com.company.app"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="themeColor" className="text-white">Цвет темы</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="themeColor"
                        type="color"
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                        className="bg-neutral-900 border-red-500/20 h-10 w-14 p-1"
                      />
                      <span className="text-gray-400 text-sm">{themeColor}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="splashColor" className="text-white">Сплэш-экран</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="splashColor"
                        type="color"
                        value={splashColor}
                        onChange={(e) => setSplashColor(e.target.value)}
                        className="bg-neutral-900 border-red-500/20 h-10 w-14 p-1"
                      />
                      <span className="text-gray-400 text-sm">{splashColor}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-md border border-red-500/20 bg-neutral-900 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Icon name="Bell" size={18} className="text-red-500" />
                    <Label htmlFor="push" className="text-white cursor-pointer">Push-уведомления</Label>
                  </div>
                  <Switch id="push" checked={pushEnabled} onCheckedChange={setPushEnabled} />
                </div>

                <div className="flex items-center justify-between rounded-md border border-red-500/20 bg-neutral-900 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Icon name="WifiOff" size={18} className="text-red-500" />
                    <Label htmlFor="offline" className="text-white cursor-pointer">Офлайн-режим</Label>
                  </div>
                  <Switch id="offline" checked={offlineEnabled} onCheckedChange={setOfflineEnabled} />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-500 hover:bg-red-600 text-white border-0"
                >
                  {isSubmitting ? (
                    <>
                      <Icon name="Loader2" size={18} className="animate-spin" />
                      Отправляем...
                    </>
                  ) : (
                    <>
                      <Icon name="Rocket" size={18} />
                      Собрать APK
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-orbitron text-xl font-bold flex items-center gap-2">
              <Icon name="List" size={20} className="text-red-500" />
              Мои сборки
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadBuilds(true)}
              disabled={isRefreshing}
              className="border-red-500/30 text-white hover:bg-red-500/10 bg-transparent"
            >
              <Icon name="RefreshCw" size={14} className={isRefreshing ? "animate-spin" : ""} />
              Обновить
            </Button>
          </div>

          {isLoadingBuilds ? (
            <div className="flex justify-center py-12">
              <Icon name="Loader2" size={28} className="animate-spin text-red-500" />
            </div>
          ) : builds.length === 0 ? (
            <Card className="bg-neutral-950 border-red-500/20">
              <CardContent className="py-12 text-center">
                <Icon name="PackageOpen" size={40} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">У вас пока нет сборок. Создайте первую слева!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {builds.map((build) => (
                <Card key={build.id} className="bg-neutral-950 border-red-500/20">
                  <CardContent className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: build.theme_color }}
                      >
                        <Icon name="Smartphone" size={20} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold truncate">{build.app_name}</p>
                        <p className="text-gray-500 text-sm truncate">{build.site_url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="outline" className={statusMap[build.status].color}>
                        {statusMap[build.status].label}
                      </Badge>
                      {build.status === "ready" && build.apk_url && (
                        <Button asChild size="sm" className="bg-red-500 hover:bg-red-600 text-white border-0">
                          <a href={build.apk_url} target="_blank" rel="noreferrer">
                            <Icon name="Download" size={16} />
                          </a>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={deletingId === build.id}
                        onClick={() => handleDeleteBuild(build.id)}
                        className="border-red-500/30 text-gray-400 hover:text-red-400 hover:bg-red-500/10 bg-transparent"
                      >
                        {deletingId === build.id ? (
                          <Icon name="Loader2" size={16} className="animate-spin" />
                        ) : (
                          <Icon name="Trash2" size={16} />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}