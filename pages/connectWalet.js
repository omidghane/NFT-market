import React, { useState } from 'react';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { ethers } from 'ethers';
var Wallet = 'aliapg';
const ConnectWallet = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [provider, setProvider] = useState(null);

  const connectWallet = async () => {
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions: {
          walletconnect: {
            package: WalletConnectProvider,
            options: {
              infuraId: 'YOUR_INFURA_PROJECT_ID'
            }
          }
        }
      });
      const selectedProvider = await web3Modal.connect();
      setProvider(selectedProvider);

      const ethersProvider = new ethers.providers.Web3Provider(selectedProvider);
      const signer = ethersProvider.getSigner();
      const address = await signer.getAddress();
      localStorage.setItem('walletAddress', address);
      setWalletAddress(address);
      Wallet = address;
    } catch (error) {
      console.error(error);
    }

    
  }

  const handleDisconnectWallet = () => {
    localStorage.removeItem('walletAddress');
    setWalletAddress('');
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 bg-gray-900">
      {walletAddress ? (
        <div className="flex flex-row items-center ">
          {/* <p className="text-gray-700">Connected wallet address:</p> */}
          {/* <p className="text-green-600 font-medium">{walletAddress}</p> */}
          <button 
            className="bg-purple-600 hover:bg-purple-800 text-white font-semibold py-2 px-4 rounded "
            onClick={handleDisconnectWallet}
          >
            {/* Disconnect Wallet */}
            <p>{walletAddress}</p>
          </button>
        </div>
      ) : (
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}

export default ConnectWallet ;
export {Wallet};


