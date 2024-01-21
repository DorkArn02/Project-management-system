import { createBrowserRouter } from "react-router-dom"
import { LoginPage, RegisterPage, ProjectPage, Dashboard, ProjectListPage, UserPage, TasksPage, StatisticsPage } from "../pages"
import { createSignalRContext } from "react-signalr/signalr";
import { LoginResponse } from "../interfaces/interfaces.ts"
import { api } from "../api/index.ts"

const user: LoginResponse = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null
export const SignalRContext = createSignalRContext();

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
        element: user ? <SignalRContext.Provider
            connectEnabled={!!user.accessToken}
            accessTokenFactory={() => user.accessToken}
            dependencies={[user.accessToken]}
            automaticReconnect={false}
            transport={1}
            skipNegotiation={true}
            onError={async () => {
                const access_token = await api.get(`/Auth/refresh`, { withCredentials: true });
                console.log(access_token)
                if (access_token.data) {
                    const user = JSON.parse(localStorage.getItem("user") || "")
                    const newUser = { ...user, accessToken: access_token.data }
                    localStorage.setItem("user", JSON.stringify(newUser))
                    api.defaults.headers.common['Authorization'] = `Bearer ${access_token.data}`
                }
            }}
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
]

export const router = createBrowserRouter(routes);
