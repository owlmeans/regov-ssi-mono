
import { PropsWithoutRef, useRef } from 'react'
import { compose } from 'recompose'

import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Button,
  TextField,
  Typography,
  Paper,
  makeStyles,
} from '@material-ui/core'
import { connect, ConnectedProps } from 'react-redux'
import { withRouter } from 'react-router'



import { PropsWithWallet } from '../../model/types'
import { withWallet } from '../../model/context'
import { bundle, unbundle } from '../../model/bundler'
import { buildFormHelper } from '../helper/form'
import { credentialActions } from '../../store'
import { SignedCredentialStateWithErrors } from '../../store/types/credential'
import { RootState } from '../../store/types'
import { credentialHelper } from '../../model/credential'
import { passportHelper } from '../../model/passport'


type CredentialVerifierProps = {
  credential: SignedCredentialStateWithErrors
}

const connector = connect(
  ({ credential: { credential } }: RootState, props: PropsWithWallet) => {
    return {
      credential,
      ...props
    }
  },
  (dispatch, props: PropsWithWallet & CredentialVerifierProps) => {
    return {
      verify: async (fields: VerifierFields) => {
        if (!props.wallet) {
          return
        }
        if (!fields.document) {
          alert('Введите документ!')
          return
        }
        try {
          const bundle = unbundle(fields.document)
          if (bundle.type !== 'credential') {
            dispatch(credentialActions.verify({
              ...bundle.document,
              errors: ['Можно проверить только подписанный документ']
            }))
            alert('Можно проверить только подписанный документ')
            return
          }
          const { result, errors, issuer } = await credentialHelper.verify(
            props.wallet, bundle.document
          )

          dispatch(credentialActions.verify({
            ...bundle.document,
            issuer,
            ...(result ? {} : { errors })
          }))
        } catch (e) {
          console.log(e)
          alert('Документ имеет неверный формат!')
        }
      },

      clear: () => {
        dispatch(credentialActions.cleanUp())
      },

      ...props
    }
  }
)

export const CredentialVerifier = compose(withWallet, withRouter, connector)(
  ({ credential, verify, clear }: PropsWithoutRef<ConnectedProps<typeof connector>>) => {
    const classes = useStyles()
    const helper = buildFormHelper<VerifierFields>([useRef()])

    return credential
      ? <Card>
        <CardHeader title="Проеверенный документ"
          subheader={credential.errors ? 'Документ не верен ❌❌❌' : 'Поздравляем! Документ верен! ✅'} />
        <CardContent>
          <Grid container spacing={2}
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start">
            <Grid item container xs={8} spacing={1}
              direction="column"
              justifyContent="flex-start"
              alignItems="stretch">
              <Grid container item
                direction="column"
                justifyContent="flex-start"
                alignItems="stretch">
                <Grid item>
                  <Typography variant="h6">
                    {credential.errors ? 'Ошибки при проверке' : 'Документ в свободной форме'}
                  </Typography>
                </Grid>
                <Grid item>
                  {
                    credential.errors
                      ? credential.errors.map(
                        error => <Typography color="secondary" variant="caption">
                          {error}
                        </Typography>
                      )
                      : <Paper>
                        <pre className={classes.content}>
                          {
                            credentialHelper.getFreeFormSubjectContent(
                              credential.credential.credentialSubject
                            )
                          }
                        </pre>
                      </Paper>
                  }
                </Grid>
              </Grid>
              <Grid container item
                direction="column"
                justifyContent="flex-start"
                alignItems="stretch">
                <Grid item>
                  <Typography variant="h6">Документ</Typography>
                </Grid>
                <Grid item>
                  <Paper>
                    <pre className={classes.content}>
                      {
                        JSON.stringify(credential.credential, null, 2)
                      }
                    </pre>
                  </Paper>
                </Grid>
              </Grid>
              <Grid container item
                direction="column"
                justifyContent="flex-start"
                alignItems="stretch">
                <Grid item>
                  <Typography variant="h6">Сертификат</Typography>
                </Grid>
                <Grid item>
                  <Paper>
                    <pre className={classes.content}>
                      {
                        JSON.stringify(credential.did, null, 2)
                      }
                    </pre>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
            <Grid item container xs={4} spacing={1}
              direction="column"
              justifyContent="flex-start"
              alignItems="stretch">
              <Grid item container
                direction="column"
                justifyContent="flex-start"
                alignItems="stretch">
                <Grid item>
                  <Typography variant="h6">Издатель</Typography>
                </Grid>
                <Grid item>
                  <Paper>
                    <pre className={classes.content}>
                      {
                        credential.issuer
                          ? passportHelper.getPassportSubjectContent(credential.issuer.credentialSubject)
                          : 'Неизвестен 😞'
                      }
                    </pre>
                  </Paper>
                </Grid>
              </Grid>
              <Grid item>
              <Button fullWidth variant="contained" size="large" color="primary"
                onClick={clear}>
                Очистить
              </Button>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      : <Card>
        <CardHeader title="Проверьте документ" />
        <CardContent>
          <Grid container
            direction="column"
            justifyContent="flex-start"
            alignItems="stretch">
            <Grid item>
              <TextField
                {...helper.produce('document')}
                label="Документ для проверки"
                placeholder={bundle({ fake: 'value' }, 'credential')}
                helperText="Документ должен быть подписан доверенным лицом"
                multiline
                minRows={16}
                maxRows={32}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item container direction="row"
              justifyContent="flex-end"
              alignItems="flex-start">
              <Button variant="contained" size="large" color="primary"
                onClick={() => verify(helper.extract())}>
                Проверить
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
  }
)

const useStyles = makeStyles({
  content: {
    padding: 15,
  }
})

type VerifierFields = {
  document: string
}
