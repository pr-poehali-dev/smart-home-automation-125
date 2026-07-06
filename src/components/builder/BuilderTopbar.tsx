import { Button } from "@/components/ui/button"
import Icon from "@/components/ui/icon"

interface Props {
  sectionLabel: string
  onBuild: () => void
  isBuilding: boolean
  showBuyButton?: boolean
}

export default function BuilderTopbar({ sectionLabel, onBuild, isBuilding, showBuyButton }: Props) {
  return (
    <header className="h-16 border-b border-red-500/20 bg-black/95 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
      <div>
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <Icon name="Smartphone" size={12} />
          Андроид
        </p>
        <h2 className="text-white font-semibold text-base">{sectionLabel}</h2>
      </div>
      {showBuyButton ? (
        <Button className="bg-red-500 hover:bg-red-600 text-white border-0">
          Купить сейчас
        </Button>
      ) : (
        <Button
          onClick={onBuild}
          disabled={isBuilding}
          className="bg-red-500 hover:bg-red-600 text-white border-0"
        >
          {isBuilding ? (
            <Icon name="Loader2" size={16} className="animate-spin" />
          ) : (
            <Icon name="Rocket" size={16} />
          )}
          Собрать APK
        </Button>
      )}
    </header>
  )
}