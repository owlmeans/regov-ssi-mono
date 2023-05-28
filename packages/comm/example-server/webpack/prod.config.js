const path = require('path')

const { NODE_ENV = 'production' } = process.env

module.exports = {
  mode: NODE_ENV,
  entry: './dist/index.js',
  target: 'node',
  module: {
    rules: [{
      test: /\.js$/,
      // exclude: /node_modules/,
      use: {
        loader: "babel-loader"
      }
    }]
  },
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: 'comm-serv.js'
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      'rdf-canonize-native': false,
      'web-streams-polyfill/ponyfill/es2018': path.resolve(__dirname, '../node_modules/web-streams-polyfill/dist/polyfill.es2018.min.js'),
      'jsonld-signatures': path.resolve(__dirname, '../node_modules/jsonld-signatures/lib/jsonld-signatures.js'),
      '@digitalbazaar/jws-linked-data-signature': path.resolve(__dirname, '../node_modules/@digitalbazaar/jws-linked-data-signature/lib/index.js'),
      'jsonld': path.resolve(__dirname, '../node_modules/jsonld'),
      // 'jsonld': path.resolve(__dirname, '../node_modules/jsonld/lib/index.js'),
      // 'jsonld/lib/events': path.resolve(__dirname, '../node_modules/jsonld/lib/events.js'),
    }
  },
}
