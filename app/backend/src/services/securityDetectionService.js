import { logActions } from './loggingService.js';
import { eventBus } from './eventBus.js';

// IP blocking system
const blockedIPs = new Set();
const ipAttempts = new Map(); // Track failed attempts per IP
const suspiciousIPs = new Set(); // Track suspicious IPs

// Security detection patterns
const SECURITY_PATTERNS = {
  // SQL Injection patterns
  SQL_INJECTION: [
    /union\s+select/i,
    /select\s+.*\s+from/i,
    /drop\s+table/i,
    /insert\s+into/i,
    /update\s+.*\s+set/i,
    /delete\s+from/i,
    /or\s+1\s*=\s*1/i,
    /'\s*or\s*'.*'\s*=\s*'/i,
    /--\s*$/i,
    /\/\*.*\*\//i,
    /xp_cmdshell/i,
    /sp_executesql/i
  ],

  // XSS patterns
  XSS: [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi,
    /<link[^>]*>.*?<\/link>/gi,
    /<meta[^>]*>.*?<\/meta>/gi,
    /<style[^>]*>.*?<\/style>/gi,
    /expression\s*\(/gi,
    /url\s*\(/gi,
    /@import/gi
  ],

  // CSRF patterns
  CSRF: [
    /<form[^>]*action[^>]*>/gi,
    /<img[^>]*src[^>]*>/gi,
    /<iframe[^>]*src[^>]*>/gi
  ],

  // Suspicious activity patterns
  SUSPICIOUS: [
    /admin/i,
    /administrator/i,
    /root/i,
    /test/i,
    /debug/i,
    /config/i,
    /backup/i,
    /\.\.\//gi, // Directory traversal
    /\.\.\\/gi, // Windows directory traversal
    /passwd/i,
    /shadow/i,
    /etc\/passwd/i
  ],

  // LDAP Injection patterns
  LDAP_INJECTION: [
    /\*\)/gi,
    /\)/gi,
    /\(/gi,
    /&/gi,
    /\|/gi,
    /!/gi,
    /cn=/gi,
    /ou=/gi,
    /dc=/gi,
    /objectClass=/gi,
    /userPassword=/gi,
    /uid=/gi
  ],

  // NoSQL Injection patterns
  NOSQL_INJECTION: [
    /\$where/gi,
    /\$ne/gi,
    /\$gt/gi,
    /\$lt/gi,
    /\$regex/gi,
    /\$exists/gi,
    /\$in/gi,
    /\$nin/gi,
    /\$or/gi,
    /\$and/gi,
    /\$not/gi,
    /\$nor/gi,
    /\$all/gi,
    /\$elemMatch/gi,
    /\$size/gi,
    /\$type/gi
  ],

  // Command Injection patterns
  COMMAND_INJECTION: [
    /;\s*ls/gi,
    /;\s*cat/gi,
    /;\s*rm/gi,
    /;\s*mkdir/gi,
    /;\s*whoami/gi,
    /;\s*id/gi,
    /;\s*pwd/gi,
    /;\s*ps/gi,
    /;\s*netstat/gi,
    /;\s*ifconfig/gi,
    /\|\s*ls/gi,
    /\|\s*cat/gi,
    /\|\s*rm/gi,
    /`.*`/gi,
    /\$\(.*\)/gi,
    /&&\s*ls/gi,
    /&&\s*cat/gi,
    /&&\s*rm/gi
  ],

  // Path Traversal patterns
  PATH_TRAVERSAL: [
    /\.\.\/\.\.\/\.\.\//gi,
    /\.\.\\\.\.\\\.\.\\/gi,
    /\.\.%2f\.\.%2f\.\.%2f/gi,
    /\.\.%5c\.\.%5c\.\.%5c/gi,
    /\.\.%252f\.\.%252f\.\.%252f/gi,
    /\.\.%255c\.\.%255c\.\.%255c/gi,
    /\.\.%c0%af\.\.%c0%af\.\.%c0%af/gi,
    /\.\.%c1%9c\.\.%c1%9c\.\.%c1%9c/gi,
    /\.\.%2e%2e%2f/gi,
    /\.\.%2e%2e%5c/gi
  ],

  // Server-Side Request Forgery (SSRF) patterns
  SSRF: [
    /http:\/\/localhost/gi,
    /http:\/\/127\.0\.0\.1/gi,
    /http:\/\/0\.0\.0\.0/gi,
    /http:\/\/169\.254\.169\.254/gi,
    /http:\/\/metadata\.googleapis\.com/gi,
    /http:\/\/169\.254\.169\.254\/latest\/meta-data/gi,
    /file:\/\/\/etc\/passwd/gi,
    /file:\/\/\/proc\/self\/environ/gi,
    /gopher:\/\//gi,
    /dict:\/\//gi,
    /ftp:\/\//gi,
    /ldap:\/\//gi
  ],

  // XML External Entity (XXE) patterns
  XXE: [
    /<!DOCTYPE/gi,
    /<!ENTITY/gi,
    /SYSTEM/gi,
    /PUBLIC/gi,
    /%[a-zA-Z0-9_]+;/gi,
    /&[a-zA-Z0-9_]+;/gi,
    /file:\/\/\//gi,
    /http:\/\/\//gi,
    /ftp:\/\/\//gi,
    /expect:\/\/\//gi
  ],

  // Information Disclosure patterns
  INFORMATION_DISCLOSURE: [
    /version/i,
    /build/i,
    /release/i,
    /debug/i,
    /test/i,
    /staging/i,
    /dev/i,
    /development/i,
    /localhost/i,
    /127\.0\.0\.1/i,
    /internal/i,
    /private/i,
    /secret/i,
    /password/i,
    /key/i,
    /token/i,
    /api_key/i,
    /access_key/i
  ]
};

// Configuration
const SECURITY_CONFIG = {
  BRUTE_FORCE_THRESHOLD: 5, // Failed attempts before brute force detection
  BRUTE_FORCE_WINDOW: 15 * 60 * 1000, // 15 minutes in milliseconds
  SUSPICIOUS_THRESHOLD: 3, // Failed attempts before suspicious activity
  SUSPICIOUS_WINDOW: 5 * 60 * 1000, // 5 minutes in milliseconds
  IP_BLOCK_DURATION: 60 * 60 * 1000, // 1 hour in milliseconds
  MAX_ATTEMPTS_PER_IP: 20 // Max attempts per IP before blocking
};

// Helper function to get real IP address
export function getRealIP(req) {
  let ip = req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           req.ip ||
           '0.0.0.0';
  
  // Handle IPv6 localhost
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '127.0.0.1';
  }
  
  // Handle comma-separated IPs
  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  
  return ip;
}

