import axios from "axios";

// Basis API-instellingen
const API = axios.create({
  baseURL: "https://fightzone-api.onrender.com/api/v1",
});

// Haal huidige gebruiker op
export const fetchCurrentUser = async () => {
  try {
    const response = await API.get("/auth/me", {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Fout bij ophalen van de ingelogde gebruiker:", error);
    return null;
  }
};

// Haal alle leden op
export const fetchUsers = async () => {
  try {
    const response = await API.get("/users");
    return response.data;
  } catch (error) {
    console.error("Fout bij het ophalen van gebruikers:", error);
    throw error;
  }
};

// Haal clubs op
export const fetchClubs = async () => {
  try {
    const response = await API.get("/clubs");
    return response.data;
  } catch (error) {
    console.error("Fout bij het ophalen van clubs:", error);
    throw error;
  }
};

//Haal club op basis van ID
export const fetchClubById = async (id) => {
  try {
    const response = await API.get(`/clubs/${id}`);
    return response.data;
  } catch (error) {
    console.error("Fout bij het ophalen van club:", error);
    throw error;
  }
};

// Voeg een nieuw lid toe
export const createUser = async (userData) => {
  try {
    const response = await API.post("/users", userData);
    return response.data;
  } catch (error) {
    console.error("Fout bij het toevoegen van een gebruiker:", error);
    throw error;
  }
};

export const fetchUserById = async (id) => {
  try {
    const response = await API.get("/users"); // Haal alle gebruikers op
    const users = response.data;

    const user = users.find((user) => user._id === id);

    if (!user) {
      throw new Error("Gebruiker niet gevonden");
    }

    return user;
  } catch (error) {
    console.error("Fout bij het ophalen van gebruiker:", error);
    throw error;
  }
};

export default API;
