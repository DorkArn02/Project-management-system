import { RouterProvider } from "react-router-dom"
import { router } from "./routes/index"
import { ChakraProvider } from "@chakra-ui/react"
import { AuthProvider } from './contexts/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


export default function App() {

    const queryClient = new QueryClient()

    return (
        <ChakraProvider>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <RouterProvider router={router} />
                </AuthProvider>
            </QueryClientProvider>
        </ChakraProvider>
    )
}
