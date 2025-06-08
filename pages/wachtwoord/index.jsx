import React, { useState } from "react";
import Link from "next/link";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

const WachtwoordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://localhost:5001/api/v1/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Er is een email verzonden met instructies om je wachtwoord te resetten.");
      } else {
        setError(data.message || "Er is iets misgegaan. Probeer het later opnieuw.");
      }
    } catch (err) {
      setError("Er is iets misgegaan. Probeer het later opnieuw.");
    }
  };

  return (
    <div className="container">
      <div className="content">
        <h1>Wachtwoord Vergeten</h1>
        
        <form onSubmit={handleSubmit} className="reset-form">
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

          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}

          <button type="submit" className="reset-btn">
            Reset Wachtwoord
          </button>
        </form>

        <div className="links">
          <Link href="/login" className="backLink">
            Terug naar login
          </Link>
          <Link href="https://www.vkbmo.be/algemeen1.html" className="vkbmoLink">
            Contacteer VKBMO
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WachtwoordPage;
