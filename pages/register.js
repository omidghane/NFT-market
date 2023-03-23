import { useState } from 'react'
import Web3Modal from 'web3modal'
import axios from 'axios'

const localApi2 = axios.create({
  baseURL: 'http://localhost:2000/'
});

const RegisterPage = () => {
  const [userId, setUserId] = useState(second)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // add more fields as needed

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
      setUserId(address);
    } catch (error) {
      console.error(error);
    }
  }

  const handleSubmit =async (event) => {
    event.preventDefault()

    await connectWallet();
    // handle form submission
    localApi2.post('/register',{
      userId,
      username,
      email,
      password,
    })
    .then(response => {
      console.log(response.data);
      setData(response.data);
    })
    .catch(error => {
      console.error(error);
    });
    
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="username">
            Username
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div className="mb-4">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  )
}

export default RegisterPage
