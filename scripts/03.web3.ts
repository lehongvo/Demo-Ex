const { ethers, BigNumber } = require("ethers");
const { NSML_ERC20_ABI, NSB_ERC721A_ABI, NSB_ERC1155_ABI, NsbLocker_ABI, NsbExchange_ABI } = require('./abi');
const goerli = "https://goerli.infura.io/v3/982727d220c946f8910109c11f31dbb0";
import fs from "fs";
import path from "path";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { formatEther } from 'ethers/lib/utils';
import dotenv from 'dotenv';

const getExplorerLink = (chainId: number): string => {
    switch (chainId) {
        case 1:
            return "https://etherscan.io/tx/";
        case 5:
            return "https://goerli.etherscan.io/tx/";
        case 1337:
            return "http://localhost:3000/tx/";
    }
    return "";
};

const getNetworkName = (chainId: number): string => {
    switch (chainId) {
        case 1:
            return "mainnet";
        case 5:
            return "goerli";
        case 1337:
            return "localhost";
    }
    return "";
};

const getAddresses = async (chainId: number): Promise<any> => {
    const networkName = getNetworkName(chainId);
    return new Promise((resolve, reject) => {
        fs.readFile(getFilePath(networkName), (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data.toString()));
            }
        });
    });
};

const getFilePath = (networkName: string): string => {
    return path.join(__dirname, `../addresses - ${networkName}.json`);
};

export const approveTokenERC20 = async (approveForAddress: string, amountApprove: number) => {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const addresses = await getAddresses(ethers.provider.network.chainId);
        const signer = provider.getSigner()
        const tokenContract = new ethers.Contract(
            addresses.DEPLOYED_ERC20_CONTRACT_ADDRESS,
            NSML_ERC20_ABI,
            signer
        );
        const decimals = await tokenContract.decimals();
        const currentAmountApprove = ethers.utils.parseUnits(amountApprove.toString(), decimals);
        const approveTransaction = await tokenContract.approve(
            approveForAddress,
            currentAmountApprove
        );
        // TODO: handle loading from there = true
        await approveTransaction.wait();
        // TODO: handle loading from there = false
        console.log(approveTransaction.hash);
    } catch (error) {
        console.log(error);
    }
}

const approveNftFromIndex = async (approveForAddress: string, indexNft: number) => {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const addresses = await getAddresses(ethers.provider.network.chainId);
        const signer = provider.getSigner()
        const nftContract = new ethers.Contract(
            addresses.DEPLOYED_ERC721A_CONTRACT_ADDRESS,
            NSB_ERC721A_ABI,
            signer
        );
        const getApproved = await nftContract.getApproved(indexNft);
        if(getApproved.toUpperCase() != approveForAddress.toUpperCase()) {

        }
        const approveTransaction = await nftContract.approve(
            approveForAddress,
            indexNft
        );
        // TODO: handle loading from there = true
        await approveTransaction.wait();
        // TODO: handle loading from there = false
        console.log(approveTransaction.hash);
    } catch (error) {
        console.log(error);
    }
}

approveNftFromIndex(
    "0x527C7A6F1e0aCD0cd23a048DAC1d8Eea959887aE",
    2200
)

