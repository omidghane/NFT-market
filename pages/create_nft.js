/* pages/create-nft.js */
import { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { create as IPFS } from "ipfs-http-client";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";

const IMAGE = "https://i.ibb.co/Ks6zRBK/image-3-2x.jpg"
const localApi2 = axios.create({
  baseURL: "http://localhost:2000/",
});

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
      const added = await ipfs.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }
  async function uploadToIPFS() {
    const { name, description, price } = formInput;
    console.log("ttttt", !name || !description || !price || !fileUrl);
    console.log(name, description, price, fileUrl);
    if (!name || !description || !price || !fileUrl) return;
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      const added = await ipfs.add(data);
      const url = `https://ipfs.io/ipfs/${added.path}`;
      /* after file is uploaded to IPFS, return the URL to use it in the transaction */
      console.log("This is ipfs:", url);
      
      return url;
    } catch (error) {
      console.log("Error uploading file: ", error, data);
    }
    console.log("ok");
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
    await localApi2.post('/createNft', {
      url, 
      address: address.toString()
    }).then((response) => {
      console.log(response.data);
      
    })
    .catch((error) => {
      console.error(error);
    });
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
