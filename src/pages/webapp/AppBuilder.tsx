import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import Icon from "@/components/ui/icon"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { BUILDS_URL, authHeaders } from "@/lib/api"
import BuilderSidebar from "@/components/builder/BuilderSidebar"
import BuilderTopbar from "@/components/builder/BuilderTopbar"
import PreviewPanel from "@/components/builder/PreviewPanel"
import InfoSection from "@/components/builder/sections/InfoSection"
import SplashSection from "@/components/builder/sections/SplashSection"
import PermissionsSection from "@/components/builder/sections/PermissionsSection"
import SettingsSection from "@/components/builder/sections/SettingsSection"
import LinksSection from "@/components/builder/sections/LinksSection"
import OverridesSection from "@/components/builder/sections/OverridesSection"
import AddonPlaceholder from "@/components/builder/sections/AddonPlaceholder"
import {
  BuilderState,
  defaultBuilderState,
  SectionId,
  mainSections,
  addonSections,
} from "@/components/builder/types"

export default function AppBuilder() {
  const navigate = useNavigate()
  const { buildId } = useParams()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  const [active, setActive] = useState<SectionId>("info")
  const [state, setState] = useState<BuilderState>(defaultBuilderState)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth")
  }, [authLoading, user, navigate])

  const update = <K extends keyof BuilderState>(key: K, value: BuilderState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  const sectionLabel =
    mainSections.find((s) => s.id === active)?.label ||
    addonSections.find((s) => `addon-${s.id}` === active)?.label ||
    "Информация о приложении"

  const handleBuild = async () => {
    if (!state.siteUrl || !state.appName) {
      toast({
        title: "Заполните обязательные поля",
        description: "Укажите сайт и название приложения",
        variant: "destructive",
      })
      setActive("info")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch(BUILDS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          site_url: state.siteUrl,
          app_name: state.appName,
          package_name: state.packageName,
          theme_color: state.themeColor,
          splash_color: state.splashColor,
          push_enabled: state.pushEnabled,
          offline_enabled: state.offlineEnabled,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Не удалось создать сборку")

      toast({ title: "Заявка создана!", description: `Сборка «${state.appName}» добавлена в очередь.` })
      navigate("/dashboard")
    } catch (err) {
      toast({
        title: "Ошибка",
        description: err instanceof Error ? err.message : "Попробуйте снова",
        variant: "destructive",
      })
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

  const renderSection = () => {
    if (active === "info") return <InfoSection state={state} update={update} />
    if (active === "splash") return <SplashSection state={state} update={update} />
    if (active === "permissions") return <PermissionsSection state={state} update={update} />
    if (active === "settings") return <SettingsSection state={state} update={update} />
    if (active === "links") return <LinksSection state={state} update={update} />
    if (active === "overrides") return <OverridesSection state={state} update={update} />

    const addon = addonSections.find((a) => `addon-${a.id}` === active)
    if (addon) return <AddonPlaceholder label={addon.label} icon={addon.icon} />

    return <InfoSection state={state} update={update} />
  }

  return (
    <div className="dark h-screen bg-black flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <BuilderSidebar active={active} onSelect={setActive} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <BuilderTopbar sectionLabel={sectionLabel} onBuild={handleBuild} isBuilding={isSaving} />

          <main className="flex-1 overflow-y-auto p-6">{renderSection()}</main>

          <footer className="h-14 border-t border-red-500/20 bg-black/95 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Icon name="Smartphone" size={14} />
              <span>
                Создание приложения для{" "}
                <span className="text-gray-300">{state.siteUrl || "—"}</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-red-500/30 text-white hover:bg-red-500/10 bg-transparent"
              >
                Сохранение и восстановление
              </Button>
              <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white border-0">
                Сохранить как черновик
              </Button>
            </div>
          </footer>
        </div>

        <PreviewPanel state={state} />
      </div>
    </div>
  )
}
