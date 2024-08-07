import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { formatEther } from 'ethers/lib/utils'
import { ethers, run } from 'hardhat'
import { getAddresses } from '../utils/addressManager'

async function main() {
    console.log(
        `============================🎬🎬🎬🎬Start verify whole contract🎬🎬🎬🎬=============================`
    )
    const signers: SignerWithAddress[] = await ethers.getSigners();

    let balanceBeforeDeploy = await signers[0].getBalance();
    console.log(`Signer 0 Balance: ${formatEther(balanceBeforeDeploy).toString()}`);

    const addresses = await getAddresses(ethers.provider.network.chainId);

    // try {
    //     await run("verify:verify", {
    //         address: addresses["DEPLOYED_LWETH_PROXY_CONTRACT_ADDRESS"],
    //         constructorArguments: [
    //             addresses["DEPLOYED_LWETH_CONTRACT_ADDRESS"],
    //             "0x5F5A3A521f60eCd107474aA80E8b72AE1e0A705F",
    //             []
    //         ],
    //         contract: "contracts/proxy/NsbProxy.sol:NsbProxy",
    //     });
    // } catch (err) {
    //     console.log(err);
    // }

    // try {
    //     await run("verify:verify", {
    //         address: addresses["DEPLOYED_UNLOCK_CONTRACT_ADDRESS"],
    //         constructorArguments: [],
    //         contract: "contracts/tokens/ULWETH9.sol:ULWETH9",
    //     });
    // } catch (err) {
    //     console.log(err);
    // }
    console.log("============================🏁🏁🏁🏁Finish verify whole contract🏁🏁🏁🏁=============================");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

