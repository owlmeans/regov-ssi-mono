import { nodeCryptoHelper } from "@owlmeans/regov-ssi-common"
import {
  buildWalletWrapper,
  Presentation,
  Credential,
  CredentialSubject,
  WrappedDocument,
  UnsignedCredential,
  REGISTRY_TYPE_IDENTITIES,
  Identity,
  REGISTRY_SECTION_PEER
} from "@owlmeans/regov-ssi-core"
import {
  EntityIdentity,
  identityHelper,
  issuerCredentialHelper,
  holderCredentialHelper,
  verifierCredentialHelper,
  RequestBundle,
  ClaimCredential,
  ClaimSubject,
  OfferCredential,
  OfferSubject,
  OfferBundle,
  ClaimBundle,
  CREDENTIAL_SATELLITE_TYPE,
  SatelliteCredential,
} from "@owlmeans/regov-ssi-agent"


import { TestUtil as AgentTestUtil } from '@owlmeans/regov-ssi-agent/src/debug/utils/wallet'
import { capabilityHolderHelper, CAPABILITY_CREDENTIAL_TYPE, GOVERNANCE_CAPABILITY_TYPE } from "../.."


export namespace TestUtil {
  export const CAPABILITY_TEST_CREDENTIAL_TYPE = 'TestCapabilityCredential'

  export type CapabilityCredentialTestParams = TestDocPayload & TestDocExtension

  export type TestDocPayload = {
    description: string
  }

  export type TestDocExtension = {
    info: string
  }

  export type GovCapabilityPresentation = Presentation<EntityIdentity>

  export const CRED_TYPE = 'TestCapabilityBasedCredential1'

  export type TestCredential = Credential<CredentialSubject<
    WrappedDocument<TestDocPayload>, TestDocExtension
  >>

  export type TestClaim = ClaimCredential<ClaimSubject<
    UnsignedCredential<CredentialSubject<
      WrappedDocument<TestDocPayload>, TestDocExtension
    >>
  >>

  export type TestOffer = OfferCredential<OfferSubject<TestCredential>>

  export class Wallet extends AgentTestUtil.Wallet {

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
      return await identityHelper<AgentTestUtil.IdentityFields>(
        this.wallet,
        this.wallet.ssi.buildContext('identity', {
          xsd: 'http://www.w3.org/2001/XMLSchema#',
          firstname: { '@id': 'scm:firstname', '@type': 'xsd:string' },
          lastname: { '@id': 'scm:lastname', '@type': 'xsd:string' }
        })
      ).createIdentity(
        AgentTestUtil.IDENTITY_TYPE,
        {
          firstname: this.name,
          lastname: 'Lastname'
        },
      )
    }

    // async requestGovernance() {
    //   const req = await verifierCredentialHelper(this.wallet).request()
    //     .build({
    //       '@type': CREDENTIAL_GOVERNANCE_TYPE,
    //       source: REGISTRY_TYPE_CAPABILITY
    //     })

    //   return await verifierCredentialHelper(this.wallet).request().bundle([req])
    // }

    // async responseGovernance(request: RequestBundle) {
    //   const { requests } = await holderCredentialHelper(this.wallet)
    //     .request().unbundle(request)

    //   return await holderCredentialHelper<
    //     {}, {}, CapabilityCredential
    //   >(this.wallet).response().build(requests, request)
    // }

    // async claimGovernance(
    //   rootPresentation: Presentation<EntityIdentity | CapabilityCredential>
    // ) {
    //   const {
    //     entity: rootEntity,
    //     credentials
    //   } = await verifierCredentialHelper(this.wallet).response()
    //     .verify<CapabilityCredential | EntityIdentity>(rootPresentation)

    //   const identity = this.wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
    //     .getCredential()?.credential as Identity

    //   return await governanceCredentialHelper(this.wallet).claimGovernance(
    //     identity,
    //     {
    //       root: credentials[0],
    //       name: 'Organization Governance'
    //     }
    //   )
    // }

