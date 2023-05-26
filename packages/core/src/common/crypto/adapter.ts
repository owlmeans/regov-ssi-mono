import { CryptoAdapter } from './types'

let _adapter: CryptoAdapter

export const getCryptoAdapter = (): CryptoAdapter => {
  if (_adapter == null) {
    _adapter = {
      base58: {
        encode: (() => { }) as any,
        decode: (() => { }) as any,
        toArray: (() => { }) as any,
      },

      setBase58Impl: (encode, decode, toArray) => {
        _adapter.base58.encode = encode
        _adapter.base58.decode = decode
        _adapter.base58.toArray = toArray
      },
    }
  }

  return _adapter
}
