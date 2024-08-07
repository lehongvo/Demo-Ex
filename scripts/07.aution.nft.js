const { ethers, BigNumber } = require('ethers')
const sepolia = 'https://eth-sepolia.public.blastapi.io'

const wethABI = [
    {
        inputs: [
            {
                internalType: 'address',
                name: '_exchangeAddress',
                type: 'address'
            }
        ],
        stateMutability: 'nonpayable',
        type: 'constructor'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'src',
                type: 'address'
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'guy',
                type: 'address'
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'wad',
                type: 'uint256'
            }
        ],
        name: 'Approval',
        type: 'event'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'guy',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'wad',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'timestamp',
                type: 'uint256'
            },
            {
                internalType: 'bytes',
                name: 'signature',
                type: 'bytes'
            }
        ],
        name: 'approve',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool'
            }
        ],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'deposit',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'dst',
                type: 'address'
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'wad',
                type: 'uint256'
            }
        ],
        name: 'Deposit',
        type: 'event'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'dst',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'wad',
                type: 'uint256'
            }
        ],
        name: 'transfer',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool'
            }
        ],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'src',
                type: 'address'
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'dst',
                type: 'address'
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'wad',
                type: 'uint256'
            }
        ],
        name: 'Transfer',
        type: 'event'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'src',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'dst',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'wad',
                type: 'uint256'
            }
        ],
        name: 'transferFrom',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool'
            }
        ],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'wad',
                type: 'uint256'
            }
        ],
        name: 'withdraw',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'src',
                type: 'address'
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'wad',
                type: 'uint256'
            }
        ],
        name: 'Withdrawal',
        type: 'event'
    },
    {
        inputs: [],
        name: 'adminAddress',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            },
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        name: 'allowance',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        name: 'balanceOf',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'decimals',
        outputs: [
            {
                internalType: 'uint8',
                name: '',
                type: 'uint8'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'exchangeAddress',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'name',
        outputs: [
            {
                internalType: 'string',
                name: '',
                type: 'string'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'bytes32',
                name: '',
                type: 'bytes32'
            }
        ],
        name: 'seenHash',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'symbol',
        outputs: [
            {
                internalType: 'string',
                name: '',
                type: 'string'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'totalSupply',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    }
]
const wethABIUnlock = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "guy",
				"type": "address"
			},
			{
				"name": "wad",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "deposit",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "dst",
				"type": "address"
			},
			{
				"name": "wad",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "src",
				"type": "address"
			},
			{
				"name": "dst",
				"type": "address"
			},
			{
				"name": "wad",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "wad",
				"type": "uint256"
			}
		],
		"name": "withdraw",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"payable": true,
		"stateMutability": "payable",
		"type": "fallback"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "src",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "guy",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "wad",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "src",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "dst",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "wad",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "dst",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "wad",
				"type": "uint256"
			}
		],
		"name": "Deposit",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "src",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "wad",
				"type": "uint256"
			}
		],
		"name": "Withdrawal",
		"type": "event"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
]
const exchangeABI = [
    {
        inputs: [
            {
                internalType: 'address[]',
                name: '_tradeAddress',
                type: 'address[]'
            },
            {
                internalType: 'uint256[]',
                name: '_attributes',
                type: 'uint256[]'
            },
            {
                internalType: 'uint256',
                name: 'nonce',
                type: 'uint256'
            },
            {
                internalType: 'bytes',
                name: 'signature',
                type: 'bytes'
            }
        ],
        name: 'acceptOfferNFT',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address[3]',
                name: 'addrs',
                type: 'address[3]'
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256'
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256'
            }
        ],
        name: 'AcceptOfferNFT',
        type: 'event'
    },
    {
        inputs: [
            {
                internalType: 'address[]',
                name: '_tradeAddress',
                type: 'address[]'
            },
            {
                internalType: 'uint256[]',
                name: '_attributes',
                type: 'uint256[]'
            }
        ],
        name: 'auctionNFT',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address[3]',
                name: 'addrs',
                type: 'address[3]'
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256'
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256'
            }
        ],
        name: 'AuctionNFT',
        type: 'event'
    },
    {
        inputs: [
            {
                internalType: 'address[]',
                name: '_tradeAddress',
                type: 'address[]'
            },
            {
                internalType: 'uint256[]',
                name: '_attributes',
                type: 'uint256[]'
            },
            {
                internalType: 'uint256',
                name: 'nonce',
                type: 'uint256'
            },
            {
                internalType: 'bytes',
                name: 'signature',
                type: 'bytes'
            }
        ],
        name: 'buyNFTETH',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address[3]',
                name: 'addrs',
                type: 'address[3]'
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256'
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256'
            }
        ],
        name: 'BuyNFTETH',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address[3]',
                name: 'addrs',
                type: 'address[3]'
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256'
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256'
            }
        ],
        name: 'BuyNFTNormal',
        type: 'event'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_erc721',
                type: 'address'
            }
        ],
        name: 'initialize',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'previousOwner',
                type: 'address'
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newOwner',
                type: 'address'
            }
        ],
        name: 'OwnershipTransferred',
        type: 'event'
    },
    {
        inputs: [],
        name: 'renounceOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_admin',
                type: 'address'
            }
        ],
        name: 'setAdminAddress',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_erc721',
                type: 'address'
            }
        ],
        name: 'setERC721',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_address',
                type: 'address'
            },
            {
                internalType: 'bool',
                name: '_approved',
                type: 'bool'
            }
        ],
        name: 'setWhitelistAddress',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'newOwner',
                type: 'address'
            }
        ],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'admin',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'ERC721',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'owner',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        name: 'whitelistAddress',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    }
]
const NFTABI = [
    {
        inputs: [],
        stateMutability: 'nonpayable',
        type: 'constructor'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'owner',
                type: 'address'
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'approved',
                type: 'address'
            },
            {
                indexed: true,
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256'
            }
        ],
        name: 'Approval',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'owner',
                type: 'address'
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'operator',
                type: 'address'
            },
            {
                indexed: false,
                internalType: 'bool',
                name: 'approved',
                type: 'bool'
            }
        ],
        name: 'ApprovalForAll',
        type: 'event'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256'
            }
        ],
        name: 'approve',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint256',
                name: '_fromTokenId',
                type: 'uint256'
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: '_toTokenId',
                type: 'uint256'
            }
        ],
        name: 'BatchMetadataUpdate',
        type: 'event'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256'
            }
        ],
        name: 'burn',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint256',
                name: '_tokenId',
                type: 'uint256'
            }
        ],
        name: 'MetadataUpdate',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'previousOwner',
                type: 'address'
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newOwner',
                type: 'address'
            }
        ],
        name: 'OwnershipTransferred',
        type: 'event'
    },
    {
        inputs: [],
        name: 'pause',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'account',
                type: 'address'
            }
        ],
        name: 'Paused',
        type: 'event'
    },
    {
        inputs: [],
        name: 'renounceOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'quantity',
                type: 'uint256'
            }
        ],
        name: 'safeMint',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'from',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256'
            }
        ],
        name: 'safeTransferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'from',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256'
            },
            {
                internalType: 'bytes',
                name: 'data',
                type: 'bytes'
            }
        ],
        name: 'safeTransferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'operator',
                type: 'address'
            },
            {
                internalType: 'bool',
                name: 'approved',
                type: 'bool'
            }
        ],
        name: 'setApprovalForAll',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256'
            },
            {
                internalType: 'string',
                name: 'metadataProduct',
                type: 'string'
            }
        ],
        name: 'setMetadataToToken',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'from',
                type: 'address'
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                indexed: true,
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256'
            }
        ],
        name: 'Transfer',
        type: 'event'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'from',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256'
            }
        ],
        name: 'transferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'newOwner',
                type: 'address'
            }
        ],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'unpause',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'account',
                type: 'address'
            }
        ],
        name: 'Unpaused',
        type: 'event'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'owner',
                type: 'address'
            }
        ],
        name: 'balanceOf',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256'
            }
        ],
        name: 'getApproved',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'getCurrentIndex',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'owner',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'operator',
                type: 'address'
            }
        ],
        name: 'isApprovedForAll',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'name',
        outputs: [
            {
                internalType: 'string',
                name: '',
                type: 'string'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'owner',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256'
            }
        ],
        name: 'ownerOf',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'paused',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'bytes4',
                name: 'interfaceId',
                type: 'bytes4'
            }
        ],
        name: 'supportsInterface',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'symbol',
        outputs: [
            {
                internalType: 'string',
                name: '',
                type: 'string'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'index',
                type: 'uint256'
            }
        ],
        name: 'tokenByIndex',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'owner',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'index',
                type: 'uint256'
            }
        ],
        name: 'tokenOfOwnerByIndex',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256'
            }
        ],
        name: 'tokenURI',
        outputs: [
            {
                internalType: 'string',
                name: '',
                type: 'string'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'totalSupply',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    }
]
const exchangeAddress = '0x3fcB5221BCEd90F7C4910Bf90C6346d98AbeC90E'
const wethAddress = '0x7Cf0Ed8d8A3B8B860923725aF1C7a7ba80504627'
const privateKey =
    '5aba63827b240df8ba2b40b2405f2f6d6a062d10c7816f6859d39d684c53930f'
