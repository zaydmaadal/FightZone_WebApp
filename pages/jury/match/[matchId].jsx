"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../../../src/services/auth";
import {
  fetchMatchDetails,
  setMatchResult,
  fetchUserById,
  fetchClubs,
  fetchEventById,
} from "../../../src/services/api";
import Loading from "../../../components/Loading";
import { ArrowLeftCircleIcon } from "@heroicons/react/24/outline";

const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

export default function MatchDetails() {
  const router = useRouter();
  const { matchId } = router.query;
  const { user, loading: authLoading } = useAuth();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settingResult, setSettingResult] = useState(false);
  const [confirmingWeight, setConfirmingWeight] = useState(false);
  const [fightersData, setFightersData] = useState({});
  const [clubs, setClubs] = useState([]);
  const [eventData, setEventData] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadMatchDetails = async () => {
      if (!matchId) return;

      try {
        const [matchData, clubsData] = await Promise.all([
          fetchMatchDetails(matchId),
          fetchClubs(),
        ]);
        console.log("Match data:", matchData);
        setMatch(matchData);
        setClubs(clubsData);

        // Fetch event data if we have an eventId
        if (matchData.eventId?._id) {
          try {
            const eventDetails = await fetchEventById(matchData.eventId._id);
            setEventData(eventDetails);
          } catch (error) {
            console.error("Error fetching event details:", error);
          }
        }

        // Fetch additional fighter data
        const fighterPromises = matchData.fighters.map(async (fighter) => {
          if (fighter.user?._id) {
            try {
              const userData = await fetchUserById(fighter.user._id);
              return { [fighter.user._id]: userData };
            } catch (error) {
              console.error(
                `Error fetching fighter data for ${fighter.user._id}:`,
                error
              );
              return null;
            }
          }
          return null;
        });

        const fighterResults = await Promise.all(fighterPromises);
        const fighterMap = fighterResults.reduce((acc, curr) => {
          if (curr) {
            return { ...acc, ...curr };
          }
          return acc;
        }, {});
        setFightersData(fighterMap);
      } catch (error) {
        console.error("Error loading match details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && matchId) {
      loadMatchDetails();
    }
  }, [matchId, user]);

  const handleConfirmWeight = async (fighterIndex) => {
    if (!match || confirmingWeight) return;

    setConfirmingWeight(true);
    try {
      // Call API to confirm weight
      await fetch(`/api/matches/${matchId}/confirm-weight`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fighterIndex }),
      });

      // Refresh match details after confirming weight
      const updatedMatch = await fetchMatchDetails(matchId);
      setMatch(updatedMatch);
    } catch (error) {
      console.error("Error confirming weight:", error);
      alert("Er is een fout opgetreden bij het bevestigen van het gewicht.");
    } finally {
      setConfirmingWeight(false);
    }
  };

  const handleSetResult = async (winnerId) => {
    if (!match || settingResult) return;

    setSettingResult(true);
    try {
      await setMatchResult(match._id, winnerId);
      // Refresh match details after setting result
      const updatedMatch = await fetchMatchDetails(matchId);
      setMatch(updatedMatch);
    } catch (error) {
      console.error("Error setting match result:", error);
      alert("Er is een fout opgetreden bij het instellen van het resultaat.");
    } finally {
      setSettingResult(false);
    }
  };

  const getClubName = (clubId) => {
    if (!clubs.length) return "-";
    const club = clubs.find((c) => c._id === clubId);
    return club ? club.naam : "-";
  };

  if (loading || authLoading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  if (!match) {
    return (
      <div className="match-details-page">
        <div className="error-message">
          <p>Match niet gevonden.</p>
          <Link href="/jury" className="back-link">
            Terug naar overzicht
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="match-details-page">
      <div className="page-header">
        {match?.eventId?._id ? (
          <Link href={`/jury/${match.eventId._id}`} className="back-button">
            <ArrowLeftCircleIcon className="w-6 h-6" width={24} height={24} />
            Terug
          </Link>
        ) : (
          <Link href="/jury" className="back-button">
            <ArrowLeftCircleIcon className="w-6 h-6" width={24} height={24} />
            Terug
          </Link>
        )}
        <h1>Match Details</h1>
        <p className="event-name">
          {eventData?.name || "Event details niet beschikbaar"}
        </p>
      </div>

      <div className="match-details-container">
        <div className="fighters-section">
          {match.fighters[0] && (
            <div className="fighter-card fighter1">
              <h2>Vechter 1</h2>
              <div className="fighter-info">
                <p className="fighter-name">
                  {match.fighters[0].user?.voornaam}{" "}
                  {match.fighters[0].user?.achternaam}
                </p>
                <div className="fighter-details">
                  <div className="detail-item">
                    <span className="label">Gewicht:</span>
                    <span className="value">
                      {match.fighters[0].weight} kg
                      {!match.fighters[0].weightConfirmed && (
                        <button
                          onClick={() => handleConfirmWeight(0)}
                          className="confirm-btn"
                        >
                          Bevestig
                        </button>
                      )}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Leeftijd:</span>
                    <span className="value">
                      {fightersData[match.fighters[0].user?._id]?.geboortedatum
                        ? calculateAge(
                            fightersData[match.fighters[0].user._id]
                              .geboortedatum
                          )
                        : "-"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Club:</span>
                    <span className="value">
                      {getClubName(match.fighters[0].user?.club)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="vs-badge">VS</div>

          {match.fighters[1] && (
            <div className="fighter-card fighter2">
              <h2>Vechter 2</h2>
              <div className="fighter-info">
                <p className="fighter-name">
                  {match.fighters[1].user?.voornaam}{" "}
                  {match.fighters[1].user?.achternaam}
                </p>
                <div className="fighter-details">
                  <div className="detail-item">
                    <span className="label">Gewicht:</span>
                    <span className="value">
                      {match.fighters[1].weight} kg
                      {!match.fighters[1].weightConfirmed && (
                        <button
                          onClick={() => handleConfirmWeight(1)}
                          className="confirm-btn"
                        >
                          Bevestig
                        </button>
                      )}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Leeftijd:</span>
                    <span className="value">
                      {fightersData[match.fighters[1].user?._id]?.geboortedatum
                        ? calculateAge(
                            fightersData[match.fighters[1].user._id]
                              .geboortedatum
                          )
                        : "-"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Club:</span>
                    <span className="value">
                      {getClubName(match.fighters[1].user?.club)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {match?.status !== "completed" && (
          <div className="result-section">
            <h2>Resultaat instellen</h2>
            <div className="result-options">
              <button
                onClick={() => handleSetResult(match.fighters[0]?.user?._id)}
                className="result-btn fighter1"
                disabled={settingResult}
              >
                {match.fighters[0]?.user?.voornaam} wint
              </button>
              <button
                onClick={() => handleSetResult(null)}
                className="result-btn draw"
                disabled={settingResult}
              >
                Gelijkspel
              </button>
              <button
                onClick={() => handleSetResult(match.fighters[1]?.user?._id)}
                className="result-btn fighter2"
                disabled={settingResult}
              >
                {match.fighters[1]?.user?.voornaam} wint
              </button>
            </div>
          </div>
        )}

        {match?.notes && (
          <div className="notes-section">
            <h2>Notities</h2>
            <p className="notes-content">{match.notes}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .match-details-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
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
          background-color: #2b6cd9;
        }

        .page-header h1 {
          color: var(--text-color);
          font-size: 2rem;
          margin: 0 0 0.5rem 0;
        }

        .event-name {
          color: var(--placeholder-color);
          margin: 0;
          font-size: 0.9rem;
        }

        .match-details-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .fighters-section {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 2rem;
          align-items: center;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 2rem;
        }

        .fighter-card {
          padding: 1.5rem;
          border-radius: 6px;
          background: var(--background-color);
        }

        .fighter-card h2 {
          color: var(--text-color);
          font-size: 1.25rem;
          margin: 0 0 1rem 0;
        }

        .fighter-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-color);
          margin: 0 0 1rem 0;
        }

        .fighter-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .label {
          color: var(--placeholder-color);
          font-size: 0.9rem;
        }

        .value {
          color: var(--text-color);
          font-weight: 500;
        }

        .confirmed {
          color: var(--success-color);
        }

        .pending {
          color: var(--warning-color);
        }

        .vs-badge {
          background: var(--primary-color);
          color: white;
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.2rem;
        }

        .match-info-section {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 2rem;
        }

        .match-info-section h2 {
          color: var(--text-color);
          font-size: 1.25rem;
          margin: 0 0 1.5rem 0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .status-scheduled {
          color: var(--info-color);
        }

        .status-in-progress {
          color: var(--warning-color);
        }

        .status-completed {
          color: var(--success-color);
        }

        .notes-section {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 2rem;
        }

        .notes-section h2 {
          color: var(--text-color);
          font-size: 1.25rem;
          margin: 0 0 1rem 0;
        }

        .notes-content {
          color: var(--text-color);
          line-height: 1.6;
          margin: 0;
          white-space: pre-wrap;
        }

        .error-message {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .error-message p {
          color: var(--error-color);
          margin: 0 0 1rem 0;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: var(--placeholder-color);
        }

        .result-section {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          margin-top: 2rem;
        }

        .result-section h2 {
          color: var(--text-color);
          font-size: 1.25rem;
          margin: 0 0 1.5rem 0;
        }

        .result-options {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .result-btn {
          padding: 1rem 1.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .result-btn.fighter1 {
          background: rgba(255, 0, 0, 0.1);
          color: #d00;
        }

        .result-btn.fighter2 {
          background: rgba(0, 0, 255, 0.1);
          color: #00d;
        }

        .result-btn.draw {
          background: rgba(0, 128, 0, 0.1);
          color: #080;
        }

        .result-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .confirm-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 0.3rem 0.8rem;
          border-radius: 4px;
          cursor: pointer;
          margin-left: 0.5rem;
          font-size: 0.8rem;
        }

        @media (max-width: 768px) {
          .match-details-page {
            padding: 1rem;
          }

          .fighters-section {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            padding: 1.5rem;
          }

          .vs-badge {
            margin: 0 auto;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .result-options {
            flex-direction: column;
            align-items: stretch;
          }

          .result-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