const getGasEtmApproveNftFromIndex = async (
    network,
    nftContractAddress,
    web3AuthKey,
    nftIndex,
    exchangeContractAddress
  ) => {
    // try {
    const provider = new ethers.providers.JsonRpcProvider(network)
    const wallet = new ethers.Wallet(web3AuthKey, provider)
  
    const nftContract = new ethers.Contract(nftContractAddress, NSB_ERC721A_ABI, wallet)
    const totalSupply = await nftContract.totalSupply()
  
    if (nftIndex <= Number(totalSupply)) {
      const [approveForAddress, ownerOf, callerAddress] = await Promise.all([
        nftContract.getApproved(nftIndex),
        nftContract.ownerOf(nftIndex),
        wallet.getAddress()
      ])
      if (ownerOf.toUpperCase() == callerAddress.toUpperCase()) {
        if (approveForAddress.toUpperCase() != exchangeContractAddress.toUpperCase()) {
          const [gasPrice, estimateGas, currentNonce] = await Promise.all([
            provider.getGasPrice(),
            nftContract.estimateGas.approve(exchangeContractAddress, nftIndex),
            provider.getTransactionCount(callerAddress)
          ])
  
          const transactionApprove = await nftContract.approve(exchangeContractAddress, nftIndex, {
            gasLimit: ethers.utils.hexlify(Math.ceil(Number(estimateGas) * 1.2)),
            gasPrice: ethers.utils.hexlify(Math.ceil(Number(gasPrice) * 1.2)),
            nonce: currentNonce
          })
          await transactionApprove.wait()
          // console.log('Transaction approve', transactionApprove.hash)
        } else {
          // throw new Error('You already approve this contract')
          // console.log('You already approve this contract')
        }
      } else {
        // ERROR_ARE_YOU_NOT_OWNER_NFT
        throw new Error('ERROR_ARE_YOU_NOT_OWNER_NFT')
        // console.log('Are you not owner this NFT')
      }
    } else {
      // ERROR_INVALID_TOKEN_ID
      throw new Error('ERROR_INVALID_TOKEN_ID')
      // console.log('Invalid Token Id')
    }
    // } catch (error) {
    //   // console.log(error)
    //   throw error
    // }
  }
  

export const setApprovalForAll = async (approveForAddress: string) => {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const addresses = await getAddresses(ethers.provider.network.chainId);
        const signer = provider.getSigner()
        const nftContract = new ethers.Contract(
            addresses.DEPLOYED_ERC721A_CONTRACT_ADDRESS,
            NSB_ERC721A_ABI,
            signer
        );
        const approveTransactionForAll = await nftContract.setApprovalForAll(
            approveForAddress,
            true
        );
        // TODO: handle loading from there = true
        await approveTransactionForAll.wait();
        // TODO: handle loading from there = false
        console.log(approveTransactionForAll.hash);
    } catch (error) {
        console.log(error);
    }
}

export const lock = async (userAddress: string, duration: number, amountLock: number) => {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const addresses = await getAddresses(ethers.provider.network.chainId);
        const signer = provider.getSigner()

        const tokenContract = new ethers.Contract(
            addresses.DEPLOYED_ERC20_CONTRACT_ADDRESS,
            NSML_ERC20_ABI,
            signer
        );
        const decimals = await tokenContract.decimals();

        const nsbLockContract = new ethers.Contract(
            addresses.DEPLOYED_NSB_LOCKER_PROXY_CONTRACT_ADDRESS,
            NsbLocker_ABI,
            signer
        );

        const balanceToken = await tokenContract.balanceOf(userAddress);
        const currentAmountLock = ethers.utils.parseUnits(amountLock.toString(), decimals);
        if (Number(balanceToken) >= Number(currentAmountLock)) {
            const lockTransaction = await nsbLockContract.lock(
                userAddress,
                duration,
                currentAmountLock
            );
            // TODO: handle loading from there = true
            await lockTransaction.wait();
            // TODO: handle loading from there = false
            console.log(lockTransaction.hash);
        } else {
            // TODO: balance not enough to lock token
        }
    } catch (error) {
        console.log(error);
    }
}

export const lockAndTransfer = async (userAddress: string, duration: number, amountLock: number) => {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const addresses = await getAddresses(ethers.provider.network.chainId);
        const signer = provider.getSigner()

        const tokenContract = new ethers.Contract(
            addresses.DEPLOYED_ERC20_CONTRACT_ADDRESS,
            NSML_ERC20_ABI,
            signer
        );
        const decimals = await tokenContract.decimals();

        const nsbLockContract = new ethers.Contract(
            addresses.DEPLOYED_NSB_LOCKER_PROXY_CONTRACT_ADDRESS,
            NsbLocker_ABI,
            signer
        );

        const balanceToken = await tokenContract.balanceOf(userAddress);
        const currentAmountLock = ethers.utils.parseUnits(amountLock.toString(), decimals);
        if (balanceToken >= currentAmountLock) {
            // Check amount approve
            const allowanceToken = await tokenContract.allowance(
                userAddress,
                addresses.DEPLOYED_NSB_LOCKER_PROXY_CONTRACT_ADDRESS
            );

            if (Number(allowanceToken) >= Number(currentAmountLock)) {
                const transferAndLockTransaction = await nsbLockContract.transferAndLock(
                    userAddress,
                    duration,
                    currentAmountLock
                );
                // TODO: handle loading from there = true
                await transferAndLockTransaction.wait();
                // TODO: handle loading from there = false
                console.log(transferAndLockTransaction.hash);
            }
        } else {
            // TODO: balance not enough to lock token
        }
    } catch (error) {
        console.log(error);
    }
}

