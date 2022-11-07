import React, { FunctionComponent, ReactNode, useState } from "react"
import { CredentialListInputPopupProps } from "./types"
import Dialog from '@mui/material/Dialog'


export const CredentialListInputPopup: FunctionComponent<CredentialListInputPopupProps> = ({ control }) => {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState<ReactNode | undefined>(undefined)
  control.setDialogContentProvider(setContent)
  control.setOpenDialogProvider(setOpen)
  
  return <Dialog open={open} onClose={() => control.closeDetails()}>
    {content}
  </Dialog>
}