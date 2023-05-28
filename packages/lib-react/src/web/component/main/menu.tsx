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


import { MainMenuImplProps } from '../../../common'
import { MainMenuItemWeb } from './menu/item'
import List from '@mui/material/List'


export const MainMenuWeb = ({ items, t, i18n }: MainMenuImplProps) => {
  return <List sx={{ width: "100%", maxWidth: 240 }}>
    {items.map(item => <MainMenuItemWeb key={item.title} {...item} t={t} i18n={i18n} />)}
  </List>
}