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

import { FunctionComponent } from "react"
import { useForm } from "react-hook-form"
import { AlertOutput, BasicNavigator, FormMainAction, MainTextInput, MainTextOutput, PrimaryForm, useNavigator, useRegov, WalletFormProvider } from "@owlmeans/regov-lib-react"
import { REGISTRY_TYPE_CLAIMS } from "@owlmeans/regov-ssi-core"
import Grid from "@mui/material/Grid"

import { CustomDescription, DefaultPresentation, DefaultSubject, UseFieldAt } from "../../../custom.types"
import { castSectionKey } from "../../utils/tools"
import { useTranslation } from "react-i18next"
import { FieldsRenderer } from "../widget/fields"
import { getSubject } from "../../utils/cred"
import { buildClaimSend } from './helpers'


export const ClaimView = (descr: CustomDescription): FunctionComponent<ClaimViewParams> =>
  (props) => {
    const { id, lockIssuer } = props
    const { handler } = useRegov()
    const { t, i18n } = useTranslation(descr.ns)
    const navigator = useNavigator<BasicNavigator>()
    const claim = handler.wallet?.getRegistry(REGISTRY_TYPE_CLAIMS)
      .getCredential<DefaultSubject, DefaultPresentation>(id)?.credential as DefaultPresentation

    const sectionKey = castSectionKey(descr)

    const methods = useForm({
      mode: 'onChange', criteriaMode: 'all',
      defaultValues: { [sectionKey]: { claim_preview: { issuer: props.issuer || '', alert: '' } } }
    })

    const send = buildClaimSend({
      navigator, methods, handler, claim, descr, sectionKey, errorField: `${sectionKey}.claim_preview.alert`
    })

    const fields = { t, i18n }

    return <WalletFormProvider {...methods}>
      <Grid container direction="column" spacing={1} justifyContent="flex-start" alignItems="stretch">
        <Grid item>
          <PrimaryForm {...fields} title={`${sectionKey}.claim_preview.header`}>
            <AlertOutput {...fields} field={`${sectionKey}.claim_preview.alert`} />
            {props.issuer && props.issuer !== '' && lockIssuer === true
              ? <MainTextOutput {...fields} field={`${sectionKey}.claim_preview.issuer`} inlineLabel />
              : <MainTextInput {...fields} field={`${sectionKey}.claim_preview.issuer`} /> }
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
  issuer?: string
  lockIssuer?: boolean
}
