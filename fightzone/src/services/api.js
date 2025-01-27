import axios from "axios";

// Basisinstelling voor de API
const API = axios.create({
  baseURL: "https://fightzone-api.onrender.com/api/v1", // Je API-basis-URL
});

// Endpoint: Haal alle gebruikers op
export const fetchUsers = async () => {
  try {
    const response = await API.get("/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Endpoint: Voeg een gebruiker toe
export const createUser = async (userData) => {
  try {
    const response = await API.post("/users", userData);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Voeg meer functies toe voor PUT, DELETE, etc.
export const updateUser = async (userId, userData) => {
  try {
    const response = await API.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    await API.delete(`/users/${userId}`);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export default API;
