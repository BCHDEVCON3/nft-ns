const {cli} = require('cli-ux')
const {Command, flags} = require('@oclif/command')
const fs = require('fs-extra')
const path = require('path')
const AppUtil = require('../util.js')
const util = new AppUtil()

class ListCommand extends Command {
  async run () {
    const {flags} = this.parse(ListCommand)
    const tld = flags.tld || 'all'
    const sync = flags.sync || false
    const temp = flags.temp || false
    cli.action.start('Fetching data')
    const walletInfo = await fs.readJSON(path.join(this.config.configDir, 'wallet.json'))
    let domainNames = await util.getTLDNames(walletInfo.cashAddress, this.config.configDir, sync, temp)
    if (tld === 'all') {
      this.log(JSON.stringify(domainNames, null, 2))
      return
    }
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
    domainNames = await util.getNamesInTLD(domainRecords[0])
    this.log(JSON.stringify(domainNames, null, 2))
    cli.action.stop()
  }
}

ListCommand.description = `List all domains
...
If TLD name is provided, list user domain in this TLD.
Else list all registered TLDs.
`

ListCommand.flags = {
  tld: flags.string({char: 't', description: 'list user names in this TLD'}),
  sync: flags.boolean({char: 's', description: 'refresh list from the blockchain'}),
  temp: flags.boolean({char: 'x', description: 'include also temporary TLDs'})
}

module.exports = ListCommand
