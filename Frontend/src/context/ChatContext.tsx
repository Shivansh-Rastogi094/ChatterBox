import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Types
export interface User {
  id: string;
  username: string;
  avatar: string;
  socketId: string;
  online: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  sender: string;
  senderAvatar?: string;
  recipientId?: string;
  text: string;
  timestamp: string;
  type: 'user' | 'system' | 'private';
}

interface TypingUser {
  userId: string;
  username: string;
  isTyping: boolean;
}

interface ChatState {
  socket: Socket | null;
  currentUser: User | null;
  users: User[];
  messages: Message[];
  privateMessages: Record<string, Message[]>;
  typingUsers: TypingUser[];
  isConnected: boolean;
}

interface ChatContextProps {
  state: ChatState;
  login: (username: string, avatar?: string) => void;
  sendMessage: (text: string) => void;
  sendPrivateMessage: (recipientId: string, text: string) => void;
  setTyping: (isTyping: boolean) => void;
}

const initialState: ChatState = {
  socket: null,
  currentUser: null,
  users: [],
  messages: [],
  privateMessages: {},
  typingUsers: [],
  isConnected: false
};

// Reducer function
const chatReducer = (state: ChatState, action: any): ChatState => {
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

// Create context
const ChatContext = createContext<ChatContextProps | undefined>(undefined);

// Provider component
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  
  // Initialize socket connection
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
    
    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, []);
  
  // Set up socket event listeners
  useEffect(() => {
    if (!state.socket) return;
    
    const socket = state.socket;
    
    socket.on('login_success', (user: User) => {
      dispatch({ type: 'SET_CURRENT_USER', payload: user });
    });
    
    socket.on('users_update', (users: User[]) => {
      dispatch({ type: 'SET_USERS', payload: users });
    });
    
    socket.on('new_message', (message: Message) => {
      dispatch({ type: 'ADD_MESSAGE', payload: message });
    });
    
    socket.on('message_history', (messages: Message[]) => {
      dispatch({ type: 'SET_MESSAGES', payload: messages });
    });
    
    socket.on('new_private_message', (message: Message) => {
      dispatch({ type: 'ADD_PRIVATE_MESSAGE', payload: { message } });
    });
    
    socket.on('user_typing', ({ userId, username, isTyping }: TypingUser) => {
      dispatch({ 
        type: 'UPDATE_TYPING_USER', 
        payload: { userId, username, isTyping } 
      });
    });
    
    // Clean up listeners on unmount or socket change
    return () => {
      socket.off('login_success');
      socket.off('users_update');
      socket.off('new_message');
      socket.off('message_history');
      socket.off('new_private_message');
      socket.off('user_typing');
    };
  }, [state.socket]);
  
  // Actions
  const login = (username: string, avatar?: string) => {
    if (state.socket) {
      state.socket.emit('login', { username, avatar });
    }
  };
  
  const sendMessage = (text: string) => {
    if (!text.trim() || !state.socket || !state.currentUser) return;
    
    state.socket.emit('send_message', { text });
  };
  
  const sendPrivateMessage = (recipientId: string, text: string) => {
    if (!text.trim() || !state.socket || !state.currentUser) return;
    
    state.socket.emit('private_message', { recipientId, text });
  };
  
  const setTyping = (isTyping: boolean) => {
    if (state.socket) {
      state.socket.emit('typing', isTyping);
    }
  };
  
  const contextValue: ChatContextProps = {
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
};

// Custom hook to use the chat context
export const useChat = (): ChatContextProps => {
  const context = useContext(ChatContext);
  
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  
  return context;
};