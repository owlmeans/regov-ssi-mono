import { nodeCryptoHelper } from "@owlmeans/regov-ssi-common"
import { DIDDocument } from "@owlmeans/regov-ssi-did"
import {
  buildWalletWrapper,
  Identity,
  WalletWrapper,
  identityHelper,
  IdentitySubject,
  WrappedDocument
} from "../../index"

export namespace TestUtil {
  export type IdentityFields = {
    firstname: string
    lastname: string
  }

  export const IDENTITY_TYPE = 'TestUtilIdentity'

  export class Wallet {

    constructor(public wallet: WalletWrapper, public name: string) {
    }

    static async setup(name: string) {
      const walletUtil = new Wallet(await buildWalletWrapper(nodeCryptoHelper, '11111111',
        { name, alias: name },
        {
          prefix: process.env.DID_PREFIX,
          defaultSchema: 'https://owlmeans.com'
        }
      ), name)

      return walletUtil
    }

    async produceIdentity() {
      return await identityHelper<IdentityFields>(
        this.wallet,
        this.wallet.ctx.buildLDContext('identity', {
          xsd: 'http://www.w3.org/2001/XMLSchema#',
          firstname: { '@id': 'scm:firstname', '@type': 'xsd:string' },
          lastname: { '@id': 'scm:lastname', '@type': 'xsd:string' }
        })
      ).createIdentity(
        IDENTITY_TYPE,
        {
          firstname: this.name,
          lastname: 'Lastname'
        },
      )
    }

    async claimDocument() {
      return 
    }
  }
}