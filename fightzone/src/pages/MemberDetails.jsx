import React from "react";
import "../assets/styles/pages/MemberDetails.css";
import AmineImage from "../assets/images/AmineElBoujadaini.png";

const MemberDetails = () => {
  const member = {
    naam: "Amine El Boujadaini",
    nickname: "Gladiator",
    record: "24-9-5 (W-L-D)",
    kampioen: "Champion lightweight",
    ranking: "#3",
    status: "Actief",
    club: "Champions Gym Boom",
    email: "Amine.El@outlook.com",
    verzekering: true,
    gewicht: 68,
    leeftijd: 20,
    klasse: "A Klasse",
    fightHistory: [
      {
        datum: "12 Februari - Boom",
        event: "Enfusion title fight - Main event",
        tegenstander: "Johnny Walker",
        resultaat: "24-9-5 (W-L-D)",
      },
      {
        datum: "12 Februari - Boom",
        event: "Enfusion title fight - Main event",
        tegenstander: "Johnny Walker",
        resultaat: "24-9-5 (W-L-D)",
      },
    ],
  };

  return (
    <div className="member-details">
      {/* Header */}
      <div className="header">
        <img
          src={AmineImage}
          alt={member.naam}
          className="profile-image"
        />
        <div className="details">
          <h1>{member.naam}</h1>
          <p className="nickname">"{member.nickname}"</p>
          <p>{member.record}</p>
          <p>
            <span className="highlight">{member.kampioen}</span>{" "}
            <span className="highlight">{member.ranking}</span>{" "}
            <span className="highlight">{member.status}</span>{" "}
            <span className="highlight">{member.club}</span>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat">
          <h2>{member.gewicht} kg</h2>
          <p>Gewicht</p>
        </div>
        <div className="stat">
          <h2>{member.leeftijd}</h2>
          <p>Leeftijd</p>
        </div>
        <div className="stat">
          <h2>{member.klasse}</h2>
          <p>Klasse</p>
        </div>
      </div>

      {/* Info */}
      <div className="info">
        <h2>Info</h2>
        <table>
          <tbody>
            <tr>
              <td>Verzekering</td>
              <td className={member.verzekering ? "valid" : "invalid"}>
                {member.verzekering ? "Geldig" : "Niet geldig"}
              </td>
            </tr>
            <tr>
              <td>Club</td>
              <td>{member.club}</td>
            </tr>
            <tr>
              <td>Email</td>
              <td>{member.email}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Fight History */}
      <div className="fight-history">
        <h2>Fight history</h2>
        {member.fightHistory.map((fight, index) => (
          <div key={index} className="fight">
            <p>
              <strong>{fight.datum}</strong> - {fight.event}
            </p>
            <p>
              Tegenstander: <strong>{fight.tegenstander}</strong>
            </p>
            <p>Resultaat: {fight.resultaat}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberDetails;
