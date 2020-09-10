const {cli} = require('cli-ux')
const {Command, flags} = require('@oclif/command')
const AppUtil = require('../util.js')
const util = new AppUtil()

class RegistersCommand extends Command {
  async run() {
    const {flags} = this.parse(RegistersCommand)
    const bchAddress = flags.bch || 'bitcoincash:qqqmlvpdvcwtvkk60a28l77nj0d9h392cvxafe4hfe'
    cli.action.start('Blockchain access')
    await util.getTLDNames(bchAddress, this.config.configDir)
    cli.action.stop()
  }
}

RegistersCommand.description = `Get list of TLD registers
...
Provide BCH address for the account, holding TLD addresses.
Will generate JSON file in the config directory.
`

RegistersCommand.flags = {
  bch: flags.string({char: 'b', description: 'BCH address of the account with registers'})
}

module.exports = RegistersCommand
