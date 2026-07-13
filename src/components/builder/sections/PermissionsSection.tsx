import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import SettingRow from "../SettingRow"
import { BuilderState } from "../types"

interface Props {
  state: BuilderState
  update: <K extends keyof BuilderState>(key: K, value: BuilderState[K]) => void
}

export default function PermissionsSection({ state, update }: Props) {
  return (
    <div className="max-w-3xl">
      <Card className="bg-neutral-950 border-red-500/20">
        <CardContent className="pt-2">
          <SettingRow
            title="Разрешение на доступ к файлу/камере"
            description="Предоставьте вашему устройству разрешение на доступ к камере и файлам."
          >
            <Switch checked={state.permCamera} onCheckedChange={(v) => update("permCamera", v)} />
          </SettingRow>

          <SettingRow
            title="Службы определения местоположения"
            description="Позволяет определять местоположение устройства в режиме реального времени."
          >
            <Switch checked={state.permLocation} onCheckedChange={(v) => update("permLocation", v)} />
          </SettingRow>

          <SettingRow
            title="Функция аудио/видеозаписи"
            description="Включить запись аудио/видео."
          >
            <Switch checked={state.permMedia} onCheckedChange={(v) => update("permMedia", v)} />
          </SettingRow>

          <SettingRow
            title="Вибрационная обратная связь"
            description="Разрешите приложению запускать вибрацию устройства с помощью метода navigator.vibrate()."
          >
            <Switch checked={state.permVibration} onCheckedChange={(v) => update("permVibration", v)} />
          </SettingRow>

          <SettingRow
            title="Разрешение на доступ к микрофону"
            description="Позволяет приложению записывать звук с микрофона устройства (например, для голосового ввода или звонков)."
            badge={
              <Badge className="bg-red-500/20 text-red-400 border-0 text-[10px] px-1.5 py-0">
                Новое
              </Badge>
            }
          >
            <Switch checked={state.permMicrophone} onCheckedChange={(v) => update("permMicrophone", v)} />
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  )
}