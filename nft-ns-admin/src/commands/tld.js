const {Command, flags} = require('@oclif/command')

class TldCommand extends Command {
  async run() {
    const {flags} = this.parse(TldCommand)
    const tld = flags.tld
    this.log(`register TLD ${tld} from commands/tld.js`)
  }
}

TldCommand.description = `Register new Top Level Domain (TLD)
...
TLD should be still not registered.
No need to start with dot (so 'bch', not '.bch')
`

TldCommand.flags = {
  tld: flags.string({char: 't', description: 'register new TLD'}),
}

module.exports = TldCommand
