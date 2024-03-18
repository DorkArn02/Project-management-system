import axios from "axios"
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "../interfaces/interfaces";


export const loginUser = async (data: LoginRequest) => {
    const user = await axios
        .post<LoginResponse>
        (import.meta.env.MODE === "development" ? `https://localhost:7093/api/Auth/login` : ` https://pmsystempte.azurewebsites.net/api/Auth/login`, { email: data.email, password: data.password }, { withCredentials: true });
    return user.data
}

export const registerUser = async (data: RegisterRequest) => {
    const user = await axios
        .post<RegisterResponse>
        (import.meta.env.MODE === "development" ? `https://localhost:7093/api/Auth/register` : `https://pmsystempte.azurewebsites.net/api/Auth/register`, {
            firstName: data.firstName,
            lastName: data.lastName,
            password: data.password,
            email: data.email,
            confirmPassword: data.confirmPassword
        })
    return user.data
}
