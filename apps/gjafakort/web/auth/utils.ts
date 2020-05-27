import jwtDecode from 'jwt-decode'
import cookies from 'next-cookies'

export const COOKIE_KEY = 'gjafakort.token'

export type DecodedToken = {
  readonly exp: number
  readonly csrfToken: string
}

type CookieContext = { req?: { headers: { cookie?: string } } }

export const getAccessToken = (ctx: CookieContext) => {
  return cookies(ctx || {})[COOKIE_KEY]
}

export const decodeToken = (ctx: CookieContext): DecodedToken | null => {
  const token = getAccessToken(ctx)

  if (!token) {
    return null
  }

  let decodedToken = null
  try {
    decodedToken = jwtDecode(token)
    // eslint-disable-next-line no-empty
  } catch {}

  return decodedToken
}

export const isAuthenticated = (ctx: CookieContext) => {
  const { exp = 0 } = decodeToken(ctx) || {}
  return new Date() < new Date(exp * 1000)
}
