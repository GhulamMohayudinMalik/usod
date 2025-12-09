import mongoose from 'mongoose';

const blockedIPSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  reason: {
    type: String,
    required: true,
    default: 'security_violation'
  },
  blockedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  blockedBy: {
    type: String,
    default: 'system' // 'system' for auto-block, userId for manual block
  },
  metadata: {
    eventType: String,
    severity: String,
    description: String,
    attemptCount: Number
  }
}, {
  timestamps: true
});

// TTL index - MongoDB will automatically delete expired documents
blockedIPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to check if IP is blocked
blockedIPSchema.statics.isBlocked = async function(ip) {
  const blocked = await this.findOne({ 
    ip, 
    expiresAt: { $gt: new Date() } 
  });
  return !!blocked;
};

// Static method to block an IP
blockedIPSchema.statics.blockIP = async function(ip, reason = 'security_violation', metadata = {}, daysToBlock = 30) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + daysToBlock);
  
  return this.findOneAndUpdate(
    { ip },
    { 
      ip,
      reason,
      blockedAt: new Date(),
      expiresAt,
      metadata
    },
    { upsert: true, new: true }
  );
};

// Static method to unblock an IP
blockedIPSchema.statics.unblockIP = async function(ip) {
  return this.deleteOne({ ip });
};

// Static method to get all blocked IPs
blockedIPSchema.statics.getAllBlocked = async function() {
  return this.find({ expiresAt: { $gt: new Date() } }).sort({ blockedAt: -1 });
};

// Static method to get blocked IPs count
blockedIPSchema.statics.getBlockedCount = async function() {
  return this.countDocuments({ expiresAt: { $gt: new Date() } });
};

export const BlockedIP = mongoose.model('BlockedIP', blockedIPSchema);
