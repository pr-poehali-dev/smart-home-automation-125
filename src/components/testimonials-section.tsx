import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    name: "Анна Ковальски",
    role: "Основатель интернет-магазина Nova Shop",
    avatar: "/asian-woman-tech-developer.jpg",
    content:
      "Собрала приложение для магазина за один вечер без разработчика. Через неделю оно уже было в Google Play, а push-уведомления подняли повторные покупки.",
  },
  {
    name: "Маркус Уильямс",
    role: "Технический директор, Stellar Analytics",
    avatar: "/cybersecurity-expert-man.jpg",
    content:
      "Раньше на сборку и настройку APK уходили дни. С BuildAPK мы получаем готовый подписанный пакет за пару минут — сэкономили кучу времени команды.",
  },
  {
    name: "Елена Родригес",
    role: "Продуктовый маркетолог, EdTech-стартап",
    avatar: "/professional-woman-scientist.png",
    content:
      "Не пришлось нанимать мобильных разработчиков. Загрузила иконку, включила офлайн-режим — и наш веб-сервис превратился в полноценное Android-приложение.",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 px-6 bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-card-foreground mb-4 font-sans">Нам доверяют тысячи создателей</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Что говорят разработчики и владельцы бизнеса, которые уже собрали свои приложения
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="glow-border slide-up" style={{ animationDelay: `${index * 0.15}s` }}>
              <CardContent className="p-6">
                <p className="text-card-foreground mb-6 leading-relaxed italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-primary">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}