    async selfIssueGovernance(idPresentation: Presentation<EntityIdentity>) {
      // const identity = idPresentation.verifiableCredential[0].credentialSubject.data.identity
      const identity = identityHelper(this.wallet).getIdentity()
      const claim = await capabilityHolderHelper(this.wallet).claim({
        type: [GOVERNANCE_CAPABILITY_TYPE, CAPABILITY_CREDENTIAL_TYPE],
        extension: {
          schema: []
        }
      }).build(identity.identity, { name: 'Root Governance' })

      // const claim = await governanceCredentialHelper(this.wallet).claimGovernance(
      //   identity, { name: 'Root Governance' }
      // )

      // const offer = await governanceCredentialHelper(this.wallet).offer(claim)

      // const offerBundle = await issuerCredentialHelper(this.wallet)
      //   .bundle<ClaimCapability, OfferCapability>().build([offer])

      // return await holderCredentialHelper<
      //   CapabilityDocument,
      //   CapabilityExtension,
      //   CapabilityCredential,
      // >(
      //   this.wallet //, holderGovernanceVisitor(this.wallet)
      // ).bundle().store(offerBundle)
    }

    // async claimCapability(
    //   gov: Presentation<EntityIdentity | CapabilityCredential | SatelliteCredential>,
    //   type: string,
    //   doc: CapabilityCredentialTestParams
    // ) {
    //   const source = this.wallet.getRegistry(REGISTRY_TYPE_IDENTITIES).getCredential()?.credential
    //   if (!source) {
    //     throw new Error('No identity to claim for')
    //   }

    //   const root = gov.verifiableCredential.find(
    //     cap => cap.type.includes(CREDENTIAL_GOVERNANCE_TYPE)
    //   ) as CapabilityCredential
    //   if (!this.wallet.did.registry.peer.dids.find(wrap => wrap.did.id === root.id)) {
    //     const rootSat = gov.verifiableCredential.find(
    //       sat => sat.type.includes(CREDENTIAL_SATELLITE_TYPE)
    //     ) as SatelliteCredential

    //     this.wallet.did.addPeerDID(rootSat.credentialSubject.data.did)

    //     this.wallet.getRegistry(REGISTRY_TYPE_CAPABILITY).addCredential<
    //       CapabilitySubject, CapabilityCredential
    //     >(root, REGISTRY_SECTION_PEER)
    //   }

    //   const claim = await governanceCredentialHelper(this.wallet).claim(
    //     source,
    //     {
    //       root,
    //       name: 'Test Capability',
    //       type: [type, CAPABILITY_TEST_CREDENTIAL_TYPE]
    //     },
    //     {
    //       '@type': [type, CAPABILITY_TEST_CREDENTIAL_TYPE],
    //       subjectSchema: {
    //         // 'tcap': 'https://example.org/test/capability',
    //         description: { '@id': 'scm:description', '@type': 'xsd:string' },
    //         info: { '@id': 'scm:info', '@type': 'xsd:string' },
    //       },
    //       subjectProps: {
    //         payload: {
    //           description: doc.description
    //         },
    //         extension: {
    //           info: doc.info
    //         }
    //       }
    //     }
    //   )

    //   const claimPres = await holderCredentialHelper(this.wallet).bundle().build([claim])
    //   await holderCredentialHelper(this.wallet).claim({ type }).register(claimPres)

    //   return claimPres as Presentation<ClaimCapability>
    // }

    // async signCapability(claimPres: Presentation<ClaimCapability>) {
    //   const { result, claims, entity }
    //     = await issuerCredentialHelper(this.wallet)
    //       .bundle<ClaimCapability, OfferCapability>().unbudle(claimPres)

    //   const offers = await Promise.all(claims.map(
    //     async claim => await governanceCredentialHelper(this.wallet).offer(claim)
    //   ))

    //   return await issuerCredentialHelper(this.wallet)
    //     .bundle<ClaimCapability, OfferCapability>().build(offers)
    // }

    // async storeCapability(offerBundle: OfferBundle<OfferCapability>) {
    //   const { result } = await holderCredentialHelper<
    //     CapabilityDocument, CapabilityExtension,
    //     CapabilityCredential, OfferCapabilityExtension
    //   >(this.wallet, holderGovernanceVisitor(this.wallet))
    //     .bundle().unbudle(offerBundle)
    //   if (!result) {
    //     throw new Error('Invalid bundle with capability')
    //   }

