// deploy contract to localhost 8545
// contract address = 0x5FbDB2315678afecb367f032d93F642f64180aa3

const hre = require('hardhat');

async function main() {
  const NFTMarketplace = await hre.ethers.getContractFactory('NFTMarketplace'); // get contract from contracts.NFTMarketplace.sol
  const nFTMarketplace = await NFTMarketplace.deploy();

  await nFTMarketplace.deployed();

  console.log('Greeter deployed to:', nFTMarketplace.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
