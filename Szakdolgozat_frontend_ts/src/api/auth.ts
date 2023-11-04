import axios from "axios"
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "../interfaces/interfaces";

export const loginUser = async (data: LoginRequest) => {
    const user = await axios.post<LoginResponse>(`https://localhost:7093/api/Auth/login`, { email: data.email, password: data.password }, { withCredentials: true });
    return user.data
}

export const registerUser = async (data: RegisterRequest) => {
    const user = await axios.post<RegisterResponse>(`https://localhost:7093/api/Auth/register`, {
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        email: data.email,
        confirmPassword: data.confirmPassword
    })
    return user.data
}
