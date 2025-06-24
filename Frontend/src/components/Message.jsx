import React from 'react';
import { formatRelativeTime } from '../utils/dateUtils';

function Message({ message, isCurrentUser }) {
  const { type, text, sender, timestamp, senderAvatar } = message;
  
  if (type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-500 dark:text-gray-400">
          {text}
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4 animate-fadeIn`}
    >
      {!isCurrentUser && (
        <div className="flex-shrink-0 mr-2">
          <img 
            src={senderAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${sender}`} 
            alt={sender} 
            className="h-8 w-8 rounded-full"
          />
        </div>
      )}
      
      <div 
        className={`max-w-[70%] ${
          isCurrentUser 
            ? 'bg-blue-500 text-white rounded-tl-xl rounded-tr-sm rounded-bl-xl' 
            : 'bg-white dark:bg-gray-700 rounded-tl-sm rounded-tr-xl rounded-br-xl'
        } px-4 py-2 shadow-md`}
      >
        {!isCurrentUser && (
          <div className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-1">
            {sender}
          </div>
        )}
        
        <p className="text-sm whitespace-pre-wrap break-words">{text}</p>
        
        <div 
          className={`text-xs mt-1 ${
            isCurrentUser ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {formatRelativeTime(timestamp)}
        </div>
      </div>
    </div>
  );
}

export default Message;