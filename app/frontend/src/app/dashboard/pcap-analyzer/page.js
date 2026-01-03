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
    const [progress, setProgress] = useState(0);
    const [progressText, setProgressText] = useState('');
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [serviceOnline, setServiceOnline] = useState(false);
    const [batchSize, setBatchSize] = useState(5000);

    // Authentication check
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        } else {
            setAuthLoading(false);
        }
    }, [router]);

    // Check AI service health
    useEffect(() => {
        const checkHealth = async () => {
            try {
                const response = await fetch('http://localhost:8000/health');
                if (response.ok) {
                    setServiceOnline(true);
                } else {
                    setServiceOnline(false);
                }
            } catch {
                setServiceOnline(false);
            }
        };
        checkHealth();
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, []);

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
        const validExtensions = ['.pcap', '.pcapng', '.cap'];
        const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

        if (!validExtensions.includes(fileExtension)) {
            setError('Invalid file type. Please upload a .pcap, .pcapng, or .cap file.');
            setFile(null);
            return;
        }

        setFile(selectedFile);
        setError(null);
        setResults(null);
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    // Remove selected file
    const handleRemoveFile = () => {
        setFile(null);
        setError(null);
        setResults(null);
        setProgress(0);
        setProgressText('');
    };

    // Analyze PCAP file
    const handleAnalyze = async () => {
        if (!file) return;

        setAnalyzing(true);
        setError(null);
        setProgress(0);
        setProgressText('Preparing analysis...');

        const startTime = Date.now();

        // Simulate progress (faster updates)
        let currentProgress = 0;
        const progressInterval = setInterval(() => {
            if (currentProgress < 90) {
                currentProgress += Math.random() * 8 + 2; // Faster increments (2-10)
                setProgress(Math.min(currentProgress, 90));
                if (currentProgress > 30 && currentProgress < 60) {
                    setProgressText('Analyzing network flows...');
                } else if (currentProgress >= 60) {
                    setProgressText('Running threat detection model...');
                } else {
                    setProgressText('Uploading file...');
                }
            }
        }, 300); // Faster interval (300ms instead of 1000ms)

        try {
            const formData = new FormData();
            formData.append('pcap', file);
            formData.append('batchSize', batchSize.toString());

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/network/upload-pcap', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Analysis failed');
            }

            setProgress(100);
            setProgressText('Analysis complete!');

            const data = await response.json();
            console.log('✅ PCAP Analysis Results:', data);

            const endTime = Date.now();
            const processingTime = data.processingTime || (endTime - startTime) / 1000;

            // Get summary from backend
            const summary = data.summary || {};
            const totalFlows = summary.total || data.flowsAnalyzed || 0;
            const benignCount = summary.benign_count || 0;
            const attackCount = summary.attack_count || 0;
            const benignPct = summary.benign_percentage || (totalFlows > 0 ? (benignCount / totalFlows * 100) : 0);
            const attackPct = summary.attack_percentage || (totalFlows > 0 ? (attackCount / totalFlows * 100) : 0);

            setTimeout(() => {
                setResults({
                    success: data.success,
                    threats: data.threats || [],
                    flowsAnalyzed: totalFlows,
                    fileName: data.fileName || file.name,
                    summary: {
                        total: totalFlows,
                        benign_count: benignCount,
                        attack_count: attackCount,
                        benign_percentage: benignPct,
                        attack_percentage: attackPct,
                        batch_breakdown: summary.batch_breakdown || []
                    },
                    processingTime: processingTime,
                    threatDetected: attackCount > 0 || (data.threats && data.threats.length > 0)
                });
                setAnalyzing(false);
            }, 500);

        } catch (err) {
            clearInterval(progressInterval);
            console.error('PCAP analysis error:', err);
            setError(err.message || 'Failed to analyze PCAP file.');
            setAnalyzing(false);
            setProgress(0);
            setProgressText('');
        }
    };

    // Get bar color based on attack percentage
    const getAttackBarColor = (percentage) => {
        if (percentage > 50) return 'bg-red-500';
        if (percentage > 20) return 'bg-yellow-500';
        if (percentage > 5) return 'bg-orange-500';
        return 'bg-green-500';
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
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-100">🛡️ Network Threat Detection</h1>
                <p className="text-gray-400 mt-2">AI-Powered PCAP File Analyzer</p>
            </div>

            {/* Service Status */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4 text-center">
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${serviceOnline ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></span>
                <span className="text-gray-300">
                    {serviceOnline ? 'AI Service online | Model: Loaded | Ready for analysis' : 'AI Service offline | Make sure Python service is running on port 8000'}
                </span>
            </div>

            {/* Upload Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-8">
                <h2 className="text-xl font-semibold text-gray-100 mb-4 text-center">📁 Upload PCAP File</h2>
                <p className="text-gray-400 text-center mb-6">Drag and drop your PCAP file here, or click to browse</p>

                <div
                    className={`relative border-3 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${dragActive
                        ? 'border-cyan-500 bg-cyan-500/10 scale-[1.02]'
                        : 'border-gray-600 hover:border-cyan-400 hover:bg-gray-700/30'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:-translate-y-0.5">
                            Choose PCAP File
                        </div>
                        <input
                            id="file-upload"
                            type="file"
                            className="sr-only"
                            accept=".pcap,.pcapng,.cap"
                            onChange={handleFileInput}
                        />
                    </label>
                    <p className="text-gray-500 text-sm mt-4">Supports .pcap, .pcapng, and .cap files (up to 500MB)</p>
                </div>

                {/* File Info */}
                {file && (
                    <div className="mt-6 bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <DocumentMagnifyingGlassIcon className="h-8 w-8 text-cyan-400" />
                            <div>
                                <p className="text-cyan-400 font-bold">{file.name}</p>
                                <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
                            </div>
                        </div>
                        <button onClick={handleRemoveFile} className="text-red-400 hover:text-red-300">
                            <XCircleIcon className="h-6 w-6" />
                        </button>
                    </div>
                )}

                {/* Batch Size Option */}
                {file && !results && !analyzing && (
                    <div className="mt-6 bg-gray-700/50 rounded-lg p-4">
                        <label htmlFor="batchSize" className="block text-gray-200 font-semibold mb-2">
                            📊 Flows per Batch (for breakdown)
                        </label>
                        <input
                            type="number"
                            id="batchSize"
                            value={batchSize}
                            onChange={(e) => setBatchSize(Math.max(1000, Math.min(50000, parseInt(e.target.value) || 5000)))}
                            min="1000"
                            max="50000"
                            step="1000"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                        />
                        <p className="text-gray-500 text-sm mt-2">
                            Number of flows per batch in the breakdown table. Recommended: 1,000 - 10,000
                        </p>
                    </div>
                )}

                {/* Analyze Button */}
                {file && !results && !analyzing && (
                    <button
                        onClick={handleAnalyze}
                        className="w-full mt-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-bold text-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:-translate-y-0.5"
                    >
                        🔍 Analyze PCAP File
                    </button>
                )}

                {/* Progress Section */}
                {analyzing && (
                    <div className="mt-6 bg-gray-700/50 rounded-lg p-6">
                        <div className="w-full bg-gray-600 rounded-full h-8 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300 flex items-center justify-center text-white font-bold"
                                style={{ width: `${progress}%` }}
                            >
                                {Math.round(progress)}%
                            </div>
                        </div>
                        <p className="text-gray-400 text-center mt-3 flex items-center justify-center">
                            <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                            {progressText}
                        </p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mt-6 bg-red-900/30 border-2 border-red-500/50 rounded-lg p-4 text-red-400">
                        {error}
                    </div>
                )}
            </div>

            {/* Results Section */}
            {results && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-gray-100 text-center">📊 Analysis Results</h2>

                    {/* Threat Alert */}
                    <div className={`p-5 rounded-lg text-center text-xl font-bold ${results.threatDetected
                        ? 'bg-red-900/30 border-2 border-red-500/50 text-red-400'
                        : 'bg-green-900/30 border-2 border-green-500/50 text-green-400'
                        }`}>
                        {results.threatDetected
                            ? `⚠️ THREATS DETECTED: ${results.summary.attack_count.toLocaleString()} malicious flows!`
                            : '✅ No threats detected. Traffic appears safe.'}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-700/50 rounded-lg p-6 text-center shadow-lg">
                            <p className="text-gray-400 text-sm mb-2">Total Flows</p>
                            <p className="text-3xl font-bold text-cyan-400">{results.flowsAnalyzed.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-700/50 rounded-lg p-6 text-center shadow-lg">
                            <p className="text-gray-400 text-sm mb-2">Processing Time</p>
                            <p className="text-3xl font-bold text-cyan-400">{results.processingTime.toFixed(2)}s</p>
                        </div>
                        <div className="bg-gray-700/50 rounded-lg p-6 text-center shadow-lg">
                            <p className="text-gray-400 text-sm mb-2">Threats Detected</p>
                            <p className={`text-3xl font-bold ${results.threatDetected ? 'text-red-400' : 'text-green-400'}`}>
                                {results.threatDetected ? 'Yes' : 'No'}
                            </p>
                        </div>
                    </div>

                    {/* Traffic Summary Table */}
                    <div className="overflow-hidden rounded-lg shadow-lg">
                        <table className="w-full">
                            <thead className="bg-cyan-600">
                                <tr>
                                    <th className="px-6 py-4 text-left text-white font-semibold">Traffic Type</th>
                                    <th className="px-6 py-4 text-left text-white font-semibold">Count</th>
                                    <th className="px-6 py-4 text-left text-white font-semibold">Percentage</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-700/50">
                                <tr className="border-b border-gray-600 hover:bg-gray-600/50">
                                    <td className="px-6 py-4 text-green-400 font-bold">✓ BENIGN</td>
                                    <td className="px-6 py-4 text-gray-100">{results.summary.benign_count.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-gray-100">{results.summary.benign_percentage.toFixed(2)}%</td>
                                </tr>
                                <tr className="hover:bg-gray-600/50">
                                    <td className="px-6 py-4 text-red-400 font-bold">⚠ ATTACK</td>
                                    <td className="px-6 py-4 text-gray-100">{results.summary.attack_count.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-gray-100">{results.summary.attack_percentage.toFixed(2)}%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Flow Range Breakdown */}
                    {results.summary?.batch_breakdown && results.summary.batch_breakdown.length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold text-gray-100 mb-3">📈 Flow Range Breakdown</h3>
                            <p className="text-gray-400 text-sm mb-4">Shows benign/attack distribution across flow ranges (batch size: {batchSize.toLocaleString()}). High attack % indicates attack zones.</p>

                            <div className="overflow-hidden rounded-lg shadow-lg max-h-96 overflow-y-auto">
                                <table className="w-full">
                                    <thead className="bg-cyan-600 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-white font-semibold">Flow Range</th>
                                            <th className="px-4 py-3 text-left text-white font-semibold">Benign</th>
                                            <th className="px-4 py-3 text-left text-white font-semibold">Attack</th>
                                            <th className="px-4 py-3 text-left text-white font-semibold">Attack %</th>
                                            <th className="px-4 py-3 text-left text-white font-semibold">Visual</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-gray-700/50">
                                        {results.summary.batch_breakdown.map((batch, index) => {
                                            const attackPct = batch.attack_percentage || 0;
                                            return (
                                                <tr key={index} className={`border-b border-gray-600 hover:bg-gray-600/50 ${attackPct > 30 ? 'bg-yellow-900/20' : ''}`}>
                                                    <td className="px-4 py-3 text-gray-100 font-bold">
                                                        {batch.range_start.toLocaleString()} - {batch.range_end.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-green-400">{batch.benign.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-red-400">{batch.attack.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-gray-100 font-bold">{attackPct.toFixed(1)}%</td>
                                                    <td className="px-4 py-3">
                                                        <div className="w-full bg-gray-600 rounded h-5 overflow-hidden">
                                                            <div
                                                                className={`h-full rounded ${getAttackBarColor(attackPct)}`}
                                                                style={{ width: `${Math.min(attackPct, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* New Analysis Button */}
                    <div className="text-center">
                        <button
                            onClick={handleRemoveFile}
                            className="px-8 py-3 bg-gray-700 text-gray-100 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                        >
                            📁 Analyze Another File
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
