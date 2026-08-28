import api, { publicApi } from "./api";
const API_URL = `https://afripoks-backend-production.up.railway.app/api/tables`;


export const getAll = async (setter, setSitCounts) => {
  try {
    const response = await api.get(API_URL);
    console.log("API Response full object:", response);
    console.log("API Response status:", response.status);
    console.log("API Response data:", response.data);

    // On vérifie si data existe ET si data.data n'est pas null
    if(response.data && response.data.data){
        console.log("Setting tables:", response.data.data);
        setter(response.data.data);
        const occupiedSeats = response.data.occupiedSeats || {};
        setSitCounts(new Map(Object.entries(occupiedSeats)));
    } else {
        console.warn("API renvoyé aucune table (data est null ou vide)");
        console.warn("Structure reçue:", JSON.stringify(response.data));
        setter([]); // On force un tableau vide pour éviter les erreurs
    }
  } catch (error) {
    console.error("Error in getAll:", error);
    setter([]); // On force un tableau vide en cas d'erreur
    throw new Error(error);
  }
};

export const getTablesInfos = async () => {
  try {
    const response = await api.get(API_URL);
    alert(JSON.stringify(response.data.occupiedSeats));
    const data = await response.json();
    
    alert(JSON.stringify(data));
  } catch (error) {}
}

export const getById = async (id) => {    
  try {
    const response = await api.get(API_URL+`/${id}`);
    return response.data?.data?.cave ?? null;
  } catch (error) {
    throw new Error(error);
  }
};

export const isUserInTable = async (userId) => {
  try { 
    const response = await api.get(API_URL+`/in-table/${userId}`);
    
    return response.data;
  } catch (error) {
    throw new Error(error);
  }
}

export const getLastHistory = async (tableId) => {
  try {
    const response = await api.get(`/api/historique/last-history/${tableId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching last history:', error);
    throw new Error(error);
  }
}

export default {getAll, getTablesInfos, getById, isUserInTable, getLastHistory};