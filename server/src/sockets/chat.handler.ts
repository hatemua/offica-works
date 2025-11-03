import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS, ChatMessage, ChatChannel } from '@mini-gather/shared';
import { prisma } from '../config/database';

export function setupChatHandlers(io: Server, socket: Socket) {
  socket.on(SOCKET_EVENTS.CHAT_MESSAGE, async (data: { content: string; channel: ChatChannel; roomId?: string }) => {
    const message: ChatMessage = {
      id: Math.random().toString(36),
      userId: socket.data.userId,
      username: socket.data.username,
      content: data.content,
      channel: data.channel,
      roomId: data.roomId,
      timestamp: new Date()
    };

    // Save to database
    try {
      await prisma.chatMessage.create({
        data: {
          userId: message.userId,
          username: message.username,
          content: message.content,
          channel: message.channel,
          roomId: message.roomId
        }
      });
    } catch (error) {
      console.error('Error saving chat message:', error);
    }

    // Broadcast message based on channel
    switch (data.channel) {
      case ChatChannel.GLOBAL:
        io.emit(SOCKET_EVENTS.CHAT_MESSAGE, message);
        break;
      case ChatChannel.ROOM:
        if (data.roomId) {
          io.to(data.roomId).emit(SOCKET_EVENTS.CHAT_MESSAGE, message);
        }
        break;
      case ChatChannel.PROXIMITY:
        // TODO: Implement proximity-based chat
        socket.broadcast.emit(SOCKET_EVENTS.CHAT_MESSAGE, message);
        break;
    }
  });
}
