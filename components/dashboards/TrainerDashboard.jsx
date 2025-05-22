export default function TrainerDashboard() {
  return (
    <div className="trainer-dashboard">
      <div className="dashboard-content">
        <div className="placeholder-content">
          <div className="placeholder-icon">👨‍🏫</div>
          <h2>Trainer Dashboard</h2>
          <p>Deze pagina is momenteel in ontwikkeling.</p>
          <p className="placeholder-subtext">
            Hier komt binnenkort een overzicht van trainingen, vechters en
            training statistieken.
          </p>
          <div className="user-type-badge">Trainer</div>
        </div>
      </div>

      <style jsx>{`
        .trainer-dashboard {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-content {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 3rem;
          text-align: center;
        }

        .placeholder-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .placeholder-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .placeholder-content h2 {
          color: var(--text-color);
          font-size: 1.5rem;
          margin: 0;
        }

        .placeholder-content p {
          color: var(--text-color);
          margin: 0;
        }

        .placeholder-subtext {
          color: var(--placeholder-color);
          font-size: 0.9rem;
        }

        .user-type-badge {
          background: #3483fe;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 500;
          margin-top: 1rem;
        }

        @media (max-width: 768px) {
          .trainer-dashboard {
            padding: 1rem;
          }

          .dashboard-content {
            padding: 2rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}
