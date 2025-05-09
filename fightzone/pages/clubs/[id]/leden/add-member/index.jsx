"use client";
import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

const AddMemberPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [formData, setFormData] = useState({
    voornaam: "",
    achternaam: "",
    email: "",
    wachtwoord: "",
    geboortedatum: "",
    role: "Vechter",
    licentieNummer: "",
    vervalDatum: "",
    clubNaam: "",
    vechterInfo: {
      gewicht: "",
      lengte: "",
      klasse: "",
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("vechterInfo.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        vechterInfo: {
          ...prev.vechterInfo,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement the API call to add the member
    console.log("Form submitted:", formData);
  };

  return (
    <div className="add-member-page">
      <h1>Nieuw Lid Toevoegen</h1>

      <div className="qr-section">
        <h2>Stap 1: Scan QR Code</h2>
        <div className="qr-placeholder">
          <p>QR Scanner komt hier</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="member-form">
        <h2>Stap 2: Vul de gegevens in</h2>

        <div className="form-section">
          <h3>Basis Informatie</h3>
          <div className="form-group">
            <label>Voornaam</label>
            <input
              type="text"
              name="voornaam"
              value={formData.voornaam}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Achternaam</label>
            <input
              type="text"
              name="achternaam"
              value={formData.achternaam}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Wachtwoord</label>
            <input
              type="password"
              name="wachtwoord"
              value={formData.wachtwoord}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Geboortedatum</label>
            <input
              type="date"
              name="geboortedatum"
              value={formData.geboortedatum}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Rol</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="Vechter">Vechter</option>
              <option value="Trainer">Trainer</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Licentie Informatie</h3>
          <div className="form-group">
            <label>Licentie Nummer</label>
            <input
              type="text"
              name="licentieNummer"
              value={formData.licentieNummer}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Verval Datum</label>
            <input
              type="date"
              name="vervalDatum"
              value={formData.vervalDatum}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Vechter Informatie</h3>
          <div className="form-group">
            <label>Gewicht (kg)</label>
            <input
              type="number"
              name="vechterInfo.gewicht"
              value={formData.vechterInfo.gewicht}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Lengte (cm)</label>
            <input
              type="number"
              name="vechterInfo.lengte"
              value={formData.vechterInfo.lengte}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Klasse</label>
            <input
              type="text"
              name="vechterInfo.klasse"
              value={formData.vechterInfo.klasse}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="button-container">
          <Link href={`/clubs/${id}/leden`} className="back-button">
            Terug
          </Link>
          <button type="submit" className="submit-button">
            Lid Toevoegen
          </button>
        </div>
      </form>

      <style jsx>{`
        .add-member-page {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }

        h1 {
          font-size: 2rem;
          margin-bottom: 30px;
          color: #333;
        }

        h2 {
          font-size: 1.5rem;
          margin: 20px 0;
          color: #444;
        }

        h3 {
          font-size: 1.2rem;
          margin: 15px 0;
          color: #555;
        }

        .qr-section {
          margin-bottom: 30px;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }

        .qr-placeholder {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #e9ecef;
          border-radius: 4px;
          margin-top: 10px;
        }

        .form-section {
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        label {
          display: block;
          margin-bottom: 5px;
          color: #555;
          font-weight: 500;
        }

        input,
        select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        input:focus,
        select:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .button-container {
          display: flex;
          justify-content: space-between;
          margin-top: 30px;
        }

        .back-button {
          padding: 10px 20px;
          background-color: #6c757d;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-size: 1rem;
        }

        .back-button:hover {
          background-color: #5a6268;
        }

        .submit-button {
          padding: 10px 20px;
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
        }

        .submit-button:hover {
          background-color: #218838;
        }
      `}</style>
    </div>
  );
};

export default AddMemberPage;
