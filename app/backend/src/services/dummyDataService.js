import { faker } from '@faker-js/faker';

const generateIPAddress = (isMalicious = false) => {
  if (isMalicious) {
    const maliciousRanges = ['185.156.73.','193.35.18.','45.95.168.','91.219.236.','103.102.153.'];
    return maliciousRanges[Math.floor(Math.random() * maliciousRanges.length)] + Math.floor(Math.random() * 256);
  }
  return faker.internet.ip();
};

const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

export const generateLoginAttempts = (count) => {
  const attempts = [];
  for (let i = 0; i < count; i++) {
    const successful = Math.random() > 0.3;
    const isSuspicious = Math.random() < 0.2;
    attempts.push({
      id: faker.string.uuid(),
      username: faker.internet.username(),
      email: faker.internet.email(),
      ipAddress: isSuspicious ? generateIPAddress(true) : faker.internet.ip(),
      userAgent: faker.internet.userAgent(),
      timestamp: faker.date.recent({ days: 7 }).toISOString(),
      successful,
      location: { country: faker.location.country(), city: faker.location.city(), coordinates: [faker.number.float({ min: -90, max: 90, fractionDigits: 5 }), faker.number.float({ min: -180, max: 180, fractionDigits: 5 })] },
      ...(!successful && { failureReason: getRandomElement(['Invalid password','Account locked','MFA verification failed','User not found','Account disabled']) })
    });
  }
  return attempts;
};

export const generateSecurityEvents = (count) => {
  const eventTypes = ['malware','intrusion','data_leak','unauthorized_access','suspicious_activity','phishing'];
  const severityLevels = ['low','medium','high','critical'];
  const events = [];
  const generateDescription = (type, severity) => {
    const descriptions = { malware: ['Potential malware detected in user downloads folder','Malicious script execution attempt blocked','Ransomware signature detected'], intrusion: ['Multiple failed SSH login attempts','Unusual port scanning activity detected','Potential brute force attack'], data_leak: ['Sensitive data exfiltration attempt detected','Unusual data transfer to external IP','Large database query from unusual source'], unauthorized_access: ['User accessed restricted area','Elevation of privilege attempt','Access outside of normal hours'], suspicious_activity: ['Unusual login location for user','Abnormal system behavior detected','Unexpected configuration change'], phishing: ['Suspicious email link detected','Potential phishing attempt blocked','User reported phishing email'] };
    const typeDescs = descriptions[type] || ['Suspicious activity detected'];
    return getRandomElement(typeDescs) + (severity === 'critical' ? ' (CRITICAL)' : '');
  };
  for (let i = 0; i < count; i++) {
    const eventType = getRandomElement(eventTypes);
    const severity = getRandomElement(severityLevels);
    const resolved = Math.random() > 0.6;
    events.push({
      id: faker.string.uuid(),
      type: eventType,
      severity,
      source: Math.random() > 0.5 ? generateIPAddress(true) : faker.internet.username(),
      target: Math.random() > 0.7 ? getRandomElement(['Auth Server','Database','Web App','API Gateway','File Server']) : faker.internet.username(),
      timestamp: faker.date.recent({ days: 14 }).toISOString(),
      description: generateDescription(eventType, severity),
      resolved,
      ...(resolved && { resolvedAt: faker.date.recent({ days: 7 }).toISOString() }),
      ...(resolved && { assignedTo: faker.internet.username() }),
      ...((Math.random() > 0.7) && { relatedEvents: Array(Math.floor(Math.random() * 3 + 1)).fill(null).map(() => faker.string.uuid()) })
    });
  }
  return events;
};

