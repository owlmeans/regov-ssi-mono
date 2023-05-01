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

import React, { FunctionComponent, useEffect, useState, } from 'react'
import { Extension } from '@owlmeans/regov-ssi-core'
import { REGOV_CREDENTIAL_TYPE_GROUP, GroupSubject, REGOV_GROUP_ROOT_TYPE } from '../../../../types'
import {
  EmptyProps, generalNameVlidation, RegovComponentProps, RegovValidationRules, SwitchInput, useRegov, withRegov
} from '@owlmeans/regov-lib-react'
import { useForm } from 'react-hook-form'
import {
  AlertOutput, dateFormatter, FormMainAction, LongTextInput, MainTextInput, MainTextOutput,
  PrimaryForm, WalletFormProvider
} from '@owlmeans/regov-lib-react'
import {
  ERROR_WIDGET_AUTHENTICATION, ERROR_WIDGET_EXTENSION, ERROR_CREATION_READYTO_SIGN
} from '../../types'
import { REGISTRY_TYPE_CREDENTIALS, UnsignedCredential } from '@owlmeans/regov-ssi-core'


export const GroupCreation = (ext: Extension): FunctionComponent<GroupCreationParams> =>
  withRegov<GroupCreationProps>({ namespace: ext.localization?.ns }, ({ t, i18n, navigator, next }) => {
    const { handler, extensions } = useRegov()
    const rules: RegovValidationRules = {
      'group.creation.credentialName': generalNameVlidation(true),
      'group.name': {
        required: true, maxLength: 192, validate: {
          pattern: (v: string) => !v.match(/[\<\>\[\]\{\}\\\']/)
        }
      },
      'group.depth': { valueAsNumber: true, min: 0, max: 9 },
      'group.description': { maxLength: 1024 },
    }
    const props = { t, i18n, rules }
    const [unsginedGroup, setUnsignedGroup] = useState<UnsignedCredential | undefined>(undefined)

    useEffect(() => {
      (async () => {
        const loader = await navigator?.invokeLoading()
        try {
          if (!handler.wallet) {
            throw ERROR_WIDGET_AUTHENTICATION
          }
          if (!ext) {
            throw ERROR_WIDGET_EXTENSION
          }
          const factory = ext.getFactory(REGOV_CREDENTIAL_TYPE_GROUP)
          const unsginedGroup = await factory.build(handler.wallet, {
            extensions: extensions?.registry, subjectData: {}
          })
          setUnsignedGroup(unsginedGroup)

          methods.setValue('group', {
            ...unsginedGroup.credentialSubject as unknown as GroupSubject,
            creation: {
              credentialName: t('group.creation.defaultName'),
              root: false,
              alert: undefined
            }
          })
        } catch (error) {
          console.error(error)
          if (error.message) {
            methods.setError('group.creation.alert', { type: error.message })
            return
          }
          loader?.error(error.message)
        } finally {
          loader?.finish()
        }
      })().catch(e => { throw e })
    }, [])

    const methods = useForm<GroupCreationFields>({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        group: {
          uuid: '',
          name: '',
          description: '',
          createdAt: '',
          depth: 0,
          creation: {
            credentialName: '',
            root: false,
            alert: undefined
          },
        }
      }
    })

    const isRoot = methods.watch('group.creation.root')

    const create = async (data: GroupCreationFields) => {
      const loader = await navigator?.invokeLoading()
      try {
        if (!handler.wallet) {
          throw ERROR_WIDGET_AUTHENTICATION
        }
        if (!unsginedGroup || !ext) {
          throw ERROR_CREATION_READYTO_SIGN
        }
        const factory = ext.getFactory(unsginedGroup.type)
        const extendSubject = {
          name: data.group.name,
          description: data.group.description
        }
        unsginedGroup.credentialSubject = {
          ...unsginedGroup.credentialSubject,
          ...extendSubject
        }
        const unsigned = isRoot ? await factory.build(handler.wallet, {
          extensions: extensions?.registry,
          subjectData: unsginedGroup.credentialSubject,
          depth: Math.floor(data.group.depth || 0),
          chainedType: REGOV_GROUP_ROOT_TYPE,
        }) : unsginedGroup
        const credential = await factory.sign(handler.wallet, { unsigned })

        const registry = handler.wallet.getRegistry(REGISTRY_TYPE_CREDENTIALS)

        const item = await registry.addCredential(credential)

        item.meta.title = data.group.creation.credentialName

        if (!item.meta.title || item.meta.title === '') {
          item.meta.title = 'My Group'
        }

        loader?.success(t('group.creation.success'))

        handler.notify()

        next()
      } catch (error) {
        console.error(error)
        if (error.message) {
          methods.setError('group.creation.alert', { type: error.message })
          return
        }
        loader?.error(error.message)
      } finally {
        loader?.finish()
      }
    }

    return <WalletFormProvider {...methods}>
      <PrimaryForm {...props} title="group.creation.title">
        <MainTextInput {...props} field="group.creation.credentialName" />
        <MainTextOutput {...props} field="group.uuid" showHint />
        <MainTextInput {...props} field="group.name" />
        <LongTextInput {...props} field="group.description" />
        <MainTextOutput {...props} field="group.createdAt" showHint formatter={dateFormatter} />
        <SwitchInput {...props} field="group.creation.root" />
        {isRoot && <MainTextInput {...props} field="group.depth" />}
        <AlertOutput {...props} field="group.creation.alert" />
        <FormMainAction {...props} title="group.creation.create" action={methods.handleSubmit(create)} />
      </PrimaryForm>
    </WalletFormProvider>
  })

export type GroupCreationParams = EmptyProps & { next: () => void }

export type GroupCreationProps = RegovComponentProps<GroupCreationParams>

export type GroupCreationFields = {
  group: {
    creation: {
      credentialName: string
      root: boolean
      alert: string | undefined
    }
  } & GroupSubject
}