const wethAddressUnlock = '0x9191be0d2912B3545BC6D615ED1f362C3acC5163'    

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

    const nftContract = new ethers.Contract(nftContractAddress, NFTABI, wallet)
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

                const gasData = {
                    gasPrice: Math.ceil(Number(gasPrice) * 1.2),
                    gasLimit: Math.ceil(Number(estimateGas) * 1.2),
                    gasUse: Math.ceil(Number(estimateGas) * 1.2) * Math.ceil(Number(gasPrice) * 1.2) / 1e18
                }
                console.log("gasData", gasData);
                return gasData;
            } else {
                throw new Error('You already approve this contract')
            }
        } else {
            throw new Error('ERROR_ARE_YOU_NOT_OWNER_NFT')
        }
    } else {
        throw new Error('ERROR_INVALID_TOKEN_ID')
    }
}

// getGasEtmApproveNftFromIndex(
//     sepolia,
//     "0x207452C7877438025d214b0DD997700C3b22429C",
//     privateKey,
//     "1918",
//     exchangeAddress
// )

const getSigningByUser = async (privateKey, provider, guy, wad) => {
    try {
        const currentTime = Math.ceil(new Date().getTime() / 1000)
        const hash = ethers.utils.solidityKeccak256(
            ['address', 'uint', 'uint'],
            [guy, wad, currentTime]
        )
        const sigHashBytes = ethers.utils.arrayify(hash)
        const signingMessage = ethers.utils.hexlify(sigHashBytes)
        let wallet = new ethers.Wallet(privateKey, provider)
        const signature = await wallet.signMessage(
            ethers.utils.arrayify(signingMessage)
        )
        return { currentTime: currentTime, signature: signature }
    } catch (error) {
        console.log(error)
    }
}

