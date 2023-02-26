// // const {
// //   time,
// //   loadFixture,
// // } = require("@nomicfoundation/hardhat-network-helpers");
// // const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
// const { expect } = require("chai");
// const { ethers } = require("hardhat");
// // const { authereum } = require("web3modal/dist/providers/connectors");

describe('NFTMarket',async () => { 
  it("Should create and execute market sales", async function() {
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace")
  const nftmarketplace = await NFTMarketplace.deploy();
  await nftmarketplace.deployed();

  let listingPrice = await nftmarketplace.getListingPrice();
  listingPrice = listingPrice.toString();

  const auctionPrice = ethers.utils.parseUnits('1','ether');

  //create two nft token 
  await nftmarketplace.createToken("IPFS_NFT1", auctionPrice , {value: listingPrice});
  await nftmarketplace.createToken("IPFS_NFT2", auctionPrice , { value: listingPrice});

  const [_,buyerAddress] = await ethers.getSigners();

  // sale of token nft to another user
  await nftmarketplace.connect(buyerAddress).createMarketSale(1,{value: auctionPrice});

  //resell a token 
  await nftmarketplace.connect(buyerAddress).resellToken(1, auctionPrice , {value: listingPrice})

  // query for return the unsold items
 let items = await nftmarketplace.fetchMarketItems()
    items = await Promise.all(items.map(async i => {
      const tokenUri = await nftmarketplace.tokenURI(i.tokenId)
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))
    
    console.log('items: ', items)
    })
})

