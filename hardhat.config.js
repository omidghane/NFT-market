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
   accounts: ['0x5c965c48039273343b603d6bbb4a81bac50fd16904d441f905d1ad6e1ada0895']
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