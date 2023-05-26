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
import { Fragment, FunctionComponent } from "react"
import { FieldsRenderer } from "../widget/fields"
import { Extension } from "@owlmeans/regov-ssi-core"
import { FormHeaderButton } from "@owlmeans/regov-lib-react"
import { useTranslation } from "react-i18next"
import { DefaultCredential, DefaultDescription, UseFieldAt } from "../../../custom.types"

import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import { getSubject } from "../../utils/cred"
import { castSectionKey } from "../../utils/tools"


export const CredentialView: FunctionComponent<CredentialViewProps> = ({ descr, cred, close }) => {
  const { t, i18n } = useTranslation(descr.ns)
  const sectionKey = castSectionKey(descr)
  const purpose = UseFieldAt.CRED_VIEW

  return <Fragment>
    <DialogContent>
      <FieldsRenderer purpose={purpose} descr={descr} subject={getSubject(descr, cred)} />
    </DialogContent>
    <DialogActions>
      <FormHeaderButton t={t} i18n={i18n} title={`${sectionKey}.action.close`} action={close} />
    </DialogActions>
  </Fragment>
}

export type CredentialViewProps = {
  descr: DefaultDescription
  cred: DefaultCredential
  ext: Extension
  close?: () => void
}