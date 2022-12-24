/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const path = require('path')
const { getDefaultMetroConfig } = require('@owlmeans/regov-lib-native/dist/metro')


module.exports = {
  watchFolders: [path.resolve(__dirname, '..'), path.resolve(__dirname, '../..')],
  ...getDefaultMetroConfig(__dirname, '../../')
}
