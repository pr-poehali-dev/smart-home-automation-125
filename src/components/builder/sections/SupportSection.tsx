import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import SettingRow from "../SettingRow"
import { BuilderState } from "../types"

interface Props {
  state: BuilderState
  update: <K extends keyof BuilderState>(key: K, value: BuilderState[K]) => void
}

export default function SupportSection({ state, update }: Props) {
  return (
    <div className="max-w-3xl">
      <Card className="bg-neutral-950 border-red-500/20">
        <CardContent className="pt-2">
          <SettingRow
            title="Виджет поддержки"
            description="Добавить плавающую кнопку чата поддержки в приложение."
          >
            <Switch
              checked={state.supportWidgetEnabled}
              onCheckedChange={(v) => update("supportWidgetEnabled", v)}
            />
          </SettingRow>

          {state.supportWidgetEnabled && (
            <div className="py-4 space-y-2">
              <Label className="text-white">Ссылка на виджет чата</Label>
              <Input
                value={state.supportWidgetUrl}
                onChange={(e) => update("supportWidgetUrl", e.target.value)}
                placeholder="https://t.me/yourbot или ссылка на виджет"
                className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
