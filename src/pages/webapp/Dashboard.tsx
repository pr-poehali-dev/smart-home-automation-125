import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { BUILDS_URL, PAYMENTS_URL, authHeaders } from "@/lib/api"
import Icon from "@/components/ui/icon"
import DashboardNav from "@/components/dashboard/DashboardNav"
import NewBuildForm from "@/components/dashboard/NewBuildForm"
import BuildsList from "@/components/dashboard/BuildsList"
import { Build, Subscription } from "@/components/dashboard/types"

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading, logout } = useAuth()
  const { toast } = useToast()

  const [builds, setBuilds] = useState<Build[]>([])
  const [isLoadingBuilds, setIsLoadingBuilds] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth")
    }
  }, [authLoading, user, navigate])

  const loadBuilds = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true)
    else setIsLoadingBuilds(true)
    try {
      const res = await fetch(BUILDS_URL, { headers: { ...authHeaders() } })
      if (res.ok) {
        const data = await res.json()
        setBuilds(Array.isArray(data) ? data : data.builds || [])
        if (isManualRefresh) toast({ title: "Список обновлён" })
      }
    } finally {
      setIsLoadingBuilds(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (user) loadBuilds()
  }, [user])

  useEffect(() => {
    if (!user) return
    const hasActiveBuilds = builds.some((b) => b.status === "building" || b.status === "queued")
    if (!hasActiveBuilds) return
    const interval = setInterval(() => loadBuilds(), 10000)
    return () => clearInterval(interval)
  }, [user, builds])

  useEffect(() => {
    if (!user) return
    fetch(`${PAYMENTS_URL}?action=subscription`, { headers: { ...authHeaders() } })
      .then(async (res) => {
        if (!res.ok) return
        const data = await res.json()
        setSubscription(data)
      })
      .catch(() => {})
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
      <DashboardNav user={user} subscription={subscription} logout={logout} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
        <NewBuildForm onBuildCreated={(build) => setBuilds((prev) => [build, ...prev])} />

        <BuildsList
          builds={builds}
          isLoadingBuilds={isLoadingBuilds}
          isRefreshing={isRefreshing}
          loadBuilds={loadBuilds}
          setBuilds={setBuilds}
        />
      </main>
    </div>
  )
}