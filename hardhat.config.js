require("@nomiclabs/hardhat-waffle")

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
//  unused configuration commented out for now
 ganach: {
   url: "HTTP://127.0.0.1:7545",
   accounts: ['1e1b2d15d63ac21635ca3f87fcc76c95a9ff965bcf8275be029a59a125d535e3']
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