// REST API servers.
// const MAINNET_API = 'https://free-main.fullstack.cash/v3/'
// if you have JWT token
const MAINNET_API = 'https://api.fullstack.cash/v3/'
const SLPDB_API = 'https://slpdb.fountainhead.cash/'

const fs = require('fs')
const path = require('path')
const axios = require('axios')
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

  async getTokenAddresses(tokenId) {
    try {
      const query = {
        v: 3,
        q: {
          db: ['g'],
          aggregate: [
            {
              $match: {
                'tokenDetails.tokenIdHex': tokenId
              }
            },
            {
              $unwind: '$graphTxn.outputs'
            },
            {
              $match: {
                'graphTxn.outputs.status': 'UNSPENT',
              }
            },
            {
              $group: {
                _id: '$graphTxn.outputs.address',
                slpAmount: {
                  $sum: '$graphTxn.outputs.slpAmount'
                }
              }
            },
            {
              $match: {
                slpAmount: {
                  $gt: 0
                }
              }
            }
          ],
          limit: 100,
          skip: 0
        }
      }
      const queryStr = JSON.stringify(query)
      const b64 = Buffer.from(queryStr).toString('base64')
      const url = `${SLPDB_API}q/${b64}`
      const options = {
        method: 'GET',
        headers: {
          'content-type': 'application/json'
        },
        url
      }
      const result = await axios(options)
      // console.log(`result: ${JSON.stringify(result.data, null, 2)}`)
      if (!result.data || !result.data.g || result.data.g.length === 0) {
        return {}
      }
      const slpInfo = result.data.g[0]
      if (slpInfo.slpAmount !== '1') {  // amount > 1 -> Not NFT
        return ''
      }
      return slpInfo._id
    } catch (error) {
      console.error('Error in getTokenAddresses: ', error)
      console.log(`tokenId: ${tokenId}`)
      throw error
    }
  }

  async getNFTChildren(groupId) {
    try {
      const query = {
        v: 3,
        q: {
          db: ['t'],
          aggregate: [
            {
              $match: {
                nftParentId: groupId
              }
            },
            {
              $skip: 0
            },
            {
              $limit: 100
            }
          ]
        }
      }
      const queryStr = JSON.stringify(query)
      const b64 = Buffer.from(queryStr).toString('base64')
      const url = `${SLPDB_API}q/${b64}`
      const options = {
        method: 'GET',
        headers: {
          'content-type': 'application/json'
        },
        url
      }
      const result = await axios(options)
      if (!result.data || !result.data.t) {
        return {}
      }
      return result.data.t
    } catch (error) {
      console.error('Error in getNFTChildren: ', error)
      console.log(`tokenId: ${groupId}`)
      throw error
    }
  }

  async getNameInfo(register, name) {
    try {
      let names = await this.getNFTChildren(register)
      if (!names || names.length === 0) {
        return {}
      }
      let alreadySynced = []
      names = names.filter(function (n) {
        const details = n.tokenDetails
        if (!details || !details.symbol || details.symbol === '' || !details.tokenIdHex) return false
        if (alreadySynced.includes(details.symbol)) return false // uniq
        if (details.transactionType === 'GENESIS' &&
            details.symbol === `_uns.${name}`) {
          alreadySynced.push(details.symbol)
          return true
        }
        return false
      })
      if (names.length === 0) {
        return {}
      }
      return {
        domain: names[0].tokenDetails.symbol.replace('_uns.', ''),
        tokenId: names[0].tokenDetails.tokenIdHex
      }
    } catch (error) {
      console.error('Error in getNameInfo: ', error)
      console.log(`name: ${name}`)
      throw error
    }
  }

  async getTLDNames(addr, configDir) {
    try {
      let domainNames = []
      const tldFile = path.join(configDir, 'tld.json')
      const result = await bchjs.Electrumx.utxo(addr)
      if (result.utxos.length === 0) throw new Error('No Domain Names UTXOs found.')
      let tokenUtxos = await bchjs.SLP.Utils.tokenUtxoDetails(result.utxos)
      let alreadySynced = []
      tokenUtxos = tokenUtxos.filter(function (utxo) {
        if (!utxo || !utxo.tokenTicker) return false
        if (alreadySynced.includes(utxo.tokenTicker)) return false // uniq
        if (utxo.tokenTicker.startsWith('_ns.')) {
          alreadySynced.push(utxo.tokenTicker)
          return true
        }
        return false
      })
      // console.log(`tokenUtxos: ${JSON.stringify(tokenUtxos, null, 2)}`)
      domainNames = tokenUtxos.map(function (utxo) {
        return {
          domain: utxo.tokenTicker.replace('_ns.', ''),
          name: utxo.tokenName,
          tokenId: utxo.tokenId
        }
      })
      fs.writeFileSync(tldFile, JSON.stringify(domainNames, null, 2))
      domainNames = require(tldFile)
      return domainNames
    } catch (error) {
      console.error('Error in getTLDNames: ', error)
      console.log(`BCH Addr: ${addr}`)
      throw error
    }
  }
}

module.exports = Util
