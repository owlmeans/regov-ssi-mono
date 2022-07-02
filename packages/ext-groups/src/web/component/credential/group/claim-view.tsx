import React, { Fragment, FunctionComponent, useEffect, useState } from "react"

import {
  CredentialActionGroup, CredentialSelector, EmptyProps, MainTextOutput, PrimaryForm,
  RegovComponentProps, useRegov, WalletFormProvider, withRegov, dateFormatter
} from "@owlmeans/regov-lib-react"
import {
  Extension, getCompatibleSubject, Presentation, REGISTRY_SECTION_OWN, REGISTRY_TYPE_CLAIMS, singleValue,
  Credential, CredentialWrapper, REGISTRY_TYPE_IDENTITIES, normalizeValue, DIDDocument,
  DIDPURPOSE_VERIFICATION, VERIFICATION_KEY_HOLDER
} from "@owlmeans/regov-ssi-core"
import {
  GroupSubject, REGOV_CREDENTIAL_TYPE_GROUP, REGOV_CREDENTIAL_TYPE_MEMBERSHIP,
  REGOV_EXT_GROUP_NAMESPACE, REGOV_GROUP_CHAINED_TYPE, REGOV_GROUP_OFFER_TYPE
} from "../../../../types"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import { useForm } from "react-hook-form"
import { CommConnectionStatusHandler, DIDCommConnectMeta, ERROR_COMM_SEND_FAILED } from "@owlmeans/regov-comm"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"


export const GroupClaimView: FunctionComponent<GroupClaimViewParams> = withRegov<GroupClaimViewProps>(
  { namespace: REGOV_EXT_GROUP_NAMESPACE }, ({
    credential: presentation, navigator, t, i18n, close, ext, conn, connection
  }) => {
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
            .find(evidence => evidence?.type.includes(REGOV_GROUP_CHAINED_TYPE))

          if (group) {
            const groupMethod = handler.wallet?.did.helper().expandVerificationMethod(
              (group as Credential).issuer as DIDDocument,
              DIDPURPOSE_VERIFICATION, VERIFICATION_KEY_HOLDER
            )

            return identityMethod?.publicKeyBase58 === groupMethod?.publicKeyBase58
          }

          return false
        })

      if (identities && identities.length) {
        setSignatures(identities)
        setDefaultId(identities[0].credential.id)
      }
    })()
  }, [presentation.id])

  const produce = async (_: GroupClaimViewFields) => {
    const loader = await navigator?.invokeLoading()
    try {
      const credential = JSON.parse(JSON.stringify(singleValue(presentation.verifiableCredential)))

      if (handler.wallet && credential) {
        credential.evidence = signatures.find(
          signature => signature.credential.id === defaultId
        )?.credential
        const factory = ext.getFactory(REGOV_CREDENTIAL_TYPE_GROUP)
        const offer = await factory.offer(handler.wallet, {
          claim: presentation,
          credential: credential as Credential,
          holder: credential.issuer as DIDDocument,
          offerType: REGOV_GROUP_OFFER_TYPE,
          subject: credential.credentialSubject,
          id: presentation.id || '',
          challenge: presentation.proof.challenge || '',
          domain: presentation.proof.domain || '',
          cryptoKey: await handler.wallet.keys.getCryptoKey(),
        })

        if (!await connection.helper?.send(offer, conn)) {
          throw ERROR_COMM_SEND_FAILED
        }
      }
    } catch (error) {
      console.error(error)
      loader?.error(error.message)
    } finally {
      loader?.finish()
    }
  }

  const fields = ["uuid", "name", "description", "createdAt", "depth"]

  const extraFields = Object.entries(groupSubject).reduce((subject, [key, value]) => ({
    ...subject, ...(!fields.includes(key) ? { [key]: value } : {})
  }), {})

  return <Fragment>
    <DialogContent>
      <WalletFormProvider {...methods}>
        <PrimaryForm {..._props} title="group.claimView.title">
          <MainTextOutput {..._props} field="group.groupClaim.name" showHint />
          <MainTextOutput {..._props} field="group.groupClaim.description" showLabel />
          <MainTextOutput {..._props} field="group.groupClaim.uuid" showHint />
          <MainTextOutput {..._props} field="group.groupClaim.createdAt" showHint
            formatter={dateFormatter} />
          <Grid item container border={1} borderColor="info.dark" borderRadius={2} px={2}
            direction="column" my={2}>
            {Object.entries(extraFields).map(([key, value]) => <Grid item my={1}>
              <Typography variant="body2">{value as string}</Typography>
              <Typography variant="caption" color="gray">
                {`${t('group.groupClaim.extraField', { key })}`}
              </Typography>
            </Grid>)}
          </Grid>
          <CredentialSelector {..._props} field="group.offer.identity"
            credentials={signatures} defaultId={defaultId} />
        </PrimaryForm>
      </WalletFormProvider>
    </DialogContent>
    <DialogActions>
      <Button onClick={methods.handleSubmit(produce)}>{`${t('group.claimView.offer')}`}</Button>
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
  connection: CommConnectionStatusHandler
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