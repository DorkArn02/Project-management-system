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