import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Icon from "@/components/ui/icon"

const features = [
  {
    title: "Сборка за 5 минут",
    description: "Вставьте ссылку на сайт — и через пару минут получите готовый APK-файл. Без Android Studio, SDK и настройки окружения.",
    icon: "Zap",
    badge: "Быстро",
  },
  {
    title: "Push-уведомления",
    description: "Встроенная поддержка push-уведомлений через Firebase — возвращайте пользователей и повышайте вовлечённость.",
    icon: "Bell",
    badge: "Firebase",
  },
  {
    title: "Офлайн-режим",
    description: "Кэширование ресурсов позволяет приложению работать даже без интернета и мгновенно запускаться.",
    icon: "WifiOff",
    badge: "PWA",
  },
  {
    title: "Кастомизация под бренд",
    description: "Свой логотип, иконка, сплэш-экран и название приложения — полностью в вашем фирменном стиле.",
    icon: "Palette",
    badge: "Брендинг",
  },
  {
    title: "Публикация в Google Play",
    description: "Готовый подписанный AAB-пакет и пошаговая инструкция для быстрого размещения в Google Play.",
    icon: "Upload",
    badge: "Play Store",
  },
  {
    title: "Нативные функции",
    description: "Доступ к камере, геолокации, файлам и другим возможностям устройства прямо из вашего сайта.",
    icon: "Smartphone",
    badge: "Native API",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4 font-sans">Всё для нативного приложения</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Полный набор инструментов, чтобы превратить сайт в APK — без единой строки кода
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="glow-border hover:shadow-lg transition-all duration-300 slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-red-500">
                    <Icon name={feature.icon} size={32} fallback="Sparkles" />
                  </span>
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-card-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}