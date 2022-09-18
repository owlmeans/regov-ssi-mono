import {
  basicNavigator, MainTextInput, trySubmit, generalDidIdValidation,
  EmptyProps, FormMainAction, generalIdVlidation, generalNameVlidation, humanReadableVersion,
  PrimaryForm, urlVlidation, useNavigator, useRegov, WalletFormProvider
} from "@owlmeans/regov-lib-react"
import React, { Fragment, FunctionComponent, PropsWithChildren, useEffect, useState } from "react"
import { SignatureCreationFieldsWeb } from "./creation/fields"
import { FieldValues, useForm, UseFormReturn } from 'react-hook-form'
import { SignatureCreationFields } from "./creation"
import { useTranslation } from "react-i18next"
import {
  DIDDocument, ERROR_NO_IDENTITY, Extension, REGISTRY_SECTION_OWN, REGISTRY_TYPE_IDENTITIES
} from "@owlmeans/regov-ssi-core"
import {
  ERROR_WIDGET_AUTHENTICATION, REGOV_CREDENTIAL_TYPE_SIGNATURE, REGOV_EXT_SIGNATURE_NAMESPACE
} from "../../types"
import { DIDCommConnectMeta, getDIDCommUtils } from "@owlmeans/regov-comm"
import { isCreationMetaFields } from "./creation/types"


export const SignatureClaimWeb = (ext: Extension): FunctionComponent<SignatureClaimWebProps> => props => {
  const { t, i18n } = useTranslation(props.ns || REGOV_EXT_SIGNATURE_NAMESPACE)
  const { handler, extensions } = useRegov()
  const navigator = useNavigator(basicNavigator)

  const methods = useForm<SignatureClaimFields>({
    mode: 'onChange',
    criteriaMode: 'all',
    defaultValues: {
      signature: {
        creation: {
          name: '',
          description: '',
          url: '',
          version: '',
          author: '',
          authorId: '',
          file: '',
          filename: '',
          creationDate: new Date().toISOString(),
          documentHash: '',
          docType: '',
          alert: '',
          identity: ''
        },
        claim: {
          issuerDid: ''
        }
      }
    }
  })

  const identities = handler.wallet?.getRegistry(REGISTRY_TYPE_IDENTITIES)
    .registry.credentials[REGISTRY_SECTION_OWN] || []
  const [defaultId, setDefaultId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const id = handler.wallet?.getIdentity()?.credential.id
    if (id) {
      setDefaultId(id)
    } else {
      methods.setError('signature.creation.alert', { type: 'noIdentity' })
    }
  }, [identities.length])

  const fieldProps = {
    t, i18n,
    rules: {
      'signature.creation.name': generalNameVlidation(true),
      'signature.creation.author': generalNameVlidation(false),
      'signature.creation.authorId': generalIdVlidation(false),
      'signature.creation.url': urlVlidation(),
      'signature.creation.version': humanReadableVersion,
      'signature.claim.issuerDid': generalDidIdValidation()
    }
  }

  const claim = trySubmit<SignatureClaimFields>({
    navigator, methods, errorField: 'signature.creation.alert'
  }, async (_, data) => {
    if (!handler.wallet) {
      throw ERROR_WIDGET_AUTHENTICATION
    }
    const subject = Object.fromEntries(
      Object.entries(data.signature.creation).filter(
        ([key]) => !isCreationMetaFields(key)
      )
    )

    const identity = handler.wallet.getIdentityCredential(data.signature.creation.identity)

    if (!identity) {
      throw ERROR_NO_IDENTITY
    }

    const factory = ext.getFactory(REGOV_CREDENTIAL_TYPE_SIGNATURE)
    const unsignedClaim = await factory.build(handler.wallet, {
      extensions: extensions?.registry, identity, 
      subjectData: { ...subject, signedAt: new Date().toISOString() },
    })

    const claim = await factory.claim(handler.wallet, { unsignedClaim })

    const conn: DIDCommConnectMeta = {
      recipientId: data.signature.claim.issuerDid,
      sender: handler.wallet.did.helper().isDIDDocument(identity.holder)
        ? identity.holder : identity.issuer as DIDDocument
    }

    const connection = getDIDCommUtils(handler.wallet)
    await connection.send(await connection.connect(conn), claim)

    await handler.wallet.getClaimRegistry().addCredential(claim)

    handler.notify()

    if (props.close) {
      props.close()
    } else if (props.next) {
      props.next()
    }
  })

  return <Fragment>
    <WalletFormProvider {...methods}>
      <PrimaryForm {...fieldProps} title="signature.claim.title">
        <SignatureCreationFieldsWeb fieldProps={fieldProps} selectorProps={{
          ...fieldProps, credentials: identities, defaultId
        }} methods={methods as unknown as UseFormReturn<FieldValues>}>
          <MainTextInput {...fieldProps} field="signature.claim.issuerDid" />
        </SignatureCreationFieldsWeb>

        <FormMainAction {...fieldProps} title="signature.creation.create" action={methods.handleSubmit(claim)} />
      </PrimaryForm>
    </WalletFormProvider>
  </Fragment>
}


export type SignatureClaimWebProps = PropsWithChildren<EmptyProps & { 
  close?: () => void 
  next?: () => void
}>

export type SignatureClaimFields = SignatureCreationFields & {
  signature: { claim: { issuerDid: string } }
}