import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import SettingRow from "../SettingRow"
import { BuilderState } from "../types"

interface Props {
  state: BuilderState
  update: <K extends keyof BuilderState>(key: K, value: BuilderState[K]) => void
}

export default function DevicesSection({ state, update }: Props) {
  return (
    <div className="max-w-3xl">
      <Card className="bg-neutral-950 border-red-500/20">
        <CardContent className="pt-2">
          <SettingRow
            title="Поддержка устройств"
            description="На каких устройствах должно работать приложение."
          >
            <RadioGroup
              value={state.deviceSupport}
              onValueChange={(v) => update("deviceSupport", v as BuilderState["deviceSupport"])}
              className="flex items-center gap-4"
            >
              <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
                <RadioGroupItem value="phone" className="border-red-500/40 text-red-500" />
                Телефоны
              </label>
              <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
                <RadioGroupItem value="tablet" className="border-red-500/40 text-red-500" />
                Планшеты
              </label>
              <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
                <RadioGroupItem value="both" className="border-red-500/40 text-red-500" />
                Оба
              </label>
            </RadioGroup>
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  )
}
