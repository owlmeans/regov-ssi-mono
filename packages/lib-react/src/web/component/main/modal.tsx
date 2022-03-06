import React, { FunctionComponent, useState } from 'react'
import { MainModalImplProps } from '../../../common'
import { Dialog } from '@mui/material'


export const MainModalWeb: FunctionComponent<MainModalImplProps> = props => {
  const { handle } = props
  const [isOpened, setOpen] = useState<boolean>(false)
  handle.setOpen = setOpen

  return <Dialog open={isOpened} onClose={() => setOpen(false)} scroll="paper" fullWidth maxWidth="xl">
    {handle.getContent ? handle.getContent() : undefined}
  </Dialog>
}