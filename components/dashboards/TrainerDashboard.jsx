export default function TrainerDashboard() {
  return (
    <div className="trainer-dashboard">
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Vandaag Trainingen</h3>
          <div className="training-list">
            <div className="training-item">
              <span className="time">10:00</span>
              <span className="title">Kickboxing Beginners</span>
              <span className="participants">8 deelnemers</span>
            </div>
            <div className="training-item">
              <span className="time">14:00</span>
              <span className="title">Sparring Gevorderden</span>
              <span className="participants">6 deelnemers</span>
            </div>
            <div className="training-item">
              <span className="time">16:00</span>
              <span className="title">Techniek Training</span>
              <span className="participants">10 deelnemers</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Mijn Vechters</h3>
          <div className="fighters-list">
            <div className="fighter-item">
              <span className="name">Mike Johnson</span>
              <span className="category">-75kg</span>
              <span className="next-match">Wedstrijd: 15 April</span>
            </div>
            <div className="fighter-item">
              <span className="name">Sarah Williams</span>
              <span className="category">-65kg</span>
              <span className="next-match">Wedstrijd: 20 April</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Training Statistieken</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">24</span>
              <span className="stat-label">Trainingen deze week</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">45</span>
              <span className="stat-label">Actieve vechters</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">8</span>
              <span className="stat-label">Aankomende wedstrijden</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .trainer-dashboard {
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

        .participants {
          color: #666;
          font-size: 14px;
        }

        .fighters-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .fighter-item {
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

        .category {
          color: #3483fe;
          font-size: 14px;
        }

        .next-match {
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
