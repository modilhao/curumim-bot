import React from 'react';
import ChatWindow from './components/ChatWindow';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans p-4">
      <div className="w-full max-w-2xl h-[90vh] flex flex-col border border-gray-200 rounded-2xl shadow-2xl bg-white overflow-hidden">
        <header className="bg-white p-4 border-b border-gray-200 flex items-center space-x-4">
            <img src="https://ocacomunica.com.br/wp-content/uploads/2022/12/logo.svg" alt="agencia OCA logo" className="w-24 h-auto" />
            <div>
                <h1 className="text-lg font-semibold text-gray-800">Curumim</h1>
                <p className="text-sm text-green-500 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Online
                </p>
            </div>
        </header>
        <ChatWindow />
      </div>
      <footer className="text-center mt-4 text-sm text-gray-500">
        Powered by <a href="https://ocacomunica.com.br/" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#B81647]">agencia OCA</a>
      </footer>
    </div>
  );
};

export default App;