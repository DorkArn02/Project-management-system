import { api } from "./backend"

export const addCommentToIssue = async (projectId, issueId, txt) => {
    console.log(projectId)
    console.log(issueId)
    console.log(txt)
    const result = await api.post(`/Comment/AddComment/${projectId}/${issueId}`, txt)
    return result
}