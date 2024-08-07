# Smart Contract Deployment Instructions

This guide will help you deploy smart contracts from the [Demo-Ex GitHub Repository](https://github.com/lehongvo/Demo-Ex/tree/main) to various environments such as localhost, testnet (Sepolia), and mainnet (Ethereum). Follow the steps carefully to ensure a smooth deployment process.

## Prerequisites

- Node.js (version > v16)
- Yarn package manager
- A wallet with sufficient balance for deploying contracts
- API key from Etherscan

## Steps to Deploy Smart Contracts

### 1. Clone the Repository

First, clone the repository from GitHub.

````sh
git clone https://github.com/lehongvo/Demo-Ex.git
cd Demo-Ex

## Switch to main

```sh
git checkout main
````

Afer clone the project from github, then do these steps to deploy smart contracts to testnet/mainnet

## Install Node.js(Version node > v16) and check node version

Make sure you have Node.js installed (version > v16). You can download and install Node.js from Node.js official website. To check your Node.js version, run:

```sh
https://nodejs.org/en/download
```

After install please run command line below to check version

```
node -v
```

## Install dependencies

Navigate to the project's root directory and install the required dependencies. If you don't have yarn installed, you can install it by following the instructions on Yarn's official page.
Open project's root folder then run this command on the terminal If not install yarn yet, please link: https://www.npmjs.com/package/yarn

```sh
yarn
```

## Prepare the environment

At the project's root folder, copy the file .env.example and create a new file called .env and
Change the following information

```
cp .env.example .env
```

```sh
PRIVATE_KEY=<private key to deploy smart contract, and owner of smart contract>
ETHERSCAN_API_KEY=<API key on ethereum>
```

Ensure your wallet has sufficient balance for deploying the contracts.

## How to compile smart contract

At the terminal, please run with command-line

```sh
yarn compile:local
```

```sh
yarn compile:sepolia
```

## Deploy smart contracts on localhost (Action: test, deploy), After deploy contract send contract for Develop Team

On Localhost, at the terminal, run the command
To deploy the smart contracts on localhost, run:

```sh
yarn deploy:local
```

After deployment, check the localhost.json file for the contract addresses and share them with the Development Team.

## Deploy smart contracts on testnet (Action: compile, test, deploy), After deploy contract send contract for Develop Team

On Sepolia Testnet, at the terminal, run the command
To deploy the smart contracts on the Sepolia testnet, run:

```sh
yarn deploy:sepolia
```

After deployment, check the sepolia.json file for the contract addresses and share them with the Development Team.

## Deploy smart contracts on mainnet(Ethereum network) (Whole action: compile, test, deploy, verify contract)

On Ethereum Mainnet, at the terminal, run the command

```sh
yarn deploy:mainnet
```

This command will compile, test, deploy, and verify the contracts. After deployment, check the ethereum.json file for the contract addresses and share them with the Development Team.

## NOTE

Ensure you have the necessary permissions and balances before deploying contracts to the mainnet.
Verify all contract addresses and deployments before proceeding with any transactions or integrations.
