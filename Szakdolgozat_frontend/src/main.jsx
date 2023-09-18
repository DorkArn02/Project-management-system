import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import LoginComponent from './components/LoginComponent.jsx'
import RegisterComponent from './components/RegisterComponent.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import Dashboard from './components/Dashboard.jsx'
import Projects from './components/Projects.jsx'
import ProjectBoards from './components/ProjectBoards.jsx'
import { MultiSelectTheme } from 'chakra-multiselect'
import MyTasks from './components/MyTasks.jsx'

const theme = extendTheme({
  components: {
    MultiSelect: MultiSelectTheme
  }
})

const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginComponent />
  },
  {
    path: '/register',
    element: <RegisterComponent />
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
    children: [
      {
        path: '/dashboard/',
        element: <Projects />
      },
      {
        path: '/dashboard/:projectId',
        element: <ProjectBoards />
      },
      {
        path: '/dashboard/tasks',
        element: <MyTasks />
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <ChakraProvider theme={theme}>
      <RouterProvider router={router}></RouterProvider>
    </ChakraProvider>
  </AuthProvider>
)
