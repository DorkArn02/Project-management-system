import { api } from "./backend"

export const addIssueToBoard = async (projectId, boardId, issueObject, assignedPeople, updateProjectBoards) => {

    Object.keys(issueObject)
        .forEach(k => (!issueObject[k] && issueObject[k] !== undefined) && delete issueObject[k]);

    api.post(`/Issue/AddIssue/${projectId}/${boardId}`, issueObject)
        .then((result) => {
            for (let i of assignedPeople) {
                addAssignee(projectId, boardId, result.data.id, parseInt(i))
            }
            return result
        }).catch((error) => {
            return error
        }).finally(() => {
            updateProjectBoards()
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

export const changeIssuePosition1 = async (projectId, columnId, positions) => {
    const result =
        await api.put(`/Issue/ChangePosition1/${projectId}/${columnId}`, positions)
    return result
}

export const changeIssuePosition2 = async (projectId, sourceColumnId, destColumnId, issueId, sourcePos, destPos) => {
    const result =
        await api.put(`/Issue/ChangePosition2/${projectId}/${sourceColumnId}/${destColumnId}/${issueId}`,
            { sourcePositions: sourcePos, destPositions: destPos })
    return result
}

export const changeIssue = async (projectId, projectListId, issueId, patchData) => {
    const result = await api.patch(`/Issue/UpdateIssueDetails/${projectId}/${projectListId}/${issueId}`, patchData)

    return result
}