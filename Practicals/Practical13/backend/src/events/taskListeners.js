const taskEvents = require('../../events');

const initTaskListeners = () => {
  taskEvents.on('task-created', (task) => {
    const startTimestamp = new Date().toISOString();
    console.log(`[Notification Listener START] Event triggered for Task "${task.title}" at ${startTimestamp}`);

    try {
      if (task.title && task.title.includes('TRIGGER_ERROR')) {
        throw new Error(`Failed to deliver notification for Task "${task.title}": Invalid recipient`);
      }

      const delayMs = task.delayMs !== undefined ? task.delayMs : 1000;

      setTimeout(() => {
        const finishTimestamp = new Date().toISOString();
        console.log(`[Notification Listener FINISHED] Task "${task.title}" (ID: ${task._id}, User: ${task.user}) processed background notification at ${finishTimestamp}`);
      }, delayMs);

    } catch (err) {
      taskEvents.emit('error', err);
    }
  });

  taskEvents.on('task-deleted', (task) => {
    const startTimestamp = new Date().toISOString();
    console.log(`[Deletion Listener START] Event triggered for deleted Task "${task.title}" at ${startTimestamp}`);

    setTimeout(() => {
      const finishTimestamp = new Date().toISOString();
      console.log(`[Deletion Listener FINISHED] Task "${task.title}" cleanup notification recorded at ${finishTimestamp}`);
    }, 500);
  });

  taskEvents.on('error', (err) => {
    console.error(`[Error Listener CAUGHT] ❌ Event Handler Error: ${err.message}`);
  });
};

module.exports = { initTaskListeners };
