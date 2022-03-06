import moment from "moment"
import { OutputFieldFormatter } from "./types"


export const dateFormatter: OutputFieldFormatter = (value, template = undefined) => {
  if (template) {
    return moment.utc(value).local().format(template)
  }

  return moment.utc(value).toDate().toLocaleString()
}