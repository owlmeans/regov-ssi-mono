/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const path = require('path')

module.exports = {
  watchFolders: [path.resolve(__dirname, '..'), path.resolve(__dirname, '../..')],
  resolver: {
    extraNodeModules: {
      'url': path.resolve(__dirname, '../../node_modules/react-native-url-polyfill'),
      crypto: path.resolve(__dirname, '../../node_modules/react-native-crypto'),
      buffer: path.resolve(__dirname, 'node_modules/buffer'),
      stream: path.resolve(__dirname, '../../node_modules/stream-browserify')
    },
    resolverMainFields: ['react-native', 'browser', 'module', 'main']
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  }
}
