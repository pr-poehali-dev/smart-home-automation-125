import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { PAYMENTS_URL, authHeaders } from "@/lib/api"
import Icon from "@/components/ui/icon"

interface Plan {
  code: string
  name: string
  price: number
  builds_limit: number | null
  description: string
}

const fallbackPlans: Plan[] = [
  { code: "start", name: "Старт", price: 990, builds_limit: 1, description: "Идеально для первого запуска: 1 сборка APK в месяц" },
  { code: "pro", name: "Про", price: 2990, builds_limit: 5, description: "5 сборок в месяц и все premium-дополнения" },
  { code: "business", name: "Бизнес", price: 6990, builds_limit: null, description: "Безлимитные сборки и приоритетная поддержка" },
]

export default function Pricing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [plans, setPlans] = useState<Plan[]>(fallbackPlans)
  const [payingCode, setPayingCode] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    fetch(`${PAYMENTS_URL}?action=plans`, { headers: { ...authHeaders() } })
      .then(async (res) => {
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data) && data.length) setPlans(data)
      })
      .catch(() => {})
  }, [user])

  const handleSelectPlan = async (planCode: string) => {
    if (!user) {
      navigate("/auth")
      return
    }
    setPayingCode(planCode)
    try {
      const res = await fetch(`${PAYMENTS_URL}?action=create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ plan_code: planCode, return_url: `${window.location.origin}/dashboard` }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Не удалось создать платёж")
      window.location.href = data.confirmation_url
    } catch (err) {
      toast({
        title: "Ошибка оплаты",
        description: err instanceof Error ? err.message : "Попробуйте снова",
        variant: "destructive",
      })
    } finally {
      setPayingCode(null)
    }
  }

  return (
    <div className="dark min-h-screen bg-black">
      <Navbar />
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-4 font-sans">Тарифы</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Выберите подходящий тариф и скачивайте готовые Android-приложения без ограничений
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.code}
                className={`bg-neutral-950 border-red-500/20 flex flex-col ${
                  plan.code === "pro" ? "border-red-500 shadow-lg shadow-red-500/10 md:scale-105" : ""
                }`}
              >
                <CardHeader>
                  {plan.code === "pro" && (
                    <span className="text-xs font-semibold text-red-500 mb-2">ПОПУЛЯРНЫЙ ВЫБОР</span>
                  )}
                  <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-400">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">{plan.price.toLocaleString("ru-RU")} ₽</span>
                    <span className="text-gray-500"> / месяц</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    <li className="flex items-center gap-2 text-gray-300">
                      <Icon name="Check" size={18} className="text-red-500 shrink-0" />
                      {plan.builds_limit ? `${plan.builds_limit} сборок в месяц` : "Безлимитные сборки"}
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                      <Icon name="Check" size={18} className="text-red-500 shrink-0" />
                      Скачивание готовых APK
                    </li>
                    {plan.code !== "start" && (
                      <li className="flex items-center gap-2 text-gray-300">
                        <Icon name="Check" size={18} className="text-red-500 shrink-0" />
                        Premium-дополнения
                      </li>
                    )}
                    {plan.code === "business" && (
                      <li className="flex items-center gap-2 text-gray-300">
                        <Icon name="Check" size={18} className="text-red-500 shrink-0" />
                        Приоритетная поддержка
                      </li>
                    )}
                  </ul>
                  <Button
                    onClick={() => handleSelectPlan(plan.code)}
                    disabled={payingCode === plan.code}
                    className="w-full bg-red-500 hover:bg-red-600 text-white border-0"
                  >
                    {payingCode === plan.code ? (
                      <Icon name="Loader2" size={18} className="animate-spin" />
                    ) : (
                      "Выбрать тариф"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
