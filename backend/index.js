import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js'; // adjust the path if needed
import { initializeDatabase } from './models/index.js';
import { createMessage } from './controllers/messageController.js';

const app = express();
const port = 3000;

const httpServer = createServer(app);


const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

const onlineUsers = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      console.log(data.sender, data.receiver, data.room, data.text, data.encryptedAESKeyForRecipient, data.encryptedAESKeyForSender, data.iv, data.aesKeyUsed);

      
      const messageData = {
        senderId: data.sender,
        receiverId: data.receiver,
        text: data.text,
        iv: data.iv,
        room: data.room,
        delivered: false,
      };

     
      if (data.encryptedAESKeyForRecipient && data.encryptedAESKeyForSender) {
        messageData.encryptedAESKeyForRecipient = data.encryptedAESKeyForRecipient;
        messageData.encryptedAESKeyForSender = data.encryptedAESKeyForSender;
      }
     
      else if (data.encryptedAESKey) {
        messageData.encryptedAESKey = data.encryptedAESKey;
      }

      await createMessage(messageData);

      console.log(`Message saved from ${data.sender} to ${data.receiver} in room ${data.room}`);

      
      const emitData = {
        sender: data.sender,
        receiver: data.receiver,
        room: data.room,
        text: data.text,
        iv: data.iv,
        aesKeyUsed: data.aesKeyUsed,
      };

      
      if (data.encryptedAESKeyForRecipient && data.encryptedAESKeyForSender) {
        emitData.encryptedAESKeyForRecipient = data.encryptedAESKeyForRecipient;
        emitData.encryptedAESKeyForSender = data.encryptedAESKeyForSender;
      } else if (data.encryptedAESKey) {
        emitData.encryptedAESKey = data.encryptedAESKey;
      }

      io.to(data.room).emit('receive_message', emitData);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (const [userId, id] of Object.entries(onlineUsers)) {
      if (id === socket.id) {
        delete onlineUsers[userId];
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});


const startServer = async () => {
  try {
    await initializeDatabase();
    
    httpServer.listen(port, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

