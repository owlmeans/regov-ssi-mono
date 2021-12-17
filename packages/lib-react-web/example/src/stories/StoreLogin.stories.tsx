import React from 'react'

import { Story } from '@storybook/react'
import { StoreLoginWeb } from '@owlmeans/regov-lib-react-web'
import { useTranslation } from 'react-i18next'
import { storeLoginValidationRules } from '@owlmeans/regov-lib-react'

export default {
  componet: StoreLoginWeb,
  title: 'Components/StoreLoginWeb'
}


export const Main: Story = () => {
  const { t, i18n } = useTranslation('regov-wallet-store')

  return <StoreLoginWeb i18n={i18n} t={t} rules={storeLoginValidationRules}
    name="Example"
    form={{
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        login: {
          password: ''
        }
      }
    }}
    login={methods => async data => {
      if (data.login.password === '11111111') {
        methods.setError('login.alert', { type: 'test' })
      } else {
        alert(JSON.stringify(data))
      }
    }} />
}