import React, { useEffect, useState } from "react";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";

const ConnectWallet = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [provider, setProvider] = useState(null);

  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: "2M5kVhxyInmGbzqTv1Ikp44TX4G", // جایگزین کن با infura ID خودت
      },
    },
    injected: {
      package: null,
    },
  };

  const web3Modal = typeof window !== "undefined"
    ? new Web3Modal({
        cacheProvider: true,
        providerOptions,
      })
    : null;

  const connectWallet = async () => {
    try {
      const instance = await web3Modal.connect();
      const web3Provider = new ethers.providers.Web3Provider(instance);
      const signer = web3Provider.getSigner();
      const address = await signer.getAddress();

      setProvider(instance);
      setWalletAddress(address);
      localStorage.setItem("walletAddress", address);
    } catch (error) {
      console.error("Wallet connection error:", error);
    }
  };

  const disconnectWallet = async () => {
    if (provider?.disconnect) {
      await provider.disconnect();
    }
    web3Modal.clearCachedProvider();
    localStorage.removeItem("walletAddress");
    setWalletAddress("");
    setProvider(null);
  };

  useEffect(() => {
    if (web3Modal?.cachedProvider) {
      connectWallet();
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 bg-gray-900">
      {walletAddress ? (
        <button
          className="bg-purple-600 hover:bg-purple-800 text-white font-semibold py-2 px-4 rounded"
          onClick={disconnectWallet}
        >
          {walletAddress}
        </button>
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
};

export default ConnectWallet;
