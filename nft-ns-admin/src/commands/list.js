const {cli} = require('cli-ux')
const {Command, flags} = require('@oclif/command')
const fs = require('fs-extra')
const path = require('path')
const AppUtil = require('../util.js')
const util = new AppUtil()

class ListCommand extends Command {
  async run () {
    const {flags} = this.parse(ListCommand)
    const user = flags.user || 'all'
    const sync = flags.sync || false
    const temp = flags.temp || false
    // TODO: user domains per TLD
    if (user === 'all') {
      cli.action.start('Fetching data')
      const walletInfo = await fs.readJSON(path.join(this.config.configDir, 'wallet.json'))
      const domainNames = await util.getTLDNames(walletInfo.cashAddress, this.config.configDir, sync, temp)
      cli.action.stop()
      this.log(`TLD: ${JSON.stringify(domainNames, null, 2)}`)
    } else {
      this.error('Not implemented')
    }
  }
}

ListCommand.description = `List all domains
...
If TLD name is provided, list user domain in this TLD.
Else list all registered TLDs.
`

ListCommand.flags = {
  user: flags.string({char: 'u', description: '(TODO) list user names in this TLD'}),
  sync: flags.boolean({char: 's', description: 'refresh list from the blockchain'}),
  temp: flags.boolean({char: 't', description: 'include also temporary TLDs'})
}

module.exports = ListCommand
