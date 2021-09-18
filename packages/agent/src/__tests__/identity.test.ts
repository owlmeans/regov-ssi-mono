require('dotenv').config()

import { credentialShape, didShape, presentationShape } from '../debug/utils/shapes'
import { TestUtil as Util } from '../debug/utils/wallet'
import {
  EntityIdentity,
  RequestBundle
} from '../index'
import { Presentation } from '@owlmeans/regov-ssi-core'

import util from 'util'
util.inspect.defaultOptions.depth = 8


let ctx: {
  alice: Util.Wallet
  bob: Util.Wallet
  requst?: RequestBundle
  response?: Presentation<EntityIdentity>
}

beforeAll(async () => {
  ctx = {
    alice: await Util.Wallet.setup('alice'),
    bob: await Util.Wallet.setup('bob'),
  }
})

describe('Identity helper', () => {
  it('produces Identity', async () => {
    const snapshotShape = {
      did: didShape,
      identity: credentialShape
    }

    const aliceIdentity = await ctx.alice.produceIdentity()
    expect(aliceIdentity).toMatchSnapshot(snapshotShape)

    const bobIdentity = await ctx.bob.produceIdentity()
    expect(bobIdentity).toMatchSnapshot(snapshotShape)
  })

  it('requests Identity', async () => {
    ctx.requst = await ctx.alice.requestIdentity()
    expect(ctx.requst).toMatchSnapshot({
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
        }
      ]
    })
  })

  it('provides Identity', async () => {
    if (!ctx.requst) {
      throw new Error('No request from previous step')
    }
    const isRequestValid = await ctx.bob.validateRequest(ctx.requst)
    expect(isRequestValid).toBe(true)

    ctx.response = await ctx.bob.provideIdentity(ctx.requst)
    expect(ctx.response).toMatchSnapshot({
      ...presentationShape,
      verifiableCredential: [
        {
          ...credentialShape,
          credentialSubject: {
            data: {
              identity: credentialShape,
            },
            did: didShape
          }
        }
      ]
    })
  })

  it('verifies provided Identity', async () => {
    if (!ctx.response) {
      throw new Error('No response from previous step')
    }
    const [isResValid, id] = await ctx.alice.validateIdentityResponse(ctx.response)
    expect(isResValid).toBe(true)
    expect(id).toMatchSnapshot({
      ...credentialShape,
      credentialSubject: {
        data: {
          identity: credentialShape
        },
        did: didShape
      }
    })
  })
})