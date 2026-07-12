export interface Subscription {
  plan_code: string
  plan_name: string
  builds_used: number
  builds_limit: number | null
  expires_at: string
}

export interface Build {
  id: number
  site_url: string
  app_name: string
  package_name: string | null
  icon_url: string | null
  splash_color: string
  theme_color: string
  push_enabled: boolean
  offline_enabled: boolean
  status: "queued" | "building" | "ready" | "failed"
  apk_url: string | null
  created_at: string
  addon_ids?: string[]
}

export const statusMap: Record<Build["status"], { label: string; color: string }> = {
  queued: { label: "В очереди", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  building: { label: "Собирается", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  ready: { label: "Готово", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  failed: { label: "Ошибка", color: "bg-red-500/20 text-red-400 border-red-500/30" },
}
