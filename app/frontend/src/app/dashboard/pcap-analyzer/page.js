'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CloudArrowUpIcon, 
  DocumentMagnifyingGlassIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function PCAPAnalyzerPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setAuthLoading(false);
    }
  }, [router]);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Validate and set file
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

  // Remove selected file
  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    setResults(null);
  };

  // Analyze PCAP file
  const handleAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('pcap', file);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/network/upload-pcap', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      const data = await response.json();
      console.log('✅ PCAP Analysis Results:', data);
      
      // Transform backend response to match frontend structure
      const transformedResults = {
        success: data.success,
        message: data.message,
        threats: data.threats || [],
        flowsAnalyzed: data.flowsAnalyzed || 0,
        fileName: data.fileName || file.name,
        analysisTimestamp: data.analysisTimestamp || new Date().toISOString()
      };
      
      setResults(transformedResults);
      
    } catch (err) {
      console.error('PCAP analysis error:', err);
      setError(err.message || 'Failed to analyze PCAP file. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'high': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-100">PCAP Analyzer</h1>
        <p className="text-sm text-gray-400">Upload and analyze packet capture files for threat detection</p>
      </div>

      {/* Upload Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
        <h2 className="text-lg font-medium text-gray-100 mb-4">Upload PCAP File</h2>
        
        {!file ? (
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-cyan-500 bg-cyan-500/10' 
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="text-gray-300 mb-2">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-cyan-400 hover:text-cyan-300">Click to upload</span>
                <span> or drag and drop</span>
              </label>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept=".pcap,.pcapng"
                onChange={handleFileInput}
              />
            </div>
            <p className="text-sm text-gray-500">PCAP or PCAPNG files up to 100MB</p>
          </div>
        ) : (
          <div className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DocumentMagnifyingGlassIcon className="h-8 w-8 text-cyan-400" />
              <div>
                <p className="text-gray-100 font-medium">{file.name}</p>
                <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-900/30 border border-red-500/50 rounded-lg p-4 flex items-start space-x-3">
            <XCircleIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {file && !results && (
          <div className="mt-6">
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full flex items-center justify-center px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {analyzing ? (
                <>
                  <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                  Analyzing PCAP File...
                </>
              ) : (
                <>
                  <DocumentMagnifyingGlassIcon className="h-5 w-5 mr-2" />
                  Analyze File
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShieldExclamationIcon className="h-8 w-8 text-cyan-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Threats</p>
                  <p className="text-2xl font-bold text-gray-100">{results.threats?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-8 w-8 text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">High Severity</p>
                  <p className="text-2xl font-bold text-red-400">
                    {results.threats?.filter(t => t.severity === 'high').length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentMagnifyingGlassIcon className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Flows Analyzed</p>
                  <p className="text-2xl font-bold text-gray-100">{results.flowsAnalyzed || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Analysis Status</p>
                  <p className="text-lg font-bold text-green-400">Complete</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detected Threats */}
          {results.threats && results.threats.length > 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="text-lg font-medium text-gray-100">Detected Threats</h3>
              </div>
              <div className="p-6 space-y-4">
                {results.threats.map((threat, index) => (
                  <div
                    key={index}
                    className="bg-gray-700/50 rounded-lg border border-gray-600 p-4 hover:border-cyan-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <ShieldExclamationIcon className="h-6 w-6 text-red-400" />
                        <div>
                          <h4 className="text-gray-100 font-medium">{threat.threat_type?.toUpperCase() || 'Unknown Threat'}</h4>
                          <p className="text-sm text-gray-400">{threat.threat_id}</p>
                          {threat.predicted_class && threat.predicted_class !== threat.threat_type && (
                            <p className="text-xs text-cyan-400">ML Prediction: {threat.predicted_class}</p>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(threat.severity)}`}>
                        {threat.severity?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Source</p>
                        <p className="text-gray-100 font-mono">{threat.source_ip}:{threat.source_port || '?'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Destination</p>
                        <p className="text-gray-100 font-mono">{threat.destination_ip}:{threat.destination_port || '?'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Confidence</p>
                        <p className="text-gray-100">{Math.round((threat.confidence || 0) * 100)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Protocol</p>
                        <p className="text-gray-100">{threat.protocol || 'Unknown'}</p>
                      </div>
                    </div>
                    {threat.details && (
                      <div className="mt-3 pt-3 border-t border-gray-600 text-xs text-gray-400">
                        <span className="mr-4">Model: {threat.details.model_used || 'XGBoost'}</span>
                        <span className="mr-4">Fwd Pkts: {threat.details.forward_packets || 0}</span>
                        <span>Bwd Pkts: {threat.details.backward_packets || 0}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-8 text-center">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-100 mb-2">No Threats Detected</h3>
              <p className="text-gray-400">The PCAP file was analyzed successfully. No malicious activity was found.</p>
            </div>
          )}

          {/* New Analysis Button */}
          <div className="flex justify-center">
            <button
              onClick={handleRemoveFile}
              className="px-6 py-3 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Analyze Another File
            </button>
          </div>
        </>
      )}
    </div>
  );
}

