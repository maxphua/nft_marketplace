// npx hardhat run scripts/deploy.js --network localhost

const fs = require('fs'); // fs is the file system
require('@nomiclabs/hardhat-waffle');

const privateKey = fs.readFileSync('.secret').toString().trim(); // get the wallet secret key

module.exports = {
  network: {
    hardhat: {
      chainId: 1337, // chainId for testing purpose
    },
  },
  solidity: '0.8.4',
};
