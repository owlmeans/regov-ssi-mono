import { documentWarmer } from "@owlmeans/regov-ssi-core"


export const randomRequestSchema = {
  '@context': {
    '@version': 1.1,
    intendedIssuer: {
      '@id': "https://schema.owlmeans.com/random-request.json#issuer",
      '@container': '@set'
    },
  }
}

export const randomRequestUrl = 'https://schema.owlmeans.com/random-request.json'

documentWarmer(randomRequestUrl, JSON.stringify(randomRequestSchema))