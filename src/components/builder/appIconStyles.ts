import { BuilderState } from "./types"

export interface AppIconStyle {
  id: string
  label: string
  url: string
}

const HEART = "/app-icon-default.png"
const DARK = "/app-icons/dark.png"
const GRADIENT = "/app-icons/gradient.png"

export const appIconStyles: AppIconStyle[] = [
  { id: "default", label: "Основная", url: HEART },
  { id: "gradient", label: "Градиент", url: GRADIENT },
  { id: "dark", label: "Тёмная", url: DARK },
]

function absoluteUrl(url: string): string {
  if (!url) return url
  if (/^https?:\/\//i.test(url)) return url
  const origin =
    typeof window !== "undefined" && window.location ? window.location.origin : ""
  return origin + (url.startsWith("/") ? url : "/" + url)
}

export function buildIconStyles(state: BuilderState): { id: string; url: string }[] {
  const list = appIconStyles.map((s) =>
    s.id === "default" && state.iconUrl
      ? { id: s.id, url: absoluteUrl(state.iconUrl) }
      : { id: s.id, url: absoluteUrl(s.url) },
  )
  return list.filter((s) => !!s.url)
}