import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { PAYMENTS_URL, authHeaders } from "@/lib/api"
import Icon from "@/components/ui/icon"

interface Subscription {
  plan_code: string
  plan_name: string
  builds_used: number
  builds_limit: number | null
  expires_at: string
}

interface PaymentRecord {
  id: number
  plan_code: string
  plan_name: string
  amount: number
  status: "pending" | "succeeded" | "canceled"
  created_at: string
  paid_at: string | null
}

const statusMap: Record<PaymentRecord["status"], { label: string; color: string }> = {
  pending: { label: "Ожидает оплаты", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  succeeded: { label: "Оплачено", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  canceled: { label: "Отменён", color: "bg-red-500/20 text-red-400 border-red-500/30" },
}

export default function Billing() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()

  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [history, setHistory] = useState<PaymentRecord[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth")
  }, [authLoading, user, navigate])

  useEffect(() => {
    if (!user) return
    fetch(`${PAYMENTS_URL}?action=subscription`, { headers: { ...authHeaders() } })
      .then(async (res) => (res.ok ? res.json() : null))
      .then(setSubscription)
      .catch(() => {})

    fetch(`${PAYMENTS_URL}?action=history`, { headers: { ...authHeaders() } })
      .then(async (res) => (res.ok ? res.json() : []))
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setIsLoadingHistory(false))
  }, [user])

  if (authLoading || !user) {
    return (
      <div className="dark min-h-screen bg-black flex items-center justify-center">
        <Icon name="Loader2" size={32} className="animate-spin text-red-500" />
      </div>
    )
  }

  return (
    <div className="dark min-h-screen bg-black">
      <nav className="border-b border-red-500/20 bg-black/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <Icon name="ArrowLeft" size={18} />
            <span className="text-sm">Назад</span>
          </button>
          <h1 className="font-orbitron text-lg font-bold text-white">
            Build<span className="text-red-500">APK</span>
          </h1>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <h2 className="text-white text-xl font-orbitron font-bold flex items-center gap-2">
          <Icon name="FileText" size={20} className="text-red-500" />
          Платёжные данные
        </h2>

        <Card className="bg-neutral-950 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-white text-base">Текущий тариф</CardTitle>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                      «{subscription.plan_name}»
                    </Badge>
                  </div>
                  <p className="text-gray-500 text-xs">
                    Сборок использовано: {subscription.builds_used}
                    {subscription.builds_limit !== null ? ` из ${subscription.builds_limit}` : " (безлимит)"}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Действует до {new Date(subscription.expires_at).toLocaleDateString("ru-RU")}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate("/pricing")}
                  className="bg-red-500 hover:bg-red-600 text-white border-0"
                >
                  Сменить тариф
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-gray-500 text-sm">У вас нет активного тарифа</p>
                <Button
                  size="sm"
                  onClick={() => navigate("/pricing")}
                  className="bg-red-500 hover:bg-red-600 text-white border-0"
                >
                  Оформить тариф
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-neutral-950 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-white text-base">История платежей</CardTitle>
            <CardDescription>Все ваши прошлые и текущие оплаты</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingHistory ? (
              <div className="flex justify-center py-6">
                <Icon name="Loader2" size={24} className="animate-spin text-red-500" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">Платежей пока не было</p>
            ) : (
              <div className="space-y-2">
                {history.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-neutral-900 border border-red-500/10 rounded-lg px-4 py-3"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">Тариф «{p.plan_name}»</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(p.created_at).toLocaleDateString("ru-RU")}
                        {p.paid_at ? ` · оплачено ${new Date(p.paid_at).toLocaleDateString("ru-RU")}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white text-sm font-semibold">{p.amount} ₽</span>
                      <Badge variant="outline" className={statusMap[p.status].color}>
                        {statusMap[p.status].label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
