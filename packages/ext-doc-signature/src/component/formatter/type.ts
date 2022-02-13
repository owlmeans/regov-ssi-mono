import { TFunction } from "i18next"
import { DOCUMENT_TYPE_BINARY, DOCUMENT_TYPE_JSON, DOCUMENT_TYPE_TEXT } from "../../types"


export const typeFormatterFacotry = (t: TFunction) => (value: string) => {
  switch (value) {
    case DOCUMENT_TYPE_BINARY:
      return t('signature.type.binary')
    case DOCUMENT_TYPE_JSON:
      return t('signature.type.json')
    case DOCUMENT_TYPE_TEXT:
      return t('signature.type.text')
    default:
      return t('signature.type.unknown')
  }
}