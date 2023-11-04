import { api } from "."
import { PasswordChangeRequest } from "../interfaces/interfaces"

export const changePassword = async (userObj: PasswordChangeRequest) => {
    const result = await api.put(`/User/PasswordChange/`, userObj)
    return result
}

export const addCommentToIssue = async (projectId: string, issueId: string, txt: string) => {
    const result = await api.post(`/Comment/AddComment/${projectId}/${issueId}`, txt)
    return result
}

export const deleteCommentFromIssue = async (projectId: string, issueId: string, commentId: string) => {
    const result = await api.delete(`/Comment/DeleteComment/${projectId}/${issueId}/${commentId}`)
    return result
}


export const getNotifications = async () => {
    const result = await api.get("/Notification")

    return result.data
}

export const deleteNotification = async (id: string) => {
    const result = await api.delete(`/Notification/${id}`)
    return result.data
}