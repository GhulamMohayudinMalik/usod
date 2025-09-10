'use client';

import { useState } from 'react';

function Header({ className = '' }) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  return (
    <header className={`flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Unified Security Operations Dashboard</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search..." 
            className="py-2 pl-10 pr-4 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-gray-500 dark:text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 relative"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
          </button>
          
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-50">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/30">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">High threat detected</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Suspicious activity from IP 192.168.1.105</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">5 minutes ago</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Medium threat detected</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Multiple failed login attempts</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 text-center border-t border-gray-200 dark:border-gray-700">
                <button className="text-xs text-blue-600 dark:text-blue-400 font-medium">View all notifications</button>
              </div>
            </div>
          )}
        </div>
        
        {/* Theme toggle - we'll implement this later */}
        <button className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
      </div>
    </header>
  );
} 

export default Header