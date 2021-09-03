
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

import { BasicStore, DEFAULT_WALLET_ALIAS } from 'metabelarusid-core'

import { produceWalletContext } from '../../model/context'
import { storeActions } from '../../store'
import { buildFormHelper } from '../helper/form'

const connector = connect(
  (_, props) => { return { ...props } },
  (dispatch, props) => {
    return {
      setCurrentStore: async (fields: CreationFields, history: History) => {
        if (!fields.alias
          || !fields.password
          || !fields.name
          || fields.password !== fields.confirmation) {
          alert('Заполните форму корректно!')
          return
        }
        const store: BasicStore = {
          name: fields.name,
          alias: fields.alias,
        }
        const wallet = await produceWalletContext(
          fields.password, store
        )
        dispatch(storeActions.update(await wallet.export()))
        history.push(generatePath('/wallet'))
      },
      ...props
    }
  }
)

export const StoreCreation = compose(connector, withRouter)(
  ({
    setCurrentStore,
    history
  }: PropsWithChildren<ConnectedProps<typeof connector> & RouteComponentProps>) => {
    const helper = buildFormHelper<CreationFields>([
      useRef(),
      useRef(),
      useRef(),
      useRef(),
    ])


    return <Card>
      <CardHeader title="Создайте новый Кошелёк и ID"
        action={<Button variant="contained" size="small"
          onClick={() => history.push('/store/import')}>Импортировать</Button>} />
      <CardContent>
        <Grid container
          direction="column"
          justifyContent="center"
          alignItems="stretch">
          <Grid container spacing={1}>
            <TextField
              {...helper.produce('name')}
              label="Наменование вашего кошелька"
              defaultValue="Главный  кошелёк"
              helperText="Введите любое удобное для вас имя"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              variant="outlined"
            />
          </Grid>
          <Grid container spacing={1}>
            <TextField
              {...helper.produce('alias')}
              label="Логин"
              defaultValue={DEFAULT_WALLET_ALIAS}
              helperText="Придумайте себе логин или оставьте предложенный"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              variant="outlined"
            />
          </Grid>
          <Grid container
            direction="row"
            justifyContent="space-between"
            alignItems="center" spacing={1}>
            <Grid item xs={6}>
              <TextField
                {...helper.produce('password')}
                type="password"
                autoComplete="new-password"
                label="Пароль"
                helperText="Придумайте пароль"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                {...helper.produce('confirmation')}
                type="password"
                autoComplete="new-password"
                label="Подтверждение пароля"
                helperText="Запомните свой пароль!"
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
            alignItems="center"
            spacing={1}>
            <Grid item xs={6}>
              <Button fullWidth variant="contained" size="large" color="primary"
                onClick={() => setCurrentStore(helper.extract(), history)}>
                Создать
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  }
)

type CreationFields = {
  alias: string,
  password: string,
  name: string,
  confirmation: string
}