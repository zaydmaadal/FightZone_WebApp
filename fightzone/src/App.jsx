import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
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
import { getCurrentUser } from "./services/auth";
import "./App.css";

const App = () => {
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const checkUser = () => setUser(getCurrentUser());
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  return (
    <Router>
      <div className="app-container">
        {user ? (
          <div className="flex h-screen">
            <Sidebar />
            <div className="content">
              <Routes>
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
                    user?.role === "Trainer" ? (
                      <MembersPage />
                    ) : (
                      <Navigate to="/" />
                    )
                  }
                />
                <Route
                  path="/prestaties"
                  element={
                    user?.role === "Vechter" ? (
                      <PrestatiePage />
                    ) : (
                      <Navigate to="/" />
                    )
                  }
                />
                <Route
                  path="/clubs"
                  element={
                    user?.role === "VKBMO-lid" ? (
                      <ClubsPage />
                    ) : (
                      <Navigate to="/" />
                    )
                  }
                />
              </Routes>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
};

export default App;
