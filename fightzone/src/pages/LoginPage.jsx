import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";
import "../assets/styles/pages/LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser({
        email: email,
        wachtwoord: password,
      });

      console.log("Login response:", response); // Debugging

      const { token, role } = response;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      window.location.reload();

      // Aangepaste redirect-logica
      switch (role) {
        case "Vechter":
          navigate("/");
          break;
        case "Trainer":
          navigate("/members");
          break;
        case "VKBMO-lid":
          navigate("/clubs");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      setError("Ongeldige inloggegevens. Probeer het opnieuw.");
    }
  };

  return (
    <div className="login-page">
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Wachtwoord</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Inloggen</button>
      </form>
    </div>
  );
};

export default LoginPage;
