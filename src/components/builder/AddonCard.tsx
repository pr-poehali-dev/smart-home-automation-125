import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Icon from "@/components/ui/icon"
import { CatalogAddon } from "./addonsCatalog"

interface Props {
  addon: CatalogAddon
  added: boolean
  onAdd: (id: string) => void
  popular?: boolean
}

export default function AddonCard({ addon, added, onAdd, popular }: Props) {
  const isLetterIcon = addon.icon.startsWith("letter:")
  const letter = isLetterIcon ? addon.icon.replace("letter:", "") : ""

  const badgeNode = added ? (
    <Badge className="bg-green-500/15 text-green-400 border-0 text-[11px] font-normal">
      Включено в план
    </Badge>
  ) : addon.badge === "premium" ? (
    <Badge className="bg-indigo-500/15 text-indigo-400 border-0 text-[11px] font-normal">
      Входит в Премиум-пакет.
    </Badge>
  ) : addon.badge === "premium-start" ? (
    <Badge className="bg-yellow-500/15 text-yellow-400 border-0 text-[11px] font-normal">
      Начинается с Премиум
    </Badge>
  ) : addon.badge === "included" ? (
    <Badge className="bg-green-500/15 text-green-400 border-0 text-[11px] font-normal">
      Включено в план
    </Badge>
  ) : null

  const renderAction = () => {
    if (added) {
      return (
        <span className="text-green-400 text-xs flex items-center gap-1">
          <Icon name="Check" size={13} />
          Добавлено
        </span>
      )
    }
    if (addon.action === "settings") {
      return (
        <button className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1">
          <Icon name="Settings" size={13} />
          Настройки
        </button>
      )
    }
    if (addon.action === "update") {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onAdd(addon.id)}
          className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent h-7 text-xs"
        >
          Обновление
        </Button>
      )
    }
    if (addon.action === "subscribe") {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onAdd(addon.id)}
          className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent h-7 text-xs"
        >
          Подписаться
        </Button>
      )
    }
    if (addon.action === "contact") {
      return (
        <Button
          size="sm"
          variant="outline"
          className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent h-7 text-xs"
        >
          Связаться со службой поддержки
        </Button>
      )
    }
    if (addon.action === "none") {
      return null
    }
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => onAdd(addon.id)}
        className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent h-7 text-xs"
      >
        <Icon name="Plus" size={13} />
        Добавлять
      </Button>
    )
  }

  return (
    <Card className="bg-neutral-950 border-red-500/20 relative overflow-visible">
      {popular && (
        <span className="absolute -top-2.5 left-4 bg-red-500 text-white text-[10px] font-medium px-2 py-0.5 rounded">
          Самые популярные
        </span>
      )}
      <CardContent className="pt-5 pb-4 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-lg bg-neutral-900 flex items-center justify-center shrink-0">
            {isLetterIcon ? (
              <span className="text-sm font-semibold text-gray-300">{letter}</span>
            ) : (
              <Icon name={addon.icon} size={18} className={addon.iconColor || "text-gray-300"} />
            )}
          </div>
          {badgeNode}
        </div>
        <p className="text-white text-sm font-medium mb-1">{addon.title}</p>
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-3 flex-1">
          {addon.description}
        </p>
        <div className="flex items-center justify-between mt-4">
          <div className="text-xs">
            {addon.price ? (
              <span className="text-white font-medium">
                {addon.price}{" "}
                <span className="text-gray-500 font-normal">{addon.priceNote}</span>
              </span>
            ) : (
              <span className="text-gray-600">—</span>
            )}
          </div>
          {renderAction()}
        </div>
      </CardContent>
    </Card>
  )
}
