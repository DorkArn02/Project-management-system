import { createBrowserRouter } from "react-router-dom"
import { LoginPage, RegisterPage, ProjectPage, Dashboard, ProjectListPage, UserPage, TasksPage, StatisticsPage } from "../pages"
import { LoginResponse } from "../interfaces/interfaces.ts"

let user: LoginResponse = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null

const routes = [
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
        element: user ? <Dashboard />
            : <Dashboard />,
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
                element: <TasksPage />
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
]

export const router = createBrowserRouter(routes);
