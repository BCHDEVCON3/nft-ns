const {cli} = require('cli-ux')
const {Command, flags} = require('@oclif/command')
const AppUtil = require('../util.js')
const util = new AppUtil()

class NameCommand extends Command {
  async run() {
    const {flags} = this.parse(NameCommand)
    const address = flags.address
    const check = await util.validAddress(address)
    if (check === false) {
      this.error(`Invalid address: ${address}`)
      return
    }
    cli.action.start('Fetching data')
    const domainNames = await util.getNamesByAddress(address)
    console.log(`Domain Names: ${JSON.stringify(domainNames, null, 2)}`)
    cli.action.stop()
  }
}

NameCommand.description = `Find name by SLP address
...
Similar to DNS reverse lookup - find corresponding NFT NS name
by given SLP address (example: --address=simpleledger:4daeee...)
`

NameCommand.flags = {
  address: flags.string({char: 'a', description: 'SLP address (simpleledger:ss333)', required: true})
}

module.exports = NameCommand
