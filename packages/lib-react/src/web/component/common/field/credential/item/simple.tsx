
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import { useTranslation } from 'react-i18next'
import { CredentialListItemInputRenderer } from '../types'
import { useRegov } from '../../../../../../common'
import { singleValue } from '@owlmeans/regov-ssi-core'


export const CredentialListItemInputSimpleRenderer: CredentialListItemInputRenderer = props => {
  const prefix = `input.${props.config.prefix ? `${props.config.prefix}.` : ''}`

  const { t } = useTranslation(props.ns)
  const { extensions } = useRegov()

  const itemControl = props.control.getItemControl(props.config.field, props.index)
  const type = singleValue(itemControl.getType())
  const ext = type ? extensions?.registry.getExtension(type) : undefined

  const details = Object.entries(ext?.schema.credentials || {}).map(([, cred]) => cred)
    .find(cred => cred.mainType === type)

  const { t: et } = useTranslation(ext?.localization?.ns)


  return <ListItem>
    <ListItemButton onClick={() => props.control.openDetails(props.config, props.index, props.ns)}>
      {t(`${prefix}${props.config.field}`)}{
        (details?.defaultNameKey || ext?.schema.details.code)
          ? ` - ${et(details?.defaultNameKey || ext?.schema.details.code as string)}`
          : ''
      }
    </ListItemButton>
  </ListItem>
}
