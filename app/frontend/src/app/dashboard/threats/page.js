'use client';

import { useState, useEffect, useRef } from 'react';
// import { ThreatCard } from '@/components/ThreatCard';
// import { postData } from '@/services/api';
// import { getSecurityEvents, SecurityEvent } from '@/services/securityDataService';



export default function ThreatAnalysis() {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [historyEvents, setHistoryEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalEvents, setTotalEvents] = useState([]);
  
  // Keep a ref to ensure current values in async callbacks
  const itemsPerPageRef = useRef(itemsPerPage);
  const pageRef = useRef(page);
  
  // Update refs when state changes
  useEffect(() => {
    itemsPerPageRef.current = itemsPerPage;
    pageRef.current = page;
  }, [itemsPerPage, page]);
  
  const handleItemsPerPageChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    console.log('Changing items per page to:', newValue);
    setItemsPerPage(newValue);
    setPage(1); // Reset to first page when changing items per page
  };
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log('Fetching events with page:', page, 'itemsPerPage:', itemsPerPage);
        // Get all security events by using a high count value
        const events = await getSecurityEvents(1000);
        console.log('Total events fetched:', events.length);
        
        // Sort by timestamp, newest first
        const sortedEvents = events.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        setTotalEvents(sortedEvents);
        
        // Get current values from refs to ensure consistency
        const currentPage = pageRef.current;
        const currentItemsPerPage = itemsPerPageRef.current;
        
        const startIndex = (currentPage - 1) * currentItemsPerPage;
        const endIndex = startIndex + currentItemsPerPage;
        
        const paginatedEvents = sortedEvents.slice(startIndex, endIndex);
        console.log('Events for current page:', paginatedEvents.length, 'from', startIndex, 'to', endIndex);
        setHistoryEvents(paginatedEvents);
      } catch (error) {
        console.error('Error fetching security events:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [page, itemsPerPage]);

  const totalPages = Math.ceil(totalEvents.length / itemsPerPage);
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  
  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      // Call the AI service to analyze the text
      const response = await postData('/api/ai/analyze', { text: inputText });
      
      setAnalysisResult(response);
    } catch (error) {
      console.error('Error analyzing text:', error);
      // Fallback to mock response if API fails
      const mockResponse = {
        threat_level: inputText.toLowerCase().includes('hack') || inputText.toLowerCase().includes('attack') ? 'high' : 
                      inputText.toLowerCase().includes('suspicious') ? 'medium' : 'low',
        confidence: Math.random() * 0.5 + 0.5, // Random between 0.5 and 1.0
        categories: ['sentiment', 'behavioral'],
        explanation: `Analysis complete for text: "${inputText.substring(0, 50)}${inputText.length > 50 ? '...' : ''}".`,
        recommendations: [
          'Monitor user activity',
          'Review content regularly',
          inputText.toLowerCase().includes('hack') ? 'Escalate to security team' : null,
          inputText.toLowerCase().includes('attack') ? 'Block source IP address' : null,
  ].filter(Boolean),
      };
      
      setAnalysisResult(mockResponse);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  const getSeverityClass = (severity) => {
    switch(severity) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'critical': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Threat Analysis</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Analyze text for potential security threats</p>
      </div>
      
      {/* Input Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI-Powered Threat Detection</h2>
        <div className="space-y-4">
          <textarea
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            rows={6}
            placeholder="Enter text to analyze for potential threats..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          ></textarea>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !inputText.trim()}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
          </button>
        </div>
      </div>
      
      {/* Analysis Result */}
      {analysisResult && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analysis Result</h2>
          <ThreatCard
            level={analysisResult.threat_level}
            source="Text Analysis"
            timestamp={new Date().toLocaleString()}
            description={analysisResult.explanation}
            confidence={analysisResult.confidence}
            recommendations={analysisResult.recommendations}
          />
        </div>
      )}
      
      {/* Recent Analysis History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analysis History</h2>
        {loading ? (
          <div className="text-center py-4">Loading event history...</div>
        ) : (
          <div key={`threats-page-${page}-${itemsPerPage}`}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Show</span>
                <select 
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">entries</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {totalEvents.length > 0 ? (page - 1) * itemsPerPage + 1 : 0} to {Math.min(page * itemsPerPage, totalEvents.length)} of {totalEvents.length} entries
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Source</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Result</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {historyEvents.map((event) => (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatTimestamp(event.timestamp)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{event.source}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{event.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityClass(event.severity)}`}>
                          {event.severity.charAt(0).toUpperCase() + event.severity.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <button 
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 disabled:opacity-50"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(pageNum => {
                      // Show first page, last page, current page, and pages around current page
                      return pageNum === 1 || 
                             pageNum === totalPages || 
                             (pageNum >= page - 1 && pageNum <= page + 1);
                    })
                    .map((pageNum, index, array) => {
                      // Add ellipsis between non-consecutive page numbers
                      const showEllipsisAfter = index < array.length - 1 && array[index + 1] - pageNum > 1;
                      
                      return (
                        <div key={pageNum} className="flex items-center">
                          <button
                            className={`px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm 
                                       ${pageNum === page 
                                         ? 'bg-blue-600 text-white' 
                                         : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </button>
                          {showEllipsisAfter && (
                            <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
                          )}
                        </div>
                      );
                    })}
                </div>
                
                <button 
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 disabled:opacity-50"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 