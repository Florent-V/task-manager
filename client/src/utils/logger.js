// src/logger.js
import log from 'loglevel';

if (import.meta.VITE_ENV === 'production') {
    log.setLevel('warn');
} else {
    log.setLevel('debug');
}

// Utilisation du logger
// logger.trace('Trace message');
// logger.debug('Debugging message from ExampleComponent', 'truck', 'car', 'bus');
// logger.info('Info message');
// logger.warn('Warning message');
// logger.error('Error message');
export default log;
