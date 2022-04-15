
export type WSClientConfig = {
  server: string,
  subProtocal?: string
  timeout: number
}

export type Receiver = (msg: string) => void

export type CommWSClient = {
  opened: boolean
  occupied: boolean
  currentResolve?: (value: string) => void
  currentReject?: (err: any) => void
  send: (msg: string) => Promise<boolean>
  close: () => Promise<void>
}