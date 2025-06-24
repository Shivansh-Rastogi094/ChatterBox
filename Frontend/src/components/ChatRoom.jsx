import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import { LayoutGrid, UserCheck } from 'lucide-react';

function ChatRoom() {
  const { state } = useChat();
  const [showUserList, setShowUserList] = useState(true);
  
  const onlineCount = state.users.filter(user => user.online).length;
  
  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="bg-white dark:bg-gray-800 p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-bold">Chat Room</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({onlineCount} online)
          </span>
        </div>
        
        <button
          onClick={() => setShowUserList(!showUserList)}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={showUserList ? "Hide user list" : "Show user list"}
        >
          {showUserList ? (
            <LayoutGrid className="h-5 w-5 text-gray-500" />
          ) : (
            <UserCheck className="h-5 w-5 text-gray-500" />
          )}
        </button>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <MessageList />
          <MessageInput />
        </div>
        
        {showUserList && (
          <div className="w-64 border-l border-gray-200 dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-800 hidden md:block">
            <UserList />
          </div>
        )}
        
        {showUserList && (
          <div className="md:hidden fixed inset-y-0 right-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-medium">Users</h3>
              <button
                onClick={() => setShowUserList(false)}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                &times;
              </button>
            </div>
            <UserList />
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatRoom;