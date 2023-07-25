import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import { marketplaceAddress } from "@/config";
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import { useRouter } from "next/router";

export default function ResellNFT() {
  const [formInput, updateFormInput] = useState({ price: "", image: "" });
  const router = useRouter();
  const { id, tokenURI } = router.query;
  const { image, price } = formInput;

  useEffect(() => {
    fetchNFT();
  }, [id]);

  async function fetchNFT() {
    if (!tokenURI) return;
    const meta = await axios.get(tokenURI);
    updateFormInput((state) => ({ ...state, image: meta.data.image }));
  }

  async function listNFTForSale() {
    if (!price) return;
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const priceFormatting = ethers.utils.parseUnits(formInput.price, "ether");

    let contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer
    );
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();
    console.log(priceFormatting);
    let transaction = await contract.resellToken(id, priceFormatting, {
      value: listingPrice,
    });
    await transaction.wait();

    router.push("/");
  }

  return (
    <div className="flex flex-col items-center min-h-screen pt-6 sm:justify-center sm:pt-0 bg-gray-900">
      <div className="w-full px-3 py-4 mt-6 overflow-hidden bg-gray-100 shadow-md max-w-3xl sm:rounded-lg">
        <img
          className="border shadow rounded-xl overflow-hidden"
          src={image}
          alt="Asset"
        />

        <div className="mt-4">
          <label
            htmlFor="password_confirmation"
            className="block text-sm font-bold text-gray-700 undefined text-center"
          >
            Your NFT Price
          </label>
          <div className="flex flex-col items-start">
            <input
              placeholder="Asset Price in Eth"
              onChange={(e) =>
                updateFormInput({ ...formInput, price: e.target.value })
              }
              className="block w-full mt-1 pl-2 border-2 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>

        <div className="flex items-center mt-4">
          <button
            onClick={listNFTForSale}
            className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:bg-purple-600"
          >
            Resell
          </button>
        </div>
      </div>
    </div>
  );
}
