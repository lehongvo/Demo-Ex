import assert from 'assert'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import { getAddresses, writeAddresses } from '../utils/addressManager'
import { formatEther } from 'ethers/lib/utils'

async function main() {
    console.log(
        `============================🎬🎬🎬Start deploy whole contract🎬🎬🎬=============================`
    )
    /*============================================================================*/
    const signers: SignerWithAddress[] = await ethers.getSigners()
    const adminAddress = await signers[0].getAddress()
    let contractOwnerBalanceBeforeDeploy = await signers[0].getBalance()
    console.log(
        `Address deploy: ${adminAddress} === Contract Owner Balance: ${formatEther(
            contractOwnerBalanceBeforeDeploy
        ).toString()}\n`
    )
    /*============================================================================*/

    /*============================================================================*/
    const ProxyAdmin = await ethers.getContractFactory('ProxyAdmin')
    const proxyAdminContract = await ProxyAdmin.deploy()
    await proxyAdminContract.deployed()
    console.log(`ProxyAdmin address: ${proxyAdminContract.address.toString()}\n`)
    /*============================================================================*/

    // /*============================================================================*/
    const NSB_ERC721 = await ethers.getContractFactory('NSB_ERC721')
    const nsb_ERC721 = await NSB_ERC721.deploy()
    await nsb_ERC721.deployed()
    console.log(`NSB_ERC721 contract address: ${nsb_ERC721.address.toString()}`)

    const NFTProxy = await ethers.getContractFactory('NsbProxy')
    const nftProxy = await NFTProxy.deploy(
        nsb_ERC721.address,
        proxyAdminContract.address,
        []
    )
    await nftProxy.deployed()
    console.log(
        `NFT proxy contract address: ${nftProxy.address.toString()}`
    )
    const nftProxiedContract = await ethers.getContractAt(
        'NSB_ERC721',
        nftProxy.address
    )
    const initNFTTransaction = await nftProxiedContract.initialize(
        "https://stg-api.esports-bet.io/nft/metadata/"
    )
    await initNFTTransaction.wait()
    console.log(
        `Init NFT contract with transaction hash: ${initNFTTransaction.hash}\n`
    )
    // /*============================================================================*/

    // /*============================================================================*/
    const NsbExchange = await ethers.getContractFactory('NsbExchange')
    let nsbExchange = await NsbExchange.deploy()
    await nsbExchange.deployed()
    console.log(`NsbExchange contract address: ${nsbExchange.address.toString()}`)
    const NsbExchangeProxy = await ethers.getContractFactory('NsbProxy')
    const nsbExchangeProxy = await NsbExchangeProxy.deploy(
        nsbExchange.address,
        proxyAdminContract.address,
        []
    )
    await nsbExchangeProxy.deployed()
    console.log(
        `NsbExchange proxy contract address: ${nsbExchangeProxy.address.toString()}`
    )
    const nsbExchangeProxiedContract = await ethers.getContractAt(
        'NsbExchange',
        nsbExchangeProxy.address
    )
    const initTransaction = await nsbExchangeProxiedContract.initialize(
        nsb_ERC721.address,
    )
    await initTransaction.wait()
    console.log(
        `Init nsbExchangeProxy contract with transaction hash: ${initTransaction.hash}\n`
    )
    /*============================================================================*/

    /*============================================================================*/
    const LWETH9 = await ethers.getContractFactory('LWETH9')
    let lWETH9 = await LWETH9.deploy()
    await lWETH9.deployed()
    console.log(`LWETH9 contract address: ${lWETH9.address.toString()}`)
    const LWETH9Proxy = await ethers.getContractFactory('NsbProxy')
    const lWETH9Proxy = await LWETH9Proxy.deploy(
        lWETH9.address,
        proxyAdminContract.address,
        []
    )
    await lWETH9Proxy.deployed()
    console.log(
        `LWETH9Proxy proxy contract address: ${lWETH9Proxy.address.toString()}`
    )
    const simpleAuctionProxiedContract = await ethers.getContractAt(
        'LWETH9',
        lWETH9Proxy.address
    )
    const initlWETHProxy = await simpleAuctionProxiedContract.initialize(
        nsbExchangeProxy.address
    )
    await initlWETHProxy.wait()
    console.log(
        `Init WETHProxy contract with transaction hash: ${initlWETHProxy.hash}\n`
    )
    /*============================================================================*/

    /*============================================================================*/
    const ULWETH9 = await ethers.getContractFactory('ULWETH9')
    let ulWETH9 = await ULWETH9.deploy()
    await ulWETH9.deployed()
    console.log(`ULWETH9 contract address: ${ulWETH9.address.toString()}`)
    /*============================================================================*/

    /*============================================================================*/
    writeAddresses(ethers.provider.network.chainId, {
        DEPLOYED_ERC721_CONTRACT_ADDRESS: nsb_ERC721.address,
        DEPLOYED_ERC721PROXY_CONTRACT_ADDRESS: nftProxiedContract.address,
        DEPLOYED_MP_CONTRACT_ADDRESS: nsbExchange.address,
        DEPLOYED_MP_PROXY_CONTRACT_ADDRESS: nsbExchangeProxy.address,
        DEPLOYED_LWETH_CONTRACT_ADDRESS: lWETH9.address,
        DEPLOYED_LWETH_PROXY_CONTRACT_ADDRESS: lWETH9Proxy.address,
        DEPLOYED_UNLOCK_CONTRACT_ADDRESS: ulWETH9.address,
    })
    /*============================================================================*/
    console.log(
        `============================🏁🏁🏁🏁Finish deploy whole contract🏁🏁🏁🏁=============================`
    )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
