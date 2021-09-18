require('dotenv').config()

import { credentialShape, didShape, doubleDidShape, presentationShape, unsginedDidShape, unsignedShape } from '../debug/utils/shapes'
import { TestUtil as Util } from '../debug/utils/wallet'
import {
  EntityIdentity,
  RequestBundle,
  ClaimBundle
} from '../index'
import { Presentation } from '@owlmeans/regov-ssi-core'

import util from 'util'
util.inspect.defaultOptions.depth = 8


let ctx: {
  alice: Util.Wallet
  bob: Util.Wallet
  charly: Util.Wallet
  claimed?: ClaimBundle<Util.TestClaim>
  response?: Presentation<EntityIdentity | Util.TestCredential>
}

beforeAll(async () => {
  ctx = {
    alice: await Util.Wallet.setup('alice'),
    bob: await Util.Wallet.setup('bob'),
    charly: await Util.Wallet.setup('bob'),
  }

  await ctx.alice.produceIdentity()
  await ctx.bob.produceIdentity()
  await ctx.charly.produceIdentity()
})

describe('Credential helpers', () => {
  it('setups trust relationshop between identities', async () => {
    const request = await ctx.bob.requestIdentity()
    const valid = await ctx.charly.validateRequest(request)
    expect(valid).toBe(true)

    const response = await ctx.charly.provideIdentity(request)
    const [resValid] = await ctx.bob.validateIdentityResponse(response)
    expect(resValid).toBe(true)

    await ctx.bob.trustIdentity(response)
    await ctx.alice.trustIdentity(response)
  })

  it('claims credentials', async () => {
    ctx.claimed = await ctx.alice.claimTestDoc([
      {
        key: 'testdoc1',
        comment: 'nice doc for alice'
      },
      {
        id: 'testdoc2',
        description: 'not very nice doc for alice'
      }
    ])

    expect(ctx.claimed).toMatchSnapshot({
      ...presentationShape,
      verifiableCredential: [
        {
          ...credentialShape,
          credentialSubject: {
            data: {
              identity: credentialShape
            },
            did: didShape
          }
        },
        {
          ...credentialShape,
          credentialSubject: {
            data: {
              credential: unsignedShape
            },
            did: unsginedDidShape
          }
        },
        {
          ...credentialShape,
          credentialSubject: {
            data: {
              credential: unsignedShape
            },
            did: unsginedDidShape
          }
        }
      ]
    })
  })

  it('offers credentials', async () => {
    if (!ctx.claimed) {
      throw new Error('No claim from previous step')
    }
    const { result, claims } = await ctx.charly.unbundleClaim(ctx.claimed)

    expect(result).toBe(true)

    const offer = await ctx.charly.signClaims(claims)

    expect(offer).toMatchSnapshot({
      ...presentationShape,
      verifiableCredential: [
        {
          ...credentialShape,
          credentialSubject: {
            data: {
              identity: credentialShape
            },
            did: didShape
          }
        },
        {
          ...credentialShape,
          credentialSubject: {
            data: {
              credential: credentialShape
            },
            did: doubleDidShape
          }
        },
        {
          ...credentialShape,
          credentialSubject: {
            data: {
              credential: credentialShape
            },
            did: doubleDidShape
          }
        }
      ]
    })

    await ctx.alice.storeOffer(offer)
  })

  it('requests credentials', async () => {
    const request = await ctx.bob.requestCreds()

    const verified = await ctx.alice.validateRequest(request)
    expect(verified).toBe(true)

    ctx.response = await ctx.alice.provideCreds(request)
    expect(ctx.response).toMatchSnapshot({
      ...presentationShape,
      verifiableCredential: [
        {
          ...credentialShape,
          credentialSubject: {
            data: {
              identity: credentialShape
            },
            did: didShape
          }
        },
        credentialShape,
        {
          ...credentialShape,
          credentialSubject: {
            data: {
              did: doubleDidShape
            }
          }
        },
        credentialShape,
        {
          ...credentialShape,
          credentialSubject: {
            data: {
              did: doubleDidShape
            }
          }
        }
      ]
    })
  })

  it('verifies credentials', async () => {
    if (!ctx.response) {
      throw new Error('No response from previous step')
    }

    const verified = await ctx.bob.validateResponse(ctx.response)
    expect(verified).toBe(true)
  })
})