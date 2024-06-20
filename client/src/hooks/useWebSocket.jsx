import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const useWebSocket = () => {
  const { user } = useContext(AuthContext);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    if (user) {
      const socket = new WebSocket(`ws://localhost:3000`);

      socket.onopen = () => {
        console.log('WebSocket connected');
        socket.send(JSON.stringify({ type: 'getAccountData', userId: user._id }));
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected');
      };

      socket.onerror = (error) => {
        console.error('WebSocket error', error);
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('WebSocket message:', message);
      };

      setWs(socket);

      return () => {
        socket.close();
      };
    }
  }, [user]);

  return ws;
};

export default useWebSocket;
