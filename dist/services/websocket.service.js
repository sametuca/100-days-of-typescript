"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webSocketService = exports.WebSocketService = void 0;
const socket_io_1 = require("socket.io");
const jwt_1 = require("../utils/jwt");
class WebSocketService {
    constructor(server) {
        this.connectedUsers = new Map();
        this.io = new socket_io_1.Server(server, {
            cors: { origin: "*", methods: ["GET", "POST"] }
        });
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            socket.on('authenticate', async (token) => {
                try {
                    const user = jwt_1.JwtUtil.verifyAccessToken(token);
                    this.connectedUsers.set(socket.id, { ...user, socketId: socket.id });
                    socket.join(`user_${user.userId}`);
                    socket.emit('authenticated', { success: true });
                }
                catch (error) {
                    socket.emit('authenticated', { success: false });
                }
            });
            socket.on('disconnect', () => {
                this.connectedUsers.delete(socket.id);
            });
        });
    }
    notifyUser(userId, event, data) {
        this.io.to(`user_${userId}`).emit(event, data);
    }
    broadcast(event, data) {
        this.io.emit(event, data);
    }
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }
}
exports.WebSocketService = WebSocketService;
//# sourceMappingURL=websocket.service.js.map