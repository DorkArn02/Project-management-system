import axios from "axios"
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "../interfaces/interfaces";


export const loginUser = async (data: LoginRequest) => {
    const user = await axios
        .post<LoginResponse>
        (import.meta.env.MODE === "development" ? `${import.meta.env.VITE_BACKEND_URL_TEST}/Auth/login` : `${import.meta.env.VITE_BACKEND_URL_PROD}/Auth/login`, { email: data.email, password: data.password }, { withCredentials: true });
    return user.data
}

export const registerUser = async (data: RegisterRequest) => {
    const user = await axios
        .post<RegisterResponse>
        (import.meta.env.MODE === "development" ? `${import.meta.env.VITE_BACKEND_URL_TEST}Auth/register` : `${import.meta.env.VITE_BACKEND_URL_PROD}Auth/register`, {
            firstName: data.firstName,
            lastName: data.lastName,
            password: data.password,
            email: data.email,
            confirmPassword: data.confirmPassword
        })
    return user.data
}
