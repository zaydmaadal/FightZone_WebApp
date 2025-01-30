import React, { useEffect, useState } from "react";
import { fetchUsers } from "../services/api";
import { Link } from "react-router-dom";
import "../assets/styles/pages/MembersPage.css";

const MembersPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        console.error("Fout bij het ophalen van leden:", error);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.voornaam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.achternaam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.club.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="members-page">
      <h1 className="page-title">Ledenlijst</h1>

      {/* Zoekbalk */}
      <input
        type="text"
        placeholder="Zoek op naam, club of rol..."
        className="search-bar"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Ledenlijst Tabel */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Profielfoto</th>
              <th>Naam</th>
              <th>Club</th>
              <th>Rol</th>
              <th>Acties</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <img
                      src={user.profielfoto}
                      alt={user.voornaam}
                      className="profile-img"
                    />
                  </td>
                  <td>{user.voornaam} {user.achternaam}</td>
                  <td>{user.club}</td>
                  <td>{user.role}</td>
                  <td>
                    <Link to={`/member/${user._id}`} className="view-button">
                      Bekijk
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">
                  Geen leden gevonden
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Voeg Lid Toe Knop */}
      <Link to="/add-member" className="add-member-button">
        Voeg Lid Toe
      </Link>
    </div>
  );
};

export default MembersPage;
