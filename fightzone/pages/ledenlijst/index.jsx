import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchUsers } from "../services/api";
import { useAuth } from "../services/auth";

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
          naam: `${user.voornaam} ${user.achternaam}`,
          gewichtscategorie: `${user.vechterInfo?.gewicht || "Onbekend"} kg`,
          leeftijd: user.geboortedatum || "Onbekend",
          klasse: user.vechterInfo?.klasse || "Onbekend",
          verzekering: user.vechterInfo?.verzekering ? "Ja" : "Nee",
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

  if (loading || !user) {
    return <div style={{ textAlign: "center" }}>Laden...</div>;
  }

  const filteredLeden = leden.filter((lid) =>
    [lid.naam, lid.gewichtscategorie, lid.leeftijd, lid.klasse, lid.verzekering]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="leden-container">
      <div className="header-section">
        <div>
          <h1 className="leden-title">Ledenlijst</h1>
          <p className="leden-subtitle">
            Alle gescande of toegevoegde leden verschijnen hieronder.
          </p>
        </div>
        <Link href="/clubs/1/leden/add-member" className="add-member-button">
          + Nieuw lid toevoegen
        </Link>
      </div>

      <input
        type="text"
        className="search-input"
        placeholder="Zoek op naam"
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
          </tr>
        </thead>
        <tbody>
          {filteredLeden.map((lid, i) => (
            <tr key={i}>
              <td>{lid.naam}</td>
              <td>{lid.gewichtscategorie}</td>
              <td>{lid.leeftijd}</td>
              <td>{lid.klasse}</td>
              <td>{lid.verzekering}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        .leden-container { max-width: 900px; margin: 50px auto; padding: 30px; background: #fff; border-radius: 12px; box-shadow: 0 0 25px rgba(0, 0, 0, 0.05); font-family: "Inter", sans-serif; }
        .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .add-member-button { display: inline-flex; align-items: center; padding: 12px 24px; background-color: #3498db; color: white; border-radius: 8px; font-weight: 500; text-decoration: none; }
        .add-member-button:hover { background-color: #2980b9; }
        .leden-title { font-size: 2rem; color: #3683fe; margin-bottom: 10px; }
        .leden-subtitle { color: #555; font-size: 15px; margin-bottom: 30px; }
        .search-input { width: 100%; padding: 10px 15px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 6px; font-size: 15px; }
        .leden-tabel { width: 100%; border-collapse: collapse; font-size: 15px; }
        .leden-tabel th, .leden-tabel td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #e0e0e0; }
        .leden-tabel th { background-color: #f4f7fb; color: #333; font-weight: 600; }
        .leden-tabel tr:hover { background-color: #f9fbff; }
      `}</style>
    </div>
  );
};

export default LedenlijstPage;
