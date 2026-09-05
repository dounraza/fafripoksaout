import api from './api';

export const getUserProfile = async () => {
    try {
        const userId = sessionStorage.getItem('userId');
        const response = await api.get(`/api/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération du profil utilisateur :", error);
        throw error;
    }
};
