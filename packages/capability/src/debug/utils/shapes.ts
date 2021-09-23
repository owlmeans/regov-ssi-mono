export const proofShape = {
  created: expect.any(String),
  jws: expect.any(String),
  verificationMethod: expect.any(String),
}

export const didShape = {
  assertionMethod: [
    expect.any(String)
  ],
  authentication: [
    expect.any(String)
  ],
  capabilityDelegation: [
    expect.any(String)
  ],
  capabilityInvocation: [
    expect.any(String)
  ],
  id: expect.any(String),
  keyAgreement: [
    expect.any(String)
  ],
  proof: proofShape,
  publicKey: [
    {
      id: expect.any(String),
      publicKeyBase58: expect.any(String),
    }
  ],
  verificationMethod: [
    {
      controller: expect.any(String),
      id: expect.any(String),
      nonce: expect.any(String),
    }
  ]
}

export const unsginedDidShape = {
  assertionMethod: [
    expect.any(String),
  ],
  authentication: [
    expect.any(String),
  ],
  id: expect.any(String),
  publicKey: [
    {
      id: expect.any(String),
      publicKeyBase58: expect.any(String),
    }
  ],
  verificationMethod: [
    {
      controller: expect.any(String),
      id: expect.any(String),
      nonce: expect.any(String),
      proof: proofShape
    }
  ]
}

export const doubleDidShape = {
  assertionMethod: [
    expect.any(String),
  ],
  authentication: [
    expect.any(String),
  ],
  id: expect.any(String),
  publicKey: [
    {
      id: expect.any(String),
      publicKeyBase58: expect.any(String),
    },
    {
      id: expect.any(String),
      publicKeyBase58: expect.any(String),
    }
  ],
  verificationMethod: [
    {
      controller: expect.any(String),
      id: expect.any(String),
      nonce: expect.any(String),
      proof: proofShape
    },
    {
      controller: expect.any(String),
      id: expect.any(String),
      nonce: expect.any(String),
    }
  ],
  proof: proofShape
}

export const unsignedShape = {
  holder: {
    id: expect.any(String),
  },
  id: expect.any(String),
  issuanceDate: expect.any(String),
}

export const credentialShape = {
  holder: {
    id: expect.any(String),
  },
  id: expect.any(String),
  issuanceDate: expect.any(String),
  issuer: expect.any(String),
  proof: proofShape
}

export const presentationShape = {
  holder: {
    id: expect.any(String),
  },
  id: expect.any(String),
  proof: {
    ...proofShape,
    challenge: expect.any(String),
    domain: expect.any(String),
  }
}