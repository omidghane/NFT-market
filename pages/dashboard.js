import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    const data = await contract.fetchItemsListed()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await contract.tokenURI(i.tokenId)
      console.log("url", tokenUri);
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
      }
      return item
    }))

    setNfts(items)
    setLoadingState('loaded') 
  }
  if (loadingState === 'loaded' && !nfts.length) return (<><h1 className="py-10 px-20 text-3xl bg-gray-900 text-white">No NFTs listed</h1>  </>)
  return (
    // <div>
    //   <div className="p-4">
    //     <h2 className="text-2xl py-2">Items Listed</h2>
    //       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
    //       {
    //         nfts.map((nft, i) => (
    //           <div key={i} className="border shadow rounded-xl overflow-hidden">
    //             <img src={nft.image} className="rounded" />
    //             <div className="p-4 bg-black">
    //               <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
    //             </div>
    //           </div>
    //         ))
    //       }
    //     </div>
    //   </div>
    // </div>

    <div className="bg-gray-900 text-white">
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold">داشبورد</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
      {nfts.map((nft, i) => (
        <div key={i} className="bg-gray-700 rounded-xl overflow-hidden">
          <img src={nft.image} className="w-full h-64 object-cover" />
          <div className="p-4">
            <p className="text-lg font-bold">{nft.title}</p>
            <p className="text-gray-300">{nft.description}</p>
            <p className="text-yellow-300 mt-4">{nft.price} ETH</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

  )
}