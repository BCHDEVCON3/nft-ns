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

* Name service resolver:
  - return SLP address for given name
  - return name for given SLP address

## Implementation

Used packages:

* [Oclif: Node.JS Open CLI Framework](https://github.com/oclif/oclif)
* [bch-js Javascript BCH library](https://github.com/Permissionless-Software-Foundation/bch-js)
* [Oclif CLI IO](https://github.com/oclif/cli-ux)

The Name service is implemented as two separate independent tools:

* [nft-ns-admin](./nft-ns-admin/) - Administration tool (Register):
  * Create new TLD register
  * List all TLDs
  * List user names in givel TLD
  * Register new name in given TLD
  * Transfer user name to different owner

  For more details see [nft-ns-admin documentation](./nft-ns-admin/README.md)

* [nft-ns-query](./nft-ns-query/) - Query tool (Resolver):
  * Resolve name to SLP address
  * Reverse resolve SLP address to name

  For more details see [nft-ns-query documentation](./nft-ns-query/README.md)

## Future plans

* Web interface (at least to check for existance, register and list domains)
* Change [slp-cli-wallet wallet](https://github.com/christroutner/slp-cli-wallet) to support the name based tokens send
* Meta information (profile picture etc.) for each name - maybe saved to IPFS
