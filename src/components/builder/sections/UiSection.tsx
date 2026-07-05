import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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

export default function UiSection({ state, update }: Props) {
  return (
    <div className="max-w-3xl">
      <Card className="bg-neutral-950 border-red-500/20">
        <CardContent className="pt-2">
          <SettingRow
            title="Тема приложения"
            description="Выберите оформление интерфейса приложения по умолчанию."
          >
            <RadioGroup
              value={state.uiTheme}
              onValueChange={(v) => update("uiTheme", v as BuilderState["uiTheme"])}
              className="flex items-center gap-4"
            >
              <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
                <RadioGroupItem value="light" className="border-red-500/40 text-red-500" />
                Светлая
              </label>
              <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
                <RadioGroupItem value="dark" className="border-red-500/40 text-red-500" />
                Тёмная
              </label>
              <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
                <RadioGroupItem value="system" className="border-red-500/40 text-red-500" />
                Системная
              </label>
            </RadioGroup>
          </SettingRow>

          <SettingRow
            title="Индикатор загрузки"
            description="Стиль экрана ожидания при загрузке страниц."
          >
            <Select value={state.uiLoaderStyle} onValueChange={(v) => update("uiLoaderStyle", v as BuilderState["uiLoaderStyle"])}>
              <SelectTrigger className="bg-neutral-900 border-red-500/20 text-white w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-red-500/20 text-white">
                <SelectItem value="spinner">Спиннер</SelectItem>
                <SelectItem value="bar">Полоса</SelectItem>
                <SelectItem value="none">Без индикатора</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            title="Пользовательский шрифт"
            description="Использовать собственный шрифт вместо системного."
          >
            <Switch checked={state.uiCustomFont} onCheckedChange={(v) => update("uiCustomFont", v)} />
          </SettingRow>

          {state.uiCustomFont && (
            <SettingRow title="Название шрифта Google Fonts">
              <Select value={state.uiFontFamily} onValueChange={(v) => update("uiFontFamily", v)}>
                <SelectTrigger className="bg-neutral-900 border-red-500/20 text-white w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-red-500/20 text-white">
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Montserrat">Montserrat</SelectItem>
                  <SelectItem value="Poppins">Poppins</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
