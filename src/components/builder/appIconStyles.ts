import { BuilderState } from "./types"

export interface AppIconStyle {
  id: string
  label: string
  url: string
}

const HEART =
  "https://cdn.poehali.dev/projects/b471473c-c1c9-4346-909f-afc6a80feb03/bucket/b567d9e6-9f7a-4562-a959-8d5ddb15d139.png"
const DARK =
  "https://cdn.poehali.dev/projects/b471473c-c1c9-4346-909f-afc6a80feb03/files/26c0f3a9-5a9a-4b00-bbbb-e89e07423699.jpg"
const GRADIENT =
  "https://cdn.poehali.dev/projects/b471473c-c1c9-4346-909f-afc6a80feb03/files/0dbd081e-abf7-4190-9577-12c369cc3761.jpg"

export const appIconStyles: AppIconStyle[] = [
  { id: "default", label: "Основная", url: HEART },
  { id: "gradient", label: "Градиент", url: GRADIENT },
  { id: "dark", label: "Тёмная", url: DARK },
]

export function buildIconStyles(state: BuilderState): { id: string; url: string }[] {
  const list = appIconStyles.map((s) =>
    s.id === "default" && state.iconUrl ? { id: s.id, url: state.iconUrl } : { id: s.id, url: s.url },
  )
  return list.filter((s) => !!s.url)
}