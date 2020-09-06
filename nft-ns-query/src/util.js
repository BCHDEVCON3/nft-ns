// REST API servers.
// const MAINNET_API = 'https://free-main.fullstack.cash/v3/'
// if you have JWT token
const MAINNET_API = 'https://api.fullstack.cash/v3/'

const BCHJS = require('@psf/bch-js')
const bchjs = new BCHJS({
  restURL: MAINNET_API,
  apiToken: process.env.BCHJSTOKEN
})

class Util {
  async validAddress(address) {
    try {
      const legacyAddress = bchjs.SLP.Address.toLegacyAddress(address)
      const check = await bchjs.Util.validateAddress(legacyAddress)
      return check.isvalid
    } catch (error) {
      return false
    }
  }

  async getNamesByAddress(address) {
    try {
      const legacy = bchjs.SLP.Address.toLegacyAddress(address)
      const result = await bchjs.Electrumx.utxo(legacy)
      if (result.utxos.length === 0) throw new Error('No NFT NS UTXOs found.')

      let tokenUtxos = await bchjs.SLP.Utils.tokenUtxoDetails(result.utxos)
      let alreadySynced = []
      tokenUtxos = tokenUtxos.filter(function (utxo) {
        if (!utxo || !utxo.tokenTicker) return false
        if (alreadySynced.includes(utxo.tokenTicker)) return false // uniq
        if (
          utxo.utxoType === 'token' &&
          utxo.tokenType === 65 &&
          utxo.tokenTicker.startsWith('_uns.')
        ) return true
        return false
      })

      return tokenUtxos.map(function (utxo) {
        return {
          domain: utxo.tokenTicker.replace('_uns.', ''),
          tokenId: utxo.tokenId
        }
      })
    } catch (error) {
      console.error('Error in getTokenUtxos: ', error)
      console.log(`slpAddr: ${address}`)
      throw error
    }
  }
}

module.exports = Util
