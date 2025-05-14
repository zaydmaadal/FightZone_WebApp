import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { isMobile } from "react-device-detect";
import { createUser, validateLicense } from "../../../../services/api";
import "../../../../../styles/AddUserPage.css";

const AddUserPage = () => {
  const [formData, setFormData] = useState({
    voornaam: "",
    achternaam: "",
    email: "",
    wachtwoord: "",
    geboortedatum: "",
    licentieNummer: "",
    vervalDatum: "",
    vechterInfo: {
      gewicht: "",
      lengte: "",
      klasse: "",
      bijnaam: "",
    },
  });

  const [scanning, setScanning] = useState(false);
  const [vkbmoUrl, setVkbmoUrl] = useState("");
  const [scanResult, setScanResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes("vechterInfo.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        vechterInfo: {
          ...prev.vechterInfo,
          [field]: value,
        },
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFetchLicense = async (url) => {
    try {
      if (!url.includes("vkbmolink.be/qr_lid.php")) {
        throw new Error("Ongeldige VKBMO URL");
      }

      const response = await validateLicense({ qrCodeUrl: url });

      if (response.valid) {
        setFormData((prev) => ({
          ...prev,
          licentieNummer: response.data.licentieNummer,
          vervalDatum: response.data.vervalDatum,
        }));

        setScanResult({
          type: "success",
          message: `Licentie gevonden!\nNummer: ${
            response.data.licentieNummer
          }\nVervaldatum: ${new Date(
            response.data.vervalDatum
          ).toLocaleDateString()}`,
        });
      }
    } catch (error) {
      console.error("Fout bij ophalen licentie:", error);
      setScanResult({
        type: "error",
        message: error.message || "Licentie validatie mislukt",
      });
    }
  };

  const handleScan = async (result) => {
    if (result) {
      await handleFetchLicense(result);
      setScanning(false);
    }
  };

  const handleScanError = (error) => {
    console.error("QR scan error:", error);
    setScanResult({
      type: "error",
      message: "Fout bij scannen QR-code",
    });
    setScanning(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.licentieNummer) {
        alert("Scan eerst de licentie van de vechter");
        return;
      }

      // Verstuur data in het juiste formaat
      await createUser({
        ...formData,
        role: "Vechter",
        vechterInfo: {
          ...formData.vechterInfo,
          licentieNummer: formData.licentieNummer,
          vervalDatum: formData.vervalDatum,
        },
      });

      alert("Vechter succesvol geregistreerd!");
      resetForm();
    } catch (err) {
      alert(
        "Fout bij registreren: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const resetForm = () => {
    setFormData({
      voornaam: "",
      achternaam: "",
      email: "",
      wachtwoord: "",
      geboortedatum: "",
      licentieNummer: "",
      vervalDatum: "",
      vechterInfo: {
        gewicht: "",
        lengte: "",
        klasse: "",
        bijnaam: "",
      },
    });
    setScanResult(null);
    setVkbmoUrl("");
  };

  return (
    <div className="add-user-page">
      <h1 className="page-title">Registreer nieuwe vechter</h1>

      {!isMobile && (
        <div className="url-input-section">
          <input
            type="text"
            placeholder="Plak VKBMO licentie URL hier..."
            value={vkbmoUrl}
            onChange={(e) => setVkbmoUrl(e.target.value)}
            className="url-input"
          />
          <button
            onClick={() => handleFetchLicense(vkbmoUrl)}
            className="fetch-button"
          >
            Valideer licentie
          </button>
        </div>
      )}

      {isMobile && (
        <div className="mobile-scan-section">
          {!scanning ? (
            <button className="scan-button" onClick={() => setScanning(true)}>
              Scan Licentie QR Code
            </button>
          ) : (
            <div className="qr-scanner-container">
              <Scanner
                onDecode={handleScan}
                onError={handleScanError}
                constraints={{ facingMode: "environment" }}
              />
              <button
                className="cancel-scan-button"
                onClick={() => setScanning(false)}
              >
                Annuleren
              </button>
            </div>
          )}
          <p className="scan-instruction">
            Richt de camera op de VKBMO licentie QR code
          </p>
        </div>
      )}

      {scanResult && (
        <div className={`scan-result ${scanResult.type}`}>
          <div className="result-header">
            {scanResult.type === "success" ? "✅" : "❌"}
            <h4>
              {scanResult.type === "success" ? "Geldige licentie" : "Fout"}
            </h4>
          </div>
          <pre className="result-message">{scanResult.message}</pre>
          {scanResult.type === "success" && (
            <p className="next-step">
              Vul nu de resterende gegevens handmatig in
            </p>
          )}
        </div>
      )}

      <form className="add-user-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Persoonlijke gegevens</h3>

          <div className="name-fields">
            <div className="form-group">
              <label htmlFor="voornaam">Voornaam*</label>
              <input
                type="text"
                name="voornaam"
                value={formData.voornaam}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="achternaam">Achternaam*</label>
              <input
                type="text"
                name="achternaam"
                value={formData.achternaam}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="wachtwoord">Wachtwoord*</label>
            <input
              type="password"
              name="wachtwoord"
              value={formData.wachtwoord}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="geboortedatum">Geboortedatum*</label>
            <input
              type="date"
              name="geboortedatum"
              value={formData.geboortedatum}
              onChange={handleChange}
              required
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Licentiegegevens</h3>

          <div className="license-fields">
            <div className="form-group">
              <label htmlFor="licentieNummer">Licentienummer*</label>
              <input
                type="text"
                name="licentieNummer"
                value={formData.licentieNummer}
                readOnly
                className="readonly-field"
              />
            </div>

            <div className="form-group">
              <label htmlFor="vervalDatum">Vervaldatum*</label>
              <input
                type="date"
                name="vervalDatum"
                value={formData.vervalDatum}
                readOnly
                className="readonly-field"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Vechter informatie</h3>

          <div className="vechter-grid">
            <div className="form-group">
              <label htmlFor="vechterInfo.gewicht">Gewicht (kg)*</label>
              <input
                type="number"
                name="vechterInfo.gewicht"
                value={formData.vechterInfo.gewicht}
                onChange={handleChange}
                min="40"
                max="150"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="vechterInfo.lengte">Lengte (cm)*</label>
              <input
                type="number"
                name="vechterInfo.lengte"
                value={formData.vechterInfo.lengte}
                onChange={handleChange}
                min="140"
                max="220"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="vechterInfo.klasse">Klasse*</label>
              <select
                name="vechterInfo.klasse"
                value={formData.vechterInfo.klasse}
                onChange={handleChange}
                required
              >
                <option value="">Selecteer klasse</option>
                <option value="A">A Klasse</option>
                <option value="B">B Klasse</option>
                <option value="C">C Klasse</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="vechterInfo.bijnaam">Bijnaam</label>
              <input
                type="text"
                name="vechterInfo.bijnaam"
                value={formData.vechterInfo.bijnaam}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            Vechter registreren
          </button>
          <button type="button" className="reset-button" onClick={resetForm}>
            Formulier leegmaken
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUserPage;
