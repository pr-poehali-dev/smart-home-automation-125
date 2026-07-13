import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import Icon from "@/components/ui/icon"
import { BuilderState } from "../types"
import SplashLottiePreview from "../SplashLottiePreview"

interface Props {
  state: BuilderState
}

export default function PreviewSection({ state }: Props) {
  const [showSplash, setShowSplash] = useState(true)
  const [iframeError, setIframeError] = useState(false)

  const enabledPermissions = [
    { on: state.permCamera, label: "Камера / файлы", icon: "Camera" },
    { on: state.permLocation, label: "Геолокация", icon: "MapPin" },
    { on: state.permMedia, label: "Аудио/видеозапись", icon: "Mic" },
    { on: state.permVibration, label: "Вибрация", icon: "Vibrate" },
    { on: state.permMicrophone, label: "Микрофон", icon: "Mic2" },
  ].filter((p) => p.on)

  const enabledFeatures = [
    { on: state.pushEnabled, label: "Push-уведомления", icon: "Bell" },
    { on: state.offlineEnabled, label: "Офлайн-режим", icon: "WifiOff" },
    { on: state.webAuth, label: "Веб-авторизация", icon: "KeyRound" },
    { on: state.appLockEnabled, label: "Блокировка приложения", icon: "Lock" },
    { on: state.screenshotDisabled, label: "Запрет скриншотов", icon: "ShieldOff" },
    { on: state.deepLinks, label: "Диплинки", icon: "Link2" },
    { on: state.kioskMode, label: "Киоск-режим", icon: "Monitor" },
    { on: state.fullscreen, label: "Полноэкранный режим", icon: "Maximize" },
  ].filter((f) => f.on)

  return (
    <div className="max-w-5xl">
      <p className="text-gray-400 text-sm mb-6 max-w-2xl">
        Здесь показано, как будет выглядеть приложение с текущими настройками. Экран телефона
        отображает ваш сайт и применённое оформление в реальном времени.
      </p>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex flex-col items-center gap-4 shrink-0">
          <div className="relative w-[300px] h-[620px] rounded-[2.5rem] border-8 border-neutral-800 bg-black shadow-2xl overflow-hidden">
            <div
              className="absolute top-0 left-0 right-0 h-6 z-10 flex items-center justify-center"
              style={{ backgroundColor: state.statusBarColor || "#FFFFFF" }}
            >
              <div className="w-20 h-4 bg-black rounded-full" />
            </div>

            <div className="absolute inset-0 top-6 bottom-0 overflow-hidden bg-white">
              {showSplash ? (
                <div
                  className="w-full h-full flex flex-col items-center justify-center gap-4 cursor-pointer"
                  onClick={() => setShowSplash(false)}
                  style={{
                    background: state.splashGradient
                      ? `linear-gradient(180deg, ${state.splashColor}, #000)`
                      : state.splashColor || "#1A1025",
                  }}
                >
                  {state.splashType === "animation" && state.splashAssetUrl ? (
                    <SplashLottiePreview
                      url={state.splashAssetUrl}
                      loop={state.splashBehavior === "loop"}
                      className="w-24 h-24"
                    />
                  ) : state.splashType === "mp4" && state.splashAssetUrl ? (
                    <video
                      src={state.splashAssetUrl}
                      autoPlay
                      muted
                      loop={state.splashBehavior === "loop"}
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : state.splashAssetUrl || state.iconUrl ? (
                    <img
                      src={state.splashAssetUrl || state.iconUrl}
                      alt="splash"
                      className={state.splashType === "full" ? "w-full h-full object-cover" : "w-24 h-24 rounded-2xl object-cover"}
                    />
                  ) : (
                    <Icon name="Smartphone" size={48} className="text-white/40" />
                  )}
                  <p className="text-white/70 text-xs">{state.appName || "Ваше приложение"}</p>
                  <p className="text-white/30 text-[10px] mt-8">Нажмите, чтобы открыть приложение</p>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col">
                  <div
                    className="h-10 shrink-0 flex items-center px-3 gap-2"
                    style={{ backgroundColor: state.themeColor || "#ef4444" }}
                  >
                    {state.iconUrl && (
                      <img src={state.iconUrl} alt="icon" className="w-5 h-5 rounded object-cover" />
                    )}
                    <span className="text-white text-xs font-medium truncate">
                      {state.appName || "Ваше приложение"}
                    </span>
                  </div>
                  <div className="flex-1 relative bg-neutral-100">
                    {state.siteUrl && !iframeError ? (
                      <iframe
                        src={state.siteUrl}
                        title="preview"
                        className="w-full h-full border-0"
                        onError={() => setIframeError(true)}
                        sandbox="allow-scripts allow-same-origin allow-forms"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-6 text-center">
                        <Icon name="Globe" size={32} className="text-gray-300" />
                        <p className="text-gray-400 text-xs">
                          {state.siteUrl
                            ? "Сайт запрещает встраивание — так может выглядеть и в приложении"
                            : "Укажите адрес сайта в разделе «Информация о приложении»"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowSplash((v) => !v)}
            className="text-red-400 text-xs flex items-center gap-1.5 hover:text-red-300"
          >
            <Icon name="RefreshCw" size={12} />
            {showSplash ? "Показать содержимое сайта" : "Показать заставку"}
          </button>
        </div>

        <div className="flex-1 space-y-4 min-w-0">
          <Card className="bg-neutral-950 border-red-500/20">
            <CardContent className="pt-5">
              <p className="text-white text-sm font-medium mb-3">Разрешения приложения</p>
              {enabledPermissions.length === 0 ? (
                <p className="text-gray-500 text-xs">Дополнительные разрешения не включены.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {enabledPermissions.map((p) => (
                    <span
                      key={p.label}
                      className="flex items-center gap-1.5 text-xs bg-red-500/10 text-red-400 rounded-full px-3 py-1.5"
                    >
                      <Icon name={p.icon} size={13} />
                      {p.label}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-neutral-950 border-red-500/20">
            <CardContent className="pt-5">
              <p className="text-white text-sm font-medium mb-3">Включённые функции</p>
              {enabledFeatures.length === 0 ? (
                <p className="text-gray-500 text-xs">Дополнительные функции не включены.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {enabledFeatures.map((f) => (
                    <span
                      key={f.label}
                      className="flex items-center gap-1.5 text-xs bg-neutral-900 text-gray-300 rounded-full px-3 py-1.5 border border-neutral-800"
                    >
                      <Icon name={f.icon} size={13} />
                      {f.label}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-neutral-950 border-red-500/20">
            <CardContent className="pt-5 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-500 mb-1">Название</p>
                <p className="text-white">{state.appName || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Сайт</p>
                <p className="text-white truncate">{state.siteUrl || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Ориентация</p>
                <p className="text-white capitalize">{state.orientation}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Push-провайдер</p>
                <p className="text-white">{state.pushEnabled ? state.pushProvider : "выключен"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
