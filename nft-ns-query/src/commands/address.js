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
    const register = flags.register || 'ac291efc23e5c155771183e6ce58c4e36beec2da21aa7a420b3e77605d6561bf'
    cli.action.start('Fetching data')
    const nameInfo = await util.getNameInfo(register, name)
    if (nameInfo === {}) {
      return
    }
    const slpAddress = await util.getTokenAddresses(nameInfo.tokenId)
    this.log(JSON.stringify({slpAddress}, null, 2))
    cli.action.stop()
  }
}

AddressCommand.description = `Find SLP address by name
...
Similar to DNS lookup - will find corresponding SLP address
by given NFT Name Service name
(example:  '--name=user.bch')
`

AddressCommand.flags = {
  name: flags.string({char: 'n', description: 'NFT NS name (user.bch)', required: true}),
  register: flags.string({char: 'r', description: 'NFT NS register tokenId'})
}

module.exports = AddressCommand
