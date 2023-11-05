import { createBrowserRouter } from "react-router-dom"
import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import ProjectPage from "../pages/ProjectPage"
import Dashboard from "../pages/DashboardPage"
import ProjectListPage from "../pages/ProjectListPage"
import TasksPage from "../pages/TasksPage"
import StatisticsPage from "../pages/StatisticsPage"
import UserPage from "../pages/UserPage"
import TasksPage2 from "../pages/TasksPage2"

export const router = createBrowserRouter([
    {
        path: '/',
        element: <LoginPage />,
    },
    {
        path: '/register',
        element: <RegisterPage />
    },
    {
        path: '/dashboard',
        element: <Dashboard />,
        children: [
            {
                path: '/dashboard/',
                element: <ProjectPage />
            },
            {
                path: '/dashboard/:projectId',
                element: <ProjectListPage />
            },
            {
                path: '/dashboard/tasks',
                element: <TasksPage2 />
            },
            {
                path: '/dashboard/stats',
                element: <StatisticsPage />
            },
            {
                path: '/dashboard/myprofile',
                element: <UserPage />
            },
        ]
    }
])