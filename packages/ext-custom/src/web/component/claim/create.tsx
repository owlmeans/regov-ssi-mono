/**
 *  Copyright 2022 OwlMeans
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

import React, { FunctionComponent } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { ERROR_NO_IDENTITY, Extension } from "@owlmeans/regov-ssi-core"
import {
  ClaimNavigator, CredentialSelector, FormMainAction, PrimaryForm, trySubmit, useNavigator, 
  useRegov, WalletFormProvider
} from "@owlmeans/regov-lib-react"

import { CustomDescription, UseFieldAt } from "../../../custom.types"
import { buildForm, castHolderField } from "../helper/form"
import { InputsRenderer } from "../widget/inputs"
import { ERROR_WIDGET_AUTHENTICATION } from "../../ui.types"
import { castSectionKey } from "../../utils/tools"
import { makeClaimPreviewPath } from "../../utils/router"


export const ClaimCreate = (ext: Extension, descr: CustomDescription): FunctionComponent<ClaimCreateParams> =>
  (props) => {
    const { handler, extensions } = useRegov()
    const navigator = useNavigator<ClaimNavigator>()
    // Load identities
    const identities = handler.wallet?.getIdentityWrappers()
    const defaultId = handler.wallet?.getIdentityCredential()?.id || ''
    // Produce form methods object
    const [methods, fields] = buildForm(
      UseFieldAt.CLAIM_CREATE, descr, defaultId, useForm, useTranslation,
      { controllerField: 'issuer' }
    )

    // Create claim
    const claim = trySubmit(
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
          extensions: extensions?.registry, identity, subjectData: { ...subject },
        })
        const claim = await factory.claim(handler.wallet, { unsignedClaim: cred })
        await handler.wallet.getClaimRegistry().addCredential(claim)
        handler.notify()
        if (navigator.success) {
          navigator.success({ 
            path: makeClaimPreviewPath(descr, claim.id), id: claim.id, descr,
            issuer: props.issuer
          })
        }
      }
    )

    // Render fields
    return <WalletFormProvider {...methods}>
      <PrimaryForm {...fields}>
        {identities && <CredentialSelector {...fields} credentials={identities}
          defaultId={defaultId} field={castHolderField(descr)} />}
        <InputsRenderer purpose={UseFieldAt.CLAIM_CREATE} descr={descr} props={fields} />
        <FormMainAction {...fields} title={`${castSectionKey(descr)}.action.claim`}
          action={methods.handleSubmit(claim)} />
      </PrimaryForm>
    </WalletFormProvider>
  }

export type ClaimCreateParams = {
  issuer?: string
}