export const isLocked = async (userAddress: string, newBalance: number): Promise<number> => {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const addresses = await getAddresses(ethers.provider.network.chainId);

        const nsbLockContract = new ethers.Contract(
            addresses.DEPLOYED_NSB_LOCKER_PROXY_CONTRACT_ADDRESS,
            NsbLocker_ABI,
            provider
        );

        const tokenContract = new ethers.Contract(
            addresses.DEPLOYED_ERC20_CONTRACT_ADDRESS,
            NSML_ERC20_ABI,
            provider
        );
        const decimals = await tokenContract.decimals();

        const currentNewBalance = ethers.utils.parseUnits(newBalance.toString(), decimals);
        const isLocked = await nsbLockContract.isLocked(
            userAddress, currentNewBalance
        );

        return isLocked;
    } catch (error) {
        console.log(error);
    }

    return 0;
}

export const getLockedAmount = async (userAddress: string): Promise<number> => {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const addresses = await getAddresses(ethers.provider.network.chainId);

        const nsbLockContract = new ethers.Contract(
            addresses.DEPLOYED_NSB_LOCKER_PROXY_CONTRACT_ADDRESS,
            NsbLocker_ABI,
            provider
        );

        const tokenContract = new ethers.Contract(
            addresses.DEPLOYED_ERC20_CONTRACT_ADDRESS,
            NSML_ERC20_ABI,
            provider
        );
        const decimals = await tokenContract.decimals();

        const getLockedAmount = await nsbLockContract.getLockedAmount(userAddress);

        return ethers.utils.formatUnits(getLockedAmount, decimals)
    } catch (error) {
        console.log(error);
    }

    return 0;
}

export const getLockedInfo = async (userAddress: string): Promise<any> => {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const addresses = await getAddresses(ethers.provider.network.chainId);

        const nsbLockContract = new ethers.Contract(
            addresses.DEPLOYED_NSB_LOCKER_PROXY_CONTRACT_ADDRESS,
            NsbLocker_ABI,
            provider
        );

        const lockedInfo = await nsbLockContract.nsbLockContract(userAddress);

        return lockedInfo;
    } catch (error) {
        console.log(error);
    }

    return "";
}

export const checkWhitelistAddress = async (userAddress: string): Promise<boolean> => {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const addresses = await getAddresses(ethers.provider.network.chainId);

        const nsbExchangeContract = new ethers.Contract(
            addresses.DEPLOYED_NSB_EXCHANGE_PROXY_CONTRACT_ADDRESS,
            NsbLocker_ABI,
            provider
        );

        const lockedInfo = await nsbExchangeContract.whitelistAddress(userAddress);

        return lockedInfo;
    } catch (error) {
        console.log(error);
    }
    return false;
}

export const verifySignature = async (
    _signerAddress: string,
    _nonce: number,
    _tradeAddress: string[5],
    _attributes: string[4]
): Promise<string> => {
    try {
        const privateKeyToken = process.env.PRIVATE_KEY1;
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        let signer = new ethers.Wallet(privateKeyToken, provider);
        const message = ethers.utils.solidityKeccak256(
            ['address', 'uint256', 'address[5]', 'uint256[4]'],
            [_signerAddress, _nonce, _tradeAddress, _attributes],
        );
        const offerSignature = await signer.signMessage(ethers.utils.arrayify(message));

        return offerSignature;
    } catch (error) {
        console.log(error);
    }
    return "0x"
}

