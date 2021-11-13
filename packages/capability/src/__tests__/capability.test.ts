require('dotenv').config()

import { TestUtil as Util } from '../debug/utils/wallet'
import {
  capaiblityDoubleDid,
  membershipCapabilityShape,
  orgCapaiblityShape,
} from '../debug/utils/shapes'
import {
  credentialShape,
} from '@owlmeans/regov-ssi-agent/src/debug/utils/shapes'

import {
  Capability,
  REGISTRY_TYPE_CAPABILITY
} from '..'

import util from 'util'
util.inspect.defaultOptions.depth = 8


let ctx: {
  alice: Util.Wallet
  bob: Util.Wallet
  charly: Util.Wallet
  dan: Util.Wallet
  fred: Util.Wallet
}

beforeAll(async () => {
  ctx = {
    alice: await Util.Wallet.setup('alice'),
    bob: await Util.Wallet.setup('bob'),
    charly: await Util.Wallet.setup('charly'),
    dan: await Util.Wallet.setup('dan'),
    fred: await Util.Wallet.setup('fred'),
  }

  await ctx.alice.produceIdentity()
  await ctx.bob.produceIdentity()
  await ctx.charly.produceIdentity()
  await ctx.dan.produceIdentity()
  await ctx.fred.produceIdentity()

  const identity = await ctx.charly.provideIdentity()

  await ctx.alice.trustIdentity(identity)
  await ctx.fred.trustIdentity(identity)
  await ctx.bob.trustIdentity(identity)
  await ctx.dan.trustIdentity(identity)

  await ctx.charly.selfIssueGovernance()
})

describe('Capability helpers', () => {
  it('allow to request organization-like capability from an authorithy', async () => {
    const claim = await ctx.fred.claimOrganization('Fredies')
    const offer = await ctx.charly.signCapability(claim)
    await ctx.fred.storeCapability(offer)

    const wraps = await ctx.fred.wallet.getRegistry(REGISTRY_TYPE_CAPABILITY).lookupCredentials(
      Util.ORGANIZATION_CAPABILITY_TYPE
    )

    expect(wraps[0].credential).toMatchSnapshot(orgCapaiblityShape)
  })

  it('allow to request some capability from an organization', async () => {
    const claim = await ctx.bob.claimCapability({
      name: 'Fredies\' - Membership offer capability',
      description: 'Allows to provide Fredies\' membership'
    })

    const wraps = await ctx.fred.wallet.getRegistry(REGISTRY_TYPE_CAPABILITY)
      .lookupCredentials(Util.ORGANIZATION_CAPABILITY_TYPE)

    if (!wraps[0]) {
      throw new Error('Fred doesn\'t have organizations')
    }

    const cap = wraps[0].credential as Capability

    const offer = await ctx.fred.signCapability<Util.MembershipDoc>(
      claim, Util.ORGANIZATION_CAPABILITY_TYPE,
      {
        organization: cap.credentialSubject.data.name,
        organziationDid: cap.id
      }
    )

    const creds = await ctx.bob.storeCapability(offer)

    expect(creds[0].credential).toMatchSnapshot(membershipCapabilityShape)
  })

  it('allow to issue credentials based on capability', async () => {
    const claim = await ctx.alice.claimCapabilityCreds(
      Util.MEMBERSHIP_CREDENTIAL_TYPE, 'Volunteer'
    )

    const offer = await ctx.bob.offerCapabilityCreds(claim)

    const wraps = await ctx.alice.storeCapabilityCreds(offer)

    expect(wraps[0].credential).toMatchSnapshot(
      {
        ...credentialShape,
        credentialSubject: {
          data: {
            organziationDid: expect.any(String)
          },
          source: membershipCapabilityShape,
          sourceDid: capaiblityDoubleDid
        }
      }
    )
  })

  it('allow to request and verify chaind credentials', async () => {
    const request = await ctx.dan.requestCreds(Util.MEMBERSHIP_CREDENTIAL_TYPE)

    const response = await ctx.alice.provideCredsByCaps(request)

    const result = await ctx.dan.validateResponse<Util.MembershipCredential>(response)

    expect(result).toBe(true)
  })
})