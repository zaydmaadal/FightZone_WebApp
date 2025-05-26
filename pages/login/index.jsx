import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../src/services/auth";
import Link from "next/link";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";

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
      {/* Header image */}
      <div className="login-header-image"></div>

      <div className="login-content">
        <h1>Login</h1>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="input-label">Email</label>
            <div className="input-container">
              <EnvelopeIcon className="input-icon" />
              <input
                type="email"
                value={email}
                placeholder="Vul je email in"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Wachtwoord</label>
            <div className="input-container">
              <LockClosedIcon className="input-icon" />
              <input
                type="password"
                value={password}
                placeholder="Vul je wachtwoord in"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Link href="/wachtwoord" className="forgot-password">
              Wachtwoord Wijzigen
            </Link>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="bottom-section">
            <button type="submit" className="login-btn">
              Login
            </button>

            <p className="support-text">
              Contacteer{" "}
              <Link
                href="https://www.vkbmo.be/algemeen1.html"
                className="vkbmo-link"
              >
                VKBMO
              </Link>{" "}
              voor accountondersteuning.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
