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

import { Fragment, FunctionComponent, useEffect, useState } from "react"

import {
  CredentialActionGroup, CredentialSelector, EmptyProps, MainTextOutput, PrimaryForm, MainTextInput,
  RegovComponentProps, useRegov, WalletFormProvider, withRegov, dateFormatter, PrimaryFormProps
} from "@owlmeans/regov-lib-react"
import {
  Extension, getCompatibleSubject, Presentation, REGISTRY_SECTION_OWN, REGISTRY_TYPE_CLAIMS,
  singleValue, Credential, CredentialWrapper, REGISTRY_TYPE_IDENTITIES, DIDDocument, REGISTRY_SECTION_PEER,
  normalizeValue
} from "@owlmeans/regov-ssi-core"
import {
  GroupSubject, REGOV_MEMBERSHIP_CLAIM_TYPE, REGOV_CREDENTIAL_TYPE_GROUP, REGOV_CREDENTIAL_TYPE_MEMBERSHIP,
  REGOV_EXT_GROUP_NAMESPACE, REGOV_GROUP_OFFER_TYPE, REGOV_GROUP_CHAINED_TYPE, REGOV_GROUP_LIMITED_TYPE
} from "../../../../types"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import { useForm } from "react-hook-form"
import { CommConnectionStatusHandler, DIDCommConnectMeta, getDIDCommUtils } from "@owlmeans/regov-comm"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import { REGISTRY_TYPE_INBOX } from '@owlmeans/regov-ext-comm'


export const GroupClaimView: FunctionComponent<GroupClaimViewParams> = withRegov<GroupClaimViewProps>(
  { namespace: REGOV_EXT_GROUP_NAMESPACE }, ({
    credential: presentation, navigator, t, i18n, close, ext, conn
  }) => {
  const { handler } = useRegov()
  const cred = singleValue(presentation.verifiableCredential) as Credential
  const groupSubject = getCompatibleSubject<GroupSubject>(cred)

  const _props: PrimaryFormProps = { t, i18n, title: '' }

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
        ?.filter(identity => identity.credential.id === conn?.sender.id)

      if (identities && identities.length) {
        setSignatures(identities)
        setDefaultId(identities[0].credential.id)
      }
    })()
  }, [presentation.id])

  const identity = signatures.find(
    signature => signature.credential.id === methods.getValues('group.offer.identity') || defaultId
  )?.credential

  let maxDepth = 0
  if (identity) {
    const parentGroup = normalizeValue(identity.evidence).find(
      evidence => evidence?.type.includes(REGOV_GROUP_CHAINED_TYPE)
    ) as Credential<GroupSubject> | undefined
    if (parentGroup) {
      maxDepth = Math.max(0, (parentGroup.credentialSubject.depth || 0) - 1)
      _props.rules = {
        ..._props.rules, 'group.groupClaim.depth': { min: 0, max: maxDepth, valueAsNumber: true }
      }
      methods.setValue('group.groupClaim.depth', maxDepth)
    }
  }

  const produce = async (data: GroupClaimViewFields) => {
    const loader = await navigator?.invokeLoading()
    try {
      const credential = JSON.parse(JSON.stringify(cred)) as Credential<GroupSubject>

      if (handler.wallet && credential) {
        credential.evidence = identity

        const cred = JSON.parse(JSON.stringify(credential)) as typeof credential

        if (maxDepth > 0 && cred.type.includes(REGOV_GROUP_LIMITED_TYPE)) {
          cred.type.splice(cred.type.findIndex(t => t === REGOV_GROUP_LIMITED_TYPE), 1)
        }

        const factory = ext.getFactory(REGOV_CREDENTIAL_TYPE_GROUP)
        const offer = await factory.offer(handler.wallet, {
          claim: presentation,
          credential: cred,
          holder: credential.issuer as DIDDocument,
          offerType: REGOV_GROUP_OFFER_TYPE,
          subject: {
            ...credential.credentialSubject,
            ...(maxDepth > 0 ? { depth: data.group.groupClaim.depth } : {})
          },
          id: presentation.id || '',
          challenge: presentation.proof.challenge || '',
          domain: presentation.proof.domain || '',
          cryptoKey: await handler.wallet.keys.getCryptoKey(),
          claimType: REGOV_MEMBERSHIP_CLAIM_TYPE
        })

        if (conn) {
          await getDIDCommUtils(handler.wallet).send(conn, offer)

          handler.wallet.getRegistry(REGISTRY_TYPE_INBOX).removeCredential(presentation, REGISTRY_SECTION_PEER)
          close && close()
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
          {maxDepth > 0 && <MainTextInput {..._props} field="group.groupClaim.depth" />}
          <Grid item container border={1} borderColor="info.dark" borderRadius={2} px={2}
            direction="column" my={2}>
            {Object.entries(extraFields).map(([key, value]) => <Grid item key={key} my={1}>
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
})

export type GroupClaimViewParams = EmptyProps & {
  ext: Extension
  credential: Presentation
  conn?: DIDCommConnectMeta
  connection?: CommConnectionStatusHandler
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