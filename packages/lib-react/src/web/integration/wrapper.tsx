/**
 *  Copyright 2023 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import React, { PropsWithChildren } from "react"
import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import CssBaseline from "@mui/material/CssBaseline"


export const IntegrationWrapper = ({ width, children }: IntegrationWrapperPorps) => {
  return <CssBaseline>
    <Container>
      <Box sx={(theme) => ({
        [theme.breakpoints.down('sm')]: { width: width?.sm || 300 },
        [theme.breakpoints.between('sm', 'md')]: { width: width?.smmd || 420 },
        [theme.breakpoints.up('md')]: { width: width?.md || 650 }
      })}>{children}</Box>
    </Container>
  </CssBaseline>
}

export type IntegrationWrapperPorps = PropsWithChildren<{
  width?: {
    sm?: number
    smmd?: number
    md?: number
  }
}>