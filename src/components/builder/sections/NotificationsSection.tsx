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
              <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <Icon name="BellRing" size={18} className="mt-0.5 text-red-400" />
                <div>
                  <p className="text-sm text-white">Уведомления через OneSignal</p>
                  <p className="text-xs text-gray-400">
                    Бесплатный сервис push-уведомлений. Настройка занимает пару минут.
                  </p>
                </div>
              </div>

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

                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-1">
                    Файл google-services.json (Firebase)
                    <Icon name="Info" size={13} className="text-gray-500" />
                  </Label>
                  <label
                    className={`flex items-center gap-3 rounded-lg border border-dashed p-3 cursor-pointer transition-colors ${
                      state.googleServicesJson
                        ? "border-green-500/40 bg-green-500/5"
                        : "border-red-500/30 bg-neutral-900 hover:bg-neutral-900/70"
                    }`}
                  >
                    <Icon
                      name={state.googleServicesJson ? "CircleCheck" : "Upload"}
                      size={20}
                      className={state.googleServicesJson ? "text-green-400" : "text-red-400"}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        {state.googleServicesJson ? "Файл загружен" : "Выбрать google-services.json"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {state.googleServicesJson
                          ? "Нажмите, чтобы заменить файл"
                          : "Скачивается из настроек Firebase-проекта"}
                      </p>
                    </div>
                    {state.googleServicesJson && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          update("googleServicesJson", "")
                        }}
                        className="text-gray-500 hover:text-red-400"
                      >
                        <Icon name="X" size={16} />
                      </button>
                    )}
                    <input
                      type="file"
                      accept="application/json,.json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = () => {
                          update("googleServicesJson", String(reader.result || ""))
                        }
                        reader.readAsText(file)
                        e.target.value = ""
                      }}
                    />
                  </label>
                </div>

                <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-3 space-y-1.5">
                  <p className="text-xs font-medium text-white">Как получить эти данные:</p>
                  <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                    <li>
                      Зарегистрируйтесь на{" "}
                      <a href="https://onesignal.com" target="_blank" rel="noreferrer" className="text-red-400 hover:underline">
                        onesignal.com
                      </a>{" "}
                      и создайте новое приложение (New App/Website).
                    </li>
                    <li>Выберите платформу Google Android (FCM) и следуйте мастеру настройки.</li>
                    <li>Откройте Settings → Keys &amp; IDs — там будут App ID и REST API Key.</li>
                    <li>Скопируйте оба значения в поля выше.</li>
                  </ol>
                  <a
                    href="https://documentation.onesignal.com/docs/accounts-and-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-red-400 hover:underline inline-block pt-1"
                  >
                    Подробная инструкция OneSignal →
                  </a>
                </div>
              </div>
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