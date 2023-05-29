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

import { FunctionComponent, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  EmptyProps, generalNameVlidation, MainModalAuthenticatedEventParams, RegovComponentProps,
  useRegov, withRegov
} from '@owlmeans/regov-lib-react'
import { MainTextInput, MainTextOutput, PrimaryForm, WalletFormProvider, dateFormatter, AlertOutput } from '@owlmeans/regov-lib-react'
import { REGISTRY_TYPE_IDENTITIES, UnsignedCredential } from '@owlmeans/regov-ssi-core'
import { IdentitySubject, REGOV_IDENTITY_DEFAULT_NAMESPACE } from '../../../types'
import { BASIC_IDENTITY_TYPE } from '../../../ext'
import { ERROR_CREATION_AUTHENTICATION, ERROR_CREATION_EXTENSION, ERROR_CREATION_READYTO_SIGN } from './types'


export const IdentityCreation: FunctionComponent<IdentityCreationParams> = withRegov<IdentityCreationProps>(
  { namespace: REGOV_IDENTITY_DEFAULT_NAMESPACE }, ({ t, i18n, ext, navigator, proceedHandle }) => {
    const { handler, extensions } = useRegov()
    const props = {
      t, i18n,
      rules: {
        'identityName': generalNameVlidation(true)
      }
    }

    const [unsignedIdentity, setUnsignedIdentity] = useState<UnsignedCredential | undefined>(undefined)

    useEffect(() => {
      (async () => {
        const loader = await navigator?.invokeLoading()
        try {
          if (!handler.wallet) {
            throw ERROR_CREATION_AUTHENTICATION
          }
          if (!ext) {
            throw ERROR_CREATION_EXTENSION
          }
          const factory = ext.getFactory(ext.schema.details.defaultCredType || BASIC_IDENTITY_TYPE)
          const unsignedIdentity = await factory.build(handler.wallet, 
            { extensions: extensions?.registry, subjectData: {} }
          )
          setUnsignedIdentity(unsignedIdentity)

          methods.setValue('creation', {
            ...unsignedIdentity.credentialSubject as unknown as IdentitySubject,
            alert: undefined
          })
        } catch (error) {
          console.info(error)
          if (error.message) {
            methods.setError('creation.alert', { type: error.message })
            return
          }
          loader?.error(error.message)
        } finally {
          loader?.finish()
        }
      })().catch(e => { throw e })
    }, [])

    proceedHandle.proceed = async (next) => methods.handleSubmit(async () => {
      const loader = await navigator?.invokeLoading()
      try {
        if (!handler.wallet) {
          throw ERROR_CREATION_AUTHENTICATION
        }
        if (!unsignedIdentity || !ext) {
          throw ERROR_CREATION_READYTO_SIGN
        }
        const factory = ext.getFactory(unsignedIdentity.type)
        const identity = await factory.sign(handler.wallet, { unsigned: unsignedIdentity })

        const registry = handler.wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)

        const item = await registry.addCredential(identity)

        item.meta.title = methods.getValues('identityName')

        if (!item.meta.title || item.meta.title === '') {
          item.meta.title = 'Main ID'
        }

        registry.registry.rootCredential = identity.id

        handler.notify()

        next()
      } catch (error) {
        console.info(error)
        if (error.message) {
          methods.setError('creation.alert', { type: error.message })
          return
        }
        loader?.error(error.message)
      } finally {
        loader?.finish()
      }
    })()

    const methods = useForm<IdentityCreationFields>({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        creation: {
          identifier: '',
          sourceApp: '',
          uuid: '',
          createdAt: '',
          alert: undefined
        },
        identityName: t('creation.defaultIdentityTitle') as string,
      }
    })

    return <WalletFormProvider {...methods}>
      <PrimaryForm {...props} title="creation.title">
        <MainTextInput {...props} field="identityName" />
        <MainTextOutput {...props} field="creation.sourceApp" showHint />
        <MainTextOutput {...props} field="creation.identifier" showHint />
        <MainTextOutput {...props} field="creation.uuid" showHint />
        <MainTextOutput {...props} field="creation.createdAt" showHint formatter={dateFormatter} />
        <AlertOutput {...props} field="creation.alert" />
      </PrimaryForm>
    </WalletFormProvider>
  })

export type IdentityCreationParams = MainModalAuthenticatedEventParams & EmptyProps & {
  proceedHandle: IdentityCreationProceedHandle
}

export type IdentityCreationProceedHandle = {
  proceed?: (next: () => void) => Promise<void>
}

export type IdentityCreationProps = RegovComponentProps<IdentityCreationParams>

export type IdentityCreationFields = {
  creation: {
    identifier: string
    sourceApp: string
    uuid: string
    createdAt: string
    alert: string | undefined
  }
  identityName: string
}