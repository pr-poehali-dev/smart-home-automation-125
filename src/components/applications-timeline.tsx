import { Timeline } from "@/components/ui/timeline"

export function ApplicationsTimeline() {
  const data = [
    {
      title: "Шаг 1. Укажите сайт",
      content: (
        <div>
          <p className="text-white text-sm md:text-base font-normal mb-6 leading-relaxed">
            Вставьте ссылку на ваш сайт или PWA. Компилятор автоматически проанализирует страницы,
            подтянет ресурсы и подготовит проект к сборке — от вас не требуется ничего технического.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Поддержка любого сайта, PWA и одностраничных приложений
            </div>
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Автоматическая проверка совместимости
            </div>
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Не нужен исходный код приложения
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Шаг 2. Настройте под бренд",
      content: (
        <div>
          <p className="text-white text-sm md:text-base font-normal mb-6 leading-relaxed">
            Загрузите иконку и сплэш-экран, задайте название и цвета, включите push-уведомления
            и офлайн-режим. Всё настраивается в удобном визуальном редакторе прямо в браузере.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Своя иконка, сплэш-экран и название
            </div>
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Push-уведомления и офлайн-режим
            </div>
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Доступ к камере, геолокации и файлам
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Шаг 3. Скачайте APK",
      content: (
        <div>
          <p className="text-white text-sm md:text-base font-normal mb-6 leading-relaxed">
            Нажмите «Собрать» — и через пару минут получите готовый подписанный APK и AAB-пакет.
            Устанавливайте на устройства или сразу публикуйте в Google Play.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Готовый APK и подписанный AAB за пару минут
            </div>
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Пошаговая инструкция для Google Play
            </div>
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Быстрая пересборка при обновлении сайта
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <section id="applications" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">Как это работает</h2>
          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            От ссылки на сайт до готового приложения в Google Play — всего три простых шага
            и никакого программирования.
          </p>
        </div>

        <div className="relative">
          <Timeline data={data} />
        </div>
      </div>
    </section>
  )
}