import React, { Fragment, FunctionComponent, PropsWithChildren, useEffect, useState } from "react"
import { basicNavigator, EmptyProps, useNavigator, useRegov } from "@owlmeans/regov-lib-react"
import { ERROR_INVALID_SIGNATURE_TO_ACCEPT, REGOV_CREDENTIAL_TYPE_SIGNATURE, REGOV_EXT_SIGNATURE_NAMESPACE, SignaturePresentation } from "../../types"
import { getSignatureCredentialOfferFromPresentation } from "../../util"
import { useTranslation } from "react-i18next"
import { SignatureViewFieldsWeb } from "./view/fields"

import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import { Button } from "@mui/material"
import { Extension, VALIDATION_KIND_OFFER } from "@owlmeans/regov-ssi-core"
import { useInboxRegistry } from "@owlmeans/regov-ext-comm"


export const SignatureOfferReviewWeb: FunctionComponent<SignatureOfferReviewWebProps> = props => {
  const { handler, extensions } = useRegov()
  const cred = getSignatureCredentialOfferFromPresentation(props.offer)
  const inbox = useInboxRegistry()
  const { t } = useTranslation(props.ns || REGOV_EXT_SIGNATURE_NAMESPACE)
  const [valid, setValid] = useState<boolean>(false)
  const navigator = useNavigator(basicNavigator)

  useEffect(() => {
    (async () => {
      if (!handler.wallet || !extensions) {
        return
      }

      const factory = props.ext.getFactory(REGOV_CREDENTIAL_TYPE_SIGNATURE)
      const result = await factory.validate(handler.wallet, {
        extensions: extensions.registry, credential: cred,
        presentation: props.offer, kind: VALIDATION_KIND_OFFER
      })

      setValid(result.valid)
      
      // @TODO Display error if result is invalid

      console.log(result)
    })()
  }, [props.offer.id])

  const accept = async () => {
    const loading = await navigator.invokeLoading()
    try {
      if (!valid) {
        throw ERROR_INVALID_SIGNATURE_TO_ACCEPT
      }

      const wrap = await handler.wallet?.getCredRegistry().addCredential(cred)

      if (wrap) {
        wrap.meta.title = cred.credentialSubject.name
      }

      await handler.wallet?.getClaimRegistry().removeCredential(props.offer)
      await inbox.removePeer(props.offer)

      handler.notify()

      props.close && props.close()
    } catch (e) {
      console.error(e)
      loading.error("message" in e ? e.message : e)
    } finally {
      loading.finish()
    }
  }

  return <Fragment>
    <DialogContent>
      <SignatureViewFieldsWeb t={t} cred={cred} />
    </DialogContent>
    <DialogActions>
      {valid && <Button onClick={accept}>{t('signature.offer.accept')}</Button>}
    </DialogActions>
  </Fragment>
}

export type SignatureOfferReviewWebProps = PropsWithChildren<EmptyProps & {
  offer: SignaturePresentation
  ext: Extension
  close?: () => void
}>