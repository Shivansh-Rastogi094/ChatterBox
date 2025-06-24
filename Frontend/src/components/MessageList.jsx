import React, { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import Message from './Message';
import TypingIndicator from './TypingIndicator';

function MessageList() {
  const { state } = useChat();
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);
  
  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="space-y-4">
        {state.messages.length === 0 && (
          <div className="flex justify-center items-center h-full py-8">
            <p className="text-gray-500 dark:text-gray-400 italic">
              No messages yet. Start the conversation!
            </p>
          </div>
        )}
        
        {state.messages.map((message) => (
          <Message 
            key={message.id} 
            message={message} 
            isCurrentUser={message.senderId === state.currentUser?.id}
          />
        ))}
        
        {state.typingUsers.length > 0 && <TypingIndicator users={state.typingUsers} />}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default MessageList;