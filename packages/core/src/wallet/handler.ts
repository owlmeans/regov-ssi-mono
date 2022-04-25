/**
 *  Copyright 2022 OwlMeans
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

 import { Dispatch, SetStateAction } from "react"
import { EncryptedStore } from "../store"
import { WalletWrapper } from "./types"

 
 export const createWalletHandler = (): WalletHandler => {
   const _handler: WalletHandler = {
     wallet: undefined,
 
     stores: {},
 
     observers: [],
 
     observe: <T>(
       setState: Dispatch<SetStateAction<T>>,
       transformer: HandlerObserverTransformer<T>
     ) => {
       const _observer = () => {
         const transformed = transformer(_handler.wallet)
         setState(transformed)
       }
       _handler.observers.push(_observer)
       const idx = _handler.observers.length - 1
 
       return () => {
         delete _handler.observers[idx]
       }
     },
 
     notify: () => {
       _handler.observers.forEach(observer => observer && observer())
     },
 
     loadStore: async (loader) => {
       const prev = _handler.wallet
       _handler.wallet = await loader(_handler)
 
       _handler.notify()
 
       return prev
     }
   }
 
   return _handler
 }
 
 
 export type WalletHandler = {
   wallet: WalletWrapper | undefined,
 
   stores: { [key: string]: EncryptedStore },
 
   observers: HandlerObserver[]
 
   notify: () => void
 
   observe: <T>(
     setState: Dispatch<SetStateAction<T>>,
     transformer: HandlerObserverTransformer<T>
   ) => () => void
 
   loadStore: (loader: StoreLoader) => Promise<WalletWrapper | undefined>
 }
 
 export type StoreLoader = (hanlder: WalletHandler) => Promise<WalletWrapper | undefined>
 
 export type HandlerObserver = () => void
 
 export type ObserverTransformerOption<
   T extends {} = {},
   Props extends {} = {}
   > = (wallet: WalletWrapper | undefined, props?: Props, handler?: WalletHandler) => T
 
 export type HandlerObserverTransformer<T> = (wallet?: WalletWrapper) => T
 