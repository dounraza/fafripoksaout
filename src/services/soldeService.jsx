import api from "./api";
import apiAdmin from "./apiAdmin";
const API_URL = `/api/solde`;

export const soldeInit = async (data) => {    
  try {
    await api.post(API_URL+"/init", data);
  } catch (error) {
    throw new Error(error);
  }
};

export const fetchSolde = async (userId) => {
    try {
      const response = await api.get(API_URL+`/${userId}`);
      return response.data.solde;
    } catch (error) {
      console.error("Erreur fetchSolde:", error.response ? error.response.data : error.message);
      throw new Error(error);
    }
  };

export const getSolde = async (userId, setSold) => {    
    try {
      console.log(`[getSolde] Fetching balance for userId: ${userId}`);
      const response = await api.get(API_URL+`/${userId}`);

      console.log("[getSolde] API response:", response);

      if(response.data){
          console.log("[getSolde] Data received:", response.data);
          setSold(response.data.solde); 
      } else {
          console.warn("[getSolde] No data in response.");
      }
    } catch (error) {
      console.error("Erreur getSolde:", error.response ? error.response.data : error.message);
      throw new Error(error);
    }
  };

export const updateSolde = async (userId, newSolde) => {
    try {
      await api.post(`${API_URL}/update/${userId}`, { newSolde });
    } catch (error) {
      throw new Error(error);
    }
  };

export const getTotalSolde = async () => {
    try {
      const response = await apiAdmin.get('/api/total-solde');
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

// eslint-disable-next-line import/no-anonymous-default-export
export default {soldeInit, getSolde, fetchSolde, updateSolde, getTotalSolde};
