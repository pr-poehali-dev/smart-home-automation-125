export type AddonCategory =
  | "ui"
  | "monetization"
  | "notifications"
  | "analytics"
  | "security"
  | "support"
  | "devices"
  | "lifecycle"
  | "publishing"

export type AddonBadge = "premium" | "premium-start" | "included"

export type AddonAction = "add" | "settings" | "update" | "subscribe" | "contact" | "none"

export interface CatalogAddon {
  id: string
  category: AddonCategory
  icon: string
  iconColor?: string
  title: string
  description: string
  price?: string
  priceNote?: string
  badge?: AddonBadge
  action: AddonAction
  popular?: boolean
}

export const categoryLabels: Record<AddonCategory, string> = {
  ui: "Пользовательский интерфейс и навигация",
  monetization: "Монетизация и платежи",
  notifications: "Уведомления",
  analytics: "Аналитика и атрибуция",
  security: "Безопасность и аутентификация",
  support: "Коммуникация и поддержка",
  devices: "Устройства и оборудование",
  lifecycle: "Жизненный цикл приложения",
  publishing: "Издательские услуги",
}

export const categoryOrder: AddonCategory[] = [
  "ui",
  "monetization",
  "notifications",
  "analytics",
  "security",
  "support",
  "devices",
  "lifecycle",
  "publishing",
]

