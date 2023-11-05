import { api } from "."
import { ProjectRequest, ProjectResponse, Task } from "../interfaces/interfaces"

export const getUserProjects = async () => {
    const projects =
        await api.get<Array<ProjectResponse>>(`/Project/GetAll`)
    return projects

}

export const getProjectById = async (projectId: string) => {
    const project =
        await api.get<ProjectResponse>(`/Project/Get/${projectId}`)
    return project
}

export const createUserProject = async (projectObject: ProjectRequest) => {
    const project =
        await api.post<ProjectResponse>(`/Project/Add`, projectObject)
    return project
}

export const deleteProject = async (projectId: string) => {
    await api.delete<void>(`/Project/Delete/${projectId}`)
}

export const updateProject = async (projectId: string, projectObject: ProjectRequest) => {
    const response = await api.put<ProjectResponse>(`/Project/Update/${projectId}`, projectObject)
    return response
}

export const assignPeopleToProject = async (projectId: string, userEmail: string) => {
    const project = await api.post<void>(`/Project/AddUser/${projectId}`, userEmail)
    return project
}

export const removePeopleFromProject = async (projectId: string, userId: string) => {
    const project = await api.delete<void>(`/Project/RemoveUser/${projectId}/${userId}`)
    return project
}

export const getTasks = async () => {
    const response = await api.get<Array<Task>>(`/ProjectList/GetTasks`)
    return response
}

export const getTasksByProjectId = async (id: string) => {
    const response = await api.get<Array<Task>>(`/ProjectList/GetTasksByProjectId/${id}`)
    return response
}

