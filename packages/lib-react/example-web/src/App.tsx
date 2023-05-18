/**
 *  Copyright 2023 OwlMeans
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

import { buildUIExtensionRegistry } from '@owlmeans/regov-lib-react'

import { buildIdentityExtensionUI } from '@owlmeans/regov-ext-identity'
import { signatureWebExtension } from '@owlmeans/regov-ext-doc-signature'
import { groupsUIExtension } from '@owlmeans/regov-ext-groups'
import { authUIExtension } from '@owlmeans/regov-ext-auth'
import { buildCommUIExtension } from '@owlmeans/regov-ext-comm'
import {
  customizeExtension, addCredential, USE_CREATE_CLAIM, USE_PREVIEW_CLAIM, addScansContext, USE_ITEM_CLAIM,
  USE_CREATE_OFFER, USE_CLAIM_VIEW, USE_ITEM_OFFER, USE_VIEW_OFFER, USE_ITEM_CRED, USE_CRED_VIEW, addLocalization
} from "@owlmeans/regov-ext-custom/dist/web"

import { WalletApp } from '@owlmeans/regov-lib-react'

import { config, commConfig } from './config'


const EXAMPLE_IDENTITY_TYPE = 'ExampleIdentity'

const registry = buildUIExtensionRegistry()

registry.registerSync(buildCommUIExtension(commConfig))

registry.registerSync(authUIExtension)

registry.registerSync(buildIdentityExtensionUI(EXAMPLE_IDENTITY_TYPE, { appName: config.name }, {
  name: '',
  code: 'example-identity',
  organization: 'Example Org.',
  home: 'https://my-example.org/',
  schemaBaseUrl: 'https://my-example.org/schemas/'
}))

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
        USE_VIEW_OFFER, USE_ITEM_CRED, USE_CRED_VIEW, USE_CREATE_OFFER
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

signatureWebExtension.extension = addCredential(signatureWebExtension.extension, {
  mainType: 'RoyGroupFriendNCODapamoga',
  defaultLabel: 'Волонтёр НКО "Дапамога"',
  expirationPeriod: (3600 * 24 * 30) / 2,
  credentialContext: {
    xs: 'http://www.w3.org/2001/XMLSchema#',
    custom: 'https://roy.team/ssi/vc/nkodapamoga/friend#',
  },
  defaultSubject: {
    iconUrl: 'https://picsum.photos/200',
  },
  subjectMeta: {
    name: {
      useAt: [USE_CREATE_CLAIM, USE_PREVIEW_CLAIM, USE_CLAIM_VIEW, USE_CREATE_OFFER, USE_VIEW_OFFER, USE_CRED_VIEW],
      defaultLabel: 'Имя, фамилия',
      defaultHint: 'Имя и фамилия',
      validation: { required: true },
      term: { '@id': 'custom:name', '@type': 'xs:string' },
    },
    iconUrl: {
      useAt: [],
      term: { '@id': 'custom:iconUrl', '@type': 'xs:string' },
    },
    confirmationInfo: {
      useAt: [USE_CREATE_CLAIM, USE_PREVIEW_CLAIM, USE_CLAIM_VIEW],
      defaultLabel: 'Данные для подтверждения',
      defaultHint:
        'Подтверждение двух волонтеров и руководителя НКО "Дапамога" о том, что человек входит в состав волонтерского круга НКО "Дапамога".',
      validation: { required: true },
      term: { '@id': 'custom:confirmationInfo', '@type': 'xs:string' },
    },
    motivation: {
      useAt: [USE_CREATE_CLAIM, USE_PREVIEW_CLAIM, USE_CLAIM_VIEW],
      defaultLabel: 'Повод для вступления',
      defaultHint: 'Описание мотивации быть волонтером НКО "Дапамога".',
      validation: { required: true },
      term: { '@id': 'custom:motivation', '@type': 'xs:string' },
    },
    confirmationFile: {
      useAt: [USE_CREATE_CLAIM, USE_PREVIEW_CLAIM, USE_CLAIM_VIEW],
      defaultLabel: 'Прикрепите файлы',
      defaultHint:
        'Опциональное изображение или PDF с изображениями подтверждений от двух волонтеров и руководителя НКО "Дапамога" о том, что человек входит в состав волонтерского круга НКО "Дапамога".',
      validation: { required: false },
      term: addScansContext('custom', 'confirmationFile'),
    },
  },
})

signatureWebExtension.extension = addLocalization(signatureWebExtension.extension, {
  en: {
    customsignature: {
      offer_view: {
        meta_title: {
          default: 'Custom Signature Document'
        }
      },
      cred_item: {
        testField: {
          label: 'Test Field'
        }
      }
    },
  }
})

registry.registerSync(customizeExtension(signatureWebExtension))

registry.registerSync(groupsUIExtension)

export const App = () => {
  return <WalletApp config={config} extensions={registry.normalize()} />
}