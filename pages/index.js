import axios from "axios";
import { ethers } from "ethers";
import React, { useState, useEffect } from 'react';
import Web3Modal from 'web3modal'

import { marketplaceAddress } from '../config'
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function Home(){
  const [nfts, setNfts] = useState([
    { name: "NFT 1", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur eleifend est a ipsum tempor fringilla. Praesent id mi at velit commodo dictum non eu velit. Donec vel elit luctus, volutpat mi sit amet, auctor sem. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Phasellus posuere fermentum est, a rhoncus urna bibendum quis. Cras malesuada varius metus, nec tincidunt metus semper ac. Quisque risus arcu, gravida eget tellus id, tristique eleifend metus. Aliquam semper luctus dui ut faucibus. Nam euismod imperdiet nisi, ac aliquet eros pellentesque vel. Ut viverra sed tellus dignissim cursus. Ut dignissim accumsan ligula, et efficitur odio egestas non. Nulla feugiat enim eu tellus auctor fringilla eu eget neque. Aliquam purus neque, dignissim posuere arcu ut, egestas laoreet risus.", price: "0.1", image: "https://i.ibb.co/j6MxBbT/nft-image-1.png" },
    { name: "NFT 2", description: "This is the second NFT", price: "0.2", image: "https://i.ibb.co/rM1g0TN/nft-image-2.png" },
    { name: "NFT 3", description: "This is the third NFT", price: "0.3", image: "https://i.ibb.co/x2dnR6b/nft-image-3.png" },
  ])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(()=>{
    loadNFTs();
  }, [])

  async function loadNFTs(){
    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545')
    const contract = new ethers.Contract(marketplaceAddress,NFTMarketplace.abi , provider);
    const data = await contract.fetchMarketItems();

    const items = await Promise.all(data.map(async (i)=>{
      const tokenUri = await contract.tokenURI(i.tokenId);
      const meta = await axios.get(tokenUri);
    
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')

      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        description: meta.data.description,
      }
      return item
    }))
    setNfts(items);
    setLoadingState('loaded');
  }

  async function buyNft(nft){
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi , signer);
    
    // user will be prompted to pay the asking proces to complete the transaction
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');
    const transaction = await contract.createMarketSale(nft.tokenId , { value: price });
    
    await transaction.wait();
    loadNFTs();
  }

  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)
  return( <>
  {/* <div className="flex justify-center bg-gray-900">aaaaa
    <div className="px-4 max-w-screen-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        {nfts.map((nft, i) => (
          <div key={i} className="border rounded-xl overflow-hidden shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
            <img src={nft.image} className="object-cover w-full h-64" />
            <div className="p-4">
              <p className="text-2xl font-semibold h-16 overflow-hidden text-gray-100">{nft.name}</p>
              <div className="h-28 overflow-hidden">
                <p className="text-gray-400">{nft.description}</p>
              </div>
            </div>
            <div className="p-4 bg-gray-800">
              <p className="text-2xl font-bold text-white">{nft.price} ETH</p>
              <button className="w-full mt-4 py-2 px-4 bg-pink-500 hover:bg-pink-700 text-white font-bold rounded" onClick={() => buyNft(nft)}>Buy</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>

  <div className="flex justify-center bg-gray-900">
  <div className="px-4 max-w-screen-lg w-full">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
      {nfts.map((nft, i) => (
        <div key={i} className="border rounded-lg overflow-hidden shadow-lg">
          <div className="relative">
            <img className="object-cover w-full h-64 " src={nft.image} alt={nft.name} />
            <div className="absolute top-0 right-0 bg-green-500 text-white px-2 py-1 rounded-bl-lg">
              {nft.type}
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-2xl font-bold mb-2 text-gray-100">{nft.name}</h3>
            <p className="h-28 text-gray-400 overflow-hidden">{nft.description}</p>
            <p className="text-gray-100 font-bold text-lg mt-2">{nft.price} ETH</p>
            <button
              className="bg-pink-500 text-white font-bold py-2 px-4 mt-4 rounded hover:bg-pink-700"
              onClick={() => buyNft(nft)}
            >
              Buy
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
</div> */}

<div className="dark bg-gray-900 min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {nfts.map((nft, i) => (
            <div key={i} className="relative">
              <div className="group shadow-lg rounded-lg overflow-hidden">
                <img
                  className="w-full h-80 object-cover"
                  src={nft.image}
                  alt={nft.name}
                />
                <div className="bg-gradient-to-t from-gray-900 to-gray-900 py-2 px-4 absolute bottom-20  w-full transition duration-500 ease-in-out opacity-0 group-hover:opacity-100">
                  <h3 className="text-lg font-semibold text-gray-100 mb-1">{nft.name}</h3>
                  <p className="text-gray-100 h-24 overflow-hidden">{nft.description}</p>
                </div>
              </div>
              <div className="bg-gray-900 shadow-lg rounded-lg overflow-hidden mt-2">
                {/* <div className="px-4 py-3">
                  <h3 className="text-lg font-semibold text-gray-100">{nft.name}</h3>
                  <p className="h-24 text-gray-400 overflow-hidden">{nft.description}</p>
                </div> */}
                <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
                  <p className="text-gray-400">{nft.price} ETH</p>
                  <button
                    className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg transition duration-500 overflow-hidden transform hover:-translate-y-1 hover:scale-110"
                    onClick={() => buyNft(nft)}
                  >
                    Buy
                  </button>
                  
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    
</>
)
}