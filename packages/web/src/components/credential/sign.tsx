
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
} from '@material-ui/core'
import { connect, ConnectedProps } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import { PropsWithWallet } from '../../model/types'
import { withWallet } from '../../model/context'
import { bundle, unbundle } from '../../model/bundler'
import { buildFormHelper } from '../helper/form'
import { credentialActions } from '../../store'
import { RootState } from '../../store/types'
import { credentialHelper } from '../../model/credential'
import { CredentialClaimState, SignedCredentialState } from '../../store/types/credential'


const connector = connect(
  (
    { credential: { claim, signed } }: RootState,
    props: RouteComponentProps & PropsWithWallet & PropsWithoutRef<SignerProps>
  ) => {
    return {
      claim,
      signed,
      ...props
    }
  },
  (dispatch, props) => {
    return {
      unbundle: async (fields: SignerFields) => {
        if (!fields.document) {
          alert('Предоставьте документ!')
          return
        }
        try {
          const bundle = unbundle(fields.document)
          if (bundle.type !== 'claim') {
            alert('Выписать документ можно только по заявке!')
            return
          }

          dispatch(credentialActions.review(bundle.document))
        } catch (e) {
          console.log(e)
          alert('Неверный формат документа!')
        }
      },

      sign: async (claim: CredentialClaimState) => {
        if (!props.wallet || !claim) {
          return
        }

        const signed = await credentialHelper.signClaim(
          props.wallet, JSON.parse(JSON.stringify(claim))
        )

        dispatch(credentialActions.sign(signed))
      },

      clear: () => {
        dispatch(credentialActions.cleanUpClaim())

        // props.history.push('/wallet')
      },

      ...props
    }
  }
)

export const IssuerCredentialSigner = compose(withWallet, withRouter, connector)(
  ({ claim, signed, unbundle, sign, clear }: PropsWithoutRef<ConnectedProps<typeof connector>>) => {
    const helper = buildFormHelper<SignerFields>([useRef()])

    return <Card>
      <CardHeader title="Выпишите документ по заявке" />
      <CardContent>
        {
          (() => {
            switch (true) {
              case !!signed:
                return <Grid container
                  direction="column"
                  justifyContent="flex-start"
                  alignItems="stretch">
                  <Grid item>
                    <Typography>Документ в свободной форме</Typography>
                    <pre>{
                      signed.credential?.credentialSubject
                        ? credentialHelper.getFreeFormSubjectContent(signed.credential.credentialSubject)
                        : ''
                    }</pre>
                  </Grid>
                  <Grid item>
                    <Typography>Документ</Typography>
                    <pre>{JSON.stringify(signed.credential, null, 2)}</pre>
                  </Grid>
                  <Grid item>
                    <Typography>Сертификат документа</Typography>
                    <pre>{JSON.stringify(signed.did, null, 2)}</pre>
                  </Grid>
                  <Grid item container direction="row"
                    justifyContent="flex-end"
                    alignItems="flex-start">
                    <Grid item container direction="column"
                      justifyContent="flex-start"
                      alignItems="flex-end" xs={5} spacing={1}>
                      <Grid item>
                        <Typography variant="caption" color="secondary">Вы успешно подписали документ!</Typography>
                      </Grid>
                      <Grid container item direction="row"
                        justifyContent="space-between"
                        alignItems="center">
                        <Grid item>
                          <Button variant="contained" size="large" color="secondary"
                            onClick={clear}>
                            Очистить
                          </Button>
                        </Grid>
                        <Grid item>
                          <CopyToClipboard text={
                            signed.credential?.id ? bundle(signed, 'credential') : ''
                          }>
                            <Button variant="contained" size="large" color="primary">
                              Скопировать
                            </Button>
                          </CopyToClipboard>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              case !!claim:
                return <Grid container
                  direction="column"
                  justifyContent="flex-start"
                  alignItems="stretch">
                  <Grid item>
                    <Typography>Заявка на документ в свободной форме</Typography>
                    <pre>{
                      claim.credential?.credentialSubject
                        ? credentialHelper.getFreeFormSubjectContent(claim.credential.credentialSubject)
                        : ''
                    }</pre>
                  </Grid>
                  <Grid item>
                    <Typography>Заявка на документ</Typography>
                    <pre>{JSON.stringify(claim.credential, null, 2)}</pre>
                  </Grid>
                  <Grid item>
                    <Typography>Заявка на сертификат для документа</Typography>
                    <pre>{JSON.stringify(claim.did, null, 2)}</pre>
                  </Grid>
                  <Grid item container direction="row"
                    justifyContent="flex-end"
                    alignItems="flex-start">
                    <Button variant="contained" size="large" color="primary"
                      onClick={() => sign(claim)}>
                      Подписать
                    </Button>
                  </Grid>
                </Grid>
              default:
                return <Grid container
                  direction="column"
                  justifyContent="flex-start"
                  alignItems="stretch">
                  <Grid item>
                    <TextField
                      {...helper.produce('document')}
                      label="Заявка для рассмотрения"
                      placeholder={bundle({ fake: 'value' }, 'claim')}
                      helperText="Заявка должна быть сгенерирована другим кошельком"
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
                      onClick={() => unbundle(helper.extract())}>
                      Рассмотреть
                    </Button>
                  </Grid>
                </Grid>

            }
          })()
        }
      </CardContent>
    </Card>
  }
)

type SignerProps = {
  claim: CredentialClaimState
  signed: SignedCredentialState
}

type SignerFields = {
  document: string
}
