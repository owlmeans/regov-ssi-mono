import React, { Fragment, FunctionComponent, useEffect, useState } from "react"

import {
  CredentialActionGroup, CredentialSelector, EmptyProps, MainTextOutput, PrimaryForm, RegovComponentProps, useRegov, WalletFormProvider,
  withRegov
} from "@owlmeans/regov-lib-react"
import {
  Extension, getCompatibleSubject, Presentation, REGISTRY_SECTION_OWN, REGISTRY_TYPE_CLAIMS, singleValue,
  Credential, CredentialWrapper, REGISTRY_TYPE_IDENTITIES, normalizeValue, DIDDocument, DIDPURPOSE_VERIFICATION, VERIFICATION_KEY_HOLDER
} from "@owlmeans/regov-ssi-core"
import { GroupSubject, REGOV_CREDENTIAL_TYPE_MEMBERSHIP, REGOV_EXT_GROUP_NAMESPACE, REGOV_GROUP_CHAINED_TYPE } from "../../../../types"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import { useForm } from "react-hook-form"
import { DIDCommConnectMeta } from "@owlmeans/regov-comm"


export const GroupClaimView: FunctionComponent<GroupClaimViewParams> = withRegov<GroupClaimViewProps>(
  { namespace: REGOV_EXT_GROUP_NAMESPACE }, ({ credential: presentation, navigator, t, i18n, close }) => {
    const { handler } = useRegov()
    const groupSubject = getCompatibleSubject<GroupSubject>(
      singleValue(presentation.verifiableCredential) as Credential
    )

    const _props = { t, i18n }

    const wrapper = handler.wallet?.getRegistry(REGISTRY_TYPE_CLAIMS)
      .getCredential(presentation.id, REGISTRY_SECTION_OWN)

    const methods = useForm<GroupClaimViewFields>({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        group: {
          groupClaim: groupSubject
        }
      }
    })

    const [signatures, setSignatures] = useState<CredentialWrapper[]>([])
    const [defaultId, setDefaultId] = useState<string | undefined>(undefined)

    useEffect(() => {
      (async () => {
        const identities = (await handler.wallet?.getRegistry(REGISTRY_TYPE_IDENTITIES)
          .lookupCredentials(REGOV_CREDENTIAL_TYPE_MEMBERSHIP, REGISTRY_SECTION_OWN))
          ?.filter(identity => {
            const identityMethod = handler.wallet?.did.helper().expandVerificationMethod(
              identity.credential.issuer as DIDDocument, DIDPURPOSE_VERIFICATION, VERIFICATION_KEY_HOLDER
            )
            const group = normalizeValue(identity.credential.evidence)
              .find(evidence => evidence?.type.includes(REGOV_GROUP_CHAINED_TYPE)) as Credential

            const groupMethod = handler.wallet?.did.helper().expandVerificationMethod(
              group.issuer as DIDDocument, DIDPURPOSE_VERIFICATION, VERIFICATION_KEY_HOLDER
            )

            return identityMethod?.publicKeyBase58 === groupMethod?.publicKeyBase58
          })

        if (identities && identities.length) {
          setSignatures(identities)
          setDefaultId(identities[0].credential.id)
        }
      })()
    }, [presentation.id])

    const produce = async () => {
      const loader = await navigator?.invokeLoading()
      try {

      } catch (error) {
        console.error(error)
        loader?.error(error.message)
      } finally {
        loader?.finish()
      }
    }

    return <Fragment>
      <DialogContent>
        <WalletFormProvider {...methods}>
          <PrimaryForm {..._props} title="group.claimView.title">
            <MainTextOutput {..._props} field="group.groupClaim.name" showHint />

            <CredentialSelector {..._props} field="group.offer.identity"
              credentials={signatures} defaultId={defaultId} />
          </PrimaryForm>
        </WalletFormProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={methods.handleSubmit(produce)}></Button>
        <CredentialActionGroup content={presentation} prettyOutput
          exportTitle={wrapper?.meta.title || groupSubject.name} />
        <Button onClick={close}>{`${t('group.claimView.close')}`}</Button>
      </DialogActions>
    </Fragment>
  }
)

export type GroupClaimViewParams = EmptyProps & {
  ext: Extension
  credential: Presentation
  conn: DIDCommConnectMeta
  close?: () => void
}

export type GroupClaimViewProps = RegovComponentProps<GroupClaimViewParams>

export type GroupClaimViewFields = {
  group: {
    groupClaim: GroupSubject
    offer: {
      identity: string
    }
  }
}