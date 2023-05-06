import { ethers } from "ethers";
import { useEffect , useState } from 'react'
import axios from "axios";
import Web3Modal from 'web3modal'
import { marketplaceAddress} from '@/config'
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
import { useRouter } from "next/router";


export default function ResellNFT(){
    const [formInput, updateFormInput] = useState({ price: '', image: ''})
    const router = useRouter()
    const { id , tokenURI} = router.query;
    const { image , price } = formInput;

    useEffect(() => {
      fetchNFT()
    }, [id])
    
    async function fetchNFT() {
        if (!tokenURI) return
        const meta = await axios.get(tokenURI)
        updateFormInput(state => ({ ...state, image: meta.data.image }))
    }

    async function listNFTForSale(){
        if(!price) return
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner()
        
        const priceFormatting = ethers.utils.parseUnits(formInput.price, 'ether')
        
        let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi , signer)
        let listingPrice = await contract.getListingPrice();
        listingPrice = listingPrice.toString()
         console.log(priceFormatting);
        let transaction = await contract.resellToken(id , priceFormatting , { value: listingPrice })
        await transaction.wait()

        router.push('/');
    }
      
    return (
        <div class="flex justify-center items-center bg-gray-900 h-screen border-4">
          <div class="w-full md:w-1/2 flex flex-col pb-12 justify-center items-center">
            <img class="rounded mt-4 mx-auto max-w-xs " src={image} alt="Asset" />
            <input
              placeholder="Asset Price in Eth"
              class="mt-4 block w-full self-center sm:w-1/5 lg:w-5/12 py-2 px-3 border rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
            />

            <button onClick={listNFTForSale} class="w-full md:w-24 mt-4 font-bold bg-pink-500 text-white rounded p-4 shadow-lg hover:bg-pink-600 transition-all mx-auto">
              List NFT
            </button>
          </div>
        </div>


      )
    
}
