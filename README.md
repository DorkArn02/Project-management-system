# Project-management-system

- Thesis project for **Computer Science BSc**
- Author: **Dorkó Arnold**

## Project details

- Backend: .NET Core 6 Web API
- Frontend: React Typescript (vite.js)

## Database structure

![asd](diagramok/Copy%20of%20ER%20DIAGRAM%20SZAKDOGA.png)

## Project description

The goal of this application is to create a project management system where you can manage your projects and invite others to your projects to share the workflow

- User authentication/authorization
- Project
  - Create, delete, modify project
  - Manage project people
- Project kanban board
  - Add, remove column
  - Edit column position
  - Rename column title
  - Add, remove issues
  - Filter issues by title, date, priority etc...
  - View issue details
- Tasks
  - View your tasks by selecting the project
  - Click on task to navigate kanban table and open modal with issue details
  - Filter issues...

- Statistics
  - Gantt-chart (issues)
  - Distribution of tasks by state
  - Distribution of tasks by reporter
  - Distribution of tasks by priority
  - Distribution of tasks by assigned people
  - Distribution of tasks by issue type
  - Recent project activity (audit log)
- User page
  - View current user details
  - Change password
  - Change language
- Themes
  - Light theme
  - Dark theme

## How to deploy application

1. Install SQL Server Management Studio 19
2. Install Internet Information Services Manager 10
3. Create new database in SSMS then run
`db_teszt.sql` in database
4. Build frontend and backend
5. Create new site in IIS and new application pool in IIS
6. Move built frontend code to IIS folder: `C:\inetpub\wwwroot\`
7. Publish backend code in Visual Studio to `wwwroot` folder
8. Start IIS site and application pool
