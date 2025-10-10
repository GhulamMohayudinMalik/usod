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
            'security_event'
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
