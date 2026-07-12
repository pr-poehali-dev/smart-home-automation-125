import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { BUILDS_URL, authHeaders } from "@/lib/api"
import Icon from "@/components/ui/icon"
import { Build } from "./types"

interface Props {
  onBuildCreated: (build: Build) => void
}

export default function NewBuildForm({ onBuildCreated }: Props) {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [siteUrl, setSiteUrl] = useState("")
  const [appName, setAppName] = useState("")
  const [packageName, setPackageName] = useState("")
  const [themeColor, setThemeColor] = useState("#ef4444")
  const [splashColor, setSplashColor] = useState("#000000")
  const [pushEnabled, setPushEnabled] = useState(false)
  const [offlineEnabled, setOfflineEnabled] = useState(false)

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
      onBuildCreated(newBuild)
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

  return (
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
  )
}
