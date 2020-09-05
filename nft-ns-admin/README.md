nft-ns-admin
============

NFT Name Service Manager

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/nft-ns-admin.svg)](https://npmjs.org/package/nft-ns-admin)
[![Downloads/week](https://img.shields.io/npm/dw/nft-ns-admin.svg)](https://npmjs.org/package/nft-ns-admin)
[![License](https://img.shields.io/npm/l/nft-ns-admin.svg)](https://github.com/zh/nft-ns/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g nft-ns-admin
$ nft-ns-admin COMMAND
running command...
$ nft-ns-admin (-v|--version|version)
nft-ns-admin/0.1.0 darwin-x64 node-v12.16.1
$ nft-ns-admin --help [COMMAND]
USAGE
  $ nft-ns-admin COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`nft-ns-admin create`](#nft-ns-admin-create)
* [`nft-ns-admin help [COMMAND]`](#nft-ns-admin-help-command)
* [`nft-ns-admin list`](#nft-ns-admin-list)
* [`nft-ns-admin register`](#nft-ns-admin-register)
* [`nft-ns-admin tld`](#nft-ns-admin-tld)
* [`nft-ns-admin transfer`](#nft-ns-admin-transfer)

## `nft-ns-admin create`

Create new NFT NS register

```
USAGE
  $ nft-ns-admin create

OPTIONS
  -q, --qrcode  display wallet QRCode

DESCRIPTION
  ...
  Create config directories, wallet etc.
```

_See code: [src/commands/create.js](https://github.com/zh/nft-ns/blob/v0.1.0/src/commands/create.js)_

## `nft-ns-admin help [COMMAND]`

display help for nft-ns-admin

```
USAGE
  $ nft-ns-admin help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_

## `nft-ns-admin list`

List all domains

```
USAGE
  $ nft-ns-admin list

OPTIONS
  -s, --sync       refresh list from the blockchain
  -t, --temp       include also temporary TLDs
  -u, --user=user  (TODO) list user names in this TLD

DESCRIPTION
  ...
  If TLD name is provided, list user domain in this TLD.
  Else list all registered TLDs.
```

_See code: [src/commands/list.js](https://github.com/zh/nft-ns/blob/v0.1.0/src/commands/list.js)_

## `nft-ns-admin register`

Register new name in given TLD

```
USAGE
  $ nft-ns-admin register

OPTIONS
  -n, --name=name    new name to register
  -o, --owner=owner  SLP address of the owner
  -t, --tld=tld      TLD to register name in

DESCRIPTION
  ...
  Nme should be still not registered.
  Do not add TLD (so 'user', not 'user.bch')
```

_See code: [src/commands/register.js](https://github.com/zh/nft-ns/blob/v0.1.0/src/commands/register.js)_

## `nft-ns-admin tld`

Register new Top Level Domain (TLD)

```
USAGE
  $ nft-ns-admin tld

OPTIONS
  -n, --name=name  new TLD name to register
  -t, --temp       temporary TLD - _tns prefix

DESCRIPTION
  ...
  TLD should be still not registered.
  No need to start with dot (so 'bch', not '.bch')
```

_See code: [src/commands/tld.js](https://github.com/zh/nft-ns/blob/v0.1.0/src/commands/tld.js)_

## `nft-ns-admin transfer`

Describe the command here

```
USAGE
  $ nft-ns-admin transfer

OPTIONS
  -n, --name=name  name to print

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src/commands/transfer.js](https://github.com/zh/nft-ns/blob/v0.1.0/src/commands/transfer.js)_
<!-- commandsstop -->