//  * @param tradeAddress An array of addresses: [buyer, seller, token, fee, feeAdmin, fighterAddress, coOwnerFighter]
//  * @param attributes An array of uint256 values: [amount, tokenId, feePercent, feePercentAdmin, feeFighter, feeCoOwnerFighter]
const joinAuction = async (
    rpcEndPoint,
    web3AuthKey,
    amount,
    dataForReceive
) => {
    try {
        console.log('-------Start Approve-------')
        const provider = new ethers.providers.JsonRpcProvider(rpcEndPoint)
        const wallet = new ethers.Wallet(web3AuthKey, provider)

        const wethContract = new ethers.Contract(wethAddress, wethABI, wallet)

        const [decimals, balanceEth] = await Promise.all([
            wethContract.decimals(),
            provider.getBalance(wallet.address),
        ])

        const amountToWei = ethers.utils.parseUnits(amount.toString(), decimals)

        if (Number(balanceEth) > Number(amountToWei)) {
            const txApproveData = await wethContract.approve(
                exchangeAddress,
                amountToWei,
                dataForReceive.message.currentTime,
                dataForReceive.message.signature,
                {
                    from: wallet.address,
                    gasLimit: ethers.utils.hexlify(dataForReceive.etmGasApprove),
                    gasPrice: ethers.utils.hexlify(dataForReceive.gasPrice),
                }
            );
            await txApproveData.wait()
            console.log('txApproveData', txApproveData.hash)
            console.log('-------Finish Swap-------')
            return true
        } else {
            // TODO: throw error
            console.log('Balance ETH not enough to this auction')
            return false
        }
    } catch (error) {
        console.log(error)
    }
}

// joinAuction(
//     sepolia, 
//     "5aba63827b240df8ba2b40b2405f2f6d6a062d10c7816f6859d39d684c53930f", 
//     "0.3",
//     {
//         status: true,
//         amountSwap: '0.3',
//         amountApprove: 0.3,
//         gasPrice: 23,
//         message: {
//           currentTime: 1698032143,
//           signature: '0x5ed9f87aecb8c2e7c291ee61633722e2e48948f144d311be1aa8a85bac7a7e8c5db50046ef3bec9747049c068f7ab12a2652b460670d04176f8248cd308222fe1c'
//         },
//         etmGasApprove: 87192,
//         etmGasApproveSwap: 35278,
//         gasGasCostApprove: 2.005416e-12,
//         gasGasCostSwap: 8.11394e-13
//       }
// );

const swapWEth = async (rpcEndPoint, web3AuthKey, amount, dataForReceive) => {
    try {
        console.log('-------Start Swap-------')
        const provider = new ethers.providers.JsonRpcProvider(rpcEndPoint)
        const wallet = new ethers.Wallet(web3AuthKey, provider)

        const wethContract = new ethers.Contract(wethAddress, wethABI, wallet)

        let amountToWei = ethers.utils.parseEther(amount)

        const amountApprove = await wethContract.allowance(
            wallet.address,
            exchangeAddress
        )

        const balanceWeth = await wethContract.balanceOf(wallet.address);

        if(Number(balanceWeth) < Number(amountApprove)) {
            const currentAmountDeposit = BigNumber.from(amountApprove).sub(BigNumber.from(balanceWeth));
            if(Number(currentAmountDeposit) < Number(balanceWeth)) {
                amountToWei = currentAmountDeposit;
            }
            const txSwapWeth = await wethContract.deposit({
                value: amountToWei,
                from: wallet.address,
                gasLimit: ethers.utils.hexlify(dataForReceive.etmGasApproveSwap),
                gasPrice: ethers.utils.hexlify(dataForReceive.gasPrice)
            })
            await txSwapWeth.wait()
            console.log('TxSwapWeth:', txSwapWeth.hash)
            return txSwapWeth.hash;
        } else {
            return ")x00";
        }
    } catch (error) {
        console.log(error)
    }
}

