import axios from "axios";

// Basis API-instellingen
const API = axios.create({
  baseURL: "https://fightzone-api.onrender.com/api/v1",

  withCredentials: true,
});

// Haal huidige gebruiker op
export const fetchCurrentUser = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("Geen token in localStorage");
    return null;
  }

  try {
    const response = await API.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Fout bij ophalen gebruiker:", {
      status: error.response?.status,
      data: error.response?.data,
    });

    // Auto-logout bij 401
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return null;
  }
};

// Haal alle events op
export const fetchEvents = async () => {
  try {
    const response = await API.get("/events");
    return response.data;
  } catch (error) {
    console.error("Fout bij het ophalen van events:", error);
    throw error;
  }
};

// Maak een nieuw event aan
export const createEvent = async (eventData) => {
  try {
    const response = await API.post("/events", eventData);
    return response.data;
  } catch (error) {
    console.error("Fout bij het aanmaken van een event:", error);
    throw error;
  }
};

// Synchroniseer VKBMO events
export const syncVkbmoEvents = async () => {
  try {
    const response = await API.post("/vkbmo-sync");
    return response.data;
  } catch (error) {
    console.error("Fout bij het synchroniseren van VKBMO events:", error);
    throw error;
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

export const validateLicense = async (qrData) => {
  try {
    const response = await API.post("/licenses/validate", qrData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Validatiefout details:", error.response?.data);
    throw error;
  }
};

export const deleteUserById = async (id) => {
  try {
    const response = await API.delete(`/users/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Fout bij het verwijderen van gebruiker:", error);
    throw error;
  }
};

export default API;
