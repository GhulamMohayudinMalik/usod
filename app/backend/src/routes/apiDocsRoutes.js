import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * GET /
 * API Documentation Homepage - Beautiful HTML Version
 */
router.get('/', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>USOD API Documentation</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        background: linear-gradient(135deg, #0a1929 0%, #1a365d 100%); 
        color: #e2e8f0; 
        min-height: 100vh;
        padding-bottom: 50px;
      }
      
      /* Header */
      header {
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
        padding: 30px 0;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        border-bottom: 3px solid #60a5fa;
      }
      h1 { 
        font-size: 36px; 
        font-weight: 700; 
        color: #fff;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        margin-bottom: 8px;
      }
      .subtitle {
        font-size: 16px;
        color: #cbd5e1;
        font-weight: 400;
      }
      
      /* Container */
      .container { 
        max-width: 1200px; 
        width: 95%; 
        margin: 30px auto; 
      }
      
      /* Status Banner */
      .status-banner {
        background: linear-gradient(135deg, #065f46 0%, #10b981 100%);
        border-radius: 12px;
        padding: 20px 30px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 8px 20px rgba(16, 185, 129, 0.2);
        margin-bottom: 30px;
      }
      .status-left {
        display: flex;
        align-items: center;
      }
      .status-dot { 
        width: 14px; 
        height: 14px; 
        border-radius: 50%; 
        background-color: #34d399; 
        margin-right: 12px;
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .status-text { 
        font-size: 20px; 
        font-weight: 600; 
      }
      .status-right {
        text-align: right;
        font-size: 14px;
      }
      
      /* Info Cards */
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }
      .info-card-small {
        background: rgba(30, 58, 95, 0.6);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        padding: 20px;
        border: 1px solid rgba(96, 165, 250, 0.2);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      }
      .info-card-small h3 {
        color: #60a5fa;
        font-size: 16px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
      }
      .info-card-small .value {
        font-size: 32px;
        font-weight: 700;
        color: #fff;
        margin-top: 8px;
      }
      .info-card-small .label {
        font-size: 13px;
        color: #94a3b8;
        margin-top: 4px;
      }
      
      /* Endpoint Sections */
      .endpoint-section {
        background: rgba(17, 34, 64, 0.8);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        padding: 25px;
        margin-bottom: 25px;
        border: 1px solid rgba(96, 165, 250, 0.2);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      }
      .endpoint-section h2 {
        color: #60a5fa;
        font-size: 24px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
      }
      .endpoint-section .description {
        color: #94a3b8;
        font-size: 14px;
        margin-bottom: 20px;
      }
      .endpoint-section .base-route {
        display: inline-block;
        background: rgba(59, 130, 246, 0.2);
        color: #93c5fd;
        padding: 6px 12px;
        border-radius: 6px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        margin-bottom: 15px;
      }
      
      /* Endpoint Items */
      .endpoint-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .endpoint-item {
        background: rgba(30, 41, 59, 0.6);
        border-radius: 8px;
        padding: 15px;
        border-left: 3px solid #3b82f6;
        transition: all 0.3s ease;
      }
      .endpoint-item:hover {
        background: rgba(30, 41, 59, 0.9);
        transform: translateX(5px);
        border-left-color: #60a5fa;
      }
      .endpoint-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }
      .method {
        padding: 4px 10px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 12px;
        font-family: 'Courier New', monospace;
      }
      .method.get { background: #065f46; color: #34d399; }
      .method.post { background: #7c2d12; color: #fbbf24; }
      .method.put { background: #1e3a8a; color: #93c5fd; }
      .method.delete { background: #7f1d1d; color: #fca5a5; }
      .endpoint-path {
        font-family: 'Courier New', monospace;
        color: #cbd5e1;
        font-size: 14px;
        flex: 1;
      }
      .auth-badge {
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
      }
      .auth-badge.required { background: #7c2d12; color: #fbbf24; }
      .auth-badge.api-key { background: #581c87; color: #e9d5ff; }
      .endpoint-desc {
        color: #94a3b8;
        font-size: 13px;
        margin-left: 82px;
      }
      
      /* Footer */
      .footer {
        text-align: center;
        margin-top: 40px;
        padding: 20px;
        color: #64748b;
        font-size: 14px;
      }
      .footer a {
        color: #60a5fa;
        text-decoration: none;
      }
      .footer a:hover {
        text-decoration: underline;
      }
      
      /* Quick Links */
      .quick-links {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 30px;
      }
      .quick-link {
        background: rgba(59, 130, 246, 0.2);
        color: #93c5fd;
        padding: 10px 18px;
        border-radius: 8px;
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        border: 1px solid rgba(96, 165, 250, 0.3);
        transition: all 0.3s ease;
      }
      .quick-link:hover {
        background: rgba(59, 130, 246, 0.4);
        border-color: #60a5fa;
        transform: translateY(-2px);
      }
      
      /* Collapsible Sections */
      .toggle-section {
        cursor: pointer;
        user-select: none;
      }
      .toggle-icon {
        display: inline-block;
        margin-right: 8px;
        transition: transform 0.3s ease;
      }
      .collapsed .toggle-icon {
        transform: rotate(-90deg);
      }
      .collapsible-content {
        max-height: 2000px;
        overflow: hidden;
        transition: max-height 0.5s ease;
      }
      .collapsed .collapsible-content {
        max-height: 0;
      }
    </style>
  </head>
  <body>
    <header>
      <h1>🛡️ USOD API Documentation</h1>
      <p class="subtitle">Unified Security Operations Dashboard - AI-Powered Threat Detection with Blockchain</p>
    </header>
    
    <div class="container">
      <!-- Status Banner -->
      <div class="status-banner">
        <div class="status-left">
          <div class="status-dot"></div>
          <div class="status-text">API Server Online</div>
        </div>
        <div class="status-right">
          <div>Version 2.0.0</div>
          <div>${new Date().toLocaleString()}</div>
        </div>
      </div>
      
      <!-- Info Grid -->
      <div class="info-grid">
        <div class="info-card-small">
          <h3>📊 Total Endpoints</h3>
          <div class="value">59</div>
          <div class="label">Across 9 categories</div>
        </div>
        <div class="info-card-small">
          <h3>💾 Database</h3>
          <div class="value" style="font-size: 20px; color: ${mongoStatus === 'Connected' ? '#34d399' : '#fca5a5'}">${mongoStatus}</div>
          <div class="label">MongoDB Connection</div>
        </div>
        <div class="info-card-small">
          <h3>⚡ Uptime</h3>
          <div class="value" style="font-size: 20px;">${Math.floor(process.uptime())}s</div>
          <div class="label">Server running</div>
        </div>
        <div class="info-card-small">
          <h3>🔧 Node.js</h3>
          <div class="value" style="font-size: 20px;">${process.version}</div>
          <div class="label">Runtime version</div>
        </div>
      </div>
      
      <!-- Quick Links -->
      <div class="quick-links">
        <a href="/health" class="quick-link">🏥 Health Check</a>
        <a href="/api" class="quick-link">📋 API Info (JSON)</a>
        <a href="/legacy" class="quick-link">🔙 Legacy View</a>
        <a href="http://localhost:3000" class="quick-link">🌐 Frontend Dashboard</a>
      </div>
      
      <!-- Authentication Endpoints -->
      <div class="endpoint-section">
        <h2 class="toggle-section" onclick="toggleSection(this)">
          <span class="toggle-icon">▼</span>
          🔐 Authentication & Security
        </h2>
        <div class="collapsible-content">
          <p class="description">User authentication, session management, and security controls</p>
          <span class="base-route">/api/auth</span>
          <div class="endpoint-list">
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method post">POST</span>
                <span class="endpoint-path">/api/auth/login</span>
              </div>
              <div class="endpoint-desc">User login with credentials</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method post">POST</span>
                <span class="endpoint-path">/api/auth/register</span>
              </div>
              <div class="endpoint-desc">Register new user account</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method post">POST</span>
                <span class="endpoint-path">/api/auth/logout</span>
              </div>
              <div class="endpoint-desc">User logout and session cleanup</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method post">POST</span>
                <span class="endpoint-path">/api/auth/refresh</span>
              </div>
              <div class="endpoint-desc">Refresh JWT access token</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method get">GET</span>
                <span class="endpoint-path">/api/auth/session-status</span>
              </div>
              <div class="endpoint-desc">Check current session status</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method get">GET</span>
                <span class="endpoint-path">/api/auth/security/stats</span>
              </div>
              <div class="endpoint-desc">Get security statistics</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method post">POST</span>
                <span class="endpoint-path">/api/auth/security/block-ip</span>
              </div>
              <div class="endpoint-desc">Block an IP address</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Blockchain Endpoints -->
      <div class="endpoint-section">
        <h2 class="toggle-section" onclick="toggleSection(this)">
          <span class="toggle-icon">▼</span>
          🔗 Blockchain & Threat Verification
        </h2>
        <div class="collapsible-content">
          <p class="description">Immutable threat logging with SHA256 cryptographic verification</p>
          <span class="base-route">/api/blockchain</span>
          <div class="endpoint-list">
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method get">GET</span>
                <span class="endpoint-path">/api/blockchain/health</span>
              </div>
              <div class="endpoint-desc">Check blockchain service health status</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method get">GET</span>
                <span class="endpoint-path">/api/blockchain/statistics</span>
                <span class="auth-badge required">🔒 Auth</span>
              </div>
              <div class="endpoint-desc">Get blockchain statistics (logs, transactions, block height)</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method get">GET</span>
                <span class="endpoint-path">/api/blockchain/threats</span>
                <span class="auth-badge required">🔒 Auth</span>
              </div>
              <div class="endpoint-desc">Query all threat logs from blockchain</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method get">GET</span>
                <span class="endpoint-path">/api/blockchain/threats/:logId</span>
                <span class="auth-badge required">🔒 Auth</span>
              </div>
              <div class="endpoint-desc">Get specific threat log by ID</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method post">POST</span>
                <span class="endpoint-path">/api/blockchain/threats/:logId/verify</span>
                <span class="auth-badge required">🔒 Auth</span>
              </div>
              <div class="endpoint-desc">Verify threat log integrity with SHA256 hash comparison</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method get">GET</span>
                <span class="endpoint-path">/api/blockchain/threats/type/:type</span>
                <span class="auth-badge required">🔒 Auth</span>
              </div>
              <div class="endpoint-desc">Query threats by type (network_threat, security_event, etc.)</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method post">POST</span>
                <span class="endpoint-path">/api/blockchain/threats</span>
                <span class="auth-badge required">🔒 Auth</span>
              </div>
              <div class="endpoint-desc">Create new threat log on blockchain</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Network Monitoring Endpoints -->
      <div class="endpoint-section">
        <h2 class="toggle-section" onclick="toggleSection(this)">
          <span class="toggle-icon">▼</span>
          🌐 Network Monitoring & AI Detection
        </h2>
        <div class="collapsible-content">
          <p class="description">Real-time network threat detection with AI/ML models</p>
          <span class="base-route">/api/network</span>
          <div class="endpoint-list">
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method post">POST</span>
                <span class="endpoint-path">/api/network/start-monitoring</span>
                <span class="auth-badge required">🔒 Auth</span>
              </div>
              <div class="endpoint-desc">Start real-time network packet capture and analysis</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method post">POST</span>
                <span class="endpoint-path">/api/network/stop-monitoring</span>
                <span class="auth-badge required">🔒 Auth</span>
              </div>
              <div class="endpoint-desc">Stop network monitoring session</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method get">GET</span>
                <span class="endpoint-path">/api/network/threats</span>
                <span class="auth-badge required">🔒 Auth</span>
              </div>
              <div class="endpoint-desc">Get detected network threats with pagination</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method get">GET</span>
                <span class="endpoint-path">/api/network/statistics</span>
                <span class="auth-badge required">🔒 Auth</span>
              </div>
              <div class="endpoint-desc">Get monitoring statistics (packets, threats, uptime)</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method post">POST</span>
                <span class="endpoint-path">/api/network/upload-pcap</span>
                <span class="auth-badge required">🔒 Auth</span>
              </div>
              <div class="endpoint-desc">Upload PCAP file for offline analysis</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method get">GET</span>
                <span class="endpoint-path">/api/network/status</span>
                <span class="auth-badge required">🔒 Auth</span>
              </div>
              <div class="endpoint-desc">Get current monitoring status</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method get">GET</span>
                <span class="endpoint-path">/api/network/stream</span>
              </div>
              <div class="endpoint-desc">Server-Sent Events stream for real-time threats</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Data & Analytics Endpoints -->
      <div class="endpoint-section">
        <h2 class="toggle-section" onclick="toggleSection(this)">
          <span class="toggle-icon">▼</span>
          📊 Data & Analytics
        </h2>
        <div class="collapsible-content">
          <p class="description">Dashboard data, statistics, and security analytics</p>
          <span class="base-route">/api/data</span>
          <div class="endpoint-list">
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method get">GET</span>
                <span class="endpoint-path">/api/data/dashboard-stats</span>
              </div>
              <div class="endpoint-desc">Get dashboard statistics (security score, threats, users)</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method get">GET</span>
                <span class="endpoint-path">/api/data/security-events</span>
              </div>
              <div class="endpoint-desc">Get recent security events</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method get">GET</span>
                <span class="endpoint-path">/api/data/login-attempts</span>
              </div>
              <div class="endpoint-desc">Get login attempt history</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Security Logs Endpoints -->
      <div class="endpoint-section">
        <h2 class="toggle-section" onclick="toggleSection(this)">
          <span class="toggle-icon">▼</span>
          📝 Security Logs Management
        </h2>
        <div class="collapsible-content">
          <p class="description">CRUD operations for security logs and audit trails</p>
          <span class="base-route">/api/logs</span>
          <div class="endpoint-list">
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method get">GET</span>
                <span class="endpoint-path">/api/logs</span>
              </div>
              <div class="endpoint-desc">Get all security logs with pagination and filtering</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method get">GET</span>
                <span class="endpoint-path">/api/logs/statistics</span>
              </div>
              <div class="endpoint-desc">Get log statistics by status and severity</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method post">POST</span>
                <span class="endpoint-path">/api/logs</span>
              </div>
              <div class="endpoint-desc">Create new security log entry</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method put">PUT</span>
                <span class="endpoint-path">/api/logs/:id/status</span>
              </div>
              <div class="endpoint-desc">Update log status (resolved, investigating, etc.)</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Data Ingestion Endpoints -->
      <div class="endpoint-section">
        <h2 class="toggle-section" onclick="toggleSection(this)">
          <span class="toggle-icon">▼</span>
          📥 Multi-Platform Data Ingestion
        </h2>
        <div class="collapsible-content">
          <p class="description">Ingest logs from desktop and mobile applications</p>
          <span class="base-route">/api/ingest</span>
          <div class="endpoint-list">
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method post">POST</span>
                <span class="endpoint-path">/api/ingest/log</span>
                <span class="auth-badge api-key">🔑 API Key</span>
              </div>
              <div class="endpoint-desc">Ingest single log entry from external platform</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method post">POST</span>
                <span class="endpoint-path">/api/ingest/logs</span>
                <span class="auth-badge api-key">🔑 API Key</span>
              </div>
              <div class="endpoint-desc">Bulk ingest multiple logs at once</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Backup & Restore Endpoints -->
      <div class="endpoint-section">
        <h2 class="toggle-section" onclick="toggleSection(this)">
          <span class="toggle-icon">▼</span>
          💾 Backup & Restore
        </h2>
        <div class="collapsible-content">
          <p class="description">Database backup and restoration operations</p>
          <span class="base-route">/api/backup</span>
          <div class="endpoint-list">
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method post">POST</span>
                <span class="endpoint-path">/api/backup/full</span>
              </div>
              <div class="endpoint-desc">Create full database backup</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method get">GET</span>
                <span class="endpoint-path">/api/backup/list</span>
              </div>
              <div class="endpoint-desc">List all available backups</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method post">POST</span>
                <span class="endpoint-path">/api/backup/restore/:backupName</span>
              </div>
              <div class="endpoint-desc">Restore from backup file</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- User Management Endpoints -->
      <div class="endpoint-section">
        <h2 class="toggle-section" onclick="toggleSection(this)">
          <span class="toggle-icon">▼</span>
          👥 User Management
        </h2>
        <div class="collapsible-content">
          <p class="description">User accounts, roles, and profile management</p>
          <span class="base-route">/api/users</span>
          <div class="endpoint-list">
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method get">GET</span>
                <span class="endpoint-path">/api/users/users</span>
                <span class="auth-badge required">🔒 Auth</span>
              </div>
              <div class="endpoint-desc">List all users (admin only)</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method post">POST</span>
                <span class="endpoint-path">/api/users/create</span>
                <span class="auth-badge required">🔒 Auth</span>
              </div>
              <div class="endpoint-desc">Create new user account (admin)</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method post">POST</span>
                <span class="endpoint-path">/api/users/change-password</span>
                <span class="auth-badge required">🔒 Auth</span>
              </div>
              <div class="endpoint-desc">Change user password</div>
            </div>
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method delete">DELETE</span>
                <span class="endpoint-path">/api/users/users/:userId</span>
                <span class="auth-badge required">🔒 Auth</span>
              </div>
              <div class="endpoint-desc">Delete user account (admin)</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Streaming Endpoints -->
      <div class="endpoint-section">
        <h2 class="toggle-section" onclick="toggleSection(this)">
          <span class="toggle-icon">▼</span>
          📡 Real-time Streaming
        </h2>
        <div class="collapsible-content">
          <p class="description">Server-Sent Events for real-time updates</p>
          <span class="base-route">/api/stream</span>
          <div class="endpoint-list">
            <div class="endpoint-item">
              <div class="endpoint-header">
                <span class="method get">GET</span>
                <span class="endpoint-path">/api/stream/logs</span>
              </div>
              <div class="endpoint-desc">Subscribe to real-time security log events</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <div>&copy; ${new Date().getFullYear()} | Unified Security Operations Dashboard</div>
        <div style="margin-top: 10px;">
          <a href="http://localhost:3000" target="_blank">Frontend Dashboard</a> | 
          <a href="/health">Health Check</a> | 
          <a href="/api">API Info (JSON)</a>
        </div>
      </div>
    </div>
    
    <script>
      function toggleSection(element) {
        const section = element.parentElement;
        section.classList.toggle('collapsed');
      }
      
      // Add expand/collapse all buttons
      document.addEventListener('DOMContentLoaded', function() {
        const container = document.querySelector('.container');
        const buttonsDiv = document.createElement('div');
        buttonsDiv.style.cssText = 'text-align: center; margin-bottom: 20px;';
        buttonsDiv.innerHTML = \`
          <button onclick="expandAll()" style="padding: 10px 20px; margin: 5px; background: rgba(59, 130, 246, 0.3); color: #93c5fd; border: 1px solid #3b82f6; border-radius: 6px; cursor: pointer; font-size: 14px;">Expand All</button>
          <button onclick="collapseAll()" style="padding: 10px 20px; margin: 5px; background: rgba(59, 130, 246, 0.3); color: #93c5fd; border: 1px solid #3b82f6; border-radius: 6px; cursor: pointer; font-size: 14px;">Collapse All</button>
        \`;
        container.insertBefore(buttonsDiv, container.querySelector('.endpoint-section'));
      });
      
      function expandAll() {
        document.querySelectorAll('.endpoint-section').forEach(section => {
          section.classList.remove('collapsed');
        });
      }
      
      function collapseAll() {
        document.querySelectorAll('.endpoint-section').forEach(section => {
          section.classList.add('collapsed');
        });
      }
    </script>
  </body>
  </html>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

/**
 * GET /api
 * API Info (JSON format)
 */
router.get('/api', (req, res) => {
  const apiDocs = {
    name: 'USOD - Unified Security Operations Dashboard API',
    version: '2.0.0',
    description: 'AI-Powered Network Threat Detection with Blockchain Verification',
    documentation: 'https://github.com/your-repo/usod-api-docs',
    baseUrl: `http://${req.get('host')}`,
    endpoints: {
      
      // ==================== AUTHENTICATION ====================
      authentication: {
        description: 'User authentication and session management',
        baseRoute: '/api/auth',
        endpoints: [
          {
            method: 'POST',
            path: '/api/auth/login',
            auth: false,
            description: 'User login with credentials',
            body: { username: 'string', password: 'string' },
            response: { token: 'jwt_token', user: 'object' }
          },
          {
            method: 'POST',
            path: '/api/auth/register',
            auth: false,
            description: 'Register new user account',
            body: { username: 'string', email: 'string', password: 'string' },
            response: { message: 'string', userId: 'string' }
          },
          {
            method: 'POST',
            path: '/api/auth/logout',
            auth: false,
            description: 'User logout and session cleanup',
            response: { message: 'string' }
          },
          {
            method: 'POST',
            path: '/api/auth/refresh',
            auth: false,
            description: 'Refresh JWT access token',
            body: { refreshToken: 'string' },
            response: { token: 'jwt_token' }
          },
          {
            method: 'POST',
            path: '/api/auth/unlock-account',
            auth: false,
            description: 'Unlock blocked user account',
            body: { username: 'string', unlockCode: 'string' },
            response: { message: 'string' }
          },
          {
            method: 'GET',
            path: '/api/auth/session-status',
            auth: false,
            description: 'Check current session status',
            response: { active: 'boolean', user: 'object' }
          },
          {
            method: 'GET',
            path: '/api/auth/security/stats',
            auth: false,
            description: 'Get security statistics',
            response: { loginAttempts: 'number', blockedIPs: 'number' }
          },
          {
            method: 'GET',
            path: '/api/auth/security/blocked-ips',
            auth: false,
            description: 'List all blocked IP addresses',
            response: { blockedIPs: 'array' }
          },
          {
            method: 'POST',
            path: '/api/auth/security/block-ip',
            auth: false,
            description: 'Block an IP address',
            body: { ipAddress: 'string', reason: 'string' },
            response: { message: 'string' }
          },
          {
            method: 'POST',
            path: '/api/auth/security/unblock-ip',
            auth: false,
            description: 'Unblock an IP address',
            body: { ipAddress: 'string' },
            response: { message: 'string' }
          }
        ]
      },

      // ==================== BLOCKCHAIN ====================
      blockchain: {
        description: 'Immutable threat logging with cryptographic verification',
        baseRoute: '/api/blockchain',
        endpoints: [
          {
            method: 'GET',
            path: '/api/blockchain/health',
            auth: false,
            description: 'Check blockchain service health',
            response: { status: 'string', connected: 'boolean' }
          },
          {
            method: 'GET',
            path: '/api/blockchain/statistics',
            auth: true,
            description: 'Get blockchain statistics',
            response: { totalLogs: 'number', transactions: 'number', blockHeight: 'number' }
          },
          {
            method: 'GET',
            path: '/api/blockchain/threats',
            auth: true,
            description: 'Query all threats from blockchain',
            response: { threats: 'array' }
          },
          {
            method: 'GET',
            path: '/api/blockchain/threats/:logId',
            auth: true,
            description: 'Get specific threat log',
            params: { logId: 'string' },
            response: { threat: 'object' }
          },
          {
            method: 'GET',
            path: '/api/blockchain/threats/:logId/history',
            auth: true,
            description: 'Get threat transaction history',
            params: { logId: 'string' },
            response: { history: 'array' }
          },
          {
            method: 'POST',
            path: '/api/blockchain/threats/:logId/verify',
            auth: true,
            description: 'Verify threat log integrity with SHA256',
            params: { logId: 'string' },
            response: { isValid: 'boolean', storedHash: 'string', calculatedHash: 'string' }
          },
          {
            method: 'GET',
            path: '/api/blockchain/threats/type/:type',
            auth: true,
            description: 'Query threats by type',
            params: { type: 'string' },
            response: { threats: 'array' }
          },
          {
            method: 'GET',
            path: '/api/blockchain/threats/severity/:severity',
            auth: true,
            description: 'Query threats by severity',
            params: { severity: 'string' },
            response: { threats: 'array' }
          },
          {
            method: 'POST',
            path: '/api/blockchain/threats',
            auth: true,
            description: 'Create new threat log on blockchain',
            body: { logId: 'string', logType: 'string', threatDetails: 'object' },
            response: { success: 'boolean', transactionId: 'string' }
          }
        ]
      },

      // ==================== NETWORK MONITORING ====================
      networkMonitoring: {
        description: 'AI-powered network threat detection and PCAP analysis',
        baseRoute: '/api/network',
        endpoints: [
          {
            method: 'POST',
            path: '/api/network/start-monitoring',
            auth: true,
            description: 'Start real-time network monitoring',
            body: { interface: 'string', duration: 'number' },
            response: { status: 'string', sessionId: 'string' }
          },
          {
            method: 'POST',
            path: '/api/network/stop-monitoring',
            auth: true,
            description: 'Stop network monitoring',
            response: { status: 'string', capturedPackets: 'number' }
          },
          {
            method: 'GET',
            path: '/api/network/threats',
            auth: true,
            description: 'Get detected network threats',
            query: { limit: 'number', offset: 'number', severity: 'string' },
            response: { threats: 'array', total: 'number' }
          },
          {
            method: 'GET',
            path: '/api/network/statistics',
            auth: true,
            description: 'Get network monitoring statistics',
            response: { totalPackets: 'number', threatsDetected: 'number', uptime: 'number' }
          },
          {
            method: 'POST',
            path: '/api/network/upload-pcap',
            auth: true,
            description: 'Upload PCAP file for analysis',
            contentType: 'multipart/form-data',
            body: { pcap: 'file' },
            response: { analysisId: 'string', threats: 'array' }
          },
          {
            method: 'GET',
            path: '/api/network/status',
            auth: true,
            description: 'Get current monitoring status',
            response: { isMonitoring: 'boolean', startTime: 'timestamp', interface: 'string' }
          },
          {
            method: 'GET',
            path: '/api/network/health',
            auth: true,
            description: 'Check network monitoring service health',
            response: { status: 'string', aiServiceConnected: 'boolean' }
          },
          {
            method: 'POST',
            path: '/api/network/test-connection',
            auth: true,
            description: 'Test AI service connection',
            response: { connected: 'boolean', latency: 'number' }
          },
          {
            method: 'GET',
            path: '/api/network/threats/history',
            auth: true,
            description: 'Get historical network threats',
            query: { from: 'date', to: 'date', limit: 'number' },
            response: { threats: 'array', totalCount: 'number' }
          },
          {
            method: 'POST',
            path: '/api/network/webhook',
            auth: false,
            description: 'Webhook for AI service threat notifications',
            body: { threat: 'object', timestamp: 'string' },
            response: { received: 'boolean' }
          },
          {
            method: 'GET',
            path: '/api/network/stream',
            auth: false,
            description: 'Server-Sent Events stream for real-time threats',
            response: 'SSE stream'
          }
        ]
      },

      // ==================== DATA & ANALYTICS ====================
      dataAnalytics: {
        description: 'Dashboard data and security analytics',
        baseRoute: '/api/data',
        endpoints: [
          {
            method: 'GET',
            path: '/api/data/all',
            auth: false,
            description: 'Get all dashboard data',
            response: { stats: 'object', events: 'array' }
          },
          {
            method: 'GET',
            path: '/api/data/dashboard-stats',
            auth: false,
            description: 'Get dashboard statistics',
            response: { securityScore: 'number', activeThreats: 'number', protectedUsers: 'number' }
          },
          {
            method: 'GET',
            path: '/api/data/login-attempts',
            auth: false,
            description: 'Get login attempt history',
            query: { limit: 'number', status: 'string' },
            response: { attempts: 'array', totalCount: 'number' }
          },
          {
            method: 'GET',
            path: '/api/data/security-events',
            auth: false,
            description: 'Get security events',
            query: { count: 'number', severity: 'string' },
            response: { events: 'array' }
          }
        ]
      },

      // ==================== LOGS ====================
      logs: {
        description: 'Security log management and queries',
        baseRoute: '/api/logs',
        endpoints: [
          {
            method: 'GET',
            path: '/api/logs',
            auth: false,
            description: 'Get all security logs with pagination',
            query: { page: 'number', limit: 'number', severity: 'string', status: 'string' },
            response: { logs: 'array', total: 'number', page: 'number' }
          },
          {
            method: 'GET',
            path: '/api/logs/statistics',
            auth: false,
            description: 'Get log statistics',
            response: { totalLogs: 'number', byStatus: 'object', bySeverity: 'object' }
          },
          {
            method: 'POST',
            path: '/api/logs',
            auth: false,
            description: 'Create new security log',
            body: { action: 'string', severity: 'string', details: 'object' },
            response: { logId: 'string', timestamp: 'string' }
          },
          {
            method: 'POST',
            path: '/api/logs/clear',
            auth: false,
            description: 'Clear all logs (admin only)',
            response: { message: 'string', deletedCount: 'number' }
          },
          {
            method: 'PUT',
            path: '/api/logs/:id/status',
            auth: false,
            description: 'Update log status',
            params: { id: 'string' },
            body: { status: 'string' },
            response: { updated: 'boolean' }
          },
          {
            method: 'GET',
            path: '/api/logs/desktop',
            auth: false,
            description: 'Get logs from desktop app',
            response: { logs: 'array' }
          },
          {
            method: 'GET',
            path: '/api/logs/mobile',
            auth: false,
            description: 'Get logs from mobile app',
            response: { logs: 'array' }
          }
        ]
      },

      // ==================== DATA INGESTION ====================
      ingestion: {
        description: 'Multi-platform data ingestion (Desktop/Mobile)',
        baseRoute: '/api/ingest',
        endpoints: [
          {
            method: 'POST',
            path: '/api/ingest/login',
            auth: 'API Key',
            description: 'Log login attempt from external app',
            body: { platform: 'string', username: 'string', success: 'boolean' },
            response: { logged: 'boolean', timestamp: 'string' }
          },
          {
            method: 'POST',
            path: '/api/ingest/log',
            auth: 'API Key',
            description: 'Ingest single log entry',
            body: { action: 'string', severity: 'string', details: 'object', platform: 'string' },
            response: { logId: 'string' }
          },
          {
            method: 'POST',
            path: '/api/ingest/logs',
            auth: 'API Key',
            description: 'Bulk ingest multiple logs',
            body: { logs: 'array', platform: 'string' },
            response: { ingested: 'number', failed: 'number' }
          }
        ]
      },

      // ==================== BACKUP & RESTORE ====================
      backup: {
        description: 'Database backup and restore operations',
        baseRoute: '/api/backup',
        endpoints: [
          {
            method: 'POST',
            path: '/api/backup/security-logs',
            auth: false,
            description: 'Backup security logs to file',
            response: { filename: 'string', recordCount: 'number', size: 'string' }
          },
          {
            method: 'POST',
            path: '/api/backup/users',
            auth: false,
            description: 'Backup user data',
            response: { filename: 'string', userCount: 'number' }
          },
          {
            method: 'POST',
            path: '/api/backup/full',
            auth: false,
            description: 'Full database backup',
            response: { filename: 'string', collections: 'array', totalSize: 'string' }
          },
          {
            method: 'GET',
            path: '/api/backup/list',
            auth: false,
            description: 'List all available backups',
            response: { backups: 'array' }
          },
          {
            method: 'POST',
            path: '/api/backup/restore/:backupName',
            auth: false,
            description: 'Restore from backup',
            params: { backupName: 'string' },
            response: { restored: 'boolean', recordsRestored: 'number' }
          },
          {
            method: 'POST',
            path: '/api/backup/cleanup',
            auth: false,
            description: 'Delete old backups',
            body: { olderThan: 'number (days)' },
            response: { deleted: 'number', spaceSaved: 'string' }
          },
          {
            method: 'GET',
            path: '/api/backup/stats',
            auth: false,
            description: 'Get backup statistics',
            response: { totalBackups: 'number', totalSize: 'string', oldestBackup: 'date' }
          }
        ]
      },

      // ==================== USER MANAGEMENT ====================
      userManagement: {
        description: 'User account and role management',
        baseRoute: '/api/users',
        endpoints: [
          {
            method: 'POST',
            path: '/api/users/create',
            auth: true,
            description: 'Create new user account (admin)',
            body: { username: 'string', email: 'string', password: 'string', role: 'string' },
            response: { userId: 'string', message: 'string' }
          },
          {
            method: 'POST',
            path: '/api/users/change-password',
            auth: true,
            description: 'Change user password',
            body: { currentPassword: 'string', newPassword: 'string' },
            response: { success: 'boolean' }
          },
          {
            method: 'PUT',
            path: '/api/users/profile',
            auth: true,
            description: 'Update user profile',
            body: { email: 'string', displayName: 'string', preferences: 'object' },
            response: { updated: 'boolean' }
          },
          {
            method: 'GET',
            path: '/api/users/users',
            auth: true,
            description: 'List all users (admin)',
            response: { users: 'array', totalCount: 'number' }
          },
          {
            method: 'DELETE',
            path: '/api/users/users/:userId',
            auth: true,
            description: 'Delete user account (admin)',
            params: { userId: 'string' },
            response: { deleted: 'boolean' }
          },
          {
            method: 'PUT',
            path: '/api/users/users/:userId/role',
            auth: true,
            description: 'Update user role (admin)',
            params: { userId: 'string' },
            body: { role: 'string' },
            response: { updated: 'boolean' }
          },
          {
            method: 'PUT',
            path: '/api/users/settings',
            auth: true,
            description: 'Update user settings',
            body: { settings: 'object' },
            response: { saved: 'boolean' }
          }
        ]
      },

      // ==================== STREAMING ====================
      streaming: {
        description: 'Real-time event streaming',
        baseRoute: '/api/stream',
        endpoints: [
          {
            method: 'GET',
            path: '/api/stream/logs',
            auth: false,
            description: 'Server-Sent Events stream for security logs',
            response: 'SSE stream with real-time log events'
          }
        ]
      }
    },

    // Platform Information
    platforms: {
      web: {
        url: 'http://localhost:3000',
        description: 'React/Next.js web dashboard'
      },
      desktop: {
        description: 'Electron desktop application for Windows/Mac/Linux',
        features: ['Offline mode', 'System tray integration', 'Native notifications']
      },
      mobile: {
        description: 'React Native mobile app for iOS/Android',
        features: ['Push notifications', 'Biometric auth', 'Offline sync']
      }
    },

    // Technologies
    technologies: {
      backend: ['Node.js', 'Express', 'MongoDB', 'JWT', 'bcrypt'],
      frontend: ['React', 'Next.js', 'Tailwind CSS', 'Chart.js'],
      blockchain: ['Hyperledger Fabric', 'SHA256', 'Mock Blockchain (Demo)'],
      ai: ['Python', 'FastAPI', 'scikit-learn', 'Random Forest', 'Isolation Forest'],
      deployment: ['Docker', 'Terraform', 'Ansible', 'AWS', 'GCP', 'Azure', 'OCI']
    },

    // Quick Start
    quickStart: {
      authentication: 'Most endpoints require Bearer token in Authorization header',
      getToken: 'POST /api/auth/login with { username, password }',
      apiKey: 'Use X-API-Key header for /api/ingest endpoints',
      example: {
        curl: 'curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/blockchain/statistics'
      }
    },

    // Health & Status
    health: {
      server: 'Online ✓',
      database: 'MongoDB Connected',
      blockchain: 'Mock Service Active',
      aiService: 'Available (Python FastAPI)',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version
    }
  };

  res.json(apiDocs);
});

/**
 * GET /api
 * API Info (alias for root)
 */
router.get('/api', (req, res) => {
  res.json({
    name: 'USOD API',
    version: '2.0.0',
    documentation: `http://${req.get('host')}/`,
    endpoints: {
      documentation: 'GET /',
      authentication: 'POST /api/auth/*',
      blockchain: 'GET|POST /api/blockchain/*',
      network: 'GET|POST /api/network/*',
      data: 'GET /api/data/*',
      logs: 'GET|POST /api/logs/*',
      users: 'GET|POST|PUT|DELETE /api/users/*',
      backup: 'GET|POST /api/backup/*',
      stream: 'GET /api/stream/*'
    }
  });
});

export default router;

