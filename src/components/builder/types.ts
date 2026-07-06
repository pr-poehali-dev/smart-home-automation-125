export interface BuilderState {
  siteUrl: string
  appName: string
  packageName: string
  versionCode: string
  versionName: string
  iconUrl: string

  splashType: "animation" | "logo" | "full" | "mp4"
  splashColor: string
  splashGradient: boolean
  splashBehavior: string
  splashAssetUrl: string
  splashAssetName: string

  permCamera: boolean
  permLocation: boolean
  permMedia: boolean
  permVibration: boolean
  permPlayStoreApi: boolean

  statusBarColor: string
  orientation: "portrait" | "landscape" | "both"
  fullscreen: boolean
  navBarColor: string
  pinchZoom: boolean
  jsBridge: boolean
  jsBridgeScope: string
  resumeCallback: boolean
  disableCache: boolean
  kioskMode: boolean

  internalExternalLinks: boolean
  deepLinks: boolean
  setReferrer: boolean
  urlScheme: string
  webAuth: boolean
  allowHttp: boolean

  customCss: string
  customJs: string
  userAgent: string

  themeColor: string
  pushEnabled: boolean
  offlineEnabled: boolean
  pushProvider: "firebase" | "onesignal"
  oneSignalAppId: string
  oneSignalRestApiKey: string
  notificationIconSet: string
  notificationIconName: string

  uiTheme: "light" | "dark" | "system"
  uiCustomFont: boolean
  uiFontFamily: string
  uiLoaderStyle: "spinner" | "bar" | "none"

  adsEnabled: boolean
  adMobId: string
  iapEnabled: boolean

  fcmServerKey: string

  appLockEnabled: boolean
  screenshotDisabled: boolean

  supportWidgetEnabled: boolean
  supportWidgetUrl: string

  deviceSupport: "phone" | "tablet" | "both"

  iconPreset: string

  addedAddonIds: string[]
}

export const defaultBuilderState: BuilderState = {
  siteUrl: "",
  appName: "",
  packageName: "",
  versionCode: "1",
  versionName: "1.0",
  iconUrl: "",

  splashType: "animation",
  splashColor: "#1A1025",
  splashGradient: false,
  splashBehavior: "once",
  splashAssetUrl: "",
  splashAssetName: "",

  permCamera: false,
  permLocation: false,
  permMedia: false,
  permVibration: false,
  permPlayStoreApi: false,

  statusBarColor: "#FFFFFF",
  orientation: "portrait",
  fullscreen: false,
  navBarColor: "#FFFFFF",
  pinchZoom: false,
  jsBridge: true,
  jsBridgeScope: "all",
  resumeCallback: false,
  disableCache: false,
  kioskMode: false,

  internalExternalLinks: false,
  deepLinks: false,
  setReferrer: false,
  urlScheme: "",
  webAuth: false,
  allowHttp: false,

  customCss: "",
  customJs: "",
  userAgent: "",

  themeColor: "#ef4444",
  pushEnabled: false,
  offlineEnabled: false,
  pushProvider: "firebase",
  oneSignalAppId: "",
  oneSignalRestApiKey: "",
  notificationIconSet: "lucide",
  notificationIconName: "Bell",

  uiTheme: "system",
  uiCustomFont: false,
  uiFontFamily: "Inter",
  uiLoaderStyle: "spinner",

  adsEnabled: false,
  adMobId: "",
  iapEnabled: false,

  fcmServerKey: "",

  appLockEnabled: false,
  screenshotDisabled: false,

  supportWidgetEnabled: false,
  supportWidgetUrl: "",

  deviceSupport: "both",

  iconPreset: "default",

  addedAddonIds: [],
}

export type SectionId =
  | "info"
  | "splash"
  | "permissions"
  | "settings"
  | "links"
  | "overrides"
  | `addon-${string}`

export interface NavItem {
  id: SectionId
  label: string
  icon: string
}

export const mainSections: NavItem[] = [
  { id: "info", label: "Информация о приложении", icon: "Smartphone" },
  { id: "splash", label: "Заставка", icon: "Image" },
  { id: "permissions", label: "Разрешения приложения", icon: "ShieldCheck" },
  { id: "settings", label: "Настройки приложения", icon: "Settings" },
  { id: "links", label: "Обработка ссылок", icon: "Link2" },
  { id: "overrides", label: "Переопределения веб-сайта", icon: "MonitorSmartphone" },
]

export interface AddonItem {
  id: string
  label: string
  icon: string
  count: number
}

export const addonSections: AddonItem[] = [
  { id: "ui", label: "Пользовательский интерфейс", icon: "Palette", count: 3 },
  { id: "monetization", label: "Монетизация и платежи", icon: "Wallet", count: 2 },
  { id: "notifications", label: "Уведомления", icon: "Bell", count: 2 },
  { id: "security", label: "Безопасность и аутентификация", icon: "Lock", count: 1 },
  { id: "support", label: "Коммуникация и поддержка", icon: "MessageCircle", count: 1 },
  { id: "devices", label: "Устройства и оборудование", icon: "Cpu", count: 1 },
  { id: "icons", label: "Библиотека иконок", icon: "Grid3x3", count: 0 },
]