import { EventEmitter } from 'events';

export const eventBus = new EventEmitter();

// Increase max listeners to avoid warnings when many clients connect
eventBus.setMaxListeners(1000);

// Network Threat Event Types
export const NETWORK_EVENTS = {
  THREAT_DETECTED: 'network_threat_detected',
  MONITORING_STARTED: 'network_monitoring_started',
  MONITORING_STOPPED: 'network_monitoring_stopped',
  PCAP_ANALYZED: 'pcap_file_analyzed',
  MODEL_STATS_UPDATED: 'model_stats_updated'
};

// Helper function to emit network threat events
export const emitNetworkThreat = (threatData) => {
  eventBus.emit(NETWORK_EVENTS.THREAT_DETECTED, {
    type: NETWORK_EVENTS.THREAT_DETECTED,
    data: threatData,
    timestamp: new Date().toISOString()
  });
};

// Helper function to emit monitoring events
export const emitMonitoringEvent = (eventType, data) => {
  eventBus.emit(eventType, {
    type: eventType,
    data: data,
    timestamp: new Date().toISOString()
  });
};


