import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import { initializeChatServer } from './chat-server'

const app = express()
app.use(cors())

const httpServer = createServer(app)

// Initialize chat server
initializeChatServer(httpServer)

// Debug endpoints
app.get('/', (_, res) => {
  res.send('Socket.IO server is running')
})

app.get('/health', (_, res) => {
  res.json({ 
    status: 'ok', 
    connections: httpServer.connections,
    uptime: process.uptime()
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})