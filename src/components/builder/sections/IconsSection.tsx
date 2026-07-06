import { Card, CardContent } from "@/components/ui/card"
import Icon from "@/components/ui/icon"
import { BuilderState } from "../types"
import { notificationIconSets } from "../notificationIconSets"

interface Props {
  state: BuilderState
  update: <K extends keyof BuilderState>(key: K, value: BuilderState[K]) => void
}

const presets = [
  { id: "default", label: "Стандартная", icon: "Smartphone" },
  { id: "rounded", label: "Скруглённая", icon: "Square" },
  { id: "circle", label: "Круглая", icon: "Circle" },
  { id: "squircle", label: "Сквиркл", icon: "Hexagon" },
]

export default function IconsSection({ state, update }: Props) {
  return (
    <div className="max-w-5xl space-y-6">
      <Card className="bg-neutral-950 border-red-500/20">
        <CardContent className="pt-6">
          <p className="text-white text-sm font-medium mb-1">Форма значка приложения</p>
          <p className="text-gray-500 text-xs mb-4">
            Выберите, как будет выглядеть значок вашего приложения на экране устройства.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => update("iconPreset", p.id)}
                className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
                  state.iconPreset === p.id
                    ? "border-red-500 bg-red-500/5"
                    : "border-neutral-800 hover:border-red-500/30"
                }`}
              >
                <Icon
                  name={p.icon}
                  size={26}
                  className={state.iconPreset === p.id ? "text-red-400" : "text-gray-400"}
                />
                <span className="text-xs text-white">{p.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-neutral-950 border-red-500/20">
        <CardContent className="pt-6">
          <p className="text-white text-sm font-medium mb-1">Библиотека иконок для уведомлений</p>
          <p className="text-gray-500 text-xs mb-5">
            Выберите значок, который будет отображаться в шторке уведомлений устройства.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notificationIconSets.map((set) => {
              const isActive = state.notificationIconSet === set.id
              return (
                <button
                  key={set.id}
                  onClick={() => {
                    update("notificationIconSet", set.id)
                    update("notificationIconName", set.icons[0])
                  }}
                  className={`text-left rounded-xl border p-4 transition-colors ${
                    isActive ? "border-red-500 bg-red-500/5" : "border-neutral-800 hover:border-red-500/30"
                  }`}
                >
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {set.icons.slice(0, 8).map((iconName) => (
                      <span
                        key={iconName}
                        className="flex items-center justify-center h-9 w-9 rounded-full bg-red-500/10"
                      >
                        <Icon name={iconName} size={16} className="text-red-400" />
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">{set.label}</span>
                    <span className="text-xs text-gray-500">{set.count} иконок</span>
                  </div>
                </button>
              )
            })}
          </div>

          {state.notificationIconSet && (
            <div className="mt-6 pt-5 border-t border-neutral-800">
              <p className="text-white text-sm font-medium mb-3">
                Выберите значок из набора «
                {notificationIconSets.find((s) => s.id === state.notificationIconSet)?.label}»
              </p>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                {notificationIconSets
                  .find((s) => s.id === state.notificationIconSet)
                  ?.icons.map((iconName) => (
                    <button
                      key={iconName}
                      onClick={() => update("notificationIconName", iconName)}
                      className={`flex items-center justify-center h-10 w-10 rounded-lg border transition-colors ${
                        state.notificationIconName === iconName
                          ? "border-red-500 bg-red-500/10"
                          : "border-neutral-800 hover:border-red-500/30"
                      }`}
                    >
                      <Icon
                        name={iconName}
                        size={18}
                        className={
                          state.notificationIconName === iconName ? "text-red-400" : "text-gray-400"
                        }
                      />
                    </button>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
