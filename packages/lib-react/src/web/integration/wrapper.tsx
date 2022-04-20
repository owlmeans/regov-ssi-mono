import { Box, Container, CssBaseline } from "@mui/material"
import React, { PropsWithChildren } from "react"


export const IntegrationWrapper = ({ children }: IntegrationWrapperPorps) => {
  return <CssBaseline>
    <Container>
      <Box sx={(theme) => ({
        [theme.breakpoints.down('sm')]: { width: 300 },
        [theme.breakpoints.between('sm', 'md')]: { width: 420 },
        [theme.breakpoints.up('md')]: { width: 650 }
      })}>{children}</Box>
    </Container>
  </CssBaseline>
}

export type IntegrationWrapperPorps = PropsWithChildren<{

}>