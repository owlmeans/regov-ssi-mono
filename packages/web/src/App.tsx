
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import { Container } from '@material-ui/core'

import { store, persistor } from './store'
import { RootNavigation } from './navigation/index'
import { WalletProvider } from './model/context'

export const App = () => {
  return (
    <Provider store={store}>
      <Container maxWidth="md">
        <PersistGate
          loading={null}
          persistor={persistor}>
          <WalletProvider>
            <RootNavigation />
          </WalletProvider>
        </PersistGate>
      </Container>
    </Provider>
  )
}