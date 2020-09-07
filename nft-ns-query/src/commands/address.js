const {cli} = require('cli-ux')
const {Command, flags} = require('@oclif/command')
const fs = require('fs-extra')
const path = require('path')
const AppUtil = require('../util.js')
const util = new AppUtil()

class AddressCommand extends Command {
  async registerForTLD(tld) {
    try {
      let tldInfo = await fs.readJSON(path.join(this.config.configDir, 'tld.json'))
      tldInfo = tldInfo.filter(function (n) {
        if (n.domain === tld) return true
        return false
      })
      if (!tldInfo || tldInfo === undefined || tldInfo.length === 0) return ''
      return tldInfo[0].tokenId
    } catch (error) {
      this.log(`getRegisters: ${error}`)
    }
  }

  async run () {
    const {flags} = this.parse(AddressCommand)
    const name = flags.name
    let register = flags.register
    cli.action.start('Blockchain access')
    if (!register) {
      register = name.split('.').pop()
    }
    const tldRegister = await this.registerForTLD(register)
    const registerTokenId = (tldRegister === '') ? register : tldRegister
    const nameInfo = await util.getNameInfo(registerTokenId, name)
    if (nameInfo === {}) {
      return
    }
    const slpAddress = await util.getTokenAddresses(nameInfo.tokenId)
    let domainNames = await util.getNamesByAddress(slpAddress)
    domainNames = domainNames.map(function (d) {
      return d.domain
    })
    if (domainNames.includes(name)) {
      this.log(JSON.stringify({slpAddress}, null, 2))
    } else {
      this.error(`Invalid resolver: ${registerTokenId} ${name} -> ${slpAddress}`)
    }
    cli.action.stop()
  }
}

AddressCommand.description = `Find SLP address by name
...
Similar to DNS lookup - will find corresponding SLP address
by given NFT Name Service name
(example:  '--name=user.bch')
`

AddressCommand.flags = {
  name: flags.string({char: 'n', description: 'NFT NS name (user.bch)', required: true}),
  register: flags.string({char: 'r', description: 'NFT NS register TLD (bch)'})
}

module.exports = AddressCommand
