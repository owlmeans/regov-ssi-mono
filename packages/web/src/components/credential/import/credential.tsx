
import { PropsWithoutRef, useRef } from 'react'
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
import { withRouter, RouteComponentProps } from 'react-router'


import { REGISTRY_TYPE_IDENTITIES } from 'metabelarusid-core'

import { PropsWithWallet } from '../../../model/types'
import { withWallet } from '../../../model/context'
import { bundle, unbundle } from '../../../model/bundler'
import { buildFormHelper } from '../../helper/form'
import { storeActions } from '../../../store'


type WalletCredentialImporterRouteParams = {
  section: string
} & { [k: string]: string }

const connector = connect(
  (_, props: RouteComponentProps<WalletCredentialImporterRouteParams> & PropsWithWallet) => {
    return {
      section: props.match.params.section,
      ...props
    }
  },
  (dispatch, props) => {
    return {
      store: async (fields: ImporterFields) => {
        if (!fields.document) {
          alert('Предоставьте документ!')
          return
        }
        try {
          const bundle = unbundle(fields.document)
          // @TODO We need to make system import issued documents for holder
          if (bundle.type !== 'identity') {
            alert('Сейчас можно только добавить паспорт доверенного лица!')
            return 
          }

          await props.wallet.getRegistry(REGISTRY_TYPE_IDENTITIES).addCredential(
            bundle.document.credential
          )
          props.wallet.did.addPeerDID(bundle.document.did)
          
          dispatch(storeActions.tip())

          alert('Документ успешно добавлен в кошелёк!')

          props.history.push('/wallet')
        } catch(e) {
          console.log(e)
          alert('Неверный формат документа!')
        }
      },
      ...props
    }
  }
)

export const WalletCredentialImporter = compose(withWallet, withRouter, connector)(
  ({ store, section }: PropsWithoutRef<ConnectedProps<typeof connector>>) => {
    const helper = buildFormHelper<ImporterFields>([useRef()])
    const subheader = section === 'peer'
      ? 'Для добавления паспарта доверенного лица'
      : 'Для добавления личных документов удостоверенных доверенными лицами'

    return <Card>
      <CardHeader title="Предоставьте документ"
        subheader={subheader} />
      <CardContent>
        <Grid container
          direction="column"
          justifyContent="flex-start"
          alignItems="stretch">
          <Grid item>
            <TextField
              {...helper.produce('document')}
              label="Документ для импорта"
              placeholder={bundle({ fake: 'value' }, 'sometype')}
              helperText="Документ должен быть сгенерирован другим кошельком"
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
              onClick={() => store(helper.extract())}>
              Импортировать
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  }
)

type ImporterFields = {
  document: string
}
