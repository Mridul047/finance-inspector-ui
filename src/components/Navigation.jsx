import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/' },
    { id: 'users', label: 'Users', icon: '👥', path: '/users' },
    { id: 'income', label: 'Income', icon: '💰', path: '/income' },
    { id: 'reports', label: 'Reports', icon: '📈', path: '/reports' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="py-6 h-full flex flex-col">
      {/* Navigation Header */}
      <div className="px-6 pb-4 border-b border-gray-200 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 uppercase tracking-wider text-sm">
          Menu
        </h2>
      </div>
      
      {/* Navigation Items */}
      <ul className="flex-1 space-y-1 px-3">
        {navigationItems.map((item) => (
          <li key={item.id}>
            <Link
              to={item.path}
              className={`w-full flex items-center px-3 py-3 font-medium rounded-lg transition-all duration-200 hover:bg-slate-50 hover:text-blue-600 hover:translate-x-1 focus:outline-none focus:bg-blue-50 focus:text-blue-600 focus:shadow-[inset_4px_0_0_theme(colors.blue.600)] active:bg-blue-100 active:translate-x-0.5 group ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-600 shadow-[inset_4px_0_0_theme(colors.blue.600)]'
                  : 'text-gray-600'
              }`}
              aria-label={`Navigate to ${item.label}`}
            >
              <span className="text-xl mr-3 w-6 text-center transition-transform duration-200 group-hover:scale-110">
                {item.icon}
              </span>
              <span className="flex-1 text-left text-base">
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;