// Check if IP is blocked
export function isIPBlocked(ip) {
  return blockedIPs.has(ip);
}

// Block an IP address
export function blockIP(ip, reason = 'security_violation') {
  blockedIPs.add(ip);
  
  // Log IP blocking event
  logActions.securityEvent(null, 'detected', { 
    get: () => null, 
    headers: { 'x-forwarded-for': ip } 
  }, {
    eventType: 'ip_blocked',
    severity: 'high',
    source: ip,
    description: `IP address blocked: ${reason}`,
    blockedAt: new Date().toISOString()
  });

  // Emit IP blocked event
  eventBus.emit('ip.blocked', {
    ip,
    reason,
    timestamp: new Date()
  });

  console.log(`🚫 IP ${ip} has been blocked: ${reason}`);
}

// Unblock an IP address
export function unblockIP(ip, reason = 'manual_unblock') {
  blockedIPs.delete(ip);
  
  // Log IP unblocking event
  logActions.securityEvent(null, 'detected', { 
    get: () => null, 
    headers: { 'x-forwarded-for': ip } 
  }, {
    eventType: 'ip_unblocked',
    severity: 'low',
    source: ip,
    description: `IP address unblocked: ${reason}`,
    unblockedAt: new Date().toISOString()
  });

  // Emit IP unblocked event
  eventBus.emit('ip.unblocked', {
    ip,
    reason,
    timestamp: new Date()
  });

  console.log(`✅ IP ${ip} has been unblocked: ${reason}`);
}

// Get list of blocked IPs
export function getBlockedIPs() {
  return Array.from(blockedIPs);
}

