import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchUsers, deleteUserById } from "../../src/services/api";
import { useAuth } from "../../src/services/auth";
import { FunnelIcon, UserPlusIcon, TrashIcon } from "@heroicons/react/24/solid";

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

const LedenlijstPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [leden, setLeden] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchUsers();

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
      }
    };

    if (!loading && user) {
      loadData();
    }
  }, [loading, user]);

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

  if (loading || !user) {
    return <div style={{ textAlign: "center" }}>Laden...</div>;
  }

  const filteredLeden = leden.filter((lid) =>
    [
      lid.naam,
      lid.gewichtscategorie,
      lid.leeftijd,
      lid.klasse,
      lid.verzekering.text,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="leden-container">
      <div className="header-section">
        <div>
          <h1 className="leden-title">Ledenlijst</h1>
        </div>
        <div className="button-group">
          <button className="filter-button">
            <FunnelIcon className="button-icon" width={20} height={20} />
            Filter
          </button>
          <Link href="ledenlijst/add-member" className="add-member-button">
            <UserPlusIcon className="button-icon" width={20} height={20} />+
            Voeg lid toe
          </Link>
        </div>
      </div>
      <input
        type="text"
        className="search-input"
        placeholder="Zoek op naam, gewicht, leeftijd of klasse..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <table className="leden-tabel">
        <thead>
          <tr>
            <th>Naam</th>
            <th>Gewichtscategorie</th>
            <th>Leeftijd</th>
            <th>Klasse</th>
            <th>Verzekering</th>
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
              <td>{lid.naam}</td>
              <td>-{lid.gewichtscategorie}</td>
              <td>{lid.leeftijd}</td>
              <td>{lid.klasse}</td>
              <td>
                <span
                  className={`insurance-badge insurance-${lid.verzekering.type}`}
                >
                  {lid.verzekering.text}
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
  );
};

export const getInitialProps = async () => {
  return { props: {} };
};

LedenlijstPage.getInitialProps = getInitialProps;

export default LedenlijstPage;
