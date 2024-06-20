import { useContext } from 'react';
import { WebSocketContext } from '../contexts/WebSocketContext';

const useWebSocketContext = () => {
  return useContext(WebSocketContext);
};

export default useWebSocketContext;
