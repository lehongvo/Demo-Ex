const { ethers } = require('ethers')
const { NSB_ERC721A_ABI, Gacha_ABI } = require('./04_abi')

const network = 'https://eth-sepolia.public.blastapi.io'
const contractAddress = '0x1595e51DD43Cc93716405dc9855a811CaE5B36B5'
const nftContractAddress = '0x223ACc796aE24f3B56ff64ad2DAF86331284cF46'
const privateKey =
  'f6ac3a901d2170e9fa165491ca443052e6d63d50460b497aa697ef9dca194075'

// https://gateway.pinata.cloud/ipfs/QmZ7WWzvqRVmxPpwL94MNNVCNBXCt7nDKDXaGzCSW6T3Wb 10 - 10
// https://gateway.pinata.cloud/ipfs/QmYgTPcdHmfquHnXqkMJhxtaT7UhEUmQy3L5w714AHhHHG 11 - 20
// https://gateway.pinata.cloud/ipfs/QmUjWMXVAhSNFnR4E5xyUbaHqqwvKF3wmoDT1QkRrGgUg7 12 - 30
// https://gateway.pinata.cloud/ipfs/QmV6BHsnd7gGEnDcT87hDWC1MHHMseU5w89s83wrMJoNCZ 13 - 40

const tryGachaTransaction = async (privateKey, listTokenId, playerAddress) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(network)
    const nftContract = new ethers.Contract(
      nftContractAddress,
      NSB_ERC721A_ABI,
      provider
    )

    let listRarity = [];
    for (let index = 0; index < listTokenId.length; index++) {
      const tokenURI = await nftContract.tokenURI(listTokenId[index])
      const rarity = await getMetadata(tokenURI)
      listRarity.push(rarity)
    }

    let signer = new ethers.Wallet(privateKey, provider)
    const gachaContract = new ethers.Contract(
      contractAddress,
      Gacha_ABI,
      signer
    )
    const randomRewardTx = await gachaContract.randomReward(
      listTokenId,
      listRarity,
      playerAddress
    )
    await randomRewardTx.wait()
    const txHash = randomRewardTx.hash
    const events = await getEventsFromTransaction(
      provider,
      gachaContract,
      txHash
    )
    console.log(events)
  } catch (error) {
    console.log(error)
  }
}

tryGachaTransaction(privateKey, [10, 11, 12, 13], "0x4a6f4FFd8e7164235E5aA7Db2B8425D3E3a7a165");

const getMetadata = async ipfsLink => {
  try {
    const response = await ethers.utils.fetchJson(ipfsLink)
    console.log(response);
    return Number(response.attributes[0].value)
  } catch (error) {
    console.error('Error fetching metadata:', error.message)
    throw error
  }
}

const getEventsFromTransaction = async (provider, contract, txHash) => {
  try {
    const eventName = 'TriggerGacha'
    const receipt = await provider.getTransactionReceipt(txHash)

    if (!receipt) {
      throw new Error('Transaction receipt not found')
    }

    const events = []
    for (const log of receipt.logs) {
      try {
        const parsedEvent = contract.interface.parseLog(log)

        if (parsedEvent.name === eventName) {
          events.push(parsedEvent)
        }
      } catch (error) {
        // Ignore if the log couldn't be parsed by the contract ABI
      }
    }

    if (events.length !== 0) {
      return {
        success: true,
        tokenId: Number(events[0].args._tokenId),
        hash: txHash
      }
    } else {
      return { success: false, tokenId: null, hash: txHash }
    }
  } catch (err) {
    console.error(err)
    throw err
  }
}
