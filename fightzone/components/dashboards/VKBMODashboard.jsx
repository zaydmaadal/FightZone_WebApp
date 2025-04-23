export default function VKBMODashboard() {
  return (
    <div className="vkbm-dashboard">
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Club Overzicht</h3>
          <div className="clubs-list">
            <div className="club-item">
              <span className="name">Kickboxing Amsterdam</span>
              <span className="members">120 leden</span>
              <span className="trainers">5 trainers</span>
            </div>
            <div className="club-item">
              <span className="name">Muay Thai Rotterdam</span>
              <span className="members">85 leden</span>
              <span className="trainers">3 trainers</span>
            </div>
            <div className="club-item">
              <span className="name">Boxing Den Haag</span>
              <span className="members">95 leden</span>
              <span className="trainers">4 trainers</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Landelijke Statistieken</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">1,250</span>
              <span className="stat-label">Totaal Leden</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">45</span>
              <span className="stat-label">Aangesloten Clubs</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">28</span>
              <span className="stat-label">Actieve Trainers</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .vkbm-dashboard {
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

        .clubs-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .club-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .name {
          font-weight: 500;
        }

        .members,
        .trainers {
          color: #666;
          font-size: 14px;
        }

        .events-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .event-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .date {
          color: #3483fe;
          font-weight: 500;
        }

        .title {
          font-weight: 500;
        }

        .location {
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
      `}</style>
    </div>
  );
}
