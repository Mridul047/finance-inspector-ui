import React from 'react';
import Navigation from './Navigation';
import config from '../utils/config';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight">
            {config.app.name}
          </h1>
          <div className="flex items-center gap-4">
            <span className="bg-white/20 px-3 py-1 rounded-md text-sm font-medium">
              v{config.app.version}
            </span>
          </div>
        </div>
      </header>
      
      {/* Body Layout */}
      <div className="flex flex-1 w-full">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-200 shadow-sm sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto flex-shrink-0">
          <Navigation />
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-[calc(100vh-5rem)] overflow-hidden">
          <div className="flex-1 p-8 bg-white m-4 rounded-lg shadow-sm max-w-full">
            {children}
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <footer className="bg-slate-700 text-slate-400 mt-auto">
        <div className="text-center py-4 px-8 max-w-7xl mx-auto">
          <p className="text-sm">
            &copy; 2025 {config.app.name} - {config.app.description}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;