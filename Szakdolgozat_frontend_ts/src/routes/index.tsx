import { createBrowserRouter } from "react-router-dom"
import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import ProjectPage from "../pages/ProjectPage"
import Dashboard from "../pages/DashboardPage"
import ProjectListPage from "../pages/ProjectListPage"
import UserPage from "../pages/UserPage"
import TasksPage from "../pages/TasksPage.tsx"
import StatisticsPage from "../pages/StatisticsPage"
import { createSignalRContext } from "react-signalr/signalr";
import { LoginResponse } from "../interfaces/interfaces.ts"

const user: LoginResponse = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null
export const SignalRContext = createSignalRContext();


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
        element: user ? <SignalRContext.Provider
            connectEnabled={!!user.accessToken}
            accessTokenFactory={() => user.accessToken}
            dependencies={[user.accessToken]}
            automaticReconnect={false}
            skipNegotiation={true}
            transport={1}
            url={import.meta.env.MODE === "development" ? "https://localhost:7093/notify" : "http://localhost:80/api/notify"}><Dashboard /></SignalRContext.Provider>
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
])