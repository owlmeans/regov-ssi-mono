import { VPV1, VPV1Holder, VPV1Type, VPV1Unsigned } from "@affinidi/vc-common";
import { CommonCredential } from "./credential";


export type CommonUnsignedPresentation<
  Credential extends CommonCredential = CommonCredential,
  Holder extends CommonPresentationHolder = CommonPresentationHolder
  > = VPV1Unsigned<Credential, VPV1Type, Holder>

export type CommonPresentation<
  Credential extends CommonCredential = CommonCredential,
  Holder extends CommonPresentationHolder = CommonPresentationHolder
  > = VPV1<Credential, VPV1Type, Holder>

export type CommonPresentationHolder = VPV1Holder & {}

export type CommonPresentationType = VPV1Type