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

import { ExpandedTermDefinition } from "jsonld"
import { SubjectFieldMeta } from "./custom.types"


export const castFieldType = (field: string) =>
  field.slice(0, 1).toUpperCase() + field.slice(1) + 'Type'

export const addScansContext = (space: string, field: string): ExpandedTermDefinition => {
  const itemType = castFieldType(field)

  return {
    "@id": `${space}:${field}`,
    "@context": {
      "xs": "http://www.w3.org/2001/XMLSchema#",
      "type": "@type",
      [itemType]: {
        "@id": `${space}:${itemType}`,
        "@context": {
          "page": "@id",
          "name": {
            "@id": `${space}:${field}Name`,
            "@type": "xs:string"
          },
          "binaryData": {
            "@id": `${space}:${field}BinaryData`,
            "@type": "xs:base64binary"
          },
          "mimeType": {
            "@id": `${space}:${field}MimeType`,
            "@type": "xs:string"
          }
        }
      },
      "files": {
        "@id": `${space}:${field}Files`,
        "@type": "@id",
        "@container": "@list"
      }
    }
  }
}

export const isTermPictures = (field: SubjectFieldMeta) =>
  field.term && field.term['@context'] && field.term['@context']['files']


export type FileInfo = {
  page: string
  name: string
  type: string
  mimeType: string
  binaryData: string
}
