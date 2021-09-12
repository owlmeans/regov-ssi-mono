import { MaybeArray, SimpleThing, VCV1, VCV1Subject, VCV1Type, VCV1Unsigned } from "@affinidi/vc-common";

export type CommonSubjectType<ExtendedData extends {} = {}> = SimpleThing & ExtendedData

export type CommonCredentailSubject<
  SubjectType extends CommonSubjectType = CommonSubjectType,
  ExtendedType extends {} = {}
  >
  = VCV1Subject<SubjectType> & ExtendedType

export type CommonUnsignedCredential<
  Subject extends MaybeArray<CommonCredentailSubject> = MaybeArray<CommonCredentailSubject>
  > = VCV1Unsigned<Subject>

export type CommonCredential<
  Subject extends MaybeArray<CommonCredentailSubject> = MaybeArray<CommonCredentailSubject>
  > = VCV1<Subject>

export type CommonType = VCV1Type