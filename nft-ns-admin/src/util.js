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

  async findBiggestUtxo (utxos) {
    try {
      let largestAmount = 0
      let largestIndex = 0

      for (var i = 0; i < utxos.length; i++) {
        const thisUtxo = utxos[i]
        /* eslint-disable no-await-in-loop */
        const txout = await bchjs.Blockchain.getTxOut(thisUtxo.tx_hash, thisUtxo.tx_pos)
        /* eslint-enable no-await-in-loop */
        if (txout === null) {
          // If the UTXO has already been spent, the full node will respond with null.
          console.log(
            'Stale UTXO found. You may need to wait for the indexer to catch up.'
          )
          continue
        }

        if (thisUtxo.value > largestAmount) {
          largestAmount = thisUtxo.value
          largestIndex = i
        }
      }

      return utxos[largestIndex]
    } catch (error) {
      console.error('Error in findBiggestUtxo: ', error)
      throw error
    }
  }

  async registerTLD(name, walletInfo, prefix = '_ns') {  // will use '_tns' for tests
    try {
      const data = await bchjs.Electrumx.utxo(walletInfo.cashAddress)
      const utxos = data.utxos
      if (utxos.length === 0) {
        throw new Error('No UTXOs to pay for transaction! Exiting.')
      }
      const utxo = await this.findBiggestUtxo(utxos)
      // build transaction
      const transactionBuilder = new bchjs.TransactionBuilder()
      const originalAmount = utxo.value
      const vout = utxo.tx_pos
      const txid = utxo.tx_hash
      // add input with txid and index of vout
      transactionBuilder.addInput(txid, vout)
      const txFee = 550 // TODO: calculate exact fee
      const dust = 546
      // amount to send back to the sending address.
      // Subtract two dust transactions for minting baton and tokens.
      const remainder = originalAmount - (2 * dust) - txFee
      const configObj = {
        name: `.${name} NFT-NS TLD`,
        ticker: `${prefix}.${name}`,
        documentUrl: 'https://github.com/zh/nft-ns',
        mintBatonVout: 2,
        initialQty: 1
      }
      // Generate the OP_RETURN entry for an SLP GENESIS transaction.
      const script = bchjs.SLP.NFT1.newNFTGroupOpReturn(configObj)
      // OP_RETURN needs to be the first output in the transaction.
      transactionBuilder.addOutput(script, 0)
      // Send dust transaction representing the tokens.
      transactionBuilder.addOutput(walletInfo.legacyAddress, dust)
      // Send dust transaction representing minting baton.
      transactionBuilder.addOutput(walletInfo.legacyAddress, dust)
      // add output to send BCH remainder of UTXO.
      transactionBuilder.addOutput(walletInfo.cashAddress, remainder)
      // Generate a keypair from the change address.
      const keyPair = bchjs.ECPair.fromWIF(walletInfo.WIF)
      // Sign the transaction with the HD node.
      let redeemScript
      transactionBuilder.sign(
        0,
        keyPair,
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        originalAmount
      )
      const hex = transactionBuilder.build().toHex()
      return await bchjs.RawTransactions.sendRawTransaction([hex])
    } catch (error) {
      console.error('Error in registerTLD: ', error)
      console.log(`slpAddr: ${walletInfo.cashAddress}`)
      throw error
    }
  }

  async registerName(name, record, walletInfo) {
    try {
      const data = await bchjs.Electrumx.utxo(walletInfo.cashAddress)
      const utxos = data.utxos
      if (utxos.length === 0) {
        throw new Error('No UTXOs to pay for transaction! Exiting.')
      }
      let tokenUtxos = await bchjs.SLP.Utils.tokenUtxoDetails(utxos)
      let alreadySynced = []
      tokenUtxos = tokenUtxos.filter(function (utxo) {
        if (!utxo || !utxo.tokenTicker) return false
        if (alreadySynced.includes(utxo.tokenTicker)) return false // uniq
        if (
          utxo.tokenId === record.tokenId &&
          utxo.utxoType === 'token'
        ) {
          alreadySynced.push(utxo.tokenTicker)
          return true
        }
        return false
      })
      if (tokenUtxos.length === 0) {
        // TODO: maybe cloneBaton here...
        throw new Error('No token UTXOs for the specified TLD could be found.')
      }
      const utxo = await this.findBiggestUtxo(utxos)
      // build transaction
      const transactionBuilder = new bchjs.TransactionBuilder()
      const originalAmount = utxo.value
      const vout = utxo.tx_pos
      const txid = utxo.tx_hash
      // add the NFT Group UTXO as an input. This NFT Group token must be burned
      // to create a Child NFT, as per the spec.
      transactionBuilder.addInput(tokenUtxos[0].tx_hash, tokenUtxos[0].tx_pos)
      // add input with txid and index of vout
      transactionBuilder.addInput(txid, vout)
      const txFee = 550 // TODO: calculate exact fee
      const dust = 546
      const remainder = originalAmount - txFee
      // Generate SLP config object
      const configObj = {
        name: `${name}.${record.domain}`,
        ticker: `_uns.${name}.${record.domain}`,
        documentUrl: 'https://github.com/zh/nft-ns'
      }
      // Generate the OP_RETURN entry for an SLP GENESIS transaction.
      const script = bchjs.SLP.NFT1.generateNFTChildGenesisOpReturn(configObj)
      transactionBuilder.addOutput(script, 0)
      // Send dust transaction representing the tokens.
      transactionBuilder.addOutput(walletInfo.legacyAddress, dust)
      // add output to send BCH remainder of UTXO.
      transactionBuilder.addOutput(walletInfo.cashAddress, remainder)
      // Generate a keypair from the change address.
      const keyPair = bchjs.ECPair.fromWIF(walletInfo.WIF)
      let redeemScript
      transactionBuilder.sign(
        0,
        keyPair,
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        dust
      )
      transactionBuilder.sign(
        1,
        keyPair,
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        originalAmount
      )
      const hex = transactionBuilder.build().toHex()
      return await bchjs.RawTransactions.sendRawTransaction([hex])
    } catch (error) {
      console.error('Error in registerName: ', error)
      console.log(`name: ${name}`)
      throw error
    }
  }

  async transferName(name, owner, walletInfo) {
    try {
      const data = await bchjs.Electrumx.utxo(walletInfo.cashAddress)
      const utxos = data.utxos
      if (utxos.length === 0) {
        throw new Error('No UTXOs to pay for transaction! Exiting.')
      }
      let tokenUtxos = await bchjs.SLP.Utils.tokenUtxoDetails(utxos)
      let alreadySynced = []
      tokenUtxos = tokenUtxos.filter(function (utxo) {
        if (!utxo || !utxo.tokenTicker) return false
        if (alreadySynced.includes(utxo.tokenTicker)) return false // uniq
        if (
          utxo.tokenTicker === `_uns.${name}` &&
          utxo.utxoType === 'token' && // UTXO is not a minting baton.
          utxo.tokenType === 65 // UTXO is for an NFT
        ) {
          alreadySynced.push(utxo.tokenTicker)
          return true
        }
        return false
      })
      if (tokenUtxos.length === 0) {
        throw new Error('No token UTXOs for the specified name could be found.')
      }
      const slpSendObj = bchjs.SLP.NFT1.generateNFTChildSendOpReturn(tokenUtxos, 1)
      const slpData = slpSendObj.script
      const utxo = await this.findBiggestUtxo(utxos)
      // build transaction
      const transactionBuilder = new bchjs.TransactionBuilder()
      const originalAmount = utxo.value
      transactionBuilder.addInput(utxo.tx_hash, utxo.tx_pos)
      // add each token UTXO as an input.
      for (let i = 0; i < tokenUtxos.length; i++) {
        transactionBuilder.addInput(tokenUtxos[i].tx_hash, tokenUtxos[i].tx_pos)
      }
      const txFee = 550
      const dust = 546
      const remainder = originalAmount - txFee - (2 * dust)
      transactionBuilder.addOutput(slpData, 0)
      // Send dust transaction representing tokens being sent.
      transactionBuilder.addOutput(
        bchjs.SLP.Address.toLegacyAddress(owner),
        dust
      )
      // Return any token change back to the sender.
      if (slpSendObj.outputs > 1) {
        transactionBuilder.addOutput(
          bchjs.SLP.Address.toLegacyAddress(walletInfo.slpAddress),
          dust
        )
      }
      // Last output: send the BCH change back to the wallet.
      transactionBuilder.addOutput(walletInfo.legacyAddress, remainder)
      const keyPair = bchjs.ECPair.fromWIF(walletInfo.WIF)
      let redeemScript
      transactionBuilder.sign(
        0,
        keyPair,
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        originalAmount
      )
      // Sign each token UTXO being consumed.
      for (let i = 0; i < tokenUtxos.length; i++) {
        const thisUtxo = tokenUtxos[i]

        transactionBuilder.sign(
          1 + i,
          keyPair,
          redeemScript,
          transactionBuilder.hashTypes.SIGHASH_ALL,
          thisUtxo.value
        )
      }
      const hex = transactionBuilder.build().toHex()
      return await bchjs.RawTransactions.sendRawTransaction([hex])
    } catch (error) {
      console.error('Error in transferName: ', error)
      console.log(`name: ${name}`)
      throw error
    }
  }

  async batonClone(record, walletInfo) {
    try {
      const data = await bchjs.Electrumx.utxo(walletInfo.cashAddress)
      const utxos = data.utxos
      if (utxos.length === 0) {
        throw new Error('No UTXOs to pay for transaction! Exiting.')
      }
      let tokenUtxos = await bchjs.SLP.Utils.tokenUtxoDetails(utxos)
      let alreadySynced = []
      tokenUtxos = tokenUtxos.filter(function (utxo) {
        if (!utxo || !utxo.tokenTicker) return false
        if (alreadySynced.includes(utxo.tokenTicker)) return false // uniq
        if (
          utxo.tokenId === record.tokenId &&
          utxo.utxoType === 'minting-baton' &&
          utxo.tokenType === 129 // UTXO is for NFT Group
        ) {
          alreadySynced.push(utxo.tokenTicker)
          return true
        }
        return false
      })
      if (tokenUtxos.length === 0) {
        throw new Error('No token UTXOs for the specified TLD could be found.')
      }
      const utxo = await this.findBiggestUtxo(utxos)
      // build transaction
      const transactionBuilder = new bchjs.TransactionBuilder()
      const originalAmount = utxo.value
      const vout = utxo.tx_pos
      const txid = utxo.tx_hash
      // add input with txid and index of vout
      transactionBuilder.addInput(txid, vout)
      // add the mint baton as an input.
      transactionBuilder.addInput(tokenUtxos[0].tx_hash, tokenUtxos[0].tx_pos)
      const txFee = 550 // TODO: calculate exact fee
      const dust = 546
      const remainder = originalAmount - dust - txFee
      const script = bchjs.SLP.NFT1.mintNFTGroupOpReturn(tokenUtxos, 1)
      transactionBuilder.addOutput(script, 0)
      // Send dust transaction representing the new tokens.
      transactionBuilder.addOutput(walletInfo.legacyAddress, dust)
      // Send dust transaction representing minting baton.
      transactionBuilder.addOutput(walletInfo.legacyAddress, dust)
      // add output to send BCH remainder of UTXO.
      transactionBuilder.addOutput(walletInfo.cashAddress, remainder)
      // Generate a keypair from the change address.
      const keyPair = bchjs.ECPair.fromWIF(walletInfo.WIF)
      let redeemScript
      transactionBuilder.sign(
        0,
        keyPair,
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        originalAmount
      )
      transactionBuilder.sign(
        1,
        keyPair,
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        dust
      )
      const hex = transactionBuilder.build().toHex()
      return await bchjs.RawTransactions.sendRawTransaction([hex])
    } catch (error) {
      console.error('Error in registerTLD: ', error)
      throw error
    }
  }

  async createWallet(configPath) {
    let outStr = ''
    const outObj = {}
    const mnemonic = bchjs.Mnemonic.generate(
      128,
      bchjs.Mnemonic.wordLists().english
    )
    outStr += 'BIP44 $BCH Wallet\n'
    outStr += `\n128 bit BIP32 Mnemonic:\n${mnemonic}\n\n`
    outObj.mnemonic = mnemonic
    const rootSeed = await bchjs.Mnemonic.toSeed(mnemonic)
    const masterHDNode = bchjs.HDNode.fromSeed(rootSeed)
    const account = bchjs.HDNode.derivePath(masterHDNode, "m/44'/245'/0'")
    outStr += 'BIP44 Account: "m/44\'/245\'/0\'"\n'
    for (let i = 0; i < 10; i++) {
      const childNode = masterHDNode.derivePath(`m/44'/245'/0'/0/${i}`)
      outStr += `m/44'/245'/0'/0/${i}: ${bchjs.HDNode.toCashAddress(childNode)}\n`

      if (i === 0) {
        outObj.cashAddress = bchjs.HDNode.toCashAddress(childNode)
        outObj.slpAddress = bchjs.SLP.Address.toSLPAddress(outObj.cashAddress)
        outObj.legacyAddress = bchjs.Address.toLegacyAddress(outObj.cashAddress)
        outObj.WIF = bchjs.HDNode.toWIF(childNode)
      }
    }
    const change = bchjs.HDNode.derivePath(account, '0/0')
    bchjs.HDNode.toCashAddress(change)
    outStr += '\n\n\n'
    const infoFile = path.join(configPath, 'wallet-info.txt')
    fs.writeFile(infoFile, outStr, function (err) {
      if (err) return console.error(err)
    })
    const walletFile = path.join(configPath, 'wallet.json')
    fs.writeFile(walletFile, JSON.stringify(outObj, null, 2), function (err) {
      if (err) return console.error(err)
    })
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

  async getNamesInTLD(record) {
    try {
      let alreadySynced = []
      const slpdbData = await this.getNFTChildren(record.tokenId)
      if (slpdbData.length === 0) {
        return {
          tld: record.domain,
          tokenId: record.tokenId,
          names: []
        }
      }
      const names = slpdbData.filter(function (n) {
        const details = n.tokenDetails
        if (!details || !details.symbol || details.symbol === '' || !details.tokenIdHex) return false
        if (alreadySynced.includes(details.symbol)) return false // uniq
        if (details.transactionType === 'GENESIS' &&
            details.symbol.startsWith('_uns.')) {
          alreadySynced.push(details.symbol)
          return true
        }
        return false
      })
      const nftNames = names.map(function (n) {
        return {
          domain: n.tokenDetails.symbol.replace('_uns.', ''),
          tokenId: n.tokenDetails.tokenIdHex
        }
      })
      const objNames = {
        tld: record.domain,
        tokenId: record.tokenId,
        names: nftNames
      }
      return objNames
    } catch (error) {
      console.error('Error in getNamesInTLD: ', error)
      throw error
    }
  }

  async getTLDNames(addr, configDir, sync = true, temp = false) {
    try {
      let domainNames = []
      const tldFile = path.join(configDir, 'tld.json')
      if (sync === true) {
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
          if (temp && utxo.tokenTicker.startsWith('_tns.')) {
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
      }
      domainNames = require(tldFile)
      return domainNames
    } catch (error) {
      console.error('Error in getTLDNames: ', error)
      console.log(`BCH Addr: ${addr}`)
      throw error
    }
  }

  // get 'hydrated' (with SLP details) transactions for address
  async getTokenUtxos (addr, tokenId) {
    try {
      const result = await bchjs.Electrumx.utxo(addr)
      // console.log(`utxos: ${JSON.stringify(result, null, 2)}`)
      if (result.utxos.length === 0) throw new Error('No UTXOs found.')

      // hydrate utxo data with SLP details
      let tokenUtxos = await bchjs.SLP.Utils.tokenUtxoDetails(result.utxos)
      // console.log(`utxos: ${JSON.stringify(tokenUtxos, null, 2)}`)
      tokenUtxos = tokenUtxos.filter(function (utxo) {
        if (utxo.tokenId === tokenId) return true
        return false
      })

      return tokenUtxos
    } catch (error) {
      console.error('Error in getTokenUtxos: ', error)
      console.log(`slpAddr: ${addr}`)
      throw error
    }
  }
}

module.exports = Util
