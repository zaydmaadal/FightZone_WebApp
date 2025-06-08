import React, { useState, useEffect, useRef } from "react";
import QrScanner from "qr-scanner";
import {
  createUser,
  validateLicense,
  fetchCurrentUser,
  fetchClubById,
} from "../../../../../src/services/api";
import Link from "next/link";
import { useRouter } from "next/router";

const AddUserPage = () => {
  const router = useRouter();
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

      // Get club ID from URL
      const clubId = router.query.id;

      // Create user data with club ID from URL
      const userData = {
        ...formData,
        role: "Vechter",
        club: clubId, // Use club ID from URL
        vechterInfo: {
          ...formData.vechterInfo,
          licentieNummer: formData.licentieNummer,
          vervalDatum: formData.vervalDatum,
          club: clubId, // Also add club ID to vechterInfo
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
        <Link href={`/clubs/${router.query.id}/leden`} className="back-button">
          <svg
            className="arrow-left-circle"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            width="24"
            height="24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
            />
          </svg>
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

        {/* URL input section temporarily disabled
        {hasMounted && !isMobile && (
          <div className="url-input-section">
            <input
              type="text"
              placeholder="Plak VKBMO licentie URL hier..."
              value={vkbmoUrl}
              onChange={(e) => setVkbmoUrl(e.target.value)}
              className="url-input"
            />
            <button
              type="button"
              onClick={() => handleFetchLicense(vkbmoUrl)}
              className="fetch-button"
            >
              Valideer licentie
            </button>
          </div>
        )}
        */}

        {hasMounted && (
          <div className="scan-section">
            {!scanning ? (
              <button className="scan-button" onClick={() => setScanning(true)}>
                Scan Licentie QR Code
              </button>
            ) : (
              renderScanner()
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
    </div>
  );
};

export const getInitialProps = async () => {
  return { props: {} };
};

AddUserPage.getInitialProps = getInitialProps;

export default AddUserPage;
