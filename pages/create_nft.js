/* pages/create-nft.js */
import { useState } from 'react'
import { ethers } from 'ethers'
import {create as IPFS} from 'ipfs-http-client';
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

const INFURA_ID = "2M5kVhxyInmGbzqTv1Ikp44TX4G"
const INFURA_SECRET_KEY = "383984714260707b00cba3562f76765f"
// const client = ipfsHttpClient('http://localhost:5001/api/v0')
import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
import { env } from '@/next.config';
export const ipfs = IPFS({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${Buffer.from(
      `${INFURA_ID}:${INFURA_SECRET_KEY}`
    ).toString('base64')}`
  }
})


export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const router = useRouter()

  async function onChange(e) {
    const file = e.target.files[0]
    console.log("sdses", process.env.INFURA_ID);
    try {
      const added = await ipfs.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
        )
      const url = `https://ipfs.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }
  async function uploadToIPFS() {
    const { name, description, price } = formInput
    console.log("ttttt", !name || !description || !price || !fileUrl);
    console.log(name,description,price,fileUrl);
    if (!name || !description || !price || !fileUrl) return
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    try {
      const added = await ipfs.add(data)
      const url = `https://ipfs.io/ipfs/${added.path}`
      /* after file is uploaded to IPFS, return the URL to use it in the transaction */
      return url
    } catch (error) {
      console.log('Error uploading file: ', error , data)
    }
    console.log('ok');  
  }

  async function listNFTForSale() {
    const url = await uploadToIPFS()
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    console.log(url);
    /* next, create the item */
    const price = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()
    let transaction = await contract.createToken(url, price, { value: listingPrice })
    await transaction.wait()
   
    router.push('/')
  }

  return (<>
    <div className="flex justify-center bg-gray-900">
  <div className="w-1/2 flex flex-col pb-12 my-[4.15rem]">
  <input 
  placeholder="Asset Name"
  className="mt-8 border rounded p-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
  onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
/>
<textarea
  placeholder="Asset Description"
  className="mt-2 border rounded p-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
  onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
/>
<input
  placeholder="Asset Price in Eth"
  className="mt-2 border rounded p-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
  onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
/>

<label
  className="mt-4 bg-gray-100 p-4 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-200 cursor-pointer"
>
  <svg
    className="w-6 h-6 mr-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
  Choose a file
  <input
    type="file"
    name="Asset"
    className="hidden"
    onChange={onChange}
  />
</label>

    {
      fileUrl && (
        <img className="rounded mt-4" width="350" src={fileUrl} alt="Asset Preview" />
      )
    }
    <button onClick={listNFTForSale} className="font-bold mt-6 bg-purple-500 hover:bg-purple-600 text-white rounded-lg py-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
      Create NFT
    </button>
  </div>
</div>



  </>)
}