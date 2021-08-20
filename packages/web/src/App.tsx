
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import { Container, Box/*, Typography*/ } from '@material-ui/core'

import { store, persistor } from './store/config'
import { RootNavigation } from './navigation/index'

export const App = () => {
  return (
    <Provider store={store}>
      <Container maxWidth="sm">
        <PersistGate
          loading={null}
          persistor={persistor}>
          <Box my={4}>
            <RootNavigation />
            {/* <Typography variant="h4" component="h1" gutterBottom>
              Create React App v4-beta example with TypeScript
            </Typography> */}
          </Box>
        </PersistGate>
      </Container>
    </Provider>
  )
}