nft-ns-query
============

NFT Name Service resolver. Can be used for user name to SLP address queries and for the reverse ones - SLP address to name.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)

<!-- toc -->
* [Install](#install)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Install

<!-- install -->
Clone repository, go to the resolver tool directory and install needed NPM packages:

```sh
git clone https://github.com/BCHDEVCON3/nft-ns.git
cd nft-ns-query
npm install
```

# Usage
<!-- usage -->
Maybe this will become an NPM package but for now all the commands are executed with `./bin/run` from the tool directory

```sh-session
$ ./bin/run COMMAND
running command...
$ ./bin/run (-v|--version|version)
nft-ns-query/0.1.0 darwin-x64 node-v12.16.1
$ ./bin/run --help [COMMAND]
USAGE
  $ ./bin/run COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`nft-ns-query help [COMMAND]`](#nft-ns-query-help-command)
* [`nft-ns-query address`](#nft-ns-query-address) - name to address resolve
* [`nft-ns-query name`](#nft-ns-query-name) - address to name resolve
* [`nft-ns-query registers`](#nft-ns-query-registers) - get list of TLD registers

## `nft-ns-query help [COMMAND]`

Display help for nft-ns-query. You can also get help for every command adding `-h|--help` to it:

```sh
./bin/run name -h

```


```
USAGE
  $ ./bin/run help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_

## `nft-ns-query address`

Find SLP address by name.

Information is retreived from the SLPDB tokens information.

Provide full name to `-n|--name` option (`user.bch` - good, `user` - no).
The provider NFT Group token ID can be specified. If no the default one will be used.
Provider NFT Group token IDs can be seen in the Admin tool TLD list.

Some basic checks (TLD existance, user name existence etc.) are also implemented.

```
USAGE
  $ ./bin/run address -n user.bch
  $ ./bin/run address -n user.somenew -r a34eqwr5...

OPTIONS
  -n, --name=name          (required) NFT NS name (user.bch)
  -r, --register=register  NFT NS register tokenId

DESCRIPTION
  ...
  Similar to DNS lookup - will find corresponding SLP address
  by given NFT Name Service name
  (example:  '--name=user.bch')
```

_See code: [src/commands/address.js](https://github.com/zh/nft-ns/blob/v0.1.0/src/commands/address.js)_


## `nft-ns-query name`

Find name by SLP address.

Information is retreived from the address tokens UTXO information.

Provide proper SLP address, starting with `simpleledger:` to the `-a|--addr` option.

Some basic checks (adress format etc.) are also implemented.

```
USAGE
  $ ./bin/run name -a simpleledger:qrjkt...

OPTIONS
  -a, --address=address  (required) SLP address (simpleledger:ss333)

DESCRIPTION
  ...
  Similar to DNS reverse lookup - find corresponding NFT NS name
  by given SLP address (example: --address=simpleledger:4daeee...)
```

_See code: [src/commands/name.js](https://github.com/zh/nft-ns/blob/v0.1.0/src/commands/name.js)_

## `nft-ns-query registers`

Get list of TLD registers

Provide BCH address for the account, holding TLD addresses.
Will generate JSON file in the config directory.

Information is retreived from the address tokens UTXO information.

```
USAGE
  $ ./bin/run registers
  $ ./bin/run registers -b bitcoincash:qrjkt...

OPTIONS
  -b, --bch=bch  BCH address of the account with registers

DESCRIPTION
  ...
  Provide BCH address for the account, holding TLD addresses.
  Will generate JSON file in the config directory.
```

_See code: [src/commands/registers.js](https://github.com/zh/nft-ns/blob/v0.1.0/src/commands/registers.js)_

<!-- commandsstop -->
