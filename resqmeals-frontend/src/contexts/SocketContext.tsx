import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    notifications: any[];
    addNotification: (notif: any) => void;
    clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    notifications: [],
    addNotification: () => {},
    clearNotifications: () => {}
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        // Connect to the backend
        const newSocket = io('http://localhost:8000');

        newSocket.on('connect', () => {
            console.log('Connected to WebSocket server:', newSocket.id);
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
            setIsConnected(false);
        });

        // Global status updates
        newSocket.on('status:updated', (data) => {
            console.log('Status updated globally:', data);
            // Example of adding a generic notification
            setNotifications(prev => [{
                id: Date.now().toString(),
                type: 'info',
                message: `Mission #${data.id.slice(0,6).toUpperCase()} status changed to ${data.status}`,
                timestamp: new Date()
            }, ...prev]);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    const addNotification = (notif: any) => {
        setNotifications(prev => [notif, ...prev]);
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    return (
        <SocketContext.Provider value={{ socket, isConnected, notifications, addNotification, clearNotifications }}>
            {children}
        </SocketContext.Provider>
    );
};
