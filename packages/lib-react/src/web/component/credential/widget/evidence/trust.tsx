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


import React, { Fragment, FunctionComponent, useState } from 'react'
import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid,
  Typography
} from '@mui/material'
import {
  EmptyProps, EXTENSION_ITEM_PURPOSE_EVIDENCE, generalNameVlidation, PurposeEvidenceWidgetParams,
  RegovComponentProps, useRegov, withRegov
} from '../../../../../common'
import {
  Credential, CredentialSubject, REGISTRY_SECTION_PEER, REGISTRY_TYPE_IDENTITIES
} from '@owlmeans/regov-ssi-core'
import {
  EvidenceValidationResult, EXTENSION_TRIGGER_RETRIEVE_NAME, RetreiveNameEventParams,
  ValidationResult
} from '@owlmeans/regov-ssi-core'
import { StandardEvidenceWidget } from './standard'
import { MainTextInput } from '../../../common'
import { useForm, FormProvider } from 'react-hook-form'
import { Report, Warning } from '@mui/icons-material'


export const EvidenceTrust: FunctionComponent<EvidenceTrustParams> = withRegov<EvidenceTrustProps>(
  { namespace: 'regov-wallet-credential' },
  (props) => {
    const { handle, t, navigator } = props
    const { extensions, handler } = useRegov()
    const [open, setOpen] = useState<boolean>(false)
    const [credential, setCredential] = useState<Credential | undefined>(undefined)
    const [result, setResult] = useState<ValidationResult | undefined>(undefined)
    const [title, setTitle] = useState<string>('')
    const [step, setStep] = useState<string>('input') // input, confirmation
    const methods = useForm<EvidenceTrustFields>({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        trust: {
          field: {
            name: ''
          }
        }
      }
    })

    handle.setResult = (result, credential) => {
      setOpen(true)
      setResult(result)
      setCredential(credential)
    }
    handle.setEvidence = (evidence) => {
      setOpen(true)
      setCredential(evidence.instance)
      setResult(evidence.result)
    }
    const close = () => {
      setOpen(false)
      handle.reload && handle.reload()
    }

    if (!result || !credential || !extensions || !handler.wallet) {
      return <Fragment />
    }

    const trust = async () => {
      const loader = await navigator?.invokeLoading()
      try {
        /**
         * @TODO this "as Credential" idiom is an typing errors
         * There is something wrong with MaybeArray and subject it looks like
         * some around validation type is broken
         */
        const wrapper = await handler.wallet?.getRegistry(REGISTRY_TYPE_IDENTITIES)
          .addCredential(credential as Credential<CredentialSubject>, REGISTRY_SECTION_PEER)

        if (wrapper) {
          wrapper.meta.title = methods.getValues('trust.field.name')
        }

        loader?.success(t('widget.trust.result.success'))
        close()
      } catch (error) {
        loader?.error(error.message)
      } finally {
        handler.notify()
        loader?.finish()
      }
    }

    const renderers = extensions.produceComponent(EXTENSION_ITEM_PURPOSE_EVIDENCE, credential.type)
    const renderer = renderers && renderers[0]
    const Renderer = (renderer?.com || StandardEvidenceWidget) as FunctionComponent<PurposeEvidenceWidgetParams>

    extensions.triggerEvent<RetreiveNameEventParams>(
      handler.wallet, EXTENSION_TRIGGER_RETRIEVE_NAME, {
      credential, setName: (name: string) => { setTitle(name) }
    })

    const _props = {
      ...props,
      rules: {
        'trust.field.name': generalNameVlidation(true)
      }
    }

    return <Dialog open={open} scroll="paper" fullWidth onClose={close}>
      <DialogTitle>
        <Grid container direction="row" justifyContent="flex-start" alignItems="center">
          <Grid item>
            <Warning color="warning" fontSize="large" />
          </Grid>
          <Grid item>
            {t('widget.trust.title')}
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        {step === 'input' && <Fragment>
          <FormProvider {...methods}>
            <MainTextInput {..._props} field="trust.field.name" />
          </FormProvider>
          <Renderer wrapper={{
            credential: credential as Credential<CredentialSubject>,
            meta: { secure: false, title }
          }} />
        </Fragment>}
        {step === 'confirmation' && <Fragment>
          <Typography variant="h6">
            <Report color="error" fontSize="small" />
            {t('widget.trust.confirmation.title')}
          </Typography>
          <DialogContentText>{t('widget.trust.confirmation.text')}</DialogContentText>
        </Fragment>}
      </DialogContent>
      <DialogActions>
        {step === 'input' && <Fragment>
          <Button onClick={close}>{t('widget.trust.action.cancel')}</Button>
          <Button onClick={methods.handleSubmit(() => setStep('confirmation'))}>{t('widget.trust.action.trust')}</Button>
        </Fragment>}
        {step === 'confirmation' && <Fragment>
          <Button onClick={() => setStep('input')}>{t('widget.trust.action.back')}</Button>
          <Button onClick={methods.handleSubmit(trust)}>{t('widget.trust.action.confirm')}</Button>
        </Fragment>}
      </DialogActions>
    </Dialog>
  }
)

export type EvidenceTrustParams = EmptyProps & {
  handle: EvidenceTrustHandle
}

export type EvidenceTrustHandle = {
  setResult?: (result: ValidationResult, credential: Credential) => void
  setEvidence?: (evidence: EvidenceValidationResult) => void
  reload?: () => void
}

export type EvidenceTrustProps = RegovComponentProps<EvidenceTrustParams>

export type EvidenceTrustFields = {
  trust: {
    field: {
      name: string
    }
  }
}