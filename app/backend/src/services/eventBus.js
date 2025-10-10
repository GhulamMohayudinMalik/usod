import { EventEmitter } from 'events';

export const eventBus = new EventEmitter();

// Increase max listeners to avoid warnings when many clients connect
eventBus.setMaxListeners(1000);


