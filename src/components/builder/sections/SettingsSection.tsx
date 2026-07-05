import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Icon from "@/components/ui/icon"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import SettingRow from "../SettingRow"
import { BuilderState } from "../types"

interface Props {
  state: BuilderState
  update: <K extends keyof BuilderState>(key: K, value: BuilderState[K]) => void
}

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-500 text-xs">Индивидуальный цвет</span>
      <div className="flex items-center gap-1.5 border border-red-500/20 rounded-md px-2 h-9 bg-neutral-900">
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-5 h-5 p-0 border-0 bg-transparent"
        />
        <span className="text-gray-300 text-xs">{value}</span>
        <Icon name="Pipette" size={13} className="text-gray-500" />
      </div>
    </div>
  )
}

export default function SettingsSection({ state, update }: Props) {
  return (
    <div className="max-w-3xl">
      <Card className="bg-neutral-950 border-red-500/20">
        <CardContent className="pt-2">
          <SettingRow
            title="Цвет строки состояния"
            description="Добавьте желаемый цвет в строку состояния системы."
          >
            <ColorField value={state.statusBarColor} onChange={(v) => update("statusBarColor", v)} />
          </SettingRow>

          <SettingRow
            title="Ориентация экрана"
            description="Установите режим отображения экрана: портретный, альбомный или оба."
          >
            <RadioGroup
              value={state.orientation}
              onValueChange={(v) => update("orientation", v as BuilderState["orientation"])}
              className="flex items-center gap-4"
            >
              <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
                <RadioGroupItem value="portrait" className="border-red-500/40 text-red-500" />
                Портрет
              </label>
              <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
                <RadioGroupItem value="landscape" className="border-red-500/40 text-red-500" />
                Пейзаж
              </label>
              <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
                <RadioGroupItem value="both" className="border-red-500/40 text-red-500" />
                Оба
              </label>
            </RadioGroup>
          </SettingRow>

          <SettingRow
            title="Включить полноэкранный режим"
            description="Разрешите приложению работать в полноэкранном режиме, скрыв панель состояния и панель навигации."
          >
            <Switch checked={state.fullscreen} onCheckedChange={(v) => update("fullscreen", v)} />
          </SettingRow>

          <SettingRow
            title="Цвет панели навигации системы"
            description="Настройте цвет системной панели навигации в соответствии с темой вашего приложения."
          >
            <ColorField value={state.navBarColor} onChange={(v) => update("navBarColor", v)} />
          </SettingRow>

          <SettingRow
            title='Включить масштабирование с помощью жеста "щипок"?'
            description='Позволяет увеличивать и уменьшать масштаб с помощью жеста "щипок".'
          >
            <Switch checked={state.pinchZoom} onCheckedChange={(v) => update("pinchZoom", v)} />
          </SettingRow>

          <SettingRow
            title="Доступ к мосту JS"
            description="Управляйте тем, какие страницы могут вызывать собственные функции и получать обратные вызовы через JS-мост."
          >
            <Switch checked={state.jsBridge} onCheckedChange={(v) => update("jsBridge", v)} />
          </SettingRow>

          {state.jsBridge && (
            <SettingRow title="JS Bridge работает на">
              <Select value={state.jsBridgeScope} onValueChange={(v) => update("jsBridgeScope", v)}>
                <SelectTrigger className="bg-neutral-900 border-red-500/20 text-white w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-red-500/20 text-white">
                  <SelectItem value="all">Показать на всех...</SelectItem>
                  <SelectItem value="specific">Определённые страницы</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
          )}

          <SettingRow
            title="Добавить функцию обратного вызова при возобновлении работы приложения."
            description="Запустить определенное действие или функцию при возобновлении работы приложения из фонового режима."
          >
            <Switch checked={state.resumeCallback} onCheckedChange={(v) => update("resumeCallback", v)} />
          </SettingRow>

          <SettingRow
            title="Отключить кэширование"
            description="Предотвратить кэширование данных."
          >
            <Switch checked={state.disableCache} onCheckedChange={(v) => update("disableCache", v)} />
          </SettingRow>

          <SettingRow
            title="Включить режим киоска"
            description="Включите режим киоска для веб-представления."
          >
            <Switch checked={state.kioskMode} onCheckedChange={(v) => update("kioskMode", v)} />
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  )
}
