import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Only connect if user is logged in
    if (user && user._id) {
      // Create socket connection - use same backend URL as API
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || process.env.BACKEND_URL || '';
      const socketUrl = process.env.REACT_APP_SOCKET_URL || BACKEND_URL || 'http://localhost:5000';
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socketRef.current = newSocket;

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
        
        // Join user-specific room (for customers)
        newSocket.emit('join-user-room', user._id);
        
        // Join owner-specific room if user is an owner
        if (user.role === 'owner' || user.isAdmin) {
          newSocket.emit('join-owner-room', user._id);
          console.log(`Owner ${user._id} joined owner room`);
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      // Cleanup on unmount or user change
      return () => {
        if (newSocket) {
          newSocket.emit('leave-user-room', user._id);
          if (user.role === 'owner' || user.isAdmin) {
            newSocket.emit('leave-owner-room', user._id);
          }
          newSocket.disconnect();
        }
      };
    } else {
      // Disconnect if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [user]);

  const value = {
    socket,
    isConnected,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

