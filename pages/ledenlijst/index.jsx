import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { fetchUsers, deleteUserById } from "../../src/services/api";
import { useAuth } from "../../src/services/auth";
import {
  FunnelIcon,
  UserPlusIcon,
  TrashIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
} from "@heroicons/react/24/solid";

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
  } else if (daysUntilExpiry <= 30) {
    // Within 1 months
    return { text: `Verloopt over ${daysUntilExpiry} dagen`, type: "warning" };
  } else {
    return { text: "In Orde", type: "ok" };
  }
};

// Reusable Double Range Slider Component
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

const LedenlijstPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [leden, setLeden] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [openFilter, setOpenFilter] = useState(null);
  const [sliderValues, setSliderValues] = useState({
    leeftijd: { min: 1, max: 60 },
    gewicht: { min: 0, max: 200 },
  });

  // Filter states
  const [filters, setFilters] = useState({
    gewicht: "",
    leeftijd: "",
    klasse: "",
    verzekering: "",
  });

  // Get unique values for filter options
  const getUniqueValues = (key) => {
    const values = new Set();
    leden.forEach((lid) => {
      if (key === "leeftijd") {
        values.add(lid.leeftijd);
      } else if (key === "gewicht") {
        values.add(lid.gewichtscategorie);
      } else if (key === "klasse") {
        values.add(lid.klasse);
      } else if (key === "verzekering") {
        values.add(lid.verzekering.text);
      }
    });
    return Array.from(values).sort();
  };

  // Get min and max values for sliders
  const getMinMaxValues = (key) => {
    if (key === "leeftijd") {
      return { min: 1, max: 60 }; // Always return fixed range for age
    }

    const values = leden
      .map((lid) => {
        if (key === "gewicht") {
          return parseInt(lid.gewichtscategorie.replace(" kg", ""));
        }
        return 0;
      })
      .filter((val) => !isNaN(val));

    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  };

  // Fixed filter options
  const klasseOptions = ["A", "B", "C", "Nieuweling", "Jeugd"];
  const verzekeringOptions = [
    { value: "In Orde", label: "Gereed" },
    { value: "Verloopt over", label: "Vervalend" },
    { value: "Niet in orde", label: "Verlopen" },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Updated to match our new breakpoint
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return; // Don't try to load if no user

      try {
        setIsLoading(true);
        const data = await fetchUsers();

        if (!data) {
          console.error("Geen data ontvangen van fetchUsers");
          return;
        }

        const clubMembers = data.filter(
          (u) => u.club === user?.club && u.role === "Vechter"
        );

        const mappedLeden = clubMembers.map((user) => ({
          id: user._id,
          naam: `${user.voornaam} ${user.achternaam}`,
          gewichtscategorie: `${user.vechterInfo?.gewicht || "Onbekend"} kg`,
          leeftijd: calculateAge(user.geboortedatum),
          klasse: user.vechterInfo?.klasse || "Onbekend",
          verzekering: checkInsuranceStatus(user.vechterInfo),
        }));

        setLeden(mappedLeden);
      } catch (error) {
        console.error("Fout bij laden van leden:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && user) {
      loadData();
    }
  }, [loading, user]); // Re-run when user or loading state changes

  useEffect(() => {
    // Initialize slider ranges with fixed values
    setSliderValues({
      leeftijd: { min: 1, max: 60 }, // Fixed range for age
      gewicht: { min: -20, max: 100 }, // Fixed range for weight
    });
  }, []);

  useEffect(() => {
    // Range slider functionality
    const updateRangeTrack = (type) => {
      const container = document.querySelector(
        `#${type}-range-track`
      )?.parentElement;
      if (!container) return;

      const track = container.querySelector(".range-track");
      const minInput = container.querySelector(".min-range");
      const maxInput = container.querySelector(".max-range");
      const minBubble = container.querySelector(".min-value-bubble");
      const maxBubble = container.querySelector(".max-value-bubble");

      if (!track || !minInput || !maxInput) return;

      const min = parseInt(minInput.value);
      const max = parseInt(maxInput.value);
      const minPercent =
        ((min - minInput.min) / (minInput.max - minInput.min)) * 100;
      const maxPercent =
        ((max - maxInput.min) / (maxInput.max - maxInput.min)) * 100;

      // Update track position
      track.style.left = `${minPercent}%`;
      track.style.right = `${100 - maxPercent}%`;

      // Update value bubbles
      if (minBubble) {
        minBubble.style.left = `${minPercent}%`;
        minBubble.textContent = type === "leeftijd" ? `${min}J` : `${min} kg`;
      }
      if (maxBubble) {
        maxBubble.style.left = `${maxPercent}%`;
        maxBubble.textContent = type === "leeftijd" ? `${max}J` : `${max} kg`;
      }
    };

    // Add event listeners for real-time updates
    const addSliderListeners = (type) => {
      const container = document.querySelector(
        `#${type}-range-track`
      )?.parentElement;
      if (!container) return;

      const inputs = container.querySelectorAll('input[type="range"]');
      inputs.forEach((input) => {
        const updateHandler = () => {
          updateRangeTrack(type);
          // Ensure z-index is correct when dragging
          if (input.classList.contains("min-range")) {
            input.style.zIndex = "3";
            container.querySelector(".max-range").style.zIndex = "2";
          } else {
            input.style.zIndex = "3";
            container.querySelector(".min-range").style.zIndex = "2";
          }
        };
        input.addEventListener("input", updateHandler);
        input.addEventListener("mousedown", () => {
          input.style.zIndex = "3";
          const otherInput = input.classList.contains("min-range")
            ? container.querySelector(".max-range")
            : container.querySelector(".min-range");
          if (otherInput) otherInput.style.zIndex = "2";
        });
      });
    };

    // Initial update and add listeners
    requestAnimationFrame(() => {
      updateRangeTrack("leeftijd");
      updateRangeTrack("gewicht");
      addSliderListeners("leeftijd");
      addSliderListeners("gewicht");
    });

    // Cleanup function
    return () => {
      const removeSliderListeners = (type) => {
        const container = document.querySelector(
          `#${type}-range-track`
        )?.parentElement;
        if (!container) return;

        const inputs = container.querySelectorAll('input[type="range"]');
        inputs.forEach((input) => {
          const updateHandler = () => updateRangeTrack(type);
          input.removeEventListener("input", updateHandler);
          input.removeEventListener("mousedown", () => {});
        });
      };
      removeSliderListeners("leeftijd");
      removeSliderListeners("gewicht");
    };
  }, [leden]);

  // Show loading state while either auth is loading or data is being fetched
  if (loading || isLoading) {
    return (
      <div className="leden-container">
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Ledenlijst laden...</p>
        </div>
      </div>
    );
  }

  // Show message if no user is logged in
  if (!user) {
    return (
      <div className="leden-container">
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Je moet ingelogd zijn om de ledenlijst te bekijken.</p>
        </div>
      </div>
    );
  }

  const handleRowClick = (id) => {
    router.push(`/member/${id}`); // ✅ Detailpagina route
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent row click event
    if (window.confirm("Weet je zeker dat je dit lid wilt verwijderen?")) {
      try {
        await deleteUserById(id);
        // Refresh the list after deletion
        const updatedLeden = leden.filter((lid) => lid.id !== id);
        setLeden(updatedLeden);
      } catch (error) {
        console.error("Fout bij verwijderen lid:", error);
        alert("Er is een fout opgetreden bij het verwijderen van het lid");
      }
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    // Reset filters
    setFilters({
      gewicht: "",
      leeftijd: "",
      klasse: "",
      verzekering: "",
    });

    // Reset slider values to their fixed ranges
    setSliderValues({
      leeftijd: { min: 1, max: 60 }, // Fixed range for age
      gewicht: { min: -20, max: 100 }, // Fixed range for weight
    });
  };

  const handleSliderChange = (filterType, newValues) => {
    setSliderValues((prev) => ({
      ...prev,
      [filterType]: newValues,
    }));

    // Update filters based on slider values
    if (filterType === "leeftijd") {
      // Only set the filter if it's not the full range
      if (newValues.min === 1 && newValues.max === 60) {
        handleFilterChange("leeftijd", "");
      } else {
        handleFilterChange("leeftijd", `${newValues.min}-${newValues.max}`);
      }
    } else if (filterType === "gewicht") {
      // Only set the filter if it's not the full range
      if (newValues.min === -20 && newValues.max === 100) {
        handleFilterChange("gewicht", "");
      } else {
        handleFilterChange("gewicht", `${newValues.min}-${newValues.max}`);
      }
    }
  };

  const toggleFilter = (filterName) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };

  const filteredLeden = leden.filter((lid) => {
    // First apply search term filter
    const searchMatch = [
      lid.naam,
      lid.gewichtscategorie,
      lid.leeftijd,
      lid.klasse,
      lid.verzekering.text,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Apply slider filters
    const leeftijdMatch = (() => {
      if (!filters.leeftijd) return true;
      const leeftijd = parseInt(lid.leeftijd);
      return (
        leeftijd >= sliderValues.leeftijd.min &&
        leeftijd <= sliderValues.leeftijd.max
      );
    })();

    const gewichtMatch = (() => {
      if (!filters.gewicht) return true;
      const gewicht = parseInt(lid.gewichtscategorie.replace(" kg", ""));
      return (
        gewicht >= sliderValues.gewicht.min &&
        gewicht <= sliderValues.gewicht.max
      );
    })();

    // Apply other filters
    const klasseMatch = !filters.klasse || lid.klasse === filters.klasse;

    // Special handling for verzekering filter
    const verzekeringMatch =
      !filters.verzekering ||
      (filters.verzekering === "In Orde" &&
        lid.verzekering.text === "In Orde") ||
      (filters.verzekering === "Verloopt over" &&
        lid.verzekering.text.includes("Verloopt over")) ||
      (filters.verzekering === "Niet in orde" &&
        lid.verzekering.text === "Niet in orde");

    return (
      searchMatch &&
      leeftijdMatch &&
      gewichtMatch &&
      klasseMatch &&
      verzekeringMatch
    );
  });

  return (
    <div className="leden-container">
      <div className="header-section">
        <div>
          <h1 className="leden-title">Ledenlijst</h1>
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
          <Link href="ledenlijst/add-member" className="add-member-button">
            <UserPlusIcon className="button-icon" width={20} height={20} />
            Voeg lid toe
          </Link>
        </div>
      </div>

      {/* Desktop Filters */}
      {!isMobile && showFilters && (
        <div className="filter-dropdowns">
          <div className="filter-grid">
            <div className="filter-group">
              <select
                value={filters.gewicht}
                onChange={(e) => handleFilterChange("gewicht", e.target.value)}
              >
                <option value="">Gewicht</option>
                {getUniqueValues("gewicht").map((gewicht) => (
                  <option key={gewicht} value={gewicht}>
                    {gewicht}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                value={filters.leeftijd}
                onChange={(e) => handleFilterChange("leeftijd", e.target.value)}
              >
                <option value="">Leeftijd</option>
                {getUniqueValues("leeftijd").map((leeftijd) => (
                  <option key={leeftijd} value={leeftijd}>
                    {leeftijd}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                value={filters.klasse}
                onChange={(e) => handleFilterChange("klasse", e.target.value)}
              >
                <option value="">Klasse</option>
                {getUniqueValues("klasse").map((klasse) => (
                  <option key={klasse} value={klasse}>
                    {klasse}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                value={filters.verzekering}
                onChange={(e) =>
                  handleFilterChange("verzekering", e.target.value)
                }
              >
                <option value="">Verzekering</option>
                {getUniqueValues("verzekering").map((status) => (
                  <option key={status} value={status}>
                    {status}
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
                    min={-20}
                    max={100}
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
                      {klasse}
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
      )}

      <input
        type="text"
        className="search-input"
        placeholder={"Zoek op naam, gewicht, leeftijd of klasse..."}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="table-responsive">
        <table className="leden-tabel">
          <thead>
            <tr>
              <th className="name-column">Naam</th>
              {!isMobile && <th className="weight-column">Gewicht</th>}
              <th className="age-column">Leeftijd</th>
              {!isMobile && <th className="class-column">Klasse</th>}
              <th className="insurance-column">Verzekering</th>
              <th className="action-column"></th>
            </tr>
          </thead>
          <tbody>
            {filteredLeden.map((lid, i) => (
              <tr
                key={i}
                onClick={() => handleRowClick(lid.id)}
                style={{ cursor: "pointer" }}
              >
                <td className="name-column">{lid.naam}</td>
                {!isMobile && (
                  <td className="weight-column">-{lid.gewichtscategorie}</td>
                )}
                <td className="age-column">{lid.leeftijd}</td>
                {!isMobile && <td className="class-column">{lid.klasse}</td>}
                <td className="insurance-column">
                  <span
                    className={`insurance-badge insurance-${lid.verzekering.type}`}
                  >
                    {isMobile
                      ? lid.verzekering.text
                          .replace("Verloopt over", "")
                          .replace("dagen", "Dagen")
                      : lid.verzekering.text}
                  </span>
                </td>
                <td className="action-column">
                  <button
                    onClick={(e) => handleDelete(e, lid.id)}
                    className="delete-button"
                    title="Verwijder lid"
                  >
                    <TrashIcon className="delete-icon" width={20} height={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const getInitialProps = async () => {
  return { props: {} };
};

LedenlijstPage.getInitialProps = getInitialProps;

export default LedenlijstPage;
