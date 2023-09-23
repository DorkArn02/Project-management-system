import { api } from "./backend"

import { createStandaloneToast } from "@chakra-ui/react"

const { toast } = createStandaloneToast();

export const addIssueToBoard = async (projectId, boardId, issueObject, assignedPeople) => {

    Object.keys(issueObject).forEach(k => (!issueObject[k] && issueObject[k] !== undefined) && delete issueObject[k]);

    api.post(`/Issue/AddIssue/${projectId}/${boardId}`, issueObject)
        .then((result) => {
            for (let i of assignedPeople) {
                addAssignee(projectId, boardId, result.data.id, parseInt(i.value))
            }
            return result
        }).catch((error) => {
            return error
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

export const changeIssuePosition = async (projectId, sourceId, destId, issueSourceId, issueDestId) => {
    const result =
        await api.put(`/Issue/ChangePosition/${projectId}/${sourceId}/${destId}/${issueSourceId}/${issueDestId}`)
    return result
}

export const changeIssuePosition2 = async (projectId, sourceId, destId, issueSourceId) => {
    const result =
        await api.put(`/Issue/ChangePosition2/${projectId}/${sourceId}/${destId}/${issueSourceId}`)
    return result
}

export const changeIssuePosition3 = async (projectId, sourceId, destId, issueSourceId, issueDestId) => {
    const result =
        await api.put(`/Issue/ChangePosition3/${projectId}/${sourceId}/${destId}/${issueSourceId}/${issueDestId}`)
    return result
}