// import React from 'react'

import {
  buildUIExtension, ExtensionItemPurpose,
} from '@owlmeans/regov-lib-react'
import {
  groupsExtension,
  RegovGroupExtensionTypes
} from '@owlmeans/regov-ext-groups'


export const groupsUIExtension = buildUIExtension<RegovGroupExtensionTypes>(groupsExtension,
  (_purpose: ExtensionItemPurpose, _type?: RegovGroupExtensionTypes) => {
    return []
  }
)