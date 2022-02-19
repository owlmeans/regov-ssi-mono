import React, { FunctionComponent, useEffect, useState, } from 'react'
import { Extension } from '@owlmeans/regov-ssi-extension'
import { REGOV_CREDENTIAL_TYPE_GROUP, GroupSubject } from '@owlmeans/regov-ext-groups'
import { EmptyProps, generalNameVlidation, RegovComponentProps, useRegov, withRegov } from '@owlmeans/regov-lib-react'
import { useForm } from 'react-hook-form'
import {
  AlertOutput, dateFormatter, FormMainAction, LongTextInput, MainTextInput, MainTextOutput,
  PrimaryForm, WalletFormProvider
} from '@owlmeans/regov-mold-wallet-web'
import {
  ERROR_WIDGET_AUTHENTICATION, ERROR_WIDGET_EXTENSION, ERROR_CREATION_READYTO_SIGN
} from '../../types'
import { REGISTRY_TYPE_CREDENTIALS, UnsignedCredential } from '@owlmeans/regov-ssi-core'


export const GroupCreation = (ext: Extension): FunctionComponent<GroupCreationParams> =>
  withRegov<GroupCreationProps>({ namespace: ext.localization?.ns }, ({ t, i18n, navigator, next }) => {
    const { handler } = useRegov()
    const props = {
      t, i18n,
      rules: {
        'group.creation.credentialName': generalNameVlidation(true),
        'group.name': {
          required: true, maxLength: 192, validate: {
            pattern: (v: string) => !v.match(/[\<\>\[\]\{\}\\\']/)
          }
        },
        'group.description': { maxLength: 1024 },
      }
    }
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
          const unsginedGroup = await factory.buildingFactory(handler.wallet, { subjectData: {} })
          setUnsignedGroup(unsginedGroup)

          methods.setValue('group', {
            ...unsginedGroup.credentialSubject as unknown as GroupSubject,
            creation: {
              credentialName: t('group.creation.defaultName'),
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
          creation: {
            credentialName: '',
            alert: undefined
          },
        }
      }
    })

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
        const credential = await factory.signingFactory(handler.wallet, { unsigned: unsginedGroup })

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
      alert: string | undefined
    }
  } & GroupSubject
}