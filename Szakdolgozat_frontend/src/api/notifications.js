import { api } from "./backend"

export const getNotifications = async () => {
    const result = await api.get("/Notification")

    return result.data
}

export const deleteNotification = async (id) => {
    const result = await api.delete(`/Notification/${id}`)
    return result.data
}