const {cli} = require('cli-ux')
const {Command, flags} = require('@oclif/command')
const fs = require('fs')
const path = require('path')
const qrcodeTerm = require('qrcode-terminal')
const AppUtil = require('../util.js')
const util = new AppUtil()

class CreateCommand extends Command {
  async run() {
    const {flags} = this.parse(CreateCommand)
    const qrcode = flags.qrcode
    if (!fs.existsSync(this.config.configDir)) {
      fs.mkdirSync(this.config.configDir)
    }

    const walletFile = path.join(this.config.configDir, 'wallet.json')
    if (!fs.existsSync(walletFile)) {
      // wallet does not exists
      const input = await cli.confirm('Create new wallet (y/N)?')
      if (input === true) {
        await util.createWallet(this.config.configDir)
      }
    }
    if (qrcode === true) {
      const walletInfo = require(walletFile)
      qrcodeTerm.generate(walletInfo.cashAddress, {small: true})
    }
  }
}

CreateCommand.description = `Create new NFT NS register
...
Create config directories, wallet etc.
`

CreateCommand.flags = {
  qrcode: flags.boolean({char: 'q', description: 'display wallet QRCode'}),
}

module.exports = CreateCommand
