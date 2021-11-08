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
  REGISTRY_SECTION_PEER,
  REGISTRY_TYPE_CLAIMS
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
import {
  Capability,
  CapabilityDoc,
  CapabilityExt,
  capabilityHolderHelper,
  capabilityIssuerHelper,
  CAPABILITY_CREDENTIAL_TYPE,
  CREDENTIAL_WITHSOURCE_TYPE,
  REGISTRY_TYPE_CAPABILITY
} from "../../index"
import { capabilityVerifierHelper, ClaimCapability, OfferCapability } from "../../credential"
import { DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION, DIDPURPOSE_VERIFICATION } from "@owlmeans/regov-ssi-did"


export namespace TestUtil {
  export const CAPABILITY_TEST_CREDENTIAL_TYPE = 'TestCapabilityCredential'

  export const GOVERNANCE_CAPABILITY_TYPE = 'GovernanceCapability'

  export const ORGANIZATION_CAPABILITY_TYPE = 'OrganizationCapability'

  export const MEMBERSHIP_CAPABILITY_TYPE = 'MembershipCapability'

  export const MEMBERSHIP_CREDENTIAL_TYPE = 'MembershipCredential'

  export type CapabilityTestParams = {
    name: string
    description?: string
  }

  export type GovCapabilityPresentation = Presentation<EntityIdentity>

  export const CRED_TYPE = 'TestCapabilityBasedCredential1'

  export type TestCredential = Credential<CredentialSubject>

  export type TestClaim = ClaimCredential<ClaimSubject<
    UnsignedCredential<CredentialSubject>
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

    async requestGovernance() {
      const req = await verifierCredentialHelper(this.wallet).request()
        .build({
          '@type': GOVERNANCE_CAPABILITY_TYPE,
          source: REGISTRY_TYPE_CAPABILITY
        })

      return await verifierCredentialHelper(this.wallet).request().bundle([req])
    }

    async responseGovernance(request: RequestBundle) {
      const { requests } = await holderCredentialHelper(this.wallet)
        .request().unbundle(request)

      return await holderCredentialHelper<
        CapabilityDoc, CapabilityExt, Capability
      >(this.wallet).response().build(requests, request)
    }

    async claimOrganization(name: string) {
      const claim = await capabilityHolderHelper(this.wallet).claim({
        type: [ORGANIZATION_CAPABILITY_TYPE],
        extension: {
          schema: [
            { type: [CAPABILITY_CREDENTIAL_TYPE, MEMBERSHIP_CAPABILITY_TYPE] },
            {
              type: [MEMBERSHIP_CREDENTIAL_TYPE],
              ctxSchema: {
                schema: 'https://schema.org/',
                role: { '@id': 'scm:role', '@type': 'schema:Text' },
                organziationDid: { '@id': 'scm:organziationDid', '@type': '@id' },
                organziation: { '@id': 'scm:organziation', '@type': 'schema:Text' },
                source: { '@id': 'scm:source', '@type': 'VerifiableCredential' },
                // @TODO here should be proper reference to DID structure as type
                sourceDid: { '@id': 'scm:sourceDid', '@type': '@json' }
              }
            }
          ]
        }
      }).build({ name: `${name} Organization` })

      const bundle = await holderCredentialHelper<CapabilityDoc, CapabilityExt, Capability>(this.wallet)
        .bundle().build([claim])

      await holderCredentialHelper<CapabilityDoc, CapabilityExt, Capability>(this.wallet)
        .claim({ type: ORGANIZATION_CAPABILITY_TYPE }).register(bundle)

      return bundle
    }

    async selfIssueGovernance(idPresentation: Presentation<EntityIdentity>) {
      const identity = identityHelper(this.wallet).getIdentity()
      const claim = await capabilityHolderHelper(this.wallet).claim({
        type: [GOVERNANCE_CAPABILITY_TYPE],
        extension: { schema: { type: '*' } }
      }).build(
        { name: `Root Governance` },
        {
          didPurposes: [
            DIDPURPOSE_VERIFICATION,
            DIDPURPOSE_AUTHENTICATION,
            DIDPURPOSE_ASSERTION
          ]
        }
      )

      const offer = await capabilityIssuerHelper(this.wallet).claim(identity.identity).signClaim(claim)
      const offerBundle = await issuerCredentialHelper
        <CapabilityDoc, CapabilityExt, Capability>(this.wallet).bundle().build([offer])

      return await holderCredentialHelper<CapabilityDoc, CapabilityExt, Capability>(this.wallet)
        .bundle().store(offerBundle, REGISTRY_TYPE_CAPABILITY)
    }

    async claimCapability(
      type: string,
      doc: CapabilityTestParams
    ) {
      const claim = await capabilityHolderHelper(this.wallet).claim({
        type: [MEMBERSHIP_CAPABILITY_TYPE],
        extension: {
          schema: [
            {
              type: [MEMBERSHIP_CREDENTIAL_TYPE],
              ctxSchema: {
                schema: 'https://schema.org/',
                role: { '@id': 'scm:role', '@type': 'schema:Text' },
                organziationDid: { '@id': 'scm:organziationDid', '@type': '@id' },
                organziation: { '@id': 'scm:organziation', '@type': 'schema:Text' },
                source: { '@id': 'scm:source', '@type': 'VerifiableCredential' },
                // @TODO here should be proper reference to DID structure as type
                sourceDid: { '@id': 'scm:sourceDid', '@type': '@json' }
              }
            }
          ]
        }
      }).build(doc)

      const bundle = await holderCredentialHelper<CapabilityDoc, CapabilityExt, Capability>(this.wallet)
        .bundle().build([claim])

      await holderCredentialHelper<CapabilityDoc, CapabilityExt, Capability>(this.wallet)
        .claim({ type: MEMBERSHIP_CAPABILITY_TYPE }).register(bundle)

      return bundle
    }

    async signCapability(claimPres: Presentation<ClaimCapability>, type = GOVERNANCE_CAPABILITY_TYPE) {
      const { result, claims, entity }
        = await issuerCredentialHelper(this.wallet)
          .bundle<ClaimCapability, OfferCapability>().unbudle(claimPres)

      const capabilities = await this.wallet.getRegistry(REGISTRY_TYPE_CAPABILITY)
        .lookupCredentials(type)

      if (capabilities.length < 1) {
        throw new Error('No governance capability to offer crednetial')
      }
      const capability = capabilities.shift()
      if (!capability) {
        throw new Error('No governance capability to offer crednetial')
      }

      const offers = await Promise.all(claims.map(
        async claim => await capabilityIssuerHelper(this.wallet)
          .claim(capability.credential).signClaim(claim)
      ))

      return await issuerCredentialHelper(this.wallet)
        .bundle<ClaimCapability, OfferCapability>().build(offers)
    }

    async storeCapability(offerBundle: OfferBundle<OfferCapability>) {
      const { result, errors } = await holderCredentialHelper<
        CapabilityDoc, CapabilityExt, Capability
      >(this.wallet).bundle().unbudle(offerBundle, true)

      if (!result) {
        throw new Error('Invalid bundle with capability')
      }

      return await holderCredentialHelper<
        CapabilityDoc, CapabilityExt, Capability
      >(this.wallet).bundle().store(offerBundle, REGISTRY_TYPE_CAPABILITY)
    }

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