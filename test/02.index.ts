import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect, assert } from 'chai'
import { Contract, BigNumber, constants } from 'ethers'
import { ethers } from 'hardhat'
import { parseEther } from 'ethers/lib/utils'
const { describe, it } = require('mocha');

describe('UintTest NsbExchange Smart Contract', function () {
    let signers: SignerWithAddress[]
    let lWeth: Contract;
    let nsbExchange: Contract;

    let nsb_ERC721A: Contract
    let nameERC721: string
    let symbolERC721: string
    let amountERC721Mint: number
    let urlERC721: string
    let approveSwapSign: string;
    let approveWithdrawSignForWithdraw: string;
    let dataSign: any;
    let dataSignForWithdraw: any;
    let amountWad: any

    beforeEach(async function () {
        signers = await ethers.getSigners();

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
        const ProxyAdmin = await ethers.getContractFactory('ProxyAdmin')
        const ProxyAdminWithOwner = ProxyAdmin.connect(signers[1])
        const proxyAdminContract = await ProxyAdminWithOwner.deploy()
        await proxyAdminContract.deployed()
        // ===============================================================

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

        //===============================================================
        const LWETH9 = await ethers.getContractFactory('LWETH9')
        const lWeth9 = await LWETH9.deploy()

        const LWETH9Proxy = await ethers.getContractFactory('NsbProxy')
        const lWeth9Proxy = await NsbExchangeProxy.deploy(
            lWeth9.address,
            proxyAdminContract.address,
            []
        )
        await lWeth9Proxy.deployed()

        lWeth = await ethers.getContractAt(
            'LWETH9',
            lWeth9Proxy.address
        )
        await lWeth.connect(signers[0]).initialize(
            nsbExchangeProxy.address
        )
        //===============================================================

        //===============================================================
        const currentTime = Math.floor(Date.now() / 1000);
        const amountEth = parseEther('1');
        dataSign = {
            guy: nsbExchange.address,
            wad: amountEth,
            timestamp: currentTime
        }
        const hash = ethers.utils.solidityKeccak256(
            ['address', 'uint', 'uint'],
            [dataSign.guy, dataSign.wad, dataSign.timestamp]
        )
        const sigHashBytes = ethers.utils.arrayify(hash)
        approveSwapSign = await signers[0].signMessage(sigHashBytes)
        //===============================================================

        //===============================================================
        amountWad = parseEther('0.5');
        const currentTimeForWithdraw = Math.floor(Date.now() / 1000);
        dataSignForWithdraw = {
            guy: nsbExchange.address,
            wad: amountWad,
            timestamp: currentTime
        }
        const hashForWithdraw = ethers.utils.solidityKeccak256(
            ['address', 'uint', 'uint'],
            [dataSignForWithdraw.guy, dataSignForWithdraw.wad, dataSignForWithdraw.timestamp]
        )
        const sigHashBytesForWithdraw = ethers.utils.arrayify(hashForWithdraw)
        approveWithdrawSignForWithdraw = await signers[0].signMessage(sigHashBytesForWithdraw)
        //===============================================================
    })


    it('Should be checked LWETH9', async function () {
        //===============================================================
        assert(
            lWeth.address != undefined,
            'LWETH9 address is undefined'
        )
        const adminAddress = await lWeth.adminAddress();
        assert.equal(
            adminAddress,
            signers[0].address,
            'Admin address is not correct'
        )
        const exchangeAddressOnContract = await lWeth.exchangeAddress();
        assert.equal(
            exchangeAddressOnContract,
            nsbExchange.address,
            'Exchange address is not correct'
        )
        //===============================================================
    })

    it("Should be deposit and approveSwap", async function () {
        //===============================================================
        const approveSwapTx = await lWeth.approveSwap(
            dataSign.guy,
            dataSign.wad,
            dataSign.timestamp,
            approveSwapSign,
            {
                value: dataSign.wad,
                from: signers[0].address
            }
        )
        await approveSwapTx.wait();
        const allowance = await lWeth.allowance(signers[0].address, dataSign.guy);
        assert.equal(
            allowance.toString(),
            dataSign.wad.toString(),
            'Allowance is not correct'
        )
        const balanceOf = await lWeth.balanceOf(signers[0].address);
        assert.equal(
            balanceOf.toString(),
            dataSign.wad.toString(),
            'BalanceOf is not correct'
        )

        const balanceEth = await ethers.provider.getBalance(lWeth.address);
        assert.equal(
            balanceEth.toString(),
            dataSign.wad.toString(),
            'BalanceEth is not correct'
        )
        //===============================================================

        //===============================================================
        const approveWithdrawTx = await lWeth.approveWithdraw(
            dataSignForWithdraw.guy,
            dataSignForWithdraw.wad,
            dataSignForWithdraw.timestamp,
            approveWithdrawSignForWithdraw,
            {
                from: signers[0].address
            }
        )
        await approveWithdrawTx.wait();

        const allowanceWithdraw = await lWeth.allowance(signers[0].address, dataSign.guy);
        assert.equal(
            allowanceWithdraw.toString(),
            dataSignForWithdraw.wad.toString(),
            'Allowance withdraw is not correct'
        )

        const balanceOfWithdraw = await lWeth.balanceOf(signers[0].address);
        assert.equal(
            balanceOfWithdraw.toString(),
            dataSignForWithdraw.wad.toString(),
            'BalanceOf withdraw is not correct'
        )

        const balanceEthWithdraw = await ethers.provider.getBalance(lWeth.address);
        assert.equal(
            balanceEthWithdraw.toString(),
            dataSignForWithdraw.wad.toString(),
            'BalanceEth withdraw is not correct'
        )
        //===============================================================
    })
})