// swapWEth(
//     sepolia,
//     "5aba63827b240df8ba2b40b2405f2f6d6a062d10c7816f6859d39d684c53930f",
//     "0.3",
//     {
//         status: true,
//         amountSwap: '0.3',
//         amountApprove: 0.3,
//         gasPrice: 100000009,
//         etmGasApprove: 87204,
//         etmGasApproveSwap: 35278,
//         gasGasCostApprove: 0.000008720400784836,
//         gasGasCostSwap: 0.000003527800317502
//       }
// );
const etmCancelAuction = async (rpcEndPoint, web3AuthKey, amount) => {
    try {
        const provider = new ethers.providers.JsonRpcProvider(rpcEndPoint)
        const wallet = new ethers.Wallet(web3AuthKey, provider)
        const wethContract = new ethers.Contract(wethAddress, wethABI, wallet)


        const amountApprove = await wethContract.allowance(
            wallet.address,
            exchangeAddress
        )
        const amountToWei = ethers.utils.parseEther(amount);
        const totalAmount = BigNumber.from(amountApprove).sub(
            BigNumber.from(amountToWei)
        )

        const messageHash = await getSigningByUser(
            privateKey,
            provider,
            exchangeAddress,
            totalAmount
        )

        const [etmGasApprove, gasPrice, etmGasApproveSwap] = await Promise.all([
            wethContract.estimateGas.approve(
                exchangeAddress,
                totalAmount,
                messageHash.currentTime,
                messageHash.signature,
                {
                    from: wallet.address
                }
            ),
            provider.getGasPrice(),
            wethContract.estimateGas.withdraw(amountToWei, {
                from: wallet.address
            })
        ]);

        const gasData = {
            etmGasApprove: Math.ceil(Number(etmGasApprove) * 2),
            gasPrice: Math.ceil(Number(gasPrice) * 2),
            etmGasApproveSwap: Math.ceil(etmGasApproveSwap.toString() * 2),
            totalGasApprove: Math.ceil(Number(etmGasApprove) * 2) * Math.ceil(Number(gasPrice) * 2) / 1e18,
            totalGasApproveSwap: Math.ceil(etmGasApproveSwap.toString() * 2) * Math.ceil(Number(gasPrice) * 2) / 1e18
        };
        console.log("gasData", gasData);
        return gasData;
    } catch (error) {
        console.log(error);
    }
}

// etmCancelAuction(
//     sepolia,
//     "5aba63827b240df8ba2b40b2405f2f6d6a062d10c7816f6859d39d684c53930f",
//     "0.02"
// )

const cancelAuction = async (rpcEndPoint, web3AuthKey, amount, gasData) => {
    try {
        console.log("Start cancel auction")
        const provider = new ethers.providers.JsonRpcProvider(rpcEndPoint)
        const wallet = new ethers.Wallet(web3AuthKey, provider)

        const wethContract = new ethers.Contract(wethAddress, wethABI, wallet)

        const [allowanceEx, balanceWeth] = await Promise.all([
            wethContract.allowance(wallet.address, exchangeAddress),
            wethContract.balanceOf(wallet.address),
        ])

        const amountToWei = ethers.utils.parseEther(amount);
        const totalAmount = BigNumber.from(allowanceEx).sub(
            BigNumber.from(amountToWei)
        )

        const message = await getSigningByUser(
            privateKey,
            provider,
            exchangeAddress,
            totalAmount
        )

        let hashData = {
            hashApprove: "",
            hashSwap: "",
        }

        // if (allowanceEx != 0) {
        console.log("HELLO")
        const txApprove = await wethContract.approve(
            exchangeAddress,
            totalAmount,
            message.currentTime,
            message.signature,
            {
                gasLimit: ethers.utils.hexlify(Number(gasData.etmGasApprove) * 10),
                gasPrice: ethers.utils.hexlify(Number(gasData.gasPrice) * 10),
                from: wallet.address
            }
        );
        await txApprove.wait()
        console.log('TxApproveHash', txApprove.hash);
        hashData.hashApprove = txApprove.hash;
        // } else {
        //     return new Error('You already approve'); 
        // }

        // if (balanceWeth >= amountToWei) {
        //     const txWithdrawWeth = await wethContract.withdraw(amountToWei, {
        //         gasLimit: ethers.utils.hexlify(Math.ceil(Number(gasData.etmGasApproveSwap) * 1.2)),
        //         gasPrice: ethers.utils.hexlify(Math.ceil(Number(gasData.gasPrice) * 1.2)),
        //         from: wallet.address
        //     })
        //     await txWithdrawWeth.wait()
        //     console.log('txWithdrawWeth hash', txWithdrawWeth.hash)
        //     hashData.hashSwap = txWithdrawWeth.hash;
        // } else {
        //     console.log('Balance WETH not enough')
        // }
        // console.log("hashData", hashData);
        // return hashData;
    } catch (error) {
        console.log(error)
    }
}

