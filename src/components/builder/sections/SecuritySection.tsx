import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import SettingRow from "../SettingRow"
import { BuilderState } from "../types"

interface Props {
  state: BuilderState
  update: <K extends keyof BuilderState>(key: K, value: BuilderState[K]) => void
}

export default function SecuritySection({ state, update }: Props) {
  return (
    <div className="max-w-3xl">
      <Card className="bg-neutral-950 border-red-500/20">
        <CardContent className="pt-2">
          <SettingRow
            title="Блокировка приложения"
            description="Требовать вход по PIN-коду или биометрии при каждом запуске приложения."
          >
            <Switch checked={state.appLockEnabled} onCheckedChange={(v) => update("appLockEnabled", v)} />
          </SettingRow>

          <SettingRow
            title="Веб-аутентификация (WebAuthn)"
            description="Позволяет пользователям входить с помощью биометрии или ключей безопасности."
          >
            <Switch checked={state.webAuth} onCheckedChange={(v) => update("webAuth", v)} />
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  )
}
