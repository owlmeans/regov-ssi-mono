import { Button, Card, CardActions, CardContent, CardHeader, Grid, List, ListItem, ListItemSecondaryAction, ListItemText } from "@material-ui/core"
import { compose } from "@reduxjs/toolkit"
import { connect, ConnectedProps } from "react-redux"
import { RouteComponentProps, withRouter } from "react-router"
import { removeWalletContext, withWallet } from "../../model/context"
import { PropsWithWallet } from "../../model/types"
import { storeActions } from "../../store"
import { RootState } from "../../store/types"


const connector = connect(
  ({ store: { stores } }: RootState, props: RouteComponentProps) => {
    return { stores, ...props }
  },
  (dispatch, props: RouteComponentProps & PropsWithWallet) => {
    return {
      remove: (alias: string) => {
        dispatch(storeActions.remove(alias))
        removeWalletContext(alias)
      },
      ...props
    }
  }
)

export const StoreList = compose(withWallet, withRouter, connector)(
  ({ stores, remove, history }: RouteComponentProps & ConnectedProps<typeof connector>) => {
    return <Card>
      <CardHeader title="Список кошельков на устройстве" />
      <CardContent>
        <List>
          {Object.entries(stores).map(
            ([alias, store]) => <ListItem key={alias} button
              onClick={() => history.push(`/store/login/${alias}`)}>
              <ListItemText primary={store.name} secondary={alias} />
              <ListItemSecondaryAction>
                <Button variant="contained" onClick={() => remove(alias)}>Удалить</Button>
              </ListItemSecondaryAction>
            </ListItem>
          )}
        </List>
      </CardContent>
      <CardActions>
        <Grid container spacing={2}
          direction="row"
          justifyContent="flex-end"
          alignItems="center">
          <Grid item>
            <Button variant="contained"
              onClick={() => history.push('/store/import')}>Импортировать</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={() => history.push('/store/create')}>Создать</Button>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  }
)