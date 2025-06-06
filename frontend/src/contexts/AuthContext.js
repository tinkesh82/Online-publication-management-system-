import React, { createContext, useState, useEffect, useCallback } from "react";
import authService from "../api/authService";
import LoadingSpinner from "../components/LoadingSpinner"; // Optional: for initial load

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true); // For initial check

  const initializeAuth = useCallback(async () => {
    if (token) {
      try {
        const currentUser = await authService.getCurrentUser(); // Fetches /me and updates localStorage
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        authService.logout(); // Clear invalid token/user
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser({
      _id: data._id,
      username: data.username,
      email: data.email,
      role: data.role,
    });
    setToken(data.token);
    return data; // Return full response for potential messages
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser({
      _id: data._id,
      username: data.username,
      email: data.email,
      role: data.role,
    });
    setToken(data.token);
    return data; // Return full response
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  if (loading) {
    return <LoadingSpinner />; // Or any other loading indicator
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        loading,
        initializeAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
