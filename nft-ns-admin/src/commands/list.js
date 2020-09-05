const {Command, flags} = require('@oclif/command')

class ListCommand extends Command {
  async run() {
    const {flags} = this.parse(ListCommand)
    const list = flags.list || 'all'
    this.log(`list ${list === 'all' ? 'all': '.'+list} domain names from commands/list.js`)
  }
}

ListCommand.description = `List all domains
...
If TLD name is provided, list user domain in this TLD.
Else list all registered TLDs.
`

ListCommand.flags = {
  list: flags.string({char: 'l', description: 'list domain names'}),
}

module.exports = ListCommand
