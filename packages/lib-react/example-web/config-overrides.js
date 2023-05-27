/**
 *  Copyright 2022 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

// const { override, addExternalBabelPlugin, addWebpackAlias } = require('customize-cra')
const path = require('path')
const NodePlugin = require('node-polyfill-webpack-plugin')


// console.log(override(
//   addExternalBabelPlugin('@babel/plugin-proposal-nullish-coalescing-operator'),
//   addWebpackAlias({
//     url: path.resolve(__dirname, 'node_modules/url'),
//     crypto: require.resolve("crypto-browserify"),
//     os: require.resolve("os-browserify/browser"),
//     path: require.resolve("path-browserify"),
//     stream: require.resolve("stream-browserify"),
//     buffer: require.resolve('buffer/'),

//   })
// )().paths())

// process.exit()

module.exports = (config, env) => {
  config.plugins ??= []
  config.plugins.push(new NodePlugin())
  config.resolve ??= {}
  config.resolve.alias ??= {}
  // config.resolve.alias['react'] = path.resolve(__dirname, 'node_modules/react')
  // config.resolve.alias['react'] = require.resolve('react')
  // config.resolve.alias['react-dom'] = path.resolve(__dirname, 'node_modules/react-dom')
  // config.resolve.alias['react-dom'] = require.resolve('react-dom')
  // config.resolve.alias['did-jwt'] = path.resolve(__dirname, 'node_modules/did-jwt')
  // Object.entries({
  //   url: path.resolve(__dirname, 'node_modules/url'),
  //   crypto: require.resolve("crypto-browserify"),
  //   os: require.resolve("os-browserify/browser"),
  //   path: require.resolve("path-browserify"),
  //   stream: require.resolve("stream-browserify"),
  //   buffer: require.resolve('buffer/'),
  // }).forEach(([alias, path]) => config.resolve.alias[alias] = path)

  return config
}


// module.exports = override(
//   addExternalBabelPlugin('@babel/plugin-proposal-nullish-coalescing-operator'),
//   addWebpackAlias({
//     url: path.resolve(__dirname, 'node_modules/url'),
//     crypto: require.resolve("crypto-browserify"),
//     os: require.resolve("os-browserify/browser"),
//     path: require.resolve("path-browserify"),
//     stream: require.resolve("stream-browserify"),
//     buffer: require.resolve('buffer/'),

//   })
// )