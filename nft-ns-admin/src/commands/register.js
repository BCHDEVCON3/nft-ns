const {Command, flags} = require('@oclif/command')

class RegisterCommand extends Command {
  async run() {
    const {flags} = this.parse(RegisterCommand)
    const register = flags.register
    this.log(`register user domain ${register} from register.js`)
  }
}

RegisterCommand.description = `Register new user domain in given TLD
...
Domain name should be still not registered.
Do not add TLD (so 'user', not 'user.bch')
`

RegisterCommand.flags = {
  register: flags.string({char: 'r', description: 'register new user domain'}),
}

module.exports = RegisterCommand
