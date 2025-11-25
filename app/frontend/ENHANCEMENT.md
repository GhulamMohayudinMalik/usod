# 🌐 Frontend - Enhancement & Refactoring Guide

**Directory:** `/frontend`  
**Purpose:** Next.js web dashboard for USOD system  
**Status:** 🟢 Fully Functional - Ready for UI/UX improvements  
**Last Updated:** October 23, 2025

---

## 📋 TABLE OF CONTENTS

1. [Current Architecture](#current-architecture)
2. [Directory Structure](#directory-structure)
3. [Data Flow](#data-flow)
4. [Current Issues](#current-issues)
5. [Enhancement Roadmap](#enhancement-roadmap)
6. [How to Refactor](#how-to-refactor)
7. [Testing Guide](#testing-guide)
8. [Integration Points](#integration-points)

---

## 🏗️ CURRENT ARCHITECTURE

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Styling:** Tailwind CSS
- **State Management:** React hooks (useState, useEffect)
- **HTTP Client:** Fetch API
- **Authentication:** JWT tokens (localStorage)
- **Port:** 3000 (development)

### Pages Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND STRUCTURE                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  /login                                                     │
│  │                                                          │
│  └──► /dashboard (Protected)                               │
│       ├─ Overview (Stats, Charts, Threats)                 │
│       ├─ AI Insights (ML Model Performance)                │
│       ├─ Analytics (Data Visualization)                    │
│       ├─ Network Monitoring (Real-time Capture) ⭐ NEW     │
│       ├─ PCAP Analyzer (File Upload Analysis) ⭐ NEW       │
│       ├─ Blockchain Ledger (Threat Verification)           │
│       ├─ Threats (Detection History)                       │
│       ├─ Security (Anomalies)                              │
│       ├─ Security Lab (Experiments)                        │
│       ├─ Logs (Security Events)                            │
│       ├─ Backup (Database Management)                      │
│       ├─ Users (User Management - Admin only)              │
│       ├─ Settings (Configuration)                          │
│       └─ Change Password                                   │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
App Layout (layout.js)
    │
    ├─ Login Page (public)
    │
    └─ Dashboard Layout (auth required)
        ├─ Sidebar (navigation)
        ├─ Header (user info, logout)
        └─ Page Content
            ├─ Stats Cards
            ├─ Threat Cards
            ├─ Blockchain Widget
            ├─ Charts (placeholder)
            └─ Modals
```

---

## 📁 DIRECTORY STRUCTURE

```
frontend/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── page.js                # Landing page (redirects to login)
│   │   ├── layout.js              # Root layout
│   │   ├── globals.css            # Global styles
│   │   │
│   │   ├── login/
│   │   │   └── page.js            # Login page
│   │   │
│   │   └── dashboard/             # Protected dashboard
│   │       ├── layout.js          # Dashboard layout (Sidebar + Header)
│   │       ├── page.js            # ⭐ Main dashboard overview
│   │       ├── ai-insights/
│   │       │   └── page.js        # AI model stats
│   │       ├── analytics/
│   │       │   └── page.js        # Data visualization
│   │       ├── network-monitoring/
│   │       │   └── page.js        # Real-time network monitoring
│   │       ├── pcap-analyzer/
│   │       │   └── page.js        # PCAP file analysis
│   │       ├── blockchain/
│   │       │   └── page.js        # Blockchain ledger & verification
│   │       ├── threats/
│   │       │   └── page.js        # Detected threats
│   │       ├── security/
│   │       │   └── page.js        # Security anomalies
│   │       ├── security-lab/
│   │       │   └── page.js        # Experimental features
│   │       ├── logs/
│   │       │   └── page.js        # Security logs
│   │       ├── backup/
│   │       │   └── page.js        # Database backup/restore
│   │       ├── users/
│   │       │   └── page.js        # User management
│   │       ├── settings/
│   │       │   └── page.js        # Configuration
│   │       └── change-password/
│   │           └── page.js        # Password change
│   │
│   ├── components/                # Reusable components
│   │   ├── Sidebar.js             # Navigation sidebar
│   │   ├── Header.js              # Top header (user dropdown)
│   │   ├── StatsCard.js           # Dashboard stat cards
│   │   ├── ThreatCard.js          # Threat display cards
│   │   ├── BlockchainWidget.js    # Blockchain summary widget
│   │   └── Modal.js               # Modal dialog
│   │
│   └── services/
│       └── api.js                 # ⭐ API client for backend
│
├── public/                        # Static assets
│   ├── next.svg
│   ├── vercel.svg
│   └── *.svg
│
├── package.json                   # Dependencies
├── next.config.mjs                # Next.js configuration
├── tailwind.config.js             # Tailwind CSS config
├── postcss.config.mjs             # PostCSS config
└── ENHANCEMENT.md                 # This file
```

---

## 🔄 DATA FLOW

### Authentication Flow

```
User enters credentials
        │
        ▼
POST /api/auth/login
        │
        ▼
Backend validates
        │
        ├─ Success ──► JWT token
        │                │
        │                ▼
        │         Store in localStorage
        │                │
        │                ▼
        │         Redirect to /dashboard
        │
        └─ Failure ──► Show error
```

### Data Fetching Flow

```
Component Mounts (useEffect)
        │
        ▼
Check if token exists
        │
        ├─ No ──► Redirect to /login
        │
        └─ Yes ──► Fetch data from API
                    │
                    ▼
             Add Authorization header
             Bearer {token}
                    │
                    ▼
             Backend validates token
                    │
                    ├─ Valid ──► Return data
                    │              │
                    │              ▼
                    │        Update state (setState)
                    │              │
                    │              ▼
                    │        Re-render component
                    │
                    └─ Invalid ──► 401 Unauthorized
                                    │
                                    ▼
                              Clear token
                                    │
                                    ▼
                              Redirect to /login
```

---

## 🚨 CURRENT ISSUES

### Critical Issues

1. **🔒 No Token Refresh**
   - **Problem:** JWT tokens never expire, no refresh mechanism
   - **Impact:** Security risk, stale tokens remain valid
   - **Priority:** P1 - High
   - **Fix:** Implement token expiration + refresh token flow

2. **🌐 No Error Boundaries**
   - **Problem:** Component errors crash entire app
   - **Impact:** Poor user experience
   - **Priority:** P1 - High
   - **Fix:** Add React Error Boundaries

3. **📊 Charts Missing**
   - **Problem:** Placeholders for charts, not implemented
   - **Impact:** Limited data visualization
   - **Priority:** P2 - Medium
   - **Fix:** Integrate Chart.js or Recharts

### Performance Issues

4. **⏱️ Unnecessary Re-renders**
   - **Problem:** Components re-render on every state change
   - **Impact:** Slow UI, wasted CPU
   - **Priority:** P2 - Medium
   - **Fix:** Use React.memo, useMemo, useCallback

5. **🔄 Polling Instead of WebSocket**
   - **Problem:** Dashboard polls backend every 10s for updates
   - **Impact:** Network overhead, not truly real-time
   - **Priority:** P2 - Medium
   - **Fix:** Implement WebSocket or SSE

6. **💾 No Caching**
   - **Problem:** Re-fetch same data on every navigation
   - **Impact:** Slow page transitions
   - **Priority:** P2 - Medium
   - **Fix:** Use SWR or React Query for caching

### UX Issues

7. **📱 Not Mobile Responsive**
   - **Problem:** Sidebar doesn't collapse on mobile
   - **Impact:** Poor mobile experience
   - **Priority:** P2 - Medium
   - **Fix:** Add responsive sidebar with hamburger menu

8. **🌙 No Dark Mode Toggle**
   - **Problem:** Dark mode is hardcoded
   - **Impact:** Cannot switch to light mode
   - **Priority:** P3 - Low
   - **Fix:** Add theme context + toggle button

9. **⚠️ No Loading States**
   - **Problem:** Blank screen while data loads
   - **Impact:** Users think app is broken
   - **Priority:** P2 - Medium
   - **Fix:** Add skeleton loaders

---

## 🚀 ENHANCEMENT ROADMAP

### Phase 1: Security & Auth (2-3 days)

- [ ] **Token Refresh Mechanism**
  ```javascript
  // services/api.js
  let refreshPromise = null;
  
  async function refreshAccessToken() {
    if (refreshPromise) return refreshPromise;
    
    refreshPromise = fetch('http://localhost:5000/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') })
    })
      .then(res => res.json())
      .then(data => {
        localStorage.setItem('token', data.token);
        refreshPromise = null;
        return data.token;
      })
      .catch(err => {
        refreshPromise = null;
        throw err;
      });
    
    return refreshPromise;
  }
  
  export async function apiRequest(url, options = {}) {
    let token = localStorage.getItem('token');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`
      }
    });
    
    if (response.status === 401) {
      // Token expired, refresh it
      token = await refreshAccessToken();
      
      // Retry request with new token
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return response;
  }
  ```

- [ ] **Error Boundaries**
  ```javascript
  // components/ErrorBoundary.js
  'use client';
  import React from 'react';
  
  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }
    
    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }
    
    componentDidCatch(error, errorInfo) {
      console.error('Error caught by boundary:', error, errorInfo);
    }
    
    render() {
      if (this.state.hasError) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-red-500 mb-4">
                Something went wrong
              </h1>
              <p className="text-gray-400 mb-6">{this.state.error?.message}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 rounded-lg"
              >
                Reload Page
              </button>
            </div>
          </div>
        );
      }
      
      return this.props.children;
    }
  }
  
  export default ErrorBoundary;
  ```

### Phase 2: Performance (3-5 days)

- [ ] **Implement SWR for Data Fetching**
  ```javascript
  import useSWR from 'swr';
  
  const fetcher = (url) => apiRequest(url).then(res => res.json());
  
  export function useThreats() {
    const { data, error, mutate } = useSWR(
      'http://localhost:5000/api/data/threats',
      fetcher,
      { refreshInterval: 10000 } // Auto-refresh every 10s
    );
    
    return {
      threats: data,
      isLoading: !error && !data,
      isError: error,
      refresh: mutate
    };
  }
  ```

- [ ] **WebSocket for Real-time Updates**
  ```javascript
  // hooks/useWebSocket.js
  import { useEffect, useState } from 'react';
  
  export function useWebSocket(url) {
    const [data, setData] = useState(null);
    const [ws, setWs] = useState(null);
    
    useEffect(() => {
      const websocket = new WebSocket(url);
      
      websocket.onmessage = (event) => {
        const newData = JSON.parse(event.data);
        setData(newData);
      };
      
      setWs(websocket);
      
      return () => websocket.close();
    }, [url]);
    
    return { data, ws };
  }
  
  // Usage
  const { data: liveThreats } = useWebSocket('ws://localhost:5000/threats');
  ```

- [ ] **Optimize Re-renders**
  ```javascript
  import React, { memo, useMemo, useCallback } from 'react';
  
  const ThreatCard = memo(({ threat, onDelete }) => {
    const severityColor = useMemo(() => {
      return threat.severity === 'high' ? 'red' : 'yellow';
    }, [threat.severity]);
    
    const handleDelete = useCallback(() => {
      onDelete(threat.id);
    }, [onDelete, threat.id]);
    
    return <div>{/* ... */}</div>;
  });
  ```

### Phase 3: UI/UX Improvements (5-7 days)

- [ ] **Integrate Chart Library**
  ```javascript
  import { Line, Bar, Doughnut } from 'react-chartjs-2';
  
  const ThreatTrendChart = ({ data }) => {
    const chartData = {
      labels: data.map(d => d.date),
      datasets: [{
        label: 'Threats Detected',
        data: data.map(d => d.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)'
      }]
    };
    
    return <Line data={chartData} options={{ responsive: true }} />;
  };
  ```

- [ ] **Responsive Sidebar**
  ```javascript
  'use client';
  import { useState } from 'react';
  
  export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <>
        {/* Mobile hamburger button */}
        <button
          className="lg:hidden fixed top-4 left-4 z-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* Hamburger icon */}
        </button>
        
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40
          transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 transition-transform duration-300
          w-64 bg-gray-800
        `}>
          {/* Sidebar content */}
        </aside>
        
        {/* Overlay */}
        {isOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsOpen(false)}
          />
        )}
      </>
    );
  }
  ```

- [ ] **Skeleton Loaders**
  ```javascript
  export function ThreatCardSkeleton() {
    return (
      <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }
  
  // Usage
  {isLoading ? (
    <>
      <ThreatCardSkeleton />
      <ThreatCardSkeleton />
      <ThreatCardSkeleton />
    </>
  ) : (
    threats.map(threat => <ThreatCard key={threat.id} threat={threat} />)
  )}
  ```

---

## 🔧 HOW TO REFACTOR

### 1. Extract API Logic

**❌ BEFORE: Inline fetch in components**
```javascript
const [threats, setThreats] = useState([]);

useEffect(() => {
  const fetchThreats = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/data/threats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    setThreats(data);
  };
  
  fetchThreats();
}, []);
```

**✅ AFTER: Custom hooks**
```javascript
// hooks/useThreats.js
import useSWR from 'swr';
import { apiRequest } from '../services/api';

