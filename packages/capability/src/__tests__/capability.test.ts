require('dotenv').config()

import { TestUtil as Util } from '../debug/utils/wallet'

import util from 'util'
import { govrnanceShape } from '../debug/utils/shapes'
import { Presentation } from '@owlmeans/regov-ssi-core'
import { CapabilityCredential } from '..'
util.inspect.defaultOptions.depth = 8


let ctx: {
  alice: Util.Wallet
  bob: Util.Wallet
  charly: Util.Wallet
  dan: Util.Wallet
  gov?: Presentation<CapabilityCredential>
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
  it ('allow to self issue gavernance', async () => {
    const [governance] = await ctx.charly.selfIssueGovernance(await ctx.charly.provideIdentity())
    expect(governance.credential).toMatchSnapshot(govrnanceShape)
  })

  it ('allow to request governance capability', async () => {
    const request = await ctx.bob.requestGovernance()
    const gov = await ctx.charly.responseGovernance(request)
    expect(gov).toMatchSnapshot()
  })
}) 