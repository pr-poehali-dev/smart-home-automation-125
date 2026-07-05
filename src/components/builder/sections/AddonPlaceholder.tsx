import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Icon from "@/components/ui/icon"

interface Props {
  label: string
  icon: string
}

export default function AddonPlaceholder({ label, icon }: Props) {
  return (
    <div className="max-w-2xl">
      <Card className="bg-neutral-950 border-red-500/20">
        <CardContent className="pt-10 pb-10 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <Icon name={icon} size={22} className="text-red-400" />
          </div>
          <p className="text-white font-medium">{label}</p>
          <p className="text-gray-500 text-sm max-w-sm">
            Этот раздел скоро появится. Расскажите, какие настройки вам нужны — и я добавлю их сюда.
          </p>
          <Button className="bg-red-500 hover:bg-red-600 text-white border-0 mt-2">
            <Icon name="Plus" size={15} />
            Добавить
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
