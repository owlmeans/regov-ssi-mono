require('dotenv').config()

import { TestUtil as Util } from '../debug/utils/wallet'
import { capabilityDid, capabilityShape, entityShape, govrnanceShape } from '../debug/utils/shapes'
import { Presentation } from '@owlmeans/regov-ssi-core'
import { CapabilityCredential, ClaimCapability, OfferCapability } from '../governance/types'
import {
  credentialShape,
  didShape,
  doubleDidShape,
  keyLessDoubleDidShape,
  presentationShape,
  satelliteShape
} from '@owlmeans/regov-ssi-agent/src/debug/utils/shapes'
import {
  EntityIdentity,
  OfferBundle
} from '@owlmeans/regov-ssi-agent'

import util from 'util'
util.inspect.defaultOptions.depth = 8


let ctx: {
  alice: Util.Wallet
  bob: Util.Wallet
  charly: Util.Wallet
  dan: Util.Wallet
  gov?: Util.GovCapabilityPresentation
}

beforeAll(async () => {
  ctx = {
    alice: await Util.Wallet.setup('alice'),
    bob: await Util.Wallet.setup('bob'),
    charly: await Util.Wallet.setup('charly'),
    dan: await Util.Wallet.setup('dan'),
  }

  await ctx.alice.produceIdentity()
  await ctx.bob.produceIdentity()
  await ctx.charly.produceIdentity()
  await ctx.dan.produceIdentity()

  const identity = await ctx.charly.provideIdentity()

  await ctx.alice.trustIdentity(identity)
  await ctx.bob.trustIdentity(identity)
  await ctx.dan.trustIdentity(identity)
})

describe('Capability helpers', () => {
  it('allow to self issue gavernance', async () => {
    const [governance] = await ctx.charly.selfIssueGovernance(await ctx.charly.provideIdentity())
    expect(governance.credential).toMatchSnapshot(govrnanceShape)
  })

  it('allow to request governance capability', async () => {
    const request = await ctx.bob.requestGovernance()
    ctx.gov = await ctx.charly.responseGovernance(request)
    expect(ctx.gov).toMatchSnapshot({
      ...presentationShape,
      verifiableCredential: [
        entityShape,
        govrnanceShape,
        satelliteShape
      ]
    })
  })

  it('allow to claim capability', async () => {
    if (!ctx.gov) {
      throw new Error('No gov capability from previous test')
    }
    const claim = await ctx.bob.claimCapability(
      ctx.gov, Util.CRED_TYPE, {
      description: 'Test capability 1',
      info: 'Info for capability 1'
    })

    const offer = await ctx.charly.signCapability(claim)
    expect(offer).toMatchSnapshot({
      ...presentationShape,
      verifiableCredential: [
        entityShape,
        {
          ...credentialShape,
          credentialSubject: {
            chain: [
              didShape,
              didShape
            ],
            did: capabilityDid,
            data: {
              credential: capabilityShape
            }
          }
        }
      ]
    })

    await ctx.bob.storeCapability(offer)
  })

  it('allow to claim credential by capability', async () => {
    const claim = await ctx.alice.claimCapabilityCreds(
      Util.CRED_TYPE,
      [{
        description: 'Alice cred',
        info: 'Capability based cred for Alice'
      }]
    )

    const offer = await ctx.bob.offerCapabilityCreds(claim)
    expect(offer).toMatchSnapshot({
      ...presentationShape,
      verifiableCredential: [
        entityShape,
        {
          ...credentialShape,
          credentialSubject: {
            capability: capabilityShape,
            chain: [
              capabilityDid, //keyLessDoubleDidShape,
              didShape
            ],
            did: doubleDidShape,
            data: {
              credential: credentialShape
            }
          }
        }
      ]
    })

    await ctx.alice.storeCapabilityCreds(offer)
  })

  it('allow to request capability based credentials', async () => {
    const request = await ctx.dan.requestCreds(Util.CRED_TYPE)
    const response = await ctx.alice.provideCredsByCaps(request)
    expect(response).toMatchSnapshot({
      ...presentationShape,
      verifiableCredential: [
        entityShape,
        credentialShape,
        {
          ...satelliteShape,
          credentialSubject: {
            data: {
              did: keyLessDoubleDidShape
            }
          }
        }
      ]
    })
    const result = await ctx.dan.validateResponse<Util.TestCredential>(response)
    expect(result).toBe(true)
  })
})