// cancelAuction(
//     sepolia,
//     "5aba63827b240df8ba2b40b2405f2f6d6a062d10c7816f6859d39d684c53930f",
//     "0",
//     {
//         etmGasApprove: 139666,
//         gasPrice: 163296234,
//         etmGasApproveSwap: 87494,
//         totalGasApprove: 0.000022806931817844,
//         totalGasApproveSwap: 0.000014287440697596
//       }
// )

const getBalanceWETH = async (rpcEndPoint, web3AuthKey) => {
    try {
        const provider = new ethers.providers.JsonRpcProvider(rpcEndPoint)
        const wallet = new ethers.Wallet(web3AuthKey, provider)

        const wethContract = new ethers.Contract(wethAddress, wethABI, wallet)

        const [balanceOf, decimals] = await Promise.all([
            wethContract.balanceOf(wallet.address),
            wethContract.decimals()
        ])

        console.log('decimals', decimals)

        const amountToWei = Number(balanceOf) / 10 ** Number(decimals)
        console.log('amountToWei', Number(amountToWei))
        return amountToWei
    } catch (error) {
        console.log(error)
    }
}

const checkConAuction = async (
    rpcEndPoint,
    web3AuthKey,
    newAmount,
    oldAmount
) => {
    try {
        const currentAmount = Number(newAmount - oldAmount).toString()
        const provider = new ethers.providers.JsonRpcProvider(rpcEndPoint)
        const wallet = new ethers.Wallet(web3AuthKey, provider)
        const wethContract = new ethers.Contract(wethAddress, wethABI, wallet)

        const amountToWei = ethers.utils.parseEther(currentAmount)
        const amountApprove = await wethContract.allowance(
            wallet.address,
            exchangeAddress
        )
        const totalAmount = BigNumber.from(amountApprove).add(
            BigNumber.from(amountToWei)
        )

        const messageHash = await getSigningByUser(
            privateKey,
            provider,
            exchangeAddress,
            totalAmount
        )
        const currentValue = ethers.utils.formatUnits(totalAmount, 'ether')
        const [etmGasApprove, gasPrice, etmGasApproveSwap] = await Promise.all([
            wethContract.estimateGas.approve(
                exchangeAddress,
                totalAmount,
                messageHash.currentTime,
                messageHash.signature,
                {
                    from: wallet.address
                }
            ),
            provider.getGasPrice(),
            wethContract.estimateGas.deposit({
                from: wallet.address,
                value: totalAmount
            })
        ])

        let dataForReceive = {
            status: true,
            amountSwap: currentAmount,
            amountApprove: Number(currentValue),
            gasPrice: Math.ceil(Number(gasPrice)),
            message: messageHash,
            etmGasApprove: Math.ceil(Number(etmGasApprove)),
            etmGasApproveSwap: Math.ceil(Number(etmGasApproveSwap)),
            gasGasCostApprove:
                (Math.ceil(Number(etmGasApprove)) * Math.ceil(Number(gasPrice))) / 1e18,
            gasGasCostSwap:
                (Math.ceil(Number(etmGasApproveSwap)) * Math.ceil(Number(gasPrice))) /
                1e18
        }

        console.log('dataForReceive', dataForReceive)
        return dataForReceive
    } catch (error) {
        console.log(error)
    }
}

// checkConAuction(
//     sepolia,
//     '5aba63827b240df8ba2b40b2405f2f6d6a062d10c7816f6859d39d684c53930f',
//     '0.3',
//     '0'
// )

const etmAcceptOfferNFT = async (
    rpcEndPoint,
    web3AuthKey,
    tradeAddress,
    attributes
) => {
    try {
        const provider = new ethers.providers.JsonRpcProvider(rpcEndPoint)
        const wallet = new ethers.Wallet(web3AuthKey, provider)

        const wethContract = new ethers.Contract(wethAddress, wethABI, wallet)

        const exchangeContract = new ethers.Contract(
            exchangeAddress,
            exchangeABI,
            wallet
        )

        const [ERC721, nonce] = await Promise.all([
            exchangeContract.ERC721(),
            provider.getTransactionCount(wallet.address, 'latest')
        ])

        const nftContract = new ethers.Contract(ERC721, NFTABI, wallet)

        const amountToWei = ethers.utils.parseEther(attributes[0])
        attributes[0] = Number(amountToWei).toString()

        const offer = {
            signerAddress: wallet.address,
            nonce: nonce.toString(),
            tradeAddress: tradeAddress,
            attributes: attributes
        }
        console.log('offer', offer)

        const [allowance, signature, approveFor, gasPrice] = await Promise.all([
            wethContract.allowance(tradeAddress[0], exchangeAddress),
            getSignData(privateKey, provider, offer),
            nftContract.getApproved(Number(attributes[1])),
            provider.getGasPrice()
        ])

        if (Number(allowance) >= Number(amountToWei)) {
            if (approveFor.toUpperCase() == exchangeAddress.toUpperCase()) {
                let etmGas = await exchangeContract.estimateGas.acceptOfferNFT(
                    offer.tradeAddress,
                    offer.attributes,
                    offer.nonce,
                    signature,
                    {
                        from: wallet.address
                    }
                )

                return (
                    (Math.ceil(Number(etmGas) * 1.2) *
                        Math.ceil(Number(gasPrice) * 1.2)) /
                    1e18
                )
            } else {
                console.log('Token not approve yes')
            }
        } else {
            console.log('Amount approve need any more')
        }
    } catch (error) {
        console.log(error)
    }
}

