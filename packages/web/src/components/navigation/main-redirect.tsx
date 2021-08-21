import { connect, ConnectedProps } from "react-redux"
import { Redirect } from "react-router"

import { RootState } from '../../store/types'


const connector = connect(
  ({ store: { current } }: RootState, props) => {
    return { current, ...props }
  }
)

export const NavigationMainRedirect = connector(
  ({ current }: ConnectedProps<typeof connector>) =>
    <Redirect to={`/${current ? `store/login/${current}` : 'store'}`} />
)