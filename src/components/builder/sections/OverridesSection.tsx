import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import Icon from "@/components/ui/icon"
import { BuilderState } from "../types"

interface Props {
  state: BuilderState
  update: <K extends keyof BuilderState>(key: K, value: BuilderState[K]) => void
}

export default function OverridesSection({ state, update }: Props) {
  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="bg-neutral-950 border-red-500/20">
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-1">
              Пользовательский CSS
              <Icon name="Info" size={13} className="text-gray-500" />
            </Label>
            <p className="text-gray-500 text-xs">
              Внедрите свои стили в веб-сайт, чтобы адаптировать его внешний вид под приложение.
            </p>
            <Textarea
              value={state.customCss}
              onChange={(e) => update("customCss", e.target.value)}
              placeholder=".header { display: none; }"
              className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500 font-mono text-xs min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white flex items-center gap-1">
              Пользовательский JavaScript
              <Icon name="Info" size={13} className="text-gray-500" />
            </Label>
            <p className="text-gray-500 text-xs">
              Выполняйте собственный код на каждой загруженной странице сайта.
            </p>
            <Textarea
              value={state.customJs}
              onChange={(e) => update("customJs", e.target.value)}
              placeholder="console.log('app ready')"
              className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500 font-mono text-xs min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white flex items-center gap-1">
              Пользовательский User-Agent
              <Icon name="Info" size={13} className="text-gray-500" />
            </Label>
            <p className="text-gray-500 text-xs">
              Переопределите User-Agent, отправляемый вашим приложением, например для аналитики.
            </p>
            <Input
              value={state.userAgent}
              onChange={(e) => update("userAgent", e.target.value)}
              placeholder="MyApp/1.0 (Android)"
              className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
