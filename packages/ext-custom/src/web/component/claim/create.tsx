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

import React, { FunctionComponent } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Extension } from "@owlmeans/regov-ssi-core"
import { ClaimNavigator, CredentialSelector, FormMainAction, PrimaryForm, useNavigator, useRegov, WalletFormProvider } from "@owlmeans/regov-lib-react"

import { CustomDescription, UseFieldAt } from "../../../custom.types"
import { buildForm, castHolderField } from "../helper/form"
import { InputsRenderer } from "../widget/inputs"
import { castSectionKey } from "../../utils/tools"
import { buildClaim } from './helpers'


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
    const claim = buildClaim({ navigator, methods, handler, descr, issuer: props.issuer, ext, extensions })

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
