'use client';

import { useState, useEffect } from 'react';
import { getData } from '@/services/api';


function AIInsightsPage() {
  const [threatData, setThreatData] = useState([]);
  const [insightResult, setInsightResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insightLoading, setInsightLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchThreatData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getData('/api/data/security-events?count=20');
        setThreatData(data);
        
        // Generate insights automatically when data is loaded
        generateInsights(data);
      } catch (err) {
        console.error('Error fetching threat intelligence data:', err);
        setError('Failed to load threat intelligence data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchThreatData();
  }, []);
  
  const generateInsights = async (threats) => {
    setInsightLoading(true);
    
    try {
      // For now, use mock insights since we don't have an AI endpoint
      // In a real implementation, you would call: await getData('/api/ai/insights', { threats });
      const mockInsights = {
        summary: "Security posture shows moderate risk with several emerging threats detected. Recent malware activity suggests increased targeting of financial services sector. Suspicious login patterns indicate potential credential compromise attempts.",
        recommendations: [
          "Update intrusion detection signatures for emerging threats",
          "Implement additional authentication factors for critical systems",
          "Review and update firewall rules for known malicious IP ranges",
          "Conduct targeted phishing awareness training"
        ],
        risk_score: 65,
        trends: [
          { label: "Malware Detections", value: 23, change: 15 },
          { label: "Phishing Attempts", value: 42, change: -8 },
          { label: "Unauthorized Access", value: 12, change: 5 },
          { label: "Data Exfiltration", value: 4, change: -2 }
        ],
        top_threats: [
          { name: "Emotet Variant", count: 12, severity: "high" },
          { name: "Credential Stuffing", count: 18, severity: "medium" },
          { name: "SQL Injection", count: 7, severity: "high" },
          { name: "Zero-day Vulnerability", count: 3, severity: "critical" },
          { name: "Ransomware", count: 5, severity: "critical" }
        ]
      };
      
      setInsightResult(mockInsights);
    } finally {
      setInsightLoading(false);
    }
  };
  
  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'low': return '#10B981'; // green
      case 'medium': return '#F59E0B'; // yellow
      case 'high': return '#EF4444'; // red
      case 'critical': return '#7C3AED'; // purple
      default: return '#6B7280'; // gray
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 p-4 rounded-md mb-6">
        <p>{error}</p>
        <button 
          className="mt-2 bg-red-200 dark:bg-red-800 px-3 py-1 rounded-md text-sm"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">AI Security Insights</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Advanced threat analysis and recommendations powered by AI</p>
      </div>
      
      {/* Main Insights Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Score */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security Risk Score</h3>
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg className="w-32 h-32" viewBox="0 0 36 36" preserveAspectRatio="xMidYMid meet">
                <path 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  strokeDasharray="100, 100"
                  stroke="#E5E7EB"
                  strokeWidth="2"
                  fill="none"
                  className="dark:stroke-gray-700"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  strokeDasharray={`${insightResult?.risk_score || 0}, 100`}
                  stroke={insightResult?.risk_score ? (insightResult.risk_score > 75 ? '#EF4444' : insightResult.risk_score > 50 ? '#F59E0B' : '#10B981') : '#3B82F6'}
                  strokeWidth="3"
                  fill="none"
                />
                <text x="18" y="20" textAnchor="middle" fontSize="8" fill="currentColor" className="text-gray-900 dark:text-white font-bold">
                  {insightResult?.risk_score || 0}%
                </text>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Security Trends */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security Trends</h3>
          <div className="space-y-4">
            {insightResult?.trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{trend.label}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{trend.value}</span>
                  <span className={`flex items-center text-sm font-medium ${trend.change > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {trend.change > 0 ? (
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                    {Math.abs(trend.change)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Summary and Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Summary</h3>
          <p className="text-gray-700 dark:text-gray-300">
            {insightResult?.summary || 'No summary available'}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recommendations</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            {insightResult?.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Top Threats Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Threats</h3>
        <div className="h-96">
          {insightResult?.top_threats && (
            <div className="space-y-4">
              {insightResult.top_threats.map((threat, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3" 
                      style={{ backgroundColor: getSeverityColor(threat.severity) }}
                    ></div>
                    <span className="font-medium text-gray-900 dark:text-white">{threat.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{threat.count} occurrences</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      threat.severity === 'critical' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                      threat.severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      threat.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {threat.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Threat Intelligence */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Security Events</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Event Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Source</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Severity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {threatData.slice(0, 5).map((event) => (
                <tr key={event.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{event.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{event.source}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      event.severity === 'critical' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                      event.severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      event.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {event.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(event.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex justify-center">
          <button 
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${insightLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => generateInsights(threatData)}
            disabled={insightLoading}
          >
            {insightLoading ? 'Generating insights...' : 'Refresh Insights'}
          </button>
        </div>
      </div>
    </div>
  );
} 

export default AIInsightsPage