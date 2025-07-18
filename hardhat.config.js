require("@nomiclabs/hardhat-waffle")

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
//  unused configuration commented out for now
 ganach: {
   url: "HTTP://127.0.0.1:8545",
   accounts: ['0xeb6f79e34cb2831d07f92d135da0d13e8fc257bedf4a3d7d471ca4559cffe0e2']
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