const taskEvents = require('../../events');

/**
 * Register Event Listeners for Task Operations (Practical 10)
 */
const initTaskListeners = () => {
  // Listener 1: task-created event (Step 2, Step 5, Supplementary Problem 3)
  taskEvents.on('task-created', (task) => {
    const startTimestamp = new Date().toISOString();
    console.log(`[Notification Listener START] Event triggered for Task "${task.title}" at ${startTimestamp}`);

    try {
      // Supplementary Problem 2: Check for error simulation trigger
      if (task.title && task.title.includes('TRIGGER_ERROR')) {
        throw new Error(`Failed to deliver notification for Task "${task.title}": Invalid recipient`);
      }

      // Supplementary Problem 3: Artificial delay (default 2000ms) to demonstrate asynchronous execution
      const delayMs = task.delayMs !== undefined ? task.delayMs : 2000;

      setTimeout(() => {
        const finishTimestamp = new Date().toISOString();
        console.log(`[Notification Listener FINISHED] Task "${task.title}" (ID: ${task._id}, User: ${task.user}) processed background notification at ${finishTimestamp}`);
      }, delayMs);

    } catch (err) {
      // Pass error to the dedicated error listener
      taskEvents.emit('error', err);
    }
  });

  // Listener 2: task-deleted event (Supplementary Problem 1)
  taskEvents.on('task-deleted', (task) => {
    const startTimestamp = new Date().toISOString();
    console.log(`[Deletion Listener START] Event triggered for deleted Task "${task.title}" at ${startTimestamp}`);

    setTimeout(() => {
      const finishTimestamp = new Date().toISOString();
      console.log(`[Deletion Listener FINISHED] Task "${task.title}" cleanup notification recorded at ${finishTimestamp}`);
    }, 1000);
  });

  // Listener 3: error event listener (Supplementary Problem 2)
  taskEvents.on('error', (err) => {
    console.error(`[Error Listener CAUGHT] ❌ Event Handler Error: ${err.message}`);
  });
};

module.exports = { initTaskListeners };
