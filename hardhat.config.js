require("@nomiclabs/hardhat-waffle")

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
//  unused configuration commented out for now
 ganach: {
   url: "HTTP://localhost:8545",
   accounts: ['0xab2f97e392e7c753bf9fc636e647341f0f47630b963bafa218065bf5eddd31e0']
 }
  },
  solidity: {
    version: "0.8.17",
    settings: { 
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}