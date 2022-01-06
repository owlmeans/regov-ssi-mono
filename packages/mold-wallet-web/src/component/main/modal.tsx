import React, {
  FunctionComponent,
  useState
} from 'react'
import {
  MainModalImplProps
} from '@owlmeans/regov-lib-react'
import { Dialog } from '@mui/material'


export const MainModalWeb: FunctionComponent<MainModalImplProps> = props => {
  const { handle } = props
  const [isOpened, setOpen] = useState<boolean>(false)
  handle.setOpen = setOpen

  return <Dialog open={isOpened} scroll="paper" fullWidth maxWidth="xl">
    {handle.getContent ? handle.getContent() : undefined}
  </Dialog>
}