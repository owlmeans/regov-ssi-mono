import React, { FunctionComponent } from "react"
import { CredentialList, EmptyProps, RegovComponentProps, withRegov } from "@owlmeans/regov-lib-react"
import { Extension, REGISTRY_SECTION_PEER } from "@owlmeans/regov-ssi-core"
import { REGISTRY_TYPE_INBOX } from "../../../types"


export const InboxWidget = (ext: Extension): FunctionComponent<InboxWidgetParams> =>
  withRegov<InboxWidgetProps>({ namespace: ext.localization?.ns }, _ => {
    
    return <CredentialList tab={REGISTRY_TYPE_INBOX} section={REGISTRY_SECTION_PEER} tabs={[{
        name: REGISTRY_TYPE_INBOX,
        registry: {
          type: REGISTRY_TYPE_INBOX,
          defaultSection: REGISTRY_SECTION_PEER,
          allowPeer: false,
        }
      }]} ns={ext.localization?.ns} />
  })


export type InboxWidgetParams = EmptyProps & {
  close: () => void
}

export type InboxWidgetProps = RegovComponentProps<InboxWidgetParams>