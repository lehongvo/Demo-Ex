import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@openzeppelin/hardhat-upgrades'
import dotenv from 'dotenv'
import 'hardhat-contract-sizer'
import 'solidity-coverage'
dotenv.config()

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY!;

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.4.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ],
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    mainnet: {
      url: `https://eth.llamarpc.com`,
      chainId: 1,
      accounts: [process.env.PRIVATE_KEY!]
    },
    sepolia: {
      url: `https://eth-sepolia.public.blastapi.io`,
      chainId: 11155111,
      accounts: [process.env.PRIVATE_KEY!],
    }
  },
  gasReporter: {
    enabled: true,
    currency: 'USD'
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: []
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
      mainnet: ETHERSCAN_API_KEY,
    }
  },
  coverage: {
    excludeContracts: ['Migrations'],
    skipFiles: ['test/']
  },
} as HardhatUserConfig

export default config