import { createContext, useState, useContext, useEffect } from "react";

const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if tokens exist in localStorage and validate their expiration
    const refreshToken = localStorage.getItem("refreshToken");
    const refreshExpiresAt = localStorage.getItem("refreshExpiresAt");
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

    if (refreshToken && refreshExpiresAt && currentTime < parseInt(refreshExpiresAt, 10)) {
      setIsLoggedIn(true); // User is logged in if refresh token is valid
    } else {
      setIsLoggedIn(false); // User is logged out if tokens are missing or expired
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshExpiresAt");
    }
  }, []);

  const updateLoginState = (state, refreshToken, accessToken, refreshExpiresIn, accessExpiresIn) => {
    setIsLoggedIn(state);

    if (state) {
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      const refreshExpiresAt = currentTime + refreshExpiresIn; // Calculate refresh expiration time

      // Store tokens and expiration times in localStorage
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshExpiresAt", refreshExpiresAt);
    } else {
      // Clear tokens and expiration times from localStorage on logout
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshExpiresAt");
    }
  };

  return (
    <LoginContext.Provider value={{ isLoggedIn, setIsLoggedIn: updateLoginState }}>
      {children}
    </LoginContext.Provider>
  );
};

export const useLogin = () => useContext(LoginContext);