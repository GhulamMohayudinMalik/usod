import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

console.log('🔍 Validating environment configuration...\n');

const errors = [];
const warnings = [];
const info = [];

// Required environment variables
const requiredVars = {
  MONGODB_URI: 'MongoDB connection string',
  JWT_SECRET: 'JWT secret for authentication',
  INGEST_API_KEY: 'API key for data ingestion',
  FRONTEND_URL: 'Frontend application URL',
};

// Optional environment variables
const optionalVars = {
  PORT: 'Server port (default: 5000)',
  NODE_ENV: 'Environment (development/production)',
  BACKUP_DIR: 'Backup directory path',
  ALLOWED_ORIGINS: 'Additional CORS allowed origins',
};

// Check required variables
console.log('📋 Checking required environment variables:');
for (const [varName, description] of Object.entries(requiredVars)) {
  const value = process.env[varName];
  
  if (!value) {
    errors.push(`❌ ${varName} is missing (${description})`);
  } else {
    // Additional validation
    if (varName === 'JWT_SECRET' && value.length < 32) {
      warnings.push(`⚠️  ${varName} is too short (${value.length} chars). Recommended: 64+ characters`);
    }
    
    if (varName === 'INGEST_API_KEY' && value.length < 20) {
      warnings.push(`⚠️  ${varName} is too short (${value.length} chars). Recommended: 32+ characters`);
    }
    
    if (varName === 'MONGODB_URI') {
      if (value.includes('localhost') && process.env.NODE_ENV === 'production') {
        warnings.push(`⚠️  ${varName} uses localhost in production environment`);
      }
    }
    
    if (varName === 'FRONTEND_URL') {
      if (value.includes('localhost') && process.env.NODE_ENV === 'production') {
        warnings.push(`⚠️  ${varName} uses localhost in production environment`);
      }
      if (process.env.NODE_ENV === 'production' && !value.startsWith('https://')) {
        warnings.push(`⚠️  ${varName} should use HTTPS in production`);
      }
    }
    
    console.log(`✅ ${varName}: Set`);
  }
}

// Check optional variables
console.log('\n📝 Checking optional environment variables:');
for (const [varName, description] of Object.entries(optionalVars)) {
  const value = process.env[varName];
  
  if (value) {
    console.log(`✅ ${varName}: ${value}`);
  } else {
    info.push(`ℹ️  ${varName} not set (${description})`);
  }
}

// Check .env file exists
console.log('\n📁 Checking configuration files:');
const envPath = join(__dirname, '../../.env');
if (existsSync(envPath)) {
  console.log('✅ .env file exists');
} else {
  errors.push('❌ .env file not found. Copy from .env.example');
}

// Check for development-only settings in production
if (process.env.NODE_ENV === 'production') {
  console.log('\n🏭 Production environment checks:');
  
  if (process.env.JWT_SECRET === 'SuperKeyForJWTTokens') {
    errors.push('❌ Using default JWT_SECRET in production!');
  }
  
  if (process.env.INGEST_API_KEY === 'AKJLkjlkasdjLKJ82kJLK') {
    errors.push('❌ Using default INGEST_API_KEY in production!');
  }
  
  if (!process.env.MONGODB_URI.includes('mongodb+srv') && 
      !process.env.MONGODB_URI.includes('documentdb')) {
    warnings.push('⚠️  Consider using MongoDB Atlas or AWS DocumentDB for production');
  }
}

// Print summary
console.log('\n' + '='.repeat(60));
console.log('📊 Validation Summary:');
console.log('='.repeat(60));

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All checks passed! Environment is properly configured.');
} else {
  if (errors.length > 0) {
    console.log('\n🚨 ERRORS (must fix):');
    errors.forEach(err => console.log(err));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS (should fix):');
    warnings.forEach(warn => console.log(warn));
  }
  
  if (info.length > 0) {
    console.log('\nℹ️  INFO:');
    info.forEach(i => console.log(i));
  }
}

console.log('\n' + '='.repeat(60));

// Exit with error code if there are critical errors
if (errors.length > 0) {
  console.log('\n❌ Environment validation failed!');
  process.exit(1);
} else if (warnings.length > 0) {
  console.log('\n⚠️  Environment validation passed with warnings.');
  process.exit(0);
} else {
  console.log('\n✅ Environment validation successful!');
  process.exit(0);
}
