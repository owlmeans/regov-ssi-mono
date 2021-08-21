
import { PropsWithChildren, PropsWithoutRef, useRef } from 'react'
import { compose } from 'recompose'

import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Button,
  TextField,
  Typography,
} from '@material-ui/core'
import { connect, ConnectedProps } from 'react-redux'

import { withWallet } from '../../model/context'
import { PropsWithWallet } from '../../model/types'
import { buildFormHelper } from '../helper/form'
import { RootState } from '../../store/types'
import { WalletWrapper } from 'metabelarusid-core'
import { passportHelper } from '../../model/passport'
import { identityActions, storeActions } from '../../store'
import { generatePath, RouteComponentProps, withRouter } from 'react-router-dom'


const connector = connect(
  ({ identity: { created } }: RootState, props: PropsWithWallet) => {
    return {
      created: created,
      ...props
    }
  },
  (dispatch, props: PropsWithWallet) => {
    return {
      create: async (fields: PassportFields) => {
        console.log(fields)
        if (!fields.info) {
          alert('Пожалуйста напишите что нибудь о себе! Эта информация будет доступна только вам.')
        }

        await passportHelper.createPassport(props.wallet, fields.info)

        dispatch(identityActions.tip())
        dispatch(storeActions.tip())
      },
      ...props
    }
  }
)

export const WalletPassport = compose(withWallet, withRouter, connector)(
  ({
    created,
    create,
    wallet,
    history
  }: PropsWithChildren<
    ConnectedProps<typeof connector> & PropsWithWallet & RouteComponentProps
  >) => {
    const helper = buildFormHelper<PassportFields>([useRef()])

    return wallet && wallet.hasIdentity()
      ? <Card>
        <CardHeader title="У вас есть паспорт" />
        <CardContent>
          <Grid container
            direction="column"
            justifyContent="center"
            alignItems="stretch"
            spacing={3}>
            {
              created ? <Grid item>
                <Typography variant="body2" color='primary'>
                  Поздравляем! Вы создали паспорт!
                </Typography>
              </Grid> : undefined
            }
            <Grid item>
              <Typography variant="body1">
                Информация для контролёра: {passportHelper.getPassportInfo(wallet)}
              </Typography>
            </Grid>
            <Grid container item
              direction="row"
              justifyContent="flex-end"
              alignItems="center">
              <Grid item xs={6}>
                <Button fullWidth variant="contained" size="large" color="primary"
                  onClick={() => history.push(generatePath('/wallet/export/identity/passport'))}>
                  Предоставить
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      : <Card>
        <CardHeader title="Создайте себе паспорт" />
        <CardContent>
          <Grid container
            direction="column"
            justifyContent="center"
            alignItems="stretch">
            <Grid item>
              <Typography variant="body2">
                Паспорт - это набор различных персональных данных о вас хранящихся внутри
                одной "обложки". Эту "обложку" вы можете создать себе сами совершенно бесплатно
                прямо сейчас.
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="caption" color="error">
                ВНИМАНИЕ! Вы сами создаёте свой паспорт с помощью алгоритмов криптографии.
                Этот паспорт привязан к данному кошельку. Кошелёк хранится только у вас
                он никуда не передаётся. Соответственно при утрате данного кошелька (его
                данных с вашего устройства) или же пароля от данного кошелька, паспорт
                будет безвозвратно утерян.
              </Typography>
            </Grid>
            <Grid item>
              <TextField
                {...helper.produce('info')}
                label="Личные информация"
                defaultValue="Я простой гражданин Республики Беларусь"
                helperText="Это те данные, которые будут видеть все, кому вы предъявите паспорт. 
                Это может быть произвольная информация о вас, упрощающая понимание контролёра."
                multiline
                minRows={3}
                maxRows={6}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
            <Grid container
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
              spacing={1}>
              <Grid item xs={6}>
                <Button fullWidth variant="contained" size="large" color="primary"
                  onClick={() => create(helper.extract())}>
                  Создать
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
  }
)

type PassportFields = {
  info: string
}