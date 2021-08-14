# The general scope per Cases Outline diagram
1.  WEB App Wallet 1️⃣
    1.  Encrypted storage 1️⃣
    2.  Request credentials 1️⃣/2️⃣
        1.  Issuing ❔
        2.  Verification ❔
    3.  Adding credentials 1️⃣
    4.  Issuing credentials 1️⃣
        1.  Issued 1️⃣
        2.  Permissions 1️⃣
    5.  Varifying credentials 1️⃣
    6.  Open communication channel ❔
2.  Private service / WEB API for service wallet (used for telegram-based personal custodial wallets) 
    1.  Encrypted storage 2️⃣
    2.  Verify credentials 1️⃣
        1.  Presence ❔
        2.  Permissions ❔
        3.  Authentication / Communication ❔
    3.  Open communication channel
    4.  Issuing credentials 1️⃣
        1.  Issued 1️⃣
        2.  Permissions 1️⃣
    5.  Adding credentials 1️⃣
    6.  Providing credentials 1️⃣
    7.  Request credentials 2️⃣
        1.  Issuing 2️⃣
        2.  Verification 2️⃣
    8.  Credentials register 2️⃣/3️⃣
        1.  Public resolve ❕
        2.  Private resolve ❕
        3.  Add ❕
        4.  Remove ❕
        5.  Update❕
3. Core concepts
   1. Wallet 1️⃣
   2. DIDComm (DID-to-DID)
   3. Basic credentials
      1. Self-sovereign unique id credential 1️⃣
         1. KERI-like based PK rotation ❔
         2. P2P restoration ❔
      2. On-chain status credential 1️⃣
      3. Organization establishment credential 1️⃣
      4. Web-proof credential 1️⃣
      5. Permission / Ownership credential 1️⃣
      6. Issued credential 1️⃣
      7. Request credential 2️⃣
      8. Communication / Authentication credential 1️⃣/2️⃣
      9. Mutual trust credential ❔
4.  Blockchain 1️⃣
    1.  Statuses register for DID proofs 1️⃣
    2.  Event hash register 2️⃣
    3.  Virtual accounts
        1.  Create virtual account
        2.  Close virtual account
        3.  Transact virtual account
    4.  Permissions register 1️⃣
        1.  For virtual accounts
            1.  Create owner
            2.  Remove owner
            3.  Create exclusive owner
        2.  For accounts
            1.  Create owner
            2.  Remove owner
        3.  For status register 1️⃣
            1.  Create owner 1️⃣
            2.  Remove owner 1️⃣
            3.  Create exclusive owner 1️⃣
            4.  Derive status
5.  Authentification widget for web service 2️⃣
6.  Private deduplication register 2️⃣
    1.  Check record
    2.  Add record
    3.  Remove record
    4.  Get record
    5.  Update record
    6.  Add comment
    7.  Read comments
    8.  Add data
    9.  Read data
    10. Process data -> Reject record / Accept record
    11. Get unprocessed records
7.  Telegram bot for deduplication register
8.  Organization interface for deduplication register
9.  ? Telegram based communication channel
    1.  Register DID-to-DID
    2.  Request DID-to-DID
    3.  Invite a user
    4.  Send message
    5.  Receive message
10. Telegram based custodial-wallet
    1.  ... same as organization wallet but multi-tenant
11. Telegram ID verification service
    1.  Request credentials