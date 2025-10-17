'use client';

import { useState, useEffect, useRef } from 'react';
import { ThreatCard } from '@/components/ThreatCard';
import { getData, updateLogStatus } from '@/services/api';
import Modal from '@/components/Modal';



export default function ThreatAnalysis() {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [historyEvents, setHistoryEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalEvents, setTotalEvents] = useState([]);
  
  // Modal state
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
        // Get security events from the API
        const events = await getData('/api/data/security-events?count=100');
        console.log('Total events fetched:', events.length);
        console.log('Sample event structure:', events[0]);
        
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
      // For now, use a mock response since we don't have an AI endpoint
      // In a real implementation, you would call: await getData('/api/ai/analyze', { text: inputText });
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
    } catch (error) {
      console.error('Error analyzing text:', error);
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
  
  // Handle threat actions
  const handleViewThreat = (threat) => {
    setSelectedThreat(threat);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedThreat(null);
  };
  
  const handleThreatAction = async (action, threat) => {
    try {
      console.log(`Performing action: ${action} on threat:`, threat);
      console.log('Threat ID:', threat.id);
      
      // Map action to status
      const status = action === 'resolve' ? 'resolved' : 
                    action === 'escalate' ? 'escalated' : 
                    action === 'investigate' ? 'investigating' : 'open';
      
      console.log('Mapped status:', status);
      
      // Make API call to update status in database
      console.log('Making API call to update status...');
      const result = await updateLogStatus(threat.id, status);
      console.log('API call result:', result);
      
      // Update the local state to reflect the action
      const updatedEvents = totalEvents.map(event => {
        if (event.id === threat.id) {
          return {
            ...event,
            status: status
          };
        }
        return event;
      });
      
      setTotalEvents(updatedEvents);
      
      // Update the current page events
      const currentPage = pageRef.current;
      const currentItemsPerPage = itemsPerPageRef.current;
      const startIndex = (currentPage - 1) * currentItemsPerPage;
      const endIndex = startIndex + currentItemsPerPage;
      const paginatedEvents = updatedEvents.slice(startIndex, endIndex);
      setHistoryEvents(paginatedEvents);
      
      // Show success message
      alert(`Action "${action}" performed successfully on threat from ${threat.source}`);
      
      // Close modal after action
      closeModal();
    } catch (error) {
      console.error('Error performing threat action:', error);
      console.error('Error details:', error.message, error.stack);
      alert(`Failed to perform action: ${error.message}`);
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
            onViewDetails={() => handleViewThreat({
              id: 'analysis-' + Date.now(),
              severity: analysisResult.threat_level,
              source: 'Text Analysis',
              timestamp: new Date().toISOString(),
              description: analysisResult.explanation,
              details: analysisResult
            })}
            onTakeAction={() => handleThreatAction('investigate', {
              id: 'analysis-' + Date.now(),
              severity: analysisResult.threat_level,
              source: 'Text Analysis',
              timestamp: new Date().toISOString(),
              description: analysisResult.explanation,
              details: analysisResult
            })}
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Severity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Details</th>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          event.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          event.status === 'escalated' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                          event.status === 'investigating' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : 'Open'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleViewThreat(event)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800 transition-colors duration-200 shadow-sm hover:shadow-md"
                        >
                          View Details
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleThreatAction('escalate', event)}
                            className="px-3 py-1.5 bg-orange-600 text-white text-xs font-medium rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800 transition-colors duration-200 shadow-sm hover:shadow-md"
                          >
                            Escalate
                          </button>
                          <button 
                            onClick={() => handleThreatAction('resolve', event)}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800 transition-colors duration-200 shadow-sm hover:shadow-md"
                          >
                            Resolve
                          </button>
                        </div>
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
      
      {/* Threat Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Threat Details"
        size="lg"
      >
        {selectedThreat && (
          <div className="space-y-6">
            {/* Threat Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedThreat.severity === 'critical' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' :
                  selectedThreat.severity === 'high' ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' :
                  selectedThreat.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400' :
                  'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {selectedThreat.severity} Threat
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Detected at {formatTimestamp(selectedThreat.timestamp)}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityClass(selectedThreat.severity)}`}>
                {selectedThreat.severity.charAt(0).toUpperCase() + selectedThreat.severity.slice(1)}
              </span>
            </div>
            
            {/* Threat Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Source
                </label>
                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  {selectedThreat.source}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Threat ID
                </label>
                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded font-mono">
                  {selectedThreat.id || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Status
                </label>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  selectedThreat.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  selectedThreat.status === 'escalated' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                  selectedThreat.status === 'investigating' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {selectedThreat.status ? selectedThreat.status.charAt(0).toUpperCase() + selectedThreat.status.slice(1) : 'Open'}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded">
                {selectedThreat.description}
              </p>
            </div>
            
            {/* Additional Details */}
            {selectedThreat.details && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Additional Details
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(selectedThreat.details, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleThreatAction('escalate', selectedThreat)}
                className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Escalate Threat
              </button>
              <button
                onClick={() => handleThreatAction('resolve', selectedThreat)}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Mark as Resolved
              </button>
              <button
                onClick={() => handleThreatAction('investigate', selectedThreat)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Start Investigation
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
} 