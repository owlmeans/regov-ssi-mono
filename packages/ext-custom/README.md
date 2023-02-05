# `@owlmeans/regov-ext-custom`

## Usage

```
npm install @owlmeans/regov-ext-custom
```

How to use:
```
signatureWebExtension.extension = addCredential(signatureWebExtension.extension, {
  mainType: 'CustomSignature',
  defaultLabel: 'My Custom Signature',
  credentialContext: {
    xs: 'http://www.w3.org/2001/XMLSchema#',
    custom: 'https://my-example.org/custom-signature#',
  },
  subjectMeta: {
    testField: {
      useAt: [
        USE_CREATE_CLAIM, USE_PREVIEW_CLAIM, USE_ITEM_CLAIM, USE_CLAIM_VIEW,
        USE_VIEW_OFFER, USE_ITEM_CRED, USE_CRED_VIEW
      ],
      defaultLabel: 'My Test Field',
      defaultHint: 'My Test Hint',
      validation: { required: true },
      term: { '@id': 'custom:testField', '@type': 'xs:string' }
    },
    issuerField: {
      useAt: [USE_CREATE_OFFER, USE_ITEM_OFFER, USE_VIEW_OFFER, USE_CRED_VIEW],
      validation: { required: true },
      defaultLabel: 'My Issuer Field',
      term: { '@id': 'custom:issuerField', '@type': 'xs:string' }
    },
    scansField: {
      useAt: [USE_CREATE_CLAIM, USE_CLAIM_VIEW, USE_VIEW_OFFER, USE_CRED_VIEW],
      validation: { required: true },
      defaultLabel: 'Scans Field',
      term: addScansContext('custom', 'scansField')
    }
  }
})
```