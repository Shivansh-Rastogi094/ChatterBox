import React from 'react';
import { useChat } from '../context/ChatContext';
import LoginForm from './LoginForm';
import ChatRoom from './ChatRoom';

function ChatApp() {
  const { state } = useChat();
  
  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-5xl mx-auto">
      {!state.currentUser ? (
        <LoginForm />
      ) : (
        <ChatRoom />
      )}
    </div>
  );
}

export default ChatApp;