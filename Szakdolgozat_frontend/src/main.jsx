import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, redirect } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import LoginComponent from './components/LoginComponent.jsx'
import RegisterComponent from './components/RegisterComponent.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import Dashboard from './components/Dashboard.jsx'
import Projects from './components/Projects.jsx'
import ProjectBoards from './components/ProjectBoards.jsx'
import MyTasks from './components/MyTasks.jsx'
import MyProfile from './components/MyProfile.jsx'
import NotFound from './components/NotFound.jsx'
import { getProjectById, getUserProjects } from './api/project.js'
import { getProjectBoards } from './api/projectBoard.js'
import StatisticsBoard from './components/StatisticsBoard.jsx'

const allProjectLoader = async () => {
  const res = await getUserProjects()
  return res.data
}

const projectLoader = async ({ projectId }) => {
  const res = await getProjectById(projectId)
  return res.data
}

const projectListLoader = async ({ projectId }) => {
  const res = await getProjectBoards(projectId)
  return res.data
}


const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginComponent />,
    errorElement: <NotFound />,
  },
  {
    path: '/register',
    element: <RegisterComponent />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
    children: [
      {
        path: '/dashboard/',
        element: <Projects />,
        loader: allProjectLoader
      },
      {
        path: '/dashboard/:projectId',
        element: <ProjectBoards />,
        errorElement: <NotFound />,
        loader: async ({ params }) => Promise.all([projectLoader(params), projectListLoader(params)])
      },
      {
        path: '/dashboard/tasks',
        element: <MyTasks />
      },
      {
        path: '/dashboard/myprofile',
        element: <MyProfile />
      },
      {
        path: '/dashboard/stats',
        element: <StatisticsBoard />,
        loader: allProjectLoader
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <ChakraProvider>
      <RouterProvider router={router}></RouterProvider>
    </ChakraProvider>
  </AuthProvider >
)
