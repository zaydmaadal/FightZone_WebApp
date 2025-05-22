"use client";

import React, { useState, useEffect } from "react";
import { fetchCurrentUser } from "../../src/services/api";

const PrestatiePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCurrentUser();
        setUserData(data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Er is een fout opgetreden bij het ophalen van de gegevens");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="prestatie-page">
        <div className="loading">Laden...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="prestatie-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  // Mock data for demonstration
  const prestatieData = {
    totaalWedstrijden: 15,
    gewonnen: 10,
    verloren: 5,
    knockouts: 3,
    puntenVoor: 450,
    puntenTegen: 320,
    gemiddeldePuntenPerWedstrijd: 30,
    laatsteWedstrijd: "2024-03-15",
    bestePrestatie: "Eerste plaats - Regionaal Kampioenschap 2024",
  };

  return (
    <div className="prestatie-page">
      <div className="page-header">
        <h1>Prestatie Overzicht</h1>
        {userData && (
          <div className="user-info">
            <h2>
              {userData.voornaam} {userData.achternaam}
            </h2>
            <p className="user-details">
              {userData.vechterInfo?.klasse || "Geen klasse"} | Gewicht:{" "}
              {userData.vechterInfo?.gewicht || "N/A"} kg
            </p>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Totaal Wedstrijden</h3>
          <div className="stat-value">{prestatieData.totaalWedstrijden}</div>
        </div>
        <div className="stat-card">
          <h3>Gewonnen</h3>
          <div className="stat-value win">{prestatieData.gewonnen}</div>
        </div>
        <div className="stat-card">
          <h3>Verloren</h3>
          <div className="stat-value loss">{prestatieData.verloren}</div>
        </div>
        <div className="stat-card">
          <h3>Knockouts</h3>
          <div className="stat-value">{prestatieData.knockouts}</div>
        </div>
      </div>

      <div className="detailed-stats">
        <div className="stat-section">
          <h3>Punten Overzicht</h3>
          <div className="points-grid">
            <div className="points-card">
              <h4>Punten Voor</h4>
              <div className="points-value">{prestatieData.puntenVoor}</div>
            </div>
            <div className="points-card">
              <h4>Punten Tegen</h4>
              <div className="points-value">{prestatieData.puntenTegen}</div>
            </div>
            <div className="points-card">
              <h4>Gemiddeld per Wedstrijd</h4>
              <div className="points-value">
                {prestatieData.gemiddeldePuntenPerWedstrijd}
              </div>
            </div>
          </div>
        </div>

        <div className="stat-section">
          <h3>Recente Prestaties</h3>
          <div className="recent-performance">
            <p>
              <strong>Laatste Wedstrijd:</strong>{" "}
              {new Date(prestatieData.laatsteWedstrijd).toLocaleDateString(
                "nl-NL"
              )}
            </p>
            <p>
              <strong>Beste Prestatie:</strong> {prestatieData.bestePrestatie}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrestatiePage;
