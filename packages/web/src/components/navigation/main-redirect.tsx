import { compose } from "@reduxjs/toolkit"
import { connect, ConnectedProps } from "react-redux"
import { Redirect, withRouter, RouteComponentProps } from "react-router"
import { withWallet } from "../../model/context"
import { PropsWithWallet } from "../../model/types"

import { RootState } from '../../store/types'


const connector = connect(
  ({ store: { current, stores } }: RootState, props: PropsWithWallet) => {
    return { current, stores, ...props }
  }
)

export const NavigationMainRedirect = compose(withWallet, withRouter, connector)(
  ({ current, stores, wallet, match }: RouteComponentProps & ConnectedProps<typeof connector>) => {
    if (!Object.entries(stores).length) {
      return <Redirect to='/store/create' />
    }
    if (!wallet && current) {
      return <Redirect to={`/store/login/${current}`} />
    }
    if (!current && Object.entries(stores).length) {
      return <Redirect to={`/store`} />
    }
    if (match.path === '/') {
      return <Redirect to={`/store`} />
    }
  }
)