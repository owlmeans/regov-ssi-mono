
import React, {
  Fragment,
  FunctionComponent,
  useState
} from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material'
import {
  EmptyProps,
  EXTENSION_ITEM_PURPOSE_EVIDENCE,
  PurposeEvidenceWidgetParams,
  RegovComponetProps,
  useRegov,
  withRegov
} from '@owlmeans/regov-lib-react'
import {
  Credential, CredentialSubject, REGISTRY_SECTION_PEER, REGISTRY_TYPE_IDENTITIES
} from '@owlmeans/regov-ssi-core'
import {
  EvidenceValidationResult,
  EXTENSION_TRIGGER_RETRIEVE_NAME,
  RetreiveNameEventParams,
  ValidationResult
} from '@owlmeans/regov-ssi-extension'
import { StandardEvidenceWidget } from './standard'


export const EvidenceTrust: FunctionComponent<EvidenceTrustParams> = withRegov<EvidenceTrustProps>(
  { namespace: 'regov-wallet-credential' },
  ({ handle, t, navigator }) => {
    const { extensions, handler } = useRegov()
    const [open, setOpen] = useState<boolean>(false)
    const [credential, setCredential] = useState<Credential | undefined>(undefined)
    const [result, setResult] = useState<ValidationResult | undefined>(undefined)
    const [title, setTitle] = useState<string>('')
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
         * 
         * @TODO 1. Figure out: why identity isn't treated as trusted after
         * getting into pear identity list.
         * 2. Make sure that the trusted evidence leads to trust from any trust level
         * 3. Add naming of trusted credential
         * 4. Add confirmtion flow for credential trust
         */
        await handler.wallet?.getRegistry(REGISTRY_TYPE_IDENTITIES)
          .addCredential(credential as Credential<CredentialSubject>, REGISTRY_SECTION_PEER)
        loader?.success(t('widget.trust.result.success'))
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

    extensions.triggerEvent<RetreiveNameEventParams<string>>(
      handler.wallet, EXTENSION_TRIGGER_RETRIEVE_NAME, {
      credential, setName: (name: string) => { setTitle(name) }
    })

    return <Dialog open={open} scroll="paper" onClose={close}>
      <DialogTitle>{t('widget.trust.title')}</DialogTitle>
      <DialogContent>
        <Renderer wrapper={{
          credential: credential as Credential<CredentialSubject>,
          meta: { secure: false, title }
        }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>{t('widget.trust.action.cancel')}</Button>
        <Button onClick={trust}>{t('widget.trust.action.trust')}</Button>
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

export type EvidenceTrustProps = RegovComponetProps<EvidenceTrustParams>