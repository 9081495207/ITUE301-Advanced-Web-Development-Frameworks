const EventEmitter = require('events');

/**
 * Step 1: Create a dedicated EventEmitter subclass for task operations
 */
class TaskEvents extends EventEmitter {}

// Export a singleton instance of TaskEvents
const taskEvents = new TaskEvents();

module.exports = taskEvents;
