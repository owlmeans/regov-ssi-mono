import {
  SimpleThing,
  VCV1Type
} from "@affinidi/vc-common"

import {
  Identity,
  IDTYPE_SUBJECT,
  IDTYPE_SUBJECTS,
  SubjectClaim,
  Wallet,
  WalletContext,
  WalletOpertor
} from "./types"


export const produceWalletOperator =
  (wallet: Wallet, context: WalletContext): () => WalletOpertor =>
    () => ({
      getSubjectsId: _produceGetSubjectsIdMethod(wallet, context),
      getSubjectId: _produceGetSubjectIdMethod(wallet, context),
    })

const _produceGetSubjectIdMethod =
  (wallet: Wallet, context: WalletContext) =>
    async <Data extends SimpleThing>(
      subject: SubjectClaim<Data>
    ) => {
      const _subject = { ...subject }
      if (_subject.id) {
        delete _subject.id
      }
      if (_subject['@context']) {
        delete _subject['@context']
      }
      return context.produceDepersonalizedId(
        IDTYPE_SUBJECT,
        _subject,
        wallet.identity.identity.id
      )
    }

export const _produceGetSubjectsIdMethod =
  (wallet: Wallet, context: WalletContext) =>
    async <Data extends SimpleThing>(
      subjects: SubjectClaim<Data>[],
      type: VCV1Type,
      holder: Identity
    ) => {
      const _getSubjectId = _produceGetSubjectIdMethod(wallet, context)
      await Promise.all(subjects.map(async subject => subject.id = await _getSubjectId(subject)))

      return context.produceDepersonalizedId(
        IDTYPE_SUBJECTS,
        {
          type,
          holder: holder,
          credentialSubject: subjects
        }
      )
    }