export const generateIPAnalysis = (count) => {
  const ipAnalyses = [];
  const maliciousTags = ['botnet','malware_hosting','scanner','spam','ransomware','phishing','tor_exit_node','brute_force','exploit_kit','ddos'];
  const benignTags = ['cdn','corporate','cloud_service','email_server','hosting','vpn_service'];
  const maliciousActivities = ['Port scanning','Exploit attempts','Malware distribution','Command and control','Brute force attacks','Phishing campaigns','DDoS participation','Credential stuffing'];
  const blocklists = ['AbuseIPDB','Spamhaus','EmergingThreats','AlienVault','Cisco Talos','Blocklist.de','Barracuda','OTX','Malware Domain List'];
  for (let i = 0; i < count; i++) {
    const isMalicious = Math.random() < 0.4;
    const reputation = isMalicious ? Math.floor(Math.random() * 30) : Math.floor(Math.random() * 30) + 70;
    const firstSeen = faker.date.past({ years: 1 });
    const lastSeen = faker.date.between({ from: firstSeen, to: new Date() });
    const tags = [];
    if (isMalicious) {
      const numTags = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numTags; j++) { const tag = getRandomElement(maliciousTags); if (!tags.includes(tag)) tags.push(tag); }
    } else {
      const numTags = Math.floor(Math.random() * 2);
      for (let j = 0; j < numTags; j++) { const tag = getRandomElement(benignTags); if (!tags.includes(tag)) tags.push(tag); }
    }
    const activities = [];
    if (isMalicious) {
      const numActivities = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numActivities; j++) { const activity = getRandomElement(maliciousActivities); if (!activities.includes(activity)) activities.push(activity); }
    }
    const ipBlocklists = [];
    if (isMalicious && Math.random() > 0.2) {
      const numBlocklists = Math.floor(Math.random() * 4) + 1;
      for (let j = 0; j < numBlocklists; j++) { const blocklist = getRandomElement(blocklists); if (!ipBlocklists.includes(blocklist)) ipBlocklists.push(blocklist); }
    }
    ipAnalyses.push({
      ip: generateIPAddress(isMalicious),
      isMalicious,
      reputation,
      firstSeen: firstSeen.toISOString(),
      lastSeen: lastSeen.toISOString(),
      location: { country: faker.location.country(), city: faker.location.city(), coordinates: [faker.number.float({ min: -90, max: 90, fractionDigits: 5 }), faker.number.float({ min: -180, max: 180, fractionDigits: 5 })] },
      associatedASN: `AS${Math.floor(Math.random() * 65536)}`,
      tags,
      activities,
      blocklists: ipBlocklists
    });
  }
  return ipAnalyses;
};

export const generateSystemLogs = (count) => {
  const logTypes = ['authentication','system','application','security','network'];
  const levels = ['info','warning','error','critical'];
  const systems = ['web-server-01','db-server-02','auth-service','api-gateway','file-server-03','proxy-01'];
  const logs = [];
  const generateLogMessage = (logType, level) => {
    let message = '';
    let raw = '';
    switch(logType) {
      case 'authentication':
        if (level === 'info') { const username = faker.internet.username(); message = `User ${username} successfully authenticated`; raw = `INFO [Auth] User=${username} Action=LOGIN Status=SUCCESS IP=${faker.internet.ip()} ClientId=web-app-${Math.floor(Math.random() * 100)}`; }
        else { const username = faker.internet.username(); message = `Failed login attempt for user ${username}`; raw = `${level.toUpperCase()} [Auth] User=${username} Action=LOGIN Status=FAILED Reason=INVALID_CREDENTIALS Attempts=3 IP=${faker.internet.ip()}`; }
        break;
      case 'system':
        if (level === 'info' || level === 'warning') { const resource = getRandomElement(['CPU','memory','disk']); const usage = Math.floor(Math.random() * 30) + 70; message = `${resource} usage at ${usage}%`; raw = `${level.toUpperCase()} [System] Resource=${resource} Usage=${usage}% Threshold=${resource === 'disk' ? 85 : 90} Server=srv-${Math.floor(Math.random() * 10)}`; }
        else { message = 'System service failed to start'; raw = `${level.toUpperCase()} [System] Service=nginx Status=FAILED ErrorCode=0x8007042 Action=RESTART Attempts=2`; }
        break;
      case 'application':
        if (level === 'info') { message = 'Application deployment completed'; raw = `INFO [App] Deployment=v${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 100)} Status=SUCCESS Duration=72s`; }
        else { message = 'Application exception occurred'; raw = `${level.toUpperCase()} [App] Exception="NullReferenceException" Method="ProcessPayment" Line=142 RequestId=req-${faker.string.alphanumeric(8)}`; }
        break;
      case 'security':
        if (level === 'info') { message = 'Security scan completed'; raw = `INFO [Security] Scan=SCHEDULED Findings=0 Duration=180s Target=web-cluster`; }
        else if (level === 'warning') { message = 'Outdated security patch detected'; raw = `WARNING [Security] Patch=CVE-2022-${Math.floor(Math.random() * 10000)} Status=MISSING Severity=MEDIUM Component=OpenSSL`; }
        else { message = 'Potential security breach detected'; raw = `${level.toUpperCase()} [Security] Alert=INTRUSION Source=${faker.internet.ip()} Target=admin-portal Pattern=SQL_INJECTION Action=BLOCKED`; }
        break;
      case 'network':
        if (level === 'info') { message = 'Network connection established'; raw = `INFO [Network] Connection=ESTABLISHED Source=${faker.internet.ip()} Destination=${faker.internet.ip()} Protocol=HTTPS`; }
        else if (level === 'warning') { message = 'Unusual network traffic detected'; raw = `WARNING [Network] Traffic=UNUSUAL Source=${faker.internet.ip()} Destination=${faker.internet.ip()} Volume=${Math.floor(Math.random() * 1000) + 500}MB Threshold=400MB`; }
        else { message = 'Network connection dropped'; raw = `${level.toUpperCase()} [Network] Connection=DROPPED Source=${faker.internet.ip()} Destination=${faker.internet.ip()} Reason=TIMEOUT Attempts=3`; }
        break;
      default:
        message = 'System event recorded';
        raw = `${level.toUpperCase()} [System] Event=GENERIC Time=${new Date().toISOString()}`;
    }
    return { message, raw };
  };
  for (let i = 0; i < count; i++) {
    const logType = getRandomElement(logTypes);
    const levelWeights = Math.random();
    let level;
    if (levelWeights < 0.6) level = 'info';
    else if (levelWeights < 0.85) level = 'warning';
    else if (levelWeights < 0.97) level = 'error';
    else level = 'critical';
    const system = getRandomElement(systems);
    const { message, raw } = generateLogMessage(logType, level);
    logs.push({ id: faker.string.uuid(), system, logType, timestamp: faker.date.recent({ days: 2 }).toISOString(), level, message, source: `${system}.${faker.internet.domainName()}`, raw });
  }
  return logs;
};

