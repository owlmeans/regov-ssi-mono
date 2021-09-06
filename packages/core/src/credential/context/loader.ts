import { DIDRegistryWrapper } from "@owlmeans/regov-ssi-did";


export const getDocumentLoader = (did: DIDRegistryWrapper) =>
  async (url: string): Promise<any> => {
    if (url.startsWith('did:')) {
      return {
        contextUrl: null,
        document: (did => {
          const newDid = JSON.parse(JSON.stringify(did))
          /**
           * @TODO It looks like theese guys doesn't conisdere more
           * sophistacted did structure... or I understand it wrong :)
           * Nevertheless, it should be fixed somewhere else
           */
          if (newDid.proof?.controller) {
            newDid.id = newDid.proof?.controller
          }

          return newDid
        })(await did.lookUpDid(url)),
        /**
          document: {
            '@context': [
              'https://w3id.org/security/v2',
              'https://w3id.org/did/v1'
            ],
            id: url,
            publicKey: [{
              id: `${url}#primary`,
              usage: 'signing',
              type: 'Secp256k1VerificationKey2018',
              publicKeyHex: Buffer.from(crypto.base58().decode(url.split(':')[2])).toString('hex')
            }],
            assertionMethod: [`${url}#primary`],
            authentication: [`${url}#primary`],
          },
         */
        documentUrl: url,
      }
    }

    const jsonld = require('jsonld')

    return jsonld.documentLoader(url)
  }