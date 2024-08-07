# Instruction to deploy smart contracts

Clone with source code: https://gitlab-new.bap.jp/BAPSoftware/outsource/bapsw.s0163.nsb/nsb-smartcontract.git

After that, Please confirm your balance enough for deploy contract

## Switch to main_deploy

```sh
git checkout main_deploy
```

Afer clone the project from github, then do these steps to deploy smart contracts to testnet/mainnet

## Install Node.js(Version node > v16) and check node version

```sh
https://nodejs.org/en/download
```

## Install dependencies

Open project's root folder then run this command on the terminal If not install yarn yet, please link: https://www.npmjs.com/package/yarn

```sh
yarn
```

## Prepare the environment

At the project's root folder, copy the file .env.example and create a new file called .env and
Change the following information

```sh
PRIVATE_KEY=<private key to deploy smart contract, and owner of smart contract>
```

## Deploy smart contracts on localhost (Action: compile, test, deploy), After deploy contract send contract for Develop Team

At the terminal, run the command, after deploy please check addresses - localhost.json file.

```sh
yarn deploy:localhost
```

## Deploy smart contracts on testnet (Action: compile, test, deploy), After deploy contract send contract for Develop Team

At the terminal, run the command, after deploy please check addresses - sepolia.json file.

```sh
yarn deploy:testnet
```

## Deploy smart contracts on mainnet(Ethereum network) (Whole action: compile, test, deploy, verify contract)

At the terminal, run the command, after deploy please check addresses - ethereum.json file.

```sh
yarn deploy:mainnet
```
