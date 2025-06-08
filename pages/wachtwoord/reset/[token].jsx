import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { LockClosedIcon } from "@heroicons/react/24/outline";

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { token } = router.query;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }

    try {
      const response = await fetch(`https://fightzone-api.onrender.com/api/v1/auth/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          token: token,
          newPassword: newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Je wachtwoord is succesvol gewijzigd. Je wordt doorgestuurd naar de login pagina...");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(data.message || "Er is iets misgegaan. Probeer het later opnieuw.");
      }
    } catch (err) {
      setError("Er is iets misgegaan. Probeer het later opnieuw.");
    }
  };

  if (!token) {
    return (
      <div className="container">
        <div className="content">
          <h1>Ongeldige Link</h1>
          <p>Deze wachtwoord reset link is ongeldig of verlopen.</p>
          <Link href="/wachtwoord" className="backLink">
            Terug naar wachtwoord vergeten
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="content">
        <h1>Nieuw Wachtwoord Instellen</h1>

        <form onSubmit={handleSubmit} className="reset-form">
          <div className="form-group">
            <label className="input-label">Nieuw Wachtwoord</label>
            <div className="input-container">
              <LockClosedIcon className="input-icon" />
              <input
                type="password"
                value={newPassword}
                placeholder="Vul je nieuwe wachtwoord in"
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength="8"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Bevestig Wachtwoord</label>
            <div className="input-container">
              <LockClosedIcon className="input-icon" />
              <input
                type="password"
                value={confirmPassword}
                placeholder="Bevestig je nieuwe wachtwoord"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength="8"
              />
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}

          <button type="submit" className="reset-btn">
            Wachtwoord Wijzigen
          </button>
        </form>

        <div className="links">
          <Link href="/login" className="backLink">
            Terug naar login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 