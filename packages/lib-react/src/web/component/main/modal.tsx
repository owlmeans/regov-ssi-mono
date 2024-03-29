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

import { FunctionComponent, useState } from 'react'
import { MainModalImplProps } from '../../../common'
import Dialog from '@mui/material/Dialog'


export const MainModalWeb: FunctionComponent<MainModalImplProps> = props => {
  const { handle } = props
  const [isOpened, setOpen] = useState<boolean>(false)
  const [counter, setCounter] = useState(0)
  handle.setOpen = (value: boolean) => {
    setCounter(counter + 1)
    setOpen(value)
  }
  handle.open = content => {
    handle.getContent = content
    if (handle.setOpen) {
      handle.setOpen(true)
      return true
    }

    return false
  }

  return <Dialog open={isOpened} onClose={() => setOpen(false)} scroll="paper" fullWidth maxWidth="xl">
    {handle.getContent ? handle.getContent() : undefined}
  </Dialog>
}