const acceptOfferNFT = async (
    rpcEndPoint,
    web3AuthKey,
    tradeAddress,
    attributes
) => {
    try {
        const provider = new ethers.providers.JsonRpcProvider(rpcEndPoint)
        const wallet = new ethers.Wallet(web3AuthKey, provider)

        const wethContract = new ethers.Contract(wethAddress, wethABI, wallet)

        const exchangeContract = new ethers.Contract(
            exchangeAddress,
            exchangeABI,
            wallet
        )

        const [ERC721, nonce] = await Promise.all([
            exchangeContract.ERC721(),
            provider.getTransactionCount(wallet.address, 'latest')
        ])

        const nftContract = new ethers.Contract(ERC721, NFTABI, wallet)

        const amountToWei = ethers.utils.parseEther(attributes[0])
        attributes[0] = Number(amountToWei).toString()

        const offer = {
            signerAddress: wallet.address,
            nonce: nonce.toString(),
            tradeAddress: tradeAddress,
            attributes: attributes
        }
        console.log('offer', offer)

        const [allowance, signature, approveFor, gasPrice] = await Promise.all([
            wethContract.allowance(tradeAddress[0], exchangeAddress),
            getSignData(privateKey, provider, offer),
            nftContract.getApproved(Number(attributes[1])),
            provider.getGasPrice()
        ])

        if (Number(allowance) >= Number(amountToWei)) {
            if (approveFor.toUpperCase() == exchangeAddress.toUpperCase()) {
                const etmGas = await exchangeContract.estimateGas.acceptOfferNFT(
                    offer.tradeAddress,
                    offer.attributes,
                    offer.nonce,
                    signature,
                    {
                        from: wallet.address
                    }
                )
                console.log('wallet.address', wallet.address)
                const acceptOfferNFTTx = await exchangeContract.acceptOfferNFT(
                    offer.tradeAddress,
                    offer.attributes,
                    offer.nonce,
                    signature,
                    {
                        from: wallet.address,
                        gasLimit: ethers.utils.hexlify(Math.ceil(Number(etmGas) * 1.2)),
                        gasPrice: ethers.utils.hexlify(Math.ceil(Number(gasPrice) * 1.2))
                    }
                )
                await acceptOfferNFTTx.wait()
                console.log('AcceptOfferNFTTx Hash', acceptOfferNFTTx.hash)
                return acceptOfferNFTTx.hash
            } else {
                console.log('Token not approve yes')
            }
        } else {
            console.log('Amount approve need any more')
        }
    } catch (error) {
        console.log(error)
    }
}

const getSignData = async (privateKey, provider, offer) => {
    try {
        const hash = ethers.utils.solidityKeccak256(
            ['address', 'uint256', 'address[]', 'uint256[]'],
            [offer.signerAddress, offer.nonce, offer.tradeAddress, offer.attributes]
        )
        const sigHashBytes = ethers.utils.arrayify(hash)
        const signingMessage = ethers.utils.hexlify(sigHashBytes)
        console.log('signingMessage', signingMessage)
        let wallet = new ethers.Wallet(privateKey, provider)
        const signature = await wallet.signMessage(
            ethers.utils.arrayify(signingMessage)
        )
        return signature
    } catch (error) {
        console.log(error)
    }
}

// acceptOfferNFT(
//     sepolia,
//     'f6ac3a901d2170e9fa165491ca443052e6d63d50460b497aa697ef9dca194075',
//     [
//         '0xEd0ECb171Afe6F7366fa462350285733B7e7b564',
//         '0x4a6f4FFd8e7164235E5aA7Db2B8425D3E3a7a165',
//         '0x7Cf0Ed8d8A3B8B860923725aF1C7a7ba80504627',
//         '0x0000000000000000000000000000000000000000',
//         '0x0000000000000000000000000000000000000000',
//         '0x0000000000000000000000000000000000000000',
//         '0x0000000000000000000000000000000000000000'
//     ],
//     ['0.001', 1096, 0, 0, 0, 0]
// )

// joinAuction(
//     sepolia,
//     "024a5ead8df0730ba4a1f5d1c5646f19af39b53045466b759f09f40ddf79d232",
//     "0.1"
// )

// swapWEth(
//     sepolia,
//     "024a5ead8df0730ba4a1f5d1c5646f19af39b53045466b759f09f40ddf79d232",
//     "0.1"
// )

