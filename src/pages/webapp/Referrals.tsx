import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { AUTH_URL, authHeaders } from "@/lib/api"
import Icon from "@/components/ui/icon"

interface InvitedUser {
  email: string
  name: string | null
  created_at: string
  has_paid: boolean
}

interface ReferralsData {
  referral_code: string | null
  invited: InvitedUser[]
  total_bonus_days: number
  bonus_count: number
}

export default function Referrals() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  const [data, setData] = useState<ReferralsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth")
  }, [authLoading, user, navigate])

  useEffect(() => {
    if (!user) return
    fetch(`${AUTH_URL}?action=referrals`, { headers: { ...authHeaders() } })
      .then(async (res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [user])

  const referralLink = data?.referral_code ? `${window.location.origin}/auth?ref=${data.referral_code}` : ""

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    toast({ title: "Ссылка скопирована" })
  }

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
        <div>
          <h2 className="text-white text-xl font-orbitron font-bold flex items-center gap-2">
            <Icon name="Gift" size={20} className="text-red-500" />
            Приглашайте друзей и зарабатывайте!
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Когда приглашённый друг оплатит первый тариф, вам начислится {" "}
            <span className="text-white font-medium">7 бонусных дней</span> к вашей подписке.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Icon name="Loader2" size={28} className="animate-spin text-red-500" />
          </div>
        ) : (
          <>
            <Card className="bg-neutral-950 border-red-500/20">
              <CardHeader>
                <CardTitle className="text-white text-base">Ваша персональная ссылка</CardTitle>
                <CardDescription>Поделитесь этой ссылкой с друзьями</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={referralLink}
                    readOnly
                    className="bg-neutral-900 border-red-500/20 text-white font-mono text-xs"
                  />
                  <Button onClick={handleCopy} className="bg-red-500 hover:bg-red-600 text-white border-0 shrink-0">
                    <Icon name="Copy" size={16} className="mr-2" />
                    Копировать
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-neutral-950 border-red-500/20">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-orbitron font-bold text-white">{data?.invited.length ?? 0}</p>
                  <p className="text-gray-500 text-xs mt-1">Приглашено друзей</p>
                </CardContent>
              </Card>
              <Card className="bg-neutral-950 border-red-500/20">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-orbitron font-bold text-red-500">{data?.total_bonus_days ?? 0}</p>
                  <p className="text-gray-500 text-xs mt-1">Бонусных дней получено</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-neutral-950 border-red-500/20">
              <CardHeader>
                <CardTitle className="text-white text-base">Приглашённые друзья</CardTitle>
              </CardHeader>
              <CardContent>
                {!data?.invited.length ? (
                  <p className="text-gray-500 text-sm text-center py-6">
                    Пока никто не зарегистрировался по вашей ссылке
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.invited.map((inv, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-neutral-900 border border-red-500/10 rounded-lg px-4 py-3"
                      >
                        <div>
                          <p className="text-white text-sm font-medium">{inv.name || inv.email}</p>
                          <p className="text-gray-500 text-xs">
                            Регистрация {new Date(inv.created_at).toLocaleDateString("ru-RU")}
                          </p>
                        </div>
                        {inv.has_paid ? (
                          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                            Бонус начислен
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            Ожидает оплаты
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
