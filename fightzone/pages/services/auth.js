"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchUserById } from "./api";
import axios from "axios";

const API = axios.create({
  baseURL: "https://fightzone-api.onrender.com/api/v1",
});

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize user on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        fetchUserById(decodedToken.id)
          .then((userData) => {
            setUser({ ...userData, token, role: decodedToken.role });
            setLoading(false);
          })
          .catch(() => {
            console.error("Token parsing error:", error);
            logout();
          });
      } catch (error) {
        console.error("Token parsing error:", error);
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await API.post("/auth/login", credentials);
      const { token } = response.data;
      localStorage.setItem("token", token);
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setUser({ token, role: decodedToken.role });
      return response.data;
    } catch (error) {
      throw new Error("Login failed. Please check your credentials.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  const getCurrentUser = () => {
    if (!user) return null;
    return {
      token: user.token,
      role: user.role,
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        getCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
