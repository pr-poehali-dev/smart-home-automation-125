import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Icon from "@/components/ui/icon"
import { Subscription } from "./types"

interface User {
  id: number
  email: string
  name: string | null
}

interface Props {
  user: User
  subscription: Subscription | null
  logout: () => void
}

export default function DashboardNav({ user, subscription, logout }: Props) {
  const navigate = useNavigate()

  return (
    <nav className="border-b border-red-500/20 bg-black/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <h1 className="font-orbitron text-xl font-bold text-white">
          Build<span className="text-red-500">APK</span>
        </h1>
        <div className="flex items-center gap-3">
          {subscription ? (
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
              Тариф «{subscription.plan_name}»
            </Badge>
          ) : (
            <Button
              size="sm"
              onClick={() => navigate("/pricing")}
              className="bg-red-500 hover:bg-red-600 text-white border-0"
            >
              Оформить тариф
            </Button>
          )}
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 outline-none">
              <Avatar className="h-9 w-9 border border-red-500/30">
                <AvatarFallback className="bg-red-500/10 text-red-400 font-semibold">
                  {(user.name || user.email)[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Icon name="ChevronDown" size={16} className="text-gray-400 hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-neutral-950 border-red-500/20">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col">
                <span className="text-white font-medium truncate">{user.name || "Пользователь"}</span>
                <span className="text-gray-500 text-xs truncate">{user.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-red-500/10" />
            <DropdownMenuItem
              onClick={() => navigate("/dashboard")}
              className="text-gray-300 focus:bg-red-500/10 focus:text-white cursor-pointer"
            >
              <Icon name="LayoutGrid" size={16} className="mr-2" />
              Мои приложения
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/profile")}
              className="text-gray-300 focus:bg-red-500/10 focus:text-white cursor-pointer"
            >
              <Icon name="User" size={16} className="mr-2" />
              Мой профиль
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/notifications")}
              className="text-gray-300 focus:bg-red-500/10 focus:text-white cursor-pointer"
            >
              <Icon name="Bell" size={16} className="mr-2" />
              Уведомления
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/billing")}
              className="text-gray-300 focus:bg-red-500/10 focus:text-white cursor-pointer"
            >
              <Icon name="FileText" size={16} className="mr-2" />
              Платежные данные
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/referrals")}
              className="text-gray-300 focus:bg-red-500/10 focus:text-white cursor-pointer"
            >
              <Icon name="Gift" size={16} className="mr-2" />
              Приглашайте друзей и зарабатывайте!
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-red-500/10" />
            <DropdownMenuItem
              onClick={() => { logout(); navigate("/") }}
              className="text-gray-300 focus:bg-red-500/10 focus:text-white cursor-pointer"
            >
              <Icon name="LogOut" size={16} className="mr-2" />
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
