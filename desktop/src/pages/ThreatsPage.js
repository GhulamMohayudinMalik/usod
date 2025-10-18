import React, { useState, useEffect, useRef } from 'react';
import apiService from '../services/api';

const ThreatsPage = () => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [historyEvents, setHistoryEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalEvents, setTotalEvents] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  
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
        const result = await apiService.getThreats(100);
        
        if (result.success) {
          const events = result.data || [];
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
          setLastUpdated(new Date());
        }
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

  // Refresh function
  const refreshEvents = async () => {
    setLoading(true);
    try {
      const result = await apiService.getThreats(100);
      
      if (result.success) {
        const events = result.data || [];
        const sortedEvents = events.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        setTotalEvents(sortedEvents);
        
        const currentPage = pageRef.current;
        const currentItemsPerPage = itemsPerPageRef.current;
        
        const startIndex = (currentPage - 1) * currentItemsPerPage;
        const endIndex = startIndex + currentItemsPerPage;
        
        const paginatedEvents = sortedEvents.slice(startIndex, endIndex);
        setHistoryEvents(paginatedEvents);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error refreshing security events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityClass = (severity) => {
    switch(severity) {
      case 'low': return { background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' };
      case 'medium': return { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
      case 'high': return { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
      case 'critical': return { background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' };
      default: return { background: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' };
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
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
      const result = await apiService.updateLogStatus(threat.id, status);
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

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      // Mock AI analysis
      setTimeout(() => {
        const mockResponse = {
          threat_level: inputText.toLowerCase().includes('hack') || inputText.toLowerCase().includes('attack') ? 'high' : 
                        inputText.toLowerCase().includes('suspicious') ? 'medium' : 'low',
          confidence: Math.random() * 0.5 + 0.5,
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
        setIsAnalyzing(false);
      }, 2000);
    } catch (error) {
      console.error('Error analyzing text:', error);
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
    <div>
          <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600', margin: 0, marginBottom: '0.25rem' }}>
            Threat Analysis
        </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
            Analyze text for potential security threats
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {lastUpdated && (
            <div style={{
              fontSize: '0.875rem', 
              color: '#9ca3af'
            }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          <button 
            style={{
              padding: '0.5rem 1rem',
              background: '#2563eb',
              color: 'white',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#1d4ed8'}
            onMouseLeave={(e) => e.target.style.background = '#2563eb'}
            onClick={refreshEvents}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div style={{
        background: 'rgba(31, 41, 55, 0.8)',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: '1px solid rgba(55, 65, 81, 0.3)'
      }}>
        <h2 style={{ color: 'white', fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
          AI-Powered Threat Detection
        </h2>
        <div style={{ marginBottom: '1rem' }}>
          <textarea
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(55, 65, 81, 0.5)',
              border: '1px solid rgba(75, 85, 99, 0.5)',
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '0.875rem',
              minHeight: '120px',
              resize: 'vertical'
            }}
            rows={6}
            placeholder="Enter text to analyze for potential threats..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>
        <button
          style={{
            padding: '0.5rem 1rem',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            opacity: isAnalyzing || !inputText.trim() ? 0.5 : 1
          }}
          onClick={handleAnalyze}
          disabled={isAnalyzing || !inputText.trim()}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
        </button>
      </div>

      {/* Analysis Result */}
      {analysisResult && (
        <div style={{
          background: 'rgba(31, 41, 55, 0.8)',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid rgba(55, 65, 81, 0.3)'
        }}>
          <h2 style={{ color: 'white', fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            Analysis Result
          </h2>
          <div style={{
            background: 'rgba(31, 41, 55, 0.5)',
            border: '1px solid rgba(55, 65, 81, 0.3)',
            borderRadius: '0.75rem',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: `linear-gradient(135deg, ${getSeverityClass(analysisResult.threat_level).color} 0%, ${getSeverityClass(analysisResult.threat_level).color}CC 100%)`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                🛡️
              </div>
              <div>
                <h3 style={{ color: 'white', fontWeight: '600', fontSize: '1.1rem' }}>
                  Threat Level: {analysisResult.threat_level.toUpperCase()}
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                  Confidence: {(analysisResult.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <p style={{ color: '#d1d5db', marginBottom: '1rem' }}>
              {analysisResult.explanation}
            </p>
            <div>
              <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem' }}>
                Recommendations:
              </h4>
              <ul style={{ color: '#d1d5db', paddingLeft: '1.5rem' }}>
                {analysisResult.recommendations.map((rec, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem' }}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Recent Analysis History */}
      <div style={{
        background: 'rgba(31, 41, 55, 0.8)',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        border: '1px solid rgba(55, 65, 81, 0.3)'
      }}>
        <h2 style={{ color: 'white', fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
          Analysis History
        </h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '1rem', color: '#9ca3af' }}>Loading event history...</div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: '#9ca3af', marginRight: '0.5rem' }}>Show</span>
                <select 
                  style={{
                    background: 'rgba(55, 65, 81, 0.5)',
                    border: '1px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '0.25rem',
                    padding: '0.25rem 0.5rem',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span style={{ fontSize: '0.875rem', color: '#9ca3af', marginLeft: '0.5rem' }}>entries</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                Showing {totalEvents.length > 0 ? (page - 1) * itemsPerPage + 1 : 0} to {Math.min(page * itemsPerPage, totalEvents.length)} of {totalEvents.length} entries
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(55, 65, 81, 0.3)' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase' }}>Time</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase' }}>Source</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase' }}>Description</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase' }}>Severity</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase' }}>Details</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {historyEvents.map((event) => (
                    <tr key={event.id} style={{ borderBottom: '1px solid rgba(55, 65, 81, 0.3)' }}>
                      <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: '#9ca3af' }}>{formatTimestamp(event.timestamp)}</td>
                      <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: '#9ca3af' }}>{event.source}</td>
                      <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: '#9ca3af', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.description}</td>
                      <td style={{ padding: '1rem 0.75rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          ...getSeverityClass(event.severity)
                        }}>
                          {event.severity.charAt(0).toUpperCase() + event.severity.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.75rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          background: event.status === 'resolved' ? 'rgba(34, 197, 94, 0.1)' : 
                                     event.status === 'escalated' ? 'rgba(249, 115, 22, 0.1)' :
                                     event.status === 'investigating' ? 'rgba(59, 130, 246, 0.1)' :
                                     'rgba(107, 114, 128, 0.1)',
                          color: event.status === 'resolved' ? '#22c55e' : 
                                 event.status === 'escalated' ? '#f97316' :
                                 event.status === 'investigating' ? '#3b82f6' :
                                 '#6b7280'
                        }}>
                          {event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : 'Open'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.75rem' }}>
                        <button 
                          onClick={() => handleViewThreat(event)}
                          style={{
                            padding: '0.375rem 0.75rem',
                            background: '#2563eb',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            borderRadius: '0.375rem',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#1d4ed8'}
                          onMouseLeave={(e) => e.target.style.background = '#2563eb'}
                        >
                          View Details
                        </button>
                      </td>
                      <td style={{ padding: '1rem 0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => handleThreatAction('escalate', event)}
                            style={{
                              padding: '0.375rem 0.75rem',
                              background: '#f97316',
                              color: 'white',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              borderRadius: '0.375rem',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#ea580c'}
                            onMouseLeave={(e) => e.target.style.background = '#f97316'}
                          >
                            Escalate
                          </button>
                          <button 
                            onClick={() => handleThreatAction('resolve', event)}
                            style={{
                              padding: '0.375rem 0.75rem',
                              background: '#22c55e',
                              color: 'white',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              borderRadius: '0.375rem',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#16a34a'}
                            onMouseLeave={(e) => e.target.style.background = '#22c55e'}
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                <button 
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                    background: 'rgba(55, 65, 81, 0.5)',
                    color: 'white',
                    cursor: 'pointer',
                    opacity: page === 1 ? 0.5 : 1
                  }}
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
                
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(pageNum => {
                      return pageNum === 1 || 
                             pageNum === totalPages || 
                             (pageNum >= page - 1 && pageNum <= page + 1);
                    })
                    .map((pageNum, index, array) => {
                      const showEllipsisAfter = index < array.length - 1 && array[index + 1] - pageNum > 1;
                      
                      return (
                        <div key={pageNum} style={{ display: 'flex', alignItems: 'center' }}>
                          <button
                            style={{
                              padding: '0.5rem 0.75rem',
                              border: '1px solid rgba(75, 85, 99, 0.5)',
                              borderRadius: '0.25rem',
                              fontSize: '0.875rem',
                              background: pageNum === page ? '#2563eb' : 'rgba(55, 65, 81, 0.5)',
                              color: 'white',
                              cursor: 'pointer'
                            }}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </button>
                          {showEllipsisAfter && (
                            <span style={{ padding: '0 0.5rem', color: '#9ca3af' }}>...</span>
                          )}
                        </div>
                      );
                    })}
                </div>
                
                <button 
              style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                    background: 'rgba(55, 65, 81, 0.5)',
                    color: 'white',
                    cursor: 'pointer',
                    opacity: page === totalPages ? 0.5 : 1
                  }}
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
      {isModalOpen && selectedThreat && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(31, 41, 55, 0.95)',
            borderRadius: '0.5rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            border: '1px solid rgba(55, 65, 81, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Threat Details</h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  background: `linear-gradient(135deg, ${getSeverityClass(selectedThreat.severity).color} 0%, ${getSeverityClass(selectedThreat.severity).color}CC 100%)`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  🛡️
                </div>
                <div>
                  <h3 style={{ color: 'white', fontWeight: '600', fontSize: '1.1rem', margin: 0 }}>
                    {selectedThreat.severity.charAt(0).toUpperCase() + selectedThreat.severity.slice(1)} Threat
                    </h3>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
                    Detected at {formatTimestamp(selectedThreat.timestamp)}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', marginBottom: '0.25rem' }}>
                    Source
                  </label>
                  <p style={{ fontSize: '0.875rem', color: 'white', background: 'rgba(55, 65, 81, 0.5)', padding: '0.5rem', borderRadius: '0.25rem', margin: 0 }}>
                    {selectedThreat.source}
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', marginBottom: '0.25rem' }}>
                    Threat ID
                  </label>
                  <p style={{ fontSize: '0.875rem', color: 'white', background: 'rgba(55, 65, 81, 0.5)', padding: '0.5rem', borderRadius: '0.25rem', margin: 0, fontFamily: 'monospace' }}>
                    {selectedThreat.id || 'N/A'}
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', marginBottom: '0.25rem' }}>
                    Current Status
                  </label>
                    <span style={{
                    padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                    background: selectedThreat.status === 'resolved' ? 'rgba(34, 197, 94, 0.1)' : 
                               selectedThreat.status === 'escalated' ? 'rgba(249, 115, 22, 0.1)' :
                               selectedThreat.status === 'investigating' ? 'rgba(59, 130, 246, 0.1)' :
                               'rgba(107, 114, 128, 0.1)',
                    color: selectedThreat.status === 'resolved' ? '#22c55e' : 
                           selectedThreat.status === 'escalated' ? '#f97316' :
                           selectedThreat.status === 'investigating' ? '#3b82f6' :
                           '#6b7280'
                  }}>
                    {selectedThreat.status ? selectedThreat.status.charAt(0).toUpperCase() + selectedThreat.status.slice(1) : 'Open'}
                    </span>
                  </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', marginBottom: '0.25rem' }}>
                  Description
                </label>
                <p style={{ fontSize: '0.875rem', color: 'white', background: 'rgba(55, 65, 81, 0.5)', padding: '0.75rem', borderRadius: '0.25rem', margin: 0 }}>
                  {selectedThreat.description}
                </p>
              </div>
              
              {selectedThreat.details && (
                <div style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', marginBottom: '0.25rem' }}>
                    Additional Details
                  </label>
                  <div style={{ background: 'rgba(55, 65, 81, 0.5)', padding: '0.75rem', borderRadius: '0.25rem' }}>
                    <pre style={{ fontSize: '0.75rem', color: 'white', margin: 0, whiteSpace: 'pre-wrap', overflow: 'auto' }}>
                      {JSON.stringify(selectedThreat.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid rgba(55, 65, 81, 0.3)' }}>
              <button
                onClick={() => handleThreatAction('escalate', selectedThreat)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#f97316',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#ea580c'}
                onMouseLeave={(e) => e.target.style.background = '#f97316'}
              >
                Escalate Threat
              </button>
              <button
                onClick={() => handleThreatAction('resolve', selectedThreat)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#22c55e',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#16a34a'}
                onMouseLeave={(e) => e.target.style.background = '#22c55e'}
              >
                Mark as Resolved
                </button>
              <button
                onClick={() => handleThreatAction('investigate', selectedThreat)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#2563eb',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#1d4ed8'}
                onMouseLeave={(e) => e.target.style.background = '#2563eb'}
              >
                Start Investigation
                </button>
              </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ThreatsPage;
