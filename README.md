# nft-ns
Non-Fungible Tokens (NFT) based Name Service

## Overview

Non-Fungible Tokens are great way to represent unique objects. They can be also
grouped, transfered, burned, which makes them good candidate for implementing
name service - resolving name to SLP address and the reverse - address to name.

## DevCon3 Goals

Two CLI application:

* Management Application (Register):
  - add new TLD domain (example: `.bch`, `.cash` etc.) - sure uniqueness
  - list domains - TLDs only, some TLD domains
  - register user domain inside TLD (example: `zhekov.bch`)

* User Domain Registration Application:
  - send BCH to some address and get domain NFT back

## Future plans

* Web interface (at least to check for existance, register and list domains)
* Change some wallet to support the name based BCH send

## Prototype

All tasks executed 'manually' to show the workflow. Using [PSF NFT bch-js-examples](https://github.com/Permissionless-Software-Foundation/bch-js-examples/tree/master/applications/slp/nft) for all steps:

1. Register `.bch` TLD - done with [create-nft-group](https://github.com/Permissionless-Software-Foundation/bch-js-examples/tree/master/applications/slp/nft/create-nft-group). Implemented as `_ns.bch` NFT group token. The result (TxId): [ac291efc23e5c155771183e6ce58c4e36beec2da21aa7a420b3e77605d6561bf](https://explorer.bitcoin.com/bch/tx/ac291efc23e5c155771183e6ce58c4e36beec2da21aa7a420b3e77605d6561bf)
2. Register `stoyan.bch` used domain - done with [create-nft-child](https://github.com/Permissionless-Software-Foundation/bch-js-examples/tree/master/applications/slp/nft/create-nft-child). Implemented as `stoyan.bch` NFT child token. The result (TxId): [39e805f1089fb937cec408632a65da0e2fc9c316daf752ec28ba32d6e956eba3](https://explorer.bitcoin.com/bch/tx/39e805f1089fb937cec408632a65da0e2fc9c316daf752ec28ba32d6e956eba3)
3. Transfer ownership to another address - done with [send-child](https://github.com/Permissionless-Software-Foundation/bch-js-examples/tree/master/applications/slp/nft/send-child). Result: [simpleledger:qrjkthjjsku2qv7ycakyhv828pruv2gfuy636wj0ja](https://explorer.bitcoin.com/bch/address/simpleledger:qrjkthjjsku2qv7ycakyhv828pruv2gfuy636wj0ja) address SLP tokens list.
4. Register one more domain `zhekov.bch` - done with [mint-nft-group](https://github.com/Permissionless-Software-Foundation/bch-js-examples/tree/master/applications/slp/nft/mint-nft-group), `create-nft-child` and `send-nft-child`. Result [simpleledger:qp9rdq4mffms5xs64f0ek5pqm2z3zycsrq76uq3z57](https://explorer.bitcoin.com/bch/address/simpleledger:qp9rdq4mffms5xs64f0ek5pqm2z3zycsrq76uq3z57) adress SLP tokens list.

For the real application will try to create `.devcon` TLD and register several domains inside.
