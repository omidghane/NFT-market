/* pages/create-nft.js */
import { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { create as IPFS } from "ipfs-http-client";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";

const IMAGE = "https://i.ibb.co/Ks6zRBK/image-3-2x.jpg"

const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3MDE5OGYwZi02YTlhLTRlODMtYTlmYy0zODMzOGQ2MGE1M2IiLCJlbWFpbCI6ImFwZy5hbGkyMDE4MEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMjNhMjQ3ODg0MTFmMTJkOTU5Y2QiLCJzY29wZWRLZXlTZWNyZXQiOiJiNmJkNDM2NGMwNmZhOTE4YzI1NmI0YmRlMTA0MDgyZjUyNDg4MDEzZWZhMmU3YjBjN2IzZTczYjlhMGU5ZTAwIiwiZXhwIjoxNzUxNzMyOTg1fQ.pLSocHlKbYWzYXhA-e_BpLY7XZPKyksgjgBmDKsQaoM"

const INFURA_ID = "2M5kVhxyInmGbzqTv1Ikp44TX4G";
const INFURA_SECRET_KEY = "383984714260707b00cba3562f76765f";
// const client = ipfsHttpClient('http://localhost:5001/api/v0')
import { marketplaceAddress } from "../config";

import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import { env } from "@/next.config";
export const ipfs = IPFS({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: `Basic ${Buffer.from(
      `${INFURA_ID}:${INFURA_SECRET_KEY}`
    ).toString("base64")}`,
  },
});

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const router = useRouter();

  async function onChange(e) {
    const file = e.target.files[0];
  
    try {
      const formData = new FormData();
      formData.append("file", file);
  
      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxBodyLength: "Infinity",
          headers: {
            "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
            'Authorization': `Bearer ${PINATA_JWT}`
          },
        }
      );
  
      const url = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
      setFileUrl(url);
    } catch (error) {
      console.log("Error uploading file to Pinata: ", error);
    }
  }
  
  async function uploadToIPFS() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
  
    const metadata = {
      name,
      description,
      image: fileUrl,
    };
  
    try {
      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadata,
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${PINATA_JWT}`
          },
        }
      );
  
      const url = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
      console.log("Uploaded metadata to Pinata IPFS:", url);
      return url;
    } catch (error) {
      console.log("Error uploading metadata to Pinata:", error);
    }
  }
  

  async function listNFTForSale() {
    const url = await uploadToIPFS();
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    
    console.log(url);
    /* next, create the item */
    const price = ethers.utils.parseUnits(formInput.price, "ether");
    console.log(price);
    let contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer
    );
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();
    let transaction = await contract.createToken(url, price, {
      value: listingPrice,
    });
    await transaction.wait();
    
    router.push("/");
  }

  return (
    <>
  <div className="flex justify-center items-center min-h-screen bg-gray-900">
    <div className="w-full max-w-3xl p-8 bg-white rounded-lg shadow-md">
      {!fileUrl ? (
        <img
        className="mx-auto w-full h-full rounded-md object-cover mb-4 border-4 border-purple-500 shadow-lg"
        src={IMAGE}
        alt="Asset"
      />
      ):(
        <img
        className="mx-auto w-full h-full rounded-md object-cover mb-4 border-4 border-purple-500 shadow-lg"
        src={fileUrl}
        alt="Asset"
      />
      )}
      {/* <img
        className="mx-auto w-full h-full rounded-md object-cover mb-4 border-4 border-purple-500 shadow-lg"
        src={fileUrl}
        alt="Asset"
      /> */}
      <form className="space-y-4">
        <div>
          <label htmlFor="assetName" className="block text-gray-700 font-semibold">
            Asset Name
          </label>
          <input
            type="text"
            id="assetName"
            placeholder="Asset Name"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            onChange={(e) => updateFormInput({ ...formInput, name: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="assetDescription" className="block text-gray-700 font-semibold">
            Asset Description
          </label>
          <textarea
            id="assetDescription"
            placeholder="Asset Description"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            onChange={(e) => updateFormInput({ ...formInput, description: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="assetPrice" className="block text-gray-700 font-semibold">
            Asset Price in Eth
          </label>
          <input
            type="text"
            id="assetPrice"
            placeholder="Asset Price in Eth"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            onChange={(e) => updateFormInput({ ...formInput, price: e.target.value })}
          />
        </div>
        <div className="flex items-center justify-center">
          <label htmlFor="assetFile" className="bg-purple-500 text-white font-semibold px-4 py-2 rounded-md cursor-pointer hover:bg-purple-600 transition-all">
            Choose a file
            <input
              type="file"
              id="assetFile"
              name="Asset"
              className="hidden"
              onChange={onChange}
            />
          </label>
          {fileUrl && (
            <span className="ml-2 text-gray-700 overflow-auto">{fileUrl}</span>
          )}
        </div>
        <button
          type="button"
          onClick={listNFTForSale}
          className="w-full bg-purple-500 text-white font-bold py-3 rounded-md hover:bg-purple-600 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          Create NFT
        </button>
      </form>
    </div>
  </div>
</>

  );
}
