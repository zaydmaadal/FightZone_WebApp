import React from "react";
import styles from "../styles/SettingsPage.module.css";

const Settings = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Instellingen</h1>
      <p className={styles.subtitle}>Beheer je persoonlijke voorkeuren en clubinstellingen.</p>

      {/* Persoonlijke gegevens */}
      <section className={styles.section}>
        <h2>👤 Persoonlijke gegevens</h2>
        <div className={styles.item}>
          <label>Naam</label>
          <input type="text" placeholder="Voornaam Achternaam" />
        </div>
        <div className={styles.item}>
          <label>Email</label>
          <input type="email" placeholder="jij@voorbeeld.com" />
        </div>
      </section>

      {/* Meldingen */}
      <section className={styles.section}>
        <h2>🔔 Meldingen</h2>
        <div className={styles.itemToggle}>
          <label>Ontvang e-mailmeldingen</label>
          <input type="checkbox" defaultChecked />
        </div>
        <div className={styles.itemToggle}>
          <label>Pushmeldingen op mobiel</label>
          <input type="checkbox" />
        </div>
        <div className={styles.itemToggle}>
          <label>Herinner mij aan wedstrijden</label>
          <input type="checkbox" />
        </div>
      </section>

      {/* Taal en regio */}
      <section className={styles.section}>
        <h2>🌍 Taal & Regio</h2>
        <div className={styles.item}>
          <label>Taal</label>
          <select>
            <option>Nederlands</option>
            <option>Engels</option>
            <option>Frans</option>
          </select>
        </div>
        <div className={styles.item}>
          <label>Federatie/Regio</label>
          <select>
            <option>Vlaanderen</option>
            <option>Wallonië</option>
            <option>Nederland</option>
          </select>
        </div>
      </section>

      {/* Veiligheid */}
      <section className={styles.section}>
        <h2>🔐 Veiligheid</h2>
        <div className={styles.item}>
          <label>Huidig wachtwoord</label>
          <input type="password" placeholder="••••••••" />
        </div>
        <div className={styles.item}>
          <label>Nieuw wachtwoord</label>
          <input type="password" placeholder="••••••••" />
        </div>
      </section>

      {/* Clubinstellingen */}
      <section className={styles.section}>
        <h2>🏋️ Clubinstellingen</h2>
        <div className={styles.itemToggle}>
          <label>QR-scan voor aanwezigheid</label>
          <input type="checkbox" />
        </div>
        <div className={styles.itemToggle}>
          <label>Licentie automatisch controleren</label>
          <input type="checkbox" defaultChecked />
        </div>
      </section>

      <button className={styles.saveBtn}>Wijzigingen opslaan</button>
    </div>
  );
};

export default Settings;
