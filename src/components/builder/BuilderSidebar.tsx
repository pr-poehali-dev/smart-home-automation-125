import { useState } from "react"
import Icon from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SectionId, mainSections, addonSections } from "./types"

interface Props {
  active: SectionId
  onSelect: (id: SectionId) => void
}

export default function BuilderSidebar({ active, onSelect }: Props) {
  const [search, setSearch] = useState("")
  const [addonsOpen, setAddonsOpen] = useState(true)

  const filteredMain = mainSections.filter((s) =>
    s.label.toLowerCase().includes(search.toLowerCase())
  )
  const filteredAddons = addonSections.filter((s) =>
    s.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <aside className="w-64 shrink-0 border-r border-red-500/20 bg-neutral-950 h-full flex flex-col">
      <div className="p-4 border-b border-red-500/10">
        <div className="flex items-center gap-2 mb-4">
          <h1 className="font-orbitron text-lg font-bold text-white">
            Build<span className="text-red-500">APK</span>
          </h1>
        </div>
        <div className="relative">
          <Icon
            name="Search"
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск"
            className="pl-9 h-9 bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {filteredMain.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left ${
              active === item.id
                ? "bg-red-500/10 text-red-400"
                : "text-gray-300 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            <Icon name={item.icon} size={17} />
            <span className="flex-1">{item.label}</span>
          </button>
        ))}

        <div className="pt-4">
          <button
            onClick={() => setAddonsOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-300"
          >
            <span className="flex items-center gap-2">
              Дополнения
              <span className="flex items-center gap-1 text-red-400 border border-red-500/30 rounded px-1.5 py-0.5 text-[10px] normal-case font-normal">
                <Icon name="Plus" size={10} />
                добавлять
              </span>
            </span>
            <Icon
              name="ChevronDown"
              size={14}
              className={`transition-transform ${addonsOpen ? "" : "-rotate-90"}`}
            />
          </button>

          {addonsOpen && (
            <div className="mt-1 space-y-1">
              {filteredAddons.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(`addon-${item.id}` as SectionId)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left ${
                    active === `addon-${item.id}`
                      ? "bg-red-500/10 text-red-400"
                      : "text-gray-300 hover:bg-neutral-900 hover:text-white"
                  }`}
                >
                  <Icon name={item.icon} size={17} />
                  <span className="flex-1">{item.label}</span>
                  {item.count > 0 && (
                    <Badge className="bg-neutral-800 text-gray-400 border-0 h-5 px-1.5 text-[10px]">
                      {item.count}
                    </Badge>
                  )}
                  <Icon name="ChevronRight" size={14} className="text-gray-600" />
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
    </aside>
  )
}
