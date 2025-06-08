"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  fetchUsers,
  fetchClubById,
  deleteUserById,
} from "../../../../src/services/api";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  ArrowLeftCircleIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import * as XLSX from "xlsx";
import { useAuth } from "../../../../src/services/auth";

// Helper function to calculate age
const calculateAge = (birthDate) => {
  if (!birthDate) return "Onbekend";

  const birth = new Date(birthDate);
  const today = new Date();

  // Check if date is valid
  if (isNaN(birth.getTime())) return "Onbekend";

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  // Adjust age if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return `${age}J`;
};

// Helper function to check insurance status
const checkInsuranceStatus = (vechterInfo) => {
  // If using old system (no vervalDatum), always return "Niet in orde"
  if (!vechterInfo?.vervalDatum) {
    return { text: "Niet in orde", type: "error" };
  }

  const today = new Date();
  const expiryDate = new Date(vechterInfo.vervalDatum);

  // Check if date is valid
  if (isNaN(expiryDate.getTime())) {
    return { text: "Niet in orde", type: "error" };
  }

  // Calculate days until expiry
  const daysUntilExpiry = Math.ceil(
    (expiryDate - today) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry < 0) {
    return { text: "Niet in orde", type: "error" };
  } else if (daysUntilExpiry <= 60) {
    // Within 2 months
    return { text: `Verloopt over ${daysUntilExpiry} dagen`, type: "warning" };
  } else {
    return { text: "In Orde", type: "ok" };
  }
};

// Add DoubleRangeSlider component
const DoubleRangeSlider = ({
  min,
  max,
  step = 1,
  values,
  onChange,
  unit = "",
}) => {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const minBubbleRef = useRef(null);
  const maxBubbleRef = useRef(null);

  useEffect(() => {
    updateRangeTrack();
  }, [values]);

  const updateRangeTrack = () => {
    if (!containerRef.current || !trackRef.current) return;

    const minPercent = ((values.min - min) / (max - min)) * 100;
    const maxPercent = ((values.max - min) / (max - min)) * 100;

    trackRef.current.style.left = `${minPercent}%`;
    trackRef.current.style.width = `${maxPercent - minPercent}%`;

    if (minBubbleRef.current) {
      minBubbleRef.current.style.left = `${minPercent}%`;
      minBubbleRef.current.textContent = `${values.min}${unit}`;
    }

    if (maxBubbleRef.current) {
      maxBubbleRef.current.style.left = `${maxPercent}%`;
      maxBubbleRef.current.textContent = `${values.max}${unit}`;
    }
  };

  const handleMinChange = (e) => {
    const newMin = parseInt(e.target.value);
    if (newMin <= values.max) {
      onChange({ min: newMin, max: values.max });
    }
  };

  const handleMaxChange = (e) => {
    const newMax = parseInt(e.target.value);
    if (newMax >= values.min) {
      onChange({ min: values.min, max: newMax });
    }
  };

  return (
    <div className="double-range-container">
      <div className="double-range-slider" ref={containerRef}>
        <div className="slider-background"></div>
        <span className="range-track" ref={trackRef}></span>
        <input
          type="range"
          className="min-range"
          min={min}
          max={max}
          step={step}
          value={values.min}
          onChange={handleMinChange}
        />
        <input
          type="range"
          className="max-range"
          min={min}
          max={max}
          step={step}
          value={values.max}
          onChange={handleMaxChange}
        />
        <div className="min-value-bubble" ref={minBubbleRef}></div>
        <div className="max-value-bubble" ref={maxBubbleRef}></div>
      </div>
    </div>
  );
};

const ClubMembersPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [club, setClub] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [openFilter, setOpenFilter] = useState(null);
  const [sliderValues, setSliderValues] = useState({
    leeftijd: { min: 1, max: 60 },
    gewicht: { min: 20, max: 120 },
  });
  const [selectedFighters, setSelectedFighters] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Add useAuth hook
  const { user, loading } = useAuth();

  useEffect(() => {
    // Check if user is a trainer and redirect
    if (!loading && user?.role === "Trainer") {
      router.push("/ledenlijst");
      return;
    }
    if (!loading && user?.role === "Vechter") {
      router.push("/dashboard");
      return;
    }
  }, [loading, user, router]);

  // Filter states
  const [filters, setFilters] = useState({
    gewicht: "",
    leeftijd: "",
    klasse: "",
    verzekering: "",
  });

  // Fixed filter options
  const klasseOptions = [
    "A Klasse",
    "B Klasse",
    "C Klasse",
    "Nieuweling",
    "Jeugd",
  ];

  const verzekeringOptions = [
    { value: "In Orde", label: "Gereed" },
    { value: "Verloopt over", label: "Vervalend" },
    { value: "Niet in orde", label: "Verlopen" },
  ];

  // Helper function to format klasse for display
  const formatKlasse = (klasse) => {
    if (klasse === "Nieuweling" || klasse === "Jeugd") return klasse;
    return klasse.split(" ")[0]; // Returns just "A", "B", or "C"
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 945); // Match the breakpoint from ledenlijst
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clubData, usersData] = await Promise.all([
          fetchClubById(id),
          fetchUsers(),
        ]);
        setClub(clubData);
        setUsers(usersData);
      } catch (error) {
        console.error("Fout bij het ophalen van data:", error);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  useEffect(() => {
    // Initialize slider ranges with fixed values
    setSliderValues({
      leeftijd: { min: 1, max: 60 },
      gewicht: { min: 20, max: 120 },
    });
  }, []);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      gewicht: "",
      leeftijd: "",
      klasse: "",
      verzekering: "",
    });

    setSliderValues({
      leeftijd: { min: 1, max: 60 },
      gewicht: { min: 20, max: 120 },
    });
  };

  const handleSliderChange = (filterType, newValues) => {
    setSliderValues((prev) => ({
      ...prev,
      [filterType]: newValues,
    }));

    if (filterType === "leeftijd") {
      if (newValues.min === 1 && newValues.max === 60) {
        handleFilterChange("leeftijd", "");
      } else {
        handleFilterChange("leeftijd", `${newValues.min}-${newValues.max}`);
      }
    } else if (filterType === "gewicht") {
      if (newValues.min === 20 && newValues.max === 120) {
        handleFilterChange("gewicht", "");
      } else {
        handleFilterChange("gewicht", `${newValues.min}-${newValues.max}`);
      }
    }
  };

  const toggleFilter = (filterName) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };

  // Update filteredFighters to match ledenlijst filtering logic
  const filteredFighters = users.filter((user) => {
    if (user.club !== id || user.role.toLowerCase() !== "vechter") return false;

    // Search term filter
    const searchMatch = [
      `${user.voornaam} ${user.achternaam}`,
      `${user.vechterInfo?.gewicht || "Onbekend"} kg`,
      calculateAge(user.geboortedatum),
      user.vechterInfo?.klasse || "Onbekend",
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Slider filters
    const leeftijdMatch = (() => {
      if (!filters.leeftijd) return true;
      const leeftijd = parseInt(calculateAge(user.geboortedatum));
      return (
        leeftijd >= sliderValues.leeftijd.min &&
        leeftijd <= sliderValues.leeftijd.max
      );
    })();

    const gewichtMatch = (() => {
      if (!filters.gewicht) return true;
      const gewicht = parseInt(user.vechterInfo?.gewicht || "0");
      return (
        gewicht >= sliderValues.gewicht.min &&
        gewicht <= sliderValues.gewicht.max
      );
    })();

    // Other filters
    const klasseMatch =
      !filters.klasse || user.vechterInfo?.klasse === filters.klasse;
    const verzekeringMatch =
      !filters.verzekering ||
      (filters.verzekering === "In Orde" &&
        checkInsuranceStatus(user.vechterInfo).text === "In Orde") ||
      (filters.verzekering === "Verloopt over" &&
        checkInsuranceStatus(user.vechterInfo).text.includes(
          "Verloopt over"
        )) ||
      (filters.verzekering === "Niet in orde" &&
        checkInsuranceStatus(user.vechterInfo).text === "Niet in orde");

    return (
      searchMatch &&
      leeftijdMatch &&
      gewichtMatch &&
      klasseMatch &&
      verzekeringMatch
    );
  });

  const trainers = users.filter(
    (user) => user.club === id && user.role.toLowerCase() === "trainer"
  );

  const handleDelete = async (e, userId) => {
    e.stopPropagation(); // Prevent row click event
    if (window.confirm("Weet je zeker dat je dit lid wilt verwijderen?")) {
      try {
        await deleteUserById(userId);
        // Refresh the list after deletion
        setUsers(users.filter((user) => user._id !== userId));
      } catch (error) {
        console.error("Fout bij verwijderen lid:", error);
        alert("Er is een fout opgetreden bij het verwijderen van het lid");
      }
    }
  };

  const exportToExcel = () => {
    const worksheetData = filteredFighters.map((userData) => {
      const fightsCount = Array.isArray(userData?.vechterInfo?.fights)
        ? userData.vechterInfo.fights.length
        : 0;

      return {
        Naam: `${userData.voornaam} ${userData.achternaam}`,
        Email: userData.email,
        Geboortedatum: new Date(userData.geboortedatum).toLocaleDateString(
          "nl-NL"
        ),
        Leeftijd: calculateAge(userData.geboortedatum),
        Gewicht: userData.vechterInfo?.gewicht || "",
        Lengte: userData.vechterInfo?.lengte || "",
        Klasse: userData.vechterInfo?.klasse || "",
        "Verzekering Vervaldatum": userData.vechterInfo?.vervalDatum
          ? new Date(userData.vechterInfo.vervalDatum).toLocaleDateString(
              "nl-NL"
            )
          : "",
        "Aantal Gevechten": fightsCount,
      };
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(worksheetData);

    // Set column widths
    const colWidths = [
      { wch: 30 }, // Naam
      { wch: 25 }, // Email
      { wch: 15 }, // Geboortedatum
      { wch: 10 }, // Leeftijd
      { wch: 10 }, // Gewicht
      { wch: 10 }, // Lengte
      { wch: 15 }, // Klasse
      { wch: 20 }, // Verzekering Vervaldatum
      { wch: 15 }, // Aantal Gevechten
    ];
    ws["!cols"] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Ledenlijst");

    // Generate filename
    const date = new Date()
      .toLocaleDateString("nl-NL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");

    const safeClubName = club?.naam
      ? club.naam.replace(/[^a-zA-Z0-9]/g, "_")
      : "Club";

    const filename = `FightZone_${safeClubName}_Ledenlijst_${date}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, filename);
  };

  const handleSelectiveExport = () => {
    if (selectedFighters.length === 0) {
      alert("Selecteer ten minste één vechter om te exporteren");
      return;
    }

    const selectedMembers = filteredFighters.filter((member) =>
      selectedFighters.includes(member._id)
    );

    const worksheetData = selectedMembers.map((userData) => {
      const fightsCount = Array.isArray(userData?.vechterInfo?.fights)
        ? userData.vechterInfo.fights.length
        : 0;

      return {
        Naam: `${userData.voornaam} ${userData.achternaam}`,
        Email: userData.email,
        Geboortedatum: new Date(userData.geboortedatum).toLocaleDateString(
          "nl-NL"
        ),
        Leeftijd: calculateAge(userData.geboortedatum),
        Gewicht: userData.vechterInfo?.gewicht || "",
        Lengte: userData.vechterInfo?.lengte || "",
        Klasse: userData.vechterInfo?.klasse || "",
        "Verzekering Vervaldatum": userData.vechterInfo?.vervalDatum
          ? new Date(userData.vechterInfo.vervalDatum).toLocaleDateString(
              "nl-NL"
            )
          : "",
        "Aantal Gevechten": fightsCount,
      };
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(worksheetData);

    // Set column widths
    const colWidths = [
      { wch: 30 }, // Naam
      { wch: 25 }, // Email
      { wch: 15 }, // Geboortedatum
      { wch: 10 }, // Leeftijd
      { wch: 10 }, // Gewicht
      { wch: 10 }, // Lengte
      { wch: 15 }, // Klasse
      { wch: 20 }, // Verzekering Vervaldatum
      { wch: 15 }, // Aantal Gevechten
    ];
    ws["!cols"] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Geselecteerde Vechters");

    // Generate filename
    const date = new Date()
      .toLocaleDateString("nl-NL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");

    const safeClubName = club?.naam
      ? club.naam.replace(/[^a-zA-Z0-9]/g, "_")
      : "Club";

    const filename = `FightZone_${safeClubName}_Geselecteerde_Vechters_${date}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, filename);

    // Reset selection mode and selected fighters
    setIsSelectMode(false);
    setSelectedFighters([]);
  };

  // Add toggleFighterSelection function
  const toggleFighterSelection = (id, e) => {
    e.stopPropagation(); // Prevent row click when clicking checkbox
    setSelectedFighters((prev) => {
      if (prev.includes(id)) {
        return prev.filter((fighterId) => fighterId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Modify handleRowClick
  const handleRowClick = (id) => {
    if (isSelectMode) {
      setSelectedFighters((prev) => {
        if (prev.includes(id)) {
          return prev.filter((fighterId) => fighterId !== id);
        } else {
          return [...prev, id];
        }
      });
    } else {
      router.push(`/member/${id}`);
    }
  };

  if (!club) {
    return <div className="loading">Laden...</div>;
  }

  return (
    <div className="leden-container">
      <div className="header-section">
        <div className="title-section">
          <h1 className="leden-title">{club.naam}</h1>
          <Link href="/clubs" className="back-button">
            <ArrowLeftCircleIcon
              className="arrow-left-circle"
              width={24}
              height={24}
            />
            Terug
          </Link>
        </div>
      </div>

      {/* Trainers sectie */}
      <div className="trainers-section">
        <h2>Trainers</h2>
        {trainers.length > 0 ? (
          <div className="trainers-list">
            {trainers.map((trainer) => (
              <div key={trainer._id} className="trainer-card">
                <img
                  src={trainer.profielfoto}
                  alt={`${trainer.voornaam} ${trainer.achternaam}`}
                  className="trainer-profile-img"
                />
                <div className="trainer-info">
                  <p className="trainer-name">
                    {trainer.voornaam} {trainer.achternaam}
                  </p>
                  <p className="trainer-birthdate">
                    {calculateAge(trainer.geboortedatum)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Geen trainers gevonden</p>
        )}
      </div>

      <div className="button-group">
        <button
          className={`filter-button ${showFilters ? "active" : ""}`}
          onClick={() => {
            if (isMobile) {
              setShowMobileFilters(true);
            } else {
              setShowFilters(!showFilters);
            }
          }}
        >
          <FunnelIcon className="button-icon" width={20} height={20} />
          Filter
        </button>
        <Link
          href={`/clubs/${id}/leden/add-member`}
          className="add-member-button"
        >
          + Voeg lid toe
        </Link>
      </div>

      {/* Desktop Filters */}
      {!isMobile && showFilters && (
        <div className="filter-dropdowns">
          <div className="filter-grid">
            <div className="filter-group full-width">
              <h4 className="filter-label">Gewicht</h4>
              <DoubleRangeSlider
                min={20}
                max={120}
                values={sliderValues.gewicht}
                onChange={(newValues) =>
                  handleSliderChange("gewicht", newValues)
                }
                unit=" kg"
              />
            </div>

            <div className="filter-group full-width">
              <h4 className="filter-label">Leeftijd</h4>
              <DoubleRangeSlider
                min={1}
                max={60}
                values={sliderValues.leeftijd}
                onChange={(newValues) =>
                  handleSliderChange("leeftijd", newValues)
                }
                unit="J"
              />
            </div>

            <div className="filter-group">
              <h4 className="filter-label">Klasse</h4>
              <select
                value={filters.klasse}
                onChange={(e) => handleFilterChange("klasse", e.target.value)}
              >
                <option value="">Alle klassen</option>
                {klasseOptions.map((klasse) => (
                  <option key={klasse} value={klasse}>
                    {formatKlasse(klasse)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <h4 className="filter-label">Verzekering</h4>
              <select
                value={filters.verzekering}
                onChange={(e) =>
                  handleFilterChange("verzekering", e.target.value)
                }
              >
                <option value="">Alle statussen</option>
                {verzekeringOptions.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={clearFilters} className="clear-filters">
              Wissen
            </button>
          </div>
        </div>
      )}

      {/* Mobile Filter Popup */}
      {isMobile && showMobileFilters && (
        <>
          <div
            className="mobile-filter-overlay"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="mobile-filter-popup">
            <div className="mobile-filter-header">
              <div className="mobile-filter-title">
                <FunnelIcon className="button-icon" width={20} height={20} />
                <span>Filters</span>
              </div>
              <button
                className="close-filter-button"
                onClick={() => setShowMobileFilters(false)}
              >
                <XMarkIcon width={24} height={24} />
              </button>
            </div>

            <div className="mobile-filter-content">
              {/* Leeftijd Filter */}
              <div className="mobile-filter-section">
                <button
                  className="mobile-filter-label"
                  onClick={() => toggleFilter("leeftijd")}
                >
                  <span>Leeftijd</span>
                  {openFilter === "leeftijd" ? (
                    <MinusIcon width={20} height={20} />
                  ) : (
                    <PlusIcon width={20} height={20} />
                  )}
                </button>

                {openFilter === "leeftijd" && (
                  <div className="mobile-filter-slider">
                    <DoubleRangeSlider
                      min={1}
                      max={60}
                      values={sliderValues.leeftijd}
                      onChange={(newValues) =>
                        handleSliderChange("leeftijd", newValues)
                      }
                      unit="J"
                    />
                  </div>
                )}
              </div>

              {/* Gewicht Filter */}
              <div className="mobile-filter-section">
                <button
                  className="mobile-filter-label"
                  onClick={() => toggleFilter("gewicht")}
                >
                  <span>Gewicht</span>
                  {openFilter === "gewicht" ? (
                    <MinusIcon width={20} height={20} />
                  ) : (
                    <PlusIcon width={20} height={20} />
                  )}
                </button>

                {openFilter === "gewicht" && (
                  <div className="mobile-filter-slider">
                    <DoubleRangeSlider
                      min={20}
                      max={120}
                      values={sliderValues.gewicht}
                      onChange={(newValues) =>
                        handleSliderChange("gewicht", newValues)
                      }
                      unit=" kg"
                    />
                  </div>
                )}
              </div>

              {/* Klasse Filter */}
              <div className="mobile-filter-section">
                <button
                  className="mobile-filter-label"
                  onClick={() => toggleFilter("klasse")}
                >
                  <span>Klasse</span>
                  {openFilter === "klasse" ? (
                    <MinusIcon width={20} height={20} />
                  ) : (
                    <PlusIcon width={20} height={20} />
                  )}
                </button>

                {openFilter === "klasse" && (
                  <div className="mobile-filter-options">
                    {klasseOptions.map((klasse) => (
                      <button
                        key={klasse}
                        className={`filter-option ${
                          filters.klasse === klasse ? "active" : ""
                        }`}
                        onClick={() => handleFilterChange("klasse", klasse)}
                      >
                        {formatKlasse(klasse)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Verzekering Filter */}
              <div className="mobile-filter-section">
                <button
                  className="mobile-filter-label"
                  onClick={() => toggleFilter("verzekering")}
                >
                  <span>Verzekering</span>
                  {openFilter === "verzekering" ? (
                    <MinusIcon width={20} height={20} />
                  ) : (
                    <PlusIcon width={20} height={20} />
                  )}
                </button>

                {openFilter === "verzekering" && (
                  <div className="mobile-filter-options">
                    {verzekeringOptions.map(({ value, label }) => (
                      <button
                        key={value}
                        className={`filter-option ${
                          filters.verzekering === value ? "active" : ""
                        }`}
                        onClick={() => handleFilterChange("verzekering", value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mobile-filter-footer">
              <button onClick={clearFilters} className="clear-filters">
                Filters wissen
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="apply-filters"
              >
                Toepassen
              </button>
            </div>
          </div>
        </>
      )}

      <input
        type="text"
        className="search-input"
        placeholder={
          isMobile
            ? "Zoek lid..."
            : "Zoek op naam, gewicht, leeftijd of klasse..."
        }
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="export-container">
        <button
          className="export-button"
          onClick={() => setShowExportDropdown(!showExportDropdown)}
        >
          <ArrowDownTrayIcon className="button-icon" width={20} height={20} />
          Exporteren
          <ChevronDownIcon
            className={`dropdown-icon ${showExportDropdown ? "rotate" : ""}`}
            width={16}
            height={16}
          />
        </button>
        {showExportDropdown && (
          <div className="export-dropdown">
            <button
              className="export-option"
              onClick={() => {
                exportToExcel();
                setShowExportDropdown(false);
              }}
            >
              Exporteer volledige lijst
            </button>
            <button
              className="export-option"
              onClick={() => {
                setIsSelectMode(true);
                setShowExportDropdown(false);
              }}
            >
              Selecteer vechters om te exporteren
            </button>
          </div>
        )}
      </div>

      {/* Add selection mode indicator */}
      {isSelectMode && (
        <div className="selection-mode-bar">
          <div className="selection-info">
            {selectedFighters.length} vechter(s) geselecteerd
          </div>
          <div className="selection-actions">
            <button
              className="cancel-selection"
              onClick={() => {
                setIsSelectMode(false);
                setSelectedFighters([]);
              }}
            >
              Annuleren
            </button>
            <button
              className="export-selected"
              onClick={handleSelectiveExport}
              disabled={selectedFighters.length === 0}
            >
              Exporteer geselecteerde
            </button>
          </div>
        </div>
      )}
      <div className="table-responsive">
        <table className={`leden-tabel ${isSelectMode ? "select-mode" : ""}`}>
          <thead>
            <tr>
              {isSelectMode && <th className="checkbox-column"></th>}
              <th className="name-column">Naam</th>
              {!isMobile && <th className="weight-column">Gewicht</th>}
              <th className="age-column">Leeftijd</th>
              {!isMobile && <th className="class-column">Klasse</th>}
              <th className="insurance-column">Verzekering</th>
              <th className="action-column"></th>
            </tr>
          </thead>
          <tbody>
            {filteredFighters.length > 0 ? (
              filteredFighters.map((user) => (
                <tr
                  key={user._id}
                  onClick={() => handleRowClick(user._id)}
                  className={`clickable-row ${
                    selectedFighters.includes(user._id) ? "selected" : ""
                  }`}
                >
                  {isSelectMode && (
                    <td
                      className="checkbox-column"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFighters.includes(user._id)}
                        onChange={(e) => toggleFighterSelection(user._id, e)}
                        className="fighter-checkbox"
                      />
                    </td>
                  )}
                  <td className="name-column">
                    {user.voornaam} {user.achternaam}
                  </td>
                  {!isMobile && (
                    <td className="weight-column">
                      -{user.vechterInfo?.gewicht || "Onbekend"} kg
                    </td>
                  )}
                  <td className="age-column">
                    {calculateAge(user.geboortedatum)}
                  </td>
                  {!isMobile && (
                    <td className="class-column">
                      {formatKlasse(user.vechterInfo?.klasse || "Onbekend")}
                    </td>
                  )}
                  <td className="insurance-column">
                    <span
                      className={`insurance-badge insurance-${
                        checkInsuranceStatus(user.vechterInfo).type
                      }`}
                    >
                      {isMobile
                        ? checkInsuranceStatus(user.vechterInfo)
                            .text.replace("Verloopt over", "")
                            .replace("dagen", "Dagen")
                        : checkInsuranceStatus(user.vechterInfo).text}
                    </span>
                  </td>
                  <td className="action-column">
                    <button
                      onClick={(e) => handleDelete(e, user._id)}
                      className="delete-button"
                      title="Verwijder lid"
                    >
                      <TrashIcon
                        className="delete-icon"
                        width={20}
                        height={20}
                      />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isSelectMode ? "7" : "6"} className="no-results">
                  Geen vechters gevonden
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .leden-container {
          padding: 1rem;
          border-radius: 12px;
          font-family: "Inter", sans-serif;
          width: 100%;
          box-sizing: border-box;
          max-width: 100%;
        }

        @media (min-width: 768px) {
          .leden-container {
            padding: 2rem;
          }
        }

        .header-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 20px;
        }

        .title-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.8rem 1.5rem;
          background-color: #3483fe;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
          transition: background-color 0.2s;
        }

        .back-button:hover {
          background-color: #2a6cd6;
        }

        .arrow-left-circle {
          width: 24px;
          height: 24px;
        }

        @media (max-width: 768px) {
          .back-button {
            padding: 0.6rem 1.2rem;
            font-size: 14px;
          }

          .arrow-left-circle {
            width: 20px;
            height: 20px;
          }
        }

        .leden-title {
          font-size: 1.5rem;
          color: var(--text-color);
          margin: 0;
        }

        @media (min-width: 768px) {
          .leden-title {
            font-size: 2rem;
          }
        }

        .trainers-section {
          margin-bottom: 30px;
        }

        .trainers-section h2 {
          font-size: 1.5em;
          margin-bottom: 20px;
          color: #333;
        }

        .trainers-list {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }

        .trainer-card {
          display: flex;
          align-items: center;
          background-color: #f9f9f9;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
          width: 250px;
        }

        .trainer-profile-img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin-right: 15px;
          object-fit: cover;
        }

        .trainer-info {
          flex: 1;
        }

        .trainer-name {
          font-size: 1.3em;
          font-weight: bold;
          margin-bottom: 5px;
          color: #333;
        }

        .trainer-birthdate {
          font-size: 1em;
          color: #333;
        }

        .button-group {
          display: flex;
          width: 100%;
          gap: 1rem;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 25px;
        }

        .filter-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 12px;
          background-color: var(--filter-yellow);
          color: #000;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          font-size: 16px;
        }

        @media (min-width: 768px) {
          .filter-button {
            padding: 12px 24px;
          }
        }

        .filter-button:hover {
          background-color: #e6c05f;
        }

        .add-member-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 12px;
          background-color: var(--primary-blue);
          color: white;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
          transition: background-color 0.2s;
        }

        @media (min-width: 768px) {
          .add-member-button {
            padding: 12px 24px;
          }
        }

        .add-member-button:hover {
          background-color: var(--hover-blue);
        }

        .search-input {
          width: 100%;
          padding: 10px 15px;
          margin-bottom: 20px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 15px;
          background-color: #f9fafb;
        }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 80px;
        }

        .leden-tabel {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background-color: #fff;
          border: 1px solid rgba(213, 213, 213, 0.5);
          border-radius: 8px;
          table-layout: auto;
        }

        .leden-tabel th {
          background-color: #d4e4fd;
          color: #333;
          font-weight: 750;
          text-transform: uppercase;
          padding: 24px 8px;
          border-bottom: 1px solid rgba(213, 213, 213, 0.5);
          white-space: nowrap;
        }

        .leden-tabel td {
          padding: 24px 8px;
          border-bottom: 1px solid rgba(213, 213, 213, 0.3);
          line-height: 1.3;
          text-align: center;
        }

        .leden-tabel td:last-child {
          border: none;
        }

        .leden-tabel tr:hover {
          background-color: #f9fbff;
        }

        /* Column widths */
        .name-column {
          width: 35%;
          min-width: 100px;
        }

        .weight-column {
          width: 15%;
          min-width: 60px;
          display: none;
        }

        .age-column {
          width: 12%;
          min-width: 50px;
        }

        .class-column {
          width: 15%;
          min-width: 70px;
          display: none;
        }

        .insurance-column {
          width: 30%;
          min-width: 90px;
        }

        .action-column {
          width: 8%;
          min-width: 30px;
        }

        .insurance-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 13px;
          white-space: nowrap;
        }

        @media (max-width: 944px) {
          .leden-tabel {
            font-size: 14px;
          }

          .leden-tabel th,
          .leden-tabel td {
            padding: 20px 6px;
            text-align: center;
          }

          .leden-tabel th {
            padding: 20px 8px;
          }

          .insurance-badge {
            padding: 6px 10px;
            font-size: 12px;
          }

          .trainers-list {
            flex-direction: column;
          }

          .trainer-card {
            width: 100%;
          }
        }

        @media (min-width: 945px) {
          .leden-tabel {
            font-size: 15px;
          }

          .leden-tabel th,
          .leden-tabel td {
            padding: 24px 12px;
            text-align: center;
          }

          .name-column {
            width: 25%;
          }

          .weight-column,
          .class-column {
            display: table-cell;
          }

          .age-column {
            width: 10%;
          }

          .class-column {
            width: 15%;
          }

          .insurance-column {
            width: 25%;
          }

          .action-column {
            width: 8%;
          }

          .insurance-badge {
            padding: 8px 14px;
            font-size: 14px;
          }
        }

        @media (max-width: 360px) {
          .leden-tabel th,
          .leden-tabel td {
            padding: 20px 6px;
            font-size: 11px;
          }

          .insurance-badge {
            padding: 5px 8px;
            font-size: 11px;
          }

          .delete-icon {
            width: 16px;
            height: 16px;
          }

          .trainer-card {
            padding: 10px;
          }

          .trainer-profile-img {
            width: 60px;
            height: 60px;
          }

          .trainer-name {
            font-size: 1em;
          }

          .trainer-birthdate {
            font-size: 0.8em;
          }
        }

        .insurance-ok {
          background-color: rgba(0, 182, 155, 0.2);
          color: #00b69b;
        }

        .insurance-warning {
          background-color: rgba(255, 196, 47, 0.2);
          color: #ffc42f;
        }

        .insurance-error {
          background-color: rgba(239, 56, 38, 0.2);
          color: #ef3826;
        }

        .delete-button {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .delete-button:hover {
          background-color: rgba(239, 56, 38, 0.1);
        }

        .delete-icon {
          color: #ef3826;
        }

        .no-results {
          text-align: center;
          padding: 20px;
          color: #666;
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 18px;
          color: #666;
        }

        .clickable-row {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .button-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .left-buttons {
          display: flex;
          gap: 1rem;
        }

        /* Add all the filter styles from Ledenlijst.css */
        .filter-dropdowns {
          margin-bottom: 1.5rem;
        }

        .filter-grid {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .filter-group {
          flex: 1;
        }

        .filter-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.95rem;
          color: var(--text-color);
          background-color: white;
          cursor: pointer;
          transition: border-color 0.2s;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1em;
          padding-right: 2.5rem;
        }

        .filter-group select:hover {
          border-color: #999;
        }

        .filter-group select:focus {
          outline: none;
          border-color: var(--primary-blue);
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
        }

        .clear-filters {
          background: none;
          border: none;
          color: var(--primary-blue);
          font-size: 0.9rem;
          cursor: pointer;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          font-weight: 500;
          transition: background-color 0.2s;
          white-space: nowrap;
          border: 1px solid #ddd;
        }

        .clear-filters:hover {
          background-color: rgba(0, 123, 255, 0.1);
        }

        /* Mobile Filter Styles */
        .mobile-filter-popup {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-radius: 20px 20px 0 0;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .mobile-filter-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        .mobile-filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #eee;
        }

        .mobile-filter-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 1.1rem;
          color: #0b48ab;
        }

        .mobile-filter-content {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }

        .mobile-filter-section {
          border-bottom: 1px solid #eee;
        }

        .mobile-filter-label {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          background: none;
          border: none;
          font-size: 1rem;
          font-weight: 500;
          color: #0b48ab;
          cursor: pointer;
        }

        .mobile-filter-slider {
          padding: 10px 0;
          background: white;
          border-radius: 8px;
          display: flex;
          justify-content: center;
        }

        .mobile-filter-options {
          padding: 0.5rem;
          display: flex;
          gap: 0.5rem;
          background-color: #f0f6ff;
          border-radius: 8px;
        }

        .filter-option {
          flex: 1;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 6px;
          background-color: rgba(52, 131, 254, 0.3);
          text-align: center;
          font-size: 0.95rem;
          color: var(--text-color);
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-option.active {
          background-color: #3483fe;
          color: white;
        }

        .mobile-filter-footer {
          padding: 1rem;
          border-top: 1px solid #eee;
          display: flex;
          gap: 1rem;
        }

        .mobile-filter-footer button {
          flex: 1;
          padding: 0.75rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mobile-filter-footer .clear-filters {
          background: none;
          border: 1px solid #ddd;
          color: var(--text-color);
        }

        .mobile-filter-footer .apply-filters {
          background-color: #3483fe;
          border: none;
          color: white;
        }

        .mobile-filter-footer .clear-filters:hover {
          background-color: #f5f5f5;
        }

        .mobile-filter-footer .apply-filters:hover {
          background-color: #0b48ab;
        }

        /* Double Range Slider Styles */
        .double-range-container {
          display: flex;
          justify-content: center;
          width: 95%;
        }

        .double-range-slider {
          position: relative;
          height: 40px;
          width: calc(100% - 20px);
          margin: 20px 0;
          padding: 0;
        }

        .slider-background {
          position: absolute;
          height: 4px;
          background-color: #d6e6ff;
          border-radius: 2px;
          top: 50%;
          transform: translateY(-50%);
          width: 100%;
          z-index: 0;
        }

        .range-track {
          position: absolute;
          height: 4px;
          background-color: rgba(52, 131, 254, 0.5);
          border-radius: 2px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          z-index: 1;
        }

        .double-range-slider input[type="range"] {
          position: absolute;
          width: 100%;
          height: 4px;
          background: none;
          pointer-events: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
          margin: 0;
          padding: 0;
        }

        .double-range-slider input[type="range"]::-webkit-slider-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          border: 2px solid #3483fe;
          background-color: white;
          pointer-events: auto;
          -webkit-appearance: none;
          cursor: pointer;
          z-index: 3;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .double-range-slider input[type="range"]::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          border: 2px solid #3483fe;
          background-color: white;
          pointer-events: auto;
          -moz-appearance: none;
          cursor: pointer;
          z-index: 3;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .min-value-bubble,
        .max-value-bubble {
          position: absolute;
          padding: 4px 8px;
          background: white;
          border: 1px solid #d6e6ff;
          border-radius: 12px;
          color: #0b48ab;
          font-size: 12px;
          font-weight: 500;
          transform: translateX(-50%);
          top: -28px;
          pointer-events: none;
          transition: left 0.1s ease-out;
          z-index: 4;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          white-space: nowrap;
        }

        .min-value-bubble::after,
        .max-value-bubble::after {
          content: "";
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 4px solid #d6e6ff;
        }

        /* Filter Grid Styles */
        .filter-grid {
          display: flex;
          flex-direction: row;
          gap: 1.5rem;
          align-items: start;
        }

        .filter-group.full-width {
          grid-column: span 2;
        }

        .filter-label {
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #0b48ab;
          font-size: 0.95rem;
        }

        .right-buttons {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .selection-mode-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background-color: #f8f9fb;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .selection-info {
          font-weight: 500;
          color: #0b48ab;
        }

        .selection-actions {
          display: flex;
          gap: 1rem;
        }

        .cancel-selection {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-selection:hover {
          background-color: #f5f5f5;
        }

        .export-selected {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          background-color: #3483fe;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .export-selected:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .export-selected:not(:disabled):hover {
          background-color: #2b6cd9;
        }

        .checkbox-column {
          width: 40px;
          text-align: center;
          padding: 0 10px;
        }

        .fighter-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .leden-tabel.select-mode tr.selected {
          background-color: rgba(52, 131, 254, 0.1);
        }

        .leden-tabel.select-mode tr:hover {
          background-color: rgba(52, 131, 254, 0.05);
        }

        /* Export Button Styles */
        .export-container {
          position: relative;
        }

        .export-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background-color: #3483fe;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .export-button:hover {
          background-color: #2b6cd9;
        }

        .export-button .button-icon {
          width: 20px;
          height: 20px;
        }

        .export-button .dropdown-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.2s ease;
        }

        .export-button .dropdown-icon.rotate {
          transform: rotate(180deg);
        }

        .export-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          min-width: 220px;
          z-index: 1000;
          overflow: hidden;
          animation: dropdownFade 0.2s ease;
        }

        @keyframes dropdownFade {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .export-option {
          display: block;
          width: 100%;
          padding: 0.75rem 1rem;
          text-align: left;
          background: none;
          border: none;
          color: #333;
          font-size: 0.95rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .export-option:hover {
          background-color: #f8f9fb;
        }

        .export-option:not(:last-child) {
          border-bottom: 1px solid #e8e8e8;
        }

        @media (max-width: 768px) {
          .right-buttons {
            flex-direction: column;
            width: 100%;
          }

          .export-container {
            width: 100%;
          }

          .export-button {
            justify-content: center;
          }

          .export-dropdown {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ClubMembersPage;
