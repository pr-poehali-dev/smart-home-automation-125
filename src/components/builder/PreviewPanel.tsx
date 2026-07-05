import Icon from "@/components/ui/icon"
import { BuilderState } from "./types"

interface Props {
  state: BuilderState
}

export default function PreviewPanel({ state }: Props) {
  const previewUrl = state.siteUrl || "https://example.com"
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&margin=0&color=ffffff&bgcolor=000000&data=${encodeURIComponent(previewUrl)}`

  const steps = [
    {
      title: "Сканировать или загрузить файл",
      desc: "Отсканируйте QR-код или скачайте файл, чтобы протестировать на Android.",
      extra: (
        <div className="flex items-center gap-3 mt-2">
          <img src={qrSrc} alt="QR" className="w-16 h-16 rounded" />
          <a
            href={qrSrc}
            download="qr-code.png"
            className="text-red-400 text-xs flex items-center gap-1 hover:text-red-300"
          >
            <Icon name="Download" size={12} />
            СКАЧАТЬ
          </a>
        </div>
      ),
    },
    {
      title: "Перейти к appetize.io",
      desc: (
        <>
          Войдите в систему и загрузите файл, чтобы имитировать работу приложения.
        </>
      ),
    },
    {
      title: "Попробуйте демоверсию",
      desc: "Запустите приложение и ознакомьтесь с демо-версией. Она доступна в течение 14 дней.",
    },
  ]

  return (
    <aside className="w-72 shrink-0 border-l border-red-500/20 bg-neutral-950 h-full overflow-y-auto p-5 hidden xl:block">
      <h3 className="text-white font-semibold text-sm mb-5">
        Шаги для предварительного просмотра вашего приложения
      </h3>

      <div className="space-y-6 mb-6">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{step.title}</p>
              <p className="text-gray-500 text-xs mt-1">{step.desc}</p>
              {step.extra}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-red-500/10 bg-black p-4 flex flex-col items-center">
        <div
          className="w-32 h-56 rounded-2xl border-4 flex items-center justify-center overflow-hidden"
          style={{ borderColor: state.themeColor || "#333", backgroundColor: state.splashColor || "#1A1025" }}
        >
          {state.iconUrl ? (
            <img src={state.iconUrl} alt="icon" className="w-10 h-10 rounded-lg" />
          ) : (
            <Icon name="Smartphone" size={28} className="text-white/40" />
          )}
        </div>
        <p className="text-gray-500 text-xs mt-3 truncate max-w-full">
          {state.appName || "Ваше приложение"}
        </p>
      </div>
    </aside>
  )
}