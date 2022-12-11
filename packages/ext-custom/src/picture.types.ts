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