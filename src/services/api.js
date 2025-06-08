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
    const token = localStorage.getItem("token");
    const response = await API.post("/events", eventData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Fout bij het aanmaken van een event:", error);
    throw error;
  }
};

// Verwijder een event
export const deleteEvent = async (eventId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await API.delete(`/events/${eventId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Fout bij het verwijderen van een event:", error);
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
export const fetchClubById = async (clubId) => {
  try {
    const response = await API.get(`/clubs/${clubId}`);
    if (!response.data) {
      throw new Error("No club data received");
    }
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching club:",
      error.response?.data || error.message
    );
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

export const fetchEventById = async (id) => {
  try {
    console.log("Fetching event by ID:", id);
    const response = await API.get(`/events/${id}`);
    console.log("Event API response:", {
      status: response.status,
      data: response.data,
      hasName: !!response.data?.name,
      hasTitle: !!response.data?.title,
      fields: response.data ? Object.keys(response.data) : [],
    });

    if (!response.data) {
      throw new Error("No event data received");
    }

    if (!response.data.name && !response.data.title) {
      console.warn("Event data missing name/title:", response.data);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching event:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error("Event niet gevonden");
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

// Jury API functions
export const fetchEventMatches = async (eventId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await API.get(`/jury/events/${eventId}/matches`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Event matches API response:", response.data); // Debug log
    // Ensure we return an array
    return Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data.matches)
      ? response.data.matches
      : [];
  } catch (error) {
    console.error("Error fetching event matches:", error);
    throw error;
  }
};

// Bevestig gewicht
export const confirmWeight = async (matchId, fighterIndex) => {
  try {
    const response = await API.patch(
      `/jury/matches/${matchId}/weight/${fighterIndex}`
    );
    return response.data;
  } catch (error) {
    console.error("Error confirming weight:", error);
    throw error;
  }
};

export const fetchMatchDetails = async (matchId) => {
  try {
    const response = await API.get(`/matches/${matchId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching match details:", error);
    throw error;
  }
};

export const fetchEvent = fetchEventById;

export const getEventWithMatches = async (eventId) => {
  try {
    const [event, matches] = await Promise.all([
      fetchEvent(eventId),
      fetchEventMatches(eventId),
    ]);
    return {
      ...event,
      matches,
    };
  } catch (error) {
    console.error("Error fetching event with matches:", error);
    throw error;
  }
};

// Stel resultaat in
export const setMatchResult = async (matchId, winnerId) => {
  try {
    const response = await API.patch(`/jury/matches/${matchId}/result`, {
      winnerId,
    });
    return response.data;
  } catch (error) {
    console.error("Error setting match result:", error);
    throw error;
  }
};

// Update current user
export const updateCurrentUser = async (userData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }

    const response = await API.patch("/users/me", userData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export default API;
