import React from 'react'

import { Text, View } from 'react-native'
import { DebugSSIView } from '@owlmeans/regov-lib-native'


const App = () => {
  return <View>
    <Text>Hello world 1</Text>
    <DebugSSIView />
  </View>
}

export default App