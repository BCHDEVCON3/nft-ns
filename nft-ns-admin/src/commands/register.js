const {cli} = require('cli-ux')
const {Command, flags} = require('@oclif/command')
const fs = require('fs-extra')
const path = require('path')
const AppUtil = require('../util.js')
const util = new AppUtil()

class RegisterCommand extends Command {
  async run() {
    const {flags} = this.parse(RegisterCommand)
    const name = flags.name
    const tld = flags.tld || 'bch'
    const baton = flags.baton || false
    cli.action.start('Fetching data')
    const walletInfo = await fs.readJSON(path.join(this.config.configDir, 'wallet.json'))
    // get domains from configDir/tld.json -- no sync
    const domainNames = await util.getTLDNames(walletInfo.cashAddress, this.config.configDir, false)
    const registeredTLDs = domainNames.map(function (tld) {
      return tld.domain
    })
    if (!registeredTLDs.includes(tld)) {
      this.error(`.${tld} TLD is invalid`)
      return
    }
    const domainRecords = domainNames.filter(function (record) {
      if (record.domain === tld) return true
      return false
    })
    if (!domainRecords[0] || !domainRecords[0].tokenId) {
      this.error(`.${tld} TLD record is invalid`)
      return
    }
    if (baton !== false) {
      const batonTxId = await util.batonClone(domainRecords[0], walletInfo)
      this.log(`Baton: https://explorer.bitcoin.com/bch/tx/${batonTxId}`)
    }
    const nameTxId = await util.registerName(name, domainRecords[0], walletInfo)
    this.log(`Baton: https://explorer.bitcoin.com/bch/tx/${nameTxId}`)
    cli.action.stop()
  }
}

RegisterCommand.description = `Register new name in given TLD
...
Nme should be still not registered.
Do not add TLD (so 'user', not 'user.bch')
`

RegisterCommand.flags = {
  name: flags.string({char: 'n', description: 'new name to register', required: true}),
  tld: flags.string({char: 't', description: 'TLD to register name in'}),
  baton: flags.boolean({char: 'b', description: 'clone mint baton before name register'})
}

module.exports = RegisterCommand
