import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useLogin } from "./LoginContext";
// import { emit } from "nodemon";

const Login = () => {
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const {setIsLoggedIn} = useLogin(); // Track login state
    const router = useRouter(); // Next.js router for navigation

    const handleLogin = async () => {
        try {
            const response = await fetch("http://localhost:8080/accounts/api/token/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Login successful:", data);
    
                // Extract tokens and expiration times directly from the response
                const { refresh, access, refresh_expires_in, access_expires_in } = data;
    
                console.log("Tokens:", { refresh, access }); // Debugging tokens
                console.log("Expiration Times:", { refresh_expires_in, access_expires_in }); // Debugging expiration times
    
                // Update login state and store tokens with expiration times
                setIsLoggedIn(true, refresh, access, refresh_expires_in, access_expires_in);
    
                // Redirect to My NFTs page
                router.push("/my-nfts");
            } else {
                const errorData = await response.json();
                console.error("Login failed:", errorData);
                setError(errorData.message || "Invalid username or password. Please try again.");
            }
        } catch (error) {
            console.error("Error during login:", error);
        }
    };

    // if (isLoggedIn) {
    //     return null; // Hide the form after login
    // }

    return ( 
        <>
                <div className="flex flex-col items-center min-h-screen pt-6 sm:justify-center sm:pt-0 bg-gray-900">
                    <div>
                        <a href="/">
                            <h3 className="text-4xl font-bold text-purple-600">
                            <img width={55} height={55} src="https://i.ibb.co/1byZNrV/logo-removebg-preview.png" className='rounded-full ' />
                            </h3>
                        </a>
                    </div>
                    <div className="w-full px-6 py-4 mt-6 overflow-hidden bg-white shadow-md sm:max-w-lg sm:rounded-lg">
                        <form>
                            
                            <div className="mt-4">
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 undefined"
                                >
                                    Email
                                </label>
                                <div className="flex flex-col items-start">
                                    <input
                                        type="email"
                                        name="username"
                                        value={username}
                                        onChange={(event) => setUsername(event.target.value)}
                                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700 undefined"
                                >
                                    Password
                                </label>
                                <div className="flex flex-col items-start">
                                    <input
                                        type="password"
                                        name="password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    />
                                </div>
                            </div>
                            
                            <a
                                href="#"
                                className="text-xs text-purple-600 hover:underline"
                            >
                                Forget Password?
                            </a>
                            <div className="flex items-center mt-4">
                                <button
                                    type="button"
                                    onClick={handleLogin}
                                    className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:bg-indigo-700"
                                >
                                    Login
                                </button>
                            </div>
                        </form>
                        <div className="mt-4 text-grey-600">
                            Don't have an account yet?{" "}
                            <span>
                                <Link className="text-purple-600 hover:underline" href="/register">
                                    Register Now
                                </Link>
                            </span>
                        </div>
                    </div>
                </div>
            
        
        </>
    );
}
 
export default Login;