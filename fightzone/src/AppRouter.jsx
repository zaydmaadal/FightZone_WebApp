// src/AppRouter.jsx
import React, { useContext, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import {
  TrainerDashboard,
  VechterDashboard,
  VkbmoDashboard,
} from "./pages/Dashboard";
import MembersPage from "./pages/MembersPage";
import PrestatiePage from "./pages/PrestatiePage";
import ClubsPage from "./pages/ClubsPage";
import LoginPage from "./pages/LoginPage";
import { AuthContext } from "./context/AuthContext";
import "./App.css";

const AppRouter = () => {
  const { user, setUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Initialiseer gebruiker bij mount
  useEffect(() => {
    const checkUser = () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      if (token && role) setUser({ token, role });
    };

    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, [setUser]);

  if (loading) {
    return <div>Loading...</div>; // Of een loading spinner
  }

  return (
    <div className="app-container">
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {user ? (
          <Route
            element={
              <div className="flex h-screen">
                <Sidebar />
                <div className="content">
                  <Routes>
                    <Route path="/" element={<VechterDashboard />} />
                    <Route path="/members" element={<MembersPage />} />
                    <Route path="/prestaties" element={<PrestatiePage />} />
                    <Route path="/clubs" element={<ClubsPage />} />
                  </Routes>
                </div>
              </div>
            }
          >
            <Route
              path="/"
              element={
                user.role === "Vechter" ? (
                  <VechterDashboard />
                ) : user.role === "Trainer" ? (
                  <TrainerDashboard />
                ) : (
                  <VkbmoDashboard />
                )
              }
            />
            <Route
              path="/members"
              element={
                user.role === "Trainer" ? <MembersPage /> : <Navigate to="/" />
              }
            />
            <Route
              path="/prestaties"
              element={
                user.role === "Vechter" ? (
                  <PrestatiePage />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/clubs"
              element={
                user.role === "VKBMO-lid" ? <ClubsPage /> : <Navigate to="/" />
              }
            />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </div>
  );
};

export default AppRouter;