export const addonsCatalog: CatalogAddon[] = [
  {
    id: "touch-id",
    category: "ui",
    icon: "Fingerprint",
    iconColor: "text-teal-400",
    title: "Touch ID / Биометрическая аутентификация",
    description:
      "Интегрируйте Touch ID и аутентификацию по отпечатку пальца Android в ваше приложение. Интегрируется напрямую с любым существующим способом входа.",
    price: "4 900 ₽",
    priceNote: "один раз",
    badge: "premium",
    action: "add",
    popular: true,
  },
  {
    id: "social-login",
    category: "ui",
    icon: "Chrome",
    iconColor: "text-blue-400",
    title: "Вход через социальные сети",
    description:
      "Процесс авторизации осуществляется через соответствующие собственные SDK, а не через веб-представление. Поддерживаются Facebook, Google и другие.",
    price: "4 900 ₽",
    priceNote: "один раз",
    badge: "premium",
    action: "add",
    popular: true,
  },
  {
    id: "firebase-analytics",
    category: "ui",
    icon: "Flame",
    iconColor: "text-orange-400",
    title: "Google Firebase Analytics",
    description:
      "В основе Firebase лежит Google Analytics — решение для неограниченного анализа данных, доступное бесплатно. Аналитические отчеты в реальном времени.",
    price: "2 900 ₽",
    priceNote: "один раз",
    badge: "premium",
    action: "add",
    popular: true,
  },
  {
    id: "onboarding-screen",
    category: "ui",
    icon: "UserPlus",
    iconColor: "text-gray-300",
    title: "Экран регистрации",
    description:
      "Улучшите пользовательский опыт вашего приложения с помощью экранов адаптации! Это дополнение позволяет отображать серию на старте.",
    price: "2 900 ₽",
    priceNote: "один раз",
    badge: "premium",
    action: "add",
  },
  {
    id: "bottom-nav",
    category: "ui",
    icon: "PanelBottom",
    iconColor: "text-gray-300",
    title: "Расширенная нижняя панель навигации",
    description:
      "Расширенная нижняя панель навигации предлагает настраиваемый пользовательский интерфейс, позволяющий пользователям быстро переключаться между разделами.",
    badge: "included",
    action: "settings",
  },
  {
    id: "app-shortcuts",
    category: "ui",
    icon: "Share2",
    iconColor: "text-gray-300",
    title: "Ярлык приложения",
    description: "Добавьте ярлык приложения для быстрого доступа через значок приложения.",
    price: "2 900 ₽",
    priceNote: "один раз",
    badge: "premium",
    action: "add",
  },
  {
    id: "secondary-nav",
    category: "ui",
    icon: "LayoutGrid",
    iconColor: "text-blue-400",
    title: "Вторичная навигация",
    description:
      "Дополнительные навигационные меню играют решающую роль в улучшении пользовательского опыта, обеспечивая эффективный доступ к разделам.",
    price: "1 900 ₽",
    priceNote: "один раз",
    badge: "premium",
    action: "add",
  },
  {
    id: "app-review",
    category: "ui",
    icon: "Search",
    iconColor: "text-purple-400",
    title: "Обзор приложения",
    description:
      "Вы можете отобразить запрос на проверку в Play Store непосредственно в самом приложении, вместо перенаправления в Play Store.",
    price: "2 900 ₽",
    priceNote: "один раз",
    badge: "premium",
    action: "add",
  },
  {
    id: "custom-media-player",
    category: "ui",
    icon: "Smile",
    iconColor: "text-yellow-400",
    title: "Пользовательский медиаплеер",
    description:
      "Функциональность медиаплеера для Android отображается в панели уведомлений и включает элементы управления воспроизведением.",
    price: "4 900 ₽",
    priceNote: "один раз",
    action: "add",
  },
  {
    id: "offer-map",
    category: "ui",
    icon: "Smartphone",
    iconColor: "text-blue-400",
    title: "Карта предложений",
    description:
      "Это компонент пользовательского интерфейса, обычно используемый для представления пользователям специальных акций и информации.",
    price: "1 900 ₽",
    priceNote: "один раз",
    badge: "premium",
    action: "add",
  },
  {
    id: "dynamic-icon",
    category: "ui",
    icon: "Grid3x3",
    iconColor: "text-pink-400",
    title: "Динамическая иконка приложения",
    description:
      "Дополнение Dynamic App Icon позволяет пользователям динамически обновлять значки своих приложений. Полезно для сезонных акций.",
    price: "4 900 ₽",
    priceNote: "один раз",
    action: "add",
  },
  {
    id: "floating-action-menu",
    category: "ui",
    icon: "Smartphone",
    iconColor: "text-orange-400",
    title: "Плавающее меню действий",
    description:
      "Плавающее меню действий позволяет создавать настраиваемые меню действий в мобильных приложениях.",
    price: "1 900 ₽",
    priceNote: "один раз",
    action: "add",
  },
  {
    id: "multi-transport",
    category: "ui",
    icon: "letter:M",
    title: "Многоцелевой транспорт",
    description:
      "Модальное окно в полноэкранном режиме, отображаемое при запуске приложения — идеально подходит для стимулирования действий.",
    price: "4 900 ₽",
    priceNote: "один раз",
    badge: "premium-start",
    action: "update",
  },
  {
    id: "homescreen-widgets",
    category: "ui",
    icon: "LayoutGrid",
    iconColor: "text-red-400",
    title: "Виджеты главного экрана",
    description:
      "Добавьте в свое приложение нативные виджеты для главного экрана, которые помогут поддерживать узнаваемость вашего бренда.",
    price: "4 900 ₽",
    priceNote: "/год",
    action: "subscribe",
  },
  {
    id: "stripe",
    category: "monetization",
    icon: "CreditCard",
    iconColor: "text-indigo-400",
    title: "Бесконтактная оплата (терминал Stripe)",
    description:
      "Включите удобную функцию бесконтактной оплаты прямо в вашем мобильном приложении с помощью нашего дополнения на базе Stripe.",
    action: "contact",
  },
  {
    id: "iap",
    category: "monetization",
    icon: "Smartphone",
    iconColor: "text-blue-400",
    title: "Встроенные покупки (IAP)",
    description:
      "Интегрируйте API встроенных покупок в ваше Android-приложение, чтобы обеспечить оплату цифровых товаров внутри приложения.",
    price: "9 900 ₽",
    priceNote: "один раз",
    action: "add",
  },
  {
    id: "revenuecat",
    category: "monetization",
    icon: "letter:RC",
    title: "Доходы Cat",
    description:
      "Интегрируйте плагин RevenueCat в свои Android-приложения для удобного управления внутриигровыми покупками и подписками.",
    price: "9 900 ₽",
    priceNote: "один раз",
    action: "add",
  },
  {
    id: "meta-ads",
    category: "monetization",
    icon: "letter:M",
    title: "Мета-реклама (Facebook)",
    description:
      "Интеграция Meta (Facebook) Ads помогает монетизировать ваше приложение, показывая высокоцелевую рекламу из обширной рекламной сети.",
    price: "2 900 ₽",
    priceNote: "один раз",
    action: "add",
  },
  {
    id: "firebase-notif",
    category: "notifications",
    icon: "Flame",
    iconColor: "text-orange-400",
    title: "Уведомление Google Firebase",
    description:
      "Расширьте функциональность своего приложения, интегрировав Google Firebase Notifications для отправки push-уведомлений.",
    badge: "included",
    action: "settings",
  },
  {
    id: "custom-notif-sound",
    category: "notifications",
    icon: "Bell",
    iconColor: "text-amber-400",
    title: "Настраиваемый звук для уведомления",
    description:
      "Поддерживается для уведомлений OneSignal. Обычно используется для уведомлений о важных событиях, таких как статус доставки.",
    badge: "included",
    action: "settings",
  },
  {
    id: "intercom",
    category: "notifications",
    icon: "Keyboard",
    title: "Домофон",
    description: "Интегрируйте Intercom непосредственно в наши приложения для повышения вовлеченности пользователей.",
    price: "4 900 ₽",
    priceNote: "один раз",
    badge: "premium-start",
    action: "update",
  },
  {
    id: "sendbird",
    category: "notifications",
    icon: "letter:C",
    title: "Sendbird",
    description:
      "Интегрируйте встроенный SDK чата Sendbird в свое приложение для обмена сообщениями в реальном времени, push-уведомлений.",
    price: "4 900 ₽",
    priceNote: "один раз",
    badge: "premium-start",
    action: "add",
  },
  {
    id: "firebase-analytics-2",
    category: "analytics",
    icon: "Flame",
    iconColor: "text-orange-400",
    title: "Google Firebase Analytics",
    description:
      "В основе Firebase лежит Google Analytics — решение для неограниченного анализа данных, доступное бесплатно.",
    price: "2 900 ₽",
    priceNote: "один раз",
    badge: "premium",
    action: "add",
  },
  {
    id: "facebook-events",
    category: "analytics",
    icon: "Facebook",
    iconColor: "text-blue-500",
    title: "Мероприятия, связанные с приложением Facebook",
    description:
      "Собирайте аналитические данные, измеряйте эффективность рекламы в Facebook и создавайте аудитории для таргетинга.",
    price: "2 900 ₽",
    priceNote: "один раз",
    action: "add",
  },
  {
    id: "appsflyer",
    category: "analytics",
    icon: "Bird",
    iconColor: "text-sky-400",
    title: "AppsFlyer",
    description:
      "Нативный плагин AppsFlyer предоставляет функциональность для установки приложений, событий внутри приложений и записи пользователей.",
    price: "2 900 ₽",
    priceNote: "один раз",
    action: "add",
  },
  {
    id: "touch-id-2",
    category: "security",
    icon: "Fingerprint",
    iconColor: "text-teal-400",
    title: "Touch ID / Биометрическая аутентификация",
    description:
      "Интегрируйте Touch ID и аутентификацию по отпечатку пальца Android в ваше приложение. Интегрируется напрямую.",
    price: "4 900 ₽",
    priceNote: "один раз",
    badge: "premium",
    action: "add",
  },
  {
    id: "social-login-2",
    category: "security",
    icon: "Chrome",
    iconColor: "text-blue-400",
    title: "Вход через социальные сети",
    description:
      "Процесс авторизации осуществляется через соответствующие собственные SDK, а не через веб-представление.",
    price: "4 900 ₽",
    priceNote: "один раз",
    badge: "premium",
    action: "add",
  },
  {
    id: "truecaller",
    category: "security",
    icon: "letter:T",
    title: "Truecaller SDK",
    description:
      "Добавьте аутентификацию Truecaller в свое приложение с помощью единого JavaScript API. Работает как на Android, так и на iOS.",
    price: "2 900 ₽",
    priceNote: "один раз",
    action: "add",
  },
  {
    id: "device-phone-number",
    category: "security",
    icon: "letter:Д",
    title: "Номер телефона устройства",
    description:
      "Получает номер телефона, привязанный к учетной записи Google пользователя на устройстве. Использует встроенную функцию Android.",
    badge: "included",
    action: "none",
  },
  {
    id: "passcode-lock",
    category: "security",
    icon: "letter:П",
    title: "Кодовый замок",
    description:
      "Функция ввода пароля позволяет добавить дополнительный уровень безопасности вашему приложению.",
    price: "9 900 ₽",
    priceNote: "один раз",
    badge: "premium-start",
    action: "update",
  },
  {
    id: "auth0",
    category: "security",
    icon: "letter:A",
    title: "Auth0",
    description:
      "WebToNative теперь поддерживает Auth0. Упростите аутентификацию пользователей и управление идентификацией.",
    price: "4 900 ₽",
    priceNote: "один раз",
    action: "add",
  },
  {
    id: "intercom-2",
    category: "support",
    icon: "Keyboard",
    title: "Домофон",
    description: "Интегрируйте Intercom непосредственно в наши приложения для повышения вовлеченности пользователей.",
    price: "4 900 ₽",
    priceNote: "один раз",
    badge: "premium-start",
    action: "update",
  },
  {
    id: "sendbird-2",
    category: "support",
    icon: "letter:C",
    title: "Sendbird",
    description:
      "Интегрируйте встроенный SDK чата Sendbird в свое приложение для обмена сообщениями в реальном времени.",
    price: "4 900 ₽",
    priceNote: "один раз",
    badge: "premium-start",
    action: "add",
  },
  {
    id: "touch-id-3",
    category: "devices",
    icon: "Fingerprint",
    iconColor: "text-teal-400",
    title: "Touch ID / Биометрическая аутентификация",
    description:
      "Интегрируйте Touch ID и аутентификацию по отпечатку пальца Android в ваше приложение.",
    price: "4 900 ₽",
    priceNote: "один раз",
    badge: "premium",
    action: "add",
  },
  {
    id: "app-update",
    category: "devices",
    icon: "RefreshCw",
    iconColor: "text-violet-400",
    title: "Обновление приложения",
    description:
      "Эта функция позволяет пользователям обновлять приложение напрямую, не выходя из него. Когда в Play Store появится новая версия.",
    price: "2 900 ₽",
    priceNote: "один раз",
    badge: "premium",
    action: "add",
  },
  {
    id: "background-location",
    category: "devices",
    icon: "MapPin",
    iconColor: "text-teal-400",
    title: "Фоновое местоположение",
    description:
      "Получайте данные о местоположении устройства, пока приложение работает в фоновом режиме. Вы можете хранить эти данные.",
    price: "4 900 ₽",
    priceNote: "один раз",
    action: "add",
  },
  {
    id: "background-service",
    category: "devices",
    icon: "Smartphone",
    iconColor: "text-indigo-400",
    title: "Фоновое приложение как служба",
    description:
      "Запуск приложения в фоновом режиме в качестве службы. Это позволит поддерживать соединение через сокет даже при свернутом приложении.",
    price: "9 900 ₽",
    priceNote: "один раз",
    action: "add",
  },
  {
    id: "device-contacts",
    category: "devices",
    icon: "Contact",
    iconColor: "text-rose-400",
    title: "Контакты с коренным населением",
    description:
      "Получите все контакты с устройства. Вы можете использовать это для заполнения форм или отображения автозаполнения.",
    price: "2 900 ₽",
    priceNote: "один раз",
    action: "add",
  },
  {
    id: "haptic-feedback",
    category: "devices",
    icon: "letter:Ч",
    title: "Тактильная обратная связь",
    description:
      "Использование тактильной обратной связи может задействовать чувство осязания и привнести в ваше приложение или игру знакомство.",
    price: "2 900 ₽",
    priceNote: "один раз",
    action: "add",
  },
  {
    id: "tv-support",
    category: "devices",
    icon: "MonitorPlay",
    iconColor: "text-gray-300",
    title: "Поддержка ТВ",
    description:
      "Добавлена поддержка смарт-телевизоров на базе Android. Благодаря этой функции конвертированные приложения смогут работать на ТВ.",
    action: "contact",
  },
  {
    id: "bluetooth",
    category: "devices",
    icon: "Bluetooth",
    iconColor: "text-blue-400",
    title: "Подключение по Bluetooth",
    description:
      "Теперь вы можете легко обнаруживать находящиеся поблизости устройства Bluetooth прямо из приложения. Сканируйте, сопрягайте и...",
    price: "19 900 ₽",
    priceNote: "один раз",
    action: "add",
  },
  {
    id: "file-manager",
    category: "devices",
    icon: "FolderDown",
    iconColor: "text-blue-400",
    title: "Скачать файловый менеджер",
    description:
      "Управляйте всеми загруженными файлами без труда в одном удобном месте. Благодаря этой функции вы можете организовывать и...",
    price: "9 900 ₽",
    priceNote: "один раз",
    action: "add",
  },
  {
    id: "beacons",
    category: "devices",
    icon: "letter:Б",
    title: "Поддержка маяков",
    description:
      "Добавьте в свое мобильное приложение мощные возможности определения близости с помощью нашего дополнения для поддержки...",
    action: "contact",
  },
  {
    id: "own-storage",
    category: "devices",
    icon: "HardDrive",
    iconColor: "text-gray-300",
    title: "Собственное хранилище данных",
    description:
      "Приложение поддерживает сохранение настроек и данных непосредственно на устройство с использованием встроенных механизмов х...",
    price: "4 900 ₽",
    priceNote: "один раз",
    action: "add",
  },
  {
    id: "nfc-support",
    category: "devices",
    icon: "letter:Н",
    title: "Поддержка NFC (ближней бесконтактной связи).",
    description:
      "Считывайте и записывайте NFC-метки непосредственно из вашего веб-приложения на Android и iOS. Запускайте действия с NFC на ваш...",
    price: "9 900 ₽",
    priceNote: "один раз",
    badge: "premium-start",
    action: "update",
  },
  {
    id: "auto-launch",
    category: "devices",
    icon: "PlayCircle",
    iconColor: "text-emerald-400",
    title: "Автоматический запуск приложения",
    description:
      "Улучшите производительность своего приложения с помощью новой функции «Автоматический запуск приложения», разработанной для...",
    price: "2 900 ₽",
    priceNote: "один раз",
    action: "add",
  },
  {
    id: "app-update-lifecycle",
    category: "lifecycle",
    icon: "RefreshCw",
    iconColor: "text-violet-400",
    title: "Обновление приложения",
    description:
      "Эта функция позволяет пользователям обновлять приложение напрямую, не выходя из него. Когда в Play Store появится новая версия.",
    price: "2 900 ₽",
    priceNote: "один раз",
    badge: "premium",
    action: "add",
  },
  {
    id: "app-review-lifecycle",
    category: "lifecycle",
    icon: "Search",
    iconColor: "text-purple-400",
    title: "Обзор приложения",
    description:
      "Вы можете отобразить запрос на проверку в Play Store непосредственно в самом приложении, вместо перенаправления в Play Store. По...",
    price: "2 900 ₽",
    priceNote: "один раз",
    badge: "premium",
    action: "add",
  },
  {
    id: "background-service-lifecycle",
    category: "lifecycle",
    icon: "Smartphone",
    iconColor: "text-indigo-400",
    title: "Фоновое приложение как служба",
    description:
      "Запуск приложения в фоновом режиме в качестве службы. Это позволит поддерживать соединение через сокет даже при свернутом приложении.",
    price: "9 900 ₽",
    priceNote: "один раз",
    action: "add",
  },
  {
    id: "playstore-publishing",
    category: "publishing",
    icon: "PlayCircle",
    iconColor: "text-green-400",
    title: "Сервис публикации Playstore",
    description:
      "Разместите свое приложение в Google Play Store с нашей экспертной поддержкой по публикации. Комплексная помощь в публикации: в...",
    badge: "included",
    action: "settings",
  },
  {
    id: "amazon-appstore",
    category: "publishing",
    icon: "ShoppingBag",
    iconColor: "text-sky-400",
    title: "Сервис публикации приложений Amazon App Store",
    description:
      "Легко публикуйте свое приложение в Amazon Appstore с помощью нашей комплексной поддержки публикации. Это дополнение включ...",
    price: "4 900 ₽",
    priceNote: "один раз",
    action: "add",
  },
  {
    id: "samsung-galaxy-store",
    category: "publishing",
    icon: "Smartphone",
    iconColor: "text-pink-400",
    title: "Издательская служба Samsung Galaxy Store",
    description:
      "Благодаря нашей комплексной поддержке публикации, вы сможете без труда разместить свое приложение в Samsung Galaxy Store. Это д...",
    price: "4 900 ₽",
    priceNote: "один раз",
    action: "add",
  },
  {
    id: "huawei-publishing",
    category: "publishing",
    icon: "letter:华",
    title: "HUAWEI Publishing Services",
    description: "Аккаунт разработчика будет вашим. Мы создадим скриншоты приложения, если у вас их нет.",
    action: "contact",
  },
  {
    id: "xiaomi-publishing",
    category: "publishing",
    icon: "letter:X",
    title: "Издательская служба Xiaomi",
    description:
      "Разместите свое приложение в Xiaomi Store с нашей экспертной поддержкой по публикации. Комплексная помощь в публикации: выделе...",
    price: "4 900 ₽",
    priceNote: "один раз",
    action: "add",
  },
]