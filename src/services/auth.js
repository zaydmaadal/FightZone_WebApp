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
            // Create a default user structure if profile is missing
            const userWithDefaults = {
              ...userData,
              token,
              role: decodedToken.role,
              profile: userData.profile || {
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                phone: userData.phone || '',
                club: userData.club || '',
                licenseNumber: userData.licenseNumber || '',
                role: decodedToken.role
              }
            };
            setUser(userWithDefaults);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching user:", error);
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
      
      // Create a default user structure
      const defaultUser = {
        token,
        role: decodedToken.role,
        profile: {
          firstName: '',
          lastName: '',
          email: credentials.email,
          phone: '',
          club: '',
          licenseNumber: '',
          role: decodedToken.role
        }
      };
      
      setUser(defaultUser);
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
      profile: user.profile
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
