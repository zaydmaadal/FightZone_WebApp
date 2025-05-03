// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../services/auth";
import "../../styles/LoginPage.css"
// import { useNavigate } from "react-router-dom";
// import "../assets/styles/pages/LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login({
        email: email,
        wachtwoord: password,
      });

      // The login function will handle the token storage and user state
      // We can just redirect based on the role
      const role = localStorage.getItem("role");
      switch (role) {
        case "Vechter":
          router.push("/");
          break;
        case "Trainer":
          router.push("/members");
          break;
        case "VKBMO-lid":
          router.push("/clubs");
          break;
        default:
          router.push("/");
      }
    } catch (err) {
      setError("Ongeldige inloggegevens. Probeer het opnieuw.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Inloggen</h1>
        <p className="subtext">Beheer je club, vechters en wedstrijden op één plek</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Emailadres</label>
            <input
              type="email"
              value={email}
              placeholder="voorbeeld@mail.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Wachtwoord</label>
            <input
              type="password"
              value={password}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-btn">
            Inloggen
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
