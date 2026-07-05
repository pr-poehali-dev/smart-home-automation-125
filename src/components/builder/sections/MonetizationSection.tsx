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

export default function MonetizationSection({ state, update }: Props) {
  return (
    <div className="max-w-3xl">
      <Card className="bg-neutral-950 border-red-500/20">
        <CardContent className="pt-2">
          <SettingRow
            title="Показ рекламы (AdMob)"
            description="Включить показ баннерной и межстраничной рекламы через Google AdMob."
          >
            <Switch checked={state.adsEnabled} onCheckedChange={(v) => update("adsEnabled", v)} />
          </SettingRow>

          {state.adsEnabled && (
            <div className="py-4 border-b border-neutral-800 space-y-2">
              <Label className="text-white">ID приложения AdMob</Label>
              <Input
                value={state.adMobId}
                onChange={(e) => update("adMobId", e.target.value)}
                placeholder="ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx"
                className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
              />
            </div>
          )}

          <SettingRow
            title="Покупки внутри приложения"
            description="Разрешить обработку платежей и подписок через Google Play Billing."
          >
            <Switch checked={state.iapEnabled} onCheckedChange={(v) => update("iapEnabled", v)} />
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  )
}
