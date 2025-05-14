import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

const LedenlijstPage = () => {
  const router = useRouter();
  const { lid_id } = router.query;
  const [leden, setLeden] = useState([]);

  useEffect(() => {
    if (lid_id) {
      const nieuwLid = {
        naam: `Lid ${lid_id}`,
        club: "FightZone Club",
        licentie: `LIC-${lid_id}`,
        geboortedatum: "2000-01-01",
      };

      setLeden((prev) => {
        const bestaatAl = prev.find((l) => l.licentie === nieuwLid.licentie);
        return bestaatAl ? prev : [...prev, nieuwLid];
      });
    }
  }, [lid_id]);

  return (
    <div className="leden-container">
      <div className="header-section">
        <div>
          <h1 className="leden-title">👥 Ledenlijst</h1>
          <p className="leden-subtitle">
            Alle gescande of toegevoegde leden verschijnen hieronder.
          </p>
        </div>
        <Link href="/clubs/1/leden/add-member" className="add-member-button">
          + Nieuw lid toevoegen
        </Link>
      </div>

      <table className="leden-tabel">
        <thead>
          <tr>
            <th>Naam</th>
            <th>Club</th>
            <th>Licentie</th>
            <th>Geboortedatum</th>
          </tr>
        </thead>
        <tbody>
          {leden.map((lid, i) => (
            <tr key={i}>
              <td>{lid.naam}</td>
              <td>{lid.club}</td>
              <td>{lid.licentie}</td>
              <td>{lid.geboortedatum}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        .leden-container {
          max-width: 900px;
          margin: 50px auto;
          padding: 30px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 0 25px rgba(0, 0, 0, 0.05);
          font-family: "Inter", sans-serif;
        }

        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .add-member-button {
          display: inline-flex;
          align-items: center;
          padding: 12px 24px;
          background-color: #3498db;
          color: white;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
          transition: background-color 0.2s;
        }

        .add-member-button:hover {
          background-color: #2980b9;
        }

        .leden-title {
          font-size: 2rem;
          color: #3683fe;
          margin-bottom: 10px;
        }

        .leden-subtitle {
          color: #555;
          font-size: 15px;
          margin-bottom: 30px;
        }

        .leden-tabel {
          width: 100%;
          border-collapse: collapse;
          font-size: 15px;
        }

        .leden-tabel th,
        .leden-tabel td {
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }

        .leden-tabel th {
          background-color: #f4f7fb;
          color: #333;
          font-weight: 600;
        }

        .leden-tabel tr:hover {
          background-color: #f9fbff;
        }
      `}</style>
    </div>
  );
};

export default LedenlijstPage;
