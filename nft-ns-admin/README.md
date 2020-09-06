nft-ns-admin
============

NFT Name Service Manager. Most of the operations needed to support such a service are implemented.

Non-Fungible Group Tokens (NFT) are used for the TLD representation. In order for the system to recognize such tokens, special ticker, starting with `_ns.` is used. All user registerer names will be children of such group NFT.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)

<!-- toc -->
* [Install](#install)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Install

<!-- install -->
Clone repository, go to the admin tool directory and install needed NPM packages:

```sh
git clone https://github.com/BCHDEVCON3/nft-ns.git
cd nft-ns-admin
npm install
```

# Usage

<!-- usage -->
Maybe this will become an NPM package but for now all the commands are executed with `./bin/run` from the tool directory


```sh-session
$ ./bin/run COMMAND
running command...
$ ./bin/run (-v|--version|version)
nft-ns-admin/0.1.0 darwin-x64 node-v12.16.1
$ ./bin/run --help [COMMAND]
USAGE
  $ ./bin/run COMMAND
...
```
<!-- usagestop -->
# Commands

<!-- commands -->
* [`./bin/run help [COMMAND]`](#nft-ns-admin-help-command) - Help
* [`./bin/run create`](#nft-ns-admin-create) - Create new Register
* [`./bin/run tld`](#nft-ns-admin-tld) - Register new TLD
* [`./bin/run list`](#nft-ns-admin-list) - List TLDs and user names
* [`./bin/run register`](#nft-ns-admin-register) - Register new user name
* [`./bin/run transfer`](#nft-ns-admin-transfer) - transfer name to another user

## `nft-ns-admin help [COMMAND]`

Display help for nft-ns-admin. You can also get help for every command adding `-h|--help` to it:

```sh
./bin/run list -h
```


```
USAGE
  $ nft-ns-admin help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_

## `nft-ns-admin create`

Create new NFT NS register

This will create the needed directories (for example config one - `~/.config/nfd-ns-admin` on Linux/Mac). It will also create a new wallet (new BCH account), specially for the Register services, because it is not good to mix the Name Service UTXOs with usual address activities account.

If `-q` flag is provided, the QRCode for that account to be funded will be displayed. Most of the Name Service operations require just a very small amount of BCH (dust), so do not put too much BCH in that account.

```
USAGE
  $ ./bin/run create

OPTIONS
  -q, --qrcode  display wallet QRCode

DESCRIPTION
  ...
  Create config directories, wallet etc.
```

_See code: [src/commands/create.js](https://github.com/zh/nft-ns/blob/v0.1.0/src/commands/create.js)_

## `nft-ns-admin tld`

Register new Top Level Domain (TLD).

Will create new Group NFT token with a special prefix - `_ns`.

If `-t` option is provided, the prefix will be `_tns`, which will separate the TLD in a different context. Can be used for tests, events etc., to not over populate the main name space.

```
USAGE
  $ ./bin/run -n bchn
  $ ./bin/run -n devcon -t
  

OPTIONS
  -n, --name=name  (required) new TLD name to register
  -t, --temp       temporary TLD - _tns prefix

DESCRIPTION
  ...
  TLD should be still not registered.
  No need to start with dot (so 'bch', not '.bch')
```

_See code: [src/commands/tld.js](https://github.com/zh/nft-ns/blob/v0.1.0/src/commands/tld.js)_

## `nft-ns-admin list`

List all TLDs or user registered names (`-t|--tld` option) in given TLD.

When the `-s` option is used, the information is get from the blockchain and cached to config directory - `~/.config/nfd-ns-admin/tld.json` on Linux/Mac. Like this following requests for all TLD list will be pretty fast. In order for system to recognize them, they have a special ticker, starting with `_ns.` (for example `_ns.bch`).

There is also experimental support for test domain, in separate group - tickers starting with `.tns`. The `-x|--temp` will list also such TLDs.

In case of `-t|--tld` option, user registered names for given TLD are listed. These user names are represented by TLD NFT group token children tokens. In order for system to recognize them, they have a special ticker, starting with `_uns.` (for example `_uns.user.bch`) 

```
USAGE
  $ ./bin/run list
  $ ./bin/run list -s
  $ ./bin/run list -s -x
  $ ./bin/run list -s -t bch

OPTIONS
  -s, --sync       refresh list from the blockchain
  -t, --tld=tld    list user names in this TLD
  -x, --temp       include also temporary TLDs

DESCRIPTION
  ...
  If TLD name is provided, list user domain in this TLD.
  Else list all registered TLDs.
```

_See code: [src/commands/list.js](https://github.com/zh/nft-ns/blob/v0.1.0/src/commands/list.js)_

## `nft-ns-admin register`

Register new user name in given TLD.

User names are represented by child tokens inside the TLD NFT group token. They are unique, independent and can be easy transfered to other users like usual SLP tokens. In order for system to recognize user name NFTs, they have a special ticker, starting with `_uns.` (for example `_uns.user.bch`).

When registering new name, provide only the basic name itself. Do not add the TLD to it - `user` is good, `user.bch` no so much. TLD is provided in different parameter - `-t|--tld`. If no TLD provided, the default, `bch` will be used.

Some basic checks (TLD existance, user name uniqueness etc.) are also implemented.

The `-b|--baton` option is added, because the usual way to create NFT children is by first minting the baton and then spending this UTXO. However sometimes (like immediately after the TLD Group NFT create, there is no need from this. If not sure, just do not use this option - the default behavior is safe enough.

```
USAGE
  $ ./bin/run register -n user -t bch

OPTIONS
  -n, --name=name    (required) new name to register
  -t, --tld=tld      TLD to register name in (default: bch)
  -b, --baton        should be baton minted first (default: yes) 
  

DESCRIPTION
  ...
  Name should be still not registered.
  Do not add TLD (so 'user', not 'user.bch')
```

_See code: [src/commands/register.js](https://github.com/zh/nft-ns/blob/v0.1.0/src/commands/register.js)_


## `nft-ns-admin transfer`

Transfer registered name to SLP address.

User names are implemented as Non-fungible SLP tokens (NFT). They can be moved between users with usual wallet operations. This command is mostly for the initial transfer, immediadely after the user create (maybe after some payment etc.).

Provide full name in the `-n|--name` option - (`user.bch` is good, `user` - no)

Use **SLP address** in `-o|--owner` option or you will lose the tokens.

Some basic checks (name existance, proper address format etc.) are also implemented.

```
USAGE
  $ ./bin/run transfer -n user.bch -o simpleledger:qrjk...

OPTIONS
  -n, --name=name    (required) name to transfer
  -o, --owner=owner  (required) SLP address of the owner

DESCRIPTION
  ...
  Will send the already generated NFT name to the provided
  SLP address
```

_See code: [src/commands/transfer.js](https://github.com/zh/nft-ns/blob/v0.1.0/src/commands/transfer.js)_
<!-- commandsstop -->
