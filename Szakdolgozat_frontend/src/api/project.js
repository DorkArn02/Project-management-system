import { api } from "./backend"

export const getUserProjects = async () => {
    const projects =
        await api.get(`/Project/GetAll`)
    return projects

}

export const getProjectById = async (projectId) => {
    const project =
        await api.get(`/Project/Get/${projectId}`)
    return project
}

export const createUserProject = async (projectObject) => {
    const project =
        await api.post(`/Project/Add`, projectObject)
    return project
}

export const deleteProject = async (projectId) => {
    await api.delete(`/Project/Delete/${projectId}`)
}

export const updateProject = async (projectId, projectObject) => {
    const response = await api.put(`/Project/Update/${projectId}`, projectObject)
    return response
}

export const assignPeopleToProject = async (projectId, userEmail) => {
    const project = await api.post(`/Project/AddUser/${projectId}`, userEmail)
    return project
}

export const removePeopleFromProject = async (projectId, userId) => {
    const project = await api.delete(`/Project/RemoveUser/${projectId}/${userId}`)
    return project
}

export const getTasks = async () => {
    const response = await api.get(`/ProjectList/GetTasks`)

    return response
}