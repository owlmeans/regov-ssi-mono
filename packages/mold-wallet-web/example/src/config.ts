
export const config = {
  DID_PREFIX: process.env.REACT_APP_DID_PREFIX || 'exwaldid',
  code: process.env.REACT_APP_BUNDLE_CODE || 'excode',
  baseSchemaUrl: process.env.REACT_APP_DID_SCHEMA || undefined,
  name: process.env.REACT_APP_NAME || 'Noname app',
  development: true
}