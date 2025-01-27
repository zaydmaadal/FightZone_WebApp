import React, { useEffect, useState } from "react";
import { fetchUsers } from "../services/api";
import "../assets/styles/pages/MembersPage.css";

const MembersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (err) {
        setError("Kan gebruikers niet ophalen.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  if (loading) return <p>Gegevens worden geladen...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="members-page">
      <div className="table-container">
        <h1>Ledenlijst</h1>
        <table className="table">
          <thead>
            <tr>
              <th>Naam</th>
              <th>Email</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.naam}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <a href="/add-member" className="add-member-button">
        Voeg Lid Toe
      </a>
    </div>
  );
};

export default MembersPage;
