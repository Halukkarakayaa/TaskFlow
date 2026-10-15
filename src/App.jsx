import { useState, useEffect, useRef } from "react";

// Format task due dates
const formatDate = (date) => {
  if (!date) return "";

  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Calculate deadline warnings
const getDueStatus = (task) => {
  if (!task.dueDate || task.status === "done") {
    return null;
  }

  const today = new Date();

  const todayUTC = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const [year, month, day] = task.dueDate.split("-").map(Number);

  const dueUTC = Date.UTC(year, month - 1, day);

  const daysRemaining = Math.round((dueUTC - todayUTC) / 86400000);

  if (daysRemaining < 0) return "overdue";
  if (daysRemaining === 0) return "today";
  if (daysRemaining <= 3) return "soon";

  return null;
};

function App() {
  const [taskText, setTaskText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dueFilter, setDueFilter] = useState("all");

  // Load tasks from localStorage
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem("task-manager-tasks");

      const parsedTasks = savedTasks ? JSON.parse(savedTasks) : [];

      return Array.isArray(parsedTasks) ? parsedTasks : [];
    } catch {
      return [];
    }
  });

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("todo");

  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const dialogRef = useRef(null);
  const deleteDialogRef = useRef(null);

  const selectedTask = tasks.find((task) => task.id === selectedTaskId);

  // Filter tasks by title and description
  const filteredTasks = tasks.filter((task) => {
    const taskContent = `${task.text} ${task.description || ""}`;
    const query = searchQuery.trim().toLocaleLowerCase("tr-TR");

    return taskContent.toLocaleLowerCase("tr-TR").includes(query);
  });

  // Filter tasks by priority and deadline
  const visibleTasks = filteredTasks.filter((task) => {
    const matchesPriority =
      priorityFilter === "all" ||
      (task.priority || "medium") === priorityFilter;

    const matchesDeadline =
      dueFilter === "all" || getDueStatus(task) === dueFilter;

    return matchesPriority && matchesDeadline;
  });

  // Save tasks when they change
  useEffect(() => {
    localStorage.setItem("task-manager-tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Create a new task
  const handleAddTask = (event) => {
    event.preventDefault();

    if (!taskText.trim()) return;

    const newTask = {
      id: Date.now(),
      text: taskText.trim(),
      description: "",
      dueDate: "",
      priority: "medium",
      status: "todo",
    };

    setTasks((currentTasks) => [...currentTasks, newTask]);

    setTaskText("");
  };

  // Open task details
  const handleOpenDetails = (task) => {
    setSelectedTaskId(task.id);
    setTaskTitle(task.text);
    setDescription(task.description || "");
    setDueDate(task.dueDate || "");
    setPriority(task.priority || "medium");
    setStatus(task.status || "todo");

    dialogRef.current?.showModal();
  };

  // Save task details
  const handleSaveDetails = (event) => {
    event.preventDefault();

    if (!taskTitle.trim()) return;

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === selectedTaskId
          ? {
              ...task,
              text: taskTitle.trim(),
              description: description.trim(),
              dueDate,
              priority,
              status,
            }
          : task,
      ),
    );

    dialogRef.current?.close();
  };

  // Open delete confirmation
  const handleOpenDeleteDialog = () => {
    deleteDialogRef.current?.showModal();
  };

  // Delete the selected task
  const handleConfirmDelete = () => {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== selectedTaskId),
    );

    deleteDialogRef.current?.close();
    dialogRef.current?.close();
  };

  // Start dragging a task
  const handleDragStart = (event, taskId) => {
    event.dataTransfer.setData("text/plain", String(taskId));

    event.dataTransfer.effectAllowed = "move";
    setDraggingTaskId(taskId);
  };

  // Allow dropping into a column
  const handleDragOver = (event, columnId) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  // Move a dropped task to another column
  const handleDrop = (event, columnId) => {
    event.preventDefault();

    const taskId = event.dataTransfer.getData("text/plain");

    if (taskId) {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          String(task.id) === taskId ? { ...task, status: columnId } : task,
        ),
      );
    }

    setDraggingTaskId(null);
    setDragOverColumn(null);
  };

  // Clear drag indicators
  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverColumn(null);
  };

  return (
    <main>
      <style>
        {`
          .task-details-dialog::backdrop {
            background: rgba(36, 31, 59, 0.35);
          }

          .delete-confirm-dialog::backdrop {
            background: rgba(36, 31, 59, 0.5);
            backdrop-filter: blur(3px);
          }
        `}
      </style>

      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">✦</span>
          <span>TaskFlow</span>
        </div>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <a href="#overview" className="sidebar-link">
            <span>▦</span>
            Overview
          </a>

          <a href="#add-task" className="sidebar-link">
            <span>＋</span>
            Add Task
          </a>

          <a href="#task-board" className="sidebar-link">
            <span>☷</span>
            Task Board
          </a>
        </nav>

        <div className="sidebar-footer">
          <p>TaskFlow Dashboard</p>
          <small>Built with React + Vite</small>
        </div>
      </aside>

      <h1 id="overview">Task Manager</h1>
      <p>Organize your tasks in one place.</p>

      {/* Dashboard statistics */}
      <section className="stats-grid">
        <div className="stat-card">
          <span>Total Tasks</span>
          <strong>{tasks.length}</strong>
        </div>

        <div className="stat-card">
          <span>In Progress</span>
          <strong>
            {tasks.filter((task) => task.status === "progress").length}
          </strong>
        </div>

        <div className="stat-card">
          <span>Completed</span>
          <strong>
            {tasks.filter((task) => task.status === "done").length}
          </strong>
        </div>

        <div className="stat-card">
          <span>Overdue</span>
          <strong>
            {tasks.filter((task) => getDueStatus(task) === "overdue").length}
          </strong>
        </div>
      </section>

      <section id="add-task">
        <h2>Add a Task</h2>

        <form onSubmit={handleAddTask}>
          <input
            type="text"
            placeholder="Enter a new task..."
            value={taskText}
            onChange={(event) => setTaskText(event.target.value)}
          />

          <button type="submit">Add Task</button>
        </form>
      </section>

      <section id="task-board">
        <h2>Task Board</h2>
        <p className="board-hint">
          Drag and drop tasks to change their status.
        </p>

        <div className="board-search">
          <input
            type="search"
            placeholder="Search tasks by title or description..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search tasks"
          />
        </div>

        <div className="priority-filter-row">
          <label htmlFor="priority-filter">Filter by Priority:</label>

          <select
            id="priority-filter"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          <label htmlFor="due-filter">Filter by Deadline:</label>

          <select
            id="due-filter"
            value={dueFilter}
            onChange={(event) => setDueFilter(event.target.value)}
          >
            <option value="all">All Deadlines</option>
            <option value="overdue">Overdue</option>
            <option value="today">Due Today</option>
            <option value="soon">Due Soon</option>
          </select>
        </div>

        <div className="kanban-board">
          {[
            { id: "todo", title: "To Do" },
            { id: "progress", title: "In Progress" },
            { id: "done", title: "Done" },
          ].map((column) => {
            const columnTasks = visibleTasks.filter(
              (task) => (task.status ?? "todo") === column.id,
            );

            return (
              <div
                key={column.id}
                className={`kanban-column ${
                  dragOverColumn === column.id ? "drop-target" : ""
                }`}
                onDragOver={(event) => handleDragOver(event, column.id)}
                onDrop={(event) => handleDrop(event, column.id)}
              >
                <h3>
                  {column.title} ({columnTasks.length})
                </h3>

                {columnTasks.length === 0 ? (
                  <p>No tasks in this column.</p>
                ) : (
                  <ul>
                    {columnTasks.map((task) => {
                      const dueStatus = getDueStatus(task);

                      return (
                        <li
                          key={task.id}
                          className={`task-card ${
                            draggingTaskId === task.id ? "dragging" : ""
                          }`}
                          draggable
                          role="button"
                          tabIndex={0}
                          onDragStart={(event) =>
                            handleDragStart(event, task.id)
                          }
                          onDragEnd={handleDragEnd}
                          onClick={() => handleOpenDetails(task)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleOpenDetails(task);
                            }
                          }}
                          style={{ cursor: "grab" }}
                        >
                          <span>{task.text}</span>

                          {task.description && (
                            <p className="task-preview">
                              {task.description.length > 100
                                ? `${task.description
                                    .slice(0, 100)
                                    .trimEnd()}...`
                                : task.description}
                            </p>
                          )}

                          <div className="task-meta">
                            <span
                              className={`task-tag priority-${
                                task.priority || "medium"
                              }`}
                            >
                              {(task.priority || "medium").toUpperCase()}
                            </span>

                            {task.dueDate && (
                              <span className="task-tag due-date-tag">
                                📅 {formatDate(task.dueDate)}
                              </span>
                            )}

                            {dueStatus === "overdue" && (
                              <span className="task-tag overdue-tag">
                                Overdue
                              </span>
                            )}

                            {dueStatus === "today" && (
                              <span className="task-tag soon-tag">
                                Due Today
                              </span>
                            )}

                            {dueStatus === "soon" && (
                              <span className="task-tag soon-tag">
                                Due Soon
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Task details dialog */}
      <dialog
        ref={dialogRef}
        className="task-details-dialog"
        aria-label="Task Details"
        onClose={() => setSelectedTaskId(null)}
        style={{
          width: "min(520px, 90vw)",
          maxHeight: "85vh",
          overflowY: "auto",
          padding: "30px",
          border: "1px solid #e5e1f2",
          borderRadius: "18px",
          background: "#ffffff",
          color: "#273142",
          boxShadow: "0 25px 80px rgba(30, 25, 70, 0.25)",
        }}
      >
        {selectedTask && (
          <>
            <h2>Task Details</h2>

            <form
              onSubmit={handleSaveDetails}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                padding: 0,
                background: "transparent",
                border: "none",
              }}
            >
              <label>
                <strong>Task Title</strong>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(event) => setTaskTitle(event.target.value)}
                  required
                  style={{
                    display: "block",
                    width: "100%",
                    marginTop: "8px",
                  }}
                />
              </label>

              <label>
                <strong>Description</strong>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Enter task description..."
                  rows={4}
                  style={{
                    display: "block",
                    width: "100%",
                    marginTop: "8px",
                    padding: "12px",
                    font: "inherit",
                    border: "1px solid #deddeb",
                    borderRadius: "9px",
                    resize: "vertical",
                  }}
                />
              </label>

              <label>
                <strong>Due Date</strong>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  style={{
                    display: "block",
                    width: "100%",
                    marginTop: "8px",
                  }}
                />
              </label>

              <label>
                <strong>Priority</strong>
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  style={{
                    display: "block",
                    width: "100%",
                    marginTop: "8px",
                    padding: "12px",
                    border: "1px solid #deddeb",
                    borderRadius: "9px",
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>

              <label>
                <strong>Status</strong>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  style={{
                    display: "block",
                    width: "100%",
                    marginTop: "8px",
                    padding: "12px",
                    border: "1px solid #deddeb",
                    borderRadius: "9px",
                  }}
                >
                  <option value="todo">To Do</option>
                  <option value="progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </label>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <button type="submit">Save Changes</button>

                <button
                  type="button"
                  onClick={() => dialogRef.current?.close()}
                  style={{
                    background: "#ebe9f4",
                    color: "#534c6c",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => deleteDialogRef.current?.showModal()}
                  style={{
                    marginLeft: "auto",
                    background: "#dc3545",
                    color: "#ffffff",
                  }}
                >
                  Delete Task
                </button>
              </div>
            </form>
          </>
        )}
      </dialog>

      {/* Custom delete confirmation dialog */}
      <dialog
        ref={deleteDialogRef}
        className="delete-confirm-dialog"
        aria-labelledby="delete-confirm-title"
        style={{
          width: "min(420px, 90vw)",
          padding: "28px",
          border: "1px solid #e5e1f2",
          borderRadius: "18px",
          background: "#ffffff",
          color: "#273142",
          boxShadow: "0 25px 80px rgba(30, 25, 70, 0.24)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "54px",
            height: "54px",
            marginBottom: "18px",
            background: "#fff0f1",
            borderRadius: "14px",
            fontSize: "26px",
          }}
        >
          🗑️
        </div>

        <h2 id="delete-confirm-title" style={{ marginBottom: "12px" }}>
          Delete this task?
        </h2>

        <p
          style={{
            color: "#8b8fa3",
            fontSize: "14px",
            lineHeight: "1.7",
            marginBottom: "25px",
          }}
        >
          Are you sure you want to delete this task? This action cannot be
          undone.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <button
            type="button"
            onClick={() => deleteDialogRef.current?.close()}
            style={{
              background: "#ebe9f4",
              color: "#534c6c",
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmDelete}
            style={{
              background: "#dc3545",
              color: "#ffffff",
            }}
          >
            Delete Task
          </button>
        </div>
      </dialog>
    </main>
  );
}

export default App;
