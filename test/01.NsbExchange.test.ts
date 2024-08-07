import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect, assert } from 'chai'
import { Contract, BigNumber, constants } from 'ethers'
import { ethers } from 'hardhat'
import { parseEther } from 'ethers/lib/utils'
const { describe, it } = require('mocha');

type OfferTerm = {
    signerAddress: string
    nonce: number
    tradeAddress: string[]
    attributes: number[]
}

describe('UintTest NsbExchange Smart Contract', function () {
    let signers: SignerWithAddress[]
    let nsbExchange: Contract

    let nsb_ERC20: Contract
    let nameERC20: string
    let symbolERC20: string
    let amountERC20: number

    let nsb_ERC721A: Contract
    let nameERC721: string
    let symbolERC721: string
    let amountERC721Mint: number
    let urlERC721: string

    let nsb_ERC1155: Contract
    let nameERC1155: string
    let symbolERC1155: string
    let indexERC1155Mint: number
    let amountERC1155Mint: number
    let urlERC1155: string

    let offer: OfferTerm
    let offerSignature: string

    let offer1155: OfferTerm
    let offerSignature1155: string

    beforeEach(async function () {
        signers = await ethers.getSigners()

        //===============================================================
        const ProxyAdmin = await ethers.getContractFactory('ProxyAdmin')
        const ProxyAdminWithOwner = ProxyAdmin.connect(signers[1])
        const proxyAdminContract = await ProxyAdminWithOwner.deploy()
        await proxyAdminContract.deployed()
        // ===============================================================

        //===============================================================
        nameERC20 = process.env.ERC20_NAME!
        symbolERC20 = process.env.ERC20_SYMBOL!
        amountERC20 = parseInt(process.env.ERC20_AMOUNT || '0')
        const NSML_ERC20 = await ethers.getContractFactory('NSB_ERC20')
        nsb_ERC20 = await NSML_ERC20.deploy(nameERC20, symbolERC20, amountERC20)
        await nsb_ERC20.deployed()
        //===============================================================

        //===============================================================
        nameERC721 = process.env.ERC721_NAME!
        symbolERC721 = process.env.ERC721_SYMBOL!
        amountERC721Mint = parseInt(process.env.NFT721_AMOUNT_MINT || '0')
        urlERC721 = process.env.ERC721_URL!
        const NSB_ERC721A = await ethers.getContractFactory('NSB_ERC721A')
        nsb_ERC721A = await NSB_ERC721A.deploy(nameERC721, symbolERC721, urlERC721)
        await nsb_ERC721A.deployed()
        await nsb_ERC721A.mint(signers[1].address, amountERC721Mint)
        //===============================================================

        //===============================================================
        nameERC1155 = process.env.ERC1155_NAME!
        symbolERC1155 = process.env.ERC1155_SYMBOL!
        amountERC1155Mint = parseInt(process.env.NFT1155_AMOUNT_MINT || '0')
        indexERC1155Mint = parseInt(process.env.NFT1155_INDEX || '0')
        urlERC1155 = process.env.ERC1155_URL!
        const NSB_ERC1155 = await ethers.getContractFactory('NSB_ERC1155')
        nsb_ERC1155 = await NSB_ERC1155.deploy(
            nameERC1155,
            symbolERC1155,
            urlERC1155
        )
        await nsb_ERC1155.deployed()
        await nsb_ERC1155.mint(
            signers[1].address,
            indexERC1155Mint,
            amountERC1155Mint,
            []
        )
        //===============================================================

        //===============================================================
        const NsbExchange = await ethers.getContractFactory('NsbExchange')
        const nsbExchangeLogic = await NsbExchange.deploy()
        await nsbExchangeLogic.deployed()

        const NsbExchangeProxy = await ethers.getContractFactory('NsbProxy')
        const nsbExchangeProxy = await NsbExchangeProxy.deploy(
            nsbExchangeLogic.address,
            proxyAdminContract.address,
            []
        )
        await nsbExchangeProxy.deployed()

        nsbExchange = await ethers.getContractAt(
            'NsbExchange',
            nsbExchangeProxy.address
        )
        await nsbExchange
            .connect(signers[0])
            .initialize(nsb_ERC721A.address)
        // ===============================================================

        // ===============================================================
        const nonce = await ethers.provider.getTransactionCount(signers[0].address)
        offer = {
            signerAddress: signers[0].address,
            nonce: Number(nonce),
            tradeAddress: [
                signers[0].address,
                signers[1].address,
                nsb_ERC20.address,
                signers[2].address,
                signers[3].address,
                signers[4].address,
                signers[5].address
            ],
            attributes: [Number(parseEther('0.001')), 1, 10, 20, 30, 30]
        }
        const hash = ethers.utils.solidityKeccak256(
            ['address', 'uint256', 'address[]', 'uint256[]'],
            [offer.signerAddress, offer.nonce, offer.tradeAddress, offer.attributes]
        )
        const sigHashBytes = ethers.utils.arrayify(hash)
        offerSignature = await signers[0].signMessage(sigHashBytes)
        // ===============================================================

        // ===============================================================
        const nonceAcceptOfferNFT = await ethers.provider.getTransactionCount(signers[0].address);
        offer1155 = {
            signerAddress: signers[0].address,
            nonce: Number(nonceAcceptOfferNFT),
            tradeAddress: [
                signers[0].address,
                signers[1].address,
                nsb_ERC20.address,
                signers[2].address,
                signers[3].address,
                signers[4].address,
                signers[5].address
            ],
            attributes: [Number(parseEther('0.001')), 0, 10, 20, 30, 30, 100]
        }
        const hashForERC1155 = ethers.utils.solidityKeccak256(
            ['address', 'uint256', 'address[]', 'uint256[]'],
            [offer1155.signerAddress, offer1155.nonce, offer1155.tradeAddress, offer1155.attributes],
        );
        const sigHashBytesForERC1155 = ethers.utils.arrayify(hashForERC1155)
        offerSignature1155 = await signers[0].signMessage(ethers.utils.arrayify(sigHashBytesForERC1155));
        // ===============================================================

        // ===============================================================
        await nsb_ERC20
            .connect(signers[0])
            .approve(nsbExchange.address, parseEther(amountERC20.toString()))
        // ===============================================================

        //===============================================================
        await nsb_ERC721A
            .connect(signers[1])
            .setApprovalForAll(nsbExchange.address, true)
        await nsb_ERC721A
            .connect(signers[1])
            .approve(nsbExchange.address, offer.attributes[1])
        //===============================================================

        //===============================================================
        await nsb_ERC1155
            .connect(signers[1])
            .setApprovalForAll(nsbExchange.address, true)
        await nsb_ERC1155
            .connect(signers[1])
            .setApprovalForAll(nsbExchange.address, true)
        // ===============================================================
    })

    it('Should be check ERC20 after init', async function () {
        assert(
            nsb_ERC20.address != undefined,
            'NSB_ERC20 contract should be initialized'
        )

        const owner = await nsb_ERC20.owner()
        assert.equal(owner, signers[0].address, 'Owner address is not as expected')

        const name = await nsb_ERC20.name()
        assert.equal(name, nameERC20, 'Name of token ERC20 is not as expected')

        const symbol = await nsb_ERC20.symbol()
        assert.equal(
            symbol,
            symbolERC20,
            'Symbol of token ERC20 is not as expected'
        )

        const decimals = await nsb_ERC20.decimals()
        assert.equal(decimals, 18, 'Decimals of token ERC20 is not as expected')

        const totalBalanceToWei = await nsb_ERC20.balanceOf(signers[0].address)
        const totalBalanceFromWei = Number(totalBalanceToWei) / 10 ** 18
        assert.equal(
            totalBalanceFromWei,
            amountERC20,
            'Total amount of token ERC20 is not as expected'
        )
    })

    it('Should be check ERC721 after init', async function () {
        assert(
            nsb_ERC721A.address != undefined,
            'NSB_ERC721 contract should be initialized'
        )

        const owner = await nsb_ERC721A.owner()
        assert.equal(owner, signers[0].address, 'Owner address is not as expected')

        const name = await nsb_ERC721A.name()
        assert.equal(name, nameERC721, 'Name of token ERC721 is not as expected')

        const symbol = await nsb_ERC721A.symbol()
        assert.equal(
            symbol,
            symbolERC721,
            'Symbol of token ERC721 is not as expected'
        )

        const uriBase = await nsb_ERC721A.baseURI()
        assert.equal(
            uriBase,
            urlERC721,
            'Base uri of token ERC721 is not as expected'
        )

        const totalBalanceNft = await nsb_ERC721A.balanceOf(signers[1].address)
        assert.equal(
            totalBalanceNft,
            amountERC721Mint,
            'Total balance NFT is not as expected'
        )
    })

    it('Should be check ERC1155 after init', async function () {
        assert(
            nsb_ERC1155.address != undefined,
            'NSB_ERC1155 contract should be initialized'
        )

        const owner = await nsb_ERC1155.owner()
        assert.equal(owner, signers[0].address, 'Owner address is not as expected')

        const name = await nsb_ERC1155.name()
        assert.equal(name, nameERC1155, 'Name of token ERC1155 is not as expected')

        const symbol = await nsb_ERC1155.symbol()
        assert.equal(
            symbol,
            symbolERC1155,
            'Symbol of token ERC1155 is not as expected'
        )

        const uriBase = await nsb_ERC1155.uri(indexERC1155Mint)
        assert.equal(
            uriBase,
            urlERC1155,
            'Base uri of token ERC1155 is not as expected'
        )
        const totalBalanceNft = await nsb_ERC1155.balanceOf(
            signers[1].address,
            indexERC1155Mint
        )
        assert.equal(
            totalBalanceNft,
            amountERC1155Mint,
            'Total balance NFT is not as expected'
        )
    })

    it('Should be check smart contract should be init', async function () {
        // ===============================================================
        const admin = await nsbExchange.admin()
        assert.equal(
            admin,
            signers[0].address,
            `Admin address should be equal to ${admin}`
        )

        const owner = await nsbExchange.owner()
        assert.equal(
            owner,
            signers[0].address,
            `Owner address should be equal to ${owner}`
        )

        // const erc1155Address = await nsbExchange.ERC1155()
        // assert.equal(
        //     erc1155Address,
        //     nsb_ERC1155.address,
        //     `ERC1155 address should be equal to ${erc1155Address}`
        // )

        const erc721Address = await nsbExchange.ERC721()
        assert.equal(
            erc721Address,
            nsb_ERC721A.address,
            `ERC721 address should be equal to ${erc721Address}`
        )

        const isWhitelistAddress = await nsbExchange.whitelistAddress(
            signers[0].address
        )
        assert.equal(
            isWhitelistAddress,
            true,
            `Status of admin address is ${isWhitelistAddress}`
        )
        // ===============================================================

        //===============================================================
        const balanceERC20FromBuyer = await nsb_ERC20.balanceOf(signers[0].address)
        assert.equal(
            Number(balanceERC20FromBuyer),
            Number(parseEther(amountERC20.toString())),
            `Balance of buyer should be equal to ${Number(balanceERC20FromBuyer)}`
        )

        const balanceERC721FromSeller = await nsb_ERC721A.balanceOf(
            signers[1].address
        )
        assert.equal(
            Number(balanceERC721FromSeller),
            Number(amountERC721Mint),
            `Number tokens 721 of seller should be equal to ${Number(
                balanceERC721FromSeller
            )}`
        )

        const balanceERC1155FromSeller = await nsb_ERC1155.balanceOf(
            signers[1].address,
            indexERC1155Mint
        )
        assert.equal(
            Number(balanceERC1155FromSeller),
            Number(amountERC1155Mint),
            `Number tokens 721 of seller should be equal to ${Number(
                amountERC1155Mint
            )}`
        )
        //===============================================================

        //===============================================================
        const amountApproveERC20FromBuyer = await nsb_ERC20.allowance(
            signers[0].address,
            nsbExchange.address
        )
        assert.equal(
            Number(amountApproveERC20FromBuyer),
            Number(parseEther(amountERC20.toString())),
            `Amount approve token ERC20 should be equal to ${Number(
                amountApproveERC20FromBuyer
            )}`
        )

        const statusApproveERC721FromSeller = await nsb_ERC721A.isApprovedForAll(
            signers[1].address,
            nsbExchange.address
        )
        assert.equal(
            statusApproveERC721FromSeller,
            true,
            `Status approve token ERC721 from seller should be equal to ${statusApproveERC721FromSeller}`
        )

        const statusApproveERC1155FromSeller = await nsb_ERC1155.isApprovedForAll(
            signers[1].address,
            nsbExchange.address
        )
        assert.equal(
            statusApproveERC1155FromSeller,
            true,
            `Status approve token ERC1155 from seller should be equal to ${statusApproveERC721FromSeller}`
        )
        // ===============================================================
    })

    it('Should be check function buyNFTNormal from EsbExchange', async function () {
        //===============================================================
        const ownerNftOfBuyerBeforeBuy = await nsb_ERC721A.ownerOf(
            offer.attributes[1]
        )
        assert.equal(
            ownerNftOfBuyerBeforeBuy,
            signers[1].address,
            `Owner of NFT buyer before should be equal ${ownerNftOfBuyerBeforeBuy}`
        )
        //===============================================================

        //===============================================================
        const balanceNftOfBuyerBeforeBuy = await nsb_ERC721A.balanceOf(
            signers[0].address
        )
        assert.equal(
            Number(balanceNftOfBuyerBeforeBuy),
            0,
            `Balance of NFT buyer before should be equal ${Number(
                balanceNftOfBuyerBeforeBuy
            )}`
        )

        const balanceNftOfSellerBeforeBuy = await nsb_ERC721A.balanceOf(
            signers[1].address
        )
        assert.equal(
            Number(balanceNftOfSellerBeforeBuy),
            amountERC721Mint,
            `Balance of NFT seller before should be equal  ${Number(
                balanceNftOfSellerBeforeBuy
            )}`
        )
        //===============================================================

        //===============================================================
        const balanceERCOfBuyerBeforeBuy = await nsb_ERC20.balanceOf(
            signers[0].address
        )
        assert.equal(
            Number(balanceERCOfBuyerBeforeBuy),
            Number(parseEther(amountERC20.toString())),
            `Balance of NFT seller before should be equal  ${Number(
                balanceNftOfSellerBeforeBuy
            )}`
        )

        const balanceERCOfSellerBeforeBuy = await nsb_ERC20.balanceOf(
            signers[1].address
        )
        assert.equal(
            Number(balanceERCOfSellerBeforeBuy),
            0,
            `Balance of NFT seller before should be equal  ${Number(
                balanceERCOfSellerBeforeBuy
            )}`
        )

        const balanceOfFeeAddressBeforeBuy = await nsb_ERC20.balanceOf(
            signers[2].address
        )
        assert.equal(
            Number(balanceOfFeeAddressBeforeBuy),
            0,
            `Balance of fee address before buy should be equal  ${Number(
                balanceOfFeeAddressBeforeBuy
            )}`
        )

        const balanceOfFeeAdminAddressBeforeBuy = await nsb_ERC20.balanceOf(
            signers[3].address
        )
        assert.equal(
            Number(balanceOfFeeAdminAddressBeforeBuy),
            0,
            `Balance of admin fee address before buy should be equal  ${Number(
                balanceOfFeeAdminAddressBeforeBuy
            )}`
        )

        const balanceOfFeeFighterAddressBeforeBuy = await nsb_ERC20.balanceOf(
            signers[4].address
        )
        assert.equal(
            Number(balanceOfFeeFighterAddressBeforeBuy),
            0,
            `Balance of fighter fee address before buy should be equal  ${Number(
                balanceOfFeeFighterAddressBeforeBuy
            )}`
        )

        const balanceOfFeeCoFighterAddressBeforeBuy = await nsb_ERC20.balanceOf(
            signers[5].address
        )
        assert.equal(
            Number(balanceOfFeeCoFighterAddressBeforeBuy),
            0,
            `Balance of company fighter fee address before buy should be equal  ${Number(
                balanceOfFeeCoFighterAddressBeforeBuy
            )}`
        )
        //===============================================================

        //===============================================================÷
        // await nsbExchange
        //     .connect(signers[0])
        //     .buyNFTNormal(
        //         offer.tradeAddress,
        //         offer.attributes,
        //         offer.nonce,
        //         offerSignature
        //     )
        //===============================================================

        //===============================================================
        // const balanceNftOfBuyerAfterBuy = await nsb_ERC721A.balanceOf(
        //     signers[0].address
        // )
        // assert.equal(
        //     Number(balanceNftOfBuyerAfterBuy),
        //     1,
        //     `Balance of NFT buyer after purchase should be equal ${Number(
        //         balanceNftOfBuyerAfterBuy
        //     )}`
        // )

        // const balanceNftOfSellerAfterBuy = await nsb_ERC721A.balanceOf(
        //     signers[1].address
        // )
        // assert.equal(
        //     Number(balanceNftOfSellerAfterBuy),
        //     Number(amountERC721Mint) - 1,
        //     `Balance of NFT seller after purchase should be equal  ${Number(
        //         balanceNftOfSellerAfterBuy
        //     )}`
        // )
        //===============================================================

        //===============================================================
        // const balanceERC20OfBuyerAfterBuy = await nsb_ERC20.balanceOf(
        //     signers[0].address
        // )
        // assert.equal(
        //     Number(balanceERC20OfBuyerAfterBuy),
        //     Number(balanceERCOfBuyerBeforeBuy) - Number(offer.attributes[0]),
        //     `Balance erc20 of buyer after purchase should be equal ${Number(
        //         balanceERC20OfBuyerAfterBuy
        //     )}`
        // )

        // const balanceERCOfSellerAfterBuy = await nsb_ERC20.balanceOf(
        //     signers[1].address
        // )
        // const remainingBalance =
        //     Number(offer.attributes[0]) -
        //     (Number(offer.attributes[0]) *
        //         (Number(offer.attributes[2]) +
        //             Number(offer.attributes[3]) +
        //             Number(offer.attributes[4]) +
        //             Number(offer.attributes[5]))) /
        //     1000
        // assert.equal(
        //     Number(balanceERCOfSellerAfterBuy),
        //     Number(remainingBalance),
        //     `Balance seller after purchase should be equal  ${Number(
        //         balanceERCOfSellerAfterBuy
        //     )}`
        // )

        // const balanceOfFeeAddressAfterBuy = await nsb_ERC20.balanceOf(
        //     signers[2].address
        // )
        // assert.equal(
        //     Number(balanceOfFeeAddressAfterBuy),
        //     (Number(offer.attributes[2]) * Number(offer.attributes[0])) / 1000,
        //     `Balance of fee address after purchase should be equal  ${Number(
        //         balanceOfFeeAddressAfterBuy
        //     )}`
        // )

        // const balanceOfFeeAdminAddressAfter = await nsb_ERC20.balanceOf(
        //     signers[3].address
        // )
        // assert.equal(
        //     Number(balanceOfFeeAdminAddressAfter),
        //     (Number(offer.attributes[3]) * Number(offer.attributes[0])) / 1000,
        //     `Balance of admin fee address after purchase buy should be equal  ${Number(
        //         balanceOfFeeAdminAddressAfter
        //     )}`
        // )

        // const balanceOfFeeFighterAddressAfterBuy = await nsb_ERC20.balanceOf(
        //     signers[4].address
        // )
        // assert.equal(
        //     Number(balanceOfFeeFighterAddressAfterBuy),
        //     (Number(offer.attributes[4]) * Number(offer.attributes[0])) / 1000,
        //     `Balance of fighter fee address after purchase should be equal  ${Number(
        //         balanceOfFeeFighterAddressAfterBuy
        //     )}`
        // )

        // const balanceOfFeeCoFighterAddressAfterBuy = await nsb_ERC20.balanceOf(
        //     signers[5].address
        // )
        // assert.equal(
        //     Number(balanceOfFeeCoFighterAddressAfterBuy),
        //     (Number(offer.attributes[5]) * Number(offer.attributes[0])) / 1000,
        //     `Balance of company fighter fee address after purchase should be equal  ${Number(
        //         balanceOfFeeCoFighterAddressAfterBuy
        //     )}`
        // )
        //===============================================================
    })

    it('Should be check function buyNFTETH from EsbExchange', async function () {
        //===============================================================
        const ownerNftOfBuyerBeforeBuy = await nsb_ERC721A.ownerOf(
            offer.attributes[1]
        )
        assert.equal(
            ownerNftOfBuyerBeforeBuy,
            signers[1].address,
            `Owner of NFT buyer before should be equal ${ownerNftOfBuyerBeforeBuy}`
        )
        //===============================================================

        //===============================================================
        const balanceNftOfBuyerBeforeBuy = await nsb_ERC721A.balanceOf(
            signers[0].address
        )
        assert.equal(
            Number(balanceNftOfBuyerBeforeBuy),
            0,
            `Balance of NFT buyer before should be equal ${Number(
                balanceNftOfBuyerBeforeBuy
            )}`
        )

        const balanceNftOfSellerBeforeBuy = await nsb_ERC721A.balanceOf(
            signers[1].address
        )
        assert.equal(
            Number(balanceNftOfSellerBeforeBuy),
            100,
            `Balance of NFT seller before should be equal  ${Number(
                balanceNftOfSellerBeforeBuy
            )}`
        )
        //===============================================================

        //===============================================================
        const balanceETHOfBuyerBeforeBuy = await ethers.provider.getBalance(
            signers[0].address
        )

        const balanceETHOfSellerBeforeBuy = await ethers.provider.getBalance(
            signers[1].address
        )
        assert(
            Number(balanceETHOfSellerBeforeBuy) < Number(parseEther('10000')),
            `Balance of NFT seller before should be equal  ${Number(
                balanceETHOfSellerBeforeBuy
            )}`
        )

        const balanceETHOfFeeBeforeBuy = await ethers.provider.getBalance(
            signers[2].address
        )
        assert.equal(
            Number(balanceETHOfFeeBeforeBuy),
            Number(parseEther('10000')),
            `Balance of fee address before purchase should be equal  ${Number(
                balanceETHOfFeeBeforeBuy
            )}`
        )

        const balanceETHOfFeeAddressBeforeBuy = await ethers.provider.getBalance(
            signers[3].address
        )
        assert.equal(
            Number(balanceETHOfFeeAddressBeforeBuy),
            Number(parseEther('10000')),
            `Balance of admin fee address before buy should be equal  ${Number(
                balanceETHOfFeeAddressBeforeBuy
            )}`
        )

        const balanceETHOfFeeFighterBeforeBuy = await ethers.provider.getBalance(
            signers[4].address
        )
        assert.equal(
            Number(balanceETHOfFeeFighterBeforeBuy),
            Number(parseEther('10000')),
            `Balance of fighter fee address before buy should be equal  ${Number(
                balanceETHOfFeeFighterBeforeBuy
            )}`
        )

        const balanceETHOfFeeCoOwnerFighterBeforeBuy =
            await ethers.provider.getBalance(signers[5].address)
        assert.equal(
            Number(balanceETHOfFeeCoOwnerFighterBeforeBuy),
            Number(parseEther('10000')),
            `Balance of company fighter fee address before buy should be equal  ${Number(
                balanceETHOfFeeCoOwnerFighterBeforeBuy
            )}`
        )
        //===============================================================

        //===============================================================
        await nsbExchange
            .connect(signers[0])
            .buyNFTETH(
                offer.tradeAddress,
                offer.attributes,
                offer.nonce,
                offerSignature,
                {
                    value: offer.attributes[0]!.toString()
                }
            )
        //===============================================================

        //===============================================================
        const balanceETHOfBuyerAfterBuy = await ethers.provider.getBalance(
            signers[0].address
        )
        assert(
            Number(balanceETHOfBuyerAfterBuy) < Number(balanceETHOfBuyerBeforeBuy),
            `Balance of NFT buyer after purchase should be equal ${Number(
                balanceETHOfBuyerAfterBuy
            )}`
        )

        const balanceETHOfSellerAfterBuy = await ethers.provider.getBalance(
            signers[1].address
        )
        const remainingBalance =
            Number(offer.attributes[0]) -
            (Number(offer.attributes[0]) *
                (Number(offer.attributes[2]) +
                    Number(offer.attributes[3]) +
                    Number(offer.attributes[4]) +
                    Number(offer.attributes[5]))) /
            1000
        // assert.equal(
        //     Number(balanceETHOfSellerAfterBuy),
        //     Number(balanceETHOfSellerBeforeBuy) + Number(remainingBalance),
        //     `Balance seller after purchase should be equal  ${Number(
        //         balanceETHOfSellerAfterBuy
        //     )}`
        // )

        const balanceOfFeeAddressAfterBuy = await ethers.provider.getBalance(
            signers[2].address
        )
        assert.equal(
            Number(balanceOfFeeAddressAfterBuy),
            Number(balanceETHOfFeeBeforeBuy) + (Number(offer.attributes[2]) * Number(offer.attributes[0])) / 1000,
            `Balance of fee address after purchase should be equal  ${Number(
                balanceOfFeeAddressAfterBuy
            )}`
        )

        const balanceOfFeeAdminAddressAfter = await ethers.provider.getBalance(
            signers[3].address
        )
        assert.equal(
            Number(balanceOfFeeAdminAddressAfter),
            Number(balanceETHOfFeeAddressBeforeBuy) + (Number(offer.attributes[3]) * Number(offer.attributes[0])) / 1000,
            `Balance of admin fee address after purchase buy should be equal  ${Number(
                balanceOfFeeAdminAddressAfter
            )}`
        )

        const balanceOfFeeFighterAddressAfterBuy = await ethers.provider.getBalance(
            signers[4].address
        )
        assert.equal(
            Number(balanceOfFeeFighterAddressAfterBuy),
            Number(balanceETHOfFeeFighterBeforeBuy) + (Number(offer.attributes[4]) * Number(offer.attributes[0])) / 1000,
            `Balance of fighter fee address after purchase should be equal  ${Number(
                balanceOfFeeFighterAddressAfterBuy
            )}`
        )

        const balanceOfFeeCoFighterAddressAfterBuy = await ethers.provider.getBalance(
            signers[5].address
        )
        assert.equal(
            Number(balanceOfFeeCoFighterAddressAfterBuy),
            Number(balanceETHOfFeeCoOwnerFighterBeforeBuy) + (Number(offer.attributes[5]) * Number(offer.attributes[0])) / 1000,
            `Balance of company fighter fee address after purchase should be equal  ${Number(
                balanceOfFeeCoFighterAddressAfterBuy
            )}`
        )
    })

    it("Should be check function auctionNFT from EsbExchange", async function () {
        //===============================================================
        const ownerNftOfBuyerBeforeBuy = await nsb_ERC721A.ownerOf(
            offer.attributes[1]
        )
        assert.equal(
            ownerNftOfBuyerBeforeBuy,
            signers[1].address,
            `Owner of NFT buyer before should be equal ${ownerNftOfBuyerBeforeBuy}`
        )
        //===============================================================

        //===============================================================
        const balanceNftOfBuyerBeforeBuy = await nsb_ERC721A.balanceOf(
            signers[0].address
        )
        assert.equal(
            Number(balanceNftOfBuyerBeforeBuy),
            0,
            `Balance of NFT buyer before should be equal ${Number(
                balanceNftOfBuyerBeforeBuy
            )}`
        )

        const balanceNftOfSellerBeforeBuy = await nsb_ERC721A.balanceOf(
            signers[1].address
        )
        assert.equal(
            Number(balanceNftOfSellerBeforeBuy),
            amountERC721Mint,
            `Balance of NFT seller before should be equal  ${Number(
                balanceNftOfSellerBeforeBuy
            )}`
        )
        //===============================================================

        //===============================================================
        const balanceERCOfBuyerBeforeBuy = await nsb_ERC20.balanceOf(
            signers[0].address
        )
        assert.equal(
            Number(balanceERCOfBuyerBeforeBuy),
            Number(parseEther(amountERC20.toString())),
            `Balance of NFT seller before should be equal  ${Number(
                balanceNftOfSellerBeforeBuy
            )}`
        )

        const balanceERCOfSellerBeforeBuy = await nsb_ERC20.balanceOf(
            signers[1].address
        )
        assert.equal(
            Number(balanceERCOfSellerBeforeBuy),
            0,
            `Balance of NFT seller before should be equal  ${Number(
                balanceERCOfSellerBeforeBuy
            )}`
        )

        const balanceOfFeeAddressBeforeBuy = await nsb_ERC20.balanceOf(
            signers[2].address
        )
        assert.equal(
            Number(balanceOfFeeAddressBeforeBuy),
            0,
            `Balance of fee address before buy should be equal  ${Number(
                balanceOfFeeAddressBeforeBuy
            )}`
        )

        const balanceOfFeeAdminAddressBeforeBuy = await nsb_ERC20.balanceOf(
            signers[3].address
        )
        assert.equal(
            Number(balanceOfFeeAdminAddressBeforeBuy),
            0,
            `Balance of admin fee address before buy should be equal  ${Number(
                balanceOfFeeAdminAddressBeforeBuy
            )}`
        )

        const balanceOfFeeFighterAddressBeforeBuy = await nsb_ERC20.balanceOf(
            signers[4].address
        )
        assert.equal(
            Number(balanceOfFeeFighterAddressBeforeBuy),
            0,
            `Balance of fighter fee address before buy should be equal  ${Number(
                balanceOfFeeFighterAddressBeforeBuy
            )}`
        )

        const balanceOfFeeCoFighterAddressBeforeBuy = await nsb_ERC20.balanceOf(
            signers[5].address
        )
        assert.equal(
            Number(balanceOfFeeCoFighterAddressBeforeBuy),
            0,
            `Balance of company fighter fee address before buy should be equal  ${Number(
                balanceOfFeeCoFighterAddressBeforeBuy
            )}`
        )
        //===============================================================

        //===============================================================
        await nsbExchange
            .connect(signers[0])
            .auctionNFT(
                offer.tradeAddress,
                offer.attributes
            )
        //===============================================================

        //===============================================================
        const balanceNftOfBuyerAfterBuy = await nsb_ERC721A.balanceOf(
            signers[0].address
        )
        assert.equal(
            Number(balanceNftOfBuyerAfterBuy),
            1,
            `Balance of NFT buyer after purchase should be equal ${Number(
                balanceNftOfBuyerAfterBuy
            )}`
        )

        const balanceNftOfSellerAfterBuy = await nsb_ERC721A.balanceOf(
            signers[1].address
        )
        // assert.equal(
        //     Number(balanceNftOfSellerAfterBuy),
        //     Number(amountERC721Mint) - 1,
        //     `Balance of NFT seller after purchase should be equal  ${Number(
        //         balanceNftOfSellerAfterBuy
        //     )}`
        // )
        // //===============================================================

        //===============================================================
        const balanceERC20OfBuyerAfterBuy = await nsb_ERC20.balanceOf(
            signers[0].address
        )
        // assert.equal(
        //     Number(balanceERC20OfBuyerAfterBuy),
        //     Number(balanceERCOfBuyerBeforeBuy) - Number(offer.attributes[0]),
        //     `Balance erc20 of buyer after purchase should be equal ${Number(
        //         balanceERC20OfBuyerAfterBuy
        //     )}`
        // )

        const balanceERCOfSellerAfterBuy = await nsb_ERC20.balanceOf(
            signers[1].address
        )
        const remainingBalance =
            Number(offer.attributes[0]) -
            (Number(offer.attributes[0]) *
                (Number(offer.attributes[2]) +
                    Number(offer.attributes[3]) +
                    Number(offer.attributes[4]) +
                    Number(offer.attributes[5]))) /
            1000
        assert.equal(
            Number(balanceERCOfSellerAfterBuy),
            Number(remainingBalance),
            `Balance seller after purchase should be equal  ${Number(
                balanceERCOfSellerAfterBuy
            )}`
        )

        const balanceOfFeeAddressAfterBuy = await nsb_ERC20.balanceOf(
            signers[2].address
        )
        assert.equal(
            Number(balanceOfFeeAddressAfterBuy),
            (Number(offer.attributes[2]) * Number(offer.attributes[0])) / 1000,
            `Balance of fee address after purchase should be equal  ${Number(
                balanceOfFeeAddressAfterBuy
            )}`
        )

        const balanceOfFeeAdminAddressAfter = await nsb_ERC20.balanceOf(
            signers[3].address
        )
        assert.equal(
            Number(balanceOfFeeAdminAddressAfter),
            (Number(offer.attributes[3]) * Number(offer.attributes[0])) / 1000,
            `Balance of admin fee address after purchase buy should be equal  ${Number(
                balanceOfFeeAdminAddressAfter
            )}`
        )

        const balanceOfFeeFighterAddressAfterBuy = await nsb_ERC20.balanceOf(
            signers[4].address
        )
        assert.equal(
            Number(balanceOfFeeFighterAddressAfterBuy),
            (Number(offer.attributes[4]) * Number(offer.attributes[0])) / 1000,
            `Balance of fighter fee address after purchase should be equal  ${Number(
                balanceOfFeeFighterAddressAfterBuy
            )}`
        )

        const balanceOfFeeCoFighterAddressAfterBuy = await nsb_ERC20.balanceOf(
            signers[5].address
        )
        assert.equal(
            Number(balanceOfFeeCoFighterAddressAfterBuy),
            (Number(offer.attributes[5]) * Number(offer.attributes[0])) / 1000,
            `Balance of company fighter fee address after purchase should be equal  ${Number(
                balanceOfFeeCoFighterAddressAfterBuy
            )}`
        )
        //===============================================================
    });

    it("Should be check function acceptOfferNFT from EsbExchange", async function () {
        //===============================================================
        const ownerNftOfBuyerBeforeBuy = await nsb_ERC721A.ownerOf(
            offer.attributes[1]
        )
        assert.equal(
            ownerNftOfBuyerBeforeBuy,
            signers[1].address,
            `Owner of NFT buyer before should be equal ${ownerNftOfBuyerBeforeBuy}`
        )
        //===============================================================

        //===============================================================
        const balanceNftOfBuyerBeforeBuy = await nsb_ERC721A.balanceOf(
            signers[0].address
        )
        assert.equal(
            Number(balanceNftOfBuyerBeforeBuy),
            0,
            `Balance of NFT buyer before should be equal ${Number(
                balanceNftOfBuyerBeforeBuy
            )}`
        )

        const balanceNftOfSellerBeforeBuy = await nsb_ERC721A.balanceOf(
            signers[1].address
        )
        assert.equal(
            Number(balanceNftOfSellerBeforeBuy),
            amountERC721Mint,
            `Balance of NFT seller before should be equal  ${Number(
                balanceNftOfSellerBeforeBuy
            )}`
        )
        //===============================================================

        //===============================================================
        const balanceERCOfBuyerBeforeBuy = await nsb_ERC20.balanceOf(
            signers[0].address
        )
        assert.equal(
            Number(balanceERCOfBuyerBeforeBuy),
            Number(parseEther(amountERC20.toString())),
            `Balance of NFT seller before should be equal  ${Number(
                balanceNftOfSellerBeforeBuy
            )}`
        )

        const balanceERCOfSellerBeforeBuy = await nsb_ERC20.balanceOf(
            signers[1].address
        )
        assert.equal(
            Number(balanceERCOfSellerBeforeBuy),
            0,
            `Balance of NFT seller before should be equal  ${Number(
                balanceERCOfSellerBeforeBuy
            )}`
        )

        const balanceOfFeeAddressBeforeBuy = await nsb_ERC20.balanceOf(
            signers[2].address
        )
        assert.equal(
            Number(balanceOfFeeAddressBeforeBuy),
            0,
            `Balance of fee address before buy should be equal  ${Number(
                balanceOfFeeAddressBeforeBuy
            )}`
        )

        const balanceOfFeeAdminAddressBeforeBuy = await nsb_ERC20.balanceOf(
            signers[3].address
        )
        assert.equal(
            Number(balanceOfFeeAdminAddressBeforeBuy),
            0,
            `Balance of admin fee address before buy should be equal  ${Number(
                balanceOfFeeAdminAddressBeforeBuy
            )}`
        )

        const balanceOfFeeFighterAddressBeforeBuy = await nsb_ERC20.balanceOf(
            signers[4].address
        )
        assert.equal(
            Number(balanceOfFeeFighterAddressBeforeBuy),
            0,
            `Balance of fighter fee address before buy should be equal  ${Number(
                balanceOfFeeFighterAddressBeforeBuy
            )}`
        )

        const balanceOfFeeCoFighterAddressBeforeBuy = await nsb_ERC20.balanceOf(
            signers[5].address
        )
        assert.equal(
            Number(balanceOfFeeCoFighterAddressBeforeBuy),
            0,
            `Balance of company fighter fee address before buy should be equal  ${Number(
                balanceOfFeeCoFighterAddressBeforeBuy
            )}`
        )
        //===============================================================

        //===============================================================
        await nsbExchange
            .connect(signers[0])
            .acceptOfferNFT(
                offer.tradeAddress,
                offer.attributes,
                offer.nonce,
                offerSignature
            )
        //===============================================================

        //===============================================================
        const balanceNftOfBuyerAfterBuy = await nsb_ERC721A.balanceOf(
            signers[0].address
        )
        assert.equal(
            Number(balanceNftOfBuyerAfterBuy),
            1,
            `Balance of NFT buyer after purchase should be equal ${Number(
                balanceNftOfBuyerAfterBuy
            )}`
        )

        const balanceNftOfSellerAfterBuy = await nsb_ERC721A.balanceOf(
            signers[1].address
        )
        assert.equal(
            Number(balanceNftOfSellerAfterBuy),
            Number(amountERC721Mint) - 1,
            `Balance of NFT seller after purchase should be equal  ${Number(
                balanceNftOfSellerAfterBuy
            )}`
        )
        //===============================================================

        //===============================================================
        const balanceERC20OfBuyerAfterBuy = await nsb_ERC20.balanceOf(
            signers[0].address
        )
        assert(
            Number(balanceERC20OfBuyerAfterBuy) >
            Number(balanceERCOfBuyerBeforeBuy) - Number(offer.attributes[0]),
            `Balance erc20 of buyer after purchase should be equal ${Number(
                balanceERC20OfBuyerAfterBuy
            )}`
        )

        const balanceERCOfSellerAfterBuy = await nsb_ERC20.balanceOf(
            signers[1].address
        )
        assert.equal(
            Number(balanceERCOfSellerAfterBuy),
            0,
            `Balance seller after purchase should be equal  ${Number(
                balanceERCOfSellerAfterBuy
            )}`
        )

        const balanceOfFeeAddressAfterBuy = await nsb_ERC20.balanceOf(
            signers[2].address
        )
        assert.equal(
            Number(balanceOfFeeAddressAfterBuy),
            (Number(offer.attributes[2]) * Number(offer.attributes[0])) / 1000,
            `Balance of fee address after purchase should be equal  ${Number(
                balanceOfFeeAddressAfterBuy
            )}`
        )

        const balanceOfFeeAdminAddressAfter = await nsb_ERC20.balanceOf(
            signers[3].address
        )
        assert.equal(
            Number(balanceOfFeeAdminAddressAfter),
            (Number(offer.attributes[3]) * Number(offer.attributes[0])) / 1000,
            `Balance of admin fee address after purchase buy should be equal  ${Number(
                balanceOfFeeAdminAddressAfter
            )}`
        )

        const balanceOfFeeFighterAddressAfterBuy = await nsb_ERC20.balanceOf(
            signers[4].address
        )
        assert.equal(
            Number(balanceOfFeeFighterAddressAfterBuy),
            (Number(offer.attributes[4]) * Number(offer.attributes[0])) / 1000,
            `Balance of fighter fee address after purchase should be equal  ${Number(
                balanceOfFeeFighterAddressAfterBuy
            )}`
        )

        const balanceOfFeeCoFighterAddressAfterBuy = await nsb_ERC20.balanceOf(
            signers[5].address
        )
        assert.equal(
            Number(balanceOfFeeCoFighterAddressAfterBuy),
            (Number(offer.attributes[5]) * Number(offer.attributes[0])) / 1000,
            `Balance of company fighter fee address after purchase should be equal  ${Number(
                balanceOfFeeCoFighterAddressAfterBuy
            )}`
        )
        //===============================================================
    });

    it("Should be check function buyERC1155Normal from EsbExchange", async function () {
        //===============================================================
        const balanceNft1155OfBuyerBeforeBuy = await nsb_ERC1155.balanceOf(
            signers[0].address,
            Number(offer1155.attributes[1])
        );
        assert.equal(
            Number(balanceNft1155OfBuyerBeforeBuy),
            0,
            `Balance of NFT1155 buyer before purchase be equal ${Number(balanceNft1155OfBuyerBeforeBuy)}`
        );

        const balanceNftOfSellerBeforeBuy = await nsb_ERC1155.balanceOf(
            signers[1].address,
            Number(offer1155.attributes[1])
        );

        //===============================================================
        const balanceERCOfBuyerBeforeBuy = await nsb_ERC20.balanceOf(
            signers[0].address
        )
        assert.equal(
            Number(balanceERCOfBuyerBeforeBuy),
            Number(parseEther(amountERC20.toString())),
            `Balance of NFT seller before should be equal  ${Number(
                balanceNftOfSellerBeforeBuy
            )}`
        )
        //===============================================================
    })
})
