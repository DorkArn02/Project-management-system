import { api } from "./backend"

export const getProjectBoards = async (projectId) => {
    const projects =
        await api.get(`/ProjectList/GetAll/${projectId}`)

    return projects
}
export const addProjectBoard = async (projectId, boardObject) => {
    const projects =
        await api.post(`/ProjectList/Add/${projectId}`, boardObject)

    return projects
}

export const editProjectBoard = async (projectId, projectListId, title) => {
    const project =
        await api.put(`/ProjectList/Edit/${projectId}/${projectListId}`, `${title.title}`)

    return project
}

export const deleteProjectBoard = async (projectId, projectListId) => {
    const result =
        await api.delete(`/ProjectList/Delete/${projectId}/${projectListId}`)

    return result
}

export const editProjectBoardPosition = async (projectId, projectListId1, projectListId2) => {
    const result =
        await api.put(`/ProjectList/Edit/${projectId}/${projectListId1}/${projectListId2}`)

    return result
}