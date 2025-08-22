require("@nomiclabs/hardhat-waffle")

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
//  unused configuration commented out for now
 ganach: {
   url: "https://rushmarketgame.sbs",
   accounts: ['0xd368dab76224dc07f32429f05715ba3cdceac25e21fb8996e82f67472126a0fc']
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