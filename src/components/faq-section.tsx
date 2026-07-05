import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQSection() {
  const faqs = [
    {
      question: "Нужно ли уметь программировать?",
      answer:
        "Нет. Достаточно указать ссылку на сайт и настроить иконку с названием — компилятор соберёт APK автоматически. Android Studio, SDK и код не требуются.",
    },
    {
      question: "Какие сайты можно превратить в приложение?",
      answer:
        "Практически любые: обычные сайты, интернет-магазины, лендинги, PWA и одностраничные приложения. Мы автоматически проверим совместимость перед сборкой.",
    },
    {
      question: "Сколько времени занимает сборка?",
      answer:
        "Как правило 2-5 минут. После настройки вы нажимаете «Собрать» и получаете готовый APK-файл, который можно сразу установить на устройство.",
    },
    {
      question: "Можно ли опубликовать приложение в Google Play?",
      answer:
        "Да. Мы формируем подписанный AAB-пакет по требованиям Google Play и даём пошаговую инструкцию по загрузке в консоль разработчика.",
    },
    {
      question: "Поддерживаются ли push-уведомления и офлайн-режим?",
      answer:
        "Да. Push-уведомления работают через Firebase, а офлайн-режим кэширует ресурсы, чтобы приложение запускалось и работало даже без интернета.",
    },
    {
      question: "Что будет, когда я обновлю сайт?",
      answer:
        "Контент приложения обновляется автоматически вместе с сайтом. Пересобирать APK нужно только при изменении иконки, названия или нативных настроек.",
    },
  ]

  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-orbitron">Частые вопросы</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-space-mono">
            Ответы на популярные вопросы о сборке APK, публикации в Google Play и возможностях платформы.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-red-500/20 mb-4">
                <AccordionTrigger className="text-left text-lg font-semibold text-white hover:text-red-400 font-orbitron px-6 py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 leading-relaxed px-6 pb-4 font-space-mono">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}