// Check for SQL injection attempts
export function detectSQLInjection(input, req) {
  if (!input || typeof input !== 'string') return false;

  const hasSQLInjection = SECURITY_PATTERNS.SQL_INJECTION.some(pattern => 
    pattern.test(input)
  );

  if (hasSQLInjection) {
    const ip = getRealIP(req);
    
    logActions.securityEvent(null, 'detected', req, {
      eventType: 'sql_injection_attempt',
      severity: 'high',
      source: ip,
      target: 'database',
      description: 'SQL injection attempt detected',
      maliciousInput: input.substring(0, 100), // Log first 100 chars
      detectedAt: new Date().toISOString(),
      userId: null // Explicitly set to null for security events
    });

    // Add to suspicious IPs
    suspiciousIPs.add(ip);
    
    // BLOCK the IP for SQL injection attempts
    blockIP(ip, 'sql_injection_attempt');
    
    // Emit security event
    eventBus.emit('security.sql_injection', {
      ip,
      input: input.substring(0, 100),
      timestamp: new Date()
    });

    console.log(`🚨 SQL Injection attempt detected from ${ip} - IP BLOCKED`);
    return true;
  }

  return false;
}

// Check for XSS attempts
export function detectXSS(input, req) {
  if (!input || typeof input !== 'string') return false;

  const hasXSS = SECURITY_PATTERNS.XSS.some(pattern => 
    pattern.test(input)
  );

  if (hasXSS) {
    const ip = getRealIP(req);
    
    logActions.securityEvent(null, 'detected', req, {
      eventType: 'xss_attempt',
      severity: 'high',
      source: ip,
      target: 'frontend',
      description: 'XSS attack attempt detected',
      maliciousInput: input.substring(0, 100),
      detectedAt: new Date().toISOString()
    });

    // Add to suspicious IPs
    suspiciousIPs.add(ip);
    
    // BLOCK the IP for XSS attempts
    blockIP(ip, 'xss_attempt');
    
    // Emit security event
    eventBus.emit('security.xss', {
      ip,
      input: input.substring(0, 100),
      timestamp: new Date()
    });

    console.log(`🚨 XSS attempt detected from ${ip} - IP BLOCKED`);
    return true;
  }

  return false;
}

// Check for CSRF attempts
export function detectCSRF(req) {
  const csrfToken = req.headers['x-csrf-token'] || (req.body && req.body._csrf);
  const referer = req.headers.referer;
  const origin = req.headers.origin;
  const userAgent = req.headers['user-agent'] || '';
  const platform = req.headers['x-platform'] || req.headers['X-Platform'] || '';

  // Skip CSRF check for localhost API testing and development
  if (userAgent.includes('PowerShell')) {
    return false; // Skip for PowerShell/API testing
  }

  // Skip CSRF check for mobile apps (React Native/Expo)
  if (platform === 'mobile' || userAgent.includes('React Native') || userAgent.includes('Expo')) {
    return false; // Allow mobile app requests
  }

  // Skip CSRF check for desktop apps (Electron)
  if (platform === 'desktop' || userAgent.includes('Electron')) {
    return false; // Allow desktop app requests
  }

  // Skip CSRF check for direct API calls without referer/origin
  if (!referer && !origin && (req.ip === '127.0.0.1' || req.ip === '192.168.100.113')) {
    return false; // Allow localhost and network IP direct API calls
  }

  // Basic CSRF validation - allow web app (3000) and desktop app (3001)
  // For web frontend, we'll allow requests from localhost:3000 without CSRF token for now
  // In production, you should implement proper CSRF token generation and validation
  const isValidCSRF = (
    // Allow requests with valid CSRF token
    (csrfToken && (
      (referer && (referer.includes('localhost:3000') || referer.includes('localhost:3001'))) ||
      (origin && (origin.includes('localhost:3000') || origin.includes('localhost:3001')))
    )) ||
    // Allow web frontend requests from localhost:3000 without CSRF token (development only)
    (req.method === 'POST' && (
      (referer && referer.includes('localhost:3000')) ||
      (origin && origin.includes('localhost:3000'))
    ))
  );

  if (!isValidCSRF && req.method !== 'GET') {
    const ip = getRealIP(req);
    
    console.log('🚨 CSRF attempt detected:', {
      platform,
      userAgent,
      referer,
      origin,
      csrfToken: !!csrfToken,
      method: req.method,
      ip
    });
    
    logActions.securityEvent(null, 'detected', req, {
      eventType: 'csrf_attempt',
      severity: 'medium',
      source: ip,
      target: 'api',
      description: 'CSRF token validation failed',
      referer,
      origin,
      detectedAt: new Date().toISOString()
    });

    // Add to suspicious IPs
    suspiciousIPs.add(ip);
    
    // Emit security event
    eventBus.emit('security.csrf', {
      ip,
      referer,
      origin,
      timestamp: new Date()
    });

    console.log(`🚨 CSRF attempt detected from ${ip}`);
    return true;
  }

  return false;
}