export const verifySignatureRandomNft = async (
    _signerAddress: string,
    _nonce: number,
    _tradeAddress: string[5],
    _attributes: string[3],
    _listTokenId: string[]
): Promise<string> => {
    try {
        const privateKeyToken = process.env.PRIVATE_KEY1;
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        let signer = new ethers.Wallet(privateKeyToken, provider);
        const message = ethers.utils.solidityKeccak256(
            ['address', 'uint256', 'address[5]', 'uint256[3]', 'uint256[]'],
            [_signerAddress, _nonce, _tradeAddress, _attributes, _listTokenId],
        );
        const offerSignature = await signer.signMessage(ethers.utils.arrayify(message));
        return offerSignature;
    } catch (error) {
        console.log(error);
    }

    return "0x";
}

export const buyNFTNormal = async (
    _signerAddress: string,
    _tradeAddress: string[5],
    _attributes: string[4]
) => {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const addresses = await getAddresses(ethers.provider.network.chainId);
        const signer = provider.getSigner();

        const currentAddress = await signer.getAddress();
        const currentNonce = await provider.getTransactionCount(currentAddress);

        const nsbExchangeContract = new ethers.Contract(
            addresses.DEPLOYED_NSB_EXCHANGE_PROXY_CONTRACT_ADDRESS,
            NsbLocker_ABI,
            signer
        );

        const nftContract = new ethers.Contract(
            addresses.DEPLOYED_ERC721A_CONTRACT_ADDRESS,
            NSB_ERC721A_ABI,
            signer
        );

        const tokenContract = new ethers.Contract(
            _tradeAddress[2],
            NSML_ERC20_ABI,
            signer
        );

        const isApprovedForAll = await nftContract.isApprovedForAll(
            _tradeAddress[1],
            addresses.DEPLOYED_NSB_LOCKER_PROXY_CONTRACT_ADDRESS
        );

        const decimals = await tokenContract.decimals();
        const allowanceToken = Number(
            await tokenContract.allowance(
                _tradeAddress[0],
                addresses.DEPLOYED_NSB_LOCKER_PROXY_CONTRACT_ADDRESS
            )
        );
        const amountOfBuyer = Number(
            ethers.utils.parseUnits(_attributes[0].toString(), decimals)
        );
        const balanceToken = Number(
            await tokenContract.balanceOf(_tradeAddress[0])
        );

        const isApproveIndex = await nftContract.getApproved(Number(_attributes[1]));

        if (
            balanceToken >= amountOfBuyer &&
            balanceToken >= allowanceToken
        ) {
            if (isApprovedForAll || isApproveIndex == addresses.DEPLOYED_ERC721A_CONTRACT_ADDRESS) {
                const signatureBuyNft = await verifySignature(
                    _signerAddress,
                    currentNonce,
                    _tradeAddress,
                    _attributes
                );

                const buyNFTNormalTransaction = await nsbExchangeContract.buyNFTNormal(
                    _tradeAddress,
                    _attributes,
                    currentNonce,
                    signatureBuyNft
                )

                // TODO: handle loading from there = true
                await buyNFTNormalTransaction.wait();
                // TODO: handle loading from there = false
                console.log(buyNFTNormalTransaction.hash);
            } else {
                // TODO: balance not enough to lock token
            }
        } else {
            // TODO: balance not enough to lock token
        }
    } catch (error) {
        console.log(error);
    }
}

