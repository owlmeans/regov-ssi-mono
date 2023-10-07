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

import { BASIC_IDENTITY_TYPE, DIDCommConnectMeta, getDIDCommUtils } from '@owlmeans/regov-comm'
import { BasicNavigator, ClaimNavigator, trySubmit, UIExtensionRegistry } from '@owlmeans/regov-lib-react'
import { DIDDocument, ERROR_NO_IDENTITY, Extension, Identity, normalizeValue, WalletHandler } from '@owlmeans/regov-ssi-core'
import { UseFormReturn } from 'react-hook-form'
import { CustomDescription, DefaultCredential, DefaultPresentation, UseFieldAt } from '../../../custom.types'
import { ERROR_WIDGET_AUTHENTICATION } from '../../ui.types'
import { getCredential } from '../../utils/cred'
import { makeClaimPreviewPath } from '../../utils/router'
import { castSectionKey } from '../../utils/tools'

export const buildClaim: ClaimBuilder = ({
  navigator, methods, handler, descr, issuer, ext, extensions
}) => trySubmit(
  { navigator, methods, errorField: `${castSectionKey(descr)}.alert` },
  async (_, data) => {
    if (!handler.wallet) {
      throw ERROR_WIDGET_AUTHENTICATION
    }
    const sectionData = data[castSectionKey(descr)]
    const subject = sectionData[UseFieldAt.CLAIM_CREATE] as Record<string, any>
    const identity = handler.wallet.getIdentityCredential(data.holder)
    if (!identity) {
      throw ERROR_NO_IDENTITY
    }
    const factory = ext.getFactory(descr.mainType)
    const cred = await factory.build(handler.wallet, {
      extensions: extensions?.registry, identity, subjectData: { 
        ...Object.fromEntries(Object.entries(subject).map(([key, value]) => [key, `${value}`.trim()]))
      },
    })
    const claim = await factory.claim(handler.wallet, { unsignedClaim: cred })
    await handler.wallet.getClaimRegistry().addCredential(claim)
    handler.notify()
    if (navigator.success) {
      navigator.success({
        path: makeClaimPreviewPath(descr, claim.id), id: claim.id, issuer, descr
      })
    }
  }
)

export const buildClaimSend: ClaimSendBuilder = ({
  navigator, methods, handler, claim, descr, sectionKey, errorField
}) => trySubmit(
  { navigator, methods, errorField, onError: async () => true },
  async (_, data) => {
    if (!handler.wallet) {
      throw ERROR_WIDGET_AUTHENTICATION
    }
    const issuer = data[sectionKey].claim_preview.issuer
    if (!handler.wallet.did.helper().isDIDId(issuer)) {
      throw new Error('invalid_did')
    }

    const cred = getCredential(descr, claim) as DefaultCredential
    const identity = normalizeValue(cred.evidence)
      .find(cred => cred && cred.type.includes(BASIC_IDENTITY_TYPE)) as Identity

    const conn: DIDCommConnectMeta = {
      allowAsync: true,
      recipientId: issuer,
      sender: handler.wallet.did.helper().isDIDDocument(identity.holder)
        ? identity.holder
        : identity.issuer as DIDDocument
    }

    const connection = getDIDCommUtils(handler.wallet)
    await connection.send(await connection.connect(conn), claim)

    await navigator.home()
  }
)

export type ClaimBuilder = <Data extends {}>(
  params: {
    navigator: ClaimNavigator
    methods: UseFormReturn
    handler: WalletHandler
    descr: CustomDescription
    ext: Extension
    extensions?: UIExtensionRegistry
    issuer?: string
  }
) => (data: Data) => Promise<void> 

export type ClaimSendBuilder = <Data extends {}>(
  params: {
    navigator: BasicNavigator
    methods: UseFormReturn
    handler: WalletHandler
    claim: DefaultPresentation
    descr: CustomDescription
    sectionKey: string
    errorField: string
  }
) => (data: Data) => Promise<void>
