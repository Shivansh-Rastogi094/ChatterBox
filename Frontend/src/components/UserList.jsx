import React from 'react';
import { useChat } from '../context/ChatContext';

function UserList() {
  const { state } = useChat();
  
  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold mb-4 text-gray-500 dark:text-gray-400">
        USERS ({state.users.length})
      </h3>
      
      <ul className="space-y-2">
        {state.users.map((user) => (
          <li key={user.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.username}
                className="h-8 w-8 rounded-full"
              />
              <span
                className={`absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-1 ring-white ${
                  user.online ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
            </div>
            
            <span className="font-medium text-sm">
              {user.username}
              {state.currentUser?.id === user.id && ' (You)'}
            </span>
          </li>
        ))}
        
        {state.users.length === 0 && (
          <li className="text-gray-500 dark:text-gray-400 text-sm italic p-2">
            No users online
          </li>
        )}
      </ul>
    </div>
  );
}

export default UserList;