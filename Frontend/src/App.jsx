import React from 'react';
import { ChatProvider } from './context/ChatContext';
import ChatApp from './components/ChatApp';
import { MessageCircle } from 'lucide-react';

function App() {
  return (
    <ChatProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        <header className="bg-white dark:bg-gray-800 shadow-sm py-4 px-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-6 w-6 text-blue-500" />
            <h1 className="text-xl font-bold">ChatterBox</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">
          <ChatApp />
        </main>
      </div>
    </ChatProvider>
  );
}

export default App;