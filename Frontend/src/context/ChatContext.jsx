import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { io } from 'socket.io-client';

const initialState = {
  socket: null,
  currentUser: null,
  users: [],
  messages: [],
  privateMessages: {},
  typingUsers: [],
  isConnected: false
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SOCKET':
      return { ...state, socket: action.payload };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_PRIVATE_MESSAGE': {
      const { message } = action.payload;
      const otherUserId = state.currentUser?.id === message.senderId 
        ? message.recipientId 
        : message.senderId;
      
      if (!otherUserId) return state;
      
      const existingMessages = state.privateMessages[otherUserId] || [];
      
      return {
        ...state,
        privateMessages: {
          ...state.privateMessages,
          [otherUserId]: [...existingMessages, message]
        }
      };
    }
    case 'SET_TYPING_USERS':
      return { ...state, typingUsers: action.payload };
    case 'UPDATE_TYPING_USER': {
      const { userId, isTyping } = action.payload;
      const updatedTypingUsers = isTyping
        ? [...state.typingUsers.filter(u => u.userId !== userId), action.payload]
        : state.typingUsers.filter(u => u.userId !== userId);
      
      return { ...state, typingUsers: updatedTypingUsers };
    }
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    default:
      return state;
  }
};

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  
  useEffect(() => {
    const socket = io('http://localhost:3001');
    
    socket.on('connect', () => {
      console.log('Connected to server');
      dispatch({ type: 'SET_SOCKET', payload: socket });
      dispatch({ type: 'SET_CONNECTED', payload: true });
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      dispatch({ type: 'SET_CONNECTED', payload: false });
    });
    
    return () => {
      socket.disconnect();
    };
  }, []);
  
  useEffect(() => {
    if (!state.socket) return;
    
    const socket = state.socket;
    
    socket.on('login_success', (user) => {
      dispatch({ type: 'SET_CURRENT_USER', payload: user });
    });
    
    socket.on('users_update', (users) => {
      dispatch({ type: 'SET_USERS', payload: users });
    });
    
    socket.on('new_message', (message) => {
      dispatch({ type: 'ADD_MESSAGE', payload: message });
    });
    
    socket.on('message_history', (messages) => {
      dispatch({ type: 'SET_MESSAGES', payload: messages });
    });
    
    socket.on('new_private_message', (message) => {
      dispatch({ type: 'ADD_PRIVATE_MESSAGE', payload: { message } });
    });
    
    socket.on('user_typing', ({ userId, username, isTyping }) => {
      dispatch({ 
        type: 'UPDATE_TYPING_USER', 
        payload: { userId, username, isTyping } 
      });
    });
    
    return () => {
      socket.off('login_success');
      socket.off('users_update');
      socket.off('new_message');
      socket.off('message_history');
      socket.off('new_private_message');
      socket.off('user_typing');
    };
  }, [state.socket]);
  
  const login = (username, avatar) => {
    if (state.socket) {
      state.socket.emit('login', { username, avatar });
    }
  };
  
  const sendMessage = (text) => {
    if (!text.trim() || !state.socket || !state.currentUser) return;
    state.socket.emit('send_message', { text });
  };
  
  const sendPrivateMessage = (recipientId, text) => {
    if (!text.trim() || !state.socket || !state.currentUser) return;
    state.socket.emit('private_message', { recipientId, text });
  };
  
  const setTyping = (isTyping) => {
    if (state.socket) {
      state.socket.emit('typing', isTyping);
    }
  };
  
  const contextValue = {
    state,
    login,
    sendMessage,
    sendPrivateMessage,
    setTyping
  };
  
  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  
  return context;
}