import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server | null = null;

export const initializeSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: "*", // Adjust in production
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket: Socket) => {
        console.log(`[Socket.io] Client connected: ${socket.id}`);

        // Users can join rooms based on their roles or IDs to receive targeted notifications
        socket.on('join_room', (roomName: string) => {
            socket.join(roomName);
            console.log(`[Socket.io] ${socket.id} joined room: ${roomName}`);
        });

        // Volunteers can emit their location continuously
        socket.on('volunteer:location', (data: { missionId: string; lat: number; lng: number }) => {
            // Broadcast location to the mission's specific room
            io?.to(`mission_${data.missionId}`).emit('update:location', {
                lat: data.lat,
                lng: data.lng,
                timestamp: new Date().toISOString()
            });
        });

        socket.on('disconnect', () => {
            console.log(`[Socket.io] Client disconnected: ${socket.id}`);
        });
    });

    console.log('[Socket.io] Initialized successfully.');
};

// Expose a function to get the io instance for emitting events from controllers
export const getIO = (): Server => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
