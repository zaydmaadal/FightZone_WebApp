"use client";
import React, { useState, useEffect } from "react";
import styles from "../../styles/SettingsPage.module.css";
import { useAuth } from "../../src/services/auth";
import { fetchCurrentUser, updateCurrentUser, uploadProfilePicture, fetchClubById } from "../../src/services/api";

export default function Settings() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [clubName, setClubName] = useState(""); // Nieuwe state voor clubnaam
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    club: "",
    newPassword: "",
    confirmPassword: "",
    emailNotifications: false,
    pushNotifications: false,
  });

  // Bij mount de form vullen vanuit de user-context
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        firstName: user.voornaam || "",
        lastName: user.achternaam || "",
        email: user.email || "",
        club: user.club || "",
        emailNotifications: user.emailNotifications || false,
        pushNotifications: user.pushNotifications || false,
      }));
      if (user.profilePicture) {
        setImagePreview(user.profilePicture);
      }
      if (user.club) {
        const getClubName = async () => {
          try {
            const clubData = await fetchClubById(user.club);
            setClubName(clubData.naam || "");
          } catch (error) {
            console.error("Error fetching club name:", error);
            setClubName("Unknown Club"); // Set a default in case of error
          }
        };
        getClubName();
      }
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setImagePreview(user.profilePicture || null);
    }
  };

  // Opslaan (PATCH + context refresh)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {};
      if (activeTab === "security") {
        payload.newPassword = form.newPassword;
        payload.confirmPassword = form.confirmPassword;
      } else if (activeTab === "notifications") {
        payload.emailNotifications = form.emailNotifications;
        payload.pushNotifications = form.pushNotifications;
      } else if (activeTab === "account") {
        payload.email = form.email;
      }

      let userUpdated = false;

      if (Object.keys(payload).length > 0) {
        await updateCurrentUser(payload);
        userUpdated = true;
      }

      if (selectedFile) {
        await uploadProfilePicture(selectedFile);
        userUpdated = true;
      }

      if (userUpdated) {
        const refreshed = await fetchCurrentUser();
        setUser(refreshed);
        alert("Bijgewerkt!");
      } else {
        alert("No changes to update or account information cannot be updated from this page.");
      }
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
      email: user.email || "",
      newPassword: "",
      confirmPassword: "",
      emailNotifications: user.emailNotifications || false,
      pushNotifications: user.pushNotifications || false,
    }));
    setImagePreview(user.profilePicture || null);
    setSelectedFile(null);
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
            <>
              <div className={styles.profilePictureSection}>
                <label>Your Profile Picture</label>
                <div
                  className={styles.profilePictureUpload}
                  onClick={() => document.getElementById("profilePictureInput").click()}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className={styles.profileImagePreview}
                    />
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-upload"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" x2="12" y1="3" y2="15" />
                      </svg>
                      <span>Upload your photo</span>
                    </>
                  )}
                  <input
                    id="profilePictureInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </div>
              </div>
              <form className={styles.formGrid}>
                <div className={styles.item}>
                  <label>First Name</label>
                  <input
                    name="firstName"
                    type="text"
                    value={form.firstName}
                    className={styles.disabledInput}
                  />
                </div>
                <div className={styles.item}>
                  <label>Last Name</label>
                  <input
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    className={styles.disabledInput}
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
                {user && (user.role === "Vechter" || user.role === "Trainer") && (
                  <div className={styles.item}>
                    <label>Club</label>
                    <input
                      name="club"
                      type="text"
                      value={clubName}
                      className={styles.disabledInput}
                    />
                  </div>
                )}
              </form>
            </>
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
