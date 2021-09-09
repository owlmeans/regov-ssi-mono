import { VPV1, VPV1Holder, VPV1Type, VPV1Unsigned } from "@affinidi/vc-common";
import { CommonCredentail } from "./credential";


export type CommonUnsignedPresentation<
  Credential extends CommonCredentail = CommonCredentail,
  Holder extends CommonPresentationHolder = CommonPresentationHolder
  > = VPV1Unsigned<Credential, VPV1Type, Holder>

export type CommonPresentation<
  Credential extends CommonCredentail = CommonCredentail,
  Holder extends CommonPresentationHolder = CommonPresentationHolder
  > = VPV1<Credential, VPV1Type, Holder>

export type CommonPresentationHolder = VPV1Holder & {
  did?: string
}

export type CommonPresentationType = VPV1Type