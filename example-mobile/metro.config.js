module.exports = {
  resolver: {
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'mjs'], //add here
    resolverMainFields: ['react-native', 'browser', 'module', 'main'],
    extraNodeModules: {
      mobileRandomBytes: require.resolve('@affinidi/wallet-react-native-sdk/mobileRandomBytes'),
      crypto: require.resolve('react-native-crypto'),
      stream: require.resolve('stream-browserify'),
      vm: require.resolve('vm-browserify')
    },
  },
}