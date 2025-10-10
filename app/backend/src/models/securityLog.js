import mongoose, { Schema } from 'mongoose';

const SecurityLogSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
        type: String,
        required: true,
        enum: [
            'login',
            'logout',
            'password_change',
            'profile_update',
            'access_denied',
            'system_error',
            'security_event',
            'session_created',
            'session_expired',
            'token_refresh',
            'account_locked',
            'account_unlocked',
            'user_created',
            'user_deleted',
            'role_changed',
            'settings_changed',
            'backup_created',
            'backup_restored',
            'suspicious_activity',
            'brute_force_detected',
            'sql_injection_attempt',
            'xss_attempt',
            'csrf_attempt',
            'ip_blocked',
            'ip_unblocked'
        ]
    },
    status: { type: String, required: true, enum: ['success', 'failure', 'detected'] },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    details: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now }
});

SecurityLogSchema.index({ userId: 1 });
SecurityLogSchema.index({ action: 1 });
SecurityLogSchema.index({ status: 1 });
SecurityLogSchema.index({ timestamp: -1 });

export const SecurityLog = mongoose.models.SecurityLog || mongoose.model('SecurityLog', SecurityLogSchema);
