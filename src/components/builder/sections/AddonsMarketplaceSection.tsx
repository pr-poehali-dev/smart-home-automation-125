import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Icon from "@/components/ui/icon"
import AddonCard from "../AddonCard"
import { addonsCatalog, categoryLabels, categoryOrder } from "../addonsCatalog"
import { BuilderState } from "../types"

interface Props {
  state: BuilderState
  update: <K extends keyof BuilderState>(key: K, value: BuilderState[K]) => void
}

type TabId = "all" | "added" | "included"

const tabs: { id: TabId; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "added", label: "Добавлен" },
  { id: "included", label: "Включено в план" },
]

export default function AddonsMarketplaceSection({ state, update }: Props) {
  const [tab, setTab] = useState<TabId>("all")
  const [search, setSearch] = useState("")

  const addedIds = state.addedAddonIds || []

  const handleAdd = (id: string) => {
    if (addedIds.includes(id)) return
    update("addedAddonIds", [...addedIds, id])
  }

  const popular = addonsCatalog.filter((a) => a.popular)

  const filtered = useMemo(() => {
    return addonsCatalog
      .filter((a) => a.id !== "playstore-publishing")
      .filter((a) => {
        if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false
        if (tab === "added") return addedIds.includes(a.id)
        if (tab === "included") return a.badge === "included"
        return true
      })
  }, [search, tab, addedIds])

  const byCategory = categoryOrder
    .map((cat) => ({
      cat,
      items: filtered.filter((a) => a.category === cat),
    }))
    .filter((g) => g.items.length > 0)

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="rounded-xl border border-red-500/30 bg-gradient-to-r from-red-500/5 to-transparent p-5 relative">
        <span className="absolute -top-2.5 left-5 bg-red-500 text-white text-[10px] font-medium px-2 py-0.5 rounded">
          Самые популярные
        </span>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center shrink-0">
              <Icon name="PlayCircle" size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-white font-medium text-sm mb-1">Сервис публикации Playstore</p>
              <p className="text-gray-500 text-xs leading-relaxed max-w-2xl">
                Разместите свое приложение в Google Play Store с нашей экспертной поддержкой по
                публикации. Комплексная помощь в публикации: выделенная команда проведет вас через
                каждый этап, включая закрытое тестирование, управление учетными записями
                тестировщиков и отзывами, а также подачу заявки на...
              </p>
              <button className="text-red-400 text-xs hover:text-red-300 mt-1">Посмотреть больше</button>
            </div>
          </div>
          <Badge className="bg-green-500/15 text-green-400 border-0 text-[11px] font-normal shrink-0">
            Включено в план
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500 mt-4 pt-4 border-t border-red-500/10">
          <span>
            Опубликовано более <span className="text-gray-300">4500</span> приложений.
          </span>
          <span className="w-px h-3 bg-neutral-800" />
          <span>
            Уровень одобрения составляет <span className="text-gray-300">98%</span>.
          </span>
          <span className="w-px h-3 bg-neutral-800" />
          <span>
            Время подачи заявки: <span className="text-gray-300">24-48 часов</span>
          </span>
        </div>
      </div>

      {!search && tab === "all" && (
        <div>
          <p className="text-white text-sm font-medium mb-3">Популярные дополнения</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popular.map((addon) => (
              <AddonCard
                key={addon.id}
                addon={addon}
                added={addedIds.includes(addon.id)}
                onAdd={handleAdd}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                tab === t.id
                  ? "text-red-400 font-medium border-b-2 border-red-500 -mb-[13px] pb-[13px]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative w-56">
          <Icon
            name="Search"
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск"
            className="pl-8 h-8 bg-neutral-900 border-neutral-800 text-white placeholder:text-gray-500 text-sm"
          />
        </div>
      </div>

      {byCategory.length === 0 && (
        <p className="text-gray-500 text-sm py-8 text-center">Ничего не найдено</p>
      )}

      {byCategory.map(({ cat, items }) => (
        <div key={cat}>
          <p className="text-gray-400 text-sm mb-3">{categoryLabels[cat]}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((addon) => (
              <AddonCard
                key={addon.id}
                addon={addon}
                added={addedIds.includes(addon.id)}
                onAdd={handleAdd}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}