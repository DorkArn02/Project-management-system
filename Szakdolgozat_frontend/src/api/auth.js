import axios from "axios"

export const loginUser = async (loginObject) => {
    const user = await axios.post(`https://localhost:7093/api/Auth/login`, { email: loginObject.email, password: loginObject.password }, { withCredentials: true });
    return user.data
}

export const registerUser = async (registerObject) => {
    const user = await axios.post(`https://localhost:7093/api/Auth/register`, {
        firstName: registerObject.firstName,
        lastName: registerObject.lastName,
        password: registerObject.password,
        email: registerObject.email,
        confirmPassword: registerObject.confirmPassword
    })
    return user.data
}