export const buyRandomNftNormal = async (
    _signerAddress: string,
    _tradeAddress: string[5],
    _attributes: string[3],
    _listTokenId: string[]
) => {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const addresses = await getAddresses(ethers.provider.network.chainId);
        const signer = provider.getSigner();

        const currentAddress = await signer.getAddress();
        const currentNonce = await provider.getTransactionCount(currentAddress);

        const nsbExchangeContract = new ethers.Contract(
            addresses.DEPLOYED_NSB_EXCHANGE_PROXY_CONTRACT_ADDRESS,
            NsbLocker_ABI,
            signer
        );

        const nftContract = new ethers.Contract(
            addresses.DEPLOYED_ERC721A_CONTRACT_ADDRESS,
            NSB_ERC721A_ABI,
            signer
        );

        const tokenContract = new ethers.Contract(
            _tradeAddress[2],
            NSML_ERC20_ABI,
            signer
        );

        const isApprovedForAll = await nftContract.isApprovedForAll(
            _tradeAddress[1],
            addresses.DEPLOYED_NSB_LOCKER_PROXY_CONTRACT_ADDRESS
        );

        const decimals = await tokenContract.decimals();
        const allowanceToken = Number(
            await tokenContract.allowance(
                _tradeAddress[0],
                addresses.DEPLOYED_NSB_LOCKER_PROXY_CONTRACT_ADDRESS
            )
        );
        const amountOfBuyer = Number(
            ethers.utils.parseUnits(_attributes[0].toString(), decimals)
        );
        const balanceToken = Number(
            await tokenContract.balanceOf(_tradeAddress[0])
        );

        if (
            balanceToken >= amountOfBuyer &&
            balanceToken >= allowanceToken
        ) {
            if (isApprovedForAll) {
                const signatureRandomNft = await verifySignatureRandomNft(
                    _signerAddress,
                    currentNonce,
                    _tradeAddress,
                    _attributes,
                    _listTokenId
                );

                const buyNFTNormalTransaction = await nsbExchangeContract.buyNFTNormal(
                    _tradeAddress,
                    _attributes,
                    _listTokenId,
                    currentNonce,
                    signatureRandomNft
                )

                // TODO: handle loading from there = true
                await buyNFTNormalTransaction.wait();
                // TODO: handle loading from there = false
                console.log(buyNFTNormalTransaction.hash);
            } else {
                // TODO: balance not enough to lock token
            }
        } else {
            // TODO: balance not enough to lock token
        }
    } catch (error) {
        console.log(error);
    }
}

const buyNFTETH = async (
    _signerAddress: string,
    _tradeAddress: string[5],
    _attributes: string[4]
) => {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const addresses = await getAddresses(ethers.provider.network.chainId);
        const signer = provider.getSigner();

        const currentAddress = await signer.getAddress();
        const currentNonce = await provider.getTransactionCount(currentAddress);

        const nsbExchangeContract = new ethers.Contract(
            addresses.DEPLOYED_NSB_EXCHANGE_PROXY_CONTRACT_ADDRESS,
            NsbLocker_ABI,
            signer
        );

        const nftContract = new ethers.Contract(
            addresses.DEPLOYED_ERC721A_CONTRACT_ADDRESS,
            NSB_ERC721A_ABI,
            signer
        );

        const isApprovedForAll = await nftContract.isApprovedForAll(
            _tradeAddress[1],
            addresses.DEPLOYED_NSB_LOCKER_PROXY_CONTRACT_ADDRESS
        );

        const isApproveIndex = await nftContract.getApproved(Number(_attributes[1]));

        const amountOfBuyer = Number(
            ethers.utils.parseEther(_attributes[0].toString())
        )

        const balanceETH = Number(
            await provider.getBalance(currentAddress)
        );

        if (balanceETH >= amountOfBuyer) {
            if (isApprovedForAll || isApproveIndex == addresses.DEPLOYED_ERC721A_CONTRACT_ADDRESS) {
                const signatureBuyNft = await verifySignature(
                    _signerAddress,
                    currentNonce,
                    _tradeAddress,
                    _attributes
                );

                const buyNFTNormalTransaction = await nsbExchangeContract.buyNFTNormal(
                    _tradeAddress,
                    _attributes,
                    currentNonce,
                    signatureBuyNft,
                    {
                        value: amountOfBuyer
                    }
                )

                // TODO: handle loading from there = true
                await buyNFTNormalTransaction.wait();
                // TODO: handle loading from there = false
                console.log(buyNFTNormalTransaction.hash);
            } else {
                // TODO: balance not enough to lock token
            }
        } else {
            // TODO: balance not enough to lock token
        }
    } catch (error) {
        console.log(error);
    }
}

