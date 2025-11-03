import { useState, useEffect, useRef } from 'react';
import { socketService } from '../services/socket';
import { SOCKET_EVENTS, ChatMessage, ChatChannel } from '@mini-gather/shared';
import { useGameStore } from '../store/gameStore';

export function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [channel, setChannel] = useState<ChatChannel>(ChatChannel.GLOBAL);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isChatOpen = useGameStore((state) => state.isChatOpen);
  const toggleChat = useGameStore((state) => state.toggleChat);
  const currentRoomId = useGameStore((state) => state.currentRoomId);

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off(SOCKET_EVENTS.CHAT_MESSAGE);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    socket.emit(SOCKET_EVENTS.CHAT_MESSAGE, {
      content: input,
      channel,
      ...(channel === ChatChannel.ROOM && currentRoomId && { roomId: currentRoomId }),
    });

    setInput('');
  };

  if (!isChatOpen) {
    return (
      <button
        onClick={toggleChat}
        className="absolute bottom-4 left-4 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow-lg transition"
      >
        Open Chat
      </button>
    );
  }

  return (
    <div className="absolute bottom-4 left-4 w-96 bg-gray-900 text-white rounded-lg shadow-lg flex flex-col h-96">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="font-semibold">Chat</h3>
        <button
          onClick={toggleChat}
          className="text-gray-400 hover:text-white transition"
        >
          ✕
        </button>
      </div>

      {/* Channel selector */}
      <div className="flex gap-2 p-2 border-b border-gray-700">
        <button
          onClick={() => setChannel(ChatChannel.GLOBAL)}
          className={`px-3 py-1 rounded text-sm transition ${
            channel === ChatChannel.GLOBAL
              ? 'bg-primary-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Global
        </button>
        <button
          onClick={() => setChannel(ChatChannel.ROOM)}
          disabled={!currentRoomId}
          className={`px-3 py-1 rounded text-sm transition ${
            channel === ChatChannel.ROOM
              ? 'bg-primary-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50'
          }`}
        >
          Room
        </button>
        <button
          onClick={() => setChannel(ChatChannel.PROXIMITY)}
          className={`px-3 py-1 rounded text-sm transition ${
            channel === ChatChannel.PROXIMITY
              ? 'bg-primary-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Proximity
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages
          .filter((msg) => msg.channel === channel)
          .map((msg) => (
            <div key={msg.id} className="text-sm">
              <span className="font-semibold text-primary-400">
                {msg.username}:
              </span>{' '}
              <span className="text-gray-200">{msg.content}</span>
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={`Message ${channel}...`}
            className="flex-1 bg-gray-800 text-white px-3 py-2 rounded outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={sendMessage}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
