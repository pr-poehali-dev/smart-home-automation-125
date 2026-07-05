import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Icon from "@/components/ui/icon"
import { BuilderState } from "../types"

interface Props {
  state: BuilderState
  update: <K extends keyof BuilderState>(key: K, value: BuilderState[K]) => void
}

export default function InfoSection({ state, update }: Props) {
  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="bg-neutral-950 border-red-500/20">
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-white flex items-center justify-between">
              Название приложения
              <span className="text-gray-500 text-xs">{state.appName.length} / 30</span>
            </Label>
            <Input
              value={state.appName}
              maxLength={30}
              onChange={(e) => update("appName", e.target.value)}
              placeholder="Моё приложение"
              className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Ссылка на сайт</Label>
            <Input
              type="url"
              value={state.siteUrl}
              onChange={(e) => update("siteUrl", e.target.value)}
              placeholder="https://example.com"
              className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Загрузить значок приложения</Label>
            <div className="border border-dashed border-red-500/20 rounded-lg h-28 flex items-center justify-center bg-neutral-900 relative overflow-hidden">
              {state.iconUrl ? (
                <img src={state.iconUrl} alt="icon" className="h-16 w-16 rounded-xl object-cover" />
              ) : (
                <Icon name="ImagePlus" size={24} className="text-gray-500" />
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-red-500/30 text-white hover:bg-red-500/10 bg-transparent w-full"
            >
              <Icon name="Sparkles" size={14} />
              Создать значок приложения
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-white flex items-center gap-1">
              Название пакета
              <Icon name="Info" size={13} className="text-gray-500" />
            </Label>
            <Input
              value={state.packageName}
              onChange={(e) => update("packageName", e.target.value)}
              placeholder="com.company.app"
              className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white flex items-center gap-1">
              Код версии
              <Icon name="Info" size={13} className="text-gray-500" />
            </Label>
            <Input
              value={state.versionCode}
              onChange={(e) => update("versionCode", e.target.value)}
              className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white flex items-center gap-1">
              Название версии
              <Icon name="Info" size={13} className="text-gray-500" />
            </Label>
            <Input
              value={state.versionName}
              onChange={(e) => update("versionName", e.target.value)}
              className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
