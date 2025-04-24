import React, { useState } from "react";
import { createUser } from "../services/api";
import "../assets/styles/pages/AddUserPage.css";

const AddUserPage = () => {
  const [formData, setFormData] = useState({
    naam: "",
    email: "",
    wachtwoord: "",
    geboortedatum: "",
    role: "Vechter", // Standaardrol
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUser(formData);
      alert("Gebruiker succesvol toegevoegd!");
      setFormData({
        naam: "",
        email: "",
        wachtwoord: "",
        geboortedatum: "",
        role: "Vechter",
      });
    } catch (err) {
      console.error(err);
      alert("Fout bij het toevoegen van gebruiker.");
    }
  };

  return (
    <div className="add-user-page">
      <h1 className="text-2xl font-bold mb-4">Voeg een nieuw lid toe</h1>
      <form className="add-user-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="naam">Naam</label>
          <input
            type="text"
            name="naam"
            id="naam"
            value={formData.naam}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="wachtwoord">Wachtwoord</label>
          <input
            type="password"
            name="wachtwoord"
            id="wachtwoord"
            value={formData.wachtwoord}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="geboortedatum">Geboortedatum</label>
          <input
            type="date"
            name="geboortedatum"
            id="geboortedatum"
            value={formData.geboortedatum}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Rol</label>
          <select
            name="role"
            id="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="Vechter">Vechter</option>
            <option value="Trainer">Trainer</option>
            <option value="VKBMO-lid">VKBMO-lid</option>
          </select>
        </div>
        <button type="submit" className="add-user-button">
          Toevoegen
        </button>
      </form>
    </div>
  );
};

export default AddUserPage;
