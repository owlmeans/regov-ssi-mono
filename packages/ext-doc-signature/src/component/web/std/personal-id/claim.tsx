import React, { Fragment } from "react"

import { PresonalIdClaimFields } from "./types"
import { Extension, Presentation, Credential } from "@owlmeans/regov-ssi-core"
import { useForm } from "react-hook-form"
import {
  ERROR_WIDGET_AUTHENTICATION, personaIdDefaultValues, PersonalIdSubject, RegovStdPersonalIdClaim,
  REGOV_CRED_PERSONALID
} from "../../../../types"
import { useTranslation } from "react-i18next"
import {
  MainTextInput, PrimaryForm, WalletFormProvider, CountryInput, GenderInput, DateInput, useNavigator,
  BasicNavigator, useRegov, AlertOutput, FormMainAction, CredentialListInputDetails
} from "@owlmeans/regov-lib-react"

import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"


export const PersonalIdClaim = (ext: Extension): CredentialListInputDetails<RegovStdPersonalIdClaim> => props => {
  const { t, i18n } = useTranslation(ext.localization?.ns)
  const navigator = useNavigator<BasicNavigator>()
  const { handler, extensions } = useRegov()

  const form = useForm<PresonalIdClaimFields>({
    mode: 'onChange',
    criteriaMode: 'all',
    defaultValues: {
      std: {
        personalId: {
          ...personaIdDefaultValues
        }
      }
    }
  })

  const field = {
    t, i18n, rules: {
      'std.personalId.name': {},
      'std.personalId.identifier': {},
      // 'std.personalId.country': {},
      // 'std.personalId.gender': {},
      'std.personalId.givenName': {},
      'std.personalId.familyName': {},
      'std.personalId.additionalName': {},
      'std.personalId.birthDate': {},
      'std.personalId.validFrom': {},
      'std.personalId.validUntil': {},
    }
  }

  const claim = async (data: PresonalIdClaimFields) => {
    const loader = await navigator.invokeLoading()
    try {
      if (!handler.wallet) {
        throw ERROR_WIDGET_AUTHENTICATION
      }
      const factory = ext.getFactory(REGOV_CRED_PERSONALID)

      const unsignedClaim = await factory.build(handler.wallet, {
        extensions: extensions?.registry,
        subjectData: data.std.personalId
      })

      const claim = await factory.claim(
        handler.wallet, { unsignedClaim }
      ) as Presentation<Credential<PersonalIdSubject>>

      loader.success(t('std.personalId.claim.success'))
      props.finish && props.finish(claim)
    } catch (error) {
      console.error(error)
      loader.error(error)
    } finally {
      loader.finish()
    }
  }

  return <Fragment>
    <DialogContent>
      <WalletFormProvider {...form}>
        <PrimaryForm {...field} title="std.presonalId.claim.title">
          <MainTextInput {...field} field="std.personalId.name" />
          <MainTextInput {...field} field="std.personalId.identifier" />
          <CountryInput {...field} field="std.personalId.country" />
          <GenderInput {...field} field="std.personalId.gender" />
          <MainTextInput {...field} field="std.personalId.givenName" />
          <MainTextInput {...field} field="std.personalId.familyName" />
          <MainTextInput {...field} field="std.personalId.additionalName" />
          <DateInput {...field} field="std.personalId.birthDate" />
          <DateInput {...field} field="std.personalId.validFrom" />
          <DateInput {...field} field="std.personalId.validUntil" />
          <AlertOutput {...field} field="std.personalIdAux.alert" />
          <FormMainAction {...field} title="std.personalId.claim.create" action={form.handleSubmit(claim)} />
        </PrimaryForm>
      </WalletFormProvider>
    </DialogContent>
    <DialogActions>
      {props.close && <Button onClick={props.close}>{t('close')}</Button>}
    </DialogActions>
  </Fragment>
}

