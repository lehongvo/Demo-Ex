const { ethers } = require('ethers');

// Example balance in Wei and decimals
const balance = ethers.BigNumber.from('1000000000000000000'); // Replace with your actual balance in Wei
const decimals = 18; // Replace with your actual token's decimals

// Convert from Wei to Ether with specified decimals
const formattedBalance = ethers.utils.formatUnits(balance, decimals);

console.log('Formatted Balance:', formattedBalance);