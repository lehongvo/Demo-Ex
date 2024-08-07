const { ethers } = require("ethers");
const { NSB_ERC721A_ABI, Gacha_ABI } = require("./04_abi");

const network = "https://eth-sepolia.public.blastapi.io";
const contractAddress = "0x088E712cbBB3608c08B9960e91090E1d2DD28cbe";
const eventName = "TriggerGacha";

const getEventsFromTransaction = async (provider, contract, txHash) => {
  try {
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      throw new Error("Transaction receipt not found");
    }

    const events = [];
    for (const log of receipt.logs) {
      try {
        const parsedEvent = contract.interface.parseLog(log);

        if (parsedEvent.name === eventName) {
          events.push(parsedEvent);
        }
      } catch (error) {
        // Ignore if the log couldn't be parsed by the contract ABI
      }
    }

    return events;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const scanEventsInTransaction = async (txHash) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(network);
    const contract = new ethers.Contract(contractAddress, Gacha_ABI, provider);

    const events = await getEventsFromTransaction(provider, contract, txHash);
    if (events.length === 0) {
      console.log("empty data")
      return false;
    } else {
      console.log(events)
      return true;
    }
  } catch (err) {
    console.error(err);
  }
};

// Replace 'YOUR_TRANSACTION_HASH' with the actual transaction hash to scan
const transactionHash = "0x95e0fc309c83615bc8d944d46244147ae4c2363120353a7af8a2564ae0e69a2a";
scanEventsInTransaction(transactionHash);
