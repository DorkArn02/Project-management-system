import { api } from "./backend"

export const changePassword = async (userObj) => {
    const result = await api.put(`/User/PasswordChange/`, userObj)
    return result
}