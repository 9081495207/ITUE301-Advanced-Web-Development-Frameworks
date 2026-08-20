// In-memory task storage for Practical 4
let tasks = [
  {
    id: 1,
    title: "Setup Node & Express Server",
    description: "Initialize practical 4 directory and install Express dependencies.",
    completed: true,
    createdAt: "2026-08-19T02:00:00.000Z"
  },
  {
    id: 2,
    title: "Implement Custom Middleware Pipeline",
    description: "Add logger, content-type validator, ID validator, and global error handler.",
    completed: true,
    createdAt: "2026-08-19T02:05:00.000Z"
  },
  {
    id: 3,
    title: "Test CRUD Endpoints",
    description: "Verify GET, POST, PUT, and DELETE task routes with correct HTTP status codes.",
    completed: false,
    createdAt: "2026-08-19T02:10:00.000Z"
  }
];

let nextId = 4;

function getAll() {
  return tasks;
}

function getById(id) {
  return tasks.find(t => t.id === id);
}

function create(taskData) {
  const newTask = {
    id: nextId++,
    title: taskData.title,
    description: taskData.description || "",
    completed: Boolean(taskData.completed),
    createdAt: new Date().toISOString()
  };
  tasks.push(newTask);
  return newTask;
}

function update(id, taskData) {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return null;

  tasks[index] = {
    ...tasks[index],
    title: taskData.title !== undefined ? taskData.title : tasks[index].title,
    description: taskData.description !== undefined ? taskData.description : tasks[index].description,
    completed: taskData.completed !== undefined ? Boolean(taskData.completed) : tasks[index].completed,
    updatedAt: new Date().toISOString()
  };
  return tasks[index];
}

function remove(id) {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}

function reset() {
  tasks = [
    {
      id: 1,
      title: "Setup Node & Express Server",
      description: "Initialize practical 4 directory and install Express dependencies.",
      completed: true,
      createdAt: "2026-08-19T02:00:00.000Z"
    },
    {
      id: 2,
      title: "Implement Custom Middleware Pipeline",
      description: "Add logger, content-type validator, ID validator, and global error handler.",
      completed: true,
      createdAt: "2026-08-19T02:05:00.000Z"
    },
    {
      id: 3,
      title: "Test CRUD Endpoints",
      description: "Verify GET, POST, PUT, and DELETE task routes with correct HTTP status codes.",
      completed: false,
      createdAt: "2026-08-19T02:10:00.000Z"
    }
  ];
  nextId = 4;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  reset
};