export function useThreats() {
  const { data, error, mutate } = useSWR('/api/data/threats', (url) =>
    apiRequest(`http://localhost:5000${url}`).then(res => res.json())
  );
  
  return {
    threats: data || [],
    isLoading: !error && !data,
    isError: error,
    refresh: mutate
  };
}

// Usage in component
const { threats, isLoading, refresh } = useThreats();
```

### 2. Shared Layout Component

```javascript
// components/DashboardLayout.js
export default function DashboardLayout({ children, title }) {
  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar />
      <div className="lg:ml-64">
        <Header />
        <main className="p-6">
          <h1 className="text-3xl font-bold text-white mb-6">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}

// Usage
<DashboardLayout title="Threats">
  <ThreatsTable threats={threats} />
</DashboardLayout>
```

### 3. Type Safety with PropTypes

```javascript
import PropTypes from 'prop-types';

ThreatCard.propTypes = {
  threat: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    severity: PropTypes.oneOf(['low', 'medium', 'high', 'critical']).isRequired,
    timestamp: PropTypes.string.isRequired,
    sourceIp: PropTypes.string,
    confidence: PropTypes.number
  }).isRequired,
  onDelete: PropTypes.func
};
```

---

## 🧪 TESTING GUIDE

### Manual Testing
1. Test all pages in dashboard
2. Test login/logout flow
3. Test API error scenarios (disconnect backend)
4. Test on mobile (Chrome DevTools)

### Automated Testing (Future)
```javascript
// __tests__/ThreatCard.test.js
import { render, screen } from '@testing-library/react';
import ThreatCard from '../components/ThreatCard';

test('renders threat information', () => {
  const threat = {
    id: '1',
    type: 'DoS',
    severity: 'high',
    timestamp: '2025-10-23T10:00:00Z'
  };
  
  render(<ThreatCard threat={threat} />);
  
  expect(screen.getByText('DoS')).toBeInTheDocument();
  expect(screen.getByText('high')).toBeInTheDocument();
});
```

---

## 🔗 INTEGRATION POINTS

### Backend API
- Base URL: `http://localhost:5000`
- Authentication: JWT Bearer token
- All dashboard data fetched from `/api/data/*` endpoints

### WebSocket (Future)
- URL: `ws://localhost:5000/stream`
- Real-time threat updates

---

## 📝 QUICK START CHECKLIST

- [ ] Install dependencies: `npm install`
- [ ] Start backend first: `cd ../backend && npm start`
- [ ] Start frontend: `npm run dev`
- [ ] Open: `http://localhost:3000`
- [ ] Login with test credentials
- [ ] Navigate through all dashboard pages

---

**Last Updated:** October 23, 2025  
**Status:** Functional, needs performance and UX improvements  
**Next Review:** After Phase 1 security enhancements