export const auctionNFT = async (
    _tradeAddress: string[5],
    _attributes: string[4]
) => {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const addresses = await getAddresses(ethers.provider.network.chainId);
        const signer = provider.getSigner();
        const currentAddress = await signer.getAddress();

        const nftContract = new ethers.Contract(
            addresses.DEPLOYED_ERC721A_CONTRACT_ADDRESS,
            NSB_ERC721A_ABI,
            signer
        );

        const tokenContract = new ethers.Contract(
            _tradeAddress[2],
            NSML_ERC20_ABI,
            provider
        );

        const nsbExchangeContract = new ethers.Contract(
            addresses.DEPLOYED_NSB_EXCHANGE_PROXY_CONTRACT_ADDRESS,
            NsbLocker_ABI,
            signer
        );
        const lockedInfo = await nsbExchangeContract.whitelistAddress(currentAddress);

        if (lockedInfo) {
            const isApprovedForAll = await nftContract.isApprovedForAll(
                _tradeAddress[1],
                addresses.DEPLOYED_NSB_LOCKER_PROXY_CONTRACT_ADDRESS
            );

            const decimals = await tokenContract.decimals();
            const allowanceToken = Number(
                await tokenContract.allowance(
                    _tradeAddress[0],
                    addresses.DEPLOYED_NSB_LOCKER_PROXY_CONTRACT_ADDRESS
                )
            );
            const amountOfBuyer = Number(
                ethers.utils.parseUnits(_attributes[0].toString(), decimals)
            );
            const balanceToken = Number(
                await tokenContract.balanceOf(_tradeAddress[0])
            );

            const isApproveIndex = await nftContract.getApproved(Number(_attributes[1]));

            if (
                balanceToken >= amountOfBuyer &&
                balanceToken >= allowanceToken
            ) {
                if (isApprovedForAll || isApproveIndex == addresses.DEPLOYED_ERC721A_CONTRACT_ADDRESS) {
                    const auctionNFTTransaction = await nsbExchangeContract.auctionNFT(
                        _tradeAddress,
                        _attributes,
                    )

                    // TODO: handle loading from there = true
                    await auctionNFTTransaction.wait();
                    // TODO: handle loading from there = false
                    console.log(auctionNFTTransaction.hash);
                } else {
                    // TODO: Handle something here
                }
            } else {
                // TODO: Handle something here
            }
        } else {
            // TODO: Current address is not whilelist
        }
    } catch (error) {

    };
}

export const acceptOfferNFT = async (
    _signerAddress: string,
    _tradeAddress: string[5],
    _attributes: string[4]
) => {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const addresses = await getAddresses(ethers.provider.network.chainId);
        const signer = provider.getSigner();
        const currentAddress = await signer.getAddress();
        const currentNonce = await provider.getTransactionCount(currentAddress);

        const nftContract = new ethers.Contract(
            addresses.DEPLOYED_ERC721A_CONTRACT_ADDRESS,
            NSB_ERC721A_ABI,
            signer
        );

        const tokenContract = new ethers.Contract(
            _tradeAddress[2],
            NSML_ERC20_ABI,
            signer
        );
        const decimals = await tokenContract.decimals();

        const nsbExchangeContract = new ethers.Contract(
            addresses.DEPLOYED_NSB_EXCHANGE_PROXY_CONTRACT_ADDRESS,
            NsbLocker_ABI,
            signer
        );

        const allowanceToken = Number(
            await tokenContract.allowance(
                _tradeAddress[0],
                addresses.DEPLOYED_NSB_LOCKER_PROXY_CONTRACT_ADDRESS
            )
        );

        const balanceToken = Number(
            await tokenContract.balanceOf(_tradeAddress[0])
        );

        const amountOfBuyer = Number(
            ethers.utils.parseUnits(_attributes[0].toString(), decimals)
        );

        const isApproveIndex = await nftContract.getApproved(Number(_attributes[1]));

        if (
            balanceToken >= amountOfBuyer &&
            balanceToken >= allowanceToken
        ) {
            if (isApproveIndex == addresses.DEPLOYED_ERC721A_CONTRACT_ADDRESS) {
                const signatureBuyNft = await verifySignature(
                    _signerAddress,
                    currentNonce,
                    _tradeAddress,
                    _attributes
                );
                const acceptOfferNFTTransaction = await nsbExchangeContract.acceptOfferNFT(
                    _tradeAddress,
                    _attributes,
                    currentNonce,
                    signatureBuyNft
                )

                // TODO: todo something
                await acceptOfferNFTTransaction.wait();
                // TODO: todo something
                console.log(acceptOfferNFTTransaction.hash);
            } else {
                // TODO: todo something
            }
        } else {
            // TODO: todo something
        }
    } catch (error) {

    };
}




