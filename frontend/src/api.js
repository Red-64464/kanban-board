import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

export const getTaches = () => api.get("/taches");
export const createTache = (data) => api.post("/taches", data);
export const updateTache = (id, data) => api.put(`/taches/${id}`, data);
export const updateStatut = (id, statut, position) =>
  api.patch(`/taches/${id}/statut`, { statut, position });
export const deleteTache = (id) => api.delete(`/taches/${id}`);