const checkConAuctionAccessOffer = async (
    rpcEndPoint,
    web3AuthKey,
    newAmount,
    oldAmount
) => {
    try {
        const currentAmount = Number(newAmount - oldAmount).toString()
        const provider = new ethers.providers.JsonRpcProvider(rpcEndPoint)
        const wallet = new ethers.Wallet(web3AuthKey, provider)
        const wethContract = new ethers.Contract(wethAddressUnlock, wethABIUnlock, wallet)
  
        const amountToWei = ethers.utils.parseEther(currentAmount)
        
        // get amount approve
        const amountApprove = await wethContract.allowance(
            wallet.address,
            exchangeAddress
        )

        // cal total amount approve(Before + after)
        const totalAmount = BigNumber.from(amountApprove).add(
            BigNumber.from(amountToWei)
        )
        
        const currentValue = ethers.utils.formatUnits(totalAmount, 'ether')

        // etm function approve and deposit
        const [etmGasApprove, gasPrice, etmGasApproveSwap] = await Promise.all([
            wethContract.estimateGas.approve(
                exchangeAddress,
                totalAmount,
                {
                    from: wallet.address
                }
            ),
            provider.getGasPrice(),
            wethContract.estimateGas.deposit({
                from: wallet.address,
                value: totalAmount
            })
        ])
       
        // return object
        let dataForReceive = {
            status: true,
            amountSwap: currentAmount,
            amountApprove: Number(currentValue),
            gasPrice: Math.ceil(Number(gasPrice)),
            etmGasApprove: Math.ceil(Number(etmGasApprove)),
            etmGasApproveSwap: Math.ceil(Number(etmGasApproveSwap)),
            gasGasCostApprove:
                (Math.ceil(Number(etmGasApprove)) * Math.ceil(Number(gasPrice))) / 1e18,
            gasGasCostSwap:
                (Math.ceil(Number(etmGasApproveSwap)) * Math.ceil(Number(gasPrice))) /
                1e18
        }
        return dataForReceive
    } catch (error) {
        console.log(error)
    }
}

// checkConAuctionAccessOffer(
//     sepolia,
//     '5aba63827b240df8ba2b40b2405f2f6d6a062d10c7816f6859d39d684c53930f',
//     '0.5',
//     '0'
// )

const joinAuctionAccessOffer = async (rpcEndPoint, web3AuthKey, amount, dataForReceive) => {
    try {
      console.log('🚀 ~ file: index.ts:848 ~ joinAuctionAccessOffer ~ joinAuctionAccessOffer:')
      console.log('-------Start Approve-------')
      const provider = new ethers.providers.JsonRpcProvider(rpcEndPoint)
      const wallet = new ethers.Wallet(web3AuthKey, provider)
  
      const wethContract = new ethers.Contract(wethAddressUnlock, wethABIUnlock, wallet)
  
      const [decimals, balanceEth] = await Promise.all([wethContract.decimals(), provider.getBalance(wallet.address)])
      const amountToWei = ethers.utils.parseUnits(Number(amount).toString(), decimals)
  
      if (Number(balanceEth) > Number(amountToWei)) {
        const txApproveData = await wethContract.approve(exchangeAddress, amountToWei, {
          from: wallet.address,
          gasLimit: ethers.utils.hexlify(dataForReceive.etmGasApprove),
          gasPrice: ethers.utils.hexlify(dataForReceive.gasPrice)
        })
        await txApproveData.wait()
        console.log('txApproveData', txApproveData.hash)
        console.log('-------Finish Approve-------')
        return true
      } else {

        console.log("Not right");
        
        // // TODO: throw error
        // throw new Error('BALANCE_NOT_ENOUGH_TO_THIS_AUCTION')
        // // console.log('Balance ETH not enough to this auction')
        // return false
      }
    } catch (error) {
        console.log("error", error);
    //   const errorMessage = error?.message ? error?.message : error?.code ?? 'ERROR_UNKNOWN'
    //   throw Error(errorMessage)
    }
}


// joinAuctionAccessOffer(
//     sepolia,
//     '5aba63827b240df8ba2b40b2405f2f6d6a062d10c7816f6859d39d684c53930f',
//     '0.5',
//     {
//         status: true,
//         amountSwap: '0.5',
//         amountApprove: 0.88,
//         gasPrice: 3443746,
//         etmGasApprove: 28985,
//         etmGasApproveSwap: 27941,
//         gasGasCostApprove: 9.981697781e-8,
//         gasGasCostSwap: 9.6221706986e-8
//       }
// )

const swapWEthAccessOffer = async (rpcEndPoint, web3AuthKey, amount, dataForReceive) => {
    try {
        console.log('-------Start Swap-------')
        const provider = new ethers.providers.JsonRpcProvider(rpcEndPoint)
        const wallet = new ethers.Wallet(web3AuthKey, provider)

        const wethContract = new ethers.Contract(wethAddressUnlock, wethABIUnlock, wallet)

        const amountToWei = ethers.utils.parseEther(amount)

        const txSwapWeth = await wethContract.deposit({
            value: amountToWei,
            from: wallet.address,
            gasLimit: ethers.utils.hexlify(dataForReceive.etmGasApproveSwap),
            gasPrice: ethers.utils.hexlify(dataForReceive.gasPrice)
        })
        await txSwapWeth.wait()
        console.log('TxSwapWeth:', txSwapWeth.hash)
        console.log('-------Finish Swap-------')
    } catch (error) {
        console.log(error)
    }
}

