import { ethers } from "ethers";
import Web3Modal from "web3modal";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useLogin } from "./LoginContext";

const localApi = axios.create({
  baseURL: "http://localhost:8080/accounts/api/",
});

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [wallet, setWallet] = useState("");
  const [error, setError] = useState("");
  const {setIsLoggedIn} = useLogin();
  const router = useRouter(); 

  useEffect(() => {
    connectWallet(); // Try connecting wallet automatically on page load
  }, []);

  const connectWallet = async () => {
    try {
      const web3Modal = new Web3Modal();
      const selectedProvider = await web3Modal.connect();
      const ethersProvider = new ethers.providers.Web3Provider(selectedProvider);
      const signer = ethersProvider.getSigner();
      const address = await signer.getAddress();
      setWallet(address);
    } catch (error) {
      console.error(error);
      setError("Failed to connect wallet. Please try again.");
      return false;
    }
    return true;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // const isWalletConnected = await connectWallet();
    // if (!isWalletConnected) {
    //   return;
    // }

    // if (
    //   confirmPassword === password &&
    //   isValidEmail(username) &&
    //   username !== ""
    // ) 
    // {

    if (!wallet) {
      setError("Wallet not connected.");
      return;
    }
  
    if (!username || !password || password !== confirmPassword) {
      setError("Please fill out all fields correctly.");
      return;
    }
  
    if (!isValidEmail(username)) {
      setError("Enter a valid email address.");
      return;
    }

    try {
      const response = await localApi.post("/register/", {
        username, // Email format
        password,
        wallet_address: wallet,
      });

      if (response.status === 201) {
        alert("Registration successful!");
        setError("");
    
        // Extract data from the response
        const data = response.data; // Define `data` as `response.data`
        const { refresh, access } = data.tokens; // Extract tokens from the response
        const { refresh_expires_in, access_expires_in } = data; // Extract expiration times
    
        console.log("Tokens:", { refresh, access }); // Debugging tokens
        console.log("Expiration Times:", { refresh_expires_in, access_expires_in }); // Debugging expiration times
    
        // Update login state and store tokens with expiration times
        setIsLoggedIn(true, refresh, access, refresh_expires_in, access_expires_in);
    
        // Redirect to My NFTs page
        router.push("/my-nfts");
      } else {
        console.log("Registration failed:", response.status);
        console.error(response.error || "Failed to register user.");
        setError(response.error || "Failed to register user.");
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred while registering. Please try again.");
    }
    // } else {
    //   setError("Invalid form data. Please check your inputs.");
    // }
  };

  return (
    <div>
      <div className="flex flex-col items-center min-h-screen pt-6 sm:justify-center sm:pt-0 bg-gray-900">
        <div>
          <a href="/">
            <h3 className="text-4xl font-bold text-purple-600">NFT Market</h3>
          </a>
        </div>
        <div className="w-full px-6 py-4 mt-6 overflow-hidden bg-white shadow-md sm:max-w-lg sm:rounded-lg">
          <form onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-bold text-gray-700"
              >
                Email
              </label>
              <div className="flex flex-col items-start">
                <input
                  type="email"
                  name="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="block w-full mt-1 pl-2 border-2 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            </div>
            <div className="mt-4">
              <label
                htmlFor="password"
                className="block text-sm font-bold text-gray-700"
              >
                Password
              </label>
              <div className="flex flex-col items-start">
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="block w-full mt-1 pl-2 border-2 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            </div>
            <div className="mt-4">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-bold text-gray-700"
              >
                Confirm Password
              </label>
              <div className="flex flex-col items-start">
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="block w-full mt-1 pl-2 border-2 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            </div>
            {error && <div className="text-red-500 mt-4">{error}</div>}
            <div className="flex items-center mt-4">
              <button className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:bg-purple-600">
                Register
              </button>
            </div>
          </form>
          <div className="mt-4 text-grey-600">
            Already have an account?{" "}
            <span>
              <Link
                className="text-purple-600 font-bold hover:underline"
                href="/login"
              >
                Log in
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;