import React, { Fragment, FunctionComponent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useRegov, withRegov, PurposeCredentialCreationParams, EXTENSION_ITEM_PURPOSE_REQUEST
} from '../../../common'
import { CREDENTIAL_LIST_ROUTE } from '../../component'


export const CredentialRequest = withRegov({ namespace: 'regov-wallet-credential' }, () => {
  const { ext, type } = useParams<{ ext: string, type: string }>()
  const { extensions } = useRegov()
  const navigate = useNavigate()

  if (!extensions || !ext || !type) {
    return <Fragment />
  }

  const uiExt = extensions.getExtensionByCode(ext)

  if (!uiExt) {
    return <Fragment />
  }

  const renderers = uiExt.produceComponent(EXTENSION_ITEM_PURPOSE_REQUEST, type)

  if (!renderers[0]) {
    return <Fragment />
  }

  const Renderer = renderers[0].com as FunctionComponent<PurposeCredentialCreationParams>

  return <Renderer next={() => navigate(CREDENTIAL_LIST_ROUTE)} />
})