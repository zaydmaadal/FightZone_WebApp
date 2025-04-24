export default function VechterDashboard() {
  return (
    <div className="vechter-dashboard">
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Aankomende Trainingen</h3>
          <div className="training-list">
            <div className="training-item">
              <span className="time">14:00</span>
              <span className="title">Kickboxing Training</span>
              <span className="trainer">Trainer: John Doe</span>
            </div>
            <div className="training-item">
              <span className="time">16:00</span>
              <span className="title">Sparring Sessie</span>
              <span className="trainer">Trainer: Jane Smith</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Mijn Prestaties</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">12</span>
              <span className="stat-label">Trainingen</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">3</span>
              <span className="stat-label">Wedstrijden</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">85%</span>
              <span className="stat-label">Aanwezigheid</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Volgende Wedstrijd</h3>
          <div className="next-match">
            <div className="match-info">
              <span className="date">15 April 2024</span>
              <span className="opponent">Tegenstander: Mike Johnson</span>
              <span className="weight">Gewichtsklasse: -75kg</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .vechter-dashboard {
          padding: 20px;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .dashboard-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .dashboard-card h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 18px;
        }

        .training-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .training-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .time {
          color: #3483fe;
          font-weight: 500;
        }

        .title {
          font-weight: 500;
        }

        .trainer {
          color: #666;
          font-size: 14px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #3483fe;
        }

        .stat-label {
          font-size: 14px;
          color: #666;
        }

        .next-match {
          background: #f8f9fa;
          border-radius: 6px;
          padding: 15px;
        }

        .match-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .date {
          color: #3483fe;
          font-weight: 500;
        }

        .opponent,
        .weight {
          color: #666;
        }
      `}</style>
    </div>
  );
}
