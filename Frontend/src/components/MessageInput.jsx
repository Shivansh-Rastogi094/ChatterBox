import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { Send, Smile } from 'lucide-react';

function MessageInput() {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { sendMessage, setTyping } = useChat();
  const typingTimeoutRef = useRef(null);
  
  useEffect(() => {
    if (message && !isTyping) {
      setIsTyping(true);
      setTyping(true);
    }
    
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = window.setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        setTyping(false);
      }
    }, 2000);
    
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, setTyping]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    sendMessage(message);
    setMessage('');
    
    setIsTyping(false);
    setTyping(false);
  };
  
  return (
    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
        >
          <Smile className="h-6 w-6" />
        </button>
        
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Type a message..."
        />
        
        <button
          type="submit"
          disabled={!message.trim()}
          className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}

export default MessageInput;