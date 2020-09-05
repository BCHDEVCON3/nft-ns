const {cli} = require('cli-ux')
const {Command, flags} = require('@oclif/command')
const fs = require('fs-extra')
const path = require('path')
const AppUtil = require('../util.js')
const util = new AppUtil()

class TldCommand extends Command {
  async run () {
    const {flags} = this.parse(TldCommand)
    const name = flags.name
    const temp = flags.temp || false
    const prefix = temp === true ? '_tns' : '_ns'
    cli.action.start('Fetching data')
    const walletInfo = await fs.readJSON(path.join(this.config.configDir, 'wallet.json'))
    // get domains from configDir/tld.json -- no sync
    const domainNames = await util.getTLDNames(walletInfo.cashAddress, this.config.configDir, false)
    const registeredTLDs = domainNames.map(function (tld) {
      return tld.domain
    })
    if (registeredTLDs.includes(name)) {
      this.error(`.${name} TLD is already registered`)
      return
    }
    const txidStr = await util.registerTLD(name, walletInfo, prefix)
    this.log(`TLD: https://explorer.bitcoin.com/bch/tx/${txidStr}`)
    cli.action.stop()
  }
}

TldCommand.description = `Register new Top Level Domain (TLD)
...
TLD should be still not registered.
No need to start with dot (so 'bch', not '.bch')
`

TldCommand.flags = {
  name: flags.string({char: 'n', description: 'new TLD name to register', required: true}),
  temp: flags.boolean({char: 't', description: 'temporary TLD - _tns prefix'})
}

module.exports = TldCommand
