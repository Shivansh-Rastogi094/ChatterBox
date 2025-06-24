import React from 'react';

function TypingIndicator({ users }) {
  if (users.length === 0) return null;
  
  const typingText = users.length === 1
    ? `${users[0].username} is typing...`
    : users.length === 2
      ? `${users[0].username} and ${users[1].username} are typing...`
      : `${users.length} people are typing...`;
  
  return (
    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-2 animate-pulse">
      <div className="flex space-x-1 mr-2">
        <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
        <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
        <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
      </div>
      <span>{typingText}</span>
    </div>
  );
}

export default TypingIndicator;