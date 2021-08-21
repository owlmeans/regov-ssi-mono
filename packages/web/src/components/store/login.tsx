
import { PropsWithChildren, useRef } from 'react'
import { compose } from 'recompose'

import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Button,
  TextField,
} from '@material-ui/core'
import { connect, ConnectedProps } from 'react-redux'
import { withRouter, generatePath, RouteComponentProps } from 'react-router'
import { History } from 'history'

import { EncryptedStore } from 'metabelarusid-core'

import { produceWalletContext } from '../../model/context'
import { buildFormHelper } from '../helper/form'
import { RootState } from '../../store/types'

const connector = connect(
  ({ store: { current, stores } }: RootState, props: RouteComponentProps<{store: string}>) => {
    const params = props.match.params
    if (!params.store || !stores[params.store]) {
      params.store = current
    }
    return {
      store: stores[params.store],
      ...props
    }
  },
  (dispatch, props) => {
    return {
      login: async (fields: LoginFields, store: EncryptedStore, history: History) => {
        if (!fields.password) {
          alert('Введите пароль')
          return
        }
        try {
          const wallet = await produceWalletContext(fields.password, store)
          if (!wallet.store.alias) {
            throw new Error('Что-то пошло не так')
          }

          history.push(generatePath('/wallet'))
        } catch (e) {
          alert(`Не могу открыть кошелёк: ${e.toString()}`)
        }
      },
      ...props
    }
  }
)

export const StoreLogin = compose(withRouter, connector)(
  ({
    store,
    login,
    history
  }: PropsWithChildren<ConnectedProps<typeof connector> & RouteComponentProps>) => {
    const helper = buildFormHelper<LoginFields>([useRef()])

    return <Card>
      <CardHeader title={`Откройте "${store.name}"`} />
      <CardContent>
        <Grid container
          direction="column"
          justifyContent="center"
          alignItems="stretch">
          <Grid container
            direction="row"
            justifyContent="space-between"
            alignItems="center">
            <Grid container>
              <TextField
                {...helper.produce('password')}
                type="password"
                autoComplete="current-password"
                label="Пароль"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
          </Grid>
          <Grid container
            direction="row"
            justifyContent="flex-end"
            alignItems="center">
            <Grid item xs={6}>
              <Button fullWidth variant="contained" size="large" color="primary"
                onClick={() => login(helper.extract(), store, history)}>
                Открыть
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  }
)

type LoginFields = {
  password: string
}