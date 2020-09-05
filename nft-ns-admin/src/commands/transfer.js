const {cli} = require('cli-ux')
const {Command, flags} = require('@oclif/command')
const fs = require('fs-extra')
const path = require('path')
const AppUtil = require('../util.js')
const util = new AppUtil()

class TransferCommand extends Command {
  async run () {
    const {flags} = this.parse(TransferCommand)
    const name = flags.name
    const owner = flags.owner
    cli.action.start('Fetching data')
    const walletInfo = await fs.readJSON(path.join(this.config.configDir, 'wallet.json'))
    const transferTxId = await util.transferName(name, owner, walletInfo)
    this.log(`Transfer: https://explorer.bitcoin.com/bch/tx/${transferTxId}`)
    cli.action.stop()
  }
}

TransferCommand.description = `Transfer registered name to SLP address
...
Will send the already generated NFT name to the provided
SLP address
`

TransferCommand.flags = {
  name: flags.string({char: 'n', description: 'name to transfer', required: true}),
  owner: flags.string({char: 'o', description: 'SLP address of the owner', required: true})
}

module.exports = TransferCommand
