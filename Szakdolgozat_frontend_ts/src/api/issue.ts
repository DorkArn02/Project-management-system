import { api } from ".";
import { IssueRequestView } from "../interfaces/interfaces";

export const addIssueToBoard = async (projectId: string, boardId: string, issueObject: IssueRequestView, assignedPeople: Array<number | null>, updateProjectBoards: () => void) => {

    await api.post(`/Issue/AddIssue/${projectId}/${boardId}`, { ...issueObject, priorityId: issueObject.priorityId.value, issueTypeId: issueObject.issueTypeId.value })
        .then((result) => {
            if (assignedPeople)
                for (let i of assignedPeople) {
                    addAssignee(projectId, boardId, result.data.id, i!)
                }
            return result
        }).catch((error) => {
            console.log(error)
            return error
        }).finally(() => {
            updateProjectBoards()
        })

}

export const deleteIssueFromBoard = async (projectId: string, boardId: string, issueId: string) => {
    const result =
        await api.delete(`/Issue/DeleteIssue/${projectId}/${boardId}/${issueId}`)

    return result
}

export const addAssignee = async (projectId: string, boardId: string, issueId: string, assigneeId: number) => {
    const result
        = await api.post(`/Issue/AddAssignee/${projectId}/${boardId}/${issueId}/${assigneeId}`)

    return result
}

export const changeIssuePosition1 = async (projectId: string, columnId: string, positions: string) => {
    const result =
        await api.put(`/Issue/ChangePosition1/${projectId}/${columnId}`, positions)
    return result
}

export const changeIssuePosition2 = async (projectId: string, sourceColumnId: string, destColumnId: string, issueId: string, sourcePos: { [id: string]: number }, destPos: { [id: string]: number }) => {
    const result =
        await api.put(`/Issue/ChangePosition2/${projectId}/${sourceColumnId}/${destColumnId}/${issueId}`,
            { sourcePositions: sourcePos, destPositions: destPos })
    return result
}

export const changeIssue = async (projectId: string, projectListId: string, issueId: string, patchData: Array<{ op: string, path: string, value: any }>) => {
    console.log(patchData)
    const result = await api.patch(`/Issue/UpdateIssueDetails/${projectId}/${projectListId}/${issueId}`, patchData)
    return result
}