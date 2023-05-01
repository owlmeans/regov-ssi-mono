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

import { TFunction } from "i18next"
import { DOCUMENT_TYPE_BINARY, DOCUMENT_TYPE_JSON, DOCUMENT_TYPE_TEXT } from "../../types"


export const typeFormatterFacotry = (t: TFunction) => (value: string) => {
  switch (value) {
    case DOCUMENT_TYPE_BINARY:
      return t('signature.docType.binary')
    case DOCUMENT_TYPE_JSON:
      return t('signature.docType.json')
    case DOCUMENT_TYPE_TEXT:
      return t('signature.docType.text')
    default:
      return t('signature.docType.unknown')
  }
}