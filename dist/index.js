"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const chat_server_1 = require("./chat-server");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const httpServer = (0, http_1.createServer)(app);
// Initialize chat server
(0, chat_server_1.initializeChatServer)(httpServer);
// Debug endpoints
app.get('/', (_, res) => {
    res.send('Socket.IO server is running');
});
app.get('/health', (_, res) => {
    res.json({
        status: 'ok',
        connections: httpServer.connections,
        uptime: process.uptime()
    });
});
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
