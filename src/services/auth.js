import axios from "axios";

const API = axios.create({
  baseURL: "https://fightzone-api.onrender.com/api/v1",
});

// Functie om in te loggen
export const loginUser = async (credentials) => {
  try {
    const response = await API.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    throw new Error("Inloggen mislukt. Controleer je gegevens.");
  }
};

// Functie om de huidige gebruiker op te halen (optioneel)
export const getCurrentUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  // Decodeer de token om de gebruikersrol te krijgen
  const decodedToken = JSON.parse(atob(token.split(".")[1]));
  return decodedToken;
};
