import { MaybeArray, SimpleThing, VCV1, VCV1Subject, VCV1Type, VCV1Unsigned } from "@affinidi/vc-common";

export type CommonSubjectType = SimpleThing & {}

export type CommonCredentailSubject<SubjectType extends CommonSubjectType = CommonSubjectType> 
  = MaybeArray<VCV1Subject<SubjectType>>

export type CommonUnsignedCredential<
  Subject extends CommonCredentailSubject = CommonCredentailSubject
  > = VCV1Unsigned<Subject>

export type CommonCredentail<
  Subject extends CommonCredentailSubject = CommonCredentailSubject
  > = VCV1<Subject>

  export type CommonType = VCV1Type