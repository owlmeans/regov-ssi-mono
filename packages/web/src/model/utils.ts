import { BASE_CREDENTIAL_SCHEMA } from "./types"

export const buildContext = (url?: string) => {
  return {
    '@version': 1.1,
    scm: `${BASE_CREDENTIAL_SCHEMA}${url ? `/${url}` : ''}#`,
    data: {
      '@id': 'scm:data',
      '@type': '@json'
    }
  }
}