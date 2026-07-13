import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { BUILDS_URL, authHeaders } from "@/lib/api"
import Icon from "@/components/ui/icon"
import { Build, statusMap } from "./types"

interface Props {
  builds: Build[]
  isLoadingBuilds: boolean
  isRefreshing: boolean
  loadBuilds: (isManualRefresh?: boolean) => Promise<void>
  setBuilds: React.Dispatch<React.SetStateAction<Build[]>>
}

export default function BuildsList({ builds, isLoadingBuilds, isRefreshing, loadBuilds, setBuilds }: Props) {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [retryingId, setRetryingId] = useState<number | null>(null)

  const handleDownloadBuild = async (id: number, appName: string) => {
    setDownloadingId(id)
    try {
      const res = await fetch(`${BUILDS_URL}?action=download&id=${id}`, {
        headers: { ...authHeaders() },
      })
      if (res.status === 402) {
        toast({
          title: "Нужен тариф",
          description: "Чтобы скачать готовый APK, оформите тариф",
          variant: "destructive",
        })
        navigate("/pricing")
        return
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Не удалось скачать APK")
      }
      const data = await res.json()
      const a = document.createElement("a")
      a.href = data.url
      a.download = data.filename || `${appName || "app"}.apk`
      a.target = "_blank"
      a.rel = "noopener"
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (err) {
      toast({ title: "Ошибка", description: err instanceof Error ? err.message : "Попробуйте снова", variant: "destructive" })
    } finally {
      setDownloadingId(null)
    }
  }

  const handleRetryBuild = async (build: Build) => {
    setRetryingId(build.id)
    try {
      const res = await fetch(`${BUILDS_URL}?id=${build.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          site_url: build.site_url,
          app_name: build.app_name,
          package_name: build.package_name,
          icon_url: build.icon_url,
          splash_color: build.splash_color,
          theme_color: build.theme_color,
          push_enabled: build.push_enabled,
          offline_enabled: build.offline_enabled,
          addon_ids: build.addon_ids || [],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Не удалось запустить пересборку")
      setBuilds((prev) => prev.map((b) => (b.id === build.id ? { ...b, ...data } : b)))
      toast({ title: "Сборка запущена заново", description: `«${build.app_name}» снова собирается` })
    } catch (err) {
      toast({ title: "Ошибка", description: err instanceof Error ? err.message : "Попробуйте снова", variant: "destructive" })
    } finally {
      setRetryingId(null)
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

  return (
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
                    {!!build.addon_ids?.length && (
                      <p className="text-gray-600 text-xs truncate flex items-center gap-1 mt-0.5">
                        <Icon name="Puzzle" size={11} />
                        Дополнений: {build.addon_ids.length}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="outline" className={statusMap[build.status].color}>
                    {statusMap[build.status].label}
                  </Badge>
                  {build.status === "ready" && build.apk_url && (
                    <>
                      <Button
                        size="sm"
                        disabled={downloadingId === build.id}
                        onClick={() => handleDownloadBuild(build.id, build.app_name)}
                        className="bg-red-500 hover:bg-red-600 text-white border-0"
                      >
                        {downloadingId === build.id ? (
                          <Icon name="Loader2" size={16} className="animate-spin" />
                        ) : (
                          <Icon name="Download" size={16} />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/builder/${build.id}`)}
                        className="border-red-500/30 text-gray-400 hover:text-white hover:bg-red-500/10 bg-transparent"
                      >
                        <Icon name="Pencil" size={16} />
                      </Button>
                    </>
                  )}
                  {build.status === "failed" && (
                    <Button
                      size="sm"
                      disabled={retryingId === build.id}
                      onClick={() => handleRetryBuild(build)}
                      className="bg-red-500 hover:bg-red-600 text-white border-0"
                    >
                      {retryingId === build.id ? (
                        <Icon name="Loader2" size={16} className="animate-spin" />
                      ) : (
                        <Icon name="RotateCw" size={16} />
                      )}
                      Повторить
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
  )
}