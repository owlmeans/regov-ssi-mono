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