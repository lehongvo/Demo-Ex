const { ethers, BigNumber } = require("ethers");
const munbai = "https://matic-mumbai.chainstacklabs.com";
const polygon = "https://polygon.llamarpc.com";
const goerli = "https://goerli.infura.io/v3/982727d220c946f8910109c11f31dbb0";
const astar = "https://evm.astar.network";
const shibuya = "https://evm.shibuya.astar.network";
const proxyContractAddress = "0x16043Ddc3aC37399bb6a9E9562043e823919e019";
const lockerAddress = "0x50F0620723d6A50D0f79c9c9e9408cC5a4b742A1";
const proxyABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "contract ITransparentUpgradeableProxy",
        name: "proxy",
        type: "address",
      },
      { internalType: "address", name: "newAdmin", type: "address" },
    ],
    name: "changeProxyAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract ITransparentUpgradeableProxy",
        name: "proxy",
        type: "address",
      },
    ],
    name: "getProxyAdmin",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract ITransparentUpgradeableProxy",
        name: "proxy",
        type: "address",
      },
    ],
    name: "getProxyImplementation",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract ITransparentUpgradeableProxy",
        name: "proxy",
        type: "address",
      },
      { internalType: "address", name: "implementation", type: "address" },
    ],
    name: "upgrade",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract ITransparentUpgradeableProxy",
        name: "proxy",
        type: "address",
      },
      { internalType: "address", name: "implementation", type: "address" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "upgradeAndCall",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

const getAdminProxy = async (proxyContractAddress) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const proxyContract = new ethers.Contract(
        proxyContractAddress,
        proxyABI,
        provider
    );
    const owner = await proxyContract.owner();
    console.log(`Owner ${owner}`);
    const getProxyAdmin = await proxyContract.getProxyAdmin(lockerAddress);
    console.log(`getProxyAdmin ${getProxyAdmin}`);
  } catch (error) {
    console.log(error);
  }
};

getAdminProxy(proxyContractAddress);