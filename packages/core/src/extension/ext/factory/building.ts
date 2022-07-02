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

import { addToValue, normalizeValue } from "../../../common"
import { CredentialSchema, BASE_CREDENTIAL_TYPE, Credential } from "../../../vc"
import { WalletWrapper } from "../../../wallet"
import { DIDDocument, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION, DIDPURPOSE_VERIFICATION } from "../../../did"
import { CredentialDescription } from "../../schema"
import { BuildMethodParams } from "../types"
import { EVENT_EXTENSION_AFTER_BULIDING_DID, ExtensionEventAfterBuildingDid } from "./types"


export const defaultBuildMethod = <
  Schema extends CredentialSchema = CredentialSchema,
  >(schema: CredentialDescription<Schema>) =>
  async (wallet: WalletWrapper, params: BuildMethodParams) => {

    const subject = params.subjectData as any

    if (params.identity) {
      if (!normalizeValue(params.evidence).find(evidence => evidence?.id === params.identity?.id)) {
        params.evidence = addToValue(params.evidence, params.identity)
      }
    }

    const identityKey = params.identity && await wallet.ssi.did.extractKey(
      params.identity.holder.hasOwnProperty('@context')
        ? params.identity.holder as DIDDocument
        : params.identity.issuer as unknown as DIDDocument
    )

    identityKey && await wallet.ssi.keys.expandKey(identityKey)

    const key = params.key || identityKey || await wallet.ssi.keys.getCryptoKey()
    const didUnsigned = params.didUnsigned || await wallet.ssi.did.helper().createDID(
      key,
      {
        data: JSON.stringify(subject),
        hash: true,
        purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION]
      }
    )

    const unsingnedCredentail = await wallet.ssi.buildCredential({
      id: didUnsigned.id,
      type: params.type || [
        BASE_CREDENTIAL_TYPE,
        schema.mainType,
        ...(Array.isArray(schema.mandatoryTypes) ? schema.mandatoryTypes : [])
      ],
      holder: didUnsigned,
      context: schema.contextUrl || schema.credentialContext,
      subject
    })

    await params.extensions?.triggerEvent<ExtensionEventAfterBuildingDid>(
      wallet, EVENT_EXTENSION_AFTER_BULIDING_DID, {
      unsigned: didUnsigned,
      cred: unsingnedCredentail,
      key
    })

    if (params.schema) {
      unsingnedCredentail.credentialSchema = params.schema
    } else if (schema.credentialSchema) {
      unsingnedCredentail.credentialSchema = schema.credentialSchema
    }

    if (params.evidence) {
      unsingnedCredentail.evidence = params.evidence
    }

    return unsingnedCredentail
  }