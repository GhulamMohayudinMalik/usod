#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import { SecurityLog } from '../models/SecurityLog.js';
import { User } from '../models/User.js';

dotenv.config();

async function connect() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/usod';
  await mongoose.connect(uri);
}

function randFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function buildLogForUser(user) {
  const actions = ['login','logout','password_change','profile_update','access_denied','system_error'];
  const statuses = ['success','failure'];
  const action = randFrom(actions);
  const status = randFrom(statuses);
  return {
    userId: user._id,
    action,
    status,
    ipAddress: faker.internet.ip(),
    userAgent: faker.internet.userAgent(),
    details: buildDetails(action, status),
    timestamp: new Date()
  };
}

function buildDetails(action, status) {
  const common = {
    timestamp: new Date(),
    browser: faker.internet.userAgent().split(' ')[0],
    os: ['Windows','MacOS','Linux','iOS','Android'][Math.floor(Math.random() * 5)],
    location: { country: faker.location.country(), city: faker.location.city(), coordinates: [faker.location.longitude(), faker.location.latitude()] }
  };
  switch (action) {
    case 'login': return { ...common, method: randFrom(['password','sso','2fa']), failureReason: status === 'failure' ? randFrom(['invalid_password','account_locked','suspicious_ip']) : null };
    case 'logout': return { ...common, reason: randFrom(['user_initiated','session_timeout','admin_action']) };
    case 'password_change': return { ...common, reason: randFrom(['expired','compromised','user_initiated','admin_reset']), passwordStrength: randFrom(['weak','medium','strong']) };
    case 'profile_update': return { ...common, fields: ['name','email','phone','address','preferences'].slice(0, Math.floor(Math.random() * 5) + 1) };
    case 'access_denied': return { ...common, resource: randFrom(['/admin','/reports','/settings','/users','/billing']), requiredRole: randFrom(['admin','manager','supervisor']), userRole: 'user' };
    case 'system_error': return { ...common, errorCode: 'ERR_' + Math.floor(Math.random() * 1000), component: randFrom(['database','api','authentication','file_system','cache']), severity: randFrom(['low','medium','high','critical']) };
    default: return common;
  }
}

function buildSecurityEventForUser(user) {
  const eventTypes = ['malware','intrusion','data_leak','unauthorized_access','suspicious_activity','phishing'];
  const severities = ['low','medium','high','critical'];
  const eventType = randFrom(eventTypes);
  const severity = randFrom(severities);
  return {
    userId: user._id,
    action: 'security_event',
    status: 'detected',
    ipAddress: faker.internet.ip(),
    userAgent: faker.internet.userAgent(),
    details: {
      type: eventType,
      severity,
      source: faker.internet.ip(),
      target: faker.internet.domainName(),
      description: buildSecurityEventDescription(eventType),
      resolved: Math.random() > 0.8,
      relatedEvents: [],
      id: faker.string.uuid()
    },
    timestamp: new Date()
  };
}

function buildSecurityEventDescription(eventType) {
  switch (eventType) {
    case 'malware': return `Detected ${faker.word.adjective()} ${faker.word.noun()} malware on ${faker.internet.domainName()}`;
    case 'intrusion': return `Intrusion attempt from ${faker.internet.ip()} using ${faker.hacker.verb()} ${faker.hacker.noun()}`;
    case 'data_leak': return `Potential data leak of ${faker.number.int({ min: 100, max: 10000 })} records containing ${faker.hacker.adjective()} information`;
    case 'unauthorized_access': return `Unauthorized access attempt to ${faker.system.fileName()} by user from ${faker.location.country()}`;
    case 'suspicious_activity': return `Suspicious ${faker.hacker.verb()} activity detected on ${faker.system.fileName()}`;
    case 'phishing': return `Phishing attempt using ${faker.company.name()} brand targeting ${faker.person.jobTitle()}`;
    default: return `Security event detected involving ${faker.hacker.verb()} ${faker.hacker.noun()}`;
  }
}

async function ensureUser() {
  const users = await User.find();
  if (users.length > 0) return users;
  const u = new User({ username: 'default_user', email: 'default@example.com', password: 'password123' });
  await u.save();
  return [u];
}

async function live(minMs = 3000, maxMs = 8000) {
  if (mongoose.connection.readyState !== 1) {
    await connect();
  }
  const users = await ensureUser();
  async function generateOnce() {
    const user = users[Math.floor(Math.random() * users.length)];
    const doc = Math.random() < 0.3 ? buildSecurityEventForUser(user) : buildLogForUser(user);
    const saved = await SecurityLog.create(doc);
    console.log(`[${new Date().toLocaleTimeString()}] Inserted ${saved.action} (${saved.status})`);
  }
  async function loop() {
    try { await generateOnce(); } catch (e) { console.error('Generation error:', e.message); }
    const next = Math.floor(Math.random() * (maxMs - minMs + 1) + minMs);
    setTimeout(loop, next);
  }
  loop();
}

// Auto-start in live mode when imported by the server
export function startLiveGenerator(min = 3000, max = 10000) {
  live(min, max);
}

// If executed directly, start live generator
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const min = parseInt((args.find(a => a.startsWith('--min=')) || '').split('=')[1] || '3000', 10);
  const max = parseInt((args.find(a => a.startsWith('--max=')) || '').split('=')[1] || '10000', 10);
  startLiveGenerator(min, max);
}

