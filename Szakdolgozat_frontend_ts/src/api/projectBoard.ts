import { api } from "."
import { ProjectListRequest, ProjectListResponse } from "../interfaces/interfaces"

export const getProjectBoards = async (projectId: string) => {
    const projects =
        await api.get<Array<ProjectListResponse>>(`/ProjectList/GetAll/${projectId}`)
    return projects
}
export const addProjectBoard = async (projectId: string, boardObject: ProjectListRequest) => {
    const projects =
        await api.post(`/ProjectList/Add/${projectId}`, boardObject)
    return projects
}

export const editProjectBoard = async (projectId: string, projectListId: string, projectList: ProjectListRequest) => {
    const project =
        await api.put(`/ProjectList/Edit/${projectId}/${projectListId}`, `${projectList.title}`)

    return project
}

export const deleteProjectBoard = async (projectId: string, projectListId: string) => {
    const result =
        await api.delete(`/ProjectList/Delete/${projectId}/${projectListId}`)
    return result
}

export const editProjectBoardPosition = async (projectId: string, projectListId1: string, projectListId2: string) => {
    const result =
        await api.put(`/ProjectList/Edit/${projectId}/${projectListId1}/${projectListId2}`)

    return result
}