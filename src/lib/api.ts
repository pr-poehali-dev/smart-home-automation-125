import func2url from "../../backend/func2url.json"

export const AUTH_URL = func2url.auth
export const BUILDS_URL = func2url.builds

export function getToken(): string | null {
  return localStorage.getItem("buildapk_token")
}

export function setToken(token: string) {
  localStorage.setItem("buildapk_token", token)
}

export function clearToken() {
  localStorage.removeItem("buildapk_token")
}

export function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { "X-Authorization": `Bearer ${token}` } : {}
}
