import { ReactNode } from "react"

interface Props {
  title: string
  description?: string
  children: ReactNode
  badge?: ReactNode
}

export default function SettingRow({ title, description, children, badge }: Props) {
  return (
    <div className="flex items-start justify-between gap-6 py-4 border-b border-neutral-800 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white text-sm font-medium">{title}</p>
          {badge}
        </div>
        {description && <p className="text-gray-500 text-xs mt-1 max-w-md">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}
