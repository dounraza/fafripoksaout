import { createContext, useEffect, useState } from "react";
import { onlineUsersSocket as socket } from "../engine/socket";

export const JoinedTableContext = createContext();
export const JoinedTableProvider = ({ children }) => {
  const [joinedTables, setJoinedTables] = useState(() => {
    const saved = localStorage.getItem('joinedTables');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error parsing joinedTables from localStorage", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('joinedTables', JSON.stringify(joinedTables));
  }, [joinedTables]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const onUpdate = (jts) => {
      setJoinedTables(jts);
    };

    socket.on('joined-tables:load', onUpdate);
    socket.on('joined-tables:update', onUpdate);

    // Demander la liste actuelle à la connexion
    socket.on('connect', () => {
      const userId = sessionStorage.getItem('userId');
      if (userId) {
        socket.emit('joined-tables:get', { uid: parseInt(userId) });
      }
    });

    // Si déjà connecté, demander aussi
    if (socket.connected) {
        const userId = sessionStorage.getItem('userId');
        if (userId) {
          socket.emit('joined-tables:get', { uid: parseInt(userId) });
        }
    }

    const handleLogin = (e) => {
      const { userId } = e.detail;
      if (userId) {
        socket.emit('joined-tables:get', { uid: parseInt(userId) });
      }
    };
    window.addEventListener('userLogin', handleLogin);

    return () => {
      socket.off('joined-tables:load', onUpdate);
      socket.off('joined-tables:update', onUpdate);
      window.removeEventListener('userLogin', handleLogin);
    }
  }, [socket])

  return (
    <JoinedTableContext.Provider value={{ joinedTables }}>
      {children}
    </JoinedTableContext.Provider>
  )
}
