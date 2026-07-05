import { useState } from "react"
import { UPLOAD_URL, authHeaders } from "@/lib/api"

export type UploadFolder = "icons" | "splash-json" | "splash-images" | "splash-video"

interface UploadOptions {
  folder: UploadFolder
  maxSizeMb?: number
  accept?: string[]
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = async (file: File, options: UploadOptions): Promise<string | null> => {
    setError(null)

    if (options.accept && !options.accept.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      setError(`Неверный формат файла. Ожидается: ${options.accept.join(", ")}`)
      return null
    }

    const maxBytes = (options.maxSizeMb ?? 15) * 1024 * 1024
    if (file.size > maxBytes) {
      setError(`Файл слишком большой. Максимум ${options.maxSizeMb ?? 15} МБ`)
      return null
    }

    setIsUploading(true)
    try {
      const fileBase64 = await fileToBase64(file)
      const res = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          file_base64: fileBase64,
          filename: file.name,
          folder: options.folder,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Не удалось загрузить файл")
      return data.url as string
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки файла")
      return null
    } finally {
      setIsUploading(false)
    }
  }

  return { upload, isUploading, error }
}
