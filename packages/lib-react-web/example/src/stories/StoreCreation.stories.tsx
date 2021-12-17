import React from 'react'

import { Story } from '@storybook/react'
import { useTranslation } from 'react-i18next'
import { StoreCreationWeb } from '@owlmeans/regov-lib-react-web'
import { storeCreationValidationRules } from '@owlmeans/regov-lib-react'


export default {
  component: StoreCreationWeb,
  title: 'Components/StoreCreationWeb',
}

export const Main: Story = () => {
  const { t, i18n } = useTranslation('regov-wallet-store')

  return <StoreCreationWeb i18n={i18n} t={t}
    load={() => alert(1)} rules={storeCreationValidationRules}
    form={{
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        creation: {
          name: 'Default name',
          login: 'def_login',
          password: {
            input: '',
            confirm: ''
          }
        }
      }
    }}
    create={methods => async data => {
      if (data.creation.password.input !== data.creation.password.confirm) {
        methods.setError('creation.password.confirm', { type: 'equal' })
      } else {
        alert(JSON.stringify(data))
      }
    }} />
}