import React, {
  Fragment
} from 'react'
import { useParams } from 'react-router-dom'


export const CredentialCreation = () => {
  const { ext, type } = useParams<{ ext: string, type: string }>()
  console.log(ext, type)

  return <Fragment><div>Hello world!</div></Fragment>
}