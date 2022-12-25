import React, { Fragment, FunctionComponent } from 'react'

import { EmptyProps, ListItemMeta } from '@owlmeans/regov-lib-react'
import { CredentialWrapper } from '@owlmeans/regov-ssi-core'
import { CustomDescription, DefaultPresentation, DefaultSubject } from '../../../custom.types'

import ListItem from '@mui/material/ListItem'


export const OfferItem = (descr: CustomDescription<DefaultSubject>): FunctionComponent<OfferItemProps> => (
  { wrapper }
) => {
  console.log(descr, wrapper)

  return <ListItem>
    <Fragment>Hello world</Fragment>
  </ListItem>
}

export type OfferItemProps = EmptyProps & {
  wrapper: CredentialWrapper<DefaultSubject, DefaultPresentation>
  action?: () => void
  meta?: ListItemMeta
}