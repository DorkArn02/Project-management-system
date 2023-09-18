import axios from "axios"
import { api } from "./backend"

export const getUserProjects = async (accessToken) => {
    const projects =
        await api.get(`/Project/GetAll`)
    return projects

}

export const getProjectById = async (accessToken, projectId) => {
    const project =
        await api.get(`/Project/Get/${projectId}`)

    return project
}

export const createUserProject = async (projectObject, accessToken) => {
    const project =
        await api.post(`/Project/Add`, projectObject)

    return project
}

export const deleteProject = async (projectId, accessToken) => {
    await api.delete(`/Project/Delete/${projectId}`)
}

export const updateProject = async (projectId, accessToken, projectObject) => {
    await api.put(`/Update/${projectId}`, projectObject)
}

export const assignPeopleToProject = async (projectId, accessToken, userEmail) => {
    const project = await api.post(`/Project/AddUser/${projectId}`, userEmail)
    return project
}

export const removePeopleFromProject = async (projectId, accessToken, userId) => {
    const project = await api.post(`https://localhost:7093/api/Project/AddUser/${projectId}`, userId)

    return project
}

export const getTasks = async () => {
    const response = await api.get(`ProjectList/GetTasks`)

    return response
}