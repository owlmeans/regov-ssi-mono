import { Credential, DIDDocument, DIDPURPOSE_AUTHENTICATION, Identity, normalizeValue, VERIFICATION_KEY_CONTROLLER, VERIFICATION_KEY_HOLDER } from '@owlmeans/regov-ssi-core'
import { buildServerExtension, ERROR_NO_WALLET, getAppContext } from '@owlmeans/regov-lib-node'
import { Router } from 'express'
import { groupsExtension } from './ext'
import { BASIC_IDENTITY_TYPE, GroupSubject, MembershipSubject, REGOV_CREDENTIAL_TYPE_GROUP, REGOV_CREDENTIAL_TYPE_MEMBERSHIP, SERVER_IS_GROUP_OWNER } from './types'

export * from './types'
export * from './ext'


export const groupsServerExtension = buildServerExtension(groupsExtension, () => {
  const router = Router()

  router.post(SERVER_IS_GROUP_OWNER, async (req, res) => {
    const { handler, extensions } = getAppContext(req)
    if (!handler.wallet) {
      throw ERROR_NO_WALLET
    }

    const credential: Credential<MembershipSubject> = req.body
    const factory = groupsExtension.getFactory(REGOV_CREDENTIAL_TYPE_MEMBERSHIP)
    const result = await factory.validate(handler.wallet, {
      credential, extensions: extensions.registry
    })

    if (result.valid && result.trusted) {
      const evidence = normalizeValue(credential.evidence)
      const group = evidence.find(
        evidence => evidence?.type.includes(REGOV_CREDENTIAL_TYPE_GROUP)
      ) as Credential<GroupSubject>
      const id = evidence.find(
        eveidence => eveidence?.type.includes(BASIC_IDENTITY_TYPE)
      ) as Identity

      if (group && id) {
        const issuer = credential.issuer as DIDDocument
        if (Array.isArray(issuer.authentication)) {
          const didHelper = handler.wallet.did.helper()
          const holderMethod = didHelper.expandVerificationMethod(
            issuer, DIDPURPOSE_AUTHENTICATION, VERIFICATION_KEY_HOLDER
          )
          const controllerMethod = didHelper.expandVerificationMethod(
            issuer, DIDPURPOSE_AUTHENTICATION, VERIFICATION_KEY_CONTROLLER
          )
          const groupHolderMethod = didHelper.expandVerificationMethod(
            group.holder as DIDDocument, DIDPURPOSE_AUTHENTICATION, VERIFICATION_KEY_HOLDER
          )
          const idIssuedForMethod = didHelper.expandVerificationMethod(
            id.issuer as DIDDocument, DIDPURPOSE_AUTHENTICATION, VERIFICATION_KEY_HOLDER 
          )

          const isOwner = didHelper.parseDIDId(holderMethod.controller).did
            === didHelper.parseDIDId(controllerMethod.controller).did
            && didHelper.parseDIDId(holderMethod.controller).did
            === didHelper.parseDIDId(groupHolderMethod.controller).did
            && didHelper.parseDIDId(holderMethod.controller).did
            === didHelper.parseDIDId(idIssuedForMethod.controller).did


          res.json({
            isOwner: isOwner,
            group: group,
            controllers: {
              issuerHolder: holderMethod.controller,
              issuerController: holderMethod.controller,
              groupHolder: groupHolderMethod.controller,
              idHolder: idIssuedForMethod.controller 
            }
          })
        }
      } else {
        res.status(400).send('Invlid membership credential')
      }
    } else {
      res.status(406).send('Invalid credential')
    }
  })

  return router
})