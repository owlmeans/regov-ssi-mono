
export const config = {
  DID_PREFIX: process.env.REACT_APP_DID_PREFIX || 'exwaldid',
  DID_SCHEMA_PATH: process.env.REACT_APP_DID_SCHEMA_PATH || 'exdid-schema',
  code: process.env.REACT_APP_BUNDLE_CODE || 'excode',
  baseSchemaUrl: process.env.REACT_APP_SCHEMA_URL || undefined,
  name: process.env.REACT_APP_NAME || 'Noname app',
  development: false
}