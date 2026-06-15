const socketio = require('socket.io');

let io;

const initSocket = (server) => {
  io = socketio(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Join user-specific room for notifications
    socket.on('joinUser', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${socket.id} joined notification channel: user_${userId}`);
    });

    // Join room based on roomId (e.g., room number or contract ID)
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    // Typing indicator
    socket.on('typing', ({ roomId, userName }) => {
      socket.to(roomId).emit('typing', { userName });
    });

    socket.on('stopTyping', (roomId) => {
      socket.to(roomId).emit('stopTyping');
    });

    // Chat message
    socket.on('sendMessage', async (data) => {
      const { roomId, message, senderId, senderName, type } = data;
      
      try {
        const Message = require('../models/Message');
        const Room = require('../models/Room');
        const Notification = require('../models/Notification');
        
        // 1. Save message to DB
        const savedMessage = await Message.create({
          roomId,
          senderId,
          senderName,
          message,
          type: type || 'text'
        });

        // 2. Broadcast to everyone in the room
        io.to(roomId).emit('message', {
          _id: savedMessage._id,
          senderId,
          senderName,
          message,
          type: savedMessage.type,
          timestamp: savedMessage.timestamp,
        });

        // 3. Notify the other party (if not in room, they get a notification)
        const room = await Room.findById(roomId);
        if (room) {
          const receiverId = room.currentTenant && room.currentTenant.toString() === senderId.toString() 
            ? room.landlordId.toString() 
            : room.currentTenant ? room.currentTenant.toString() : null;
          
          if (receiverId) {
            // Check if we want to save a persistent notification or just a socket event
            // For chat, usually just a socket event for badge update is enough, 
            // but we can also save a Notification. Let's just emit a socket event for now to their personal channel.
            io.to(`user_${receiverId}`).emit('newChatMessage', {
              roomId,
              senderName,
              message: type === 'image' ? '[Hình ảnh]' : message
            });
          }
        }
      } catch (error) {
        console.error('Error saving chat message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initSocket, getIO };
