import { Card, CardContent } from "@/components/ui/card"
import Icon from "@/components/ui/icon"
import { BuilderState } from "../types"

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
    <div className="max-w-3xl">
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
    </div>
  )
}
