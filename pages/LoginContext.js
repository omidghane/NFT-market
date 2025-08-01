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
      clearTokens();
    }
  }, []);

  const updateLoginState = (state, refreshToken, accessToken, refreshExpiresIn, accessExpiresIn) => {
    setIsLoggedIn(state);

    if (state) {
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      const refreshExpiresAt = currentTime + refreshExpiresIn; // Calculate refresh expiration time
      const accessExpiresAt = currentTime + accessExpiresIn; // Calculate access expiration time

      // Store tokens and expiration times in localStorage
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshExpiresAt", refreshExpiresAt);
      localStorage.setItem("accessExpiresAt", accessExpiresAt);
    } else {
      clearTokens();
    }
  };

  const clearTokens = () => {
    // Clear tokens and expiration times from localStorage
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshExpiresAt");
    localStorage.removeItem("accessExpiresAt");
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    const accessExpiresAt = localStorage.getItem("accessExpiresAt");
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

    // Check if access token is expired
    if (accessExpiresAt && currentTime < parseInt(accessExpiresAt, 10)) {
      console.log("Access token is still valid.");
      return localStorage.getItem("accessToken"); // Return the valid access token
    }

    if (!refreshToken) {
      console.error("Refresh token is missing. User needs to log in again.");
      setIsLoggedIn(false);
      clearTokens();
      return null;
    }

    try {
      const response = await fetch("http://127.0.0.1:8080/accounts/api/token/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const { refresh, access, refresh_expires_in, access_expires_in } = data;

        console.log("Tokens refreshed successfully:", { refresh, access });

        // Update tokens and expiration times
        updateLoginState(true, refresh, access, refresh_expires_in, access_expires_in);

        return access; // Return the new access token
      } else {
        console.error("Failed to refresh tokens. Logging out.");
        setIsLoggedIn(false);
        clearTokens();
        return null;
      }
    } catch (error) {
      console.error("Error refreshing tokens:", error);
      setIsLoggedIn(false);
      clearTokens();
      return null;
    }
  };

  return (
    <LoginContext.Provider value={{ isLoggedIn, setIsLoggedIn: updateLoginState, refreshAccessToken }}>
      {children}
    </LoginContext.Provider>
  );
};

export const useLogin = () => useContext(LoginContext);