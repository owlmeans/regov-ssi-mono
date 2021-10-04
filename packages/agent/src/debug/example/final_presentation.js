const x = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
  ],
  id: "urn:uuid:2a18c520-e43b-47e1-886b-69a8e675ca34",
  type: [
    "VerifiablePresentation",
    "CredentialResponse",
  ],
  holder: {
    id: "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR",
  },
  verifiableCredential: [
    {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        {
          "@version": 1.1,
          scm: "https://example.org/entity/idnetity#",
          data: {
            "@context": {
              "@version": 1.1,
              scmdata: "https://example.org/entity/idnetity/data#",
            },
            "@id": "scmdata:id",
            "@type": "scmdata:type",
          },
          did: {
            "@id": "scm:did",
            "@type": "@json",
          },
          identity: {
            "@id": "scm:identity",
            "@type": "@json",
          },
        },
      ],
      id: "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR",
      type: [
        "VerifiableCredential",
        "EntityIdentity",
      ],
      holder: {
        id: "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR",
      },
      credentialSubject: {
        data: {
          "@type": "EntityIdentity",
          identity: {
            "@context": [
              "https://www.w3.org/2018/credentials/v1",
              {
                "@version": 1.1,
                scm: "https://example.org/identity#",
                data: {
                  "@context": {
                    "@version": 1.1,
                    scmdata: "https://example.org/identity/data#",
                  },
                  "@id": "scmdata:id",
                  "@type": "scmdata:type",
                },
                xsd: "http://www.w3.org/2001/XMLSchema#",
                firstname: {
                  "@id": "scm:firstname",
                  "@type": "xsd:string",
                },
                lastname: {
                  "@id": "scm:lastname",
                  "@type": "xsd:string",
                },
              },
            ],
            id: "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR",
            type: [
              "VerifiableCredential",
              "TestUtilIdentity",
            ],
            holder: {
              id: "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR",
            },
            credentialSubject: {
              data: {
                "@type": "TestUtilIdentity",
                firstname: "alice",
                lastname: "Lastname",
              },
            },
            issuanceDate: "2021-09-29T21:43:39.756Z",
            issuer: "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR",
            proof: {
              type: "EcdsaSecp256k1Signature2019",
              created: "2021-09-29T21:43:39Z",
              verificationMethod: "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR#holder",
              proofPurpose: "assertionMethod",
              jws: "eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..wneW4nk5LTTb_8kH4twBdahmly-G20P92s2U9uMW_md-FCUfryt9d51pl0Bf9zmFza5QKr4g6FcV2FG9XRxbOg",
            },
          },
        },
        did: {
          "@context": [
            "https://w3id.org/did/v1",
            "https://w3id.org/security/v2",
          ],
          id: "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR",
          verificationMethod: [
            {
              id: "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR#holder",
              controller: "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR",
              nonce: "CEvUjbvqpT:8mQ4MMFTsUpydfCo7uRekKr3wmt6XyLTP6reLX1Vmo9L",
              type: "EcdsaSecp256k1VerificationKey2019",
              publicKeyBase58: "u2DiD8YVeVq8DYEK99vew7q52uxjLzS6gBCPnStkQgR9",
            },
          ],
          authentication: [
            "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR#holder",
          ],
          assertionMethod: [
            "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR#holder",
          ],
          keyAgreement: [
            "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR#holder",
          ],
          capabilityInvocation: [
            "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR#holder",
          ],
          capabilityDelegation: [
            "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR#holder",
          ],
          proof: {
            type: "EcdsaSecp256k1Signature2019",
            created: "2021-09-29T21:43:38Z",
            verificationMethod: "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR#holder",
            proofPurpose: "verificationMethod",
            jws: "eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..Oh8MX3dJYuqjgfY3746ZiABO0FggupaJmw3xqIb7PsF8mjt4e6a3RCVC00KpzKsJOJao_SXArWMPNGzkUnG_4Q",
          },
        },
      },
      issuanceDate: "2021-09-29T21:44:39.976Z",
      issuer: "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR",
      proof: {
        type: "EcdsaSecp256k1Signature2019",
        created: "2021-09-29T21:44:39Z",
        verificationMethod: "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR#holder",
        proofPurpose: "assertionMethod",
        jws: "eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..WuevpQrJX_YUcK2bJp4qi7o41TRDxYpDM8-tDyp7iYcxbxcThvapsPVNzHfxwkyrTGthRLBZltyfpQZooje5cA",
      },
    },
    {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        {
          "@version": 1.1,
          scm: "https://example.org/testdocument#",
          data: {
            "@id": "scm:data",
            "@type": "@json",
          },
        },
      ],
      id: "did:test:Ag153gXNR7B147Xo6SZ58N42fVDt88qBKDJSj6Nw9Jcp",
      type: [
        "VerifiableCredential",
        "TestDocument",
      ],
      holder: {
        id: "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR",
      },
      credentialSubject: {
        data: {
          "@type": "TestDocument",
          key: "testdoc1",
          comment: "nice doc for alice",
        },
      },
      issuanceDate: "2021-09-29T21:43:54.528Z",
      issuer: "did:test:6UnTRcxxA2J34p7KZA5sbKUBkRVud1WmuKQJxc8idsjD",
      proof: {
        type: "EcdsaSecp256k1Signature2019",
        created: "2021-09-29T21:44:02Z",
        verificationMethod: "did:test:6UnTRcxxA2J34p7KZA5sbKUBkRVud1WmuKQJxc8idsjD#holder",
        proofPurpose: "assertionMethod",
        jws: "eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..qN9pHS3RKsCxyQz1_S9gY0RQP-r-aMnqejs2i1EY35FkUXvAJnie2gEmkxL8YSiYV-xPnU4rS-b3_iau-eLF5Q",
      },
    },
    {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        {
          "@version": 1.1,
          scm: "https://example.org/credential/satellite#",
          data: {
            "@context": {
              "@version": 1.1,
              scmdata: "https://example.org/credential/satellite/data#",
            },
            "@id": "scmdata:id",
            "@type": "scmdata:type",
          },
          did: {
            "@id": "scm:did",
            "@type": "@json",
          },
        },
      ],
      id: "did:test:Ag153gXNR7B147Xo6SZ58N42fVDt88qBKDJSj6Nw9Jcp",
      type: [
        "VerifiableCredential",
        "CredentialSatellit",
      ],
      holder: {
        id: "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR",
      },
      credentialSubject: {
        data: {
          "@type": "CredentialSatellit",
          did: {
            "@context": [
              "https://w3id.org/did/v1",
              "https://w3id.org/security/v2",
            ],
            id: "did:test:Ag153gXNR7B147Xo6SZ58N42fVDt88qBKDJSj6Nw9Jcp",
            verificationMethod: [
              {
                id: "did:test:Ag153gXNR7B147Xo6SZ58N42fVDt88qBKDJSj6Nw9Jcp#holder",
                controller: "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR",
                type: "EcdsaSecp256k1VerificationKey2019",
                publicKeyBase58: "u2DiD8YVeVq8DYEK99vew7q52uxjLzS6gBCPnStkQgR9",
              },
              {
                id: "did:test:Ag153gXNR7B147Xo6SZ58N42fVDt88qBKDJSj6Nw9Jcp#controller",
                controller: "did:test:6UnTRcxxA2J34p7KZA5sbKUBkRVud1WmuKQJxc8idsjD",
                nonce: "NMQCgUxjMbA:622tQGvdaNEVubmFw6kUJtAjqYa5NiArKiEAU8XNjZHK",
                type: "EcdsaSecp256k1VerificationKey2019",
                publicKeyBase58: "23fATy5Sh8JnS3N6Si6mkzCUEr3zuNccrpqmJbYeDaqwx",
              },
            ],
            assertionMethod: [
              "did:test:Ag153gXNR7B147Xo6SZ58N42fVDt88qBKDJSj6Nw9Jcp#holder",
            ],
            authentication: [
              "did:test:Ag153gXNR7B147Xo6SZ58N42fVDt88qBKDJSj6Nw9Jcp#holder",
            ],
            proof: {
              type: "EcdsaSecp256k1Signature2019",
              created: "2021-09-29T21:44:02Z",
              verificationMethod: "did:test:Ag153gXNR7B147Xo6SZ58N42fVDt88qBKDJSj6Nw9Jcp#controller",
              proofPurpose: "verificationMethod",
              jws: "eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..jrrcgVR4mkPt8MHjwzx6Myl71lhI3P48kgcKXhbdEQ0ETAYIXwcXvJe8gZf_lcsI_glGDqu-8DwpwHhSSYLc-w",
            },
          },
        },
      },
      issuanceDate: "2021-09-29T21:44:40.527Z",
      issuer: "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR",
      proof: {
        type: "EcdsaSecp256k1Signature2019",
        created: "2021-09-29T21:44:40Z",
        verificationMethod: "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR#holder",
        proofPurpose: "assertionMethod",
        jws: "eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..2ISVp1cCfbZo1DeqHLZOPX_X_BsM5yTN9iRx80aChnVMF4sQf4W1OOmzsTDyJPS3VdGBbeS6PEcChYIgig-0jQ",
      },
    },
    {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        {
          "@version": 1.1,
          scm: "https://example.org/testdocument#",
          data: {
            "@id": "scm:data",
            "@type": "@json",
          },
        },
      ],
      id: "did:test:BZQvtBt9bLMDP5h4ASHd6CqYcNzUBXPRy42NSyZ2mkki",
      type: [
        "VerifiableCredential",
        "TestDocument",
      ],
      holder: {
        id: "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR",
      },
      credentialSubject: {
        data: {
          "@type": "TestDocument",
          id: "testdoc2",
          description: "not very nice doc for alice",
        },
      },
      issuanceDate: "2021-09-29T21:43:54.528Z",
      issuer: "did:test:6UnTRcxxA2J34p7KZA5sbKUBkRVud1WmuKQJxc8idsjD",
      proof: {
        type: "EcdsaSecp256k1Signature2019",
        created: "2021-09-29T21:44:02Z",
        verificationMethod: "did:test:6UnTRcxxA2J34p7KZA5sbKUBkRVud1WmuKQJxc8idsjD#holder",
        proofPurpose: "assertionMethod",
        jws: "eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..Q4PEnzpnNZqNuQiBBgs-KxdKISdfbMpQpKHsFYk8ZOos94Q478hyor8k2ojUQDFafr97q4FFi_RXKNSdk2Ay-Q",
      },
    },
    {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        {
          "@version": 1.1,
          scm: "https://example.org/credential/satellite#",
          data: {
            "@context": {
              "@version": 1.1,
              scmdata: "https://example.org/credential/satellite/data#",
            },
            "@id": "scmdata:id",
            "@type": "scmdata:type",
          },
          did: {
            "@id": "scm:did",
            "@type": "@json",
          },
        },
      ],
      id: "did:test:BZQvtBt9bLMDP5h4ASHd6CqYcNzUBXPRy42NSyZ2mkki",
      type: [
        "VerifiableCredential",
        "CredentialSatellit",
      ],
      holder: {
        id: "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR",
      },
      credentialSubject: {
        data: {
          "@type": "CredentialSatellit",
          did: {
            "@context": [
              "https://w3id.org/did/v1",
              "https://w3id.org/security/v2",
            ],
            id: "did:test:BZQvtBt9bLMDP5h4ASHd6CqYcNzUBXPRy42NSyZ2mkki",
            verificationMethod: [
              {
                id: "did:test:BZQvtBt9bLMDP5h4ASHd6CqYcNzUBXPRy42NSyZ2mkki#holder",
                controller: "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR",
                type: "EcdsaSecp256k1VerificationKey2019",
                publicKeyBase58: "u2DiD8YVeVq8DYEK99vew7q52uxjLzS6gBCPnStkQgR9",
              },
              {
                id: "did:test:BZQvtBt9bLMDP5h4ASHd6CqYcNzUBXPRy42NSyZ2mkki#controller",
                controller: "did:test:6UnTRcxxA2J34p7KZA5sbKUBkRVud1WmuKQJxc8idsjD",
                nonce: "24iuUB77MRa:622tQGvdaNEVubmFw6kUJtAjqYa5NiArKiEAU8XNjZHK",
                type: "EcdsaSecp256k1VerificationKey2019",
                publicKeyBase58: "23fATy5Sh8JnS3N6Si6mkzCUEr3zuNccrpqmJbYeDaqwx",
              },
            ],
            assertionMethod: [
              "did:test:BZQvtBt9bLMDP5h4ASHd6CqYcNzUBXPRy42NSyZ2mkki#holder",
            ],
            authentication: [
              "did:test:BZQvtBt9bLMDP5h4ASHd6CqYcNzUBXPRy42NSyZ2mkki#holder",
            ],
            proof: {
              type: "EcdsaSecp256k1Signature2019",
              created: "2021-09-29T21:44:02Z",
              verificationMethod: "did:test:BZQvtBt9bLMDP5h4ASHd6CqYcNzUBXPRy42NSyZ2mkki#controller",
              proofPurpose: "verificationMethod",
              jws: "eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..aD_yKXUb9qtRJIynWWkWP7v8XOHGiEuE2sZEsywROHlYj3ePpok_BKkiz5HvIZSpnvp-j7GsDzpw_mi4qUTmiQ",
            },
          },
        },
      },
      issuanceDate: "2021-09-29T21:44:40.527Z",
      issuer: "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR",
      proof: {
        type: "EcdsaSecp256k1Signature2019",
        created: "2021-09-29T21:44:40Z",
        verificationMethod: "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR#holder",
        proofPurpose: "assertionMethod",
        jws: "eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..junZOJUecjuASbM93YlwGWFXXlRsEQ8wtxLXuW2_DIE3XYJjkXovnoZ2mK0NGexqR5HvNqip20g_8sgeKGCQEQ",
      },
    },
  ],
  proof: {
    type: "EcdsaSecp256k1Signature2019",
    created: "2021-09-29T21:44:40Z",
    verificationMethod: "did:test:2VnUDBCgQ4cdHqXn3b6LMZDch2gE8DVjktzqVpMoKGtR#holder",
    proofPurpose: "authentication",
    challenge: "4KviCo9JEAeccR588uGafkwx7xVKA3tsrjzvXh3Dm4kS",
    domain: "did:test:GF8DaD4yWMXWji5ov1Fnn38MatVykrfx3F4aqGDjgjKR",
    jws: "eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..y8td7LObRyJn8-jIA848nph4Ib2oqpjStZ0QCRUAtjsUEVhvtc1rhq_L3pv84fs6jcdFgHol0Ozvzf0u6ZGNRA",
  },
}