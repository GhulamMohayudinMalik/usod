import mongoose, { Schema } from 'mongoose';

const SecurityLogSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    platform: {
        type: String,
        required: true,
        enum: ['web', 'desktop', 'mobile'],
        default: 'web'
    },
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
            'ip_unblocked',
            // Network AI Service Actions
            'network_intrusion',
            'network_port_scan',
            'network_dos',
            'network_malware',
            'network_anomaly',
            'network_monitoring_started',
            'network_monitoring_stopped',
            'network_threat_detected',
            'pcap_file_analyzed',
            // IP Tracer Actions
            'ip_trace',
            'ip_trace_batch'
        ]
    },
    status: { type: String, required: true, enum: ['success', 'failure', 'detected', 'started', 'stopped', 'analyzed', 'blocked', 'unblocked'] },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    deviceInfo: {
        type: Schema.Types.Mixed,
        default: {}
    },
    details: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now }
});

SecurityLogSchema.index({ userId: 1 });
SecurityLogSchema.index({ action: 1 });
SecurityLogSchema.index({ status: 1 });
SecurityLogSchema.index({ platform: 1 });
SecurityLogSchema.index({ timestamp: -1 });
SecurityLogSchema.index({ platform: 1, timestamp: -1 });
SecurityLogSchema.index({ userId: 1, platform: 1 });

export const SecurityLog = mongoose.models.SecurityLog || mongoose.model('SecurityLog', SecurityLogSchema);
