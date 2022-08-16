import React, { FunctionComponent } from 'react'
import { Extension, REGISTRY_SECTION_PEER } from '@owlmeans/regov-ssi-core'
import { EmptyProps, RegovComponentProps, withRegov } from '@owlmeans/regov-lib-react'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import MailIcon from '@mui/icons-material/Mail'
import { EVENT_INIT_CONNECTION, InitCommEventParams } from '@owlmeans/regov-comm'
import { REGISTRY_TYPE_INBOX } from '../../../types'


export const InboxButton = (ext: Extension): FunctionComponent<InboxButtonParams> =>
  withRegov<InboxButtonProps>({ namespace: ext.localization?.ns }, props => {
    const { extensions, handler } = props
    /**
     * @TODO Properly unregister listner
     */
    if (handler?.wallet && extensions) {
      extensions.triggerEvent<InitCommEventParams>(handler.wallet, EVENT_INIT_CONNECTION, {
        statusHandle: { established: false },
        trigger: async (_, doc) => {
          if (handler.wallet) {
            const registry = handler.wallet.getRegistry(REGISTRY_TYPE_INBOX)
            if (!registry.getCredential(doc.id, REGISTRY_SECTION_PEER)) {
              console.info(`ext-comm: received message: ${doc.id}`)
              await registry.addCredential(doc, REGISTRY_SECTION_PEER)
              handler.notify()
            }
          }
        }
      })
    }

    return <IconButton>
      <Badge badgeContent={undefined}>
        <MailIcon />
      </Badge>
    </IconButton>
  })


export type InboxButtonParams = EmptyProps & {}

export type InboxButtonProps = RegovComponentProps<InboxButtonParams>