import { useEffect, useState, useRef } from 'react';
import { getConnectedUsers } from '../services/api';
import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const useConnectedUsers = () => {
  const [connectedCount, setConnectedCount] = useState(0);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const hasInitializedRef = useRef(false); // ✅ Éviter les doublons de montage

  // 🔄 Rafraîchir via l'API REST
  const fetchUsersFromAPI = async () => {
    try {
      setLoading(true);
      const data = await getConnectedUsers();
      
      const count = data?.totalConnected || data?.total || data?.count || 0;
      
      setConnectedCount(count);
      setUsersList(data.connectedUsersList || []);
      setError(null);
    } catch (err) {
      console.error('❌ [useConnectedUsers] Erreur API');
      console.error('❌ Statut:', err.response?.status);
      console.error('❌ Data:', err.response?.data);
      console.error('❌ Message:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ✅ Vérifier que c'est la première exécution seulement
    if (hasInitializedRef.current) {
      return;
    }
    hasInitializedRef.current = true;

    // 1️⃣ Socket.io - Écouter les mises à jour en temps réel
    if (!socketRef.current) {
      const token = sessionStorage.getItem('token') || 
                    localStorage.getItem('token') || 
                    sessionStorage.getItem('authToken');

      const socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        // Émettre user_connected
        const userId = sessionStorage.getItem('userId');
        const username = sessionStorage.getItem('userName'); // ✅ FIX: 'userName' pas 'username'
        socket.emit('user_connected', { userId, username });
      });

      // 2️⃣ Écouter les mises à jour utilisateurs via Socket
      socket.on('users_count_update', (data) => {
        // ✅ STRICTE: Seulement accepter si data.total > 0 ET est un nombre
        if (typeof data?.total === 'number' && data.total > 0) {
          setConnectedCount(data.total);
          setUsersList(data.users || []);
        } else {
          console.warn('⚠️ Socket retourne des données invalides, ignorer:', data);
        }
      });

      socket.on('disconnect', (reason) => {
        console.warn('⚠️ Socket déconnecté:', reason);
      });
    }

    // ✅ Appel initial à l'API pour avoir une valeur de base
    fetchUsersFromAPI().catch(err => console.error('❌ Erreur initial fetch:', err));

    // ✅ FALLBACK: Rafraîchir l'API toutes les 30 secondes si le socket ne fonctionne pas bien
    const fallbackInterval = setInterval(() => {
      fetchUsersFromAPI();
    }, 30000);

    return () => {
      clearInterval(fallbackInterval);
      // ✅ IMPORTANT: Fermer la socket quand le composant se démonte
      // sinon des sockets s'accumulent et l'utilisateur est compté plusieurs fois!
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return {
    connectedCount,
    usersList,
    loading,
    error,
    refetch: fetchUsersFromAPI
  };
};
