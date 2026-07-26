import { BuilderState } from "./types"

export interface AppIconStyle {
  id: string
  label: string
  url: string
}

const HEART =
  "https://cdn.poehali.dev/projects/b471473c-c1c9-4346-909f-afc6a80feb03/bucket/b567d9e6-9f7a-4562-a959-8d5ddb15d139.png"

export const appIconStyles: AppIconStyle[] = [
  { id: "default", label: "Основная", url: HEART },
]

export function buildIconStyles(state: BuilderState): { id: string; url: string }[] {
  const list = appIconStyles.map((s) =>
    s.id === "default" && state.iconUrl ? { id: s.id, url: state.iconUrl } : { id: s.id, url: s.url },
  )
  return list.filter((s) => !!s.url)
}
