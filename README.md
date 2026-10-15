# TaskFlow - Task Management Dashboard

TaskFlow is a responsive task management application built with React and Vite. It helps users organize, track, and manage their daily tasks through an interactive Kanban board.

## Features

- Create, read, update, and delete tasks (CRUD)
- Kanban board with To Do, In Progress, and Done columns
- Drag-and-drop task management
- Task details with title and description
- Due date tracking and deadline warnings
- Priority levels: Low, Medium, and High
- Search tasks by title or description
- Filter tasks by priority and deadline
- Dashboard statistics
- Custom task deletion confirmation
- Persistent task storage using LocalStorage
- Responsive design for desktop and mobile devices

## Technologies Used

- React
- JavaScript
- Vite
- HTML5
- CSS3
- LocalStorage API

## Installation

Clone the repository and open the project folder.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

## Production Build

To build the application for production:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Data Storage

TaskFlow uses the browser's LocalStorage API to save task information. Tasks remain available after refreshing the page in the same browser.

No backend or external database is required.

## Project Purpose

This project was developed to practice modern frontend development using React, JavaScript, CSS, and CRUD operations.

## Live Demo

You can try TaskFlow here:

https://taskflow-kanban-hlk.netlify.app/

## GitHub Repository

Source code:

https://github.com/Halukkarakayaa/TaskFlow

## Deployment

TaskFlow is deployed on Netlify and automatically builds from the main branch of the GitHub repository.
