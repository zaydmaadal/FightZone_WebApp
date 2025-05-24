import React, { useState, useEffect, useRef } from "react";
import QrScanner from "qr-scanner";
import {
  createUser,
  validateLicense,
  fetchCurrentUser,
  fetchClubById,
} from "../../../src/services/api";
import Link from "next/link";
import { ArrowLeftCircleIcon } from "@heroicons/react/24/solid";

const AddUserPage = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef(null);
  const [qrScanner, setQrScanner] = useState(null);
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
  const [trainerInfo, setTrainerInfo] = useState(null);
  const [clubInfo, setClubInfo] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    setHasMounted(true);
    setIsMobile(window.innerWidth <= 1024);

    const fetchTrainerData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("Geen token gevonden");
          return;
        }

        const userData = await fetchCurrentUser();
        setTrainerInfo(userData);

        // Fetch club data if trainer has a club ID
        if (userData?.club) {
          try {
            const clubData = await fetchClubById(userData.club);
            setClubInfo(clubData);
          } catch (error) {
            console.error("Error fetching club data:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching trainer data:", error);
      }
    };

    fetchTrainerData();

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (scanning && videoRef.current && hasMounted) {
      const loadWorker = async () => {
        try {
          await import("qr-scanner/qr-scanner-worker.min.js");

          // Get available cameras first
          const cameras = await QrScanner.listCameras();
          console.log("Available cameras:", cameras);

          const scanner = new QrScanner(
            videoRef.current,
            (result) => {
              console.log("Scanner result:", result);
              handleScan(result.data);
            },
            {
              preferredCamera: "environment",
              highlightScanRegion: true,
              highlightCodeOutline: true,
              maxScansPerSecond: 1,
              returnDetailedScanResult: true,
              preferredResolution: { width: 1280, height: 720 },
            }
          );

          await scanner.start();
          setQrScanner(scanner);
        } catch (error) {
          console.error("Scanner initialization error:", error);
          handleError(error);
          setScanning(false);
        }
      };

      loadWorker();

      return () => {
        if (qrScanner) {
          qrScanner.stop();
          qrScanner.destroy();
        }
      };
    }
  }, [scanning, hasMounted]);

  const handleScan = (text) => {
    console.log("Raw scanned data:", text);
    console.log("Scanned data (stringified):", JSON.stringify(text));

    if (text) {
      try {
        // Clean the scanned text
        const cleanedText = text.trim();
        console.log("Cleaned text:", cleanedText);

        // Ensure URL has proper protocol
        let finalUrl = cleanedText;
        if (
          !cleanedText.startsWith("http://") &&
          !cleanedText.startsWith("https://")
        ) {
          finalUrl = `https://${cleanedText}`;
        }

        // Basic URL validation
        const parsedUrl = new URL(finalUrl);

        // Only check if it's a vkbmolink.be URL
        if (!parsedUrl.hostname.includes("vkbmolink.be")) {
          throw new Error("Not a VKBMO URL");
        }

        // Ensure there's at least one query parameter
        if (parsedUrl.searchParams.size === 0) {
          throw new Error("No license key found in URL");
        }

        console.log("Final URL to process:", finalUrl);
        handleFetchLicense(finalUrl);
        setScanning(false);
        if (qrScanner) {
          qrScanner.stop();
        }
      } catch (e) {
        console.error("QR code processing error:", e);
        let errorMessage = "Ongeldig QR-code formaat";

        if (e.message === "Not a VKBMO URL") {
          errorMessage = "Geen geldige VKBMO licentie QR-code";
        } else if (e.message === "No license key found in URL") {
          errorMessage = "Geen licentie nummer gevonden in de URL";
        } else if (e.message.includes("Invalid URL")) {
          errorMessage = "Ongeldige URL in QR-code";
        }

        setScanResult({
          type: "error",
          message: `${errorMessage}\n\nTips:\n- Scan een geldige VKBMO licentie QR-code\n- Zorg dat de QR-code volledig zichtbaar is\n- Probeer het opnieuw of gebruik handmatige invoer`,
        });
      }
    }
  };

  const handleError = (error) => {
    console.error("QR Scanner Error:", error);
    let message =
      "Scannerfout - probeer opnieuw of gebruik handmatige invoer\n\nTips:\n- Zorg voor goede belichting\n- Houd de camera stil\n- Zorg dat de QR code volledig zichtbaar is\n- Houd de camera op 15-30cm afstand";

    if (error?.message?.includes("Permission denied")) {
      message =
        "Camera toegang geweigerd - sta camera toegang toe in je browser instellingen";
    } else if (
      error?.message?.includes("No camera found") ||
      error?.message?.includes("No cameras found")
    ) {
      message =
        "Geen camera gevonden - controleer of je camera correct is aangesloten";
    } else if (error?.message?.includes("Camera already in use")) {
      message =
        "Camera wordt al gebruikt door een andere applicatie - sluit andere apps die de camera gebruiken";
    }

    if (!scanResult || scanResult.type !== "success") {
      setScanResult({
        type: "error",
        message: message,
      });
    }
  };

  const renderScanner = () => {
    if (typeof window === "undefined" || !hasMounted) return null;

    return (
      <div className="qr-scanner-container">
        <video
          ref={videoRef}
          style={{
            width: "100%",
            maxHeight: "300px",
            backgroundColor: "#000",
          }}
        />
        <div className="scanner-overlay">
          <div className="scanner-guide">
            <p>Plaats de QR code binnen het kader</p>
            <p className="scanner-tip">
              Zorg voor goede belichting en houd de camera stil
            </p>
          </div>
        </div>
        <button
          className="cancel-scan-button"
          onClick={() => {
            if (qrScanner) {
              qrScanner.stop();
            }
            setScanning(false);
            setScanResult(null);
          }}
        >
          Annuleren
        </button>
      </div>
    );
  };

  // Rest of your existing handlers
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
      console.log("Validating URL:", url);

      // Just ensure the URL is properly encoded
      const encodedUrl = encodeURI(url);
      console.log("Encoded URL:", encodedUrl);

      const response = await validateLicense({ qrCodeUrl: encodedUrl });
      console.log("API Response:", response);

      if (response.valid && response.data) {
        // Check if the license club matches trainer's club
        if (
          clubInfo &&
          response.data.club &&
          clubInfo.naam.toLowerCase() !== response.data.club.toLowerCase()
        ) {
          setScanResult({
            type: "error",
            message: `Club mismatch!\n\nDe licentie is van club: ${response.data.club}\nU bent trainer van club: ${clubInfo.naam}\n\nU kunt alleen vechters van uw eigen club registreren.`,
          });
          return;
        }

        // Format dates
        const formatDate = (rawDate) => {
          if (!rawDate) return "";
          if (rawDate.includes("/")) {
            const [day, month, year] = rawDate.split("/");
            return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
          }
          return rawDate;
        };

        // Function to properly capitalize names
        const capitalizeName = (name) => {
          if (!name) return "";
          return name
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        };

        // Split full name into first and last name and capitalize properly
        const fullName = capitalizeName(response.data.naam || "");
        const [voornaam = "", ...achternaamParts] = fullName.split(" ");
        const achternaam = achternaamParts.join(" ");

        // Update form data with all available information
        setFormData((prev) => ({
          ...prev,
          voornaam,
          achternaam,
          geboortedatum: formatDate(response.data.geboortedatum),
          licentieNummer: response.data.licentieNummer || "",
          vervalDatum: formatDate(response.data.vervaldatum),
          vechterInfo: {
            ...prev.vechterInfo,
            club: capitalizeName(response.data.club || ""),
            geslacht: response.data.geslacht || "",
          },
        }));

        // Create a formatted message with all license information
        const licenseInfo = {
          Naam: fullName || "Niet beschikbaar",
          Licentienummer: response.data.licentieNummer || "Niet beschikbaar",
          Club: capitalizeName(response.data.club || "") || "Niet beschikbaar",
          Vervaldatum: response.data.vervaldatum || "Niet beschikbaar",
          Geboortedatum: response.data.geboortedatum || "Niet beschikbaar",
          Geslacht:
            response.data.geslacht === "M"
              ? "Man"
              : response.data.geslacht === "V"
              ? "Vrouw"
              : "Niet beschikbaar",
        };

        const formattedMessage = Object.entries(licenseInfo)
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n");

        setScanResult({
          type: "success",
          message: `Licentie gevonden!\n\n${formattedMessage}`,
        });
      } else {
        throw new Error(response.message || "Ongeldige licentie");
      }
    } catch (error) {
      console.error("License validation error:", error);
      console.error("Error details:", error.response?.data);

      let errorMessage = "Kon licentiegegevens niet ophalen";

      // Match backend error messages
      if (error.response?.data?.message) {
        if (error.response.data.message.includes("niet gevonden")) {
          errorMessage =
            "Licentie niet gevonden - controleer of de licentie nog geldig is";
        } else if (error.response.data.message.includes("ongeldig")) {
          errorMessage =
            "Ongeldige licentie - controleer of de QR-code correct is";
        } else {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setScanResult({
        type: "error",
        message: `${errorMessage}\n\nTips:\n- Controleer of de QR-code niet beschadigd is\n- Zorg dat de licentie nog geldig is\n- Probeer de QR-code opnieuw te scannen\n- Als het probleem aanhoudt, gebruik dan handmatige invoer`,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.licentieNummer) {
        alert("Scan eerst de licentie van de vechter");
        return;
      }

      if (!trainerInfo?.club) {
        alert("Geen club gevonden voor de trainer");
        return;
      }

      // Create user data with trainer's club ID
      const userData = {
        ...formData,
        role: "Vechter",
        club: trainerInfo.club, // Add trainer's club ID
        vechterInfo: {
          ...formData.vechterInfo,
          licentieNummer: formData.licentieNummer,
          vervalDatum: formData.vervalDatum,
          club: trainerInfo.club, // Also add club ID to vechterInfo
        },
      };

      console.log("Submitting user data:", userData);
      await createUser(userData);

      alert("Vechter succesvol geregistreerd!");
      resetForm();
    } catch (err) {
      console.error("Error creating user:", err);
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="add-user-page">
      <div className="page-header">
        <h1 className="page-title">Registreer nieuwe vechter</h1>
        <Link href="/ledenlijst" className="back-button">
          <ArrowLeftCircleIcon
            className="arrow-left-circle"
            width={24}
            height={24}
          />
          Terug
        </Link>
      </div>

      <form className="add-user-form" onSubmit={handleSubmit}>
        {/* Profile upload section */}
        <div className="profile-upload-section">
          <div
            className="profile-upload-circle"
            onClick={() => document.getElementById("profile-upload").click()}
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profielfoto"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <svg
                className="profile-upload-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
          </div>
          <span className="profile-upload-text">Upload Profielfoto</span>
        </div>

        {hasMounted && (
          <div className="scan-section-container">
            <div className="scan-section">
              {!scanning ? (
                <button
                  className="scan-button"
                  onClick={() => setScanning(true)}
                >
                  Scan Licentie QR Code
                </button>
              ) : (
                renderScanner()
              )}
              <p className="scan-instruction">
                Richt de camera op de VKBMO licentie QR code
              </p>
            </div>
          </div>
        )}

        {scanResult && (
          <div className="scan-result-container">
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
          </div>
        )}

        <div className="form-section">
          <h3>Persoonlijke gegevens</h3>

          <div className="name-fields">
            <div className="form-group">
              <label htmlFor="voornaam">Voornaam*</label>
              <input
                type="text"
                name="voornaam"
                placeholder="Vul voornaam in"
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
                placeholder="Vul achternaam in"
                value={formData.achternaam}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="email-password-fields">
            <div className="form-group">
              <label htmlFor="email">Email*</label>
              <input
                type="email"
                name="email"
                placeholder="Vul email adres in"
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
                placeholder="Kies een wachtwoord"
                value={formData.wachtwoord}
                onChange={handleChange}
                required
              />
            </div>
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
                placeholder="Scan de licentie QR-code"
              />
            </div>

            <div className="form-group">
              <label htmlFor="vervalDatum">Vervaldatum*</label>
              <input
                type="date"
                name="vervalDatum"
                value={formData.vervalDatum || ""}
                readOnly
                className="readonly-field"
                placeholder="Wordt ingevuld na scannen"
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
                placeholder="Vul gewicht in"
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
                placeholder="Vul lengte in"
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
                <option value="A Klasse">A Klasse</option>
                <option value="B Klasse">B Klasse</option>
                <option value="C Klasse">C Klasse</option>
                <option value="Nieuweling">Nieuweling</option>
                <option value="Jeugd">Jeugd</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            Voeg toe
          </button>
        </div>
      </form>

      <style jsx>{`
        .add-user-form {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .profile-upload-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
        }

        .scan-section-container {
          display: flex;
          justify-content: center;
          margin: 2rem 0;
        }

        .scan-section {
          width: 100%;
          max-width: 500px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .scan-button {
          background-color: #3483fe;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
          width: 100%;
          max-width: 300px;
        }

        .scan-button:hover {
          background-color: #1a5dc2;
        }

        .scan-instruction {
          text-align: center;
          color: #6b7280;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        .scan-result-container {
          display: flex;
          justify-content: center;
          margin: 2rem 0;
        }

        .scan-result {
          width: 100%;
          max-width: 500px;
          padding: 1.5rem;
          border-radius: 0.5rem;
          background-color: #f3f4f6;
          border: 1px solid #e5e7eb;
        }

        .scan-result.success {
          background-color: #ecfdf5;
          border-color: #a7f3d0;
        }

        .scan-result.error {
          background-color: #fef2f2;
          border-color: #fecaca;
        }

        .result-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .result-message {
          white-space: pre-wrap;
          font-family: monospace;
          font-size: 0.875rem;
          line-height: 1.5;
          margin: 0;
        }

        .next-step {
          margin-top: 1rem;
          color: #059669;
          font-weight: 500;
        }

        .qr-scanner-container {
          width: 100%;
          max-width: 500px;
          position: relative;
          margin: 0 auto;
        }

        .scanner-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(0, 0, 0, 0.5);
        }

        .scanner-guide {
          text-align: center;
          color: white;
          padding: 1rem;
        }

        .scanner-tip {
          font-size: 0.875rem;
          margin-top: 0.5rem;
          opacity: 0.8;
        }

        .cancel-scan-button {
          width: 100%;
          padding: 0.75rem;
          margin-top: 1rem;
          background-color: #ef4444;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .cancel-scan-button:hover {
          background-color: #dc2626;
        }

        .form-section {
          margin-top: 2rem;
          padding: 1.5rem;
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .form-section h3 {
          margin-bottom: 1.5rem;
          color: #111827;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .form-actions {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
        }

        .submit-button {
          background-color: #3483fe;
          color: white;
          padding: 0.75rem 2rem;
          border-radius: 0.5rem;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
          min-width: 200px;
        }

        .submit-button:hover {
          background-color: ##1a5dc2;
        }

        @media (max-width: 640px) {
          .add-user-form {
            padding: 1rem;
          }

          .scan-section {
            max-width: 100%;
          }

          .qr-scanner-container {
            max-width: 100%;
          }

          .scan-result {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export const getInitialProps = async () => {
  return { props: {} };
};

AddUserPage.getInitialProps = getInitialProps;

export default AddUserPage;
