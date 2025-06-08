// components/Settings.js
"use client";
import React, { useState, useEffect } from "react";
import styles from "../styles/SettingsPage.module.css";
import { useAuth } from "../src/services/auth";
import { fetchCurrentUser, updateCurrentUser } from "../src/services/api";

export default function Settings() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [form, setForm] = useState({
    username: "",
    email: "",
    bio: "",
    newPassword: "",
    confirmPassword: "",
    // voeg hier eventueel notificatie-settings toe
  });

  // Bij mount de form vullen vanuit de user-context
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        username: user.gebruikersnaam || "",
        email: user.email || "",
        bio: user.bio || "",
      }));
    }
  }, [user]);

  // Algemene change-handler voor inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Opslaan (PATCH + context refresh)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // verstuur enkel de relevante velden per tab
      const payload = {};
      if (activeTab === "account") {
        payload.gebruikersnaam = form.username;
        payload.email = form.email;
        payload.bio = form.bio;
      } else if (activeTab === "security") {
        payload.newPassword = form.newPassword;
        payload.confirmPassword = form.confirmPassword;
      } else {
        // notifications: voeg hier payload samen
      }
      await updateCurrentUser(payload);
      const refreshed = await fetchCurrentUser();
      setUser(refreshed);
      alert("Bijgewerkt!");
    } catch (err) {
      console.error(err);
      alert("Opslaan mislukt");
    }
  };

  // Reset naar oorspronkelijke waarden van de user
  const handleReset = () => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      username: user.gebruikersnaam || "",
      email: user.email || "",
      bio: user.bio || "",
      newPassword: "",
      confirmPassword: "",
      // reset notifications-velden indien nodig
    }));
  };

  return (
    <div className={styles.container}>
      {/* Main content */}
      <div className={styles.content}>
        <h1 className={styles.title}>Edit profile</h1>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={activeTab === "account" ? styles.tabActive : ""}
            onClick={() => setActiveTab("account")}
          >
            Account Setting
          </button>
          <button
            className={activeTab === "security" ? styles.tabActive : ""}
            onClick={() => setActiveTab("security")}
          >
            Login &amp; Security
          </button>
          <button
            className={activeTab === "notifications" ? styles.tabActive : ""}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </button>
        </div>

        {/* Inner content card */}
        <div className={styles.innerContent}>
          {/* alleen in Account Setting */}
          {activeTab === "account" && (
            <form className={styles.formGrid}>
              <div className={styles.item}>
                <label>Username</label>
                <input
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.item}>
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.itemFull}>
                <label>Bio</label>
                <textarea
                  name="bio"
                  rows={4}
                  value={form.bio}
                  onChange={handleChange}
                />
              </div>
            </form>
          )}

          {/* alleen in Login & Security */}
          {activeTab === "security" && (
            <>
              <p className={styles.securityNote}>
                Nieuwe wachtwoord moet verschillend zijn van het vorige
                gebruikte wachtwoord
              </p>
              <form className={styles.formGrid}>
                <div className={styles.itemFull}>
                  <label>New password</label>
                  <input
                    name="newPassword"
                    type="password"
                    value={form.newPassword}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.itemFull}>
                  <label>Confirm password</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </form>
            </>
          )}

          {/* alleen in Notifications */}
          {activeTab === "notifications" && (
            <form className={styles.formGrid}>
              {/* voorbeeld toggle */}
              <div className={styles.itemFull}>
                <label>
                  <input
                    name="emailNotifications"
                    type="checkbox"
                    checked={!!form.emailNotifications}
                    onChange={handleChange}
                  />{" "}
                  Ontvang e-mailmeldingen
                </label>
              </div>
              <div className={styles.itemFull}>
                <label>
                  <input
                    name="pushNotifications"
                    type="checkbox"
                    checked={!!form.pushNotifications}
                    onChange={handleChange}
                  />{" "}
                  Pushmeldingen op mobiel
                </label>
              </div>
            </form>
          )}
        </div>

        {/* Actions: altijd zichtbaar */}
        <div className={styles.actions}>
          <button className={styles.saveBtn} onClick={handleSubmit}>
            Update Profile
          </button>
          <button className={styles.resetBtn} onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
