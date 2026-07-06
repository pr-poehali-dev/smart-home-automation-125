import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Icon from "@/components/ui/icon"
import SettingRow from "../SettingRow"
import { BuilderState } from "../types"

interface Props {
  state: BuilderState
  update: <K extends keyof BuilderState>(key: K, value: BuilderState[K]) => void
}

export default function NotificationsSection({ state, update }: Props) {
  return (
    <div className="max-w-3xl">
      <Card className="bg-neutral-950 border-red-500/20">
        <CardContent className="pt-2">
          <SettingRow
            title="Push-уведомления"
            description="Отправляйте push-уведомления пользователям вашего приложения."
          >
            <Switch checked={state.pushEnabled} onCheckedChange={(v) => update("pushEnabled", v)} />
          </SettingRow>

          {state.pushEnabled && (
            <div className="py-4 border-b border-neutral-800 space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Провайдер уведомлений</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => update("pushProvider", "firebase")}
                    className={`flex items-center gap-2 rounded-lg border p-3 transition-colors ${
                      state.pushProvider === "firebase"
                        ? "border-red-500 bg-red-500/5"
                        : "border-neutral-800 hover:border-red-500/30"
                    }`}
                  >
                    <Icon
                      name="Flame"
                      size={18}
                      className={state.pushProvider === "firebase" ? "text-red-400" : "text-gray-400"}
                    />
                    <span className="text-sm text-white">Firebase</span>
                  </button>
                  <button
                    onClick={() => update("pushProvider", "onesignal")}
                    className={`flex items-center gap-2 rounded-lg border p-3 transition-colors ${
                      state.pushProvider === "onesignal"
                        ? "border-red-500 bg-red-500/5"
                        : "border-neutral-800 hover:border-red-500/30"
                    }`}
                  >
                    <Icon
                      name="BellRing"
                      size={18}
                      className={state.pushProvider === "onesignal" ? "text-red-400" : "text-gray-400"}
                    />
                    <span className="text-sm text-white">OneSignal</span>
                  </button>
                </div>
              </div>

              {state.pushProvider === "firebase" && (
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-1">
                    Ключ сервера Firebase Cloud Messaging
                    <Icon name="Info" size={13} className="text-gray-500" />
                  </Label>
                  <Input
                    type="password"
                    value={state.fcmServerKey}
                    onChange={(e) => update("fcmServerKey", e.target.value)}
                    placeholder="AAAA••••••••••••••••••••"
                    className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
                  />
                </div>
              )}

              {state.pushProvider === "onesignal" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-1">
                      Идентификатор приложения OneSignal (App ID)
                      <Icon name="Info" size={13} className="text-gray-500" />
                    </Label>
                    <Input
                      value={state.oneSignalAppId}
                      onChange={(e) => update("oneSignalAppId", e.target.value)}
                      placeholder="Введите App ID из личного кабинета OneSignal"
                      className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-1">
                      REST API Key OneSignal
                      <Icon name="Info" size={13} className="text-gray-500" />
                    </Label>
                    <Input
                      type="password"
                      value={state.oneSignalRestApiKey}
                      onChange={(e) => update("oneSignalRestApiKey", e.target.value)}
                      placeholder="••••••••••••••••••••••••"
                      className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    У меня нет идентификатора приложения.{" "}
                    <a
                      href="https://documentation.onesignal.com/docs/accounts-and-keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-red-400 hover:underline"
                    >
                      Пошаговые инструкции
                    </a>
                  </p>
                </div>
              )}
            </div>
          )}

          <SettingRow
            title="Работа офлайн"
            description="Кэшировать содержимое сайта для показа при отсутствии интернета."
          >
            <Switch checked={state.offlineEnabled} onCheckedChange={(v) => update("offlineEnabled", v)} />
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  )
}
