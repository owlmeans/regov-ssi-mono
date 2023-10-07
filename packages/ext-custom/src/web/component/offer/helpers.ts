/**
 *  Copyright 2023 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { DIDCommConnectMeta, getDIDCommUtils } from '@owlmeans/regov-comm'
import { BasicNavigator, trySubmit, UIExtensionRegistry } from '@owlmeans/regov-lib-react'
import { WalletHandler, Credential, ERROR_NO_IDENTITY, Extension, addToValue, DIDDocument, CredentialsRegistryWrapper, VALIDATION_KIND_OFFER, singleValue } from '@owlmeans/regov-ssi-core'
import { UseFormReturn } from 'react-hook-form'
import { CustomDescription, DefaultCredential, DefaultPresentation } from '../../../custom.types'
import { ERROR_OFFER_WITHOUT_CRED, ERROR_WIDGET_AUTHENTICATION } from '../../ui.types'
import { getCredential } from '../../utils/cred'
import { OfferFields } from './create'
import { AccpetFields } from './view'

export const buildOffer: OfferBuilder = ({
  navigator, methods, handler, credential, sectionKey, ext, claim, conn, descr, inboxRegistry, close
}) => trySubmit<OfferFields>(
  { navigator, methods, errorField: `${sectionKey}.alert`, onError: async () => true },
  async (_, data) => {
    if (!handler.wallet) {
      throw new Error(ERROR_WIDGET_AUTHENTICATION)
    }

    const unsigned: DefaultCredential = JSON.parse(JSON.stringify(credential))
    const identity = handler.wallet.getIdentityCredential(data[sectionKey].issuer)

    if (!identity) {
      throw new Error(ERROR_NO_IDENTITY)
    }

    const factory = ext.getFactory(descr.mainType)
    unsigned.evidence = addToValue(unsigned.evidence, identity)

    const offer = await factory.offer(handler.wallet, {
      claim, credential: unsigned,
      holder: unsigned.issuer as DIDDocument,
      cryptoKey: await handler.wallet.keys.getCryptoKey(),
      subject: {
        ...unsigned.credentialSubject,
        ...Object.fromEntries(Object.entries(data[sectionKey].offer_create).map(([key, value]) => [key, `${value}`.trim()]))
      },
      id: claim.id as string,
      challenge: claim.proof.challenge ?? '',
      domain: claim.proof.domain ?? ''
    })

    if (conn) {
      await getDIDCommUtils(handler.wallet).send(conn, offer)
      await inboxRegistry.removePeer(claim)
      handler.notify()
    }

    close && close()
  }
)

export const buildRefuse: RefuseBuilder = ({
  navigator, methods, handler, credential, sectionKey, ext, claim, conn, descr, inboxRegistry, close
}) => trySubmit<OfferFields>(
  { navigator, methods, errorField: `${sectionKey}.alert`, onError: async () => true },
  async (_, data) => {
    if (!handler.wallet) {
      throw new Error(ERROR_WIDGET_AUTHENTICATION)
    }

    const refused: DefaultCredential = JSON.parse(JSON.stringify(credential))
    const identity = handler.wallet.getIdentityCredential(data[sectionKey].issuer)

    if (!identity) {
      throw new Error(ERROR_NO_IDENTITY)
    }

    const factory = ext.getFactory(descr.mainType)

    const refuse = await factory.refuse(handler.wallet, {
      claim, credential: refused,
      holder: refused.issuer as DIDDocument,
      cryptoKey: await handler.wallet.keys.getCryptoKey(),
      subject: { ...refused.credentialSubject, ...data[sectionKey].offer_create },
      id: claim.id as string,
      challenge: claim.proof.challenge ?? '',
      domain: claim.proof.domain ?? ''
    })

    if (conn) {
      await getDIDCommUtils(handler.wallet).send(conn, refuse)
      await inboxRegistry.removePeer(claim)
      handler.notify()
    }

    close && close()
  }
)

export const buildAccept: AcceptBuilder = ({
  navigator, methods, handler, descr, extensions, sectionKey, offer, ext, purpose, inbox, close
}) => trySubmit<AccpetFields>(
  { navigator, methods, errorField: `${sectionKey}.alert`, onError: async () => true },
  async (_, data) => {
    if (!handler.wallet || !extensions) {
      throw new Error(ERROR_WIDGET_AUTHENTICATION)
    }

    const credential = getCredential(descr, offer)
    if (!credential) {
      throw new Error(ERROR_OFFER_WITHOUT_CRED)
    }
    const factory = ext.getFactory(descr.mainType)
    const offerCheckResult = await factory.validate(handler.wallet, {
      extensions: extensions.registry, presentation: offer,
      credential, kind: VALIDATION_KIND_OFFER
    })

    if (!offerCheckResult.valid) {
      const cause = singleValue(offerCheckResult.cause)
      const causeMsg = typeof cause === 'string' ? cause : cause?.message
      throw new Error(causeMsg || `${sectionKey}.${purpose}.error.unknown`)
    }

    const wrap = await handler.wallet.getCredRegistry().addCredential(credential)
    wrap.meta.title = data[sectionKey].meta_title

    await handler.wallet.getClaimRegistry().removeCredential(offer)
    await inbox.removePeer(offer)

    handler.notify()

    close && close()
  }
)

export const buildCancel: CancelBuilder = ({
  navigator, methods, sectionKey, handler, offer, inbox, close
}) => trySubmit<AccpetFields>(
  { navigator, methods, errorField: `${sectionKey}.alert`, onError: async () => true },
  async () => {
    if (!handler.wallet) {
      throw new Error(ERROR_WIDGET_AUTHENTICATION)
    }

    await handler.wallet.getClaimRegistry().removeCredential(offer)
    await inbox.removePeer(offer)

    handler.notify()

    close && close()
  }
)

export type OfferBuilder = <Data extends {}>(params: OfferProcessParams) => (data: Data) => Promise<void>

export type RefuseBuilder = <Data extends {}>(params: OfferProcessParams) => (data: Data) => Promise<void>

export type AcceptBuilder = <Data extends {}>(params: {
  navigator: BasicNavigator
  methods: UseFormReturn
  handler: WalletHandler
  descr: CustomDescription
  extensions?: UIExtensionRegistry
  sectionKey: string
  offer: DefaultPresentation
  purpose: string
  ext: Extension
  inbox: CredentialsRegistryWrapper
  close?: () => void
}) => (data: Data) => Promise<void>

export type CancelBuilder = <Data extends {}>(params: {
  navigator: BasicNavigator
  methods: UseFormReturn
  handler: WalletHandler
  sectionKey: string
  offer: DefaultPresentation
  inbox: CredentialsRegistryWrapper
  close?: () => void
}) => (data: Data) => Promise<void>

type OfferProcessParams = {
  navigator: BasicNavigator
  methods: UseFormReturn
  handler: WalletHandler
  descr: CustomDescription
  ext: Extension
  claim: DefaultPresentation
  sectionKey: string
  inboxRegistry: CredentialsRegistryWrapper
  credential?: Credential
  conn?: DIDCommConnectMeta
  close?: () => void
}
