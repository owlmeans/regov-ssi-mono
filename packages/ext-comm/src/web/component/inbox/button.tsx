import React, { FunctionComponent, useEffect } from 'react'
import { Extension, REGISTRY_SECTION_PEER } from '@owlmeans/regov-ssi-core'
import { EmptyProps, RegovComponentProps, withRegov } from '@owlmeans/regov-lib-react'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import MailIcon from '@mui/icons-material/Mail'
import { REGISTRY_TYPE_INBOX } from '../../../types'
import { EXTENSION_TRIGGER_OPEN_INBOX } from '../../types'
import { handleIncommingCommDocuments } from '../../../utils'


export const InboxButton = (ext: Extension): FunctionComponent<InboxButtonParams> =>
  withRegov<InboxButtonProps>({
    namespace: ext.localization?.ns, transformer: (wallet) => {
      return { count: wallet?.getRegistry(REGISTRY_TYPE_INBOX).registry.credentials[REGISTRY_SECTION_PEER].length }
    }
  }, props => {
    const { extensions, handler, count } = props

    useEffect(() => {
      let statusHandle = handleIncommingCommDocuments(handler, extensions?.registry)
      return () => {
        statusHandle.defaultListener
          && statusHandle.helper?.removeListener(statusHandle.defaultListener)
      }
    }, [handler?.wallet?.store.alias])

    return <IconButton onClick={() => handler?.wallet && extensions?.triggerEvent(
      handler.wallet, EXTENSION_TRIGGER_OPEN_INBOX, {}
    )}>
      <Badge badgeContent={count}>
        <MailIcon />
      </Badge>
    </IconButton>
  })


export type InboxButtonParams = EmptyProps & {}

export type InboxButtonProps = RegovComponentProps<InboxButtonParams, {}, { count: number }>