    //   return await holderCredentialHelper<
    //     CapabilityDocument, CapabilityExtension,
    //     CapabilityCredential, OfferCapabilityExtension
    //   >(this.wallet, holderGovernanceVisitor(this.wallet))
    //     .bundle().store(offerBundle)
    // }

    // async claimCapabilityCreds(type: string, data: CapabilityCredentialTestParams[]) {
    //   /**
    //    * @TODO It should be built based on capability.
    //    */
    //   const claims = await Promise.all(data.map(
    //     async data => await holderCredentialHelper<
    //       TestDocPayload,
    //       TestDocExtension,
    //       TestCredential
    //     >(this.wallet)
    //       .claim({
    //         type,
    //         crdContext: {
    //           description: { '@id': 'scm:description', '@type': 'xsd:string' },
    //           info: { '@id': 'scm:info', '@type': 'xsd:string' },
    //         }
    //       }).build(
    //         { description: data.description },
    //         { extension: { info: data.info } }
    //       )
    //   ))

    //   const requestClaim = await holderCredentialHelper(this.wallet)
    //     .bundle<TestClaim>().build(claims)

    //   await holderCredentialHelper<TestDocPayload, TestDocExtension, TestCredential>(this.wallet)
    //     .claim({ type }).register(requestClaim)

    //   return requestClaim
    // }

    // async offerCapabilityCreds(claimRequest: ClaimBundle<TestClaim>) {
    //   const { result, claims } = await issuerCredentialHelper(this.wallet)
    //     .bundle<TestClaim, TestOffer>().unbudle(claimRequest)

    //   if (!result) {
    //     console.log(claimRequest)

    //     throw new Error('Capability request is broken')
    //   }

    //   const offers = await issuerCredentialHelper<
    //     TestDocPayload,
    //     TestDocExtension,
    //     TestCredential,
    //     ByCapabilityExtension
    //   >(this.wallet, issuerVisitor(this.wallet)).claim().signClaims(claims)

    //   return await issuerCredentialHelper(this.wallet)
    //     .bundle<TestClaim, TestOffer>().build(offers)
    // }

    // async storeCapabilityCreds(offer: OfferBundle<TestOffer>) {
    //   const { result } = await holderCredentialHelper<
    //     TestDocPayload,
    //     TestDocExtension,
    //     TestCredential,
    //     ByCapabilityExtension
    //   >(
    //     this.wallet,
    //     holderCapabilityVisitor<TestDocPayload, TestDocExtension>()(this.wallet)
    //   ).bundle().unbudle(offer)

    //   if (!result) {
    //     // console.log(offer)
    //     throw new Error('Offer is broken and can\'t be stored')
    //   }

    //   await holderCredentialHelper<
    //     TestDocPayload,
    //     TestDocExtension,
    //     TestCredential,
    //     ByCapabilityExtension
    //   >(
    //     this.wallet,
    //     holderCapabilityVisitor<TestDocPayload, TestDocExtension>()(this.wallet)
    //   ).bundle().store(offer)
    // }

    // async provideCredsByCaps(request: RequestBundle) {
    //   const { requests } = await holderCredentialHelper(this.wallet)
    //     .request().unbundle(request)

    //   return await holderCredentialHelper<
    //     TestDocPayload,
    //     TestDocExtension,
    //     TestCredential,
    //     ByCapabilityExtension
    //   >(this.wallet, holderCapabilityVisitor<
    //     TestDocPayload,
    //     TestDocExtension
    //   >()(this.wallet))
    //     .response().build(requests, request)
    // }

    // async validateResponse<Type extends Credential = TestCredential>(
    //   response: Presentation<EntityIdentity | Type>
    // ) {
    //   const { result } = await verifierCapabilityHelper<Type>(this.wallet)
    //     .response().verify(response)

    //   if (!result) {
    //     return false
    //   }

    //   return true
    // }
  }
}