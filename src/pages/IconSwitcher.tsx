import AppIconSwitcher from "@/components/AppIconSwitcher"

export default function IconSwitcher() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
        <AppIconSwitcher />
      </div>
    </div>
  )
}
