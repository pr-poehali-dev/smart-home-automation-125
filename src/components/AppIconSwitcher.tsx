import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"

const ICONS_BASE = "https://xn----utbhbbdxh.xn--p1ai/icons-set"

const ICON_STYLES = [
  { id: "default", label: "Основная" },
  { id: "gradient", label: "Градиент" },
  { id: "dark", label: "Тёмная" },
  { id: "ocean", label: "Океан" },
  { id: "gold", label: "Золото" },
  { id: "minimal", label: "Минимал" },
]

const STORAGE_KEY = "app_icon_style"

declare global {
  interface Window {
    AndroidIcon?: { setIcon: (style: string) => void }
  }
}

export default function AppIconSwitcher() {
  const [selected, setSelected] = useState("default")
  const [nativeAvailable, setNativeAvailable] = useState(false)

  useEffect(() => {
    setNativeAvailable(typeof window !== "undefined" && !!window.AndroidIcon)
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setSelected(saved)
  }, [])

  const handleSelect = (styleId: string) => {
    setSelected(styleId)
    localStorage.setItem(STORAGE_KEY, styleId)
    if (window.AndroidIcon?.setIcon) {
      window.AndroidIcon.setIcon(styleId)
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
                  src={`${ICONS_BASE}/${s.id}-192.png`}
                  alt={s.label}
                  className="h-16 w-16 rounded-2xl object-cover"
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
    </div>
  )
}
