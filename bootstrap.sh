yarn install
yarn lerna clean
cd packages/tiny-secp256k1-2019
yarn build
yarn lerna link
yarn link
cd ../../packages/core
yarn build
yarn lerna link
yarn link
cd ../../packages/comm
yarn build
yarn lerna link
yarn link
cd ../../packages/lib-node
yarn build
yarn lerna link
yarn link
cd ../../packages/lib-react
yarn build
yarn lerna link
yarn link
cd ../../packages/ext-comm
yarn build
yarn lerna link
yarn link
cd ../../packages/ext-auth
yarn build
yarn lerna link
yarn link
cd ../../packages/ext-identity
yarn build
yarn lerna link
yarn link
cd ../../packages/ext-groups
yarn build
yarn lerna link
yarn link
cd ../../packages/ext-doc-signature
yarn build
yarn lerna link
yarn link
cd ../../packages/ext-custom
yarn build
yarn lerna link
yarn link
cd ../..
yarn lerna bootstrap