// Track failed login attempts for brute force detection
export function trackFailedLogin(ip, username, req) {
  const now = Date.now();
  const key = `${ip}:${username}`;
  
  if (!ipAttempts.has(key)) {
    ipAttempts.set(key, []);
  }
  
  const attempts = ipAttempts.get(key);
  attempts.push(now);
  
  // Clean old attempts outside the window
  const recentAttempts = attempts.filter(time => 
    now - time < SECURITY_CONFIG.BRUTE_FORCE_WINDOW
  );
  ipAttempts.set(key, recentAttempts);
  
  // Check for brute force
  if (recentAttempts.length >= SECURITY_CONFIG.BRUTE_FORCE_THRESHOLD) {
    logActions.securityEvent(null, 'detected', req, {
      eventType: 'brute_force_detected',
      severity: 'high',
      source: ip,
      target: username,
      description: 'Brute force attack detected',
      attemptCount: recentAttempts.length,
      timeWindow: `${SECURITY_CONFIG.BRUTE_FORCE_WINDOW / 60000} minutes`,
      detectedAt: new Date().toISOString()
    });

    // Block IP for brute force
    blockIP(ip, 'brute_force_attack');
    
    // Emit security event
    eventBus.emit('security.brute_force', {
      ip,
      username,
      attemptCount: recentAttempts.length,
      timestamp: new Date()
    });

    console.log(`🚨 Brute force attack detected from ${ip} targeting ${username}`);
    return true;
  }
  
  // Check for suspicious activity
  if (recentAttempts.length >= SECURITY_CONFIG.SUSPICIOUS_THRESHOLD) {
    logActions.securityEvent(null, 'detected', req, {
      eventType: 'suspicious_activity',
      severity: 'medium',
      source: ip,
      target: username,
      description: 'Suspicious login activity detected',
      attemptCount: recentAttempts.length,
      timeWindow: `${SECURITY_CONFIG.SUSPICIOUS_WINDOW / 60000} minutes`,
      detectedAt: new Date().toISOString()
    });

    // Add to suspicious IPs
    suspiciousIPs.add(ip);
    
    // Emit security event
    eventBus.emit('security.suspicious', {
      ip,
      username,
      attemptCount: recentAttempts.length,
      timestamp: new Date()
    });

    console.log(`⚠️ Suspicious activity detected from ${ip} targeting ${username}`);
    return true;
  }

  return false;
}

