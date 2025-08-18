import axios from "axios";
import { ethers } from "ethers";
import React, { useState, useEffect } from 'react';
import Web3Modal from 'web3modal'

import { marketplaceAddress } from '../config'
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
import { useLogin } from "./LoginContext";
import config from "../config";

export default function Home(){
  const { isLoggedIn, refreshAccessToken } = useLogin();
  const [nfts, setNfts] = useState([
    // { name: "NFT 1", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur eleifend est a ipsum tempor fringilla. Praesent id mi at velit commodo dictum non eu velit. Donec vel elit luctus, volutpat mi sit amet, auctor sem. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Phasellus posuere fermentum est, a rhoncus urna bibendum quis. Cras malesuada varius metus, nec tincidunt metus semper ac. Quisque risus arcu, gravida eget tellus id, tristique eleifend metus. Aliquam semper luctus dui ut faucibus. Nam euismod imperdiet nisi, ac aliquet eros pellentesque vel. Ut viverra sed tellus dignissim cursus. Ut dignissim accumsan ligula, et efficitur odio egestas non. Nulla feugiat enim eu tellus auctor fringilla eu eget neque. Aliquam purus neque, dignissim posuere arcu ut, egestas laoreet risus.", price: "0.1", image: "https://i.ibb.co/j6MxBbT/nft-image-1.png" },
    // { name: "NFT 2", description: "This is the second NFT", price: "0.2", image: "https://i.ibb.co/rM1g0TN/nft-image-2.png" },
    // { name: "NFT 3", description: "This is the third NFT", price: "0.3", image: "https://i.ibb.co/x2dnR6b/nft-image-3.png" },
  ])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [error, setError] = useState(""); 

  useEffect(()=>{
    loadNFTs();
  }, [])

  async function loadNFTs(){
    const provider = new ethers.providers.JsonRpcProvider('http://62.60.198.61:8545')
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
        name: meta.data.name,
      }
      return item
    }))
    setNfts(items);
    setLoadingState('loaded');
  }

  async function buyNft(nft){
    if (!isLoggedIn) {
      setError("You must be logged in to buy an NFT.");
      alert(error); // Show alert with error message
      return;
    }
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi , signer);
    
    // user will be prompted to pay the asking proces to complete the transaction
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');
    const transaction = await contract.createMarketSale(nft.tokenId , { value: price });
    
    await transaction.wait();

    // Step 2: Get the access token from localStorage
    const accessToken = await refreshAccessToken();
    if (!accessToken) {
        console.error("Access token is missing. Please log in.");
        return;
    }

    console.log("Preparing to send NFT info to backend:");
    console.log({
        token_id: nft.tokenId,
        name: nft.name || "Unnamed NFT", // Use a default name if not provided
        image_url: nft.image,
        metadata: nft.description,
    });

    // Step 3: Make a POST request to the backend API
    const response = await fetch(`${config.baseURL}/nft/add/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`, // Send the access token in the Authorization header
        },
        body: JSON.stringify({
            token_id: nft.tokenId,
            name: nft.name || "Unnamed NFT", // Use a default name if not provided
            image_url: nft.image,
            metadata: nft.description,
        }),
    });

    if (response.ok) {
        const data = await response.json();
        console.log("NFT successfully added to the backend:", data);
    } else {
        const errorData = await response.json();
        console.error("Failed to add NFT to the backend:", errorData);
    }

    loadNFTs();
  }

  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)
  return( <>
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
