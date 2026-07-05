import { useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Icon from "@/components/ui/icon"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useFileUpload, UploadFolder } from "@/hooks/use-file-upload"
import { BuilderState } from "../types"

interface Props {
  state: BuilderState
  update: <K extends keyof BuilderState>(key: K, value: BuilderState[K]) => void
}

const splashTypes = [
  { id: "animation", label: "Анимация", icon: "Sparkles" },
  { id: "logo", label: "Изображение логотипа", icon: "Image" },
  { id: "full", label: "Полное изображение", icon: "Maximize" },
  { id: "mp4", label: "MP4", icon: "Video", premium: true },
] as const

const splashUploadConfig: Record<string, { folder: UploadFolder; accept: string[]; maxSizeMb: number }> = {
  animation: { folder: "splash-json", accept: [".json"], maxSizeMb: 5 },
  logo: { folder: "splash-images", accept: [".png", ".jpg", ".jpeg"], maxSizeMb: 5 },
  full: { folder: "splash-images", accept: [".png", ".jpg", ".jpeg"], maxSizeMb: 5 },
  mp4: { folder: "splash-video", accept: [".mp4"], maxSizeMb: 15 },
}

export default function SplashSection({ state, update }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { upload, isUploading } = useFileUpload()
  const { toast } = useToast()

  const config = splashUploadConfig[state.splashType]

  const handlePick = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const url = await upload(file, config)
    if (url) {
      update("splashAssetUrl", url)
      update("splashAssetName", file.name)
      toast({ title: "Файл загружен" })
    } else {
      toast({ title: "Не удалось загрузить файл", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {splashTypes.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              update("splashType", t.id)
              update("splashAssetUrl", "")
              update("splashAssetName", "")
            }}
            className={`flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors ${
              state.splashType === t.id
                ? "border-red-500 bg-red-500/5"
                : "border-neutral-800 bg-neutral-950 hover:border-red-500/30"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <Icon name={t.icon} size={18} className={state.splashType === t.id ? "text-red-400" : "text-gray-400"} />
              {state.splashType === t.id && (
                <span className="w-3 h-3 rounded-full bg-red-500 flex items-center justify-center">
                  <Icon name="Check" size={9} className="text-white" />
                </span>
              )}
            </div>
            <span className="text-sm text-white flex items-center gap-1.5">
              {t.label}
              {t.premium && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-0 text-[10px] px-1.5 py-0">
                  Премиум
                </Badge>
              )}
            </span>
          </button>
        ))}
      </div>

      <Card className="bg-neutral-950 border-red-500/20">
        <CardContent className="pt-6 space-y-5">
          <input
            ref={fileInputRef}
            type="file"
            accept={config.accept.join(",")}
            className="hidden"
            onChange={handleFileChange}
          />

          {state.splashType === "animation" && (
            <div className="space-y-2">
              <Label className="text-white">Загрузите JSON-файл</Label>
              <button
                type="button"
                onClick={handlePick}
                className="w-full border border-dashed border-red-500/20 rounded-lg h-28 flex flex-col items-center justify-center bg-neutral-900 gap-1 hover:border-red-500/40 transition-colors"
              >
                {isUploading ? (
                  <Icon name="Loader2" size={22} className="text-gray-500 animate-spin" />
                ) : (
                  <>
                    <Icon name="FileJson" size={22} className="text-gray-500" />
                    <span className="text-xs text-gray-500">{state.splashAssetName || "animation.json"}</span>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500">
                Добавьте свои собственные анимации.{" "}
                <a
                  href="https://lottiefiles.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300"
                >
                  Изучите анимации.
                </a>
              </p>
            </div>
          )}

          {(state.splashType === "logo" || state.splashType === "full") && (
            <div className="space-y-2">
              <Label className="text-white">Загрузите изображение</Label>
              <button
                type="button"
                onClick={handlePick}
                className="w-full border border-dashed border-red-500/20 rounded-lg h-28 flex items-center justify-center bg-neutral-900 hover:border-red-500/40 transition-colors overflow-hidden"
              >
                {isUploading ? (
                  <Icon name="Loader2" size={22} className="text-gray-500 animate-spin" />
                ) : state.splashAssetUrl ? (
                  <img src={state.splashAssetUrl} alt="splash" className="h-full object-contain" />
                ) : (
                  <Icon name="ImagePlus" size={22} className="text-gray-500" />
                )}
              </button>
            </div>
          )}

          {state.splashType === "mp4" && (
            <div className="space-y-2">
              <Label className="text-white">Загрузите видео (MP4)</Label>
              <button
                type="button"
                onClick={handlePick}
                className="w-full border border-dashed border-red-500/20 rounded-lg h-28 flex flex-col items-center justify-center bg-neutral-900 gap-1 hover:border-red-500/40 transition-colors"
              >
                {isUploading ? (
                  <Icon name="Loader2" size={22} className="text-gray-500 animate-spin" />
                ) : (
                  <>
                    <Icon name="Video" size={22} className="text-gray-500" />
                    <span className="text-xs text-gray-500">{state.splashAssetName || "video.mp4"}</span>
                  </>
                )}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label className="text-white">Фоновый цвет брызг</Label>
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">Включить градиент</span>
              <Switch
                checked={state.splashGradient}
                onCheckedChange={(v) => update("splashGradient", v)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={state.splashColor}
              onChange={(e) => update("splashColor", e.target.value)}
              className="bg-neutral-900 border-red-500/20 h-10 w-14 p-1"
            />
            <span className="text-gray-400 text-sm">{state.splashColor}</span>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Поведение при воспроизведении</Label>
            <Select value={state.splashBehavior} onValueChange={(v) => update("splashBehavior", v)}>
              <SelectTrigger className="bg-neutral-900 border-red-500/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-red-500/20 text-white">
                <SelectItem value="once">Один раз</SelectItem>
                <SelectItem value="loop">Повторять</SelectItem>
                <SelectItem value="keep">Оставаться включенным</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}