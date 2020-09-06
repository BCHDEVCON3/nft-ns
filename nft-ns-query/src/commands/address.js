const {cli} = require('cli-ux')
const {Command, flags} = require('@oclif/command')
const fs = require('fs-extra')
const path = require('path')
const AppUtil = require('../util.js')
const util = new AppUtil()

class AddressCommand extends Command {
  async run() {
    const {flags} = this.parse(AddressCommand)
    const name = flags.name
    this.log(`Find address by name ${name} from commands/address.js`)
  }
}

AddressCommand.description = `Find SLP address by name
...
Similar to DNS lookup - will find corresponding SLP address
by given NFT Name Service name
(example:  '--name=user.bch')
`

AddressCommand.flags = {
  name: flags.string({char: 'n', description: 'NFT NS name (user.bch)', require: true}),
}

module.exports = AddressCommand
