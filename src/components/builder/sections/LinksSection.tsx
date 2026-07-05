import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import Icon from "@/components/ui/icon"
import { BuilderState } from "../types"

interface Props {
  state: BuilderState
  update: <K extends keyof BuilderState>(key: K, value: BuilderState[K]) => void
}

const docsUrl = "https://docs.poehali.dev/getting-started/prompting"

const toggleCards = [
  {
    icon: "Globe",
    title: "Внутренние против внешних",
    desc: "Настройте правила, чтобы контролировать, какие ссылки открываются внутри вашего приложения, а какие — в браузере по умолчанию на устройстве.",
    key: "internalExternalLinks" as const,
  },
  {
    icon: "Link2",
    title: "Глубокие ссылки",
    desc: "Открывайте ссылки, ведущие на ваш сайт, непосредственно в вашем приложении, а не в браузере.",
    key: "deepLinks" as const,
  },
  {
    icon: "FileText",
    title: "Установить referer",
    desc: "Отслеживайте источники установки вашего приложения и перенаправляйте пользователей на определённую страницу после первого открытия рекламной ссылки.",
    key: "setReferrer" as const,
  },
  {
    icon: "ShieldCheck",
    title: "Пароль / Веб-аутентификация",
    desc: "Включите встроенную аутентификацию по паролю или WebAuthn, чтобы пользователи вашего приложения могли входить в систему с помощью биометрических данных, ключей безопасности или сохранённых учётных данных.",
    key: "webAuth" as const,
  },
]

function DocsLink() {
  return (
    <a
      href={docsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-red-400 flex items-center gap-1 hover:text-red-300"
    >
      Просмотреть документы
      <Icon name="ExternalLink" size={11} />
    </a>
  )
}

export default function LinksSection({ state, update }: Props) {
  return (
    <div className="space-y-4 max-w-5xl">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {toggleCards.map((c) => (
          <Card key={c.title} className="bg-neutral-950 border-red-500/20 flex flex-col">
            <CardContent className="pt-5 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3">
                <Icon name={c.icon} size={20} className="text-gray-400" />
                <DocsLink />
              </div>
              <p className="text-white text-sm font-medium mb-1.5">{c.title}</p>
              <p className="text-gray-500 text-xs flex-1">{c.desc}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-gray-400 text-xs">Включено</span>
                <Switch checked={state[c.key]} onCheckedChange={(v) => update(c.key, v)} />
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="bg-neutral-950 border-red-500/20 flex flex-col">
          <CardContent className="pt-5 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-3">
              <Icon name="Waypoints" size={20} className="text-gray-400" />
              <DocsLink />
            </div>
            <p className="text-white text-sm font-medium mb-1.5">Протокол схемы URL</p>
            <p className="text-gray-500 text-xs flex-1">
              «Схема URL» — это расширенный параметр конфигурации, используемый для определения нестандартного формата ссылки, которая будет открываться только в вашем приложении, а не в браузере устройства.
            </p>
            <Input
              value={state.urlScheme}
              onChange={(e) => update("urlScheme", e.target.value)}
              placeholder="myapp://"
              className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500 mt-4"
            />
          </CardContent>
        </Card>

        <Card className="bg-neutral-950 border-red-500/20 flex flex-col">
          <CardContent className="pt-5 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-3">
              <Icon name="Globe2" size={20} className="text-gray-400" />
              <DocsLink />
            </div>
            <p className="text-white text-sm font-medium mb-1.5">Разрешить HTTP (небезопасный контент)</p>
            <p className="text-gray-500 text-xs flex-1">
              По умолчанию ваше приложение загружает только защищённый HTTPS-контент. Включите эту опцию, чтобы разрешить HTTP-соединения, если ваш веб-сайт или его ресурсы (изображения, скрипты) передаются по протоколу HTTP.
            </p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-gray-400 text-xs">Разрешить HTTP</span>
              <Switch checked={state.allowHttp} onCheckedChange={(v) => update("allowHttp", v)} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}