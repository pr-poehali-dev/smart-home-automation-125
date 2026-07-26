import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"
import { appIconStyles } from "@/components/builder/appIconStyles"

const ICON_STYLES = appIconStyles.map((s) => ({ id: s.id, label: s.label, img: s.url }))

const STORAGE_KEY = "app_icon_style"

declare global {
  interface Window {
    AndroidIconNative?: { setIcon: (style: string) => void; isAvailable?: () => boolean }
  }
}

export default function AppIconSwitcher() {
  const [selected, setSelected] = useState("default")
  const [nativeAvailable, setNativeAvailable] = useState(false)
  const [status, setStatus] = useState("")

  useEffect(() => {
    setNativeAvailable(typeof window !== "undefined" && !!window.AndroidIconNative)
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setSelected(saved)
  }, [])

  const handleSelect = (styleId: string) => {
    setSelected(styleId)
    localStorage.setItem(STORAGE_KEY, styleId)
    const bridge = typeof window !== "undefined" ? window.AndroidIconNative : undefined
    if (bridge && typeof bridge.setIcon === "function") {
      try {
        bridge.setIcon(styleId)
        setStatus("Иконка применена. На рабочем столе обновится через несколько секунд.")
      } catch (e) {
        setStatus("Ошибка вызова: " + (e instanceof Error ? e.message : String(e)))
      }
    } else {
      setStatus("Смена иконки доступна только в установленном приложении.")
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-lg font-semibold text-white mb-1">Иконка приложения</h2>
      <p className="text-sm text-gray-400 mb-4">
        Выберите, как приложение выглядит на экране телефона.
      </p>

      <div className="grid grid-cols-3 gap-3">
        {ICON_STYLES.map((s) => {
          const isActive = selected === s.id
          return (
            <button
              key={s.id}
              onClick={() => handleSelect(s.id)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors ${
                isActive
                  ? "border-red-500 bg-red-500/5"
                  : "border-neutral-800 hover:border-red-500/40"
              }`}
            >
              <div className="relative">
                <img
                  src={s.img}
                  alt={s.label}
                  className="h-16 w-16 rounded-2xl object-cover bg-white"
                  loading="lazy"
                />
                {isActive && (
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500">
                    <Icon name="Check" size={12} className="text-white" />
                  </span>
                )}
              </div>
              <span className={`text-xs ${isActive ? "text-red-400" : "text-gray-400"}`}>
                {s.label}
              </span>
            </button>
          )
        })}
      </div>

      {!nativeAvailable && (
        <p className="mt-4 text-xs text-amber-400/80 flex items-center gap-1.5">
          <Icon name="Info" size={14} />
          Смена иконки на рабочем столе работает только в установленном приложении.
        </p>
      )}

      {status && (
        <p className="mt-3 text-xs text-gray-300 rounded-lg bg-neutral-900 border border-neutral-800 p-2">
          {status}
        </p>
      )}
    </div>
  )
}