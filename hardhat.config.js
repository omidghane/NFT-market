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
   accounts: ['0x51121fbb472e73e100722441a2a879cd969eff125c3505dae3c3d3db4786e30b']
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