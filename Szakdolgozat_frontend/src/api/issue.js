import { api } from "./backend"

export const addIssueToBoard = async (projectId, boardId, issueObject, assignedPeople) => {

    api.post(`/Issue/AddIssue/${projectId}/${boardId}`, issueObject)
        .then((result) => {
            for (let i of assignedPeople) {
                addAssignee(projectId, boardId, result.data.id, parseInt(i.value))
            }

            return result
        })

}

export const deleteIssueFromBoard = async (projectId, boardId, issueId) => {
    const result =
        await api.delete(`/Issue/DeleteIssue/${projectId}/${boardId}/${issueId}`)

    return result
}

export const addAssignee = async (projectId, boardId, issueId, assigneeId) => {
    const result
        = await api.post(`/Issue/AddAssignee/${projectId}/${boardId}/${issueId}/${assigneeId}`)

    return result
}