import { useState } from "react";
import Link from "next/link";

const EventMatchesPage = () => {
  // Statische matchgegevens
  const matches = [
    {
      _id: "match1",
      fighters: [
        {
          user: {
            _id: "fighter1",
            voornaam: "Valentina",
            achternaam: "Segers",
            club: { naam: "Champion Gym" },
            geboortedatum: "2000-05-15T00:00:00Z",
          },
          weight: 57.1,
          weightConfirmed: true,
        },
        {
          user: {
            _id: "fighter2",
            voornaam: "Mariam",
            achternaam: "El Fakiri",
            club: { naam: "Elite Fight Club" },
            geboortedatum: "1999-08-22T00:00:00Z",
          },
          weight: 57.2,
          weightConfirmed: true,
        },
      ],
      winner: null,
    },
    {
      _id: "match2",
      fighters: [
        {
          user: {
            _id: "fighter3",
            voornaam: "Anis",
            achternaam: "Moussaoui",
            club: { naam: "MAC" },
            geboortedatum: "2008-01-10T00:00:00Z",
          },
          weight: 34.2,
          weightConfirmed: false,
        },
        {
          user: {
            _id: "fighter4",
            voornaam: "Kobe",
            achternaam: "Verwee",
            club: { naam: "Team Mahanakhon" },
            geboortedatum: "2008-03-15T00:00:00Z",
          },
          weight: 32.8,
          weightConfirmed: true,
        },
      ],
      winner: null,
    },
  ];

  const [localMatches, setLocalMatches] = useState(matches);
  const [selectedWinner, setSelectedWinner] = useState({});

  const handleConfirmWeight = (matchId, fighterIndex) => {
    setLocalMatches((prevMatches) =>
      prevMatches.map((match) => {
        if (match._id === matchId) {
          const updatedFighters = [...match.fighters];
          updatedFighters[fighterIndex].weightConfirmed =
            !updatedFighters[fighterIndex].weightConfirmed;
          return { ...match, fighters: updatedFighters };
        }
        return match;
      })
    );
  };

  const handleSetResult = (matchId, winnerId) => {
    setLocalMatches((prevMatches) =>
      prevMatches.map((match) => {
        if (match._id === matchId) {
          return { ...match, winner: winnerId };
        }
        return match;
      })
    );
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  return (
    <div className="event-matches-page">
      <div className="page-header">
        <Link href="/jury" className="back-button">
          ← Terug naar overzicht
        </Link>
        <h1>Matchmaking: Kickboks Gala Boom</h1>
      </div>

      <div className="matches-list">
        {localMatches.map((match, index) => (
          <div key={match._id} className="match-card">
            <div className="match-header">
              <h3>Match #{index + 1}</h3>
              <div
                className="match-status"
                onClick={() => {
                  if (match.winner) {
                    handleSetResult(match._id, null); // Clear winner
                    setSelectedWinner((prev) => ({
                      ...prev,
                      [match._id]: null,
                    })); // Clear selected winner
                  }
                }}
              >
                {match.winner ? (
                  match.winner === "draw" ? (
                    <span className="status-draw">Gelijkstand</span>
                  ) : (
                    <span className="status-completed">Voltooid</span>
                  )
                ) : (
                  <span className="status-pending">In afwachting</span>
                )}
              </div>
            </div>

            <div className="fighters-container">
              {match.fighters.map((fighter, fighterIndex) => (
                <div
                  key={fighter.user._id}
                  className={`fighter-card ${
                    fighterIndex === 0 ? "red-corner" : "blue-corner"
                  }`}
                >
                  <div className="fighter-info">
                    <h4>
                      {fighter.user.voornaam} {fighter.user.achternaam}
                    </h4>
                    <p>
                      <strong>Club:</strong> {fighter.user.club.naam}
                    </p>
                    <p>
                      <strong>Gewicht:</strong> {fighter.weight} kg
                    </p>
                    <p>
                      <strong>Leeftijd:</strong>{" "}
                      {calculateAge(fighter.user.geboortedatum)} jaar
                    </p>
                  </div>

                  <div className="fighter-actions">
                    <button
                      onClick={() =>
                        handleConfirmWeight(match._id, fighterIndex)
                      }
                      className={`weight-btn ${
                        fighter.weightConfirmed ? "confirmed" : ""
                      }`}
                      disabled={match.winner}
                    >
                      {fighter.weightConfirmed
                        ? "✓ Bevestigd"
                        : "Bevestig Gewicht"}
                    </button>

                    <div className="winner-selection">
                      <input
                        type="radio"
                        name={`winner-${match._id}`}
                        id={`winner-${match._id}-${fighter.user._id}`}
                        checked={selectedWinner[match._id] === fighter.user._id}
                        onChange={() =>
                          setSelectedWinner((prev) => ({
                            ...prev,
                            [match._id]: fighter.user._id,
                          }))
                        }
                        disabled={match.winner}
                      />
                      <label
                        htmlFor={`winner-${match._id}-${fighter.user._id}`}
                      >
                        Winnaar
                      </label>
                      {/* Gelijkstand (Draw) option */}
                      <input
                        type="radio"
                        name={`winner-${match._id}`}
                        id={`winner-${match._id}-draw`}
                        checked={selectedWinner[match._id] === "draw"}
                        onChange={() =>
                          setSelectedWinner((prev) => ({
                            ...prev,
                            [match._id]: "draw",
                          }))
                        }
                        disabled={match.winner}
                      />
                      <label htmlFor={`winner-${match._id}-draw`}>
                        Gelijkstand
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="match-actions">
              <button
                onClick={() =>
                  handleSetResult(match._id, selectedWinner[match._id])
                }
                className="result-btn"
                disabled={!selectedWinner[match._id] || match.winner}
              >
                {match.winner
                  ? match.winner === "draw"
                    ? "Gelijkspel Opgeslagen"
                    : "Resultaat Opgeslagen"
                  : "Sla Resultaat Op"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .event-matches-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
          position: relative;
        }

        .back-button {
          position: absolute;
          top: 0;
          left: 0;
          color: #3483fe;
          text-decoration: none;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .page-header h1 {
          text-align: center;
          color: var(--text-color);
          font-size: 1.8rem;
          margin: 0;
        }

        .matches-list {
          display: grid;
          gap: 2rem;
        }

        .match-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
        }

        .match-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eee;
        }

        .match-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #333;
        }

        .match-status {
          cursor: pointer; /* Indicate it's clickable */
        }

        .match-status .status-completed {
          background-color: #d4edda;
          color: #28a745;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .match-status .status-pending {
          background-color: #fff3cd;
          color: #856404;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .status-draw {
          background-color: #e0f2fe;
          color: #0b48ab;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .fighters-container {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .fighter-card {
          flex: 1;
          min-width: 280px;
          background-color: #f9f9f9;
          border-radius: 6px;
          padding: 1rem;
          border: 1px solid #e0e0e0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .fighter-card.red-corner {
          border-left: 5px solid #dc3545;
        }

        .fighter-card.blue-corner {
          border-left: 5px solid #007bff;
        }

        .fighter-info h4 {
          margin-top: 0;
          margin-bottom: 0.5rem;
          color: #333;
          font-size: 1rem;
        }

        .fighter-info p {
          margin: 0.25rem 0;
          color: #555;
          font-size: 0.9rem;
        }

        .fighter-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: auto; /* Push actions to the bottom */
        }

        .weight-btn {
          background-color: #6c757d;
          color: white;
          border: none;
          padding: 0.6rem 1rem;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s ease;
        }

        .weight-btn:hover:not(:disabled) {
          background-color: #5a6268;
        }

        .weight-btn.confirmed {
          background-color: #28a745;
          cursor: pointer; /* Keep cursor pointer for toggle */
        }

        .weight-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .winner-selection {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap; /* Allow wrapping for radio buttons */
        }

        .winner-selection input[type="radio"] {
          width: 1rem;
          height: 1rem;
          cursor: pointer;
        }

        .winner-selection label {
          color: #333;
          font-weight: 500;
          cursor: pointer;
        }

        .match-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .result-btn {
          background-color: #3483fe;
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.2s ease;
        }

        .result-btn:hover:not(:disabled) {
          background-color: #2b6cd9;
        }

        .result-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .event-matches-page {
            padding: 1rem;
          }

          .page-header h1 {
            font-size: 1.5rem;
          }

          .back-button {
            position: static;
            margin-bottom: 1rem;
          }

          .fighters-container {
            flex-direction: column;
            align-items: stretch;
          }

          .fighter-card {
            min-width: unset;
          }

          .match-actions {
            flex-direction: column;
            gap: 0.75rem;
          }

          .result-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default EventMatchesPage;
