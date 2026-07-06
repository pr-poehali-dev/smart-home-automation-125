import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

export function CTASection() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <section className="py-24 px-6 bg-black">
      <div className="max-w-4xl mx-auto text-center">
        <div className="slide-up">
          <h2 className="text-5xl font-bold text-white mb-6 font-sans text-balance">Соберите своё приложение прямо сейчас</h2>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            Превратите сайт в Android-приложение за пару минут. Первая сборка — бесплатно,
            без установки Android Studio и без строчки кода.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate(user ? "/dashboard" : "/auth")}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 pulse-button text-lg px-8 py-4"
            >
              Собрать APK бесплатно
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-lg px-8 py-4 bg-transparent"
            >
              Посмотреть тарифы
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}