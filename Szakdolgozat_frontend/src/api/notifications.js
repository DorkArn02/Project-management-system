import { api } from "./backend"

export const getNotifications = async () => {
    const result = await api.get("/Notification")

    return result.data
}