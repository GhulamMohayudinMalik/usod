import React, { useState } from 'react';
import apiService from '../services/api';

const PcapAnalyzerPage = () => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    const validExtensions = ['.pcap', '.pcapng'];
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setError('Invalid file format. Please upload a .pcap or .pcapng file.');
      setFile(null);
      return;
    }

    // Check file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (selectedFile.size > maxSize) {
      setError('File size exceeds 100MB limit.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResults(null);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    setResults(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    setError(null);

    try {
      const result = await apiService.uploadPcapFile(file);

      if (result.success) {
        console.log('✅ PCAP Analysis Results:', result);
        
        setResults({
          success: true,
          message: result.message,
          threats: result.threats || [],
          flowsAnalyzed: result.flowsAnalyzed || 0,
          fileName: result.fileName || file.name,
          analysisTimestamp: result.analysisTimestamp || new Date().toISOString()
        });
      } else {
        setError(result.message || 'Analysis failed');
      }
      
    } catch (err) {
      console.error('PCAP analysis error:', err);
      setError(err.message || 'Failed to analyze PCAP file. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return { background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.3)' };
      case 'high': return { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' };
      case 'medium': return { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)' };
      case 'low': return { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.3)' };
      default: return { background: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', borderColor: 'rgba(107, 114, 128, 0.3)' };
    }
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600', margin: 0, marginBottom: '0.25rem' }}>
          PCAP Analyzer
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
          Upload and analyze packet capture files for threat detection
        </p>
      </div>

      {/* Upload Section */}
      <div style={{
        background: 'rgba(31, 41, 55, 0.8)',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: '1px solid rgba(55, 65, 81, 0.3)'
      }}>
        <h2 style={{ color: 'white', fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
          Upload PCAP File
        </h2>
        
        {!file ? (
          <div
            style={{
              position: 'relative',
              border: `2px dashed ${dragActive ? '#3b82f6' : '#4b5563'}`,
              borderRadius: '0.5rem',
              padding: '2rem',
              textAlign: 'center',
              transition: 'all 0.2s',
              background: dragActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              cursor: 'pointer'
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload').click()}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☁️</div>
            <div style={{ color: '#d1d5db', marginBottom: '0.5rem' }}>
              <span style={{ color: '#3b82f6', cursor: 'pointer' }}>Click to upload</span>
              <span> or drag and drop</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
              PCAP or PCAPNG files up to 100MB
            </p>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              style={{ display: 'none' }}
              accept=".pcap,.pcapng"
              onChange={handleFileInput}
            />
          </div>
        ) : (
          <div style={{
            background: 'rgba(55, 65, 81, 0.5)',
            borderRadius: '0.5rem',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ fontSize: '2rem' }}>📄</div>
              <div>
                <p style={{ color: 'white', fontWeight: '500', margin: 0 }}>{file.name}</p>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.25rem'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {error && (
          <div style={{
            marginTop: '1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.5rem',
            padding: '1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0 }}>{error}</p>
          </div>
        )}

        {file && !results && (
          <div style={{ marginTop: '1.5rem' }}>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                background: analyzing ? '#6b7280' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: analyzing ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                opacity: analyzing ? 0.5 : 1,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {analyzing ? (
                <>
              <div className="spinner"></div>
                  Analyzing PCAP File...
                </>
              ) : (
                <>
                  📊 Analyze File
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Results Section */}
      {results && (
        <>
          {/* Summary Statistics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{
              background: 'rgba(31, 41, 55, 0.8)',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              border: '1px solid rgba(55, 65, 81, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontSize: '2rem', marginRight: '1rem' }}>🛡️</div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', margin: 0 }}>Total Threats</p>
                  <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                    {results.threats?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(31, 41, 55, 0.8)',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              border: '1px solid rgba(55, 65, 81, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontSize: '2rem', marginRight: '1rem' }}>⚠️</div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', margin: 0 }}>High Severity</p>
                  <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#ef4444', margin: 0 }}>
                    {results.threats?.filter(t => t.severity === 'high').length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(31, 41, 55, 0.8)',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              border: '1px solid rgba(55, 65, 81, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontSize: '2rem', marginRight: '1rem' }}>📊</div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', margin: 0 }}>Flows Analyzed</p>
                  <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                    {results.flowsAnalyzed || 0}
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(31, 41, 55, 0.8)',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              border: '1px solid rgba(55, 65, 81, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontSize: '2rem', marginRight: '1rem' }}>✅</div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', margin: 0 }}>Analysis Status</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>
                    Complete
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detected Threats */}
          {results.threats && results.threats.length > 0 ? (
            <div style={{
              background: 'rgba(31, 41, 55, 0.8)',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              border: '1px solid rgba(55, 65, 81, 0.3)',
              marginBottom: '2rem'
            }}>
              <h3 style={{ color: 'white', fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
                Detected Threats
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {results.threats.map((threat, index) => {
                  const severityStyle = getSeverityColor(threat.severity);
                  return (
                    <div
                      key={index}
                      style={{
                        background: severityStyle.background,
                        border: `1px solid ${severityStyle.borderColor}`,
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = severityStyle.color}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = severityStyle.borderColor}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                          <div>
                            <h4 style={{ color: 'white', fontWeight: '600', margin: 0, marginBottom: '0.25rem' }}>
                              {threat.threat_type?.toUpperCase() || 'Unknown Threat'}
                            </h4>
                            <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>{threat.threat_id}</p>
                          </div>
                        </div>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          border: `1px solid ${severityStyle.borderColor}`,
                          background: severityStyle.background,
                          color: severityStyle.color
                        }}>
                          {threat.severity?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.875rem' }}>
                        <div>
                          <p style={{ color: '#9ca3af', margin: 0 }}>Source IP</p>
                          <p style={{ color: 'white', fontFamily: 'monospace', margin: 0 }}>{threat.source_ip}</p>
                        </div>
                        <div>
                          <p style={{ color: '#9ca3af', margin: 0 }}>Destination IP</p>
                          <p style={{ color: 'white', fontFamily: 'monospace', margin: 0 }}>{threat.destination_ip}</p>
                        </div>
                        <div>
                          <p style={{ color: '#9ca3af', margin: 0 }}>Confidence</p>
                          <p style={{ color: 'white', margin: 0 }}>{Math.round((threat.confidence || 0) * 100)}%</p>
                        </div>
                        <div>
                          <p style={{ color: '#9ca3af', margin: 0 }}>Timestamp</p>
                          <p style={{ color: 'white', margin: 0 }}>{new Date(threat.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(31, 41, 55, 0.8)',
              borderRadius: '0.5rem',
              padding: '2rem',
              textAlign: 'center',
              border: '1px solid rgba(55, 65, 81, 0.3)',
              marginBottom: '2rem'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h3 style={{ color: 'white', fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                No Threats Detected
              </h3>
              <p style={{ color: '#9ca3af', margin: 0 }}>
                The PCAP file was analyzed successfully. No malicious activity was found.
              </p>
            </div>
          )}

          {/* New Analysis Button */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleRemoveFile}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#4b5563',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#374151'}
              onMouseLeave={(e) => e.target.style.background = '#4b5563'}
            >
              Analyze Another File
            </button>
          </div>
        </>
      )}

    </div>
  );
};

export default PcapAnalyzerPage;

