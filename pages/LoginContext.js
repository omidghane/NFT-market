import { createContext, useState, useContext, useEffect } from "react";

const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check token expiration on app initialization
    useEffect(() => {
        const refreshExpiresAt = localStorage.getItem("refreshExpiresAt");
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

        if (refreshExpiresAt && currentTime < parseInt(refreshExpiresAt, 10)) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
            localStorage.removeItem("refreshExpiresAt"); // Clear expired token
        }
    }, []);

    // Update login state and store expiration times
    const updateLoginState = (state, refreshExpiresIn) => {
        setIsLoggedIn(state);

        if (state) {
            const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
            const refreshExpiresAt = currentTime + refreshExpiresIn; // Calculate refresh expiration time
            localStorage.setItem("refreshExpiresAt", refreshExpiresAt);
        } else {
            localStorage.removeItem("refreshExpiresAt"); // Clear expiration time on logout
        }
    };

    return (
        <LoginContext.Provider value={{ isLoggedIn, setIsLoggedIn: updateLoginState }}>
            {children}
        </LoginContext.Provider>
    );
};

export const useLogin = () => useContext(LoginContext);