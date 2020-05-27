import { createHttpLink } from 'apollo-link-http'
import fetch from 'isomorphic-unfetch'

import { RequestsService } from '../services'

const isBrowser: boolean = process.browser

// Polyfill fetch() on the server (used by apollo-client)
if (!isBrowser) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(global as any).fetch = fetch
}

export default createHttpLink({
  uri: '/api/graphql',
  credentials: 'include',
  fetch: async (uri: string, options: object) => {
    const key = RequestsService.start()
    const response = await fetch(uri, options)
    RequestsService.stop(key)
    return response
  },
})
