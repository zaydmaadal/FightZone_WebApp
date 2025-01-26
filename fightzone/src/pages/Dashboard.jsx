import React from 'react';
import styles from '../assets/styles/pages/Dashboard.module.css';

const Dashboard = () => {
  return (
    <div className={styles.dashboard}>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className={styles.card}>
          <h2>Aantal Leden</h2>
          <p className="text-3xl font-bold">121</p>
          <p className="text-sm text-green-600">8.5% Sinds September</p>
        </div>
        <div className={styles.card}>
          <h2>Aantal Vechters</h2>
          <p className="text-3xl font-bold">32</p>
          <p className="text-sm text-green-600">30% van uw Leden</p>
        </div>
        <div className={styles.card}>
          <h2>Geplande Events</h2>
          <p className="text-3xl font-bold">21</p>
          <p className="text-sm text-green-600">5 meer dan 2023</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
