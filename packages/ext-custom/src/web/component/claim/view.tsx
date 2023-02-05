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
import {
  AlertOutput, BasicNavigator, FormMainAction, MainTextInput, PrimaryForm, trySubmit, useNavigator,
  useRegov, WalletFormProvider
} from "@owlmeans/regov-lib-react"
import { DIDDocument, Identity, normalizeValue, REGISTRY_TYPE_CLAIMS } from "@owlmeans/regov-ssi-core"
import { BASIC_IDENTITY_TYPE, DIDCommConnectMeta, getDIDCommUtils } from "@owlmeans/regov-comm"
import Grid from "@mui/material/Grid"

import { CustomDescription, DefaultCredential, DefaultPresentation, DefaultSubject, UseFieldAt } from "../../../custom.types"
import { castSectionKey } from "../../utils/tools"
import { useTranslation } from "react-i18next"
import { FieldsRenderer } from "../widget/fields"
import { getCredential, getSubject } from "../../utils/cred"
import { ERROR_WIDGET_AUTHENTICATION } from "../../ui.types"


export const ClaimView = (descr: CustomDescription): FunctionComponent<ClaimViewParams> =>
  (props) => {
    console.log(props)
    const { id } = props
    const { handler } = useRegov()
    const { t, i18n } = useTranslation(descr.ns)
    const navigator = useNavigator<BasicNavigator>()
    const claim = handler.wallet?.getRegistry(REGISTRY_TYPE_CLAIMS)
      .getCredential<DefaultSubject, DefaultPresentation>(id)?.credential as DefaultPresentation

    const sectionKey = castSectionKey(descr)

    const methods = useForm({
      mode: 'onChange', criteriaMode: 'all',
      defaultValues: { [sectionKey]: { claim_preview: { issuer: '', alert: '' } } }
    })

    const send = trySubmit(
      { navigator, methods, errorField: `${sectionKey}.claim_preview.alert`, onError: async () => true },
      async (_, data) => {
        if (!handler.wallet) {
          throw ERROR_WIDGET_AUTHENTICATION
        }
        const issuer = data[sectionKey].claim_preview.issuer
        if (!handler.wallet.did.helper().isDIDId(issuer)) {
          throw new Error('invalid_did')
        }

        /**
         * @TODO get identity from some meta ???
         */
        const cred = getCredential(descr, claim) as DefaultCredential
        const identity = normalizeValue(cred.evidence)
          .find(cred => cred && cred.type.includes(BASIC_IDENTITY_TYPE)) as Identity

        const conn: DIDCommConnectMeta = {
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

    const fields = { t, i18n }

    return <WalletFormProvider {...methods}>
      <Grid container direction="column" spacing={1} justifyContent="flex-start" alignItems="stretch">
        <Grid item>
          <PrimaryForm {...fields} title={`${sectionKey}.claim_preview.title`}>
            <AlertOutput {...fields} field={`${sectionKey}.claim_preview.alert`} />
            <MainTextInput {...fields} field={`${sectionKey}.claim_preview.issuer`} />
          </PrimaryForm>
        </Grid>
        <Grid item>
          <FieldsRenderer purpose={UseFieldAt.CLAIM_PREVIEW} descr={descr} subject={getSubject(descr, claim)} />
        </Grid>
        <Grid item>
          <FormMainAction {...fields} title={`${sectionKey}.claim_preview.send`}
            action={methods.handleSubmit(send)} />
        </Grid>
      </Grid>
    </WalletFormProvider>
  }

export type ClaimViewParams = {
  id: string
}