// joinAuctionAccessOffer(sepolia, privateKey, web3AuthKey)

const etmCancelAuctionAccessOffer = async (rpcEndPoint, web3AuthKey, amount) => {
    try {
        const provider = new ethers.providers.JsonRpcProvider(rpcEndPoint)
        const wallet = new ethers.Wallet(web3AuthKey, provider)
        const wethContract = new ethers.Contract(wethAddressUnlock, wethABIUnlock, wallet)


        const amountApprove = await wethContract.allowance(
            wallet.address,
            exchangeAddress
        )
        const amountToWei = ethers.utils.parseEther(amount);
        const totalAmount = BigNumber.from(amountApprove).sub(
            BigNumber.from(amountToWei)
        )

        const [etmGasApprove, gasPrice, etmGasApproveSwap] = await Promise.all([
            wethContract.estimateGas.approve(
                exchangeAddress,
                totalAmount,
                {
                    from: wallet.address
                }
            ),
            provider.getGasPrice(),
            wethContract.estimateGas.withdraw(amountToWei, {
                from: wallet.address
            })
        ]);

        const gasData = {
            etmGasApprove: Math.ceil(Number(etmGasApprove) * 2),
            gasPrice: Math.ceil(Number(gasPrice) * 2),
            etmGasApproveSwap: Math.ceil(etmGasApproveSwap.toString() * 2),
            totalGasApprove: Math.ceil(Number(etmGasApprove) * 2) * Math.ceil(Number(gasPrice) * 2) / 1e18,
            totalGasApproveSwap: Math.ceil(etmGasApproveSwap.toString() * 2) * Math.ceil(Number(gasPrice) * 2) / 1e18
        };
        console.log("gasData", gasData);
        return gasData;
    } catch (error) {
        console.log(error);
    }
}

// etmCancelAuctionAccessOffer(
//     sepolia,
//     "5aba63827b240df8ba2b40b2405f2f6d6a062d10c7816f6859d39d684c53930f",
//     "0.02"
// )

const cancelAuctionAccessOffer = async (rpcEndPoint, web3AuthKey, amount, gasData) => {
    try {
        console.log("Start cancel auction")
        const provider = new ethers.providers.JsonRpcProvider(rpcEndPoint)
        const wallet = new ethers.Wallet(web3AuthKey, provider)

        const wethContract = new ethers.Contract(wethAddressUnlock, wethABIUnlock, wallet)

        const [allowanceEx, balanceWeth] = await Promise.all([
            wethContract.allowance(wallet.address, exchangeAddress),
            wethContract.balanceOf(wallet.address),
        ])

        const amountToWei = ethers.utils.parseEther(amount);
        const totalAmount = BigNumber.from(allowanceEx).sub(
            BigNumber.from(amountToWei)
        )

        const txApprove = await wethContract.approve(
            exchangeAddress,
            totalAmount,
            {
                gasLimit: ethers.utils.hexlify(Number(gasData.etmGasApprove) * 10),
                gasPrice: ethers.utils.hexlify(Number(gasData.gasPrice) * 10),
                from: wallet.address
            }
        );
        await txApprove.wait()
        console.log('TxApproveHash', txApprove.hash);
        return txApprove.hash;
    } catch (error) {
        console.log(error)
    }
}

// cancelAuctionAccessOffer(
//         sepolia,
//     "5aba63827b240df8ba2b40b2405f2f6d6a062d10c7816f6859d39d684c53930f",
//     "0.02",
//     {
//         etmGasApprove: 57970,
//         gasPrice: 20000012,
//         etmGasApproveSwap: 72060,
//         totalGasApprove: 0.00000115940069564,
//         totalGasApproveSwap: 0.00000144120086472
//       }
// )

// swapWEthAccessOffer(
//     sepolia, 
//     "5aba63827b240df8ba2b40b2405f2f6d6a062d10c7816f6859d39d684c53930f", 
//     "0.4",
//     {
//         status: true,
//         amountSwap: '0.5',
//         amountApprove: 0.9,
//         gasPrice: 10000005,
//         etmGasApprove: 28985,
//         etmGasApproveSwap: 45041,
//         gasGasCostApprove: 2.89850144925e-7,
//         gasGasCostSwap: 4.50410225205e-7
//       }
// )

// joinAuctionAccessOffer(
//     sepolia, 
//     "5aba63827b240df8ba2b40b2405f2f6d6a062d10c7816f6859d39d684c53930f", 
//     "0.4",
//     {
//         status: true,
//         amountSwap: '0.5',
//         amountApprove: 0.9,
//         gasPrice: 10000005,
//         etmGasApprove: 28985,
//         etmGasApproveSwap: 45041,
//         gasGasCostApprove: 2.89850144925e-7,
//         gasGasCostSwap: 4.50410225205e-7
//       }
// );