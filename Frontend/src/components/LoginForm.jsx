import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { User, MessageCircle } from 'lucide-react';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useChat();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username.trim()) return;
    
    setIsSubmitting(true);
    login(username);
  };
  
  return (
    <div className="flex items-center justify-center h-full">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-md transform transition-all duration-300 hover:shadow-xl">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <MessageCircle className="w-10 h-10 text-blue-500 dark:text-blue-300" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-6">Join ChatterBox</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your username"
                required
                autoFocus
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || !username.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Joining...' : 'Join Chat'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;