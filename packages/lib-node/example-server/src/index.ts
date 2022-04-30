import "dotenv"
import { buildApp, buildFileStore, buildRotuer, buildServerExtensionRegistry, ServerAppConfig } from "@owlmeans/regov-lib-node"
import { createWalletHandler } from "@owlmeans/regov-ssi-core"
import { buildIdentityExtensionServer } from "@owlmeans/regov-ext-identity/dist/index.server"
import { authServerExtension } from "@owlmeans/regov-ext-auth/dist/index.server"


const EXAMPLE_IDENTITY_TYPE = 'ExampleIdentity'

const config: ServerAppConfig = {
  walletConfig: {
    prefix: process.env.DID_PREFIX,
    defaultSchema: process.env.DID_SCHEMA,
    didSchemaPath: process.env.DID_SCHEMA_PATH
  },
  peerVCs: __dirname + '/../vcs',
  port: parseInt(process.env.SERVER_PORT || '3000')
}

const identity = buildIdentityExtensionServer(
  EXAMPLE_IDENTITY_TYPE, { appName: 'Regov example server wallet' },
  {
    name: '',
    code: 'example-identity',
    organization: 'Example Org.',
    home: 'https://my-example.org/',
    schemaBaseUrl: 'https://my-example.org/schemas/'
  }
)

const registry = buildServerExtensionRegistry()
registry.registerSync(identity)
registry.registerSync(authServerExtension)


buildApp({
  config,
  store: buildFileStore(__dirname + '/../store'),
  handler: createWalletHandler(),
  router: buildRotuer(),
  extensions: registry
}).then(app => app.start())