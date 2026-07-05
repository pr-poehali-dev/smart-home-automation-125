import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Icon from "@/components/ui/icon"

interface BuildApkDialogProps {
  children: React.ReactNode
}

export function BuildApkDialog({ children }: BuildApkDialogProps) {
  const [open, setOpen] = useState(false)
  const [isBuilding, setIsBuilding] = useState(false)
  const [siteUrl, setSiteUrl] = useState("")
  const [appName, setAppName] = useState("")
  const [email, setEmail] = useState("")
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!siteUrl || !appName || !email) {
      toast({
        title: "Заполните все поля",
        description: "Укажите сайт, название приложения и email",
        variant: "destructive",
      })
      return
    }

    setIsBuilding(true)

    setTimeout(() => {
      setIsBuilding(false)
      setOpen(false)
      setSiteUrl("")
      setAppName("")
      setEmail("")
      toast({
        title: "Заявка на сборку принята!",
        description: `Соберём APK для «${appName}» и отправим ссылку на ${email} в течение нескольких минут.`,
      })
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-black border border-red-500/20 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white font-orbitron flex items-center gap-2">
            <Icon name="Smartphone" size={22} className="text-red-500" />
            Соберите APK из сайта
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Укажите данные — и мы соберём готовое Android-приложение
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteUrl" className="text-white">
              Ссылка на сайт
            </Label>
            <Input
              id="siteUrl"
              type="url"
              placeholder="https://example.com"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appName" className="text-white">
              Название приложения
            </Label>
            <Input
              id="appName"
              type="text"
              placeholder="Моё приложение"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email для отправки APK
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-neutral-900 border-red-500/20 text-white placeholder:text-gray-500"
            />
          </div>

          <Button
            type="submit"
            disabled={isBuilding}
            className="w-full bg-red-500 hover:bg-red-600 text-white border-0"
          >
            {isBuilding ? (
              <>
                <Icon name="Loader2" size={18} className="animate-spin" />
                Собираем APK...
              </>
            ) : (
              <>
                <Icon name="Hammer" size={18} />
                Собрать APK
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
