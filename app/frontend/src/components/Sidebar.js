'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';


// Icons as constants for simplicity
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

const ThreatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const LogIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
    <line x1="8" y1="9" x2="10" y2="9" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const AiInsightsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12 2a10 10 0 1 0 10 10" />
    <path d="M12 2a10 10 0 0 1 10 10" />
    <path d="M12 12l8-8" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v10" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
  { name: 'Threat Analysis', href: '/dashboard/threats', icon: ThreatIcon },
  { name: 'Logs Analysis', href: '/dashboard/logs', icon: LogIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: AnalyticsIcon },
  { name: 'AI Insights', href: '/dashboard/ai-insights', icon: AiInsightsIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
];


function Sidebar({ className = '' }) {
  const pathname = usePathname();

  return (
    <nav className={`flex flex-col w-64 p-4 bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/20 h-screen ${className}`}>
      <div className="flex items-center justify-center p-4 mb-6">
        <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">USOD</h2>
      </div>

      <div className="flex-1 space-y-1">
        {navigation.map((item) => {
          const isActive = item.href === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname === item.href || (pathname && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/40'}`}
            >
              <span className="mr-3">
                <item.icon />
              </span>
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
        <div className="flex items-center px-4 py-3 text-sm">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white mr-3">
            <span>AU</span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Ghulam Mohayudin</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">ghulammohayudin@gmail.com</p>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Sidebar