export const generateThreatIntel = (count) => {
  const types = ['ip','domain','url','file_hash','email'];
  const severityLevels = ['low','medium','high','critical'];
  const threatIntel = [];
  const generateIndicator = (type) => {
    switch(type) {
      case 'ip': return generateIPAddress(true);
      case 'domain': return `${faker.word.sample()}-${faker.word.sample()}.${getRandomElement(['com','net','org','io','xyz'])}`;
      case 'url': return `https://${faker.word.sample()}-${faker.word.sample()}.${getRandomElement(['com','net','io'])}/${faker.system.commonFileName('html')}`;
      case 'file_hash': return faker.string.hexadecimal({ length: 64, casing: 'lower', prefix: '' });
      case 'email': return faker.internet.email({ provider: `${faker.word.sample()}-${faker.word.sample()}.com` });
      default: return faker.string.sample(20);
    }
  };
  const generateDescription = (type, severity) => {
    const descriptions = { ip: ['Associated with command and control server','Source of brute force attacks','Part of botnet infrastructure','Hosting malicious content'], domain: ['Phishing campaign target','Hosting exploit kit','Generated by DGA algorithm','Distributing malware'], url: ['Phishing page impersonating legitimate service','Malicious redirect','Drive-by download site','Hosting malicious JavaScript'], file_hash: ['Ransomware payload','Trojan downloader','Information stealer','Backdoor installer'], email: ['Phishing campaign source','Spam distribution','Contains malicious attachments','Business email compromise attempt'] };
    const typeDescs = descriptions[type] || ['Malicious indicator'];
    return getRandomElement(typeDescs) + (severity === 'critical' ? ' (IMMEDIATE ACTION RECOMMENDED)' : '');
  };
  const sources = ['AlienVault OTX','VirusTotal','AbuseIPDB','ThreatConnect','Recorded Future','Mandiant','CrowdStrike'];
  for (let i = 0; i < count; i++) {
    const type = getRandomElement(types);
    const severity = getRandomElement(severityLevels);
    const confidence = parseFloat((Math.random() * 0.5 + 0.5).toFixed(2));
    const firstSeen = faker.date.past({ years: 1 });
    const lastSeen = faker.date.between({ from: firstSeen, to: new Date() });
    const tags = [];
    const tagPool = ['apt','ransomware','phishing','malware','trojan','botnet','exfiltration','backdoor','exploit'];
    const numTags = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numTags; j++) { const tag = getRandomElement(tagPool); if (!tags.includes(tag)) tags.push(tag); }
    threatIntel.push({ id: faker.string.uuid(), indicator: generateIndicator(type), type, confidence, severity, firstSeen: firstSeen.toISOString(), lastSeen: lastSeen.toISOString(), tags, description: generateDescription(type, severity), source: getRandomElement(sources), ...(Math.random() > 0.7 && { relatedIndicators: Array(Math.floor(Math.random() * 3) + 1).fill(null).map(() => generateIndicator(getRandomElement(types))) }) });
  }
  return threatIntel;
};

export const generateDummyData = () => ({
  loginAttempts: generateLoginAttempts(50),
  securityEvents: generateSecurityEvents(30),
  ipAnalysis: generateIPAnalysis(40),
  systemLogs: generateSystemLogs(100),
  threatIntelligence: generateThreatIntel(35)
});