// Check for suspicious patterns in input
export function detectSuspiciousActivity(input, req) {
  if (!input || typeof input !== 'string') return false;

  // Skip suspicious activity detection for localhost in development
  const ip = getRealIP(req);
  if (process.env.NODE_ENV === 'development' && 
      (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1')) {
    return false;
  }

  const hasSuspiciousPattern = SECURITY_PATTERNS.SUSPICIOUS.some(pattern => 
    pattern.test(input)
  );

  if (hasSuspiciousPattern) {
    logActions.securityEvent(null, 'detected', req, {
      eventType: 'suspicious_activity',
      severity: 'low',
      source: ip,
      description: 'Suspicious activity pattern detected',
      suspiciousInput: input.substring(0, 100),
      detectedAt: new Date().toISOString()
    });

    // Add to suspicious IPs
    suspiciousIPs.add(ip);
    
    // Emit security event
    eventBus.emit('security.suspicious_activity', {
      ip,
      input: input.substring(0, 100),
      timestamp: new Date()
    });

    console.log(`⚠️ Suspicious activity detected from ${ip}`);
    return true;
  }

  return false;
}

// Check for LDAP injection attempts
export function detectLDAPInjection(input, req) {
  if (!input || typeof input !== 'string') return false;

  const hasLDAPInjection = SECURITY_PATTERNS.LDAP_INJECTION.some(pattern => 
    pattern.test(input)
  );

  if (hasLDAPInjection) {
    const ip = getRealIP(req);
    
    logActions.securityEvent(null, 'detected', req, {
      eventType: 'ldap_injection_attempt',
      severity: 'high',
      source: ip,
      target: 'ldap_server',
      description: 'LDAP injection attempt detected',
      maliciousInput: input.substring(0, 100),
      detectedAt: new Date().toISOString()
    });

    // Add to suspicious IPs
    suspiciousIPs.add(ip);
    
    // Emit security event
    eventBus.emit('security.ldap_injection', {
      ip,
      input: input.substring(0, 100),
      timestamp: new Date()
    });

    console.log(`🚨 LDAP injection attempt detected from ${ip}`);
    return true;
  }

  return false;
}

// Check for NoSQL injection attempts
export function detectNoSQLInjection(input, req) {
  if (!input || typeof input !== 'string') return false;

  const hasNoSQLInjection = SECURITY_PATTERNS.NOSQL_INJECTION.some(pattern => 
    pattern.test(input)
  );

  if (hasNoSQLInjection) {
    const ip = getRealIP(req);
    
    logActions.securityEvent(null, 'detected', req, {
      eventType: 'nosql_injection_attempt',
      severity: 'high',
      source: ip,
      target: 'nosql_database',
      description: 'NoSQL injection attempt detected',
      maliciousInput: input.substring(0, 100),
      detectedAt: new Date().toISOString()
    });

    // Add to suspicious IPs
    suspiciousIPs.add(ip);
    
    // Emit security event
    eventBus.emit('security.nosql_injection', {
      ip,
      input: input.substring(0, 100),
      timestamp: new Date()
    });

    console.log(`🚨 NoSQL injection attempt detected from ${ip}`);
    return true;
  }

  return false;
}

// Check for command injection attempts
export function detectCommandInjection(input, req) {
  if (!input || typeof input !== 'string') return false;

  const hasCommandInjection = SECURITY_PATTERNS.COMMAND_INJECTION.some(pattern => 
    pattern.test(input)
  );

  if (hasCommandInjection) {
    const ip = getRealIP(req);
    
    logActions.securityEvent(null, 'detected', req, {
      eventType: 'command_injection_attempt',
      severity: 'critical',
      source: ip,
      target: 'system_shell',
      description: 'Command injection attempt detected',
      maliciousInput: input.substring(0, 100),
      detectedAt: new Date().toISOString()
    });

    // Block IP immediately for command injection
    blockIP(ip, 'command_injection_attempt');
    
    // Emit security event
    eventBus.emit('security.command_injection', {
      ip,
      input: input.substring(0, 100),
      timestamp: new Date()
    });

    console.log(`🚨 Command injection attempt detected from ${ip} - IP BLOCKED`);
    return true;
  }

  return false;
}

// Check for path traversal attempts
export function detectPathTraversal(input, req) {
  if (!input || typeof input !== 'string') return false;

  const hasPathTraversal = SECURITY_PATTERNS.PATH_TRAVERSAL.some(pattern => 
    pattern.test(input)
  );

  if (hasPathTraversal) {
    const ip = getRealIP(req);
    
    logActions.securityEvent(null, 'detected', req, {
      eventType: 'path_traversal_attempt',
      severity: 'high',
      source: ip,
      target: 'file_system',
      description: 'Path traversal attempt detected',
      maliciousInput: input.substring(0, 100),
      detectedAt: new Date().toISOString()
    });

    // Add to suspicious IPs
    suspiciousIPs.add(ip);
    
    // Emit security event
    eventBus.emit('security.path_traversal', {
      ip,
      input: input.substring(0, 100),
      timestamp: new Date()
    });

    console.log(`🚨 Path traversal attempt detected from ${ip}`);
    return true;
  }

  return false;
}

// Check for SSRF attempts
export function detectSSRF(input, req) {
  if (!input || typeof input !== 'string') return false;

  const hasSSRF = SECURITY_PATTERNS.SSRF.some(pattern => 
    pattern.test(input)
  );

  if (hasSSRF) {
    const ip = getRealIP(req);
    
    logActions.securityEvent(null, 'detected', req, {
      eventType: 'ssrf_attempt',
      severity: 'high',
      source: ip,
      target: 'internal_network',
      description: 'SSRF attempt detected',
      maliciousInput: input.substring(0, 100),
      detectedAt: new Date().toISOString()
    });

    // Add to suspicious IPs
    suspiciousIPs.add(ip);
    
    // Emit security event
    eventBus.emit('security.ssrf', {
      ip,
      input: input.substring(0, 100),
      timestamp: new Date()
    });

    console.log(`🚨 SSRF attempt detected from ${ip}`);
    return true;
  }

  return false;
}

// Check for XXE attempts
export function detectXXE(input, req) {
  if (!input || typeof input !== 'string') return false;

  const hasXXE = SECURITY_PATTERNS.XXE.some(pattern => 
    pattern.test(input)
  );

  if (hasXXE) {
    const ip = getRealIP(req);
    
    logActions.securityEvent(null, 'detected', req, {
      eventType: 'xxe_attempt',
      severity: 'high',
      source: ip,
      target: 'xml_parser',
      description: 'XXE attack attempt detected',
      maliciousInput: input.substring(0, 100),
      detectedAt: new Date().toISOString()
    });

    // Add to suspicious IPs
    suspiciousIPs.add(ip);
    
    // Emit security event
    eventBus.emit('security.xxe', {
      ip,
      input: input.substring(0, 100),
      timestamp: new Date()
    });

    console.log(`🚨 XXE attack attempt detected from ${ip}`);
    return true;
  }

  return false;
}

// Check for information disclosure attempts
export function detectInformationDisclosure(input, req) {
  if (!input || typeof input !== 'string') return false;

  // Skip detection for legitimate form fields in JSON
  try {
    const parsed = JSON.parse(input);
    if (parsed && typeof parsed === 'object') {
      // Check if this looks like a legitimate form submission
      const hasFormFields = ['username', 'password', 'email', 'currentPassword', 'newPassword'].some(field => 
        parsed.hasOwnProperty(field)
      );
      
      if (hasFormFields) {
        // Only check for patterns in values, not field names
        const values = Object.values(parsed).join(' ');
        const hasInfoDisclosure = SECURITY_PATTERNS.INFORMATION_DISCLOSURE.some(pattern => 
          pattern.test(values) && !pattern.test(JSON.stringify(parsed))
        );
        
        if (hasInfoDisclosure) {
          const ip = getRealIP(req);
          
          logActions.securityEvent(null, 'detected', req, {
            eventType: 'information_disclosure_attempt',
            severity: 'low',
            source: ip,
            target: 'system_info',
            description: 'Information disclosure attempt detected',
            maliciousInput: input.substring(0, 100),
            detectedAt: new Date().toISOString()
          });

          // Add to suspicious IPs
          suspiciousIPs.add(ip);
          
          // Emit security event
          eventBus.emit('security.information_disclosure', {
            ip,
            input: input.substring(0, 100),
            timestamp: new Date()
          });

          console.log(`⚠️ Information disclosure attempt detected from ${ip}`);
          return true;
        }
        return false;
      }
    }
  } catch (e) {
    // If not JSON, continue with original logic
  }

  const hasInfoDisclosure = SECURITY_PATTERNS.INFORMATION_DISCLOSURE.some(pattern => 
    pattern.test(input)
  );

  if (hasInfoDisclosure) {
    const ip = getRealIP(req);
    
    logActions.securityEvent(null, 'detected', req, {
      eventType: 'information_disclosure_attempt',
      severity: 'low',
      source: ip,
      target: 'system_info',
      description: 'Information disclosure attempt detected',
      maliciousInput: input.substring(0, 100),
      detectedAt: new Date().toISOString()
    });

    // Add to suspicious IPs
    suspiciousIPs.add(ip);
    
    // Emit security event
    eventBus.emit('security.information_disclosure', {
      ip,
      input: input.substring(0, 100),
      timestamp: new Date()
    });

    console.log(`⚠️ Information disclosure attempt detected from ${ip}`);
    return true;
  }

  return false;
}

// Comprehensive security check for all inputs
export function performSecurityCheck(req, res, next) {
  const ip = getRealIP(req);
  
  // Check if IP is blocked
  if (isIPBlocked(ip)) {
    return res.status(403).json({
      message: 'Access denied: IP address is blocked',
      code: 'IP_BLOCKED'
    });
  }

  // Check request body for malicious patterns
  if (req.body) {
    const bodyString = JSON.stringify(req.body);
    
    // Check for SQL injection
    if (detectSQLInjection(bodyString, req)) {
      return res.status(400).json({
        message: 'Invalid request: Malicious input detected',
        code: 'SQL_INJECTION_DETECTED'
      });
    }
    
    // Check for XSS
    if (detectXSS(bodyString, req)) {
      return res.status(400).json({
        message: 'Invalid request: Malicious input detected',
        code: 'XSS_DETECTED'
      });
    }
    
    // Check for LDAP injection
    if (detectLDAPInjection(bodyString, req)) {
      return res.status(400).json({
        message: 'Invalid request: Malicious input detected',
        code: 'LDAP_INJECTION_DETECTED'
      });
    }
    
    // Check for NoSQL injection
    if (detectNoSQLInjection(bodyString, req)) {
      return res.status(400).json({
        message: 'Invalid request: Malicious input detected',
        code: 'NOSQL_INJECTION_DETECTED'
      });
    }
    
    // Check for command injection
    if (detectCommandInjection(bodyString, req)) {
      return res.status(400).json({
        message: 'Invalid request: Malicious input detected',
        code: 'COMMAND_INJECTION_DETECTED'
      });
    }
    
    // Check for path traversal
    if (detectPathTraversal(bodyString, req)) {
      return res.status(400).json({
        message: 'Invalid request: Malicious input detected',
        code: 'PATH_TRAVERSAL_DETECTED'
      });
    }
    
    // Check for SSRF
    if (detectSSRF(bodyString, req)) {
      return res.status(400).json({
        message: 'Invalid request: Malicious input detected',
        code: 'SSRF_DETECTED'
      });
    }
    
    // Check for XXE
    if (detectXXE(bodyString, req)) {
      return res.status(400).json({
        message: 'Invalid request: Malicious input detected',
        code: 'XXE_DETECTED'
      });
    }
    
    // Check for information disclosure
    if (detectInformationDisclosure(bodyString, req)) {
      return res.status(400).json({
        message: 'Invalid request: Information disclosure attempt detected',
        code: 'INFORMATION_DISCLOSURE_DETECTED'
      });
    }
    
    // Check for suspicious activity (temporarily disabled for testing)
    if (false && detectSuspiciousActivity(bodyString, req)) {
      return res.status(400).json({
        message: 'Invalid request: Suspicious activity detected',
        code: 'SUSPICIOUS_ACTIVITY_DETECTED'
      });
    }
  }

  // Check for CSRF
  if (detectCSRF(req)) {
    return res.status(403).json({
      message: 'Access denied: CSRF token validation failed',
      code: 'CSRF_DETECTED'
    });
  }

  next();
}

// Get security statistics
export function getSecurityStats() {
  return {
    blockedIPs: blockedIPs.size,
    suspiciousIPs: suspiciousIPs.size,
    totalAttempts: Array.from(ipAttempts.values()).reduce((sum, attempts) => sum + attempts.length, 0),
    activeThreats: suspiciousIPs.size + blockedIPs.size
  };
}


// Clear all suspicious IPs
export function clearSuspiciousIPs() {
  suspiciousIPs.clear();
  console.log('🧹 Cleared all suspicious IPs');
}

// Clear all IP attempts tracking
export function clearIPAttempts() {
  ipAttempts.clear();
  console.log('🧹 Cleared all IP attempts tracking');
}


