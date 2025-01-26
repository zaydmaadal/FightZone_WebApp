import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../assets/styles/components/Sidebar.module.css';

const Sidebar = () => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>FightZone</div>
      <nav className={styles.nav}>
        <ul>
          <li>
            <Link to="/" className={styles['nav-link']}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/members" className={styles['nav-link']}>
              Ledenlijst
            </Link>
          </li>
          <li>
            <Link to="/settings" className={styles['nav-link']}>
              Instellingen
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
